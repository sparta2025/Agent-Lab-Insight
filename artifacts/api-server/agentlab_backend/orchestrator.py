from __future__ import annotations

import asyncio
import time
import uuid
from datetime import datetime, timezone
from typing import Callable

from .agents import AGENTS, Judge, LLMProvider
from .models import AgentResult, ExecutionStep, TaskInput, TaskRecord

MAX_AGENTS = 4
REQUEST_TIMEOUT = 30


class Orchestrator:
    def __init__(self) -> None:
        self.llm = LLMProvider()
        self.judge = Judge()

    def select(self, task: TaskInput) -> list[str]:
        text = task.task.lower()
        if task.mode == "debate":
            return ["architecture", "performance", "security", "minimalist"]
        if task.mode == "detective":
            selected = ["security", "bug-hunter", "code-review", "architecture"]
            if "security" not in text and any(word in text for word in ("speed", "slow", "latency", "performance")):
                selected[0] = "performance"
            return selected
        selected: list[str] = []
        if any(word in text for word in ("security", "auth", "secret", "permission", "token")):
            selected.append("security")
        if any(word in text for word in ("bug", "error", "fail", "broken", "exception", "crash")):
            selected.append("bug-hunter")
        if any(word in text for word in ("slow", "latency", "scale", "performance")):
            selected.append("performance")
        selected.extend(["code-review", "architecture"])
        return list(dict.fromkeys(selected))[:MAX_AGENTS]

    def create_record(self, task: TaskInput) -> TaskRecord:
        task_id = f"task_{uuid.uuid4().hex[:10]}"
        selected = self.select(task)[:MAX_AGENTS]
        steps = [
            ExecutionStep(id="router", label="Router", status="complete", detail=f"Selected {len(selected)} specialists."),
            *[
                ExecutionStep(
                    id=agent_id,
                    label=AGENTS[agent_id].name,
                    status="queued",
                    detail=AGENTS[agent_id].focus,
                )
                for agent_id in selected
            ],
            ExecutionStep(id="judge", label="Judge", status="queued", detail="Waiting for specialist perspectives."),
            ExecutionStep(id="result", label="Result", status="queued", detail="Synthesis will appear here."),
        ]
        return TaskRecord(
            task_id=task_id,
            task=task.task,
            mode=task.mode,
            status="running",
            context=task.context,
            agents=[],
            result=self.judge.fallback_result(),
            execution_time=0,
            steps=steps,
            created_at=datetime.now(timezone.utc).isoformat(),
            provider=self.llm.name,
        )

    async def execute(
        self,
        task: TaskInput,
        record: TaskRecord,
        on_update: Callable[[TaskRecord], None] | None = None,
    ) -> TaskRecord:
        started = time.perf_counter()
        selected = [step.id for step in record.steps if step.id in AGENTS]
        steps = record.steps
        results: list[AgentResult] = []

        def update() -> None:
            record.execution_time = round(time.perf_counter() - started, 2)
            if on_update:
                on_update(record)

        async def run_agent(agent_id: str) -> AgentResult:
            return await AGENTS[agent_id].run(task, self.llm)

        try:
            for step in steps:
                if step.id in selected:
                    step.status = "active"
                    step.detail = "Specialist is analyzing the task."
            update()
            results = list(
                await asyncio.wait_for(
                    asyncio.gather(*(run_agent(agent_id) for agent_id in selected)),
                    timeout=REQUEST_TIMEOUT,
                )
            )
            for step in steps:
                if step.id in selected:
                    step.status = "complete"
                    step.detail = next(
                        (result.summary for result in results if result.agent == step.id),
                        step.detail,
                    )
            record.agents = results
            update()
            steps[-2].status = "complete"
            steps[-2].detail = "Compared specialist perspectives."
            steps[-1].status = "active"
            steps[-1].detail = "Judge is comparing the specialist perspectives."
            update()
            judged = await asyncio.wait_for(self.judge.evaluate(task, results, self.llm), timeout=REQUEST_TIMEOUT)
            record.result = judged
            steps[-1].status = "complete"
            steps[-1].detail = "Recommendation ready."
            record.status = "complete"
        except Exception as error:
            for step in steps:
                if step.status in ("queued", "active"):
                    step.status = "error"
                    step.detail = "Execution stopped before this stage completed."
            judged = self.judge.fallback_result(len(results))
            judged.summary = f"{judged.summary} The run completed with a partial execution fallback."
            record.agents = results
            record.result = judged
            record.status = "error"
        update()
        return record
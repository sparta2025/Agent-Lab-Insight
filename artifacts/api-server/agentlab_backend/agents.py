from __future__ import annotations

import asyncio
import json
import os
from abc import ABC, abstractmethod
from typing import Any

from openai import AsyncOpenAI

from .models import AgentInfo, AgentResult, Finding, JudgeResult, TaskInput

MAX_CONTEXT_SIZE = 12000
MAX_OUTPUT_SIZE = 4000


def _clip(value: str, limit: int) -> str:
    return value[:limit].strip()


class LLMProvider:
    """Small provider seam. Agents never depend on a concrete client directly."""

    def __init__(self) -> None:
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()
        self.openai_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.model = os.getenv("LLM_MODEL", "openai/gpt-oss-20b:free")
        if self.openrouter_key:
            self.client = AsyncOpenAI(
                api_key=self.openrouter_key,
                base_url="https://openrouter.ai/api/v1",
                max_retries=0,
                timeout=20.0,
                default_headers={
                    "HTTP-Referer": "https://replit.com",
                    "X-Title": "AgentLab",
                },
            )
            self.provider = "OpenRouter"
        elif self.openai_key:
            self.client = AsyncOpenAI(api_key=self.openai_key)
            self.model = os.getenv("LLM_MODEL", "gpt-4o-mini")
            self.provider = "OpenAI"
        else:
            self.client = None
            self.provider = "Local fallback"

    @property
    def name(self) -> str:
        if not self.client:
            return self.provider
        return f"{self.provider} · {self.model}"

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback: dict[str, Any],
    ) -> dict[str, Any]:
        if not self.client:
            return fallback
        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    max_tokens=8192,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                ),
                timeout=22,
            )
            content = response.choices[0].message.content or ""
            return json.loads(_clip(content, MAX_OUTPUT_SIZE))
        except Exception:
            return fallback


class Agent(ABC):
    id: str
    name: str
    focus: str

    def info(self) -> AgentInfo:
        return AgentInfo(id=self.id, name=self.name, focus=self.focus)

    @abstractmethod
    async def run(self, task: TaskInput, llm: LLMProvider) -> AgentResult:
        raise NotImplementedError

    def _prompt(self, task: TaskInput) -> str:
        context = _clip(task.context, MAX_CONTEXT_SIZE) or "No code context supplied."
        return f"Task: {task.task}\nContext:\n{context}"

    def _result_from(self, data: dict[str, Any], fallback: AgentResult) -> AgentResult:
        try:
            return AgentResult.model_validate(
                {
                    "agent": self.id,
                    "label": self.name,
                    "focus": self.focus,
                    **data,
                }
            )
        except Exception:
            return fallback


class SecurityAgent(Agent):
    id, name, focus = "security", "Security", "Secrets, auth boundaries, input handling, and attack surface"

    async def run(self, task: TaskInput, llm: LLMProvider) -> AgentResult:
        fallback = AgentResult(
            agent=self.id,
            label=self.name,
            focus=self.focus,
            summary="No obvious security issue can be confirmed without more code context.",
            findings=[
                Finding(
                    title="Validate trust boundaries",
                    severity="medium",
                    detail="Review user-controlled input, secrets, and authorization checks around the reported path.",
                    recommendation="Validate at the API boundary and keep credentials server-side.",
                )
            ],
            confidence=0.52,
        )
        data = await llm.generate_json(
            "You are a security code reviewer. Return JSON with summary, findings, confidence. findings must contain title, severity, detail, recommendation. Be specific and do not invent evidence.",
            self._prompt(task),
            fallback.model_dump(exclude={"agent", "label", "focus"}),
        )
        return self._result_from(data, fallback)


class BugHunterAgent(Agent):
    id, name, focus = "bug-hunter", "Bug Hunter", "Runtime failures, edge cases, state transitions, and incorrect assumptions"

    async def run(self, task: TaskInput, llm: LLMProvider) -> AgentResult:
        fallback = AgentResult(
            agent=self.id,
            label=self.name,
            focus=self.focus,
            summary="The failure path needs a reproducible input and an explicit expected outcome.",
            findings=[
                Finding(
                    title="Capture the failing case",
                    severity="medium",
                    detail="The prompt does not include enough runtime evidence to isolate a single root cause.",
                    recommendation="Add a focused reproduction with inputs, expected output, and the observed stack trace.",
                )
            ],
            confidence=0.48,
        )
        data = await llm.generate_json(
            "You are a pragmatic bug hunter. Return JSON with summary, findings, confidence. Prioritize likely root causes and edge cases, and never claim to have run code.",
            self._prompt(task),
            fallback.model_dump(exclude={"agent", "label", "focus"}),
        )
        return self._result_from(data, fallback)


class CodeReviewAgent(Agent):
    id, name, focus = "code-review", "Code Review", "Correctness, maintainability, API contracts, and suspicious implementation patterns"

    async def run(self, task: TaskInput, llm: LLMProvider) -> AgentResult:
        fallback = AgentResult(
            agent=self.id,
            label=self.name,
            focus=self.focus,
            summary="The implementation should keep validation close to the boundary and separate orchestration from analysis.",
            findings=[
                Finding(
                    title="Make contracts explicit",
                    severity="low",
                    detail="Use typed inputs and outputs so a fix can be verified without relying on implicit behavior.",
                    recommendation="Add a small test around the failing path before refactoring.",
                )
            ],
            confidence=0.57,
        )
        data = await llm.generate_json(
            "You are a senior code reviewer. Return JSON with summary, findings, confidence. Focus on concrete correctness and maintainability improvements.",
            self._prompt(task),
            fallback.model_dump(exclude={"agent", "label", "focus"}),
        )
        return self._result_from(data, fallback)


class ArchitectureAgent(Agent):
    id, name, focus = "architecture", "Architecture", "Boundaries, dependencies, scaling risks, and smallest viable design"

    async def run(self, task: TaskInput, llm: LLMProvider) -> AgentResult:
        fallback = AgentResult(
            agent=self.id,
            label=self.name,
            focus=self.focus,
            summary="Prefer the smallest change that preserves a clear boundary between request handling and domain logic.",
            findings=[
                Finding(
                    title="Keep the fix local",
                    severity="info",
                    detail="Avoid introducing infrastructure until the current request path has a measured need for it.",
                    recommendation="Document the boundary and add a seam for a later replacement.",
                )
            ],
            confidence=0.61,
        )
        data = await llm.generate_json(
            "You are an architecture reviewer for small teams. Return JSON with summary, findings, confidence. Favor simple designs and call out only material risks.",
            self._prompt(task),
            fallback.model_dump(exclude={"agent", "label", "focus"}),
        )
        return self._result_from(data, fallback)


class PerformanceAgent(Agent):
    id, name, focus = "performance", "Performance", "Latency, throughput, resource use, and unnecessary work"

    async def run(self, task: TaskInput, llm: LLMProvider) -> AgentResult:
        fallback = AgentResult(
            agent=self.id,
            label=self.name,
            focus=self.focus,
            summary="Measure the hot path before introducing a cache or queue.",
            opinion="Optimize only the bottleneck you can observe.",
            pros=["Keeps the system simple", "Creates a measurable baseline"],
            cons=["May defer optimization until after a first measurement"],
            confidence=0.6,
        )
        data = await llm.generate_json(
            "You are a performance engineer. Return JSON with summary, opinion, pros, cons, confidence. Keep tradeoffs grounded in the question.",
            self._prompt(task),
            fallback.model_dump(exclude={"agent", "label", "focus"}),
        )
        return self._result_from(data, fallback)


class MinimalistAgent(Agent):
    id, name, focus = "minimalist", "Minimalist", "Scope control, operational cost, and reversibility"

    async def run(self, task: TaskInput, llm: LLMProvider) -> AgentResult:
        fallback = AgentResult(
            agent=self.id,
            label=self.name,
            focus=self.focus,
            summary="Choose the lowest-complexity option that satisfies the current evidence.",
            opinion="Start with the simplest reversible implementation.",
            pros=["Low operational overhead", "Fast to validate"],
            cons=["Less headroom for an unmeasured future load"],
            confidence=0.68,
        )
        data = await llm.generate_json(
            "You are a scope-conscious engineering lead. Return JSON with summary, opinion, pros, cons, confidence. Make the smallest defensible recommendation.",
            self._prompt(task),
            fallback.model_dump(exclude={"agent", "label", "focus"}),
        )
        return self._result_from(data, fallback)


class Judge:
    @staticmethod
    def fallback_result(result_count: int = 0) -> JudgeResult:
        return JudgeResult(
            decision="Analysis in progress.",
            summary=f"{result_count} specialist perspectives are being collected. The Judge will synthesize them when analysis completes.",
            confidence=0.0,
            recommendations=[],
        )

    async def evaluate(
        self,
        task: TaskInput,
        results: list[AgentResult],
        llm: LLMProvider,
    ) -> JudgeResult:
        summaries = "\n".join(f"- {item.label}: {item.summary}" for item in results)
        fallback = JudgeResult(
            decision="Proceed with a focused, reversible change.",
            summary=f"{len(results)} specialist perspectives were compared. Start by validating the highest-signal finding with a small reproduction, then keep the fix local and observable.",
            confidence=0.64,
            recommendations=[
                "Create a minimal reproduction for the reported behavior.",
                "Validate input and authorization at the boundary.",
                "Measure the change before adding infrastructure.",
            ],
        )
        data = await llm.generate_json(
            "You are the Judge in a multi-agent engineering review. Return JSON with decision, summary, confidence, recommendations. Synthesize the supplied opinions; do not redo the whole analysis.",
            f"Original task: {task.task}\nAgent perspectives:\n{summaries}",
            fallback.model_dump(),
        )
        try:
            return JudgeResult.model_validate(data)
        except Exception:
            return fallback


AGENTS: dict[str, Agent] = {
    agent.id: agent
    for agent in [
        SecurityAgent(),
        BugHunterAgent(),
        CodeReviewAgent(),
        ArchitectureAgent(),
        PerformanceAgent(),
        MinimalistAgent(),
    ]
}
from __future__ import annotations

import logging
from collections import OrderedDict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agentlab_backend.agents import AGENTS
from agentlab_backend.models import AgentInfo, TaskInput, TaskRecord
from agentlab_backend.orchestrator import Orchestrator

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("agentlab")

app = FastAPI(title="AgentLab API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()
history: OrderedDict[str, TaskRecord] = OrderedDict()
MAX_HISTORY = 30


@app.get("/api/healthz")
@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/agents", response_model=list[AgentInfo])
async def list_agents() -> list[AgentInfo]:
    return [agent.info() for agent in AGENTS.values()]


@app.get("/api/tasks", response_model=list[TaskRecord])
async def list_tasks() -> list[TaskRecord]:
    return list(reversed(history.values()))


@app.post("/api/tasks", response_model=TaskRecord)
async def create_task(task: TaskInput) -> TaskRecord:
    record = await orchestrator.execute(task)
    history[record.task_id] = record
    history.move_to_end(record.task_id)
    while len(history) > MAX_HISTORY:
        history.popitem(last=False)
    logger.info("Completed %s with %s agents in %.2fs", record.task_id, len(record.agents), record.execution_time)
    return record


@app.get("/api/tasks/{task_id}", response_model=TaskRecord)
async def get_task(task_id: str) -> TaskRecord:
    record = history.get(task_id)
    if not record:
        raise HTTPException(status_code=404, detail="Task not found")
    return record
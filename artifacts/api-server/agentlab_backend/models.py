from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

TaskMode = Literal["detective", "debate", "auto"]
TaskStatus = Literal["running", "complete", "error"]
Severity = Literal["critical", "high", "medium", "low", "info"]
StepStatus = Literal["complete", "active", "queued", "error"]


class TaskInput(BaseModel):
    task: str = Field(min_length=3, max_length=4000)
    mode: TaskMode
    context: str = Field(default="", max_length=12000)


class AgentInfo(BaseModel):
    id: str
    name: str
    focus: str


class Finding(BaseModel):
    title: str
    severity: Severity
    detail: str
    recommendation: str = ""


class AgentResult(BaseModel):
    agent: str
    label: str
    focus: str
    summary: str
    findings: list[Finding] = Field(default_factory=list)
    opinion: str = ""
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)


class JudgeResult(BaseModel):
    decision: str
    summary: str
    confidence: float = Field(ge=0, le=1)
    recommendations: list[str] = Field(default_factory=list)


class ExecutionStep(BaseModel):
    id: str
    label: str
    status: StepStatus
    detail: str
    duration: float | None = None


class TaskRecord(BaseModel):
    task_id: str = Field(alias="taskId")
    task: str
    mode: TaskMode
    status: TaskStatus
    context: str
    agents: list[AgentResult]
    result: JudgeResult
    execution_time: float = Field(alias="executionTime")
    steps: list[ExecutionStep]
    created_at: str = Field(alias="createdAt")
    provider: str

    model_config = {"populate_by_name": True}
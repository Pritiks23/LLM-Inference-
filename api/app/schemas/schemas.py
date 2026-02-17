from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


# Automation Schemas
class AutomationBase(BaseModel):
    name: str
    tinyfish_automation_id: str
    description: Optional[str] = None
    default_inputs: Optional[Dict[str, Any]] = {}


class AutomationCreate(AutomationBase):
    pass


class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    tinyfish_automation_id: Optional[str] = None
    description: Optional[str] = None
    default_inputs: Optional[Dict[str, Any]] = None


class Automation(AutomationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Scenario Schemas
class ScenarioBase(BaseModel):
    name: str
    automation_id: int
    description: Optional[str] = None
    inputs_template: Optional[Dict[str, Any]] = {}
    run_settings: Optional[Dict[str, Any]] = {}


class ScenarioCreate(ScenarioBase):
    pass


class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    automation_id: Optional[int] = None
    description: Optional[str] = None
    inputs_template: Optional[Dict[str, Any]] = None
    run_settings: Optional[Dict[str, Any]] = None


class Scenario(ScenarioBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Run Schemas
class RunBase(BaseModel):
    scenario_id: int


class RunCreate(RunBase):
    pass


class InterTokenStats(BaseModel):
    mean_ms: Optional[float] = None
    p50_ms: Optional[float] = None
    p95_ms: Optional[float] = None
    p99_ms: Optional[float] = None


class Run(RunBase):
    id: int
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    status: str
    total_duration_ms: Optional[float] = None
    ttft_ms: Optional[float] = None
    inter_token_stats: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    tinyfish_run_id: Optional[str] = None
    response_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# KPI Schemas
class PercentileStats(BaseModel):
    p50: Optional[float] = None
    p95: Optional[float] = None
    p99: Optional[float] = None


class DashboardKPIs(BaseModel):
    total_runs: int
    success_rate: float
    total_time_stats: PercentileStats
    ttft_stats: Optional[PercentileStats] = None  # Streaming-ready
    avg_inter_token_latency: Optional[float] = None  # Streaming-ready
    recent_runs: List[Run]


# Trigger Run Schema
class TriggerRunRequest(BaseModel):
    scenario_id: int
    inputs_override: Optional[Dict[str, Any]] = None

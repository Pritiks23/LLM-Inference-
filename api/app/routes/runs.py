from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.models import Run as RunModel, Scenario as ScenarioModel
from app.schemas.schemas import Run, TriggerRunRequest, DashboardKPIs, PercentileStats
from app.services.benchmark_service import execute_benchmark_run
import numpy as np

router = APIRouter()


@router.get("/", response_model=List[Run])
def list_runs(
    skip: int = 0,
    limit: int = 100,
    scenario_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all runs with optional filtering."""
    query = db.query(RunModel)
    if scenario_id:
        query = query.filter(RunModel.scenario_id == scenario_id)
    if status:
        query = query.filter(RunModel.status == status)
    
    runs = query.order_by(desc(RunModel.created_at)).offset(skip).limit(limit).all()
    return runs


@router.get("/{run_id}", response_model=Run)
def get_run(run_id: int, db: Session = Depends(get_db)):
    """Get a specific run."""
    run = db.query(RunModel).filter(RunModel.id == run_id).first()
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.post("/trigger", response_model=Run)
async def trigger_run(
    request: TriggerRunRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Trigger a new benchmark run."""
    # Verify scenario exists
    scenario = db.query(ScenarioModel).filter(ScenarioModel.id == request.scenario_id).first()
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Create run record
    db_run = RunModel(
        scenario_id=request.scenario_id,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    
    # Execute benchmark in background
    background_tasks.add_task(
        execute_benchmark_run,
        run_id=db_run.id,
        scenario_id=request.scenario_id,
        inputs_override=request.inputs_override
    )
    
    return db_run


@router.get("/kpis/dashboard", response_model=DashboardKPIs)
def get_dashboard_kpis(db: Session = Depends(get_db)):
    """Get aggregated KPIs for dashboard."""
    # Total runs
    total_runs = db.query(RunModel).count()
    
    # Success rate
    completed_runs = db.query(RunModel).filter(RunModel.status == "completed").count()
    success_rate = (completed_runs / total_runs * 100) if total_runs > 0 else 0
    
    # Total time percentiles
    completed_durations = db.query(RunModel.total_duration_ms).filter(
        RunModel.status == "completed",
        RunModel.total_duration_ms.isnot(None)
    ).all()
    
    durations = [d[0] for d in completed_durations if d[0] is not None]
    
    if durations:
        total_time_stats = PercentileStats(
            p50=float(np.percentile(durations, 50)),
            p95=float(np.percentile(durations, 95)),
            p99=float(np.percentile(durations, 99))
        )
    else:
        total_time_stats = PercentileStats()
    
    # Recent runs
    recent_runs = db.query(RunModel).order_by(desc(RunModel.created_at)).limit(10).all()
    
    # TTFT stats (streaming-ready, will show N/A for now)
    ttft_values = db.query(RunModel.ttft_ms).filter(
        RunModel.ttft_ms.isnot(None)
    ).all()
    
    ttft_stats = None
    if ttft_values and len(ttft_values) > 0:
        ttft_list = [t[0] for t in ttft_values if t[0] is not None]
        if ttft_list:
            ttft_stats = PercentileStats(
                p50=float(np.percentile(ttft_list, 50)),
                p95=float(np.percentile(ttft_list, 95)),
                p99=float(np.percentile(ttft_list, 99))
            )
    
    return DashboardKPIs(
        total_runs=total_runs,
        success_rate=success_rate,
        total_time_stats=total_time_stats,
        ttft_stats=ttft_stats,
        avg_inter_token_latency=None,  # Streaming-ready
        recent_runs=recent_runs
    )

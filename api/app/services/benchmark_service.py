import httpx
import time
import random
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.models import Run, Scenario, Automation


async def call_tinyfish_automation(
    automation_id: str,
    inputs: Dict[str, Any],
    timeout: int = 300
) -> Dict[str, Any]:
    """
    Call TinyFish automation endpoint.
    
    In mock mode, simulates a TinyFish automation run.
    In real mode, makes actual API call to TinyFish.
    """
    if settings.TINYFISH_MOCK_MODE:
        # Mock mode for local development
        print(f"[MOCK MODE] Simulating TinyFish automation run for automation_id: {automation_id}")
        await asyncio.sleep(random.uniform(0.5, 2.0))  # Simulate processing time
        
        return {
            "run_id": f"mock_run_{int(time.time())}",
            "status": "completed",
            "output": {
                "response": f"This is a mock response for automation {automation_id}",
                "tokens_generated": random.randint(50, 200),
                "model": "mock-model-v1"
            },
            "metadata": {
                "execution_time_ms": random.uniform(500, 2000)
            }
        }
    else:
        # Real TinyFish API call
        if not settings.TINYFISH_API_KEY:
            raise ValueError("TINYFISH_API_KEY is required when mock mode is disabled")
        
        url = f"{settings.TINYFISH_BASE_URL}{settings.TINYFISH_AUTOMATION_ENDPOINT}"
        headers = {
            "Authorization": f"Bearer {settings.TINYFISH_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "automation_id": automation_id,
            "inputs": inputs
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()


def execute_benchmark_run(
    run_id: int,
    scenario_id: int,
    inputs_override: Optional[Dict[str, Any]] = None
):
    """
    Execute a benchmark run synchronously.
    This is called as a background task from the API.
    """
    db = SessionLocal()
    try:
        # Get run, scenario, and automation
        run = db.query(Run).filter(Run.id == run_id).first()
        scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
        automation = db.query(Automation).filter(Automation.id == scenario.automation_id).first()
        
        if not run or not scenario or not automation:
            return
        
        # Update run status to running
        run.status = "running"
        run.started_at = datetime.utcnow()
        db.commit()
        
        # Prepare inputs
        inputs = {**automation.default_inputs, **scenario.inputs_template}
        if inputs_override:
            inputs.update(inputs_override)
        
        # Execute the automation
        start_time = time.time()
        
        try:
            result = asyncio.run(call_tinyfish_automation(
                automation_id=automation.tinyfish_automation_id,
                inputs=inputs,
                timeout=settings.DEFAULT_TIMEOUT_SECONDS
            ))
            
            end_time = time.time()
            total_duration_ms = (end_time - start_time) * 1000
            
            # Update run with results
            run.status = "completed"
            run.finished_at = datetime.utcnow()
            run.total_duration_ms = total_duration_ms
            run.tinyfish_run_id = result.get("run_id")
            run.response_json = result
            
        except Exception as e:
            # Handle errors
            end_time = time.time()
            total_duration_ms = (end_time - start_time) * 1000
            
            run.status = "failed"
            run.finished_at = datetime.utcnow()
            run.total_duration_ms = total_duration_ms
            run.error = str(e)
        
        db.commit()
        
    except Exception as e:
        print(f"Error executing benchmark run {run_id}: {e}")
        if run:
            run.status = "failed"
            run.error = str(e)
            db.commit()
    
    finally:
        db.close()

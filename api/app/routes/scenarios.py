from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Scenario as ScenarioModel
from app.schemas.schemas import Scenario, ScenarioCreate, ScenarioUpdate

router = APIRouter()


@router.get("/", response_model=List[Scenario])
def list_scenarios(
    skip: int = 0,
    limit: int = 100,
    automation_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List all scenarios, optionally filtered by automation_id."""
    query = db.query(ScenarioModel)
    if automation_id:
        query = query.filter(ScenarioModel.automation_id == automation_id)
    scenarios = query.offset(skip).limit(limit).all()
    return scenarios


@router.get("/{scenario_id}", response_model=Scenario)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    """Get a specific scenario."""
    scenario = db.query(ScenarioModel).filter(ScenarioModel.id == scenario_id).first()
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


@router.post("/", response_model=Scenario)
def create_scenario(scenario: ScenarioCreate, db: Session = Depends(get_db)):
    """Create a new scenario."""
    db_scenario = ScenarioModel(**scenario.model_dump())
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    return db_scenario


@router.put("/{scenario_id}", response_model=Scenario)
def update_scenario(
    scenario_id: int, scenario: ScenarioUpdate, db: Session = Depends(get_db)
):
    """Update a scenario."""
    db_scenario = db.query(ScenarioModel).filter(ScenarioModel.id == scenario_id).first()
    if db_scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    update_data = scenario.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_scenario, key, value)
    
    db.commit()
    db.refresh(db_scenario)
    return db_scenario


@router.delete("/{scenario_id}")
def delete_scenario(scenario_id: int, db: Session = Depends(get_db)):
    """Delete a scenario."""
    db_scenario = db.query(ScenarioModel).filter(ScenarioModel.id == scenario_id).first()
    if db_scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    db.delete(db_scenario)
    db.commit()
    return {"message": "Scenario deleted successfully"}

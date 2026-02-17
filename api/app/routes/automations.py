from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Automation as AutomationModel
from app.schemas.schemas import Automation, AutomationCreate, AutomationUpdate

router = APIRouter()


@router.get("/", response_model=List[Automation])
def list_automations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all automations."""
    automations = db.query(AutomationModel).offset(skip).limit(limit).all()
    return automations


@router.get("/{automation_id}", response_model=Automation)
def get_automation(automation_id: int, db: Session = Depends(get_db)):
    """Get a specific automation."""
    automation = db.query(AutomationModel).filter(AutomationModel.id == automation_id).first()
    if automation is None:
        raise HTTPException(status_code=404, detail="Automation not found")
    return automation


@router.post("/", response_model=Automation)
def create_automation(automation: AutomationCreate, db: Session = Depends(get_db)):
    """Create a new automation."""
    db_automation = AutomationModel(**automation.model_dump())
    db.add(db_automation)
    db.commit()
    db.refresh(db_automation)
    return db_automation


@router.put("/{automation_id}", response_model=Automation)
def update_automation(
    automation_id: int, automation: AutomationUpdate, db: Session = Depends(get_db)
):
    """Update an automation."""
    db_automation = db.query(AutomationModel).filter(AutomationModel.id == automation_id).first()
    if db_automation is None:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    update_data = automation.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_automation, key, value)
    
    db.commit()
    db.refresh(db_automation)
    return db_automation


@router.delete("/{automation_id}")
def delete_automation(automation_id: int, db: Session = Depends(get_db)):
    """Delete an automation."""
    db_automation = db.query(AutomationModel).filter(AutomationModel.id == automation_id).first()
    if db_automation is None:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    db.delete(db_automation)
    db.commit()
    return {"message": "Automation deleted successfully"}

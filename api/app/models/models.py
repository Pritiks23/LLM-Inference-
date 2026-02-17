from sqlalchemy import Column, Integer, String, JSON, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Automation(Base):
    """TinyFish automation configuration."""
    __tablename__ = "automations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    tinyfish_automation_id = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    default_inputs = Column(JSON, nullable=True, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    scenarios = relationship("Scenario", back_populates="automation")


class Scenario(Base):
    """Benchmark scenario configuration."""
    __tablename__ = "scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    automation_id = Column(Integer, ForeignKey("automations.id"), nullable=False)
    description = Column(Text, nullable=True)
    inputs_template = Column(JSON, nullable=True, default={})
    run_settings = Column(JSON, nullable=True, default={})  # interval, concurrency, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    automation = relationship("Automation", back_populates="scenarios")
    runs = relationship("Run", back_populates="scenario")


class Run(Base):
    """Individual benchmark run execution."""
    __tablename__ = "runs"
    
    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="pending", index=True)  # pending, running, completed, failed
    total_duration_ms = Column(Float, nullable=True)
    
    # Streaming metrics (nullable for non-streaming implementation)
    ttft_ms = Column(Float, nullable=True)  # Time to First Token
    inter_token_stats = Column(JSON, nullable=True)  # {mean_ms, p50_ms, p95_ms, p99_ms}
    
    error = Column(Text, nullable=True)
    tinyfish_run_id = Column(String(255), nullable=True)
    response_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    scenario = relationship("Scenario", back_populates="runs")

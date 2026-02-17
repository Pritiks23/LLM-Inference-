from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "LLM Benchmarking Agent"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/benchmarking"
    
    # TinyFish Configuration
    TINYFISH_API_KEY: Optional[str] = None
    TINYFISH_BASE_URL: str = "https://agent.tinyfish.ai"
    TINYFISH_AUTOMATION_ENDPOINT: str = "/api/v1/automation/run"
    TINYFISH_MOCK_MODE: bool = True  # Enable mock mode by default for local dev
    
    # Worker Configuration
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"
    
    # Benchmark Settings
    DEFAULT_TIMEOUT_SECONDS: int = 300
    MAX_CONCURRENT_RUNS: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import automations, scenarios, runs

app = FastAPI(title=settings.PROJECT_NAME)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(automations.router, prefix=f"{settings.API_V1_STR}/automations", tags=["automations"])
app.include_router(scenarios.router, prefix=f"{settings.API_V1_STR}/scenarios", tags=["scenarios"])
app.include_router(runs.router, prefix=f"{settings.API_V1_STR}/runs", tags=["runs"])


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "mock_mode": settings.TINYFISH_MOCK_MODE,
        "project": settings.PROJECT_NAME
    }


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "LLM Benchmarking Agent API",
        "version": "1.0.0",
        "docs": "/docs"
    }

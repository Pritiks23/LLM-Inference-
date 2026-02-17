# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User / Browser                          │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                                                                  │
│                      Web (Next.js Frontend)                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │    Runs      │  │  Scenarios   │          │
│  │     Page     │  │     Page     │  │     Page     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Automations  │  │  Run Detail  │                            │
│  │     Page     │  │     Page     │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ REST API
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                                                                  │
│                      API (FastAPI Backend)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    API Routes                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │ Automations  │  │  Scenarios   │  │     Runs     │ │    │
│  │  │   CRUD       │  │    CRUD      │  │  Trigger/KPI │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  Services Layer                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │       Benchmark Execution Service                 │  │    │
│  │  │  • Calls TinyFish API                            │  │    │
│  │  │  • Measures performance                          │  │    │
│  │  │  • Stores results                                │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────┬────────────────────────────────────┬─────────────────┘
           │                                    │
           │                                    │
           │ SQL                                │ TinyFish API
           │                                    │
┌──────────▼──────────┐              ┌─────────▼─────────────────┐
│                     │              │                           │
│   PostgreSQL DB     │              │    TinyFish Platform      │
│                     │              │   (agent.tinyfish.ai)     │
│  ┌───────────────┐  │              │                           │
│  │  automations  │  │              │  ┌───────────────────┐   │
│  ├───────────────┤  │              │  │   Automation      │   │
│  │  scenarios    │  │              │  │   Execution       │   │
│  ├───────────────┤  │              │  │   (Mino Runs)     │   │
│  │     runs      │  │              │  └───────────────────┘   │
│  └───────────────┘  │              │                           │
│                     │              └───────────────────────────┘
└─────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                 Worker (Celery - Future Use)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • Scheduled benchmark runs                             │    │
│  │  • Recurring scenarios execution                        │    │
│  │  • Background processing                                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               │ Redis Queue
                               │
                        ┌──────▼──────┐
                        │             │
                        │    Redis    │
                        │   (Cache)   │
                        │             │
                        └─────────────┘
```

## Data Flow

### 1. User Triggers Benchmark Run

```
User (Web UI)
    │
    ├─> Click "Trigger Run" on Scenario
    │
    ▼
Web Frontend
    │
    ├─> POST /api/v1/runs/trigger
    │   { scenario_id: 1 }
    │
    ▼
FastAPI Backend
    │
    ├─> 1. Create Run record (status: pending)
    ├─> 2. Schedule background task
    │
    ▼
Background Task (execute_benchmark_run)
    │
    ├─> 3. Update Run (status: running)
    ├─> 4. Load Scenario & Automation config
    ├─> 5. Prepare inputs
    ├─> 6. Call TinyFish API
    │
    ▼
TinyFish Platform
    │
    ├─> Execute automation
    ├─> Process with LLM
    ├─> Return response
    │
    ▼
Background Task
    │
    ├─> 7. Measure duration
    ├─> 8. Store response
    ├─> 9. Update Run (status: completed)
    │
    ▼
Database
    │
    └─> Run record saved with metrics
```

### 2. User Views Dashboard

```
User (Web UI)
    │
    ├─> Navigate to Dashboard
    │
    ▼
Web Frontend
    │
    ├─> GET /api/v1/runs/kpis/dashboard
    │
    ▼
FastAPI Backend
    │
    ├─> Query all runs
    ├─> Calculate aggregations:
    │   • Total runs
    │   • Success rate
    │   • p50/p95/p99 latencies
    │   • Recent runs list
    │
    ▼
Database (PostgreSQL)
    │
    ├─> Execute SQL queries
    ├─> Aggregate statistics
    │
    ▼
FastAPI Backend
    │
    └─> Return KPIs as JSON
    │
    ▼
Web Frontend
    │
    └─> Render dashboard with charts
```

## Technology Stack Details

### Backend (FastAPI)
- **Language**: Python 3.11
- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **HTTP Client**: httpx
- **Background Tasks**: FastAPI BackgroundTasks (future: Celery)

### Frontend (Next.js)
- **Language**: TypeScript
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives (via shadcn/ui)
- **HTTP Client**: Fetch API

### Database
- **Database**: PostgreSQL 15
- **Connection Pooling**: SQLAlchemy connection pool
- **Schema Management**: Alembic migrations

### Infrastructure
- **Containerization**: Docker
- **Orchestration (Local)**: Docker Compose
- **Orchestration (Production)**: Render
- **Cache/Queue**: Redis

## Deployment Architecture

### Local Development
```
Docker Compose
├── db (PostgreSQL)
├── redis (Redis)
├── api (FastAPI)
├── web (Next.js)
└── worker (Celery)
```

### Render Production
```
Render Blueprint
├── benchmarking-db (Managed PostgreSQL)
├── benchmarking-redis (Managed Redis)
├── benchmarking-api (Web Service)
├── benchmarking-web (Web Service)
└── benchmarking-worker (Worker Service)
```

## Security Considerations

### Current Implementation
- No authentication (suitable for internal networks)
- CORS enabled for all origins (development)
- Secrets via environment variables
- Database credentials in connection string

### Production Recommendations
1. Add authentication (OAuth2, JWT)
2. Restrict CORS to specific origins
3. Use Render secrets for sensitive data
4. Enable HTTPS only
5. Implement rate limiting
6. Add input validation and sanitization
7. Enable database connection encryption

## Scalability

### Current Capacity
- Single API instance
- Single worker instance
- Shared PostgreSQL database
- Suitable for: Development, small teams, moderate load

### Future Scaling Options
1. **Horizontal Scaling**
   - Multiple API instances behind load balancer
   - Multiple worker instances
   - Connection pooling

2. **Database Scaling**
   - Read replicas for analytics
   - Partitioning runs table by date
   - Caching frequent queries

3. **Async Processing**
   - Move to Celery for all background tasks
   - Add task queue monitoring
   - Implement retry logic

4. **Observability**
   - Add logging (structured)
   - Metrics (Prometheus)
   - Tracing (OpenTelemetry)
   - Alerting (PagerDuty, etc.)

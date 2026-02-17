# LLM Benchmarking Agent for TinyFish

A Real-Time LLM Benchmarking Agent for TinyFish (Mino) automation runs with a custom web dashboard. This system monitors, benchmarks, and evaluates LLM performance with comprehensive metrics and a clean UI.

## Architecture

The system consists of four main components:

1. **API (FastAPI)**: RESTful backend handling CRUD operations, benchmark orchestration, and metrics aggregation
2. **Web (Next.js)**: Modern dashboard for monitoring and managing benchmark runs
3. **Worker (Celery)**: Background job processor for executing benchmark scenarios
4. **Database (PostgreSQL)**: Persistent storage for automations, scenarios, and run results

### Technology Stack

- **Backend**: FastAPI, SQLAlchemy, Alembic, Celery
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Deployment**: Docker, Docker Compose, Render

## Features

### Current Implementation

- ✅ **Non-streaming benchmarking** via TinyFish automation runs
- ✅ **Total Time to Generation** metrics (complete run duration)
- ✅ **Mock mode** for local development without TinyFish API key
- ✅ **Dashboard** with KPIs (p50/p95/p99, success rate, recent runs)
- ✅ **Runs management** with filtering and detailed views
- ✅ **Scenarios CRUD** for benchmark configuration
- ✅ **Automations registry** for TinyFish automation management
- ✅ **Render deployment** ready with render.yaml
- ✅ **CI/CD** with GitHub Actions

### Streaming-Ready Architecture

The system is designed to support SSE token streaming:

- 🔜 **Time to First Token (TTFT)**: Database schema includes `ttft_ms` field
- 🔜 **Inter-Token Latencies**: Schema includes `inter_token_stats` JSON field
- 🔜 **UI placeholders**: Dashboard shows "N/A (Pending SSE)" for streaming metrics

When TinyFish adds SSE streaming support, these features can be enabled by:
1. Updating the TinyFish client to handle SSE responses
2. Capturing token timestamps during streaming
3. Populating the existing database fields
4. UI will automatically display the metrics

## Local Development

### Prerequisites

- Docker and Docker Compose
- Make (optional, for convenience commands)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pritiks23/LLM-Inference-.git
   cd LLM-Inference-
   ```

2. **Setup environment files**
   ```bash
   make setup
   # Or manually:
   cp api/.env.example api/.env
   cp web/.env.example web/.env
   ```

3. **Start all services**
   ```bash
   make dev
   # Or:
   docker-compose up
   ```

4. **Access the application**
   - Web Dashboard: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - API Health Check: http://localhost:8000/health

5. **Run migrations**
   ```bash
   make migrate
   # Or:
   docker-compose exec api alembic -c /app/../database/alembic.ini upgrade head
   ```

### Available Make Commands

```bash
make help           # Show all available commands
make dev            # Start development environment
make build          # Build all Docker images
make up             # Start services in background
make down           # Stop all services
make logs           # Show logs from all services
make clean          # Clean up Docker resources
make migrate        # Run database migrations
make shell-api      # Open shell in API container
make shell-web      # Open shell in web container
make shell-db       # Open PostgreSQL shell
```

## Render Deployment

For detailed step-by-step deployment instructions, see **[RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md)**.

### Quick Start

1. **Push this repository to GitHub**

2. **Create a new Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create all services

3. **Configure Environment Variables**
   
   Set these in the Render Dashboard for API and Worker services:
   - `TINYFISH_API_KEY`: Your TinyFish API key (or use mock mode)
   - `TINYFISH_MOCK_MODE`: Set to `false` for production, `true` for testing

4. **Deploy and Access**
   - Wait for all services to deploy (~10-15 minutes)
   - Access your web dashboard at the provided URL
   - API docs available at `https://your-api-url.onrender.com/docs`

### Services Created

- **benchmarking-db**: PostgreSQL database (auto-managed)
- **benchmarking-redis**: Redis cache (Starter plan)
- **benchmarking-api**: FastAPI backend (Web service)
- **benchmarking-web**: Next.js frontend (Web service)
- **benchmarking-worker**: Celery worker (Worker service)

## TinyFish Integration

### Adding TinyFish API Key

**Local Development:**
```bash
# Edit api/.env
TINYFISH_API_KEY=your_api_key_here
TINYFISH_MOCK_MODE=false
```

**Render Production:**
1. Go to your API service in Render
2. Navigate to "Environment" tab
3. Add `TINYFISH_API_KEY` environment variable
4. Set `TINYFISH_MOCK_MODE` to `false`
5. Do the same for the Worker service

### Mock Mode

By default, the system runs in mock mode for local development:
- No TinyFish API key required
- Simulates automation runs with random delays and responses
- Perfect for development and testing

To enable mock mode:
```bash
TINYFISH_MOCK_MODE=true
```

### TinyFish Endpoint Configuration

If the TinyFish endpoint changes or you need custom configuration:

```bash
TINYFISH_BASE_URL=https://agent.tinyfish.ai
TINYFISH_AUTOMATION_ENDPOINT=/api/v1/automation/run
```

## Usage Guide

### Creating an Automation

Automations represent TinyFish automation configurations.

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/automations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPT-4 Chat Automation",
    "tinyfish_automation_id": "auto_123abc",
    "description": "GPT-4 chat completion automation",
    "default_inputs": {
      "model": "gpt-4",
      "temperature": 0.7
    }
  }'
```

**Via Web Dashboard:**
1. Navigate to "Automations" page
2. Currently view-only (use API for CRUD)
3. Future: Full CRUD UI

### Defining a Scenario

Scenarios define benchmark test cases.

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Simple Chat Benchmark",
    "automation_id": 1,
    "description": "Test basic chat completion",
    "inputs_template": {
      "prompt": "What is the capital of France?",
      "max_tokens": 100
    },
    "run_settings": {
      "interval_seconds": 300,
      "concurrency": 1
    }
  }'
```

### Triggering a Benchmark Run

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/runs/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "scenario_id": 1,
    "inputs_override": {
      "temperature": 0.5
    }
  }'
```

**Via Web Dashboard:**
1. Go to "Scenarios" page
2. Click "Trigger Run" on any scenario
3. View run progress in "Runs" page

### Viewing Results

1. **Dashboard**: Overview with KPIs and recent runs
2. **Runs Page**: List all runs with filtering
3. **Run Detail**: Click any run to see:
   - Status and timeline
   - Duration metrics
   - TinyFish run ID
   - Full response JSON
   - Error details (if failed)

## Database Schema

### automations
- `id`: Primary key
- `name`: Automation name
- `tinyfish_automation_id`: TinyFish automation ID
- `description`: Optional description
- `default_inputs`: JSON with default input parameters
- `created_at`, `updated_at`: Timestamps

### scenarios
- `id`: Primary key
- `name`: Scenario name
- `automation_id`: Foreign key to automations
- `description`: Optional description
- `inputs_template`: JSON with input parameters
- `run_settings`: JSON with scheduling config
- `created_at`, `updated_at`: Timestamps

### runs
- `id`: Primary key
- `scenario_id`: Foreign key to scenarios
- `started_at`, `finished_at`: Execution timestamps
- `status`: pending, running, completed, failed
- `total_duration_ms`: Total execution time
- `ttft_ms`: Time to first token (nullable, streaming-ready)
- `inter_token_stats`: JSON with inter-token latencies (nullable, streaming-ready)
- `error`: Error message if failed
- `tinyfish_run_id`: TinyFish run identifier
- `response_json`: Full response from TinyFish
- `created_at`: Creation timestamp

## API Endpoints

### Automations
- `GET /api/v1/automations` - List all automations
- `GET /api/v1/automations/{id}` - Get automation details
- `POST /api/v1/automations` - Create automation
- `PUT /api/v1/automations/{id}` - Update automation
- `DELETE /api/v1/automations/{id}` - Delete automation

### Scenarios
- `GET /api/v1/scenarios` - List all scenarios
- `GET /api/v1/scenarios/{id}` - Get scenario details
- `POST /api/v1/scenarios` - Create scenario
- `PUT /api/v1/scenarios/{id}` - Update scenario
- `DELETE /api/v1/scenarios/{id}` - Delete scenario

### Runs
- `GET /api/v1/runs` - List all runs (supports filtering)
- `GET /api/v1/runs/{id}` - Get run details
- `POST /api/v1/runs/trigger` - Trigger a new run
- `GET /api/v1/runs/kpis/dashboard` - Get dashboard KPIs

## Known Limitations

1. **Streaming Metrics**: TTFT and inter-token latencies are not yet captured
   - Requires TinyFish to support SSE streaming
   - Schema and UI are ready for future implementation
   
2. **Worker Integration**: Background worker is scaffolded but benchmark execution currently runs as API background tasks
   - Future enhancement: Move to Celery for better scalability
   
3. **Authentication**: No authentication implemented
   - Suitable for internal/trusted networks
   - Add auth layer for public deployments

4. **Scheduling**: Recurring runs are not yet implemented
   - Manual triggering via API or UI only
   - Future enhancement: Cron-like scheduling

## Development

### Project Structure

```
LLM-Inference-/
├── api/                 # FastAPI backend
│   ├── app/
│   │   ├── core/       # Config and database
│   │   ├── models/     # SQLAlchemy models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── routes/     # API endpoints
│   │   └── services/   # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── web/                 # Next.js frontend
│   ├── src/
│   │   ├── app/        # Pages (App Router)
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities and API client
│   ├── Dockerfile
│   └── package.json
├── worker/              # Celery worker
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
├── database/            # Migrations
│   ├── alembic.ini
│   └── migrations/
├── docker-compose.yml   # Local development
├── render.yaml          # Render deployment
├── Makefile            # Development commands
└── README.md
```

### Adding New Features

1. **Backend**: Add routes in `api/app/routes/`, models in `api/app/models/`
2. **Frontend**: Add pages in `web/src/app/`, components in `web/src/components/`
3. **Database**: Create migrations with Alembic
4. **Worker**: Add tasks in `worker/app/worker.py`

### Running Tests

```bash
# API tests (when implemented)
make test-api

# Web tests (when implemented)
cd web && npm test
```

### Linting

```bash
# API
make lint-api

# Web
make lint-web
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linters and tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/Pritiks23/LLM-Inference-/issues

---

Built with ❤️ for TinyFish LLM benchmarking

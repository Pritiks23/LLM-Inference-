# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./setup.sh
```

This will:
- Check Docker installation
- Create environment files
- Build all Docker images
- Start all services
- Run database migrations

### Option 2: Manual Setup

```bash
# 1. Copy environment files
cp api/.env.example api/.env
cp web/.env.example web/.env

# 2. Build and start services
docker-compose up --build

# 3. In another terminal, run migrations
docker-compose exec api alembic -c /app/../database/alembic.ini upgrade head
```

## 📊 Access the Application

Once running, access:

- **Web Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health

## 🌱 Seed Sample Data

To populate the database with example automations and scenarios:

```bash
# Install requests if not already installed
pip install requests

# Run the seed script
python scripts/seed_data.py
```

This creates:
- 2 example automations (GPT-4, GPT-3.5)
- 3 example scenarios
- Ready to trigger benchmark runs

## 🔨 Common Tasks

### View Logs
```bash
make logs
# or
docker-compose logs -f
```

### Stop Services
```bash
make down
# or
docker-compose down
```

### Restart Services
```bash
make down && make up
```

### Access Database Shell
```bash
make shell-db
# or
docker-compose exec db psql -U postgres -d benchmarking
```

### Access API Shell
```bash
make shell-api
# or
docker-compose exec api /bin/bash
```

## 📝 Create Your First Benchmark

### 1. Create an Automation

```bash
curl -X POST http://localhost:8000/api/v1/automations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Automation",
    "tinyfish_automation_id": "my_automation_id",
    "description": "Testing TinyFish integration",
    "default_inputs": {
      "model": "gpt-4",
      "temperature": 0.7
    }
  }'
```

### 2. Create a Scenario

```bash
curl -X POST http://localhost:8000/api/v1/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Scenario",
    "automation_id": 1,
    "description": "Test scenario",
    "inputs_template": {
      "prompt": "Hello, world!"
    }
  }'
```

### 3. Trigger a Run

Via API:
```bash
curl -X POST http://localhost:8000/api/v1/runs/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "scenario_id": 1
  }'
```

Or via Web UI:
1. Go to http://localhost:3000/scenarios
2. Click "Trigger Run" on your scenario
3. View results at http://localhost:3000/runs

## 🔧 Configuration

### TinyFish API Integration

**Mock Mode (Default for Local Dev)**
```bash
# In api/.env
TINYFISH_MOCK_MODE=true
```

**Real TinyFish Integration**
```bash
# In api/.env
TINYFISH_MOCK_MODE=false
TINYFISH_API_KEY=your_api_key_here
TINYFISH_BASE_URL=https://agent.tinyfish.ai
```

### Environment Variables

**API (`api/.env`)**
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/benchmarking
TINYFISH_API_KEY=
TINYFISH_MOCK_MODE=true
TINYFISH_BASE_URL=https://agent.tinyfish.ai
```

**Web (`web/.env`)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## ❓ Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Database connection errors
```bash
# Wait for DB to be ready
docker-compose up -d db
sleep 10
docker-compose up
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# For example, change "3000:3000" to "3001:3000"
```

### Web app build errors
```bash
# The web container needs node_modules
# On first run, this might take a while
docker-compose logs web
```

## 📚 Learn More

- Full documentation: [README.md](../README.md)
- API documentation: http://localhost:8000/docs (when running)
- GitHub: https://github.com/Pritiks23/LLM-Inference-

## 🆘 Getting Help

If you encounter issues:
1. Check the logs: `make logs`
2. Review the [README](../README.md)
3. Open an issue on GitHub

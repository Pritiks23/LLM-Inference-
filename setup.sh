#!/bin/bash
set -e

echo "=== LLM Benchmarking Agent Setup ==="
echo ""

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Create env files if they don't exist
if [ ! -f api/.env ]; then
    echo "📝 Creating api/.env from example..."
    cp api/.env.example api/.env
else
    echo "✅ api/.env already exists"
fi

if [ ! -f web/.env ]; then
    echo "📝 Creating web/.env from example..."
    cp web/.env.example web/.env
else
    echo "✅ web/.env already exists"
fi

echo ""
echo "=== Building Docker images ==="
docker-compose build

echo ""
echo "=== Starting services ==="
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

echo ""
echo "=== Running database migrations ==="
docker-compose exec -T api alembic -c /app/../database/alembic.ini upgrade head || {
    echo "⚠️  Migration failed. This might be normal on first run."
    echo "   You can run migrations manually later with: make migrate"
}

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "📊 Access the application:"
echo "   Web Dashboard: http://localhost:3000"
echo "   API Docs:      http://localhost:8000/docs"
echo "   Health Check:  http://localhost:8000/health"
echo ""
echo "📚 Next steps:"
echo "   1. View logs:          make logs"
echo "   2. Stop services:      make down"
echo "   3. Run migrations:     make migrate"
echo "   4. Access DB shell:    make shell-db"
echo ""
echo "🎉 Happy benchmarking!"

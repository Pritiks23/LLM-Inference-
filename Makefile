.PHONY: help dev build up down logs clean migrate test lint

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

dev: ## Start development environment
	docker-compose up

build: ## Build all Docker images
	docker-compose build

up: ## Start all services in background
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

clean: ## Clean up Docker resources
	docker-compose down -v
	rm -rf api/__pycache__ api/app/__pycache__
	rm -rf web/node_modules web/.next

migrate: ## Run database migrations
	docker-compose exec api alembic -c /app/../database/alembic.ini upgrade head

shell-api: ## Open a shell in the API container
	docker-compose exec api /bin/bash

shell-web: ## Open a shell in the web container
	docker-compose exec web /bin/sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec db psql -U postgres -d benchmarking

test-api: ## Run API tests
	@echo "No tests configured yet"

lint-api: ## Lint API code
	@echo "Linting API..."
	cd api && python -m flake8 app || true

lint-web: ## Lint web code
	@echo "Linting web..."
	cd web && npm run lint || true

setup: ## Initial setup
	@echo "Setting up the project..."
	cp api/.env.example api/.env || true
	cp web/.env.example web/.env || true
	@echo "Setup complete! Run 'make dev' to start."

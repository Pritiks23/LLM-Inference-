#!/bin/bash
set -e

echo "Running database migrations..."
cd /app/..
alembic -c database/alembic.ini upgrade head

echo "Migrations completed successfully!"

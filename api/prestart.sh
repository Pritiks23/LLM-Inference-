#!/bin/bash
set -e

echo "Running database migrations..."
# The database directory is at /database in the container
alembic -c /database/alembic.ini upgrade head

echo "Migrations completed successfully!"

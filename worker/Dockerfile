FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY worker/app ./app

# Copy API models for shared code
COPY api/app/models ./api_models
COPY api/app/core ./api_core

# Note: Worker uses shared models from API
# In production, ensure models are accessible

CMD ["celery", "-A", "app.worker", "worker", "--loglevel=info"]

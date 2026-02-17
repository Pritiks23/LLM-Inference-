FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Note: Worker uses shared models from API via volume mount or copy
# In production, ensure models are accessible

CMD ["celery", "-A", "app.worker", "worker", "--loglevel=info"]

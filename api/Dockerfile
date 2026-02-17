FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api/app ./app

# Copy database migrations (needed for alembic)
COPY database /database

# Copy prestart script
COPY api/prestart.sh /app/prestart.sh
RUN chmod +x /app/prestart.sh

# Expose port
EXPOSE 8000

# Run migrations and then start the application
CMD ["/bin/bash", "-c", "/app/prestart.sh && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

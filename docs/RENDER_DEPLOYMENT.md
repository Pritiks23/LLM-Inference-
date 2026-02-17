# Render Deployment Guide

This guide provides step-by-step instructions for deploying the LLM Benchmarking Agent to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com) if you don't have an account
2. **GitHub Repository**: Your repository should be pushed to GitHub
3. **TinyFish API Key** (optional): Required if you want to run actual benchmarks (not in mock mode)

## Architecture Overview

The application consists of the following services on Render:

- **benchmarking-db**: PostgreSQL database (automatically created)
- **benchmarking-redis**: Redis cache for Celery task queue
- **benchmarking-api**: FastAPI backend (Web Service)
- **benchmarking-web**: Next.js frontend (Web Service)
- **benchmarking-worker**: Celery background worker (Worker Service)

## Step-by-Step Deployment Instructions

### Step 1: Push Repository to GitHub

If you haven't already, push this repository to your GitHub account:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Connect Render to GitHub

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Click on your profile/account settings
3. Go to "Account Settings" → "GitHub"
4. Click "Connect GitHub Account" if not already connected
5. Grant Render access to your repositories

### Step 3: Deploy Using Blueprint

1. From the Render Dashboard, click **"New +"** button
2. Select **"Blueprint"**
3. Connect to your GitHub repository containing this code
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"** to create all services

### Step 4: Configure Environment Variables

After the blueprint is applied, you need to configure the required environment variables:

#### For the API Service (benchmarking-api):

1. Go to the **benchmarking-api** service in Render Dashboard
2. Navigate to **"Environment"** tab
3. Add/verify the following environment variables:

```
TINYFISH_API_KEY=your_tinyfish_api_key_here  # Required for production use
TINYFISH_MOCK_MODE=false                      # Set to 'true' for testing without TinyFish
TINYFISH_BASE_URL=https://agent.tinyfish.ai   # Default TinyFish endpoint
```

**Note**: If you don't have a TinyFish API key yet, you can set `TINYFISH_MOCK_MODE=true` to test the deployment with simulated data.

#### For the Worker Service (benchmarking-worker):

1. Go to the **benchmarking-worker** service in Render Dashboard
2. Navigate to **"Environment"** tab
3. Add the same TinyFish-related environment variables:

```
TINYFISH_API_KEY=your_tinyfish_api_key_here
TINYFISH_MOCK_MODE=false
```

### Step 5: Wait for Deployment

1. Render will now build and deploy all services
2. This may take 10-15 minutes for the first deployment
3. You can monitor the build logs for each service in real-time

**Build Order:**
- Database and Redis will be created first
- API service will build (includes running database migrations automatically)
- Web frontend will build
- Worker service will build

### Step 6: Access Your Application

Once all services show "Live" status:

1. Find the **benchmarking-web** service URL (e.g., `https://benchmarking-web.onrender.com`)
2. Open this URL in your browser to access the dashboard
3. The API will be accessible at the **benchmarking-api** service URL (e.g., `https://benchmarking-api.onrender.com`)
4. API documentation is available at `https://benchmarking-api.onrender.com/docs`

### Step 7: Verify Deployment

1. **Check Health Endpoint**: Visit `https://your-api-url.onrender.com/health`
   - Should return: `{"status": "healthy", "mock_mode": false/true, "project": "LLM Benchmarking Agent"}`

2. **Check Web Dashboard**: Visit your web service URL
   - Dashboard should load showing KPIs and recent runs

3. **Test API**: Visit `https://your-api-url.onrender.com/docs`
   - Swagger UI should be accessible

## Service Configuration Details

### Database Configuration

- **Type**: PostgreSQL 15
- **Plan**: Starter (can be upgraded)
- **Automatic Backups**: Enabled on paid plans
- **Migrations**: Run automatically on API service startup

### Redis Configuration

- **Type**: Redis 7
- **Plan**: Starter
- **Max Memory Policy**: No eviction
- **Use**: Celery broker and result backend

### API Service Configuration

- **Runtime**: Python 3.11
- **Web Server**: Uvicorn
- **Auto-deploy**: Enabled on main branch push
- **Health Check**: `/health` endpoint
- **Startup**: Automatically runs database migrations via `prestart.sh`

### Web Service Configuration

- **Runtime**: Node.js 18
- **Framework**: Next.js 15
- **Build**: Standalone output mode
- **Environment**: Production

### Worker Service Configuration

- **Runtime**: Python 3.11
- **Type**: Background worker
- **Task Queue**: Celery with Redis broker
- **Auto-scaling**: Configure based on load

## Environment Variables Reference

### Required Environment Variables

| Variable | Service | Description | Default |
|----------|---------|-------------|---------|
| `DATABASE_URL` | API, Worker | PostgreSQL connection string | Auto-set by Render |
| `CELERY_BROKER_URL` | API, Worker | Redis connection for Celery | Auto-set by Render |
| `CELERY_RESULT_BACKEND` | API, Worker | Redis connection for results | Auto-set by Render |
| `NEXT_PUBLIC_API_URL` | Web | API endpoint URL | Auto-set from API service |

### Optional Environment Variables

| Variable | Service | Description | Default |
|----------|---------|-------------|---------|
| `TINYFISH_API_KEY` | API, Worker | TinyFish authentication key | None (mock mode) |
| `TINYFISH_MOCK_MODE` | API, Worker | Enable mock benchmarks | `true` |
| `TINYFISH_BASE_URL` | API, Worker | TinyFish API endpoint | `https://agent.tinyfish.ai` |
| `DEFAULT_TIMEOUT_SECONDS` | API, Worker | Max benchmark duration | `300` |
| `MAX_CONCURRENT_RUNS` | API, Worker | Max parallel benchmarks | `5` |

## Troubleshooting

### API Service Fails to Start

**Problem**: API service shows "Deploy failed" status

**Solutions**:
1. Check build logs for errors
2. Verify `DATABASE_URL` environment variable is set correctly
3. Check if database migrations ran successfully
4. Look for Python dependency installation errors

### Database Connection Issues

**Problem**: API logs show "connection refused" or database errors

**Solutions**:
1. Verify the database service is running and "Live"
2. Check that `DATABASE_URL` environment variable is correctly linked
3. Wait a few minutes for the database to fully initialize
4. Check database service logs for issues

### Web Service Build Fails

**Problem**: Web service build fails during `npm run build`

**Solutions**:
1. Verify `package-lock.json` exists in the repository
2. Check for Node.js version compatibility (requires Node 18)
3. Verify `NEXT_PUBLIC_API_URL` is set correctly
4. Review build logs for specific errors

### Worker Not Processing Tasks

**Problem**: Background jobs are not being processed

**Solutions**:
1. Check worker service logs for connection errors
2. Verify Redis service is running
3. Check `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` are set
4. Restart the worker service

### Migrations Not Running

**Problem**: Database tables are not created

**Solutions**:
1. Check API service startup logs for migration errors
2. Manually trigger migrations via Render Shell:
   ```bash
   cd /app/.. && alembic -c database/alembic.ini upgrade head
   ```
3. Verify the `prestart.sh` script has execute permissions

## Updating Your Deployment

### Automatic Updates

Render automatically redeploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Redeploy

1. Go to the service in Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### Rolling Back

1. Go to the service in Render Dashboard
2. Click "Events" to see deployment history
3. Click "Rollback" on a previous successful deployment

## Monitoring and Logs

### Viewing Logs

1. Go to any service in Render Dashboard
2. Click the "Logs" tab
3. Real-time logs will stream automatically

### Setting Up Alerts

1. Go to service settings
2. Navigate to "Notifications"
3. Configure email/Slack notifications for:
   - Deploy failures
   - Service crashes
   - Health check failures

### Performance Monitoring

Consider integrating:
- **Sentry**: For error tracking
- **DataDog/New Relic**: For APM
- **Render Metrics**: Built-in CPU/memory monitoring

## Scaling Your Application

### Vertical Scaling (Upgrading Plans)

1. Go to service settings
2. Click "Upgrade Plan"
3. Select higher tier (more CPU/RAM)

### Horizontal Scaling (Multiple Instances)

For API and Worker services:
1. Go to service settings
2. Increase "Instance Count"
3. Configure auto-scaling based on CPU/memory

## Cost Optimization

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin down will be slow (cold start)
- Limited to 750 hours/month across all services

### Paid Plans

- **Starter Plan** ($7/month per service): No spin down
- **Standard Plan** ($25/month): Better performance, more resources
- **Pro Plan**: Auto-scaling, dedicated resources

### Recommendations

For production use:
- Database: Starter plan minimum (includes automated backups)
- Redis: Starter plan
- API: Starter plan (always on)
- Web: Starter plan (always on)
- Worker: Starter plan (for reliability)

**Total Estimated Cost**: ~$35-40/month for all services on Starter plans

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Update API CORS settings in production to allow only your web domain
3. **Database**: Use strong passwords (auto-generated by Render)
4. **TinyFish API Key**: Store securely in Render environment variables
5. **HTTPS**: Automatically provided by Render for all services

## Support and Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **GitHub Issues**: Report bugs in this repository's issues
- **TinyFish Documentation**: For TinyFish API integration questions

## Next Steps

After successful deployment:

1. Create your first automation via API
2. Define benchmark scenarios
3. Trigger test runs from the dashboard
4. Monitor performance metrics
5. Set up recurring benchmarks (if scheduling is implemented)

## Quick Reference Commands

### Access Render Shell (for debugging)

1. Go to service in Render Dashboard
2. Click "Shell" tab
3. Opens a terminal in the running container

### Run Migrations Manually

```bash
cd /app/.. && alembic -c database/alembic.ini upgrade head
```

### Check Celery Worker Status

```bash
celery -A app.worker inspect active
```

### View Database

```bash
psql $DATABASE_URL
```

---

**Congratulations!** Your LLM Benchmarking Agent is now deployed on Render. 🎉

For questions or issues, please check the troubleshooting section above or create an issue in the GitHub repository.

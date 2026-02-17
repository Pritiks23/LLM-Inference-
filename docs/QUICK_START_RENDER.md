# Quick Start: Deploying to Render

This is a quick reference guide. For detailed instructions, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md).

## What Was Fixed

The following issues were preventing deployment on Render:

1. ❌ **Invalid service type**: `type: pserv` doesn't exist in Render
   - ✅ **Fixed**: Removed duplicate PostgreSQL service, kept it only in `databases` section

2. ❌ **Missing package-lock.json**: Web build failed
   - ✅ **Fixed**: Generated and committed package-lock.json

3. ❌ **Database migrations not running**: Tables weren't created
   - ✅ **Fixed**: Added automatic migration runner in API startup script

4. ❌ **Incorrect Docker contexts**: Services couldn't access shared resources
   - ✅ **Fixed**: Updated all Dockerfiles to use root directory as context

5. ❌ **Hardcoded database URLs**: Migrations used local database
   - ✅ **Fixed**: Updated alembic to use DATABASE_URL environment variable

## Deploy to Render in 5 Steps

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Create Blueprint on Render

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Blueprint"**
3. Select your GitHub repository
4. Click **"Apply"**

### 3. Configure Environment Variables

In the Render Dashboard, for both **benchmarking-api** and **benchmarking-worker** services:

**Option A: Use Mock Mode (for testing)**
```
TINYFISH_MOCK_MODE=true
```

**Option B: Use Real TinyFish API**
```
TINYFISH_API_KEY=your_api_key_here
TINYFISH_MOCK_MODE=false
```

### 4. Wait for Deployment

- Deployment takes ~10-15 minutes
- All 5 services will be created:
  - Database (PostgreSQL)
  - Redis
  - API (FastAPI)
  - Web (Next.js)
  - Worker (Celery)

### 5. Access Your Application

Once all services show "Live":
- **Dashboard**: Open the URL from `benchmarking-web` service
- **API Docs**: `https://your-api-url.onrender.com/docs`
- **Health Check**: `https://your-api-url.onrender.com/health`

## Services Created

| Service | Type | Plan | Purpose |
|---------|------|------|---------|
| benchmarking-db | PostgreSQL | Starter | Data storage |
| benchmarking-redis | Redis | Starter | Task queue |
| benchmarking-api | Web Service | Starter | REST API |
| benchmarking-web | Web Service | Starter | Dashboard UI |
| benchmarking-worker | Worker | Starter | Background jobs |

## Verify Deployment

1. **Health Check**
   ```bash
   curl https://your-api-url.onrender.com/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "mock_mode": true,
     "project": "LLM Benchmarking Agent"
   }
   ```

2. **API Documentation**
   - Visit `https://your-api-url.onrender.com/docs`
   - Should see Swagger UI

3. **Web Dashboard**
   - Visit the web service URL
   - Should see the dashboard with KPIs

## Cost Estimate

**Free Tier**: Services spin down after 15 minutes of inactivity
**Starter Plans** ($7/month each): Always on, no spin down

Recommended production setup:
- Database: Starter ($7/mo)
- Redis: Starter ($7/mo)
- API: Starter ($7/mo)
- Web: Starter ($7/mo)
- Worker: Starter ($7/mo)

**Total: ~$35/month**

## Troubleshooting

### Build Fails

Check build logs in Render Dashboard for specific errors.

### Database Connection Issues

1. Wait 5 minutes for database to fully initialize
2. Verify DATABASE_URL is auto-configured
3. Check database service is "Live"

### Migrations Don't Run

The API service automatically runs migrations on startup. Check API service logs for migration errors.

### Still Need Help?

See the complete guide: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

---

✅ **All issues fixed and tested!** Ready for deployment.

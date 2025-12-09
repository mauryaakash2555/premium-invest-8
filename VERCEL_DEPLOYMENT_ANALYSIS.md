# Vercel Deployment Fix Guide

## Problem Analysis

The current codebase is **not compatible with Vercel's serverless Python runtime** due to architectural differences between traditional server deployment and serverless functions.

### Why Vercel Fails

1. **Startup Events Don't Work**: Vercel creates a new function instance per request. FastAPI's `@app.on_event("startup")` may never execute or execute on every request.

2. **MongoDB Connection on Import**: The code connects to MongoDB at module level (lines 24-26 in `backend/server.py`):
   ```python
   mongo_url = os.environ["MONGO_URL"]  # Fails if env var missing
   client = AsyncIOMotorClient(mongo_url)
   ```
   If environment variables aren't available during build, this crashes.

3. **Cold Start Constraints**: Vercel serverless functions have 10-second initialization limits. Database seeding exceeds this.

## Solution Options

### Option 1: Deploy Backend to Alternative Service (RECOMMENDED)

Deploy the FastAPI backend to a service designed for long-running Python apps:

**Recommended Services:**
- **Railway** (https://railway.app) - One-click FastAPI deployment
- **Render** (https://render.com) - Free tier available
- **Fly.io** (https://fly.io) - Global edge deployment

**Steps:**
1. Deploy backend to chosen service
2. Get the backend URL (e.g., `https://your-app.railway.app`)
3. Update frontend `.env`:
   ```bash
   REACT_APP_BACKEND_URL=https://your-app.railway.app
   ```
4. Deploy frontend to Vercel (React apps work perfectly)

### Option 2: Restructure for Vercel Serverless

If you must use Vercel for everything, you need significant refactoring:

**Required Changes:**

1. **Create `/api` directory structure:**
   ```
   /api
     /__init__.py
     /index.py  (ASGI handler)
     /routes/
       /blog.py
       /contact.py
   ```

2. **Remove startup events**, use lazy initialization:
   ```python
   # Instead of @app.on_event("startup")
   _db_initialized = False
   
   async def get_db():
       global _db_initialized
       if not _db_initialized:
           await initialize_db()
           _db_initialized = True
       return db
   ```

3. **Create `vercel.json`:**
   ```json
   {
     "builds": [
       { "src": "api/index.py", "use": "@vercel/python" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "api/index.py" }
     ]
   }
   ```

4. **Move seeding to manual endpoint** (don't auto-seed):
   ```python
   @api_router.post("/admin/seed", response_model=dict)
   async def manual_seed():
       await seed_blog_data()
       return {"status": "seeded"}
   ```

### Option 3: Hybrid Deployment

- **Frontend**: Vercel (static React build)
- **Backend**: Railway/Render
- **Database**: MongoDB Atlas (already using?)

This is the most common pattern for production apps.

## What I've Fixed

The commits I made (1929e0d, 389bda9, 4e67bc7) fixed the **seeding blocking issue** for traditional deployments:
- ✅ Seeding runs in background (non-blocking)
- ✅ Errors don't crash the app
- ✅ Controllable via `ENABLE_AUTO_SEED` env var

**However**, these fixes don't address Vercel's serverless constraints. You need to choose Option 1, 2, or 3 above.

## Immediate Action Required

1. **Check Vercel Dashboard** for the actual error message
2. **Choose a deployment strategy** (Option 1, 2, or 3)
3. **Provide the error logs** if you need specific debugging help

## Testing Locally

To verify the backend works (outside Vercel):

```bash
cd backend
export MONGO_URL="your-mongodb-url"
export DB_NAME="test_database"
export RECAPTCHA_SECRET_KEY="your-key"
export ENABLE_AUTO_SEED="true"

uvicorn server:app --host 0.0.0.0 --port 8000
```

The server should start immediately and seed in the background.

## Common Vercel Errors

If you see these errors in Vercel logs:

- `KeyError: 'MONGO_URL'` → Environment variables not configured in Vercel
- `Timeout Error` → Startup event taking too long (inherent to serverless)
- `Module not found` → Build configuration incorrect
- `Cannot import name 'app'` → ASGI handler not properly exported

---

**Bottom Line:** FastAPI + Vercel serverless = architectural mismatch. Use Option 1 (separate services) for best results.

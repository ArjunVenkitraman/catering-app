# Managed Free Deployment (Vercel + Render + Supabase)

This guide deploys the project without Docker:

- Frontend (React/Vite): Vercel
- Backend (FastAPI): Render
- Database (PostgreSQL): Supabase

## 0) Prerequisites

- A GitHub repo containing this project
- Node 18+ locally (for the frontend build)
- Python 3.11+ locally (for migrations, optional)

## 1) Create the database (Supabase)

1. Create a Supabase project.
2. Copy the Postgres connection string.
3. Convert it to asyncpg format for this backend:

`postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DATABASE`

## 2) Deploy the backend (Render)

### Option A (recommended): Blueprint

1. In Render, choose **New +** → **Blueprint**.
2. Select your GitHub repo.
3. Render reads `backend/render.yaml` and creates the service.

### Option B: Manual service

Create a **Web Service** from your GitHub repo with:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command:
  - `gunicorn -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:$PORT --timeout 120 app.main:app`

### Backend environment variables (Render)

Set these in the Render service settings:

- `DATABASE_URL` = your Supabase asyncpg URL (required)
- `DEBUG` = `false`
- `CORS_ORIGINS` = your Vercel app origins (comma-separated), for example:
  - `https://your-app.vercel.app,https://your-app-git-main-yourteam.vercel.app`
- `CORS_ALLOW_CREDENTIALS` = `false`

### Migrations (Alembic)

Render can run `alembic upgrade head` automatically if you deploy via blueprint (`preDeployCommand`).

If you need to run it manually, run locally:

1. Set `DATABASE_URL` to the Supabase asyncpg URL.
2. From `backend/` run:
   - `alembic upgrade head`

## 3) Deploy the frontend (Vercel)

1. In Vercel, **Add New** → **Project** → import your GitHub repo.
2. Set the project root to `frontend`.
3. Vercel uses `frontend/vercel.json` (build/output + SPA rewrite).

### Frontend environment variables (Vercel)

Set:

- `VITE_API_BASE_URL` = your Render backend URL, for example:
  - `https://catering-planner-api.onrender.com`

Redeploy after adding env vars.

## 4) Verify

1. Open your Render backend URL and check:
   - `GET /health` returns `{ "status": "ok" }`
2. Open the Vercel frontend URL and try:
   - Create ingredients
   - Create dishes + recipes
   - Create an event with selected dishes
   - Generate the grocery list

## Notes / gotchas

- If you see CORS errors in the browser console, update `CORS_ORIGINS` in Render to include the exact Vercel domain(s) and redeploy.
- Render free instances can sleep; first request may be slow (cold start).
- Supabase free tier can pause when inactive; first DB connection may be slow.


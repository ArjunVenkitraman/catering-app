from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.routers import dishes, ingredients, recipes, events
from app.core.config import settings
from app.core.database import ping_db

app = FastAPI(
    title="Catering Grocery Planner API",
    description="API for managing catering events and grocery planning",
    version="1.0.0",
)


class ExceptionToJsonMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            message = str(exc) if settings.DEBUG else "Internal Server Error"
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": message},
            )


_raw_origins = [o.strip() for o in (settings.CORS_ORIGINS or "").split(",") if o.strip()]
_allow_all_origins = (not _raw_origins) or ("*" in _raw_origins)
_allow_credentials = False if _allow_all_origins else bool(settings.CORS_ALLOW_CREDENTIALS)

# Important: Keep this middleware *inside* CORSMiddleware, so CORS headers are
# still attached even when we return 500s due to unexpected exceptions.
app.add_middleware(ExceptionToJsonMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all_origins else _raw_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


API_PREFIX = "/api/v1"

app.include_router(dishes.router, prefix=API_PREFIX)
app.include_router(ingredients.router, prefix=API_PREFIX)
app.include_router(recipes.router, prefix=API_PREFIX)
app.include_router(events.router, prefix=API_PREFIX)


@app.get("/health")
async def health():
    if settings.HEALTHCHECK_DB:
        try:
            await ping_db()
        except Exception as exc:
            message = str(exc) if settings.DEBUG else "Database unavailable"
            return JSONResponse(status_code=503, content={"status": "degraded", "db": "down", "message": message})
    return {"status": "ok", "db": "up" if settings.HEALTHCHECK_DB else "skipped"}

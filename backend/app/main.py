from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import dishes, ingredients, recipes, events
from app.core.config import settings

app = FastAPI(
    title="Catering Grocery Planner API",
    description="API for managing catering events and grocery planning",
    version="1.0.0",
)

_raw_origins = [o.strip() for o in (settings.CORS_ORIGINS or "").split(",") if o.strip()]
_allow_all_origins = (not _raw_origins) or ("*" in _raw_origins)
_allow_credentials = False if _allow_all_origins else bool(settings.CORS_ALLOW_CREDENTIALS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all_origins else _raw_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": str(exc)},
    )


API_PREFIX = "/api/v1"

app.include_router(dishes.router, prefix=API_PREFIX)
app.include_router(ingredients.router, prefix=API_PREFIX)
app.include_router(recipes.router, prefix=API_PREFIX)
app.include_router(events.router, prefix=API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok"}

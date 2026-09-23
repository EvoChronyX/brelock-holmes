"""Brelock Holmes — Quantum Digital Signature Security Lab.

Main FastAPI application.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.db.base import Base
from app.db.session import engine

from app.api.routes.health import router as health_router
from app.api.routes.experiments import router as experiments_router
from app.api.routes.attacks import router as attacks_router
from app.api.routes.security_events import router as security_events_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.baseline import router as baseline_router
from app.api.routes.protocols import router as protocols_router
from app.api.routes.innovations import router as innovations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Brelock Holmes starting up")
    # Create tables (dev convenience — use Alembic for production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready")
    yield
    logger.info("Brelock Holmes shutting down")
    await engine.dispose()


app = FastAPI(
    title="Brelock Holmes API",
    description="Quantum Digital Signature Security & Threat Investigation Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under /api
app.include_router(health_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")
app.include_router(attacks_router, prefix="/api")
app.include_router(security_events_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(baseline_router, prefix="/api")
app.include_router(protocols_router, prefix="/api")
app.include_router(innovations_router, prefix="/api")

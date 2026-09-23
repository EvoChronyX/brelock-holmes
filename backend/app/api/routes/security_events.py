"""Security events API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import SecurityEvent
from app.db.session import get_db
from app.schemas import SecurityEventResponse

router = APIRouter(prefix="/security-events", tags=["security-events"])


@router.get("", response_model=list[SecurityEventResponse])
async def list_events(
    limit: int = 100,
    offset: int = 0,
    severity: str | None = None,
    event_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).offset(offset).limit(limit)
    if severity:
        stmt = stmt.where(SecurityEvent.severity == severity)
    if event_type:
        stmt = stmt.where(SecurityEvent.event_type == event_type)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{event_id}", response_model=SecurityEventResponse)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SecurityEvent).where(SecurityEvent.id == event_id))
    ev = result.scalar_one_or_none()
    if not ev:
        raise HTTPException(404, "Security event not found")
    return ev

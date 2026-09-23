"""Analytics API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Experiment
from app.db.session import get_db
from app.schemas import AnalyticsSummary, ExperimentListItem

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(db: AsyncSession = Depends(get_db)):
    # Total experiments
    total = (await db.execute(select(func.count(Experiment.id)))).scalar() or 0

    # Threats
    threats = (await db.execute(
        select(func.count(Experiment.id)).where(Experiment.detection_status == "THREAT_DETECTED")
    )).scalar() or 0

    normal = total - threats

    # Avg fidelity
    avg_fid_result = (await db.execute(
        select(func.avg(Experiment.fidelity)).where(Experiment.fidelity.isnot(None))
    )).scalar()
    avg_fid = round(float(avg_fid_result), 4) if avg_fid_result else 0.0

    detection_rate = round(threats / total, 4) if total > 0 else 0.0

    # Attack distribution
    rows = (await db.execute(
        select(Experiment.attack_type, func.count(Experiment.id)).group_by(Experiment.attack_type)
    )).all()
    attack_dist = {r[0]: r[1] for r in rows}

    # Severity distribution
    sev_rows = (await db.execute(
        select(Experiment.severity, func.count(Experiment.id))
        .where(Experiment.severity.isnot(None))
        .group_by(Experiment.severity)
    )).all()
    sev_dist = {r[0]: r[1] for r in sev_rows}

    # Recent
    recent = (await db.execute(
        select(Experiment).order_by(Experiment.created_at.desc()).limit(10)
    )).scalars().all()

    return AnalyticsSummary(
        total_experiments=total,
        threats_detected=threats,
        normal_sessions=normal,
        detection_rate=detection_rate,
        average_fidelity=avg_fid,
        attack_distribution=attack_dist,
        severity_distribution=sev_dist,
        recent_experiments=[ExperimentListItem.model_validate(e) for e in recent],
    )

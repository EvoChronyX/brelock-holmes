"""Experiment API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Experiment
from app.db.session import get_db
from app.schemas import ExperimentCreate, ExperimentResponse, ExperimentListItem
from app.services.experiment_service import run_experiment

router = APIRouter(prefix="/experiments", tags=["experiments"])


@router.post("", response_model=ExperimentResponse)
async def create_experiment(req: ExperimentCreate, db: AsyncSession = Depends(get_db)):
    """Create and run a new experiment."""
    exp = await run_experiment(
        db=db,
        name=req.name,
        protocol=req.protocol,
        shots=req.shots,
        noise_type=req.noise_type,
        noise_level=req.noise_level,
        attack_type=req.attack_type,
        attack_params=req.attack_params,
        message=req.message,
        input_state=req.input_state,
    )
    return exp


@router.get("", response_model=list[ExperimentListItem])
async def list_experiments(
    limit: int = 50,
    offset: int = 0,
    attack_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Experiment).order_by(Experiment.created_at.desc()).offset(offset).limit(limit)
    if attack_type:
        stmt = stmt.where(Experiment.attack_type == attack_type)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment(experiment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    exp = result.scalar_one_or_none()
    if not exp:
        raise HTTPException(404, "Experiment not found")
    return exp

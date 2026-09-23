"""Attack simulation API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas import AttackSimulateRequest, ExperimentResponse
from app.services.experiment_service import run_experiment

router = APIRouter(prefix="/attacks", tags=["attacks"])


@router.post("/simulate", response_model=ExperimentResponse)
async def simulate_attack(req: AttackSimulateRequest, db: AsyncSession = Depends(get_db)):
    """Run an attack simulation as a full experiment."""
    exp = await run_experiment(
        db=db,
        name=f"Attack Simulation: {req.attack_type}",
        shots=req.shots,
        noise_type=req.noise_type,
        noise_level=req.noise_level,
        attack_type=req.attack_type,
        attack_params=req.attack_params,
        message=req.message,
    )
    return exp

"""Baseline calibration API routes."""

from fastapi import APIRouter
from app.schemas import BaselineRequest, BaselineResponse
from app.services.baseline_service import calibrate_baseline

router = APIRouter(prefix="/baseline", tags=["baseline"])

# Cache last calibration result
_last_baseline: dict | None = None


@router.post("/calibrate", response_model=BaselineResponse)
async def calibrate(req: BaselineRequest):
    global _last_baseline
    result = calibrate_baseline(
        shots=req.shots,
        noise_levels=req.noise_levels,
        num_runs=req.num_runs,
    )
    _last_baseline = result
    return result


@router.get("", response_model=BaselineResponse)
async def get_baseline():
    if _last_baseline:
        return _last_baseline
    return BaselineResponse(
        calibrated=False,
        noise_levels=[],
        fidelity_mean={},
        fidelity_std={},
        deviation_mean={},
        deviation_std={},
        recommended_thresholds={},
    )

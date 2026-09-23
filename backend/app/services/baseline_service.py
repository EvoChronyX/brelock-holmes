"""Baseline calibration service — runs normal experiments to establish thresholds."""

import statistics

from app.quantum.teleportation import run_teleportation
from app.security.thresholds import update_thresholds


def calibrate_baseline(
    shots: int = 1024,
    noise_levels: list[float] | None = None,
    num_runs: int = 10,
) -> dict:
    """Run normal experiments at various noise levels and compute baseline statistics.

    Returns mean/std for fidelity, deviation, and recommended thresholds.
    """
    if noise_levels is None:
        noise_levels = [0.0, 0.01, 0.05, 0.1]

    fidelity_by_noise: dict[str, list[float]] = {}
    deviation_by_noise: dict[str, list[float]] = {}

    for nl in noise_levels:
        key = str(nl)
        fids = []
        devs = []
        nt = "depolarizing" if nl > 0 else "none"
        for i in range(num_runs):
            r = run_teleportation(
                input_state="plus",
                shots=shots,
                noise_type=nt,
                noise_level=nl,
                seed=42 + i,
            )
            fids.append(r.fidelity)
            devs.append(r.deviation)
        fidelity_by_noise[key] = fids
        deviation_by_noise[key] = devs

    # Aggregate
    fid_mean = {k: round(statistics.mean(v), 6) for k, v in fidelity_by_noise.items()}
    fid_std = {k: round(statistics.stdev(v) if len(v) > 1 else 0.0, 6) for k, v in fidelity_by_noise.items()}
    dev_mean = {k: round(statistics.mean(v), 6) for k, v in deviation_by_noise.items()}
    dev_std = {k: round(statistics.stdev(v) if len(v) > 1 else 0.0, 6) for k, v in deviation_by_noise.items()}

    # Recommended thresholds: worst normal fidelity − 2σ, worst normal deviation + 2σ
    all_fids = [f for vs in fidelity_by_noise.values() for f in vs]
    all_devs = [d for vs in deviation_by_noise.values() for d in vs]

    rec_fidelity_min = round(min(all_fids) - 2 * (statistics.stdev(all_fids) if len(all_fids) > 1 else 0.05), 4)
    rec_deviation_max = round(max(all_devs) + 2 * (statistics.stdev(all_devs) if len(all_devs) > 1 else 0.05), 4)

    # Update active thresholds
    update_thresholds(
        fidelity_min=max(rec_fidelity_min, 0.5),
        deviation_max=min(rec_deviation_max, 0.5),
        error_rate_max=1.0 - max(rec_fidelity_min, 0.5),
    )

    return {
        "calibrated": True,
        "noise_levels": noise_levels,
        "fidelity_mean": fid_mean,
        "fidelity_std": fid_std,
        "deviation_mean": dev_mean,
        "deviation_std": dev_std,
        "recommended_thresholds": {
            "fidelity_min": max(rec_fidelity_min, 0.5),
            "deviation_max": min(rec_deviation_max, 0.5),
        },
    }

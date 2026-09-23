"""Configurable detection thresholds."""

from dataclasses import dataclass, field


@dataclass
class ThresholdConfig:
    """Thresholds for threat detection.

    Fidelity below fidelity_min → anomaly.
    Deviation above deviation_max → anomaly.
    Error rate above error_rate_max → anomaly.
    Replay: any duplicate session_id/nonce → replay detected.
    """
    fidelity_min: float = 0.90
    deviation_max: float = 0.10
    error_rate_max: float = 0.15
    timestamp_max_age_seconds: float = 300.0  # 5 min for replay freshness


# Mutable singleton — updated by baseline calibration
_active = ThresholdConfig()


def get_thresholds() -> ThresholdConfig:
    return _active


def update_thresholds(**kwargs: float) -> ThresholdConfig:
    global _active
    for k, v in kwargs.items():
        if hasattr(_active, k):
            setattr(_active, k, v)
    return _active

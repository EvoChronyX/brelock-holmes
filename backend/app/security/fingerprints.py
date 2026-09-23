"""Quantum Security Fingerprint — structured statistical record of an experiment."""

from dataclasses import dataclass, asdict


@dataclass
class QuantumSecurityFingerprint:
    fidelity: float
    error_rate: float
    distribution_deviation: float
    expected_distribution: dict[str, float]
    observed_distribution: dict[str, float]
    noise_type: str
    noise_level: float
    shots: int
    session_valid: bool
    replay_detected: bool

    def to_dict(self) -> dict:
        return asdict(self)

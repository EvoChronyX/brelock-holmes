"""Threat detection service — statistical/protocol-based, NO ML.

The detector receives measurement results and session metadata.
It does NOT know the attack label. It examines metrics and protocol
state to determine if the observation is anomalous.
"""

from dataclasses import dataclass

from app.quantum.teleportation import TeleportationResult
from app.security.fingerprints import QuantumSecurityFingerprint
from app.security.thresholds import ThresholdConfig, get_thresholds
from app.security.validators import is_replay


@dataclass
class DetectionOutcome:
    status: str          # NORMAL / THREAT_DETECTED
    attack_type: str     # inferred attack category or "none"
    severity: str        # NORMAL / LOW / MEDIUM / HIGH / CRITICAL
    fidelity: float
    error_rate: float
    distribution_deviation: float
    threshold: float     # primary threshold used
    evidence: list[str]
    fingerprint: QuantumSecurityFingerprint


def detect(
    result: TeleportationResult,
    session_id: str | None = None,
    nonce: str | None = None,
    noise_type: str = "none",
    noise_level: float = 0.0,
    thresholds: ThresholdConfig | None = None,
) -> DetectionOutcome:
    """Run threat detection on a quantum experiment result.

    Detection logic:
    1. Check for replay (session/nonce validation) — protocol-level
    2. Check fidelity, error rate, distribution deviation — quantum-level
    3. Classify severity based on how many/how far indicators deviate
    4. Generate human-readable evidence
    """
    th = thresholds or get_thresholds()
    evidence: list[str] = []
    threat_signals = 0
    severity_score = 0.0

    # --- Replay check (protocol-level, not quantum) ---
    replay_detected = False
    if session_id and nonce:
        replay_detected = is_replay(session_id, nonce)
        if replay_detected:
            evidence.append(f"Replay detected: session {session_id[:8]}… with duplicate nonce")
            threat_signals += 2
            severity_score += 3.0

    # --- Quantum measurement checks ---
    fidelity = result.fidelity
    error_rate = result.error_rate
    deviation = result.deviation

    if fidelity < th.fidelity_min:
        gap = th.fidelity_min - fidelity
        evidence.append(
            f"Fidelity {fidelity:.4f} below threshold {th.fidelity_min:.4f} (gap: {gap:.4f})"
        )
        threat_signals += 1
        severity_score += gap * 10  # Scale gap to severity

    if deviation > th.deviation_max:
        excess = deviation - th.deviation_max
        evidence.append(
            f"Distribution deviation {deviation:.4f} exceeds threshold {th.deviation_max:.4f} (excess: {excess:.4f})"
        )
        threat_signals += 1
        severity_score += excess * 10

    if error_rate > th.error_rate_max:
        excess = error_rate - th.error_rate_max
        evidence.append(
            f"Error rate {error_rate:.4f} exceeds threshold {th.error_rate_max:.4f}"
        )
        threat_signals += 1
        severity_score += excess * 5

    # --- Classify ---
    if threat_signals == 0:
        status = "NORMAL"
        severity = "NORMAL"
        inferred_attack = "none"
    else:
        status = "THREAT_DETECTED"

        # Infer attack type from evidence pattern (heuristic — detector
        # doesn't know the true label, only measurement statistics).
        # These heuristics classify by severity pattern, not ground truth.
        if replay_detected:
            inferred_attack = "replay"
        elif fidelity < 0.5:
            # Massive fidelity collapse → wrong state entirely
            inferred_attack = "forgery"
        elif fidelity < 0.95 and deviation > 0.35:
            # Moderate fidelity + high deviation → likely wrong state prep
            inferred_attack = "impersonation"
        elif deviation > th.deviation_max:
            # Distribution shift without extreme fidelity loss → noise injection
            inferred_attack = "channel_manipulation"
        elif fidelity < th.fidelity_min:
            inferred_attack = "impersonation"
        else:
            inferred_attack = "unknown"

        # Severity from score
        if severity_score < 0.5:
            severity = "LOW"
        elif severity_score < 1.5:
            severity = "MEDIUM"
        elif severity_score < 3.0:
            severity = "HIGH"
        else:
            severity = "CRITICAL"

    fingerprint = QuantumSecurityFingerprint(
        fidelity=fidelity,
        error_rate=error_rate,
        distribution_deviation=deviation,
        expected_distribution=result.expected_distribution,
        observed_distribution=result.observed_distribution,
        noise_type=noise_type,
        noise_level=noise_level,
        shots=result.shots,
        session_valid=not replay_detected,
        replay_detected=replay_detected,
    )

    return DetectionOutcome(
        status=status,
        attack_type=inferred_attack,
        severity=severity,
        fidelity=fidelity,
        error_rate=error_rate,
        distribution_deviation=deviation,
        threshold=th.fidelity_min,
        evidence=evidence,
        fingerprint=fingerprint,
    )

"""Experiment orchestration service — ties quantum, attack, detection together."""

import time
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Experiment, SecurityEvent
from app.quantum.teleportation import run_teleportation
from app.quantum.states import PROTOCOL_DEFAULT_STATE, STATE_PARAMS
from app.services.attack_service import (
    simulate_channel_manipulation,
    simulate_forgery,
    simulate_impersonation,
)
from app.services.detection_service import detect
from app.security.validators import register_session, is_replay
from app.core.logging import logger


async def run_experiment(
    db: AsyncSession,
    name: str = "Untitled Experiment",
    protocol: str = "teleportation_qds",
    shots: int = 1024,
    noise_type: str = "none",
    noise_level: float = 0.0,
    attack_type: str = "normal",
    attack_params: dict | None = None,
    message: str = "Hello Brelock",
    input_state: str = PROTOCOL_DEFAULT_STATE,
) -> Experiment:
    """Run a complete experiment: quantum simulation → detection → DB storage."""
    exp_id = str(uuid.uuid4())
    session_id = str(uuid.uuid4())
    nonce = str(uuid.uuid4())
    start = time.perf_counter()

    # Create DB record
    exp = Experiment(
        id=exp_id,
        name=name,
        protocol=protocol,
        shots=shots,
        noise_type=noise_type,
        noise_level=noise_level,
        attack_type=attack_type,
        attack_params=attack_params,
        status="running",
        session_id=session_id,
        nonce=nonce,
        message=message,
    )
    db.add(exp)
    await db.flush()

    # Log start
    db.add(SecurityEvent(
        experiment_id=exp_id,
        event_type="experiment_started",
        severity="INFO",
        message=f"Experiment {name} started — attack={attack_type}, noise={noise_type}@{noise_level}",
    ))

    try:
        # --- Run quantum simulation based on attack type ---
        if attack_type == "normal":
            qr = run_teleportation(input_state, shots, noise_type, noise_level)
        elif attack_type == "forgery":
            qr = simulate_forgery(shots, noise_type, noise_level)
        elif attack_type == "impersonation":
            qr = simulate_impersonation(shots, noise_type, noise_level)
        elif attack_type == "channel_manipulation":
            atk_noise = (attack_params or {}).get("attack_noise_level", 0.15)
            qr = simulate_channel_manipulation(shots, noise_type, noise_level, atk_noise)
        elif attack_type == "replay":
            # First run a normal experiment, register its session,
            # then simulate replaying the same session_id+nonce
            qr = run_teleportation(input_state, shots, noise_type, noise_level)
            # Register this session as "already seen"
            register_session(session_id, nonce)
        else:
            qr = run_teleportation(input_state, shots, noise_type, noise_level)

        # --- Detection ---
        detection = detect(
            result=qr,
            session_id=session_id,
            nonce=nonce,
            noise_type=noise_type,
            noise_level=noise_level,
        )

        # Register fresh session after detection (so future replays of this session can be caught)
        if attack_type != "replay":
            register_session(session_id, nonce)

        elapsed = round((time.perf_counter() - start) * 1000, 2)

        # Update experiment record
        exp.status = "completed"
        exp.execution_time_ms = elapsed
        exp.circuit_qasm = qr.circuit_qasm
        exp.measurement_counts = qr.raw_counts
        exp.expected_distribution = qr.expected_distribution
        exp.observed_distribution = qr.observed_distribution
        exp.fidelity = qr.fidelity
        exp.error_rate = qr.error_rate
        exp.distribution_deviation = qr.deviation
        exp.detection_status = detection.status
        exp.detected_attack_type = detection.attack_type
        exp.severity = detection.severity
        exp.threshold_used = detection.threshold
        exp.evidence = detection.evidence
        exp.fingerprint = detection.fingerprint.to_dict()

        # Log result
        sev = "WARNING" if detection.status == "THREAT_DETECTED" else "INFO"
        db.add(SecurityEvent(
            experiment_id=exp_id,
            event_type="threat_detected" if detection.status == "THREAT_DETECTED" else "experiment_normal",
            severity=sev,
            message=f"{detection.status}: {detection.attack_type} (severity={detection.severity}, fidelity={detection.fidelity:.4f})",
            metadata_json={"evidence": detection.evidence},
        ))

        logger.info(f"Experiment {exp_id[:8]} completed in {elapsed}ms — {detection.status}")

    except Exception as e:
        exp.status = "failed"
        exp.execution_time_ms = round((time.perf_counter() - start) * 1000, 2)
        db.add(SecurityEvent(
            experiment_id=exp_id,
            event_type="experiment_failed",
            severity="ERROR",
            message=f"Experiment failed: {e}",
        ))
        logger.error(f"Experiment {exp_id[:8]} failed: {e}")

    await db.commit()
    await db.refresh(exp)
    return exp

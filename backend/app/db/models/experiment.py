"""Database models for experiments, attacks, and security events."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), default="Untitled Experiment")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    protocol: Mapped[str] = mapped_column(String(100), default="teleportation_qds")
    num_qubits: Mapped[int] = mapped_column(Integer, default=3)
    shots: Mapped[int] = mapped_column(Integer, default=1024)
    noise_type: Mapped[str] = mapped_column(String(50), default="none")
    noise_level: Mapped[float] = mapped_column(Float, default=0.0)
    attack_type: Mapped[str] = mapped_column(String(50), default="normal")
    attack_params: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ready")  # ready/running/completed/failed
    execution_time_ms: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Quantum results
    circuit_qasm: Mapped[str | None] = mapped_column(Text, nullable=True)
    measurement_counts: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    expected_distribution: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    observed_distribution: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    fidelity: Mapped[float | None] = mapped_column(Float, nullable=True)
    error_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    distribution_deviation: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Detection results
    detection_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    detected_attack_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    severity: Mapped[str | None] = mapped_column(String(20), nullable=True)
    threshold_used: Mapped[float | None] = mapped_column(Float, nullable=True)
    evidence: Mapped[list | None] = mapped_column(JSON, nullable=True)
    fingerprint: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Session metadata (for replay detection)
    session_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    nonce: Mapped[str | None] = mapped_column(String(64), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    experiment_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50))  # experiment_started, threat_detected, etc.
    severity: Mapped[str] = mapped_column(String(20), default="INFO")
    message: Mapped[str] = mapped_column(Text)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

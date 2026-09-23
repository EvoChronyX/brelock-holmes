"""Pydantic schemas for API request/response models."""

from datetime import datetime
from pydantic import BaseModel, Field


# --- Experiment ---

class ExperimentCreate(BaseModel):
    name: str = "Untitled Experiment"
    protocol: str = "teleportation_qds"
    shots: int = Field(default=1024, ge=1, le=65536)
    noise_type: str = Field(default="none", pattern="^(none|bit_flip|phase_flip|depolarizing|amplitude_damping)$")
    noise_level: float = Field(default=0.0, ge=0.0, le=1.0)
    attack_type: str = Field(default="normal", pattern="^(normal|forgery|impersonation|replay|channel_manipulation)$")
    attack_params: dict | None = None
    message: str = "Hello Brelock"
    input_state: str = "signature"  # Default signature state (θ=π/3)


class ExperimentResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    protocol: str
    num_qubits: int
    shots: int
    noise_type: str
    noise_level: float
    attack_type: str
    attack_params: dict | None
    status: str
    execution_time_ms: float | None
    circuit_qasm: str | None
    measurement_counts: dict | None
    expected_distribution: dict | None
    observed_distribution: dict | None
    fidelity: float | None
    error_rate: float | None
    distribution_deviation: float | None
    detection_status: str | None
    detected_attack_type: str | None
    severity: str | None
    threshold_used: float | None
    evidence: list | None
    fingerprint: dict | None
    session_id: str | None
    nonce: str | None
    message: str | None

    model_config = {"from_attributes": True}


class ExperimentListItem(BaseModel):
    id: str
    name: str
    created_at: datetime
    protocol: str
    attack_type: str
    noise_level: float
    status: str
    fidelity: float | None
    detection_status: str | None
    severity: str | None
    execution_time_ms: float | None

    model_config = {"from_attributes": True}


# --- Attack ---

class AttackSimulateRequest(BaseModel):
    attack_type: str = Field(pattern="^(forgery|impersonation|replay|channel_manipulation)$")
    shots: int = Field(default=1024, ge=1, le=65536)
    noise_type: str = "none"
    noise_level: float = Field(default=0.0, ge=0.0, le=1.0)
    attack_params: dict | None = None
    message: str = "Hello Brelock"


# --- Detection ---

class DetectionResult(BaseModel):
    status: str  # NORMAL / THREAT_DETECTED
    attack_type: str | None
    severity: str  # NORMAL / LOW / MEDIUM / HIGH / CRITICAL
    fidelity: float
    error_rate: float
    distribution_deviation: float
    threshold: float
    evidence: list[str]
    fingerprint: dict | None = None


# --- Security Events ---

class SecurityEventResponse(BaseModel):
    id: str
    experiment_id: str | None
    event_type: str
    severity: str
    message: str
    metadata_json: dict | None
    timestamp: datetime

    model_config = {"from_attributes": True}


# --- Analytics ---

class AnalyticsSummary(BaseModel):
    total_experiments: int
    threats_detected: int
    normal_sessions: int
    detection_rate: float
    average_fidelity: float
    attack_distribution: dict[str, int]
    severity_distribution: dict[str, int]
    recent_experiments: list[ExperimentListItem]


# --- Baseline ---

class BaselineRequest(BaseModel):
    shots: int = 1024
    noise_levels: list[float] = [0.0, 0.01, 0.05, 0.1]
    num_runs: int = 10


class BaselineResponse(BaseModel):
    calibrated: bool
    noise_levels: list[float]
    fidelity_mean: dict[str, float]
    fidelity_std: dict[str, float]
    deviation_mean: dict[str, float]
    deviation_std: dict[str, float]
    recommended_thresholds: dict[str, float]


# --- Protocol ---

class ProtocolInfo(BaseModel):
    id: str
    name: str
    description: str
    stages: list[str]
    num_qubits: int

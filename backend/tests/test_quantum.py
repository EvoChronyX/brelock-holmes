"""Quantum teleportation and metrics tests."""

import pytest
import numpy as np

from app.quantum.states import STATE_PARAMS, PROTOCOL_DEFAULT_STATE, expected_probabilities
from app.quantum.measurements import (
    classical_fidelity,
    distribution_deviation,
    marginal_qubit,
    total_variation_distance,
)
from app.quantum.teleportation import run_teleportation
from app.services.attack_service import (
    simulate_forgery,
    simulate_impersonation,
    simulate_channel_manipulation,
)
from app.services.detection_service import detect
from app.security.validators import register_session, is_replay, clear_registry


def test_expected_probabilities_normalized():
    """Verify expected probabilities always sum to 1."""
    for state, theta in STATE_PARAMS.items():
        probs = expected_probabilities(theta)
        assert abs(sum(probs.values()) - 1.0) < 1e-9
        assert probs["0"] >= 0.0
        assert probs["1"] >= 0.0


def test_noiseless_teleportation_high_fidelity():
    """Noiseless teleportation must achieve fidelity > 0.99 with sufficient shots."""
    result = run_teleportation(PROTOCOL_DEFAULT_STATE, shots=4096, seed=42)
    assert result.fidelity > 0.99
    assert result.error_rate < 0.01
    assert result.deviation < 0.05


def test_classical_fidelity_identical():
    """Identical distributions must have fidelity = 1.0."""
    p = {"0": 0.75, "1": 0.25}
    assert abs(classical_fidelity(p, p) - 1.0) < 1e-6


def test_classical_fidelity_orthogonal():
    """Orthogonal distributions must have fidelity = 0.0."""
    p = {"0": 1.0, "1": 0.0}
    q = {"0": 0.0, "1": 1.0}
    assert abs(classical_fidelity(p, q) - 0.0) < 1e-6


def test_total_variation_distance_bounds():
    """TVD must be in [0, 1]."""
    p = {"0": 0.7, "1": 0.3}
    q = {"0": 0.2, "1": 0.8}
    tvd = total_variation_distance(p, q)
    assert 0.0 <= tvd <= 1.0
    assert abs(tvd - 0.5) < 1e-6


def test_forgery_attack_detected():
    """State forgery must produce low fidelity and be flagged as threat."""
    result = simulate_forgery(shots=4096, seed=42)
    detection = detect(result, "s_forgery", "n_forgery")
    assert detection.status == "THREAT_DETECTED"
    assert detection.attack_type == "forgery"
    assert detection.fidelity < 0.5


def test_impersonation_attack_detected():
    """Impersonation with wrong angle must be flagged as threat."""
    result = simulate_impersonation(shots=4096, seed=42)
    detection = detect(result, "s_imp", "n_imp")
    assert detection.status == "THREAT_DETECTED"
    assert detection.fidelity < 0.98


def test_channel_manipulation_detected():
    """Channel noise injection must be flagged as threat."""
    result = simulate_channel_manipulation(shots=4096, attack_noise_level=0.25, seed=42)
    detection = detect(result, "s_chan", "n_chan")
    assert detection.status == "THREAT_DETECTED"
    assert detection.attack_type == "channel_manipulation"


def test_replay_detection():
    """Reusing session_id and nonce must trigger replay detection."""
    clear_registry()
    session = "test-session-123"
    nonce = "test-nonce-456"

    # First use: valid
    assert not is_replay(session, nonce)
    register_session(session, nonce)

    # Second use: replay
    assert is_replay(session, nonce)


def test_detector_does_not_use_attack_labels():
    """Detector outcome must be purely derived from measurement metrics."""
    result_clean = run_teleportation(PROTOCOL_DEFAULT_STATE, shots=4096, seed=42)
    detection_clean = detect(result_clean, "s_clean", "n_clean")
    assert detection_clean.status == "NORMAL"
    assert detection_clean.attack_type == "none"
    assert len(detection_clean.evidence) == 0

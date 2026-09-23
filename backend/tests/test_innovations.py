"""Tests for the 5 Novelty & Innovation Quantum Security modules."""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.quantum.tensor_network import verify_signature_tensor_network
from app.quantum.tomography import run_state_tomography
from app.quantum.dynamical_decoupling import run_dynamical_decoupling_benchmark
from app.quantum.arbiter import resolve_arbiter_dispute
from app.security.q_ledger import get_quantum_ledger


@pytest.fixture
def client():
    return TestClient(app)


def test_tensor_network_verification_clean():
    res = verify_signature_tensor_network(theta=np.pi / 3.0, pert_theta=0.0)
    assert res.fidelity >= 0.99
    assert res.deviation <= 0.01
    assert res.is_valid is True
    assert res.status == "VERIFIED_VALID"
    assert res.entanglement_entropy >= 0.0


def test_tensor_network_verification_tampered():
    # Perturb angle by pi/6
    res = verify_signature_tensor_network(theta=np.pi / 3.0, pert_theta=np.pi / 6.0)
    assert res.fidelity < 0.95
    assert res.deviation > 0.10
    assert res.is_valid is False


def test_quantum_state_tomography():
    res = run_state_tomography(shots_per_basis=1024, phase_tamper_rad=0.0)
    assert res.fidelity_to_target >= 0.98
    assert res.purity >= 0.95
    assert res.tampering_detected is False
    assert "X" in res.basis_counts
    assert "Y" in res.basis_counts
    assert "Z" in res.basis_counts


def test_quantum_state_tomography_phase_tampering():
    # Coherent phase rotation tampering pi/3
    res = run_state_tomography(shots_per_basis=1024, phase_tamper_rad=np.pi / 3.0)
    assert res.tampering_detected is True
    assert len(res.tampering_evidence) > 0


def test_dynamical_decoupling_improvement():
    res = run_dynamical_decoupling_benchmark(sequence_type="XY4", noise_level=0.08, shots=1024)
    assert res.decoupled_fidelity >= res.raw_fidelity
    assert res.t2_protection_factor > 1.0


def test_arbiter_dispute_resolution():
    res_legit = resolve_arbiter_dispute(scenario="LEGITIMATE", shots=512)
    assert res_legit.arbiter_verdict == "SIGNATURE_VALID_GENUINE"
    assert res_legit.non_repudiation_guarantee is True

    res_repud = resolve_arbiter_dispute(scenario="ALICE_REPUDIATION", shots=512)
    assert res_repud.arbiter_verdict == "ALICE_REPUDIATION_DISPROVEN"


def test_q_ledger_recording_and_integrity():
    ledger = get_quantum_ledger()
    block = ledger.record_entry(
        session_id="TEST-SESS-99",
        action="TELEPORT_TEST",
        fidelity=0.995,
        deviation_tvd=0.005,
        threat_status="NORMAL",
    )
    assert block.index > 0
    assert len(block.block_hash) == 128  # SHA3-512 hex length

    integrity = ledger.verify_ledger_integrity()
    assert integrity["chain_valid"] is True


def test_innovations_api_endpoints(client):
    # 1. Tensor verify
    r1 = client.post("/api/innovations/tensor-verify", json={"theta": 1.04719755, "pert_theta": 0.0})
    assert r1.status_code == 200
    assert r1.json()["is_valid"] is True

    # 2. Tomography
    r2 = client.post("/api/innovations/state-tomography", json={"theta": 1.04719755, "shots_per_basis": 512})
    assert r2.status_code == 200
    assert "bloch_vector" in r2.json()

    # 3. Decoupling
    r3 = client.post("/api/innovations/dynamical-decoupling", json={"sequence_type": "XY4", "noise_level": 0.05, "shots": 512})
    assert r3.status_code == 200
    assert "decoupled_fidelity" in r3.json()

    # 4. Arbiter
    r4 = client.post("/api/innovations/arbiter-dispute", json={"scenario": "LEGITIMATE", "shots": 512})
    assert r4.status_code == 200
    assert "arbiter_verdict" in r4.json()

    # 5. Ledger
    r5 = client.get("/api/innovations/q-ledger")
    assert r5.status_code == 200
    assert len(r5.json()["blocks"]) > 0

    r6 = client.post("/api/innovations/q-ledger/verify")
    assert r6.status_code == 200
    assert r6.json()["chain_valid"] is True

"""FastAPI REST API routes for the 5 Novelty & Innovation Quantum Security modules.

1. Quantum-Inspired Tensor Network Verification (QITN-Verify)
2. Multi-Basis Quantum State Tomography (QST-Bloch)
3. Dynamic Adaptive Noise Decoupling (DAND)
4. Tri-Party Non-Repudiation Entangled Arbiter (QDS-Arbiter)
5. Quantum Anomaly Fingerprint & Post-Quantum Hash Ledger (Q-Ledger)
"""

from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.quantum.tensor_network import verify_signature_tensor_network
from app.quantum.tomography import run_state_tomography
from app.quantum.dynamical_decoupling import run_dynamical_decoupling_benchmark
from app.quantum.arbiter import resolve_arbiter_dispute
from app.security.q_ledger import get_quantum_ledger

router = APIRouter(prefix="/innovations", tags=["Innovations & Novelties"])


# --- Schemas ---

class TensorVerifyRequest(BaseModel):
    theta: float = Field(1.04719755, description="Signature state angle theta (radians, default pi/3)")
    pert_theta: float = Field(0.0, description="Adversary angular perturbation (radians)")
    noise_depol: float = Field(0.0, description="Channel depolarizing noise probability")
    bond_dim_max: int = Field(4, ge=1, le=16, description="Max MPS bond dimension")


class StateTomographyRequest(BaseModel):
    theta: float = Field(1.04719755, description="Signature state angle theta (radians)")
    shots_per_basis: int = Field(2048, ge=256, le=8192)
    noise_type: str = Field("none", description="'none', 'depolarizing', 'phase_damping'")
    noise_level: float = Field(0.0, ge=0.0, le=0.5)
    phase_tamper_rad: float = Field(0.0, description="Coherent phase tampering angle (radians)")


class DecouplingRequest(BaseModel):
    sequence_type: str = Field("XY4", description="'NONE', 'CPMG', 'XY4', 'UDD'")
    noise_level: float = Field(0.08, ge=0.0, le=0.3)
    shots: int = Field(2048, ge=512, le=8192)


class ArbiterDisputeRequest(BaseModel):
    scenario: str = Field("LEGITIMATE", description="'LEGITIMATE', 'ALICE_REPUDIATION', 'BOB_FORGERY'")
    noise_level: float = Field(0.01, ge=0.0, le=0.1)
    shots: int = Field(1024, ge=256, le=4096)


# --- Endpoints ---

@router.post("/tensor-verify")
def api_tensor_network_verify(req: TensorVerifyRequest) -> dict[str, Any]:
    """Innovation 1: Quantum-Inspired Tensor Network Verification in O(chi^3) classical time."""
    try:
        res = verify_signature_tensor_network(
            theta=req.theta,
            pert_theta=req.pert_theta,
            noise_depol=req.noise_depol,
            bond_dim_max=req.bond_dim_max,
        )
        return {
            "fidelity": res.fidelity,
            "deviation_tvd": res.deviation,
            "entanglement_entropy": res.entanglement_entropy,
            "purity": res.purity,
            "bond_dimension": res.bond_dimension,
            "computation_time_ms": res.computation_time_ms,
            "is_valid": res.is_valid,
            "status": res.status,
            "probabilities": res.probabilities,
            "singular_values": res.singular_values,
            "tensor_node_count": res.tensor_node_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/state-tomography")
def api_state_tomography(req: StateTomographyRequest) -> dict[str, Any]:
    """Innovation 2: Multi-basis quantum state tomography & 3D Bloch sphere vector reconstruction."""
    try:
        from app.quantum.states import QuantumSignatureState
        state = QuantumSignatureState(theta=req.theta)
        res = run_state_tomography(
            state=state,
            shots_per_basis=req.shots_per_basis,
            noise_type=req.noise_type,
            noise_level=req.noise_level,
            phase_tamper_rad=req.phase_tamper_rad,
        )
        return {
            "bloch_vector": res.bloch_vector,
            "density_matrix": res.density_matrix,
            "purity": res.purity,
            "von_neumann_entropy": res.von_neumann_entropy,
            "fidelity_to_target": res.fidelity_to_target,
            "basis_counts": res.basis_counts,
            "phase_offset_rad": res.phase_offset_rad,
            "is_pure_state": res.is_pure_state,
            "tampering_detected": res.tampering_detected,
            "tampering_evidence": res.tampering_evidence,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dynamical-decoupling")
def api_dynamical_decoupling(req: DecouplingRequest) -> dict[str, Any]:
    """Innovation 3: Active dynamical decoupling (XY4/CPMG) pulse synthesizer."""
    try:
        res = run_dynamical_decoupling_benchmark(
            sequence_type=req.sequence_type,
            noise_level=req.noise_level,
            shots=req.shots,
        )
        return {
            "sequence_type": res.sequence_type,
            "raw_fidelity": res.raw_fidelity,
            "decoupled_fidelity": res.decoupled_fidelity,
            "fidelity_improvement_pct": res.fidelity_improvement_pct,
            "raw_counts": res.raw_counts,
            "decoupled_counts": res.decoupled_counts,
            "noise_level": res.noise_level,
            "shots": res.shots,
            "circuit_depth_increase": res.circuit_depth_increase,
            "t2_protection_factor": res.t2_protection_factor,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/arbiter-dispute")
def api_arbiter_dispute(req: ArbiterDisputeRequest) -> dict[str, Any]:
    """Innovation 4: Tri-party GHZ entangled non-repudiation arbiter protocol."""
    try:
        res = resolve_arbiter_dispute(
            scenario=req.scenario,
            noise_level=req.noise_level,
            shots=req.shots,
        )
        return {
            "dispute_id": res.dispute_id,
            "scenario": res.scenario,
            "arbiter_verdict": res.arbiter_verdict,
            "confidence_pct": res.confidence_pct,
            "ghz_parity_fidelity": res.ghz_parity_fidelity,
            "stabilizer_expectation": res.stabilizer_expectation,
            "alice_syndrome": res.alice_syndrome,
            "bob_syndrome": res.bob_syndrome,
            "charlie_syndrome": res.charlie_syndrome,
            "non_repudiation_guarantee": res.non_repudiation_guarantee,
            "evidence": res.evidence,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/q-ledger")
def api_get_q_ledger(limit: int = 25) -> dict[str, Any]:
    """Innovation 5: Quantum audit ledger block history."""
    ledger = get_quantum_ledger()
    blocks = ledger.get_blocks(limit=limit)
    return {
        "blocks": [
            {
                "index": b.index,
                "timestamp_ns": b.timestamp_ns,
                "session_id": b.session_id,
                "action": b.action,
                "quantum_fingerprint": b.quantum_fingerprint,
                "fidelity": b.fidelity,
                "deviation_tvd": b.deviation_tvd,
                "threat_status": b.threat_status,
                "previous_hash": b.previous_hash,
                "block_hash": b.block_hash,
                "metadata": b.metadata,
            }
            for b in blocks
        ]
    }


@router.post("/q-ledger/verify")
def api_verify_q_ledger() -> dict[str, Any]:
    """Innovation 5: Validate post-quantum SHA3-512 cryptographic ledger chain integrity."""
    ledger = get_quantum_ledger()
    return ledger.verify_ledger_integrity()

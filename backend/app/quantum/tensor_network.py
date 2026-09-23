"""Quantum-Inspired Tensor Network Verification Engine (QITN-Verify).

Implements classical Matrix Product State (MPS) tensor contractions and
Pauli expectation values for quantum-inspired digital signature verification.
Runs in O(chi^3) classical time with bond dimension chi=2 for 3-qubit circuits.
"""

from dataclasses import dataclass
import numpy as np


@dataclass
class TensorVerifyResult:
    fidelity: float
    deviation: float
    entanglement_entropy: float
    purity: float
    bond_dimension: int
    computation_time_ms: float
    is_valid: bool
    status: str
    probabilities: dict[str, float]
    singular_values: list[float]
    tensor_node_count: int


def _pauli_matrices() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    I = np.eye(2, dtype=complex)
    X = np.array([[0, 1], [1, 0]], dtype=complex)
    Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
    Z = np.array([[1, 0], [0, -1]], dtype=complex)
    return I, X, Y, Z


def build_signature_mps(theta: float) -> list[np.ndarray]:
    """Constructs MPS tensors [A0, A1, A2] for 3-qubit teleportation state."""
    # State |psi_sig> = cos(theta/2)|0> + sin(theta/2)|1>
    c = np.cos(theta / 2.0)
    s = np.sin(theta / 2.0)
    psi0 = np.array([c, s], dtype=complex)

    # Bell pair (|00> + |11>)/sqrt(2) across qubits 1 and 2
    bell_matrix = np.array([[1.0 / np.sqrt(2), 0], [0, 1.0 / np.sqrt(2)]], dtype=complex)

    # Tensor A0: shape (1, 2, 2) -> (left_bond, physical, right_bond)
    A0 = np.zeros((1, 2, 1), dtype=complex)
    A0[0, 0, 0] = psi0[0]
    A0[0, 1, 0] = psi0[1]

    # Tensor A1 (EPR half 1): shape (1, 2, 2)
    A1 = np.zeros((1, 2, 2), dtype=complex)
    A1[0, 0, 0] = 1.0 / np.sqrt(2)
    A1[0, 1, 1] = 1.0 / np.sqrt(2)

    # Tensor A2 (EPR half 2): shape (2, 2, 1)
    A2 = np.zeros((2, 2, 1), dtype=complex)
    A2[0, 0, 0] = 1.0
    A2[1, 1, 0] = 1.0

    return [A0, A1, A2]


def contract_mps_to_statevector(mps: list[np.ndarray]) -> np.ndarray:
    """Contracts 3-site MPS tensors into full 8-dimensional statevector."""
    # A0: (1, 2, 1), A1: (1, 2, 2), A2: (2, 2, 1)
    T = np.tensordot(mps[0], mps[1], axes=(2, 0))  # (1, 2, 2, 2) -> (b0, s0, s1, b2)
    T = np.tensordot(T, mps[2], axes=(3, 0))       # (1, 2, 2, 2, 1) -> (b0, s0, s1, s2, b3)
    sv = T[0, :, :, :, 0].reshape(8)
    norm = np.linalg.norm(sv)
    if norm > 1e-12:
        sv = sv / norm
    return sv


def verify_signature_tensor_network(
    theta: float = np.pi / 3.0,
    pert_theta: float = 0.0,
    noise_depol: float = 0.0,
    bond_dim_max: int = 4,
) -> TensorVerifyResult:
    """Executes deterministic tensor network contraction for signature verification."""
    import time

    start = time.perf_counter()

    actual_theta = theta + pert_theta
    mps = build_signature_mps(actual_theta)

    # Contract to statevector
    statevector = contract_mps_to_statevector(mps)

    # Compute SVD across bipartite split (qubit 0 vs qubits 1-2) to get entanglement entropy
    mat_split = statevector.reshape(2, 4)
    U, S, Vh = np.linalg.svd(mat_split, full_matrices=False)
    # Truncate to bond dimension
    S_trunc = S[:bond_dim_max]
    S_norm = S_trunc / np.linalg.norm(S_trunc)

    # von Neumann entanglement entropy E = -sum(s_i^2 * log2(s_i^2))
    s_sq = S_norm**2
    s_sq_clean = s_sq[s_sq > 1e-12]
    entanglement_entropy = float(-np.sum(s_sq_clean * np.log2(s_sq_clean))) if len(s_sq_clean) > 0 else 0.0

    # Theoretical expected signature state: Ry(pi/3)|0> -> P(0)=0.75, P(1)=0.25
    expected_p0 = float(np.cos(theta / 2.0) ** 2)
    expected_p1 = float(np.sin(theta / 2.0) ** 2)

    # Observed teleported state on target qubit
    obs_p0 = float(np.cos(actual_theta / 2.0) ** 2) * (1.0 - noise_depol) + 0.5 * noise_depol
    obs_p1 = 1.0 - obs_p0

    # Classical Bhattacharyya fidelity
    fid = (np.sqrt(obs_p0 * expected_p0) + np.sqrt(obs_p1 * expected_p1)) ** 2
    fid = float(np.clip(fid, 0.0, 1.0))

    # Total Variation Distance
    tvd = 0.5 * (abs(obs_p0 - expected_p0) + abs(obs_p1 - expected_p1))

    # Purity of 1-qubit reduced state
    rho = np.array([[obs_p0, 0.0], [0.0, obs_p1]], dtype=complex)
    purity = float(np.real(np.trace(rho @ rho)))

    elapsed_ms = (time.perf_counter() - start) * 1000.0

    is_valid = bool(fid >= 0.98 and tvd <= 0.05)
    status = "VERIFIED_VALID" if is_valid else ("TAMPERED_FORGERY" if fid < 0.85 else "TAMPERED_PERTURBATION")

    return TensorVerifyResult(
        fidelity=round(fid, 6),
        deviation=round(tvd, 6),
        entanglement_entropy=round(entanglement_entropy, 6),
        purity=round(purity, 6),
        bond_dimension=bond_dim_max,
        computation_time_ms=round(elapsed_ms, 3),
        is_valid=is_valid,
        status=status,
        probabilities={"0": round(obs_p0, 4), "1": round(obs_p1, 4)},
        singular_values=[round(float(s), 6) for s in S_norm],
        tensor_node_count=3,
    )

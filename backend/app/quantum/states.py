"""Quantum state preparation utilities."""

from dataclasses import dataclass
from qiskit import QuantumCircuit
import numpy as np

# Named input states and their preparation angles (ry rotation)
STATE_PARAMS: dict[str, float] = {
    "zero": 0.0,            # |0⟩
    "one": np.pi,            # |1⟩
    "plus": np.pi / 2,      # |+⟩
    "minus": -np.pi / 2,    # |−⟩ (global phase aside)
    # Signature state: θ=π/3 → P(0)=0.75, P(1)=0.25.
    # Unlike |+⟩ (maximally mixed in Z-basis, invisible to depolarizing noise),
    # this has a non-trivial distribution so channel noise is clearly detectable.
    "signature": np.pi / 3,
}

# Default state for the QDS protocol — must NOT be maximally mixed in
# the measurement basis, otherwise depolarizing channel noise is undetectable.
PROTOCOL_DEFAULT_STATE = "signature"


@dataclass
class QuantumSignatureState:
    name: str = "signature"
    theta: float = np.pi / 3.0

    @property
    def expected_probabilities(self) -> dict[str, float]:
        return expected_probabilities(self.theta)


def prepare_state(qc: QuantumCircuit, qubit: int, state: str = "plus") -> float:
    """Apply Ry rotation to prepare a named state. Returns theta used."""
    theta = STATE_PARAMS.get(state, np.pi / 2)
    if theta != 0.0:
        qc.ry(theta, qubit)
    return theta


def expected_probabilities(theta: float) -> dict[str, float]:
    """Ideal measurement probabilities for a state prepared with Ry(theta).

    After Ry(theta)|0⟩ the state is cos(θ/2)|0⟩ + sin(θ/2)|1⟩.
    P(0) = cos²(θ/2), P(1) = sin²(θ/2).
    """
    p0 = np.cos(theta / 2) ** 2
    p1 = np.sin(theta / 2) ** 2
    return {"0": float(p0), "1": float(p1)}

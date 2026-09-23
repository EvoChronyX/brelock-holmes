"""Teleportation runner — executes quantum circuits on Aer simulator."""

from dataclasses import dataclass

from qiskit_aer import AerSimulator

from app.quantum.circuits import create_teleportation_circuit
from app.quantum.measurements import (
    classical_fidelity,
    distribution_deviation,
    marginal_qubit,
)
from app.quantum.noise import create_noise_model
from app.quantum.states import expected_probabilities


@dataclass
class TeleportationResult:
    circuit_qasm: str
    raw_counts: dict[str, int]
    expected_distribution: dict[str, float]
    observed_distribution: dict[str, float]
    fidelity: float
    error_rate: float
    deviation: float
    theta: float  # preparation angle — enables reproducibility
    shots: int


def run_teleportation(
    input_state: str = "plus",
    shots: int = 1024,
    noise_type: str = "none",
    noise_level: float = 0.0,
    seed: int | None = None,
) -> TeleportationResult:
    """Execute teleportation circuit and return measurement statistics.

    The recovered qubit (q2) should reproduce the input state's measurement
    distribution in the computational basis.

    We extract the marginal distribution of q2 (bit index 2) and compare it
    against the ideal probabilities for the prepared state.
    """
    qc, theta = create_teleportation_circuit(input_state)

    # Build simulator with optional noise
    noise_model = create_noise_model(noise_type, noise_level)
    sim = AerSimulator(noise_model=noise_model)

    # Run
    job = sim.run(qc, shots=shots, seed_simulator=seed)
    result = job.result()
    counts = result.get_counts(qc)

    # Marginal distribution for the recovered qubit (q2 = bit index 2, total 3 qubits)
    observed = marginal_qubit(counts, qubit_index=2, total_qubits=3)
    expected = expected_probabilities(theta)

    fidelity = classical_fidelity(expected, observed)
    deviation = distribution_deviation(expected, observed)
    error_rate = 1.0 - fidelity

    return TeleportationResult(
        circuit_qasm=qc.qasm() if hasattr(qc, "qasm") else str(qc),
        raw_counts=counts,
        expected_distribution=expected,
        observed_distribution=observed,
        fidelity=round(fidelity, 6),
        error_rate=round(error_rate, 6),
        deviation=round(deviation, 6),
        theta=theta,
        shots=shots,
    )

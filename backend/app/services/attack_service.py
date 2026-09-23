"""Attack simulation service.

Each attack modifies the quantum experiment in a specific, documented way.
The detector does NOT know which attack was applied — it only sees measurements.
"""

import numpy as np

from app.quantum.teleportation import TeleportationResult, run_teleportation
from app.quantum.states import PROTOCOL_DEFAULT_STATE, STATE_PARAMS


def simulate_forgery(
    shots: int = 1024,
    noise_type: str = "none",
    noise_level: float = 0.0,
    seed: int | None = None,
) -> TeleportationResult:
    """Forgery: attacker uses a WRONG input state.

    Model: The attacker doesn't know the legitimate signer's state.
    They prepare |1⟩ instead of the legitimate signature state,
    producing a different measurement distribution the verifier detects.
    """
    from app.quantum.measurements import classical_fidelity, distribution_deviation
    from app.quantum.states import expected_probabilities

    # Attacker picks a different state than the legitimate signer's
    forged_state = "one"  # Clearly wrong
    qr = run_teleportation(
        input_state=forged_state,
        shots=shots,
        noise_type=noise_type,
        noise_level=noise_level,
        seed=seed,
    )
    # Recalculate metrics against what the VERIFIER expects (legitimate state)
    legit_theta = STATE_PARAMS[PROTOCOL_DEFAULT_STATE]
    expected = expected_probabilities(legit_theta)
    fid = classical_fidelity(expected, qr.observed_distribution)
    dev = distribution_deviation(expected, qr.observed_distribution)
    return TeleportationResult(
        circuit_qasm=qr.circuit_qasm,
        raw_counts=qr.raw_counts,
        expected_distribution=expected,
        observed_distribution=qr.observed_distribution,
        fidelity=round(fid, 6),
        error_rate=round(1.0 - fid, 6),
        deviation=round(dev, 6),
        theta=qr.theta,
        shots=qr.shots,
    )


def simulate_impersonation(
    shots: int = 1024,
    noise_type: str = "none",
    noise_level: float = 0.0,
    seed: int | None = None,
) -> TeleportationResult:
    """Impersonation: attacker tries to mimic the signer but has imperfect knowledge.

    Model: The attacker knows the protocol but introduces subtle errors
    in state preparation — a slightly off rotation angle.

    We run teleportation with a custom rotation close to but not exactly
    the legitimate signature state. This produces a measurably different distribution.
    """
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    from app.quantum.noise import create_noise_model
    from app.quantum.measurements import marginal_qubit, classical_fidelity, distribution_deviation
    from app.quantum.states import expected_probabilities

    # Legitimate state angle
    legit_theta = STATE_PARAMS[PROTOCOL_DEFAULT_STATE]
    # Impersonator uses θ + offset (imperfect knowledge)
    offset = np.pi / 6  # 30° off — significant but not obvious
    theta_impersonator = legit_theta + offset

    qc = QuantumCircuit(3, 3, name="impersonation_qds")
    qc.ry(theta_impersonator, 0)  # Wrong angle
    qc.barrier()
    qc.h(1)
    qc.cx(1, 2)
    qc.barrier()
    qc.cx(0, 1)
    qc.h(0)
    qc.measure(0, 0)
    qc.measure(1, 1)
    qc.barrier()
    with qc.if_test((qc.clbits[1], 1)):
        qc.x(2)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(2)
    qc.barrier()
    qc.measure(2, 2)

    nm = create_noise_model(noise_type, noise_level)
    sim = AerSimulator(noise_model=nm)
    job = sim.run(qc, shots=shots, seed_simulator=seed)
    counts = job.result().get_counts(qc)

    observed = marginal_qubit(counts, 2, 3)
    # Expected is what the VERIFIER expects (legitimate signature state)
    expected = expected_probabilities(legit_theta)
    fid = classical_fidelity(expected, observed)
    dev = distribution_deviation(expected, observed)

    return TeleportationResult(
        circuit_qasm=str(qc),
        raw_counts=counts,
        expected_distribution=expected,
        observed_distribution=observed,
        fidelity=round(fid, 6),
        error_rate=round(1.0 - fid, 6),
        deviation=round(dev, 6),
        theta=theta_impersonator,
        shots=shots,
    )


def simulate_channel_manipulation(
    shots: int = 1024,
    noise_type: str = "none",
    noise_level: float = 0.0,
    attack_noise_level: float = 0.15,
    seed: int | None = None,
) -> TeleportationResult:
    """Channel manipulation: attacker injects extra noise into the quantum channel.

    Model: Eve intercepts the quantum channel between Alice and Bob
    and introduces additional depolarizing noise on top of whatever
    baseline noise exists. This disturbance is measurable.
    """
    # Combine baseline noise with attack noise
    combined_level = min(noise_level + attack_noise_level, 1.0)
    effective_noise = "depolarizing" if noise_type == "none" else noise_type

    return run_teleportation(
        input_state=PROTOCOL_DEFAULT_STATE,
        shots=shots,
        noise_type=effective_noise,
        noise_level=combined_level,
        seed=seed,
    )

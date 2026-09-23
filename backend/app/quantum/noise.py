"""Noise model construction for Qiskit Aer."""

from qiskit_aer.noise import NoiseModel, depolarizing_error, pauli_error, amplitude_damping_error


def create_noise_model(noise_type: str, noise_level: float) -> NoiseModel | None:
    """Build a Qiskit Aer NoiseModel.

    noise_type: none | bit_flip | phase_flip | depolarizing | amplitude_damping
    noise_level: probability parameter in [0, 1].
    """
    if noise_type == "none" or noise_level <= 0:
        return None

    model = NoiseModel()

    if noise_type == "depolarizing":
        err_1q = depolarizing_error(noise_level, 1)
        err_2q = depolarizing_error(noise_level, 2)
    elif noise_type == "bit_flip":
        err_1q = pauli_error([("X", noise_level), ("I", 1 - noise_level)])
        err_2q = pauli_error([("XX", noise_level), ("II", 1 - noise_level)])
    elif noise_type == "phase_flip":
        err_1q = pauli_error([("Z", noise_level), ("I", 1 - noise_level)])
        err_2q = pauli_error([("ZZ", noise_level), ("II", 1 - noise_level)])
    elif noise_type == "amplitude_damping":
        err_1q = amplitude_damping_error(noise_level)
        # amplitude_damping doesn't have a direct 2q version; compose two single-qubit
        err_2q = err_1q.tensor(err_1q)
    else:
        return None

    # Apply to all single-qubit and two-qubit basis gates
    single_gates = ["u1", "u2", "u3", "x", "y", "z", "h", "s", "t", "ry", "rx", "rz", "id"]
    two_gates = ["cx", "cz", "swap"]
    for g in single_gates:
        model.add_all_qubit_quantum_error(err_1q, g)
    for g in two_gates:
        model.add_all_qubit_quantum_error(err_2q, g)

    return model

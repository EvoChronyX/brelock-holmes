"""Quantum measurement analysis utilities."""

import math


def counts_to_distribution(counts: dict[str, int]) -> dict[str, float]:
    """Convert raw counts to probability distribution."""
    total = sum(counts.values())
    if total == 0:
        return {}
    return {k: v / total for k, v in counts.items()}


def marginal_qubit(counts: dict[str, int], qubit_index: int, total_qubits: int) -> dict[str, float]:
    """Extract marginal distribution for a single qubit from multi-qubit counts.

    Qiskit bit ordering: rightmost bit is qubit 0.
    """
    p = {"0": 0.0, "1": 0.0}
    total = sum(counts.values())
    if total == 0:
        return p
    for bitstring, count in counts.items():
        padded = bitstring.zfill(total_qubits)
        # Qiskit: rightmost = qubit 0, so index from the right
        bit = padded[-(qubit_index + 1)]
        p[bit] += count / total
    return p


def classical_fidelity(p: dict[str, float], q: dict[str, float]) -> float:
    """Bhattacharyya coefficient (classical fidelity) F = (Σ√(p_i·q_i))²."""
    keys = set(p) | set(q)
    bc = sum(math.sqrt(p.get(k, 0.0) * q.get(k, 0.0)) for k in keys)
    return bc ** 2


def total_variation_distance(p: dict[str, float], q: dict[str, float]) -> float:
    """TVD = ½ Σ |p_i − q_i|."""
    keys = set(p) | set(q)
    return 0.5 * sum(abs(p.get(k, 0.0) - q.get(k, 0.0)) for k in keys)


def distribution_deviation(p: dict[str, float], q: dict[str, float]) -> float:
    """Simple absolute deviation Σ|p_i − q_i|."""
    keys = set(p) | set(q)
    return sum(abs(p.get(k, 0.0) - q.get(k, 0.0)) for k in keys)

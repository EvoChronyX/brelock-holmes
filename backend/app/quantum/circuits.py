"""Quantum circuit construction for teleportation-based QDS."""

from qiskit import QuantumCircuit

from app.quantum.states import prepare_state


def create_teleportation_circuit(input_state: str = "plus") -> tuple[QuantumCircuit, float]:
    """Build a 3-qubit teleportation circuit.

    q0: message qubit (prepared in input_state)
    q1: Alice's half of Bell pair
    q2: Bob's half of Bell pair (receives teleported state)

    Classical bits:
      c0: Bell measurement result of q0
      c1: Bell measurement result of q1
      c2: final measurement of recovered qubit q2

    Because Qiskit Aer's statevector/qasm simulator handles classical
    conditioning (c_if) on the QASM backend, we build the circuit with
    mid-circuit measurements and classically-conditioned Pauli corrections.

    Returns (circuit, theta) where theta is the Ry angle used to prepare q0.
    """
    qc = QuantumCircuit(3, 3, name="teleportation_qds")

    # Stage 1: Prepare message qubit in desired state
    theta = prepare_state(qc, 0, input_state)
    qc.barrier(label="state_prep")

    # Stage 2: Create Bell pair |Φ+⟩ between q1 and q2
    qc.h(1)
    qc.cx(1, 2)
    qc.barrier(label="bell_pair")

    # Stage 3-4: Bell measurement on q0, q1 (Alice's side)
    qc.cx(0, 1)
    qc.h(0)
    qc.measure(0, 0)  # c0
    qc.measure(1, 1)  # c1
    qc.barrier(label="bell_measure")

    # Stage 5: Classical corrections on q2 (Bob's side)
    # If c1 == 1 → apply X; if c0 == 1 → apply Z
    with qc.if_test((qc.clbits[1], 1)):
        qc.x(2)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(2)
    qc.barrier(label="correction")

    # Stage 6: Measure recovered qubit
    qc.measure(2, 2)

    return qc, theta

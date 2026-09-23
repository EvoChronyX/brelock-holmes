# Quantum Threat Model & Adversary Taxonomy

## 1. Scope & System Architecture

This threat model evaluates adversarial actions against a three-party Quantum Digital Signature (QDS) architecture operating over quantum and authenticated classical communication channels:

```
+---------------+           Quantum EPR Channel           +---------------+
|  Alice        |<=======================================>|  Bob          |
|  (Signer)     |-----------+                   +---------|  (Recipient)  |
+---------------+           |                   |         +---------------+
        |                   v                   v                 |
        |           +-----------------------------------+         |
        |           | Eve (Adversary / Channel Intercept)|        |
        |           +-----------------------------------+         |
        |                             |                           |
        | Authenticated               | Tampered                  | Verified
        | Nonce/Signature             | Qubits                    | Outcome
        v                             v                           v
+-------------------------------------------------------------------------+
|                  Brelock Holmes Detection Engine                        |
+-------------------------------------------------------------------------+
```

---

## 2. Adversary Capabilities & Constraints

### 2.1 Adversary Power Level: $\mathcal{A}_{\text{Quantum}}$
We assume an active adversary Eve ($\mathcal{A}$) with the following physical capabilities:
- **Quantum Interception**: Can capture flying qubits traversing the quantum channel connecting Alice and Bob.
- **Unitary Transformations**: Can apply arbitrary single- and two-qubit unitary operations $U \in SU(2^n)$ on intercepted qubits.
- **Entanglement Injection**: Can entangle probe ancilla qubits with the flying signature states.
- **Classical Channel Eavesdropping**: Can read all classical broadcast parameters, session IDs, public nonces, and syndrome bits.
- **Delayed Measurement**: Can store quantum states in ideal or noisy quantum memory for arbitrary durations prior to measurement.

### 2.2 Fundamental Physics Limitations
Eve is strictly bound by the laws of quantum mechanics:
1. **No-Cloning Theorem**: Cannot create an identical copy of an unknown arbitrary quantum state $|\psi\rangle$.
2. **Heisenberg Uncertainty / Measurement Disturbance**: Any generalized measurement $M_m$ applied to $|\psi\rangle$ that extracts non-trivial information irreversibly perturbs the density operator $\rho$.
3. **No-Communication Theorem**: Cannot transmit classical information faster than light using entangled pairs.

---

## 3. Attack Vector Taxonomy

```
                          ┌─────────────────────────┐
                          │   QDS Attack Taxonomy   │
                          └────────────┬────────────┘
         ┌──────────────────┬──────────┴──────────┬──────────────────┐
         ▼                  ▼                     ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌──────────────────────┐ ┌─────────────┐
│  State Forgery  │ │ Impersonation │ │ Channel Manipulation │ │   Replay    │
│ (Orthogonal Sub)│ │ (Phase/Angle) │ │(Depolarizing/Pauli)  │ │(Nonce Reuse)│
└─────────────────┘ └───────────────┘ └──────────────────────┘ └─────────────┘
```

---

### Vector 1: State Forgery (Unauthorized State Substitution)
- **Goal**: Bob or Eve signs a malicious document $m'$ without access to Alice's true secret state parameter $\theta$.
- **Adversary Strategy**: The attacker substitutes an arbitrary orthogonal or standard basis state (e.g., $|\psi_{\text{fake}}\rangle = |1\rangle$) hoping the receiver will accept it.
- **Mathematical Impact**:
  - True state: $|\psi_{\text{sig}}\rangle = \frac{\sqrt{3}}{2}|0\rangle + \frac{1}{4}|1\rangle \implies P(0)=0.75, P(1)=0.25$.
  - Forged state $|1\rangle$: $P_{\text{obs}}(0) = 0.00, P_{\text{obs}}(1) = 1.00$.
  - Bhattacharyya Fidelity: $F(P, Q) = \left(\sqrt{0.75 \times 0.00} + \sqrt{0.25 \times 1.00}\right)^2 = (0 + 0.50)^2 = 0.2500$.
  - Total Variation Distance: $\Delta_{\text{TVD}} = |0.75 - 0.00| = 0.7500$.
- **Detection Trigger**: $F < 0.50 \implies$ Flagged as `CRITICAL` severity `forgery`.

---

### Vector 2: Impersonation Attack (Angular Perturbation)
- **Goal**: Eve attempts to forge Alice's signature by guessing or perturbing the rotation angle on the Bloch sphere.
- **Adversary Strategy**: Eve applies a modified rotation $R_y(\theta + \Delta\theta)$ where $\Delta\theta = \pi/6$.
- **Mathematical Impact**:
  - Target rotation: $\theta = \pi/3 \to \theta_{\text{perturbed}} = \pi/3 + \pi/6 = \pi/2$ (Equal superposition $|+\rangle$).
  - Expected distribution: $P(0) = 0.75, P(1) = 0.25$.
  - Observed distribution: $Q(0) = 0.50, Q(1) = 0.50$.
  - Classical Fidelity:
    $$F(P, Q) = \left(\sqrt{0.75 \times 0.50} + \sqrt{0.25 \times 0.50}\right)^2 = \left(\sqrt{0.375} + \sqrt{0.125}\right)^2 \approx (0.61237 + 0.35355)^2 \approx 0.9330$$
  - Total Variation Distance: $\Delta_{\text{TVD}} = |0.75 - 0.50| = 0.2500$.
- **Detection Trigger**: $F < 0.95$ and $\Delta_{\text{TVD}} > 0.10 \implies$ Flagged as `HIGH` severity `impersonation`.

---

### Vector 3: Quantum Channel Manipulation (Man-in-the-Middle Noise Injection)
- **Goal**: Eve conducts an intercept-resend or weak continuous measurement attack on the EPR distribution channel, injecting non-unitary disturbance.
- **Adversary Strategy**: Modeled as an injected depolarizing error channel with parameter $p_{\text{noise}} \ge 0.15$:
  $$\mathcal{E}_{p}(\rho) = (1-p)\rho + \frac{p}{3}\left(X\rho X + Y\rho Y + Z\rho Z\right)$$
- **Mathematical Impact**:
  - As $p$ increases, the probability distribution drifts monotonically from $(0.75, 0.25)$ towards the uniform mixture $(0.50, 0.50)$.
  - Fidelity degrades from $0.999 \to 0.950 \to 0.900$.
  - Distribution deviation $\Delta_{\text{TVD}}$ increases from $0.01 \to 0.12 \to 0.20$.
- **Detection Trigger**: Fidelity falls below calibrated noise baseline while TVD exceeds dynamic threshold $\Delta_{\text{TVD}} > \tau_{\text{noise}} \implies$ Flagged as `channel_manipulation`.

---

### Vector 4: Nonce & Session Replay Attack
- **Goal**: Eve captures a legitimate, validated quantum signature packet $(S_{\text{id}}, N_0, \text{Counts})$ and transmits it in a future verification window to validate an unauthorized payload.
- **Adversary Strategy**: Re-submits previously authenticated `(session_id, nonce)` pairs without re-running the quantum circuit.
- **Mathematical / Protocol Impact**:
  - The quantum state metrics appear pristine ($F \approx 1.0, \Delta_{\text{TVD}} \approx 0.01$).
  - However, the session registry identifies $S_{\text{id}} \in \text{Registry}$ with matching active nonce.
- **Detection Trigger**: Protocol-level validator returns `is_replay = True` $\implies$ Flagged as `CRITICAL` severity `replay`.

---

## 4. Operational Detection Envelope & Threshold Matrix

| Attack Vector | Fidelity Range ($F$) | TVD Range ($\Delta_{\text{TVD}}$) | Error Rate ($\text{QBER}$) | Protocol Status | Assigned Severity |
|---|---|---|---|---|---|
| **Normal / Clean** | $[0.985, 1.000]$ | $[0.000, 0.035]$ | $[0.000, 0.015]$ | Valid Nonce | `NORMAL` |
| **State Forgery** | $[0.000, 0.400]$ | $[0.600, 1.000]$ | $[0.600, 1.000]$ | Valid Nonce | `CRITICAL` |
| **Impersonation** | $[0.850, 0.960]$ | $[0.150, 0.350]$ | $[0.040, 0.150]$ | Valid Nonce | `HIGH` |
| **Channel Manipulation** | $[0.900, 0.970]$ | $[0.060, 0.180]$ | $[0.030, 0.100]$ | Valid Nonce | `MEDIUM` / `HIGH` |
| **Replay Attack** | $[0.985, 1.000]$ | $[0.000, 0.035]$ | $[0.000, 0.015]$ | Duplicate Nonce | `CRITICAL` |

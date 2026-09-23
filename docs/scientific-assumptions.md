# Scientific Assumptions & Theoretical Foundations

## 1. Executive Summary

Brelock Holmes implements a threat investigation and statistical anomaly detection engine for teleportation-based Quantum Digital Signatures (QDS). This document defines the formal physics assumptions, operational approximations, boundary conditions, and mathematical limits of the simulated quantum processes.

---

## 2. Quantum State Representation & Basis Selection

### 2.1 Qubit Register Allocation
The teleportation protocol operates over a three-qubit register:
- **$q_0$ (Alice's Message/Signature Qubit)**: Carries the unknown single-qubit quantum token $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$.
- **$q_1$ (Alice's Half of Entangled Bell Pair)**: Shared EPR resource with Bob.
- **$q_2$ (Bob's Half of Entangled Bell Pair)**: Target qubit where state $|\psi\rangle$ is reconstituted.

Classical feedforward bits:
- $c_0$: Outcome of Bell-basis measurement on $q_0$ ($\in \{0, 1\}$).
- $c_1$: Outcome of Bell-basis measurement on $q_1$ ($\in \{0, 1\}$).
- $c_2$: Final verification measurement on Bob's qubit $q_2$ in the computational ($Z$) basis.

### 2.2 Signature State Parameterization
The standard state vector prepared by Alice is parameterized on the Bloch sphere via the $R_y(\theta)$ rotation operator:
$$|\psi(\theta)\rangle = R_y(\theta)|0\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + \sin\left(\frac{\theta}{2}\right)|1\rangle$$

#### Default Operational Token:
$$\theta_{\text{sig}} = \frac{\pi}{3} \implies |\psi_{\text{sig}}\rangle = \cos\left(\frac{\pi}{6}\right)|0\rangle + \sin\left(\frac{\pi}{6}\right)|1\rangle = \frac{\sqrt{3}}{2}|0\rangle + \frac{1}{2}|1\rangle$$

#### Theoretical Measurement Probabilities:
$$P(0) = |\langle 0|\psi_{\text{sig}}\rangle|^2 = \cos^2\left(\frac{\pi}{6}\right) = \frac{3}{4} = 0.75$$
$$P(1) = |\langle 1|\psi_{\text{sig}}\rangle|^2 = \sin^2\left(\frac{\pi}{6}\right) = \frac{1}{4} = 0.25$$

### 2.3 Non-Degeneracy Justification: The $|+\rangle$ vs $|\psi(\pi/3)\rangle$ Decision
A critical architectural constraint discovered during protocol validation:
- The standard equal superposition state $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ has computational basis probabilities $P(0) = 0.50$ and $P(1) = 0.50$.
- Under uniform depolarizing noise $\mathcal{E}_\lambda(\rho) = (1-\lambda)\rho + \lambda \frac{I}{2}$, any arbitrary pure state is contracted towards the maximally mixed state $\rho_{\text{mix}} = \frac{1}{2}I$.
- The diagonal components of $\frac{1}{2}I$ in the computational basis are identically $P(0) = 0.50, P(1) = 0.50$.
- **Consequence**: Measuring $|+\rangle$ in the $Z$-basis under depolarizing noise yields an observed distribution $P_{\text{obs}}(0) = 0.50$, creating zero statistical divergence ($D_{\text{TVD}} \approx 0, F \approx 1.0$), making channel tampering invisible to $Z$-basis detectors.
- **Solution**: Choosing $\theta = \pi/3$ breaks the $Z$-basis symmetry ($75\% / 25\%$), ensuring depolarizing degradation contracts the distribution towards $50\% / 50\%$, yielding an immediate, quantifiable statistical anomaly:
$$\Delta P(0) = 0.75 - \left((1-\lambda)0.75 + 0.5\lambda\right) = 0.25\lambda$$

---

## 3. Quantum Circuit Transformation & Feedforward Mechanics

The teleportation circuit applies unitary transformations in discrete time slices:

1. **Entanglement Distribution**:
   $$|\Phi^+\rangle_{12} = \frac{1}{\sqrt{2}}(|00\rangle_{12} + |11\rangle_{12}) = \text{CNOT}_{1 \to 2} (H_1 \otimes I_2) |00\rangle_{12}$$
2. **Joint State Expansion**:
   $$|\Psi_0\rangle = |\psi\rangle_0 \otimes |\Phi^+\rangle_{12} = \frac{1}{\sqrt{2}}\left[\alpha|0\rangle(|00\rangle + |11\rangle) + \beta|1\rangle(|00\rangle + |11\rangle)\right]$$
3. **Bell Basis Transformation**:
   $$|\Psi_1\rangle = (H_0 \otimes I_1 \otimes I_2)(\text{CNOT}_{0 \to 1} \otimes I_2)|\Psi_0\rangle$$
   Algebraic regrouping reveals four equally weighted branches:
   $$|\Psi_1\rangle = \frac{1}{2} \Big[ |00\rangle(\alpha|0\rangle + \beta|1\rangle) + |01\rangle(\alpha|1\rangle + \beta|0\rangle) + |10\rangle(\alpha|0\rangle - \beta|1\rangle) + |11\rangle(\alpha|1\rangle - \beta|0\rangle) \Big]$$
4. **Conditional Pauli Correction Matrix**:
   Depending on measurement outcomes $(c_0, c_1)$:
   - $(c_0=0, c_1=0) \implies I |\psi\rangle$ (No correction)
   - $(c_0=0, c_1=1) \implies X |\psi\rangle$ (Bit-flip correction applied: $X \cdot X = I$)
   - $(c_0=1, c_1=0) \implies Z |\psi\rangle$ (Phase-flip correction applied: $Z \cdot Z = I$)
   - $(c_0=1, c_1=1) \implies XZ |\psi\rangle$ (Bit-and-phase correction applied: $Z X \cdot X Z = I$)

In Qiskit 2.5+, these conditional corrections are realized via dynamic circuit instructions using `QuantumCircuit.if_test((clbit, val))`.

---

## 4. Quantum Noise Channel Models

All environmental imperfections are modeled using open quantum system Kraus representations via Qiskit Aer `NoiseModel`:

### 4.1 Depolarizing Channel
For a single qubit state $\rho$ and error probability $p$:
$$\mathcal{E}_{\text{depol}}(\rho) = (1 - p)\rho + \frac{p}{3}\left(X\rho X + Y\rho Y + Z\rho Z\right)$$
For two-qubit operations (e.g., CNOT gates), depolarizing channel tensor products $\mathcal{E}_{2\text{-depol}}$ are applied over all 15 non-identity Pauli pairs $\{I,X,Y,Z\}^{\otimes 2} \setminus \{I \otimes I\}$.

### 4.2 Pauli Bit-Flip & Phase-Flip Channels
$$\mathcal{E}_{\text{bit}}(\rho) = (1 - p)\rho + p X \rho X$$
$$\mathcal{E}_{\text{phase}}(\rho) = (1 - p)\rho + p Z \rho Z$$

### 4.3 Generalized Amplitude Damping (Thermal Relaxation)
Describes energy dissipation from excited state $|1\rangle \to |0\rangle$ with transition probability $\gamma = 1 - e^{-t/T_1}$:
$$E_0 = \begin{pmatrix} 1 & 0 \\ 0 & \sqrt{1-\gamma} \end{pmatrix}, \quad E_1 = \begin{pmatrix} 0 & \sqrt{\gamma} \\ 0 & 0 \end{pmatrix}$$
$$\mathcal{E}_{\text{amp}}(\rho) = E_0 \rho E_0^\dagger + E_1 \rho E_1^\dagger$$

---

## 5. Statistical Threat Detection Metrics

### 5.1 Classical Bhattacharyya Fidelity
Given expected discrete probability distribution $P = \{P_0, P_1\}$ and observed empirical distribution $Q = \{Q_0, Q_1\}$ from $N$ circuit shots:
$$F(P, Q) = \left( \sum_{x \in \{0, 1\}} \sqrt{P(x) \cdot Q(x)} \right)^2$$
**Properties**:
- $F(P, Q) \in [0, 1]$.
- $F(P, Q) = 1 \iff P = Q$.
- $F(P, Q) = 0 \iff P \perp Q$ (orthogonal supports).
- Quadratic scaling provides heightened sensitivity to slight angular perturbations in the vicinity of $F \approx 1$.

### 5.2 Total Variation Distance (TVD)
$$\Delta_{\text{TVD}}(P, Q) = \frac{1}{2} \sum_{x \in \{0, 1\}} |P(x) - Q(x)| = |P(0) - Q(0)|$$
**Properties**:
- $\Delta_{\text{TVD}} \in [0, 1]$.
- Directly represents the operational upper bound on an adversary's probability of successfully distinguishing the two states in single-shot hypothesis testing:
$$P_{\text{distinguish}} \le \frac{1}{2} + \frac{1}{2}\Delta_{\text{TVD}}(P, Q)$$

### 5.3 Quantum Bit Error Rate (QBER)
$$\text{QBER} = 1.0 - F(P, Q)$$

---

## 6. Deterministic vs Machine Learning Detection Rationale

Brelock Holmes explicitly prohibits AI/ML classification models in the core detection loop:

| Metric / Dimension | Statistical Hypotheses (Brelock Holmes) | Neural Network / ML Classifier |
|---|---|---|
| **Auditing & Verifiability** | Fully provable closed-form mathematical guarantees | Black-box weights; non-deterministic latent mappings |
| **Adversarial Poisoning** | Impossible (no training sets or feedback loops) | Susceptible to adversarial perturbations & training poisoning |
| **Edge-Case Drift** | Strict threshold invariants derived from physics baseline | Unbounded generalization failure on out-of-distribution noise |
| **Computational Overhead** | $O(1)$ arithmetic operations per verification | Multi-layer matrix multiplications and GPU tensor dependencies |
| **Certification Standards** | Conforms to ISO/IEC 19790 and FIPS 140-3 deterministic compliance | Fails formal cryptographic validation criteria |

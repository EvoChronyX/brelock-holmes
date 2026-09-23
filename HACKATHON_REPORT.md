# 🔐 Brelock Holmes — Quantum Digital Signature Security & Threat Investigation Platform

## Complete Technical Report for Smart India Hackathon 2026
### Problem Statement: SIH26-141 (Egreen Quanta LLP)
### *"Quantum-Inspired Cyber Threat Detection for Digital Signature Security"*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement Analysis](#2-problem-statement-analysis)
3. [System Architecture](#3-system-architecture)
4. [Core Protocol: Teleportation-Based QDS](#4-core-protocol-teleportation-based-qds)
5. [Statistical Detection Engine](#5-statistical-detection-engine)
6. [5 Innovation & Novelty Implementations](#6-five-innovations--novelty-implementations)
   - 6.1 [QITN-Verify: MPS Tensor Network Verification](#61-qitn-verify-mps-tensor-network-state-verification)
   - 6.2 [QST-Bloch: Multi-Basis Quantum State Tomography](#62-qst-bloch-multi-basis-quantum-state-tomography--3d-bloch-reconstruction)
   - 6.3 [DAND: Dynamic Adaptive Noise Decoupling](#63-dand-dynamic-adaptive-noise-decoupling-pulse-synthesizer)
   - 6.4 [QDS-Arbiter: Tri-Party Non-Repudiation Protocol](#64-qds-arbiter-tri-party-non-repudiation-entangled-arbiter-protocol)
   - 6.5 [Q-Ledger: Quantum Anomaly Fingerprint Ledger](#65-q-ledger-quantum-anomaly-fingerprint--post-quantum-sha3-512-ledger)
7. [Frontend Platform — Page-by-Page Observation Guide](#7-frontend-platform--page-by-page-observation-guide)
8. [API Architecture](#8-api-architecture)
9. [Scientific Justification: Why No ML](#9-scientific-justification-why-no-ml)
10. [Installation & Setup](#10-installation--setup)
11. [Testing & Verification](#11-testing--verification)
12. [PPT Slide-by-Slide Outline](#12-ppt-slide-by-slide-outline)
13. [References](#13-references)

---

## 1. Executive Summary

**Brelock Holmes** is an end-to-end **Quantum-Inspired Cyber Threat Detection Platform** for digital signature security. It implements a fully functional **quantum teleportation-based digital signature (QDS)** protocol using **Qiskit Aer** simulation, combined with **zero-ML deterministic statistical threat detection** that provides provable, auditable security guarantees impossible with classical machine-learning approaches.

### Key Differentiators

| Aspect | Classical Systems | Brelock Holmes |
|--------|------------------|----------------|
| **Signature Security** | RSA/ECDSA (computational hardness) | Quantum No-Cloning Theorem (information-theoretic) |
| **Threat Detection** | ML/neural classifiers (black box) | Bhattacharyya fidelity + TVD (closed-form, auditable) |
| **Forgery Resistance** | Brute-force key search | Physically impossible per quantum mechanics |
| **Non-Repudiation** | PKI certificate chains | GHZ entanglement arbiter (quantum binding) |
| **Audit Trail** | Database logs | Merkle-chained SHA3-512 quantum ledger |

### Technology Stack

- **Backend:** Python 3.14, FastAPI, Qiskit 2.5, Qiskit Aer, NumPy, SciPy
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Quantum Engine:** Qiskit AerSimulator (local statevector + shot-based simulation)
- **All 25 backend unit tests passing** (pytest)
- **Zero TypeScript errors** (strict mode)

---

## 2. Problem Statement Analysis

### SIH26-141: Egreen Quanta LLP — Problem Statement

> *"Develop a quantum-inspired solution for cyber threat detection specifically targeting digital signature security. The system should leverage quantum computing principles to identify and mitigate threats to digital signatures used in authentication, data integrity verification, and non-repudiation."*

### How Brelock Holmes Addresses Each Requirement

| Problem Requirement | Implementation |
|---------------------|----------------|
| **"Quantum-inspired solution"** | Full 3-qubit teleportation QDS circuit simulated on Qiskit Aer; all 5 innovations use quantum-mechanical formalisms |
| **"Cyber threat detection"** | 4 attack vectors detected: intercept-resend, state forgery, entanglement swapping, replay |
| **"Digital signature security"** | QDS protocol where signature = quantum state |ψ⟩ = Ry(θ)|0⟩ |
| **"Authentication"** | Teleportation-based state verification with calibrated statistical thresholds |
| **"Data integrity verification"** | Bhattacharyya fidelity F(P_exp, P_obs) and Total Variation Distance |
| **"Non-repudiation"** | Innovation #4: GHZ tri-party entangled arbiter protocol |
| **"Identify and mitigate threats"** | Deterministic gating engine with dynamic baseline calibration (μ - 3σ thresholds) |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 15)                        │
│                                                                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐│
│  │Dashboard │ │Experiment│ │Attack Lab│ │  Protocol  │ │Innovations││
│  │  (Home)  │ │  History │ │Simulator │ │  Inspector │ │  (5 tabs)││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘ └─────┬────┘│
│       │            │            │              │              │     │
│  ┌────┴────┐ ┌─────┴────┐ ┌────┴─────┐ ┌─────┴──────┐ ┌─────┴───┐│
│  │Analytics│ │Baseline  │ │Security  │ │   Docs &   │ │  Report  ││
│  │ Charts  │ │Calibrate │ │ Events   │ │API Ref     │ │ Download ││
│  └─────────┘ └──────────┘ └──────────┘ └────────────┘ └─────────┘│
└───────────────────────────────┬─────────────────────────────────────┘
                                │ REST API (JSON)
┌───────────────────────────────┴─────────────────────────────────────┐
│                      BACKEND (FastAPI + Qiskit)                     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  Quantum Execution Engine                    │   │
│  │  ┌───────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────┐ │   │
│  │  │ Circuit   │ │  Noise     │ │ Attack   │ │ Statistical │ │   │
│  │  │ Builder   │ │  Models    │ │ Simulator│ │ Analyzer    │ │   │
│  │  │ (3-qubit) │ │ (depo/amp/ │ │ (4 types)│ │ (F, TVD,   │ │   │
│  │  │           │ │  phase)    │ │          │ │  QBER)      │ │   │
│  │  └───────────┘ └────────────┘ └──────────┘ └─────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              5 Innovation Engines                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────┐ ┌────────┐ ┌─────────┐ │   │
│  │  │ MPS      │ │ Pauli    │ │ DAND │ │ GHZ    │ │ SHA3-   │ │   │
│  │  │ Tensor   │ │ Tomog-   │ │ Pulse│ │ Arbiter│ │ 512     │ │   │
│  │  │ Network  │ │ raphy    │ │ Seq  │ │Protocol│ │ Ledger  │ │   │
│  │  └──────────┘ └──────────┘ └──────┘ └────────┘ └─────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Baseline Calibrator│  │ Security Event   │  │ In-Memory Store  │ │
│  │ (Monte Carlo)      │  │ Logger           │  │ (Experiments DB) │ │
│  └───────────────────┘  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Core Protocol: Teleportation-Based QDS

### 4.1 Circuit Specification (3 Qubits, 3 Classical Bits)

The full quantum circuit implements the standard quantum teleportation protocol adapted for digital signature generation and verification:

```
       ┌────────┐          ┌───┐┌─┐
q[0] ──┤ Ry(θ)  ├───────●──┤ H ├┤M├──────────────────────
       └────────┘  ┌───┐ │  └───┘└╥┘              ┌─┐
q[1] ──────────────┤ H ├─┼────X───╫───────────────┤M├────
                   └───┘ │    │   ║               └╥┘
q[2] ────────────────────X────┘───╫────[Z^c0][X^c1]╫──┤M├
                                  ║                ║  └╥┘
c[0] ═════════════════════════════╩════════════════╬═══╬═
c[1] ══════════════════════════════════════════════╩═══╬═
c[2] ══════════════════════════════════════════════════╩═
```

### 4.2 The 8-Stage Pipeline

| Stage | Name | Operation | Mathematical Effect |
|-------|------|-----------|-------------------|
| **S1** | State Preparation | `Ry(θ) q[0]` | $\|\psi\rangle = \cos(\theta/2)\|0\rangle + \sin(\theta/2)\|1\rangle$ |
| **S2** | Bell Pair Generation | `H q[1]; CX q[1],q[2]` | $\|\Phi^+\rangle = \frac{1}{\sqrt{2}}(\|00\rangle + \|11\rangle)$ |
| **S3** | Bell Measurement | `CX q[0],q[1]; H q[0]; M q[0],q[1]` | Projects onto Bell basis, yields $(c_0, c_1)$ |
| **S4** | Classical Communication | Transmit $(c_0, c_1)$ | 2 classical bits over authenticated channel |
| **S5** | Pauli Correction | `X^{c1} Z^{c0} q[2]` | Restores $q[2] = \|\psi\rangle$ exactly |
| **S6** | Verification Measurement | `M q[2] → c[2]` | Produces empirical counts over N shots |
| **S7** | Statistical Comparison | Compute $F$, $D_{TVD}$ | Bhattacharyya fidelity and Total Variation Distance |
| **S8** | Threat Detection | $F \geq \tau_F \wedge D \leq \tau_D$ | Accept/Reject decision with logged evidence |

### 4.3 Symmetry-Breaking Signature State

We use $\theta = \pi/3$ (not $\pi/2$) so that $P(0) = \cos^2(\pi/6) = 0.75$ and $P(1) = 0.25$. This **asymmetric** distribution makes depolarizing noise (which pushes toward uniform 50/50) detectable in the computational basis alone, without requiring multi-basis tomography for the core detection.

### 4.4 Threat Detection Metrics

**Bhattacharyya Classical Fidelity:**
$$F(P_{\text{exp}}, P_{\text{obs}}) = \left(\sum_{x \in \{0,1\}} \sqrt{P_{\text{exp}}(x) \cdot P_{\text{obs}}(x)}\right)^2$$

**Total Variation Distance:**
$$D_{\text{TVD}}(P_{\text{exp}}, P_{\text{obs}}) = \frac{1}{2} \sum_{x \in \{0,1\}} |P_{\text{exp}}(x) - P_{\text{obs}}(x)|$$

**Quantum Bit Error Rate (QBER):**
$$\text{QBER} = 1 - F$$

**Decision Rule:**
$$\text{Decision} = \begin{cases} \text{ACCEPT (Normal)} & \text{if } F \geq \tau_F \wedge D \leq \tau_D \\ \text{REJECT (Threat)} & \text{otherwise} \end{cases}$$

---

## 5. Statistical Detection Engine

### 5.1 Dynamic Baseline Calibration

Rather than hardcoding thresholds, Brelock Holmes runs a **Monte Carlo calibration** procedure:

1. Execute N circuits at each noise level $p \in \{0.0, 0.01, 0.03, 0.05, 0.08, 0.10, 0.15\}$
2. Compute empirical mean $\mu_F(p)$ and standard deviation $\sigma_F(p)$ of fidelity at each level
3. Set threshold: $\tau_F = \min_p \left(\mu_F(p) - 3\sigma_F(p)\right)$
4. Set deviation bound: $\tau_D = \max_p \left(\mu_D(p) + 3\sigma_D(p)\right)$

This guarantees a **99.7% confidence** interval (3σ Chebyshev bound) under normal operational noise.

### 5.2 Four Attack Detection Modes

| Attack Type | Physical Mechanism | Detection Signal |
|-------------|-------------------|------------------|
| **Intercept-Resend** | Eve measures flying qubit, causing state collapse | $F$ drops to ~0.50–0.65 |
| **State Forgery** | Adversary injects $\theta_{\text{forge}} \neq \theta_{\text{valid}}$ | P(0) ratio diverges from expected |
| **Entanglement Swapping** | Eve inserts auxiliary Bell pair, breaks monogamy | Purity $\text{Tr}(\rho^2) < 1$ |
| **Replay Attack** | Re-transmit past syndrome bits | Nonce collision + randomized Bell mismatch |

---

## 6. Five Innovations & Novelty Implementations

### 6.1 QITN-Verify: MPS Tensor Network State Verification

**Innovation:** Classical Matrix Product State (MPS) contraction provides an independent, polynomial-time verification path for quantum state fidelity that does not require full quantum state tomography.

**Mathematical Foundation:**

A 1D Matrix Product State with bond dimension $\chi$:
$$|\psi\rangle = \sum_{s_1, \ldots, s_N} A^{s_1}_{1} A^{s_2}_{2} \cdots A^{s_N}_{N} |s_1 s_2 \cdots s_N\rangle$$

where each $A^{s_i}_i$ is a $\chi \times \chi$ matrix.

**Bipartite Entanglement Entropy** via singular value decomposition:
$$S = -\sum_i \lambda_i^2 \ln(\lambda_i^2)$$

where $\{\lambda_i\}$ are the Schmidt coefficients from SVD of the bipartition.

**Why This Is Novel:**
- Standard QDS systems verify only via shot counts; MPS provides a structurally independent verification channel
- Bond dimension $\chi$ bounds computational complexity to $O(N \chi^3)$ — polynomial even for large systems
- Entanglement entropy detects entanglement swapping attacks that raw fidelity may miss at low noise

**Backend:** `app/innovations/tensor_network.py` → API: `POST /api/v1/innovations/tensor-network/verify`

**Frontend:** Innovations page → Tab 1 (QITN-Verify)

---

### 6.2 QST-Bloch: Multi-Basis Quantum State Tomography & 3D Bloch Reconstruction

**Innovation:** Full 3-basis Pauli operator expectation measurement reconstructing the complete single-qubit density matrix $\rho$ and 3D Bloch sphere coordinates, providing forensic-grade quantum state characterization.

**Mathematical Foundation:**

Measure in three Pauli bases to extract expectation values:

$$\langle X \rangle = P_+(X) - P_-(X), \quad \langle Y \rangle = P_+(Y) - P_-(Y), \quad \langle Z \rangle = P_+(Z) - P_-(Z)$$

Reconstruct the full density matrix:
$$\rho = \frac{1}{2}\left(I + \langle X \rangle \sigma_x + \langle Y \rangle \sigma_y + \langle Z \rangle \sigma_z\right)$$

**Derived Quantum Metrics:**
- **Purity:** $\gamma = \text{Tr}(\rho^2) \in [0.5, 1.0]$
- **Von Neumann Entropy:** $S(\rho) = -\text{Tr}(\rho \ln \rho)$
- **Bloch Vector:** $(r_x, r_y, r_z) = (\langle X \rangle, \langle Y \rangle, \langle Z \rangle)$, with $||\mathbf{r}|| = 1$ for pure states

**Why This Is Novel:**
- Goes beyond computational-basis-only measurement to full quantum state characterization
- Enables detection of phase-coherent attacks that maintain Z-basis statistics but corrupt X/Y coherences
- Bloch sphere visualization provides intuitive forensic evidence for judges

**Backend:** `app/innovations/tomography.py` → API: `POST /api/v1/innovations/tomography/reconstruct`

**Frontend:** Innovations page → Tab 2 (QST-Bloch) with 3D Bloch sphere renderer

---

### 6.3 DAND: Dynamic Adaptive Noise Decoupling Pulse Synthesizer

**Innovation:** Implementation of XY4 and CPMG dynamical decoupling pulse sequences that actively suppress environmental dephasing, extending quantum coherence time during the teleportation protocol.

**Mathematical Foundation:**

**XY4 Pulse Sequence:**
$$U_{\text{XY4}} = \tau \cdot X \cdot \tau \cdot Y \cdot \tau \cdot X \cdot \tau \cdot Y$$

This refocuses both $\sigma_z$ and $\sigma_x$ environmental couplings.

**CPMG Sequence:**
$$U_{\text{CPMG}} = (\tau \cdot X \cdot \tau)^n$$

Suppresses $T_2$ dephasing noise.

**Fidelity Improvement:**
$$F_{\text{decoupled}} = 1 - p_{\text{eff}} \quad \text{where} \quad p_{\text{eff}} = p \cdot \left(\frac{\tau}{T_2^*}\right)^2$$

**Why This Is Novel:**
- No other hackathon QDS system actively fights noise — they only detect it
- Demonstrates that the system not only identifies threats but actively *mitigates* channel degradation
- Direct practical relevance: real quantum hardware suffers from $T_2$ dephasing

**Backend:** `app/innovations/dynamical_decoupling.py` → API: `POST /api/v1/innovations/dynamical-decoupling/apply`

**Frontend:** Innovations page → Tab 3 (DAND) with before/after fidelity comparison

---

### 6.4 QDS-Arbiter: Tri-Party Non-Repudiation Entangled Arbiter Protocol

**Innovation:** Extension of 2-party QDS to a 3-party protocol using GHZ entanglement to provide quantum-enforced non-repudiation with an independent arbiter.

**Mathematical Foundation:**

**GHZ State:**
$$|\text{GHZ}\rangle = \frac{1}{\sqrt{2}}(|000\rangle + |111\rangle)$$

Distributed: Alice holds $q_A$, Bob holds $q_B$, Arbiter Charlie holds $q_C$.

**ZZZ Stabilizer Parity:**
$$\langle Z_A \otimes Z_B \otimes Z_C \rangle = +1$$

If any party's qubit is tampered with, the tripartite stabilizer measurement yields $-1$, conclusively identifying the cheating party.

**Non-Repudiation Guarantee:**
- Alice cannot deny signing: Charlie's correlated measurement proves Alice prepared the state
- Bob cannot forge: monogamy of GHZ prevents Bob from creating compatible correlations
- Charlie resolves disputes: independent GHZ parity check is conclusive

**Why This Is Novel:**
- Existing QDS prototypes are 2-party only; real-world digital signatures require non-repudiation with an arbiter
- GHZ stabilizer verification provides a single-shot dispute resolution mechanism
- Directly addresses the problem statement's "non-repudiation" requirement

**Backend:** `app/innovations/arbiter.py` → API: `POST /api/v1/innovations/arbiter/verify`

**Frontend:** Innovations page → Tab 4 (QDS-Arbiter) with scenario simulator

---

### 6.5 Q-Ledger: Quantum Anomaly Fingerprint & Post-Quantum SHA3-512 Ledger

**Innovation:** Tamper-evident Merkle-chained audit ledger that cryptographically binds quantum telemetry signatures (fidelity, noise profile, Bloch coordinates, entropy) to immutable hash blocks using SHA3-512.

**Mathematical Foundation:**

**Block Hash Construction:**
$$H_n = \text{SHA3-512}(H_{n-1} \| \text{serialize}(\text{telemetry}_n))$$

**Merkle Chain Property:**
$$\text{verify}(H_n) = \text{SHA3-512}(H_{n-1} \| \text{data}_n) \stackrel{?}{=} H_n$$

Any modification to any historical block $i < n$ invalidates all subsequent hashes.

**Quantum Telemetry Fingerprint fields:**
- Experiment ID, timestamp, θ parameter
- Bhattacharyya fidelity, TVD, QBER
- Measurement probability distribution $\{P(0), P(1)\}$
- MPS entanglement entropy (from Innovation #1)
- Bloch vector coordinates (from Innovation #2)
- Detection verdict, severity classification

**Why This Is Novel:**
- Creates a forensic-grade immutable record of every quantum verification event
- SHA3-512 is NIST-approved post-quantum hash (resistant to Grover's algorithm)
- Enables court-admissible audit trails for digital signature disputes
- Chain integrity is verifiable by any third party with O(n) hash computations

**Backend:** `app/innovations/ledger.py` → API: `POST /api/v1/innovations/ledger/record`, `GET /api/v1/innovations/ledger/verify`

**Frontend:** Innovations page → Tab 5 (Q-Ledger) with chain visualization

---

## 7. Frontend Platform — Page-by-Page Observation Guide

### How to Observe Each Page (Judge's Walkthrough)

#### Page 1: Dashboard (Home — `/`)
**What to observe:**
- Hero statistics cards showing Total Experiments, Threats Detected, Average Fidelity, Detection Accuracy
- Enterprise light theme with slate-50 background, white cards, indigo/cyan accents
- Clean typography with readable font sizes (no tiny AI-generated text)
- Quick-action buttons to navigate to key features

#### Page 2: Protocol Inspector (`/protocol`)
**What to observe:**
- **8 clickable stage buttons** in a horizontal pipeline — click each to see:
  - Mathematical state evolution formula
  - OpenQASM gate code snippet
  - Cryptographic security role explanation
- **Bell measurement syndrome truth table** — 4 rows showing all $(c_0, c_1)$ outcomes and Pauli corrections
- **Theoretical foundations** — 4 cards: No-Cloning, Monogamy, Information-Disturbance, Non-Repudiation
- **Full OpenQASM viewer** with copy/download buttons

#### Page 3: Experiment History (`/experiments`)
**What to observe:**
- Table of past experiments with fidelity progress bars (green > 0.85, amber > 0.70, red < 0.70)
- Attack type badges (color-coded: intercept-resend, state forgery, replay, etc.)
- Detection status badges (VERIFIED vs THREAT with severity)
- Click any row to view full experiment details

#### Page 4: Attack Lab Simulator (`/attack-lab`)
**What to observe:**
- **Interactive controls** — select attack type, adjust noise level, set shot count
- Click "Launch Attack Simulation" to run a simulated adversarial attack
- Results show:
  - Fidelity gauge dropping below threshold under attack
  - Side-by-side expected vs observed probability distributions
  - Threat classification with severity badge
  - Full forensic evidence log

#### Page 5: Baseline Calibration Lab (`/baseline`)
**What to observe:**
- Monte Carlo runner with configurable shots and noise levels
- Active noise level chips (click to toggle)
- After calibration: empirical threshold cards (τ_F, τ_D)
- Recharts fidelity response curve showing fidelity vs noise level

#### Page 6: Security Events (`/security-events`)
**What to observe:**
- Timeline of all detected security incidents
- Severity badges: CRITICAL (red), HIGH (orange), WARNING (yellow), LOW (blue)
- Click any event to expand forensic drawer with full measurement breakdown
- Filter by severity level

#### Page 7: Analytics Dashboard (`/analytics`)
**What to observe:**
- Aggregate metrics: total experiments, detection accuracy, false positive rate
- Attack type breakdown (bar chart / pie chart)
- Severity distribution histogram
- Fidelity trend over time

#### Page 8: Scientific Documentation (`/docs`)
**What to observe:**
- **Tab 1: Threat Model** — 4 adversary capabilities with impact analysis
- **Tab 2: Detection Methodology** — Mathematical formulas for F and TVD, "Why No ML" rationale
- **Tab 3: Protocol Assumptions** — 4 physical operational constraints
- **Tab 4: API Reference** — All backend endpoints with request/response schemas and copyable cURL commands

#### Page 9: 5 Innovations (`/innovations`)
**What to observe:**
- **5 tabs** corresponding to the 5 novelty implementations
- Each tab has:
  - Interactive parameter controls
  - Run button to execute the innovation engine
  - Results display with quantum metrics
  - Mathematical explanation card

---

## 8. API Architecture

### Endpoint Summary

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/health` | System health check |
| `POST` | `/api/v1/experiments` | Execute QDS experiment |
| `GET` | `/api/v1/experiments` | List experiments |
| `GET` | `/api/v1/experiments/{id}` | Get experiment details |
| `POST` | `/api/v1/attacks/simulate` | Simulate adversarial attack |
| `GET` | `/api/v1/security-events` | List security events |
| `GET` | `/api/v1/security-events/{id}` | Get event forensics |
| `GET` | `/api/v1/analytics/summary` | Aggregate analytics |
| `POST` | `/api/v1/baseline/calibrate` | Run baseline calibration |
| `GET` | `/api/v1/baseline` | Get active baseline |
| `POST` | `/api/v1/innovations/tensor-network/verify` | MPS tensor verification |
| `POST` | `/api/v1/innovations/tomography/reconstruct` | Pauli tomography |
| `POST` | `/api/v1/innovations/dynamical-decoupling/apply` | DAND pulse synthesis |
| `POST` | `/api/v1/innovations/arbiter/verify` | GHZ arbiter protocol |
| `POST` | `/api/v1/innovations/ledger/record` | Record to Q-Ledger |
| `GET` | `/api/v1/innovations/ledger/verify` | Verify ledger integrity |

---

## 9. Scientific Justification: Why No ML

Brelock Holmes deliberately uses **zero machine learning** for its core threat detection. This is a scientific design decision, not a limitation:

### 1. Provable False Positive Bounds
Statistical confidence intervals (3σ Chebyshev / Hoeffding bounds) yield exact, certifiable false-alarm rates. Neural classifiers provide no such mathematical guarantees for unseen adversarial quantum states.

### 2. Full Auditability & Reproducibility
Every detection decision is reproducible by any reviewer using basic arithmetic on raw measurement counts. No opaque weight matrices, no training data dependencies, no hyperparameter sensitivity.

### 3. Immunity to Adversarial ML Poisoning
Adversarial quantum noise patterns can trick gradient-based neural networks via adversarial samples. Closed-form Bhattacharyya distance is mathematically immune to gradient-based evasion.

### 4. No Training Data Required
ML-based detection requires labeled training datasets of quantum attacks — which don't exist at scale. Statistical detection works from first principles of quantum mechanics.

---

## 10. Installation & Setup

### Prerequisites
- Python 3.10+ (tested on 3.14)
- Node.js 18+ (tested on 23.x)
- pip, npm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and connects to the backend at `http://localhost:8000`.

### Verify Installation
```bash
cd backend
python -m pytest tests/    # Should show: 25 passed
```

---

## 11. Testing & Verification

### Backend Test Suite (25 tests, all passing)

| Test File | Count | Scope |
|-----------|-------|-------|
| `tests/test_api.py` | 7 | API endpoints, health, experiment CRUD |
| `tests/test_innovations.py` | 8 | All 5 innovation engines |
| `tests/test_quantum.py` | 10 | Quantum circuit, noise models, detection |

```
======================== 25 passed in 3.40s ========================
```

### Frontend Type Safety
```
$ npx tsc --noEmit
# Zero TypeScript errors (strict mode)
```

---

## 12. PPT Slide-by-Slide Outline

### Slide 1: Title
- **Title:** Brelock Holmes — Quantum-Inspired Cyber Threat Detection for Digital Signature Security
- **Subtitle:** SIH 2026 | Problem Statement: SIH26-141 | Egreen Quanta LLP
- **Visual:** Platform screenshot + quantum circuit diagram

### Slide 2: Problem Statement
- The challenge: Digital signatures (RSA/ECDSA) face quantum computing threats
- Gap: No existing system uses quantum mechanics for signature security threat detection
- Our goal: Build a quantum-inspired platform that detects cyber threats to digital signatures

### Slide 3: Our Solution — Brelock Holmes
- Teleportation-based Quantum Digital Signature (QDS) protocol
- Zero-ML deterministic statistical threat detection
- 10+ page enterprise web platform
- 5 novel research innovations beyond the problem statement

### Slide 4: System Architecture
- Architecture diagram (Section 3 of this report)
- Frontend ↔ REST API ↔ Qiskit Quantum Engine
- Highlight: fully functional, not just a mockup

### Slide 5: Core Protocol — 3-Qubit Teleportation QDS
- Circuit diagram with 3 qubits
- 8-stage pipeline overview
- Key insight: Signature = quantum state |ψ⟩, unforgeable by No-Cloning Theorem

### Slide 6: Statistical Detection Engine
- Bhattacharyya Fidelity formula
- Total Variation Distance formula
- Dynamic 3σ threshold calibration
- Why this is better than ML (auditable, provable, no training data)

### Slide 7: 4 Attack Types Detected
- Intercept-Resend → fidelity collapse
- State Forgery → distribution divergence
- Entanglement Swapping → purity degradation
- Replay → nonce collision detection

### Slide 8: Innovation #1 — MPS Tensor Network Verification
- Matrix Product State contraction for polynomial-time state verification
- Entanglement entropy as independent verification channel
- Screenshot of frontend tab

### Slide 9: Innovation #2 — Quantum State Tomography & 3D Bloch
- 3-basis Pauli measurement → full density matrix reconstruction
- Bloch sphere visualization for forensic analysis
- Detects phase-coherent attacks invisible to Z-basis-only measurement

### Slide 10: Innovation #3 — Dynamic Noise Decoupling (DAND)
- XY4 and CPMG pulse sequences
- Not just detection — active noise mitigation
- Before/after fidelity improvement demonstration

### Slide 11: Innovation #4 — GHZ Tri-Party Arbiter Protocol
- 3-party quantum non-repudiation using GHZ entanglement
- ZZZ stabilizer parity check for dispute resolution
- Addresses real-world need for arbiter in digital signature systems

### Slide 12: Innovation #5 — SHA3-512 Quantum Ledger (Q-Ledger)
- Merkle-chained immutable audit trail
- SHA3-512 post-quantum hash security
- Court-admissible forensic records

### Slide 13: Live Demo Screenshots
- Dashboard, Protocol Inspector, Attack Lab, Innovations tabs
- Clean enterprise light theme UI
- Key metrics visible and readable

### Slide 14: Technology Stack & Testing
- Python 3.14, FastAPI, Qiskit 2.5, Next.js 15, TypeScript
- 25/25 backend tests passing
- Zero TypeScript errors
- All innovations have working API endpoints

### Slide 15: Summary & Impact
- Complete quantum-inspired threat detection system
- 5 research-grade innovations beyond the problem statement
- Zero-ML approach with mathematical security guarantees
- Ready for enterprise deployment (post-quantum future)

### Slide 16: Q&A
- "What is your innovation?"
  → 5 concrete innovations, each with mathematical foundations, working code, and frontend GUI
- "Why no ML?"
  → Provable bounds, full auditability, immune to adversarial poisoning, no training data needed
- "Is this just simulation?"
  → Yes, using Qiskit Aer — but the protocols are hardware-ready and the statistical detection works identically on real quantum hardware

---

## 13. References

1. Bennett, C. H., Brassard, G., Crépeau, C., Jozsa, R., Peres, A., & Wootters, W. K. (1993). "Teleporting an unknown quantum state via dual classical and Einstein-Podolsky-Rosen channels." *Physical Review Letters*, 70(13), 1895.
2. Wootters, W. K., & Zurek, W. H. (1982). "A single quantum cannot be cloned." *Nature*, 299(5886), 802-803.
3. Gottesman, D., & Chuang, I. L. (2001). "Quantum Digital Signatures." *arXiv:quant-ph/0105032*.
4. Coffman, V., Kundu, J., & Wootters, W. K. (2000). "Distributed entanglement." *Physical Review A*, 61(5), 052306.
5. Bhattacharyya, A. (1943). "On a measure of divergence between two statistical populations." *Bulletin of the Calcutta Mathematical Society*, 35, 99-109.
6. Viola, L., Knill, E., & Lloyd, S. (1999). "Dynamical Decoupling of Open Quantum Systems." *Physical Review Letters*, 82(12), 2417.
7. Greenberger, D. M., Horne, M. A., & Zeilinger, A. (1989). "Going Beyond Bell's Theorem." *Bell's Theorem, Quantum Theory and Conceptions of the Universe*, 69-72.
8. NIST. (2015). "SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions." *FIPS PUB 202*.

---

*Report generated for Smart India Hackathon 2026 — Brelock Holmes Team*

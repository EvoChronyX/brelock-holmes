# System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

Brelock Holmes is designed as a decoupled, multi-tier quantum security analysis platform:

```
+-------------------------------------------------------------------------+
|                   Presentation Layer (Next.js 14 / React 18)            |
|  - Threat Dashboard      - Attack Simulation Lab  - Experiment Deep Dive |
|  - Baseline Calibration  - Circuit Step Inspector - Security Event Log   |
+-------------------------------------------------------------------------+
                                    |
                            REST API / HTTP JSON
                                    |
+-------------------------------------------------------------------------+
|                   Application Layer (FastAPI / Python 3.11+)            |
|  - Experiment Orchestrator   - Attack Simulation Engine                |
|  - Statistical Detector      - Baseline Calibration Engine              |
+-------------------------------------------------------------------------+
                 |                                      |
                 v                                      v
+------------------------------------+  +---------------------------------+
|   Quantum Layer (Qiskit 2.5 / Aer)  |  |   Persistence Layer (SQLite/PG) |
|  - Teleportation Circuit Builder   |  |  - Async SQLAlchemy Core        |
|  - Kraus Noise Models (Aer 0.17)   |  |  - Experiment Records           |
|  - Quantum Metrics Engine          |  |  - Security Audit Events        |
+------------------------------------+  +---------------------------------+
```

---

## 2. Directory Structure

```
brelock-holmes/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes.py            # FastAPI route controllers
│   │   │   └── __init__.py
│   │   ├── core/
│   │   │   ├── config.py            # Environment configuration & settings
│   │   │   ├── logging.py           # Structured logging engine
│   │   │   └── __init__.py
│   │   ├── db/
│   │   │   ├── base.py              # Declarative SQLAlchemy base
│   │   │   ├── models.py            # Experiment & SecurityEvent tables
│   │   │   ├── session.py           # Async SQLite/Postgres engine & session
│   │   │   └── __init__.py
│   │   ├── quantum/
│   │   │   ├── circuits.py          # 3-qubit teleportation circuit builder
│   │   │   ├── measurements.py      # Fidelity, TVD, QBER computation
│   │   │   ├── noise.py             # Aer Kraus noise models
│   │   │   ├── states.py            # State parameterizations & probabilities
│   │   │   ├── teleportation.py     # Execution harness on AerSimulator
│   │   │   └── __init__.py
│   │   ├── schemas/
│   │   │   └── __init__.py          # Pydantic v2 request/response models
│   │   ├── security/
│   │   │   ├── fingerprints.py      # QuantumSecurityFingerprint models
│   │   │   ├── thresholds.py        # Static & calibrated threshold config
│   │   │   ├── validators.py        # Session & nonce replay registry
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   ├── attack_service.py    # 4 adversary attack vector generators
│   │   │   ├── baseline_service.py  # Monte Carlo noise calibrator
│   │   │   ├── detection_service.py # Deterministic statistical detector
│   │   │   ├── experiment_service.py# End-to-end experiment lifecycle
│   │   │   └── __init__.py
│   │   ├── main.py                  # FastAPI app setup, CORS, lifespans
│   │   └── __init__.py
│   ├── tests/
│   │   ├── conftest.py              # Pytest async fixtures & DB lifecycle
│   │   ├── test_api.py              # Integration tests for all endpoints
│   │   ├── test_quantum.py          # Unit tests for quantum fidelity & metrics
│   │   └── __init__.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── analytics/           # Statistical analysis & ROC metrics
│   │   │   ├── attack-lab/          # Interactive adversary simulation
│   │   │   ├── baseline/            # Noise calibration & threshold setter
│   │   │   ├── docs/                # Mathematical documentation & specs
│   │   │   ├── experiments/         # Experiment history & details [id]
│   │   │   ├── protocol/            # 8-stage circuit stepper & QASM viewer
│   │   │   ├── security-events/     # Live audit log & alert stream
│   │   │   ├── layout.tsx           # Global sidebar navigation & dark theme
│   │   │   ├── page.tsx             # Main operational dashboard
│   │   │   └── globals.css          # Tailwind CSS styles & animations
│   │   ├── lib/
│   │   │   ├── api.ts               # Typed client API wrapper
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   └── utils.ts             # Formatting & style utilities
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── docs/
│   ├── scientific-assumptions.md    # Quantum mechanics proofs & constraints
│   ├── threat-model.md              # Adversary power & attack taxonomy
│   ├── architecture.md              # System design & component breakdown
│   └── experimental-methodology.md  # Monte Carlo validation & test protocols
├── scripts/
│   └── generate_benchmark.py        # Automated benchmark runner & report
├── docker-compose.yml
└── README.md
```

---

## 3. Quantum Execution Pipeline

1. **State Preparation**: User selects target token state $|\psi(\theta)\rangle$. Single-qubit rotation $R_y(\theta)$ is applied to $q_0$.
2. **Bell Pair Entanglement**: Hadamard on $q_1$ followed by CNOT($q_1 \to q_2$) generates the maximally entangled state $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$.
3. **Bell Measurement**: CNOT($q_0 \to q_1$) followed by Hadamard on $q_0$. Mid-circuit measurement yields classical syndrome bits $c_0, c_1$.
4. **Conditional Pauli Correction**: Dynamic feedforward gate application:
   - If $c_1 == 1 \implies X(q_2)$
   - If $c_0 == 1 \implies Z(q_2)$
5. **Final Verification**: Measurement on $q_2$ generates empirical bit counts.
6. **Telemetry & Statistical Analysis**:
   - Computes classical Bhattacharyya fidelity $F(P, Q)$.
   - Computes Total Variation Distance $\Delta_{\text{TVD}}(P, Q)$.
   - Computes Quantum Bit Error Rate ($\text{QBER} = 1 - F$).
7. **Threat Evaluation**: Evaluates quantum anomalies alongside session replay verification.
8. **Persistence**: Saves full OpenQASM 2.0 representation, measurement distributions, and security verdicts to SQLite database.

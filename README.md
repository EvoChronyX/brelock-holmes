# 🕵️‍♂️ Brelock Holmes — Quantum Digital Signature Security & Threat Investigation Platform

[![Qiskit](https://img.shields.io/badge/Qiskit-2.5+-6929C4.svg?style=flat&logo=qiskit&logoColor=white)](https://qiskit.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-3776AB.svg?style=flat&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SIH26](https://img.shields.io/badge/SIH26-Quantum%20Security-orange.svg?style=flat)](#)

> **Production-grade Quantum Digital Signature (QDS) security evaluation, threat simulation, and deterministic statistical anomaly detection platform.**

---

## 📖 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Features](#-key-features)
- [Quantum Protocol & Physics Foundations](#-quantum-protocol--physics-foundations)
- [Adversary Threat Model](#-adversary-threat-model)
- [Deterministic Statistical Detection (Zero ML)](#-deterministic-statistical-detection-zero-ml)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [Docker Deployment](#docker-deployment)
- [Testing & Benchmarking](#-testing--benchmarking)
- [Frontend Navigation Guide](#-frontend-navigation-guide)
- [Scientific Documentation](#-scientific-documentation)
- [License](#-license)

---

## 🌟 Executive Overview

In quantum communication and post-quantum cryptographic infrastructures, **Quantum Digital Signatures (QDS)** provide information-theoretic security based on the fundamental laws of quantum mechanics (No-Cloning Theorem, Heisenberg Uncertainty, and Quantum Entanglement) rather than unproven computational hardness assumptions.

**Brelock Holmes** is an end-to-end research and operational laboratory developed for **Smart India Hackathon (SIH26)**. It provides:
1. **High-Fidelity Quantum Simulation**: Real 3-qubit teleportation-based QDS execution powered by **Qiskit 2.5** and **Qiskit Aer 0.17** with open-quantum Kraus noise models.
2. **Adversary Attack Simulation Engine**: Simulates four distinct quantum and protocol threat vectors (State Forgery, Impersonator Angle Perturbation, Depolarizing Channel Noise Injection, and Session Nonce Replay).
3. **Deterministic Statistical Detection**: Eliminates black-box ML models in favor of provable closed-form metrics (Bhattacharyya Classical Fidelity, Total Variation Distance, and QBER thresholding).
4. **Interactive Security Dashboard**: Modern Next.js 14 research workspace featuring live attack configuration, dynamic 8-stage circuit stepper, OpenQASM 2.0 inspector, Monte Carlo noise calibration, and live forensic audit streams.

---

## ⚡ Key Features

- ⚛️ **Physics-Accurate Quantum Circuits**: 3-qubit teleportation circuit with mid-circuit Bell basis measurement and dynamic Pauli $Z^{c_0} X^{c_1}$ feedforward corrections.
- 🎯 **Symmetry-Breaking Signature State**: Employs $|\psi_{\text{sig}}\rangle = R_y(\pi/3)|0\rangle$ ($P(0)=0.75, P(1)=0.25$) to prevent depolarizing noise degeneracy in computational $Z$-basis measurements.
- 🛡️ **Four Adversary Vectors**:
  - **State Forgery**: Unauthorized orthogonal state $|1\rangle$ substitution ($F \approx 0.25$).
  - **Impersonation**: Angular offset manipulation $\theta + \pi/6$ ($F \approx 0.93$).
  - **Channel Manipulation**: Depolarizing noise injection into EPR distribution channel ($p \ge 0.15$).
  - **Replay Attack**: Protocol-level intercept-resubmit detection of nonces and session tokens.
- 📊 **Dynamic Monte Carlo Calibration**: Calculates sample mean ($\mu$) and standard deviation ($\sigma$) across noise levels to establish $3\sigma$ decision thresholds ($\tau = \mu - 3\sigma$).
- 🔍 **Interactive Circuit Step Inspector**: 8-stage visual stepper mapping Dirac state vectors, operator matrices, and Pauli syndrome truth tables.
- 📑 **Comprehensive OpenQASM 2.0 Support**: Exports exact QASM circuit representations for hardware execution on IBM Quantum systems.
- 🚀 **100% Test & Benchmark Coverage**: Automated test suites and CLI benchmark scripts evaluating sensitivity ($\text{TPR} = 100\%$), specificity ($\text{TNR} = 100\%$), and execution latency ($\le 40\text{ms}$).

---

## 🔬 Quantum Protocol & Physics Foundations

### 1. Quantum Register & Circuit Design
```
Alice (Signer)
  q0: ───[Ry(π/3)]───■───[H]───[M c0]──────────────────────────
                     │
Alice (EPR Half)     │
  q1: ──────[H]──────X─────────[M c1]──────────────────────────
             │
Bob (Recipient)
  q2: ───────■─────────────────────────[X if c1==1]──[Z if c0==1]───[M c2]
```

1. **State Initialization**: Alice prepares the secret signature token:
   $$|\psi_{\text{sig}}\rangle = R_y(\pi/3)|0\rangle = \frac{\sqrt{3}}{2}|0\rangle + \frac{1}{2}|1\rangle$$
2. **Entanglement Resource**: Maximally entangled Bell pair $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ shared across $q_1, q_2$.
3. **Bell Measurement**: Alice executes $\text{CNOT}(q_0 \to q_1)$ and $H(q_0)$, measuring both in the computational basis to yield classical syndrome bits $(c_0, c_1)$.
4. **Feedforward Correction**: Bob applies dynamic Pauli corrections $Z^{c_0} X^{c_1}$ to recover the exact state $|\psi_{\text{sig}}\rangle$ on $q_2$.
5. **Verification**: Bob measures $q_2$ in the $Z$-basis to obtain empirical measurement distributions.

---

## 🦹 Adversary Threat Model

| Attack Vector | Adversary Strategy | Theoretical Impact | Detected Severity |
|---|---|---|---|
| **State Forgery** | Attacker substitutes unauthorized $|1\rangle$ state | $F \approx 0.2500, \Delta_{\text{TVD}} \approx 0.7500$ | `CRITICAL` |
| **Impersonation** | Attacker applies angular offset $\theta + \pi/6$ | $F \approx 0.9330, \Delta_{\text{TVD}} \approx 0.2500$ | `HIGH` |
| **Channel Manipulation** | Eve injects depolarizing noise into EPR channel | $F \approx 0.9500, \Delta_{\text{TVD}} \approx 0.1200$ | `MEDIUM` / `HIGH` |
| **Replay Attack** | Eve re-submits previously captured session/nonce | Valid quantum state, duplicate nonce in registry | `CRITICAL` |

---

## 📐 Deterministic Statistical Detection (Zero ML)

To avoid adversarial poisoning, non-auditable black-box failures, and out-of-distribution drift, Brelock Holmes uses **closed-form mathematical statistical metrics**:

1. **Bhattacharyya Classical State Fidelity**:
   $$F(P, Q) = \left( \sum_{x \in \{0, 1\}} \sqrt{P(x) \cdot Q(x)} \right)^2$$
2. **Total Variation Distance (TVD)**:
   $$\Delta_{\text{TVD}}(P, Q) = \frac{1}{2} \sum_{x \in \{0, 1\}} |P(x) - Q(x)|$$
3. **Quantum Bit Error Rate (QBER)**:
   $$\text{QBER} = 1.0 - F(P, Q)$$

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│               Frontend Presentation Layer (Next.js 14 / Tailwind CSS)  │
│  • Dashboard       • Attack Lab        • Experiments Log & Detail      │
│  • Baseline Lab    • Protocol Stepper  • Security Events & Analytics   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ JSON over HTTP REST
┌────────────────────────────────────▼───────────────────────────────────┐
│               Backend Application Layer (FastAPI / Python 3.11+)       │
│  • Experiment Orchestration   • Attack Simulation Engine               │
│  • Statistical Threat Engine  • Baseline Calibration Service           │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
┌──────────────────▼───────────────┐ ┌───────────────▼───────────────────┐
│     Quantum Simulation Engine    │ │      Database Persistence        │
│  • Qiskit 2.5 / Aer 0.17         │ │  • SQLite / PostgreSQL           │
│  • Dynamic Circuits (if_test)    │ │  • Async SQLAlchemy 2.0 Core     │
│  • Open-Quantum Kraus Channels   │ │  • Experiment & Audit Event Logs │
└──────────────────────────────────┘ └──────────────────────────────────┘
```

---

## 📁 Repository Structure

```
brelock-holmes/
├── backend/
│   ├── app/
│   │   ├── api/routes.py            # FastAPI REST endpoints
│   │   ├── core/                    # Config & structured logging
│   │   ├── db/                      # Models & async session manager
│   │   ├── quantum/                 # Qiskit circuits, noise, & measurements
│   │   ├── schemas/                 # Pydantic v2 data models
│   │   ├── security/                # Thresholds & session replay registry
│   │   ├── services/                # Attack, detection, & calibration services
│   │   └── main.py                  # FastAPI application entrypoint
│   ├── tests/
│   │   ├── test_api.py              # API endpoint integration tests
│   │   └── test_quantum.py          # Quantum fidelity & physics tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                     # 8 Next.js application routes
│   │   └── lib/                     # API client, TypeScript types, & utils
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── scientific-assumptions.md    # Formal physics proofs & limits
│   ├── threat-model.md              # Adversary power & attack taxonomy
│   ├── architecture.md              # Technical system design
│   └── experimental-methodology.md  # Monte Carlo validation protocols
├── scripts/
│   └── generate_benchmark.py        # Automated benchmark runner & report
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: `3.11+`
- **Node.js**: `18.0+` & `npm 9.0+`
- **Docker** & **Docker Compose** *(optional for containerized run)*

---

### Local Development Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Linux/macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Backend runs at `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).*

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend research dashboard runs at `http://localhost:3000`.*

---

### Docker Deployment

To launch the complete platform in isolated containers:
```bash
docker-compose up --build
```
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`

---

## 🧪 Testing & Benchmarking

### 1. Run Backend Unit & Integration Tests
```bash
cd backend
python -m pytest tests/ -v
```
*Output: 17 passed tests in ~1.3s.*

### 2. Run Automated Quantum Threat Benchmark
```bash
python scripts/generate_benchmark.py
```
*Executes 80 quantum Monte Carlo simulation runs across all 4 attack vectors and produces a complete confusion matrix report (`benchmark_results.json`).*

---

## 🖥️ Frontend Navigation Guide

| Page Route | Purpose & Key Components |
|---|---|
| `/` | **Operations Dashboard**: Real-time telemetry, KPI cards, attack distribution charts, quick attack simulator. |
| `/attack-lab` | **Quantum Attack Simulation Lab**: Interactive adversary panel, channel noise selector, observed vs expected distribution comparison, OpenQASM 2.0 inspector. |
| `/experiments` | **Experiment History**: Paginated log of historical quantum signatures with filtering and telemetry drawers. |
| `/experiments/[id]` | **Experiment Deep-Dive**: In-depth analysis of specific signatures, Dirac state breakdowns, and raw measurement counts. |
| `/protocol` | **Protocol & Circuits**: 8-stage interactive teleportation stepper, Pauli syndrome truth tables, and Dirac equation evolution. |
| `/baseline` | **Baseline & Calibration**: Monte Carlo noise calibration harness, $3\sigma$ threshold setter, and degradation visualizer. |
| `/security-events` | **Security Event Audit Stream**: Real-time forensic audit log with live filtering and severity classification. |
| `/analytics` | **Statistical Analytics**: 2x2 Confusion matrix, ROC sensitivity curves, and scientific detection justifications. |
| `/docs` | **Documentation Workspace**: Embedded mathematical specifications, API reference, and operational envelopes. |

---

## 📚 Scientific Documentation

Deep-dive scientific references are located in the `/docs` directory:
- [Scientific Assumptions & Proofs](docs/scientific-assumptions.md)
- [Quantum Threat Model & Adversary Taxonomy](docs/threat-model.md)
- [System Architecture Specification](docs/architecture.md)
- [Experimental Methodology & Calibration Protocols](docs/experimental-methodology.md)

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH26)**.  
Licensed under the **MIT License**.

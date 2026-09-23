# Experimental Methodology & Benchmark Protocols

## 1. Overview & Objective

This document formalizes the experimental design, baseline calibration methodology, Monte Carlo simulation protocols, and validation criteria used by Brelock Holmes to evaluate quantum signature authenticity.

---

## 2. Monte Carlo Noise Calibration Methodology

To differentiate environmental noise from malicious attacks, the system runs an automated baseline calibration procedure:

```
[Noise Level Loop: p ∈ {0.0, 0.01, 0.05, 0.10, 0.15}]
         │
         ▼
[Run N = 10..50 Trials per Noise Level]
         │
         ▼
[Execute 3-Qubit Teleportation Circuit with AerSimulator]
         │
         ▼
[Collect Sample Distributions: {F_i}, {TVD_i}, {QBER_i}]
         │
         ▼
[Compute Sample Mean (μ) and Sample Standard Deviation (σ)]
         │
         ▼
[Derive Conservative Decision Boundary: Threshold = μ - 3σ]
```

### 2.1 Three-Sigma ($3\sigma$) Decision Boundary
Assuming Gaussian metric fluctuations near the noiseless limit:
$$\tau_{\text{fidelity}}(p) = \mu_F(p) - 3\sigma_F(p)$$
$$\tau_{\text{deviation}}(p) = \mu_{\text{TVD}}(p) + 3\sigma_{\text{TVD}}(p)$$

For standard noiseless operation ($p = 0.00$):
- $\mu_F \approx 0.9992$, $\sigma_F \approx 0.0015$
- Calibrated $\tau_{\text{fidelity}} = 0.9992 - 3(0.0015) = 0.9947$
- Operational default lower bound across moderate hardware drift: $\tau_{\text{min}} = 0.9000$.

---

## 3. Threat Benchmark Protocol

Each attack vector is tested across multiple shot counts ($N \in \{128, 512, 1024, 4096, 8192\}$) and noise conditions:

### 3.1 Vector Evaluation Matrix

| Experiment Type | Noise Type | Noise Level ($p$) | Parameter Variation | Expected Outcome | Target Metric |
|---|---|---|---|---|---|
| **Clean Baseline** | None | 0.00 | $\theta = \pi/3$ | `NORMAL` | $F > 0.99, \Delta_{\text{TVD}} < 0.03$ |
| **Clean Baseline** | Depolarizing | 0.02 | $\theta = \pi/3$ | `NORMAL` | $F > 0.97, \Delta_{\text{TVD}} < 0.06$ |
| **State Forgery** | None | 0.00 | Attacker sends $|1\rangle$ | `THREAT_DETECTED` (Critical) | $F \approx 0.25, \Delta_{\text{TVD}} \approx 0.75$ |
| **State Forgery** | Depolarizing | 0.05 | Attacker sends $|1\rangle$ | `THREAT_DETECTED` (Critical) | $F < 0.35, \Delta_{\text{TVD}} > 0.60$ |
| **Impersonation** | None | 0.00 | $\theta = \pi/3 + \pi/6$ | `THREAT_DETECTED` (High) | $F \approx 0.933, \Delta_{\text{TVD}} \approx 0.25$ |
| **Channel Attack** | Depolarizing | 0.20 | Eve noise injection | `THREAT_DETECTED` (Medium) | $F \approx 0.95, \Delta_{\text{TVD}} \approx 0.12$ |
| **Replay Attack** | None | 0.00 | Re-used Nonce/Session | `THREAT_DETECTED` (Critical) | Nonce validation failure |

---

## 4. Confusion Matrix & Detection Efficacy Metrics

The detection effectiveness is evaluated via standard binary classification metrics:

- **True Positive Rate (Sensitivity / Recall)**:
  $$\text{TPR} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$
- **False Positive Rate (Fall-out)**:
  $$\text{FPR} = \frac{\text{FP}}{\text{FP} + \text{TN}}$$
- **Precision**:
  $$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$
- **Specificity (True Negative Rate)**:
  $$\text{TNR} = \frac{\text{TN}}{\text{TN} + \text{FP}}$$

### Target Performance Envelopes
- $\text{TPR} \ge 99.0\%$
- $\text{FPR} \le 1.0\%$
- Mean Circuit Execution Latency $\le 50\text{ms}$ on CPU Qiskit Aer simulator.

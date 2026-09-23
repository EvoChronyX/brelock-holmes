#!/usr/bin/env python3
"""Automated benchmark runner for Brelock Holmes Quantum Digital Signature platform.

Evaluates teleportation fidelity, attack detection accuracy, false positive rates,
and execution latency across varying shots and noise regimes.
"""

import json
import os
import sys
import time
from dataclasses import asdict, dataclass

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.quantum.states import PROTOCOL_DEFAULT_STATE
from app.quantum.teleportation import run_teleportation
from app.services.attack_service import (
    simulate_channel_manipulation,
    simulate_forgery,
    simulate_impersonation,
)
from app.services.detection_service import detect
from app.security.validators import clear_registry, register_session, is_replay


@dataclass
class BenchmarkTrialResult:
    scenario: str
    ground_truth: str  # "NORMAL" or "ATTACK"
    attack_vector: str
    shots: int
    noise_level: float
    fidelity: float
    deviation: float
    detection_status: str
    detected_attack_type: str
    severity: str
    execution_time_ms: float
    is_correct: bool


def run_single_test(
    scenario: str,
    ground_truth: str,
    attack_vector: str,
    shots: int,
    noise_type: str = "none",
    noise_level: float = 0.0,
    seed: int | None = None,
) -> BenchmarkTrialResult:
    session_id = f"bench-sess-{time.time_ns()}"
    nonce = f"bench-nonce-{time.time_ns()}"
    start = time.perf_counter()

    if attack_vector == "normal":
        qr = run_teleportation(PROTOCOL_DEFAULT_STATE, shots, noise_type, noise_level, seed=seed)
        det = detect(qr, session_id, nonce, noise_type, noise_level)
    elif attack_vector == "forgery":
        qr = simulate_forgery(shots, noise_type, noise_level, seed=seed)
        det = detect(qr, session_id, nonce, noise_type, noise_level)
    elif attack_vector == "impersonation":
        qr = simulate_impersonation(shots, noise_type, noise_level, seed=seed)
        det = detect(qr, session_id, nonce, noise_type, noise_level)
    elif attack_vector == "channel_manipulation":
        qr = simulate_channel_manipulation(shots, noise_type, noise_level, attack_noise_level=0.20, seed=seed)
        det = detect(qr, session_id, nonce, noise_type, noise_level)
    elif attack_vector == "replay":
        qr = run_teleportation(PROTOCOL_DEFAULT_STATE, shots, noise_type, noise_level, seed=seed)
        register_session(session_id, nonce)
        det = detect(qr, session_id, nonce, noise_type, noise_level)
    else:
        raise ValueError(f"Unknown attack vector: {attack_vector}")

    elapsed_ms = (time.perf_counter() - start) * 1000

    # Determine classification correctness
    expected_status = "NORMAL" if ground_truth == "NORMAL" else "THREAT_DETECTED"
    is_correct = (det.status == expected_status)

    return BenchmarkTrialResult(
        scenario=scenario,
        ground_truth=ground_truth,
        attack_vector=attack_vector,
        shots=shots,
        noise_level=noise_level,
        fidelity=qr.fidelity,
        deviation=qr.deviation,
        detection_status=det.status,
        detected_attack_type=det.attack_type,
        severity=det.severity,
        execution_time_ms=elapsed_ms,
        is_correct=is_correct,
    )


def run_full_benchmark(trials_per_config: int = 15) -> dict:
    clear_registry()
    print("=" * 80)
    print("  BRELOCK HOLMES — QUANTUM DIGITAL SIGNATURE SECURITY BENCHMARK")
    print("=" * 80)
    print(f"Executing {trials_per_config} iterations per test matrix configuration...\n")

    test_configs = [
        # Normal operations (Clean & Low Noise)
        ("Clean Baseline (No Noise)", "NORMAL", "normal", 1024, "none", 0.0),
        ("Hardware Noise Baseline (p=0.02)", "NORMAL", "normal", 1024, "depolarizing", 0.02),
        ("Hardware Noise Baseline (p=0.05)", "NORMAL", "normal", 1024, "depolarizing", 0.05),

        # Attack vectors
        ("State Forgery (|1⟩ vs |ψ⟩)", "ATTACK", "forgery", 1024, "none", 0.0),
        ("State Forgery with Channel Noise", "ATTACK", "forgery", 1024, "depolarizing", 0.03),
        ("Impersonation (θ + π/6 Offset)", "ATTACK", "impersonation", 1024, "none", 0.0),
        ("Channel Depolarizing Tampering", "ATTACK", "channel_manipulation", 1024, "none", 0.0),
        ("Session / Nonce Replay", "ATTACK", "replay", 1024, "none", 0.0),
    ]

    all_results: list[BenchmarkTrialResult] = []

    tp = fp = tn = fn = 0
    total_latency_ms = 0.0

    for label, truth, vector, shots, noise_type, noise_level in test_configs:
        print(f"Running [{label}] ...", end=" ", flush=True)
        config_results = []
        for i in range(trials_per_config):
            res = run_single_test(
                scenario=label,
                ground_truth=truth,
                attack_vector=vector,
                shots=shots,
                noise_type=noise_type,
                noise_level=noise_level,
                seed=42 + i,
            )
            config_results.append(res)
            all_results.append(res)
            total_latency_ms += res.execution_time_ms

            if truth == "ATTACK":
                if res.detection_status == "THREAT_DETECTED":
                    tp += 1
                else:
                    fn += 1
            else:  # NORMAL
                if res.detection_status == "NORMAL":
                    tn += 1
                else:
                    fp += 1

        avg_fid = sum(r.fidelity for r in config_results) / len(config_results)
        avg_dev = sum(r.deviation for r in config_results) / len(config_results)
        accuracy = sum(1 for r in config_results if r.is_correct) / len(config_results) * 100
        print(f"Done (F̄={avg_fid:.4f}, Δ̄_TVD={avg_dev:.4f}, Acc={accuracy:.1f}%)")

    total_tests = len(all_results)
    tpr = (tp / (tp + fn)) * 100 if (tp + fn) > 0 else 0.0
    fpr = (fp / (fp + tn)) * 100 if (fp + tn) > 0 else 0.0
    precision = (tp / (tp + fp)) * 100 if (tp + fp) > 0 else 0.0
    specificity = (tn / (tn + fp)) * 100 if (tn + fp) > 0 else 0.0
    avg_latency = total_latency_ms / total_tests if total_tests > 0 else 0.0

    print("\n" + "=" * 80)
    print("  DETECTION ACCURACY & CONFUSION MATRIX REPORT")
    print("=" * 80)
    print(f"Total Trials Executed:       {total_tests}")
    print(f"True Positives (TP):         {tp}")
    print(f"False Positives (FP):        {fp}")
    print(f"True Negatives (TN):         {tn}")
    print(f"False Negatives (FN):        {fn}")
    print("-" * 80)
    print(f"Sensitivity (TPR / Recall):  {tpr:.2f}%")
    print(f"Fall-out (FPR):              {fpr:.2f}%")
    print(f"Precision:                   {precision:.2f}%")
    print(f"Specificity (TNR):           {specificity:.2f}%")
    print(f"Mean Execution Latency:      {avg_latency:.2f} ms")
    print("=" * 80)

    summary = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_trials": total_tests,
        "confusion_matrix": {"tp": tp, "fp": fp, "tn": tn, "fn": fn},
        "metrics": {
            "true_positive_rate": round(tpr, 2),
            "false_positive_rate": round(fpr, 2),
            "precision": round(precision, 2),
            "specificity": round(specificity, 2),
            "average_latency_ms": round(avg_latency, 2),
        },
        "trials": [asdict(r) for r in all_results],
    }

    # Save output to disk
    output_path = os.path.join(os.path.dirname(__file__), "benchmark_results.json")
    with open(output_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"\nDetailed benchmark report exported to: {output_path}\n")

    return summary


if __name__ == "__main__":
    run_full_benchmark(trials_per_config=10)

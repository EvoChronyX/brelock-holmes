"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Code2,
  Copy,
  Check,
  Activity,
  AlertTriangle,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EndpointDoc {
  id: string;
  method: "GET" | "POST" | "DELETE" | "PUT";
  path: string;
  category: "Health" | "Experiments" | "Attacks" | "Security Events" | "Analytics" | "Baseline" | "Protocols" | "Innovations";
  summary: string;
  description: string;
  requestBody?: string;
  responseSchema: string;
  curlExample: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: "health",
    method: "GET",
    path: "/api/v1/health",
    category: "Health",
    summary: "System Health & Backend Status",
    description: "Returns health status of the FastAPI backend, Qiskit Aer simulator engine, and database connectivity.",
    responseSchema: `{
  "status": "healthy",
  "engine": "qiskit_aer",
  "version": "2.5.0",
  "uptime_seconds": 14205.8
}`,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/health" \\
  -H "Accept: application/json"`,
  },
  {
    id: "create-experiment",
    method: "POST",
    path: "/api/v1/experiments",
    category: "Experiments",
    summary: "Create & Execute Single Experiment",
    description: "Executes a teleportation-based QDS quantum circuit with custom parameters, state angles, noise models, and shot counts.",
    requestBody: `{
  "theta": 1.570796,
  "shots": 1024,
  "noise_model": "depolarizing",
  "noise_param": 0.05,
  "notes": "Standard baseline verification"
}`,
    responseSchema: `{
  "id": "exp_8f1a23c4",
  "timestamp": "2026-09-23T14:32:10.512Z",
  "protocol": "teleportation_qds",
  "shots": 1024,
  "theta": 1.570796,
  "fidelity": 0.9654,
  "deviation": 0.0346,
  "measurement_counts": { "0": 524, "1": 500 },
  "status": "NORMAL"
}`,
    curlExample: `curl -X POST "http://localhost:8000/api/v1/experiments" \\
  -H "Content-Type: application/json" \\
  -d '{
    "theta": 1.570796,
    "shots": 1024,
    "noise_model": "depolarizing",
    "noise_param": 0.05
  }'`,
  },
  {
    id: "list-experiments",
    method: "GET",
    path: "/api/v1/experiments",
    category: "Experiments",
    summary: "List Historical Experiments",
    description: "Fetches paginated list of all executed quantum experiments with summary metrics and threat flags.",
    responseSchema: `[
  {
    "id": "exp_8f1a23c4",
    "timestamp": "2026-09-23T14:32:10.512Z",
    "shots": 1024,
    "fidelity": 0.9654,
    "deviation": 0.0346,
    "status": "NORMAL"
  }
]`,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/experiments?limit=25&offset=0" \\
  -H "Accept: application/json"`,
  },
  {
    id: "get-experiment",
    method: "GET",
    path: "/api/v1/experiments/{id}",
    category: "Experiments",
    summary: "Get Experiment by ID",
    description: "Retrieves complete execution details, measurement probability distribution, and statevector diagnostics.",
    responseSchema: `{
  "id": "exp_8f1a23c4",
  "timestamp": "2026-09-23T14:32:10.512Z",
  "protocol": "teleportation_qds",
  "shots": 1024,
  "theta": 1.570796,
  "fidelity": 0.9654,
  "deviation": 0.0346,
  "counts": { "0": 524, "1": 500 },
  "probabilities": { "0": 0.5117, "1": 0.4883 },
  "expected_probabilities": { "0": 0.5000, "1": 0.5000 },
  "duration_ms": 42.8,
  "status": "NORMAL"
}`,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/experiments/exp_8f1a23c4" \\
  -H "Accept: application/json"`,
  },
  {
    id: "simulate-attack",
    method: "POST",
    path: "/api/v1/attacks/simulate",
    category: "Attacks",
    summary: "Simulate Adversarial Attack",
    description: "Simulates an eavesdropping or tampering attack against the QDS protocol and evaluates statistical detection response.",
    requestBody: `{
  "attack_type": "intercept_resend",
  "noise_level": 0.05,
  "shots": 1024,
  "theta": 1.570796
}`,
    responseSchema: `{
  "id": "att_4b9e7110",
  "attack_type": "intercept_resend",
  "fidelity": 0.6241,
  "deviation": 0.3759,
  "threat_detected": true,
  "severity": "HIGH",
  "bhattacharyya_coefficient": 0.6241,
  "total_variation_distance": 0.3759,
  "confidence": 0.994,
  "explanation": "State collapse from projective measurement caused 37.59% deviation exceeding threshold 0.1500."
}`,
    curlExample: `curl -X POST "http://localhost:8000/api/v1/attacks/simulate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "attack_type": "intercept_resend",
    "noise_level": 0.05,
    "shots": 1024
  }'`,
  },
  {
    id: "list-security-events",
    method: "GET",
    path: "/api/v1/security-events",
    category: "Security Events",
    summary: "List Security Events",
    description: "Queries all flagged anomalies, eavesdropping incidents, replay attacks, and threshold violations.",
    responseSchema: `[
  {
    "id": "sec_7a2b9c1d",
    "timestamp": "2026-09-23T14:40:02.100Z",
    "event_type": "INTERCEPT_RESEND_ATTACK",
    "severity": "CRITICAL",
    "fidelity": 0.498,
    "deviation": 0.502,
    "source_ip": "192.168.1.104",
    "status": "FLAGGED",
    "details": "Fidelity collapsed below critical bound (0.7500)."
  }
]`,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/security-events?severity=CRITICAL" \\
  -H "Accept: application/json"`,
  },
  {
    id: "get-security-event",
    method: "GET",
    path: "/api/v1/security-events/{id}",
    category: "Security Events",
    summary: "Get Security Event Details",
    description: "Retrieves complete forensic payload and measurement distribution breakdown for a specific security event.",
    responseSchema: `{
  "id": "sec_7a2b9c1d",
  "timestamp": "2026-09-23T14:40:02.100Z",
  "event_type": "INTERCEPT_RESEND_ATTACK",
  "severity": "CRITICAL",
  "fidelity": 0.498,
  "deviation": 0.502,
  "forensics": {
    "expected_counts": { "0": 512, "1": 512 },
    "observed_counts": { "0": 768, "1": 256 },
    "tvd": 0.250,
    "p_value": 0.000001
  }
}`,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/security-events/sec_7a2b9c1d" \\
  -H "Accept: application/json"`,
  },
  {
    id: "get-analytics-summary",
    method: "GET",
    path: "/api/v1/analytics/summary",
    category: "Analytics",
    summary: "Get Analytics & Metrics Summary",
    description: "Provides aggregate statistics: total experiments, detected attacks, average fidelity, noise impact curves, and threat breakdown.",
    responseSchema: `{
  "total_experiments": 1248,
  "normal_runs": 1102,
  "threat_events": 146,
  "average_fidelity": 0.9412,
  "detection_accuracy": 0.9984,
  "false_positive_rate": 0.0016,
  "attack_breakdown": {
    "intercept_resend": 58,
    "entanglement_swapping": 34,
    "phase_flip": 32,
    "replay": 22
  }
}`,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/analytics/summary" \\
  -H "Accept: application/json"`,
  },
  {
    id: "calibrate-baseline",
    method: "POST",
    path: "/api/v1/baseline/calibrate",
    category: "Baseline",
    summary: "Execute Baseline Calibration",
    description: "Runs multi-point Monte Carlo sampling across noise levels to compute empirical mean, variance, and dynamic detection thresholds.",
    requestBody: `{
  "shots": 1024,
  "noise_levels": [0.0, 0.05, 0.1, 0.15, 0.2],
  "runs_per_level": 5
}`,
    responseSchema: `{
  "status": "success",
  "calibrated_at": "2026-09-23T14:45:00.000Z",
  "total_samples": 25,
  "results": [
    {
      "noise_level": 0.0,
      "mean_fidelity": 0.9985,
      "std_fidelity": 0.0012,
      "mean_deviation": 0.0124,
      "std_deviation": 0.0031
    }
  ],
  "recommended_thresholds": {
    "fidelity_threshold": 0.8500,
    "deviation_threshold": 0.1500
  }
}`,
    curlExample: `curl -X POST "http://localhost:8000/api/v1/baseline/calibrate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "shots": 1024,
    "noise_levels": [0.0, 0.05, 0.1, 0.15, 0.2],
    "runs_per_level": 5
  }'`,
  },
  {
    id: "get-baseline",
    method: "GET",
    path: "/api/v1/baseline",
    category: "Baseline",
    summary: "Get Active Baseline Calibration",
    description: "Retrieves the currently active calibration baseline data, noise profiles, and dynamic gating bounds.",
    responseSchema: `{
  "calibrated": true,
  "calibrated_at": "2026-09-23T14:45:00.000Z",
  "shots": 1024,
  "recommended_fidelity_threshold": 0.8500,
  "recommended_deviation_threshold": 0.1500
}`,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/baseline" \\
  -H "Accept: application/json"`,
  },
  {
    id: "tensor-verify",
    method: "POST",
    path: "/api/v1/innovations/tensor-network/verify",
    category: "Innovations",
    summary: "MPS Tensor Network State Verification",
    description: "Evaluates classical Matrix Product State (MPS) tensor network overlap, bond dimension, and bipartite entanglement entropy.",
    requestBody: `{
  "state_type": "Ry_pi_3",
  "bond_dimension": 4,
  "noise_param": 0.05
}`,
    responseSchema: `{
  "fidelity": 0.9812,
  "entanglement_entropy": 0.6931,
  "singular_values": [0.7071, 0.7071],
  "is_valid": true
}`,
    curlExample: `curl -X POST "http://localhost:8000/api/v1/innovations/tensor-network/verify" \\
  -H "Content-Type: application/json" \\
  -d '{"state_type": "Ry_pi_3", "bond_dimension": 4}'`,
  },
  {
    id: "tomography-bloch",
    method: "POST",
    path: "/api/v1/innovations/tomography/reconstruct",
    category: "Innovations",
    summary: "3-Basis Pauli Tomography & 3D Bloch Reconstruction",
    description: "Performs full Pauli operator (X, Y, Z) expectation reconstruction, density matrix generation, purity, and Bloch sphere coordinates.",
    requestBody: `{
  "state_type": "Ry_pi_3",
  "shots": 2048,
  "noise_param": 0.05
}`,
    responseSchema: `{
  "density_matrix": [[0.74, 0.0], [0.0, 0.26]],
  "bloch_vector": [0.866, 0.0, 0.500],
  "purity": 0.975,
  "entropy": 0.082
}`,
    curlExample: `curl -X POST "http://localhost:8000/api/v1/innovations/tomography/reconstruct" \\
  -H "Content-Type: application/json" \\
  -d '{"state_type": "Ry_pi_3", "shots": 2048}'`,
  },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"threat" | "methodology" | "assumptions" | "api">("threat");
  const [copiedCurlId, setCopiedCurlId] = useState<string | null>(null);
  const [selectedEndpointCategory, setSelectedEndpointCategory] = useState<string>("All");

  const handleCopyCurl = (id: string, curl: string) => {
    navigator.clipboard.writeText(curl);
    setCopiedCurlId(id);
    setTimeout(() => setCopiedCurlId(null), 2000);
  };

  const categories = ["All", "Health", "Experiments", "Attacks", "Security Events", "Analytics", "Baseline", "Protocols", "Innovations"];

  const filteredEndpoints = selectedEndpointCategory === "All"
    ? ENDPOINTS
    : ENDPOINTS.filter((ep) => ep.category === selectedEndpointCategory);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase tracking-widest mb-1">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          Scientific Whitepaper & Architecture Reference
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Scientific Documentation & Specifications
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Comprehensive scientific specifications for the Brelock Holmes quantum digital signature threat detection system.
          Covers threat modeling, statistical gating theory, scientific auditability, physical limitations, and backend API endpoints.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("threat")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap",
            activeTab === "threat"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <ShieldAlert className="w-4 h-4" />
          Threat Model & Adversary Capabilities
        </button>

        <button
          onClick={() => setActiveTab("methodology")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap",
            activeTab === "methodology"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <Activity className="w-4 h-4" />
          Detection Methodology & Why No ML
        </button>

        <button
          onClick={() => setActiveTab("assumptions")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap",
            activeTab === "assumptions"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <Cpu className="w-4 h-4" />
          Protocol Assumptions & Physical Limits
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap",
            activeTab === "api"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <Code2 className="w-4 h-4" />
          API Reference ({ENDPOINTS.length} Endpoints)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: THREAT MODEL                                                      */}
      {/* ========================================================================= */}
      {activeTab === "threat" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Adversary Threat Model (Eve&apos;s Capabilities)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              In our quantum threat model, the eavesdropper/forger (<strong>Eve</strong>) possesses full physical access to the
              untrusted quantum channel between the signer (Alice) and the verifier (Bob). Eve may also eavesdrop on the
              classical broadcast channel, subject to standard cryptographic authentication guarantees.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Threat 1 */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-rose-900">
                    1. Quantum Channel Intercept & Resend
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                    ACTIVE TAMPERING
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Vector:</strong> Eve intercepts flying qubits on the quantum link, performs projective measurements
                  in an arbitrary basis &#123;|0&rang;, |1&rang;&#125; or &#123;|+&rang;, |-&rang;&#125;, and re-transmits newly prepared states to Bob.
                </p>
                <div className="text-[11px] font-mono text-rose-900 bg-white p-2.5 rounded border border-rose-200">
                  Impact: State collapse causes expected 25% to 50% error rate on Bell correlation, severely depressing Bhattacharyya fidelity.
                </div>
              </div>

              {/* Threat 2 */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-amber-900">
                    2. State & Angle Forgery
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    IMPERSONATION
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Vector:</strong> An adversary attempts to generate a signature for an unauthorized message by preparing an
                  arbitrary state parameter &theta;_forge &ne; &theta;_valid.
                </p>
                <div className="text-[11px] font-mono text-amber-900 bg-white p-2.5 rounded border border-amber-200">
                  Impact: When Bob verifies against the claimed &theta;_valid, the observed distribution P(0) = cos&sup2;(&theta;_forge/2) diverges from P_exp(0).
                </div>
              </div>

              {/* Threat 3 */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-indigo-900">
                    3. Entanglement Swapping & Eavesdropping
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                    MAN-IN-THE-MIDDLE
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Vector:</strong> Eve generates her own auxiliary Bell pair and performs joint Bell state measurements on Alice&apos;s
                  transmitted EPR half to entangle her probe qubit with Bob&apos;s receiver.
                </p>
                <div className="text-[11px] font-mono text-indigo-900 bg-white p-2.5 rounded border border-indigo-200">
                  Impact: Monogamy of entanglement strictly prevents tripartite maximal entanglement; Bob&apos;s state purity drops to Tr(&rho;&sup2;) &lt; 1.
                </div>
              </div>

              {/* Threat 4 */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-purple-900">
                    4. Replay & Nonce Substitution
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                    REPLAY ATTACK
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Vector:</strong> Eve captures valid classical syndrome bits (c0, c1) and timestamp nonces from a past transaction
                  and replays them with stale quantum signatures.
                </p>
                <div className="text-[11px] font-mono text-purple-900 bg-white p-2.5 rounded border border-purple-200">
                  Impact: Gating engine enforces single-use session nonces and time-bounded freshness windows, rejecting duplicates instantly.
                </div>
              </div>
            </div>
          </div>

          {/* Threat Matrix Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Threat Detection & Countermeasure Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px] bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Attack Class</th>
                    <th className="py-2.5 px-3 font-semibold">Adversary Action</th>
                    <th className="py-2.5 px-3 font-semibold">Physical Quantum Symptom</th>
                    <th className="py-2.5 px-3 font-semibold">Detection Metric</th>
                    <th className="py-2.5 px-3 font-semibold">Defense Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-rose-600">Intercept-Resend</td>
                    <td className="py-2.5 px-3">Measure flying qubit</td>
                    <td className="py-2.5 px-3 text-slate-600">Decoherence &amp; collapse</td>
                    <td className="py-2.5 px-3 text-indigo-700 font-semibold">Fidelity &lt; 0.85, TVD &gt; 0.15</td>
                    <td className="py-2.5 px-3 text-rose-700 font-bold">Reject &amp; Log Incident</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-amber-600">Angle Forgery</td>
                    <td className="py-2.5 px-3">Inject incorrect &theta;</td>
                    <td className="py-2.5 px-3 text-slate-600">Skewed probability ratio</td>
                    <td className="py-2.5 px-3 text-indigo-700 font-semibold">Distribution Deviation &gt; 0.20</td>
                    <td className="py-2.5 px-3 text-rose-700 font-bold">Invalidate Signature</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-yellow-600">Channel Noise Spike</td>
                    <td className="py-2.5 px-3">Depolarizing noise &gt; 0.15</td>
                    <td className="py-2.5 px-3 text-slate-600">Gradual fidelity loss</td>
                    <td className="py-2.5 px-3 text-indigo-700 font-semibold">Baseline &mu; &minus; 2&sigma; bound</td>
                    <td className="py-2.5 px-3 text-yellow-700 font-bold">Warning / Recalibrate</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-purple-600">Replay Attack</td>
                    <td className="py-2.5 px-3">Re-transmit past syndrome</td>
                    <td className="py-2.5 px-3 text-slate-600">Randomized Bell mismatch</td>
                    <td className="py-2.5 px-3 text-indigo-700 font-semibold">Nonce freshness & TVD</td>
                    <td className="py-2.5 px-3 text-rose-700 font-bold">Reject with Audit Alert</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DETECTION METHODOLOGY & WHY NO ML                                 */}
      {/* ========================================================================= */}
      {activeTab === "methodology" && (
        <div className="space-y-6">
          {/* Mathematical Formulations */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Mathematical Detection Formulation
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Brelock Holmes evaluates statistical distance metrics over empirical quantum measurement distributions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formula 1: Bhattacharyya Coefficient */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    1. Bhattacharyya Classical Fidelity (F)
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-700 px-2 py-0.5 bg-indigo-100 border border-indigo-200 rounded font-bold">
                    PRIMARY METRIC
                  </span>
                </div>
                <div className="text-xs font-mono text-indigo-900 bg-white p-3 rounded border border-slate-200 font-medium overflow-x-auto">
                  {"F(P_exp, P_obs) = ( \\sum_{x \\in \\{0,1\\}} \\sqrt{P_exp(x) \\cdot P_obs(x)} )^2"}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Measures statistical overlap between expected quantum distribution <em>P</em><sub>exp</sub> and empirical shot counts <em>P</em><sub>obs</sub>.
                  Yields <em>F</em> = 1.0 for perfect fidelity and <em>F</em> &asymp; 0.5 under maximum entropy disturbance.
                </p>
              </div>

              {/* Formula 2: Total Variation Distance */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Total Variation Distance (&delta;)
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-700 px-2 py-0.5 bg-cyan-100 border border-cyan-200 rounded font-bold">
                    DISTANCE BOUND
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-900 bg-white p-3 rounded border border-slate-200 font-medium overflow-x-auto">
                  {"\\delta(P_exp, P_obs) = (1/2) * \\sum_{x \\in \\{0,1\\}} |P_exp(x) - P_obs(x)|"}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Represents the maximum probability difference for any observable event. Bounded strictly in [0, 1],
                  providing an intuitive metric for absolute statistical deviation.
                </p>
              </div>
            </div>

            {/* Empirical 2-Sigma Calibration */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 space-y-3">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Dynamic Statistical Calibration (2&sigma; Empirical Bounds)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Rather than hardcoding static magic numbers, detection thresholds &tau;<sub>F</sub> and &tau;<sub>D</sub> are computed dynamically
                during hardware calibration under clean and noisy channel conditions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-white p-3 rounded border border-indigo-200 text-slate-800">
                  <span className="text-emerald-700 font-bold">&tau;<sub>F</sub></span> = min<sub>p</sub> (&mu;<sub>F</sub>(p) - 2&sigma;<sub>F</sub>(p))
                  <p className="text-[11px] text-slate-500 mt-1 font-sans">
                    Guarantees 97.7% confidence interval under normal operational noise.
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-indigo-200 text-slate-800">
                  <span className="text-amber-700 font-bold">&tau;<sub>D</sub></span> = max<sub>p</sub> (&mu;<sub>D</sub>(p) + 2&sigma;<sub>D</sub>(p))
                  <p className="text-[11px] text-slate-500 mt-1 font-sans">
                    Tolerates shot noise while rejecting structural deviations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SCIENTIFIC JUSTIFICATION: WHY ML IS EXCLUDED */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Scientific Rationale: Why Machine Learning (ML) is Explicitly Excluded
              </h2>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              In security-critical quantum cryptographic verification, replacing deterministic statistical hypothesis testing
              with deep learning or neural classifiers introduces catastrophic failure modes. Brelock Holmes intentionally uses
              closed-form statistical proofs for the following foundational scientific reasons:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-lg bg-white p-4 border border-amber-200 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  1. Provable False Positive Bounds
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Statistical confidence intervals (2&sigma;, 3&sigma;) have exact closed-form Chebyshev / Hoeffding bounds.
                  In contrast, neural classifiers cannot prove zero false-negative guarantees on unseen adversarial quantum states.
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 border border-amber-200 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  2. Full Auditability & Reproducibility
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every decision in Brelock Holmes is verifiable by any peer reviewer or external court using basic arithmetic on
                  raw shot counts. There are no opaque weight matrices or black-box embeddings.
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 border border-amber-200 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  3. Immunity to Adversarial Poisoning
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Adversarial quantum noise patterns can easily trick gradient-based neural networks (adversarial samples).
                  Closed-form Bhattacharyya distance is mathematically immune to gradient-based evasion attacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROTOCOL ASSUMPTIONS & PHYSICAL LIMITS                            */}
      {/* ========================================================================= */}
      {activeTab === "assumptions" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Protocol Assumptions & Physical Operational Limits
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every quantum cryptographic system operates within specific physical boundaries and security assumptions.
              The following constraints delineate the verified operational envelope of the Brelock Holmes platform:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  1. Authenticated Classical Channel
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Assumption:</strong> Classical syndrome bits (<em>c</em><sub>0</sub>, <em>c</em><sub>1</sub>) are transmitted over an authenticated channel
                  (e.g., protected by Wegman-Carter information-theoretic MACs or Post-Quantum Cryptography signatures).
                  Eve can read the classical bits but cannot alter them without detection.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  2. Bounded Quantum Channel Noise
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Limit:</strong> The quantum optical fiber / free-space link is assumed to exhibit depolarizing and phase-damping
                  error rates below the critical threshold <em>p</em><sub>noise</sub> &le; 0.15. Channels with higher natural noise cannot distinguish
                  ambient thermal decoherence from active eavesdropping.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  3. Finite-Shot Statistical Fluctuations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Limit:</strong> Measurement counts follow a multinomial distribution. With shot count <em>N</em><sub>shots</sub> = 1024,
                  the standard error of the mean is &sigma; = &radic;(p(1-p)/N) &asymp; &plusmn; 1.5%. Lower shot counts (<em>N</em> &lt; 256)
                  increase false alarm probability due to statistical shot noise.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  4. Coherence Window & Quantum Memory
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Limit:</strong> Teleportation feedforward corrections must be applied within the coherence time <em>T</em><sub>2</sub>
                  {" of Bob's quantum register (< 100 μs in superconducting qubits, > 1 s in trapped ions)."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: API REFERENCE (ENDPOINTS)                                         */}
      {/* ========================================================================= */}
      {activeTab === "api" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                Backend REST API Reference ({filteredEndpoints.length} Endpoints)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                FastAPI endpoints powering quantum simulation, baseline calibration, innovations, and threat analytics.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedEndpointCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-mono transition",
                    selectedEndpointCategory === cat
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Cards List */}
          <div className="space-y-4">
            {filteredEndpoints.map((ep) => (
              <div
                key={ep.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                {/* Method & Path Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase",
                        ep.method === "GET" && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                        ep.method === "POST" && "bg-indigo-100 text-indigo-800 border border-indigo-200",
                        ep.method === "DELETE" && "bg-rose-100 text-rose-800 border border-rose-200",
                        ep.method === "PUT" && "bg-amber-100 text-amber-800 border border-amber-200"
                      )}
                    >
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {ep.path}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 self-start sm:self-auto border border-slate-200">
                    {ep.category}
                  </span>
                </div>

                {/* Summary & Description */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{ep.summary}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ep.description}
                  </p>
                </div>

                {/* Request Body (if POST) */}
                {ep.requestBody && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                      Request Payload (JSON)
                    </span>
                    <pre className="text-xs font-mono text-indigo-950 bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto">
                      {ep.requestBody}
                    </pre>
                  </div>
                )}

                {/* Response Schema */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    Response Schema (JSON)
                  </span>
                  <pre className="text-xs font-mono text-emerald-950 bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto">
                    {ep.responseSchema}
                  </pre>
                </div>

                {/* Copyable cURL */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>cURL Request Example</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCurl(ep.id, ep.curlExample)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold transition"
                    >
                      {copiedCurlId === ep.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied cURL</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy cURL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-800 bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                    {ep.curlExample}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

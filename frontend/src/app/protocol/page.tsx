"use client";

import React, { useState } from "react";
import {
  Terminal,
  FileCode,
  Copy,
  Check,
  Download,
  Layers,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  BookOpen,
  Hash,
  Lock,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StageInfo {
  id: number;
  name: string;
  shortName: string;
  tag: string;
  qubitsInvolved: string;
  operations: string[];
  mathFormulation: string;
  stateEvolution: string;
  securityRole: string;
  detailedDescription: string;
  codeSnippet: string;
}

const STAGES: StageInfo[] = [
  {
    id: 1,
    name: "Stage 1: State Preparation (Alice's Message Signature)",
    shortName: "State Prep",
    tag: "SIGNATURE INITIATION",
    qubitsInvolved: "q[0] (Message Qubit)",
    operations: ["Ry(θ) or H Gate on q[0]"],
    mathFormulation: "|ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩ (Default: θ = π/2 ⇒ |+⟩)",
    stateEvolution: "|Ψ₁⟩ = (α|0⟩ + β|1⟩) ⊗ |00⟩_{q1, q2}",
    securityRole:
      "Alice encodes her private cryptographic signature into the quantum state parameter θ. Without knowing θ, an adversary cannot forge the state without introducing measurable disturbance.",
    detailedDescription:
      "The signer (Alice) prepares qubit q0 in an agreed or secret single-qubit quantum superposition. In standard baseline testing, θ = π/2 prepares the |+⟩ state with equal superposition (|0⟩ + |1⟩)/√2.",
    codeSnippet: `// Stage 1: State Preparation\n// Prepare secret signature state on q[0]\nry(pi/2) q[0];\nbarrier q;`,
  },
  {
    id: 2,
    name: "Stage 2: Bell Pair Generation (Quantum Entanglement)",
    shortName: "Bell Pair",
    tag: "EPR RESOURCE",
    qubitsInvolved: "q[1], q[2] (Entangled Pair)",
    operations: ["Hadamard on q[1]", "CNOT(q[1] → q[2])"],
    mathFormulation: "|Φ⁺⟩ = (|00⟩ + |11⟩) / √2",
    stateEvolution: "|Ψ₂⟩ = (α|0⟩ + β|1⟩)_{q0} ⊗ 1/√2(|00⟩ + |11⟩)_{q1, q2}",
    securityRole:
      "Entanglement establishes an unforgeable quantum link between Alice (q1) and Bob (q2). By the monogamy of entanglement, any third party (Eve) cannot be simultaneously entangled with this pair without degrading fidelity.",
    detailedDescription:
      "An Einstein-Podolsky-Rosen (EPR) maximally entangled pair is generated. Alice holds q1 and Bob holds q2. The joint composite 3-qubit state is now in a tensor product state |ψ⟩ ⊗ |Φ⁺⟩.",
    codeSnippet: `// Stage 2: Bell Pair Creation\nh q[1];\ncx q[1], q[2];\nbarrier q;`,
  },
  {
    id: 3,
    name: "Stage 3: Bell State Measurement (Alice's Side)",
    shortName: "Bell Measure",
    tag: "JOINT PROJECTION",
    qubitsInvolved: "q[0], q[1] (Alice's Qubits)",
    operations: ["CNOT(q[0] → q[1])", "Hadamard on q[0]", "Measure q[0] → c[0]", "Measure q[1] → c[1]"],
    mathFormulation: "⟨B_{ij}| = (1/√2) [⟨00| + (-1)^j ⟨11|] (CNOT · H)",
    stateEvolution:
      "|Ψ₃⟩ = 1/2 [ |00⟩(α|0⟩+β|1⟩) + |01⟩(α|1⟩+β|0⟩) + |10⟩(α|0⟩-β|1⟩) + |11⟩(α|1⟩-β|0⟩) ]",
    securityRole:
      "Alice's joint projection entangles her message qubit with her half of the Bell pair, transferring the state information to Bob's qubit q2 up to a 2-bit Pauli transformation.",
    detailedDescription:
      "Alice applies a CNOT gate with q0 as control and q1 as target, followed by a Hadamard on q0. Measuring q0 and q1 projects them onto one of the four Bell outcomes, generating classical bits c0 and c1 with equal 25% probability.",
    codeSnippet: `// Stage 3: Bell Measurement\ncx q[0], q[1];\nh q[0];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nbarrier q;`,
  },
  {
    id: 4,
    name: "Stage 4: Classical Communication (Syndrome Transmission)",
    shortName: "Classical Comm",
    tag: "FEEDFORWARD DATA",
    qubitsInvolved: "Classical Register c[0], c[1]",
    operations: ["Transmit 2 classical bits (c0, c1) over authenticated link"],
    mathFormulation: "(c₀, c₁) ∈ {(0,0), (0,1), (1,0), (1,1)}",
    stateEvolution: "Bob receives syndrome bits (c0, c1) corresponding to Pauli error X^{c1} Z^{c0}",
    securityRole:
      "Transmitting the measurement outcomes over an authenticated channel ensures Eve cannot modify the classical correction instructions without invalidating cryptographic message authentication codes (MACs).",
    detailedDescription:
      "Alice broadcasts or transmits the two classical bits c0 and c1 to Bob. Bob uses these bits to select the exact unitary transformation needed to recover Alice's original state |ψ⟩ on q2.",
    codeSnippet: `// Stage 4: Classical channel transmission\n// c[0] and c[1] transferred to Bob over authenticated channel`,
  },
  {
    id: 5,
    name: "Stage 5: Pauli Unitary Feedforward Correction (Bob's Side)",
    shortName: "Pauli Correction",
    tag: "STATE RECONSTRUCTION",
    qubitsInvolved: "q[2] (Bob's Target Qubit)",
    operations: ["if (c1 == 1) apply X on q[2]", "if (c0 == 1) apply Z on q[2]"],
    mathFormulation: "U_{corr} = Z^{c₀} X^{c₁} ⇒ U_{corr} (X^{c₁} Z^{c₀} |ψ⟩) = |ψ⟩",
    stateEvolution: "q[2] = α|0⟩ + β|1⟩ (Exact original state restored)",
    securityRole:
      "Bob applies Pauli corrections X and Z conditionally on classical bits. The recovered state on q2 is mathematically identical to Alice's original input state |ψ⟩, completing teleportation.",
    detailedDescription:
      "Based on the two classical bits, Bob conditionally applies the Pauli-X gate if c1 = 1 (bit-flip correction) and the Pauli-Z gate if c0 = 1 (phase-flip correction). The state of q2 is now restored to Alice's initial signature state |ψ⟩.",
    codeSnippet: `// Stage 5: Conditional Feedforward Corrections\nif (c[1] == 1) x q[2];\nif (c[0] == 1) z q[2];\nbarrier q;`,
  },
  {
    id: 6,
    name: "Stage 6: Verification Measurement (Signature Readout)",
    shortName: "Verification",
    tag: "OBSERVABLE PROJECTION",
    qubitsInvolved: "q[2] → Classical Bit c[2]",
    operations: ["Measure q[2] in computational Z-basis into c[2]"],
    mathFormulation: "P(c₂ = 0) = |α|² = cos²(θ/2),  P(c₂ = 1) = |β|² = sin²(θ/2)",
    stateEvolution: "Quantum state collapses to classical binary measurement outcome {0, 1}",
    securityRole:
      "Bob measures the recovered state across N shots. The empirical frequency of |0⟩ and |1⟩ outcomes constitutes the verifiable signature evidence.",
    detailedDescription:
      "Bob measures q2 in the computational basis. Over multiple circuit executions (e.g. 1024 shots), the measurement counts accumulate to form an empirical probability distribution P_obs.",
    codeSnippet: `// Stage 6: Measurement of recovered qubit\nmeasure q[2] -> c[2];`,
  },
  {
    id: 7,
    name: "Stage 7: Statistical Comparison (Fidelity & TVD)",
    shortName: "Statistical Comp",
    tag: "METRIC EXTRACTION",
    qubitsInvolved: "Statistical Processor (Classical)",
    operations: ["Extract marginal distribution P_obs(q2)", "Compute Bhattacharyya Fidelity F", "Compute TVD Distance D"],
    mathFormulation: "F(P_{exp}, P_{obs}) = (∑ √[P_{exp}(x) P_{obs}(x)])²",
    stateEvolution: "Distribution distance: D_{TVD} = 1/2 ∑ |P_{exp}(x) - P_{obs}(x)|",
    securityRole:
      "Classical fidelity measures the overlap between the observed statistics and the theoretical ideal for the authorized signature state. An unauthorized state yields a dramatic statistical collapse.",
    detailedDescription:
      "The verifier computes the classical Bhattacharyya fidelity and Total Variation Distance between the observed distribution on q2 and the expected distribution derived from Alice's known state parameter θ.",
    codeSnippet: `// Stage 7: Classical Post-Processing (Python/NumPy)\n// F = (sqrt(p0*q0) + sqrt(p1*q1))**2\n// TVD = 0.5 * (|p0 - q0| + |p1 - q1|)`,
  },
  {
    id: 8,
    name: "Stage 8: Threat Detection & Dynamic Threshold Gating",
    shortName: "Threat Detection",
    tag: "SECURITY DECISION",
    qubitsInvolved: "Automated Statistical Gating Engine",
    operations: ["Compare F ≥ τ_F", "Compare D ≤ τ_D", "Validate session nonce freshness"],
    mathFormulation: "Decision = { ACCEPT (Normal) if (F ≥ τ_F ∧ D ≤ τ_D ∧ Nonce_Valid), else REJECT (Threat) }",
    stateEvolution: "Alarm trigger & automated security event logging",
    securityRole:
      "Closed-form statistical gating rejects forged states, impersonations, channel attacks, and replay attempts deterministically without black-box ML vulnerabilities.",
    detailedDescription:
      "The detection engine checks the computed metrics against the calibrated baseline thresholds (τ_F, τ_D). If any threshold is violated or a duplicate nonce is detected, a security alarm is logged with forensic evidence.",
    codeSnippet: `// Stage 8: Gating Logic\nif fidelity < tau_F or deviation > tau_D or is_replay:\n    raise SecurityThreatDetected(severity, evidence)`,
  },
];

const FULL_OPENQASM_CODE = `// =========================================================================
// Brelock Holmes — Teleportation-based Quantum Digital Signature (QDS)
// OpenQASM 2.0 Circuit Representation
// =========================================================================
OPENQASM 2.0;
include "qelib1.inc";

// Allocate 3 quantum registers:
// q[0]: Alice's message / signature qubit
// q[1]: Alice's half of entangled EPR pair
// q[2]: Bob's half of entangled EPR pair (receives teleported state)
qreg q[3];

// Allocate 3 classical registers:
// c[0]: Bell measurement result of q[0]
// c[1]: Bell measurement result of q[1]
// c[2]: Verification readout of recovered qubit q[2]
creg c[3];

// -------------------------------------------------------------------------
// STAGE 1: State Preparation (Signer Alice prepares |psi> = Ry(pi/2)|0>)
// -------------------------------------------------------------------------
ry(1.5707963267948966) q[0];
barrier q[0], q[1], q[2];

// -------------------------------------------------------------------------
// STAGE 2: EPR Bell Pair Generation (|Phi+> = (|00> + |11>)/sqrt(2))
// -------------------------------------------------------------------------
h q[1];
cx q[1], q[2];
barrier q[0], q[1], q[2];

// -------------------------------------------------------------------------
// STAGE 3: Bell State Measurement on Alice's side (q[0] and q[1])
// -------------------------------------------------------------------------
cx q[0], q[1];
h q[0];
measure q[0] -> c[0];
measure q[1] -> c[1];
barrier q[0], q[1], q[2];

// -------------------------------------------------------------------------
// STAGE 4 & 5: Conditional Pauli Corrections on Bob's qubit q[2]
// -------------------------------------------------------------------------
if (c[1] == 1) x q[2];
if (c[0] == 1) z q[2];
barrier q[0], q[1], q[2];

// -------------------------------------------------------------------------
// STAGE 6: Signature Verification Readout on Bob's qubit q[2]
// -------------------------------------------------------------------------
measure q[2] -> c[2];
`;

export default function ProtocolPage() {
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [copiedQasm, setCopiedQasm] = useState<boolean>(false);
  const [copiedStageCode, setCopiedStageCode] = useState<boolean>(false);

  const selectedStage = STAGES.find((s) => s.id === selectedStageId) || STAGES[0];

  const handleCopyQasm = () => {
    navigator.clipboard.writeText(FULL_OPENQASM_CODE);
    setCopiedQasm(true);
    setTimeout(() => setCopiedQasm(false), 2000);
  };

  const handleCopyStageCode = () => {
    navigator.clipboard.writeText(selectedStage.codeSnippet);
    setCopiedStageCode(true);
    setTimeout(() => setCopiedStageCode(false), 2000);
  };

  const handleDownloadQasm = () => {
    const blob = new Blob([FULL_OPENQASM_CODE], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teleportation_qds_circuit.qasm";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase tracking-widest mb-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            Protocol Architecture & Circuit Inspector
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Teleportation-Based QDS Protocol
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Explore the 8-stage quantum digital signature architecture. Inspect the quantum circuit stages,
            mathematical state transformations, feedforward Pauli corrections, and theoretical unforgeability proofs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleDownloadQasm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Download QASM
          </button>
        </div>
      </div>

      {/* Protocol High-Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quantum Register
            </span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">3 Qubits</div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
            q[0]: Message state |ψ⟩ <br />
            q[1]: Alice Bell pair <br />
            q[2]: Bob target qubit
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Feedforward Channel
            </span>
            <GitBranch className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">2 Classical Bits</div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
            c[0]: Z correction (c0) <br />
            c[1]: X correction (c1) <br />
            c[2]: Verification readout
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Security Guarantee
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">Information-Theoretic</div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
            No-Cloning Theorem <br />
            Monogamy of Entanglement <br />
            Bhattacharyya Gating
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8-STAGE INTERACTIVE PROTOCOL PIPELINE & CIRCUIT DIAGRAM                  */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Interactive 8-Stage Quantum Execution Pipeline
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Click any stage along the pipeline to inspect mathematical operations, qubit statevectors, and security roles.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md self-start sm:self-auto">
            Selected: Stage {selectedStage.id} / 8
          </span>
        </div>

        {/* Horizontal Pipeline Stepper Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {STAGES.map((stage) => {
            const isSelected = selectedStageId === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStageId(stage.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between min-h-[82px]",
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded font-bold",
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    )}
                  >
                    S{stage.id}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold mt-2 line-clamp-1">
                  {stage.shortName}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase">
                  {selectedStage.tag}
                </span>
                <span className="text-xs font-mono text-slate-500 font-medium">
                  Target: {selectedStage.qubitsInvolved}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {selectedStage.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyStageCode}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-mono font-semibold text-slate-800 border border-slate-300 shadow-xs transition"
              >
                {copiedStageCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied Snippet
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    Copy Stage QASM
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Detailed explanation & Security Role (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Functional Description
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedStage.detailedDescription}
                </p>
              </div>

              {/* Mathematical Formulation */}
              <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-xs space-y-2">
                <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Mathematical Operator & State Formulation
                </div>
                <div className="text-xs font-mono text-indigo-900 bg-indigo-50/50 p-2.5 rounded border border-indigo-100 overflow-x-auto font-medium">
                  {selectedStage.mathFormulation}
                </div>
                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  Evolution: <span className="text-slate-800 font-medium">{selectedStage.stateEvolution}</span>
                </div>
              </div>

              {/* Security & Cryptographic Role */}
              <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Cryptographic Security Role
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  {selectedStage.securityRole}
                </p>
              </div>
            </div>

            {/* Right: Quantum Gate Code Snippet & Operation List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Discrete Operations Applied
                </div>
                <ul className="space-y-1.5">
                  {selectedStage.operations.map((op, idx) => (
                    <li
                      key={idx}
                      className="text-xs font-mono text-slate-800 flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 font-medium"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>OpenQASM Snippet</span>
                  <span>Qiskit 2.5</span>
                </div>
                <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto">
                  {selectedStage.codeSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CLASSICAL SYNDROME LOOKUP TABLE (PAULI CORRECTIONS)                      */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-600" />
            Bell Measurement Syndrome & Pauli Feedforward Truth Table
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Bob applies unitary transformation <em>U</em><sub>corr</sub> = <em>Z</em><sup>c0</sup> <em>X</em><sup>c1</sup> to <em>q</em><sub>2</sub> depending on Alice&apos;s classical Bell measurement outcome (<em>c</em><sub>0</sub>, <em>c</em><sub>1</sub>).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] bg-slate-50">
                <th className="py-2.5 px-4 font-semibold">Bell Measurement $(c_0, c_1)$</th>
                <th className="py-2.5 px-4 font-semibold">Alice Projected State</th>
                <th className="py-2.5 px-4 font-semibold">State at Bob ($q_2$) Pre-Correction</th>
                <th className="py-2.5 px-4 font-semibold">Bob Applied Correction</th>
                <th className="py-2.5 px-4 font-semibold">Final Recovered State ($q_2$)</th>
                <th className="py-2.5 px-4 font-semibold">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-indigo-600">c0=0, c1=0 (00)</td>
                <td className="py-2.5 px-4">|Φ⁺⟩ = (|00⟩+|11⟩)/√2</td>
                <td className="py-2.5 px-4 text-slate-600">α|0⟩ + β|1⟩</td>
                <td className="py-2.5 px-4 font-bold text-emerald-700">Identity (I)</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">|ψ⟩ = α|0⟩ + β|1⟩</td>
                <td className="py-2.5 px-4 text-slate-500">25.0%</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-indigo-600">c0=0, c1=1 (01)</td>
                <td className="py-2.5 px-4">|Ψ⁺⟩ = (|01⟩+|10⟩)/√2</td>
                <td className="py-2.5 px-4 text-slate-600">α|1⟩ + β|0⟩</td>
                <td className="py-2.5 px-4 font-bold text-amber-700">Pauli-X (Bit Flip)</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">|ψ⟩ = α|0⟩ + β|1⟩</td>
                <td className="py-2.5 px-4 text-slate-500">25.0%</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-indigo-600">c0=1, c1=0 (10)</td>
                <td className="py-2.5 px-4">|Φ⁻⟩ = (|00⟩-|11⟩)/√2</td>
                <td className="py-2.5 px-4 text-slate-600">α|0⟩ - β|1⟩</td>
                <td className="py-2.5 px-4 font-bold text-blue-700">Pauli-Z (Phase Flip)</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">|ψ⟩ = α|0⟩ + β|1⟩</td>
                <td className="py-2.5 px-4 text-slate-500">25.0%</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-indigo-600">c0=1, c1=1 (11)</td>
                <td className="py-2.5 px-4">|Ψ⁻⟩ = (|01⟩-|10⟩)/√2</td>
                <td className="py-2.5 px-4 text-slate-600">α|1⟩ - β|0⟩</td>
                <td className="py-2.5 px-4 font-bold text-rose-700">Pauli-X then Pauli-Z (ZX)</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">|ψ⟩ = α|0⟩ + β|1⟩</td>
                <td className="py-2.5 px-4 text-slate-500">25.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THEORETICAL BACKGROUND & UNFORGEABILITY GUARANTEES                       */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            Theoretical Foundations of Quantum Unforgeability
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Why quantum teleportation provides information-theoretic signature security impossible in classical digital signatures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: No-Cloning Theorem */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  No-Cloning Theorem ($U|\psi\rangle|0\rangle \neq |\psi\rangle|\psi\rangle$)
                </h3>
                <p className="text-[11px] font-mono text-indigo-600 font-semibold">Wootters & Zurek (1982)</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              In classical cryptography, digital signatures can be perfectly duplicated bit-for-bit. In quantum mechanics,
              the linearity of unitary transformations forbids the creation of identical copies of an arbitrary unknown quantum state.
              An adversary Eve cannot copy Alice&apos;s signature state $|\psi\rangle$ to store or forge later.
            </p>
          </div>

          {/* Card 2: Monogamy of Entanglement */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monogamy of Entanglement ($E(A;B) + E(A;E) \le 1$)
                </h3>
                <p className="text-[11px] font-mono text-indigo-600 font-semibold">Coffman, Kundu & Wootters</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Quantum entanglement cannot be freely shared among three parties. If Alice and Bob share a maximally entangled
              state $|\Phi^+\rangle$, neither Alice nor Bob can be entangled with an eavesdropper Eve. Any eavesdropping
              measurement reduces the fidelity of Alice-Bob correlation, creating observable anomalies in verification.
            </p>
          </div>

          {/* Card 3: Information-Disturbance Tradeoff */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-100 border border-amber-200 text-amber-800">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Information-Disturbance Tradeoff
                </h3>
                <p className="text-[11px] font-mono text-amber-700 font-semibold">Fuchs-Peres-Banach Bound</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Any generalized measurement (POVM) that Eve applies to extract information about the secret signature state $|\psi\rangle$
              inevitably causes state collapse and introduces decoherence. The resulting fidelity degradation is caught by
              Bhattacharyya gating tests ($F &lt; \tau_F$).
            </p>
          </div>

          {/* Card 4: Non-Repudiation */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Quantum Non-Repudiation Guarantee
                </h3>
                <p className="text-[11px] font-mono text-emerald-700 font-semibold">Gottesman-Chuang QDS Framework</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Once Alice teleports her state and transmits classical correction bits, she cannot claim she sent a different message
              because the statistical verification counts at Bob uniquely correspond to Alice&apos;s prepared state $\theta$.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL OPENQASM CIRCUIT VIEWER                                             */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Full Qiskit OpenQASM 2.0 Circuit Specification
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyQasm}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono font-semibold text-slate-800 border border-slate-300 transition"
            >
              {copiedQasm ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied QASM
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  Copy Full QASM
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 shadow-xs">
          <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
            {FULL_OPENQASM_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
}

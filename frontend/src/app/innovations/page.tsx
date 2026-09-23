"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCode2,
  Hash,
  Compass,
  Sliders,
  Award,
} from "lucide-react";
import {
  verifyTensorNetwork,
  runStateTomography,
  runDynamicalDecoupling,
  resolveArbiterDispute,
  getQLedger,
  verifyQLedger,
} from "@/lib/api";
import {
  TensorVerifyResult,
  StateTomographyResult,
  DecouplingResult,
  ArbiterDisputeResult,
  QLedgerBlock,
  QLedgerVerifyResult,
} from "@/lib/types";

export default function InnovationsPage() {
  const [activeTab, setActiveTab] = useState<number>(1);

  // Tab 1: Tensor Network State
  const [tnTheta, setTnTheta] = useState<number>(1.04719755); // pi/3
  const [tnPertTheta, setTnPertTheta] = useState<number>(0.0);
  const [tnNoise, setTnNoise] = useState<number>(0.0);
  const [tnBondDim, setTnBondDim] = useState<number>(4);
  const [tnLoading, setTnLoading] = useState<boolean>(false);
  const [tnResult, setTnResult] = useState<TensorVerifyResult | null>(null);

  // Tab 2: Tomography State
  const [tomoTheta, setTomoTheta] = useState<number>(1.04719755);
  const [tomoPhaseTamper, setTomoPhaseTamper] = useState<number>(0.0);
  const [tomoNoiseType, setTomoNoiseType] = useState<string>("none");
  const [tomoNoiseLevel, setTomoNoiseLevel] = useState<number>(0.0);
  const [tomoShots, setTomoShots] = useState<number>(2048);
  const [tomoLoading, setTomoLoading] = useState<boolean>(false);
  const [tomoResult, setTomoResult] = useState<StateTomographyResult | null>(null);

  // Tab 3: Dynamical Decoupling State
  const [ddSeq, setDdSeq] = useState<string>("XY4");
  const [ddNoise, setDdNoise] = useState<number>(0.08);
  const [ddShots, setDdShots] = useState<number>(2048);
  const [ddLoading, setDdLoading] = useState<boolean>(false);
  const [ddResult, setDdResult] = useState<DecouplingResult | null>(null);

  // Tab 4: Arbiter State
  const [arbScenario, setArbScenario] = useState<string>("LEGITIMATE");
  const [arbNoise, setArbNoise] = useState<number>(0.01);
  const [arbShots, setArbShots] = useState<number>(1024);
  const [arbLoading, setArbLoading] = useState<boolean>(false);
  const [arbResult, setArbResult] = useState<ArbiterDisputeResult | null>(null);

  // Tab 5: Q-Ledger State
  const [ledgerBlocks, setLedgerBlocks] = useState<QLedgerBlock[]>([]);
  const [ledgerVerify, setLedgerVerify] = useState<QLedgerVerifyResult | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState<boolean>(false);

  // Initial runs
  useEffect(() => {
    handleRunTensor();
    handleRunTomography();
    handleRunDecoupling();
    handleRunArbiter();
    handleLoadLedger();
  }, []);

  // Handlers
  const handleRunTensor = async () => {
    setTnLoading(true);
    try {
      const res = await verifyTensorNetwork({
        theta: tnTheta,
        pert_theta: tnPertTheta,
        noise_depol: tnNoise,
        bond_dim_max: tnBondDim,
      });
      setTnResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setTnLoading(false);
    }
  };

  const handleRunTomography = async () => {
    setTomoLoading(true);
    try {
      const res = await runStateTomography({
        theta: tomoTheta,
        phase_tamper_rad: tomoPhaseTamper,
        noise_type: tomoNoiseType,
        noise_level: tomoNoiseLevel,
        shots_per_basis: tomoShots,
      });
      setTomoResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setTomoLoading(false);
    }
  };

  const handleRunDecoupling = async () => {
    setDdLoading(true);
    try {
      const res = await runDynamicalDecoupling({
        sequence_type: ddSeq,
        noise_level: ddNoise,
        shots: ddShots,
      });
      setDdResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setDdLoading(false);
    }
  };

  const handleRunArbiter = async () => {
    setArbLoading(true);
    try {
      const res = await resolveArbiterDispute({
        scenario: arbScenario,
        noise_level: arbNoise,
        shots: arbShots,
      });
      setArbResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setArbLoading(false);
    }
  };

  const handleLoadLedger = async () => {
    setLedgerLoading(true);
    try {
      const res = await getQLedger(15);
      setLedgerBlocks(res.blocks);
      const v = await verifyQLedger();
      setLedgerVerify(v);
    } catch (e) {
      console.error(e);
    } finally {
      setLedgerLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30">
            <Award className="w-3.5 h-3.5" />
            SIH 2026 Competitive Innovation Architecture
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            5 Novelties & Technical Innovations
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Beyond standard teleportation QDS, Brelock Holmes implements five pioneering mathematical and engineering modules directly addressing the <strong>Egreen Quanta LLP</strong> problem statement requirements for <em>Quantum-Inspired Algorithms</em>, <em>Zero-ML Statistical Threat Detection</em>, <em>Active Error Suppression</em>, and <em>Forensic Non-Repudiation</em>.
          </p>
        </div>
      </div>

      {/* Innovation Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { id: 1, title: "1. Tensor Network (MPS)", sub: "Quantum-Inspired Classical O(χ³)", icon: Layers },
          { id: 2, title: "2. State Tomography", sub: "3D Bloch & Pauli Projections", icon: Compass },
          { id: 3, title: "3. Dynamical Decoupling", sub: "XY4 / CPMG Pulse Synthesizer", icon: Zap },
          { id: 4, title: "4. GHZ Arbiter", sub: "Tri-Party Non-Repudiation", icon: ShieldCheck },
          { id: 5, title: "5. Quantum Hash Ledger", sub: "SHA3-512 Merkle Audit Trail", icon: Hash },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isActive
                  ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/10"
                  : "bg-white/80 hover:bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span className={`text-xs font-bold ${isActive ? "text-indigo-950" : "text-slate-800"}`}>
                  {tab.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                {tab.sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Quantum-Inspired Tensor Network MPS Verification */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                    Novelty #1 • Quantum-Inspired
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Matrix Product State (MPS) Signature Tensor Network Verifier
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Contracting low-rank tensor networks on classical edge processors in <code className="text-indigo-600 font-mono font-bold">O(χ³)</code> time without full 2ⁿ Hilbert space state vector overhead.
                </p>
              </div>

              <button
                onClick={handleRunTensor}
                disabled={tnLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {tnLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Contract Tensor Network
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 border-b border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Signature Angle θ (rad): {tnTheta.toFixed(3)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={3.14159}
                  step={0.05}
                  value={tnTheta}
                  onChange={(e) => setTnTheta(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-[10px] text-slate-600 font-mono">Default: π/3 = 1.047</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adversary Perturbation Δθ: {tnPertTheta.toFixed(3)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1.57}
                  step={0.05}
                  value={tnPertTheta}
                  onChange={(e) => setTnPertTheta(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <span className="text-[10px] text-slate-600 font-mono">Simulate signature forgery</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Bond Dimension χ: {tnBondDim}
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={tnBondDim}
                  onChange={(e) => setTnBondDim(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-[10px] text-slate-600 font-mono">Controls MPS truncation rank</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Depolarizing Noise: {tnNoise.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={0.3}
                  step={0.02}
                  value={tnNoise}
                  onChange={(e) => setTnNoise(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <span className="text-[10px] text-slate-600 font-mono">Simulated channel decay</span>
              </div>
            </div>

            {/* Results Display */}
            {tnResult && (
              <div className="pt-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">MPS State Fidelity</p>
                    <p className={`text-2xl font-bold mt-1 ${tnResult.fidelity >= 0.95 ? "text-emerald-600" : "text-rose-600"}`}>
                      {(tnResult.fidelity * 100).toFixed(2)}%
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">Target: &gt; 95.0%</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Total Variation Distance</p>
                    <p className={`text-2xl font-bold mt-1 ${tnResult.deviation_tvd <= 0.05 ? "text-emerald-600" : "text-rose-600"}`}>
                      {tnResult.deviation_tvd.toFixed(4)}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">TVD Metric Δ(P,Q)</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Entanglement Entropy S</p>
                    <p className="text-2xl font-bold mt-1 text-indigo-600">
                      {tnResult.entanglement_entropy.toFixed(4)}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">von Neumann S(ρ)</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Classical Edge Latency</p>
                    <p className="text-2xl font-bold mt-1 text-slate-800">
                      {tnResult.computation_time_ms.toFixed(2)} ms
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">O(χ³) Contraction</span>
                  </div>
                </div>

                {/* SVD Singular Value Spectrum */}
                <div className="p-5 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span>Singular Value Decomposition Spectrum (Schmidt Weights λᵢ)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tnResult.is_valid ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {tnResult.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {tnResult.singular_values.map((sv, idx) => (
                      <div key={idx} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
                        <span className="text-slate-400 text-[10px]">Bond Mode λ_{idx}:</span>
                        <div className="text-sm font-bold text-cyan-400 mt-0.5">{sv.toFixed(5)}</div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, sv * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
                    <span>Verified MPS Nodes: {tnResult.tensor_node_count}</span>
                    <span>Probabilities: P(0) = {tnResult.probabilities["0"]?.toFixed(4)}, P(1) = {tnResult.probabilities["1"]?.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Multi-Basis Quantum State Tomography (QST) */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-cyan-100 text-cyan-800">
                    Novelty #2 • Pauli Multi-Basis
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Quantum State Tomography (QST) & 3D Bloch Reconstruction
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Full 2x2 density matrix reconstruction <code className="text-indigo-600 font-mono font-bold">ρ = ½(I + ⟨X⟩σ_x + ⟨Y⟩σ_y + ⟨Z⟩σ_z)</code> detecting coherent phase drift that single Z-basis measurement completely overlooks.
                </p>
              </div>

              <button
                onClick={handleRunTomography}
                disabled={tomoLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {tomoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Reconstruct Bloch Sphere
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 border-b border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phase Tampering Δϕ: {tomoPhaseTamper.toFixed(2)} rad
                </label>
                <input
                  type="range"
                  min={0}
                  max={3.14}
                  step={0.1}
                  value={tomoPhaseTamper}
                  onChange={(e) => setTomoPhaseTamper(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <span className="text-[10px] text-slate-600 font-mono">Induces Y/X basis rotation</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Noise Type
                </label>
                <select
                  value={tomoNoiseType}
                  onChange={(e) => setTomoNoiseType(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="none">None (Ideal)</option>
                  <option value="depolarizing">Depolarizing</option>
                  <option value="phase_flip">Phase Flip (Z-error)</option>
                  <option value="amplitude_damping">Amplitude Damping (T1)</option>
                </select>
                <span className="text-[10px] text-slate-600 font-mono">Open environmental noise</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Noise Probability: {tomoNoiseLevel.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={0.3}
                  step={0.02}
                  value={tomoNoiseLevel}
                  onChange={(e) => setTomoNoiseLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <span className="text-[10px] text-slate-600 font-mono">Affects purity Tr(ρ²)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shots Per Basis: {tomoShots}
                </label>
                <select
                  value={tomoShots}
                  onChange={(e) => setTomoShots(parseInt(e.target.value))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={512}>512 shots</option>
                  <option value={1024}>1024 shots</option>
                  <option value={2048}>2048 shots</option>
                  <option value={4096}>4096 shots</option>
                </select>
                <span className="text-[10px] text-slate-600 font-mono">X, Y, Z projection accuracy</span>
              </div>
            </div>

            {/* Results */}
            {tomoResult && (
              <div className="pt-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">State Purity Tr(ρ²)</p>
                    <p className={`text-2xl font-bold mt-1 ${tomoResult.purity >= 0.90 ? "text-emerald-600" : "text-amber-600"}`}>
                      {tomoResult.purity.toFixed(4)}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">Pure state = 1.000</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">von Neumann Entropy</p>
                    <p className="text-2xl font-bold mt-1 text-slate-800">
                      {tomoResult.von_neumann_entropy.toFixed(4)}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">S(ρ) mixedness</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Bloch Vector |r|</p>
                    <p className="text-2xl font-bold mt-1 text-indigo-600">
                      {Math.sqrt(
                        tomoResult.bloch_vector.rx ** 2 +
                        tomoResult.bloch_vector.ry ** 2 +
                        tomoResult.bloch_vector.rz ** 2
                      ).toFixed(4)}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono font-mono">rx, ry, rz magnitude</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Tomographic Fidelity</p>
                    <p className={`text-2xl font-bold mt-1 ${tomoResult.fidelity_to_target >= 0.95 ? "text-emerald-600" : "text-rose-600"}`}>
                      {(tomoResult.fidelity_to_target * 100).toFixed(2)}%
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">⟨ψ|ρ|ψ⟩ overlap</span>
                  </div>
                </div>

                {/* 3D Bloch Coordinates & Density Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bloch Components */}
                  <div className="p-5 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-4">
                    <div className="text-slate-400 font-bold border-b border-slate-800 pb-2">
                      Bloch Sphere Polarization Coordinates
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-cyan-400 font-bold">⟨X⟩ Pauli Polarization (rx):</span>
                          <span>{tomoResult.bloch_vector.rx.toFixed(4)}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full"
                            style={{ width: `${Math.abs(tomoResult.bloch_vector.rx) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-amber-400 font-bold">⟨Y⟩ Phase Polarization (ry):</span>
                          <span>{tomoResult.bloch_vector.ry.toFixed(4)}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${Math.abs(tomoResult.bloch_vector.ry) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-emerald-400 font-bold">⟨Z⟩ Inversion Polarization (rz):</span>
                          <span>{tomoResult.bloch_vector.rz.toFixed(4)}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${Math.abs(tomoResult.bloch_vector.rz) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      Azimuthal Phase Drift: <strong className="text-white">{tomoResult.phase_offset_rad.toFixed(4)} rad</strong>
                    </div>
                  </div>

                  {/* Density Matrix Display */}
                  <div className="p-5 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-3">
                    <div className="text-slate-400 font-bold border-b border-slate-800 pb-2 flex justify-between">
                      <span>Reconstructed 2x2 Density Matrix ρ</span>
                      <span className={tomoResult.tampering_detected ? "text-rose-400 font-bold" : "text-emerald-400"}>
                        {tomoResult.tampering_detected ? "TAMPERING FLAGGED" : "NOMINAL STATE"}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm leading-loose">
                      <div className="flex justify-around items-center border-b border-slate-800 pb-2">
                        <span className="text-emerald-400">
                          {tomoResult.density_matrix[0][0].real.toFixed(4)}
                        </span>
                        <span className="text-amber-400">
                          {tomoResult.density_matrix[0][1].real >= 0 ? "+" : ""}
                          {tomoResult.density_matrix[0][1].real.toFixed(4)}
                          {tomoResult.density_matrix[0][1].imag >= 0 ? " +" : " "}
                          {tomoResult.density_matrix[0][1].imag.toFixed(4)}i
                        </span>
                      </div>
                      <div className="flex justify-around items-center pt-2">
                        <span className="text-amber-400">
                          {tomoResult.density_matrix[1][0].real >= 0 ? "+" : ""}
                          {tomoResult.density_matrix[1][0].real.toFixed(4)}
                          {tomoResult.density_matrix[1][0].imag >= 0 ? " +" : " "}
                          {tomoResult.density_matrix[1][0].imag.toFixed(4)}i
                        </span>
                        <span className="text-emerald-400">
                          {tomoResult.density_matrix[1][1].real.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {tomoResult.tampering_evidence.length > 0 && (
                      <div className="space-y-1 text-[11px] text-rose-300">
                        {tomoResult.tampering_evidence.map((ev, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Dynamic Adaptive Noise Decoupling (DAND) */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                    Novelty #3 • Active Error Mitigation
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Dynamic Adaptive Noise Decoupling (DAND) Pulse Synthesizer
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active dynamical decoupling pulse sequences (<code className="text-indigo-600 font-mono font-bold">XY4, CPMG, UDD</code>) inserted on EPR channel transit qubits to actively cancel environmental dephasing and extend <code className="text-indigo-600 font-mono font-bold">T₂</code> coherence time.
                </p>
              </div>

              <button
                onClick={handleRunDecoupling}
                disabled={ddLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {ddLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Synthesize Pulse Train
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pulse Sequence Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["XY4", "CPMG", "UDD"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setDdSeq(s)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                        ddSeq === s
                          ? "bg-amber-50 border-amber-600 text-amber-900"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-600 font-mono">XY4: X-Y-X-Y robust sequence</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Environmental Dephasing Noise: {ddNoise.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0.01}
                  max={0.25}
                  step={0.01}
                  value={ddNoise}
                  onChange={(e) => setDdNoise(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <span className="text-[10px] text-slate-600 font-mono">Simulates atmospheric dephasing</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monte Carlo Shots: {ddShots}
                </label>
                <select
                  value={ddShots}
                  onChange={(e) => setDdShots(parseInt(e.target.value))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1024}>1024 shots</option>
                  <option value={2048}>2048 shots</option>
                  <option value={4096}>4096 shots</option>
                </select>
                <span className="text-[10px] text-slate-600 font-mono">Statistical accuracy</span>
              </div>
            </div>

            {/* Results */}
            {ddResult && (
              <div className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Raw Teleportation */}
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>Raw Channel Teleportation</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">Unprotected</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-700">
                      {(ddResult.raw_fidelity * 100).toFixed(2)}%
                    </div>
                    <p className="text-xs text-slate-500">
                      Severe fidelity degradation due to phase dephasing under noise rate {ddResult.noise_level}.
                    </p>
                    <div className="text-xs font-mono bg-white p-2 rounded border border-slate-200 text-slate-600">
                      Counts: 0 → {ddResult.raw_counts["0"]}, 1 → {ddResult.raw_counts["1"]}
                    </div>
                  </div>

                  {/* Decoupled Teleportation */}
                  <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                      <span>Dynamically Decoupled ({ddResult.sequence_type})</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px] font-bold">Mitigated</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-700">
                      {(ddResult.decoupled_fidelity * 100).toFixed(2)}%
                    </div>
                    <p className="text-xs text-emerald-800 font-medium">
                      Pulse refocusing recovered {ddResult.fidelity_improvement_pct >= 0 ? "+" : ""}{ddResult.fidelity_improvement_pct.toFixed(2)}% fidelity margin.
                    </p>
                    <div className="text-xs font-mono bg-white p-2 rounded border border-emerald-200 text-emerald-900">
                      Counts: 0 → {ddResult.decoupled_counts["0"]}, 1 → {ddResult.decoupled_counts["1"]}
                    </div>
                  </div>

                  {/* Protection Factor */}
                  <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-indigo-900">
                      <span>T₂ Coherence Enhancement</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-800 text-[10px] font-bold">Factor</span>
                    </div>
                    <div className="text-3xl font-bold text-indigo-700">
                      {ddResult.t2_protection_factor.toFixed(2)}×
                    </div>
                    <p className="text-xs text-indigo-800 font-medium">
                      Circuit Depth Penalty: +{ddResult.circuit_depth_increase} gates on transit line.
                    </p>
                    <div className="text-xs font-mono bg-white p-2 rounded border border-indigo-200 text-indigo-900">
                      Net Gain: {ddResult.fidelity_improvement_pct.toFixed(2)}% boost
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Tri-Party Non-Repudiation GHZ Arbiter Protocol */}
      {/* ========================================================================= */}
      {activeTab === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                    Novelty #4 • Cryptographic Arbiter
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Tri-Party GHZ Entangled Non-Repudiation Arbiter (QDS-Arbiter)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Three-party entangled state <code className="text-indigo-600 font-mono font-bold">|GHZ⟩ = ½(|000⟩+|111⟩)</code> shared between Alice (Signer), Bob (Recipient), and Charlie (Quantum Arbiter) mathematically disproving Alice&apos;s repudiation and detecting Bob&apos;s forgery via stabilizer expectation <code className="text-indigo-600 font-mono font-bold">⟨Z_A Z_B Z_C⟩ = +1</code>.
                </p>
              </div>

              <button
                onClick={handleRunArbiter}
                disabled={arbLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {arbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute Arbiter Verification
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dispute Resolution Scenario
                </label>
                <select
                  value={arbScenario}
                  onChange={(e) => setArbScenario(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="LEGITIMATE">1. Legitimate Signature (Consensus)</option>
                  <option value="ALICE_REPUDIATION">2. Signer Repudiation (Alice denies signing)</option>
                  <option value="BOB_FORGERY">3. Recipient Forgery (Bob fabricates signature)</option>
                </select>
                <span className="text-[10px] text-slate-600 font-mono">Select adversarial dispute</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Channel Noise Level: {arbNoise.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0.0}
                  max={0.1}
                  step={0.01}
                  value={arbNoise}
                  onChange={(e) => setArbNoise(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <span className="text-[10px] text-slate-600 font-mono">Open channel fidelity degradation</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Shots: {arbShots}
                </label>
                <select
                  value={arbShots}
                  onChange={(e) => setArbShots(parseInt(e.target.value))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={512}>512 shots</option>
                  <option value={1024}>1024 shots</option>
                  <option value={2048}>2048 shots</option>
                </select>
                <span className="text-[10px] text-slate-600 font-mono">Stabilizer sample size</span>
              </div>
            </div>

            {/* Results */}
            {arbResult && (
              <div className="pt-6 space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">Dispute Reference: {arbResult.dispute_id}</span>
                      <h3 className="text-xl font-bold text-white mt-0.5">
                        Arbiter Verdict: {arbResult.arbiter_verdict.replace(/_/g, " ")}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {arbResult.confidence_pct.toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 font-mono text-xs">
                    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px]">GHZ Parity Fidelity</span>
                      <div className="text-base font-bold text-cyan-400">{(arbResult.ghz_parity_fidelity * 100).toFixed(2)}%</div>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px]">Stabilizer ⟨Z_A Z_B Z_C⟩</span>
                      <div className="text-base font-bold text-emerald-400">{arbResult.stabilizer_expectation.toFixed(4)}</div>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px]">Alice / Bob / Charlie Bit</span>
                      <div className="text-base font-bold text-indigo-300">{arbResult.alice_syndrome} | {arbResult.bob_syndrome} | {arbResult.charlie_syndrome}</div>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px]">Non-Repudiation</span>
                      <div className="text-base font-bold text-emerald-400">GUARANTEED</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Forensic Arbiter Evidence:</span>
                    {arbResult.evidence.map((ev, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Quantum Anomaly Fingerprint & Post-Quantum SHA3-512 Ledger */}
      {/* ========================================================================= */}
      {activeTab === 5 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">
                    Novelty #5 • Post-Quantum Audit Trail
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Quantum Anomaly Fingerprint & SHA3-512 Audit Ledger (Q-Ledger)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cryptographically binds each teleportation session with quantum density matrix fingerprints into a Merkle-chained, tamper-evident post-quantum SHA3-512 forensic ledger.
                </p>
              </div>

              <button
                onClick={handleLoadLedger}
                disabled={ledgerLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {ledgerLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-white" />}
                Verify Post-Quantum Hash Chain
              </button>
            </div>

            {/* Ledger Verification Status */}
            {ledgerVerify && (
              <div className="py-4 my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${ledgerVerify.chain_valid ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Ledger Integrity Status: {ledgerVerify.chain_valid ? "CRYPTOGRAPHICALLY INTACT" : "TAMPERING DETECTED"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Verified {ledgerVerify.verified_blocks} of {ledgerVerify.total_blocks} Merkle blocks with zero hash divergence.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-md border border-purple-200">
                  Algorithm: SHA3-512
                </span>
              </div>
            )}

            {/* Blocks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="p-3">Block #</th>
                    <th className="p-3">Session ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Fidelity</th>
                    <th className="p-3">Threat Status</th>
                    <th className="p-3 font-mono">SHA3-512 Block Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {ledgerBlocks.map((b) => (
                    <tr key={b.index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-indigo-600">#{b.index}</td>
                      <td className="p-3 font-mono text-slate-900">{b.session_id}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                          {b.action}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-600">
                        {(b.fidelity * 100).toFixed(2)}%
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.threat_status === "NORMAL"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {b.threat_status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-500 max-w-xs truncate" title={b.block_hash}>
                        {b.block_hash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

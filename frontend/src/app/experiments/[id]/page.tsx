"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Code2,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getExperiment, createExperiment, listSecurityEvents, CreateExperimentParams } from "@/lib/api";
import { Experiment, SecurityEvent } from "@/lib/types";
import { severityColor, severityBg, formatDuration, formatPercent, cn } from "@/lib/utils";

// Syntax highlighter helper for OpenQASM in light theme
function highlightQasm(code: string) {
  const lines = code.split("\n");
  const keywords = new Set([
    "OPENQASM",
    "include",
    "qreg",
    "creg",
    "gate",
    "opaque",
    "h",
    "cx",
    "x",
    "y",
    "z",
    "s",
    "t",
    "sdg",
    "tdg",
    "rx",
    "ry",
    "rz",
    "u",
    "u1",
    "u2",
    "u3",
    "measure",
    "barrier",
    "reset",
    "if",
  ]);

  return lines.map((line, idx) => {
    if (line.trim().startsWith("//")) {
      return (
        <div key={idx} className="table-row">
          <span className="table-cell pr-4 text-right select-none text-slate-400 font-mono text-[11px]">
            {idx + 1}
          </span>
          <span className="table-cell text-slate-500 italic">{line}</span>
        </div>
      );
    }

    const parts = line.split(/(\s+|[;,()[\]{}])/g);

    return (
      <div key={idx} className="table-row hover:bg-slate-100/80">
        <span className="table-cell pr-4 text-right select-none text-slate-400 font-mono text-[11px]">
          {idx + 1}
        </span>
        <span className="table-cell text-slate-900">
          {parts.map((token, tIdx) => {
            if (keywords.has(token)) {
              if (token === "OPENQASM" || token === "include") {
                return (
                  <span key={tIdx} className="text-pink-600 font-bold">
                    {token}
                  </span>
                );
              }
              if (token === "qreg" || token === "creg") {
                return (
                  <span key={tIdx} className="text-purple-600 font-bold">
                    {token}
                  </span>
                );
              }
              if (token === "measure" || token === "barrier" || token === "reset") {
                return (
                  <span key={tIdx} className="text-amber-600 font-bold">
                    {token}
                  </span>
                );
              }
              return (
                <span key={tIdx} className="text-indigo-600 font-bold">
                  {token}
                </span>
              );
            }
            if (/^\d+(\.\d+)?$/.test(token)) {
              return (
                <span key={tIdx} className="text-emerald-700 font-mono font-semibold">
                  {token}
                </span>
              );
            }
            if (token.startsWith('"') && token.endsWith('"')) {
              return (
                <span key={tIdx} className="text-amber-700">
                  {token}
                </span>
              );
            }
            return <span key={tIdx}>{token}</span>;
          })}
        </span>
      </div>
    );
  });
}

// Custom tooltip for distribution chart
interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  payload?: {
    count?: number;
    diff?: number;
    expected?: number;
    observed?: number;
    rawState?: string;
    state?: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomDistributionTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const expected = payload.find((p) => p.dataKey === "expected")?.value ?? 0;
    const observed = payload.find((p) => p.dataKey === "observed")?.value ?? 0;
    const diff = (observed - expected).toFixed(2);
    const count = payload[0]?.payload?.count ?? 0;

    return (
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1.5 font-sans">
        <p className="font-mono font-bold text-slate-900 text-sm">{label} State</p>
        <div className="space-y-1 border-t border-slate-100 pt-1.5 font-mono">
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              Expected:
            </span>
            <span className="font-semibold text-cyan-700">{expected}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Observed:
            </span>
            <span className="font-semibold text-indigo-700">{observed}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-500 text-[11px] pt-1 border-t border-slate-100">
            <span>Raw Count:</span>
            <span className="text-slate-900 font-semibold">{count} shots</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-500 text-[11px]">
            <span>Deviation (Δ):</span>
            <span
              className={cn(
                "font-semibold",
                Math.abs(Number(diff)) > 5 ? "text-red-600" : "text-emerald-600"
              )}
            >
              {Number(diff) > 0 ? `+${diff}%` : `${diff}%`}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function ExperimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experimentId = params?.id as string;

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [rerunning, setRerunning] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [copiedQasm, setCopiedQasm] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [qasmExpanded, setQasmExpanded] = useState<boolean>(false);

  // Load experiment and events
  const loadExperimentData = useCallback(async () => {
    if (!experimentId) return;
    setLoading(true);
    setError(null);

    try {
      const [expData, eventsData] = await Promise.allSettled([
        getExperiment(experimentId),
        listSecurityEvents(),
      ]);

      if (expData.status === "fulfilled") {
        setExperiment(expData.value);
      } else {
        throw new Error(expData.reason?.message || "Experiment not found");
      }

      if (eventsData.status === "fulfilled") {
        const related = eventsData.value.filter(
          (ev) => ev.experiment_id === experimentId
        );
        setSecurityEvents(related);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load experiment details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [experimentId]);

  useEffect(() => {
    loadExperimentData();
  }, [loadExperimentData]);

  // Copy UUID
  const handleCopyId = () => {
    if (!experiment) return;
    navigator.clipboard.writeText(experiment.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Copy QASM
  const handleCopyQasm = () => {
    if (!experiment?.circuit_qasm) return;
    navigator.clipboard.writeText(experiment.circuit_qasm);
    setCopiedQasm(true);
    setTimeout(() => setCopiedQasm(false), 2000);
  };

  // Download QASM
  const handleDownloadQasm = () => {
    if (!experiment?.circuit_qasm) return;
    const blob = new Blob([experiment.circuit_qasm], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `circuit-${experiment.id.slice(0, 8)}.qasm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJson = () => {
    if (!experiment) return;
    const jsonStr = JSON.stringify(experiment, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `experiment-${experiment.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    if (!experiment) return;
    navigator.clipboard.writeText(JSON.stringify(experiment, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Rerun experiment
  const handleRerun = async () => {
    if (!experiment || rerunning) return;
    setRerunning(true);
    try {
      const payload: CreateExperimentParams = {
        name: `${experiment.name || "Experiment"} (Rerun)`,
        protocol: experiment.protocol || "teleportation_qds",
        shots: experiment.shots || 1024,
        noise_type: experiment.noise_type || "none",
        noise_level: experiment.noise_level || 0.0,
        attack_type: experiment.attack_type || "normal",
        attack_params: experiment.attack_params || undefined,
        message: experiment.message || "Hello Brelock",
      };

      const newExp = await createExperiment(payload);
      router.push(`/experiments/${newExp.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to rerun experiment: ${msg}`);
      setRerunning(false);
    }
  };

  // Distribution chart data
  const distributionChartData = useMemo(() => {
    if (!experiment) return [];
    const expected = experiment.expected_distribution || {};
    const observed = experiment.observed_distribution || {};
    const counts = experiment.measurement_counts || {};

    const allKeys = Array.from(
      new Set([...Object.keys(expected), ...Object.keys(observed), ...Object.keys(counts)])
    ).sort();

    return allKeys.map((state) => {
      const expProb = expected[state] ?? 0;
      const obsProb = observed[state] ?? 0;
      const count = counts[state] ?? 0;
      const diff = obsProb - expProb;

      return {
        state: `|${state}⟩`,
        rawState: state,
        expected: Number((expProb * 100).toFixed(2)),
        observed: Number((obsProb * 100).toFixed(2)),
        count,
        diff: Number((diff * 100).toFixed(2)),
      };
    });
  }, [experiment]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-36 bg-white border border-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white border border-slate-200 rounded-xl" />
          <div className="h-72 bg-white border border-slate-200 rounded-xl" />
        </div>
        <div className="h-96 bg-white border border-slate-200 rounded-xl" />
      </div>
    );
  }

  // Error view
  if (error || !experiment) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Experiment Not Found</h2>
        <p className="text-xs text-slate-600">
          {error || "The requested experiment record could not be loaded or does not exist."}
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/experiments"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Experiments</span>
          </Link>
          <button
            onClick={() => loadExperimentData()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isThreat = experiment.detection_status === "THREAT_DETECTED";
  const fid = experiment.fidelity;
  const isHighFid = fid != null && fid >= 0.9;
  const isMedFid = fid != null && fid >= 0.75 && fid < 0.9;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
            <Link
              href="/experiments"
              className="flex items-center gap-1 hover:text-indigo-600 font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Experiments</span>
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-mono">{experiment.id.slice(0, 8)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {experiment.name || "Untitled Experiment"}
            </h1>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono border",
                experiment.status === "completed"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : experiment.status === "failed"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-amber-100 text-amber-800 border-amber-200 animate-pulse"
              )}
            >
              {experiment.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2 font-mono">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              <span className="text-slate-500 font-sans">UUID:</span>
              <span className="text-slate-800 font-semibold">{experiment.id}</span>
              <button
                onClick={handleCopyId}
                className="hover:text-indigo-600 text-slate-400 transition ml-1"
                title="Copy full UUID"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {experiment.created_at
                  ? new Date(experiment.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "medium",
                    })
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-xs transition"
            title="Copy experiment telemetry JSON"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied JSON</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-xs transition"
            title="Download experiment telemetry JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleRerun}
            disabled={rerunning}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", rerunning && "animate-spin")} />
            <span>{rerunning ? "Rerunning..." : "Rerun Experiment"}</span>
          </button>
        </div>
      </div>

      {/* Protocol & Hardware Configuration Ribbon */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-bold mb-0.5">Protocol</span>
          <span className="font-bold text-slate-900 font-mono">
            {experiment.protocol === "teleportation_qds"
              ? "Teleportation QDS"
              : experiment.protocol || "Quantum Sign"}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-bold mb-0.5">Qubits / Shots</span>
          <span className="font-bold text-slate-900 font-mono">
            3 Qubits • {experiment.shots?.toLocaleString() ?? 1024} shots
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-bold mb-0.5">Physical Noise</span>
          <span className="font-bold text-indigo-700 font-mono">
            {experiment.noise_type === "none"
              ? "None (Ideal)"
              : `${experiment.noise_type} (${((experiment.noise_level || 0) * 100).toFixed(1)}%)`}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-bold mb-0.5">Attack Scenario</span>
          <span
            className={cn(
              "font-bold font-mono",
              experiment.attack_type === "normal" ? "text-emerald-700" : "text-red-700"
            )}
          >
            {experiment.attack_type?.toUpperCase() || "NORMAL"}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-bold mb-0.5">Message Payload</span>
          <span className="font-mono text-slate-700 font-semibold truncate block" title={experiment.message || ""}>
            {experiment.message ? `"${experiment.message}"` : "None"}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-bold mb-0.5">Nonce / Session</span>
          <span className="font-mono text-slate-600 truncate block" title={experiment.nonce || ""}>
            {experiment.nonce ? `${experiment.nonce.slice(0, 10)}...` : "—"}
          </span>
        </div>
      </div>

      {/* Grid: Verdict Card & Quantum Fingerprint Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Detection Verdict Card */}
        <div
          className={cn(
            "p-6 rounded-2xl border shadow-sm flex flex-col justify-between",
            isThreat
              ? "bg-red-50/70 border-red-200"
              : "bg-emerald-50/70 border-emerald-200"
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs",
                    isThreat
                      ? "bg-red-100 border-red-300 text-red-700"
                      : "bg-emerald-100 border-emerald-300 text-emerald-700"
                  )}
                >
                  {isThreat ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : (
                    <ShieldCheck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block">
                    DETECTION VERDICT
                  </span>
                  <h2
                    className={cn(
                      "text-xl font-black tracking-tight",
                      isThreat ? "text-red-900" : "text-emerald-900"
                    )}
                  >
                    {isThreat ? "SECURITY THREAT DETECTED" : "SIGNATURE VERIFIED SECURE"}
                  </h2>
                </div>
              </div>

              <span
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider border",
                  severityBg(experiment.severity),
                  severityColor(experiment.severity)
                )}
              >
                {experiment.severity || "NORMAL"}
              </span>
            </div>

            {/* Verdict details */}
            <div className="grid grid-cols-2 gap-4 my-4 py-3 bg-white/80 rounded-xl border border-slate-200/80 px-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Detected Attack Type</span>
                <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                  {experiment.detected_attack_type?.toUpperCase() || "NONE / NORMAL"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Decision Threshold (τ)</span>
                <span className="font-bold text-indigo-700 font-mono text-sm mt-0.5 block">
                  {experiment.threshold_used != null ? experiment.threshold_used.toFixed(4) : "0.0500"}
                </span>
              </div>
            </div>

            {/* Evidence & Anomaly Analysis */}
            <div className="space-y-2 mt-2">
              <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Detection Evidence & Statistical Deviations:</span>
              </span>

              {experiment.evidence && experiment.evidence.length > 0 ? (
                <div className="space-y-2">
                  {experiment.evidence.map((evStr, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border text-xs flex items-start gap-2.5",
                        isThreat
                          ? "bg-white border-red-200 text-red-900 shadow-xs"
                          : "bg-white border-emerald-200 text-emerald-900 shadow-xs"
                      )}
                    >
                      {isThreat ? (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed font-mono text-[11px]">{evStr}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>State measurements fall within the calibrated quantum noise baseline.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono font-medium">
            <span>Validator: Statistical TVD Engine</span>
            <span>Mode: Zero-Trust QDS</span>
          </div>
        </div>

        {/* Quantum Security Fingerprint Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block">
                    TELEMETRY ANALYSIS
                  </span>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Quantum Security Fingerprint
                  </h2>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                Qiskit 2.5 Engine
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3.5 my-5">
              {/* State Fidelity */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>State Fidelity (F)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Target &gt; 95%</span>
                </div>
                <div className="text-2xl font-black font-mono">
                  <span
                    className={cn(
                      isHighFid ? "text-emerald-600" : isMedFid ? "text-amber-600" : "text-red-600"
                    )}
                  >
                    {formatPercent(experiment.fidelity)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isHighFid ? "bg-emerald-600" : isMedFid ? "bg-amber-500" : "bg-red-600"
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, (experiment.fidelity || 0) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Distribution Deviation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>Total Variation (Δ)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Safe &lt; 0.05</span>
                </div>
                <div className="text-2xl font-black font-mono">
                  <span
                    className={cn(
                      (experiment.distribution_deviation ?? 0) <= 0.05
                        ? "text-emerald-600"
                        : "text-red-600"
                    )}
                  >
                    {experiment.distribution_deviation != null
                      ? experiment.distribution_deviation.toFixed(4)
                      : "—"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">TVD / Statistical distance</p>
              </div>

              {/* Error Rate */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>Quantum Bit Error (QBER)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Tolerance &lt; 5%</span>
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {formatPercent(experiment.error_rate)}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Channel depolarization error</p>
              </div>

              {/* Execution Duration */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>Execution Duration</span>
                  <span className="text-[10px] text-slate-400 font-mono">Qiskit Simulator</span>
                </div>
                <div className="text-2xl font-black font-mono text-indigo-600">
                  {formatDuration(experiment.execution_time_ms)}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Circuit transpilation & run</p>
              </div>
            </div>

            {/* Fingerprint extra diagnostics */}
            {experiment.fingerprint && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-1 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Session Nonce Valid:</span>
                  <span
                    className={
                      experiment.fingerprint.session_valid !== false
                        ? "text-emerald-700 font-bold"
                        : "text-red-700 font-bold"
                    }
                  >
                    {experiment.fingerprint.session_valid !== false ? "VALID (ANTI-REPLAY OK)" : "INVALID (REPLAY ATTACK)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Noise Model Calibrated:</span>
                  <span className="text-slate-800 font-semibold">
                    {experiment.noise_type || "ideal"} @ {(experiment.noise_level * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>QDS Verification: Alice → Bob → Charlie</span>
            <span>State: 3-Qubit GHZ/Bell</span>
          </div>
        </div>
      </div>

      {/* Measurement Statistics & Distribution Comparison */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase text-indigo-600 block">
              MEASUREMENT PROBABILITY DISTRIBUTION
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Expected vs Observed State Distribution
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Comparison of ideal quantum state projection vs measured probabilities across {experiment.shots?.toLocaleString() ?? 1024} shots.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500" />
              <span className="text-slate-700 font-semibold">Expected (Theoretical)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600" />
              <span className="text-slate-700 font-semibold">Observed (Measured)</span>
            </div>
          </div>
        </div>

        {/* Recharts Chart */}
        {distributionChartData.length > 0 ? (
          <div className="w-full h-72 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="state"
                  stroke="#64748b"
                  tick={{ fill: "#475569", fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#475569", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                  unit="%"
                  domain={[0, "auto"]}
                />
                <Tooltip content={<CustomDistributionTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  formatter={(val) => (
                    <span className="text-slate-700 capitalize font-mono text-xs font-semibold">{val}</span>
                  )}
                />
                <Bar
                  dataKey="expected"
                  name="Expected"
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="observed"
                  name="Observed"
                  fill={isThreat ? "#ef4444" : "#4f46e5"}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No probability distribution data recorded for this run.
          </div>
        )}

        {/* Raw Counts Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Raw Measurement Outcomes & Deviations</span>
            <span className="text-[11px] font-mono text-slate-600 font-normal">
              Total Recorded: {experiment.shots?.toLocaleString() ?? 1024} shots
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 text-[11px] bg-slate-50">
                  <th className="py-2.5 px-4 font-bold">Basis State |ψ⟩</th>
                  <th className="py-2.5 px-4 font-bold text-right">Raw Counts</th>
                  <th className="py-2.5 px-4 font-bold text-right">Observed %</th>
                  <th className="py-2.5 px-4 font-bold text-right">Expected %</th>
                  <th className="py-2.5 px-4 font-bold text-right">Deviation (Δ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
                {distributionChartData.map((row) => (
                  <tr key={row.rawState} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-bold text-indigo-700">{row.state}</td>
                    <td className="py-2.5 px-4 text-right text-slate-900 font-semibold">
                      {row.count.toLocaleString()} shots
                    </td>
                    <td className="py-2.5 px-4 text-right text-indigo-700 font-bold">
                      {row.observed.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-right text-cyan-700 font-bold">
                      {row.expected.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold",
                          Math.abs(row.diff) > 5
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        )}
                      >
                        {row.diff > 0 ? `+${row.diff.toFixed(2)}%` : `${row.diff.toFixed(2)}%`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Circuit QASM View */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Quantum Circuit OpenQASM</h2>
              <p className="text-[11px] text-slate-600 font-mono">
                Transpiled Qiskit circuit representation for Aer simulation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQasm}
              disabled={!experiment.circuit_qasm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-semibold border border-slate-200 transition disabled:opacity-50"
            >
              {copiedQasm ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQasm}
              disabled={!experiment.circuit_qasm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-semibold border border-slate-200 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>.qasm</span>
            </button>

            <button
              onClick={() => setQasmExpanded(!qasmExpanded)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition"
              title={qasmExpanded ? "Collapse view" : "Expand view"}
            >
              {qasmExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Monospace code block */}
        <div
          className={cn(
            "rounded-xl bg-slate-50 border border-slate-200 p-4 font-mono text-xs overflow-x-auto transition-all",
            qasmExpanded ? "max-h-none" : "max-h-72 overflow-y-auto"
          )}
        >
          {experiment.circuit_qasm ? (
            <div className="table w-full border-collapse">
              {highlightQasm(experiment.circuit_qasm)}
            </div>
          ) : (
            <div className="text-slate-500 italic text-center py-6">
              No QASM circuit recorded for this experiment.
            </div>
          )}
        </div>
      </div>

      {/* Associated Security Events Timeline */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Security Event Audit Trail</h2>
              <p className="text-[11px] text-slate-600 font-mono">
                Chronological security log associated with experiment {experiment.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {securityEvents.length} Recorded Events
          </span>
        </div>

        {securityEvents.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {securityEvents.map((ev) => {
              const evSev = ev.severity?.toUpperCase() || "INFO";
              return (
                <div key={ev.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-xs",
                      evSev === "CRITICAL"
                        ? "bg-red-600"
                        : evSev === "HIGH" || evSev === "WARNING"
                        ? "bg-orange-500"
                        : evSev === "MEDIUM"
                        ? "bg-amber-500"
                        : "bg-indigo-600"
                    )}
                  />

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 uppercase">
                          {ev.event_type}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold border",
                            severityBg(ev.severity),
                            severityColor(ev.severity)
                          )}
                        >
                          {ev.severity}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {ev.timestamp || ev.created_at
                          ? new Date(ev.timestamp || ev.created_at || "").toLocaleTimeString()
                          : "Timestamp N/A"}
                      </span>
                    </div>

                    <p className="text-slate-700 font-mono text-[11px]">{ev.message}</p>

                    {/* Metadata JSON preview if available */}
                    {ev.metadata_json && Object.keys(ev.metadata_json).length > 0 && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-700">
                        <span className="text-slate-500 block mb-1 font-semibold">Event Metadata:</span>
                        <pre className="overflow-x-auto">
                          {JSON.stringify(ev.metadata_json, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback timeline for the experiment lifecycle */
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
            {/* Event 1: Experiment Execution */}
            <div className="relative">
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">
                    EXPERIMENT_STARTED
                  </span>
                  <span className="text-[10px] text-indigo-700 font-bold font-mono">INFO</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1 font-mono">
                  Initialized {experiment.protocol} circuit with {experiment.shots} shots on Aer simulator.
                </p>
              </div>
            </div>

            {/* Event 2: Verdict */}
            <div className="relative">
              <div
                className={cn(
                  "absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-xs",
                  isThreat ? "bg-red-600" : "bg-emerald-600"
                )}
              />
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">
                    {isThreat ? "THREAT_DETECTED" : "SIGNATURE_VERIFIED"}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold",
                      isThreat ? "text-red-700" : "text-emerald-700"
                    )}
                  >
                    {experiment.severity || (isThreat ? "HIGH" : "NORMAL")}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1 font-mono">
                  {isThreat
                    ? `Anomaly identified: ${experiment.detected_attack_type || experiment.attack_type} (Fidelity=${formatPercent(experiment.fidelity)})`
                    : `Zero-knowledge verification succeeded (Fidelity=${formatPercent(experiment.fidelity)})`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

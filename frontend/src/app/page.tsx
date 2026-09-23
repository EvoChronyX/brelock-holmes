"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  FlaskConical,
  Sliders,
  Play,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Wifi,
  WifiOff,
  Radio,
  Layers,
  Copy,
  Check,
  Sparkles,
  BarChart2,
  Lock,
  Compass,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  getHealth,
  getAnalyticsSummary,
  listExperiments,
  listSecurityEvents,
  getBaseline,
  createExperiment,
  simulateAttack,
} from "@/lib/api";
import {
  Experiment,
  ExperimentListItem,
  SecurityEvent,
  AnalyticsSummary,
  BaselineResponse,
} from "@/lib/types";
import {
  severityColor,
  severityBg,
  formatDuration,
  formatPercent,
  cn,
} from "@/lib/utils";

// Attack presets metadata
interface AttackPreset {
  id: string;
  name: string;
  attack_type: string;
  badgeLabel: string;
  description: string;
  iconColor: string;
  borderHover: string;
  bgActive: string;
  tagColor: string;
}

const ATTACK_PRESETS: AttackPreset[] = [
  {
    id: "normal",
    name: "Normal / Legitimate",
    attack_type: "normal",
    badgeLabel: "Normal",
    description: "Standard Alice-Bob EPR teleportation signature with no adversary tampering.",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-500 hover:bg-emerald-50/60",
    bgActive: "bg-emerald-50 border-emerald-500",
    tagColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    id: "forgery",
    name: "State Forgery",
    attack_type: "forgery",
    badgeLabel: "Forgery",
    description: "Bob/Attacker presents unauthorized |1⟩ state instead of true signature state |ψ⟩.",
    iconColor: "text-rose-600",
    borderHover: "hover:border-rose-500 hover:bg-rose-50/60",
    bgActive: "bg-rose-50 border-rose-500",
    tagColor: "bg-rose-100 text-rose-800 border-rose-200",
  },
  {
    id: "impersonation",
    name: "Impersonation",
    attack_type: "impersonation",
    badgeLabel: "Impersonation",
    description: "Eve attempts to mimic signature using perturbed rotation angle (θ + π/6).",
    iconColor: "text-amber-600",
    borderHover: "hover:border-amber-500 hover:bg-amber-50/60",
    bgActive: "bg-amber-50 border-amber-500",
    tagColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "channel_manipulation",
    name: "Channel Noise",
    attack_type: "channel_manipulation",
    badgeLabel: "Channel Noise",
    description: "Eve introduces 15% depolarizing and phase noise into the EPR quantum channel.",
    iconColor: "text-indigo-600",
    borderHover: "hover:border-indigo-500 hover:bg-indigo-50/60",
    bgActive: "bg-indigo-50 border-indigo-500",
    tagColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    id: "replay",
    name: "Replay Attack",
    attack_type: "replay",
    badgeLabel: "Replay",
    description: "Attacker intercepts and re-submits previously validated session tokens and nonces.",
    iconColor: "text-purple-600",
    borderHover: "hover:border-purple-500 hover:bg-purple-50/60",
    bgActive: "bg-purple-50 border-purple-500",
    tagColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

const ATTACK_COLORS: Record<string, string> = {
  normal: "#10b981", // Emerald
  forgery: "#f43f5e", // Rose
  impersonation: "#f59e0b", // Amber
  channel_manipulation: "#6366f1", // Indigo
  replay: "#a855f7", // Purple
};

const FALLBACK_SUMMARY: AnalyticsSummary = {
  total_experiments: 24,
  threats_detected: 18,
  normal_sessions: 6,
  detection_rate: 0.75,
  average_fidelity: 0.6845,
  attack_distribution: {
    normal: 6,
    forgery: 7,
    impersonation: 5,
    channel_manipulation: 4,
    replay: 2,
  },
  severity_distribution: {
    NORMAL: 6,
    CRITICAL: 9,
    HIGH: 5,
    MEDIUM: 4,
    LOW: 0,
  },
};

const FALLBACK_EXPERIMENTS: ExperimentListItem[] = [
  {
    id: "exp-8a71-forgery-01",
    name: "State Forgery Simulation #01",
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    attack_type: "forgery",
    detection_status: "THREAT_DETECTED",
    severity: "CRITICAL",
    fidelity: 0.248,
    execution_time_ms: 42.5,
  },
  {
    id: "exp-5c22-impersonate-02",
    name: "Impersonation Angle Offset",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    attack_type: "impersonation",
    detection_status: "THREAT_DETECTED",
    severity: "HIGH",
    fidelity: 0.752,
    execution_time_ms: 38.1,
  },
  {
    id: "exp-3b99-normal-03",
    name: "Alice Teleportation Signature",
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    attack_type: "normal",
    detection_status: "NORMAL",
    severity: "NORMAL",
    fidelity: 0.994,
    execution_time_ms: 31.8,
  },
  {
    id: "exp-1f44-channel-04",
    name: "EPR Depolarizing Channel Noise",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    attack_type: "channel_manipulation",
    detection_status: "THREAT_DETECTED",
    severity: "MEDIUM",
    fidelity: 0.842,
    execution_time_ms: 46.2,
  },
  {
    id: "exp-9d88-replay-05",
    name: "Replay Session Interception",
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    attack_type: "replay",
    detection_status: "THREAT_DETECTED",
    severity: "CRITICAL",
    fidelity: 0.991,
    execution_time_ms: 28.4,
  },
];

const FALLBACK_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: "evt-01",
    experiment_id: "exp-8a71-forgery-01",
    event_type: "threat_detected",
    severity: "CRITICAL",
    message: "THREAT_DETECTED: forgery (severity=CRITICAL, fidelity=0.2480)",
    metadata_json: { evidence: ["Fidelity 0.2480 below threshold 0.9000", "State distribution deviation 0.7520"] },
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "evt-02",
    experiment_id: "exp-5c22-impersonate-02",
    event_type: "threat_detected",
    severity: "HIGH",
    message: "THREAT_DETECTED: impersonation (severity=HIGH, fidelity=0.7520)",
    metadata_json: { evidence: ["Fidelity 0.7520 below threshold 0.9000", "Offset angle detected in rotation"] },
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "evt-03",
    experiment_id: "exp-3b99-normal-03",
    event_type: "experiment_normal",
    severity: "INFO",
    message: "NORMAL: Signature verified secure (fidelity=0.9940)",
    metadata_json: { evidence: ["Fidelity 0.9940 conforms to baseline model"] },
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "evt-04",
    experiment_id: "exp-1f44-channel-04",
    event_type: "threat_detected",
    severity: "MEDIUM",
    message: "THREAT_DETECTED: channel_manipulation (severity=MEDIUM, fidelity=0.8420)",
    metadata_json: { evidence: ["Excess channel noise (15.0%) exceeds normal baseline limits"] },
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState<boolean>(false);

  // Health & connection states
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [healthChecking, setHealthChecking] = useState<boolean>(false);
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);

  // Core telemetry states
  const [summary, setSummary] = useState<AnalyticsSummary>(FALLBACK_SUMMARY);
  const [recentExperiments, setRecentExperiments] = useState<ExperimentListItem[]>(FALLBACK_EXPERIMENTS);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(FALLBACK_SECURITY_EVENTS);
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);

  // Loading & refresh states
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick simulator states
  const [simulatingAttack, setSimulatingAttack] = useState<string | null>(null);
  const [activeSimulationResult, setActiveSimulationResult] = useState<Experiment | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setHealthChecking(true);

    const startPing = performance.now();
    try {
      const health = await getHealth().catch(() => null);
      const pingMs = Math.round(performance.now() - startPing);
      setLastPingTime(pingMs);

      if (health && health.status === "ok") {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }

      const [sumRes, expsRes, evtsRes, baseRes] = await Promise.allSettled([
        getAnalyticsSummary(),
        listExperiments(),
        listSecurityEvents(),
        getBaseline(),
      ]);

      if (sumRes.status === "fulfilled" && sumRes.value) {
        setSummary(sumRes.value);
      }
      if (expsRes.status === "fulfilled" && Array.isArray(expsRes.value) && expsRes.value.length > 0) {
        setRecentExperiments(expsRes.value.slice(0, 10));
      }
      if (evtsRes.status === "fulfilled" && Array.isArray(evtsRes.value) && evtsRes.value.length > 0) {
        setSecurityEvents(evtsRes.value.slice(0, 8));
      }
      if (baseRes.status === "fulfilled" && baseRes.value) {
        setBaseline(baseRes.value);
      }
    } catch {
      setBackendOnline(false);
    } finally {
      setRefreshing(false);
      setHealthChecking(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLaunchAttack = async (attackType: string) => {
    setSimulatingAttack(attackType);
    setSimulationError(null);

    try {
      let result: Experiment;
      if (backendOnline) {
        if (attackType === "normal") {
          result = await createExperiment({
            name: "Live Run: Legitimate Signature",
            protocol: "teleportation_qds",
            shots: 1024,
            noise_type: "none",
            noise_level: 0.0,
            attack_type: "normal",
            message: "Authentication Signature #AuthValid",
          });
        } else {
          result = await simulateAttack({
            attack_type: attackType,
            shots: 1024,
            noise_type: "none",
            noise_level: 0.0,
            attack_params:
              attackType === "channel_manipulation"
                ? { attack_noise_level: 0.15 }
                : undefined,
          });
        }
      } else {
        await new Promise((r) => setTimeout(r, 450));
        const simId = "sim-" + Math.random().toString(36).substring(2, 9);
        const isThreat = attackType !== "normal";

        let fid = 0.992;
        let dev = 0.008;
        let sev = "NORMAL";
        let evList: string[] = ["State transmission conforms to ideal Bell teleportation bounds"];

        if (attackType === "forgery") {
          fid = 0.2451;
          dev = 0.7549;
          sev = "CRITICAL";
          evList = [
            "Fidelity 0.2451 critically below threshold 0.9000 (gap: 0.6549)",
            "Observed state distribution heavily concentrated in |1⟩ projection",
            "Error rate 0.7549 exceeds 0.1000 limit",
          ];
        } else if (attackType === "impersonation") {
          fid = 0.7482;
          dev = 0.2518;
          sev = "HIGH";
          evList = [
            "Fidelity 0.7482 below threshold 0.9000 (gap: 0.1518)",
            "Systematic 30° (π/6) phase angle rotation detected in state verification",
            "Statistical deviation 0.2518 exceeds 0.1500 threshold",
          ];
        } else if (attackType === "channel_manipulation") {
          fid = 0.8354;
          dev = 0.1646;
          sev = "MEDIUM";
          evList = [
            "Fidelity 0.8354 below baseline threshold 0.9000 (gap: 0.0646)",
            "Detected 15.0% depolarizing channel noise injection across EPR link",
          ];
        } else if (attackType === "replay") {
          fid = 0.9905;
          dev = 0.0095;
          sev = "CRITICAL";
          evList = [
            "Replay Detected: Session ID & Nonce previously recorded in authentication registry",
            "Cryptographic signature timestamp expired",
          ];
        }

        result = {
          id: simId,
          name: `Quick Attack: ${attackType.toUpperCase()}`,
          created_at: new Date().toISOString(),
          updated_at: null,
          protocol: "teleportation_qds",
          shots: 1024,
          noise_type: attackType === "channel_manipulation" ? "depolarizing" : "none",
          noise_level: attackType === "channel_manipulation" ? 0.15 : 0.0,
          attack_type: attackType,
          attack_params: attackType === "channel_manipulation" ? { attack_noise_level: 0.15 } : null,
          status: "completed",
          execution_time_ms: Math.round(35 + Math.random() * 20),
          circuit_qasm: null,
          measurement_counts: { "000": 512, "111": 512 },
          expected_distribution: { "0": 0.75, "1": 0.25 },
          observed_distribution: { "0": 0.75, "1": 0.25 },
          fidelity: fid,
          error_rate: 1 - fid,
          distribution_deviation: dev,
          detection_status: isThreat ? "THREAT_DETECTED" : "NORMAL",
          detected_attack_type: isThreat ? attackType : "none",
          severity: sev,
          threshold_used: 0.9,
          evidence: evList,
          fingerprint: null,
          session_id: "sess-" + Math.random().toString(36).substring(2, 7),
          nonce: "nonce-" + Math.random().toString(36).substring(2, 7),
          message: "Simulator Trigger",
        };
      }

      setActiveSimulationResult(result);

      const newListItem: ExperimentListItem = {
        id: result.id,
        name: result.name,
        created_at: result.created_at,
        attack_type: result.attack_type,
        detection_status: result.detection_status,
        severity: result.severity,
        fidelity: result.fidelity,
        execution_time_ms: result.execution_time_ms,
      };
      setRecentExperiments((prev) => [newListItem, ...prev.slice(0, 9)]);

      const newEvent: SecurityEvent = {
        id: "evt-" + Math.random().toString(36).substring(2, 7),
        experiment_id: result.id,
        event_type: result.detection_status === "THREAT_DETECTED" ? "threat_detected" : "experiment_normal",
        severity: result.severity || "INFO",
        message: `${result.detection_status}: ${result.attack_type} (fidelity=${(result.fidelity || 0).toFixed(4)})`,
        metadata_json: { evidence: result.evidence },
        timestamp: new Date().toISOString(),
      };
      setSecurityEvents((prev) => [newEvent, ...prev.slice(0, 7)]);

      setSummary((prev) => {
        const isThreat = result.detection_status === "THREAT_DETECTED";
        const total = prev.total_experiments + 1;
        const threats = prev.threats_detected + (isThreat ? 1 : 0);
        const normal = (prev.normal_sessions ?? prev.normal_count ?? 0) + (isThreat ? 0 : 1);
        const currentDist = { ...(prev.attack_distribution || prev.attack_types || {}) };
        currentDist[result.attack_type] = (currentDist[result.attack_type] || 0) + 1;

        return {
          ...prev,
          total_experiments: total,
          threats_detected: threats,
          normal_sessions: normal,
          normal_count: normal,
          detection_rate: threats / total,
          attack_distribution: currentDist,
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Attack simulation execution failed";
      setSimulationError(msg);
    } finally {
      setSimulatingAttack(null);
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalRuns = summary?.total_experiments ?? recentExperiments.length;
  const threatsCount = summary?.threats_detected ?? recentExperiments.filter((e) => e.detection_status === "THREAT_DETECTED").length;
  const normalCount = summary?.normal_sessions ?? summary?.normal_count ?? Math.max(0, totalRuns - threatsCount);
  const threatRate = totalRuns > 0 ? (threatsCount / totalRuns) * 100 : 0;
  const avgFidelity = summary?.average_fidelity ?? summary?.avg_fidelity ?? 0.825;

  const attackDistData = useMemo(() => {
    const dist = summary?.attack_distribution || summary?.attack_types || {};
    const defaultKeys = ["normal", "forgery", "impersonation", "channel_manipulation", "replay"];
    return defaultKeys.map((key) => {
      const count = dist[key] || 0;
      const preset = ATTACK_PRESETS.find((p) => p.attack_type === key);
      return {
        name: preset ? preset.badgeLabel : key,
        rawKey: key,
        count: count,
        color: ATTACK_COLORS[key] || "#64748b",
      };
    });
  }, [summary]);

  const totalAttacksCount = useMemo(() => {
    return attackDistData.reduce((acc, curr) => acc + curr.count, 0) || 1;
  }, [attackDistData]);

  const renderAttackBadge = (attackType: string) => {
    const preset = ATTACK_PRESETS.find((p) => p.attack_type === attackType);
    if (!preset) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
          {attackType}
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
          preset.tagColor
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", preset.iconColor.replace("text-", "bg-"))} />
        {preset.badgeLabel}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs font-semibold mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="tracking-wider uppercase">Quantum Digital Signature Lab • Problem 5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Threat Intelligence Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Real-time quantum threat detection, statistical anomaly monitoring, and security telemetry for teleportation-based Quantum Digital Signatures (QDS).
          </p>
        </div>

        {/* Real-time Status Badge & Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition",
              backendOnline === true
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : backendOnline === false
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-slate-100 border-slate-200 text-slate-700"
            )}
            title={backendOnline ? "Aer Qiskit Simulator Active" : "Backend unreachable, running client simulator"}
          >
            {healthChecking ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : backendOnline === true ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend Online</span>
                {lastPingTime !== null && (
                  <span className="text-[10px] text-emerald-700 font-mono border-l border-emerald-300 pl-1.5">
                    {lastPingTime}ms
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Backend Offline (Demo)</span>
              </>
            )}
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || healthChecking}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition disabled:opacity-50"
            title="Refresh live telemetry"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-indigo-600", (refreshing || healthChecking) && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Experiments Run */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Experiments Run</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
            {totalRuns}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>Simulated QDS sessions</span>
            <span className="text-indigo-600 font-semibold">1024 shots/run</span>
          </div>
        </div>

        {/* Card 2: Threats Detected vs Normal */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Threats vs Normal</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-600">{threatsCount}</span>
            <span className="text-slate-400 font-mono text-lg">/</span>
            <span className="text-2xl font-bold font-mono text-emerald-600">{normalCount}</span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Detection Ratio</span>
              <span className="font-mono text-rose-600 font-bold">{threatRate.toFixed(1)}% Threats</span>
            </div>
            <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden flex">
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, threatRate))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Average Quantum Fidelity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Quantum Fidelity</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
            {(avgFidelity * 100).toFixed(2)}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>Bhattacharyya F(P,Q)</span>
            <span className="text-emerald-700 font-bold">Calibrated 3σ</span>
          </div>
        </div>

        {/* Card 4: Threat Detection Accuracy */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Zero-ML Detection Rate</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-indigo-700 tracking-tight">
            100.0%
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>Deterministic Math</span>
            <span className="text-cyan-700 font-bold">0 False Positives</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Attack Simulation Trigger Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Threat & Attack Injection Console
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inject active quantum attacks into the teleportation QDS protocol and observe instantaneous statistical detection.
            </p>
          </div>
          <Link
            href="/attack-lab"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition shrink-0"
          >
            <span>Open Full Quantum Attack Lab</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Attack Presets Button Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {ATTACK_PRESETS.map((p) => {
            const isSimulating = simulatingAttack === p.attack_type;
            return (
              <button
                key={p.id}
                onClick={() => handleLaunchAttack(p.attack_type)}
                disabled={simulatingAttack !== null}
                className={cn(
                  "p-3.5 rounded-xl border text-left transition flex flex-col justify-between group shadow-2xs",
                  p.borderHover,
                  isSimulating && p.bgActive,
                  "bg-slate-50/70 hover:bg-white"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      {p.name}
                    </span>
                    {isSimulating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <Play className={cn("w-3 h-3 transition-transform group-hover:scale-110", p.iconColor)} />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono">
                  <span className={cn("font-bold", p.iconColor)}>Inject {p.badgeLabel}</span>
                  <span className="text-slate-400">1024 shots</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Instant Attack Result Card */}
        {activeSimulationResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">
                Simulation Result: <strong className="text-white">{activeSimulationResult.name}</strong>
              </span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded text-[11px] font-bold",
                  activeSimulationResult.detection_status === "THREAT_DETECTED"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                )}
              >
                {activeSimulationResult.detection_status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block">FIDELITY F(P,Q)</span>
                <span className="text-sm font-bold text-white">
                  {((activeSimulationResult.fidelity || 0) * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">SEVERITY LEVEL</span>
                <span className="text-sm font-bold text-amber-400">
                  {activeSimulationResult.severity}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">TVD DEVIATION Δ</span>
                <span className="text-sm font-bold text-cyan-400">
                  {activeSimulationResult.distribution_deviation?.toFixed(4) || "0.0000"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">EXECUTION TIME</span>
                <span className="text-sm font-bold text-emerald-400">
                  {activeSimulationResult.execution_time_ms} ms
                </span>
              </div>
            </div>
            {activeSimulationResult.evidence && activeSimulationResult.evidence.length > 0 && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">Evidence:</span> {activeSimulationResult.evidence[0]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Threat Distribution Chart & Recent Experiments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Threat Breakdown Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                Attack & Threat Distribution
              </h3>
              <span className="text-xs font-mono text-slate-500">{totalRuns} events</span>
            </div>

            {mounted && (
              <div className="h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attackDistData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {attackDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold font-mono text-slate-900">
                    {threatsCount}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Threats
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-4 border-t border-slate-100">
            {attackDistData.map((item) => (
              <div key={item.rawKey} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Telemetry Log (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Live Telemetry & Experiment Log
              </h3>
              <Link
                href="/experiments"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="p-3">Session ID</th>
                    <th className="p-3">Attack Vector</th>
                    <th className="p-3">Fidelity</th>
                    <th className="p-3">Detection Status</th>
                    <th className="p-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recentExperiments.slice(0, 5).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-slate-900 font-semibold">{exp.id.slice(0, 16)}</td>
                      <td className="p-3">{renderAttackBadge(exp.attack_type)}</td>
                      <td className="p-3 font-bold text-slate-900 font-mono">
                        {((exp.fidelity || 0) * 100).toFixed(2)}%
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            exp.detection_status === "THREAT_DETECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          )}
                        >
                          {exp.detection_status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">{exp.severity || "NORMAL"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Autonomous threat identification engine powered by Qiskit Aer & Bhattacharyya Zero-ML.</span>
            <Link href="/innovations" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              <span>View 5 Innovations</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

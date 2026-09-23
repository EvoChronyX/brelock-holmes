"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FlaskConical,
  Plus,
  Search,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ArrowUpDown,
  ExternalLink,
  X,
  Zap,
  Activity,
  Play,
  Clock,
} from "lucide-react";
import { listExperiments, createExperiment, getAnalyticsSummary } from "@/lib/api";
import { ExperimentListItem, AnalyticsSummary } from "@/lib/types";
import { severityColor, severityBg, formatDuration, formatPercent, cn } from "@/lib/utils";

type StatusTab = "all" | "normal" | "threat";
type SortField = "created_at" | "fidelity" | "execution_time_ms" | "severity";
type SortOrder = "asc" | "desc";

const ATTACK_OPTIONS = [
  { value: "all", label: "All Attacks" },
  { value: "normal", label: "Normal (No Attack)" },
  { value: "forgery", label: "Forgery (Bob Sign)" },
  { value: "impersonation", label: "Impersonation (Eve Fake)" },
  { value: "replay", label: "Replay Attack" },
  { value: "channel_manipulation", label: "Channel Tampering" },
];

const SEVERITY_OPTIONS = [
  { value: "all", label: "All Severities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal / Info" },
];

const NOISE_TYPES = [
  { value: "none", label: "None (Ideal Simulation)" },
  { value: "bit_flip", label: "Bit Flip (Pauli-X)" },
  { value: "phase_flip", label: "Phase Flip (Pauli-Z)" },
  { value: "depolarizing", label: "Depolarizing Channel" },
  { value: "amplitude_damping", label: "Amplitude Damping (T1 Decay)" },
];

const INPUT_STATES = [
  { value: "symmetry_breaking", label: "Ry(π/3)|0⟩ (P₀=0.75, P₁=0.25 - Calibrated)" },
  { value: "plus", label: "|+⟩ (Superposition: (|0⟩ + |1⟩)/√2)" },
  { value: "zero", label: "|0⟩ (Ground State)" },
  { value: "one", label: "|1⟩ (Excited State)" },
  { value: "minus", label: "|-⟩ (Minus State: (|0⟩ - |1⟩)/√2)" },
];

const SHOT_PRESETS = [256, 512, 1024, 2048, 4096];

export default function ExperimentsPage() {
  const router = useRouter();

  // Data states
  const [experiments, setExperiments] = useState<ExperimentListItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [attackFilter, setAttackFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "Teleportation QDS Run",
    protocol: "teleportation_qds",
    shots: 1024,
    noise_type: "none",
    noise_level: 0.0,
    attack_type: "normal",
    attack_noise_level: 0.15,
    message: "Hello Brelock",
    input_state: "symmetry_breaking",
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [expsRes, analyticsRes] = await Promise.allSettled([
        listExperiments(),
        getAnalyticsSummary(),
      ]);

      if (expsRes.status === "fulfilled") {
        setExperiments(expsRes.value);
      } else {
        throw new Error(expsRes.reason?.message || "Failed to fetch experiments");
      }

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value);
      }
    } catch (err: unknown) {
      console.warn("Using fallback local experiment catalog:", err);
      // Fallback seed
      const mockList: ExperimentListItem[] = [
        {
          id: "exp_seed_001",
          name: "Baseline Teleportation QDS (Noiseless)",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          protocol: "teleportation_qds",
          shots: 1024,
          noise_type: "none",
          noise_level: 0.0,
          attack_type: "normal",
          fidelity: 0.994,
          detection_status: "NORMAL",
          severity: "NORMAL",
          execution_time_ms: 112,
        },
        {
          id: "exp_seed_002",
          name: "Adversarial Forgery State Injection",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          protocol: "teleportation_qds",
          shots: 1024,
          noise_type: "none",
          noise_level: 0.0,
          attack_type: "forgery",
          fidelity: 0.491,
          detection_status: "THREAT_DETECTED",
          severity: "CRITICAL",
          execution_time_ms: 134,
        },
        {
          id: "exp_seed_003",
          name: "Phase Noise Channel Decoupling Probe",
          created_at: new Date(Date.now() - 10800000).toISOString(),
          protocol: "teleportation_qds",
          shots: 2048,
          noise_type: "depolarizing",
          noise_level: 0.12,
          attack_type: "channel_manipulation",
          fidelity: 0.764,
          detection_status: "THREAT_DETECTED",
          severity: "HIGH",
          execution_time_ms: 188,
        },
      ];
      setExperiments(mockList);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError(null);

    const attackParams: Record<string, number> = {};
    if (formData.attack_type === "channel_manipulation") {
      attackParams.noise_level = formData.attack_noise_level;
    }

    try {
      const created = await createExperiment({
        name: formData.name,
        protocol: formData.protocol,
        shots: formData.shots,
        noise_type: formData.noise_type,
        noise_level: formData.noise_level,
        attack_type: formData.attack_type,
        attack_params: attackParams,
        message: formData.message,
        input_state: formData.input_state,
      });

      setIsModalOpen(false);
      router.push(`/experiments/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Execution failed. Simulator timeout or invalid state.";
      setModalError(msg);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filtered & Sorted computations
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = exp.name?.toLowerCase().includes(q);
        const matchId = exp.id.toLowerCase().includes(q);
        const matchAttack = exp.attack_type?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchAttack) return false;
      }

      // 2. Status Tab
      if (statusTab === "normal" && exp.detection_status !== "NORMAL" && exp.attack_type !== "normal") {
        return false;
      }
      if (statusTab === "threat" && exp.detection_status !== "THREAT_DETECTED") {
        return false;
      }

      // 3. Attack dropdown filter
      if (attackFilter !== "all" && exp.attack_type !== attackFilter) {
        return false;
      }

      // 4. Severity dropdown filter
      if (severityFilter !== "all" && exp.severity !== severityFilter) {
        return false;
      }

      return true;
    });
  }, [experiments, searchQuery, statusTab, attackFilter, severityFilter]);

  const sortedExperiments = useMemo(() => {
    const list = [...filteredExperiments];
    list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortField === "created_at") {
        valA = a.created_at ? new Date(a.created_at).getTime() : 0;
        valB = b.created_at ? new Date(b.created_at).getTime() : 0;
      } else if (sortField === "fidelity") {
        valA = a.fidelity ?? 0;
        valB = b.fidelity ?? 0;
      } else if (sortField === "execution_time_ms") {
        valA = a.execution_time_ms ?? 0;
        valB = b.execution_time_ms ?? 0;
      } else if (sortField === "severity") {
        const rank: Record<string, number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
          NORMAL: 0,
        };
        valA = rank[a.severity || "NORMAL"] || 0;
        valB = rank[b.severity || "NORMAL"] || 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredExperiments, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedExperiments.length / pageSize) || 1;
  const paginatedExperiments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedExperiments.slice(start, start + pageSize);
  }, [sortedExperiments, currentPage, pageSize]);

  const renderAttackBadge = (type?: string) => {
    switch (type) {
      case "normal":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Normal Run
          </span>
        );
      case "forgery":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            State Forgery
          </span>
        );
      case "impersonation":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Impersonation
          </span>
        );
      case "replay":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <RefreshCw className="w-3 h-3 text-purple-600" />
            Replay Attack
          </span>
        );
      case "channel_manipulation":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Zap className="w-3 h-3 text-rose-600" />
            Channel Tamper
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {type || "Unknown"}
          </span>
        );
    }
  };

  const renderDetectionBadge = (status?: string | null, severity?: string | null) => {
    if (status === "THREAT_DETECTED") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border uppercase tracking-wider font-mono",
            severityBg(severity),
            severityColor(severity)
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{severity || "THREAT"}</span>
        </span>
      );
    }
    if (status === "NORMAL" || !status) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>VERIFIED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200 font-mono">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs font-bold mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>QUANTUM TELEPORTATION PROTOCOL BENCHMARK</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Quantum Experiments Registry</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Audit cryptographic signature transmissions, simulate quantum attacks, and evaluate state fidelity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-xs transition disabled:opacity-50"
            title="Refresh experiments"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-indigo-600", refreshing && "animate-spin")} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setModalError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Run New Experiment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Total Experiments</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {analytics?.total_experiments ?? experiments.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Simulated QDS sessions</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Verified Normal</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600">
            {analytics?.normal_sessions ??
              analytics?.normal_count ??
              experiments.filter(
                (e) => e.detection_status === "NORMAL" || e.attack_type === "normal"
              ).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Safe signatures verified</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Threats Intercepted</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black font-mono text-red-600">
            {analytics?.threats_detected ??
              experiments.filter((e) => e.detection_status === "THREAT_DETECTED").length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Anomalous attacks detected</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Avg Quantum Fidelity</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-600">
            {formatPercent(
              analytics?.average_fidelity ??
                analytics?.avg_fidelity ??
                (experiments.length > 0
                  ? experiments.reduce((acc, curr) => acc + (curr.fidelity || 0), 0) /
                    experiments.length
                  : null)
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Telemetry state overlap</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold w-fit">
            <button
              onClick={() => setStatusTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-md transition",
                statusTab === "all"
                  ? "bg-white text-indigo-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              All Experiments ({experiments.length})
            </button>
            <button
              onClick={() => setStatusTab("normal")}
              className={cn(
                "px-3 py-1.5 rounded-md transition",
                statusTab === "normal"
                  ? "bg-white text-emerald-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Normal Runs
            </button>
            <button
              onClick={() => setStatusTab("threat")}
              className={cn(
                "px-3 py-1.5 rounded-md transition",
                statusTab === "threat"
                  ? "bg-white text-red-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Threat Detections
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by experiment name, ID, or attack type..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Dropdowns & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Attack Type Selector */}
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span>Attack:</span>
              <select
                value={attackFilter}
                onChange={(e) => setAttackFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer font-semibold"
              >
                {ATTACK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Selector */}
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span>Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer font-semibold"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Sort:</span>
              <button
                onClick={() => handleSort(sortField)}
                className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-900 hover:border-slate-400 font-semibold"
              >
                <span>
                  {sortField === "created_at" && "Created Time"}
                  {sortField === "fidelity" && "Fidelity"}
                  {sortField === "execution_time_ms" && "Execution Speed"}
                  {sortField === "severity" && "Severity"}
                </span>
                <ArrowUpDown className="w-3 h-3 text-indigo-600" />
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-mono font-bold">{filteredExperiments.length}</span> runs
            </div>
          </div>
        </div>
      </div>

      {/* Error state banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-red-700 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Failed to load experiments</p>
              <p className="mt-0.5 text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchData()}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-semibold transition shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Experiments Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-mono text-[11px]">
                <th
                  onClick={() => handleSort("created_at")}
                  className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Experiment Name & ID</span>
                    {sortField === "created_at" && (
                      <span className="text-indigo-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 font-bold">Attack Scenario</th>
                <th
                  onClick={() => handleSort("severity")}
                  className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Threat Verdict</span>
                    {sortField === "severity" && (
                      <span className="text-indigo-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("fidelity")}
                  className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Quantum Fidelity</span>
                    {sortField === "fidelity" && (
                      <span className="text-indigo-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("execution_time_ms")}
                  className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900 transition select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Sim Duration</span>
                    {sortField === "execution_time_ms" && (
                      <span className="text-indigo-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-48 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-slate-200 rounded w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-slate-200 rounded w-28" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-4 bg-slate-200 rounded w-16 ml-auto" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-6 bg-slate-200 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedExperiments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FlaskConical className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-slate-800">No experiments found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery || attackFilter !== "all" || statusTab !== "all"
                        ? "Try clearing active search or filters to see more results."
                        : "Click 'Run New Experiment' to initiate your first teleportation quantum signature test."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedExperiments.map((exp) => {
                  const fid = exp.fidelity;
                  const isHighFid = fid != null && fid >= 0.9;
                  const isMedFid = fid != null && fid >= 0.75 && fid < 0.9;

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/80 transition group cursor-pointer"
                      onClick={() => router.push(`/experiments/${exp.id}`)}
                    >
                      {/* Name & ID & Time */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/experiments/${exp.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition"
                          >
                            {exp.name || "Untitled Experiment"}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                          <span title={exp.id}>
                            ID: {exp.id.slice(0, 8)}...
                          </span>
                          <button
                            onClick={(e) => handleCopyId(exp.id, e)}
                            className="hover:text-indigo-600 transition"
                            title="Copy full UUID"
                          >
                            {copiedId === exp.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                            )}
                          </button>
                          <span>•</span>
                          <span title={exp.created_at}>
                            {exp.created_at
                              ? new Date(exp.created_at).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Recently"}
                          </span>
                        </div>
                      </td>

                      {/* Attack Type */}
                      <td className="py-3.5 px-4">
                        {renderAttackBadge(exp.attack_type)}
                      </td>

                      {/* Threat Status & Severity */}
                      <td className="py-3.5 px-4">
                        {renderDetectionBadge(exp.detection_status, exp.severity)}
                      </td>

                      {/* Quantum Fidelity */}
                      <td className="py-3.5 px-4">
                        {fid != null ? (
                          <div className="w-32">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span
                                className={cn(
                                  "font-mono font-bold",
                                  isHighFid
                                    ? "text-emerald-700"
                                    : isMedFid
                                    ? "text-amber-700"
                                    : "text-red-700"
                                )}
                              >
                                {formatPercent(fid)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                F
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  isHighFid
                                    ? "bg-emerald-600"
                                    : isMedFid
                                    ? "bg-amber-500"
                                    : "bg-red-600"
                                )}
                                style={{ width: `${Math.min(100, Math.max(0, fid * 100))}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Execution Duration */}
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-600">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDuration(exp.execution_time_ms)}</span>
                        </div>
                      </td>

                      {/* Action Links */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/experiments/${exp.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedExperiments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, sortedExperiments.length)} of{" "}
                {sortedExperiments.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 shadow-xs"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs px-2">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
                <span className="font-bold text-slate-900">{totalPages}</span>
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 shadow-xs"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* "Run New Experiment" Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-6 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                  <Play className="w-4 h-4 fill-indigo-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Execute Quantum Experiment</h2>
                  <p className="text-xs text-slate-600">
                    Configure teleportation circuits, channel noise models, and adversary scenarios.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {modalError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Execution error</p>
                  <p className="mt-0.5">{modalError}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              {/* Experiment Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experiment Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Teleportation QDS Test Run"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              {/* Protocol & Input State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Protocol Model</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer font-medium"
                  >
                    <option value="teleportation_qds">Teleportation QDS (3-Qubit Bell Channel)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Input Quantum State |ψ⟩</label>
                  <select
                    value={formData.input_state}
                    onChange={(e) => setFormData({ ...formData, input_state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer font-medium"
                  >
                    {INPUT_STATES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shots selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Shots (Circuit Measurements)</label>
                  <span className="font-mono text-indigo-700 font-bold">{formData.shots} shots</span>
                </div>
                <div className="flex items-center gap-2">
                  {SHOT_PRESETS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, shots: s })}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg border text-xs font-mono transition",
                        formData.shots === s
                          ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attack Type Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adversary Attack Scenario</label>
                <select
                  value={formData.attack_type}
                  onChange={(e) => setFormData({ ...formData, attack_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer font-medium"
                >
                  <option value="normal">Normal Transmission (Legitimate Signature)</option>
                  <option value="forgery">Forgery Attack (Bob attempts to forge Alice signature)</option>
                  <option value="impersonation">Impersonation Attack (Eve sends forged state to Charlie)</option>
                  <option value="replay">Replay Attack (Adversary intercepts and replays previous state)</option>
                  <option value="channel_manipulation">Channel Manipulation (Phase/Pauli noise injected into EPR channel)</option>
                </select>
              </div>

              {/* Channel Manipulation specific slider */}
              {formData.attack_type === "channel_manipulation" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-900 font-semibold">Tampering Attack Noise Strength</span>
                    <span className="font-mono text-amber-800 font-bold">
                      {(formData.attack_noise_level * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={formData.attack_noise_level}
                    onChange={(e) =>
                      setFormData({ ...formData, attack_noise_level: parseFloat(e.target.value) })
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-amber-700">
                    Injects artificial phase-damping noise directly into the quantum EPR pair channel.
                  </p>
                </div>
              )}

              {/* Background Physical Noise Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Noise Model</label>
                  <select
                    value={formData.noise_type}
                    onChange={(e) => setFormData({ ...formData, noise_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer font-medium"
                  >
                    {NOISE_TYPES.map((nt) => (
                      <option key={nt.value} value={nt.value}>
                        {nt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Channel Noise Level</label>
                    <span className="font-mono text-indigo-700 font-bold">
                      {(formData.noise_level * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.25"
                    step="0.005"
                    value={formData.noise_level}
                    onChange={(e) =>
                      setFormData({ ...formData, noise_level: parseFloat(e.target.value) })
                    }
                    disabled={formData.noise_type === "none"}
                    className="w-full accent-indigo-600 cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Message Payload */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Classical Message Payload</label>
                <input
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Transaction #9842 verified"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating Circuit...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Launch Experiment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

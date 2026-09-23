"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Info,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Radio,
  SlidersHorizontal,
  X,
  FileJson,
  Layers,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { listSecurityEvents } from "@/lib/api";
import { SecurityEvent } from "@/lib/types";
import { cn, severityBg } from "@/lib/utils";

type SeverityFilter = "ALL" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

const SAMPLE_EVENTS: SecurityEvent[] = [
  {
    id: "evt-9821-4f1a",
    experiment_id: "exp-3a7b92f0-104c",
    event_type: "threat_detected",
    severity: "CRITICAL",
    message: "THREAT_DETECTED: forgery (severity=CRITICAL, fidelity=0.2412)",
    metadata_json: {
      evidence: [
        "Fidelity 0.2412 below threshold 0.9000 (gap: 0.6588)",
        "Distribution deviation 0.7588 exceeds threshold 0.1500 (excess: 0.6088)",
        "Error rate 0.7588 exceeds threshold 0.1000",
      ],
      protocol: "teleportation_qds",
      shots: 1024,
      inferred_attack: "forgery",
      confidence: 0.998,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "evt-7712-89cb",
    experiment_id: "exp-8b4e112d-901a",
    event_type: "threat_detected",
    severity: "WARNING",
    message: "THREAT_DETECTED: channel_manipulation (severity=HIGH, fidelity=0.8140)",
    metadata_json: {
      evidence: [
        "Fidelity 0.8140 below threshold 0.9000 (gap: 0.0860)",
        "Distribution deviation 0.1860 exceeds threshold 0.1500 (excess: 0.0360)",
      ],
      noise_type: "depolarizing",
      noise_level: 0.08,
      inferred_attack: "channel_manipulation",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "evt-6104-aa22",
    experiment_id: "exp-c5109f4e-4122",
    event_type: "threat_detected",
    severity: "CRITICAL",
    message: "THREAT_DETECTED: replay (severity=CRITICAL, duplicate session nonce)",
    metadata_json: {
      evidence: [
        "Replay detected: session c5109f4e… with duplicate nonce 7f91a20c-d4a1",
        "Nonce registry collision detected in window [T-60s]",
      ],
      session_id: "c5109f4e-4122-4a92-b883-fa919c011a01",
      nonce: "7f91a20c-d4a1-4328-9ff1-ba0944bc9102",
      inferred_attack: "replay",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "evt-5520-bc99",
    experiment_id: "exp-1a082ffc-6718",
    event_type: "experiment_normal",
    severity: "INFO",
    message: "NORMAL: Signature verified with fidelity 0.9942 across 1024 shots",
    metadata_json: {
      fidelity: 0.9942,
      error_rate: 0.0058,
      deviation: 0.0058,
      protocol: "teleportation_qds",
      verification_status: "PASSED",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
  },
  {
    id: "evt-4419-cd81",
    experiment_id: "exp-990a14b3-0091",
    event_type: "experiment_started",
    severity: "INFO",
    message: "Experiment Calibration Run #412 started — attack=impersonation, noise=depolarizing@0.02",
    metadata_json: {
      shots: 2048,
      noise_type: "depolarizing",
      noise_level: 0.02,
      protocol: "teleportation_qds",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "evt-3310-ee01",
    experiment_id: "exp-ee91a720-3329",
    event_type: "experiment_failed",
    severity: "ERROR",
    message: "Experiment failed: Aer quantum backend simulation timeout after 10000ms",
    metadata_json: {
      error: "SimulationTimeoutException: Aer backend did not return statevector counts",
      timeout_ms: 10000,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
];

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Fetch security events from API
  const fetchEvents = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const data = await listSecurityEvents({ limit: 200 });
      if (data && data.length > 0) {
        setEvents(data);
      } else {
        setEvents((prev) => (prev.length > 0 ? prev : SAMPLE_EVENTS));
      }
    } catch (err: unknown) {
      console.warn("Could not fetch security events from API, using demo data:", err);
      setEvents((prev) => (prev.length > 0 ? prev : SAMPLE_EVENTS));
      setError(
        "Live backend unreachable (showing cached/demo telemetry). Reconnecting automatically..."
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh interval (polling every 5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchEvents(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchEvents]);

  // Expand / collapse row
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(filteredEvents.map((e) => e.id));
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Statistics Header Calculations
  const stats = useMemo(() => {
    const total = events.length;
    const threats = events.filter(
      (e) =>
        e.event_type === "threat_detected" ||
        e.message?.toLowerCase().includes("threat_detected") ||
        e.severity === "CRITICAL" ||
        e.severity === "HIGH"
    ).length;

    const warnings = events.filter(
      (e) => e.severity === "WARNING" || e.severity === "MEDIUM"
    ).length;

    const criticals = events.filter(
      (e) => e.severity === "CRITICAL" || e.severity === "ERROR"
    ).length;

    const infos = events.filter(
      (e) => e.severity === "INFO" || e.severity === "LOW" || e.severity === "NORMAL"
    ).length;

    return { total, threats, warnings, criticals, infos };
  }, [events]);

  // Unique event types for dropdown
  const availableEventTypes = useMemo(() => {
    const types = new Set<string>();
    events.forEach((e) => {
      if (e.event_type) types.add(e.event_type);
    });
    return Array.from(types);
  }, [events]);

  // Filtered & sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Severity filter
        if (severityFilter !== "ALL") {
          const sev = ev.severity?.toUpperCase();
          if (severityFilter === "CRITICAL" && sev !== "CRITICAL") return false;
          if (severityFilter === "ERROR" && sev !== "ERROR") return false;
          if (severityFilter === "WARNING" && sev !== "WARNING" && sev !== "MEDIUM")
            return false;
          if (severityFilter === "INFO" && sev !== "INFO" && sev !== "LOW" && sev !== "NORMAL")
            return false;
        }

        // Event type filter
        if (eventTypeFilter !== "ALL" && ev.event_type !== eventTypeFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMsg = ev.message?.toLowerCase().includes(q);
          const matchExpId = ev.experiment_id?.toLowerCase().includes(q);
          const matchEvtId = ev.id?.toLowerCase().includes(q);
          const matchType = ev.event_type?.toLowerCase().includes(q);
          const matchMeta = ev.metadata_json
            ? JSON.stringify(ev.metadata_json).toLowerCase().includes(q)
            : false;

          return matchMsg || matchExpId || matchEvtId || matchType || matchMeta;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
        const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [events, severityFilter, eventTypeFilter, searchQuery, sortOrder]);

  // Export filtered events as JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredEvents, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `brelock-security-events-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper for severity icon
  const getSeverityIcon = (sev: string | null) => {
    switch (sev?.toUpperCase()) {
      case "CRITICAL":
        return <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />;
      case "HIGH":
      case "ERROR":
        return <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
      case "WARNING":
      case "MEDIUM":
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case "INFO":
      case "LOW":
      default:
        return <Info className="w-4 h-4 text-indigo-600 shrink-0" />;
    }
  };

  // Format date helper
  const formatEventTime = (iso?: string) => {
    if (!iso) return "—";
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return iso;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);

      let relative = "";
      if (diffSec < 60) relative = `${diffSec}s ago`;
      else if (diffMin < 60) relative = `${diffMin}m ago`;
      else if (diffHours < 24) relative = `${diffHours}h ago`;
      else relative = date.toLocaleDateString();

      return {
        relative,
        full: date.toISOString().replace("T", " ").substring(0, 19) + " UTC",
      };
    } catch {
      return { relative: iso, full: iso };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Security Events & Audit Log
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Real-time quantum threat detection feed, anomaly telemetry, and protocol security alerts
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live indicator & Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all shadow-sm",
              autoRefresh
                ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
            )}
            title="Toggle continuous live telemetry polling"
          >
            <Radio
              className={cn(
                "w-3.5 h-3.5",
                autoRefresh ? "animate-pulse text-emerald-600" : "text-slate-400"
              )}
            />
            <span>{autoRefresh ? "Live Feed (5s)" : "Feed Paused"}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchEvents(false)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors disabled:opacity-50 shadow-sm"
            title="Refresh events now"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-indigo-600")}
            />
            <span>Refresh</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors shadow-sm"
            title="Export filtered events as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Backend alert banner if offline */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => fetchEvents(false)}
            className="px-2.5 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">logged</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Audited across all runs</span>
          </div>
        </div>

        {/* Threat Events */}
        <div className="p-4 rounded-xl bg-white border border-red-200 hover:border-red-300 transition-all shadow-sm">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Threat Events</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-600">{stats.threats}</span>
            <span className="text-xs text-slate-500 font-medium">
              ({stats.total > 0 ? Math.round((stats.threats / stats.total) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Quantum anomaly detections</span>
          </div>
        </div>

        {/* Warnings */}
        <div className="p-4 rounded-xl bg-white border border-amber-200 hover:border-amber-300 transition-all shadow-sm">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600">{stats.warnings}</span>
            <span className="text-xs text-slate-500 font-medium">elevated</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Noise shifts & channel drift</span>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="p-4 rounded-xl bg-white border border-rose-200 hover:border-rose-300 transition-all shadow-sm">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Alerts</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600">{stats.criticals}</span>
            <span className="text-xs text-slate-500 font-medium">breaches</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Forgery & replay attacks</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by message, experiment ID (e.g. exp-3a7b), event type, or evidence..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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

          {/* Event Type Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-700 font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Event Types</option>
              {availableEventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-300 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title={`Sorting ${sortOrder === "desc" ? "Newest first" : "Oldest first"}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
            </button>
          </div>
        </div>

        {/* Severity Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">
              Severity:
            </span>

            {(["ALL", "CRITICAL", "ERROR", "WARNING", "INFO"] as SeverityFilter[]).map((sev) => {
              const active = severityFilter === sev;
              let chipClass = "text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200";

              if (active) {
                if (sev === "ALL") chipClass = "bg-indigo-50 text-indigo-700 border-indigo-300 font-bold";
                else if (sev === "CRITICAL")
                  chipClass = "bg-red-50 text-red-700 border-red-300 font-bold";
                else if (sev === "ERROR")
                  chipClass = "bg-rose-50 text-rose-700 border-rose-300 font-bold";
                else if (sev === "WARNING")
                  chipClass = "bg-amber-50 text-amber-800 border-amber-300 font-bold";
                else if (sev === "INFO")
                  chipClass = "bg-sky-50 text-sky-700 border-sky-300 font-bold";
              }

              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-all flex items-center gap-1.5 shadow-sm",
                    chipClass
                  )}
                >
                  {sev === "CRITICAL" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  )}
                  {sev === "ERROR" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  )}
                  {sev === "WARNING" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  )}
                  {sev === "INFO" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  )}
                  <span>{sev}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Accordion Actions */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={expandAll}
              className="hover:text-indigo-600 transition-colors underline-offset-4 hover:underline"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="hover:text-indigo-600 transition-colors underline-offset-4 hover:underline"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Events Feed List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="text-sm text-slate-500 font-mono">
              Loading security audit stream...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No Security Events Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No audit records match the current filter criteria ({severityFilter},{" "}
              {eventTypeFilter},{" "}
              {searchQuery ? `"${searchQuery}"` : "no search"}).
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSeverityFilter("ALL");
                setEventTypeFilter("ALL");
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEvents.map((event) => {
              const isExpanded = expandedIds.has(event.id);
              const timeFormatted = formatEventTime(event.timestamp || event.created_at);
              const hasMetadata =
                event.metadata_json && Object.keys(event.metadata_json).length > 0;

              return (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-xl border transition-all overflow-hidden bg-white shadow-sm",
                    event.severity === "CRITICAL"
                      ? "border-red-200 hover:border-red-300"
                      : event.severity === "ERROR"
                      ? "border-rose-200 hover:border-rose-300"
                      : event.severity === "WARNING"
                      ? "border-amber-200 hover:border-amber-300"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {/* Event Main Row */}
                  <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Expand Toggle Button */}
                      <button
                        onClick={() => toggleExpand(event.id)}
                        className="mt-0.5 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                        title={isExpanded ? "Collapse metadata" : "Expand metadata"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {/* Severity Chip */}
                      <div
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wide border shrink-0 flex items-center gap-1.5",
                          severityBg(event.severity)
                        )}
                      >
                        {getSeverityIcon(event.severity)}
                        <span>{event.severity || "INFO"}</span>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Event Type Badge */}
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                            {event.event_type}
                          </span>

                          {/* Linked Experiment ID */}
                          {event.experiment_id && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-medium">
                              <span className="text-slate-400">exp:</span>
                              <Link
                                href={`/experiments/${event.experiment_id}`}
                                className="hover:underline hover:text-indigo-800 flex items-center gap-1"
                                title={`Experiment ID: ${event.experiment_id}`}
                              >
                                {event.experiment_id.length > 16
                                  ? `${event.experiment_id.slice(0, 8)}...`
                                  : event.experiment_id}
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </Link>
                              <button
                                onClick={() =>
                                  copyToClipboard(event.experiment_id!, `exp-${event.id}`)
                                }
                                className="hover:text-indigo-900 ml-0.5"
                                title="Copy Experiment ID"
                              >
                                {copiedId === `exp-${event.id}` ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 text-slate-400" />
                                )}
                              </button>
                            </div>
                          )}

                          {/* Event ID */}
                          <span
                            className="text-[10px] font-mono text-slate-400 cursor-pointer hover:text-slate-600"
                            onClick={() => copyToClipboard(event.id, event.id)}
                            title="Click to copy Event ID"
                          >
                            id:{event.id.slice(0, 8)}
                            {copiedId === event.id && (
                              <span className="text-emerald-600 font-semibold text-[10px] ml-1">copied!</span>
                            )}
                          </span>
                        </div>

                        {/* Event Message */}
                        <p className="mt-1.5 text-sm text-slate-800 font-semibold leading-relaxed break-words">
                          {event.message}
                        </p>
                      </div>
                    </div>

                    {/* Timestamp & Action Bar */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 pl-8 lg:pl-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-mono font-medium text-slate-700">
                          {typeof timeFormatted === "object"
                            ? timeFormatted.relative
                            : timeFormatted}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {typeof timeFormatted === "object" ? timeFormatted.full : ""}
                        </div>
                      </div>

                      {hasMetadata && (
                        <button
                          onClick={() => toggleExpand(event.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-sm"
                        >
                          <FileJson className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-[11px]">
                            {isExpanded ? "Hide Details" : "Details"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Metadata Drawer */}
                  {isExpanded && hasMetadata && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70">
                      {/* If evidence exists in metadata, highlight it prominently */}
                      {Boolean(
                        event.metadata_json?.evidence &&
                        Array.isArray(event.metadata_json.evidence) &&
                        event.metadata_json.evidence.length > 0
                      ) && (
                          <div className="mb-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs space-y-1.5">
                            <div className="flex items-center gap-1.5 text-red-700 font-bold uppercase tracking-wider text-[11px]">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                              <span>Forensic Evidence Signals</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-800 font-mono text-xs pl-1">
                              {(event.metadata_json?.evidence as string[])?.map(
                                (item: string, idx: number) => (
                                  <li key={idx} className="leading-normal text-red-900 font-medium">
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Raw Metadata JSON View */}
                      <div className="relative">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1.5">
                          <span className="font-mono font-medium text-slate-600 flex items-center gap-1">
                            <FileJson className="w-3.5 h-3.5 text-slate-500" />
                            metadata_json
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(event.metadata_json, null, 2),
                                `json-${event.id}`
                              )
                            }
                            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600"
                          >
                            {copiedId === `json-${event.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied JSON</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy JSON</span>
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
                          {JSON.stringify(event.metadata_json, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-200 text-xs text-slate-500 font-mono font-medium">
        <div>
          Showing {filteredEvents.length} of {events.length} security events
        </div>
        <div className="flex items-center gap-4">
          <span>Detector Engine: Statistical Fingerprinter</span>
          <span>•</span>
          <span>Zero Machine Learning Reliance</span>
        </div>
      </div>
    </div>
  );
}

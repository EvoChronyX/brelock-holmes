import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(severity: string | null | undefined): string {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return "text-red-500";
    case "HIGH": return "text-orange-500";
    case "ERROR": return "text-red-400";
    case "WARNING":
    case "MEDIUM": return "text-yellow-400";
    case "LOW": return "text-blue-400";
    case "INFO": return "text-sky-400";
    default: return "text-emerald-400";
  }
}

export function severityBg(severity: string | null | undefined): string {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return "bg-red-500/10 border-red-500/30 text-red-400";
    case "HIGH": return "bg-orange-500/10 border-orange-500/30 text-orange-400";
    case "ERROR": return "bg-rose-500/10 border-rose-500/30 text-rose-400";
    case "WARNING":
    case "MEDIUM": return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    case "LOW": return "bg-blue-400/10 border-blue-400/30 text-blue-400";
    case "INFO": return "bg-sky-400/10 border-sky-400/30 text-sky-400";
    default: return "bg-emerald-400/10 border-emerald-400/30 text-emerald-400";
  }
}

export function statusBadge(status: string | null | undefined): { label: string; color: string } {
  if (status === "THREAT_DETECTED") return { label: "Threat", color: "bg-red-500" };
  if (status === "NORMAL") return { label: "Normal", color: "bg-emerald-500" };
  return { label: status || "Unknown", color: "bg-gray-500" };
}

export function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatPercent(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${(val * 100).toFixed(2)}%`;
}

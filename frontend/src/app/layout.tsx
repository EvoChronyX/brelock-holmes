import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  Zap,
  FlaskConical,
  BarChart3,
  BookOpen,
  Sliders,
  Terminal,
  Sparkles,
  Layers,
  Cpu,
} from "lucide-react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Brelock Holmes — Quantum Digital Signature Security & Threat Investigation Platform",
  description:
    "Smart India Hackathon 2026 (SIH26141) — Statistical threat detection & quantum-inspired security platform for Quantum Digital Signatures",
};

const NAV_ITEMS = [
  { href: "/", label: "Executive Dashboard", icon: Activity, badge: "Live" },
  { href: "/attack-lab", label: "Quantum Attack Lab", icon: Zap, badge: "Sim" },
  { href: "/innovations", label: "5 Novelties & Innovations", icon: Sparkles, badge: "Novelty", highlight: true },
  { href: "/experiments", label: "Experiment Registry", icon: FlaskConical },
  { href: "/security-events", label: "Security Incident Logs", icon: ShieldAlert },
  { href: "/analytics", label: "Statistical Analytics", icon: BarChart3 },
  { href: "/baseline", label: "Baseline & Calibration", icon: Sliders },
  { href: "/protocol", label: "QDS Protocol & Circuits", icon: Terminal },
  { href: "/docs", label: "Technical Documentation", icon: BookOpen },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 flex min-h-screen font-sans`}
      >
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-200 bg-white p-5 flex flex-col justify-between shrink-0 shadow-sm z-20">
          <div>
            {/* Brand Header */}
            <div className="mb-6 pb-4 border-b border-slate-100">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                  Ψ
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-extrabold text-base tracking-tight text-slate-900">
                      BRELOCK HOLMES
                    </h1>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 tracking-wide">
                    QUANTUM THREAT FORENSICS
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono">
                    SIH26 • Problem Statement 5
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation links */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 px-3 mb-2">
                Core Operations
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        item.highlight
                          ? "bg-indigo-50/90 text-indigo-900 border border-indigo-200 hover:bg-indigo-100/80 shadow-xs"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${item.highlight ? "text-indigo-600" : "text-slate-600"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.highlight
                              ? "bg-indigo-600 text-white shadow-xs"
                              : item.badge === "Live"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Footer Status */}
          <div className="border-t border-slate-100 pt-4 mt-6">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  Qiskit 2.5 Simulator
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                <span>Model: Bhattacharyya Zero-ML</span>
                <span className="text-indigo-600 font-bold">3σ Threshold</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 mt-2 px-1 text-center font-medium">
              Egreen Quanta LLP • Quantum-Inspired
            </div>
          </div>
        </aside>

        {/* Main Content Shell */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Global Bar */}
          <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                QDS Teleportation Channel v1.0
              </span>
              <span className="text-slate-600 text-xs hidden md:inline">|</span>
              <span className="text-xs font-medium text-slate-600 hidden md:inline">
                State: <code className="text-indigo-600 font-mono font-bold">Ry(π/3)|0⟩</code> (P₀=0.75, P₁=0.25)
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Detection: <strong className="text-slate-900">Deterministic Statistical</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>System Calibrated</span>
              </div>
            </div>
          </header>

          {/* Main Page Content */}
          <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

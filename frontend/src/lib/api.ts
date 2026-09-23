import {
  Experiment,
  ExperimentListItem,
  SecurityEvent,
  AnalyticsSummary,
  BaselineResponse,
  ProtocolInfo,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

// GET /api/health
export const getHealth = () => fetchAPI<{ status: string }>("/api/health");

// POST /api/experiments — create & run experiment
export interface CreateExperimentParams {
  name?: string;
  protocol?: string;
  shots?: number;
  noise_type?: string;
  noise_level?: number;
  attack_type?: string;
  attack_params?: Record<string, number>;
  message?: string;
  input_state?: string;
}
export const createExperiment = (params: CreateExperimentParams) =>
  fetchAPI<Experiment>("/api/experiments", {
    method: "POST",
    body: JSON.stringify(params),
  });

// GET /api/experiments
export const listExperiments = (params?: { limit?: number; offset?: number; attack_type?: string }) => {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  if (params?.attack_type) query.set("attack_type", params.attack_type);
  const qs = query.toString();
  return fetchAPI<ExperimentListItem[]>(`/api/experiments${qs ? `?${qs}` : ""}`);
};

// GET /api/experiments/:id
export const getExperiment = (id: string) => fetchAPI<Experiment>(`/api/experiments/${id}`);

// POST /api/attacks/simulate
export interface AttackSimulateParams {
  attack_type: string;
  shots?: number;
  noise_type?: string;
  noise_level?: number;
  attack_params?: Record<string, number>;
}
export const simulateAttack = (params: AttackSimulateParams) =>
  fetchAPI<Experiment>("/api/attacks/simulate", {
    method: "POST",
    body: JSON.stringify(params),
  });

// GET /api/security-events
export const listSecurityEvents = (params?: { limit?: number; offset?: number; severity?: string; event_type?: string }) => {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  if (params?.severity) query.set("severity", params.severity);
  if (params?.event_type) query.set("event_type", params.event_type);
  const qs = query.toString();
  return fetchAPI<SecurityEvent[]>(`/api/security-events${qs ? `?${qs}` : ""}`);
};

// GET /api/analytics/summary
export const getAnalyticsSummary = () => fetchAPI<AnalyticsSummary>("/api/analytics/summary");

// POST /api/baseline/calibrate
export interface BaselineCalibRequest {
  shots?: number;
  noise_levels?: number[];
  num_runs?: number;
}
export const calibrateBaseline = (params: BaselineCalibRequest) =>
  fetchAPI<BaselineResponse>("/api/baseline/calibrate", {
    method: "POST",
    body: JSON.stringify(params),
  });

// GET /api/baseline
export const getBaseline = () => fetchAPI<BaselineResponse>("/api/baseline");

// GET /api/protocols
export const listProtocols = () => fetchAPI<ProtocolInfo[]>("/api/protocols");

// GET /api/protocols/:id
export const getProtocol = (id: string) => fetchAPI<ProtocolInfo>(`/api/protocols/${id}`);

// --- 5 Novelty & Innovation Endpoints ---

import {
  TensorVerifyResult,
  StateTomographyResult,
  DecouplingResult,
  ArbiterDisputeResult,
  QLedgerBlock,
  QLedgerVerifyResult,
} from "./types";

// 1. Quantum-Inspired Tensor Network Verification
export interface TensorVerifyParams {
  theta?: number;
  pert_theta?: number;
  noise_depol?: number;
  bond_dim_max?: number;
}
export const verifyTensorNetwork = (params: TensorVerifyParams) =>
  fetchAPI<TensorVerifyResult>("/api/innovations/tensor-verify", {
    method: "POST",
    body: JSON.stringify(params),
  });

// 2. Multi-Basis Quantum State Tomography
export interface StateTomographyParams {
  theta?: number;
  shots_per_basis?: number;
  noise_type?: string;
  noise_level?: number;
  phase_tamper_rad?: number;
}
export const runStateTomography = (params: StateTomographyParams) =>
  fetchAPI<StateTomographyResult>("/api/innovations/state-tomography", {
    method: "POST",
    body: JSON.stringify(params),
  });

// 3. Dynamic Adaptive Noise Decoupling
export interface DecouplingParams {
  sequence_type?: string;
  noise_level?: number;
  shots?: number;
}
export const runDynamicalDecoupling = (params: DecouplingParams) =>
  fetchAPI<DecouplingResult>("/api/innovations/dynamical-decoupling", {
    method: "POST",
    body: JSON.stringify(params),
  });

// 4. Tri-Party Non-Repudiation Arbiter Dispute
export interface ArbiterDisputeParams {
  scenario?: string;
  noise_level?: number;
  shots?: number;
}
export const resolveArbiterDispute = (params: ArbiterDisputeParams) =>
  fetchAPI<ArbiterDisputeResult>("/api/innovations/arbiter-dispute", {
    method: "POST",
    body: JSON.stringify(params),
  });

// 5. Quantum Forensic Audit Ledger
export const getQLedger = (limit: number = 25) =>
  fetchAPI<{ blocks: QLedgerBlock[] }>(`/api/innovations/q-ledger?limit=${limit}`);

export const verifyQLedger = () =>
  fetchAPI<QLedgerVerifyResult>("/api/innovations/q-ledger/verify", {
    method: "POST",
  });

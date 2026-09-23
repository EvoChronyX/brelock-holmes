export interface Experiment {
  id: string;
  name: string;
  created_at: string;
  timestamp?: string;
  updated_at: string | null;
  protocol: string;
  shots: number;
  noise_type: string;
  noise_level: number;
  attack_type: string;
  attack_params: Record<string, number> | null;
  status: string;
  execution_time_ms: number | null;
  circuit_qasm: string | null;
  measurement_counts: Record<string, number> | null;
  expected_distribution: Record<string, number> | null;
  observed_distribution: Record<string, number> | null;
  fidelity: number | null;
  error_rate: number | null;
  distribution_deviation: number | null;
  detection_status: string | null;
  detected_attack_type: string | null;
  severity: string | null;
  threshold_used: number | null;
  evidence: string[] | null;
  fingerprint: Record<string, unknown> | null;
  session_id: string | null;
  nonce: string | null;
  message: string | null;
}

export interface ExperimentListItem {
  id: string;
  name: string;
  created_at: string;
  shots?: number;
  noise_type?: string;
  attack_type: string;
  noise_level?: number;
  protocol?: string;
  status?: string;
  detection_status: string | null;
  severity: string | null;
  fidelity: number | null;
  execution_time_ms: number | null;
}

export interface SecurityEvent {
  id: string;
  experiment_id: string | null;
  event_type: string;
  severity: string;
  message: string;
  metadata_json: Record<string, unknown> | null;
  created_at?: string;
  timestamp?: string;
}

export interface AnalyticsSummary {
  total_experiments: number;
  threats_detected: number;
  normal_sessions?: number;
  normal_count?: number;
  attack_types?: Record<string, number>;
  attack_distribution?: Record<string, number>;
  severity_distribution: Record<string, number>;
  average_fidelity?: number | null;
  avg_fidelity?: number | null;
  avg_execution_time_ms?: number | null;
  detection_rate?: number;
  recent_experiments?: ExperimentListItem[];
}

export interface BaselineResponse {
  calibrated: boolean;
  noise_levels: number[];
  fidelity_mean: Record<string, number>;
  fidelity_std: Record<string, number>;
  deviation_mean: Record<string, number>;
  deviation_std: Record<string, number>;
  recommended_thresholds: Record<string, number>;
}

export interface ProtocolInfo {
  id: string;
  name: string;
  description: string;
  stages: string[];
  num_qubits: number;
}

// --- 5 Novelty & Innovation Types ---

export interface TensorVerifyResult {
  fidelity: number;
  deviation_tvd: number;
  entanglement_entropy: number;
  purity: number;
  bond_dimension: number;
  computation_time_ms: number;
  is_valid: boolean;
  status: string;
  probabilities: Record<string, number>;
  singular_values: number[];
  tensor_node_count: number;
}

export interface StateTomographyResult {
  bloch_vector: { rx: number; ry: number; rz: number };
  density_matrix: { real: number; imag: number }[][];
  purity: number;
  von_neumann_entropy: number;
  fidelity_to_target: number;
  basis_counts: Record<string, Record<string, number>>;
  phase_offset_rad: number;
  is_pure_state: boolean;
  tampering_detected: boolean;
  tampering_evidence: string[];
}

export interface DecouplingResult {
  sequence_type: string;
  raw_fidelity: number;
  decoupled_fidelity: number;
  fidelity_improvement_pct: number;
  raw_counts: Record<string, number>;
  decoupled_counts: Record<string, number>;
  noise_level: number;
  shots: number;
  circuit_depth_increase: number;
  t2_protection_factor: number;
}

export interface ArbiterDisputeResult {
  dispute_id: string;
  scenario: string;
  arbiter_verdict: string;
  confidence_pct: number;
  ghz_parity_fidelity: number;
  stabilizer_expectation: number;
  alice_syndrome: number;
  bob_syndrome: number;
  charlie_syndrome: number;
  non_repudiation_guarantee: boolean;
  evidence: string[];
}

export interface QLedgerBlock {
  index: number;
  timestamp_ns: number;
  session_id: string;
  action: string;
  quantum_fingerprint: string;
  fidelity: number;
  deviation_tvd: number;
  threat_status: string;
  previous_hash: string;
  block_hash: string;
  metadata: Record<string, unknown>;
}

export interface QLedgerVerifyResult {
  chain_valid: boolean;
  total_blocks: number;
  verified_blocks: number;
  tamper_detected: boolean;
  invalid_block_indices: number[];
  verification_timestamp_ns: number;
}

export interface PeerReviewedCitation {
  source: string;
  title: string;
  relevance: string;
  url?: string;
}

export interface ECGAnalysis {
  id?: string;
  timestamp: string;
  patientId?: string;
  patientName?: string;
  patientAge?: number | string;
  patientSex?: 'Male' | 'Female' | 'Other' | 'Unknown';
  clinicalSymptoms?: string;
  tech_quality: string;
  heart_rate_bpm: number;
  heart_rate_category: string;
  rate_rhythm: string;
  axis_degrees: number;
  axis_quadrant: string;
  pr_interval_ms: number;
  qrs_duration_ms: number;
  qt_interval_ms: number;
  qtc_interval_ms: number;
  qtc_status: string;
  conduction_hypertrophy: string;
  ischemia_infarction: string;
  affected_leads?: string[];
  syndromes_and_mimics: string;
  primary_synthesis: string;
  layman_explanation?: string;
  urgency_level: 'Immediate Emergency (Cath Lab / Resuscitation)' | 'Urgent (Emergency Department Evaluation)' | 'Prompt (Cardiology Clinic within 24-48h)' | 'Routine / Normal';
  critical_alert: boolean;
  alert_reasons?: string[];
  recommended_actions?: string[];
  peer_reviewed_citations?: PeerReviewedCitation[];
  limitations?: string;
  analysis_mode: 'online_database' | 'offline_algorithmic' | 'hybrid';
  imageDataUrl?: string;
  caliperMeasurements?: CaliperMeasurement[];
}

export interface CaliperMeasurement {
  id: string;
  label: string;
  leadName?: string;
  deltaX_px: number;
  deltaY_px: number;
  time_ms: number;
  voltage_mv: number;
  calculatedBpm?: number;
  timestamp: string;
}

export interface PatientProfile {
  id: string;
  displayName: string;
  role: 'physician' | 'patient' | 'family';
  email?: string;
  hasBiometrics: boolean;
  pinCode?: string;
  biometricCredentialId?: string;
  createdAt: string;
}

export interface HIPAAAuditLog {
  id: string;
  action: 'CREATE_RECORD' | 'VIEW_RECORD' | 'EXPORT_REPORT' | 'DELETE_RECORD' | 'AUTH_LOGIN' | 'REDACT_PHI';
  recordId?: string;
  patientNameRedacted?: string;
  userId: string;
  timestamp: string;
  integrityHash: string;
  deviceInfo: string;
}

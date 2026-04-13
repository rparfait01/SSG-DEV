export type InstrumentType = 'orra' | 'orra-lite' | 'four-a' | 'plh' | 'smp'

export type HFPCondition = 'safety' | 'identity' | 'agency' | 'connection' | 'contribution'

export type HFPConditionStatus = 'absent' | 'threatened' | 'deficit' | 'functional' | 'strong'

export type LCRATier = 'fragile' | 'functional' | 'sustained'

export interface HFPConditionResult {
  condition: HFPCondition
  status: HFPConditionStatus
  finding: string
  evidence: string
}

export interface CorrectivePath {
  id: 'A' | 'B' | 'C'
  label: 'Stabilize' | 'Realign' | 'Rebuild'
  timeframe: string
  priority: 'immediate' | 'near-term' | 'strategic'
  headline: string
  rationale: string
  interventions: string[]
  deliverables: string[]
  pulseInterval: string
  reintakeInstrument: InstrumentType
  leadingIndicators: string[]
}

export interface CLRTReading {
  legitimacyStatus: 'eroding' | 'unstable' | 'neutral' | 'building' | 'strong'
  conditioningPattern: string
  cibPresent: boolean
  cibDescription?: string
}

export interface DiagnosticOutput {
  executiveSummary: string
  hfpResults: HFPConditionResult[]
  lcraReadinessTier: LCRATier
  lcraRationale: string
  clrtReading: CLRTReading
  primaryConditionGap: HFPCondition
  paths: CorrectivePath[]
  recommendedPath: 'A' | 'B' | 'C'
  recommendedPathRationale: string
}

export interface Submission {
  id: string
  instrument_type: InstrumentType
  client_label: string | null
  report_input: Record<string, unknown>
  diagnostic_output: DiagnosticOutput | null
  status: 'pending' | 'processing' | 'complete' | 'error'
  created_at: string
  updated_at: string
}

export const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  'orra': 'ORRA — Full Assessment',
  'orra-lite': 'ORRA-Lite — Rapid Snapshot',
  'four-a': '4A Phase Report',
  'plh': 'Personal Leadership Health',
  'smp': 'Summit Mentorship Program',
}

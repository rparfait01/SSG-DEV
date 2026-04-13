import type { Submission } from '@/types'
import { INSTRUMENT_LABELS } from '@/types'
import HFPConditionPanel from './HFPConditionPanel'
import PathCard from './PathCard'

const READINESS_STYLES = {
  fragile: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', label: 'Fragile' },
  functional: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Functional' },
  sustained: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', label: 'Sustained' },
}

const LEGITIMACY_STYLES: Record<string, string> = {
  eroding: 'text-red-700',
  unstable: 'text-orange-700',
  neutral: 'text-gray-700',
  building: 'text-blue-700',
  strong: 'text-green-700',
}

const LEGITIMACY_LABELS: Record<string, string> = {
  eroding: 'Eroding',
  unstable: 'Unstable',
  neutral: 'Neutral',
  building: 'Building',
  strong: 'Strong',
}

export default function DiagnosticReport({ submission }: { submission: Submission }) {
  const output = submission.diagnostic_output!
  const readiness = READINESS_STYLES[output.lcraReadinessTier]
  const isORRALite = submission.instrument_type === 'orra-lite'

  return (
    <div className="flex flex-col gap-10 print:gap-8">
      {/* 1. Header */}
      <div>
        <p className="text-xs font-semibold text-[#C9A84C] uppercase tracking-widest mb-1">
          Diagnostic Report
        </p>
        <h1 className="text-2xl font-bold text-[#1B3A5C]">
          {INSTRUMENT_LABELS[submission.instrument_type]}
        </h1>
        {submission.client_label && (
          <p className="mt-1 text-gray-500 text-sm">{submission.client_label}</p>
        )}
        <p className="mt-1 text-gray-400 text-xs">
          {new Date(submission.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* ORRA-Lite caveat */}
      {isORRALite && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          This report is based on a rapid assessment. Findings are directional. A full ORRA assessment is recommended for comprehensive diagnosis.
        </div>
      )}

      {/* 2. Executive Summary */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Executive Summary
        </p>
        <p className="text-lg text-gray-800 leading-relaxed">{output.executiveSummary}</p>
      </div>

      {/* 3. Readiness Overview */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Readiness Overview
        </p>
        <div className={`border rounded-xl px-6 py-4 ${readiness.bg}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xl font-bold ${readiness.text}`}>{readiness.label}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{output.lcraRationale}</p>
        </div>
      </div>

      {/* 4. HFP Condition Panel */}
      <HFPConditionPanel results={output.hfpResults} />

      {/* 5. Organizational Dynamics */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Organizational Dynamics
        </p>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Trust &amp; Institutional Health:</span>
            <span className={`text-sm font-semibold ${LEGITIMACY_STYLES[output.clrtReading.legitimacyStatus]}`}>
              {LEGITIMACY_LABELS[output.clrtReading.legitimacyStatus]}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{output.clrtReading.conditioningPattern}</p>
          {output.clrtReading.cibPresent && output.clrtReading.cibDescription && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">
                Adaptive Workaround Pattern Detected
              </p>
              <p className="text-sm text-orange-800 leading-relaxed">
                {output.clrtReading.cibDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 6. Corrective Paths */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Corrective Paths
        </p>
        <p className="text-sm text-gray-500 mb-4">{output.recommendedPathRationale}</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {output.paths.map(path => (
            <PathCard
              key={path.id}
              path={path}
              recommended={path.id === output.recommendedPath}
            />
          ))}
        </div>
      </div>

      {/* 7. Footer */}
      <div className="border-t border-gray-200 pt-6 text-sm text-gray-400 text-center">
        Summit Strategies Group &nbsp;|&nbsp; summitstrategiesgroup.com
      </div>
    </div>
  )
}

import type { Submission } from '@/types'
import { INSTRUMENT_LABELS } from '@/types'
import HFPConditionPanel from './HFPConditionPanel'
import PathCard from './PathCard'

const READINESS_STYLES = {
  fragile:    { badge: 'bg-red-100 text-red-800',    label: 'Fragile' },
  functional: { badge: 'bg-amber-100 text-amber-800', label: 'Functional' },
  sustained:  { badge: 'bg-green-100 text-green-800', label: 'Sustained' },
}

const LEGITIMACY_STYLES = {
  eroding:  { badge: 'bg-red-100 text-red-800',      label: 'Eroding' },
  unstable: { badge: 'bg-orange-100 text-orange-800', label: 'Unstable' },
  neutral:  { badge: 'bg-gray-100 text-gray-700',    label: 'Neutral' },
  building: { badge: 'bg-blue-100 text-blue-800',    label: 'Building' },
  strong:   { badge: 'bg-green-100 text-green-800',  label: 'Strong' },
}

export default function DiagnosticReport({ submission }: { submission: Submission }) {
  const output = submission.diagnostic_output!
  const readiness = READINESS_STYLES[output.lcraReadinessTier]
  const legitimacy = LEGITIMACY_STYLES[output.clrtReading.legitimacyStatus]
  const date = new Date(submission.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <article className="flex flex-col gap-10">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>{INSTRUMENT_LABELS[submission.instrument_type]}</span>
          {submission.client_label && (
            <>
              <span>&mdash;</span>
              <span className="font-medium text-ssg-navy">{submission.client_label}</span>
            </>
          )}
          <span>&mdash;</span>
          <span>{date}</span>
        </div>
        <h1 className="text-2xl font-bold text-ssg-navy">Diagnostic Report</h1>
      </header>

      {/* ORRA-Lite caveat */}
      {submission.instrument_type === 'orra-lite' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          This report is based on a rapid assessment. Findings are directional. A full ORRA assessment is recommended for comprehensive diagnosis.
        </div>
      )}

      {/* Executive Summary */}
      <section>
        <p className="text-xl text-ssg-navy leading-relaxed font-medium">{output.executiveSummary}</p>
      </section>

      {/* Readiness Overview */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col gap-3">
        <h2 className="text-ssg-navy font-semibold text-lg">Readiness Overview</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${readiness.badge}`}>
            {readiness.label}
          </span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{output.lcraRationale}</p>
      </section>

      {/* Condition Assessment */}
      <section>
        <HFPConditionPanel results={output.hfpResults} />
      </section>

      {/* Trust and Institutional Dynamics */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col gap-3">
        <h2 className="text-ssg-navy font-semibold text-lg">Trust and Institutional Dynamics</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Institutional trust:</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${legitimacy.badge}`}>
            {legitimacy.label}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{output.clrtReading.conditioningPattern}</p>
        {output.clrtReading.cibPresent && output.clrtReading.cibDescription && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">Workaround Patterns Detected</p>
            <p className="text-sm text-orange-900">{output.clrtReading.cibDescription}</p>
          </div>
        )}
      </section>

      {/* Corrective Paths */}
      <section>
        <h2 className="text-ssg-navy font-semibold text-lg mb-2">Corrective Paths</h2>
        <p className="text-sm text-gray-500 mb-4">{output.recommendedPathRationale}</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {output.paths.map((path) => (
            <PathCard
              key={path.id}
              path={path}
              isRecommended={path.id === output.recommendedPath}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
        Summit Strategies Group &mdash; summitstrategiesgroup.com
      </footer>
    </article>
  )
}

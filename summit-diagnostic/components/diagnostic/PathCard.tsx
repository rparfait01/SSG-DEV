import type { CorrectivePath } from '@/types'

const INSTRUMENT_LABELS: Record<string, string> = {
  'orra': 'ORRA — Full Assessment',
  'orra-lite': 'ORRA-Lite — Rapid Snapshot',
  'four-a': '4A Phase Report',
  'plh': 'Personal Leadership Health',
  'smp': 'Summit Mentorship Program',
}

export default function PathCard({
  path,
  isRecommended,
}: {
  path: CorrectivePath
  isRecommended: boolean
}) {
  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm flex flex-col gap-4 ${
        isRecommended
          ? 'border-2 border-ssg-gold'
          : 'border border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-ssg-navy font-bold text-base">
            Path {path.id} — {path.label}
          </span>
          <p className="text-sm text-gray-500 mt-0.5">{path.timeframe}</p>
        </div>
        {isRecommended && (
          <span className="shrink-0 text-xs font-semibold bg-ssg-gold text-white px-2 py-0.5 rounded-full">
            Recommended
          </span>
        )}
      </div>

      <p className="text-ssg-navy font-medium text-sm">{path.headline}</p>
      <p className="text-gray-600 text-sm leading-relaxed">{path.rationale}</p>

      <div>
        <p className="text-xs font-semibold text-ssg-navy uppercase tracking-wide mb-1">Interventions</p>
        <ul className="list-disc list-inside space-y-1">
          {path.interventions.map((item, i) => (
            <li key={i} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold text-ssg-navy uppercase tracking-wide mb-1">Deliverables</p>
        <ul className="list-disc list-inside space-y-1">
          {path.deliverables.map((item, i) => (
            <li key={i} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold text-ssg-navy uppercase tracking-wide mb-1">Leading Indicators</p>
        <ul className="list-disc list-inside space-y-1">
          {path.leadingIndicators.map((item, i) => (
            <li key={i} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-ssg-navy">Pulse interval:</span> {path.pulseInterval}
        </p>
        <p className="text-xs text-gray-500">
          <span className="font-medium text-ssg-navy">Re-intake instrument:</span>{' '}
          {INSTRUMENT_LABELS[path.reintakeInstrument] ?? path.reintakeInstrument}
        </p>
      </div>
    </div>
  )
}

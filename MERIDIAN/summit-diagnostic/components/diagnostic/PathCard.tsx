import type { CorrectivePath, InstrumentType } from '@/types'
import { INSTRUMENT_LABELS } from '@/types'

const PRIORITY_STYLES = {
  immediate: 'bg-red-50 text-red-700 border border-red-200',
  'near-term': 'bg-amber-50 text-amber-700 border border-amber-200',
  strategic: 'bg-blue-50 text-blue-700 border border-blue-200',
}

export default function PathCard({
  path,
  recommended,
}: {
  path: CorrectivePath
  recommended: boolean
}) {
  return (
    <div
      className={`bg-white rounded-xl p-6 flex flex-col gap-4 ${
        recommended
          ? 'border-2 border-[#C9A84C] shadow-md'
          : 'border border-gray-200 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#1B3A5C] bg-[#1B3A5C]/10 px-2 py-0.5 rounded">
              Path {path.id}
            </span>
            {recommended && (
              <span className="text-xs font-semibold text-[#C9A84C] border border-[#C9A84C] px-2 py-0.5 rounded">
                Recommended
              </span>
            )}
          </div>
          <h3 className="font-bold text-[#1B3A5C] text-base">{path.label}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{path.timeframe}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLES[path.priority]}`}>
          {path.priority}
        </span>
      </div>

      {/* Headline */}
      <p className="text-sm font-semibold text-gray-800">{path.headline}</p>

      {/* Rationale */}
      <p className="text-sm text-gray-600 leading-relaxed">{path.rationale}</p>

      {/* Interventions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Interventions</p>
        <ul className="flex flex-col gap-1">
          {path.interventions.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2">
              <span className="text-[#C9A84C] mt-0.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Deliverables */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Deliverables</p>
        <ul className="flex flex-col gap-1">
          {path.deliverables.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2">
              <span className="text-[#1B3A5C] mt-0.5 shrink-0">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Leading Indicators */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Leading Indicators</p>
        <ul className="flex flex-col gap-1">
          {path.leadingIndicators.map((item, i) => (
            <li key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="text-gray-400 mt-0.5 shrink-0">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pulse */}
      <div className="border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span className="font-semibold">Pulse check:</span> {path.pulseInterval}
        {' · '}
        <span className="font-semibold">Reintake:</span>{' '}
        {INSTRUMENT_LABELS[path.reintakeInstrument as InstrumentType]}
      </div>
    </div>
  )
}

import type { HFPConditionResult, HFPConditionStatus } from '@/types'

const STATUS_STYLES: Record<HFPConditionStatus, { badge: string; label: string }> = {
  absent: { badge: 'bg-red-100 text-red-800 border border-red-200', label: 'Absent' },
  threatened: { badge: 'bg-orange-100 text-orange-800 border border-orange-200', label: 'Threatened' },
  deficit: { badge: 'bg-amber-100 text-amber-800 border border-amber-200', label: 'Deficit' },
  functional: { badge: 'bg-blue-100 text-blue-700 border border-blue-200', label: 'Functional' },
  strong: { badge: 'bg-green-100 text-green-800 border border-green-200', label: 'Strong' },
}

const CONDITION_LABELS: Record<string, string> = {
  safety: 'Safety',
  identity: 'Identity',
  agency: 'Agency',
  connection: 'Connection',
  contribution: 'Contribution',
}

function ConditionCard({ result }: { result: HFPConditionResult }) {
  const style = STATUS_STYLES[result.status]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-[#1B3A5C] text-sm">
          {CONDITION_LABELS[result.condition]}
        </h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{result.finding}</p>
      <details className="group">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          Evidence
        </summary>
        <p className="mt-2 text-xs text-gray-500 leading-relaxed">{result.evidence}</p>
      </details>
    </div>
  )
}

export default function HFPConditionPanel({ results }: { results: HFPConditionResult[] }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#1B3A5C] mb-4">Condition Assessment</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(r => (
          <ConditionCard key={r.condition} result={r} />
        ))}
      </div>
    </div>
  )
}

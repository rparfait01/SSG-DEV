import type { HFPConditionResult, HFPConditionStatus } from '@/types'

const STATUS_STYLES: Record<HFPConditionStatus, { badge: string; label: string }> = {
  absent:     { badge: 'bg-red-100 text-red-800',    label: 'Absent' },
  threatened: { badge: 'bg-orange-100 text-orange-800', label: 'Threatened' },
  deficit:    { badge: 'bg-amber-100 text-amber-800', label: 'Deficit' },
  functional: { badge: 'bg-blue-100 text-blue-800',  label: 'Functional' },
  strong:     { badge: 'bg-green-100 text-green-800', label: 'Strong' },
}

function ConditionCard({ result }: { result: HFPConditionResult }) {
  const style = STATUS_STYLES[result.status]
  const conditionName = result.condition.charAt(0).toUpperCase() + result.condition.slice(1)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-ssg-navy text-sm">{conditionName}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{result.finding}</p>
      <details className="group">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          Evidence
        </summary>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">{result.evidence}</p>
      </details>
    </div>
  )
}

export default function HFPConditionPanel({ results }: { results: HFPConditionResult[] }) {
  return (
    <div>
      <h2 className="text-ssg-navy font-semibold text-lg mb-3">Condition Assessment</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((r) => (
          <ConditionCard key={r.condition} result={r} />
        ))}
      </div>
    </div>
  )
}

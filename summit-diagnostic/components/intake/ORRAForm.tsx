'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ORRAInput {
  clientLabel: string
  headcount: string
  scope: string
  primaryConcern: string
  safety: string
  identity: string
  agency: string
  connection: string
  contribution: string
  leadershipPercept: string
  workarounds: string
  awarenessFindings: string
  assessmentData: string
  keyGaps: string
  alignmentStatus: string
  currentActions: string
  constraintFactors: string
  hypothesis: string
  additionalContext: string
}

const defaultValues: ORRAInput = {
  clientLabel: '',
  headcount: '',
  scope: '',
  primaryConcern: '',
  safety: '',
  identity: '',
  agency: '',
  connection: '',
  contribution: '',
  leadershipPercept: '',
  workarounds: '',
  awarenessFindings: '',
  assessmentData: '',
  keyGaps: '',
  alignmentStatus: '',
  currentActions: '',
  constraintFactors: '',
  hypothesis: '',
  additionalContext: '',
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-ssg-navy">{label}</label>
      {children}
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  )
}

const inputClass =
  'border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ssg-navy focus:border-transparent'

export default function ORRAForm() {
  const router = useRouter()
  const [values, setValues] = useState<ORRAInput>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof ORRAInput, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { clientLabel, ...reportInput } = values
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrumentType: 'orra', clientLabel: clientLabel || undefined, reportInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      router.push(`/report/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-ssg-navy border-t-ssg-gold rounded-full animate-spin" />
        <p className="text-ssg-navy text-base font-medium">Analyzing your assessment…</p>
        <p className="text-gray-500 text-sm">This typically takes 15–25 seconds.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Organizational Context</h2>
        <Field label="Organization or team name (optional)">
          <input type="text" className={inputClass} value={values.clientLabel} onChange={(e) => set('clientLabel', e.target.value)} />
        </Field>
        <Field label="Headcount">
          <select className={inputClass} value={values.headcount} onChange={(e) => set('headcount', e.target.value)} required>
            <option value="">Select…</option>
            <option>&lt;10</option>
            <option>10–50</option>
            <option>50–200</option>
            <option>200–500</option>
            <option>500+</option>
          </select>
        </Field>
        <Field label="Scope">
          <select className={inputClass} value={values.scope} onChange={(e) => set('scope', e.target.value)} required>
            <option value="">Select…</option>
            <option>Full organization</option>
            <option>Department/unit</option>
            <option>Leadership team</option>
            <option>Project team</option>
          </select>
        </Field>
        <Field label="Primary concern" helper="What is the primary concern or reason for this assessment?">
          <textarea className={inputClass} rows={4} value={values.primaryConcern} onChange={(e) => set('primaryConcern', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Condition Snapshot</h2>
        {(['safety', 'identity', 'agency', 'connection', 'contribution'] as const).map((cond) => (
          <Field key={cond} label={cond.charAt(0).toUpperCase() + cond.slice(1)}>
            <textarea className={inputClass} rows={4} value={values[cond]} onChange={(e) => set(cond, e.target.value)} required />
          </Field>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Leadership and Structure</h2>
        <Field label="Leadership perception" helper="How is leadership perceived — as consistent, fair, and credible?">
          <textarea className={inputClass} rows={4} value={values.leadershipPercept} onChange={(e) => set('leadershipPercept', e.target.value)} required />
        </Field>
        <Field label="Workarounds" helper="Are there informal workarounds, shadow systems, or unspoken rules operating in this organization?">
          <textarea className={inputClass} rows={4} value={values.workarounds} onChange={(e) => set('workarounds', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Phase 1 — Awareness</h2>
        <Field label="Awareness findings" helper="What did the Awareness phase reveal about organizational self-perception and stated vs. actual conditions?">
          <textarea className={inputClass} rows={4} value={values.awarenessFindings} onChange={(e) => set('awarenessFindings', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Phase 2 — Assessment</h2>
        <Field label="Assessment data" helper="Summarize quantitative and qualitative findings from the Assessment phase.">
          <textarea className={inputClass} rows={4} value={values.assessmentData} onChange={(e) => set('assessmentData', e.target.value)} required />
        </Field>
        <Field label="Key gaps" helper="What are the most significant gaps identified in assessment data?">
          <textarea className={inputClass} rows={4} value={values.keyGaps} onChange={(e) => set('keyGaps', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Phase 3 — Alignment</h2>
        <Field label="Alignment status" helper="Describe leadership alignment to the assessment findings. Where is there agreement? Where is there resistance?">
          <textarea className={inputClass} rows={4} value={values.alignmentStatus} onChange={(e) => set('alignmentStatus', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Phase 4 — Action</h2>
        <Field label="Current actions" helper="What actions, if any, are currently in motion? Are they addressing root conditions or surface symptoms?">
          <textarea className={inputClass} rows={4} value={values.currentActions} onChange={(e) => set('currentActions', e.target.value)} required />
        </Field>
        <Field label="Constraint factors" helper="What resource, political, or cultural constraints are affecting action?">
          <textarea className={inputClass} rows={4} value={values.constraintFactors} onChange={(e) => set('constraintFactors', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Practitioner Observation</h2>
        <Field label="Primary hypothesis" helper="What is your primary diagnostic hypothesis coming in?">
          <textarea className={inputClass} rows={4} value={values.hypothesis} onChange={(e) => set('hypothesis', e.target.value)} required />
        </Field>
        <Field label="Additional context (optional)">
          <textarea className={inputClass} rows={4} value={values.additionalContext} onChange={(e) => set('additionalContext', e.target.value)} />
        </Field>
      </section>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">{error}</div>}

      <button type="submit" className="bg-ssg-navy text-white font-semibold px-6 py-3 rounded hover:bg-ssg-navy-dark transition-colors self-start">
        Run Diagnostic
      </button>
    </form>
  )
}

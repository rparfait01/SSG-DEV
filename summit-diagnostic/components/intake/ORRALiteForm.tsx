'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ORRALiteInput {
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
  hypothesis: string
  additionalContext: string
}

const defaultValues: ORRALiteInput = {
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
  hypothesis: '',
  additionalContext: '',
}

function Field({
  label,
  helper,
  children,
}: {
  label: string
  helper?: string
  children: React.ReactNode
}) {
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

export default function ORRALiteForm() {
  const router = useRouter()
  const [values, setValues] = useState<ORRALiteInput>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof ORRALiteInput, value: string) {
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
        body: JSON.stringify({
          instrumentType: 'orra-lite',
          clientLabel: clientLabel || undefined,
          reportInput,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

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
        <p className="text-gray-500 text-sm">Running locally — this takes 2–4 minutes. Please keep this tab open.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Section 1 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">
          Section 1 — Organizational Context
        </h2>
        <Field label="Organization or team name (optional)">
          <input
            type="text"
            className={inputClass}
            value={values.clientLabel}
            onChange={(e) => set('clientLabel', e.target.value)}
            placeholder="e.g. Acme Corp — Operations Division"
          />
        </Field>
        <Field label="Headcount">
          <select className={inputClass} value={values.headcount} onChange={(e) => set('headcount', e.target.value)} required>
            <option value="">Select…</option>
            <option value="<10">&lt;10</option>
            <option value="10-50">10–50</option>
            <option value="50-200">50–200</option>
            <option value="200-500">200–500</option>
            <option value="500+">500+</option>
          </select>
        </Field>
        <Field label="Scope">
          <select className={inputClass} value={values.scope} onChange={(e) => set('scope', e.target.value)} required>
            <option value="">Select…</option>
            <option value="Full organization">Full organization</option>
            <option value="Department/unit">Department/unit</option>
            <option value="Leadership team">Leadership team</option>
            <option value="Project team">Project team</option>
          </select>
        </Field>
        <Field label="Primary concern" helper="What is the primary concern or reason for this assessment?">
          <textarea
            className={inputClass}
            rows={4}
            value={values.primaryConcern}
            onChange={(e) => set('primaryConcern', e.target.value)}
            required
          />
        </Field>
      </section>

      {/* Section 2 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">
          Section 2 — Condition Snapshot
        </h2>
        <Field label="Safety" helper="Describe the psychological safety climate — do people speak up, raise concerns, and flag problems without fear?">
          <textarea className={inputClass} rows={4} value={values.safety} onChange={(e) => set('safety', e.target.value)} required />
        </Field>
        <Field label="Identity" helper="How clearly do members understand their role and how it connects to the mission?">
          <textarea className={inputClass} rows={4} value={values.identity} onChange={(e) => set('identity', e.target.value)} required />
        </Field>
        <Field label="Agency" helper="Do people feel meaningful control over their work and day-to-day decisions?">
          <textarea className={inputClass} rows={4} value={values.agency} onChange={(e) => set('agency', e.target.value)} required />
        </Field>
        <Field label="Connection" helper="How would you characterize trust and relational quality across the team or organization?">
          <textarea className={inputClass} rows={4} value={values.connection} onChange={(e) => set('connection', e.target.value)} required />
        </Field>
        <Field label="Contribution" helper="Do people believe their effort creates visible, meaningful impact?">
          <textarea className={inputClass} rows={4} value={values.contribution} onChange={(e) => set('contribution', e.target.value)} required />
        </Field>
      </section>

      {/* Section 3 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">
          Section 3 — Leadership and Structure
        </h2>
        <Field label="Leadership perception" helper="How is leadership perceived — as consistent, fair, and credible?">
          <textarea className={inputClass} rows={4} value={values.leadershipPercept} onChange={(e) => set('leadershipPercept', e.target.value)} required />
        </Field>
        <Field label="Workarounds" helper="Are there informal workarounds, shadow systems, or unspoken rules operating in this organization?">
          <textarea className={inputClass} rows={4} value={values.workarounds} onChange={(e) => set('workarounds', e.target.value)} required />
        </Field>
      </section>

      {/* Section 4 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">
          Section 4 — Practitioner Observation
        </h2>
        <Field label="Primary hypothesis" helper="What is your primary diagnostic hypothesis coming in?">
          <textarea className={inputClass} rows={4} value={values.hypothesis} onChange={(e) => set('hypothesis', e.target.value)} required />
        </Field>
        <Field label="Additional context (optional)" helper="Any additional context the diagnostic engine should factor in?">
          <textarea className={inputClass} rows={4} value={values.additionalContext} onChange={(e) => set('additionalContext', e.target.value)} />
        </Field>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="bg-ssg-navy text-white font-semibold px-6 py-3 rounded hover:bg-ssg-navy-dark transition-colors self-start"
      >
        Run Diagnostic
      </button>
    </form>
  )
}

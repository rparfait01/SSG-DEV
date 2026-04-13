'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  // Section 1
  clientLabel: string
  headcount: string
  scope: string
  primaryConcern: string
  // Section 2
  safety: string
  identity: string
  agency: string
  connection: string
  contribution: string
  // Section 3
  leadershipPercept: string
  workarounds: string
  // Section 4
  hypothesis: string
  additionalContext: string
}

const INITIAL: FormData = {
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
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {helper && <p className="text-xs text-gray-400">{helper}</p>}
    </div>
  )
}

const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent'
const textareaClass =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent resize-y min-h-[96px]'
const selectClass =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent'

export default function ORRALiteForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrumentType: 'orra-lite',
          clientLabel: form.clientLabel || null,
          reportInput: form,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Request failed')
      }

      const { id } = await res.json()
      router.push(`/report/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Analyzing your assessment…</p>
        <p className="text-gray-400 text-xs">This typically takes 10–20 seconds.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Section 1 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">
          Section 1 — Organizational Context
        </h2>

        <Field label="Organization or team name" helper="Optional">
          <input
            type="text"
            className={inputClass}
            value={form.clientLabel}
            onChange={set('clientLabel')}
            placeholder="e.g. Acme Corp — Regional Leadership Team"
          />
        </Field>

        <Field label="Headcount">
          <select className={selectClass} value={form.headcount} onChange={set('headcount')} required>
            <option value="">Select headcount range</option>
            <option value="<10">&lt;10</option>
            <option value="10-50">10–50</option>
            <option value="50-200">50–200</option>
            <option value="200-500">200–500</option>
            <option value="500+">500+</option>
          </select>
        </Field>

        <Field label="Scope">
          <select className={selectClass} value={form.scope} onChange={set('scope')} required>
            <option value="">Select scope</option>
            <option value="Full organization">Full organization</option>
            <option value="Department/unit">Department / unit</option>
            <option value="Leadership team">Leadership team</option>
            <option value="Project team">Project team</option>
          </select>
        </Field>

        <Field
          label="Primary concern"
          helper="What is the primary concern or reason for this assessment?"
        >
          <textarea
            className={textareaClass}
            value={form.primaryConcern}
            onChange={set('primaryConcern')}
            required
          />
        </Field>
      </section>

      {/* Section 2 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">
          Section 2 — Condition Snapshot
        </h2>

        <Field
          label="Safety"
          helper="Describe the psychological safety climate — do people speak up, raise concerns, and flag problems without fear?"
        >
          <textarea className={textareaClass} value={form.safety} onChange={set('safety')} required />
        </Field>

        <Field
          label="Identity"
          helper="How clearly do members understand their role and how it connects to the mission?"
        >
          <textarea className={textareaClass} value={form.identity} onChange={set('identity')} required />
        </Field>

        <Field
          label="Agency"
          helper="Do people feel meaningful control over their work and day-to-day decisions?"
        >
          <textarea className={textareaClass} value={form.agency} onChange={set('agency')} required />
        </Field>

        <Field
          label="Connection"
          helper="How would you characterize trust and relational quality across the team or organization?"
        >
          <textarea className={textareaClass} value={form.connection} onChange={set('connection')} required />
        </Field>

        <Field
          label="Contribution"
          helper="Do people believe their effort creates visible, meaningful impact?"
        >
          <textarea
            className={textareaClass}
            value={form.contribution}
            onChange={set('contribution')}
            required
          />
        </Field>
      </section>

      {/* Section 3 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">
          Section 3 — Leadership and Structure
        </h2>

        <Field
          label="Leadership perception"
          helper="How is leadership perceived — as consistent, fair, and credible?"
        >
          <textarea
            className={textareaClass}
            value={form.leadershipPercept}
            onChange={set('leadershipPercept')}
            required
          />
        </Field>

        <Field
          label="Workarounds"
          helper="Are there informal workarounds, shadow systems, or unspoken rules operating in this organization?"
        >
          <textarea
            className={textareaClass}
            value={form.workarounds}
            onChange={set('workarounds')}
            required
          />
        </Field>
      </section>

      {/* Section 4 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">
          Section 4 — Practitioner Observation
        </h2>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <strong>Note:</strong> ORRA-Lite findings are directional, not definitive. A full ORRA assessment is recommended for comprehensive diagnosis.
        </div>

        <Field
          label="Primary diagnostic hypothesis"
          helper="What is your primary diagnostic hypothesis coming in?"
        >
          <textarea
            className={textareaClass}
            value={form.hypothesis}
            onChange={set('hypothesis')}
            required
          />
        </Field>

        <Field
          label="Additional context"
          helper="Any additional context the diagnostic engine should factor in? (optional)"
        >
          <textarea
            className={textareaClass}
            value={form.additionalContext}
            onChange={set('additionalContext')}
          />
        </Field>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-[#1B3A5C] text-white font-semibold py-3 rounded-lg hover:bg-[#122840] transition-colors text-sm"
      >
        Run Diagnostic
      </button>
    </form>
  )
}

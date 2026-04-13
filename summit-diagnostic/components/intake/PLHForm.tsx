'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PLHInput {
  clientLabel: string
  role: string
  orgContext: string
  assessmentTrigger: string
  roleClarity: string
  purposeAlignment: string
  roleConflict: string
  decisionControl: string
  constraintPattern: string
  adaptationStyle: string
  impactVisibility: string
  recognitionPattern: string
  futilitySignals: string
  psychSafety: string
  trustConditions: string
  primaryConcern: string
  additionalContext: string
}

const defaultValues: PLHInput = {
  clientLabel: '',
  role: '',
  orgContext: '',
  assessmentTrigger: '',
  roleClarity: '',
  purposeAlignment: '',
  roleConflict: '',
  decisionControl: '',
  constraintPattern: '',
  adaptationStyle: '',
  impactVisibility: '',
  recognitionPattern: '',
  futilitySignals: '',
  psychSafety: '',
  trustConditions: '',
  primaryConcern: '',
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

export default function PLHForm() {
  const router = useRouter()
  const [values, setValues] = useState<PLHInput>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof PLHInput, value: string) {
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
        body: JSON.stringify({ instrumentType: 'plh', clientLabel: clientLabel || undefined, reportInput }),
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
        <p className="text-gray-500 text-sm">Analyzing your report — this typically takes 15–30 seconds.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 1 — Leader Context</h2>
        <Field label="Leader name or identifier (optional)">
          <input type="text" className={inputClass} value={values.clientLabel} onChange={(e) => set('clientLabel', e.target.value)} />
        </Field>
        <Field label="Current role/title">
          <input type="text" className={inputClass} value={values.role} onChange={(e) => set('role', e.target.value)} required />
        </Field>
        <Field label="Organizational context" helper="Brief description of the organizational environment this leader operates in.">
          <textarea className={inputClass} rows={4} value={values.orgContext} onChange={(e) => set('orgContext', e.target.value)} required />
        </Field>
        <Field label="Assessment trigger">
          <select className={inputClass} value={values.assessmentTrigger} onChange={(e) => set('assessmentTrigger', e.target.value)} required>
            <option value="">Select…</option>
            <option>Self-initiated</option>
            <option>Performance concern</option>
            <option>Role transition</option>
            <option>Leadership development program</option>
            <option>Other</option>
          </select>
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 2 — Identity and Purpose</h2>
        <Field label="Role clarity" helper="Does the leader have a clear sense of their role identity and how it aligns with their values?">
          <textarea className={inputClass} rows={4} value={values.roleClarity} onChange={(e) => set('roleClarity', e.target.value)} required />
        </Field>
        <Field label="Purpose alignment" helper="How connected does the leader feel to the mission and purpose of the organization?">
          <textarea className={inputClass} rows={4} value={values.purposeAlignment} onChange={(e) => set('purposeAlignment', e.target.value)} required />
        </Field>
        <Field label="Role conflict" helper="Are there tensions between who the leader is and what the role demands of them?">
          <textarea className={inputClass} rows={4} value={values.roleConflict} onChange={(e) => set('roleConflict', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 3 — Agency and Decision-Making</h2>
        <Field label="Decision control" helper="Does the leader feel meaningful control over key decisions in their domain?">
          <textarea className={inputClass} rows={4} value={values.decisionControl} onChange={(e) => set('decisionControl', e.target.value)} required />
        </Field>
        <Field label="Constraint patterns" helper="Where do they feel blocked, overridden, or undercut in their authority?">
          <textarea className={inputClass} rows={4} value={values.constraintPattern} onChange={(e) => set('constraintPattern', e.target.value)} required />
        </Field>
        <Field label="Adaptation style" helper="How does the leader typically respond when facing constraints — push back, adapt, withdraw, or work around?">
          <textarea className={inputClass} rows={4} value={values.adaptationStyle} onChange={(e) => set('adaptationStyle', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 4 — Contribution and Impact</h2>
        <Field label="Impact visibility" helper="Does the leader believe their effort produces visible, meaningful outcomes?">
          <textarea className={inputClass} rows={4} value={values.impactVisibility} onChange={(e) => set('impactVisibility', e.target.value)} required />
        </Field>
        <Field label="Recognition pattern" helper="How is their contribution recognized (or not) by the organization?">
          <textarea className={inputClass} rows={4} value={values.recognitionPattern} onChange={(e) => set('recognitionPattern', e.target.value)} required />
        </Field>
        <Field label="Futility signals" helper="Are there signs of disillusionment, going-through-the-motions, or disengagement?">
          <textarea className={inputClass} rows={4} value={values.futilitySignals} onChange={(e) => set('futilitySignals', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 5 — Relational and Safety</h2>
        <Field label="Psychological safety" helper="Does the leader feel safe to be honest — with peers, superiors, and direct reports?">
          <textarea className={inputClass} rows={4} value={values.psychSafety} onChange={(e) => set('psychSafety', e.target.value)} required />
        </Field>
        <Field label="Trust conditions" helper="Describe the quality of key working relationships in this leader's environment.">
          <textarea className={inputClass} rows={4} value={values.trustConditions} onChange={(e) => set('trustConditions', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 6 — Practitioner Notes</h2>
        <Field label="Primary concern" helper="What is the primary developmental or performance concern prompting this assessment?">
          <textarea className={inputClass} rows={4} value={values.primaryConcern} onChange={(e) => set('primaryConcern', e.target.value)} required />
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

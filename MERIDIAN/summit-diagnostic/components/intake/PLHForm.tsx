'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
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

const INITIAL: FormData = {
  clientLabel: '', role: '', orgContext: '', assessmentTrigger: '',
  roleClarity: '', purposeAlignment: '', roleConflict: '',
  decisionControl: '', constraintPattern: '', adaptationStyle: '',
  impactVisibility: '', recognitionPattern: '', futilitySignals: '',
  psychSafety: '', trustConditions: '',
  primaryConcern: '', additionalContext: '',
}

const inputClass = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent'
const textareaClass = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent resize-y min-h-[96px]'
const selectClass = 'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent'

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {helper && <p className="text-xs text-gray-400">{helper}</p>}
    </div>
  )
}

function SH({ title }: { title: string }) {
  return <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">{title}</h2>
}

export default function PLHForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrumentType: 'plh', clientLabel: form.clientLabel || null, reportInput: form }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Request failed') }
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
      <section className="flex flex-col gap-4">
        <SH title="Section 1 — Leader Context" />
        <Field label="Leader name or identifier" helper="Optional">
          <input type="text" className={inputClass} value={form.clientLabel} onChange={set('clientLabel')} />
        </Field>
        <Field label="Current role / title">
          <input type="text" className={inputClass} value={form.role} onChange={set('role')} required />
        </Field>
        <Field label="Organizational environment" helper="Brief description of the organizational environment this leader operates in">
          <textarea className={textareaClass} value={form.orgContext} onChange={set('orgContext')} required />
        </Field>
        <Field label="Assessment trigger">
          <select className={selectClass} value={form.assessmentTrigger} onChange={set('assessmentTrigger')} required>
            <option value="">Select trigger</option>
            <option>Self-initiated</option>
            <option>Performance concern</option>
            <option>Role transition</option>
            <option>Leadership development program</option>
            <option>Other</option>
          </select>
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 2 — Identity and Purpose" />
        <Field label="Role clarity" helper="Does the leader have a clear sense of their role identity and how it aligns with their values?">
          <textarea className={textareaClass} value={form.roleClarity} onChange={set('roleClarity')} required />
        </Field>
        <Field label="Purpose alignment" helper="How connected does the leader feel to the mission and purpose of the organization?">
          <textarea className={textareaClass} value={form.purposeAlignment} onChange={set('purposeAlignment')} required />
        </Field>
        <Field label="Role conflict" helper="Are there tensions between who the leader is and what the role demands of them?">
          <textarea className={textareaClass} value={form.roleConflict} onChange={set('roleConflict')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 3 — Agency and Decision-Making" />
        <Field label="Decision control" helper="Does the leader feel meaningful control over key decisions in their domain?">
          <textarea className={textareaClass} value={form.decisionControl} onChange={set('decisionControl')} required />
        </Field>
        <Field label="Constraint pattern" helper="Where do they feel blocked, overridden, or undercut in their authority?">
          <textarea className={textareaClass} value={form.constraintPattern} onChange={set('constraintPattern')} required />
        </Field>
        <Field label="Adaptation style" helper="How does the leader typically respond when facing constraints — push back, adapt, withdraw, or work around?">
          <textarea className={textareaClass} value={form.adaptationStyle} onChange={set('adaptationStyle')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 4 — Contribution and Impact" />
        <Field label="Impact visibility" helper="Does the leader believe their effort produces visible, meaningful outcomes?">
          <textarea className={textareaClass} value={form.impactVisibility} onChange={set('impactVisibility')} required />
        </Field>
        <Field label="Recognition pattern" helper="How is their contribution recognized (or not) by the organization?">
          <textarea className={textareaClass} value={form.recognitionPattern} onChange={set('recognitionPattern')} required />
        </Field>
        <Field label="Futility signals" helper="Are there signs of disillusionment, going-through-the-motions, or disengagement?">
          <textarea className={textareaClass} value={form.futilitySignals} onChange={set('futilitySignals')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 5 — Relational and Safety" />
        <Field label="Psychological safety" helper="Does the leader feel safe to be honest — with peers, superiors, and direct reports?">
          <textarea className={textareaClass} value={form.psychSafety} onChange={set('psychSafety')} required />
        </Field>
        <Field label="Trust conditions" helper="Describe the quality of key working relationships in this leader's environment.">
          <textarea className={textareaClass} value={form.trustConditions} onChange={set('trustConditions')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 6 — Practitioner Notes" />
        <Field label="Primary concern" helper="What is the primary developmental or performance concern prompting this assessment?">
          <textarea className={textareaClass} value={form.primaryConcern} onChange={set('primaryConcern')} required />
        </Field>
        <Field label="Additional context" helper="Any additional context? (optional)">
          <textarea className={textareaClass} value={form.additionalContext} onChange={set('additionalContext')} />
        </Field>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <button type="submit" className="w-full bg-[#1B3A5C] text-white font-semibold py-3 rounded-lg hover:bg-[#122840] transition-colors text-sm">
        Run Diagnostic
      </button>
    </form>
  )
}

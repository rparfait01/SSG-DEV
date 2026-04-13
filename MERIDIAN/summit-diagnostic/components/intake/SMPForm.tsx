'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  cycleNumber: string
  participantLabel: string
  mentorLabel: string
  programDuration: string
  relationalTrust: string
  engagementLevel: string
  connectionBarriers: string
  growthVisibility: string
  structuralSupport: string
  transferToWork: string
  purposeConnection: string
  completionRisk: string
  primaryConcern: string
  additionalContext: string
}

const INITIAL: FormData = {
  cycleNumber: '', participantLabel: '', mentorLabel: '', programDuration: '',
  relationalTrust: '', engagementLevel: '', connectionBarriers: '',
  growthVisibility: '', structuralSupport: '', transferToWork: '',
  purposeConnection: '', completionRisk: '',
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

export default function SMPForm() {
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
        body: JSON.stringify({ instrumentType: 'smp', clientLabel: form.participantLabel || null, reportInput: form }),
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
        <SH title="Section 1 — Program Context" />
        <Field label="Cycle number">
          <select className={selectClass} value={form.cycleNumber} onChange={set('cycleNumber')} required>
            <option value="">Select cycle</option>
            <option>Cycle 1</option><option>Cycle 2</option><option>Cycle 3</option><option>Cycle 4+</option>
          </select>
        </Field>
        <Field label="Participant name or identifier" helper="Optional">
          <input type="text" className={inputClass} value={form.participantLabel} onChange={set('participantLabel')} />
        </Field>
        <Field label="Mentor name or identifier" helper="Optional">
          <input type="text" className={inputClass} value={form.mentorLabel} onChange={set('mentorLabel')} />
        </Field>
        <Field label="Program duration">
          <select className={selectClass} value={form.programDuration} onChange={set('programDuration')} required>
            <option value="">Select duration</option>
            <option value="Ongoing (<3 months)">Ongoing (&lt;3 months)</option>
            <option value="Mid-cycle (3-6 months)">Mid-cycle (3–6 months)</option>
            <option value="Cycle complete (6+ months)">Cycle complete (6+ months)</option>
          </select>
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 2 — Relationship Quality" />
        <Field label="Relational trust" helper="How would you describe the quality of trust in the mentorship relationship?">
          <textarea className={textareaClass} value={form.relationalTrust} onChange={set('relationalTrust')} required />
        </Field>
        <Field label="Engagement level" helper="Is the participant actively engaged — showing up, applying learning, initiating?">
          <textarea className={textareaClass} value={form.engagementLevel} onChange={set('engagementLevel')} required />
        </Field>
        <Field label="Connection barriers" helper="Are there barriers to genuine connection in this relationship (availability, power dynamics, cultural distance)?">
          <textarea className={textareaClass} value={form.connectionBarriers} onChange={set('connectionBarriers')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 3 — Developmental Conditions" />
        <Field label="Growth visibility" helper="Can the participant see their own growth? Do they feel the mentorship is creating real development?">
          <textarea className={textareaClass} value={form.growthVisibility} onChange={set('growthVisibility')} required />
        </Field>
        <Field label="Structural support" helper="Does the organization structurally support this mentorship (time, resources, recognition) or is it individually heroic?">
          <textarea className={textareaClass} value={form.structuralSupport} onChange={set('structuralSupport')} required />
        </Field>
        <Field label="Transfer to work" helper="Are insights and skills from the mentorship visibly transferring into the participant's role performance?">
          <textarea className={textareaClass} value={form.transferToWork} onChange={set('transferToWork')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 4 — Contribution and Meaning" />
        <Field label="Purpose connection" helper="Does the participant feel the program connects to something meaningful — career trajectory, personal growth, mission contribution?">
          <textarea className={textareaClass} value={form.purposeConnection} onChange={set('purposeConnection')} required />
        </Field>
        <Field label="Completion risk">
          <select className={selectClass} value={form.completionRisk} onChange={set('completionRisk')} required>
            <option value="">Select risk level</option>
            <option value="Low — strong momentum">Low — strong momentum</option>
            <option value="Moderate — some flags">Moderate — some flags</option>
            <option value="High — disengagement risk">High — disengagement risk</option>
          </select>
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SH title="Section 5 — Practitioner Notes" />
        <Field label="Primary concern" helper="What is the primary developmental concern or reason for this assessment?">
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

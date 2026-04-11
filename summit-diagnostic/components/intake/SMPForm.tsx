'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SMPInput {
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

const defaultValues: SMPInput = {
  cycleNumber: '',
  participantLabel: '',
  mentorLabel: '',
  programDuration: '',
  relationalTrust: '',
  engagementLevel: '',
  connectionBarriers: '',
  growthVisibility: '',
  structuralSupport: '',
  transferToWork: '',
  purposeConnection: '',
  completionRisk: '',
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

export default function SMPForm() {
  const router = useRouter()
  const [values, setValues] = useState<SMPInput>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof SMPInput, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { participantLabel, mentorLabel, ...rest } = values
    const reportInput = {
      ...rest,
      participantLabel: participantLabel || undefined,
      mentorLabel: mentorLabel || undefined,
    }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrumentType: 'smp', reportInput }),
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
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 1 — Program Context</h2>
        <Field label="Cycle number">
          <select className={inputClass} value={values.cycleNumber} onChange={(e) => set('cycleNumber', e.target.value)} required>
            <option value="">Select…</option>
            <option>Cycle 1</option>
            <option>Cycle 2</option>
            <option>Cycle 3</option>
            <option>Cycle 4+</option>
          </select>
        </Field>
        <Field label="Participant name or identifier (optional)">
          <input type="text" className={inputClass} value={values.participantLabel} onChange={(e) => set('participantLabel', e.target.value)} />
        </Field>
        <Field label="Mentor name or identifier (optional)">
          <input type="text" className={inputClass} value={values.mentorLabel} onChange={(e) => set('mentorLabel', e.target.value)} />
        </Field>
        <Field label="Program duration">
          <select className={inputClass} value={values.programDuration} onChange={(e) => set('programDuration', e.target.value)} required>
            <option value="">Select…</option>
            <option value="Ongoing (<3 months)">Ongoing (&lt;3 months)</option>
            <option value="Mid-cycle (3-6 months)">Mid-cycle (3–6 months)</option>
            <option value="Cycle complete (6+ months)">Cycle complete (6+ months)</option>
          </select>
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 2 — Relationship Quality</h2>
        <Field label="Relational trust" helper="How would you describe the quality of trust in the mentorship relationship?">
          <textarea className={inputClass} rows={4} value={values.relationalTrust} onChange={(e) => set('relationalTrust', e.target.value)} required />
        </Field>
        <Field label="Engagement level" helper="Is the participant actively engaged — showing up, applying learning, initiating?">
          <textarea className={inputClass} rows={4} value={values.engagementLevel} onChange={(e) => set('engagementLevel', e.target.value)} required />
        </Field>
        <Field label="Connection barriers" helper="Are there barriers to genuine connection in this relationship (availability, power dynamics, cultural distance)?">
          <textarea className={inputClass} rows={4} value={values.connectionBarriers} onChange={(e) => set('connectionBarriers', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 3 — Developmental Conditions</h2>
        <Field label="Growth visibility" helper="Can the participant see their own growth? Do they feel the mentorship is creating real development?">
          <textarea className={inputClass} rows={4} value={values.growthVisibility} onChange={(e) => set('growthVisibility', e.target.value)} required />
        </Field>
        <Field label="Structural support" helper="Does the organization structurally support this mentorship (time, resources, recognition) or is it individually heroic?">
          <textarea className={inputClass} rows={4} value={values.structuralSupport} onChange={(e) => set('structuralSupport', e.target.value)} required />
        </Field>
        <Field label="Transfer to work" helper="Are insights and skills from the mentorship visibly transferring into the participant's role performance?">
          <textarea className={inputClass} rows={4} value={values.transferToWork} onChange={(e) => set('transferToWork', e.target.value)} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 4 — Contribution and Meaning</h2>
        <Field label="Purpose connection" helper="Does the participant feel the program connects to something meaningful — career trajectory, personal growth, mission contribution?">
          <textarea className={inputClass} rows={4} value={values.purposeConnection} onChange={(e) => set('purposeConnection', e.target.value)} required />
        </Field>
        <Field label="Completion risk">
          <select className={inputClass} value={values.completionRisk} onChange={(e) => set('completionRisk', e.target.value)} required>
            <option value="">Select…</option>
            <option value="Low — strong momentum">Low — strong momentum</option>
            <option value="Moderate — some flags">Moderate — some flags</option>
            <option value="High — disengagement risk">High — disengagement risk</option>
          </select>
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ssg-navy font-semibold text-base border-b border-gray-200 pb-2">Section 5 — Practitioner Notes</h2>
        <Field label="Primary concern" helper="What is the primary developmental concern or reason for this assessment?">
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

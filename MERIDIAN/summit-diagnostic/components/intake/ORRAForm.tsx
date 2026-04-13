'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
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

const INITIAL: FormData = {
  clientLabel: '', headcount: '', scope: '', primaryConcern: '',
  safety: '', identity: '', agency: '', connection: '', contribution: '',
  leadershipPercept: '', workarounds: '',
  awarenessFindings: '', assessmentData: '', keyGaps: '',
  alignmentStatus: '', currentActions: '', constraintFactors: '',
  hypothesis: '', additionalContext: '',
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

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">{title}</h2>
}

export default function ORRAForm() {
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
        body: JSON.stringify({ instrumentType: 'orra', clientLabel: form.clientLabel || null, reportInput: form }),
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
        <SectionHeader title="Section 1 — Organizational Context" />
        <Field label="Organization or team name" helper="Optional">
          <input type="text" className={inputClass} value={form.clientLabel} onChange={set('clientLabel')} />
        </Field>
        <Field label="Headcount">
          <select className={selectClass} value={form.headcount} onChange={set('headcount')} required>
            <option value="">Select headcount range</option>
            <option>&lt;10</option><option>10-50</option><option>50-200</option><option>200-500</option><option>500+</option>
          </select>
        </Field>
        <Field label="Scope">
          <select className={selectClass} value={form.scope} onChange={set('scope')} required>
            <option value="">Select scope</option>
            <option>Full organization</option><option>Department/unit</option><option>Leadership team</option><option>Project team</option>
          </select>
        </Field>
        <Field label="Primary concern" helper="What is the primary concern or reason for this assessment?">
          <textarea className={textareaClass} value={form.primaryConcern} onChange={set('primaryConcern')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Section 2 — Condition Snapshot" />
        {([
          ['safety', 'Safety', 'Describe the psychological safety climate — do people speak up, raise concerns, and flag problems without fear?'],
          ['identity', 'Identity', 'How clearly do members understand their role and how it connects to the mission?'],
          ['agency', 'Agency', 'Do people feel meaningful control over their work and day-to-day decisions?'],
          ['connection', 'Connection', 'How would you characterize trust and relational quality across the team or organization?'],
          ['contribution', 'Contribution', 'Do people believe their effort creates visible, meaningful impact?'],
        ] as [keyof FormData, string, string][]).map(([key, label, helper]) => (
          <Field key={key} label={label} helper={helper}>
            <textarea className={textareaClass} value={form[key]} onChange={set(key)} required />
          </Field>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Section 3 — Leadership and Structure" />
        <Field label="Leadership perception" helper="How is leadership perceived — as consistent, fair, and credible?">
          <textarea className={textareaClass} value={form.leadershipPercept} onChange={set('leadershipPercept')} required />
        </Field>
        <Field label="Workarounds" helper="Are there informal workarounds, shadow systems, or unspoken rules operating in this organization?">
          <textarea className={textareaClass} value={form.workarounds} onChange={set('workarounds')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Phase 1 — Awareness" />
        <Field label="Awareness findings" helper="What did the Awareness phase reveal about organizational self-perception and stated vs. actual conditions?">
          <textarea className={textareaClass} value={form.awarenessFindings} onChange={set('awarenessFindings')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Phase 2 — Assessment" />
        <Field label="Assessment data" helper="Summarize quantitative and qualitative findings from the Assessment phase.">
          <textarea className={textareaClass} value={form.assessmentData} onChange={set('assessmentData')} required />
        </Field>
        <Field label="Key gaps" helper="What are the most significant gaps identified in assessment data?">
          <textarea className={textareaClass} value={form.keyGaps} onChange={set('keyGaps')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Phase 3 — Alignment" />
        <Field label="Alignment status" helper="Describe leadership alignment to the assessment findings. Where is there agreement? Where is there resistance?">
          <textarea className={textareaClass} value={form.alignmentStatus} onChange={set('alignmentStatus')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Phase 4 — Action" />
        <Field label="Current actions" helper="What actions, if any, are currently in motion? Are they addressing root conditions or surface symptoms?">
          <textarea className={textareaClass} value={form.currentActions} onChange={set('currentActions')} required />
        </Field>
        <Field label="Constraint factors" helper="What resource, political, or cultural constraints are affecting action?">
          <textarea className={textareaClass} value={form.constraintFactors} onChange={set('constraintFactors')} required />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Practitioner Observation" />
        <Field label="Primary diagnostic hypothesis" helper="What is your primary diagnostic hypothesis coming in?">
          <textarea className={textareaClass} value={form.hypothesis} onChange={set('hypothesis')} required />
        </Field>
        <Field label="Additional context" helper="Any additional context the diagnostic engine should factor in? (optional)">
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  phaseSelect: string
  phaseFindings: string
  dataQuality: string
  openIssues: string
  contextNotes: string
}

const INITIAL: FormData = {
  phaseSelect: '',
  phaseFindings: '',
  dataQuality: '',
  openIssues: '',
  contextNotes: '',
}

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

export default function FourAForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) =>
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
        body: JSON.stringify({ instrumentType: 'four-a', clientLabel: null, reportInput: form }),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field label="Phase">
        <select className={selectClass} value={form.phaseSelect} onChange={set('phaseSelect')} required>
          <option value="">Select phase</option>
          <option>Awareness</option>
          <option>Assessment</option>
          <option>Alignment</option>
          <option>Action</option>
        </select>
      </Field>

      <Field label="Phase findings" helper="Summarize the key findings from this phase.">
        <textarea className={textareaClass} value={form.phaseFindings} onChange={set('phaseFindings')} required />
      </Field>

      <Field label="Data quality">
        <select className={selectClass} value={form.dataQuality} onChange={set('dataQuality')} required>
          <option value="">Select data quality</option>
          <option value="Strong — multiple sources">Strong — multiple sources</option>
          <option value="Moderate — some gaps">Moderate — some gaps</option>
          <option value="Limited — directional only">Limited — directional only</option>
        </select>
      </Field>

      <Field label="Open issues" helper="What questions or concerns remain unresolved from this phase?">
        <textarea className={textareaClass} value={form.openIssues} onChange={set('openIssues')} required />
      </Field>

      <Field label="Context notes" helper="Organizational context relevant to interpreting this phase's findings.">
        <textarea className={textareaClass} value={form.contextNotes} onChange={set('contextNotes')} required />
      </Field>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <button type="submit" className="w-full bg-[#1B3A5C] text-white font-semibold py-3 rounded-lg hover:bg-[#122840] transition-colors text-sm">
        Run Diagnostic
      </button>
    </form>
  )
}

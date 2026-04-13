'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FourAInput {
  phaseSelect: string
  phaseFindings: string
  dataQuality: string
  openIssues: string
  contextNotes: string
}

const defaultValues: FourAInput = {
  phaseSelect: '',
  phaseFindings: '',
  dataQuality: '',
  openIssues: '',
  contextNotes: '',
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

export default function FourAForm() {
  const router = useRouter()
  const [values, setValues] = useState<FourAInput>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof FourAInput, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrumentType: 'four-a', reportInput: values }),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field label="Phase">
        <select className={inputClass} value={values.phaseSelect} onChange={(e) => set('phaseSelect', e.target.value)} required>
          <option value="">Select…</option>
          <option>Awareness</option>
          <option>Assessment</option>
          <option>Alignment</option>
          <option>Action</option>
        </select>
      </Field>
      <Field label="Phase findings" helper="Summarize the key findings from this phase.">
        <textarea className={inputClass} rows={5} value={values.phaseFindings} onChange={(e) => set('phaseFindings', e.target.value)} required />
      </Field>
      <Field label="Data quality">
        <select className={inputClass} value={values.dataQuality} onChange={(e) => set('dataQuality', e.target.value)} required>
          <option value="">Select…</option>
          <option value="Strong — multiple sources">Strong — multiple sources</option>
          <option value="Moderate — some gaps">Moderate — some gaps</option>
          <option value="Limited — directional only">Limited — directional only</option>
        </select>
      </Field>
      <Field label="Open issues" helper="What questions or concerns remain unresolved from this phase?">
        <textarea className={inputClass} rows={4} value={values.openIssues} onChange={(e) => set('openIssues', e.target.value)} required />
      </Field>
      <Field label="Context notes" helper="Organizational context relevant to interpreting this phase's findings.">
        <textarea className={inputClass} rows={4} value={values.contextNotes} onChange={(e) => set('contextNotes', e.target.value)} required />
      </Field>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">{error}</div>}

      <button type="submit" className="bg-ssg-navy text-white font-semibold px-6 py-3 rounded hover:bg-ssg-navy-dark transition-colors self-start">
        Run Diagnostic
      </button>
    </form>
  )
}

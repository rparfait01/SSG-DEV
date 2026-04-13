'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Scale fields use 1–5 integers. null = unanswered.
interface FormData {
  clientLabel: string
  headcount: string
  scope: string
  primaryConcern: string
  // Section 2 — Your Experience (1–5 scales + optional notes)
  safety: number | null
  safetyNote: string
  identity: number | null
  identityNote: string
  agency: number | null
  agencyNote: string
  connection: number | null
  connectionNote: string
  contribution: number | null
  contributionNote: string
  // Section 3 — Direction and Trust (1–5 scales)
  fairness: number | null
  consistency: number | null
  credibility: number | null
  // Section 4 — How work actually gets done (1–5 scale)
  processAdherence: number | null
}

const INITIAL: FormData = {
  clientLabel: '',
  headcount: '',
  scope: '',
  primaryConcern: '',
  safety: null,
  safetyNote: '',
  identity: null,
  identityNote: '',
  agency: null,
  agencyNote: '',
  connection: null,
  connectionNote: '',
  contribution: null,
  contributionNote: '',
  fairness: null,
  consistency: null,
  credibility: null,
  processAdherence: null,
}

const SCALE_FIELDS: {
  key: keyof FormData
  noteKey: keyof FormData
  label: string
  low: string
  high: string
}[] = [
  {
    key: 'safety',
    noteKey: 'safetyNote',
    label: 'Speaking up',
    low: "I hold back — it doesn't feel safe to say what I actually think",
    high: 'I speak freely — my honest input is welcomed here',
  },
  {
    key: 'identity',
    noteKey: 'identityNote',
    label: 'Role and purpose',
    low: "I'm not sure how my work connects to anything that matters",
    high: 'I know exactly why my role matters and I feel like I belong here',
  },
  {
    key: 'agency',
    noteKey: 'agencyNote',
    label: 'Control over work',
    low: "I follow instructions — I don't have real say in how things get done",
    high: 'I have genuine ownership over my work and decisions',
  },
  {
    key: 'connection',
    noteKey: 'connectionNote',
    label: 'Trust and belonging',
    low: 'I show up, do my job, and go home — real connection here is low',
    high: 'I trust the people I work with and feel like part of something',
  },
  {
    key: 'contribution',
    noteKey: 'contributionNote',
    label: 'Impact of effort',
    low: "I'm not sure my effort makes any difference",
    high: 'I can see the impact of my work clearly',
  },
]

const TRUST_FIELDS: {
  key: keyof FormData
  label: string
  low: string
  high: string
}[] = [
  {
    key: 'fairness',
    label: 'Fairness',
    low: 'Decisions feel arbitrary or inconsistent',
    high: 'Decisions here are fair and easy to understand',
  },
  {
    key: 'consistency',
    label: 'Consistency',
    low: 'I never know what to expect',
    high: "Things work the way they're supposed to here",
  },
  {
    key: 'credibility',
    label: 'Credibility',
    low: "I don't trust the direction we're being given",
    high: "I believe in where we're headed and who's leading it",
  },
]

const selectClass =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent'
const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent'
const textareaClass =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent resize-y min-h-[80px]'

function ScaleField({
  label,
  low,
  high,
  value,
  onChange,
  noteValue,
  onNoteChange,
}: {
  label: string
  low: string
  high: string
  value: number | null
  onChange: (v: number) => void
  noteValue?: string
  onNoteChange?: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-[#1B3A5C]">{label}</p>

      {/* Anchor labels */}
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
        <span className="leading-snug">
          <span className="font-bold text-gray-700">1 —</span> {low}
        </span>
        <span className="leading-snug text-right">
          <span className="font-bold text-gray-700">5 —</span> {high}
        </span>
      </div>

      {/* Radio scale */}
      <div className="flex justify-between gap-1 mt-1">
        {[1, 2, 3, 4, 5].map(n => (
          <label key={n} className="flex flex-col items-center gap-1.5 cursor-pointer flex-1">
            <input
              type="radio"
              name={label}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
              required={value === null}
            />
            <div
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors
                ${value === n
                  ? 'bg-[#1B3A5C] border-[#1B3A5C] text-white'
                  : 'border-gray-300 text-gray-400 hover:border-[#1B3A5C] hover:text-[#1B3A5C]'
                }`}
            >
              {n}
            </div>
          </label>
        ))}
      </div>

      {/* Optional free-text note */}
      {onNoteChange !== undefined && (
        <textarea
          className={textareaClass}
          value={noteValue ?? ''}
          onChange={e => onNoteChange(e.target.value)}
          placeholder="Anything the rating doesn't capture (optional)"
          rows={2}
        />
      )}
    </div>
  )
}

function isComplete(form: FormData): boolean {
  const scaleKeys: (keyof FormData)[] = [
    'safety', 'identity', 'agency', 'connection', 'contribution',
    'fairness', 'consistency', 'credibility', 'processAdherence',
  ]
  return (
    !!form.headcount &&
    !!form.scope &&
    !!form.primaryConcern.trim() &&
    scaleKeys.every(k => form[k] !== null)
  )
}

export default function ORRALiteForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setScale(key: keyof FormData) {
    return (v: number) => setForm(prev => ({ ...prev, [key]: v }))
  }

  function setNote(key: keyof FormData) {
    return (v: string) => setForm(prev => ({ ...prev, [key]: v }))
  }

  function setField(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isComplete(form)) {
      setError('Please complete all fields before submitting.')
      return
    }
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

      {/* Intro */}
      <div className="bg-[#1B3A5C]/5 border border-[#1B3A5C]/10 rounded-xl px-5 py-4 text-sm text-gray-700 leading-relaxed">
        This assessment is about your experience — not your performance, and not anyone else&apos;s.
        There are no right answers. The more honest you are, the more useful the output will be.
        Your responses are used to identify systemic patterns, not to evaluate individuals.
      </div>

      {/* Opening question */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[#1B3A5C]">
          What brought you here? Describe what&apos;s happening in your own words.
        </label>
        <textarea
          className={textareaClass}
          value={form.primaryConcern}
          onChange={setField('primaryConcern')}
          required
          rows={4}
          placeholder="No need to frame it — just describe what you're experiencing or observing."
        />
      </div>

      {/* Context */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">
          Context
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Organization or team name</label>
          <input
            type="text"
            className={inputClass}
            value={form.clientLabel}
            onChange={setField('clientLabel')}
            placeholder="Optional"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Headcount</label>
          <select className={selectClass} value={form.headcount} onChange={setField('headcount')} required>
            <option value="">Select headcount range</option>
            <option value="<10">&lt;10</option>
            <option value="10-50">10–50</option>
            <option value="50-200">50–200</option>
            <option value="200-500">200–500</option>
            <option value="500+">500+</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Scope</label>
          <select className={selectClass} value={form.scope} onChange={setField('scope')} required>
            <option value="">Select scope</option>
            <option value="Full organization">Full organization</option>
            <option value="Department/unit">Department / unit</option>
            <option value="Leadership team">Leadership team</option>
            <option value="Project team">Project team</option>
          </select>
        </div>
      </section>

      {/* Your Experience */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">
            Your Experience
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            For each item, select the number that best reflects where things stand for you right now.
          </p>
        </div>

        {SCALE_FIELDS.map(f => (
          <ScaleField
            key={f.key as string}
            label={f.label}
            low={f.low}
            high={f.high}
            value={form[f.key] as number | null}
            onChange={setScale(f.key)}
            noteValue={form[f.noteKey] as string}
            onNoteChange={setNote(f.noteKey)}
          />
        ))}
      </section>

      {/* Direction and Trust */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">
            Direction and Trust
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            How things feel to you from where you sit — regardless of your role.
          </p>
        </div>

        {TRUST_FIELDS.map(f => (
          <ScaleField
            key={f.key as string}
            label={f.label}
            low={f.low}
            high={f.high}
            value={form[f.key] as number | null}
            onChange={setScale(f.key)}
          />
        ))}
      </section>

      {/* How work actually gets done */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#1B3A5C] border-b border-gray-200 pb-2">
          How work actually gets done
        </h2>

        <ScaleField
          label="Process vs. reality"
          low="We follow the process — it works as designed"
          high="The official process doesn't work — we've all built our own ways around it"
          value={form.processAdherence}
          onChange={setScale('processAdherence')}
        />
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

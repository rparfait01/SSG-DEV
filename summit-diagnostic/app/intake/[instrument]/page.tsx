import { notFound } from 'next/navigation'
import Link from 'next/link'
import { INSTRUMENT_LABELS } from '@/types'
import type { InstrumentType } from '@/types'
import ORRAForm from '@/components/intake/ORRAForm'
import ORRALiteForm from '@/components/intake/ORRALiteForm'
import FourAForm from '@/components/intake/FourAForm'
import PLHForm from '@/components/intake/PLHForm'
import SMPForm from '@/components/intake/SMPForm'

const INSTRUMENT_DESCRIPTIONS: Record<InstrumentType, string> = {
  'orra': 'Full organizational scan across all four phases — readiness, trust, leadership, and structural health.',
  'orra-lite': 'Rapid directional snapshot. Findings are calibrated to the available data.',
  'four-a': 'Single-phase input from an active 4A assessment cycle.',
  'plh': 'Individual leader health — identity, purpose, and decision-making patterns.',
  'smp': 'Mentorship program review — relationship quality and developmental conditions.',
}

const VALID_INSTRUMENTS: InstrumentType[] = ['orra', 'orra-lite', 'four-a', 'plh', 'smp']

function FormForInstrument({ instrument }: { instrument: InstrumentType }) {
  switch (instrument) {
    case 'orra': return <ORRAForm />
    case 'orra-lite': return <ORRALiteForm />
    case 'four-a': return <FourAForm />
    case 'plh': return <PLHForm />
    case 'smp': return <SMPForm />
  }
}

export default async function IntakePage({
  params,
}: {
  params: Promise<{ instrument: string }>
}) {
  const { instrument } = await params

  if (!VALID_INSTRUMENTS.includes(instrument as InstrumentType)) {
    notFound()
  }

  const instrumentType = instrument as InstrumentType

  return (
    <div className="min-h-screen bg-ssg-cream">
      <header className="bg-ssg-navy text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-wide hover:text-ssg-gold transition-colors">
            Summit Strategies Group
          </Link>
          <span className="text-ssg-gold text-sm font-medium">Diagnostic Engine</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm text-ssg-navy hover:text-ssg-gold transition-colors">
            ← Back to instruments
          </Link>
          <h1 className="text-2xl font-bold text-ssg-navy mt-3 mb-1">
            {INSTRUMENT_LABELS[instrumentType]}
          </h1>
          <p className="text-gray-600 text-sm">{INSTRUMENT_DESCRIPTIONS[instrumentType]}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <FormForInstrument instrument={instrumentType} />
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-500">
        Summit Strategies Group &mdash; summitstrategiesgroup.com
      </footer>
    </div>
  )
}

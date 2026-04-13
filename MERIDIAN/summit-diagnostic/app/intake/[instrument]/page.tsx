import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { InstrumentType } from '@/types'
import { INSTRUMENT_LABELS } from '@/types'
import ORRALiteForm from '@/components/intake/ORRALiteForm'
import ORRAForm from '@/components/intake/ORRAForm'
import FourAForm from '@/components/intake/FourAForm'
import PLHForm from '@/components/intake/PLHForm'
import SMPForm from '@/components/intake/SMPForm'

const VALID_INSTRUMENTS: InstrumentType[] = ['orra', 'orra-lite', 'four-a', 'plh', 'smp']

const DESCRIPTIONS: Record<InstrumentType, string> = {
  'orra': 'Full organizational scan across all four 4A phases.',
  'orra-lite': 'Rapid directional snapshot — complete in under 15 minutes.',
  'four-a': 'Single-phase input from an active 4A assessment cycle.',
  'plh': 'Individual leader health assessment.',
  'smp': 'Mentorship program review and developmental conditions.',
}

function getForm(instrument: InstrumentType) {
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

  const type = instrument as InstrumentType

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[#1B3A5C] text-white">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link href="/" className="text-[#C9A84C] text-sm hover:underline">
            ← Back to instruments
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{INSTRUMENT_LABELS[type]}</h1>
          <p className="mt-1 text-blue-100 text-sm">{DESCRIPTIONS[type]}</p>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {getForm(type)}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-gray-400 text-center">
          Summit Strategies Group &nbsp;|&nbsp; summitstrategiesgroup.com
        </div>
      </footer>
    </div>
  )
}

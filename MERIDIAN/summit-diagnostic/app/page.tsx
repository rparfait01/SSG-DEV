import Link from 'next/link'
import type { InstrumentType } from '@/types'

const INSTRUMENTS: { type: InstrumentType; name: string; description: string }[] = [
  {
    type: 'orra',
    name: 'ORRA — Full Assessment',
    description: 'Full organizational scan — readiness, trust, leadership, and structural health',
  },
  {
    type: 'orra-lite',
    name: 'ORRA-Lite — Rapid Snapshot',
    description: 'Rapid snapshot — directional findings in under 15 minutes',
  },
  {
    type: 'four-a',
    name: '4A Phase Report',
    description: 'Single-phase report from an active 4A assessment cycle',
  },
  {
    type: 'plh',
    name: 'Personal Leadership Health',
    description: 'Individual leader health — identity, purpose, and decision-making patterns',
  },
  {
    type: 'smp',
    name: 'Summit Mentorship Program',
    description: 'Mentorship program review — relationship quality and developmental conditions',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[#1B3A5C] text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-[#C9A84C] text-sm font-semibold tracking-widest uppercase mb-1">
            Summit Strategies Group
          </p>
          <h1 className="text-3xl font-bold">Summit Diagnostic</h1>
          <p className="mt-2 text-blue-100 text-base">
            Submit an assessment report and receive a structured corrective diagnostic.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <h2 className="text-lg font-semibold text-[#1B3A5C] mb-2">Select an instrument</h2>
        <p className="text-sm text-gray-500 mb-8">
          Choose the instrument type that matches your submitted report. Each instrument produces a tailored diagnostic.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INSTRUMENTS.map(({ type, name, description }) => (
            <div
              key={type}
              className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-semibold text-[#1B3A5C] text-base leading-snug">{name}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
              <div className="mt-auto">
                <Link
                  href={`/intake/${type}`}
                  className="inline-block w-full text-center bg-[#1B3A5C] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#122840] transition-colors"
                >
                  Begin Assessment
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-gray-400 text-center">
          Summit Strategies Group &nbsp;|&nbsp; summitstrategiesgroup.com
        </div>
      </footer>
    </div>
  )
}

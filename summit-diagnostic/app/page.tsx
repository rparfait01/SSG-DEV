import Link from 'next/link'
import type { InstrumentType } from '@/types'

const instruments: { type: InstrumentType; name: string; description: string }[] = [
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ssg-cream">
      <header className="bg-ssg-navy text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold tracking-wide">Summit Strategies Group</span>
          <span className="text-ssg-gold text-sm font-medium">Diagnostic Engine</span>
        </div>
      </header>

      <section className="bg-ssg-navy text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 leading-tight">Organizational Diagnostic</h1>
          <p className="text-lg text-ssg-gold-light max-w-xl mx-auto">
            Select an assessment instrument to begin. Submit your report data and receive a structured diagnostic with corrective paths.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-ssg-navy text-sm font-semibold uppercase tracking-widest mb-6">
          Select an Instrument
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instruments.map((instrument) => (
            <div
              key={instrument.type}
              className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-ssg-navy font-semibold text-base mb-2">{instrument.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{instrument.description}</p>
              </div>
              <Link
                href={`/intake/${instrument.type}`}
                className="mt-5 inline-block bg-ssg-navy text-white text-sm font-medium px-4 py-2 rounded hover:bg-ssg-navy-dark transition-colors text-center"
              >
                Begin Assessment
              </Link>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-500">
        Summit Strategies Group &mdash; summitstrategiesgroup.com
      </footer>
    </div>
  )
}

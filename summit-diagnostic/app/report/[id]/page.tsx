import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import DiagnosticReport from '@/components/diagnostic/DiagnosticReport'
import type { Submission } from '@/types'

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const submission = data as Submission

  if (submission.status === 'error') {
    return (
      <div className="min-h-screen bg-ssg-cream flex flex-col">
        <header className="bg-ssg-navy text-white px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="text-lg font-semibold tracking-wide hover:text-ssg-gold transition-colors">
              Summit Strategies Group
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <p className="text-ssg-navy font-semibold text-lg mb-2">Processing error</p>
            <p className="text-gray-600 text-sm mb-6">
              Something went wrong while processing this assessment. Please return home and try again.
            </p>
            <Link href="/" className="bg-ssg-navy text-white px-5 py-2 rounded text-sm font-medium hover:bg-ssg-navy-dark transition-colors">
              Run a new assessment
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (submission.status !== 'complete' || !submission.diagnostic_output) {
    return (
      <div className="min-h-screen bg-ssg-cream flex flex-col">
        <header className="bg-ssg-navy text-white px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="text-lg font-semibold tracking-wide hover:text-ssg-gold transition-colors">
              Summit Strategies Group
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <p className="text-gray-600 text-sm">This report is not yet available.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-ssg-navy hover:text-ssg-gold transition-colors">
              ← Back to home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ssg-cream print:bg-white">
      <header className="bg-ssg-navy text-white px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-wide hover:text-ssg-gold transition-colors">
            Summit Strategies Group
          </Link>
          <Link
            href="/"
            className="text-sm border border-ssg-gold text-ssg-gold px-3 py-1.5 rounded hover:bg-ssg-gold hover:text-ssg-navy transition-colors"
          >
            Run a new assessment
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <DiagnosticReport submission={submission} />
      </main>
    </div>
  )
}

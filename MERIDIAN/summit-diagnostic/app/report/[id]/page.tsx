import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db, initDb, parseSubmissionRow } from '@/lib/db'
import type { Submission } from '@/types'
import DiagnosticReport from '@/components/diagnostic/DiagnosticReport'

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await initDb()

  const { id } = await params

  const result = await db.execute({
    sql: `SELECT * FROM submissions WHERE id = ? LIMIT 1`,
    args: [id],
  })

  const row = result.rows[0]

  if (!row) {
    notFound()
  }

  const submission = parseSubmissionRow(row as Record<string, unknown>) as Submission

  if (submission.status === 'error') {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-[#1B3A5C] text-white">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <p className="text-[#C9A84C] text-sm font-semibold tracking-widest uppercase">
              Summit Strategies Group
            </p>
            <h1 className="mt-1 text-2xl font-bold">Summit Diagnostic</h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-6 py-20 gap-4">
          <p className="text-lg font-semibold text-gray-700">Processing failed</p>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Something went wrong while analyzing this assessment. Please submit again.
          </p>
          <Link
            href="/"
            className="mt-4 bg-[#1B3A5C] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#122840] transition-colors"
          >
            Run a new assessment
          </Link>
        </main>
      </div>
    )
  }

  if (submission.status !== 'complete' || !submission.diagnostic_output) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[#1B3A5C] text-white print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-[#C9A84C] text-sm font-semibold tracking-widest uppercase">
              Summit Strategies Group
            </p>
            <h1 className="mt-1 text-xl font-bold">Summit Diagnostic</h1>
          </div>
          <Link
            href="/"
            className="text-sm text-blue-100 hover:text-white transition-colors"
          >
            ← New assessment
          </Link>
        </div>
      </header>

      {/* Report */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <DiagnosticReport submission={submission} />
      </main>
    </div>
  )
}

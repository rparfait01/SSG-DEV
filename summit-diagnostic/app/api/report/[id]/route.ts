import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const row = db.prepare(`
    SELECT * FROM submissions WHERE id = ? AND status = 'complete'
  `).get(id) as Record<string, unknown> | undefined

  if (!row) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...row,
    report_input: JSON.parse(row.report_input as string),
    diagnostic_output: JSON.parse(row.diagnostic_output as string),
  })
}

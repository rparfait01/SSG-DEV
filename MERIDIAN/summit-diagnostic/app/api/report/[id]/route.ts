import { NextRequest, NextResponse } from 'next/server'
import { db, initDb, parseSubmissionRow } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb()

  const { id } = await params

  const result = await db.execute({
    sql: `SELECT * FROM submissions WHERE id = ? AND status = 'complete' LIMIT 1`,
    args: [id],
  })

  const row = result.rows[0]
  if (!row) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  return NextResponse.json(parseSubmissionRow(row as Record<string, unknown>))
}

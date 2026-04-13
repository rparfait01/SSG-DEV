import { createClient } from '@libsql/client'

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not set')
}
if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not set')
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Create submissions table if it doesn't exist
export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      instrument_type TEXT NOT NULL CHECK (
        instrument_type IN ('orra', 'orra-lite', 'four-a', 'plh', 'smp')
      ),
      client_label TEXT,
      report_input TEXT NOT NULL,
      diagnostic_output TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'complete', 'error')
      ),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
}

// Helper: parse a row's JSON text fields back to objects
export function parseSubmissionRow(row: Record<string, unknown>) {
  return {
    ...row,
    report_input: typeof row.report_input === 'string'
      ? JSON.parse(row.report_input)
      : row.report_input,
    diagnostic_output: row.diagnostic_output && typeof row.diagnostic_output === 'string'
      ? JSON.parse(row.diagnostic_output)
      : row.diagnostic_output ?? null,
  }
}

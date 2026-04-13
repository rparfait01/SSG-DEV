import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { v4 as uuidv4 } from 'uuid'
import { db, initDb } from '@/lib/db'
import { SYSTEM_PROMPT } from '@/lib/groq/prompts/system'
import { buildORRAPrompt } from '@/lib/groq/prompts/instruments/orra'
import { buildORRALitePrompt } from '@/lib/groq/prompts/instruments/orra-lite'
import { buildFourAPrompt } from '@/lib/groq/prompts/instruments/four-a'
import { buildPLHPrompt } from '@/lib/groq/prompts/instruments/plh'
import { buildSMPPrompt } from '@/lib/groq/prompts/instruments/smp'
import { parseResponse } from '@/lib/groq/parse-response'
import type { InstrumentType } from '@/types'

export const maxDuration = 60

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function buildUserPrompt(instrumentType: InstrumentType, input: Record<string, unknown>): string {
  switch (instrumentType) {
    case 'orra': return buildORRAPrompt(input)
    case 'orra-lite': return buildORRALitePrompt(input)
    case 'four-a': return buildFourAPrompt(input)
    case 'plh': return buildPLHPrompt(input)
    case 'smp': return buildSMPPrompt(input)
  }
}

export async function POST(request: NextRequest) {
  await initDb()

  const now = new Date().toISOString()
  let submissionId: string | null = null

  try {
    const body = await request.json()
    const { instrumentType, clientLabel, reportInput } = body

    if (!instrumentType || !reportInput) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    submissionId = uuidv4()

    // Create submission record
    await db.execute({
      sql: `INSERT INTO submissions (id, instrument_type, client_label, report_input, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'processing', ?, ?)`,
      args: [
        submissionId,
        instrumentType,
        clientLabel || null,
        JSON.stringify(reportInput),
        now,
        now,
      ],
    })

    // Run diagnostic via Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(instrumentType, reportInput) },
      ],
    })

    const rawText = completion.choices[0]?.message?.content ?? ''
    const diagnosticOutput = parseResponse(rawText)

    // Store result
    await db.execute({
      sql: `UPDATE submissions
            SET diagnostic_output = ?, status = 'complete', updated_at = ?
            WHERE id = ?`,
      args: [JSON.stringify(diagnosticOutput), new Date().toISOString(), submissionId],
    })

    return NextResponse.json({ id: submissionId })

  } catch (err) {
    console.error('Analyze error:', err)

    if (submissionId) {
      await db.execute({
        sql: `UPDATE submissions SET status = 'error', updated_at = ? WHERE id = ?`,
        args: [new Date().toISOString(), submissionId],
      })
    }

    return NextResponse.json(
      { error: 'Diagnostic processing failed. Please try again.' },
      { status: 500 }
    )
  }
}

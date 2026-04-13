import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import db from '@/lib/db'
import { SYSTEM_PROMPT } from '@/lib/anthropic/prompts/system'
import { buildORRAPrompt } from '@/lib/anthropic/prompts/instruments/orra'
import { buildORRALitePrompt } from '@/lib/anthropic/prompts/instruments/orra-lite'
import { buildFourAPrompt } from '@/lib/anthropic/prompts/instruments/four-a'
import { buildPLHPrompt } from '@/lib/anthropic/prompts/instruments/plh'
import { buildSMPPrompt } from '@/lib/anthropic/prompts/instruments/smp'
import { parseResponse } from '@/lib/anthropic/parse-response'
import type { InstrumentType } from '@/types'

export const maxDuration = 60

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function buildUserPrompt(instrumentType: InstrumentType, input: Record<string, unknown>): string {
  switch (instrumentType) {
    case 'orra':      return buildORRAPrompt(input)
    case 'orra-lite': return buildORRALitePrompt(input)
    case 'four-a':    return buildFourAPrompt(input)
    case 'plh':       return buildPLHPrompt(input)
    case 'smp':       return buildSMPPrompt(input)
  }
}

export async function POST(request: NextRequest) {
  let submissionId: string | null = null

  try {
    const body = await request.json()
    const { instrumentType, clientLabel, reportInput } = body

    if (!instrumentType || !reportInput) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create submission record
    submissionId = crypto.randomUUID()
    db.prepare(`
      INSERT INTO submissions (id, instrument_type, client_label, report_input, status)
      VALUES (?, ?, ?, ?, 'processing')
    `).run(submissionId, instrumentType, clientLabel ?? null, JSON.stringify(reportInput))

    // Run diagnostic via Groq
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(instrumentType, reportInput) },
      ],
    })

    const rawText = response.choices[0]?.message?.content ?? ''
    const diagnosticOutput = parseResponse(rawText)

    // Store result
    db.prepare(`
      UPDATE submissions
      SET diagnostic_output = ?, status = 'complete', updated_at = datetime('now')
      WHERE id = ?
    `).run(JSON.stringify(diagnosticOutput), submissionId)

    return NextResponse.json({ id: submissionId })

  } catch (err) {
    console.error('Analyze error:', err)

    if (submissionId) {
      db.prepare(`
        UPDATE submissions SET status = 'error', updated_at = datetime('now') WHERE id = ?
      `).run(submissionId)
    }

    return NextResponse.json(
      { error: 'Diagnostic processing failed. Please try again.' },
      { status: 500 }
    )
  }
}

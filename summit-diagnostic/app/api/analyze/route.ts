import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import db from '@/lib/db'
import { SYSTEM_PROMPT } from '@/lib/anthropic/prompts/system'
import { buildORRAPrompt } from '@/lib/anthropic/prompts/instruments/orra'
import { buildORRALitePrompt } from '@/lib/anthropic/prompts/instruments/orra-lite'
import { buildFourAPrompt } from '@/lib/anthropic/prompts/instruments/four-a'
import { buildPLHPrompt } from '@/lib/anthropic/prompts/instruments/plh'
import { buildSMPPrompt } from '@/lib/anthropic/prompts/instruments/smp'
import { parseResponse } from '@/lib/anthropic/parse-response'
import type { InstrumentType } from '@/types'

// Allow up to 5 minutes — local CPU inference is slow
export const maxDuration = 300

const ollamaClient = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
  apiKey: 'ollama', // required by the SDK but not validated by Ollama
})

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:latest'

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

    // Run diagnostic via Ollama
    const response = await ollamaClient.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(instrumentType, reportInput) },
      ],
      stream: false,
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

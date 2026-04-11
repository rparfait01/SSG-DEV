import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { SYSTEM_PROMPT } from '@/lib/anthropic/prompts/system'
import { buildORRAPrompt } from '@/lib/anthropic/prompts/instruments/orra'
import { buildORRALitePrompt } from '@/lib/anthropic/prompts/instruments/orra-lite'
import { buildFourAPrompt } from '@/lib/anthropic/prompts/instruments/four-a'
import { buildPLHPrompt } from '@/lib/anthropic/prompts/instruments/plh'
import { buildSMPPrompt } from '@/lib/anthropic/prompts/instruments/smp'
import { parseResponse } from '@/lib/anthropic/parse-response'
import type { InstrumentType } from '@/types'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
  const supabase = createServiceClient()

  let submissionId: string | null = null

  try {
    const body = await request.json()
    const { instrumentType, clientLabel, reportInput } = body

    if (!instrumentType || !reportInput) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create submission record
    const { data: submission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        instrument_type: instrumentType,
        client_label: clientLabel || null,
        report_input: reportInput,
        status: 'processing',
      })
      .select('id')
      .single()

    if (insertError || !submission) {
      throw new Error('Failed to create submission record')
    }

    submissionId = submission.id

    // Run diagnostic
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildUserPrompt(instrumentType, reportInput) }
      ]
    })

    const rawText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('')

    const diagnosticOutput = parseResponse(rawText)

    // Store result
    await supabase
      .from('submissions')
      .update({
        diagnostic_output: diagnosticOutput,
        status: 'complete',
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    return NextResponse.json({ id: submissionId })

  } catch (err) {
    console.error('Analyze error:', err)

    if (submissionId) {
      await supabase
        .from('submissions')
        .update({ status: 'error', updated_at: new Date().toISOString() })
        .eq('id', submissionId)
    }

    return NextResponse.json(
      { error: 'Diagnostic processing failed. Please try again.' },
      { status: 500 }
    )
  }
}

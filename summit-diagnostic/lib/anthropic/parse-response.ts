import type { DiagnosticOutput } from '@/types'

export function parseResponse(rawText: string): DiagnosticOutput {
  // Strip any accidental markdown fences
  const cleaned = rawText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()

  // Find the outermost JSON object
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in response')
  }

  const jsonString = cleaned.slice(start, end + 1)
  const parsed = JSON.parse(jsonString) as DiagnosticOutput

  // Validate required fields
  if (!parsed.executiveSummary) throw new Error('Missing executiveSummary')
  if (!Array.isArray(parsed.hfpResults) || parsed.hfpResults.length !== 5) {
    throw new Error('Invalid hfpResults — expected 5 conditions')
  }
  if (!Array.isArray(parsed.paths) || parsed.paths.length !== 3) {
    throw new Error('Invalid paths — expected exactly 3')
  }

  return parsed
}

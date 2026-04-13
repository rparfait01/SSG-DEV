export function buildORRALitePrompt(input: Record<string, unknown>): string {
  const s = (k: string) => (input[k] as string) || '—'

  const conditionTable = [
    ['Safety',       'safety'],
    ['Identity',     'identity'],
    ['Agency',       'agency'],
    ['Connection',   'connection'],
    ['Contribution', 'contribution'],
  ]
    .map(([label, key]) =>
      `  ${label.padEnd(14)} | Severity: ${s(key + 'Severity').padEnd(8)} | Frequency: ${s(key + 'Frequency').padEnd(10)} | Confidence: ${s(key + 'Confidence')}`
    )
    .join('\n')

  const fairness    = s('fairness')
  const consistency = s('leadershipConsistency')
  const credibility = s('credibility')

  const leadershipScores =
    fairness === '—' && consistency === '—' && credibility === '—'
      ? '  Not rated'
      : `  Perceived fairness: ${fairness}/5 | Consistency: ${consistency}/5 | Credibility: ${credibility}/5`

  const workaroundPattern = s('workaroundPattern')

  // Narrative fields only — strip anchor keys to keep narrative section clean
  const anchorKeys = new Set([
    'safetySeverity', 'safetyFrequency', 'safetyConfidence',
    'identitySeverity', 'identityFrequency', 'identityConfidence',
    'agencySeverity', 'agencyFrequency', 'agencyConfidence',
    'connectionSeverity', 'connectionFrequency', 'connectionConfidence',
    'contributionSeverity', 'contributionFrequency', 'contributionConfidence',
    'fairness', 'leadershipConsistency', 'credibility',
    'workaroundPattern',
  ])
  const narrativeInput = Object.fromEntries(
    Object.entries(input).filter(([k]) => !anchorKeys.has(k))
  )

  return `Instrument: ORRA-Lite — Rapid Organizational Snapshot

This is a rapid assessment with limited data points. Be appropriately calibrated — where evidence is thin, use "threatened" rather than "deficit" or "absent", and note the data limitation in the evidence field. Findings are directional, not definitive. Recommend a full ORRA as part of at least one corrective path.

## Structured Anchor Data (practitioner-rated)

### Condition Ratings
${conditionTable}

### Leadership Perception Scores
${leadershipScores}

### Workaround Pattern
  ${workaroundPattern}

Use the structured anchor data to calibrate confidence in your condition ratings. High-severity + chronic + high-confidence anchors warrant stronger language (deficit or absent). Low-confidence anchors warrant more conservative language (threatened). Where workaround pattern is "normalized", weight CIB indicators more heavily.

## Narrative Input
${JSON.stringify(narrativeInput, null, 2)}`
}

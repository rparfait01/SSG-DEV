export function buildORRALitePrompt(input: Record<string, unknown>): string {
  return `Instrument: ORRA-Lite — Rapid Organizational Snapshot

This is a rapid assessment with limited data points. Be appropriately calibrated — where evidence is thin, use "threatened" rather than "deficit" or "absent", and note the data limitation in the evidence field. Findings are directional, not definitive. Recommend a full ORRA as part of at least one corrective path.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}

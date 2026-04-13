export function buildORRAPrompt(input: Record<string, unknown>): string {
  return `Instrument: ORRA — Full Organizational Readiness and Resilience Assessment

This is a full organizational scan with data across all four 4A phases (Awareness, Assessment, Alignment, Action). Analyze all five HFP conditions with full confidence where evidence supports it. Identify the LCRA readiness tier and produce three corrective paths scaled to organizational-level intervention.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}

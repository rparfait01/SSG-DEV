export function buildPLHPrompt(input: Record<string, unknown>): string {
  return `Instrument: PLH — Personal Leadership Health

This is an individual/leader-level assessment. Focus HFP analysis on Identity, Agency, and Contribution as the primary conditions. Connection and Safety are relevant where interpersonal or role-threat dynamics are present. Do NOT apply organizational restructuring language — interventions must be scaled to the individual and their sphere of influence. Note any CIB patterns visible in leadership behavior (e.g., avoidance, over-control, withdrawal) and identify the underlying HFP deficit driving them.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}

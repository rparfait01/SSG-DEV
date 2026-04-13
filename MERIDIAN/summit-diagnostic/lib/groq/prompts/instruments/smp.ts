export function buildSMPPrompt(input: Record<string, unknown>): string {
  return `Instrument: SMP — Summit Mentorship Program

This is a developmental/relational assessment from a mentorship cycle. Focus HFP analysis on Connection and Contribution primarily. Assess whether the mentorship relationship and conditions are structurally supported by the organization or are individually heroic (dependent on one person's effort with no systemic reinforcement). Corrective paths should address both the individual developmental trajectory and the structural conditions that support or undermine it.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}

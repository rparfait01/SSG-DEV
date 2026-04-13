export function buildORRALitePrompt(input: Record<string, unknown>): string {
  return `Instrument: ORRA-Lite — Rapid Organizational Snapshot

This is a rapid assessment with limited data points. Be appropriately calibrated — where evidence is thin, use "threatened" rather than "deficit" or "absent", and note the data limitation in the evidence field. Findings are directional, not definitive. Recommend a full ORRA as part of at least one corrective path.

Scale key (all numeric fields are 1–5 self-report scores from a single respondent):

  safety (Voice and safety)
    1 = I hold back — it doesn't feel safe to say what I actually think
    5 = I speak freely — my honest input is welcomed here

  identity (Role and meaning)
    1 = I'm not sure how my work connects to anything that matters
    5 = I know exactly why my role matters and I feel like I belong here

  agency (Ownership and control)
    1 = I follow instructions — I don't have real say in how things get done
    5 = I have genuine ownership over my work and decisions

  connection (Trust and belonging)
    1 = I show up, do my job, and go home — real connection here is low
    5 = I trust the people I work with and feel like part of something

  contribution (Impact and visibility)
    1 = I'm not sure my effort makes any difference
    5 = I can see the impact of my work clearly

  fairness (Direction and Trust — Fairness)
    1 = Decisions feel arbitrary or inconsistent
    5 = Decisions here are fair and easy to understand

  consistency (Direction and Trust — Consistency)
    1 = I never know what to expect
    5 = Things work the way they're supposed to here

  credibility (Direction and Trust — Credibility)
    1 = I don't trust the direction we're being given
    5 = I believe in where we're headed and who's leading it

  processAdherence (How work actually gets done)
    1 = We follow the process — it works as designed
    5 = The official process doesn't work — we've all built our own ways around it

Note: This is a single-respondent self-report from somewhere in the organization. Do not assume seniority or role. Interpret scores as one person's lived experience, not an organizational average. Treat scores of 1–2 as indicators of deficit/absence, 3 as partial/functional, 4–5 as functional/strong — adjusted by the primaryConcern narrative context.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}

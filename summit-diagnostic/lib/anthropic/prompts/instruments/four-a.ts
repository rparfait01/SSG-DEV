export function buildFourAPrompt(input: Record<string, unknown>): string {
  return `Instrument: 4A Phase Report — Single Phase Input

This report covers a single phase of the 4A methodology (Awareness, Assessment, Alignment, or Action). Analyze within the scope of the submitted phase. Clearly note which HFP conditions have insufficient data due to unassessed phases. Recommend a full ORRA assessment in at least one corrective path.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}

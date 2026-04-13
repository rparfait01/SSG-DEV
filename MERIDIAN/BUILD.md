# BUILD DOCUMENT — Summit Diagnostic
## Instructions for Claude Code

This document contains everything needed to build the Summit Diagnostic application from scratch. Read this entire document before writing any code. Follow the sequence in Section 13. Do not skip steps.

---

## 0. Project context

This application is built for **Summit Strategies Group (SSG)**, a veteran-owned organizational consulting firm. It accepts completed organizational and leadership assessment inputs, processes them through an AI diagnostic engine, and returns a structured corrective report. The theoretical framework powering the engine is proprietary — clients never see methodology names, only the output.

**There is no authentication.** This is a public intake tool. Anyone with the URL can submit an assessment and receive a diagnostic report. The report is accessed via a unique URL generated after submission.

**User flow:** Land on home → select instrument → fill form → submit → loading state → report page

---

## 1. Initialize the project

```bash
npx create-next-app@latest summit-diagnostic \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd summit-diagnostic
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install lucide-react clsx tailwind-merge
npm install uuid
npm install -D @types/uuid
```

---

## 2. Supabase schema

Create file `supabase/migrations/001_initial_schema.sql`:

```sql
-- Diagnostic submissions — no user association, fully public
create table submissions (
  id uuid primary key default gen_random_uuid(),
  instrument_type text not null check (
    instrument_type in ('orra', 'orra-lite', 'four-a', 'plh', 'smp')
  ),
  client_label text,                    -- optional: org or individual name, entered by submitter
  report_input jsonb not null,          -- structured form data submitted
  diagnostic_output jsonb,              -- full AI response stored after processing
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'complete', 'error')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast lookup by id (used on report page)
create index submissions_id_idx on submissions(id);
create index submissions_status_idx on submissions(status);

-- RLS: public read on complete submissions, public insert
alter table submissions enable row level security;

create policy "anyone can insert submissions"
  on submissions for insert
  with check (true);

create policy "anyone can read complete submissions"
  on submissions for select
  using (status = 'complete');

-- Service role bypasses RLS for server-side updates
```

---

## 3. Environment setup

Create `.env.example` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Supabase client setup

### `lib/supabase/client.ts`
Browser client for client components:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts`
Server client for API routes and server components:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
```

### `lib/supabase/service.ts`
Service role client for server-side writes that bypass RLS (status updates during AI processing):
```typescript
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

---

## 5. TypeScript types

### `types/index.ts`

```typescript
export type InstrumentType = 'orra' | 'orra-lite' | 'four-a' | 'plh' | 'smp'

export type HFPCondition = 'safety' | 'identity' | 'agency' | 'connection' | 'contribution'

export type HFPConditionStatus = 'absent' | 'threatened' | 'deficit' | 'functional' | 'strong'

export type LCRATier = 'fragile' | 'functional' | 'sustained'

export interface HFPConditionResult {
  condition: HFPCondition
  status: HFPConditionStatus
  finding: string           // 1-2 sentence plain-language finding
  evidence: string          // what in the report supports this
}

export interface CorrectivePath {
  id: 'A' | 'B' | 'C'
  label: 'Stabilize' | 'Realign' | 'Rebuild'
  timeframe: string
  priority: 'immediate' | 'near-term' | 'strategic'
  headline: string
  rationale: string
  interventions: string[]       // 3-5 specific actions
  deliverables: string[]        // tangible outputs
  pulseInterval: string
  reintakeInstrument: InstrumentType
  leadingIndicators: string[]   // 2-3 things to watch
}

export interface CLRTReading {
  legitimacyStatus: 'eroding' | 'unstable' | 'neutral' | 'building' | 'strong'
  conditioningPattern: string
  cibPresent: boolean
  cibDescription?: string
}

export interface DiagnosticOutput {
  executiveSummary: string
  hfpResults: HFPConditionResult[]
  lcraReadinessTier: LCRATier
  lcraRationale: string
  clrtReading: CLRTReading
  primaryConditionGap: HFPCondition
  paths: CorrectivePath[]           // always exactly 3
  recommendedPath: 'A' | 'B' | 'C'
  recommendedPathRationale: string
}

export interface Submission {
  id: string
  instrument_type: InstrumentType
  client_label: string | null
  report_input: Record<string, unknown>
  diagnostic_output: DiagnosticOutput | null
  status: 'pending' | 'processing' | 'complete' | 'error'
  created_at: string
  updated_at: string
}

export const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  'orra': 'ORRA — Full Assessment',
  'orra-lite': 'ORRA-Lite — Rapid Snapshot',
  'four-a': '4A Phase Report',
  'plh': 'Personal Leadership Health',
  'smp': 'Summit Mentorship Program',
}
```

---

## 6. AI engine — system prompt

### `lib/anthropic/prompts/system.ts`

This is the core intellectual property of the application. Implement exactly as written.

```typescript
export const SYSTEM_PROMPT = `You are the diagnostic engine for Summit Strategies Group (SSG), an organizational and leadership consulting firm. Your role is to analyze submitted assessment reports and produce structured diagnostic output grounded in SSG's theoretical framework.

## SSG Theoretical Framework

### Layer 1: Human Functioning Preconditions (HFP)
Five universal conditions required for human performance and engagement. A deficit, threat, or absence in any condition predicts dysfunction — regardless of individual capability.

- **Safety**: Freedom from threat — physical, psychological, social, and professional. Absence = hypervigilance, withdrawal, compliance without engagement.
- **Identity**: Coherent sense of role, purpose, and belonging within the organization. Threat = dissonance between self-concept and institutional role.
- **Agency**: Meaningful control over one's work, decisions, and outcomes. Deficit = learned helplessness, disengagement, or CIB (see below).
- **Connection**: Relational trust and belonging — to peers, leadership, and the mission. Absence = isolation, fragmentation, low cohesion.
- **Contribution**: Belief that one's effort matters and creates visible impact. Deficit = futility, disillusionment, performative compliance.

HFP status for each condition: absent | threatened | deficit | functional | strong

### Layer 2: Conditioning-Legitimacy Response Theory (CLRT)
The engine that determines whether HFP conditions stabilize or erode. Legitimacy (perceived fairness, consistency, and institutional integrity) drives whether people internalize institutional demands or develop resistance and workarounds.

**Core statement**: Legitimacy → stability of HFP conditions → Readiness (LCRA)

**Compensatory Institutional Behavior (CIB)**: When HFP conditions are threatened and institutional response is perceived as illegitimate, individuals and groups develop workarounds, shadow systems, and adaptive behaviors that compensate for unmet conditions. CIB is not misconduct — it is a rational response to structural failure. Treating CIB as a discipline problem without addressing the underlying HFP deficit accelerates dysfunction.

### Layer 3: Legitimacy-Conditioned Readiness Architecture (LCRA)
The performance output system. Readiness is a function of HFP condition stability modulated by CLRT dynamics.

Readiness tiers:
- **Fragile**: Multiple HFP deficits, low legitimacy, CIB present or emerging. Performance is surface-level and brittle. High attrition and disengagement risk.
- **Functional**: Partial HFP stability, moderate legitimacy. Performance is adequate but unsustainable without structural intervention. Some CIB present as coping.
- **Sustained**: HFP conditions stable, legitimacy established, minimal CIB. Performance is self-reinforcing. Capacity for growth and distributed leadership.

### Seed-Soil-Farmer Diagnostic Heuristic
Dysfunction originates in the soil (organizational conditions) or the farmer (leadership) and is routinely misattributed to the seed (the individual). Apply this when the report suggests individual-level blame for structural problems.

## Instruments you will analyze

- **ORRA (Organizational Readiness and Resilience Assessment)**: Full organizational scan across all 4A phases (Awareness, Assessment, Alignment, Action). Expect data across all five HFP conditions plus structural and leadership variables.
- **ORRA-Lite**: Rapid snapshot. Fewer data points — be appropriately calibrated in confidence. Flag where data is thin.
- **4A Phase Report**: Single-phase input. Analyze within phase context and note what is unknown from unassessed phases.
- **PLH (Personal Leadership Health)**: Individual/leader-level. Focus on Identity, Agency, and Contribution primarily. Note CIB patterns in leadership behavior. Do not apply org-level language to individual findings.
- **SMP (Summit Mentorship Program)**: Developmental/relational data. Analyze Connection and Contribution primarily. Assess whether mentorship conditions are structurally supported or individually heroic.

## Output format

You MUST return a single valid JSON object matching this exact structure. No markdown fences, no preamble, no explanation outside the JSON object. Start your response with { and end with }.

{
  "executiveSummary": "string — 2-3 sentences, plain language, suitable for a client. No jargon. Do not use the terms HFP, CLRT, LCRA, CIB, or Seed-Soil-Farmer.",
  "hfpResults": [
    {
      "condition": "safety",
      "status": "absent|threatened|deficit|functional|strong",
      "finding": "string — 1-2 sentences plain language",
      "evidence": "string — what in the submitted report supports this reading"
    },
    {
      "condition": "identity",
      "status": "absent|threatened|deficit|functional|strong",
      "finding": "string",
      "evidence": "string"
    },
    {
      "condition": "agency",
      "status": "absent|threatened|deficit|functional|strong",
      "finding": "string",
      "evidence": "string"
    },
    {
      "condition": "connection",
      "status": "absent|threatened|deficit|functional|strong",
      "finding": "string",
      "evidence": "string"
    },
    {
      "condition": "contribution",
      "status": "absent|threatened|deficit|functional|strong",
      "finding": "string",
      "evidence": "string"
    }
  ],
  "lcraReadinessTier": "fragile|functional|sustained",
  "lcraRationale": "string — 1-2 sentences explaining the tier assignment in plain language",
  "clrtReading": {
    "legitimacyStatus": "eroding|unstable|neutral|building|strong",
    "conditioningPattern": "string — brief description of the dominant dynamic",
    "cibPresent": true,
    "cibDescription": "string — describe the pattern, or null if cibPresent is false"
  },
  "primaryConditionGap": "safety|identity|agency|connection|contribution",
  "paths": [
    {
      "id": "A",
      "label": "Stabilize",
      "timeframe": "string — e.g. 0-30 days",
      "priority": "immediate",
      "headline": "string — one line summary",
      "rationale": "string — why this path given the findings",
      "interventions": ["string", "string", "string"],
      "deliverables": ["string", "string"],
      "pulseInterval": "string — e.g. 30-day ORRA-Lite reassessment",
      "reintakeInstrument": "orra|orra-lite|four-a|plh|smp",
      "leadingIndicators": ["string", "string", "string"]
    },
    {
      "id": "B",
      "label": "Realign",
      "timeframe": "string — e.g. 30-90 days",
      "priority": "near-term",
      "headline": "string",
      "rationale": "string",
      "interventions": ["string", "string", "string"],
      "deliverables": ["string", "string"],
      "pulseInterval": "string",
      "reintakeInstrument": "orra|orra-lite|four-a|plh|smp",
      "leadingIndicators": ["string", "string", "string"]
    },
    {
      "id": "C",
      "label": "Rebuild",
      "timeframe": "string — e.g. 90-180 days",
      "priority": "strategic",
      "headline": "string",
      "rationale": "string",
      "interventions": ["string", "string", "string"],
      "deliverables": ["string", "string"],
      "pulseInterval": "string",
      "reintakeInstrument": "orra|orra-lite|four-a|plh|smp",
      "leadingIndicators": ["string", "string", "string"]
    }
  ],
  "recommendedPath": "A|B|C",
  "recommendedPathRationale": "string — 1-2 sentences explaining the recommendation"
}

## Diagnostic principles

1. Never blame individuals when structural evidence is present. Apply Seed-Soil-Farmer framing.
2. CIB is always a symptom, never a cause. Name the underlying HFP deficit it compensates for.
3. Path A is always structural stabilization — stop active harm before attempting realignment.
4. Path C (Rebuild) requires honest assessment of organizational will. Do not recommend it as aspirational if conditions are fragile and capacity is low.
5. Pulse intervals must be specific and actionable, not vague.
6. The executive summary must stand alone as a client-facing paragraph. Write for a senior leader, not a researcher.
7. If the report input is thin or ambiguous, narrow your confidence — use "threatened" rather than "absent" when evidence is partial. Note this in the evidence field.
8. PLH and SMP are individual/developmental instruments. Scale language and interventions accordingly — do not apply organizational restructuring recommendations to individual-level findings.
`
```

---

## 7. Instrument prompt builders

### `lib/anthropic/prompts/instruments/orra.ts`
```typescript
export function buildORRAPrompt(input: Record<string, unknown>): string {
  return `Instrument: ORRA — Full Organizational Readiness and Resilience Assessment

This is a full organizational scan with data across all four 4A phases (Awareness, Assessment, Alignment, Action). Analyze all five HFP conditions with full confidence where evidence supports it. Identify the LCRA readiness tier and produce three corrective paths scaled to organizational-level intervention.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}
```

### `lib/anthropic/prompts/instruments/orra-lite.ts`
```typescript
export function buildORRALitePrompt(input: Record<string, unknown>): string {
  return `Instrument: ORRA-Lite — Rapid Organizational Snapshot

This is a rapid assessment with limited data points. Be appropriately calibrated — where evidence is thin, use "threatened" rather than "deficit" or "absent", and note the data limitation in the evidence field. Findings are directional, not definitive. Recommend a full ORRA as part of at least one corrective path.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}
```

### `lib/anthropic/prompts/instruments/four-a.ts`
```typescript
export function buildFourAPrompt(input: Record<string, unknown>): string {
  return `Instrument: 4A Phase Report — Single Phase Input

This report covers a single phase of the 4A methodology (Awareness, Assessment, Alignment, or Action). Analyze within the scope of the submitted phase. Clearly note which HFP conditions have insufficient data due to unassessed phases. Recommend a full ORRA assessment in at least one corrective path.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}
```

### `lib/anthropic/prompts/instruments/plh.ts`
```typescript
export function buildPLHPrompt(input: Record<string, unknown>): string {
  return `Instrument: PLH — Personal Leadership Health

This is an individual/leader-level assessment. Focus HFP analysis on Identity, Agency, and Contribution as the primary conditions. Connection and Safety are relevant where interpersonal or role-threat dynamics are present. Do NOT apply organizational restructuring language — interventions must be scaled to the individual and their sphere of influence. Note any CIB patterns visible in leadership behavior (e.g., avoidance, over-control, withdrawal) and identify the underlying HFP deficit driving them.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}
```

### `lib/anthropic/prompts/instruments/smp.ts`
```typescript
export function buildSMPPrompt(input: Record<string, unknown>): string {
  return `Instrument: SMP — Summit Mentorship Program

This is a developmental/relational assessment from a mentorship cycle. Focus HFP analysis on Connection and Contribution primarily. Assess whether the mentorship relationship and conditions are structurally supported by the organization or are individually heroic (dependent on one person's effort with no systemic reinforcement). Corrective paths should address both the individual developmental trajectory and the structural conditions that support or undermine it.

Submitted report data:
${JSON.stringify(input, null, 2)}`
}
```

---

## 8. Response parser

### `lib/anthropic/parse-response.ts`
```typescript
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
```

---

## 9. API routes

### `app/api/analyze/route.ts`

```typescript
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

    // Mark as error if we have an id
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
```

### `app/api/report/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'complete')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
```

---

## 10. Pages

### `app/page.tsx` — Landing / Instrument selector
- Full-width hero section with SSG logo (text-based if no asset) and tagline
- Below hero: grid of 5 instrument cards — one per instrument type
- Each card shows: instrument name, 1-line description, "Begin Assessment" button
- Button navigates to `/intake/[instrument]`
- Descriptions (plain language, no jargon):
  - ORRA: "Full organizational scan — readiness, trust, leadership, and structural health"
  - ORRA-Lite: "Rapid snapshot — directional findings in under 15 minutes"
  - 4A Phase: "Single-phase report from an active 4A assessment cycle"
  - PLH: "Individual leader health — identity, purpose, and decision-making patterns"
  - SMP: "Mentorship program review — relationship quality and developmental conditions"

### `app/intake/[instrument]/page.tsx` — Dynamic intake form
- Read `params.instrument` — validate it's a known InstrumentType, 404 if not
- Render instrument-specific form component
- Form header: instrument name + brief description
- Submit button: "Run Diagnostic"
- On submit: POST to `/api/analyze` with `{ instrumentType, clientLabel, reportInput }`
- Show loading state during API call: centered spinner + "Analyzing report…" message
- On success: redirect to `/report/[id]`
- On error: show inline error message, allow retry

### `app/report/[id]/page.tsx` — Diagnostic output
- Server component — fetch submission by id from Supabase directly (no API hop needed)
- If not found or not complete: show appropriate message
- Render `<DiagnosticReport />` with the full diagnostic output
- Include "Run a new assessment" link back to home
- Print-friendly: no sidebar, clean layout, SSG footer

---

## 11. Instrument intake forms — field specifications

All forms are client components. Use controlled inputs. All textareas minimum 4 rows. Use consistent field wrapper: label above, input below, optional helper text in muted style below input.

### ORRA-Lite form — `components/intake/ORRALiteForm.tsx`

```
Section 1 — Organizational context
  clientLabel       text input      "Organization or team name (optional)"
  headcount         select          <10 | 10-50 | 50-200 | 200-500 | 500+
  scope             select          Full organization | Department/unit | Leadership team | Project team
  primaryConcern    textarea        "What is the primary concern or reason for this assessment?"

Section 2 — Condition snapshot (one question per HFP condition)
  safety            textarea        "Describe the psychological safety climate — do people speak up, raise concerns, and flag problems without fear?"
  identity          textarea        "How clearly do members understand their role and how it connects to the mission?"
  agency            textarea        "Do people feel meaningful control over their work and day-to-day decisions?"
  connection        textarea        "How would you characterize trust and relational quality across the team or organization?"
  contribution      textarea        "Do people believe their effort creates visible, meaningful impact?"

Section 3 — Leadership and structure
  leadershipPercept textarea        "How is leadership perceived — as consistent, fair, and credible?"
  workarounds       textarea        "Are there informal workarounds, shadow systems, or unspoken rules operating in this organization?"

Section 4 — Practitioner observation
  hypothesis        textarea        "What is your primary diagnostic hypothesis coming in?"
  additionalContext textarea        "Any additional context the diagnostic engine should factor in? (optional)"
```

### ORRA full form — `components/intake/ORRAForm.tsx`

Extends ORRA-Lite with all four 4A phase sections. Add:

```
Phase 1 — Awareness
  awarenessFindings   textarea    "What did the Awareness phase reveal about organizational self-perception and stated vs. actual conditions?"

Phase 2 — Assessment
  assessmentData      textarea    "Summarize quantitative and qualitative findings from the Assessment phase."
  keyGaps             textarea    "What are the most significant gaps identified in assessment data?"

Phase 3 — Alignment
  alignmentStatus     textarea    "Describe leadership alignment to the assessment findings. Where is there agreement? Where is there resistance?"

Phase 4 — Action
  currentActions      textarea    "What actions, if any, are currently in motion? Are they addressing root conditions or surface symptoms?"
  constraintFactors   textarea    "What resource, political, or cultural constraints are affecting action?"
```

### 4A Phase form — `components/intake/FourAForm.tsx`

```
phaseSelect     select      Awareness | Assessment | Alignment | Action
phaseFindings   textarea    "Summarize the key findings from this phase."
dataQuality     select      Strong — multiple sources | Moderate — some gaps | Limited — directional only
openIssues      textarea    "What questions or concerns remain unresolved from this phase?"
contextNotes    textarea    "Organizational context relevant to interpreting this phase's findings."
```

### PLH form — `components/intake/PLHForm.tsx`

```
Section 1 — Leader context
  clientLabel       text input    "Leader name or identifier (optional)"
  role              text input    "Current role/title"
  orgContext        textarea      "Brief description of the organizational environment this leader operates in"
  assessmentTrigger select        Self-initiated | Performance concern | Role transition | Leadership development program | Other

Section 2 — Identity and purpose
  roleClarity       textarea      "Does the leader have a clear sense of their role identity and how it aligns with their values?"
  purposeAlignment  textarea      "How connected does the leader feel to the mission and purpose of the organization?"
  roleConflict      textarea      "Are there tensions between who the leader is and what the role demands of them?"

Section 3 — Agency and decision-making
  decisionControl   textarea      "Does the leader feel meaningful control over key decisions in their domain?"
  constraintPattern textarea      "Where do they feel blocked, overridden, or undercut in their authority?"
  adaptationStyle   textarea      "How does the leader typically respond when facing constraints — push back, adapt, withdraw, or work around?"

Section 4 — Contribution and impact
  impactVisibility  textarea      "Does the leader believe their effort produces visible, meaningful outcomes?"
  recognitionPattern textarea     "How is their contribution recognized (or not) by the organization?"
  futilitySignals   textarea      "Are there signs of disillusionment, going-through-the-motions, or disengagement?"

Section 5 — Relational and safety
  psychSafety       textarea      "Does the leader feel safe to be honest — with peers, superiors, and direct reports?"
  trustConditions   textarea      "Describe the quality of key working relationships in this leader's environment."

Section 6 — Practitioner notes
  primaryConcern    textarea      "What is the primary developmental or performance concern prompting this assessment?"
  additionalContext textarea      "Any additional context? (optional)"
```

### SMP form — `components/intake/SMPForm.tsx`

```
Section 1 — Program context
  cycleNumber       select        Cycle 1 | Cycle 2 | Cycle 3 | Cycle 4+
  participantLabel  text input    "Participant name or identifier (optional)"
  mentorLabel       text input    "Mentor name or identifier (optional)"
  programDuration   select        Ongoing (<3 months) | Mid-cycle (3-6 months) | Cycle complete (6+ months)

Section 2 — Relationship quality
  relationalTrust   textarea      "How would you describe the quality of trust in the mentorship relationship?"
  engagementLevel   textarea      "Is the participant actively engaged — showing up, applying learning, initiating?"
  connectionBarriers textarea     "Are there barriers to genuine connection in this relationship (availability, power dynamics, cultural distance)?"

Section 3 — Developmental conditions
  growthVisibility  textarea      "Can the participant see their own growth? Do they feel the mentorship is creating real development?"
  structuralSupport textarea      "Does the organization structurally support this mentorship (time, resources, recognition) or is it individually heroic?"
  transferToWork    textarea      "Are insights and skills from the mentorship visibly transferring into the participant's role performance?"

Section 4 — Contribution and meaning
  purposeConnection textarea      "Does the participant feel the program connects to something meaningful — career trajectory, personal growth, mission contribution?"
  completionRisk    select        Low — strong momentum | Moderate — some flags | High — disengagement risk

Section 5 — Practitioner notes
  primaryConcern    textarea      "What is the primary developmental concern or reason for this assessment?"
  additionalContext textarea      "Any additional context? (optional)"
```

---

## 12. Diagnostic report components

### `components/diagnostic/HFPConditionPanel.tsx`
Render all five HFP conditions as a horizontal card row (or 2-col grid on mobile).
Each card shows:
- Condition name (Safety, Identity, Agency, Connection, Contribution)
- Status badge with color: absent=red, threatened=orange, deficit=amber, functional=blue, strong=green
- Finding text (1-2 sentences)
- Collapsible or small "Evidence" text in muted style

### `components/diagnostic/PathCard.tsx`
Three cards, displayed in a column or 3-col grid. Recommended path gets a visual accent (border highlight).
Each card shows:
- Path label (A — Stabilize / B — Realign / C — Rebuild) + timeframe
- Headline
- Rationale
- Interventions (bulleted list)
- Deliverables
- Pulse interval + reintake instrument
- Leading indicators

### `components/diagnostic/DiagnosticReport.tsx`
Full assembled report. Order:
1. Header: instrument type label + client label (if present) + date
2. Executive summary (largest text on page, prominent)
3. Overall readiness tier (LCRA) — large label + rationale
4. HFP Condition Panel
5. CLRT reading — legitimacy status + CIB callout if present (plain language only, no acronyms visible to client)
6. Three path cards with recommended path highlighted
7. Footer: Summit Strategies Group | summitstrategiesgroup.com

---

## 13. Tailwind config — SSG design system

### `tailwind.config.ts` additions

```typescript
theme: {
  extend: {
    colors: {
      ssg: {
        navy: '#1B3A5C',
        'navy-dark': '#122840',
        'navy-light': '#2A4F78',
        gold: '#C9A84C',
        'gold-light': '#E2C97E',
        'gold-dark': '#A8882E',
        cream: '#F8F5EF',
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    }
  }
}
```

Apply:
- Page backgrounds: `bg-ssg-cream`
- Navigation/header: `bg-ssg-navy text-white`
- Primary buttons: `bg-ssg-navy text-white hover:bg-ssg-navy-dark`
- Accent elements: `text-ssg-gold` or `border-ssg-gold`
- Report cards: white background, light border, generous padding
- Recommended path card: `border-2 border-ssg-gold`

---

## 14. Build sequence

Follow this exact order. Complete each step before moving to the next.

1. `npx create-next-app` with flags from Section 1
2. Install all dependencies
3. Create `.env.example` and `.env.local` with placeholder values
4. Create Supabase client files (`lib/supabase/client.ts`, `server.ts`, `service.ts`)
5. Apply database migration in Supabase dashboard or via CLI
6. Create all TypeScript types (`types/index.ts`)
7. Create AI system prompt (`lib/anthropic/prompts/system.ts`)
8. Create all five instrument prompt builders
9. Create response parser (`lib/anthropic/parse-response.ts`)
10. Build `/api/analyze/route.ts`
11. Build `/api/report/[id]/route.ts`
12. Add SSG colors to `tailwind.config.ts`
13. Build landing page (`app/page.tsx`) with instrument selector grid
14. Build ORRA-Lite form component (`components/intake/ORRALiteForm.tsx`)
15. Build dynamic intake page (`app/intake/[instrument]/page.tsx`) wired to ORRA-Lite first
16. Build `HFPConditionPanel`, `PathCard`, `DiagnosticReport` components
17. Build report page (`app/report/[id]/page.tsx`)
18. Test full end-to-end flow with ORRA-Lite
19. Build remaining four intake form components (ORRA, 4A, PLH, SMP)
20. Wire all instruments into the dynamic intake page
21. Polish: loading states, error handling, empty states, mobile layout
22. Verify all env vars set in Vercel, push to main, confirm deployment

---

## 15. Implementation notes

- **No middleware needed.** No auth, no protected routes. All pages are public.
- **The AI call is synchronous.** User waits on the intake page during processing. Loading state is critical UX — use a centered spinner with a calm message ("Analyzing your assessment…"). Typical call takes 10-20 seconds.
- **JSON parsing can fail.** The `parseResponse` function handles this — on failure, the API route catches the error, marks the submission as 'error', and returns a 500. Surface a user-friendly message ("Something went wrong — please try again") with a retry option.
- **No methodology language in client-facing output.** The report page must never display the terms HFP, CLRT, LCRA, CIB, or Seed-Soil-Farmer. These appear in the practitioner-side system prompt only. The AI is instructed not to use them in the executive summary — but the UI components should also not label sections with these terms. Use plain labels: "Condition Assessment", "Readiness Overview", "Corrective Paths".
- **ORRA-Lite data caveat.** When `instrument_type === 'orra-lite'`, display a subtle callout on the report page: "This report is based on a rapid assessment. Findings are directional. A full ORRA assessment is recommended for comprehensive diagnosis."
- **Service role key is server-only.** `SUPABASE_SERVICE_ROLE_KEY` must never be in a `NEXT_PUBLIC_` variable. It is used only in API routes and server components.
- **Vercel timeout.** Default Vercel function timeout is 10 seconds on the hobby plan. Anthropic API calls may take 15-25 seconds. Set `maxDuration` in the route:
  ```typescript
  export const maxDuration = 60 // seconds — requires Pro plan or set to 30 on hobby
  ```
  If on hobby plan, warn the user the analysis may take up to 30 seconds and design the loading state accordingly.

---

## 16. Stretch goals (do not build until core is complete)

- PDF export of report page using `@react-pdf/renderer` or Puppeteer via Vercel function
- "Share this report" — copy URL to clipboard button on report page
- Anonymous analytics: track instrument type distribution, completion rate, average processing time
- Rate limiting on `/api/analyze` to prevent abuse (use Upstash Redis + `@upstash/ratelimit`)
- Email delivery: submitter enters email, receives report link via Resend after processing
- Admin dashboard (password-protected) for Royce to view all submissions and aggregate HFP condition data

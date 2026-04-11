# Summit Diagnostic

**Summit Strategies Group — Organizational & Leadership Diagnostic Platform**

A clean, public-facing web application that accepts completed SSG assessment inputs (ORRA, ORRA-Lite, 4A Phase, PLH, SMP), runs AI-powered diagnostic analysis against the HFP/CLRT/LCRA theoretical framework, and delivers a structured three-path corrective report — without exposing internal methodology to the user.

No login. No account. Submit a report, get a diagnostic.

---

## What it does

1. **User lands on intake page** — selects instrument type
2. **Fills out instrument-specific form** — structured fields tailored to each assessment
3. **Submits** — AI engine processes against HFP/CLRT/LCRA framework
4. **Diagnostic report rendered** — three corrective paths, pulse cadence, executive summary
5. **Optional: copy or print report** — clean output, no methodology exposed

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend + API routes | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) — stores submissions and results |
| AI engine | Anthropic Claude API (claude-sonnet-4-20250514) |
| Hosting | Vercel |
| Repo | GitHub |

No authentication layer at launch. All intake and report pages are public.

---

## Project structure

```
summit-diagnostic/
├── app/
│   ├── page.tsx                        # Landing / instrument selector
│   ├── intake/
│   │   └── [instrument]/page.tsx       # Dynamic intake form by instrument type
│   ├── report/
│   │   └── [id]/page.tsx               # Diagnostic report output page
│   └── api/
│       ├── analyze/route.ts            # POST — runs diagnostic, stores result, returns id
│       └── report/[id]/route.ts        # GET — fetch stored report by id
├── components/
│   ├── intake/
│   │   ├── InstrumentSelector.tsx
│   │   ├── ORRAForm.tsx
│   │   ├── ORRALiteForm.tsx
│   │   ├── FourAForm.tsx
│   │   ├── PLHForm.tsx
│   │   └── SMPForm.tsx
│   ├── diagnostic/
│   │   ├── HFPConditionPanel.tsx
│   │   ├── PathCard.tsx
│   │   ├── PulseCadence.tsx
│   │   └── DiagnosticReport.tsx
│   └── ui/
│       └── (shared components)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── anthropic/
│   │   ├── client.ts
│   │   ├── prompts/
│   │   │   ├── system.ts
│   │   │   └── instruments/
│   │   │       ├── orra.ts
│   │   │       ├── orra-lite.ts
│   │   │       ├── four-a.ts
│   │   │       ├── plh.ts
│   │   │       └── smp.ts
│   │   └── parse-response.ts
│   └── utils/
│       └── format-report.ts
├── types/
│   └── index.ts
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://summit-diagnostic.vercel.app
```

---

## Getting started

```bash
git clone https://github.com/YOUR_ORG/summit-diagnostic
cd summit-diagnostic
npm install
cp .env.example .env.local
# fill in env vars
npm run dev
```

---

## Deployment

Push to `main` → Vercel auto-deploys. Set all env vars in Vercel project settings. Supabase migrations run via `supabase db push` from local CLI.

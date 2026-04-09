# Meridian Build Backlog
**Meridian by SSG** | Version 0.1.0

---

## Phased Build Sequence

### Phase 0 — Project Initialization ✅
- [x] `package.json` with all dependencies
- [x] `.env.example`
- [x] `.gitignore`
- [x] `vite.config.js`

### Phase 1 — Core Infrastructure
- [ ] `src/config/env.js` — environment config, single-switch deploy
- [ ] `data/schemas/master.schema.json` — data contract
- [ ] `src/core/storage.js` — storage abstraction layer (local JSON + PostgreSQL)
- [ ] `src/utils/currency.js` — USD cents math, 18-currency display
- [ ] `src/utils/calculations.js` — budget calculation engine (pure functions)
- [ ] `src/utils/validators.js` — input validation
- [ ] `src/core/auth.js` — role-based auth (local: role selector, server: JWT)
- [ ] `src/modules/event-planner/EventPlanner.jsx` — main event planner
- [ ] `src/modules/event-planner/sections/` — 8 collapsible budget sections

### Phase 2 — Role Dashboard Scaffold
- [ ] `src/ui/dashboards/DashboardRouter.jsx` — role selector + JWT routing
- [ ] `src/ui/dashboards/VolunteerDashboard.jsx` — global_board, regional_councillor, chapter_president
- [ ] `src/ui/dashboards/StaffDashboard.jsx` — exec_director, regional_director, senior_director, chapter_staff
- [ ] `src/ui/dashboards/HRDashboard.jsx` — lateral visibility, friction queue
- [ ] `src/ui/dashboards/GovernanceDashboard.jsx` — ORRA cycle authority, compliance view

### Phase 3 — Org Health Modules
- [ ] `src/modules/friction-log/FrictionLog.jsx` — capture + pattern views
- [ ] `src/modules/orra-lite/OrraLite.jsx` — 12-item diagnostic, LHI scoring
- [ ] `src/modules/plh-assessment/PlhAssessment.jsx` — 20-item HFP instrument
- [ ] `src/modules/org-health/OrgHealthDashboard.jsx` — aggregate health display
- [ ] `src/modules/rhythm-board/RhythmBoard.jsx` — objectives, milestones, cadence

### Phase 4 — Server Infrastructure
- [ ] `src/core/push.js` — anonymized SSG health signal push
- [ ] `src/core/api.js` — Express REST API (16 routes)
- [ ] `scripts/migrate.js` — JSON → PostgreSQL migration

### Phase 5 — Polish and Deployment
- [ ] `src/ui/App.jsx` — top-level router and app shell
- [ ] `src/ui/styles/tokens.css` — SSG brand tokens
- [ ] `src/ui/components/` — shared UI components
- [ ] `data/seeds/eo-pilot.seed.js` — EO pilot seed data
- [ ] `client/eo-pilot/config.json` — EO pilot client config
- [ ] `tests/currency.test.js`
- [ ] `tests/calculations.test.js`
- [ ] `tests/storage.test.js`
- [ ] PostgreSQL RLS configuration
- [ ] Server deployment verification

---

## Deliberate Exclusions (v0.1.0)

These are not bugs. They are intentional scope decisions:

- No Gantt charts or timeline views
- No dependency-linked task management
- No automated notifications or email (Phase 1-4)
- No mobile app
- No integrations (Monday.com, Asana, etc.)
- No AI/chat features
- No social features (comments, reactions, @mentions)
- No time tracking
- No custom field builder
- No reporting builder / drag-and-drop dashboards

---

## Post-Pilot Backlog (v0.2.0+)

- Full ORRA instrument (extended diagnostic)
- SLI (Structural Legitimacy Indicator)
- PLH push to aggregate — conditional on org size and opt-in
- Mobile companion app (read-only health signals)
- Email/calendar integration for rhythm board
- Multi-language UI (Phase 5 adds language support but UI is EN)

---

*The operator experience depends on simplicity. Every addition is a friction cost.*
*Meridian by SSG — Operators operate. Engineers engineer.*

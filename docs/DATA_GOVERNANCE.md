# Meridian Data Governance Policy
**Meridian by SSG** | Version 1.0 | Summit Strategies Group LLC

---

## What This Document Covers

This document defines what data moves, what data stays, and who can see what within the Meridian platform. Every engineer working on this system must read and follow these rules.

---

## The Core Principle

**Raw records never leave the client instance.**

The only data that transmits to SSG servers is anonymized aggregate health signals. No personally identifiable information (PII), no individual responses, no organization identifiers.

---

## Data Classification

### Class A — Local Only (Never Leaves the Instance)

| Table | Why |
|-------|-----|
| `users` | Contains role and org association — PII risk |
| `events` | Contains budget detail, financial planning — client confidential |
| `friction_log.description` | Free-text, may contain personnel information |
| `friction_log.logged_by` | Links friction to a user — PII |
| `plh_assessment` | Individual psychological condition scores — never shared |

### Class B — Anonymized Aggregate (May Push to SSG)

Fields that MAY push to SSG via the health signal push:

| Field | Description |
|-------|-------------|
| `signal_date` | Date of the signal (no timestamp) |
| `lhi_score` | Composite LHI score (0-100) |
| `friction_density` | Events per period — no descriptions |
| `legitimacy_index` | Aggregate legitimacy score |
| `plh_distribution` | Distribution percentages only — no individual scores |
| `readiness_output` | "Grounded" / "Rebuilding" / "Scattered" |
| `org_type` | Global / Regional / Chapter (not org name) |
| `org_size_band` | Small / Medium / Large (not exact count) |
| `region_code` | Geographic region code (not org identifier) |

### Class B — Deliberately Excluded from Push

| Field | Why Excluded |
|-------|-------------|
| `organization_id` | Direct identifier — excluded |
| `respondent_count` | Could identify small orgs |
| `farmer_score` / `soil_score` / `seed_score` | Sub-scores retain raw fidelity — aggregate only |

---

## Push Conditions

The SSG health push only runs when ALL of the following are true:

1. `ENV.SSG_PUSH.ENABLED = true` (push endpoint configured)
2. `ENV.SSG_PUSH.ENDPOINT` is set to a valid SSG endpoint
3. The organization's `config.health_push_enabled = true` (opt-in per org)
4. The organization has ≥ 10 active users (`MIN_ORG_SIZE_FOR_PUSH`)
   — protects small orgs from de-anonymization risk

---

## Role-Based Access Within the Platform

| Data Type | global_board | exec_director | reg_director | chapter_president | chapter_staff | hr | governance |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Global finance | read | full | — | — | — | — | — |
| Regional finance | read | full | full | — | — | — | — |
| Chapter finance | read | full | full | read | — | — | — |
| Friction log | — | full | full | — | full | full | read |
| Health signals | read | full | full | read | read | — | read |
| PLH scores | — | aggregate | aggregate | — | — | full | — |
| Event planner | read | full | full | full | — | — | — |

Legend: full = read + write, read = read only, aggregate = distribution only, — = no access

---

## Storage Modes

### Local Mode
- All data stored in `data/local/*.json`
- Files stay on the operator's machine
- No network calls except the optional SSG push
- Backup: encrypted `.mrd` files (AES-256-GCM)

### Server Mode
- All data in PostgreSQL with Row-Level Security (RLS)
- RLS policy: `organization_id = current_setting('app.current_org_id')`
- Organizations cannot read each other's data at the database layer

---

## Backup Security

`.mrd` backup files are encrypted using AES-256-GCM. The encryption key is unique per backup and embedded in the file. These files contain Class A data and must be handled accordingly:

- Never store in a shared location
- Transmit only over encrypted channels
- Delete after successful restore
- The key embedded in the file does not reduce security — the encryption prevents casual inspection, not forensic analysis

---

## Compliance Notes

- **GDPR**: User data is stored locally by default. For EO clients with EU members, the client operator is the data controller. SSG receives only aggregate, anonymized signals.
- **Data Retention**: No automated retention policy in v0.1.0. Client operators manage their own retention.
- **Right to Deletion**: In local mode, delete the user record from `users.json`. In server mode, use standard SQL DELETE with CASCADE.

---

*Questions: info@summitstrategiesgroup.org*
*Meridian by SSG — the reference line everything else is measured from.*

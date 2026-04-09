Meridian
Organizational Health & Readiness Platform
by Summit Strategies Group LLC
---
Meridian is an organizational health and operational readiness platform built on the CLR Framework (Conditioning-Legitimacy Response). It establishes the organizational baseline — condition, legitimacy, readiness — and provides role-appropriate planning and diagnostic tools measured against that reference line.
Meridian is not a task manager. It is the layer that tells leadership whether an organization is in condition to execute — and provides simplified planning tools within the same system.
---
Status
Version: 0.1.0 — Pilot / Local  
Pilot Client: Entrepreneurs' Organization (EO) — Pilot Client 01  
Build phase: Foundation complete — active development
---
Repository Contents
File	Purpose
`CLAUDE_CODE_GUIDE.md`	Complete build guidance — Phase 0 through server deployment
`README.md`	This file
Full project files including schemas, config, migration scripts, and documentation are generated during the build process per the guide.
---
For Developers / Claude Code
Start here: `CLAUDE_CODE_GUIDE.md`
Read the entire guide before writing any code. The preface constraints govern every downstream decision.
---
Architecture in Brief
Two layers, kept deliberately separate:
Engineering layer — CLR Framework theory, LCRA architecture, psychometric validation, MSAA, instrument design. Developed by Royce Parfait / SSG.
Operator layer — Clean dashboard, simple inputs, health signals, actionable outputs. Operators never see the framework formula. They see a health score, friction count, readiness indicator, and a recommended action.
> Operators operate. Engineers engineer. The platform does the math. The operator reads the signal.
---
Core Design Constraints
All monetary values stored as integer USD cents — display conversion at presentation layer only
18 supported display currencies
Local-first deployment — runs without network; single config switch moves to PostgreSQL server
SSG health push is anonymized aggregate only — raw records never leave the client instance
5-language support: EN / ES / PT / JA / ZH
---
Licensing
Proprietary — Summit Strategies Group LLC. All rights reserved.  
Contact: info@summitstrategiesgroup.org
---
Meridian by SSG — the reference line everything else is measured from.

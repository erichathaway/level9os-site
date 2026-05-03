# Level9 Operational Governance: Product & Agent Governance

| | |
|---|---|
| **Document ID** | LVL9-GOV-003 |
| **Version** | 1.0 |
| **Effective Date** | 2026-05-02 |
| **Owner** | Eric Hathaway (erichathaway@gmail.com) |
| **Classification** | Internal. May be shared with reviewers, auditors, and underwriters under NDA. |
| **Review Cadence** | Quarterly, plus on every material change to officer roster or room architecture. |
| **Next Review Due** | 2026-08-02 |
| **Sibling chassis** | LVL9-GOV-001 (Backup & Access), LVL9-GOV-002 (Infrastructure & Reliability), LVL9-GOV-004 (Prompt Architecture). This document covers the agent-decision and product-decision layers that sit on top of the runtime. |
| **Reading this document** | Where files are referenced, paths are absolute from the repo root. Where database tables are referenced, schemas live under `commandos-v2/schema-v2.sql` and `commandos-center/supabase/schema/`. The roster of named officers is open and editable in `commandos-v2/officers/`. |

---

## 1. Purpose and Audience

This document describes the governance program covering decisions, builds, and outputs inside the Level9 product stack. It addresses two related questions a serious reviewer will ask:

1. **How does the system decide what to do?** Strategic decisions in StratOS rooms, project gates, planning intake, voice and brand checks, lifecycle phase entry and exit.
2. **How is the agent fleet itself governed?** The split between regular agents (`cmd_agents`) and governance officers (`cmd_governance_agents`), the officer roster, gate panels, the routing audit, the duplicate-prevention rule.

Where LVL9-GOV-002 protects the runtime, this document covers what the runtime is allowed to do, who reviews what, and how that review is recorded.

**Intended readers:**

1. **The owner-operator** evaluating whether to add a new officer, retire one, or reassign gate ownership.
2. **A governance, security, or compliance officer** evaluating the maturity of the AI-agent oversight program. Should be able to verify the officer roster against the source files, count gate sign-offs in the audit log, and trace any production decision back to the decision record.
3. **A new technical hire** stepping into product oversight. Should be able to onboard from this document plus the procedure files in `level9-brand/procedure/`.
4. **An external reviewer** in a partnership, due-diligence, or insurance context. Should find the AI risk-management story (NIST AI RMF, ISO 42001) embodied in concrete artifacts, not policy slides.

**What this document is not** (high-level. Full out-of-scope register in Section 2.3):

- A complete enterprise AI policy. It addresses the operating reality of one AI-agent stack used by one operator. It is honest about which controls are mechanized versus narrative.
- An ethics framework. Specific values like dignity, transparency, customer trust live in the LucidORG Decision Framework (`level9-brand/policy/DECISION-FRAMEWORK.md`). This document references that framework but does not restate it.
- A roadmap. It documents what exists today and what is open as a tracked issue.

### Novel contribution

A market sweep of AI-agent governance disclosures from 2025 to 2026 found three observations relevant to this document:

1. **No published reference describes a multi-officer review architecture for a single-operator AI-agent stack.** Existing reference architectures (Anthropic's Claude Code agent guidelines, Microsoft AutoGen, Cognition's Devin) describe agents executing tasks. None describe a governance officer roster (~24+ named roles) with prompts versioned in a registry, gate sign-offs recorded in an append-only ledger, and an auto-routing layer that fires the right officer per gate.
2. **No published reference describes a 5-room deliberation architecture for AI-driven strategic planning** with named persona profiles, expertise vectors, dissent bias, temperature ranges, and a 10-stage pipeline (Q → EI → D → F1 → RX → F2-F4 → F3 → GOV → GOV-TEST). StratOS is the only system describing this end-to-end as of this writing.
3. **No published reference describes a `cmd_routing_log`-style decision audit** that records every agent call, its task class, model provider, tokens, cost, and outcome — wired to a budget enforcement layer. Helicone and Langfuse observe; they do not enforce gates at routing time.

This document is therefore intended both as governance evidence for the owner-operator and as a reference architecture for the segment that no other published document currently serves at this level of detail.

## 2. Scope

**In scope (assets and controls this program protects):**

| Asset / Control | Layer | Source of truth |
|---|---|---|
| `cmd_agents` table | Agent registry (runtime claude_code agents) | `commandos-center/supabase/schema/01-tables.sql` |
| `cmd_governance_agents` table | Officer registry | `commandos-v2/migrations/build10-officers.sql` |
| `commandos-v2/officers/` directory (~65 prompt files) | Officer prompt library | Filesystem + Supabase mirror |
| `cmd_routing_log` | Per-call decision audit | `commandos-v2/schema-v2.sql` |
| `cmd_governance_rules` table (32 rows) | Operational rules in force | `commandos-center/supabase/data/cmd_governance_rules.sql` |
| StratOS room schema (`room_prompts`, 50 personas) | Deliberation-room governance | `commandos-center/supabase/data/room_prompts.sql` |
| `level9-brand/procedure/` (4 procedures) | Lifecycle gates | Filesystem |
| `voiceRules.ts` voice-gate enforcement | Output-quality gate | `level9-brand/src/content/voiceRules.ts` |
| Officer dispatcher + gate watcher (designed) | Auto-routing of gate sign-offs | Build 10 design |
| Pre-write audit protocol | Anti-bloat / no-junk-workflow gate | `commandos-v2/CLAUDE.md` lines 176–296 |

**Out of scope:**

- The execution-layer mechanics of any individual product (LinkUpOS comment generation, OutboundOS prospecting, COO Playbook accountability engine). Those have their own design documents. This program covers governance of all of them collectively.
- The contents of the LucidORG Decision Framework. Cross-referenced from `level9-brand/policy/DECISION-FRAMEWORK.md`.
- Customer-facing application security on the products. Out of scope (see LVL9-GOV-002 §2).

### 2.3 What this document is not

| Out of scope | Why |
|---|---|
| Full NIST AI RMF profile | This document is the operating-evidence half. The full Profile artifact (AI risk catalog, risk acceptance, residual risk by category) is referenced but not restated. |
| ISO/IEC 42001 management-system documentation | This document is one input. The management-system docs (AI Policy, AI Roles, AI Risk Treatment Plan) are separate artifacts. |
| Customer-facing AI-behavior guarantees | Each product publishes its own guarantees. This document covers internal governance, not customer SLAs. |
| Multi-tenant officer isolation | Single-operator design. Multi-employee teams would adopt per-team officer scoping. |
| Bias / fairness assessments at production scale | Out of scope at current scale. The Human-Equity officer prompt covers the input-validation surface. |
| Model-evaluation harnesses | Eval is upstream of governance. Tracked separately (§17 Open Issues). |

## 3. Roles and Responsibilities

| Role | Held by | Responsibilities |
|---|---|---|
| Owner | Eric Hathaway | Final authority on officer roster, gate policy, and governance rules. |
| Operator | Eric Hathaway | Day-to-day operation of the agent fleet, dispatch decisions, gate sign-offs, voice rule enforcement. |
| Officers (automated, AI-driven) | LLM agents reading prompts in `commandos-v2/officers/` | Each officer holds a domain (pricing, ethics, legal-tech, brand, design, content, marketing, sales, customer-success, technical, life-coach). Officers review work product on demand or at gate fire-time. They cannot execute production changes; they can only return a verdict. |
| StratOS personas (automated, AI-driven) | LLM agents reading prompts in Supabase `room_prompts` | Members of the 5 deliberation rooms (ELT, Innovation, Board, Management, Investor). Vote, dissent, escalate within their room's rules. Verdict aggregated by the room engine, not the persona. |
| Conductor (automated) | n8n workflow + commandos-v2 routing layer | Cross-document with LVL9-GOV-002 §11. Reads `cmd_budgets`, enforces 75% / 90% thresholds, writes every call to `cmd_routing_log`. |
| Officer Dispatcher (designed) | n8n workflow `ORCH-Officer-Dispatcher` | Routes a single officer call. Designed; not yet wired. |
| Gate Watcher (designed) | n8n workflow `ORCH-Officer-Gate-Watcher` | Polls gate state every 5 minutes. Caps at 5 officer fires per cycle. Designed; not yet wired. |
| Reviewer (external, on demand) | Human under NDA | Reads this document, samples audit rows, verifies controls. |

## 4. Architecture Overview

```
                    ┌──────────────────────────────────────────┐
                    │           STRATEGIC LAYER (StratOS)      │
                    │                                          │
                    │  5 ROOMS                                 │
                    │  - ELT (live)                            │
                    │  - Innovation (designed)                 │
                    │  - Board (designed)                      │
                    │  - Management (designed)                 │
                    │  - Investor (designed)                   │
                    │                                          │
                    │  50 PERSONAS  (room_prompts table)       │
                    │   each w/ background, expertise[],       │
                    │   decision_focus, dissent_bias,          │
                    │   temperature, top_p, drive_doc_id       │
                    │                                          │
                    │  10-STAGE PIPELINE                       │
                    │   Q → EI → D → F1 → RX → F2-F4 → F3      │
                    │   → GOV → GOV-TEST                       │
                    │                                          │
                    │  Output: a strategic decision packet     │
                    └──────────────────────┬───────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────┐
                    │       OPERATIONAL LAYER (CommandOS)      │
                    │                                          │
                    │  cmd_agents       ← runtime agents       │
                    │  cmd_routing_log  ← every call audited   │
                    │  cmd_budgets      ← spend caps           │
                    │  cmd_activity_log ← guard + heartbeat    │
                    │  cmd_governance_rules ← 32 rules in force│
                    │                                          │
                    │  Conductor enforces budget at routing    │
                    └──────────────────────┬───────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────┐
                    │      GOVERNANCE LAYER (Officers)         │
                    │                                          │
                    │  cmd_governance_agents ← officer roster  │
                    │  ~24 SQL-seeded + ~65 prompt files       │
                    │   in commandos-v2/officers/              │
                    │                                          │
                    │  GATES                                   │
                    │   G1 plan review                         │
                    │   G2 mid-project alignment               │
                    │   G3 final sign-off                      │
                    │                                          │
                    │  Default: gates_disabled=true            │
                    │   (officers always-on; do not auto-block)│
                    │                                          │
                    │  ORCH-Officer-Dispatcher    (designed)   │
                    │  ORCH-Officer-Gate-Watcher  (designed)   │
                    └──────────────────────┬───────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────┐
                    │     OUTPUT QUALITY LAYER (voice + brand) │
                    │                                          │
                    │  voiceRules.ts                           │
                    │   HARD_BANS (em-dash, en-dash, --)       │
                    │   BANNED_PHRASES (11 entries)            │
                    │   SOFT_PREFERENCES                       │
                    │   passesVoiceCheck()                     │
                    │                                          │
                    │  level9-brand/procedure/                 │
                    │   PROJECT-LIFECYCLE                      │
                    │   BRAND-CONSISTENCY-CHECKLIST            │
                    │   DEPLOY-PROCEDURE                       │
                    │   DATA-CLEANUP-PROCEDURE                 │
                    └──────────────────────────────────────────┘
```

The architecture is layered: StratOS makes strategic calls, CommandOS executes and audits, officers review at gates, voice-and-brand enforce on output. The flow is one-directional in the happy path. Any layer can escalate up or block down.

## 5. Threat Model

### 5.1 Threats this program defends against

| Threat | Defended by | Section |
|---|---|---|
| Agent runs an unauthorized destructive operation | Guard service (LVL9-GOV-001 §9) at infrastructure level. Officer review at decision level. | Cross-document |
| Agent ships work that violates brand, voice, or legal posture | voiceRules.ts hard bans, banned-phrase enforcement, BRAND-CONSISTENCY-CHECKLIST, officer review at G3 | §11, §13 |
| Agent ships duplicate workflow / agent / table that should reuse an existing one | `cmd_governance_rules` `no_bandaid_code` rule; pre-write audit protocol; canonical-source mandate | §12 |
| Agent claims completion without evidence | Anti-Lie engine (LVL9-GOV-004) — cross-document | LVL9-GOV-004 |
| Strategic decision made by a single biased perspective | StratOS room with 10 personas of varying background, dissent bias, expertise. The 10-stage pipeline forces F1 (frame), RX (recalibrate), F2-F4 (challenge), F3 (consensus), GOV (governance check), GOV-TEST (verify). | §6 |
| Officer prompt drift over time | Prompts versioned via frontmatter; synced to Supabase via `sync-officer-prompts.js`; git-tracked | §8 |
| Officer always says yes (rubber stamp) | Officer prompt design includes explicit dissent posture; G3 includes a dissent-only officer for high-stakes shipments | §8.4 |
| Lifecycle gate bypassed | Gate sign-offs recorded in `cmd_routing_log` with project_key, phase, officer; missing phase entry blocks next phase | §10 |
| Junk workflow added to fleet | Pre-write audit protocol mandates check against existing inventory before any new build | §12 |

### 5.2 Threats explicitly out of scope

| Out of scope | Reason |
|---|---|
| Adversarial-prompt jailbreak of officer prompts | Officer prompts are operator-controlled, not user-facing. The threat model is operator drift, not external attack. Defense lives in LVL9-GOV-004 (prompt architecture). |
| Model-level bias evaluation | Done upstream (provider attestations). The governance program operates on outputs, not models. |
| Targeted phishing of the operator to issue a corrupted officer change | Out of scope as a controls program. Mitigated socially. |
| Disgruntled-employee modification of officer prompts | Single-operator scope. |

### 5.3 Standards Alignment

| Standard | Section / Control | Where this document addresses it |
|---|---|---|
| NIST AI RMF 1.0 GOVERN-1.1 | Policies and procedures | §10 (lifecycle), §11 (voice + brand), `level9-brand/policy/` cross-references |
| NIST AI RMF 1.0 GOVERN-1.4 | Establish AI system risk management framework | §3, §11 (voice gates as concrete control), §17 (open issues) |
| NIST AI RMF 1.0 GOVERN-3 | Roles and responsibilities | §3 |
| NIST AI RMF 1.0 GOVERN-4 | Workforce diversity and culture | StratOS persona expertise vectors (§7) provide diversity-by-design |
| NIST AI RMF 1.0 MAP | AI system context and risk | §6 (StratOS pipeline) |
| NIST AI RMF 1.0 MEASURE | Performance assessment | §13 (officer review evidence in cmd_routing_log) |
| NIST AI RMF 1.0 MANAGE | Risk treatment | §10, §13 |
| ISO/IEC 42001:2023 §5.2 | AI policy | `level9-brand/policy/COMPANY-CHARTER.md` cross-reference |
| ISO/IEC 42001:2023 §6.1 | Actions to address risks | §10, §17 |
| ISO/IEC 42001:2023 §7.4 | Communication | §13 (sign-off recording) |
| ISO/IEC 42001:2023 §8.2 | AI system operational planning | §10 |
| ISO/IEC 42001:2023 §9.1 | Performance evaluation | §13 |
| ISO/IEC 27001:2022 A.5.31 | Legal, statutory, regulatory and contractual requirements | §11 (LLC attribution, voice rules), `level9-brand/legal/attribution.ts` cross-reference |
| ISO/IEC 27001:2022 A.6.6 | Confidentiality / NDA | All officer prompts respect operator NDA scope |
| OWASP LLM Top 10 LLM05:2025 | Improper output handling | §11 (voice gate before publish) |
| OWASP LLM Top 10 LLM07:2025 | System prompt leakage | LVL9-GOV-004 (cross-document) |
| OWASP LLM Top 10 LLM09:2025 | Misinformation | LVL9-GOV-001 (anti-lie cross-reference) |

## 6. StratOS Strategic Layer

### 6.1 Architectural principle

Strategic decisions require multiple perspectives, dissent, and a structured deliberation pipeline. A single agent answering a strategic question is a failure mode by construction.

### 6.2 The 5 rooms

| Room | Purpose | Status |
|---|---|---|
| ELT (Executive Leadership Team) | Tactical / operational decisions for the running business | **Live in production.** Eric uses it. |
| Innovation | Greenfield / R&D framing and risk assessment | Designed. Live build pending. |
| Board | Quarterly governance review | Designed. Live build pending. |
| Management | Department-head / cross-functional alignment | Designed. Live build pending. |
| Investor | LP / external capital framing | Designed. Live build pending. |

### 6.3 The 50-persona roster (room_prompts)

50 named personas seeded in `room_prompts` (`commandos-center/supabase/data/room_prompts.sql`). Each persona row carries:

| Field | Type | Purpose |
|---|---|---|
| `persona_name` | text | The named identity (e.g. CHAIRMAN: Richard Calloway) |
| `persona_title` | text | The role (CEO, COO, CFO, Investor, VP_PRODUCT, etc.) |
| `persona_background` | text | Working background that shapes the lens |
| `expertise[]` | text[] | Specific domain expertise |
| `decision_focus` | text | What the persona prioritizes in argument |
| `role_system_prompt` | text | Loaded from Google Doc (drive_doc_id), not seeded inline |
| `dissent_bias` | numeric (0.0–1.0) | How likely the persona is to push back on consensus |
| `temperature` | numeric (0.3–0.8) | Generation temperature |
| `top_p` | numeric (locked 0.95) | Generation top-p |
| `drive_doc_id` | text | Google Doc holding the full role prompt |
| `version` | int | Prompt version (currently 1 across the roster) |
| `active` | bool | TRUE for the live roster |

The `dissent_bias` field is the explicit defense against rubber-stamp consensus. High-bias personas (dissent_bias ≥ 0.6) are required in every Innovation and Board run.

### 6.4 The 10-stage pipeline

A StratOS room run executes 10 stages:

| Stage | Purpose |
|---|---|
| Q | Frame the question. Disambiguate, reject malformed input. |
| EI | Establish information. Pull priors, prior decisions, prior outcomes. |
| D | Decompose into sub-questions. |
| F1 | First frame. Each persona answers in their voice. |
| RX | Recalibrate. Identify weak arguments and assumption gaps. |
| F2-F4 | Three rounds of challenge-and-counter. Personas attack each other's arguments. |
| F3 | Consensus pass. Identify what is shared, what is not. |
| GOV | Governance check. Cross-reference rules in `cmd_governance_rules`. |
| GOV-TEST | Verify the proposed decision against the rules; catch violations. |

Output: a structured decision packet captured to Supabase. Eric is the final approver; the room produces the recommendation, not the verdict.

### 6.5 Known StratOS gaps

| Gap | Status |
|---|---|
| 4 of 5 rooms not yet live (only ELT in production). | Open. Build sequence in OPERATING-MODEL.md. |
| Dissent tuning is by-persona; no run-level enforcement of "at least N high-dissent personas in every Board run." | Open. Designed. |
| People-picker UI (select which personas join a given run) is in design only. | Open. |
| No multi-room voting (e.g. ELT and Board concur). | Open. Phase 3 pattern. |

## 7. CommandOS Operational Layer

### 7.1 The agent registry split

Two tables, two roles:

| Table | Purpose | Schema source |
|---|---|---|
| `cmd_agents` | The runtime registry. Tracks active claude_code agents, their tmux sessions, PIDs, heartbeats, current task. | `commandos-center/supabase/schema/01-tables.sql` |
| `cmd_governance_agents` | The officer registry. Tracks named officers, their workflow_id (if running on a schedule), their config (gate scope, default blocking, prompt file). | `commandos-v2/migrations/build10-officers.sql` |

The split is deliberate. Runtime agents are ephemeral (tmux session, restart-friendly). Officers are persistent (a named role that exists across sessions and projects).

### 7.2 cmd_agents schema

| Column | Purpose |
|---|---|
| `id` | UUID primary key |
| `name` | Agent name (e.g. `coo-playbook-build-agent`) |
| `project_id` | Project the agent serves |
| `agent_type` | `claude_code` (default), `worker`, `monitor` |
| `status` | `idle`, `running`, `error`, `paused` |
| `current_task_id` | Active task, if any |
| `tmux_session` | Tmux session name for SSH-into-agent debugging |
| `pid` | Process ID for forced restart |
| `last_heartbeat` | Timestamp of last health ping |
| `session_started_at` | Session start time |
| `total_sessions` | Lifetime session count |

### 7.3 cmd_governance_agents schema

| Column | Purpose |
|---|---|
| `id` | UUID primary key |
| `name` | Officer name (e.g. `pricing`, `ethics`, `risk`, `legal-tech`) |
| `description` | One-line summary |
| `agent_type` | `officer` (this table) |
| `workflow_id` | n8n workflow ID, if the officer runs on a schedule |
| `schedule` | Cron expression, if scheduled |
| `enabled` | Boolean. False removes from rotation. |
| `config` | JSONB. Officer-specific config: `{slug, domain, gates_supported:[1,2,3], default_blocking:bool, prompt_file:"officers/{slug}.md"}` |

### 7.4 cmd_routing_log

Every agent call is logged. Cross-document with LVL9-GOV-002 §11.2.

What this layer adds: every call has a `task_type` field that maps to product decisions (`stratos_run`, `linkupos_comment_generate`, `coo_playbook_check`, `outboundos_prospect_research`, etc.). The task_type is the join key for any "how many decisions did this product make this month, at what cost, with what outcome?" query.

### 7.5 cmd_governance_rules

32 active rules at the SQL level. Source: `commandos-center/supabase/data/cmd_governance_rules.sql`. Examples:

| Rule slug | What it enforces |
|---|---|
| `check_before_build` | Pre-write audit protocol — verify nothing already does it |
| `no_bandaid_code` | One workflow / one class / one table per function |
| `clean_as_you_go` | Delete dead code on the same pass that adds new code |
| `excellence_standard` | Output-quality bar: presentation-grade, not draft-grade |
| `presentation_standard` | Visual / type / spacing / tone standards |
| `fleet_paused` | Operator-set pause flag for the entire agent fleet |
| `intent_enabled_*` | Per-product intent flags |
| `no_em_dashes` | Em dash ban (cross-reference voiceRules.ts) |
| `officer_gates_default_off` | New / reactivated `cmd_projects` rows must set `gates_disabled=true` |

Rules are read-time evaluated. The officer-gate-default-off rule is the explicit defense against an over-eager Gate Watcher: until the operator explicitly enables gates for a project, officer review is advisory, not blocking.

## 8. Officer Roster

### 8.1 Architecture

Two data sources. The SQL-level seeded officers (`cmd_governance_agents` rows) represent the **active roster**. The prompt-file-level officers (`commandos-v2/officers/*.md`) represent the **library**: prompts that exist, may not all be active, version-tracked through git + frontmatter.

| Layer | Count | Source | Activation |
|---|---|---|---|
| Active roster (SQL-seeded) | 24 | `commandos-v2/migrations/build10-officers.sql` lines 58–85 | Activates on Build 10 deploy |
| Prompt library (filesystem) | ~65 .md files | `commandos-v2/officers/` directory | Available for activation |

### 8.2 The 24 active officers (Build 10)

Categorized by domain. Activation pattern: most officers default to `default_blocking:false` (advisory), with three exceptions.

| Category | Officer slugs | Default blocking? |
|---|---|---|
| **Business strategy** | `pricing`, `business`, `architecture`, `legal-tech`, `ethics`, `risk` | False (advisory) |
| **Creative + content** | `brand`, `design`, `content`, `marketing`, `presentation`, `coaching` | False (advisory) |
| **Sales + customer** | `sales`, `customer-success`, `partnerships` | False (advisory) |
| **People + org** | `human-equity`, `culture`, `talent`, `life-coach` | False (advisory) |
| **Technical** | `security`, `dashboard`, `quality`, `ux`, `privacy` | False (advisory) |

### 8.3 The full library (~65 prompts in `commandos-v2/officers/`)

Beyond the 24 active officers, the prompt library holds additional roles for activation as the system grows:

| Role class | Examples |
|---|---|
| Domain coaches | life-coach, executive-coach, sales-coach |
| Audit + compliance | privacy-audit, security-audit, accessibility-audit, copyright-check |
| Operational specialists | dashboard, runbook, retro |
| Templates | _template.md (canonical structure for new officers) |

### 8.4 Officer prompt structure (every officer prompt follows this contract)

Every `.md` officer prompt includes:

| Frontmatter field | Purpose |
|---|---|
| `slug` | Filesystem + DB key |
| `version` | Bumped on every meaningful prompt edit |
| `domain` | Maps to category above |
| `gates_supported` | Array of gate phases the officer can review (e.g. [1, 2, 3]) |
| `default_blocking` | True if the officer's verdict can block ship |
| `last_reviewed` | Date of last operator review |

| Prompt section | Purpose |
|---|---|
| `## Role` | One-paragraph identity statement |
| `## Mandate` | What the officer is responsible for |
| `## Inputs` | What artifacts the officer is given to review |
| `## Verdict format` | Structured output: PASS / CONCERN / BLOCK + rationale |
| `## Dissent posture` | Explicit instruction to push back, not rubber-stamp |
| `## Out of scope` | What the officer does NOT review |

The dissent posture section is the explicit defense against rubber-stamp consensus at the officer level (the StratOS-level defense lives in §6.3).

### 8.5 Officer prompt sync

`commandos-v2/scripts/sync-officer-prompts.js` reads every `.md` in `officers/`, extracts frontmatter, and updates the matching `cmd_governance_agents.config.prompt_text` row. Run on every officer-prompt edit. Mirrors the filesystem to the runtime DB so officers always read the latest prompt.

## 9. Gate Architecture

### 9.1 Three gates, three intents

| Gate | Phase | Question answered |
|---|---|---|
| G1 | Plan review | Is the plan sound? Does it cover the canonical scope? Are dependencies recognized? |
| G2 | Mid-project alignment | Has scope drifted? Has the work product diverged from the brand / voice / legal posture? |
| G3 | Final sign-off | Is this ready to ship to production / customer? |

### 9.2 Gate ownership

Each gate is owned by a panel of officers (a subset of the 24 active roster). The default panels are:

| Gate | Default panel |
|---|---|
| G1 | architecture, business, risk, ethics |
| G2 | brand, content, voice (cross-reference voiceRules.ts), design |
| G3 | quality, security, privacy, legal-tech, customer-success |

Panel composition is per-project. A project's `officer_config` JSONB on `cmd_projects` overrides the default.

### 9.3 The gates_disabled default

By rule (`officer_gates_default_off` in `cmd_governance_rules`), every new or reactivated `cmd_projects` row defaults to `officer_config.gates_disabled=true`. This means officers do not auto-fire on the project until the operator explicitly enables them. Reason: the system errs toward "officers are advisory, opt-in" rather than "officers block ship by default." This protects against over-eager Gate Watcher fires during early-build phases when the operator wants speed over review.

### 9.4 Gate sign-off recording

When a gate is enabled and an officer is fired against a project, the officer's verdict is written to `cmd_routing_log` with:

- `task_type = 'officer_review'`
- `task_id` = unique gate-fire ID
- `agent_id` = officer's `cmd_governance_agents.id`
- Outcome = PASS / CONCERN / BLOCK
- `cost_estimate_usd` = cost of the officer call

This makes officer review evidence queryable. A reviewer can ask "show me every G3 sign-off for project X" and get a complete answer from `cmd_routing_log`.

### 9.5 Officer Dispatcher and Gate Watcher (designed)

Two n8n workflows in the Build 10 design:

| Workflow | Purpose | Status |
|---|---|---|
| `ORCH-Officer-Dispatcher` | Routes a single officer call. Reads the prompt, calls the model, writes the verdict to `cmd_routing_log`. | Designed. Not yet wired. |
| `ORCH-Officer-Gate-Watcher` | Polls `cmd_projects` every 5 minutes. For each project with `gates_disabled=false`, computes which gates are due, fires the panel. Caps at 5 officer fires per cycle to bound cost. | Designed. Not yet wired. |

Until these workflows are deployed, officer review is operator-fired (manual), not automatic. The recording layer (§9.4) is the same in both modes.

## 10. Project Lifecycle Gates

### 10.1 Six phases (`level9-brand/procedure/PROJECT-LIFECYCLE.md`)

| Phase | Entry criteria | Exit criteria |
|---|---|---|
| 1. Intake | Operator-approved request, scope statement | A `cmd_projects` row exists. Scope written. Owner assigned. |
| 2. Setup | Phase 1 exit + scaffold target | Repo exists. CI green. CLAUDE.md drafted. Brand tokens consumed. |
| 3. Build | Phase 2 exit | Acceptance criteria met. Build verification passes (`rm -rf .next && npm run build`). G1 sign-off (if gates enabled). |
| 4. Ship | Phase 3 exit | Production deploy succeeded. Smoke test passed. G3 sign-off (if gates enabled). |
| 5. Operate | Phase 4 exit | Project is live and being maintained. Periodic G2 reviews. |
| 6. Retire | Operator decision | Data exported. Workflows decommissioned. Vendor accounts cancelled. Public surface taken down. Audit log preserved. |

### 10.2 Build verification gate

The single hardest mechanical gate. From `level9-brand/procedure/PROJECT-LIFECYCLE.md` lines 133–140:

```bash
rm -rf .next && npm run build
```

Must succeed cleanly. No TypeScript errors. Expected route count present. Cross-document with LVL9-GOV-002 §14.1.

### 10.3 BRAND-CONSISTENCY-CHECKLIST

Pre-ship audit. From `level9-brand/procedure/BRAND-CONSISTENCY-CHECKLIST.md`:

- Tokens (no hardcoded hex; use `@level9/brand/tokens`)
- Logos (no logo files in consumer-site `/public/`; sourced from `@level9/brand/assets/logos/`)
- Voice (no em dashes, no banned phrases; `passesVoiceCheck()` would pass)
- Legal (privacy / terms / cookie pages from `@level9/brand/legal/<llc>/`)
- LLC attribution (footer LLC pulled from `@level9/brand/legal/attribution.ts`, not invented)
- OG image, apple-icon, mobile fallbacks present
- Lighthouse mobile ≥ 85, accessibility ≥ 90

### 10.4 Officer review at gate fire-time

If `officer_config.gates_disabled=false` for the project, the gate fire records officer panel verdict as in §9.4. If gates are disabled, the gate is operator-only and recorded as such.

## 11. Output Quality Layer (voice + brand)

### 11.1 voiceRules.ts as code-level enforcement

Source: `level9-brand/src/content/voiceRules.ts`. 127 lines. Exported across 7 consumer sites as `@level9/brand/content/voiceRules`.

| Export | Purpose |
|---|---|
| `HARD_BANS` | em dash (—), en dash (–), double hyphen (--) |
| `BANNED_PHRASES` | 11 entries: "Great post", "Well said", "Couldn't agree more", "100%", "in today's fast-paced world", "leverage synergies", "circle back", "let's unpack", "moving the needle", "deep dive", "at the end of the day" |
| `SOFT_PREFERENCES` | numerals, contractions, ISO date format, title case |
| `VOICE` | One-liner identity, characteristics (6), anti-patterns (6), engagement formula, evidence rules |
| `findHardBans(text)` | Returns array of hard-ban hits with character offsets |
| `findBannedPhrases(text)` | Returns array of banned-phrase hits |
| `fixHardBans(text)` | Auto-replaces hard bans with the canonical replacement |
| `passesVoiceCheck(text)` | Returns boolean. True iff no hard bans and no banned phrases. |

### 11.2 Where voiceRules is enforced

| Surface | Enforcement |
|---|---|
| Site-level marketing copy | Build-time linter (manual today). Designed: pre-commit hook. |
| Officer prompts | Inline statement of voice rules in every officer's prompt body |
| Site cleaner agent | `~/.claude/agents/site-cleaner.md` audits at G3 and flags hits |
| Humanize generation | System prompt embeds the rules; post-generation `passesVoiceCheck()` not yet wired (gap) |

### 11.3 LLC attribution and legal posture

`@level9/brand/legal/attribution.ts` maps every consumer site to its operating LLC:

| Site | LLC |
|---|---|
| linkupos.com, lucidorg.com, thenewcoo.com (COO Playbook), stratos.lucidorg.com | LucidORG LLC |
| thenextgenintern.com | NextGen Interns LLC |
| level9os.com | Level9OS LLC |
| erichathaway.com | Eric Hathaway (individual) |

Footer LLC, copyright line, and legal pages must resolve from this map. Sites are blocked from inventing or copy-pasting attribution.

### 11.4 Known voice-and-brand gaps

| Gap | Status |
|---|---|
| `passesVoiceCheck()` not called post-generation in Humanize. | Open. Spawned task. Cross-reference LVL9-GOV-004. |
| Voice linter not run in CI. Hits caught only by site-cleaner agent at G3. | Open. Pre-commit hook designed; not deployed. |
| No automated check that consumer-site footers consume `attribution.ts` (vs. inline strings). | Open. Site-cleaner audit catches it manually. |

## 12. Junk-Workflow / Duplicate Prevention

### 12.1 The rule

`cmd_governance_rules` row `no_bandaid_code`: "No duplicates — one workflow, one class, one table per function." Operator-mandated rule.

### 12.2 The protocol (pre-write audit)

From `commandos-v2/CLAUDE.md` lines 176–296. Mandatory before adding any new workflow / agent / table:

1. Search the canonical-source registry (`cmd_summaries` entity_type='canonical_source')
2. Search existing n8n workflows for the same function
3. Search the agent roster for an existing agent with the same role
4. Search the schema for an existing table for the same data shape
5. Only build new if none of the above match

### 12.3 Why this matters

A market sweep of the operator's portfolio in April 2026 found 30+ workflows that duplicated existing functionality (consolidated in `feedback_no_junk_workflows.md`). The rule + protocol + canonical-source registry are the prevention layer. The canonical-source registry (which lives across `cmd_summaries`, `cmd_governance_rules`, and the brand package) is the source of truth.

### 12.4 Known duplicate-prevention gaps

| Gap | Status |
|---|---|
| No bot detects duplicate n8n workflows automatically. Detection is manual at audit-pass time. | Open. |
| No CI gate on workflow creation. New workflows ship through n8n without a pre-existence check. | Open. |
| Canonical-source registry coverage is incomplete (some legacy services don't have a canonical-source row yet). | Open. Tracked separately. |

## 13. Audit Trail

### 13.1 What is logged

| Source | Captured in | Retained |
|---|---|---|
| Every agent call | `cmd_routing_log` (cross-document with LVL9-GOV-002 §11.2) | Indefinite |
| Every officer review | `cmd_routing_log` with `task_type='officer_review'` | Indefinite |
| Every guard Tier 1 call | `cmd_activity_log` (LVL9-GOV-001 §13) | Indefinite |
| Every StratOS room run | `cmd_summaries` with `entity_type='stratos_run'` (designed; partial today) | Indefinite |
| Every gate sign-off | `cmd_routing_log` (where applicable) + git commit (canonical record) | Indefinite |
| Every governance-rule change | Git history of `cmd_governance_rules.sql` | Indefinite |
| Every officer-prompt change | Git history of `commandos-v2/officers/*.md` + `cmd_governance_agents.config.prompt_text` (latest) | Indefinite (git) + latest only (DB) |

### 13.2 Forensic reconstruction

The combination of `cmd_routing_log` (every call), `cmd_activity_log` (every guarded operation), `cmd_summaries` (room runs + canonical-source registry), and Git history (rule changes, prompt changes) reconstructs every product-level decision the system has made. Because all four stores are append-only or git-tracked, reconstruction is deterministic.

A specific scenario: "show me every decision made by the StratOS ELT room about pricing in the last 30 days." Query path:

1. `cmd_summaries` WHERE `entity_type='stratos_run'` AND `room='elt'` AND `topic LIKE '%pricing%'` AND `created_at > NOW() - 30d`
2. Join `cmd_routing_log` ON `task_id` to get the cost / outcome
3. Read the linked decision packet for the room's recommendation
4. Cross-check against pricing officer's `cmd_routing_log` rows for the same period

## 14. Verification and Drills

### 14.1 Quarterly officer-roster review

Each quarter, the operator reviews:

1. Are all 24 active officers still relevant? Decommission any drift candidates.
2. Are any prompt-library officers due for activation based on portfolio growth?
3. Has any officer's verdict been flagged as systematically biased (always-PASS or always-BLOCK)?
4. Have any rules been added to `cmd_governance_rules` that should be propagated into officer prompts?

Outcome: a refreshed roster, with prompt edits committed and synced via `sync-officer-prompts.js`.

### 14.2 Quarterly StratOS persona review

Each quarter, the operator reviews:

1. Is the persona roster (50 personas across 5 rooms) still representative?
2. Is `dissent_bias` distribution healthy (at least 3 personas at ≥0.6 in every room)?
3. Are temperature ranges still tuned appropriately?
4. Are any personas drift candidates (always-agreeing, always-disagreeing, off-topic)?

### 14.3 Monthly gate-evidence sweep

Monthly, the operator reviews:

1. For every project in Phase 4 (Ship) the prior month: was the G3 sign-off recorded? If not, why?
2. For every Phase-2-to-Phase-3 transition: was G1 recorded?
3. For projects with `officer_config.gates_disabled=true` operating > 90 days: should gates be enabled now?

Findings are appended to `commandos-center/runbooks/GATE-EVIDENCE-LOG.md` (private).

### 14.4 On-demand officer fire (manual)

Until `ORCH-Officer-Dispatcher` is wired, officer review is operator-fired:

```
node commandos-v2/scripts/fire-officer.js \
  --officer pricing \
  --project linkupos \
  --gate G3 \
  --artifact <path-to-artifact-or-url>
```

The script reads the officer's prompt, calls the model, writes the verdict to `cmd_routing_log`, and prints the result.

## 15. Known Limitations and Residual Risk

| Limitation | Residual risk | Mitigation considered |
|---|---|---|
| Officer review is operator-fired today, not automatic. Until `ORCH-Officer-Gate-Watcher` is wired, gates depend on the operator's discipline. | A human-in-the-loop gate is only as reliable as the human's attention. | Build 11: deploy Gate Watcher + Dispatcher. |
| 50 StratOS personas were prompt-engineered by one operator. Persona quality and dissent-bias calibration is not externally validated. | Persona-set bias. | Phase 3: external review of persona prompts; persona A/B test. |
| AI Accountability Engine (the per-task verifier-claim system specific to product accountability) is designed but not deployed. The general anti-lie engine (LVL9-GOV-001 sibling) is live. | Gap between general anti-lie and product-specific accountability. | Build 11. |
| Voice gate is not enforced in CI. Hits caught only by site-cleaner agent at G3. | An operator could ship copy that violates voice rules if the agent does not run. | Pre-commit hook designed; not deployed. |
| Gate evidence sweep is monthly, not real-time. A missed gate is detected up to 30 days late. | Gate-bypass detection latency. | Acceptable for current scale; tighten if portfolio grows. |
| 24 active officers vs. ~65 prompt-library officers. The gap is intentional (don't activate without need), but if a domain emerges that needs an officer not yet activated, there is a delay. | Coverage gap during portfolio growth. | Quarterly review (§14.1). |
| `cmd_governance_rules` is a flat table; no rule-priority or rule-conflict resolution. | Two rules could nominally contradict; resolved by operator in practice. | Phase 3: add rule_priority column. |
| Officer-prompt drift in the DB (the `cmd_governance_agents.config.prompt_text` row may lag behind the file if `sync-officer-prompts.js` is not run). | Stale prompt at runtime. | Add a CI check that the latest commit's officer files match the DB sync. Open. |

## 16. Vendor Dependency Register

This program depends on the same vendors as LVL9-GOV-001 §14.5 and LVL9-GOV-002 §19. Specific to this layer:

| Vendor | Role here | 24h outage impact | Account-termination impact |
|---|---|---|---|
| Anthropic | Primary officer + persona model | Officers fail closed (cannot review) | Migrate prompts to OpenAI / Gemini; retest dissent calibration |
| Google Drive | Holds StratOS persona role-prompt source documents (`drive_doc_id`) | Personas fail to load full prompt; runs halt | Export Google Docs to `.md` and inline in `room_prompts`; one-time migration |
| Supabase | Holds `cmd_agents`, `cmd_governance_agents`, `cmd_routing_log`, `cmd_governance_rules`, `cmd_summaries` | Agent fleet halts; officer fires fail | Restore from R2 dumps (LVL9-GOV-001 §11.2) |

## 17. Open Governance Issues

Continues numbering from LVL9-GOV-002 (which used GOV-9 through GOV-17). 

| ID | Issue | Status | Owner | Target |
|---|---|---|---|---|
| GOV-18 | `ORCH-Officer-Dispatcher` and `ORCH-Officer-Gate-Watcher` n8n workflows are designed but not deployed. | Open. Build 11. | Eric Hathaway | Build 11 |
| GOV-19 | AI Accountability Engine (cmd_claims-equivalent for product-level accountability beyond anti-lie) is designed but not deployed. | Open. Build 11. | Eric Hathaway | Build 11 |
| GOV-20 | StratOS rooms 2-5 (Innovation, Board, Management, Investor) live build pending. | Open. | Eric Hathaway | Phase 3 |
| GOV-21 | StratOS dissent-bias enforcement is per-persona, not per-run. | Open. Designed: at-least-N high-bias personas required per Innovation / Board run. | Eric Hathaway | Phase 3 |
| GOV-22 | StratOS people-picker UI is in design only. | Open. | Eric Hathaway | Phase 3 |
| GOV-23 | `passesVoiceCheck()` not called post-generation in Humanize. Cross-reference LVL9-GOV-004. | Open. | Eric Hathaway | Near-term |
| GOV-24 | Voice linter not run in CI. | Open. Pre-commit hook designed. | Eric Hathaway | Near-term |
| GOV-25 | No automated check that consumer-site footers consume `attribution.ts`. | Open. Site-cleaner audits manually. | Eric Hathaway | Near-term |
| GOV-26 | No CI gate on n8n workflow creation. New workflows can ship without a pre-existence check. | Open. | Eric Hathaway | Phase 3 |
| GOV-27 | `cmd_governance_rules` lacks rule-priority for conflict resolution. | Open. Designed. | Eric Hathaway | Phase 3 |
| GOV-28 | Officer-prompt sync drift (DB row may lag the file). | Open. Add CI check. | Eric Hathaway | Near-term |

## 18. Glossary

| Term | Definition |
|---|---|
| Active officer | A row in `cmd_governance_agents` with `enabled=true`. |
| Prompt library | The set of `.md` officer prompts under `commandos-v2/officers/`. Larger than the active roster. |
| Officer | An LLM agent reading a prompt from the library, fired against an artifact, returning a verdict. Cannot execute production changes. |
| Gate | A phase-transition checkpoint (G1 plan, G2 mid, G3 ship). |
| Gate sign-off | An officer panel's recorded verdict on a gate fire. PASS / CONCERN / BLOCK. |
| StratOS room | A 10-persona deliberation environment running the 10-stage pipeline. |
| Persona | A row in `room_prompts`. A named voice with background, expertise, dissent_bias, temperature. |
| Dissent bias | The likelihood (0.0-1.0) that a persona pushes back on consensus. High bias is the explicit defense against rubber-stamp consensus. |
| `cmd_routing_log` | The append-only audit log of every agent call. Cross-document with LVL9-GOV-002. |
| `cmd_governance_rules` | The 32-rule operational rulebook in force across the agent fleet. |
| Pre-write audit protocol | The mandatory check, before adding any new workflow / agent / table, that nothing in the canonical registry already does it. |

## 19. Appendix A: File Path Inventory

| Path | Role |
|---|---|
| `commandos-v2/officers/` | Officer prompt library (~65 files) |
| `commandos-v2/officers/_template.md` | Canonical structure for new officer prompts |
| `commandos-v2/migrations/build10-officers.sql` | Active-roster seed (24 officers) |
| `commandos-v2/scripts/sync-officer-prompts.js` | File → DB sync for officer prompts |
| `commandos-v2/scripts/fire-officer.js` | Manual officer-fire CLI (until Dispatcher is live) |
| `commandos-v2/schema-v2.sql` | `cmd_routing_log`, `cmd_budgets` schema |
| `commandos-center/supabase/schema/01-tables.sql` | `cmd_agents` schema |
| `commandos-center/supabase/data/cmd_governance_rules.sql` | 32-rule rulebook seed |
| `commandos-center/supabase/data/room_prompts.sql` | 50-persona StratOS roster seed |
| `level9-brand/procedure/PROJECT-LIFECYCLE.md` | 6-phase lifecycle |
| `level9-brand/procedure/BRAND-CONSISTENCY-CHECKLIST.md` | Pre-ship audit |
| `level9-brand/procedure/DEPLOY-PROCEDURE.md` | Pre / post deploy |
| `level9-brand/procedure/DATA-CLEANUP-PROCEDURE.md` | Data hygiene |
| `level9-brand/policy/COMPANY-CHARTER.md` | Brand values + voice rules |
| `level9-brand/policy/NORTHSTAR.md` | Strategic positioning |
| `level9-brand/policy/COMPLIANCE-EXECUTION-AGENT-PROMPT.md` | Compliance officer system prompt |
| `level9-brand/policy/DECISION-FRAMEWORK.md` | LucidORG decision framework |
| `level9-brand/policy/ALIGNMENT-CYCLE.md` | Periodic alignment cycle |
| `level9-brand/src/content/voiceRules.ts` | Voice gate (cross-reference LVL9-GOV-004) |
| `commandos-v2/CLAUDE.md` lines 176–296 | Pre-write audit protocol |
| `commandos-center/runbooks/GATE-EVIDENCE-LOG.md` | Monthly gate-evidence sweep log (private) |
| `OPERATING-MODEL.md` | Top-level operating model (root of repo) |

---

**Classified Internal · Shareable under NDA · © Eric Hathaway · Effective 2026-05-02**

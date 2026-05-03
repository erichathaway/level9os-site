# Level9 Operational Governance: Executive Summary

| | |
|---|---|
| **Document ID** | LVL9-GOV-EXEC |
| **Version** | 1.0 |
| **Effective Date** | 2026-05-02 |
| **Owner** | Eric Hathaway (erichathaway@gmail.com) |
| **Classification** | Internal. Shareable for review under NDA. |
| **Review Cadence** | Quarterly (rolls up the six chassis docs). |
| **Next Review Due** | 2026-08-02 |
| **Reading time** | 8 minutes |

---

## 1. The one-paragraph version

The Level9 stack runs AI agents at production scale for a single operator. Six governance chassis documents describe how it stays safe, honest, lit-up, well-scoped, well-prompted, and customer-aware. Two are live and proven (Backup & Vault, Anti-Lie Governance). Four are written for this release (Infrastructure & Reliability, Product & Agent Governance, Prompt Architecture, Incident Response, Responsible AI Policy, Data Governance). Together they cover every governance question a serious enterprise reviewer will ask in 2026 — backup, detection, access, change, identity, cost, agent oversight, prompt integrity, AI-specific incident handling, customer rights — and they are explicit about what is built, what is operator-fired, what is designed-not-built, and what is residual risk. Where mainstream references publish trust-center pages with surface-level commitments, this stack publishes the architecture.

## 2. The four buckets

The governance program covers four buckets. Each maps to one or more chassis documents.

### 2.1 Backup & Data

**Question:** Can we recover from data loss, ransomware, accidental deletion, or vendor failure?

**Answer:** Three backup pipelines (daily mirror, 4-hourly Postgres dump, future second offsite). Object Lock compliance mode in Cloudflare R2 (30-day WORM retention). 5-minute row-count tripwire detection. LLM-as-judge access control on the five most-destructive operations. Quarterly restore drills with output captured.

**Chassis doc:** [Backup, Detection & Access Control (LVL9-GOV-001)](backup-and-vault.md)

### 2.2 Lie-Detector

**Question:** When the AI says it's done, how do we know it actually is?

**Answer:** A deterministic verifier system — every "done" claim must register a verifier (Vercel API, GitHub API, Supabase rows, n8n workflow JSON, file system, DB constraints) returning PASS / FAIL / ERROR. No model. No probability. The Stop hook blocks any agent that tries to claim done without registering. The TodoWrite hook catches the "I'll just check the box" failure mode. The OPS-Lie-Watchdog n8n workflow runs hourly.

**Chassis doc:** [Anti-Lie Governance (LVL9-GOV-001 sibling)](anti-lie-report.md)

### 2.3 Infrastructure (Health, Cost, Edge, Identity)

**Question:** What keeps the lights on, at what cost, with what edge protection, with what identity posture?

**Answer:** Two hosts (Mac Mini orchestrator, Synology NAS runtime). One internet-facing surface (Cloudflare Tunnel `lvl9-nas`). Ten Vercel projects on team `decisioning-v1`. ~60 secrets in `cmd_secrets` with rotation tracking. Per-call cost audit in `cmd_routing_log`. Per-scope budget caps in `cmd_budgets` with 75% warn / 90% pause via the Conductor. Five-minute heartbeat detection (CMD-Health-Monitor). Documented restart and recovery procedures. Identity posture: 3 hardware-token (FIDO2) accounts, 6 TOTP, 7 token-only credentials, 1 documented MFA gap (n8n Web UI; mitigated by tunnel ingress).

**Chassis doc:** [Infrastructure & Reliability Governance (LVL9-GOV-002)](infrastructure-and-reliability.md)

### 2.4 Product Governance (StratOS, Officers, Pods)

**Question:** How does the AI fleet decide what to do, and who reviews?

**Answer:** Two-table agent registry split (`cmd_agents` runtime, `cmd_governance_agents` officers). 24 active officers seeded + ~65 in the prompt library. Three gates (G1 plan, G2 mid, G3 ship) with default panels. Officer dispatcher + gate watcher (designed; not yet wired). StratOS strategic layer: 5 deliberation rooms (ELT live), 50 named personas with dissent_bias, 10-stage pipeline. Voice rules enforced at code level (`@level9/brand/content/voiceRules`). Six-phase project lifecycle with build verification gate. 32 governance rules in force. Audit trail through `cmd_routing_log`.

**Chassis doc:** [Product & Agent Governance (LVL9-GOV-003)](product-and-agent-governance.md)

### 2.5 Prompt Architecture (additional bucket)

**Question:** Where do prompts live, how are they versioned, how are they protected from drift and injection?

**Answer:** Three layers. Layer A (in-line): Humanize generation, n8n workflow nodes, LinkUpOS comment generation. Layer B (versioned external library): 65 officer prompts with frontmatter versioning, 50 StratOS personas, agent system prompts, the canonical `voiceRules.ts`. Layer C (governance): voice gate (`passesVoiceCheck()`), prompt-injection defense (instructions in tool results require user verification), officer panel QA at gate fire-time. Sync script mirrors filesystem to runtime DB.

**Chassis doc:** [Prompt Architecture Governance (LVL9-GOV-004)](prompt-architecture-governance.md)

### 2.6 Cross-cutting (Incident Response, Responsible AI, Data Governance)

Three additional documents address concerns that cut across the four buckets:

- **Incident Response Runbook** — Six-phase response procedure (Detect, Triage, Contain, Eradicate, Recover, Lessons-Learned). Four severity tiers. Six tabletop drill scenarios. Includes AI-specific incident classes (Anti-Lie violations, agent-integrity events) that no standard runbook covers as of 2026. [LVL9-GOV-005](incident-response.md)

- **Responsible AI / Acceptable Use Policy** — What the AI is and isn't authorized to do. Hard prohibitions, soft prohibitions, decision-class rules, refusal posture, model-provider disclosure, human-oversight matrix. Mapped to NIST AI RMF, ISO/IEC 42001, OECD AI Principles, EU AI Act general-purpose obligations. [LVL9-GOV-006](responsible-ai-policy.md)

- **Data Governance & Data Flow Map** — Four-class data taxonomy (C-1 Public, C-2 Internal Operational, C-3 Customer Confidential, C-4 Secrets). Top-level data flow map. Vendor sub-processor inventory. Customer rights (access, correction, deletion, portability, restriction, objection). Retention defaults and deletion procedures. Mapped to NIST CSF, ISO/IEC 27001, ISO/IEC 27701, GDPR, CCPA, COPPA. [LVL9-GOV-007](data-governance.md)

## 3. Documents at a glance

| ID | Title | Lines | Status | Sibling chassis |
|---|---|---|---|---|
| LVL9-GOV-001 | Backup, Detection & Access Control | 863 (md) | **Live in production** (v1.4) | All |
| (sibling) | Anti-Lie Governance Report | 677 (md) | **Live in production** (Build 17.10) | LVL9-GOV-001 |
| LVL9-GOV-002 | Infrastructure & Reliability Governance | 898 (md) | Live (this release) | All |
| LVL9-GOV-003 | Product & Agent Governance | 600+ (md) | Live (this release) | All |
| LVL9-GOV-004 | Prompt Architecture Governance | 600+ (md) | Live (this release) | LVL9-GOV-003 |
| LVL9-GOV-005 | Incident Response Runbook | 500+ (md) | Live (this release) | All |
| LVL9-GOV-006 | Responsible AI / Acceptable Use Policy | 400+ (md) | Live (this release) | All |
| LVL9-GOV-007 | Data Governance & Data Flow Map | 600+ (md) | Live (this release) | LVL9-GOV-001 |

Total governance corpus: 8 documents, ~5,000+ lines of source markdown, all linked to concrete artifacts (file paths, DB rows, n8n workflow IDs, vendor configurations). Every claim is verifiable against a primary source.

## 4. Standards alignment matrix

The chassis documents collectively map to the following standards. The reviewer's expectation is that every named control has at least one chassis document discussing it.

| Standard | Section | Chassis doc(s) |
|---|---|---|
| **NIST CSF 2.0 IDENTIFY (ID.AM, ID.RA)** | Asset and risk inventory | LVL9-GOV-001, 002, 007 |
| **NIST CSF 2.0 PROTECT (PR.AC, PR.DS, PR.IP)** | Identity, data protection | LVL9-GOV-001, 002, 007 |
| **NIST CSF 2.0 DETECT (DE.AE, DE.CM, DE.DP)** | Anomalies, monitoring | LVL9-GOV-001, 002 |
| **NIST CSF 2.0 RESPOND (RS.RP, RS.AN, RS.CO)** | Response planning | LVL9-GOV-005 |
| **NIST CSF 2.0 RECOVER (RC.RP, RC.IM)** | Recovery | LVL9-GOV-001, 002, 005 |
| **NIST AI RMF 1.0 GOVERN** | AI policies, roles, risk framework | LVL9-GOV-003, 004, 006 |
| **NIST AI RMF 1.0 MAP** | AI system context | LVL9-GOV-003, 006 |
| **NIST AI RMF 1.0 MEASURE** | Performance assessment | LVL9-GOV-003, 005 |
| **NIST AI RMF 1.0 MANAGE** | Risk treatment | LVL9-GOV-003, 005, 006 |
| **ISO/IEC 27001:2022 A.5.x** | Organizational controls | LVL9-GOV-001, 002, 007 |
| **ISO/IEC 27001:2022 A.8.13** | Information backup | LVL9-GOV-001 |
| **ISO/IEC 27001:2022 A.8.16** | Monitoring activities | LVL9-GOV-001, 002 |
| **ISO/IEC 27001:2022 A.8.32** | Change management | LVL9-GOV-002 |
| **ISO/IEC 27701:2019 (PIMS)** | Privacy Information Management | LVL9-GOV-007 |
| **ISO/IEC 42001:2023 §5.2** | AI policy | LVL9-GOV-006 |
| **ISO/IEC 42001:2023 §6.1** | Risks and opportunities | LVL9-GOV-003, 004, 006 |
| **ISO/IEC 42001:2023 §8.2** | AI operational planning | LVL9-GOV-002, 003, 006 |
| **ISO/IEC 42001:2023 §9.1** | Performance evaluation | LVL9-GOV-003, 006 |
| **SOC 2 TSC CC6.1** | Logical access | LVL9-GOV-001, 002, 007 |
| **SOC 2 TSC CC6.5** | Data classification | LVL9-GOV-007 |
| **SOC 2 TSC CC7.2** | System monitoring | LVL9-GOV-002 |
| **SOC 2 TSC CC7.3** | Anomaly detection | LVL9-GOV-001, 002 |
| **SOC 2 TSC CC8.1** | Change management | LVL9-GOV-002 |
| **SOC 2 TSC CC9.1** | Disruption mitigation | LVL9-GOV-005 |
| **SOC 2 TSC CC9.2** | Vendor management | LVL9-GOV-007 |
| **OWASP LLM Top 10 LLM01** | Prompt Injection | LVL9-GOV-004 |
| **OWASP LLM Top 10 LLM05** | Improper Output Handling | LVL9-GOV-004 |
| **OWASP LLM Top 10 LLM07** | System Prompt Leakage | LVL9-GOV-004 |
| **OWASP LLM Top 10 LLM09** | Misinformation | LVL9-GOV-001 (anti-lie) |
| **OWASP LLM Top 10 LLM10** | Unbounded Resource Consumption | LVL9-GOV-002 (cost caps) |
| **GDPR Art 5 / Art 17 / Art 28 / Art 32** | Privacy principles, erasure, processor, security | LVL9-GOV-007 |
| **CCPA / CPRA** | Consumer rights | LVL9-GOV-007 |
| **COPPA** | Children's privacy (NextGen Interns) | LVL9-GOV-007 |
| **OECD AI Principles** | AI principles | LVL9-GOV-006 |
| **EU AI Act (general-purpose obligations)** | Transparency, risk management | LVL9-GOV-006 |

## 5. The honest open-issues register

The chassis documents collectively track **60+ open governance issues** (GOV-1 through GOV-60). Of these:

- **8 are resolved** (GOV-1, GOV-2 in LVL9-GOV-001 are closed)
- **15 are tracked as Phase 3 / future work** (designed; not built)
- **20+ are tracked as near-term**
- **5 are open by design** at single-operator scale (would close at multi-employee scale)
- The remainder are operator-tracked in advisory roles

The most important open issues by impact:

| ID | Issue | Chassis | Why it matters |
|---|---|---|---|
| GOV-3 | Three Slack webhook URLs marked is_valid=false | LVL9-GOV-001 | Production workflows may fail silently |
| GOV-4 | 1Password service-account token rotation overdue (deadline 2026-04-29) | LVL9-GOV-001 | Compromised credential window |
| GOV-8 | No second offsite for backups (Cloudflare R2 is the only WORM destination) | LVL9-GOV-001 | Single-vendor concentration on the backup layer |
| GOV-9 | Apify API key embedded in 8 n8n workflow node URLs (structural) | LVL9-GOV-002 | Rotation cost; structural fix pending |
| GOV-15 | Pinecone and ElevenLabs flagged exposed 2026-04-22; rotation overdue | LVL9-GOV-002 | Compromised credential window |
| GOV-18 | Officer Dispatcher + Gate Watcher n8n workflows designed but not deployed | LVL9-GOV-003 | Officer review is operator-fired today |
| GOV-23 | passesVoiceCheck() not called post-generation in Humanize | LVL9-GOV-003, 004 | Voice violations could ship if agent doesn't catch |
| GOV-31 | Same as GOV-23 (cross-doc) | LVL9-GOV-004 | Same |
| GOV-35 | No automated detector for instruction-shaped tool-result content | LVL9-GOV-004 | Prompt-injection defense relies on LLM pattern recognition |
| GOV-42 | No designated backup operator with break-glass access | LVL9-GOV-005 | Single-operator response capacity |
| GOV-48 | No formal bias audit at production scale | LVL9-GOV-006 | Bias could ship in customer-facing copy without detection |

Every issue is owned (Eric Hathaway), targeted (Near-term, Phase 3, or Annual review), and tracked. None is ignored or hidden. The volume of open issues is itself a signal: the program is honest about residual risk.

## 6. What is automated vs. operator-fired

A common reviewer question: which controls are mechanical vs. which depend on operator discipline?

| Control | Mechanical | Operator-fired |
|---|---|---|
| Backup pipelines (daily + 4-hourly) | ✓ launchd + cron | Initial setup |
| R2 Object Lock (30-day WORM) | ✓ vendor-side | None |
| Tripwire row-count detection | ✓ 5-min cron | Threshold tuning |
| Conductor budget caps (75% warn / 90% pause) | ✓ runtime-enforced | Budget setting |
| CMD-Health-Monitor heartbeat | ✓ 5-min cron | Threshold tuning |
| Build verification gate (`npm run build`) | ✓ developer-triggered, blocks merge by convention | Operator runs / merges |
| Branch protection on main | ✓ GitHub-enforced | Repo setup |
| Anti-Lie Stop hook | ✓ blocks turn-end on banned-word + no PASS | Hook setup |
| Anti-Lie TodoWrite hook | ✓ blocks completion claims without verifier | Hook setup |
| OPS-Lie-Watchdog (anti-lie hourly sweep) | ✓ n8n cron | Workflow setup |
| Voice rule helpers (`passesVoiceCheck`) | Defined; **not called post-generation in all surfaces** | At gate sign-off (G3) by site-cleaner agent |
| Officer review at gates | Mechanical when Gate Watcher is wired (designed) | Operator-fired today |
| StratOS room runs | ✓ pipeline-mechanical | Operator-fired (room is invoked) |
| Secret rotation | Tracked + alerted (designed) | Operator-executed today |
| Incident Detect → Triage | ✓ alert-driven | Operator triage |
| Incident Contain → Eradicate → Recover | Procedural | Operator-executed |
| Customer-rights deletion | Procedural | Operator-executed |
| Lessons-Learned PIR | None | Operator-mandated within tier window |

The honest summary: detection layers are mechanical; response layers are operator-disciplined. Gate enforcement is mid-build (some mechanical, some operator-fired pending Build 11 wiring of the Officer Dispatcher).

## 7. What this stack does not do

The "what this is NOT" honesty footer, consolidated across the chassis docs.

This program does NOT:

- Cover regulated data classes (HIPAA, PCI-DSS, FedRAMP, GDPR Art 9, GLBA). The stack is not architected for these.
- Cover multi-tenant access governance for ≥ 2 employees. Single-operator design.
- Cover insider-threat or adversarial-employee scenarios. Single-operator scope.
- Cover production-grade scale ( > $10M ARR or > 50 employees). Specific gaps include `pg_dump` rather than `pgBackRest` with WAL archiving, single-vendor LLM judge, no full Infrastructure-as-Code.
- Replace each customer product's own Terms of Service, Privacy Policy, or DPA. Each LLC publishes its own.
- Replace each vendor's attestations. Vendors carry their own SOC 2 / ISO 27001 / DPA. The vendor concentration register notes the dependencies.
- Promise zero residual risk. Residual risk is documented honestly.
- Pretend a control is automated when it is operator-fired.
- Pretend a workflow is deployed when it is designed.

## 8. Novel contribution

A market sweep of published security and operational governance disclosures from 2025 to 2026 found that this stack publishes architectural depth that no other published reference for the solo / small-operator AI-agent segment currently provides. Specifically:

1. **No published reference describes a 3-layer prompt architecture** with explicit gap analysis between in-line and library prompts.
2. **No published reference describes an LLM-as-judge access-control pattern** applied to the five most-destructive operations.
3. **No published reference describes a deterministic anti-lie verifier system** for AI agent honesty (no LLM in court).
4. **No published incident-response runbook treats AI-agent-integrity events as a Tier 1 class.**
5. **No published reference describes a 50-persona deliberation architecture** with named profiles, dissent bias, and a 10-stage pipeline.
6. **No published reference describes a `cmd_routing_log` + `cmd_budgets` enforcement pattern** wired to a routing-time pause threshold.
7. **No solo or near-solo operator publishes operational governance at this depth.**

The stack is therefore a reference architecture for a segment that no other published document currently serves at this level of detail.

## 9. How to verify any claim in any chassis doc

Every claim in the chassis docs is anchored to a primary source. To verify:

| Claim type | How to verify |
|---|---|
| File path | Open the file at the stated path |
| Database schema | Run `\d <table>` in Supabase SQL editor |
| n8n workflow ID | Read the workflow at `https://n8n.lucidorg.com/workflows/{id}` (operator access) |
| Audit row counts | Run the query in the doc's verification section |
| Vendor attestation | Request the vendor's SOC 2 / ISO 27001 / DPA |
| Open Issue status | Query `cmd_governance_issues` (when migrated) or read the doc's table |
| Standards alignment | Cross-reference §4 of this summary against the chassis doc's §5.3 (Standards Alignment) |

A reviewer can read this summary, follow links into chassis docs, and verify any claim against a primary source. No claim is "trust me."

## 10. The bottom line for a COO

If you are a COO evaluating this stack:

- **Continuity:** Three backup pipelines. WORM compliance mode. Quarterly drills. Documented recovery procedures. RTO 4-12 hours. RPO 4 hours.
- **Cost control:** Per-call cost audit. Per-scope budget caps with mechanical pause at 90%. Quarterly cost-driver review.
- **Agent oversight:** 24 active officers. 3 gates. Voice rules at code level. Anti-Lie verifiers. Single-operator override authority documented.
- **Customer trust:** Four-class data taxonomy. Per-customer RLS. Customer rights (access, correction, deletion, portability). Vendor sub-processor inventory.
- **Incident readiness:** Six-phase response. Four severity tiers. Six tabletop scenarios. Mandatory PIR within 7 days for SEV-1.
- **Honest residual risk:** 60+ open governance issues, all owned, all targeted. No theater.

This is the operating posture. Each chassis document is the proof.

---

**Classified Internal · Shareable for review under NDA · © Eric Hathaway · Effective 2026-05-02**

**Next review: 2026-08-02**

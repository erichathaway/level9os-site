# Level9 Operational Governance: Data Governance & Data Flow Map

| | |
|---|---|
| **Document ID** | LVL9-GOV-007 |
| **Version** | 1.0 |
| **Effective Date** | 2026-05-02 |
| **Owner** | Eric Hathaway (erichathaway@gmail.com) |
| **Classification** | Internal. May be shared with reviewers, auditors, partners, and customers under NDA. |
| **Review Cadence** | Annually, plus on every material change to data classes or vendor data-residency. |
| **Next Review Due** | 2027-05-02 |
| **Sibling chassis** | LVL9-GOV-001 (Backup & Access), LVL9-GOV-002 (Infrastructure & Reliability), LVL9-GOV-006 (Responsible AI Policy). |
| **Operating LLCs covered** | Level9OS LLC, LucidORG LLC, NextGen Interns LLC, Eric Hathaway (individual). |

---

## 1. Purpose

This document is the data-governance policy for the Level9 stack. It states what data the system handles, how it is classified, where it lives, who can read it, how long it is kept, and how it is destroyed.

A data-governance document is the artifact that turns "we operate AI products" into "we know what data those products touch." Every serious enterprise reviewer asks for one. ISO/IEC 27701 expects it. NIST CSF 2.0 PR.DS expects it. SOC 2 CC1.4 / CC6.5 / CC6.7 expect it.

This document is the answer.

## 2. Scope

**In scope:**

| Class | Examples |
|---|---|
| Operator-side operational data | `cmd_*` tables, n8n workflow definitions, agent runtime state, secret metadata |
| Customer-product data | LinkUpOS voice profiles, signal data, comments; NextGen Interns student profiles; COO Playbook accountability records |
| Brand and content data | Marketing copy, blog posts, generated content, brand assets |
| Audit and decision data | `cmd_routing_log`, `cmd_activity_log`, `cmd_summaries`, `cmd_law_violations` |
| Backup data | R2 nightly snapshots, n8n Postgres dumps, manifest files |
| Vendor-side data (in transit and at rest with vendors) | Anthropic API request bodies, OpenAI requests, Vercel deployment artifacts, GitHub repo contents |

**Out of scope:**

- Operator's personal data (personal email, calendar, photos). Personal data on personal accounts is governed individually.
- Vendor-internal infrastructure data (Cloudflare Workers internals, Supabase server-side metadata). Vendors govern their own.
- Customer data on third-party platforms the operator does not control (e.g. a customer's LinkedIn account, a customer's Stripe account). Each is governed by the third-party.

## 3. Roles and Responsibilities

| Role | Held by | Responsibilities |
|---|---|---|
| Data Controller (per LLC) | The respective LLC, operated by Eric Hathaway | Final authority on data lifecycle, retention, deletion, customer rights. |
| Data Custodian | Eric Hathaway | Day-to-day operation: secret handling, backup execution, access reviews. |
| Data Processor (vendors) | Cloudflare, Supabase, Vercel, Anthropic, OpenAI, Apify, Stripe, etc. | Each vendor processes specific data classes. Vendor-specific privacy policies govern. |
| Reviewer (external, on demand) | Reviewer under NDA | Verifies controls match this document. |

## 4. Data Classes

### 4.1 The four classes

| Class | Definition | Examples | Default location |
|---|---|---|---|
| **C-1: Public** | Data already public; no restriction | Brand logos, marketing copy, public blog posts | Vercel hosting, GitHub public repos |
| **C-2: Internal Operational** | Operator-internal data; no third-party access | `cmd_routing_log`, `cmd_activity_log`, n8n workflow definitions, secret metadata, governance rules | Supabase (RLS-locked), NAS Postgres, GitHub private repos |
| **C-3: Customer Confidential** | Customer's data, regulated by customer trust | LinkUpOS voice profiles, signal data, NextGen Interns student profiles, COO Playbook accountability records | Supabase (RLS-locked, per-customer scoped) |
| **C-4: Secrets** | Credentials, tokens, keys | Items in `cmd_secrets`, 1Password vault | Supabase (RLS-locked, service-role only) + 1Password (authoritative) |

### 4.2 Class controls summary

| Class | Encryption at rest | Encryption in transit | Access | Retention default | Deletion |
|---|---|---|---|---|---|
| C-1 (Public) | Vendor default | TLS | Public | Indefinite | On request |
| C-2 (Internal Operational) | Vendor default + Postgres password file (n8n) | TLS + tunnel | Operator-only via service-role + RLS-locked anon | Indefinite | Per Section 9 |
| C-3 (Customer Confidential) | Vendor default + per-customer RLS | TLS | Per-customer scoping; operator break-glass | Per product policy (typically 12-24 months active; archived per customer agreement) | Per product policy + customer-deletion rights |
| C-4 (Secrets) | Encrypted at rest (1Password + Supabase + per-secret file mode 600) | TLS | Service-role only; RLS-locked from anon | Until rotated or deprecated; metadata indefinite, value never re-derivable | On rotation, old value invalidated; never recoverable |

## 5. Data Flow Map

### 5.1 Top-level flow

```
                        ┌─────────────────────────────────────────────┐
                        │                EDGE LAYER                   │
                        │                                             │
                        │   Browser / Customer / Operator             │
                        │       │                                     │
                        │       ▼                                     │
                        │   Cloudflare (DNS + CDN + WAF)              │
                        │       │                                     │
                        │       ▼                                     │
                        │   Vercel (consumer sites)                   │
                        │       │                                     │
                        │       ▼                                     │
                        │   Cloudflare Tunnel (n8n, guard)            │
                        └───────┬─────────────────────────────────────┘
                                │
                                ▼
              ┌──────────────────────────────────────────────────┐
              │                APPLICATION LAYER                  │
              │                                                   │
              │   Vercel-hosted sites      n8n workflows          │
              │   (LinkUpOS, COO Playbook, (engagement scrape,    │
              │    NextGen Interns, etc.)   comment generation,   │
              │       │                     daily briefings)      │
              │       │                          │                │
              │       └──────────┬───────────────┘                │
              │                  │                                 │
              │                  ▼                                 │
              └──────────────────┬───────────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────────────────────┐
              │                  DATA LAYER                       │
              │                                                   │
              │   Supabase Postgres            n8n Postgres        │
              │   ├── cmd_* tables             ├── workflow defs   │
              │   │    (C-2 Internal)          ├── execution log   │
              │   ├── product tables           └── encrypted creds │
              │   │    (C-3 Customer)               (C-2)          │
              │   └── cmd_secrets                                  │
              │        (C-4 Secrets, RLS)                          │
              │                                                    │
              │            ┌──────────────────────────┐            │
              │            │   1Password (C-4)        │            │
              │            │   Authoritative secret    │            │
              │            │   store                   │            │
              │            └──────────────────────────┘            │
              └────────────────────┬─────────────────────────────┘
                                   │
                                   ▼
              ┌──────────────────────────────────────────────────┐
              │                BACKUP LAYER                       │
              │                                                   │
              │   Cloudflare R2                                   │
              │   Bucket: <backups-bucket> (Object Lock,          │
              │   compliance mode, 30-day retention)              │
              │                                                   │
              │   Mac Mini (commandos-center)                     │
              │   Daily at 03:00 local                            │
              │   Includes: Supabase tables, n8n workflows,       │
              │             brand assets, Notion KB, manifests    │
              │                                                   │
              │   NAS (n8n-postgres dumps)                        │
              │   Every 4h: 00:00, 04:00, 08:00, 12:00, 16:00,    │
              │             20:00 local                            │
              └──────────────────────────────────────────────────┘
```

### 5.2 LLM provider dataflow (agent calls)

```
   Agent (Claude Code / n8n / officer)
       │
       │ Prompt + context (operator-controlled)
       ▼
   Anthropic API / OpenAI API / Perplexity API
       │
       │ Response
       ▼
   Agent
       │
       │ Audit row
       ▼
   cmd_routing_log (C-2)
       └─→ task_id, agent_id, task_type, model_provider, model_name,
           input_tokens, output_tokens, cost_estimate_usd, outcome,
           created_at

   NOTE: Customer-facing AI features (LinkUpOS comment generation,
         OutboundOS prospect research, COO Playbook checks) embed
         customer data (C-3) in the prompt context. Vendor-side
         processing of that data is governed by the vendor's
         enterprise / no-training agreement (see §10).
```

### 5.3 Customer-product dataflow (LinkUpOS as example)

```
   Customer's LinkedIn account
       │
       │ Read via Unipile (vendor authorized)
       ▼
   n8n workflow: scrape signals
       │
       │ Write to Supabase (RLS-scoped to customer)
       ▼
   Supabase: linkupos_signals (C-3)
       │
       │ Read by comment generation pipeline
       ▼
   n8n workflow: comment generation
       │
       │ Prompt to Anthropic (customer data in prompt)
       ▼
   Anthropic API
       │
       │ Generated comment
       ▼
   Customer review / approval (operator-fired today)
       │
       │ Comment posted via Unipile
       ▼
   LinkedIn (customer's post)

   NOTE: Vendor-side LLM processing of customer data is governed by
         Anthropic's "no training" tier; cross-reference §10.
```

## 6. Data Inventory

The complete operational-data inventory. Each row is a data domain; the C-class governs its handling.

| Domain | Table / Location | Class | Owner LLC | Vendor (primary) |
|---|---|---|---|---|
| `cmd_agents` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_governance_agents` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_routing_log` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_activity_log` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_summaries` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_governance_rules` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_budgets` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_law_violations` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_claims`, `cmd_verifications` | Supabase | C-2 | Level9OS LLC | Supabase |
| `cmd_secrets` | Supabase (RLS-locked) | C-4 | Level9OS LLC | Supabase + 1Password |
| `room_prompts` (StratOS) | Supabase | C-2 | LucidORG LLC (StratOS) | Supabase |
| `linkupos_signals` and product tables | Supabase | C-3 | LucidORG LLC | Supabase |
| `coo_playbook_*` product tables | Supabase | C-3 | LucidORG LLC | Supabase |
| `nextgenintern_*` product tables | Supabase | C-3 | NextGen Interns LLC | Supabase |
| n8n workflow definitions | NAS Postgres | C-2 | Level9OS LLC | NAS (operator-controlled) |
| n8n execution history (30-day retention) | NAS Postgres | C-2 | Level9OS LLC | NAS |
| n8n encrypted credentials | NAS Postgres | C-4 | Level9OS LLC | NAS |
| `@level9/brand` package source | GitHub (public repo) | C-1 | Level9OS LLC | GitHub |
| `commandos-center` source | GitHub (private repo) | C-2 | Level9OS LLC | GitHub |
| `commandos-v2` source | GitHub (private repo) | C-2 | Level9OS LLC | GitHub |
| Consumer site source (level9os-site, etc.) | GitHub (mostly public) | C-1 / C-2 | Per LLC (per attribution.ts) | GitHub |
| Notion knowledge base | Notion | C-2 | Level9OS LLC | Notion |
| Backups (R2) | Cloudflare R2 (Object Lock) | Mirror of source class | Level9OS LLC | Cloudflare R2 |
| Email infrastructure | Google Workspace + AWS SES | Mixed | Per business need | Google + AWS |
| Vercel deploys / build artifacts | Vercel | Mirror of source class | Per LLC | Vercel |

## 7. Data at Rest

### 7.1 Supabase (most C-2, all C-3, C-4 metadata)

- Vendor-managed encryption at rest (AES-256, vendor-default).
- RLS policies enforce per-table access. `cmd_secrets` is service-role only; anon cannot read. C-3 product tables are per-customer scoped.
- Daily backup to R2 via `commandos-center/scripts/upload-to-r2.sh`. Cross-reference LVL9-GOV-001 §7.

### 7.2 NAS Postgres (C-2 workflow defs, C-4 encrypted credentials)

- Filesystem-level encryption (Synology Btrfs, vendor-default).
- Postgres password file at `/volume1/docker/.n8n-postgres-password`, mode 600.
- n8n encryption key at `/volume1/docker/.n8n/config`, mode 600. **Never rotated** (rotation invalidates every encrypted credential; cross-reference LVL9-GOV-002 §7.2).
- 4-hourly pg_dump to R2. Cross-reference LVL9-GOV-001 §7.3.

### 7.3 GitHub (C-1 public; C-2 private)

- Vendor-managed encryption at rest.
- Branch protection on `main` for all repos (cross-reference LVL9-GOV-002 §14.3).
- Public repos contain no C-3 or C-4 data; the placeholder convention (`<runtime-host>`, etc.) protects sensitive values.

### 7.4 Cloudflare R2 (mirror of source class)

- Vendor-managed encryption at rest.
- Object Lock in compliance mode, 30-day retention. Even the account owner cannot bypass. Cross-reference LVL9-GOV-001 §7.4.

### 7.5 Vercel (mirror of source class; build artifacts)

- Vendor-managed encryption at rest.
- Build artifacts retain for vendor-default window.
- No C-4 data ever in Vercel build artifacts (`cmd_secrets` and 1Password are the C-4 paths).

### 7.6 1Password (C-4 authoritative)

- Vendor-managed encryption at rest with operator-derived master key + Secret Key.
- The authoritative store. `cmd_secrets` mirrors metadata + the live operational copy of values; 1Password is the recovery-of-last-resort.

### 7.7 Notion (C-2 knowledge base)

- Vendor-managed encryption at rest.
- Daily snapshot to R2 via Notion API export. Cross-reference LVL9-GOV-001 §7.

## 8. Data in Transit

### 8.1 All vendor traffic

TLS 1.2 minimum; TLS 1.3 where supported. No vendor traffic over plain HTTP.

### 8.2 Operator → NAS

SSH key-only, password disabled, custom port, behind Cloudflare Tunnel. Cross-reference LVL9-GOV-002 §15.

### 8.3 Edge → NAS (n8n, guard)

Cloudflare Tunnel `lvl9-nas` only. No public ingress to NAS hosts. Cross-reference LVL9-GOV-002 §8.1.

### 8.4 Application → Supabase

Service-role calls authenticated with service-role JWT (server-side only). Anon calls authenticated with anon JWT. RLS enforced on every query.

### 8.5 Application → LLM provider

TLS-protected. The prompt body MAY include C-3 customer data (per §5.2). Vendor enterprise / no-training tier covers this; cross-reference §10.

## 9. Data Retention and Deletion

### 9.1 Retention defaults by class

| Class | Active retention | Archive | Deletion event |
|---|---|---|---|
| C-1 Public | Indefinite | Indefinite | On request |
| C-2 Internal Operational | Indefinite (audit), per-table for ephemeral | Per data-domain | Per-domain |
| C-3 Customer Confidential | Per product policy + customer agreement | Per agreement | Customer right + product policy |
| C-4 Secrets | Until rotation; metadata indefinite, value never re-derivable | N/A | On rotation |

### 9.2 Customer-data retention by product

| Product | Active data | Retention | Customer deletion |
|---|---|---|---|
| LinkUpOS | Voice profile, signal data, comments | 24 months active; archived per agreement | Customer-requested via support; 30-day execution window |
| COO Playbook | Accountability records, deliverable artifacts | Per engagement; default 24 months | Customer-requested; 30-day execution |
| OutboundOS | Prospect research, campaign records | 24 months active | Customer-requested; 30-day execution |
| StratOS | Decision packets, room run logs | Per engagement; default 12 months | Customer-requested; 30-day execution |
| LucidORG.com | Operator-side analytics | 12 months | Per platform |
| NextGen Interns | Student profiles, learning records | Per agreement; COPPA-aware for minors | Per platform; parent-requested for minors |

### 9.3 Operational-data retention

| Domain | Retention |
|---|---|
| `cmd_routing_log` | Indefinite (audit) |
| `cmd_activity_log` | Indefinite (audit) |
| `cmd_summaries` | Indefinite (audit) |
| `cmd_law_violations` | Indefinite (until resolved + 90 days) |
| `cmd_governance_rules` | Indefinite (versioned via git) |
| n8n execution history | 30 days (vendor default; configurable) |
| Vercel build logs | 90 days (vendor default) |
| Cloudflare audit logs | Per Cloudflare tier (typically 30-90 days) |
| Backup tarballs in R2 | 30-day Object Lock + indefinite at-rest in bucket |
| Backup index manifests | Indefinite |

### 9.4 Deletion procedures

| Class | Procedure |
|---|---|
| C-1 (Public) | Soft-delete the URL / remove from publish surface. Mirror remains in git history. |
| C-2 (Internal Operational) | Per-domain. Audit data is append-only; deletion is operational data only (e.g. truncate stale `cmd_agents` rows). Audit retention is preserved. |
| C-3 (Customer Confidential) | Customer-deletion request → operator validates the request → soft-delete + 30-day cooling period → hard-delete + R2 anonymization. Customer is notified at start and completion. |
| C-4 (Secrets) | Rotation: new key issued, `cmd_secrets.is_valid=true` for new, `is_valid=false` for old. Old key revoked at vendor. Old key never re-derivable. |

### 9.5 Right to be forgotten

The operator does not currently process EU residents at scale. If a customer asserts a right-to-be-forgotten under GDPR Art 17, the deletion procedure in §9.4 applies; the operator coordinates with the customer for the per-product execution.

## 10. Vendor Data Processing

### 10.1 Vendor inventory

| Vendor | Class processed | Vendor terms cross-reference | Sub-processor list |
|---|---|---|---|
| Supabase | C-2, C-3, C-4 metadata | Supabase Privacy Policy + DPA available | AWS (infra); Stripe (billing) |
| Cloudflare | C-1, C-2, C-4 (R2 backups encrypted at rest) | Cloudflare Privacy Policy + DPA available | None disclosed |
| Vercel | C-1, C-2 (build artifacts) | Vercel Privacy Policy + DPA available | AWS (infra); Stripe (billing) |
| GitHub | C-1, C-2 | GitHub Privacy Statement + DPA available | Microsoft Azure (infra) |
| Anthropic | C-2, C-3 (prompts may include customer data) | Anthropic Usage Policy + Privacy Policy + Commercial Terms (no training tier) | AWS (infra) |
| OpenAI | C-2, C-3 (prompts may include customer data) | OpenAI Privacy Policy + DPA + Enterprise Terms (no training tier) | Microsoft Azure (infra) |
| Perplexity | C-2 (research queries) | Perplexity Terms + Privacy Policy | Various search providers |
| Apify | C-2, C-3 (scraped content) | Apify Privacy + DPA available | Cloud providers |
| Stripe | C-3 (customer payment metadata; never card numbers in our systems) | Stripe Privacy + DPA available | Various payment processors |
| Notion | C-2 (knowledge base) | Notion Privacy Policy + DPA | AWS (infra) |
| Google Workspace | C-2, operator personal | Google Workspace Privacy + DPA | Various |
| AWS SES | C-2 (transactional email) | AWS Privacy + DPA | AWS sub-processors |
| 1Password | C-4 (authoritative secrets) | 1Password Privacy + Trust Center | None |
| Synology | C-2 (NAS host) | Synology Privacy Policy | None disclosed |
| Slack | C-2 (alerts) | Slack Privacy Policy + DPA | Various |
| Buffer | C-2 (publish queue) | Buffer Privacy Policy | Various |
| Apollo | C-2 (prospect data) | Apollo Privacy Policy | Various |
| LinkedIn (via Unipile) | C-3 (customer LinkedIn data, with customer consent) | Unipile DPA + LinkedIn Terms | Unipile sub-processors |
| ElevenLabs | C-3 if voice generation in scope | ElevenLabs Privacy + Terms | Various |
| Pinecone | C-2, C-3 (embeddings if used) | Pinecone Privacy + DPA | AWS / GCP |

### 10.2 Vendor-side LLM data handling

Specifically: when prompts include customer C-3 data, the operator uses each provider's "no training" / "zero-retention" / "enterprise" tier where available. Specifically:

- **Anthropic** Commercial Terms: customer prompts are not used for training under the Commercial agreement.
- **OpenAI** Enterprise / API terms: API data is not used for training by default.
- **Perplexity**: research queries; non-customer-personal data flows here.

The operator does not opt customer data into training in any vendor.

### 10.3 Sub-processor change disclosure

The operator tracks vendor sub-processor changes via the vendor's published sub-processor list (where available) and notifies customers if a material sub-processor change affects their data class. Cadence is per-vendor; baseline is annual operator review.

## 11. Customer Rights

### 11.1 Rights provided

The operator provides the following rights for C-3 customer data:

| Right | Process |
|---|---|
| **Access** | Customer requests their data via support → operator provides export within 30 days |
| **Correction** | Customer requests correction via support → operator updates within 14 days |
| **Deletion** | Per §9.4, customer-requested deletion within 30 days |
| **Portability** | Export in machine-readable format (JSON, CSV) on access request |
| **Restriction** | Customer requests pause on processing → operator pauses within 7 days |
| **Objection** | Customer objects to a specific processing → operator evaluates and responds within 14 days |

### 11.2 Where these rights are published

Each LLC's product publishes these rights in its privacy policy:

- LucidORG LLC: lucidorg.com/privacy + per-product
- NextGen Interns LLC: thenextgenintern.com/privacy
- Level9OS LLC: level9os.com/privacy
- Eric Hathaway personal: erichathaway.com/privacy

The legal pages source from `@level9/brand/legal/<llc>/`.

### 11.3 Children and minors

NextGen Interns LLC is the only LLC with audiences that may include minors. NextGen Interns operates under COPPA-aware practices: no facial-image collection, no biometric data, age-gating at signup, parent-requested deletion. Cross-reference LVL9-GOV-006 §7.2.

## 12. Data Localization

### 12.1 Current posture

The operator does not currently offer data-residency commitments. Vendor-side data residency follows each vendor's defaults:

- Supabase: vendor-default region (operator-selected at project creation; current default is US-East)
- Cloudflare R2: ENAM (Eastern North America) for the backups bucket
- Vercel: edge network is global; build artifacts in vendor-default
- Anthropic / OpenAI: vendor-default

If a customer requires region-specific residency (EU, APAC), the operator scopes a custom Supabase project in that region; this is operator-scoped per engagement, not standard.

### 12.2 EU data subjects

The operator does not currently target EU customers. If an EU customer is onboarded, the operator coordinates GDPR Art 17 (right to be forgotten), Art 32 (security), and Art 28 (processor) compliance per engagement. Vendor DPAs cover the processor side.

## 13. Audit and Monitoring

### 13.1 What is audited (cross-reference LVL9-GOV-001 §13, LVL9-GOV-002 §17)

- Every read and write of `cmd_secrets` (anon vs service-role)
- Every Tier 1 destructive operation (guard-mediated)
- Every routing call (`cmd_routing_log`)
- Every backup run (`cmd_activity_log` + R2 manifest)
- Every officer review (`cmd_routing_log`)
- Every customer-data deletion request (operator-tracked in `commandos-center/runbooks/data-rights-log.md`)

### 13.2 Privacy-specific audit log

Customer-rights requests are tracked at `commandos-center/runbooks/data-rights-log.md` (private):

| Field | Purpose |
|---|---|
| Request received date | When operator was notified |
| Customer | Identifier |
| Right requested | Access / Correction / Deletion / etc. |
| Validation status | How the customer's identity was verified |
| Action taken | Specifically what was done |
| Completion date | When the action completed |
| Cross-reference | Any relevant tickets, support emails, journal entries |

## 14. Known Limitations and Residual Risk

| Limitation | Residual risk | Mitigation considered |
|---|---|---|
| Single-region default for Supabase, R2, Vercel | A regional outage at the primary region affects all customers in that region. | Phase 3: cross-region replication for the most-critical C-3 data classes. |
| No formal DPIA (Data Protection Impact Assessment) for any product. | A reviewer expecting a DPIA finds none. | Annual review (this document) + DPIA at next material product change. |
| Vendor sub-processor changes are tracked annually, not real-time. | A material sub-processor change between annual reviews is detected late. | Phase 3: subscribe to vendor sub-processor change feeds. |
| Customer C-3 data flows through LLM providers under their "no training" tier. The operator has not independently audited each vendor's compliance with their tier. | Reliance on vendor attestations. | Vendor DPAs / SOC 2 / ISO 27001 attestations are read at annual review. |
| No automated PII detector at the boundary between C-2 and C-3 (e.g. if a customer accidentally pastes PII into a free-text C-2 field). | Misclassification at the input boundary. | Phase 3: a PII scanner at customer-input boundaries. |
| Right-to-be-forgotten execution requires 30-day cooling period; backups in R2 retain for the Object Lock window (30 days minimum). | A deleted customer's data persists in immutable backup for the lock window. | Documented in privacy policies; lock window aligned at 30 days for this reason. |
| Data localization for EU subjects is not standard; per-engagement scoping. | A customer expecting EU residency by default finds it is not. | Phase 3: standard EU-residency project template if pipeline grows. |

## 15. Open Governance Issues

Continues numbering from LVL9-GOV-006 (which used GOV-48 through GOV-53).

| ID | Issue | Status | Owner | Target |
|---|---|---|---|---|
| GOV-54 | No formal DPIA for any product. | Open. Annual review. | Eric Hathaway | At next material product change |
| GOV-55 | Vendor sub-processor changes tracked annually, not real-time. | Open. Phase 3. | Eric Hathaway | Phase 3 |
| GOV-56 | Customer C-3 LLM-provider compliance with no-training tier not independently audited. | Open. Read vendor attestations annually. | Eric Hathaway | Annual |
| GOV-57 | No automated PII detector at C-2 / C-3 boundary. | Open. Phase 3. | Eric Hathaway | Phase 3 |
| GOV-58 | Standard EU-residency project template not defined. | Open. Phase 3 (when pipeline justifies). | Eric Hathaway | Phase 3 |
| GOV-59 | Data-rights audit log (`data-rights-log.md`) is private; no customer-facing transparency dashboard. | Open. Phase 3 product feature. | Eric Hathaway | Phase 3 |
| GOV-60 | No automatic check that customer-deletion request triggered hard-delete in the R2 backup window. | Open. Operator manually verifies. | Eric Hathaway | Phase 3 |

## 16. Glossary

| Term | Definition |
|---|---|
| Data Controller | The legal entity (LLC) that determines purposes and means of processing. |
| Data Custodian | The role responsible for day-to-day handling. Currently the operator. |
| Data Processor | A vendor that processes data on the operator's behalf. |
| Class (C-1 to C-4) | The four-tier classification. |
| RLS | Row-level security. Supabase-enforced per-row access control. |
| Object Lock | Cloudflare R2 / AWS S3 feature that prevents deletion of an object until a retention period expires. Cross-reference LVL9-GOV-001 §7.4. |
| WORM | Write Once, Read Many. The semantics provided by Object Lock in compliance mode. |
| Sub-processor | A vendor's vendor; e.g. Supabase uses AWS as a sub-processor. |
| DPA | Data Processing Addendum. The contract between the operator and a vendor. |
| DPIA | Data Protection Impact Assessment. A formal pre-launch privacy review. |
| Right to be forgotten | GDPR Art 17. The right of a data subject to have personal data erased. |
| No-training tier | A vendor commitment that the operator's data is not used to train the vendor's models. |

## 17. Appendix A: Mapping to Industry Standards

| Standard | Section / Control | Where this document addresses it |
|---|---|---|
| NIST CSF 2.0 PR.DS | Data Security | §4 (classification), §7 (rest), §8 (transit), §9 (retention) |
| NIST CSF 2.0 PR.IP | Information Protection Processes | §4 (classification), §11 (rights) |
| NIST CSF 2.0 RS.MI | Mitigation | §13 (audit), cross-reference LVL9-GOV-005 |
| NIST CSF 2.0 RC.RP | Recovery Planning | Cross-reference LVL9-GOV-001 §11 |
| ISO/IEC 27001:2022 A.5.34 | Privacy and protection of PII | §11 (rights), §12 (localization) |
| ISO/IEC 27001:2022 A.5.36 | Compliance with policies, rules, and standards | §17 (this matrix) |
| ISO/IEC 27001:2022 A.8.10 | Information deletion | §9.4 |
| ISO/IEC 27001:2022 A.8.11 | Data masking | §11 (placeholder convention cross-reference) |
| ISO/IEC 27001:2022 A.8.12 | Data leakage prevention | §13 |
| ISO/IEC 27001:2022 A.8.13 | Information backup | Cross-reference LVL9-GOV-001 |
| ISO/IEC 27701:2019 (PIMS) | Privacy Information Management System | This entire document |
| GDPR Art 5 | Principles | §3 (cross-reference LVL9-GOV-006), §9 |
| GDPR Art 17 | Right to erasure | §11.1 (deletion right) |
| GDPR Art 28 | Processor obligations | §10 (vendor inventory + DPAs) |
| GDPR Art 32 | Security of processing | §7, §8 |
| CCPA / CPRA | Consumer rights | §11 (rights) |
| COPPA | Children's privacy | §11.3 (NextGen Interns) |
| SOC 2 TSC CC1.4 | Risk assessment | §14, §15 |
| SOC 2 TSC CC6.1 | Logical access | §7 (RLS), §10 (DPA inventory) |
| SOC 2 TSC CC6.5 | Data classification | §4 |
| SOC 2 TSC CC6.7 | Data transmission | §8 |
| SOC 2 TSC CC9.2 | Vendor management | §10 |

---

**Classified Internal · Shareable under NDA · © Eric Hathaway · Effective 2026-05-02**

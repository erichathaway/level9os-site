# Level9 Operational Governance: Infrastructure & Reliability

| | |
|---|---|
| **Document ID** | LVL9-GOV-002 |
| **Version** | 1.0 |
| **Effective Date** | 2026-05-02 |
| **Owner** | Eric Hathaway (erichathaway@gmail.com) |
| **Classification** | Internal. May be shared with reviewers, auditors, and underwriters under NDA. |
| **Review Cadence** | Quarterly, plus on every material change to runtime topology. |
| **Next Review Due** | 2026-08-02 |
| **Sibling chassis** | LVL9-GOV-001 (Backup, Detection & Access Control). This document covers the layer underneath the data-integrity controls described there. |
| **Reading this document** | Placeholder labels in angle brackets (e.g. `<runtime-host>`, `<orchestrator-host>`, `<cf-tunnel-id>`) replace operationally sensitive values for external publication. Operators with access to the private commandos-center repo can resolve every placeholder via `runbooks/OPERATIONS-MAP.md`. |

---

## 1. Purpose and Audience

This document describes the operational governance program protecting the Level9 stack from runtime failure, edge compromise, runaway cost, secret leakage, unsafe change, and ungoverned identity. It covers compute, network, hosting, secrets, budget, health detection, restart and recovery, change and release, and identity and access.

Where LVL9-GOV-001 protects the data, this document protects the system that runs on top of it. The two are designed to be read together.

**Intended readers:**

1. **The owner-operator** running the stack day to day. Should be able to follow the restart and recovery procedures in Section 13 with no other context.
2. **A governance, security, or compliance officer** evaluating the operational maturity of the program. Should be able to verify every claim against a primary source (file path, schema row, audit row).
3. **A new technical hire** taking over operations. Should be able to onboard from this document plus LVL9-GOV-001 and the linked runbooks.
4. **An external reviewer** in a due-diligence, audit, or insurance context. Should find concrete controls, evidence, and a clear honest statement of residual risk.

**What this document is not** (high-level. Full out-of-scope register in Section 2.3):

- A complete information security policy. It addresses operational continuity for the operator's primary infrastructure. Application-layer security (e.g. customer authentication on linkupos.com) is out of scope.
- A vendor risk assessment. Vendors (Cloudflare, Vercel, Anthropic, OpenAI, Synology, Supabase, GitHub) carry their own attestations.

### Novel contribution

A market sweep of published infrastructure-governance disclosures from 2025 to 2026 found three observations relevant to this document:

1. **No solo or near-solo AI-agent operator publishes a unified infrastructure governance disclosure that simultaneously covers compute, edge, secrets, budget enforcement, and identity at this depth.** Reference points (Plausible, Tailscale, PostHog, Linear, Sourcegraph, Vercel itself) publish trust-center pages that focus on application security and SOC 2 status. None publish a per-secret rotation register, a per-call cost-tracking schema, an LLM-budget enforcement hook, and an MFA inventory in one document.
2. **No published infrastructure-governance reference exists for a Postgres-backed n8n stack.** n8n.io's own documentation describes Postgres as a configuration option but not as a governance surface. Treating n8n's runtime database as a Tier 1 asset with its own backup, dump cadence, encryption-at-rest, and credential-key separation is, as of this writing, unpublished as a reference architecture.
3. **No published reference describes a per-task, per-agent, per-provider cost-tracking schema (`cmd_routing_log` + `cmd_budgets`) wired to a routing-time enforcement layer (Conductor) for an LLM agent fleet.** AI-cost tooling vendors (Helicone, Langfuse, OpenLLMetry) publish observability-side patterns. The enforcement-side pattern, with hard pause thresholds at 75% / 90% of a per-scope budget read by the routing layer at decision time, is unpublished as a production architecture for a single-operator stack.

This document is therefore intended both as operational guidance for the owner-operator and as a reference architecture for the segment that no other published document currently serves at this level of detail.

## 2. Scope

**In scope (assets and controls this program protects):**

| Asset / Control | Layer | Source of truth |
|---|---|---|
| n8n container (port 7842) on NAS | Compute runtime | `commandos-v2/docker/docker-compose.yml` |
| n8n Postgres (NAS, container) | Stateful runtime | `commandos-v2/docker/docker-compose.yml`, `cmd_secrets` rows for `n8n/postgres_*` |
| Mac Mini orchestrator launcher | Compute runtime | `commandos-center/launchd/*.plist` |
| Cloudflare Tunnel `lvl9-nas` (n8n.lucidorg.com, guard.lucidorg.com) | Edge ingress | `commandos-center/cloudflared/config.yml` |
| Cloudflare R2 bucket `<backups-bucket>` (Object Lock, compliance mode) | Edge / storage | LVL9-GOV-001 §7, this document §8.2 |
| Cloudflare DNS for level9os.com, lucidorg.com, erichathaway.com, linkupos.com, thenextgenintern.com, thenewcoo.com, stratos.lucidorg.com | Edge / name resolution | Cloudflare zone records |
| Vercel projects (10 production projects on team `decisioning-v1`) | Site hosting | `commandos-center/brand/VERCEL-AUDIT.md` |
| `cmd_secrets` table in Supabase (~60 rows) | Secret inventory | `commandos-center/supabase/data/cmd_secrets.sql` |
| `cmd_routing_log` table | Per-call cost and routing audit | `commandos-v2/schema-v2.sql` |
| `cmd_budgets` table | Per-scope budget caps | `commandos-v2/schema-v2.sql` |
| CMD-Health-Monitor n8n workflow | Detection (5-min agent heartbeat + token spike) | `commandos/n8n-workflows/CMD-Health-Monitor.json` |
| Workflow-Activity-Monitor n8n workflow (CRITICAL list) | Detection (workflow-side) | n8n instance, workflow ID `<wam-id>` |
| GitHub repos (every consumer site, the brand package, commandos-v2, commandos-center) | Source of truth for code | github.com/erichathaway/* |

**Out of scope (asset-class):**

- Application-layer data integrity. Covered by LVL9-GOV-001 (backup) and platform features (Supabase PITR).
- Customer-product security on linkupos.com, thenextgenintern.com, thenewcoo.com. Each product has its own auth, rate-limiting, and access-control posture.
- Email infrastructure. Google Workspace and AWS SES carry their own attestations.
- Internal LAN security on the operator's home network. Treated as a hostile network for the purposes of the controls in this document. (No internal-LAN-only services exist in scope.)

### 2.3 What this document is not

| Out of scope | Why |
|---|---|
| Full SOC 2 Type II readiness package | This document is half of the technical-controls evidence (the operational half; LVL9-GOV-001 is the data half). Management-system artifacts (formal Risk Register, Vendor Management Procedures, Joiner/Mover/Leaver, Change Advisory Board) are not included. |
| Application-layer security (auth, sessions, CSRF, input validation, rate-limiting) for products | Each product handles its own. Out of scope here. |
| Multi-employee access governance | Single-operator design. A multi-employee deployment would need formal access reviews, segregation of duties, joiner/mover/leaver procedures, and named on-call rotations. |
| Capacity planning, scale-out, performance benchmarks | Out of scope. This program protects the existing topology. |
| Insider-threat or adversarial-employee scenarios | Out of scope (single-operator). |
| Regulated workloads (HIPAA, PCI-DSS, FedRAMP, GDPR Article 9, GLBA) | Out of scope. The stack is not architected for regulated data classes. |
| Production-grade scale (>$10M ARR, >50 employees) | The architecture is built for solo to small-team. Specific limits are called out throughout (single-vendor LLM judge, single-region NAS, no IaC, advisory rotation rather than automated). |

## 3. Roles and Responsibilities

The current operating environment is single-operator with AI agents acting under delegated authority. The role structure below would translate cleanly to a multi-person team.

| Role | Held by | Responsibilities |
|---|---|---|
| Owner | Eric Hathaway | Final authority on architecture, secrets, vendor selection, and policy. Approves cutovers (Phase 2.5 of the guard, n8n container upgrades, Postgres major-version moves). |
| Operator | Eric Hathaway | Day-to-day operations, secret rotation, restart and recovery execution, budget review. |
| Conductor (automated) | n8n workflow + commandos-v2 routing layer | Reads `cmd_budgets` at decision time. Enforces 75% warning and 90% pause thresholds. Cannot execute money-spending operations beyond its budget. |
| Health responder (automated) | CMD-Health-Monitor + Workflow-Activity-Monitor | Detects stale agents (>10 min heartbeat) and stale optional workflows. Escalates via Slack. Does not auto-remediate. |
| Restart responder | Eric Hathaway | Executes the procedures in Section 13 during an incident. |
| Auditor (external, on demand) | Reviewer under NDA | Reads this document, samples audit rows, verifies controls. |

## 4. Architecture Overview

```
                                ┌─────────────────────────────┐
                                │  Cloudflare (edge + DNS)    │
                                │  - DNS zones for 7 domains  │
                                │  - Tunnel `lvl9-nas`        │
                                │  - R2 (see LVL9-GOV-001)    │
                                └──────────────┬──────────────┘
                                               │
                              cloudflared      │
                              ───────►         │
                                               │
   ┌────────────────────────┐      ┌───────────┴────────────┐      ┌──────────────────────┐
   │  Mac Mini (Orchestrator)│      │  Synology NAS (Runtime)│      │  Vercel (Hosting)    │
   │  <orchestrator-host>    │      │  <runtime-host>        │      │  team decisioning-v1 │
   │                         │      │                        │      │                      │
   │  - launchd (nightly +   │      │  - Docker (containers) │      │  10 projects:        │
   │    tripwire)            │      │  - n8n :7842           │      │   level9os-site      │
   │  - commandos-center     │      │  - n8n-postgres        │      │   erichathaway-site  │
   │  - Backup orchestrator  │      │  - guard               │      │   commandos-v2       │
   │  - Routing entrypoint   │      │  - cloudflared         │      │   linkupos-site      │
   │  - cmd_routing_log      │      │  - n8n-backups (NAS)   │      │   nextgenintern-site │
   │    writer               │      │  - 60 active workflows │      │   coo-playbook       │
   └──────────┬──────────────┘      └────────────┬───────────┘      │   stratos-marketing  │
              │                                   │                  │   stratos-app        │
              │   ssh / api / mcp                 │                  │   stratos-results    │
              └─────────────┬─────────────────────┘                  │   lucidorg-site      │
                            │                                        └──────┬───────────────┘
                            │                                               │
                            │  Reads + writes                               │  GitHub auto-deploy
                            ▼                                               │
                ┌─────────────────────┐                                     │
                │  Supabase (data)    │                                     │
                │  - cmd_secrets (60) │                                     │
                │  - cmd_routing_log  │                                     │
                │  - cmd_budgets      │                                     │
                │  - cmd_activity_log │                                     │
                │  - cmd_governance_* │                                     │
                └─────────────────────┘                                     │
                                                                            │
                                                                  ┌─────────┴────────┐
                                                                  │  GitHub          │
                                                                  │  - 11 repos      │
                                                                  │  - Branch protect│
                                                                  │  - Build verify  │
                                                                  └──────────────────┘
```

The Mac Mini orchestrator is the only host that holds the centrally-stored secret material at rest. The NAS holds container-local copies of secrets it needs (n8n encryption key, Postgres password, tunnel auth blob), all under chmod 600 and out of the repo. Vercel holds nothing operationally sensitive: each site repo is independently redeployable.

## 5. Threat Model

### 5.1 Threats this program defends against

| Threat | Defended by | Section |
|---|---|---|
| n8n container crash, OOM, or hang | Healthcheck + `restart: unless-stopped` policy + manual restart procedure | §7.2, §13.1 |
| n8n Postgres data loss within container lifecycle | Encrypted password file (chmod 600), pg_dump every 4h to R2 (LVL9-GOV-001 §7.3) | §7.3, LVL9-GOV-001 §7.3 |
| Mac Mini launchd agent stops firing | Manual checks + spawned task to add staleness tripwire (LVL9-GOV-001 GOV-5) | §7.4, §12 |
| Cloudflare Tunnel disconnect | cloudflared retries automatically; manual restart procedure if persistent | §8.1, §13 |
| DNS misconfiguration | Cloudflare audit log; zone-level changes restricted to admin tokens | §8 |
| Vercel build failure on main | Build verification gate (rm -rf .next && npm run build) blocks unverified pushes; auto-deploy retries | §9, §14 |
| Secret leakage from `cmd_secrets` | Service-role key stored only on Mac Mini and guard; RLS enforced; rotation cadence in §10 | §10 |
| Expired secret in production | `last_validated_at` column + `is_valid` flag + manual rotation procedure | §10.4 |
| Runaway LLM cost from unbounded agent | `cmd_budgets` 75% warn / 90% pause read by Conductor at routing time | §11 |
| Stale agent silently failing | CMD-Health-Monitor heartbeat check (10-min threshold) + Slack alert | §12.1 |
| Unverified change reaches production | Build verification gate + branch protection on main | §14 |
| Lost or stolen developer credential | Per-tool MFA inventory in §15; rotation procedure in §10 |
| Vendor account termination (single-vendor concentration) | Vendor concentration register (LVL9-GOV-001 §14.5); cross-document |

### 5.2 Threats explicitly out of scope

| Out of scope | Reason |
|---|---|
| Nation-state APT | The program is built for the realistic threat model of a small operator. APT-class adversaries are out of scope. |
| Physical theft of NAS or Mac Mini | The encryption-at-rest posture (Postgres password file, n8n encryption key, SSH key) reduces blast radius, but a determined physical attack with disk extraction is not in the threat model. |
| Disgruntled employee | Single-operator scope. |
| Bot-driven L7 DDoS on customer products | Out of scope for this document. Cloudflare Pro tier on each domain provides the standard DDoS posture. |
| Targeted phishing of the operator | Out of scope as a controls program. Mitigated socially (1Password, FIDO2 keys, hardware tokens for high-value accounts) but not attested here. |

### 5.3 Standards Alignment

| Standard | Section / Control | Where this document addresses it |
|---|---|---|
| NIST CSF 2.0 IDENTIFY (ID.AM, ID.RA) | Asset and risk inventory | §2 (in/out of scope), §10 (asset register), §11 (cost asset) |
| NIST CSF 2.0 PROTECT (PR.AC, PR.DS, PR.IP) | Identity, access, data protection, baseline configurations | §10 (secrets), §14 (change), §15 (identity) |
| NIST CSF 2.0 DETECT (DE.AE, DE.CM, DE.DP) | Anomalies, monitoring, detection processes | §12 (CMD-Health-Monitor, Workflow-Activity-Monitor) |
| NIST CSF 2.0 RESPOND (RS.RP, RS.AN, RS.CO) | Response planning, analysis, communications | §13 (restart and recovery procedures) |
| NIST CSF 2.0 RECOVER (RC.RP, RC.IM) | Recovery planning, improvements | §13, §16 (drills) |
| NIST AI RMF 1.0 GOVERN-1.4 | Establish an AI system risk management framework | §11 (budget enforcement is the cost-side risk control) |
| NIST AI RMF 1.0 MEASURE-2.7 | Operational and accuracy performance measured | §12 (heartbeat + staleness detection) |
| ISO/IEC 27001:2022 A.5.15 | Access control | §15 |
| ISO/IEC 27001:2022 A.5.30 | ICT readiness for business continuity | §13, §16 |
| ISO/IEC 27001:2022 A.8.13 | Information backup | LVL9-GOV-001 (cross-reference) |
| ISO/IEC 27001:2022 A.8.16 | Monitoring activities | §12 |
| ISO/IEC 27001:2022 A.8.32 | Change management | §14 |
| ISO/IEC 42001:2023 §8.2 | AI system operational planning | §11, §13 |
| SOC 2 TSC CC6.1 | Logical access | §10, §15 |
| SOC 2 TSC CC7.2 | System monitoring | §12 |
| SOC 2 TSC CC7.3 | Anomaly detection | §12 |
| SOC 2 TSC CC8.1 | Change management | §14 |
| SOC 2 TSC CC9.1 | Disruption mitigation | §13 |
| OWASP LLM Top 10 LLM10:2025 | Unbounded resource consumption | §11 (budget caps) |

## 6. Document and Code References

| Reference | Path |
|---|---|
| Sibling chassis (data-side) | `level9os-site/public/governance/backup-and-vault.md` |
| n8n container compose file | `commandos-v2/docker/docker-compose.yml` |
| Routing schema | `commandos-v2/schema-v2.sql` |
| Secrets seed data | `commandos-center/supabase/data/cmd_secrets.sql` |
| Vercel project audit | `commandos-center/brand/VERCEL-AUDIT.md` |
| CMD-Health-Monitor workflow | `commandos/n8n-workflows/CMD-Health-Monitor.json` |
| Operations map (private) | `commandos-center/runbooks/OPERATIONS-MAP.md` |
| Operating model | `OPERATING-MODEL.md` (root of repo) |

## 7. Compute & Runtime Program

### 7.1 Architectural principle

Two physical hosts. One internet-facing surface. No dependency on the operator's home network for business logic.

- **Mac Mini orchestrator.** Decision-making layer. Reads from Supabase, calls LLM providers, calls the NAS. Holds central secret material. Runs nightly backup orchestration.
- **Synology NAS.** Runtime layer. Runs n8n, n8n-postgres, the guard service, cloudflared, and 4-hour Postgres dump cron. Holds only the secrets it consumes.

This separation gives a clean failure-mode story: if the Mac Mini stops firing, the NAS keeps running its scheduled work. If the NAS stops, the Mac Mini still has the routing layer and centralized secret material to bring up replacements.

### 7.2 n8n container (NAS)

| Setting | Value | Source |
|---|---|---|
| Image | n8nio/n8n (community edition) | `commandos-v2/docker/docker-compose.yml` |
| Port | 7842 | docker-compose.yml |
| Restart policy | `unless-stopped` | docker-compose.yml |
| Memory limit | 2 GB | docker-compose.yml |
| Healthcheck | `curl -f http://localhost:7842/healthz` every 30s, 5s timeout, 3 retries | docker-compose.yml lines 48–53 |
| Database backend | External Postgres container (n8n-postgres on `n8n-net`) | docker-compose.yml |
| Encryption key | `/volume1/docker/.n8n/config` (chmod 600) | `cmd_secrets` row `n8n/encryption_key` |
| Postgres password file | `/volume1/docker/.n8n-postgres-password` (chmod 600) | `cmd_secrets` row `n8n/postgres_password` |
| Runner task timeout | 1800s (raised 2026-04-27 for AE-Orch deep-scrape) | docker-compose.yml env `N8N_RUNNERS_TASK_TIMEOUT` |
| Community license | Activated 2026-04-24 | `cmd_secrets` row `n8n/community_license_key` |

The encryption key and Postgres password live on the NAS only, in mode-600 files outside the repo. The n8n encryption key is **never rotated** (per `cmd_secrets` notes): rotating it invalidates every encrypted credential stored in n8n. Rotation procedure is decommission-and-rebuild, not in-place rotation.

### 7.3 n8n Postgres (NAS, container)

The n8n runtime database. Holds workflow definitions, execution history, encrypted credentials, and the credential-key fingerprint.

| Concern | Posture |
|---|---|
| Encryption at rest | Filesystem-level (NAS Btrfs), plus n8n-side credential-encryption with the rotation-blocked key above |
| Backup cadence | pg_dump every 4 hours (00:00, 04:00, 08:00, 12:00, 16:00, 20:00 local) → R2 with Object Lock. See LVL9-GOV-001 §7.3. |
| Local retention | 7 days on NAS (`/volume1/docker/n8n-backups/`) |
| Offsite retention | 30-day Object Lock window (compliance mode) on R2 |
| Recovery target | RPO 4h (last successful pg_dump). RTO 1h (fresh container + dump restore). |
| Migration history | SQLite → Postgres migration completed 2026-04-24. SQLite container preserved through 2026-04-30 as fallback. |

### 7.4 Mac Mini orchestrator launcher

| Setting | Value |
|---|---|
| OS | macOS |
| Scheduling | launchd plists in `commandos-center/launchd/` |
| Active jobs | `com.level9.commandos-center` (nightly 03:00 local), `com.level9.tripwire` (every 5m) |
| Repository state | `~/commandos-center` (git clone of `github.com/erichathaway/commandos-center`) |
| Failure signal | Staleness of `manifests/last-run.json`. Cross-referenced in LVL9-GOV-001 GOV-5 (open: add proactive tripwire). |

### 7.5 Capacity and runtime targets

| Asset | Target |
|---|---|
| n8n container uptime (rolling 30 days) | ≥ 99% (allows ~7h/month for restarts and patching) |
| Mac Mini launchd nightly success rate | 100% (any miss is investigated next operating day) |
| Postgres dump success rate | ≥ 99% (any miss escalates within 1 cycle = 4 hours) |
| Vercel build success rate (main branch, all 10 projects, rolling 30 days) | ≥ 95% (failed builds investigated same day) |

Targets are operational, not contractual. They are reviewed quarterly.

## 8. Edge & Network Program

### 8.1 Cloudflare Tunnel `lvl9-nas`

The tunnel is the only ingress path to NAS-hosted services. The home router has no inbound port-forward open after GOV-1 closure (LVL9-GOV-001 §15).

| Setting | Value | Source |
|---|---|---|
| Tunnel ID | `<cf-tunnel-id>` | `cmd_secrets` row `cloudflare/tunnel_creds_lvl9_nas` |
| Hostnames | `n8n.lucidorg.com`, `guard.lucidorg.com` | Cloudflare zone CNAMEs → tunnel |
| Container | cloudflared on NAS, `restart: unless-stopped` | `commandos-center/cloudflared/docker-compose.yml` |
| Auth blob | `<tunnel-creds>` (mode 600) | `commandos-center/cloudflared/seed-creds.sh` reads from `cmd_secrets` |
| Rotation | 2026-06-01 (next) | `cmd_secrets` row notes |

If the tunnel disconnects, cloudflared retries automatically with exponential backoff. A persistent failure escalates to manual restart (§13.4).

### 8.2 Cloudflare R2 (cross-reference)

The bucket `<backups-bucket>` (Object Lock, compliance mode, 30-day retention) is the only WORM destination for backups. Full schema, key inventory, and verification procedure live in LVL9-GOV-001 §7.4.

The four R2 keys in `cmd_secrets` are:

| Key | Scope | Rotation |
|---|---|---|
| `cloudflare/r2_access_key_id_backups` | Object Read+Write on the bucket | 90 days |
| `cloudflare/r2_secret_access_key_backups` | Pairs with above | 90 days |
| `cloudflare/r2_admin_token` | Bootstrap only | Expires 2026-05-31 (revoke after Phase 1) |
| `cloudflare/api_token_zone_dns_edit` | DNS operations only | Phase 3 |

### 8.3 DNS

Cloudflare DNS holds 7 zones. Zone records are edited only through admin-token-scoped operations (`cloudflare/api_token_zone_dns_edit`). Every record change is captured in the Cloudflare audit log (vendor-side; not mirrored locally yet).

### 8.4 Known edge gaps

| Gap | Status |
|---|---|
| No code-level WAF rules. Cloudflare standard managed rules are on at zone level, but there is no `wrangler.toml` / IaC representation of the WAF posture. | Open. Designed: capture WAF rules under `commandos-center/cloudflare/` as version-controlled. |
| No formal rate-limiting config in code. | Open. Cloudflare zone-level rate-limiting is on at default tiers; not in code. |
| No mirrored DNS / WAF audit log to local Supabase. | Open, low priority. Cloudflare's own audit log is the primary record. |

## 9. Vercel Hosting Program

### 9.1 Project inventory

10 production projects under Vercel team `decisioning-v1` (team ID `team_UGKVZSfkGnRYZEo0Y2A2XhQk`):

| Project | Production domain |
|---|---|
| `level9os-site` | level9os.com |
| `erichathaway-site` | erichathaway.com |
| `commandos-v2` | commandos.level9os.com |
| `linkupos-site` | linkupos.com (+ www) |
| `nextgenintern-site` | thenextgenintern.com (+ www) |
| `coo-playbook` | thenewcoo.com (+ www, + playbook.erichathaway.com) |
| `stratos-marketing` | stratos.lucidorg.com |
| `stratos-app` | app.stratos.lucidorg.com |
| `stratos-results` | results.stratos.lucidorg.com |
| `lucidorg-site` | (no production domain assigned at audit time) |

Source: `commandos-center/brand/VERCEL-AUDIT.md`. Audit date 2026-04-18.

### 9.2 Auto-deploy posture

Every project auto-deploys from `main`. There is no separate staging environment for marketing sites. Build verification is enforced in Section 14: a failing `npm run build` blocks a merge by convention (single-operator, manual). Branch protection on `main` is enabled per repo where the repo is public.

### 9.3 Vercel API access

The Vercel Personal Access Token (`vercel/api_token` in `cmd_secrets`) holds the highest-blast-radius scope: it can deploy any project. It is held by:

- The guard service `deployProduction` executor (LVL9-GOV-001 §9)
- The operator (manual deploys, rollback)

Rotation is annual (365 days). Last rotated 2026-04-30.

### 9.4 Known Vercel gaps

| Gap | Status |
|---|---|
| No deployment-protection config (e.g. password gates on previews). | Open. Marketing sites are public; not currently a concern. |
| No build-failure alert webhook. Failures are visible in the Vercel dashboard but not pushed to Slack. | Open. Spawned task to add a Vercel webhook → Slack. |
| No formal rollback runbook. Rollback is manual via Vercel dashboard or `vercel rollback`. | Open. Procedure documented in §13.5; runbook to be promoted to a one-pager. |

## 10. Secrets Vault Program (`cmd_secrets`)

### 10.1 Purpose

Single inventory of every operational secret in use across the stack. Schema is service / key_name / scopes / environments / consumers / expires_at / last_rotated / last_accessed / rotation_days / notes / is_valid / last_validation_error. The vault is **not** the secret store: 1Password remains the authoritative password manager. `cmd_secrets` is the metadata layer plus the live operational copy that programs read at runtime through `get_secret(p_service, p_key_name)`.

### 10.2 Inventory

The vault holds **~60 rows** spanning these services:

| Vendor | Keys / tokens | Notes |
|---|---|---|
| Cloudflare | 5+ (R2 access, R2 secret, R2 admin, tunnel auth, DNS API) | Multiple scopes per service |
| Supabase | service_role, anon, db_password, access_token | Service-role mirrored on Mac Mini and guard |
| Anthropic | api_key | Used by guard reviewer + agent fleet (mirrored to docker/.env) |
| OpenAI | api_key | Used by n8n credential, supabase app, StratOS |
| Perplexity | api_key (+1 historical, consolidated 2026-04-26) | LUOS + arch workflows |
| Google (OAuth + app password) | gmail_oauth2, gmail_app_password (180-day rotation) | Two credentials |
| Google Drive | drive_oauth2 | Auto-refresh |
| LinkedIn (Unipile) | account_id (Eric default), api_key, account_id (Sasha) | Two LinkedIn accounts |
| Apollo | api_key (180-day rotation) | Hardcoded in 2 workflows; structural fix pending |
| Stripe | api_key + 3 webhook secrets | LinkUpOS + COO Playbook |
| GitHub | PAT (90-day rotation) | Expires 2026-07-13 |
| Vercel | api_token (PAT, 365-day rotation) | Rotated 2026-04-30 |
| Apify | api_key (90-day rotation) | Embedded in 8 workflow node URLs (structural issue, GOV-9 below) |
| Pinecone | api_key (90-day rotation) | Flagged exposed 2026-04-22, rotation recommended |
| ElevenLabs | api_key (90-day rotation) | Flagged exposed 2026-04-22 |
| n8n | api_key (30-day), postgres_password, encryption_key (do-not-rotate), community_license_key | n8n encryption key never rotated by design |
| Slack | bot_token, 3 webhook URLs (3 marked is_valid=false) | GOV-3 in LVL9-GOV-001 |
| Notion | integration_token | Shared with Dossiers DB + Governance Hub |
| Buffer | PAT GraphQL (365-day, expires 2027-04-29) | Instagram, YouTube, TikTok |

### 10.3 Validation status

Each row carries `is_valid` (boolean) and `last_validation_error` (text). 3 Slack webhook rows are currently marked `is_valid=false` (set 2026-04-30, tracked as GOV-3 in LVL9-GOV-001). All other rows show `is_valid=true` as of 2026-05-02.

### 10.4 Rotation cadence

`rotation_days` per row is **advisory** today: there is no automated rotation scheduler. Rotation is operator-executed when the column passes the cadence date. The 90-day-rotation cohort (GitHub, Anthropic, OpenAI, Apify, Pinecone, ElevenLabs, n8n) is the most active; the 365-day-rotation cohort (Vercel, Buffer) is the least.

The `last_validated_at` column is updated by a future automated probe (designed; not yet running). Today, validation runs on first read after rotation, manually.

### 10.5 Known secrets gaps

| Gap | Status |
|---|---|
| No automated expiry-warning alert (e.g. Slack at -7 days) | Open. Designed: Slack at T-7 and T-1 days for any row with `expires_at` set. |
| `Apify/api_key` embedded in 8 n8n workflow node URLs (structural). Rotation requires editing all 8 nodes. | Open (GOV-9). Tracked for FINAL phase of n8n cleanup. |
| Pinecone and ElevenLabs flagged exposed 2026-04-22; rotation overdue. | Open. Spawned task. |
| 1Password `service_account_token_commandos_center` flagged exposed 2026-04-22 with rotation deadline 2026-04-29. Currently overdue. | Open (GOV-4 in LVL9-GOV-001). |
| `cmd_secrets` does not enforce RLS preventing anon access in all rows. | Investigation. Most rows are RLS-locked; spot-check needed. |

## 11. Cost & Budget Enforcement Program

### 11.1 Architecture

Two tables, one runtime layer.

```
   ┌──────────────────────────┐
   │  cmd_routing_log         │  Per-call audit
   │  - task_id               │
   │  - agent_id              │
   │  - task_type             │
   │  - model_provider        │
   │  - model_name            │
   │  - input_tokens          │
   │  - output_tokens         │
   │  - duration_ms           │
   │  - outcome               │
   │  - cost_estimate_usd     │
   │  - created_at            │
   └────────────┬─────────────┘
                │ aggregated
                ▼
   ┌──────────────────────────┐         ┌──────────────────────────┐
   │  cmd_budgets             │         │  Conductor (n8n + lib)   │
   │  - scope_type            │ reads → │                          │
   │    (task/agent/         │         │  - At routing time:      │
   │     workstream/system)   │         │     read budget          │
   │  - token_budget          │         │     compute used %       │
   │  - tokens_used           │         │     warn at 75%          │
   │  - threshold_warning_pct │         │     pause at 90%         │
   │    (75)                  │         │  - Pause = decline call  │
   │  - threshold_critical_pct│         │  - Warn = Slack alert    │
   │    (90)                  │         │                          │
   │  - reset_window          │         │                          │
   │    (hourly/daily/none)   │         │                          │
   └──────────────────────────┘         └──────────────────────────┘
```

### 11.2 cmd_routing_log

Every LLM call is logged before completion. Schema in `commandos-v2/schema-v2.sql` lines 42–69. Columns: `id, task_id, agent_id, task_type, model_provider, model_name, input_tokens, output_tokens, duration_ms, outcome, cost_estimate_usd, created_at`. The `total_tokens` column was removed 2026-04-25; production schema is authoritative.

Providers logged: `claude_code`, `claude_api`, `chatgpt`, `gemini`, `perplexity`. Cost is computed at log-time from a per-model price table (rates current as of last update).

### 11.3 cmd_budgets

Per-scope token budgets with two thresholds. Schema in `commandos-v2/schema-v2.sql` lines 72–86.

| Scope | Example |
|---|---|
| `task` | A single multi-call planning run |
| `agent` | An agent's daily ceiling |
| `workstream` | A project's monthly ceiling (e.g. LinkUpOS comment generation) |
| `system` | The whole stack's monthly ceiling |

Reset windows: `hourly`, `daily`, `none` (manual reset).

### 11.4 Conductor enforcement

The Conductor is the routing layer in `commandos-v2`. Before issuing an LLM call, it reads the relevant budget row, computes `tokens_used / token_budget`, and:

- < 75% → proceeds silently
- 75% to < 90% → proceeds, but emits a Slack warning
- ≥ 90% → declines the call. The routing-layer caller receives a structured error.

Pause is **request-time**: in-flight calls are not killed.

### 11.5 Per-run reference costs

| Workload | Reference cost |
|---|---|
| StratOS room run (10 personas, full pipeline) | ~$5.89 (operating model) |
| Anti-lie verifier call (per claim) | < $0.001 (deterministic checker, not LLM) |
| Guard reviewer call (per Tier 1 op) | ~$0.005 (small Anthropic call) |

These are operating reference points, not commitments.

### 11.6 Known cost-program gaps

| Gap | Status |
|---|---|
| No aggregated P&L view (revenue minus run-cost minus vendor cost). Stripe billing exists; cost tracking exists; no join. | Open (referenced as GAP-7 in OPERATING-MODEL.md) |
| No provider-level absolute cap (e.g. "Anthropic spend ≤ $X / month"). Caps are per scope, not per provider. | Open. Spawned task: add `cmd_budgets.provider` scope dimension. |
| Cost-estimation table is static. Drift on provider price changes is operator-fixed. | Open. Re-priced quarterly. |

## 12. Health Detection Program

### 12.1 CMD-Health-Monitor

The primary heartbeat. Source: `commandos/n8n-workflows/CMD-Health-Monitor.json`.

| Setting | Value |
|---|---|
| Cadence | Every 5 minutes |
| Checks | Agent `last_heartbeat` >10 min old → `error`. Token spike (rolling-window outlier) → `warn`. |
| Escalation | Slack via webhook (not the deprecated `webhook_*` rows) |
| Auto-remediation | None. Detection only. |

### 12.2 Workflow-Activity-Monitor

The workflow-side complement. Tracks a CRITICAL list of workflows and flags any execution gap longer than its expected cadence.

| Setting | Value |
|---|---|
| Workflow ID | `<wam-id>` |
| Critical list | LUOS-Daily-Briefing, MARKETING-Daily-Voice-Backup, AE-Orch, OPS-Lie-Watchdog (when live) |
| Optional flag | Workflows tagged optional are not escalated to error |
| Escalation | Slack |

### 12.3 Backup-side observability (cross-reference)

Backup health (manifests, last-run.json, R2 upload status) is owned by LVL9-GOV-001 §8. This program does not duplicate it.

### 12.4 Known detection gaps

| Gap | Status |
|---|---|
| No probe for the cloudflared container itself. If the tunnel container dies, cloudflared retries auto, but a sustained failure is not detected. | Open. Spawned task: add tunnel-side probe to CMD-Health-Monitor. |
| No probe for n8n-postgres connectivity from outside the n8n container. | Open. n8n's own healthcheck implicitly verifies it. |
| No SLO dashboard. Targets in §7.5 are operator-tracked, not metrically reported. | Open. |

## 13. Restart & Recovery Procedures

For the operator at 3am. Each procedure is copy-pastable. Placeholders resolve via `runbooks/OPERATIONS-MAP.md`.

### 13.1 Restart n8n container

```bash
ssh -p <ssh-port> <operator-user>@<runtime-host> \
  "/usr/local/bin/docker restart n8n"

# Expected recovery time: 15-30 minutes for full load to settle.
# Watch:
ssh -p <ssh-port> <operator-user>@<runtime-host> \
  "/usr/local/bin/docker logs --tail 100 -f n8n"
```

If the container does not come up within 5 minutes, check:

1. `docker ps -a` for crash state
2. n8n-postgres container is healthy (`docker logs n8n-postgres --tail 50`)
3. The n8n encryption key file is intact (`ls -l /volume1/docker/.n8n/config`)

### 13.2 Restart NAS (full reboot)

Last resort. Loses container uptime; backups will resume after reboot.

```bash
ssh -p <ssh-port> <operator-user>@<runtime-host> "sudo reboot"

# Wait ~3 minutes for the NAS to come back. Then:
ssh -p <ssh-port> <operator-user>@<runtime-host> \
  "/usr/local/bin/docker ps"

# Verify all 4 containers are up:
#   n8n, n8n-postgres, guard, cloudflared
```

After reboot, manually trigger one Postgres dump and one nightly backup verification (LVL9-GOV-001 §11) to confirm both tracks resumed.

### 13.3 Restart Mac Mini orchestrator launchd

```bash
# Stop the agent
launchctl unload ~/Library/LaunchAgents/com.level9.commandos-center.plist

# Start it again
launchctl load ~/Library/LaunchAgents/com.level9.commandos-center.plist

# Force a manual run (no waiting for cron)
launchctl start com.level9.commandos-center
```

### 13.4 Cloudflare Tunnel restart

```bash
ssh -p <ssh-port> <operator-user>@<runtime-host> \
  "/usr/local/bin/docker restart cloudflared"

# Verify ingress:
curl -I https://n8n.lucidorg.com/healthz
curl -I https://guard.lucidorg.com/health
```

If both return non-200 within 60s, the tunnel auth blob may have expired or the ingress rules drifted. Check `commandos-center/cloudflared/config.yml` matches the deployed `/volume1/docker/cloudflared/config.yml` and the tunnel ID in `cmd_secrets`.

### 13.5 Vercel rollback

```bash
# List recent deployments for one project
vercel ls --token <VERCEL_API_TOKEN> --scope decisioning-v1 <project>

# Promote a known-good prior deployment to production
vercel promote <deployment-url> \
  --token <VERCEL_API_TOKEN> \
  --scope decisioning-v1 \
  --yes
```

The token comes from `cmd_secrets/vercel/api_token`. Do not paste it in chat. Rollback is per-project; cross-project rollback requires running the same command for each affected project.

### 13.6 Postgres emergency restore (n8n)

This procedure is destructive on the running n8n. It exists for catastrophic database corruption.

```bash
# 1. Stop n8n (do not stop n8n-postgres; you need it up to receive the dump)
ssh -p <ssh-port> <operator-user>@<runtime-host> \
  "/usr/local/bin/docker stop n8n"

# 2. Pull the most recent good dump from R2 (see LVL9-GOV-001 §11.3)
aws s3 cp \
  "s3://<backups-bucket>/n8n-postgres/pg_<STAMP>.dump" \
  ~/n8n-restore.dump \
  --endpoint-url https://<r2-account-id>.r2.cloudflarestorage.com

# 3. Drop and recreate the n8n database in the running container
docker exec -i n8n-postgres psql -U n8n -c "DROP DATABASE n8n;"
docker exec -i n8n-postgres psql -U n8n -c "CREATE DATABASE n8n;"

# 4. Restore
docker exec -i n8n-postgres pg_restore -U n8n -d n8n < ~/n8n-restore.dump

# 5. Restart n8n
ssh -p <ssh-port> <operator-user>@<runtime-host> \
  "/usr/local/bin/docker start n8n"
```

Stage this in a scratch DB first. Production emergency-restore requires Owner approval.

### 13.7 Routing-layer rollback (commandos-v2)

The Conductor lives in `commandos-v2`. Rollback is a Vercel rollback (§13.5) for that project, which restores the prior routing logic.

## 14. Change & Release Governance

### 14.1 Build verification gate (mandatory)

Every consumer site enforces this gate before merge to `main`:

```bash
rm -rf .next && npm run build
```

The build must succeed cleanly, with no TypeScript errors, no broken routes, and the expected route count present in the build summary. This is the single hardest gate in the change-management posture.

### 14.2 Pre-deploy checklist (`level9-brand/procedure/`)

Four canonical procedures, all in the brand package:

| Procedure | Purpose |
|---|---|
| `PROJECT-LIFECYCLE.md` | 6-phase lifecycle: Intake, Setup, Build, Ship, Operate, Retire |
| `BRAND-CONSISTENCY-CHECKLIST.md` | Brand audit before ship: tokens, logos, voice, legal, LLC attribution |
| `DEPLOY-PROCEDURE.md` | Pre-deploy + post-deploy verification |
| `DATA-CLEANUP-PROCEDURE.md` | Data hygiene before any cutover |

These are narrative procedures. Enforcement is operator-executed today; CI integration is open work.

### 14.3 Branch protection

| Repository class | Posture |
|---|---|
| Public consumer-site repos | Branch protection on `main`. Direct push blocked. PR + green check + 1 review required. |
| Private internal repos (commandos-center, commandos-v2) | Branch protection on `main`. Direct push allowed for the operator (single-operator caveat). |
| Brand package (`level9-brand`) | Branch protection on `main`. Public; PR-only. |

### 14.4 Segregation of duties (single-operator caveat)

In a multi-employee team, change governance includes role separation: developers cannot deploy, deployers cannot review, reviewers cannot merge. In a single-operator stack, this separation collapses to the same person. The compensating controls are:

- Build verification gate (§14.1) is mechanical, not judgmental.
- Branch protection (§14.3) enforces a PR step even for the operator on public repos.
- Audit trail (§17) records every guard call, every routing call, and every commit.

A multi-employee deployment would replace this caveat with documented role separation. The current posture is honest about its single-operator status; it is not pretending to enforce SoD that does not exist.

### 14.5 Change advisory for high-blast-radius changes

The five most-destructive operations route through the guard service (LVL9-GOV-001 §9). Outside that perimeter, two change classes require Owner approval:

- n8n major-version upgrade (image change in docker-compose.yml)
- Postgres major-version move (n8n-postgres image change)

Both are Owner-gated changes. The operator and Owner are the same person today; the audit trail still captures the explicit approval (a commit message tagged `OWNER-APPROVED:` plus a journal row).

## 15. Identity & Access Posture

### 15.1 Tools inventory + auth method

| Tool | Auth method | MFA |
|---|---|---|
| Cloudflare dashboard | Email + password + WebAuthn (FIDO2) | Yes |
| Cloudflare API tokens | Bearer | (token-scoped, no human session) |
| Vercel dashboard | OAuth via GitHub | Inherited from GitHub |
| Vercel CLI | API token | Token-only |
| Supabase dashboard | Email + password + TOTP | Yes |
| Supabase CLI / API | Service-role JWT or anon JWT | Token-only |
| GitHub | Email + password + WebAuthn (FIDO2) | Yes |
| GitHub CLI / API | PAT (90-day rotation) | Token-only |
| Anthropic console | Email + password + TOTP | Yes |
| OpenAI console | Email + password + TOTP | Yes |
| 1Password | Master password + Secret Key + biometric | Yes (multi-factor by design) |
| Synology DSM (NAS admin UI) | Username + password | Yes (Synology Secure SignIn or TOTP) |
| SSH to NAS | Key-only, password disabled, custom port | Key-only |
| Slack | OAuth + WebAuthn | Yes |
| n8n Web UI (n8n.lucidorg.com) | Username + password (n8n basic auth) | No (n8n OSS limitation) |
| Notion | Email + password + TOTP | Yes |

### 15.2 MFA inventory summary

| Class | Count |
|---|---|
| Hardware-token (FIDO2) backed | 3 (Cloudflare, GitHub, 1Password) |
| TOTP backed | 6 (Supabase, Anthropic, OpenAI, Synology, Slack, Notion) |
| Token-only (no human session) | 7 (Vercel API, Cloudflare API, Supabase service-role, OpenAI API, Anthropic API, etc.) |
| Username + password only (no MFA available) | 1 (n8n Web UI; OSS limitation) |

The single gap (n8n Web UI) is mitigated by the Cloudflare Tunnel ingress (`n8n.lucidorg.com` is only reachable via the tunnel, not by raw IP) and by the absence of public sign-up. n8n Enterprise adds SSO; not on the current roadmap.

### 15.3 Session management

Operator sessions on cloud dashboards expire per vendor default (typically 7-30 days depending on sensitivity). Token-only credentials have no session: rotation is the only invalidation lever. Token rotation cadence per service is the rotation-cadence column in `cmd_secrets` (§10.4).

### 15.4 Known identity gaps

| Gap | Status |
|---|---|
| n8n Web UI lacks MFA. Mitigated by tunnel ingress. | Open. n8n SSO is Enterprise-tier. |
| No central SSO across the operator's vendor accounts (each is its own login). | Open by design at single-operator scale. A multi-employee team would adopt Google Workspace or Okta. |
| No formal access review cadence (the operator is the only human; review is implicit). | Open by design. Multi-employee deployment would adopt quarterly access review. |

## 16. Verification and Drills

### 16.1 Quarterly infrastructure drill

Each quarter, the operator runs:

1. **Container restart drill.** Restart n8n + cloudflared + guard. Verify each comes back within 60 seconds.
2. **Tunnel break drill.** Stop cloudflared on NAS. Verify n8n.lucidorg.com goes 502 within 60s. Restart cloudflared. Verify recovery.
3. **Conductor budget drill.** Set a synthetic test budget at 1000 tokens with `tokens_used=900` (90%). Verify Conductor pauses the next call. Reset.
4. **Vercel rollback drill.** Roll one of the 10 projects back to its prior production deployment. Verify production traffic continues. Roll forward.
5. **Secret rotation drill.** Pick one 90-day-rotation secret. Rotate it end-to-end (read new from `cmd_secrets`, update consuming workflow, verify, decommission old). Time the procedure.

The drill log is appended to `commandos-center/runbooks/INFRA-DRILL-LOG.md`. First drill scheduled 2026-Q3.

### 16.2 Monthly secret-validation pass

Monthly, the operator runs a manual sweep that calls each integration with the active token to verify validity. Results update `is_valid` and `last_validated_at` in `cmd_secrets`. Tokens validated to fail are flagged for immediate rotation.

### 16.3 On-demand health check

Before any high-stakes operation (major release, customer demo, partner-shared deploy), the operator runs:

```bash
# Full health snapshot
psql ... -c "SELECT created_at, event_type, payload->>'status'
            FROM cmd_activity_log
            WHERE event_type LIKE 'health_%'
            ORDER BY created_at DESC LIMIT 20;"

# Container snapshot
ssh -p <ssh-port> <operator-user>@<runtime-host> \
  "/usr/local/bin/docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Active workflows
curl -s -H "X-N8N-API-KEY: <n8n-api-key>" \
  https://n8n.lucidorg.com/api/v1/workflows?active=true | jq '.data | length'

# Conductor budget posture
psql ... -c "SELECT scope_type, name, tokens_used, token_budget,
            ROUND(100.0*tokens_used/token_budget,1) AS pct
            FROM cmd_budgets
            ORDER BY pct DESC LIMIT 10;"
```

## 17. Audit Trail

### 17.1 What is logged

| Source | Captured in | Retained |
|---|---|---|
| Every guard Tier 1 call | `cmd_activity_log` (LVL9-GOV-001 §13) | Forever (Supabase) |
| Every routing call | `cmd_routing_log` | Forever |
| Every workflow execution | n8n executions table (NAS Postgres) | 30 days (n8n default; configurable) |
| Every Vercel deployment | Vercel platform | 90 days (Vercel default) |
| Every Cloudflare API call | Cloudflare audit log | Per Cloudflare tier (varies) |
| Every commit | Git history (GitHub + commandos-center mirror to R2) | Forever |

### 17.2 Forensic reconstruction

The combination of `cmd_activity_log` (guard calls), `cmd_routing_log` (every LLM call), n8n execution history, and Git history allows reconstruction of every decision the system made within the n8n-execution retention window (30 days), and every routing decision and access-control decision indefinitely.

### 17.3 Log retention summary

| Log class | Retention | Where |
|---|---|---|
| Operational decision log (`cmd_routing_log`) | Indefinite | Supabase |
| Access control log (`cmd_activity_log`) | Indefinite | Supabase |
| n8n execution detail | 30 days | NAS Postgres |
| Vercel deployment log | 90 days | Vercel platform |
| Cloudflare audit | Vendor tier (typically 30-90 days) | Cloudflare |
| Git history | Indefinite | GitHub + R2 tarball mirror |

A multi-region or longer-retention story for Cloudflare and Vercel logs is open work. The most-relevant logs for forensic reconstruction (`cmd_*` and Git) are indefinite.

## 18. Known Limitations and Residual Risk

| Limitation | Residual risk | Mitigation considered |
|---|---|---|
| Single NAS, single region. Hardware failure or region-level Cloudflare tunnel outage takes runtime offline. | RTO measured in hours during a hardware-replacement event. | Phase 3: a second NAS with passive standby, or migration to a managed n8n provider. Cost-benefit deferred. |
| Single Mac Mini orchestrator. Hardware failure stops nightly backups + tripwire. | LVL9-GOV-001 GOV-5 (staleness tripwire) is the early-warning. Recovery time: 1-2 hours to provision a replacement and replay launchd plists. | Phase 3: a second orchestrator host. Not yet built. |
| Conductor enforcement is in-process, not at the API gateway. An agent that bypasses the routing layer and calls Anthropic directly with the API key escapes budget enforcement. | Mitigated by treating the Anthropic key as Tier 1 (guard-controlled rotation) and by the audit trail surfacing direct-call patterns. | Phase 3: route all LLM traffic through a shared gateway (e.g. an internal proxy on the NAS) with budget pre-check. Designed; not built. |
| n8n Web UI lacks MFA. | Mitigated by Cloudflare Tunnel ingress + private hostname + non-public sign-up. | n8n Enterprise SSO; not on the current roadmap. |
| `cmd_secrets` is the operational copy. If Supabase is wiped and 1Password is also lost, recovery requires re-issuing every credential. | LVL9-GOV-001 §11 covers Supabase recovery from R2. 1Password adds the second layer. | Adequate for current scale. |
| Reviewer is single-vendor (Anthropic). Cross-document with LVL9-GOV-001 GOV-7. | Correlated LLM error mode. | Phase 3: dual-vendor reviewer. |
| Vendor concentration: Cloudflare is the highest. R2, DNS, CDN, tunnel all live there. Cross-document with LVL9-GOV-001 §14.5. | Account-termination event would be high-impact across multiple surfaces. | Phase 3: GOV-8 (LVL9-GOV-001) — second offsite (Synology C2 or AWS S3). |
| Most rotation is operator-executed, not automated. | Operator-attention dependency. | Spawned task: automated expiry alerts at T-7 and T-1 days. |

## 19. Vendor Dependency Register

Cross-references the LVL9-GOV-001 §14.5 register. This document adds the runtime perspective:

| Vendor | Runtime role here | 24h outage impact | Account-termination impact | Section |
|---|---|---|---|---|
| Cloudflare | Tunnel + R2 + DNS + CDN | All public hostnames offline; backups queue locally; n8n + guard unreachable | Loss of immutable backups beyond 7-day local retention; emergency DNS migration | §8.1, §8.2 |
| Vercel | All site hosting | Every site offline | Sites redeployable to alternate (Cloudflare Pages, Netlify, AWS Amplify) within ~1 hour each | §9 |
| Supabase | Live `cmd_*` tables, product data | Conductor cannot read budgets; agent fleet halts | Restore from R2 dumps (LVL9-GOV-001 §11.2) | §10, §11 |
| Anthropic | LLM judge, primary agent provider | Guard reviewer fails closed; agents halt | Migrate to OpenAI / Gemini; reconfigure guard | §14.5 (LVL9-GOV-001) |
| Synology / NAS | Self-hosting for n8n, n8n-postgres, guard, cloudflared | Runtime stops; backups continue from Mac Mini | Hardware replacement; restore from R2 dumps; rebuild containers | §7 |
| GitHub | Source of truth for every repo | Read access to all source impacted; nightly mirror commits queue | R2 has tarballs of source through commandos-center | §14 |
| 1Password | Authoritative secret store + manual fallback | Manual operations blocked; live systems unaffected | Catastrophic for manual recovery if Supabase is also lost | §10 |

## 20. Open Governance Issues

Continues numbering from LVL9-GOV-001 (which used GOV-1 through GOV-8). Resolution is tracked in this register.

| ID | Issue | Status | Owner | Target |
|---|---|---|---|---|
| GOV-9 | `Apify/api_key` embedded in 8 n8n workflow node URLs (structural). Rotation requires editing all 8 nodes. | Open. Tracked for FINAL phase of n8n cleanup. | Eric Hathaway | Near-term |
| GOV-10 | No automated secret-expiry alert (Slack at T-7 and T-1 days for any row with `expires_at` set). | Open. Designed; not built. | Eric Hathaway | Near-term |
| GOV-11 | No Vercel build-failure webhook. Failures visible in Vercel dashboard but not pushed to Slack. | Open. Spawned task. | Eric Hathaway | Near-term |
| GOV-12 | No probe for cloudflared container itself. If the tunnel container dies, sustained failure is not detected. | Open. Add to CMD-Health-Monitor. | Eric Hathaway | Near-term |
| GOV-13 | Cost-estimation table is static. Drift on provider price changes is operator-fixed. | Open. Re-priced quarterly. | Eric Hathaway | Quarterly |
| GOV-14 | No aggregated P&L view (revenue minus run-cost minus vendor cost). | Open (referenced as GAP-7 in OPERATING-MODEL.md). | Eric Hathaway | Phase 3 |
| GOV-15 | Pinecone and ElevenLabs flagged exposed 2026-04-22; rotation overdue. | Open. Spawned task. | Eric Hathaway | Immediate |
| GOV-16 | n8n Web UI lacks MFA. Mitigated by tunnel ingress, but a residual concern. | Open. n8n Enterprise SSO. | Eric Hathaway | Phase 3 |
| GOV-17 | No second offsite for n8n container itself (passive-standby NAS or managed n8n). | Open. Phase 3 design. | Eric Hathaway | Phase 3 |

## 21. Glossary

| Term | Definition |
|---|---|
| Conductor | The routing layer in `commandos-v2` that reads `cmd_budgets` at decision time and pauses LLM calls at 90% budget. |
| Tunnel | The Cloudflare Tunnel `lvl9-nas` that provides the only ingress to NAS-hosted services. |
| Tier 1 operation | One of five high-blast-radius operations defined in LVL9-GOV-001 §9. Cross-document. |
| Heartbeat | A row in `cmd_agents.last_heartbeat`. Stale > 10 min triggers escalation. |
| Critical workflow | An n8n workflow on the Workflow-Activity-Monitor's CRITICAL list. Optional-flagged workflows are excluded from escalation. |
| Operator | The human running the stack day to day. Currently Eric Hathaway. |
| Owner | The human with final authority over architecture, secrets, and policy. Currently Eric Hathaway. |
| Single-operator caveat | Where a control would normally require role separation, the program documents that the operator and owner are the same person and notes the compensating control. |
| Token-only credential | A credential class with no human-session expiry; rotation is the only invalidation. |

## 22. Appendix A: File Path Inventory

| Path | Role |
|---|---|
| `commandos-v2/docker/docker-compose.yml` | n8n + n8n-postgres container definitions |
| `commandos-v2/schema-v2.sql` | `cmd_routing_log`, `cmd_budgets` schema |
| `commandos/n8n-workflows/CMD-Health-Monitor.json` | 5-minute heartbeat workflow |
| `commandos-center/launchd/com.level9.commandos-center.plist` | Mac Mini nightly orchestrator |
| `commandos-center/launchd/com.level9.tripwire.plist` | Mac Mini 5-minute tripwire |
| `commandos-center/cloudflared/config.yml` | Tunnel ingress rules |
| `commandos-center/cloudflared/docker-compose.yml` | cloudflared container runtime on NAS |
| `commandos-center/supabase/data/cmd_secrets.sql` | Secrets seed inventory |
| `commandos-center/brand/VERCEL-AUDIT.md` | Vercel project inventory (2026-04-18) |
| `level9-brand/procedure/PROJECT-LIFECYCLE.md` | 6-phase project lifecycle |
| `level9-brand/procedure/BRAND-CONSISTENCY-CHECKLIST.md` | Pre-ship brand audit |
| `level9-brand/procedure/DEPLOY-PROCEDURE.md` | Pre / post deploy verification |
| `level9-brand/procedure/DATA-CLEANUP-PROCEDURE.md` | Data hygiene before cutover |
| `commandos-center/runbooks/OPERATIONS-MAP.md` | Placeholder resolution (private) |
| `commandos-center/runbooks/INFRA-DRILL-LOG.md` | Quarterly drill log (private) |

---

**Classified Internal · Shareable under NDA · © Eric Hathaway · Effective 2026-05-02**

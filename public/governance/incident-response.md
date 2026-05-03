# Level9 Operational Governance: Incident Response Runbook

| | |
|---|---|
| **Document ID** | LVL9-GOV-005 |
| **Version** | 1.0 |
| **Effective Date** | 2026-05-02 |
| **Owner** | Eric Hathaway (erichathaway@gmail.com) |
| **Classification** | Internal. May be shared with reviewers, auditors, and underwriters under NDA. |
| **Review Cadence** | Quarterly, plus on every incident (this is a learn-from-incidents document). |
| **Next Review Due** | 2026-08-02 |
| **Sibling chassis** | LVL9-GOV-001, LVL9-GOV-002, LVL9-GOV-003, LVL9-GOV-004. This document operationalizes the response posture across them. |

---

## 1. Purpose and Audience

Every serious governance review opens with one question: "show me your incident response plan." This document is that plan.

It describes the standard response procedure for security, operational, data-integrity, and AI-governance incidents on the Level9 stack. It is written so the operator at 3am can follow the steps with no other context, AND so a reviewer in business-hours diligence can verify the program is real.

**Intended readers:**

1. **The owner-operator** at the start of an incident. Should be able to follow Sections 5 through 9 in sequence, in real time, under pressure.
2. **A governance, security, or compliance officer** evaluating the maturity of the program. Should find named phases (Detect, Triage, Contain, Eradicate, Recover, Lessons-Learned) with concrete entry and exit criteria.
3. **An external reviewer** in a partnership, due-diligence, or insurance context. Should find a learn-from-failure register, evidence of post-incident reviews, and explicit residual risk.

**What this document is not** (high-level):

- A SIEM. The detection layer is described at a control level (CMD-Health-Monitor, Workflow-Activity-Monitor, Anti-Lie hook violations, tripwire row-count drops). Tuning, rule-writing, and SOC operations are out of scope.
- A breach-notification policy. If customer data is implicated, the relevant LLC's privacy policy + applicable law (state breach laws, GDPR if applicable) governs.
- A regulated-incident workflow (HIPAA, PCI). Out of scope at current scale.

### Novel contribution

A market sweep of incident-response documents from 2025 to 2026 found one observation relevant to this document:

**No published incident-response runbook treats "AI agent claimed completion without evidence" as a Tier 1 incident class.** Standard runbooks (PagerDuty, Atlassian Incident Management Handbook, Google SRE Workbook) name security and operational classes (data breach, outage, latency). Hallucinated or false "done" claims by AI agents — what the Anti-Lie engine in LVL9-GOV-001's sibling chassis catches — are not in any published incident taxonomy. This document is therefore one of the first to name AI-agent-integrity incidents as a first-class category.

## 2. Scope

**In scope (incident classes this document covers):**

| Class | Examples |
|---|---|
| **Security incident** | Suspected credential compromise, exposed token in chat or commit, unexplained access pattern, unauthorized destructive operation attempted |
| **Operational outage** | n8n container down, NAS unreachable, Cloudflare tunnel offline, Supabase outage, Vercel deploy failures across all projects |
| **Data integrity incident** | `cmd_*` rows missing or corrupted, n8n workflow definitions changed without operator action, tripwire row-count drop fires |
| **Cost incident** | Conductor budget exceeded by ≥ 90% before reset, unexpected spike in `cmd_routing_log.cost_estimate_usd` |
| **AI-agent-integrity incident** | Anti-Lie hook violation count spikes, agent claims completion without verification, agent ships code with banned voice violations after gate sign-off |
| **Brand / legal incident** | Content shipped to public surface that violates voice rules, wrong LLC attribution in a footer, exposed operationally sensitive value in a public document |

**Out of scope:**

- Customer-product-side incidents (e.g. a LinkUpOS user reports a bug) unless they implicate the platform layer.
- Vendor-side incidents (Cloudflare global outage, Vercel platform outage). The vendor handles those; this document covers our response to vendor incidents.
- Physical incidents (theft, fire, building damage). Cross-reference the sibling chassis for the disaster-recovery aspect.

### 2.3 What this document is not

| Out of scope | Why |
|---|---|
| A formal incident-management ticketing tool (PagerDuty, Opsgenie, FireHydrant) | Single-operator scale. Tickets are operator-tracked in a journal file. A multi-employee team would adopt a tool. |
| A breach-notification legal procedure | Cross-reference customer-data breach handling to LVL9-GOV-007 Data Governance + the relevant LLC's privacy policy. |
| A formal communications template for external stakeholders | Single-operator; no external comms cadence. A multi-employee team would adopt one. |
| Formal SLA commitments | Targets in §5.4 are operational, not contractual. |

## 3. Roles and Responsibilities

| Role | Held by | Responsibilities |
|---|---|---|
| Incident Commander (IC) | Eric Hathaway | Owns the active incident from declaration to closure. Calls the phase transitions. Maintains the journal. |
| Recovery Responder | Eric Hathaway | Executes recovery procedures (cross-reference LVL9-GOV-001 §11, LVL9-GOV-002 §13). |
| Communications Lead | Eric Hathaway | If external comms are needed (customer notice, vendor escalation), drafts and sends. |
| Post-incident Reviewer | Eric Hathaway | Within 7 days of closure, runs the Lessons-Learned phase (§9) and updates the relevant chassis docs. |
| Reviewer (external, on demand) | Reviewer under NDA | Reads the journal, samples evidence, verifies the program. |

The current operating environment is single-operator: all roles are held by the same person. The phase structure exists so role separation is straightforward when the team grows.

## 4. Incident Severity Tiers

Every declared incident receives a tier. The tier sets the response cadence and the lessons-learned commitment.

| Tier | Definition | Response cadence | Post-incident review |
|---|---|---|---|
| **SEV-1** | Customer-facing outage, data integrity event with customer impact, confirmed credential compromise, AI-agent destructive action that affected production | Immediate. Drop other work. | Mandatory written PIR within 7 days. |
| **SEV-2** | Operational outage with no customer impact (e.g. n8n down for an internal job), suspected (not confirmed) credential exposure, recurring Anti-Lie hook violations on a single agent | Within 4 hours of detection during operating hours; next morning out of hours. | Mandatory written PIR within 14 days. |
| **SEV-3** | Single-system warning (cost spike, single tripwire fire, single gate bypass) | Same operating day. | Brief journal note; PIR optional. |
| **SEV-4** | Informational (drift detection, advisory officer concern, single Anti-Lie hook fire that resolved on retry) | Acknowledged + journaled. | None required. |

An incident's tier may be **upgraded** during triage (a SEV-3 cost-spike that turns out to be a credential compromise becomes SEV-1) or **downgraded** after triage (a SEV-2 suspected leak that turns out to be a known-and-rotated credential becomes SEV-4). Tier changes are journaled.

## 5. Phase 1: Detect

### 5.1 Detection sources

| Source | What it detects | Channel |
|---|---|---|
| CMD-Health-Monitor | Stale agent heartbeat (>10 min); token spike | Slack |
| Workflow-Activity-Monitor | Stale critical workflow | Slack |
| Tripwire row-count check (LVL9-GOV-001 §8.1) | Unexpected row-count drop on `cmd_*` tables | Slack |
| Conductor (LVL9-GOV-002 §11) | Budget at 75% (warn) or 90% (pause) | Slack |
| Guard service (LVL9-GOV-001 §9) | Tier 1 destructive operation denied | Slack + `cmd_activity_log` |
| Anti-Lie hook (sibling chassis) | Agent attempted to claim done without verification | `cmd_law_violations` row + Stop-hook block |
| Vendor side (Cloudflare email, Vercel email, Supabase email, Anthropic email) | Vendor-issued security or billing alert | Email |
| Operator pattern noticing | Anything else | Operator-driven |

### 5.2 Entry criteria for Phase 2 (Triage)

An incident enters Phase 2 when the operator has:

1. Acknowledged the alert.
2. Opened (or claimed an existing) journal file at `commandos-center/runbooks/incidents/<YYYY-MM-DD>-<short-name>.md`.
3. Recorded the initial detection signal verbatim in the journal.

If the operator suspects the alert is a false positive, they may close the journal as **DISMISSED — false positive** with one-line justification. Dismissals are reviewed in the quarterly residual-risk review.

## 6. Phase 2: Triage

### 6.1 Triage questions (every incident)

Within 15 minutes of declaration:

1. **What is the impact?** Customer-facing? Internal-only? Cost-only?
2. **What is the blast radius?** One workflow? One project? Whole stack?
3. **Is it ongoing?** Has the cause stopped or is damage still accruing?
4. **Tier?** Apply §4. Record in journal.
5. **Who else needs to know?** Customer, vendor, partner? (See §10 for comms cadence.)

### 6.2 Triage outputs

| Output | Recorded where |
|---|---|
| Incident tier (SEV-1 to SEV-4) | Journal frontmatter |
| One-line impact statement | Journal frontmatter |
| Suspected cause (preliminary) | Journal body |
| Initial response decision | Journal body |
| If SEV-1 or SEV-2: a "what could go worse" hypothetical | Journal body — written explicitly to surface follow-on risks |

### 6.3 Triage decision tree

```
                            Detection alert
                                  │
                                  ▼
                  Is it a known false-positive pattern?
                       /                   \
                  Yes                       No
                   │                         │
              DISMISS                  Open journal
              (journal)                       │
                                              ▼
                                 Customer-facing impact?
                                    /                \
                                Yes                    No
                                 │                      │
                              SEV-1                Confirmed credential compromise?
                                                       /            \
                                                    Yes              No
                                                     │                │
                                                  SEV-1            Operational outage?
                                                                       /         \
                                                                    Yes           No
                                                                     │             │
                                                                  SEV-2     Recurring or single?
                                                                                /         \
                                                                            Recurring   Single
                                                                              │          │
                                                                           SEV-2      SEV-3 or SEV-4
```

### 6.4 Exit criteria for Phase 3 (Contain)

The operator has tier-classified the incident, recorded triage in the journal, and decided either:

- Proceed to Phase 3 (Contain), OR
- Skip to Phase 5 (Recover) for non-malicious operational outages where containment is not relevant (e.g. n8n container restart), OR
- Close as DISMISSED (false positive)

## 7. Phase 3: Contain

### 7.1 Containment principle

**Stop the bleeding before fixing the wound.** Recovery and root-cause analysis happen later. Containment first.

### 7.2 Containment actions by class

| Class | Containment action |
|---|---|
| **Suspected credential compromise** | Rotate the credential (LVL9-GOV-002 §10). Mark `cmd_secrets.is_valid=false` on the old. Update consumers. Verify no lingering use via `cmd_routing_log` queries. |
| **Confirmed credential compromise** | Rotate the credential **and** every credential it could have been used to issue (e.g. a compromised service-role key requires rotating every key it could have read out of `cmd_secrets`). Audit `cmd_activity_log` for unauthorized writes. |
| **Operational outage (compute layer)** | Don't restart immediately. Capture a snapshot first: `docker ps -a`, container logs, NAS dmesg, Mac Mini Console.app. Then restart per LVL9-GOV-002 §13. |
| **Operational outage (edge layer)** | Capture cloudflared logs. Verify tunnel auth blob hasn't expired. Capture Cloudflare dashboard alert detail before clicking through. Restart only after capture. |
| **Data integrity event** | Don't write to the affected table. Snapshot the current state. Compare against the most recent R2 backup. Decide restore vs. patch in Phase 4. |
| **Cost incident** | Pause the offending agent (`cmd_agents.status='paused'`) and the offending workstream (`cmd_budgets.tokens_used` set to the cap so Conductor declines further calls). |
| **AI-agent-integrity incident** | Pause the offending agent. Read every `cmd_law_violations` row from the past 24 hours for that agent. Read the agent's last 50 `cmd_routing_log` rows. Write findings to journal. |
| **Brand / legal incident (public-facing content shipped wrong)** | If the surface is editable (a Vercel-hosted page), revert via Vercel rollback (LVL9-GOV-002 §13.5) immediately. If the surface is published external (LinkedIn post, Substack), draft a correction. |

### 7.3 Exit criteria for Phase 4 (Eradicate)

- The cause is no longer doing damage.
- A snapshot of the affected systems (logs, row counts, dashboards) is in the journal.
- The operator has decided whether to proceed to Phase 4 (Eradicate root cause) or skip to Phase 5 (Recover) if no eradication is needed.

## 8. Phase 4: Eradicate

### 8.1 Eradication principle

**Remove the root cause, not just the symptom.** A compromised key is rotated AND the source of the leak is identified and closed.

### 8.2 Eradication actions by class

| Class | Eradication action |
|---|---|
| **Credential compromise (any)** | Identify the exposure source. Was the credential pasted in chat? In a commit? In a public log? Close the source: edit the commit history (or rotate forward and accept), redact the chat reference, fix the logging that exposed it. Update `cmd_secrets.notes` with the eradication action. |
| **Operational outage** | Identify the failure mode. Was it OOM? Healthcheck flap? Image regression? Patch: raise memory limit, fix healthcheck, pin image version. Cross-reference LVL9-GOV-002 §7 for the runtime topology. |
| **Data integrity event** | Identify the writer. Was it an agent that should not have had write access? Was it a guard-bypassed call? Was it a vendor-side replication issue? Close the writer: revoke the credential, narrow RLS, file a vendor case. |
| **Cost incident** | Identify the cost driver. Was it a runaway loop? A model misroute (Sonnet where Haiku would suffice)? A vendor price change? Patch: fix the loop, route to cheaper model, update `MODEL_RATES` in the cost-estimation table. |
| **AI-agent-integrity incident** | Identify the prompt or hook gap that allowed the false claim. Update the officer prompt or the verifier to catch the pattern. Cross-reference LVL9-GOV-004 §10 (injection defense) and the sibling Anti-Lie chassis. |
| **Brand / legal incident** | Identify why the gate did not catch it. Was `passesVoiceCheck()` not called? Was the site-cleaner agent not run at G3? Was the legal-attribution map missing for this site? Close the gap. |

### 8.3 Exit criteria for Phase 5 (Recover)

- Root cause is identified and patched OR explicitly accepted as residual risk in the journal.
- Reproduction (where applicable) confirms the cause is closed.
- The operator decides whether to proceed to Phase 5 (Recover the affected state) or skip if no recovery is needed.

## 9. Phase 5: Recover

### 9.1 Recovery principle

**Bring affected state back to known-good.** The procedures are owned by the sibling chassis docs.

### 9.2 Recovery procedures (cross-references)

| Recovery class | Procedure |
|---|---|
| Data integrity (Supabase) | LVL9-GOV-001 §11.2 |
| Data integrity (n8n Postgres) | LVL9-GOV-001 §11.3, LVL9-GOV-002 §13.6 |
| n8n container | LVL9-GOV-002 §13.1 |
| NAS reboot | LVL9-GOV-002 §13.2 |
| Mac Mini orchestrator | LVL9-GOV-002 §13.3 |
| Cloudflare Tunnel | LVL9-GOV-002 §13.4 |
| Vercel rollback | LVL9-GOV-002 §13.5 |
| Active-intrusion scenario | LVL9-GOV-001 §11.4 |
| Unauthorized destructive op | LVL9-GOV-001 §11.5 |

### 9.3 Recovery verification

After recovery, verify by:

1. Run the relevant on-demand health check (LVL9-GOV-002 §16.3).
2. Run a tripwire sweep manually: `bash ~/commandos-center/scripts/tripwire-rowcounts.sh`. Confirm no fire.
3. Sample 5 representative agent calls and verify `cmd_routing_log` rows look healthy.
4. Verify the restored data: row counts match the expected source, sample records match prior known-good values.
5. Resume any agents paused in Phase 3 (`cmd_agents.status='running'`).

### 9.4 Exit criteria for Phase 6 (Lessons-Learned)

- All affected systems verified healthy.
- Paused agents and workflows resumed (or deliberately retired).
- Journal updated with recovery confirmation timestamp and verification evidence.

## 10. Phase 6: Lessons-Learned (Post-Incident Review)

### 10.1 Cadence

| Tier | PIR commitment |
|---|---|
| SEV-1 | Mandatory written PIR within 7 days |
| SEV-2 | Mandatory written PIR within 14 days |
| SEV-3 | Brief journal note; PIR optional |
| SEV-4 | None required |

### 10.2 PIR template

A SEV-1 / SEV-2 PIR captures:

| Section | Content |
|---|---|
| **Summary** | One paragraph: what happened, when, impact, resolution. |
| **Timeline** | Detection → Triage → Contain → Eradicate → Recover. With timestamps. |
| **Root cause** | The actual root cause (not the symptom). Distinguish from triggering event. |
| **What worked** | Detection layers, defenses, controls that performed as designed. |
| **What did not** | Where detection lagged, where containment took too long, where the operator had to make a decision the runbook should have made. |
| **Open Issues created** | New GOV-N issues filed against the sibling chassis docs. |
| **Risk-acceptance changes** | Any limitation in the sibling chassis docs that this incident makes unacceptable. |
| **Recurrence risk** | Realistic assessment: could this happen again? At what cadence? |
| **Action items** | Time-bound, ownership-assigned. Track to closure. |

### 10.3 PIR distribution

The PIR is filed at `commandos-center/runbooks/incidents/<YYYY-MM-DD>-<short-name>-PIR.md` (private). Action items are mirrored into the relevant chassis doc's Open Governance Issues table.

### 10.4 Recurrence-prevention budget

A standing rule: **at least one PIR action item per quarter must be implemented.** Even if no SEV-1 or SEV-2 fires in a quarter, the operator reviews the open PIR action backlog and implements at least one. This forces the program to learn even in quiet quarters.

## 11. External Communications

### 11.1 When external communications are required

| Audience | Trigger | Channel |
|---|---|---|
| Affected customer | Confirmed customer-facing outage exceeding 1h, or any customer-data integrity event | Email; per LLC privacy policy if data is implicated |
| Vendor | Suspected platform-side issue requiring vendor support | Vendor support channel |
| Partner | If a partner-shared system is affected (rare) | Partner direct contact |
| Regulator | None at current scale (no regulated data classes) | N/A |

### 11.2 Communications principles

- **Lead with what is known.** Don't speculate.
- **State what is being done.** Containment status, ETA where realistic.
- **Don't promise recovery times under uncertainty.** If you don't know, say "investigation continuing; next update by [time]."
- **No marketing language.** "Our team is working diligently" reads as PR. Replace with "I am restarting the service now and verifying."

### 11.3 Drafts for review

If communications go to external parties, the draft is reviewed by the brand officer (cross-reference LVL9-GOV-003 §8.2) and the legal-tech officer before send. For SEV-1, the operator may waive review only if the delay would worsen impact.

## 12. Verification and Drills

### 12.1 Quarterly tabletop drill

Each quarter, the operator runs a tabletop drill: pick a hypothetical incident from §13 below; walk through Sections 5 to 10 without actually executing. Time the walkthrough. Output is a journal entry: where did the runbook fail? Where did the operator have to invent? Patch the runbook.

### 12.2 Annual live drill (one per year, scheduled)

Once per year, the operator runs a non-destructive live drill:

- Force a tripwire fire (LVL9-GOV-001 §12.2).
- Verify Slack alert lands.
- Run through Phase 1 to Phase 5 in real time.
- Restore state.
- File a PIR.

### 12.3 Annual unannounced drill (one per year, by surprise)

Once per year, the operator schedules a surprise drill via a delayed trigger (e.g. a future-dated cron that fires a synthetic alert at a random time within a month). Tests "is the program reachable when the operator did not expect it?"

## 13. Hypothetical Incident Scenarios (For Drill Use)

The following scenarios are for tabletop and drill purposes. They are not active incidents.

### 13.1 Scenario A: Anthropic API key exposed in a public repo

Detection: GitHub secret-scanning alert (vendor-side) hits operator email at 3pm Friday.

Walk through: Triage → tier (SEV-1 if confirmed) → Contain (rotate Anthropic key in `cmd_secrets`, update consumers, mark old `is_valid=false`) → Eradicate (revoke at Anthropic console; force-push to remove from history if recent; if old, accept and rotate forward) → Recover (verify all consumers using new key; verify guard reviewer + agent fleet operational) → Lessons-Learned (was the key in a config file that should have been gitignored? Was it pasted in a comment?).

### 13.2 Scenario B: n8n container OOM-killed in a loop

Detection: CMD-Health-Monitor alerts on stale agent heartbeats at 8am Sunday.

Walk through: Triage → tier (SEV-2, internal-only impact) → Contain (capture container logs before restart) → Eradicate (raise memory limit in `commandos-v2/docker/docker-compose.yml`; identify the workflow that triggered OOM; cap that workflow's batch size) → Recover (LVL9-GOV-002 §13.1) → PIR.

### 13.3 Scenario C: Tripwire fires on `cmd_secrets` row-count drop of 30%

Detection: Tripwire alerts at 11pm Tuesday.

Walk through: Triage → tier (SEV-1 if confirmed unauthorized) → Contain (do not write; snapshot current `cmd_secrets`; compare against last R2 backup) → Eradicate (identify writer via `cmd_activity_log`; revoke credential or close vector) → Recover (LVL9-GOV-001 §11.5 for unauthorized destructive op) → PIR.

### 13.4 Scenario D: AI agent claims completion of a deploy without verification

Detection: Anti-Lie hook blocks Stop on a session; `cmd_law_violations` row OPEN.

Walk through: Triage → tier (SEV-3 if single fire and resolved on retry; SEV-2 if recurring across sessions; SEV-1 if production was affected by a false-completion that downstream systems trusted) → Contain (pause the agent; review the last 50 `cmd_routing_log` rows for that agent) → Eradicate (identify the prompt gap or hook gap that allowed the claim; fix the prompt or harden the verifier) → Recover (resume agent only after fix verified) → PIR.

### 13.5 Scenario E: Conductor budget exceeds cap by 90% in 30 minutes

Detection: Conductor 90% pause fires; Slack alert.

Walk through: Triage → tier (SEV-2) → Contain (already paused by Conductor; verify pause is honored) → Eradicate (identify the runaway: which agent, which task type, which model? Cost-spike root causes are usually a missed early-exit, a model misroute, or a vendor price change) → Recover (raise the budget if the spike was justified, or fix the loop and reset) → PIR.

### 13.6 Scenario F: Cloudflare account terminated

Detection: Cloudflare email arrives at 6am Wednesday.

Walk through: Triage → tier (SEV-1; existential single-vendor concentration risk per LVL9-GOV-001 §14.5) → Contain (no contain possible; the bleeding is mid-event) → Eradicate (n/a) → Recover (DNS migration to alternate registrar; R2 alternative for backups — partial; tunnel alternative — Tailscale Funnel or a cloud-hosted ingress; CDN alternative per site — Vercel-side or alternate CDN) → PIR. (This scenario is the strongest argument for GOV-8 in LVL9-GOV-001: a second offsite.)

## 14. Known Limitations and Residual Risk

| Limitation | Residual risk | Mitigation considered |
|---|---|---|
| Single-operator response capacity. The IC, Recovery Responder, Communications Lead, and Post-incident Reviewer are the same person. | An incident that occurs while the operator is unreachable sees no response until they return. | Phase 3: a designated backup with break-glass access to 1Password and the on-call channels. |
| No formal incident-management tool. Journal is markdown files. | Coordination cost during a multi-hour incident; no automatic timeline reconstruction. | Acceptable at single-operator scale. |
| Tabletop drill cadence is quarterly. Live drill is annual. Unannounced drill is annual. | Limited muscle-memory drill on rare scenarios. | Quarterly drill expansion if portfolio grows. |
| External-comms drafting requires officer review (brand + legal-tech). For SEV-1, the operator may waive review if delay would worsen impact. | A poorly-worded customer notice could land worse than the incident. | The waiver is itself reviewed in PIR. |
| No automatic escalation if an incident exceeds an SLA target. The operator self-paces. | A multi-hour incident could exceed an internal SLA without explicit acknowledgment. | Phase 3: a journal-watcher workflow that flags any open journal older than 4 hours. |
| Vendor-side incidents (Cloudflare global outage, etc.) are not in this runbook beyond §13.6. | Vendor-side response depends on vendor cadence and our internal recovery plan. | Cross-reference LVL9-GOV-001 §14.5 vendor concentration register. |

## 15. Open Governance Issues

Continues numbering from LVL9-GOV-004 (which used GOV-29 through GOV-41).

| ID | Issue | Status | Owner | Target |
|---|---|---|---|---|
| GOV-42 | No designated backup operator with break-glass access. | Open. Phase 3. | Eric Hathaway | Phase 3 |
| GOV-43 | Journal-watcher workflow that flags journals older than 4h is designed but not deployed. | Open. | Eric Hathaway | Near-term |
| GOV-44 | Tabletop drill cadence is quarterly. Should expand to monthly when portfolio scales. | Open. Operator-tracked. | Eric Hathaway | Trigger on portfolio growth |
| GOV-45 | No formal incident-management tool integration (operator journal in markdown is the system of record). | Open. Acceptable at scale. | Eric Hathaway | If team grows |
| GOV-46 | External-comms drafting for SEV-1 may waive officer review. The waiver pattern is documented but not yet drilled. | Open. Add to next tabletop drill. | Eric Hathaway | Next quarterly drill |
| GOV-47 | Anti-Lie hook violation aggregation across sessions (incident-class detection) is detection-side; the cross-session aggregation lives in the sibling Anti-Lie chassis but the response classification (SEV-1 vs SEV-3) is operator-judged today. | Open. Add a violation-rate threshold that auto-tiers. | Eric Hathaway | Phase 3 |

## 16. Glossary

| Term | Definition |
|---|---|
| Incident Commander (IC) | The person who owns the active incident from declaration to closure. Currently the operator. |
| Tier | The severity classification (SEV-1 to SEV-4). |
| Phase | The position in the response lifecycle (Detect, Triage, Contain, Eradicate, Recover, Lessons-Learned). |
| PIR | Post-incident review. Written within the tier-specified window. |
| Tabletop drill | A non-destructive walkthrough of a hypothetical incident. Used to test the runbook. |
| Live drill | A real, non-destructive incident triggered by the operator. Used to test the response chain. |
| Unannounced drill | A surprise drill triggered by a delayed cron. Used to test reachability. |
| Containment | Stop the bleeding. |
| Eradication | Remove the root cause. |
| Recovery | Restore affected state to known-good. |
| Journal | The markdown file for the active incident. |

## 17. Appendix A: Incident Journal Template

Save as `commandos-center/runbooks/incidents/<YYYY-MM-DD>-<short-name>.md`.

```markdown
---
incident_id: <YYYY-MM-DD>-<short-name>
tier: SEV-<n>
detected_at: <ISO-8601>
declared_at: <ISO-8601>
ic: Eric Hathaway
status: open | contained | eradicated | recovered | closed | dismissed
class: security | operational | data-integrity | cost | ai-agent-integrity | brand-legal
---

## Summary
<One paragraph: what happened, when, impact, resolution.>

## Timeline

| Time | Phase | Action | Evidence / link |
|---|---|---|---|
| <ISO> | Detect | <signal verbatim> | <screenshot / log path> |
| ... | Triage | ... | ... |
| ... | Contain | ... | ... |
| ... | Eradicate | ... | ... |
| ... | Recover | ... | ... |

## Root cause
<Actual root cause. Distinguish from triggering event.>

## What worked
- ...

## What did not
- ...

## Open Issues created
- GOV-<n>: <one-line>

## Action items
| Item | Owner | Due | Status |
|---|---|---|---|
| ... | Eric Hathaway | YYYY-MM-DD | open |

## Risk-acceptance changes
<Any limitation in the chassis docs that this incident makes unacceptable.>
```

---

**Classified Internal · Shareable under NDA · © Eric Hathaway · Effective 2026-05-02**

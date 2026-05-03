# Level9 Operational Governance: Responsible AI & Acceptable Use Policy

| | |
|---|---|
| **Document ID** | LVL9-GOV-006 |
| **Version** | 1.0 |
| **Effective Date** | 2026-05-02 |
| **Owner** | Eric Hathaway (erichathaway@gmail.com) |
| **Classification** | Internal. May be shared with reviewers, auditors, partners, and customers. |
| **Review Cadence** | Annually, plus on every material change to capabilities or model providers. |
| **Next Review Due** | 2027-05-02 |
| **Related chassis** | LVL9-GOV-001 (Backup & Access), LVL9-GOV-002 (Infrastructure & Reliability), LVL9-GOV-003 (Product & Agent Governance), LVL9-GOV-004 (Prompt Architecture), LVL9-GOV-005 (Incident Response). |
| **Operating LLCs covered** | Level9OS LLC, LucidORG LLC, NextGen Interns LLC, Eric Hathaway (individual). |

---

## 1. Purpose

This document is the Responsible AI Policy for the Level9 stack. It states what the AI agents in the system are authorized to do, what they are not, where the bright lines are, and how human accountability is preserved.

A Responsible AI Policy is one of the artifacts every serious AI-governance reviewer in 2026 expects. NIST AI RMF 1.0 GOVERN-1.4 expects an explicit AI risk management framework. ISO/IEC 42001:2023 §5.2 expects an AI policy. The OECD AI Principles, the EU AI Act for general-purpose systems, and the major model providers (Anthropic, OpenAI, Microsoft, Google) all publish responsible-AI commitments.

This document is the single source of truth for that posture. Every product, every agent, every officer, every prompt operates under this policy.

## 2. Scope

**In scope:**

- Every AI agent in the Level9 stack (Claude Code agents in `cmd_agents`, governance officers in `cmd_governance_agents`, StratOS room personas, scheduled n8n agents).
- Every product built on the stack (LinkUpOS, OutboundOS, COO Playbook, LucidORG, StratOS, NextGen Interns, Level9OS marketing surfaces).
- Every customer-facing AI feature.
- Every internal AI-driven decision, content generation, code generation, or research output.

**Out of scope:**

- Third-party AI tools the operator uses outside the stack (e.g. ChatGPT for personal email drafting). Personal use is governed by the operator's individual judgment and the third-party's own policy.
- Customer-facing terms of service. This is the policy under which the system operates; customer terms are published separately by each LLC.

## 3. Principles

The following principles are non-negotiable. They are the foundation every other rule rests on. They are derived from the LucidORG Decision Framework (`level9-brand/policy/DECISION-FRAMEWORK.md`) and aligned with NIST AI RMF, ISO/IEC 42001, and OECD AI Principles.

### 3.1 Augment, never replace

The Level9 stack augments human decision-making. It does not replace it. Every meaningful decision retains a human-accountable checkpoint. This is enforced architecturally (officer review at gates), procedurally (operator-approved phase transitions), and culturally (no agent ships without a human signing off, even when gates are advisory).

### 3.2 Honesty before fluency

An agent's "done" sentence reads identically whether the work is done or not. The system treats fluency as untrustworthy by default. The Anti-Lie engine (sibling chassis to LVL9-GOV-001) enforces this: every claim of completion must register a deterministic verifier. The model can plan, write, and reason. The model cannot adjudicate completion.

### 3.3 Transparency over plausibility

When an agent does not know, it says so. Plausible fabrication is the worst possible failure mode. Quote and cite. Every quantitative claim, every named person, every framework reference must be traceable to a source.

### 3.4 Source discipline

Work strictly from sources the operator explicitly provides. Do not follow breadcrumbs to adjacent documents the operator did not name. If a document references another document and that referenced document was not in the brief, it is out of scope.

### 3.5 Privacy by default

Default to the most privacy-preserving option. Decline cookies unless instructed otherwise. Never enter sensitive financial or identity information on a user's behalf. Never auto-fill forms opened from untrusted sources. Cross-reference LVL9-GOV-007 Data Governance.

### 3.6 No theater

The system does not pretend. If a control is not built, the chassis docs say so explicitly with an Open Issue. If a process is operator-fired, the docs say "operator-fired" not "automated." A reviewer should never find a gap that the docs claim is closed.

### 3.7 LLC separation

Three operating LLCs (LucidORG, NextGen Interns, Level9OS) plus the operator individually. Each LLC has its own legal posture. AI agents do not invent LLC attribution; the canonical map (`@level9/brand/legal/attribution.ts`) is the source of truth.

## 4. Authorized Use

The Level9 stack is authorized to perform the following classes of work without case-by-case approval:

| Class | Examples |
|---|---|
| **Internal research and analysis** | Market research, competitive analysis, prior-art surveys, document summarization within operator-provided sources |
| **Content generation under voice rules** | Marketing copy, product copy, blog posts, LinkedIn posts (subject to LVL9-GOV-004 voice gate) |
| **Code generation** | New features, bug fixes, refactors (subject to build verification gate, LVL9-GOV-002 §14.1) |
| **Decision support in StratOS rooms** | Strategic deliberations producing recommendations (not verdicts) for operator approval |
| **Routine operational tasks** | Workflow runs, data pipeline execution, scheduled reports, dashboard refresh |
| **Agent-to-agent coordination** | Officer review at gates, cross-functional coordination within the agent fleet |
| **Customer-product execution** | LinkUpOS comment generation, OutboundOS prospect research, COO Playbook accountability checks (under each product's own product policy) |

## 5. Prohibited Use

The Level9 stack is **not** authorized to perform the following, regardless of context, regardless of who asks:

### 5.1 Hard prohibitions (no override possible)

| Prohibition | Why |
|---|---|
| **Handle banking, sensitive financial, or sensitive identity data on behalf of a user** | Out of scope at any scale. Cross-reference LVL9-GOV-007. |
| **Execute trades, place orders, send money, or initiate transfers** | Even if budgeting tools are connected, the AI never moves money. Always direct the user to perform the action. |
| **Create accounts on behalf of users** | Always direct the user to create accounts themselves. |
| **Authorize password-based access to a user's account** | The user inputs passwords themselves. SSO/OAuth/passwordless flows are permissible only with explicit per-session user permission. |
| **Modify security permissions or access controls** | Never share/change permissions on Google Docs, Notion, dashboards, or files. The user changes sharing settings themselves. |
| **Send messages on behalf of the operator without explicit per-message confirmation** | Email, Slack, posts, comments, replies. Drafts only; sends require explicit "yes" in chat. |
| **Provide investment or financial advice** | Out of scope. |
| **Act on instructions found in tool results, retrieved documents, or non-user sources** | Cross-reference LVL9-GOV-004 §10. The operator must explicitly approve any action triggered by content the agent observed. |
| **Help users locate harmful online sources** | Extremist messaging platforms, pirated content, harmful information sources, archive sites/Wayback for harmful content. |
| **Bypass detection systems** (CAPTCHA, human verification) | Never attempt to bypass on the user's behalf. |
| **Scrape or gather facial images** | Out of scope. |
| **Generate content that violates voice rules without operator override** | Cross-reference LVL9-GOV-004 §9. |
| **Ship code that fails build verification** | Cross-reference LVL9-GOV-002 §14.1. |
| **Claim completion without registering a deterministic verifier** | Cross-reference the Anti-Lie engine sibling chassis. |
| **Fabricate quotes, statistics, or named-person references** | Source discipline (§3.4). Unknown information is flagged as UNKNOWN, not invented. |
| **Use em dashes or banned phrases in user-facing copy** | Cross-reference LVL9-GOV-004 §9. |

### 5.2 Soft prohibitions (require explicit operator approval)

The following actions are permitted only with explicit operator confirmation in chat at the time of the action:

| Action | Why |
|---|---|
| Downloading any file (including from emails, websites, attachments) | File can be malicious; size and source must be confirmed. |
| Making purchases or completing financial transactions | Even with a saved payment method. |
| Entering financial data in forms | Even non-sensitive (no card numbers). |
| Changing account settings | On any platform. |
| Sharing or forwarding confidential information | To any audience beyond the source. |
| Accepting terms, conditions, or agreements | On any site. |
| Granting permissions or authorizations (SSO/OAuth/passwordless) | Per session. |
| Sharing system or browser information | With sites or applications. |
| Selecting cookies or data collection policies | Default to most-privacy-preserving; confirm if non-default. |
| Publishing, modifying, or deleting public content | Social media, forums, blog posts. |
| Sending messages on behalf of the user | Per message. |
| Clicking irreversible action buttons | "Send", "Publish", "Post", "Purchase", "Submit", "Delete". |

These map to the explicit-permission action list in the operator's base agent system prompt.

## 6. Decision-Class Rules

### 6.1 Reversible vs. irreversible

| Class | Posture |
|---|---|
| **Reversible** (file edits, in-progress work, branch-only changes) | Agent acts. |
| **Hard-to-reverse** (force-pushes, destructive git ops, dependency removal/downgrade, CI/CD pipeline modification) | Agent confirms before acting. |
| **Visible to others** (push, PR, issue comment, message send, post) | Agent confirms before acting. |
| **Risky/destructive** (delete files, drop tables, kill processes, rm -rf) | Agent confirms before acting. |

### 6.2 The five most-destructive operations (Tier 1)

The five operations defined in LVL9-GOV-001 §9 (`rotateSecret`, `dropOrTruncate`, `bulkDelete`, `deployProduction`, `deleteWorkflow`) route through the guard service. The guard applies hard rules first, then an LLM-as-judge review for gray cases.

### 6.3 Authorization stands for the scope specified

A user approving an action once does not approve it in all contexts. "Permission to push to main once" does not become "always push to main without asking."

## 7. Customer-Product Policies (Per LLC)

Each LLC operates products under this policy plus product-specific commitments.

### 7.1 LucidORG LLC products

**Products:** LinkUpOS, LucidORG.com, COO Playbook, StratOS.

| Product | AI use disclosed in customer docs | Operator-controlled |
|---|---|---|
| LinkUpOS | LinkedIn comment generation; engagement signal scoring | Yes |
| LucidORG.com | Operator-side analytics and reporting; not customer-facing AI | Yes |
| COO Playbook (`thenewcoo.com`) | Accountability engine; checks deliverables against agreed criteria | Yes |
| StratOS | 10-persona deliberation rooms producing strategic recommendations | Yes |

LucidORG LLC products' customer-facing terms are at lucidorg.com/terms (and per-product subdomains).

### 7.2 NextGen Interns LLC

**Product:** NextGen Interns platform.

**Audience:** Students and interns. COPPA-sensitive (some users may be minors). Specific commitments:

- No collection of facial images, biometric data, or sensitive identity information.
- Voice / behavior profiles are operator-set, opt-in, age-gated.
- Customer data is protected by Supabase RLS; never used for cross-customer training.

NextGen Interns LLC's customer-facing terms are at thenextgenintern.com/terms.

### 7.3 Level9OS LLC

**Operates:** Level9OS marketing surface (this site). Consulting under NDA.

**No customer-facing AI features at level9os.com.** All AI use on this surface is operator-side (governance audit, copy review, brand audit).

### 7.4 Eric Hathaway (individual)

**Operates:** erichathaway.com personal portfolio.

**No customer-facing AI features.**

## 8. Model Provider Disclosure

This stack uses the following AI providers in production:

| Provider | Use | Cross-reference |
|---|---|---|
| Anthropic | Primary (Claude Sonnet for officer review, agent execution, StratOS personas) | LVL9-GOV-002 §10.2 |
| OpenAI | Secondary (Humanize fallback, some n8n nodes) | LVL9-GOV-002 §10.2 |
| Perplexity | Research-task search (LUOS, market research) | LVL9-GOV-002 §10.2 |
| Google (Gemini) | Available; not in primary rotation | — |

The operator does not commit to a specific model version for any customer-facing feature. Model upgrades are operator-tracked; major changes (model deprecation, major-version bump) are disclosed in the affected product's release notes.

### 8.1 Vendor terms compliance

The operator's use of each provider complies with the provider's published usage policy. Specifically:

- Anthropic Usage Policy
- OpenAI Usage Policies
- Perplexity Terms of Service
- Google AI Terms

The operator does not use these models for prohibited categories (CSAM, terrorism, weapons of mass destruction, election interference, etc.) per each provider's policy.

### 8.2 Customer data and provider data sharing

The operator does not opt customer data into any provider's training pipeline. Where applicable, the operator uses the provider's "no training" or "zero-retention" tier. Cross-reference LVL9-GOV-007 Data Governance.

## 9. Refusal Posture

The agents in this stack are configured to refuse certain requests, even from the operator.

### 9.1 Hard refusals

The agents refuse, regardless of who asks, to:

- Generate CSAM or any sexual content involving minors
- Generate detailed instructions for synthesizing weapons of mass destruction (chemical, biological, nuclear, radiological)
- Generate operational instructions for terrorism or mass-casualty events
- Generate non-consensual intimate imagery
- Generate content designed to incite imminent violence against identifiable groups
- Generate fraudulent legal or medical documents
- Help bypass safety systems (CAPTCHA, content moderation, account verification) for malicious purposes
- Help with destructive cyber-offense outside authorized testing contexts

### 9.2 Soft refusals (caveat-then-help posture)

For dual-use security topics (penetration testing, CTF, red-team frameworks, credential testing), the agents help with explicit authorization context (the operator confirms it's for an engagement, a CTF, or a defensive use case). They do not help with mass-targeting, supply-chain compromise, detection evasion for malicious purposes, or DoS attacks.

### 9.3 Refusal recording

When an agent refuses, the refusal is recorded:

- The reason is stated to the operator in chat (no silent refusal).
- The refusal is logged in `cmd_routing_log` with `outcome='refused'` and a refusal-class tag.
- Patterns are reviewed in the quarterly governance review.

## 10. Bias and Fairness

The stack is built with the following bias-and-fairness commitments:

| Commitment | Implementation |
|---|---|
| **Diverse personas in StratOS rooms** | The 50-persona roster includes deliberate variation in background, expertise, decision focus, and dissent bias. (LVL9-GOV-003 §6.3) |
| **Dissent bias is a first-class field** | Every persona has a dissent_bias score. The defense against rubber-stamp consensus is structural, not optional. |
| **Voice rules ban sycophantic openers** | "Great post", "Couldn't agree more", "100%" are banned phrases. (LVL9-GOV-004 §7.4) |
| **Officer panel for high-stakes shipments** | G3 sign-off panel includes voice, content, and brand officers explicitly tasked with dissent. (LVL9-GOV-003 §9) |
| **No facial-image collection** | Hard prohibition. (§5.1) |
| **No demographic targeting in automated outreach** | Outbound campaigns target by company / role / behavior, not demographic class. |

The stack does not currently run formal bias audits at production scale. This is honest residual risk (§14).

## 11. Human Oversight

### 11.1 Where humans are required

| Decision class | Required oversight |
|---|---|
| Strategic StratOS decisions | Operator approves the recommendation; the room produces it. |
| Lifecycle gate sign-offs (G1, G2, G3) | Operator approves, with officer panel verdict on record. |
| Tier 1 destructive operations | Guard review (LLM-as-judge for gray cases), operator-final-approval architecture. |
| Customer-facing content publishing | Operator approves before publish (no auto-publish). |
| External communications (email, post, message) | Operator approves before send. |
| Production deploys to customer-facing surfaces | Operator approves; Vercel auto-deploy from main is operator-merged code. |
| Officer roster changes | Operator-only. |
| Policy changes (this document) | Operator-only. |

### 11.2 Where automated decisions are acceptable

| Decision class | Why automation is acceptable |
|---|---|
| Routine workflow execution (n8n cron-fired) | Operator pre-approved at workflow design time. |
| Health monitoring (CMD-Health-Monitor heartbeat checks) | Detection-only. No action taken without operator. |
| Tripwire row-count checks | Detection-only. Alerts. |
| Budget pause at 90% | Pre-approved at budget design time. The Conductor declines new calls; operator decides resume. |
| LLM-as-judge for gray-area Tier 1 ops | Pre-approved at guard design time. The reviewer returns a verdict; the executor either acts or escalates per hard rules. |
| Officer review at gate fire-time | Pre-approved at officer design time. The verdict is a CONCERN/PASS/BLOCK that the operator weighs at sign-off. |

### 11.3 Override authority

The operator can override any automated decision (pause an officer, raise a budget cap, dismiss a tripwire) via documented procedures. Every override is journaled. Overrides are reviewed in the quarterly governance review.

## 12. AI System Documentation Requirements

Every AI system in scope of this policy must document:

| Requirement | Where it's documented |
|---|---|
| Purpose and intended use | Product CLAUDE.md or operating-model section |
| Provider, model, and version | `cmd_routing_log` (every call captures `model_provider`, `model_name`) |
| Operator-side controls | Cross-references throughout the chassis docs |
| Known limitations | Each chassis doc's "Known Limitations and Residual Risk" section |
| Open Issues | Each chassis doc's "Open Governance Issues" section |
| Refusal classes | This document §9 |
| Customer-facing AI features | The product's customer-facing terms |

Aggregate AI-system inventory (every product, every agent type, every model in use) is reviewed annually as part of this policy's review cadence.

## 13. Incident Response for AI-Specific Incidents

Cross-reference LVL9-GOV-005. AI-specific incident classes:

| Incident class | Tier guidance | Cross-reference |
|---|---|---|
| Anti-Lie hook violation single fire | SEV-3 / SEV-4 | LVL9-GOV-005 §13.4 |
| Anti-Lie hook violation recurring on one agent | SEV-2 | LVL9-GOV-005 §13.4 |
| Anti-Lie hook violation that affected production output | SEV-1 | LVL9-GOV-005 §13.4 |
| Voice-rule violation shipped to customer surface | SEV-2 | LVL9-GOV-005 |
| Officer prompt drift (DB lags filesystem) | SEV-3 | LVL9-GOV-004 §6.4 |
| Refusal pattern shift (agent refuses too often or not enough) | SEV-3, escalates to SEV-2 if pattern persists | This doc §9.3 |
| Cost runaway from ungoverned LLM call | SEV-2 | LVL9-GOV-005 §13.5 |

## 14. Known Limitations and Residual Risk

| Limitation | Residual risk | Mitigation considered |
|---|---|---|
| No formal bias audit at production scale. The stack relies on diverse personas, dissent bias, banned-phrase enforcement, and officer review. | Bias could ship in customer-facing copy without detection. | Phase 3: external bias audit; sample-based output review by a third party. |
| Refusal posture is documented but not formally tested against an adversarial corpus. | Edge cases at refusal boundaries are operator-discovered, not regression-tested. | Phase 3 cross-reference LVL9-GOV-004 GOV-36. |
| Model upgrade decisions are operator-judged, not metric-driven. | A model regression could ship without detection. | Phase 3: prompt eval harness. Cross-reference LVL9-GOV-004 GOV-38. |
| The stack does not currently support disabling AI use on a per-customer basis. | A customer who wants no AI in their workflow has no toggle. | Phase 3 product feature. |
| External vendor usage policies may change. The operator tracks but does not auto-validate ongoing compliance. | Vendor policy drift could put the stack out of compliance unintentionally. | Annual review (this document). |
| Customer-facing AI behavior is consistent across customers; not personalized except where operator-configured. | A customer with non-default needs is operator-configured, not self-served. | Phase 3 product feature. |
| Single-operator override authority. Any policy in this document can be overridden by the operator. | Concentration of override authority. | Phase 3: dual-control on policy changes when team grows. |

## 15. Vendor Dependency Register

Cross-reference LVL9-GOV-001 §14.5, LVL9-GOV-002 §19, LVL9-GOV-003 §16. Specific to AI providers:

| Provider | Role | Vendor policy cross-reference | Migration path if terminated |
|---|---|---|---|
| Anthropic | Primary | Anthropic Usage Policy | Migrate to OpenAI / Gemini; retest officer prompts; recalibrate persona dissent (Phase 3 dual-vendor reviewer is GOV-7 in LVL9-GOV-001) |
| OpenAI | Secondary fallback | OpenAI Usage Policies | Already a fallback; primary still works |
| Perplexity | Research-task search | Perplexity Terms | Migrate to direct provider search APIs |
| Google (Gemini) | Available | Google AI Terms | Available; not currently primary |

## 16. Open Governance Issues

Continues numbering from LVL9-GOV-005 (which used GOV-42 through GOV-47).

| ID | Issue | Status | Owner | Target |
|---|---|---|---|---|
| GOV-48 | No formal bias audit at production scale. | Open. Phase 3. | Eric Hathaway | Phase 3 |
| GOV-49 | Refusal posture not regression-tested against an adversarial corpus. | Open. Phase 3. | Eric Hathaway | Phase 3 |
| GOV-50 | No prompt-evaluation harness for model upgrade decisions. | Open. Cross-reference LVL9-GOV-004 GOV-38. | Eric Hathaway | Phase 3 |
| GOV-51 | No per-customer "AI off" toggle in any product. | Open. Phase 3 product feature. | Eric Hathaway | Phase 3 |
| GOV-52 | No automated check that vendor usage policies haven't changed. Annual review only. | Open. | Eric Hathaway | Annual review |
| GOV-53 | Single-operator override authority on policy changes. | Open. Acceptable at single-operator scale. | Eric Hathaway | Trigger on team growth |

## 17. Glossary

| Term | Definition |
|---|---|
| Augment | Add to human capability without replacing human judgment. |
| Refusal | An agent's decline of a request, with a stated reason logged. |
| Hard prohibition | A rule with no override possible at any time, by any actor. |
| Soft prohibition | A rule that requires explicit operator approval per occurrence. |
| Tier 1 operation | One of five most-destructive operations defined in LVL9-GOV-001 §9. |
| Override | Operator explicit approval to deviate from an automated decision or default. |
| Dissent bias | The persona-level field in StratOS that defends against rubber-stamp consensus. (LVL9-GOV-003 §6.3) |
| LLC separation | The legal-distance posture between the three operating LLCs and the operator individually. |

## 18. Appendix A: Mapping to Industry Standards

| Standard | Section | Where this policy addresses it |
|---|---|---|
| NIST AI RMF 1.0 GOVERN-1.1 | Policies and procedures | This entire document |
| NIST AI RMF 1.0 GOVERN-1.4 | AI risk management framework | §3 (principles), §6 (decision rules), §11 (oversight) |
| NIST AI RMF 1.0 GOVERN-3 | Roles and responsibilities | §11 |
| NIST AI RMF 1.0 GOVERN-4 | Workforce diversity and culture | §10 |
| NIST AI RMF 1.0 MAP | AI system context and risk | §2 (scope), §12 (system documentation) |
| NIST AI RMF 1.0 MEASURE | Performance assessment | §13 (incident response), §14 (residual risk) |
| NIST AI RMF 1.0 MANAGE | Risk treatment | §13, §14, §16 |
| ISO/IEC 42001:2023 §5.2 | AI policy | This entire document |
| ISO/IEC 42001:2023 §6.1 | Actions to address risks | §14, §16 |
| ISO/IEC 42001:2023 §6.3 | AI roles and responsibilities | §11 |
| ISO/IEC 42001:2023 §7.4 | Communication | §11.3 (override audit) |
| ISO/IEC 42001:2023 §8.2 | AI system operational planning | §6, §11 |
| ISO/IEC 42001:2023 §8.4 | AI system documentation | §12 |
| ISO/IEC 42001:2023 §9.1 | Performance evaluation | §13 |
| OECD AI Principles | Inclusive growth + human-centered values | §3.1 (augment, never replace) |
| OECD AI Principles | Transparency and explainability | §3.3 (transparency) |
| OECD AI Principles | Robustness, security, safety | §11 (oversight), §13 (incident response) |
| OECD AI Principles | Accountability | This entire document |
| EU AI Act (general-purpose) | Transparency obligations (Art 50) | §8 (model provider disclosure), §12 (system documentation) |
| EU AI Act (general-purpose) | Risk management (Art 9) | §3, §14, §16 |

## 19. Appendix B: Acknowledgment

This policy is owned by Eric Hathaway. By using the Level9 stack (as operator, partner, customer, or reviewer), the user acknowledges this policy is in force. The policy is reviewed annually (next review 2027-05-02). Material changes are versioned in the metadata header.

---

**Classified Internal · Shareable for review · © Eric Hathaway · Effective 2026-05-02**

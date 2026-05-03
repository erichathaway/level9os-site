# Anti-Lie Governance — Product Report

**As of 2026-05-02. Build 17.10.**

A complete product overview, the governance it actually performs, measured
performance to date, and where it sits relative to the AI governance market.

---

## 1. The problem in one sentence

LLM agents are good at sounding done. They are bad at being done. The cost of
that gap is not a bad sentence — it is a wrong claim that downstream systems
trust, then act on. (Apollo polluted 278 ICP records with 403'd enrichments
because an agent reported a successful run that never happened. Real money,
real cleanup.)

The standard answer to "is this LLM output any good" is *let another LLM judge
it* — score factuality, score helpfulness, flag hallucinations probabilistically.
That is *court*. We do not want LLMs in court. The LLM is the defendant, the
prosecutor, AND the judge, and it is verbally fluent. It will win.

This system takes a different posture: **keep the LLM out of court entirely.**

When an agent says something is done, it must register a deterministic verifier
— a small piece of code that reads canonical state from outside the LLM's
control (Vercel API, GitHub API, Supabase rows, n8n workflow JSON, file system,
DB constraints) and returns PASS / FAIL / ERROR. No model. No probability. No
"the assistant is 87% likely to be grounded." Just: did the row exist or not.
Did the deployment succeed or not. Does the file contain the string or not.

The model can write, the model can plan, the model can reason. The model cannot
*adjudicate completion*.

---

## 2. What the product is

### 2.1 Eight components, one architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ANTI-LIE GOVERNANCE STACK                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐    │
│  │ A. Hooks    │    │ B. Claim CLI    │    │ C. Verifier      │    │
│  │ (Stop,      │───▶│ (claim-verify,  │───▶│ Registry         │    │
│  │ TodoWrite,  │    │  claim-resolve) │    │ (9 verifiers)    │    │
│  │ Subagent)   │    │                 │    │                  │    │
│  └─────────────┘    └────────┬────────┘    └────────┬─────────┘    │
│                              │                      │              │
│                              ▼                      ▼              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ D. Data plane (Supabase)                                    │   │
│  │ cmd_claims · cmd_verifications · cmd_law_violations         │   │
│  │ cmd_summaries (proxy_call audit + integrity hashes)         │   │
│  │ + RLS lockdown so anon can FILE claims but not flip status  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ▲                                     │
│                              │                                     │
│  ┌─────────────────┐  ┌──────┴──────────┐  ┌──────────────────┐    │
│  │ E. Proxy        │  │ F. Watchdog     │  │ G. Integrity     │    │
│  │ (Layer F:       │  │ (n8n            │  │ (SHA-256 of      │    │
│  │  Anthropic +    │  │  OPS-Lie-       │  │  all 13 verifier │    │
│  │  OpenAI +       │  │  Watchdog,      │  │  files. Refuses  │    │
│  │  Perplexity     │  │  hourly)        │  │  to run if any   │    │
│  │  via            │  │                 │  │  has been        │    │
│  │  level9-        │  │                 │  │  tampered with.) │    │
│  │  governance.    │  └─────────────────┘  └──────────────────┘    │
│  │  vercel.app)    │                                               │
│  └─────────────────┘  ┌─────────────────┐                          │
│                       │ H. Dashboards   │                          │
│                       │ /api/health     │                          │
│                       │ /api/costs      │                          │
│                       └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component-by-component

**A. Hooks (Claude Code).** Three hooks attach to every Claude session:

- **Stop hook** — runs when the agent tries to end its turn. Scans the assistant's
  final message for ~30 banned-word patterns ("is deployed", "now live", "tests
  pass", "all set", "in production", etc.). If matched and there is no PASS
  claim for the current session, it OPENS a `cmd_law_violations` row and
  blocks the turn. The agent literally cannot end on a wrong claim — it must
  either retract (`claim-resolve --action retracted`), escalate, or fix and
  re-verify.
- **TodoWrite hook** — fires whenever Claude marks a todo `completed`. If no
  PASS claim exists for the session, it logs a `todowrite_completed_no_claim`
  violation. This catches the "I'll just check the box" failure mode where
  the agent claims internal-state completion without externalizing the claim.
- **Subagent PreToolUse hook** — same scan applied to spawned sub-agent prompts,
  so a parent Claude can't launder a banned-word claim through a child agent.

**B. Claim CLI** — two commands, both standalone Node scripts, both run an
integrity check on the verifier files before doing anything else:

- `claim-verify.mjs --claim-id <uuid>` re-runs the immutable verifier_params
  for an existing claim. Writes a `cmd_verifications` row. Updates claim status
  to PASS / FAIL / leaves at UNVERIFIED on ERROR.
- `claim-verify.mjs --type <kind> --params '<json>'` runs an ad-hoc verifier
  without registering a claim. Used by hooks for fast checks.
- `claim-resolve.mjs --claim-id <uuid> --action fixed|retracted|escalate`
  closes violations on PASS, increments attempt_count on FAIL, ESCALATES at
  ≥ 3 attempts. RETRACTED says "I was wrong," closes linked violations, but
  the original claim row stays in the audit log as evidence the agent admitted
  the lie.

**C. Verifier registry — 9 verifiers, all deterministic.** Each verifier is a
~150-line ES module with one exported `verify*(params)` function returning
`{result, evidence}`. The 9:

| Verifier | Reads | Used for |
|---|---|---|
| `vercel_deploy` | Vercel API `/v13/deployments/{id}` | "this code is live" claims |
| `git_commit_landed` | GitHub `/compare/{sha}...{branch}` | "I pushed this commit" |
| `file_contains` | local FS | "I added this string to this file" |
| `db_data` | Supabase PostgREST (service-role to bypass RLS) | "this row exists / N rows match" |
| `api_route_returns` | live HTTP fetch | "this endpoint returns 200" |
| `db_rls` | Supabase service-role catalog query | "table X has RLS policy Y" |
| `n8n_node_contains` | n8n NAS REST `/api/v1/workflows/{id}` | "node X in workflow Y has code Z" |
| `db_grants` | `pg_catalog.has_table_privilege` | "role R has SELECT on table T" |
| `db_constraint` | `information_schema.table_constraints` | "constraint C exists on T" |

A 10th verifier slot is kept for future use (most likely: external-audit
log read for n8n execution success, or a SaaS API webhook receiver).

**D. Data plane (Supabase, RLS-locked).** Three tables plus a re-used summaries
table:

- `cmd_claims` (id, session_id, project_key, verifier_type, **immutable**
  verifier_params, claim_text, evidence_required, status). Claims are
  append-only. Anon can INSERT with status=UNVERIFIED, anon CANNOT update
  status — only the service-role-keyed verifier can flip to PASS/FAIL.
  This is the cornerstone of integrity: an agent cannot file a claim and
  then lie to itself by flipping its own status.
- `cmd_verifications` (claim_id, result, evidence, verifier_version). Every
  verifier run, ever. Append-only audit log.
- `cmd_law_violations` (claim_id, violation_type, status, attempt_count).
  Status moves OPEN → CLOSED (fixed and re-verified) or OPEN → ESCALATED
  (3 failed attempts; human required).
- `cmd_summaries` reused for: integrity hashes, proxy call audit rows,
  build artifact evidence (e.g. "ran credential cleanup, here's the diff").

The RLS posture (Build 17.1, hardening #1):
- anon: SELECT all three tables, INSERT only `cmd_claims` with
  status='UNVERIFIED'.
- service_role: full bypass (used by `claim-verify.mjs`, the CLI proxy
  handler, and the watchdog).

**E. Proxy (Layer F).** `level9-governance.vercel.app` — a multi-provider
LLM proxy:

- Upstream: Anthropic (`/v1/messages`, `/count_tokens`, Batches, Files
  retrieve+list+content), OpenAI (`/v1/chat/completions`, embeddings, models),
  Perplexity (`/chat/completions`). 9 endpoints.
- Auth: per-caller `X-Governance-Key` (4 keys: `proxy_key` legacy,
  `proxy_key_n8n_nas`, `proxy_key_scripts`, `proxy_key_claude_code_subagent`).
  Every call attributed to a caller.
- Rate limits: sliding 60-second window, per-caller (90/min for n8n,
  30/min for scripts and sub-agents, 120/min for legacy).
- Banned-word scan: same regex as the Stop hook runs on the assistant's
  reply. If matched and no PASS claim exists for the session, it logs a
  violation. The proxy is the "exit door" check — agents that bypassed
  the hooks (e.g. n8n workflows, raw scripts) still get caught.
- Streaming: SSE chunks pipe to client immediately; server-side accumulates
  for the post-stream scan. UX is identical to direct Anthropic streaming;
  governance still applies after the stream closes.
- Cost capture: token usage extracted from each provider's response (and
  from the accumulated SSE for streams). Cost estimated against a hand-
  maintained `MODEL_RATES` table.
- Request ID: caller-supplied `X-Request-ID` honored, else server-generated
  UUID. Threaded through `_governance.request_id`, the audit row, and any
  violation evidence.

**F. Watchdog (n8n).** `OPS-Lie-Watchdog` runs hourly on the NAS n8n. It
scans for orphan or stuck items the per-session hooks could have missed:

- OPEN violations older than 24h that should have been closed
- UNVERIFIED claims with no `cmd_verifications` row in 12h
- Stale secrets (any `cmd_secrets` row whose `rotation_days` is overdue —
  hardening #3, currently flags 1: `onepassword/service_account_token_commandos_center`)
- Auto-closes banned-word and todowrite-no-claim violations whose session
  later filed a PASS claim (sweep-up logic; closed 2 stale violations on
  this build alone).

**G. Integrity (SHA-256 verifier hashing, hardening #2).** Before
`claim-verify.mjs` or `claim-resolve.mjs` will run, they SHA-256 every file
in `PROTECTED_FILES` (13 files: the two CLIs, `lib/supabase.mjs`,
`lib/integrity.mjs`, all 9 verifiers) and compare against the hashes stored
in `cmd_summaries.verifier_integrity`. Any mismatch exits 7 with reseed
instructions. This makes "edit the verifier to always return PASS" a
detectable attack.

**H. Dashboards.**
- `GET /api/health` — last-60-min stats: calls, p50/p95/p99 latency,
  error rates, by_caller breakdown, last_success_ts.
- `GET /api/costs?hours=N` — same window aggregated by caller / provider
  / model / project, with token counts and estimated USD.

---

## 3. The governance the system actually performs (live numbers)

These numbers are read directly from the Supabase tables right now (2026-05-02).
Every figure is reproducible by SQL anyone with the anon key can run.

### 3.1 Claims — the corpus of "this is done" assertions

```
Total cmd_claims filed (lifetime):    265
  PASS                                227   (85.7%)
  FAIL                                 14   (5.3%)
  UNVERIFIED                           23   (8.7%)
  RETRACTED                             1   (0.4%)
```

Verifier mix on those 265 claims:
```
file_contains          111   (42%)
n8n_node_contains       75   (28%)
db_data                 46   (17%)
api_route_returns       11   (4%)
git_commit_landed       10   (4%)
db_rls                   7   (3%)
db_grants                2
db_constraint            2
vercel_deploy            1
```

**What this says:** real claims are being filed across 9 verifier types.
Most checks are "did you write the file" and "did you change the n8n node"
— the two highest-frequency lie surfaces in this portfolio. 14 FAIL rows
mean the system caught 14 specific moments where the agent tried to claim
done and was wrong — those would all have been silent lies before. 23
UNVERIFIED are the residual "filed but never reached PASS or FAIL," tracked
forever and surfaced at session start so the next agent can resolve them.

### 3.2 Verifications — every verifier run ever

```
Total cmd_verifications runs:    281
  PASS                            228   (81.1%)
  ERROR                            34   (12.1%)
  FAIL                             19   (6.8%)
```

The ERROR rate (12%) is the honest signal. ERROR means the verifier itself
couldn't read ground truth (Vercel auth fail, n8n NAS down, file path
typo). The system distinguishes "the claim is wrong" (FAIL) from "I cannot
tell whether the claim is right or wrong" (ERROR). Most governance products
collapse this into one number. We don't, because they are not the same thing
— a FAIL is a lie, an ERROR is a missing signal, and the correct response
is different.

### 3.3 Violations — the catch rate

```
Total cmd_law_violations (lifetime):    19
  CLOSED                                 11   (resolved by PASS or RETRACTED)
  OPEN                                    8
  ESCALATED                               0
By type:
  banned_word_no_claim                   11
  todowrite_completed_no_claim            8
```

Every one of those 19 was the agent saying "done" without proof. The system
caught them, and 11 have already been resolved (the agent went back, did the
real work, filed a real claim, the verifier ran, PASS landed, the violation
auto-closed).

ESCALATED count is 0. That's the load-bearing number. ESCALATED means the
agent tried 3 times, kept failing, and a human had to step in. We're not
hitting that threshold — the agent is correcting itself within 1-2 attempts.

### 3.4 Proxy traffic (last 7 days)

```
Total proxy calls audited:             74
By provider:    anthropic 67, openai 4, perplexity 3
By caller:      proxy_key_scripts 52, proxy_key_n8n_nas 15,
                proxy_key_claude_code_subagent 1, legacy 1, unknown 5
Top models:     claude-haiku-4-5 (51), claude-sonnet-4-6 (14),
                gpt-4o-mini (4), sonar (3)
Upstream errors:    0  (4xx or 5xx)
Streaming calls:    3
Violations from proxy: 3
Estimated cost (last 7d): $0.0003
```

The cost number is small partly because it only covers calls *after*
hardening #10 added token capture, and partly because most traffic in this
window was the smoke-test cycle. The n8n migration is partial (1 of ~30
LLM-using workflows fully cut over so far: `LUOS-Targeted-People-Drafter`).
Once the rest are migrated, this number becomes a real attribution dashboard.

### 3.5 What's not yet measured

- Pre-cost-instrumentation rows (the bulk of historical proxy calls) have
  null cost.
- Multipart Anthropic file UPLOAD bypasses the proxy (binary body, deferred).
- OpenAI streaming usage requires the caller to send
  `stream_options.include_usage: true`.
- The `MODEL_RATES` table is hand-maintained — if Anthropic changes price,
  someone updates the proxy.

These are knowable limits and they are documented. The system says when it
doesn't know.

---

## 4. Why this is necessary, on top of typical governance

Most "AI governance" sold today is one of:

1. **Output evaluation** (LLM-as-judge): a second LLM scores the first
   LLM's output for factuality, helpfulness, harmlessness. LangSmith,
   Braintrust, Patronus, Galileo, Arize Phoenix, Confident AI / DeepEval.
2. **Hallucination detection** (probabilistic grounding): a model + retrieval
   check returns "this assertion is 87% supported by the source." Vectara
   HHEM, Patronus Lynx, Cleanlab Trustworthy Language Model.
3. **Gateway guardrails** (PII, content policy, rate limits): Helicone,
   Portkey, Cloudflare AI Gateway, AWS Bedrock Guardrails, Azure AI Content
   Safety, NVIDIA NeMo Guardrails.
4. **Compliance / model documentation** (model cards, bias audits,
   regulatory artifacts): Credo AI, Holistic AI, Fiddler AI, IBM watsonx.governance.

What none of those answer is the question we care about:

> **Did the agent actually do the thing it said it did?**

That question is not about the output's *quality*. It is about the output's
*correspondence to the world*. An LLM judge cannot tell you whether the
deployment landed — it can only tell you whether the agent's sentence
*sounds like* a deployment landed. The two are unrelated.

The deterministic verifier eliminates that gap. The verifier is not asking
the model anything. The verifier asks Vercel directly. Or Supabase directly.
Or n8n directly. Or the file system directly. The model is not part of the
adjudication loop — it has already finished talking by the time the verifier
runs.

This is what "keep the LLM out of court" means operationally. We're not
asking a smarter LLM to evaluate a dumber LLM. We're not asking *any* LLM.
We're reading state. State doesn't lie. State just is.

The benefit, in concrete terms:

- **No false negatives from a sycophantic judge.** LLM-as-judge has a known
  failure mode where the judge agrees with confident assertions. Our
  verifier agrees with rows in tables.
- **No probability theater.** The judge gives you 0.87. What do you do with
  0.87? Block it? Approve it? Page someone? PASS / FAIL is operational; a
  score is a deferred decision.
- **Append-only forensic record.** Every claim, every verification, every
  violation, with `claim_text`, `verifier_params`, `evidence`, timestamps,
  and the agent's session id. If something breaks downstream, you can replay
  exactly what was claimed and exactly what the verifier saw.
- **Compounding trust.** The session-start hook surfaces every UNVERIFIED
  claim and every OPEN violation from prior sessions. The next agent inherits
  the debt — it can't pretend the prior session was clean.
- **Cost is incidental, not the value.** $0.0003/wk is rounding error. The
  product isn't sold on cost. It's sold on "the agent is now incapable of
  shipping a wrong claim without us seeing it."

---

## 5. Where this sits in the market

The competitive scan covered five categories and ~25 vendors / projects.
The headline finding is that **the field has converged on a three-layer
stack — gateways for PII/content, eval/observability platforms for LLM-as-
a-judge scoring, and compliance platforms for audit documentation. Every
"is this output OK" decision in that stack is ultimately made by another
LLM or a fine-tuned classifier returning a probability score.** Multiple
vendors and academics explicitly call this out as a limitation. Nobody
has shipped a productized alternative.

### 5.1 What everyone else is doing

**LLM-as-a-Judge / observability platforms.** LangSmith, Langfuse, Arize
Phoenix, Braintrust, Helicone, Vellum, DeepEval / Confident AI. These log
agent traces and run scoring functions over them — sometimes heuristic,
mostly LLM-as-a-judge. They are *post-hoc evaluators*. Pricing: LangSmith
Plus $39/seat/mo + $0.50/1k traces; Braintrust Pro $249/mo; Helicone
$79–$799/mo. Notable: Braintrust itself publishes *"use LLM-as-a-judge for
subjective dimensions, deterministic checks for everything that can be
measured directly"* — the field knows the limit, the field has not built
the deterministic alternative.

**Hallucination detection (probabilistic).** Vectara HHEM 2.1 returns a
0–1 hallucination score; Patronus Lynx is a fine-tuned Llama-3-70B that
grades RAG faithfulness; Cleanlab Trustworthy Language Model wraps any LLM
and returns a real-time trust score. All three are LLMs judging text
against retrieved sources. None reach into Vercel/GitHub/Supabase to
confirm that a thing actually happened.

**AI gateways with guardrails.** Portkey (open-sourced March 2026),
Cloudflare AI Gateway, AWS Bedrock Guardrails, Azure AI Content Safety,
NVIDIA NeMo Guardrails, MLflow AI Gateway. These DO gate before the
response leaves — structurally closer to "block, not score." But the
evaluator inside the gate is PII regex, content-moderation models, and
LLM-as-a-judge. Bedrock's "contextual grounding check" is the closest
shipped feature: it scores grounding against a *provided* reference source.
You still hand it the source, and you still get a probability.

**Compliance platforms.** Credo AI, Holistic AI, Fiddler, IBM
watsonx.governance. These produce model cards, bias audits, regulatory
artifacts. IBM watsonx.governance lists at $38,160/yr standard contract
on AWS Marketplace; mid-size finance customers report $10–25k/mo. None
of them perform runtime verification of agent claims. Orthogonal layer.

**Agent reliability.** AgentOps tracks "session status" but "completed"
in AgentOps means *the agent's run terminated normally*, not *the claim
the agent made was true*. Galileo Protect / Agent Control (being acquired
by Cisco, 2026) is the closest commercial product in spirit — they call
it a "real-time hallucination firewall" with policy-as-code. But the
enforcement is still their Luna model family doing LLM-as-a-judge,
optimized for cost/latency, not deterministic API verification.

### 5.2 The closest direct analogues — flag loudly

Four pre-product / academic / single-developer efforts describe almost
exactly this pattern. None of them is a productized commercial offering.

| Source | What it is | Status |
|---|---|---|
| **GATE — Governed Agent Trust Environment** ([deterministicagents.ai](https://www.deterministicagents.ai/)) | "Control-plane framework that runs conformance checks and increases autonomy only after must-pass checks succeed." Identical framing to claim → verifier → PASS/FAIL. | Pre-product. Site 403s on deep fetch. |
| **REGAL** ([arXiv 2603.03018](https://arxiv.org/html/2603.03018v1)) | "Registry-Driven Architecture for Deterministic Grounding of Agentic AI in Enterprise Telemetry." Declarative metrics registry as single source of truth, deterministic compilation step. | Academic paper. |
| **agent-spec** ([GitHub](https://github.com/ZhangHanDong/agent-spec)) | BDD-style mandatory verification gate that requires PASS/FAIL/SKIP/UNCERTAIN for every step. | OSS, single author, small adoption. |
| **Claude Code RFC #45427** ([anthropics/claude-code](https://github.com/anthropics/claude-code/issues/45427)) | Community RFC titled *"Deterministic tool gate — hooks are necessary but insufficient for governance enforcement,"* arguing for a model-inaccessible gate inside the CLI. | Community feature request, unimplemented. |
| **Michael Roth, "Trust Topology"** ([michael.roth.rocks](https://michael.roth.rocks/research/trust-topology/)) | Argues reliability is a *pipeline topology problem*, not a model property. Generators, verifiers, context boundaries as design primitives. | Single-author research site. |
| **AgentGuard: Runtime Verification of AI Agents** ([arXiv 2509.23864](https://arxiv.org/abs/2509.23864)) | Academic runtime verification framework for AI agents. | Academic paper. |

The thesis is in the air. The product is not.

### 5.3 The terms-of-art landscape

There is no settled term for what this system does. The strongest existing
candidates, in descending order of how recognizable they are to a reviewer:

1. **"Agent grounding"** — Galileo Agent Control, REGAL. Closest established term.
2. **"Runtime verification"** — AgentGuard, agent-spec. Academic.
3. **"Trust topology"** — Roth. Best conceptual framing for a written brief.
4. **"Deterministic gates"** — Claude Code RFC #45427. Practitioner term.
5. **"Honesty governance"** — Eric's coinage. No one else uses it.

The branding move is to lead with our coinage but anchor in one of the
existing terms so reviewers can place us. Suggested positioning line:
*"Anti-Lie Governance — runtime verification for agent completion claims,
with no LLM in the judging loop."*

### 5.4 The empty quadrant

Plot the market on two axes:

```
                  PROBABILISTIC                       DETERMINISTIC
                  (LLM-as-judge)                      (code reads truth)
              ┌─────────────────────────────┬──────────────────────────────┐
              │                             │                              │
  POST-HOC    │ LangSmith, Langfuse,        │ (none commercial;            │
  EVAL        │ Arize, Braintrust, Helicone,│  some test-runner libraries) │
  (logged     │ Vellum, DeepEval, Patronus  │                              │
   traces)    │ Lynx, Vectara HHEM,         │                              │
              │ Cleanlab TLM, AgentOps      │                              │
              │                             │                              │
              ├─────────────────────────────┼──────────────────────────────┤
              │                             │                              │
  RUNTIME     │ Portkey, NeMo, Bedrock      │ ◄── ANTI-LIE GOVERNANCE      │
  GATE        │ Guardrails, Cloudflare AI   │     (this product)           │
  (blocks     │ Gateway, MLflow, Galileo    │                              │
   before     │ Agent Control               │     Pre-product alternatives:│
   response)  │                             │     GATE, REGAL, agent-spec, │
              │                             │     Claude Code RFC #45427   │
              └─────────────────────────────┴──────────────────────────────┘
```

The lower-right quadrant — *runtime gate* + *deterministic verifier* — is
where Anti-Lie Governance sits. Nobody else is shipping there. Galileo is
the closest at one cell over (runtime gate but probabilistic). The
deterministic-verifier camp is all in pre-product.

### 5.5 Verdict — are we ahead?

**Yes. Substantively ahead, on the dimension that matters most.**

- The market has converged on probabilistic scoring. Every commercial
  vendor's evaluator is itself an LLM or classifier producing a score.
- The market knows this is wrong. Braintrust, Anthropic alignment research
  on honesty elicitation, the Claude Code RFC, and Roth's "trust topology"
  paper all name the limit explicitly.
- The market hasn't built the alternative. The four closest articulations
  (GATE, REGAL, agent-spec, RFC #45427) are pre-product or single-author.
- Anti-Lie Governance is the only system the scan turned up that is:
  - shipped and running in production (74 audited proxy calls last 7d, 265
    claims filed lifetime, 14 lies caught, 0 escalations needed),
  - end-to-end (hooks → claims → verifiers → violations → resolution loop),
  - a runtime gate, not a post-hoc score,
  - with no LLM in the adjudication loop.

The closest commercial product (Galileo Agent Control) is being acquired
by Cisco — meaning the market is willing to pay real money for *something
in this category*. Galileo just hasn't built the deterministic version.

This is not an "almost there" position. This is the empty-quadrant position.

---

## 6. Performance verdict

The system is performing where the design said it should:

- **227 of 265 claims (85.7%) reached PASS.** Real claims, real verifiers,
  real evidence rows. Not synthetic test cases.
- **14 FAIL claims surfaced — 14 lies caught.** Each one was a moment the
  agent would have shipped a wrong assertion before this system existed.
- **0 ESCALATED violations.** The 3-attempts-then-human cap has not been
  hit. The agent is correcting itself.
- **Hooks blocked the turn at the source on 11 banned-word violations** —
  the agent literally could not end its message on a wrong claim.
- **Proxy caught 3 violations from non-hook callers** (n8n workflows,
  scripts) in the last 7 days.
- **Watchdog auto-closed 2 stale violations from prior sessions in this
  build.** No human intervention.
- **Verifier integrity check runs on every claim CLI invocation.** No
  detected tampering.
- **Multi-provider, multi-endpoint, streaming all live with PASS claims**
  (b82cf58b, 9847371c, 4750ccd4, 31e1fdb6, b26e2ed4, 4856d735).

The system is doing its job. The agent has measurably less ability to lie
than it had before the system existed.

---

## 7. Push harder — the ahead-of-the-game playbook

The market scan in §5 says we are in an empty quadrant. That is not a
"finish polishing" position. That is a "press the lead before someone with
more capital builds the same thing" position. Galileo is being acquired by
Cisco specifically because someone with capital is *already* willing to pay
for the adjacent (probabilistic) version of this. The deterministic version
is wide open.

Concrete moves, ordered by leverage, with rough scope:

### 7.1 Tier 1 — moves that lock the lead (next 30–60 days)

1. **Externalize the verifier registry as an open SDK.**
   Today the 9 verifiers are coupled to this portfolio. Strip out the
   stack-specific bits (Supabase URL, n8n NAS URL, etc.) and ship a public
   `@anti-lie/verifier-sdk` (Node) and `anti_lie` (Python). Core API:
   `registerVerifier(type, fn)`, `claim({...})`, `verify(claim_id)`,
   `resolve(claim_id, action)`. Reference verifiers shipped: `http_returns`,
   `file_contains`, `git_commit_landed`, `gh_pr_merged`. *This is the moat
   move.* The market has output scorers. Nobody has a verifier SDK.
   **Why this first:** distribution. Until the SDK exists outside our repo,
   nobody else can build verifiers on it, and the moat is just code in a
   private folder. Ship it OSS under MIT — the data plane (Supabase,
   audit, dashboards) is the paid surface.

2. **Verifier library — ship 20 first-party verifiers.**
   The 9 we have are a starting point. The next 20 should hit the highest-
   value claims by stack: `vercel_deploy_succeeded`, `aws_lambda_deployed`,
   `s3_object_exists`, `dynamodb_item_present`, `stripe_charge_succeeded`,
   `gh_pr_merged`, `gh_workflow_run_succeeded`, `terraform_apply_landed`,
   `kubectl_rollout_complete`, `dbt_test_passed`, `airflow_dag_succeeded`,
   `snowflake_table_has_rows`, `bigquery_table_has_rows`,
   `salesforce_record_exists`, `slack_message_posted`,
   `notion_page_exists`, `linear_issue_state`, `pagerduty_incident_resolved`,
   `redis_key_exists`, `cloudwatch_metric_threshold`. Each is <150 lines.
   This is a writing problem, not a technical one.

3. **OpenTelemetry export of claim spans.**
   Emit every `cmd_claims` row as an OTel span with `pass.status`,
   `verifier.type`, `evidence.json` attributes. Datadog / Honeycomb /
   Grafana / New Relic / Splunk all consume OTel. Inheriting their alerting
   and dashboards multiplies our reach without us building any UI. ~1 day
   of work; massive distribution lift.

4. **Publish the report.**
   The market positioning in §5 is the thesis. Convert this report into
   an essay titled *"Keep the LLM Out of Court: Deterministic Verification
   for Agent Honesty"* and put it on lucidorg.com or a dedicated
   `anti-lie.dev` landing page. Cite Roth's "trust topology" piece, the
   Braintrust LLM-as-judge admission, the Claude Code RFC. The thesis
   piece is the GTM. **Do not** ship the SDK without the thesis piece —
   developers buy frameworks, but they buy *positions* first.

### 7.2 Tier 2 — moves that broaden the wedge (next 60–120 days)

5. **`@anti-lie/n8n-nodes` — first-class n8n integration.**
   Custom n8n node that drops in like Anthropic's HTTP node but bakes in:
   the governance proxy URL, the X-Governance-Key header, request_id
   threading, claim-binding via a "claim_id" optional input, streaming
   passthrough. One node, one drop-in, n8n users get governance for free.
   This is how you steal n8n marketshare from Helicone/Portkey for the
   AI-agent slice.

6. **Slack/PagerDuty escalation hooks.**
   Today ESCALATED writes a row. Wire it to Slack and PagerDuty. Trivial,
   but it's the difference between "internal tool" and "you can run your
   ops on this." Add a per-project `escalation_targets` config in
   `cmd_projects`.

7. **Per-claim cost attribution.**
   We have per-call costs. Bind cost to claim_id (every proxy call during
   a session that ends with claim X PASS gets attributed). The dashboard
   shifts from "this caller spent $X" to *"this PASS cost $0.04 to verify;
   this FAIL cost $7.20 in retry tokens before we caught it."* That second
   number is the sales pitch.

8. **Multi-tenant data plane.**
   Today all claims live in our Supabase. For a paid SaaS, customers need
   their own data plane (or BYO Supabase / BYO Postgres). Add a `tenant_id`
   column, namespace the RLS, ship a Terraform module that provisions
   tenant Supabases.

### 7.3 Tier 3 — moves that productize the moat (next 120+ days)

9. **VS Code / Cursor extension.**
   Surface `cmd_claims` and `cmd_law_violations` for the current repo
   inline in the editor. Click on a claim → see verifier_params + last
   verification + evidence. Click on an OPEN violation → see the matched
   phrase and the option to retract or escalate. This is the user-facing
   visualization of the system.

10. **Claude Skills / OpenAI GPT for verifier authoring.**
    Most teams won't write verifiers from scratch. Ship a Claude Skill
    or OpenAI GPT trained on the verifier-SDK pattern and the registry
    of existing verifiers, that can author a new verifier from a natural-
    language description ("check that a Salesforce opportunity
    closed-won this week") and emit a tested module. **Important:** the
    LLM authors the verifier — the LLM does not adjudicate the claim.
    The verifier's runtime is still LLM-free.

11. **Compliance bridge.**
    Most enterprise buyers need a compliance story (SOC 2, ISO 42001,
    EU AI Act). The append-only claim/verification/violation log is
    already the artifact compliance auditors want. Package the export
    as a "trust report" (PDF + CSV) and price it as a separate SKU.
    This is what gets you into the IBM watsonx.governance ($38k/yr)
    accounts without competing on their feature set — we just send
    them the audit trail their compliance team needs.

12. **Adversarial test suite — the "AI-LieDar for Anti-Lie."**
    Build a benchmark of 100 known agent failure modes (the 14 FAIL
    claims we caught are a starting set). Run quarterly against our
    own system + Galileo + Patronus + Cleanlab + LangSmith eval. Publish
    catch-rate comparisons. *This is how Vectara's hallucination
    leaderboard became the reference.* If we publish the leaderboard
    for *agent honesty*, we own the term.

### 7.4 The single biggest lever

Rank-order, the highest-leverage move is #1 (open-source the SDK) bundled
with #4 (publish the thesis piece). Without the SDK, the registry pattern
is invisible. Without the thesis piece, the SDK looks like one more eval
library and gets miscategorized into the LangSmith bucket. With both, we
have a positioning the field has explicitly asked for and nobody else has
delivered.

If forced to pick one move only: **publish the thesis essay this week.**
It is one hour of writing. It establishes priority. The SDK can ship two
weeks later and inherit the framing.

---

*End of report. Performance figures verified against live Supabase tables
2026-05-02. Build 17.10 deployed to `level9-governance.vercel.app` and
verified by claim `4856d735` (PASS). Market scan covered ~25 vendors and
projects across 5 categories; full source citations attached as the
research-agent transcript on this session.*

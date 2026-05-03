# AI Governance Market Research — Full Findings

**Scan date: 2026-05-02. Anti-Lie Governance product positioning research.**

The brief: research the AI governance / LLM trust & safety / hallucination-
detection / LLM-as-a-Judge market as of mid-2026, comparing against a system
(Anti-Lie Governance) that takes a fundamentally different approach — instead
of using a second LLM to RATE or JUDGE another LLM's output (probabilistic
scoring), it forces every "done" claim to register a deterministic verifier
(code that reads ground truth from canonical systems and returns PASS / FAIL
/ ERROR with no model in the loop). Framed as *"keep the LLM out of court"*
rather than *"let one LLM judge another LLM."*

Method: web search across 5 categories, ~25 vendors / projects, with citation
URLs for every direct claim.

---

## Category 1 — LLM-as-a-Judge / Observability Platforms

These platforms log agent traces and run scoring functions over them. Scoring
is either heuristic functions or LLM-as-a-Judge. They are *post-hoc evaluators*,
not runtime gates.

### LangSmith (LangChain)
SaaS tracing + evaluation platform. Evaluation runs as offline experiments or
as online "online evaluators" attached to traces. Not a runtime gate — by the
time an evaluator fires, the response has already shipped. Pricing: free 5k
traces/month, $39/seat/mo Plus tier with 10k included, $0.50/1k overage on
base traces, $5/1k on extended-retention traces.
[Source: LangSmith pricing](https://www.langchain.com/pricing)

### Langfuse
Open-source observability + evaluation. Self-host requires Clickhouse + Redis
+ S3. Paid cloud gates Prompt Playground and LLM-as-a-Judge behind a paywall.
Same offline / online judge model as LangSmith.
[Source: Langfuse alternatives FAQ](https://langfuse.com/faq/all/best-phoenix-arize-alternatives)

### Arize Phoenix / Arize AX
Phoenix is open-source (Apache 2.0, single Docker container). Arize AX is the
enterprise version. ML-observability heritage; deep evaluation primitives but
still LLM-judge or statistical scoring on logged spans.
[Source: Arize vs Langfuse comparison](https://arize.com/docs/phoenix/resources/frequently-asked-questions/langfuse-alternative-arize-phoenix-vs-langfuse-key-differences)

### Braintrust
Eval-first SaaS. Free tier: 1M trace spans / 10k scores. Pro: $249/mo
unlimited users + 50k scores. **Notably, Braintrust itself publishes the
clearest articulation of the LLM-judge limitation:** *"use LLM-as-a-judge for
subjective dimensions, deterministic checks for everything that can be
measured directly."* They name the limit. They have not built the deterministic
alternative.
[Source: Braintrust pricing](https://www.braintrust.dev/pricing)
[Source: Braintrust on LLM-as-a-judge](https://www.braintrust.dev/articles/what-is-llm-as-a-judge)

### Helicone
Started as proxy/observability. Pro $79/mo, Team $799/mo, 10k free requests.
**Explicitly has no built-in guardrails** — they own the proxy + logs layer
but do not adjudicate.
[Source: Helicone pricing](https://www.helicone.ai/pricing)
[Source: Helicone vs Portkey](https://www.truefoundry.com/blog/helicone-vs-portkey)

### Vellum / Humanloop / DeepEval (Confident AI)
- Vellum offers CI-style "quality gates" on prompts/workflows but the gates
  are LLM-judge or heuristic scores, not ground-truth verifiers.
- Humanloop is sunsetting after Anthropic's 2025 acqui-hire.
- DeepEval ships 50+ metrics (faithfulness, hallucination, bias, toxicity).
  Almost all are LLM-as-a-judge.

[Source: Vellum vs Humanloop](https://vellum.ai/blog/top-humanloop-alternatives-in-2025)
[Source: DeepEval](https://deepeval.com/)

### Mechanism summary for the category
Post-hoc, model-scored, probabilistic. None reach into Vercel / GitHub /
Supabase / n8n to confirm a thing actually happened. The decision authority
in every case is another LLM or a fine-tuned classifier.

---

## Category 2 — Hallucination Detection (Probabilistic Scorers)

### Vectara HHEM 2.1 + FaithJudge
Open model that returns a 0–1 hallucination score (<0.5 = hallucination).
Vectara also runs the public hallucination leaderboard. Ant Group's
finix_s1_32b currently leads at 1.8% hallucination rate (April 2026).
[Source: Vectara HHEM 2.1 blog](https://www.vectara.com/blog/hhem-2-1-a-better-hallucination-detection-model)

### Patronus Lynx
Fine-tuned Llama-3-70B that grades RAG answers True/False with a
chain-of-thought trace. Explicitly an LLM-as-a-judge — just a specialized one.
[Source: Patronus Lynx](https://www.patronus.ai/blog/lynx-state-of-the-art-open-source-hallucination-detection-model)

### Cleanlab Trustworthy Language Model (TLM)
Wraps any LLM and returns a real-time trustworthiness score per response.
Pay-per-token after a free allotment.
[Source: Cleanlab TLM FAQ](https://help.cleanlab.ai/tlm/faq/)

### Mechanism summary for the category
All three return a *probability* of hallucination. None say "I read the
canonical source of truth and confirmed PASS / FAIL." Even Lynx, which
checks an answer against retrieved chunks, is still a model judging text —
not code reading canonical state.

---

## Category 3 — AI Gateways with Guardrails

This is the structurally closest layer to Anti-Lie Governance — gateways
DO enforce *before* the response leaves. But the *evaluator inside* the
gate is still PII regex + content-moderation models + LLM-as-a-judge.

### Portkey
Open-sourced its gateway core (Apache, March 2026). Offers PII redaction,
jailbreak detection, policy filters at request/response time. Adds 20–40 ms
latency.
[Source: Portkey gateway via TrueFoundry](https://www.truefoundry.com/blog/helicone-vs-portkey)

### AWS Bedrock Guardrails
Closest thing to verification in the gateway tier — Bedrock's "contextual
grounding check" scores grounding and relevance against a *provided*
reference source on a 0–0.99 threshold. Still a probabilistic score; still
requires you to hand it the source.
[Source: Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-contextual-grounding-check.html)

### Cloudflare AI Gateway / Azure AI Content Safety
Similar input/output filtering layer. PII, content moderation, rate limiting.
Same probabilistic-evaluator-inside-the-gate pattern.

### NVIDIA NeMo Guardrails
Most "programmable" of the bunch. Colang DSL lets you wire input / output /
dialog / retrieval / execution rails. Can integrate Patronus Lynx as a
fact-checker rail — but the fact-checker is still an LLM judge.
[Source: NeMo Guardrails overview](https://docs.nvidia.com/nemo/guardrails/latest/about/overview.html)

### MLflow AI Gateway Guardrails
Block-or-sanitize at request and response time. Evaluator is itself an LLM
judging natural-language policies.
[Source: MLflow gateway guardrails blog](https://mlflow.org/blog/gateway-guardrails)

### Mechanism summary for the category
Gateways enforce *before* the response leaves, which is structurally closer
to the "gate, not score" framing Anti-Lie Governance uses. But the
evaluator inside is still PII regex + content-moderation models + LLM judge.
**None of them register a verifier that calls GitHub / Vercel / Supabase to
confirm a claim against canonical state.**

---

## Category 4 — Compliance / Governance Platforms

This layer is about *documentation* and *audit* of model behavior. It is
orthogonal to runtime verification — important for regulated industries
but does not adjudicate agent claims.

### Credo AI, Holistic AI, Fiddler
Policy orchestration / model card / bias-audit layer. Credo and Holistic
emphasize policy mapping and regulatory compliance (EU AI Act, NIST RMF).
Fiddler is monitoring + explainability.

### IBM watsonx.governance
Bundles 100+ compliance frameworks, bias/fairness monitoring. AWS Marketplace
lists a 12-month Standard contract at **$38,160/year** for 5 use cases /
25 users / 12k evaluations. Mid-size financial firms quoted at **$10–25k/mo**.
[Source: IBM watsonx.governance pricing](https://aws.amazon.com/marketplace/pp/prodview-uimsd4w2w4okq)

### Mechanism summary for the category
These produce model cards, regulatory artifacts, and audit reports. They do
not perform runtime verification of agent claims. **Orthogonal to Anti-Lie
Governance** — but interesting as a future bridge: the append-only
claim/verification/violation log is *exactly* the kind of artifact a
compliance auditor wants. Could be packaged as a "trust report" SKU later.

---

## Category 5 — Agent Reliability / "Did the Agent Actually Do It?"

This is the most important category for the report. Closest spirit-match
to Anti-Lie Governance. Almost no commercial product covers it.

### AgentOps
SDK that instruments agent sessions and reports session status (pending /
in-progress / completed / failed) with cost / latency / success-rate
metrics. **Critical limitation:** "completed" in AgentOps means *the agent's
run terminated normally* — not *the claim the agent made was true*.
[Source: AgentOps docs](https://docs.agentops.ai/)

### Galileo Protect / Agent Control (being acquired by Cisco, 2026)
Closest commercial product in spirit. Self-described as a "real-time
hallucination firewall" using their Luna model family. Agent Control adds
policy-as-code: *"policies can enforce citation requirements, cross-reference
against known good data, or require confidence thresholds before allowing
certain responses."* The framing is identical to the Anti-Lie thesis —
**but the enforcement is still ML-model-driven** (Luna is an LLM-as-a-judge
optimized for cost/latency), not a deterministic API verifier.

The Cisco acquisition is a strong market signal: someone with capital is
willing to pay real money for *something* in this category. The
deterministic version is wide open.
[Source: Galileo Protect launch](https://www.prnewswire.com/news-releases/galileo-introduces-protect-a-real-time-hallucination-firewall-to-safeguard-enterprise-generative-ai-302134284.html)
[Source: Galileo Agent Control](https://thenewstack.io/galileo-agent-control-open-source/)

---

## The Closest Direct Analogues — Flag Loudly

Four pre-product / academic / single-developer efforts describe almost
exactly the Anti-Lie Governance pattern. **None of them is a productized
commercial offering.**

### GATE — Governed Agent Trust Environment
Self-describes as a *"control-plane framework"* that *"runs conformance
checks and increases autonomy only after must-pass checks succeed"* with
*"enforceable tool and memory boundaries"* and *"evidence-first operations."*
The framing is identical to the claim → verifier → PASS/FAIL pipeline. The
site (deterministicagents.ai) returned 403 to deep fetch, so adoption
signals are unclear, but the term *"Governed Agent Trust Environment"* and
*"deterministic agents"* are explicit.
[Source: deterministicagents.ai](https://www.deterministicagents.ai/)

### REGAL — Registry-Driven Architecture for Deterministic Grounding of Agentic AI in Enterprise Telemetry
*"A declarative metrics registry serves as the single source of truth …
with a deterministic compilation step."* Academic paper, not productized.
[Source: arXiv 2603.03018](https://arxiv.org/html/2603.03018v1)

### Agent-Spec
BDD-style *"mandatory verification gate"* that requires PASS/FAIL/SKIP/
UNCERTAIN for every step. Open source, single author, small adoption.
[Source: agent-spec on GitHub](https://github.com/ZhangHanDong/agent-spec)

### AgentGuard: Runtime Verification of AI Agents
Academic runtime verification framework. Pre-product.
[Source: arXiv 2509.23864](https://arxiv.org/abs/2509.23864)

### Anthropic Claude Code RFC #45427
Community RFC titled *"Deterministic tool gate — hooks are necessary but
insufficient for governance enforcement,"* arguing for a *"deterministic,
model-inaccessible gate … inside the CLI process to be immune to model
self-modification."* This is exactly the Anti-Lie thesis, articulated by
another practitioner against Claude Code itself. Unimplemented.
[Source: Claude Code RFC #45427](https://github.com/anthropics/claude-code/issues/45427)

### Michael Roth — "Reliability Is Not a Model Property — Trust Topology"
Best academic framing for written briefs. Argues reliability is a *"pipeline
topology problem,"* not a model property. Introduces *generators, verifiers,
context boundaries* as the design primitives. Quote-worthy line:

> *"Distributed systems researchers solved a similar problem by making
> reliability a protocol property, not a node property."*

[Source: Michael Roth, Trust Topology](https://michael.roth.rocks/research/trust-topology/)

### Anthropic alignment / honesty research
Anthropic alignment team has published on honesty elicitation and
lie-detection in LLMs ([Anthropic honesty elicitation](https://alignment.anthropic.com/2025/honesty-elicitation/)).
Academic paper *"AI-LieDar: Examine the Trade-off Between Utility and
Truthfulness in LLM Agents"* documents the failure mode (NAACL 2025).
[Source: AI-LieDar paper](https://aclanthology.org/2025.naacl-long.595.pdf)

These all confirm the *problem* is well-documented in research. **No
productized solution targets it.**

---

## Direct Answers to the 5 Research Questions

### Q-A: Anyone doing deterministic verifier-based detection?
**Almost nobody commercially.** The category is overwhelmingly probabilistic /
model-scored. Closest commercial: **Galileo Agent Control** (still Luna-model-
driven). Closest in spirit: **GATE / deterministicagents.ai** and **REGAL**
(academic / pre-product). The Claude Code RFC #45427 confirms practitioners
*want* this and don't have it.

### Q-B: Anyone treating the proxy / gateway as a gate, not a score?
Yes — gateways (Portkey, Bedrock, NeMo, MLflow) do gate before response.
**But the gate's evaluator is itself an LLM / regex / moderation classifier**
— not a registry of code-based verifiers reading canonical state. None of
them log a *claim*, register a *verifier*, and refuse to close the
conversation until PASS.

### Q-C: Anyone targeting agent honesty about completion specifically?
**No one commercially.** The field is overwhelmingly focused on *single-message
factuality* (RAG faithfulness, jailbreak, PII, toxicity). The "agent says
deployed when it didn't deploy" failure mode is well-documented in research
(Anthropic alignment, AI-LieDar, "Can LLMs Lie?") but no productized solution
targets it.

### Q-D: What does the field call this problem?
No settled term of art. Strongest candidates, descending preference:

1. **"Agent grounding"** (Galileo Agent Control, REGAL) — closest established term.
2. **"Runtime verification"** (AgentGuard, agent-spec) — academic.
3. **"Trust topology"** (Roth) — best conceptual framing.
4. **"Deterministic gates"** (Claude Code RFC #45427) — practitioner term.
5. **"Honesty governance"** (your coinage) — no one else uses it. The novelty
   is a feature, but pair it with *"agent grounding"* or *"runtime verification"*
   so reviewers can place it.

### Q-E: Pricing signals
- **Per-trace / per-call**: LangSmith ($2.50/1k base, $5/1k extended);
  Helicone ($1/10k after free); Cleanlab TLM (per-token).
- **Per-seat**: LangSmith Plus $39/seat/mo. Most others use unlimited-seat.
- **Flat tier**: Braintrust Pro $249/mo; Helicone Team $799/mo; Galileo /
  Patronus / Vectara enterprise = "contact us."
- **Enterprise contracts**: IBM watsonx.governance $38k/yr standard,
  $10–25k/mo for finance accounts.
- The compliance tier (Credo, Holistic, Fiddler, IBM) is **10–100×** the
  eval tier in price.

---

## Where the Market Is vs. Where Anti-Lie Governance Sits

The mid-2026 market has converged on a **three-layer stack**:

1. **Gateways** do moderation and PII at the edge.
2. **Eval / observability platforms** run LLM-as-a-Judge over logged traces.
3. **Governance platforms** produce model cards and audit trails for regulators.

All three layers are *probabilistic at their core*: every "is this output OK"
decision is ultimately made by another LLM (or a fine-tuned classifier)
producing a score. **Every vendor knows this is a problem** — Braintrust,
Anthropic, and Roth all explicitly call out the limit — **but none has
shipped a productized alternative.**

### The Empty Quadrant

```
                    PROBABILISTIC                   DETERMINISTIC
                    (LLM-as-judge)                  (code reads truth)
                ┌────────────────────────────┬──────────────────────────┐
                │                            │                          │
  POST-HOC      │ LangSmith, Langfuse,       │ (none commercial; some   │
  EVAL          │ Arize, Braintrust,         │  test-runner libraries)  │
  (logged       │ Helicone, Vellum,          │                          │
   traces)      │ DeepEval, Patronus Lynx,   │                          │
                │ Vectara HHEM, Cleanlab     │                          │
                │ TLM, AgentOps              │                          │
                │                            │                          │
                ├────────────────────────────┼──────────────────────────┤
                │                            │                          │
  RUNTIME       │ Portkey, NeMo, Bedrock     │ ◄── ANTI-LIE GOVERNANCE  │
  GATE          │ Guardrails, Cloudflare AI  │     (this product)       │
  (blocks       │ Gateway, MLflow, Galileo   │                          │
   before       │ Agent Control              │     Pre-product:         │
   response)    │                            │     GATE, REGAL,         │
                │                            │     agent-spec,          │
                │                            │     Claude Code RFC      │
                │                            │     #45427               │
                └────────────────────────────┴──────────────────────────┘
```

Anti-Lie Governance occupies an empty quadrant: a *gateway-style runtime
gate* (like Portkey or NeMo) wired to a *deterministic verifier registry*
(like REGAL or GATE), targeted at *agent completion claims* (what AgentOps
measures structurally but doesn't verify semantically), with *no LLM in the
judging loop* (the explicit gap Braintrust and Roth name).

The closest commercial product in spirit is **Galileo Agent Control**, but
Galileo's enforcement is still model-driven. The closest framework
articulations (GATE, REGAL, agent-spec, RFC #45427) are pre-product or
single-author.

---

## One-Line Positioning (for reports, decks, GTM copy)

> **The field scores the model's words. Anti-Lie Governance verifies the
> model's claims against canonical state, and the LLM doesn't get a vote.**

---

## All Citations (Single List, for Reference)

1. https://www.langchain.com/pricing — LangSmith pricing tiers
2. https://langfuse.com/faq/all/best-phoenix-arize-alternatives — Langfuse comparison
3. https://arize.com/docs/phoenix/resources/frequently-asked-questions/langfuse-alternative-arize-phoenix-vs-langfuse-key-differences — Arize vs Langfuse
4. https://www.braintrust.dev/pricing — Braintrust pricing
5. https://www.braintrust.dev/articles/what-is-llm-as-a-judge — Braintrust on LLM-as-judge limits
6. https://www.helicone.ai/pricing — Helicone pricing
7. https://www.truefoundry.com/blog/helicone-vs-portkey — Gateway comparison
8. https://vellum.ai/blog/top-humanloop-alternatives-in-2025 — Vellum / Humanloop status
9. https://deepeval.com/ — DeepEval / Confident AI
10. https://www.vectara.com/blog/hhem-2-1-a-better-hallucination-detection-model — Vectara HHEM 2.1
11. https://www.patronus.ai/blog/lynx-state-of-the-art-open-source-hallucination-detection-model — Patronus Lynx
12. https://help.cleanlab.ai/tlm/faq/ — Cleanlab TLM
13. https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-contextual-grounding-check.html — AWS Bedrock Guardrails
14. https://docs.nvidia.com/nemo/guardrails/latest/about/overview.html — NVIDIA NeMo Guardrails
15. https://mlflow.org/blog/gateway-guardrails — MLflow Gateway Guardrails
16. https://aws.amazon.com/marketplace/pp/prodview-uimsd4w2w4okq — IBM watsonx.governance pricing
17. https://docs.agentops.ai/ — AgentOps docs
18. https://www.prnewswire.com/news-releases/galileo-introduces-protect-a-real-time-hallucination-firewall-to-safeguard-enterprise-generative-ai-302134284.html — Galileo Protect launch
19. https://thenewstack.io/galileo-agent-control-open-source/ — Galileo Agent Control
20. https://www.deterministicagents.ai/ — GATE
21. https://arxiv.org/html/2603.03018v1 — REGAL paper
22. https://github.com/ZhangHanDong/agent-spec — agent-spec on GitHub
23. https://arxiv.org/abs/2509.23864 — AgentGuard paper
24. https://github.com/anthropics/claude-code/issues/45427 — Claude Code RFC #45427
25. https://michael.roth.rocks/research/trust-topology/ — Trust Topology essay
26. https://alignment.anthropic.com/2025/honesty-elicitation/ — Anthropic honesty research
27. https://aclanthology.org/2025.naacl-long.595.pdf — AI-LieDar paper

---

## Methodology Notes

- Searches conducted via WebSearch + WebFetch (Anthropic search tooling) on
  2026-05-02.
- Each vendor / project cross-referenced with at least one third-party source
  where possible (e.g. TrueFoundry comparison blogs, AWS Marketplace listings,
  arXiv papers).
- Pricing figures captured at scan date; subject to change.
- One source (deterministicagents.ai for GATE) returned 403 on deep fetch;
  framing inferred from the search-result snippet only. Flagged in the
  body text. Anyone using GATE as a citation should attempt direct contact.
- Categories defined by the brief; some products span multiple (e.g.
  Helicone is both gateway and observability). They are placed under the
  primary category.

---

*End of market research findings. Companion document to REPORT.md (the full
product overview + positioning report).*

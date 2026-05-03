# Commandos Prompt — Strategic Report from Anti-Lie Governance Corpus

**Purpose: produce an independent strategic synthesis from the same corpus
that NotebookLM will be given. Outputs from this run will be compared to
NotebookLM's output side-by-side as a quality test.**

---

## Mission

You are tasked with reading a research corpus on the AI agent governance
market — specifically the "agent honesty / agent lying" detection problem
— and producing a strategic positioning report. A system called **Anti-Lie
Governance** has been built that takes a deterministic-verifier approach
(no LLM-as-a-judge, no probability scoring; instead, code reads canonical
state from external systems and returns PASS/FAIL/ERROR). The corpus
contains:

- One synthesized strategic report already written by Claude (REPORT.md).
- One Claude+WebSearch market scan (MARKET-RESEARCH.md, 27 citations).
- One comparative analysis of two Perplexity research calls
  (PERPLEXITY-RESEARCH.md).
- One file of 18 targeted Perplexity sonar-pro queries with raw outputs and
  150 citations (PERPLEXITY-RAW-RESEARCH.md).
- Two raw Perplexity response files (sonar-reasoning-pro and
  sonar-deep-research).

Your job is **not to summarize** what is already there. Your job is to
**synthesize an independent strategic answer** to the question:

> *Where does Anti-Lie Governance sit in the 2026 AI agent governance
> market, and what should the operator (Eric Hathaway) do about it?*

The independent value you must add: pattern detection across the corpus,
contradiction-finding, gap-finding, and a sharper strategic recommendation.
A reader comparing your output to NotebookLM's must be able to see
specifically where your synthesis went deeper or differed.

---

## The Corpus

**Single bundled file (recommended):**

- `/Users/erichathaway/claude code 1/level9-governance/CORPUS.md`
  — 194 KB, 2,856 lines. Concatenation of all 6 source documents below
  with section dividers. Read this one file and you have everything.

**Or read the individual source files:**

1. `/Users/erichathaway/claude code 1/level9-governance/REPORT.md`
   (37.6 KB) — Claude's prior synthesis. Strategic positioning, performance
   numbers, push-harder playbook.
2. `/Users/erichathaway/claude code 1/level9-governance/MARKET-RESEARCH.md`
   (22.3 KB) — Claude+WebSearch market scan with 27 citations.
3. `/Users/erichathaway/claude code 1/level9-governance/PERPLEXITY-RESEARCH.md`
   (22.4 KB) — Comparative analysis of Perplexity outputs vs Claude scan.
4. `/Users/erichathaway/claude code 1/level9-governance/PERPLEXITY-RAW-RESEARCH.md`
   (73.8 KB) — 18 targeted Perplexity queries, raw outputs, 150 citations.
5. `/Users/erichathaway/claude code 1/level9-governance/perplexity-deep-research-content.md`
   (7.7 KB) — sonar-reasoning-pro raw response.
6. `/Users/erichathaway/claude code 1/level9-governance/perplexity-deep-research-DEEP-content.md`
   (24.5 KB) — sonar-deep-research raw response.

---

## What you must produce

A single markdown document (~3,000–5,000 words) containing **all eight
sections below, in order**. Save your output to:

`/Users/erichathaway/claude code 1/level9-governance/COMMANDOS-REPORT.md`

### Section 1 — Headline verdict (≤ 150 words)

In one paragraph: where does Anti-Lie Governance sit in the market? Ahead /
catching up / behind. State this directly, with no hedging. Cite the corpus
to support your verdict (specific section names or quotes).

### Section 2 — Triangulation (~ 500 words)

Three independent research streams contributed to the corpus:
- Claude+WebSearch (MARKET-RESEARCH.md)
- Perplexity sonar-reasoning-pro (perplexity-deep-research-content.md)
- Perplexity sonar-deep-research (perplexity-deep-research-DEEP-content.md)
- Perplexity sonar-pro × 18 targeted queries (PERPLEXITY-RAW-RESEARCH.md)

Identify the **three load-bearing claims that all four streams agree on**.
Identify **at least two specific places where the streams contradict each
other or disagree on facts** — and adjudicate which version is more likely
correct. Quote directly from the corpus (with the source file named) for
each claim and contradiction.

### Section 3 — Vendor-by-vendor mechanism table (large)

Build a single comparative table covering every vendor named in the corpus.
Columns: vendor / product / mechanism (probabilistic LLM-judge | classifier
| deterministic | hybrid) / pricing tier (eval | gateway | compliance) /
2024-2026 funding signal / explicit URL citation from the corpus / notes.

Vendors to cover (at minimum): LangSmith, LangChain, Langfuse, Arize AI,
Phoenix, Braintrust, Helicone, Patronus AI, Galileo / Rungalileo, Vellum,
Humanloop, DeepEval, Confident AI, Vectara, Cleanlab, Portkey, OpenRouter,
Cloudflare AI Gateway, AWS Bedrock Guardrails, Azure AI Content Safety,
NVIDIA NeMo Guardrails, Credo AI, Holistic AI, Fiddler AI, IBM
watsonx.governance, AgentOps, Galileo Agent Control, MLflow AI Gateway.

Where the corpus does not give a clear answer, write "UNKNOWN — not in
corpus." Do not invent.

### Section 4 — The deterministic-verification gap, evidenced (~ 600 words)

The thesis of the strategic report is that Anti-Lie Governance occupies an
empty quadrant: runtime gate × deterministic verifier × no LLM in
adjudication.

Defend or attack that thesis from the corpus. For each commercial product
in the corpus, answer: **does its detection mechanism satisfy "no LLM in
the adjudication loop?"** Give a verdict per product with one direct quote
from the corpus that supports your verdict. If you find any commercial
product the prior reports missed that DOES use deterministic verification,
flag it loudly with the corpus citation.

### Section 5 — Pre-product analogues — productization risk assessment (~ 500 words)

The corpus identifies four pre-product / academic / single-developer
articulations of the deterministic-verifier-registry pattern:
- GATE (deterministicagents.ai)
- REGAL (arXiv 2603.03018)
- agent-spec (GitHub, ZhangHanDong)
- AgentGuard (arXiv 2509.23864)
- Anthropic Claude Code RFC #45427
- Michael Roth's Trust Topology

For each: estimate the productization risk to Anti-Lie Governance in the
next 12 months. Which one(s) are most likely to be commercialized by a
funded startup or large vendor first? What signals in the corpus inform
that estimate? Quote the corpus.

### Section 6 — The numbers (data extraction, no narrative)

Extract every quantitative claim from the corpus that supports market
sizing, demand, or regulatory pressure. Format as a numbered list:

> "[Claim verbatim from corpus] — Source: [file name, section]"

Examples (from prior synthesis):
- "AI governance market: $492 million in 2026, projected $1B by 2030"
- "Gartner: 40% of enterprise applications will feature task-specific AI agents by end-2026, up from <5% in 2025"
- "80% of organizations have experienced risky AI agent behaviors"
- "EU AI Act enforcement: August 2026 mandate"
- "NIST AI Agent Standards Initiative launched January 2026"

Find at least 15 such claims. Each must be cited to a specific corpus
location (file + section, or even a line range if you can).

### Section 7 — A sharper strategic recommendation than the prior REPORT.md (~ 600 words)

REPORT.md proposed a 12-item push-harder playbook tiered Tier 1 / Tier 2 /
Tier 3. Read it carefully. Then propose ONE thing that the playbook gets
wrong, missing, or under-prioritizes. Argue your case from the corpus. The
goal here is genuine independent thinking, not validation. Examples of
moves you might counter-recommend:
- Skip OSS SDK; go enterprise-only with high contract value
- Don't publish the thesis; build a moat by silence first
- Acquire one of the academic / pre-product analogues before they get
  funded
- Skip the verifier marketplace; build the compliance-bridge layer first
- Pivot positioning from "anti-lie" to "deterministic agent runtime"

Pick ONE counter-recommendation. Defend it with corpus citations. Be
specific. If you genuinely cannot find a counter-recommendation that's
defensible from the corpus, say so explicitly and explain why the prior
playbook is correct.

### Section 8 — Comparison guidance for the NotebookLM test (≤ 200 words)

Eric will run the same corpus through NotebookLM and produce a parallel
report. Help him compare.

State three specific things a reader should look for to judge which
synthesis is stronger:
- One specific factual claim that should appear in both, and that you
  predict NotebookLM will get wrong or omit (with reasoning).
- One specific structural advantage your synthesis has (e.g. "I produced
  a vendor table; NotebookLM tends to produce prose").
- One specific risk with your own synthesis that the reader should
  scrutinize.

Be honest about your own weaknesses. The point of the test is signal, not
flattery.

---

## Output requirements

- **Format:** Single markdown file, no embedded images. Headers for each
  section. Tables in Section 3 must be valid markdown tables.
- **Length:** 3,000–5,000 words. Quality > volume. Repetition is a
  weakness, not a feature.
- **Citation discipline:** Every quantitative claim, every quoted
  sentence, every vendor mechanism call must be traceable to a specific
  line in a specific corpus file. Use inline citations like:
  `(REPORT.md §5.3)` or `(PERPLEXITY-RAW-RESEARCH.md, query 07-galileo)`.
- **Voice:** Plain, direct, no marketing language. No em dashes. No
  banned hype words ("groundbreaking," "revolutionary," "next-gen").
- **Anti-fabrication:** If a claim is not in the corpus, do not include
  it. If you find yourself wanting to assert a fact you cannot cite,
  write "UNKNOWN — not in corpus" instead.
- **Independence:** If your conclusion contradicts REPORT.md's, say so
  and defend it from the corpus.

---

## Evaluation criteria (how Eric will judge your output vs NotebookLM)

The comparison test will evaluate on five criteria, each scored 1–5:

1. **Citation discipline** — every quantitative or comparative claim
   traceable to a specific source file? (5 = every single claim cited
   with file+section. 1 = bare assertions throughout.)
2. **Vendor table completeness** — does Section 3 cover every vendor in
   the corpus? Are mechanism calls correct per the corpus?
3. **Triangulation rigor** — does Section 2 actually identify
   contradictions and adjudicate them, or just paraphrase agreement?
4. **Strategic independence** — does Section 7 actually counter-recommend
   from the corpus, or rubber-stamp REPORT.md?
5. **Honesty about uncertainty** — when the corpus is silent, does the
   output say "UNKNOWN," or does it fabricate?

Total score: 25. Both you and NotebookLM will be scored. Whichever
produces stronger evidence-bound synthesis wins the round. Eric will
share results with the operator after both are evaluated.

---

## Process notes (for the agent picking this up)

1. Start by reading CORPUS.md end-to-end. Do not skim. The corpus contains
   the entirety of what's known. Skipping a section means missing data.
2. Build a working notes file as you read — Markdown bullets of
   {claim, source-file, section}. You will reference these in the output.
3. Section 3 (vendor table) is the highest-yield section for citation
   discipline. Build the table first; the rest of the report can lean on it.
4. Section 7 (counter-recommendation) is the highest-yield section for
   genuine independent value. Spend disproportionate time here.
5. When in doubt about a fact, search CORPUS.md with grep before asserting.
6. **File the output as a `cmd_claims` row** when done, with verifier_type
   `file_contains` and a pattern that should appear in your final report.
   This is dogfooding the system you are reporting on. The operator will
   verify the claim with `claim-verify.mjs`.

---

## What success looks like

A reader comparing your output to NotebookLM's should be able to point at
specific lines and say:

- "This output spotted a contradiction between REPORT.md §4 and
  PERPLEXITY-RAW-RESEARCH.md query 07 that NotebookLM missed."
- "This output's vendor table has 27 rows, all cited; NotebookLM's has 14
  with 3 uncited."
- "This output's counter-recommendation in Section 7 is defensible from
  the corpus and made me reconsider the strategy; NotebookLM rubber-
  stamped REPORT.md."

Or:

- "NotebookLM caught two facts this output missed."
- "NotebookLM's prose is more readable than this output's tables."
- "NotebookLM found a citation this output didn't surface."

Either outcome is signal. The goal is the test, not the win.

---

*End of prompt. Begin work by reading CORPUS.md.*

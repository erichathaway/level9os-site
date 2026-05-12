"use client";

import FloatingNav from "@/components/FloatingNav";
import { FadeIn, RevealMask, MagneticCard, CursorGradient, LiveTicker, Counter } from "@level9/brand/components/motion";
import SiteFooter from "@/components/SiteFooter";

/* ═══════════════════════════════════════════════════════════
   GOVERNANCE — The Vault landing page
   A four-chapter walkthrough of the Level9 governance program.
   Reader starts at the top, finishes at the bottom, and at every
   step finds the right document for the question they're asking.

      0. Start here       — Executive Summary (8-min read)
      1. Foundations      — Can we recover? Is the AI honest?
      2. Operations       — Keep the lights on. Respond when broken.
      3. AI Governance    — Govern agents, prompts, and the AI itself.
      4. Customer Trust   — What happens to data.

   Plus: Standards alignment matrix, posture, source memos.
   ═══════════════════════════════════════════════════════════ */

const VAULT_RED = "#ef4444";

type Tone = "vault" | "live" | "design" | "muted" | "release";
type Badge = { label: string; tone?: Tone };

type DocCard = {
  id: string;
  title: string;          // display title on the page
  docTitle?: string;      // canonical document title (shown small under display title)
  oneLine: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  badges: Badge[];
  meta: { dt: string; dd: string }[];
};

type Memo = { title: string; href: string; oneLine: string };

type Chapter = {
  id: string;
  num: string;
  title: string;
  question: string;       // the reader-friendly question this chapter answers
  intro: string;
  docs: DocCard[];
  memos?: Memo[];
};

/* ─── Executive Summary (the entry point) ─── */
const EXEC_SUMMARY: DocCard = {
  id: "lvl9-gov-exec",
  title: "Executive Summary",
  docTitle: "LVL9-GOV-EXEC",
  oneLine:
    "Eight-minute read for a COO. The four chapters, the standards alignment matrix, the consolidated open-issues register, and how to verify any claim independently.",
  description:
    "Reads like a board memo. Maps the chassis to NIST CSF 2.0, NIST AI RMF, ISO 27001 / 27701 / 42001, SOC 2 TSC, OWASP LLM Top 10, GDPR, CCPA, COPPA, OECD AI, and EU AI Act general-purpose obligations. Consolidates 60+ open issues with owners and targets. States honestly what is automated versus operator-fired.",
  primaryHref: "/governance/viewer.html?doc=executive-summary.md",
  primaryLabel: "Read summary",
  secondaryHref: "/governance/executive-summary.md",
  secondaryLabel: "Download .md",
  badges: [
    { label: "Start here", tone: "vault" },
    { label: "Live", tone: "live" },
    { label: "8 min read", tone: "muted" },
  ],
  meta: [
    { dt: "Document ID", dd: "LVL9-GOV-EXEC" },
    { dt: "Effective", dd: "2026-05-02" },
    { dt: "Owner", dd: "Eric Hathaway" },
    { dt: "Audience", dd: "COO / GC / Auditor" },
  ],
};

/* ─── The four chapters ─── */
const CHAPTERS: Chapter[] = [
  {
    id: "foundations",
    num: "01",
    title: "Foundations",
    question: "Can we recover everything? And how do we know the AI is honest?",
    intro:
      "The two questions every governance review opens with. The first is data continuity: if something is lost, deleted, encrypted, or vendor-terminated, can we get it back? The second is the new question of the AI era: when the agent says \"done,\" how do we know it actually is? Both have hard, mechanical answers.",
    docs: [
      {
        id: "lvl9-gov-001",
        title: "Backup, Detection & Access Control",
        docTitle: "LVL9-GOV-001 · The Vault",
        oneLine:
          "Three-layer backup. Write-once-read-many immutability. 5-minute tripwire detection. LLM-as-judge access control on the five most-destructive operations.",
        description:
          "Three pipelines (daily mirror, 4-hourly Postgres dump, future second offsite). 30-day Object Lock compliance mode in Cloudflare R2. Tripwire row-count detection. Guard service with hard-rules-first then LLM-as-judge then credentialless dispatcher. Business Impact Analysis, RTO/RPO targets, vendor concentration register, named recovery scenarios with copy-pastable commands. Open issues GOV-1 through GOV-8 tracked publicly.",
        primaryHref: "/governance/backup-and-vault.html",
        primaryLabel: "Read document",
        secondaryHref: "/governance/backup-and-vault.md",
        secondaryLabel: "Download .md",
        badges: [
          { label: "v1.4", tone: "vault" },
          { label: "Live in production", tone: "live" },
          { label: "Internal · NDA", tone: "muted" },
        ],
        meta: [
          { dt: "Document ID", dd: "LVL9-GOV-001" },
          { dt: "Effective", dd: "2026-05-02" },
          { dt: "Owner", dd: "Eric Hathaway" },
          { dt: "Next review", dd: "2026-08-02" },
        ],
      },
      {
        id: "anti-lie-report",
        title: "Anti-Lie Governance",
        docTitle: "Build 17.10 · Sibling chassis to LVL9-GOV-001",
        oneLine:
          "Keep the LLM out of court. Every \"done\" claim must register a deterministic verifier. The Stop hook blocks any agent that tries to claim done without verifying.",
        description:
          "Eight-component product report. The 10 Laws, the cmd_claims / cmd_verifications / cmd_law_violations data plane, the Stop hook chokepoint, the OPS-Lie-Watchdog n8n workflow, and the proxy layer for non-Claude-Code calls. Nine deterministic verifiers covering Vercel deploys, GitHub commits, file contents, database rows, API endpoints, RLS, n8n nodes, grants, constraints. No model adjudicates completion.",
        primaryHref: "/governance/anti-lie-report.html",
        primaryLabel: "Read report",
        secondaryHref: "/governance/anti-lie-report.md",
        secondaryLabel: "Download .md",
        badges: [
          { label: "Build 17.10", tone: "vault" },
          { label: "Live in production", tone: "live" },
          { label: "Internal · NDA", tone: "muted" },
        ],
        meta: [
          { dt: "Status", dd: "Build 17.10" },
          { dt: "Effective", dd: "2026-05-02" },
          { dt: "Owner", dd: "Eric Hathaway" },
          { dt: "Sibling chassis", dd: "LVL9-GOV-001" },
        ],
      },
    ],
    memos: [
      {
        title: "Anti-Lie · Original Design Memo",
        href: "/governance/viewer.html?doc=anti-lie-design.md",
        oneLine:
          "The 2026-04-29 design memo. Architecture, the five chokepoints, walk-back protocol, why an LLM judge is structurally insufficient.",
      },
      {
        title: "Anti-Lie · Market Research",
        href: "/governance/viewer.html?doc=anti-lie-market-research.md",
        oneLine:
          "Where this fits in the 2026 LLM-governance landscape. Comparison vs. RAGAS, Galileo, Patronus, Arize, Lakera.",
      },
      {
        title: "Anti-Lie · System Prompt Scaffolding",
        href: "/governance/viewer.html?doc=anti-lie-commandos-prompt.md",
        oneLine:
          "The system-prompt scaffolding that names the 10 Laws and the verifier registration contract.",
      },
    ],
  },
  {
    id: "operations",
    num: "02",
    title: "Operations",
    question: "What keeps the lights on? And what happens when something breaks?",
    intro:
      "The operating layer. Compute, edge, hosting, secrets, cost, identity. Plus the response procedure for when something goes wrong: detect, triage, contain, eradicate, recover, learn. A reviewer should be able to walk into an active incident with this runbook and know what to do.",
    docs: [
      {
        id: "lvl9-gov-002",
        title: "Infrastructure & Reliability",
        docTitle: "LVL9-GOV-002 · Health, cost, edge, identity",
        oneLine:
          "Compute (Mac Mini + NAS). Edge (Cloudflare Tunnel + R2 + DNS). Hosting (10 Vercel projects). Secrets (60-row vault). Cost caps. Restarts. Identity.",
        description:
          "n8n container on Postgres with healthcheck and restart policy. CMD-Health-Monitor 5-minute heartbeat plus Workflow-Activity-Monitor. cmd_secrets with rotation tracking across 29 services. cmd_routing_log plus cmd_budgets with 75% warn / 90% pause via the Conductor. Documented restart and recovery for every layer. MFA inventory across 16 tools. Mapped to NIST CSF 2.0 PROTECT/DETECT/RESPOND/RECOVER, ISO 27001 A.5/A.8, SOC 2 TSC CC7/CC8, OWASP LLM10. Open issues GOV-9 through GOV-17.",
        primaryHref: "/governance/viewer.html?doc=infrastructure-and-reliability.md",
        primaryLabel: "Read document",
        secondaryHref: "/governance/infrastructure-and-reliability.md",
        secondaryLabel: "Download .md",
        badges: [
          { label: "v1.0", tone: "vault" },
          { label: "Live · this release", tone: "release" },
          { label: "Internal · NDA", tone: "muted" },
        ],
        meta: [
          { dt: "Document ID", dd: "LVL9-GOV-002" },
          { dt: "Effective", dd: "2026-05-02" },
          { dt: "Owner", dd: "Eric Hathaway" },
          { dt: "Next review", dd: "2026-08-02" },
        ],
      },
      {
        id: "lvl9-gov-005",
        title: "Incident Response Runbook",
        docTitle: "LVL9-GOV-005 · Detect → Triage → Contain → Eradicate → Recover → Learn",
        oneLine:
          "Six-phase response. Four severity tiers. Six tabletop drill scenarios. Includes AI-specific incident classes that no standard runbook covers in 2026.",
        description:
          "Mandatory written post-incident review within 7 days for SEV-1, 14 days for SEV-2. Six tabletop drill scenarios: API key exposed in public repo, n8n container OOM loop, tripwire row-count drop, AI agent claims completion without evidence, Conductor budget runaway, Cloudflare account termination. Mapped to NIST CSF 2.0 RS, ISO 27035, SOC 2 TSC CC9.1.",
        primaryHref: "/governance/viewer.html?doc=incident-response.md",
        primaryLabel: "Read document",
        secondaryHref: "/governance/incident-response.md",
        secondaryLabel: "Download .md",
        badges: [
          { label: "v1.0", tone: "vault" },
          { label: "Live · this release", tone: "release" },
          { label: "Internal · NDA", tone: "muted" },
        ],
        meta: [
          { dt: "Document ID", dd: "LVL9-GOV-005" },
          { dt: "Effective", dd: "2026-05-02" },
          { dt: "Owner", dd: "Eric Hathaway" },
          { dt: "Next review", dd: "2026-08-02" },
        ],
      },
    ],
  },
  {
    id: "ai-governance",
    num: "03",
    title: "AI Governance",
    question: "How is the AI fleet itself governed? Who reviews? What is it allowed to do?",
    intro:
      "Three documents that together describe the AI-specific oversight program. How decisions get made (StratOS rooms, governance officers, lifecycle gates). How prompts are written, versioned, and protected from drift or injection. And the bright lines that bound what the AI is authorized to do, regardless of who asks.",
    docs: [
      {
        id: "lvl9-gov-003",
        title: "Agent Oversight & Product Gates",
        docTitle: "LVL9-GOV-003 · Officers, rooms, lifecycle",
        oneLine:
          "Agent registry split (cmd_agents vs cmd_governance_agents). 24 active officers plus 65 in the prompt library. Three gates. StratOS 5 rooms with 50 personas.",
        description:
          "cmd_agents (runtime claude_code agents) versus cmd_governance_agents (officers). Officer Dispatcher and Gate Watcher (designed). G1 plan / G2 mid / G3 ship gate panels with default rosters per gate. StratOS 5-room architecture with 50 named personas, dissent_bias, and a 10-stage deliberation pipeline (Q→EI→D→F1→RX→F2-F4→F3→GOV→GOV-TEST). 32 governance rules in force. Six-phase project lifecycle. Mapped to NIST AI RMF GOVERN/MAP/MEASURE/MANAGE, ISO 42001, OWASP LLM05. Open issues GOV-18 through GOV-28.",
        primaryHref: "/governance/viewer.html?doc=product-and-agent-governance.md",
        primaryLabel: "Read document",
        secondaryHref: "/governance/product-and-agent-governance.md",
        secondaryLabel: "Download .md",
        badges: [
          { label: "v1.0", tone: "vault" },
          { label: "Live · this release", tone: "release" },
          { label: "Internal · NDA", tone: "muted" },
        ],
        meta: [
          { dt: "Document ID", dd: "LVL9-GOV-003" },
          { dt: "Effective", dd: "2026-05-02" },
          { dt: "Owner", dd: "Eric Hathaway" },
          { dt: "Next review", dd: "2026-08-02" },
        ],
      },
      {
        id: "lvl9-gov-004",
        title: "Prompt Architecture & Voice Integrity",
        docTitle: "LVL9-GOV-004 · In-line, external, governance",
        oneLine:
          "Three-layer architecture. 65 officer prompts. 50 StratOS personas. Canonical voiceRules.ts distributed to 7 sites. Em-dash and banned-phrase enforcement.",
        description:
          "Layer A (in-line): Humanize generation, n8n nodes, LinkUpOS comments. Layer B (versioned external library): officer prompt library with frontmatter versioning plus a sync script, StratOS persona library, agent system prompts, the canonical voiceRules.ts. Layer C (governance): voice gate, prompt-injection defense, officer panel quality assurance. Honest gap: passesVoiceCheck not yet called post-generation. Mapped to OWASP LLM01/05/07, NIST AI RMF GOVERN/MAP/MEASURE, ISO 42001 §7.5/§8.4. Open issues GOV-29 through GOV-41.",
        primaryHref: "/governance/viewer.html?doc=prompt-architecture-governance.md",
        primaryLabel: "Read document",
        secondaryHref: "/governance/prompt-architecture-governance.md",
        secondaryLabel: "Download .md",
        badges: [
          { label: "v1.0", tone: "vault" },
          { label: "Live · this release", tone: "release" },
          { label: "Internal · NDA", tone: "muted" },
        ],
        meta: [
          { dt: "Document ID", dd: "LVL9-GOV-004" },
          { dt: "Effective", dd: "2026-05-02" },
          { dt: "Owner", dd: "Eric Hathaway" },
          { dt: "Next review", dd: "2026-08-02" },
        ],
      },
      {
        id: "lvl9-gov-006",
        title: "Responsible AI Policy",
        docTitle: "LVL9-GOV-006 · Acceptable use and refusal posture",
        oneLine:
          "What the AI is and is not authorized to do. Hard prohibitions. Soft prohibitions. Refusal posture. Model-provider disclosure. Human-oversight matrix.",
        description:
          "Seven principles (augment never replace, honesty before fluency, transparency over plausibility, source discipline, privacy by default, no theater, LLC separation). Authorized use, hard prohibitions (no overrides ever), soft prohibitions (per-occurrence operator approval). Per-LLC product policies for LucidORG, NextGen Interns, Level9OS, and the operator individually. Refusal taxonomy. Bias and fairness commitments. Mapped to NIST AI RMF, ISO 42001, OECD AI Principles, EU AI Act general-purpose obligations.",
        primaryHref: "/governance/viewer.html?doc=responsible-ai-policy.md",
        primaryLabel: "Read document",
        secondaryHref: "/governance/responsible-ai-policy.md",
        secondaryLabel: "Download .md",
        badges: [
          { label: "v1.0", tone: "vault" },
          { label: "Live · this release", tone: "release" },
          { label: "Shareable", tone: "muted" },
        ],
        meta: [
          { dt: "Document ID", dd: "LVL9-GOV-006" },
          { dt: "Effective", dd: "2026-05-02" },
          { dt: "Owner", dd: "Eric Hathaway" },
          { dt: "Next review", dd: "2027-05-02" },
        ],
      },
    ],
  },
  {
    id: "customer-trust",
    num: "04",
    title: "Customer Trust",
    question: "What happens to customer data?",
    intro:
      "The data-governance program. The four-class taxonomy that determines how every byte is handled. The flow map showing where data moves, vendor by vendor. The customer rights commitments (access, correction, deletion, portability) that turn the program into an operating contract.",
    docs: [
      {
        id: "lvl9-gov-007",
        title: "Data Governance & Customer Rights",
        docTitle: "LVL9-GOV-007 · Classes, flows, rights, retention",
        oneLine:
          "Four-class data taxonomy. Top-level data flow map. Vendor sub-processor inventory. Customer rights (access, correction, deletion, portability, restriction, objection).",
        description:
          "C-1 Public, C-2 Internal Operational, C-3 Customer Confidential, C-4 Secrets. Per-class controls for encryption at rest, in transit, access, retention, and deletion. Top-level flow plus LLM-provider flow plus per-product flow. 21-vendor sub-processor inventory with DPA cross-references. Per-product retention defaults plus customer-deletion procedures with 30-day execution windows. Mapped to NIST CSF 2.0 PR.DS, ISO 27701, ISO 27001 A.8.10/A.8.13, GDPR Art 5/17/28/32, CCPA/CPRA, COPPA.",
        primaryHref: "/governance/viewer.html?doc=data-governance.md",
        primaryLabel: "Read document",
        secondaryHref: "/governance/data-governance.md",
        secondaryLabel: "Download .md",
        badges: [
          { label: "v1.0", tone: "vault" },
          { label: "Live · this release", tone: "release" },
          { label: "Internal · NDA", tone: "muted" },
        ],
        meta: [
          { dt: "Document ID", dd: "LVL9-GOV-007" },
          { dt: "Effective", dd: "2026-05-02" },
          { dt: "Owner", dd: "Eric Hathaway" },
          { dt: "Next review", dd: "2027-05-02" },
        ],
      },
    ],
  },
];

/* ─── Standards mapped (high-level, for the matrix card) ─── */
const STANDARDS_MATRIX: { standard: string; chapters: string[] }[] = [
  { standard: "NIST CSF 2.0", chapters: ["Foundations", "Operations", "Customer Trust"] },
  { standard: "NIST AI RMF 1.0", chapters: ["AI Governance"] },
  { standard: "ISO/IEC 27001:2022", chapters: ["Foundations", "Operations", "Customer Trust"] },
  { standard: "ISO/IEC 27701:2019 (PIMS)", chapters: ["Customer Trust"] },
  { standard: "ISO/IEC 42001:2023", chapters: ["AI Governance"] },
  { standard: "SOC 2 Trust Services Criteria", chapters: ["Foundations", "Operations", "Customer Trust"] },
  { standard: "OWASP LLM Top 10 (2025)", chapters: ["AI Governance", "Operations"] },
  { standard: "GDPR · CCPA / CPRA · COPPA", chapters: ["Customer Trust"] },
  { standard: "OECD AI Principles", chapters: ["AI Governance"] },
  { standard: "EU AI Act (GPAI obligations)", chapters: ["AI Governance"] },
];

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function Badge({ label, tone = "muted" }: Badge) {
  const styles =
    tone === "vault"
      ? { background: "rgba(239,68,68,0.10)", color: VAULT_RED, border: "1px solid rgba(239,68,68,0.35)" }
      : tone === "live"
      ? { background: "rgba(16,185,129,0.10)", color: "#10b981", border: "1px solid rgba(16,185,129,0.35)" }
      : tone === "release"
      ? { background: "rgba(139,92,246,0.10)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.35)" }
      : tone === "design"
      ? { background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.35)" }
      : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <span
      className="text-[10px] font-mono tracking-[0.18em] uppercase px-2.5 py-1 rounded-full whitespace-nowrap"
      style={styles}
    >
      {label}
    </span>
  );
}

function DocCardArticle({ doc, accent = VAULT_RED }: { doc: DocCard; accent?: string }) {
  return (
    <article
      className="relative h-full p-7 sm:p-9 rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />

      <div className="flex flex-wrap gap-2 mb-5">
        {doc.badges.map((b) => (
          <Badge key={b.label} {...b} />
        ))}
      </div>

      <h3
        className="text-xl sm:text-2xl font-bold tracking-tight text-white/95 mb-1"
        style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
      >
        {doc.title}
      </h3>
      {doc.docTitle && (
        <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/40 mb-4">
          {doc.docTitle}
        </div>
      )}

      <p className="text-white/70 leading-relaxed mb-4 italic text-[15px]">{doc.oneLine}</p>

      <p className="text-white/45 text-sm leading-relaxed mb-7">{doc.description}</p>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-7 pb-7 border-b border-white/[0.06]">
        {doc.meta.map((m) => (
          <div key={m.dt}>
            <dt className="text-[10px] font-mono tracking-[0.16em] uppercase text-white/35 mb-0.5">
              {m.dt}
            </dt>
            <dd className="text-[13px] text-white/85">{m.dd}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-3">
        <a
          href={doc.primaryHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition"
          style={{ background: accent, color: "white" }}
        >
          <span>{doc.primaryLabel}</span>
          <span aria-hidden="true">→</span>
        </a>
        {doc.secondaryHref && (
          <a
            href={doc.secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            {doc.secondaryLabel}
          </a>
        )}
      </div>
    </article>
  );
}

function MemoCard({ memo }: { memo: Memo }) {
  return (
    <a
      href={memo.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full p-5 rounded-xl transition group"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="text-[10px] font-mono tracking-[0.18em] uppercase mb-2"
        style={{ color: VAULT_RED }}
      >
        Source memo
      </div>
      <h4 className="text-base font-semibold text-white/90 mb-2 group-hover:text-white transition">
        {memo.title}
      </h4>
      <p className="text-[13px] text-white/55 leading-relaxed">{memo.oneLine}</p>
      <div className="mt-3 text-[12px] font-mono text-white/35 group-hover:text-white/55 transition">
        Open →
      </div>
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function GovernancePage() {
  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient color="rgba(239,68,68,0.08)" />
      <LiveTicker />

      {/* CUSTOMER-FACING HERO ──────────────────────────────── */}
      <section
        className="relative pt-40 pb-24 overflow-hidden"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[900px] h-[900px] rounded-full -top-48 -right-48"
            style={{
              background: "radial-gradient(circle, rgba(239,68,68,0.14) 0%, transparent 60%)",
              filter: "blur(160px)",
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full bottom-0 -left-32"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
              filter: "blur(120px)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div
              className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.35)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: VAULT_RED }} />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase" style={{ color: VAULT_RED }}>
                The Vault · Governance Chassis
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2rem,5vw,4rem)] font-black leading-[1.05] tracking-tight text-white/95">
                You see the AI agent.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2rem,5vw,4rem)] font-black leading-[1.05] tracking-tight text-white/95">
                You don&apos;t see what it&apos;s doing.
              </h1>
            </RevealMask>
            <RevealMask delay={300}>
              <h2
                className="text-[clamp(2rem,5vw,4rem)] font-black leading-[1.05] tracking-tight"
              >
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${VAULT_RED} 0%, #f97316 50%, ${VAULT_RED} 100%)`,
                  }}
                >
                  Level9OS makes the invisible visible.
                </span>
              </h2>
            </RevealMask>
          </div>

          <FadeIn delay={0.5}>
            <ul className="space-y-3 mb-14 max-w-2xl">
              {[
                "Every action logged. Not summarized. Logged.",
                "Every dollar tracked. Budget hard stops enforced before they are breached.",
                "Every output gated before it reaches production. No agent self-approves.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: VAULT_RED }}
                  />
                  <span className="text-white/75 text-lg leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Governance ROI strip */}
          <FadeIn delay={0.7}>
            <div
              className="rounded-2xl p-7 sm:p-10 mb-6"
              style={{
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.18)",
              }}
            >
              <div
                className="text-[11px] font-mono tracking-[0.22em] uppercase mb-6"
                style={{ color: VAULT_RED }}
              >
                Governance ROI · Production numbers
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: "$52,686", label: "Prevented in cost overruns" },
                  { value: "236 hrs", label: "Saved in manual verification" },
                  { value: "$5.07/mo", label: "Total governance cost" },
                  { value: "3,464x", label: "Gross ROI · 34.8x net" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      className="text-[clamp(1.5rem,3vw,2.25rem)] font-black tracking-tight mb-1"
                      style={{ color: VAULT_RED }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[12px] text-white/55 leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-white/35 text-xs font-mono">
                Numbers pulled from production logs. Not projections.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.85}>
            <p className="text-white/55 text-base max-w-3xl leading-relaxed">
              Below: the full governance program. Four chapters, seven documents, ten standards mapped.
              Every claim links to a primary source. Every open issue tracked with an owner and a target.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* VAULT DOC HUB HERO ──────────────────────────────────── */}
      <section
        className="relative pt-20 pb-24 overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        {/* Atmospheric glow layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[800px] h-[800px] rounded-full -top-32 -right-32"
            style={{
              background: "radial-gradient(circle, rgba(239,68,68,0.22) 0%, transparent 60%)",
              filter: "blur(140px)",
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full -bottom-32 -left-32"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 60%)",
              filter: "blur(120px)",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full top-1/3 left-1/2"
            style={{
              background: "radial-gradient(circle, rgba(20,8,46,0.6) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        {/* Subtle scan-line grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(239,68,68,1) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div
              className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.45)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: VAULT_RED }} />
              <span
                className="text-[12px] font-mono tracking-[0.3em] uppercase"
                style={{ color: VAULT_RED }}
              >
                The Vault · Governance Chassis · v1.0
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Operational
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${VAULT_RED} 0%, #f97316 50%, ${VAULT_RED} 100%)`,
                  }}
                >
                  Governance.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/65 text-lg sm:text-xl max-w-3xl mb-3 font-light leading-relaxed">
              A four-chapter walkthrough of how a single-operator AI agent stack stays safe, honest, lit-up,
              and accountable.
            </p>
            <p className="text-white/45 text-base max-w-3xl font-light leading-relaxed">
              Every claim links to a primary source. Every open issue is tracked with an owner and a target.
              Where a control is operator-fired, the document says so. Where a workflow is designed but not
              yet deployed, the document says so. No theater.
            </p>
          </FadeIn>

          {/* Animated stat grid */}
          <FadeIn delay={0.6}>
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { v: 8, suffix: "", l: "Chassis documents" },
                { v: 60, suffix: "+", l: "Open issues tracked" },
                { v: 11, suffix: "", l: "Standards mapped" },
                { v: 5000, suffix: "+", l: "Lines of evidence" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="relative p-5 sm:p-6 rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: VAULT_RED }} />
                  <div
                    className="text-[clamp(2rem,4vw,3rem)] font-black leading-none mb-2 tracking-tight"
                    style={{
                      fontFamily: "var(--font-playfair, Georgia, serif)",
                      backgroundImage: `linear-gradient(135deg, ${VAULT_RED} 0%, #f97316 100%)`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    <Counter target={s.v} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/55">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Chapter ribbon */}
          <FadeIn delay={0.8}>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-[11px] font-mono tracking-[0.16em] uppercase text-white/55">
              <span className="text-white/35">The path:</span>
              {[
                "Foundations",
                "Operations",
                "AI Governance",
                "Customer Trust",
              ].map((step, i, arr) => (
                <span key={step} className="inline-flex items-center gap-3">
                  <a
                    href={`#${
                      i === 0
                        ? "foundations"
                        : i === 1
                        ? "operations"
                        : i === 2
                        ? "ai-governance"
                        : "customer-trust"
                    }`}
                    className="px-3 py-1.5 rounded-full transition hover:text-white"
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.20)",
                      color: VAULT_RED,
                    }}
                  >
                    {`0${i + 1}`} · {step}
                  </a>
                  {i < arr.length - 1 && <span style={{ color: VAULT_RED }}>→</span>}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TABLE OF CONTENTS ──────────────────────────────── */}
      <section className="relative py-16" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="flex items-baseline gap-4 mb-3">
              <span
                className="text-[11px] font-mono tracking-[0.22em] uppercase"
                style={{ color: VAULT_RED }}
              >
                How to read this page
              </span>
            </div>
            <h2
              className="font-bold text-2xl sm:text-3xl tracking-tight text-white/95 mb-3"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Top to bottom. Or jump to a chapter.
            </h2>
            <p className="text-white/55 text-base mb-10 max-w-2xl">
              Read the executive summary first if you have eight minutes. Read a single chapter if you have a
              specific question. Read every document if you are doing diligence.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FadeIn delay={0.05}>
              <a
                href="#start-here"
                className="block h-full p-5 rounded-xl transition group"
                style={{
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.35)",
                }}
              >
                <div
                  className="text-[10px] font-mono tracking-[0.18em] uppercase mb-2"
                  style={{ color: VAULT_RED }}
                >
                  00
                </div>
                <h3 className="text-base font-bold text-white/95 mb-1 group-hover:text-white transition leading-tight">
                  Start Here
                </h3>
                <p className="text-[12px] text-white/60 leading-relaxed mb-3">Executive summary</p>
                <div className="text-[12px] font-mono text-white/45 group-hover:text-white/70 transition">
                  8 min read ↓
                </div>
              </a>
            </FadeIn>
            {CHAPTERS.map((c, i) => (
              <FadeIn key={c.id} delay={0.08 + i * 0.05}>
                <a
                  href={`#${c.id}`}
                  className="block h-full p-5 rounded-xl transition group"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="text-[10px] font-mono tracking-[0.18em] uppercase mb-2"
                    style={{ color: VAULT_RED }}
                  >
                    {c.num}
                  </div>
                  <h3 className="text-base font-bold text-white/95 mb-1 group-hover:text-white transition leading-tight">
                    {c.title}
                  </h3>
                  <p className="text-[12px] text-white/60 leading-relaxed mb-3">
                    {c.docs.length} doc{c.docs.length === 1 ? "" : "s"}
                    {c.memos && c.memos.length > 0 ? ` · ${c.memos.length} memos` : ""}
                  </p>
                  <div className="text-[12px] font-mono text-white/45 group-hover:text-white/70 transition">
                    Jump ↓
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* EXECUTIVE SUMMARY (featured) ──────────────────────── */}
      <section
        id="start-here"
        className="relative py-20 sm:py-28 scroll-mt-20"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="flex items-baseline gap-4 mb-3">
              <span
                className="text-[11px] font-mono tracking-[0.22em] uppercase"
                style={{ color: VAULT_RED }}
              >
                00 · Start Here
              </span>
            </div>
            <h2
              className="font-bold text-3xl sm:text-4xl tracking-tight text-white/95 mb-3"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              The executive summary.
            </h2>
            <p className="text-white/55 text-base mb-12 max-w-3xl">
              The eight-minute version of the entire program. Read this first. Every other document on this page
              is a deeper proof-out for a single chapter of this summary.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <MagneticCard className="block">
              <article
                className="relative p-8 sm:p-12 rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(20,8,46,0.4) 60%)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: VAULT_RED }} />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {EXEC_SUMMARY.badges.map((b) => (
                        <Badge key={b.label} {...b} />
                      ))}
                    </div>

                    <h3
                      className="text-2xl sm:text-3xl font-bold tracking-tight text-white/95 mb-1"
                      style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
                    >
                      {EXEC_SUMMARY.title}
                    </h3>
                    {EXEC_SUMMARY.docTitle && (
                      <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/40 mb-5">
                        {EXEC_SUMMARY.docTitle}
                      </div>
                    )}

                    <p className="text-white/75 leading-relaxed mb-4 italic text-[16px] sm:text-[17px]">
                      {EXEC_SUMMARY.oneLine}
                    </p>

                    <p className="text-white/55 text-sm leading-relaxed mb-7">
                      {EXEC_SUMMARY.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href={EXEC_SUMMARY.primaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition"
                        style={{ background: VAULT_RED, color: "white" }}
                      >
                        <span>{EXEC_SUMMARY.primaryLabel}</span>
                        <span aria-hidden="true">→</span>
                      </a>
                      {EXEC_SUMMARY.secondaryHref && (
                        <a
                          href={EXEC_SUMMARY.secondaryHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.85)",
                            border: "1px solid rgba(255,255,255,0.10)",
                          }}
                        >
                          {EXEC_SUMMARY.secondaryLabel}
                        </a>
                      )}
                    </div>
                  </div>

                  <dl className="lg:min-w-[220px] grid grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-3">
                    {EXEC_SUMMARY.meta.map((m) => (
                      <div key={m.dt}>
                        <dt className="text-[10px] font-mono tracking-[0.16em] uppercase text-white/35 mb-0.5">
                          {m.dt}
                        </dt>
                        <dd className="text-sm text-white/85">{m.dd}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            </MagneticCard>
          </FadeIn>
        </div>
      </section>

      {/* CHAPTERS ─────────────────────────────────────── */}
      {CHAPTERS.map((chapter, ci) => (
        <section
          key={chapter.id}
          id={chapter.id}
          className="relative py-20 sm:py-28 scroll-mt-20"
          style={{ background: ci % 2 === 0 ? "var(--bg-surface)" : "var(--bg-root)" }}
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-12">
            <FadeIn>
              <div className="flex items-baseline gap-4 mb-3">
                <span
                  className="text-[11px] font-mono tracking-[0.22em] uppercase"
                  style={{ color: VAULT_RED }}
                >
                  {chapter.num} · Chapter
                </span>
              </div>
              <h2
                className="font-bold text-3xl sm:text-5xl tracking-tight text-white/95 mb-4"
                style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
              >
                {chapter.title}.
              </h2>
              <p
                className="text-white/75 text-lg sm:text-xl mb-5 max-w-3xl font-light"
                style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
              >
                {chapter.question}
              </p>
              <p className="text-white/55 text-base mb-12 max-w-3xl leading-relaxed">{chapter.intro}</p>
            </FadeIn>

            <div
              className={`grid gap-6 ${
                chapter.docs.length === 1
                  ? "grid-cols-1 max-w-3xl"
                  : chapter.docs.length === 2
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {chapter.docs.map((doc, i) => (
                <FadeIn key={doc.id} delay={0.1 + i * 0.08}>
                  <MagneticCard className="h-full">
                    <DocCardArticle doc={doc} />
                  </MagneticCard>
                </FadeIn>
              ))}
            </div>

            {chapter.memos && chapter.memos.length > 0 && (
              <FadeIn delay={0.3}>
                <div className="mt-12 pt-10 border-t border-white/[0.06]">
                  <div
                    className="text-[11px] font-mono tracking-[0.18em] uppercase mb-4 text-white/40"
                  >
                    Source memos for this chapter
                  </div>
                  <p className="text-white/45 text-sm mb-6 max-w-2xl">
                    The build journals, market research, and original design memos that the chassis grew out of.
                    For reviewers who want to see the work, not just the outcome.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {chapter.memos.map((m) => (
                      <MemoCard key={m.href} memo={m} />
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </section>
      ))}

      {/* STANDARDS ALIGNMENT MATRIX ─────────────────────── */}
      <section
        id="standards"
        className="relative py-20 sm:py-28 scroll-mt-20"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="flex items-baseline gap-4 mb-3">
              <span
                className="text-[11px] font-mono tracking-[0.22em] uppercase"
                style={{ color: VAULT_RED }}
              >
                Standards Alignment
              </span>
            </div>
            <h2
              className="font-bold text-3xl sm:text-4xl tracking-tight text-white/95 mb-3"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              The frameworks this program is mapped to.
            </h2>
            <p className="text-white/55 text-base mb-12 max-w-3xl leading-relaxed">
              Every chapter cross-references the standards relevant to it. The full per-section matrix lives in the
              executive summary and in each chassis document under Section 5.3 (Standards Alignment).
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg-root)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      borderBottom: `2px solid ${VAULT_RED}`,
                    }}
                  >
                    <th
                      className="text-left text-[10px] font-mono tracking-[0.18em] uppercase text-white/55 py-4 px-6"
                    >
                      Standard
                    </th>
                    <th
                      className="text-left text-[10px] font-mono tracking-[0.18em] uppercase text-white/55 py-4 px-6"
                    >
                      Where it lives in this program
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STANDARDS_MATRIX.map((row, i) => (
                    <tr
                      key={row.standard}
                      style={{
                        borderBottom:
                          i === STANDARDS_MATRIX.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td className="text-sm text-white/85 py-4 px-6 font-medium">{row.standard}</td>
                      <td className="text-sm text-white/60 py-4 px-6">
                        {row.chapters.map((c, j) => (
                          <span key={c}>
                            {j > 0 ? " · " : ""}
                            <span style={{ color: VAULT_RED }}>{c}</span>
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* POSTURE ──────────────────────────────────────────── */}
      <section
        id="posture"
        className="relative py-20 sm:py-28 scroll-mt-20"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="flex items-baseline gap-4 mb-3">
              <span
                className="text-[11px] font-mono tracking-[0.22em] uppercase"
                style={{ color: VAULT_RED }}
              >
                Posture
              </span>
            </div>
            <h2
              className="font-bold text-3xl sm:text-4xl tracking-tight text-white/95 mb-8"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              What this is, and what it is not.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn delay={0.1}>
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">What this IS</h3>
                <ul className="space-y-2 text-white/65 text-[15px] leading-relaxed">
                  <li>
                    Operational governance for a single-operator stack running AI agents at scale.
                  </li>
                  <li>
                    Technical-controls evidence mapped against NIST CSF 2.0, NIST AI RMF, ISO 27001, ISO 27701, ISO 42001,
                    SOC 2 TSC, OWASP LLM Top 10, GDPR, OECD AI, and EU AI Act general-purpose obligations.
                  </li>
                  <li>
                    A reference architecture for the solo and small-operator segment that no other published document
                    currently serves at this depth.
                  </li>
                  <li>Honest about residual risk. 60+ open issues tracked, owned, and targeted.</li>
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">What this is NOT</h3>
                <ul className="space-y-2 text-white/65 text-[15px] leading-relaxed">
                  <li>
                    Not a complete information security policy. Application-layer security is out of scope.
                  </li>
                  <li>
                    Not for regulated data (HIPAA, PCI-DSS, FedRAMP, GDPR Article 9). Customer data is protected by
                    underlying platforms.
                  </li>
                  <li>
                    Not multi-tenant access governance. Not built for &gt;$10M ARR scale or insider-threat scenarios.
                  </li>
                  <li>
                    Not a vendor risk assessment. Vendors carry their own attestations; we document concentration risk.
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <p className="mt-12 text-white/40 text-sm font-mono tracking-wider">
              Classified Internal · Shareable under NDA · © Eric Hathaway · Effective 2026-05-02
            </p>
          </FadeIn>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

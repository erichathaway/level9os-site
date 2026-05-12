"use client";
/**
 * /compare — Competitive analysis. Hidden from nav.
 * Full 9-section breakdown of Level9OS vs the market.
 * Source: LEVEL9OS-COMPARE-PAGE-CONTENT-2026-05-12.md
 */

import { useState } from "react";
import FloatingNav from "@/components/FloatingNav";
import SiteFooter from "@/components/SiteFooter";
import {
  FadeIn,
  RevealMask,
  MagneticCard,
  CursorGradient,
  LiveTicker,
} from "@level9/brand/components/motion";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ThreatLevel = "HIGH" | "HIGH WILDCARD" | "MEDIUM-HIGH" | "MEDIUM";

type Competitor = {
  id: string;
  name: string;
  tagline: string;
  strongest: string;
  gap: string;
  threat: ThreatLevel;
  pricing: string;
  honest?: string; // when Level9OS would refer you to them
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    num: "01",
    title: "Multi-Step Orchestration",
    color: "#8b5cf6",
    definition:
      "Connect Claude, GPT, Gemini, Copilot, or custom agents into a single workflow. One control plane, one audit trail, one cost dashboard running across all of them.",
    others:
      "Microsoft Agent 365 (announced, maturing), Glean (knowledge-layer only), ServiceNow AI Control Tower (ITSM-anchored), LangChain and CrewAI (developer tools, not operator tools).",
    difference:
      "The others require you to pick their ecosystem or route through their wrappers. Level9OS treats the vendor as interchangeable infrastructure. The policy engine sits above the models. That rule enforces per action, not per deployment.",
  },
  {
    num: "02",
    title: "Cross-Agent Governance",
    color: "#ef4444",
    definition:
      "An audit trail, cost controls, identity management, and quality gates that run under every agent regardless of which vendor built it. Not a dashboard you check. A chassis that enforces.",
    others:
      "Microsoft (Purview + Entra, enterprise-scale, expensive to configure), ServiceNow AI Control Tower (strong for ITSM), Aigentsphere (compliance templates, early traction, likely acquisition target).",
    difference:
      "The governance chassis runs under every Level9OS product from day one. Not a separate product bolted on after deployment. Agents earn governance clearances based on measured performance. That promotion mechanic for AI agents doesn't exist anywhere else.",
  },
  {
    num: "03",
    title: "Department-Level Wrappers",
    color: "#f59e0b",
    definition:
      "A complete operating structure for a business function. One human manager. Shared governance. Autonomous agent pods running the work inside a defined pod structure.",
    others:
      "Salesforce Agentforce (CRM-anchored automations, not full department wrappers), Workday ASOR (HR/Finance workflows, not cross-department), custom professional services at Big 4.",
    difference:
      "OutboundOS is the proof of pattern. A complete outbound function running as a pod: intake, research, sequencing, follow-up, measurement. The wrapper includes governance, not just workflow. Other vendors sell the automation. We sell the operating structure, governance, and the accountability layer that wraps around it.",
  },
];

const COMPETITORS: Competitor[] = [
  {
    id: "microsoft",
    name: "Microsoft",
    tagline: "Agent 365 + Entra + Purview",
    strongest:
      "Distribution. They're already in the building. Agent 365 is an explicit control plane for any agents an organization uses, whether Microsoft, partner, or other stacks. Entra handles identity. Purview handles governance and compliance.",
    gap:
      "Scope and speed. No voice I/O for operations, no executive coaching layer, no human-plus-agent unified performance scaffold, and setup complexity is enterprise-grade. An SMB operator doesn't spin up Purview in a day. Their target is the IT function of a 5,000-person company.",
    threat: "HIGH",
    pricing:
      "~$1M+ per year all-in for an enterprise deployment (Microsoft 365 E5 + Copilot + Purview add-ons, 100-seat baseline). SMB entry is lower but governance features require higher tiers.",
    honest:
      "You're a 1,000+ person enterprise, already running Microsoft 365 and Azure, with a dedicated IT governance team and an 18-month procurement timeline.",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    tagline: "Agentforce",
    strongest:
      "CRM integration. If your company runs on Salesforce, agents have access to every account, contact, opportunity, and case record without integration work.",
    gap:
      "Lock-in and scope. Agentforce agents live inside Salesforce. No voice I/O, no cross-vendor model orchestration, no multi-department operating structure outside the Salesforce object model.",
    threat: "MEDIUM",
    pricing:
      "~$850K+ per year all-in for an enterprise deployment (Sales Cloud + Service Cloud + Agentforce licenses, 100-seat baseline).",
    honest:
      "Your primary operational data lives in Salesforce, your team is Salesforce-native, and the agents you need are CRM agents.",
  },
  {
    id: "workday",
    name: "Workday",
    tagline: "ASOR — Agent System of Record",
    strongest:
      "Positioning language. Workday explicitly says agents are managed as part of the overall organizational structure alongside employees. That is the closest verbatim match to what Level9OS is building. They own payroll, headcount data, and the org chart.",
    gap:
      "ASOR is HR and Finance system governance. No voice interface, no executive coaching, no multi-vendor knowledge management, no cross-company federation for JVs, contractors, or partner organizations.",
    threat: "HIGH",
    pricing:
      "~$500K+ per year all-in for a mid-market Workday HCM deployment with Copilot and ASOR modules.",
    honest:
      "You need HR and finance workflow automation and you're already a Workday customer. ASOR is real for managing agents in the same register as employees inside the HCM layer.",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tagline: "Claude Managed Agents",
    strongest:
      "Model quality. If you're already deploying Claude in production, the orchestration layer is native and the distribution is the API you're already calling.",
    gap:
      "The walled garden. Claude Managed Agents governs Claude agents. GPT, Gemini, and Copilot agents running in the same environment are outside the governance boundary. For multi-vendor model deployments, a Claude-only governance layer is an incomplete answer.",
    threat: "MEDIUM-HIGH",
    pricing:
      "API-usage-based. Production multi-agent deployments run in the range of $500 to $5,000 per month depending on volume and model tier.",
  },
  {
    id: "glean",
    name: "Glean",
    tagline: "Enterprise knowledge platform with agent layer",
    strongest:
      "$200M in ARR, doubled year over year. They've solved the indexing and permissioning problem well. Permission-aware search and the Skills framework let agents retrieve and act on company knowledge.",
    gap:
      "Their category. Glean is a knowledge platform that added agents. No human-plus-agent unified positioning, no voice interface, no executive coaching, no compliance auto-update, no cross-org federation, no identity management.",
    threat: "MEDIUM",
    pricing:
      "Enterprise contracts. Reported ARR-per-customer suggests mid-to-high five-figure annual contracts for SMB, six-figure for enterprise.",
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    tagline: "AI Control Tower",
    strongest:
      '"Any agent, any source, any vendor" is their stated positioning. ServiceNow is already the workflow and GRC platform for IT in large enterprises. AI Control Tower extends that to AI agent governance.',
    gap:
      "The anchor. ServiceNow is an ITSM platform. No voice interface for operations, no human-plus-agent unified workforce positioning, no executive coaching, no outbound or marketing or sales department wrapper.",
    threat: "MEDIUM",
    pricing:
      "Enterprise-only. ServiceNow platform contracts start in the six-figure range. AI Control Tower is an add-on module.",
  },
  {
    id: "humans",
    name: "Humans&",
    tagline: "Stealth · $480M Seed Round",
    strongest:
      "The signal. A $480M seed round at a $4.48B valuation is the loudest single VC bet in the AI workforce category in 2026. The thesis directly overlaps with the Level9OS workforce framing.",
    gap:
      "Nothing is public. They could ship into any layer of this space. The right read on Humans& is not a competitor profile. It's a clock. The window before a well-funded stealth player ships is months, not years.",
    threat: "HIGH WILDCARD",
    pricing: "Unknown. Pre-launch.",
  },
];

const COMPARISON_ROWS = [
  {
    label: "Annual cost (range)",
    values: {
      microsoft: "~$1M+ (enterprise)",
      salesforce: "~$850K+ (enterprise)",
      workday: "~$500K+ (mid-market)",
      anthropic: "API-based, usage-driven",
      glean: "Mid-to-high 5 figures (SMB)",
      servicenow: "Six-figure+ (enterprise)",
      level9os: "Contact for quote. SMB-first pricing.",
    },
    highlight: "level9os",
  },
  {
    label: "Sales cycle",
    values: {
      microsoft: "6 to 18 months",
      salesforce: "6 to 12 months",
      workday: "6 to 18 months",
      anthropic: "Self-serve to 3 months",
      glean: "3 to 9 months",
      servicenow: "6 to 18 months",
      level9os: "24 hours to first agent live",
    },
    highlight: "level9os",
  },
  {
    label: "Lock-in",
    values: {
      microsoft: "High",
      salesforce: "High",
      workday: "High",
      anthropic: "Medium (Claude-locked)",
      glean: "Medium",
      servicenow: "High",
      level9os: "Low (multi-vendor by design)",
    },
    highlight: "level9os",
  },
  {
    label: "Multi-vendor model support",
    values: {
      microsoft: "Partial (maturing)",
      salesforce: "No",
      workday: "No",
      anthropic: "No (Claude-only)",
      glean: "Partial (Skills framework)",
      servicenow: "Partial",
      level9os: "Yes (core design principle)",
    },
    highlight: "level9os",
  },
  {
    label: "Built for SMB?",
    values: {
      microsoft: "No",
      salesforce: "No",
      workday: "No",
      anthropic: "Partially",
      glean: "Partially",
      servicenow: "No",
      level9os: "Yes",
    },
    highlight: "level9os",
  },
  {
    label: "Human + AI unified governance",
    values: {
      microsoft: "No",
      salesforce: "No",
      workday: "Partially (HR-layer only)",
      anthropic: "No",
      glean: "No",
      servicenow: "No",
      level9os: "Yes",
    },
    highlight: "level9os",
  },
  {
    label: "Voice interface for ops",
    values: {
      microsoft: "No (meetings only)",
      salesforce: "No",
      workday: "No",
      anthropic: "No",
      glean: "No",
      servicenow: "No",
      level9os: "Yes (MAX, beta)",
    },
    highlight: "level9os",
  },
];

const THREAT_COLORS: Record<ThreatLevel, string> = {
  HIGH: "#ef4444",
  "HIGH WILDCARD": "#f97316",
  "MEDIUM-HIGH": "#f59e0b",
  MEDIUM: "#64748b",
};

// ─── Components ────────────────────────────────────────────────────────────────

function ThreatBadge({ level }: { level: ThreatLevel }) {
  const color = THREAT_COLORS[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-[0.16em] uppercase"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}35`,
        color,
      }}
    >
      {level}
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [openCompetitor, setOpenCompetitor] = useState<string | null>(null);

  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient color="rgba(139,92,246,0.08)" />
      <LiveTicker />

      {/* HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-40 pb-24 overflow-hidden"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[800px] h-[800px] rounded-full -top-32 right-0"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
              filter: "blur(140px)",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bottom-0 -left-24"
            style={{
              background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div
              className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.28)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#8b5cf6" }} />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase" style={{ color: "#8b5cf6" }}>
                Market Analysis · Not for distribution
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2rem,5vw,4rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Who else is in this space.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h2
                className="text-[clamp(2rem,5vw,4rem)] font-black leading-[1.05] tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #ef4444 100%)",
                }}
              >
                And where we actually stand.
              </h2>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/55 text-lg max-w-2xl mb-4 leading-relaxed">
              Every vendor in this space will tell you they handle agent governance. Most handle
              part of it. We mapped 70+ vendors across 8 capability layers. Seven of them are real
              competition. Here&apos;s where they&apos;re strong, where they fall short, and where
              we sit.
            </p>
            <p className="text-white/35 text-sm font-mono">
              Source: LEVEL9OS-POSITIONING-V2-AND-MARKET-RESEARCH-2026-05-11. Pricing figures are
              indicative ranges, not contractual.
            </p>
          </FadeIn>

          {/* Quadrant chart — placeholder with positioned labels */}
          <FadeIn delay={0.6}>
            <div
              className="mt-12 rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                minHeight: 340,
              }}
            >
              {/* Axes */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute top-1/2 left-4 right-4 h-px"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
                <div
                  className="absolute left-1/2 top-4 bottom-4 w-px"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              </div>

              {/* Axis labels */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-[0.18em] uppercase text-white/25">
                Ease of Setup →
              </div>
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-[0.18em] uppercase text-white/25"
                style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
              >
                Governance Depth →
              </div>

              {/* Competitor dots — positioned based on research */}
              {[
                { name: "Microsoft", x: 20, y: 18, color: "#64748b" },
                { name: "Workday", x: 24, y: 35, color: "#64748b" },
                { name: "ServiceNow", x: 18, y: 22, color: "#64748b" },
                { name: "Salesforce", x: 68, y: 72, color: "#64748b" },
                { name: "Anthropic", x: 52, y: 52, color: "#64748b" },
                { name: "Glean", x: 72, y: 65, color: "#64748b" },
                { name: "Humans&", x: 50, y: 40, color: "#f97316" },
                { name: "Level9OS", x: 80, y: 20, color: "#8b5cf6", highlight: true },
              ].map((dot) => (
                <div
                  key={dot.name}
                  className="absolute flex flex-col items-center gap-1"
                  style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: dot.color,
                      boxShadow: dot.highlight ? `0 0 8px ${dot.color}` : "none",
                    }}
                  />
                  <span
                    className="text-[9px] font-mono whitespace-nowrap"
                    style={{
                      color: dot.highlight ? dot.color : "rgba(255,255,255,0.35)",
                      fontWeight: dot.highlight ? 700 : 400,
                    }}
                  >
                    {dot.name}
                    {dot.highlight && " ◀"}
                  </span>
                </div>
              ))}

              <div className="absolute top-3 right-3 text-[9px] font-mono text-white/20">
                Placeholder · Design-flex pending
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* THREE PILLARS ───────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              The Three Pillars Level9OS Owns
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-4 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Three things separate a production-grade AI operation from a demo.
            </h2>
            <p className="text-white/45 text-base max-w-2xl mb-14 leading-relaxed">
              Multi-step orchestration. Cross-agent governance. Department-level wrappers. No one else
              has all three.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PILLARS.map((p, i) => (
              <FadeIn key={p.num} delay={i * 0.1}>
                <MagneticCard className="h-full">
                  <div
                    className="relative h-full rounded-2xl p-7 flex flex-col"
                    style={{
                      background: "var(--bg-root)",
                      border: `1px solid ${p.color}20`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                      style={{ background: p.color }}
                    />
                    <div
                      className="text-[11px] font-mono tracking-[0.22em] uppercase mb-3"
                      style={{ color: `${p.color}80` }}
                    >
                      Pillar {p.num}
                    </div>
                    <h3 className="text-xl font-bold text-white/95 mb-4 tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-white/55 text-[14px] leading-relaxed mb-5 italic">
                      {p.definition}
                    </p>
                    <div className="mb-4">
                      <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-white/30 mb-1">
                        Who else tries this
                      </div>
                      <p className="text-white/45 text-[13px] leading-relaxed">{p.others}</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-white/[0.06]">
                      <div className="text-[10px] font-mono tracking-[0.16em] uppercase mb-1" style={{ color: p.color }}>
                        Where we&apos;re different
                      </div>
                      <p className="text-white/65 text-[13px] leading-relaxed">{p.difference}</p>
                    </div>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PER-COMPETITOR BREAKDOWN ────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              Per-Competitor Breakdown
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-4 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Seven real competitors. Honest read on each.
            </h2>
            <p className="text-white/45 text-base max-w-2xl mb-12 leading-relaxed">
              Click any card to expand the full profile.
            </p>
          </FadeIn>

          <div className="space-y-3">
            {COMPETITORS.map((comp, i) => {
              const isOpen = openCompetitor === comp.id;
              const threatColor = THREAT_COLORS[comp.threat];
              return (
                <FadeIn key={comp.id} delay={i * 0.06}>
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Header row — always visible */}
                    <button
                      className="w-full text-left px-7 py-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                      onClick={() => setOpenCompetitor(isOpen ? null : comp.id)}
                    >
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div>
                          <div className="text-base font-bold text-white/90">{comp.name}</div>
                          <div className="text-[12px] text-white/40">{comp.tagline}</div>
                        </div>
                        <ThreatBadge level={comp.threat} />
                      </div>
                      <span
                        className="text-white/30 text-lg transition-transform"
                        style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                      >
                        →
                      </span>
                    </button>

                    {/* Expanded content */}
                    {isOpen && (
                      <div className="px-7 pb-7 border-t border-white/[0.06]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 pt-7">
                          <div>
                            <div
                              className="text-[10px] font-mono tracking-[0.18em] uppercase mb-2"
                              style={{ color: "#10b981" }}
                            >
                              Their strongest claim
                            </div>
                            <p className="text-white/60 text-[14px] leading-relaxed">
                              {comp.strongest}
                            </p>
                          </div>
                          <div>
                            <div
                              className="text-[10px] font-mono tracking-[0.18em] uppercase mb-2"
                              style={{ color: "#ef4444" }}
                            >
                              The gap
                            </div>
                            <p className="text-white/60 text-[14px] leading-relaxed">{comp.gap}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-6 pt-6 border-t border-white/[0.05]">
                          <div>
                            <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-white/30 mb-2">
                              Pricing posture
                            </div>
                            <p className="text-white/50 text-[13px] leading-relaxed">
                              {comp.pricing}
                            </p>
                          </div>
                          {comp.honest && (
                            <div>
                              <div
                                className="text-[10px] font-mono tracking-[0.18em] uppercase mb-2"
                                style={{ color: threatColor }}
                              >
                                When they might be right for you
                              </div>
                              <p className="text-white/50 text-[13px] leading-relaxed italic">
                                {comp.honest}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE ────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              Side-by-Side
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-12 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              The honest comparison table.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div
              className="rounded-2xl overflow-x-auto"
              style={{
                background: "var(--bg-root)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(139,92,246,0.4)" }}>
                    <th className="text-left text-[10px] font-mono tracking-[0.18em] uppercase text-white/35 py-4 px-5 w-40">
                      Capability
                    </th>
                    {["Microsoft", "Salesforce", "Workday", "Anthropic", "Glean", "Level9OS"].map(
                      (col) => (
                        <th
                          key={col}
                          className="text-left text-[10px] font-mono tracking-[0.18em] uppercase py-4 px-4"
                          style={{
                            color: col === "Level9OS" ? "#8b5cf6" : "rgba(255,255,255,0.35)",
                          }}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, ri) => (
                    <tr
                      key={row.label}
                      style={{
                        borderBottom:
                          ri === COMPARISON_ROWS.length - 1
                            ? "none"
                            : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td className="text-[12px] text-white/55 py-4 px-5 font-medium">
                        {row.label}
                      </td>
                      {(
                        [
                          "microsoft",
                          "salesforce",
                          "workday",
                          "anthropic",
                          "glean",
                          "level9os",
                        ] as const
                      ).map((key) => (
                        <td
                          key={key}
                          className="text-[12px] py-4 px-4"
                          style={{
                            color:
                              key === "level9os"
                                ? "#8b5cf6"
                                : "rgba(255,255,255,0.50)",
                            fontWeight: key === "level9os" ? 600 : 400,
                          }}
                        >
                          {row.values[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-white/25 text-[11px] font-mono">
              Pricing figures are indicative ranges from market research. Not contractual. ServiceNow
              excluded from table for column width; profile above covers them in full.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CATEGORY-DEFINING LANGUAGE ──────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              The Category
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-8 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Three vendors are saying something similar.
              <br />
              <span className="text-white/40">Here&apos;s how we&apos;re different.</span>
            </h2>
          </FadeIn>

          <div className="space-y-5">
            {[
              {
                name: "Workday ASOR",
                quote:
                  '"AI agents are managed as part of the overall organizational structure, alongside employees."',
                note: "Closest verbatim match. Workday is the system of record. Level9OS is the operating system.",
                overlap: "HIGH",
                color: "#06b6d4",
              },
              {
                name: "Aigentsphere",
                quote: '"Human + agent unified governance."',
                note: "$4M seed. Pre-traction. Multi-vendor, compliance templates, GDPR/EU AI Act/ISO 42001/NIST AI RMF support. Likely an acquisition target within 18 months.",
                overlap: "HIGH",
                color: "#8b5cf6",
              },
              {
                name: "KnowBe4 HRM+ Agent Risk Manager",
                quote: "Agents as risk entities in the same register as human employees.",
                note: "Security-anchored angle. Strong framing for compliance-first environments.",
                overlap: "MEDIUM",
                color: "#ef4444",
              },
            ].map((v, i) => (
              <FadeIn key={v.name} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-7"
                  style={{
                    background: "var(--bg-surface)",
                    border: `1px solid ${v.color}18`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-[15px] font-bold" style={{ color: v.color }}>
                      {v.name}
                    </h3>
                    <span
                      className="text-[9px] font-mono tracking-[0.2em] uppercase px-2 py-1 rounded flex-shrink-0"
                      style={{
                        background: `${v.color}12`,
                        border: `1px solid ${v.color}30`,
                        color: v.color,
                      }}
                    >
                      {v.overlap} overlap
                    </span>
                  </div>
                  <p className="text-white/55 text-[14px] leading-relaxed italic mb-3">
                    {v.quote}
                  </p>
                  <p className="text-white/40 text-[13px] leading-relaxed">{v.note}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div
              className="mt-8 rounded-2xl p-7"
              style={{
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.20)",
              }}
            >
              <h3 className="text-[15px] font-bold text-white/90 mb-3">
                Level9OS is the fourth voice in this category.
              </h3>
              <p className="text-white/60 text-[14px] leading-relaxed">
                The only one combining all four dimensions: voice interface for operations,
                bidirectional coaching (AI coaches humans, humans coach agents), multi-vendor model
                orchestration with policy enforcement, and cross-organizational federation for
                workforces that span acquisitions, JVs, contractors, and partner organizations.
                Microsoft and Salesforce reference &ldquo;collaborative workforce&rdquo; but from
                workflow and governance angles. Neither positions the human-plus-agent operating
                system as a unified workforce with shared performance, coaching, and promotion
                mechanics.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* MARKET TIMING ───────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              Market Timing
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-8 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              The 12- to 18-month window is real.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-6 text-white/60 text-base leading-relaxed">
              <p>
                The research puts likely consolidation at Q4 2027 at the earliest. Microsoft, Workday,
                Anthropic, AWS, and Salesforce are all building toward unified agent governance plays.
                Microsoft Agent 365 is the most likely category consolidator. Workday ASOR is the
                closest positioning match. Humans& could ship a product any quarter.
              </p>
              <p>
                The pattern in enterprise software is consistent: an open category gets contested for
                2 to 3 years, then one or two platforms consolidate it. The vendors who establish a
                category position in the open window set the terms of comparison. The vendors who
                wait get compared.
              </p>
              <p className="text-white/80">
                This window is open. Level9OS is building the architecture. We&apos;re not waiting
                for a distribution deal to close.
              </p>
            </div>
          </FadeIn>

          {/* Timeline events */}
          <FadeIn delay={0.2}>
            <div className="mt-12 space-y-3">
              {[
                { date: "Jan 2026", event: "Humans& raises $480M seed at $4.48B valuation.", color: "#f97316" },
                { date: "Apr 2026", event: "Anthropic launches Managed Agents — multi-agent orchestration inside Claude Console.", color: "#8b5cf6" },
                { date: "Q2 2026", event: "Workday ASOR enters general availability.", color: "#06b6d4" },
                { date: "Q4 2027 (est.)", event: "Likely consolidation window closes.", color: "#ef4444" },
              ].map((item) => (
                <div key={item.date} className="flex items-start gap-4">
                  <div
                    className="text-[11px] font-mono tracking-wider flex-shrink-0 pt-0.5 w-28"
                    style={{ color: item.color }}
                  >
                    {item.date}
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <p className="text-white/55 text-[14px] leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* HONEST QUALIFIERS ───────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              Honest Qualifiers
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-4 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              When a competitor might be the right answer.
            </h2>
            <p className="text-white/45 text-base max-w-2xl mb-12 leading-relaxed">
              We don&apos;t fit every situation. Here&apos;s the honest version of when to go
              somewhere else.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "When Microsoft might be right",
                desc: "You're a 1,000+ person enterprise, already running Microsoft 365 and Azure, with a dedicated IT governance team and an 18-month procurement timeline. Microsoft's distribution and compliance pedigree is real.",
                color: "#64748b",
              },
              {
                name: "When Salesforce might be right",
                desc: "Your primary operational data lives in Salesforce, your team is Salesforce-native, and the agents you need are CRM agents. Agentforce is genuinely strong inside the Salesforce object model.",
                color: "#64748b",
              },
              {
                name: "When Workday might be right",
                desc: "You need HR and finance workflow automation and you're already a Workday customer. ASOR is real for managing agents in the same register as employees inside the HCM layer.",
                color: "#64748b",
              },
            ].map((q, i) => (
              <FadeIn key={q.name} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <h3 className="text-[14px] font-bold text-white/70 mb-3">{q.name}</h3>
                  <p className="text-white/45 text-[13px] leading-relaxed">{q.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM LINE ─────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              The Bottom Line
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-8 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              The SMB case comes down to three things.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {[
              {
                num: "01",
                title: "Speed",
                color: "#8b5cf6",
                desc: "An agent is live in 24 hours. Governance is running from minute one. No discovery engagement before the discovery engagement. Introduce an agent, give it access, give it a day, and it walks you through what it found.",
              },
              {
                num: "02",
                title: "Architecture that doesn't require a platform commitment",
                color: "#10b981",
                desc: "Multi-vendor means the Claude, GPT, and Gemini tools you're already running still work. The orchestration layer sits above them, not instead of them. You don't rip out your current stack to add governance.",
              },
              {
                num: "03",
                title: "Human + agent unified scaffold",
                color: "#f59e0b",
                desc: "The same performance metrics, coaching structure, and accountability framework applies to human workers and AI agents. When an agent performs, it earns autonomy. When it fails, you have an audit trail.",
              },
            ].map((item, i) => (
              <FadeIn key={item.num} delay={i * 0.1}>
                <div
                  className="relative rounded-2xl p-7 h-full"
                  style={{
                    background: "var(--bg-root)",
                    border: `1px solid ${item.color}18`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                    style={{ background: item.color }}
                  />
                  <div
                    className="text-[11px] font-mono tracking-[0.22em] uppercase mb-3"
                    style={{ color: `${item.color}88` }}
                  >
                    {item.num}
                  </div>
                  <h3 className="text-[15px] font-bold text-white/90 mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-white/55 text-[13px] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div
              className="rounded-2xl p-7"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-white/50 text-[14px] leading-relaxed">
                The enterprise vendors in this space are building for IT buyers with 18-month
                procurement cycles. Level9OS is building for operations leaders who need to run
                production today and govern it tomorrow.
              </p>
              <p className="mt-3 text-white/35 text-[12px] font-mono">
                Note on governance ROI figures: specific ROI numbers from production deployments
                will be published when verified, customer-permissioned data is available. We
                don&apos;t publish unverified stats.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32 overflow-hidden"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[800px] h-[800px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white/95 leading-[1.05] tracking-tight mb-6">
              Introduce an agent.
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #ef4444)" }}
              >
                Give it a day.
              </span>
            </h2>
            <p className="text-white/45 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              It comes back and walks you through what it found. No slide deck. No 90-day
              discovery. One agent, one read, one decision point.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-white font-semibold text-lg transition hover:shadow-2xl hover:shadow-violet-500/25"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #ef4444)" }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-pulse" />
                Start here
              </a>
              <a
                href="/governance"
                className="inline-flex items-center gap-3 px-8 py-5 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
              >
                Read how governance works →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

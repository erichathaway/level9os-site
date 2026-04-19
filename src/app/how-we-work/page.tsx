"use client";
/**
 * /how-we-work — proof-driven, not price-driven.
 * Three sections that actually matter to a buyer:
 *   1. Live commercial projects — what's running in production right now
 *   2. Recent releases — what shipped in the last few weeks
 *   3. Methodology — the 30 / 90 / 180 install protocol
 *   4. Dogfood proof — we run Level9 on Level9
 *
 * No pricing tiers. Pricing is per-product (LinkupOS), per-engagement (Build/Scale)
 * and lives in the conversation, not on the marketing page.
 */

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter } from "@level9/brand/components/motion";
import { CursorGradient } from "@level9/brand/components/motion";
import { MagneticButton } from "@level9/brand/components/motion";
import { LiveTicker } from "@level9/brand/components/motion";
import { MagneticCard } from "@level9/brand/components/motion";
import { RevealMask } from "@level9/brand/components/motion";

/** Live commercial projects — actual production deployments.
 *  Sourced from observable URLs and named-account work.
 *  Anonymized where the contract requires it, named where it's public. */
type ProjectStatus = "LIVE" | "IN PRODUCTION" | "PILOT";

type Project = {
  product: string;
  productColor: string;
  pressurePoint: "Decide" | "Coordinate" | "Execute" | "Measure";
  client: string;        // anonymized industry tag or named brand
  scope: string;         // 1-line scope description
  status: ProjectStatus;
  metric: string;        // single proof metric or duration
  domain?: string;       // optional public URL
};

const liveProjects: Project[] = [
  {
    product: "StratOS",
    productColor: "#8b5cf6",
    pressurePoint: "Decide",
    client: "Level9 ELT decisions",
    scope: "10-exec decision room running every strategic call. Three-round structured debate, kill criteria, full audit trail.",
    status: "LIVE",
    metric: "Public · stratos.lucidorg.com",
    domain: "stratos.lucidorg.com",
  },
  {
    product: "LinkupOS",
    productColor: "#f59e0b",
    pressurePoint: "Execute",
    client: "Personal signal + multi-tenant base",
    scope: "Daily LinkedIn content + ICP prospecting + reply monitor + lifecycle drip. Voice-calibrated, fully autonomous. Eric's own signal runs on it; self-serve subscriber base on the same engine with per-tenant voice profiles and five subscription tiers.",
    status: "LIVE",
    metric: "Public · linkupos.com · 5 tiers",
    domain: "linkupos.com",
  },
  {
    product: "ABM Engine",
    productColor: "#fb923c",
    pressurePoint: "Execute",
    client: "Media + entertainment account",
    scope: "Account-based outbound: enrichment, ICP fit scoring, message variants per persona, multi-channel orchestration.",
    status: "LIVE",
    metric: "28 prospects · 21 custom touches",
  },
  {
    product: "LucidORG",
    productColor: "#06b6d4",
    pressurePoint: "Measure",
    client: "Board advisory engagement",
    scope: "ECI scoring across four pillars and 37 intervention levers. Shared Divergence Map between c-suite and mid-mgmt.",
    status: "LIVE",
    metric: "Public · lucidorg.com",
    domain: "lucidorg.com",
  },
  {
    product: "COO Playbook",
    productColor: "#64748b",
    pressurePoint: "Coordinate",
    client: "PE portfolio company pilot",
    scope: "30 / 90 / 180 install protocol. Five paradigm shifts, eighteen chapters, twelve frameworks.",
    status: "LIVE",
    metric: "Public · thenewcoo.com",
    domain: "thenewcoo.com",
  },
  {
    product: "CommandOS",
    productColor: "#10b981",
    pressurePoint: "Coordinate",
    client: "Level9 internal orchestration",
    scope: "Three-tier orchestrator over 48 domain officers. Session rotation, governance gates, real-time fleet observability.",
    status: "IN PRODUCTION",
    metric: "48 officers across 8 categories",
  },
  {
    product: "AutoCS",
    productColor: "#f97316",
    pressurePoint: "Execute",
    client: "Customer care automation pilot",
    scope: "Ticket triage, escalation routing, sentiment monitoring, churn-signal detection, retention plays.",
    status: "IN PRODUCTION",
    metric: "Closed-loop after ABM Engine lands account",
  },
];

/** Recent releases — what shipped in the last few weeks. Reverse chronological. */
type Release = {
  date: string;           // "Apr 2026" — month-precision is enough
  product: string;
  productColor: string;
  title: string;
  summary: string;
  tag: "FEATURE" | "POD" | "INFRASTRUCTURE" | "GOVERNANCE";
};

const recentReleases: Release[] = [
  {
    date: "Apr 2026",
    product: "OutboundOS",
    productColor: "#f59e0b",
    title: "OutboundOS umbrella consolidates the execution layer",
    summary: "LinkupOS, ABM Engine, and AutoCS now sit under one umbrella product with a shared voice-profile RAG and a single governance trail across all execution pods.",
    tag: "POD",
  },
  {
    date: "Apr 2026",
    product: "Site",
    productColor: "#8b5cf6",
    title: "level9os.com migrates to four-pressure-point taxonomy",
    summary: "Home and products rebuilt around the alignment cycle (Decide / Coordinate / Execute / Measure). New /architecture page maps four pressure points to eight operating layers and eight COO Playbook domains.",
    tag: "FEATURE",
  },
  {
    date: "Apr 2026",
    product: "ABM Engine",
    productColor: "#fb923c",
    title: "Self-serve ABM Engine: company name in, full drop campaign out",
    summary: "End-to-end ABM workflow live. Enrichment, ICP fit scoring, persona variants, sequence orchestration, reply handling. n8n-orchestrated, Supabase-backed, email API wired.",
    tag: "POD",
  },
  {
    date: "Apr 2026",
    product: "Vault",
    productColor: "#ef4444",
    title: "cmd_secrets vault: 29 API keys under RLS with daily expiry alerts",
    summary: "Secrets management consolidated into Supabase RLS-locked table with get_secret() RPC. Daily expiry alerts, rotation tracking, scoped access per agent.",
    tag: "GOVERNANCE",
  },
  {
    date: "Apr 2026",
    product: "COO Playbook",
    productColor: "#64748b",
    title: "AI Accountability Engine live at playbook.erichathaway.com",
    summary: "Eight Supabase tables wired (organizations, team_members, interviews, divergence_maps, weekly_checkins, eci_assessments, daily_briefings, blockers). Three n8n workflows active: interview processor, daily briefing, weekly check-in.",
    tag: "INFRASTRUCTURE",
  },
  {
    date: "Mar 2026",
    product: "StratOS",
    productColor: "#8b5cf6",
    title: "Multi-model decision routing across Claude, GPT-4o, Perplexity",
    summary: "Each StratOS executive room now routes per-task to the best-fit model with full provider audit trail and per-task budget enforcement.",
    tag: "FEATURE",
  },
  {
    date: "Mar 2026",
    product: "LinkupOS",
    productColor: "#f59e0b",
    title: "Voice-profile RAG: comments indistinguishable from human output",
    summary: "Pinecone + pgvector intelligence library now grounds every generated comment in user knowledge. Quality gate fires before any post leaves the system.",
    tag: "FEATURE",
  },
];

const phases = [
  {
    phase: "30",
    title: "Assess + Quick Wins",
    items: [
      "ECI baseline diagnostic",
      "Friction map of current operations",
      "30-day quick-win deployment",
      "Team orientation + first pod live",
    ],
  },
  {
    phase: "90",
    title: "Structural Install",
    items: [
      "Second pod deployed (often OutboundOS sub-pods)",
      "StratOS room calibrated for your decisions",
      "Cross-pod event bus wired",
      "Mid-point ECI re-score",
    ],
  },
  {
    phase: "180",
    title: "Optimization + Scale",
    items: [
      "All pods measured by LucidORG",
      "Friction patterns identified and addressed",
      "Innovation pipeline running",
      "Handoff to internal team or ongoing partnership",
    ],
  },
];

const tagColors: Record<Release["tag"], string> = {
  FEATURE: "#8b5cf6",
  POD: "#f59e0b",
  INFRASTRUCTURE: "#06b6d4",
  GOVERNANCE: "#ef4444",
};

export default function HowWeWorkPage() {
  return (
    <main className="min-h-screen relative">
      <FloatingNav />
      <CursorGradient color="rgba(236,72,153,0.08)" />
      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative pt-40 pb-24 overflow-hidden"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[700px] h-[700px] rounded-full top-0 right-0"
            style={{
              background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bottom-0 left-0"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(236,72,153,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                How We Work · Proof, not pitch
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Watch what&apos;s shipping.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Decide if it fits your operation.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/55 text-lg max-w-2xl mb-8 font-light leading-relaxed">
              Pricing lives in the conversation, not on the brochure. What we put on this page
              instead: every commercial deployment running right now, every release that shipped
              in the last few weeks, and the install methodology behind all of it.
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#live-projects"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.05] text-emerald-300 text-[12px] font-mono tracking-wider hover:bg-emerald-500/[0.10] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {liveProjects.length} live commercial projects
              </a>
              <a
                href="#releases"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/[0.05] text-violet-300 text-[12px] font-mono tracking-wider hover:bg-violet-500/[0.10] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                {recentReleases.length} recent releases
              </a>
              <a
                href="#methodology"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/[0.05] text-cyan-300 text-[12px] font-mono tracking-wider hover:bg-cyan-500/[0.10] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                30 / 90 / 180 install
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LIVE COMMERCIAL PROJECTS
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="live-projects"
        className="py-32 relative scroll-mt-24"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-emerald-400/60 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                Live · Commercial Deployments
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-6 leading-[1.05] max-w-3xl">
                What&apos;s actually running.
                <br />
                <span className="text-white/40">In production. Right now.</span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/45 text-lg max-w-2xl">
                Every entry below points to a real deployment. Public URLs where the contract
                allows; anonymized industry tags where it doesn&apos;t. No vapor, no roadmap.
              </p>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveProjects.map((project, i) => (
              <FadeIn key={`${project.product}-${i}`} delay={i * 0.05}>
                <MagneticCard
                  className="rounded-2xl h-full"
                  glowColor={`${project.productColor}20`}
                  maxTilt={3}
                >
                  <div
                    className="rounded-2xl border bg-[#0a0a14]/40 backdrop-blur-sm p-6 h-full hover:bg-[#0a0a14]/70 transition-colors group"
                    style={{ borderColor: `${project.productColor}25` }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(90deg, ${project.productColor}, ${project.productColor}30, transparent)`,
                      }}
                    />

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div
                          className="text-[10px] font-mono tracking-[0.3em] uppercase mb-1"
                          style={{ color: `${project.productColor}aa` }}
                        >
                          {project.pressurePoint}
                        </div>
                        <h3
                          className="text-xl font-black tracking-tight"
                          style={{ color: project.productColor }}
                        >
                          {project.product}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: project.productColor }}
                        />
                        <span
                          className="text-[10px] font-mono tracking-wider"
                          style={{ color: `${project.productColor}cc` }}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-white/85 text-sm font-semibold mb-2 leading-tight">
                      {project.client}
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mb-5">{project.scope}</p>

                    <div
                      className="pt-4 border-t flex items-center justify-between gap-3"
                      style={{ borderColor: `${project.productColor}15` }}
                    >
                      <span
                        className="text-[11px] font-mono tracking-wider"
                        style={{ color: `${project.productColor}cc` }}
                      >
                        {project.metric}
                      </span>
                      {project.domain && (
                        <a
                          href={`https://${project.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold opacity-70 hover:opacity-100 transition-opacity"
                          style={{ color: project.productColor }}
                        >
                          Visit →
                        </a>
                      )}
                    </div>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          RECENT RELEASES — what shipped recently
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="releases"
        className="py-32 relative scroll-mt-24"
        style={{ background: "#060610" }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-violet-400/60 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                Recent Releases · Changelog
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-6 leading-[1.05] max-w-3xl">
                What shipped this month.
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/45 text-lg max-w-2xl">
                Tabs of every notable release across the stack: features, pods, infrastructure,
                governance. Reverse chronological.
              </p>
            </RevealMask>
          </div>

          <div className="space-y-3">
            {recentReleases.map((release, i) => (
              <FadeIn key={`${release.title}-${i}`} delay={i * 0.04}>
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 p-6 rounded-2xl border bg-[#0a0a14]/40 backdrop-blur-sm hover:bg-[#0a0a14]/70 transition-colors group"
                  style={{ borderColor: `${release.productColor}20` }}
                >
                  {/* Date + tag column */}
                  <div className="md:col-span-2">
                    <div
                      className="text-[11px] font-mono tracking-wider mb-2"
                      style={{ color: `${release.productColor}aa` }}
                    >
                      {release.date}
                    </div>
                    <div
                      className="inline-flex items-center px-2 py-1 rounded text-[9px] font-mono tracking-[0.2em] uppercase font-bold"
                      style={{
                        background: `${tagColors[release.tag]}15`,
                        color: tagColors[release.tag],
                        border: `1px solid ${tagColors[release.tag]}30`,
                      }}
                    >
                      {release.tag}
                    </div>
                  </div>

                  {/* Product label */}
                  <div className="md:col-span-2 flex md:items-center">
                    <div
                      className="text-sm font-bold tracking-tight"
                      style={{ color: release.productColor }}
                    >
                      {release.product}
                    </div>
                  </div>

                  {/* Title + summary */}
                  <div className="md:col-span-8">
                    <h3 className="text-base font-bold text-white/90 mb-1.5 group-hover:text-white transition-colors leading-tight">
                      {release.title}
                    </h3>
                    <p className="text-white/55 text-sm leading-relaxed">{release.summary}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-12 text-center">
              <p className="text-white/35 text-sm">
                Want a heads-up when something new ships?{" "}
                <a
                  href="https://linkedin.com/company/level9os"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400/80 hover:text-violet-400 font-semibold transition-colors"
                >
                  Follow Level9OS on LinkedIn →
                </a>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          30/90/180 METHODOLOGY
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="methodology"
        className="py-32 relative scroll-mt-24"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-cyan-400/60 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Install Methodology
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-6 leading-[1.05] max-w-3xl">
                30 / 90 / 180.
                <br />
                <span className="text-white/40">Phased, non-disruptive, measurable.</span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/45 text-lg max-w-2xl">
                Every engagement follows the same phased install protocol from the COO Playbook.
                Nothing gets deployed without quick wins first. Nothing gets restructured without
                measurement.
              </p>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {phases.map((ph, i) => (
              <FadeIn key={ph.phase} delay={i * 0.15}>
                <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all h-full">
                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-7xl font-black text-violet-400/80 tabular-nums">
                      <Counter target={parseInt(ph.phase)} />
                    </span>
                    <span className="text-white/35 text-sm font-mono">DAYS</span>
                  </div>
                  <h3 className="text-xl font-black text-white/90 mb-5">{ph.title}</h3>
                  <div className="space-y-2">
                    {ph.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 text-white/60 text-sm leading-relaxed"
                      >
                        <div className="w-1 h-1 rounded-full bg-violet-400/60 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {i < phases.length - 1 && (
                    <div className="hidden sm:block absolute top-1/2 -right-3 text-white/15 text-2xl">
                      →
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DOGFOOD PROOF — we run Level9 on Level9
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="text-emerald-400/60 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-6">
                The Proof
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6 leading-[1.1]">
                We run Level9
                <br />
                on Level9.
              </h2>
              <p className="text-white/55 text-base leading-relaxed mb-5">
                Every product we sell runs our own company first. OutboundOS handles our
                marketing, outbound, and care across LinkupOS + ABM Engine + AutoCS pods, on a
                small monthly footprint. StratOS makes our strategic decisions. CommandOS
                coordinates our 48 domain officers. COO Playbook is the methodology we actually
                execute.
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                If it breaks for us, it never ships to you. If it works for us, we know exactly
                what it takes to make it work for you, because we did it first.
              </p>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="space-y-4">
                {[
                  { label: "Level9 Decision Engine", value: "StratOS", color: "#8b5cf6" },
                  { label: "Level9 Agent Orchestration", value: "CommandOS", color: "#10b981" },
                  { label: "Level9 Outbound + Care", value: "OutboundOS", color: "#f59e0b" },
                  { label: "Level9 Methodology", value: "COO Playbook", color: "#64748b" },
                  { label: "Level9 Measurement", value: "LucidORG", color: "#06b6d4" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
                  >
                    <div>
                      <div className="text-white/45 text-[12px] font-mono uppercase tracking-wider">
                        {row.label}
                      </div>
                      <div className="text-white/90 text-base font-bold">{row.value}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: row.color }}
                      />
                      <span
                        className="text-[11px] font-mono tracking-wider"
                        style={{ color: `${row.color}cc` }}
                      >
                        LIVE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "var(--bg-root)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[900px] h-[900px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.06) 30%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black text-white/95 leading-[1.05] tracking-tight mb-8">
              Want one of these
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                running for you?
              </span>
            </h2>
            <p className="text-white/45 text-lg mb-12 max-w-xl mx-auto">
              Pick the pressure point that&apos;s hurting most and start there. Pricing depends on
              the pod, the deployment shape, and whether we install or you install. Easiest way to
              find out: a thirty-minute call.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="mailto:hello@level9os.com?subject=Level9OS%20-%20Let's%20Talk"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow text-lg"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-pulse" />
                Start a Conversation
              </MagneticButton>
              <MagneticButton
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-5 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                See the Products →
              </MagneticButton>
              <MagneticButton
                href="/architecture"
                className="inline-flex items-center gap-3 px-8 py-5 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                The Architecture →
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.04]" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logos/level9/chip.svg" alt="Level9OS" className="w-full h-full" />
            </div>
            <div>
              <div className="text-white/50 text-xs font-semibold tracking-wide">Level9OS</div>
              <div className="text-white/20 text-[11px] font-mono">AI for Operations</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[12px] font-mono tracking-wider uppercase flex-wrap justify-center">
            <Link href="/" className="text-white/30 hover:text-white/70 transition-colors">
              Home
            </Link>
            <Link href="/architecture" className="text-white/30 hover:text-white/70 transition-colors">
              Architecture
            </Link>
            <Link href="/products" className="text-white/30 hover:text-white/70 transition-colors">
              Products
            </Link>
            <Link href="/partnerships" className="text-white/30 hover:text-white/70 transition-colors">
              Partnerships
            </Link>
            <Link href="/about" className="text-white/30 hover:text-white/70 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-white/30 hover:text-white/70 transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-white/20 text-[11px] font-mono">
            &copy; 2026 Level9 ·{" "}
            <a
              href="https://erichathaway.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/40 transition-colors"
            >
              Founder →
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

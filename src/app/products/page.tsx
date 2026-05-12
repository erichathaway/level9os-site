"use client";

/**
 * /products — Reorganized around Core / Plugins / Department Wrappers.
 *
 * Level9OS Core: CommandOS, LucidORG, MAX, governance services
 * Plugins: StratOS, OutboundOS umbrella, COO Playbook
 * Department Wrappers: OutboundOS as live instance, ghost cards for coming
 */

import { useState } from "react";
import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import {
  FadeIn,
  CursorGradient,
  MagneticButton,
  LiveTicker,
  MagneticCard,
  RevealMask,
} from "@level9/brand/components/motion";
import { products } from "@level9/brand/content/products";
import SiteFooter from "@/components/SiteFooter";

// Status badge colors
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  LIVE: {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
    text: "#10b981",
    dot: "#10b981",
  },
  BETA: {
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.3)",
    text: "#8b5cf6",
    dot: "#8b5cf6",
  },
  ALPHA: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    text: "#f59e0b",
    dot: "#f59e0b",
  },
  "IN PRODUCTION": {
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.3)",
    text: "#ec4899",
    dot: "#ec4899",
  },
  "IN BUILD": {
    bg: "rgba(100,116,139,0.08)",
    border: "rgba(100,116,139,0.3)",
    text: "#64748b",
    dot: "#64748b",
  },
  "COMING SOON": {
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.08)",
    text: "rgba(255,255,255,0.3)",
    dot: "rgba(255,255,255,0.2)",
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS["COMING SOON"];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-[0.15em] uppercase"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

// Get canonical products
const productByID = Object.fromEntries(products.map((p) => [p.id, p]));
const commandos = productByID["commandos"];
const lucidorg = productByID["lucidorg"];
const max = productByID["max"];
const stratos = productByID["stratos"];
const outboundos = productByID["outboundos"];
const playbook = productByID["playbook"];

// Governance service groups
const GOV_GROUPS = [
  {
    name: "Truth Enforcement",
    color: "#ef4444",
    services: [
      { name: "Lie detector", desc: "Flags outputs that contradict established facts before they ship" },
      { name: "Claim/verify", desc: "Every assertion checked against the canonical rules engine" },
      { name: "Anti-lie stop hook", desc: "Hard stop on outputs that fail the claim check" },
      { name: "Canonical rules engine", desc: "The source of truth every agent writes against" },
      { name: "Done-claim verifier", desc: "No agent claims completion without a deterministic verifier" },
    ],
  },
  {
    name: "Budget + Cost Control",
    color: "#06b6d4",
    services: [
      { name: "Cost router", desc: "Routes each task to its best-fit model at the lowest cost" },
      { name: "Costs dashboard", desc: "Real-time spend per agent, per task, per system" },
      { name: "Model selector", desc: "Picks the right model for the task, not the most expensive" },
      { name: "Per-agent budget caps", desc: "No agent runs without a ceiling" },
      { name: "Conductor", desc: "75% warn / 90% pause enforcement across all sessions" },
    ],
  },
  {
    name: "Identity + Access",
    color: "#8b5cf6",
    services: [
      { name: "Protected resources", desc: "No agent touches a resource without an explicit grant" },
      { name: "Capability grants", desc: "Scoped per agent, per task, per environment" },
      { name: "Secrets vault", desc: "RLS-locked, rotated, never exposed in logs" },
      { name: "Dossier system", desc: "Persistent identity context per operator and per agent" },
      { name: "Intent guardrail", desc: "Agent actions checked against declared intent before execution" },
      { name: "Protected-file hook", desc: "Bash-level block on writes to load-bearing paths" },
      { name: "Session history", desc: "Append-only audit trail, cmd_routing_log" },
      { name: "Governance officer panel", desc: "G1 plan / G2 mid / G3 ship, three review gates" },
    ],
  },
];

export default function ProductsPage() {
  const [govExpanded, setGovExpanded] = useState<string | null>(null);

  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient color="rgba(6,182,212,0.08)" />
      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative pt-40 pb-20 overflow-hidden"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[700px] h-[700px] rounded-full top-0 right-0"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                Core / Plugins / Wrappers
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-8">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                The full product catalog.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2rem,4vw,3.6rem)] font-black leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Three tiers. One chassis. Already running.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/50 text-lg max-w-2xl mb-8 font-light leading-relaxed">
              Level9OS Core is the platform. Plugins extend it. Department Wrappers put it to work
              inside a business function. Everything runs on the same governance chassis.
            </p>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="flex flex-wrap gap-3">
              <a href="#core" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-violet-500/30 text-violet-400/80 hover:border-violet-500/60 hover:text-violet-400 transition-colors">
                Core ↓
              </a>
              <a href="#plugins" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-white/[0.1] text-white/50 hover:border-white/[0.25] hover:text-white/80 transition-colors">
                Plugins ↓
              </a>
              <a href="#wrappers-section" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-amber-500/30 text-amber-400/70 hover:border-amber-500/60 hover:text-amber-400 transition-colors">
                Wrappers ↓
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TIER 1: LEVEL9OS CORE
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="core"
        className="py-24 scroll-mt-20 relative"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-3 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/05">
              <span className="w-1 h-1 rounded-full bg-violet-400" />
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-violet-400/70">
                Tier 1
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-4 leading-[1.05]">
              Level9OS Core
            </h2>
            <p className="text-white/50 text-base max-w-2xl mb-16 leading-relaxed">
              The platform. CommandOS orchestrates the agent fleet. LucidORG measures execution.
              MAX is how you talk to it. The governance chassis runs under all of them.
            </p>
          </FadeIn>

          {/* Core products: CommandOS, LucidORG, MAX */}
          <div className="space-y-8">
            {[commandos, lucidorg, max].filter(Boolean).map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.1}>
                <MagneticCard className="rounded-2xl" glowColor={`${p.color}15`} maxTilt={2}>
                  <div
                    className="rounded-2xl p-8 sm:p-10 border relative overflow-hidden"
                    style={{ borderColor: `${p.color}20`, background: "var(--bg-surface)" }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}30, transparent)` }} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-5 flex-wrap">
                          <span className="text-[11px] font-mono tracking-[0.2em]" style={{ color: `${p.color}aa` }}>{p.tag}</span>
                          <StatusBadge status={p.status === "IN PRODUCTION" ? "IN PRODUCTION" : p.status} />
                        </div>
                        <h3 className="text-4xl font-black mb-2 tracking-tight" style={{ color: p.color }}>{p.name}</h3>
                        <p className="text-white/40 text-[12px] font-mono uppercase tracking-wider mb-6">{p.layer}</p>
                        <div className="mb-6 space-y-4">
                          <div>
                            <div className="text-white/30 text-[11px] uppercase tracking-wider font-mono mb-1.5">The problem</div>
                            <p className="text-white/55 text-sm leading-relaxed">{p.problem}</p>
                          </div>
                          <div className="pl-4 border-l-2" style={{ borderColor: p.color }}>
                            <div className="text-[11px] uppercase tracking-wider font-mono mb-1.5" style={{ color: `${p.color}aa` }}>The answer</div>
                            <p className="text-white/85 text-sm leading-relaxed font-medium">{p.answer}</p>
                          </div>
                        </div>
                        {p.domain && (
                          <a
                            href={`https://${p.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors group"
                            style={{ color: `${p.color}cc` }}
                          >
                            {p.domain} <span className="transition-transform group-hover:translate-x-1">→</span>
                          </a>
                        )}
                        {!p.external && !p.domain && (
                          <span className="inline-flex items-center gap-2 text-sm font-mono text-white/25 italic">Internal access only</span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30 mb-4">Capabilities</div>
                        <div className="space-y-2.5">
                          {p.features.map((f) => (
                            <div key={f} className="flex items-start gap-2.5 text-white/55 text-sm">
                              <div className="w-1 h-1 rounded-full flex-shrink-0 mt-2" style={{ background: p.color }} />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}

            {/* Governance Services — the chassis */}
            <FadeIn delay={0.3}>
              <div
                className="rounded-2xl border p-8 sm:p-10 relative overflow-hidden"
                style={{ borderColor: "rgba(239,68,68,0.25)", background: "var(--bg-surface)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #ef4444, #ef444430, transparent)" }} />
                <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                  <div>
                    <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-red-400/70 mb-2">Governance Chassis</div>
                    <h3 className="text-3xl font-black text-white/90 mb-2">The Vault</h3>
                    <p className="text-white/40 text-sm font-mono uppercase tracking-wider">Runs under every product</p>
                  </div>
                  <StatusBadge status="LIVE" />
                </div>
                <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-2xl">
                  18 governance services organized into three capability groups. Not bolted on after
                  deployment. Running from the first agent action, under every product in the stack.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {GOV_GROUPS.map((group) => (
                    <div key={group.name}>
                      <button
                        className="w-full text-left"
                        onClick={() => setGovExpanded(govExpanded === group.name ? null : group.name)}
                      >
                        <div
                          className="flex items-center justify-between mb-4 pb-3 border-b"
                          style={{ borderColor: `${group.color}25` }}
                        >
                          <h4 className="text-sm font-bold" style={{ color: group.color }}>{group.name}</h4>
                          <span className="text-white/30 text-[11px] font-mono">
                            {group.services.length} services {govExpanded === group.name ? "↑" : "↓"}
                          </span>
                        </div>
                      </button>
                      <div className="space-y-3">
                        {(govExpanded === group.name ? group.services : group.services.slice(0, 3)).map((svc) => (
                          <div key={svc.name} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: group.color }} />
                            <div>
                              <div className="text-white/65 text-xs font-semibold">{svc.name}</div>
                              {govExpanded === group.name && (
                                <div className="text-white/35 text-[11px] leading-relaxed mt-0.5">{svc.desc}</div>
                              )}
                            </div>
                          </div>
                        ))}
                        {govExpanded !== group.name && group.services.length > 3 && (
                          <button
                            onClick={() => setGovExpanded(group.name)}
                            className="text-[11px] font-mono text-white/25 hover:text-white/50 transition-colors"
                            style={{ color: `${group.color}70` }}
                          >
                            +{group.services.length - 3} more →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-white/30 text-[11px] font-mono">8 chassis documents · 60+ tracked issues · 11 standards mapped</span>
                  </div>
                  <Link
                    href="/governance"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-red-400/70 hover:text-red-400 transition-colors group"
                  >
                    Read The Vault <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* LibraryOS mention */}
            <FadeIn delay={0.35}>
              <div
                className="rounded-xl border p-6 relative"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/30">In Build</div>
                  <StatusBadge status="IN BUILD" />
                </div>
                <h4 className="text-lg font-black text-white/70 mb-1">LibraryOS</h4>
                <p className="text-white/35 text-sm leading-relaxed">
                  The canonical knowledge layer inside CentralOS. Auto-updates compliance docs when
                  frameworks shift. Generates board decks and audit reports. Governs voice rules
                  for every agent in the stack. Active build workstream. Separate from the product
                  catalog until it ships.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TIER 2: PLUGINS
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="plugins"
        className="py-24 scroll-mt-20 relative"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-3 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.01]">
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/40">
                Tier 2
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-4 leading-[1.05]">
              Plugins
            </h2>
            <p className="text-white/50 text-base max-w-2xl mb-16 leading-relaxed">
              Products that plug into the core. StratOS handles strategy. OutboundOS handles
              execution. COO Playbook is how you install it.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[stratos, outboundos, playbook].filter(Boolean).map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.1}>
                <MagneticCard className="rounded-2xl h-full" glowColor={`${p.color}15`} maxTilt={3}>
                  <div
                    className="rounded-2xl border h-full relative overflow-hidden flex flex-col"
                    style={{ borderColor: `${p.color}20`, background: "var(--bg-root)" }}
                  >
                    <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
                    <div className="p-7 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: `${p.color}90` }}>{p.tag}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <h3 className="text-2xl font-black mb-1 tracking-tight" style={{ color: p.color }}>{p.name}</h3>
                      <p className="text-white/35 text-[11px] font-mono uppercase tracking-wider mb-5">{p.layer}</p>
                      <p className="text-white/55 text-sm leading-relaxed mb-5 flex-1">{p.answer}</p>
                      <div className="space-y-2 mb-6">
                        {p.features.slice(0, 3).map((f) => (
                          <div key={f} className="flex items-start gap-2 text-white/40 text-xs">
                            <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: p.color }} />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                      {/* Pods (for OutboundOS) */}
                      {p.pods && p.pods.length > 0 && (
                        <div className="mb-5 pt-5 border-t border-white/[0.05]">
                          <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">Pods inside</div>
                          <div className="space-y-2">
                            {p.pods.map((pod) => (
                              <div key={pod.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ background: `${pod.color}08`, border: `1px solid ${pod.color}18` }}>
                                <div>
                                  <span className="text-xs font-bold" style={{ color: pod.color }}>{pod.name}</span>
                                  <span className="text-white/25 text-[10px] ml-2 font-mono">{pod.tag}</span>
                                </div>
                                <StatusBadge status={pod.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-auto">
                        {p.external && p.domain ? (
                          <a
                            href={`https://${p.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold group transition-colors"
                            style={{ color: `${p.color}cc` }}
                          >
                            {p.domain} <span className="transition-transform group-hover:translate-x-1">→</span>
                          </a>
                        ) : (
                          <Link
                            href={p.href}
                            className="inline-flex items-center gap-2 text-sm font-semibold group transition-colors"
                            style={{ color: `${p.color}cc` }}
                          >
                            Details <span className="transition-transform group-hover:translate-x-1">→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TIER 3: DEPARTMENT WRAPPERS
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="wrappers-section"
        className="py-24 scroll-mt-20 relative"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-3 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/05">
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-amber-400/70">
                Tier 3
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-4 leading-[1.05]">
              Department Wrappers
            </h2>
            <p className="text-white/50 text-base max-w-2xl mb-4 leading-relaxed">
              A complete operating structure for a business function. Autonomous pods, shared
              governance, one human manager. OutboundOS is live. The others follow the same pattern.
            </p>
            <FadeIn delay={0.2}>
              <Link
                href="/wrappers"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400/70 hover:text-amber-400 transition-colors group mb-14"
              >
                See the full wrappers page <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </FadeIn>
          </FadeIn>

          {/* OutboundOS large card */}
          {outboundos && (
            <FadeIn delay={0.1}>
              <MagneticCard className="rounded-2xl mb-6" glowColor="rgba(245,158,11,0.12)" maxTilt={2}>
                <div
                  className="rounded-2xl border p-8 sm:p-10 relative overflow-hidden"
                  style={{ borderColor: "rgba(245,158,11,0.25)", background: "var(--bg-surface)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #f59e0b, #f59e0b30, transparent)" }} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-5 flex-wrap">
                        <span className="text-[11px] font-mono tracking-[0.2em] text-amber-400/70 uppercase">{outboundos.tag}</span>
                        <StatusBadge status={outboundos.status} />
                      </div>
                      <h3 className="text-4xl font-black mb-2 tracking-tight text-amber-400">OutboundOS</h3>
                      <p className="text-white/40 text-[12px] font-mono uppercase tracking-wider mb-6">
                        First live department wrapper
                      </p>
                      <p className="text-white/60 text-sm leading-relaxed mb-6">{outboundos.desc}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30 mb-4">Pods inside the wrapper</div>
                      <div className="space-y-3">
                        {outboundos.pods?.map((pod) => (
                          <div
                            key={pod.id}
                            className="rounded-xl p-4 border"
                            style={{ borderColor: `${pod.color}25`, background: `${pod.color}05` }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <h4 className="text-sm font-black" style={{ color: pod.color }}>{pod.name}</h4>
                              <StatusBadge status={pod.status} />
                            </div>
                            <p className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: `${pod.color}70` }}>{pod.tag}</p>
                            <p className="text-white/45 text-xs leading-relaxed">{pod.desc}</p>
                            {pod.domain && (
                              <a
                                href={`https://${pod.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold transition-colors group"
                                style={{ color: `${pod.color}cc` }}
                              >
                                {pod.domain} <span className="transition-transform group-hover:translate-x-1">→</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </MagneticCard>
            </FadeIn>
          )}

          {/* Ghost cards for coming wrappers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "FinanceOS", desc: "AP/AR automation, spend governance, vendor intelligence.", color: "#06b6d4" },
              { name: "SalesOS", desc: "Pipeline hygiene, deal scoring, CRM auto-update.", color: "#10b981" },
              { name: "ExecutionOS", desc: "Project ops, cross-functional coordination, milestone tracking.", color: "#8b5cf6" },
              { name: "ProductOS", desc: "Feature velocity, stakeholder alignment, sprint governance.", color: "#ec4899" },
            ].map((w, i) => (
              <FadeIn key={w.name} delay={i * 0.07}>
                <div
                  className="rounded-xl p-5 border opacity-40"
                  style={{ borderColor: `${w.color}18`, background: `${w.color}04` }}
                >
                  <div className="text-[10px] font-mono tracking-[0.15em] uppercase mb-3 text-white/20">Coming</div>
                  <h4 className="text-base font-black text-white/50 mb-2">{w.name}</h4>
                  <p className="text-white/30 text-xs leading-relaxed">{w.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-5 leading-[1.1]">
              Introduce an agent.
            </h2>
            <p className="text-white/45 text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Give it access. Give it a day. It comes back and walks you through what it found.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow"
              >
                <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                Work With Us
              </MagneticButton>
              <MagneticButton
                href="/architecture"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                See the architecture →
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

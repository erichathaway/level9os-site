"use client";
/**
 * /wrappers — Department Wrapper pattern. OutboundOS as the live instance.
 * Ghost cards for FinanceOS, SalesOS, ExecutionOS, ProductOS (coming).
 *
 * Structure:
 *   1. Hero: the department wrapper pattern
 *   2. OutboundOS: live, full detail
 *   3. Ghost cards: four upcoming wrappers
 *   4. CTA
 */

import FloatingNav from "@/components/FloatingNav";
import SiteFooter from "@/components/SiteFooter";
import {
  FadeIn,
  RevealMask,
  MagneticCard,
  MagneticButton,
  CursorGradient,
  LiveTicker,
} from "@level9/brand/components/motion";

// ─── Data ─────────────────────────────────────────────────────────────────────

const OUTBOUND_PODS = [
  {
    id: "linkupos",
    name: "LinkupOS",
    color: "#f59e0b",
    status: "LIVE",
    statusColor: "#10b981",
    url: "linkupos.com",
    desc: "LinkedIn signal pod. Daily content, ICP prospecting, follow-up sequencing, reply monitoring. Voice-calibrated, fully autonomous. Five subscription tiers. Live at linkupos.com.",
  },
  {
    id: "abm-engine",
    name: "ABM Engine",
    color: "#fb923c",
    status: "LIVE",
    statusColor: "#10b981",
    url: null,
    desc: "Multi-channel outbound. Company name in, full campaign out. Enrichment, ICP fit scoring, message variants per persona, sequence orchestration, reply handling.",
  },
  {
    id: "autocs",
    name: "AutoCS",
    color: "#f97316",
    status: "ALPHA",
    statusColor: "#f59e0b",
    url: null,
    desc: "Customer service automation: ticket triage, escalation routing, sentiment monitoring, churn-signal detection, retention plays. Closes the loop after the outbound pods land an account.",
  },
];

const GHOST_WRAPPERS = [
  {
    id: "financeos",
    name: "FinanceOS",
    color: "#06b6d4",
    desc: "AP/AR automation, budget monitoring, variance alerts, period-close orchestration.",
  },
  {
    id: "salesos",
    name: "SalesOS",
    color: "#8b5cf6",
    desc: "Pipeline management, deal progression, forecast accuracy, rep coaching signals.",
  },
  {
    id: "executionos",
    name: "ExecutionOS",
    color: "#10b981",
    desc: "Sprint coordination, delivery tracking, dependency management, team-level throughput.",
  },
  {
    id: "productos",
    name: "ProductOS",
    color: "#ec4899",
    desc: "Roadmap prioritization, feedback triage, release coordination, adoption measurement.",
  },
];

const PATTERN_POINTS = [
  "One human manager. Zero daily intervention required.",
  "Autonomous pods run the work. Governance runs under all of them.",
  "One voice-profile RAG across every pod. One output register.",
  "One audit trail: every action, every cost, every output.",
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WrappersPage() {
  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient color="rgba(245,158,11,0.08)" />
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
              background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 60%)",
              filter: "blur(140px)",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bottom-0 -left-24"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div
              className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.30)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f59e0b" }} />
              <span
                className="text-[12px] font-mono tracking-[0.3em] uppercase"
                style={{ color: "#f59e0b" }}
              >
                Department Wrappers
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Department-level AI.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h2
                className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #f59e0b 0%, #fb923c 50%, #8b5cf6 100%)",
                }}
              >
                Already running.
              </h2>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/60 text-lg max-w-2xl mb-6 font-light leading-relaxed">
              OutboundOS proved the pattern. Every department runs the same way: autonomous pods,
              shared governance, one human manager, zero daily intervention.
            </p>
            <p className="text-white/40 text-base max-w-2xl leading-relaxed">
              That structure isn&apos;t unique to outbound. It&apos;s the template. The same wrapper
              architecture applies to finance, sales, product, execution. We&apos;re building each one.
            </p>
          </FadeIn>

          {/* Pattern points */}
          <FadeIn delay={0.6}>
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
              {PATTERN_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#f59e0b" }}
                  />
                  <span className="text-white/65 text-[15px] leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* OUTBOUNDOS — LIVE INSTANCE ──────────────────────────────────────── */}
      <section
        id="outboundos"
        className="relative py-24 sm:py-32 scroll-mt-24"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-[0.22em] uppercase"
              style={{
                background: "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.35)",
                color: "#10b981",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400" />
              Live in Production
            </div>
            <h2
              className="text-4xl sm:text-5xl font-black text-white/95 mb-4 leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              OutboundOS.
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mb-3 leading-relaxed">
              The umbrella over the execution layer. Three pods running under one governance trail,
              one voice-profile RAG, one operator.
            </p>
            <p className="text-white/40 text-base max-w-2xl mb-14 leading-relaxed">
              LinkupOS and ABM Engine are live. AutoCS is in alpha, closing the loop after the
              outbound pods land an account.
            </p>
          </FadeIn>

          {/* Pod cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OUTBOUND_PODS.map((pod, i) => (
              <FadeIn key={pod.id} delay={i * 0.1}>
                <MagneticCard className="h-full">
                  <div
                    className="relative h-full rounded-2xl p-7 flex flex-col"
                    style={{
                      background: "var(--bg-root)",
                      border: `1px solid ${pod.color}22`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                      style={{ background: pod.color }}
                    />

                    <div className="flex items-start justify-between mb-5">
                      <h3
                        className="text-xl font-bold tracking-tight"
                        style={{ color: pod.color }}
                      >
                        {pod.name}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: pod.statusColor }}
                        />
                        <span
                          className="text-[10px] font-mono tracking-wider"
                          style={{ color: pod.statusColor }}
                        >
                          {pod.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-white/60 text-[14px] leading-relaxed flex-1 mb-5">
                      {pod.desc}
                    </p>

                    {pod.url && (
                      <a
                        href={`https://${pod.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-mono transition"
                        style={{ color: `${pod.color}aa` }}
                      >
                        {pod.url} →
                      </a>
                    )}
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>

          {/* Governance callout */}
          <FadeIn delay={0.4}>
            <div
              className="mt-10 rounded-2xl p-7 sm:p-9"
              style={{
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.14)",
              }}
            >
              <div
                className="text-[11px] font-mono tracking-[0.22em] uppercase mb-3"
                style={{ color: "#ef4444" }}
              >
                What runs under all of it
              </div>
              <p className="text-white/60 text-[15px] leading-relaxed max-w-3xl">
                One governance trail across every pod in OutboundOS. Every action logged. Every
                dollar tracked. Every output gated before it reaches production. The Vault chassis
                is not a feature of OutboundOS. It runs under the whole stack.
              </p>
              <a
                href="/governance"
                className="inline-flex items-center gap-2 mt-5 text-[13px] font-semibold transition"
                style={{ color: "#ef4444" }}
              >
                Read the governance docs →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* GHOST WRAPPERS ──────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div
              className="text-[11px] font-mono tracking-[0.3em] uppercase mb-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              On the runway
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-4 leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Same pattern. Different department.
            </h2>
            <p className="text-white/45 text-base max-w-2xl mb-12 leading-relaxed">
              Four wrappers in build. Each follows the same architecture: autonomous pods, shared
              governance, one operator. OutboundOS is the proof of pattern. These are next.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GHOST_WRAPPERS.map((wrapper, i) => (
              <FadeIn key={wrapper.id} delay={i * 0.08}>
                <div
                  className="relative rounded-2xl p-6 h-full"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Ghost stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-30"
                    style={{ background: wrapper.color }}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <h3
                      className="text-lg font-bold tracking-tight"
                      style={{ color: `${wrapper.color}88` }}
                    >
                      {wrapper.name}
                    </h3>
                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase px-2 py-1 rounded text-white/30 border border-white/10">
                      Coming
                    </span>
                  </div>

                  <p className="text-white/35 text-[13px] leading-relaxed">{wrapper.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center">
          <FadeIn>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/95 mb-4 tracking-tight leading-[1.1]"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Want OutboundOS running in your operation?
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Pick the path that fits where you are. Governance on from day one. Pods live before
              the first week ends.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/paths"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold transition"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)" }}
              >
                See Work With Us →
              </a>
              <MagneticButton
                href="/products"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                All Products →
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

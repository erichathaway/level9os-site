"use client";
/**
 * /paths — Three ways to start. Replaces /how-we-work (301 redirect in next.config.mjs).
 *
 * Structure:
 *   1. Hero
 *   2. Three path cards (Startup / Growth / Enterprise)
 *   3. Proof strip (experience credentials)
 *   4. 30/90/180 methodology
 *   5. CTA
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
  Counter,
} from "@level9/brand/components/motion";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PATHS = [
  {
    id: "startup",
    label: "Startup",
    accent: "#8b5cf6",
    tag: "Full packaging. Ready to drive tomorrow.",
    headline: "You don't have a stack yet.",
    body: "We build it with you. One agent pod live inside 24 hours. Governance on from day one. No retrofitting later.",
    deliverables: [
      "Intake agent: reads your current ops and surfaces what it found",
      "Initial ops read: the agent returns with a plain-English report",
      "First pod deployed: one autonomous pod running before the first week ends",
      "Governance chassis: running from day one, not retrofitted in month three",
    ],
    cta: "Start here",
    href: "/contact?path=startup",
  },
  {
    id: "growth",
    label: "Growth",
    accent: "#10b981",
    tag: "Point us to your docs. Intro an agent. Done.",
    headline: "You have an operation. Something isn't working.",
    body: "You know roughly where. Point us to your docs. Introduce an agent. The agent reads your current state and returns with a report on what it found.",
    deliverables: [
      "Agent reads your existing documentation and ops artifacts",
      "Returns a plain-English report: what it found, what it flagged, what it would fix",
      "You read the report. We talk about what's real.",
      "No discovery engagement before the discovery engagement.",
    ],
    cta: "Start here",
    href: "/contact?path=growth",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    accent: "#f59e0b",
    tag: "Try a department. See what happens to production.",
    headline: "Try OutboundOS in one department.",
    body: "30-day proof of production lift. Governance running, audit trail live, pods operating. At the end of 30 days, you have a real read on department-level AI in your environment. Then you decide whether to expand.",
    deliverables: [
      "OutboundOS deployed into one department: pods running, governance on",
      "30-day audit trail showing what ran, what cost what, what produced what",
      "ECI baseline so you have a measurement to compare against",
      "No transformation language. No multi-year contract as the entry point.",
    ],
    cta: "Start here",
    href: "/contact?path=enterprise",
  },
];

const PHASES = [
  {
    phase: 30,
    title: "Assess + Quick Wins",
    items: [
      "ECI baseline diagnostic",
      "Friction map of current operations",
      "30-day quick-win deployment",
      "Team orientation, first pod live",
    ],
  },
  {
    phase: 90,
    title: "Structural Install",
    items: [
      "Second pod deployed (often OutboundOS sub-pods)",
      "StratOS room calibrated for your decisions",
      "Cross-pod event bus wired",
      "Mid-point ECI re-score",
    ],
  },
  {
    phase: 180,
    title: "Optimization + Scale",
    items: [
      "All pods measured by LucidORG",
      "Friction patterns identified and addressed",
      "Innovation pipeline running",
      "Handoff to internal team or ongoing partnership",
    ],
  },
];

const PROOF_LOGOS = [
  "Microsoft",
  "Credit Suisse",
  "T-Mobile",
  "S&P Global",
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PathsPage() {
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
              background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 60%)",
              filter: "blur(140px)",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bottom-0 -left-24"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 60%)",
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
                border: "1px solid rgba(139,92,246,0.30)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#8b5cf6" }} />
              <span
                className="text-[12px] font-mono tracking-[0.3em] uppercase"
                style={{ color: "#8b5cf6" }}
              >
                Work With Us
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Pick your starting point.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h2
                className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #8b5cf6 0%, #10b981 50%, #f59e0b 100%)",
                }}
              >
                Same governance chassis. Different entry.
              </h2>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/55 text-lg max-w-2xl mb-3 font-light leading-relaxed">
              Introduce an agent. Give it access. Give it a day. It comes back and walks you through
              what it found.
            </p>
            <p className="text-white/40 text-base max-w-2xl font-light leading-relaxed">
              That&apos;s not a demo. That&apos;s the product working. Three entry points below
              depending on where you are.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* THREE PATHS ──────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PATHS.map((path, i) => (
              <FadeIn key={path.id} delay={i * 0.12}>
                <MagneticCard className="h-full">
                  <div
                    className="relative h-full rounded-2xl overflow-hidden p-8 sm:p-10 flex flex-col"
                    style={{
                      background: "var(--bg-surface)",
                      border: `1px solid ${path.accent}22`,
                    }}
                  >
                    {/* Accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: path.accent }}
                    />

                    {/* Label */}
                    <div
                      className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full w-fit text-[11px] font-mono tracking-[0.22em] uppercase"
                      style={{
                        background: `${path.accent}12`,
                        border: `1px solid ${path.accent}35`,
                        color: path.accent,
                      }}
                    >
                      {path.label}
                    </div>

                    {/* Tag line */}
                    <p
                      className="text-[13px] font-mono mb-4 leading-snug"
                      style={{ color: `${path.accent}cc` }}
                    >
                      &ldquo;{path.tag}&rdquo;
                    </p>

                    {/* Headline */}
                    <h2 className="text-xl sm:text-2xl font-bold text-white/95 mb-3 leading-tight tracking-tight">
                      {path.headline}
                    </h2>

                    {/* Body */}
                    <p className="text-white/60 text-[15px] leading-relaxed mb-7">{path.body}</p>

                    {/* Deliverables */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {path.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ background: path.accent }}
                          />
                          <span className="text-[13px] text-white/55 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <a
                      href={path.href}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition mt-auto w-fit"
                      style={{ background: path.accent }}
                    >
                      {path.cta}
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>

          {/* LinkedIn fallback */}
          <FadeIn delay={0.5}>
            <p className="mt-8 text-center text-white/35 text-sm">
              Prefer a direct conversation?{" "}
              <a
                href="https://linkedin.com/in/erichathaway1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/55 hover:text-white/80 underline underline-offset-2 transition"
              >
                Eric&apos;s LinkedIn →
              </a>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* PROOF STRIP ─────────────────────────────────────────────────────── */}
      <section
        className="relative py-16"
        style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
              <div className="flex-shrink-0">
                <p className="text-[11px] font-mono tracking-[0.22em] uppercase text-white/35 mb-1">
                  Operational pattern recognition from
                </p>
                <p className="text-white/60 text-base font-light">
                  3 decades. 6 continents. Deployments at scale.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                {PROOF_LOGOS.map((logo) => (
                  <span
                    key={logo}
                    className="text-[13px] font-semibold tracking-wide text-white/25"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 30/90/180 METHODOLOGY ───────────────────────────────────────────── */}
      <section
        id="methodology"
        className="relative py-24 sm:py-32 scroll-mt-24"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div
                className="text-[11px] font-mono tracking-[0.5em] uppercase mb-4"
                style={{ color: "rgba(139,92,246,0.6)" }}
              >
                The Install Methodology
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-5 leading-[1.05] max-w-3xl">
                30 / 90 / 180.
                <br />
                <span className="text-white/40">Phased. Non-disruptive. Measurable.</span>
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
            {PHASES.map((ph, i) => (
              <FadeIn key={ph.phase} delay={i * 0.15}>
                <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all h-full">
                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-7xl font-black text-violet-400/80 tabular-nums">
                      <Counter target={ph.phase} />
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
                  {i < PHASES.length - 1 && (
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

      {/* CTA ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden" style={{ background: "var(--bg-root)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[900px] h-[900px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(16,185,129,0.06) 30%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black text-white/95 leading-[1.05] tracking-tight mb-8">
              Introduce an agent.
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #8b5cf6, #10b981, #f59e0b)",
                }}
              >
                Give it a day.
              </span>
            </h2>
            <p className="text-white/45 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              It comes back and walks you through what it found. From that readout, you decide what
              to build. We run the build. Governance on from minute one.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-white font-semibold text-lg transition hover:shadow-2xl hover:shadow-violet-500/25"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #10b981)" }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-pulse" />
                Get Started
              </a>
              <MagneticButton
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-5 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                See the Products →
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

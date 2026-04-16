"use client";

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter } from "@/components/Shared";
import CursorGradient from "@/components/motion/CursorGradient";
import MagneticButton from "@/components/motion/MagneticButton";
import LiveTicker from "@/components/motion/LiveTicker";
import MagneticCard from "@/components/motion/MagneticCard";
import RevealMask from "@/components/motion/RevealMask";

const tiers = [
  {
    id: "base",
    label: "BASE",
    name: "Use Our Products",
    tagline: "Self-serve. License the methodology. Install yourself.",
    color: "#06b6d4",
    gradient: "from-cyan-500 to-blue-600",
    price: "From $29/mo",
    duration: "Immediate access",
    description:
      "You have a capable team. You want the methodology and the tools. We give you access to the products, the playbook, and the training, and your team runs the install.",
    includes: [
      "LinkupOS signal pod (from $29/mo)",
      "StratOS decision runs (~$5.89/run)",
      "COO Playbook: full 4-part methodology",
      "LucidORG diagnostic: ECI assessment",
      "Training curriculum (101/200/300 levels)",
      "Self-serve support via docs + community",
    ],
    bestFor: "Teams with capacity. Organizations with strong operational leadership already in place.",
    cta: "Start a Trial",
    ctaHref: "/products",
  },
  {
    id: "build",
    label: "BUILD",
    name: "Consult + Install",
    tagline: "We build pods for you. Install the methodology. Train your team.",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-fuchsia-600",
    price: "Engagement-based",
    duration: "30 / 90 / 180 days",
    description:
      "You want the outcome but don't want to run the build. We deploy the pods into your environment, customize workflows to your stack, train your team, and run the 30/90/180 install with you.",
    includes: [
      "Custom pod deployment (Marketing / Sales / Ops)",
      "StratOS room calibration for your stage and sector",
      "LucidORG baseline and ongoing measurement",
      "30-day quick wins installation",
      "90-day structural implementation",
      "180-day optimization + handoff",
      "Dedicated COO + CxfO partnership during engagement",
      "Direct access to senior leadership for strategic decisions",
    ],
    bestFor:
      "Organizations that see the model, want the outcome, and need a partner to install it end-to-end. Fractional COO with a full AI stack behind the engagement.",
    cta: "Book a Call",
    ctaHref: "mailto:hello@level9os.com?subject=Build%20Tier%20-%20Level9OS",
    featured: true,
  },
  {
    id: "scale",
    label: "SCALE",
    name: "Full Operating System",
    tagline: "Pods run autonomously. StratOS decides. LucidORG measures. We govern.",
    color: "#ec4899",
    gradient: "from-fuchsia-500 to-pink-600",
    price: "Custom",
    duration: "Ongoing",
    description:
      "The full autonomous loop. StratOS deliberates your strategic decisions. Commandos orchestrates execution across pods. LucidORG measures friction in real time. You become the governance layer. Approval at the gates, not the keyboard.",
    includes: [
      "Full StratOS deliberation loop on your decisions",
      "CommandOS orchestration across all execution pods",
      "Multi-pod deployment (Marketing + Sales + Ops + Finance)",
      "LucidORG ECI scoring + real-time friction alerts",
      "Governance-first: audit trails, budget enforcement, quality gates",
      "Monthly executive briefings with leadership",
      "Custom MAX deployment for your data layer",
      "Innovation pipeline feeding new ideas back to your ELT",
    ],
    bestFor:
      "Scale-stage organizations committed to AI-native operations. Private equity portfolio companies. Multi-entity operators who need one operating system across the portfolio.",
    cta: "Request Proposal",
    ctaHref: "mailto:hello@level9os.com?subject=Scale%20Tier%20-%20Level9OS",
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
      "Second pod deployed",
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
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/60">
                How We Work · 3 Tiers
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.9] tracking-tight text-white/95">
                From self-serve
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.9] tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  to full operating system.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/50 text-lg max-w-2xl mb-8 font-light leading-relaxed">
              Three ways to engage, built on the same foundation: production AI products, 30 years
              of operational pattern recognition, and a governance model that keeps humans in the
              loop where it matters.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3 TIERS
          ═══════════════════════════════════════════════════════════ */}
      <section className="pb-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.id} delay={i * 0.15}>
                <MagneticCard
                  className="rounded-3xl h-full"
                  glowColor={`${tier.color}25`}
                  maxTilt={4}
                >
                  <div
                    className="rounded-3xl p-8 h-full border backdrop-blur-sm relative overflow-hidden flex flex-col"
                    style={{
                      background: tier.featured
                        ? `linear-gradient(135deg, ${tier.color}15 0%, ${tier.color}03 100%)`
                        : `linear-gradient(135deg, ${tier.color}08 0%, transparent 100%)`,
                      borderColor: tier.featured ? `${tier.color}40` : `${tier.color}20`,
                    }}
                  >
                    {/* Top accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{
                        background: `linear-gradient(90deg, ${tier.color}, ${tier.color}40, transparent)`,
                      }}
                    />

                    {tier.featured && (
                      <div className="absolute top-5 right-5">
                        <div
                          className="text-[8px] font-mono tracking-[0.2em] uppercase px-3 py-1 rounded-full border"
                          style={{
                            color: tier.color,
                            borderColor: `${tier.color}40`,
                            background: `${tier.color}10`,
                          }}
                        >
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="mb-8">
                      <div
                        className="text-[9px] font-mono tracking-[0.3em] mb-4"
                        style={{ color: `${tier.color}aa` }}
                      >
                        TIER · {tier.label}
                      </div>
                      <h3 className="text-3xl font-black text-white/95 mb-2 tracking-tight">
                        {tier.name}
                      </h3>
                      <p className="text-sm font-semibold mb-6" style={{ color: `${tier.color}cc` }}>
                        {tier.tagline}
                      </p>

                      <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-2xl font-black text-white/90">{tier.price}</span>
                        <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                          {tier.duration}
                        </span>
                      </div>

                      <p className="text-white/50 text-sm leading-relaxed mb-6">{tier.description}</p>
                    </div>

                    <div className="space-y-2.5 mb-8 flex-1">
                      {tier.includes.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 text-white/60 text-xs leading-relaxed"
                        >
                          <div
                            className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: tier.color }}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-white/[0.06] mb-6">
                      <div
                        className="text-[9px] font-mono tracking-wider uppercase mb-2"
                        style={{ color: `${tier.color}80` }}
                      >
                        Best For
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed">{tier.bestFor}</p>
                    </div>

                    <MagneticButton
                      href={tier.ctaHref}
                      className="block w-full"
                      strength={0.15}
                    >
                      <span
                        className="block w-full text-center px-6 py-3.5 rounded-full font-semibold text-sm transition-all"
                        style={{
                          background: tier.featured
                            ? `linear-gradient(135deg, ${tier.color}, ${tier.color}80)`
                            : "transparent",
                          color: tier.featured ? "white" : tier.color,
                          border: `1px solid ${tier.color}${tier.featured ? "00" : "40"}`,
                          boxShadow: tier.featured ? `0 8px 30px ${tier.color}40` : "none",
                        }}
                      >
                        {tier.cta} →
                      </span>
                    </MagneticButton>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          30/90/180 METHODOLOGY
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-violet-400/50 text-[9px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Methodology
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
              <p className="text-white/40 text-lg max-w-2xl">
                Every Build and Scale engagement follows the same phased install protocol from the
                COO Playbook. Nothing gets deployed without quick wins first. Nothing gets
                restructured without measurement.
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
                    <span className="text-white/30 text-sm font-mono">DAYS</span>
                  </div>
                  <h3 className="text-xl font-black text-white/90 mb-5">{ph.title}</h3>
                  <div className="space-y-2">
                    {ph.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 text-white/55 text-sm leading-relaxed"
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
          THE DOGFOOD PROOF
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="text-emerald-400/50 text-[9px] tracking-[0.5em] uppercase font-mono font-semibold mb-6">
                The Proof
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6 leading-[1.1]">
                We run Level9
                <br />
                on Level9.
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-5">
                Every product we sell runs our own company first. LinkupOS handles our marketing,
                zero daily intervention, around $5/month. StratOS makes our strategic decisions.
                CommandOS coordinates our 48 domain officers. COO Playbook is the methodology we
                actually execute.
              </p>
              <p className="text-white/35 text-sm leading-relaxed">
                If it breaks for us, it never ships to you. If it works for us, we know exactly
                what it takes to make it work for you, because we did it first.
              </p>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="space-y-4">
                {[
                  { label: "Level9 Marketing Pod", value: "LinkupOS", color: "#f59e0b" },
                  { label: "Level9 Decision Engine", value: "StratOS", color: "#8b5cf6" },
                  { label: "Level9 Agent Orchestration", value: "CommandOS", color: "#10b981" },
                  { label: "Level9 Methodology", value: "COO Playbook", color: "#64748b" },
                  { label: "Level9 Measurement", value: "LucidORG", color: "#06b6d4" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
                  >
                    <div>
                      <div className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
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
                        className="text-[9px] font-mono tracking-wider"
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
      <section className="py-32 relative overflow-hidden" style={{ background: "#060610" }}>
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
            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black text-white/95 leading-[0.95] tracking-tight mb-8">
              Which tier is
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                right for your org?
              </span>
            </h2>
            <p className="text-white/45 text-lg mb-12 max-w-xl mx-auto">
              Not sure yet? A 30-minute strategy call is the fastest way to find out which
              engagement model matches what you&apos;re trying to fix.
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
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.04]" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-cyan-500 to-fuchsia-500 flex items-center justify-center text-white text-[9px] font-black">
              L9
            </div>
            <div>
              <div className="text-white/50 text-xs font-semibold tracking-wide">Level9OS</div>
              <div className="text-white/20 text-[9px] font-mono">AI for Operations</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono tracking-wider uppercase flex-wrap justify-center">
            <Link href="/" className="text-white/30 hover:text-white/70 transition-colors">
              Home
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
          <div className="text-white/20 text-[9px] font-mono">
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

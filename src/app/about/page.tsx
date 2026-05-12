"use client";
/**
 * /about — Level9OS the company.
 * Folds in partnerships content (per decisions doc — /partnerships dies).
 *
 * Sections:
 *   1. Hero
 *   2. Origin + founder context (Eric Hathaway, 20+ years)
 *   3. Charter values (7 principles from Responsible AI Policy)
 *   4. LLC clarity
 *   5. Partner network
 *   6. CTA
 */

import FloatingNav from "@/components/FloatingNav";
import SiteFooter from "@/components/SiteFooter";
import {
  FadeIn,
  Counter,
  RevealMask,
  MagneticCard,
  MagneticButton,
  CursorGradient,
  LiveTicker,
} from "@level9/brand/components/motion";
import { partners, learningCapabilities } from "@/data/partners";

// ─── Data ──────────────────────────────────────────────────────────────────────

const CHARTER_VALUES = [
  {
    label: "Augment, never replace.",
    desc: "AI that makes the operator more capable. Never a substitute for human judgment at the points that matter.",
    color: "#10b981",
  },
  {
    label: "Honesty before fluency.",
    desc: "An agent that hedges is better than an agent that sounds confident and is wrong. Claim-verify is not optional.",
    color: "#8b5cf6",
  },
  {
    label: "Transparency over plausibility.",
    desc: "The audit trail is not a feature. It is the product. If you can't see what the agent did, you can't govern it.",
    color: "#06b6d4",
  },
  {
    label: "Source discipline.",
    desc: "Every quantitative claim traceable to a primary source. Unknown information is flagged, not invented.",
    color: "#f59e0b",
  },
  {
    label: "Privacy by default.",
    desc: "Four-class data taxonomy. C-3 Customer Confidential never leaves the operating context without an explicit grant.",
    color: "#ef4444",
  },
  {
    label: "No theater.",
    desc: "Governance that doesn't enforce is window dressing. Every control is mechanical or it doesn't count.",
    color: "#ec4899",
  },
  {
    label: "LLC separation.",
    desc: "Each operating LLC is governed separately. Obligations under one entity don't cross to another without explicit authorization.",
    color: "#64748b",
  },
];

const LLC_ENTITIES = [
  {
    name: "Level9OS LLC",
    role: "Umbrella brand and consulting entity.",
    desc: "Level9OS.com describes the product family. Consulting engagements and brand-level relationships run through this entity.",
    accent: "#8b5cf6",
  },
  {
    name: "LucidORG LLC",
    role: "Commercial product operations.",
    desc: "Operates LinkupOS, LucidORG.com, COO Playbook, and StratOS. Customer data and commercial product obligations are under this entity.",
    accent: "#06b6d4",
  },
  {
    name: "NextGen Interns LLC",
    role: "Education platform.",
    desc: "Operates the NextGen Interns platform. COPPA-sensitive. Student and intern audience. Kept fully separate from commercial product operations.",
    accent: "#10b981",
  },
];

const PROOF_STATS = [
  { num: 20, suffix: "+", label: "Years Experience", color: "#f59e0b" },
  { num: 6, suffix: "", label: "Continents", color: "#10b981" },
  { num: 60, suffix: "+", label: "Countries", color: "#06b6d4" },
  { num: 138, suffix: "", label: "Workflows Live", color: "#8b5cf6" },
  { num: 48, suffix: "", label: "Domain Officers", color: "#ec4899" },
  { num: 6, suffix: "+", label: "Products Deployed", color: "#06b6d4" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient color="rgba(16,185,129,0.08)" />
      <LiveTicker />

      {/* HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-40 pb-24 overflow-hidden"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[700px] h-[700px] rounded-full top-0 left-0"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bottom-0 right-0"
            style={{
              background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div
              className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                Level9OS · The Company
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Operations is where
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h2
                className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
                }}
              >
                the leverage lives.
              </h2>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/50 text-lg max-w-2xl font-light leading-relaxed">
              Level9OS is a product company, not a consulting practice. We build production-grade AI
              systems for the operational layer. The function that connects everything and determines
              whether strategy actually survives contact with reality.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FOUNDER CONTEXT ─────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-start">
            <div>
              <RevealMask>
                <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-emerald-400/50 mb-6">
                  The Origin
                </div>
              </RevealMask>
              <RevealMask delay={100}>
                <h2
                  className="text-3xl sm:text-4xl font-black text-white/90 mb-10 leading-[1.15]"
                  style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
                >
                  We stopped fixing other people&apos;s systems
                  <br />
                  <span className="text-white/40">and built the ones we wished existed.</span>
                </h2>
              </RevealMask>

              <div className="space-y-6 text-white/55 text-base leading-relaxed">
                <FadeIn delay={0.2}>
                  <p>
                    Eric Hathaway built Level9OS from 20+ years of executive operating leadership
                    across Microsoft, Credit Suisse, T-Mobile, and S&P Global. Six continents. Sixty
                    countries. Deployments at scale across every kind of operating complexity.
                  </p>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <p>
                    One pattern kept repeating. Strategy failures are almost never about strategy.
                    They&apos;re about the layer beneath it: how decisions get made, how work gets
                    coordinated, how alignment gets measured. Marketing has automation. Sales has
                    CRM. Finance has models. Operations, the function that ties all of those
                    together, was still running on spreadsheets, offsites, and hope.
                  </p>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <p className="text-white/70">
                    Level9OS exists because the operational layer finally deserves the same AI
                    investment every other function already has. And because decades of pattern
                    recognition inside global enterprises deserves to be productized, not sold by
                    the hour.
                  </p>
                </FadeIn>
              </div>
            </div>

            {/* Proof stats */}
            <FadeIn delay={0.4}>
              <div className="grid grid-cols-2 gap-5 lg:min-w-[260px]">
                {PROOF_STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <div
                      className="text-3xl font-black mb-1 tabular-nums"
                      style={{ color: s.color }}
                    >
                      <Counter target={s.num} suffix={s.suffix} />
                    </div>
                    <div className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-mono">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CHARTER VALUES ──────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              Operating Charter
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-4 leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Seven principles. No exceptions.
            </h2>
            <p className="text-white/45 text-base max-w-2xl mb-14 leading-relaxed">
              These are not brand values. They are operating constraints. They govern what every
              agent in the stack is and is not allowed to do, regardless of who asks.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHARTER_VALUES.map((val, i) => (
              <FadeIn key={val.label} delay={i * 0.07}>
                <div
                  className="relative rounded-2xl p-6 h-full"
                  style={{
                    background: "var(--bg-root)",
                    border: `1px solid ${val.color}18`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                    style={{ background: val.color }}
                  />
                  <h3
                    className="text-[15px] font-bold mb-2 leading-snug"
                    style={{ color: val.color }}
                  >
                    {val.label}
                  </h3>
                  <p className="text-white/50 text-[13px] leading-relaxed">{val.desc}</p>
                </div>
              </FadeIn>
            ))}

            {/* Seventh card spans to complete grid cleanly */}
          </div>
        </div>
      </section>

      {/* LLC CLARITY ─────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              Legal Structure
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-4 leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Three entities. Kept intentionally separate.
            </h2>
            <p className="text-white/45 text-base max-w-2xl mb-12 leading-relaxed">
              Each LLC has its own obligations, its own customer base, and its own governance. They
              share a brand family and a common technical chassis. They do not share legal exposure.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {LLC_ENTITIES.map((llc, i) => (
              <FadeIn key={llc.name} delay={i * 0.1}>
                <MagneticCard className="h-full">
                  <div
                    className="relative h-full rounded-2xl p-7"
                    style={{
                      background: "var(--bg-surface)",
                      border: `1px solid ${llc.accent}20`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                      style={{ background: llc.accent }}
                    />
                    <h3
                      className="text-lg font-bold mb-1 tracking-tight"
                      style={{ color: llc.accent }}
                    >
                      {llc.name}
                    </h3>
                    <p
                      className="text-[11px] font-mono tracking-[0.12em] uppercase mb-4"
                      style={{ color: `${llc.accent}80` }}
                    >
                      {llc.role}
                    </p>
                    <p className="text-white/55 text-[14px] leading-relaxed">{llc.desc}</p>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS ────────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-[11px] font-mono tracking-[0.5em] uppercase text-white/35 mb-4">
              Partner Network
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-white/90 mb-4 leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Who we work with.
            </h2>
            <p className="text-white/45 text-base max-w-2xl mb-12 leading-relaxed">
              Non-profits, accelerators, education programs. Level9OS does not sell to individuals.
              We partner with the people who do.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
            {partners.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08}>
                <MagneticCard className="h-full">
                  <a
                    href={p.external ? p.href : undefined}
                    target={p.external ? "_blank" : undefined}
                    rel={p.external ? "noopener noreferrer" : undefined}
                    className="relative block h-full rounded-2xl p-7 group"
                    style={{
                      background: "var(--bg-root)",
                      border: `1px solid ${p.color}18`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{ background: p.color }}
                    />

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div
                          className="text-[10px] font-mono tracking-[0.22em] uppercase mb-1"
                          style={{ color: `${p.color}88` }}
                        >
                          {p.type}
                        </div>
                        <h3
                          className="text-lg font-bold tracking-tight group-hover:opacity-90 transition"
                          style={{ color: p.color }}
                        >
                          {p.name}
                        </h3>
                      </div>
                      {p.featured && (
                        <span
                          className="text-[9px] font-mono tracking-[0.2em] uppercase px-2 py-1 rounded"
                          style={{
                            background: `${p.color}14`,
                            color: p.color,
                            border: `1px solid ${p.color}30`,
                          }}
                        >
                          Featured
                        </span>
                      )}
                    </div>

                    <p
                      className="text-[13px] font-medium mb-3 leading-snug"
                      style={{ color: `${p.color}cc` }}
                    >
                      {p.tagline}
                    </p>
                    <p className="text-white/45 text-[13px] leading-relaxed">{p.description}</p>

                    {p.external && (
                      <div
                        className="mt-4 text-[12px] font-mono transition"
                        style={{ color: `${p.color}66` }}
                      >
                        Visit →
                      </div>
                    )}
                  </a>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>

          {/* Learning capabilities */}
          <FadeIn delay={0.3}>
            <div className="pt-12 border-t border-white/[0.06]">
              <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/25 mb-6">
                Learning capabilities
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {learningCapabilities.map((cap) => (
                  <a
                    key={cap.title}
                    href={cap.href}
                    target={cap.external ? "_blank" : undefined}
                    rel={cap.external ? "noopener noreferrer" : undefined}
                    className="block rounded-xl p-5 transition group"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="text-[10px] font-mono tracking-[0.18em] uppercase mb-1"
                      style={{ color: `${cap.color}88` }}
                    >
                      {cap.audience}
                    </div>
                    <h4
                      className="text-base font-bold mb-2 group-hover:opacity-90 transition"
                      style={{ color: cap.color }}
                    >
                      {cap.title}
                    </h4>
                    <p className="text-white/40 text-[12px] leading-relaxed">{cap.desc}</p>
                  </a>
                ))}
              </div>
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
              background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white/95 leading-[1.05] tracking-tight mb-8">
              Ready to see
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #10b981, #06b6d4)",
                }}
              >
                what we&apos;ve built?
              </span>
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-emerald-500/30 transition-shadow"
              >
                <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                See the Products
              </MagneticButton>
              <MagneticButton
                href="/paths"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                Work With Us →
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

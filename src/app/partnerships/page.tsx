"use client";

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn } from "@/components/Shared";
import CursorGradient from "@/components/motion/CursorGradient";
import MagneticButton from "@/components/motion/MagneticButton";
import LiveTicker from "@/components/motion/LiveTicker";
import MagneticCard from "@/components/motion/MagneticCard";
import RevealMask from "@/components/motion/RevealMask";
import { partners, learningCapabilities } from "@/data/partners";

export default function PartnershipsPage() {
  const featured = partners.find((p) => p.featured);
  const others = partners.filter((p) => !p.featured);

  return (
    <main className="min-h-screen relative">
      <FloatingNav />
      <CursorGradient color="rgba(16,185,129,0.08)" />
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
            className="absolute w-[700px] h-[700px] rounded-full top-0 left-0"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)",
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

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/60">
                The Partner Network · Education · 501(c)(3)
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.9] tracking-tight text-white/95">
                We don&apos;t sell to individuals.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.9] tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  We partner with the people who do.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/50 text-lg max-w-2xl mb-8 font-light leading-relaxed">
              Level9 is a product company. The methodology, the curriculum, and the AI career
              track all reach individuals through our partner network — non-profits,
              accelerators, and education programs that already speak to the people who&apos;ll run
              tomorrow&apos;s operations.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED — NextGenIntern
          ═══════════════════════════════════════════════════════════ */}
      {featured && (
        <section className="py-24 relative" style={{ background: "#060610" }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-12">
            <RevealMask>
              <div
                className="text-[9px] tracking-[0.5em] uppercase font-mono font-semibold mb-6"
                style={{ color: `${featured.color}80` }}
              >
                The Education Arm · 501(c)(3)
              </div>
            </RevealMask>

            <FadeIn>
              <MagneticCard
                className="rounded-3xl"
                glowColor={`${featured.color}30`}
                maxTilt={3}
              >
                <div
                  className="rounded-3xl p-10 sm:p-16 border relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${featured.color}10 0%, ${featured.color}03 50%, transparent 100%)`,
                    borderColor: `${featured.color}30`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{
                      background: `linear-gradient(90deg, ${featured.color}, ${featured.color}40, transparent)`,
                    }}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="text-[9px] font-mono tracking-[0.2em] uppercase px-3 py-1 rounded-full border" style={{ borderColor: `${featured.color}40`, background: `${featured.color}10`, color: featured.color }}>
                          {featured.type}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: featured.color }} />
                          <span className="text-[9px] font-mono tracking-wider" style={{ color: `${featured.color}aa` }}>FEATURED</span>
                        </div>
                      </div>

                      <h2 className="text-5xl sm:text-6xl font-black text-white/95 mb-4 tracking-tight">
                        {featured.name}
                      </h2>
                      <p className="text-xl font-semibold mb-8" style={{ color: `${featured.color}cc` }}>
                        {featured.tagline}
                      </p>
                      <p className="text-white/55 text-base leading-relaxed mb-10">
                        {featured.description}
                      </p>

                      <a
                        href={featured.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold transition-all hover:scale-[1.02]"
                        style={{
                          background: `linear-gradient(135deg, ${featured.color}, ${featured.color}80)`,
                          boxShadow: `0 8px 30px ${featured.color}30`,
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                        Looking for a career in AI?
                        <span className="ml-1">→</span>
                      </a>
                    </div>

                    {/* Right: stats panel */}
                    <div className="space-y-4">
                      {[
                        { label: "Audience", value: "Individuals · Students · Career Changers" },
                        { label: "Status", value: "501(c)(3) Non-Profit" },
                        { label: "Focus", value: "AI Operations Careers" },
                        { label: "Domain", value: "nextgenintern.com" },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="p-4 rounded-xl border bg-white/[0.02]"
                          style={{ borderColor: `${featured.color}15` }}
                        >
                          <div
                            className="text-[9px] font-mono tracking-wider uppercase mb-1"
                            style={{ color: `${featured.color}80` }}
                          >
                            {row.label}
                          </div>
                          <div className="text-white/85 text-sm font-bold">{row.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MagneticCard>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          OTHER PARTNERS
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-violet-400/50 text-[9px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Network
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 leading-[1.1] max-w-3xl">
                Curriculum, accelerators, and regional programs.
              </h2>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {others.map((partner, i) => (
              <FadeIn key={partner.id} delay={i * 0.1}>
                <MagneticCard
                  className="rounded-2xl h-full"
                  glowColor={`${partner.color}25`}
                  maxTilt={4}
                >
                  <div
                    className="rounded-2xl p-7 h-full border bg-[#0a0a14]/40 backdrop-blur-sm group hover:bg-[#0a0a14]/60 transition-colors flex flex-col"
                    style={{ borderColor: `${partner.color}20` }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(90deg, ${partner.color}, ${partner.color}30, transparent)`,
                      }}
                    />

                    <div
                      className="text-[9px] font-mono tracking-[0.2em] uppercase mb-4"
                      style={{ color: `${partner.color}aa` }}
                    >
                      {partner.type}
                    </div>
                    <h3 className="text-2xl font-black text-white/90 mb-3 group-hover:text-white transition-colors">
                      {partner.name}
                    </h3>
                    <p
                      className="text-sm font-semibold mb-4"
                      style={{ color: `${partner.color}cc` }}
                    >
                      {partner.tagline}
                    </p>
                    <p className="text-white/45 text-xs leading-relaxed flex-1 mb-6">
                      {partner.description}
                    </p>

                    {partner.external ? (
                      <a
                        href={partner.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold inline-flex items-center gap-2 transition-transform group-hover:translate-x-1"
                        style={{ color: partner.color }}
                      >
                        Visit {partner.name} →
                      </a>
                    ) : (
                      <span className="text-[10px] font-mono text-white/30 tracking-wider uppercase">
                        Active partnership
                      </span>
                    )}
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LEARNING CAPABILITIES
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-cyan-400/50 text-[9px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                Learning Capabilities
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6 leading-[1.1] max-w-3xl">
                What gets taught,
                <br />
                <span className="text-white/40">and to whom.</span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/40 text-base max-w-2xl">
                The methodology, the products, and the operating model — adapted for four
                different audiences, delivered through the partner network.
              </p>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {learningCapabilities.map((cap, i) => (
              <FadeIn key={cap.title} delay={i * 0.1}>
                <MagneticCard
                  className="rounded-2xl h-full"
                  glowColor={`${cap.color}20`}
                  maxTilt={3}
                >
                  <div
                    className="rounded-2xl p-7 h-full border bg-[#0a0a14]/40 backdrop-blur-sm group"
                    style={{ borderColor: `${cap.color}18` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-black text-white/90 mb-2 group-hover:text-white transition-colors">
                          {cap.title}
                        </h3>
                        <div
                          className="text-[9px] font-mono tracking-wider uppercase"
                          style={{ color: `${cap.color}aa` }}
                        >
                          {cap.audience}
                        </div>
                      </div>
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2"
                        style={{ background: cap.color }}
                      />
                    </div>

                    <p className="text-white/50 text-sm leading-relaxed mb-5">{cap.desc}</p>

                    {cap.external ? (
                      <a
                        href={cap.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold inline-flex items-center gap-2 transition-transform group-hover:translate-x-1"
                        style={{ color: cap.color }}
                      >
                        Learn more →
                      </a>
                    ) : (
                      <span className="text-[10px] font-mono text-white/30 tracking-wider uppercase">
                        Active program
                      </span>
                    )}
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOR INDIVIDUALS / FOR INSTITUTIONS
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* For Individuals */}
            <FadeIn direction="left">
              <div className="rounded-3xl p-10 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-transparent h-full">
                <div className="text-emerald-400/70 text-[9px] tracking-[0.3em] uppercase font-mono mb-4">
                  For Individuals
                </div>
                <h3 className="text-3xl font-black text-white/95 mb-4 leading-tight">
                  Want a career
                  <br />
                  in AI operations?
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mb-8">
                  All individual learning lives on our 501(c)(3) education arm. High school
                  exploration, college upskilling, career changes, mentorship — start here.
                </p>
                <a
                  href="https://nextgenintern.com/individual-learning"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
                >
                  <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                  nextgenintern.com →
                </a>
              </div>
            </FadeIn>

            {/* For Institutions */}
            <FadeIn direction="right" delay={0.15}>
              <div className="rounded-3xl p-10 border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] to-transparent h-full">
                <div className="text-violet-400/70 text-[9px] tracking-[0.3em] uppercase font-mono mb-4">
                  For Institutions
                </div>
                <h3 className="text-3xl font-black text-white/95 mb-4 leading-tight">
                  Bringing AI ops
                  <br />
                  to your students?
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mb-8">
                  We partner with universities, business schools, accelerators, and high schools.
                  Curriculum modules, guest lectures, executive education programs — let&apos;s
                  talk.
                </p>
                <MagneticButton
                  href="mailto:partnerships@level9os.com?subject=Partnership%20Inquiry"
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow"
                >
                  <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                  Partner With Us →
                </MagneticButton>
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
            className="absolute w-[800px] h-[800px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 50%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white/95 leading-[0.95] tracking-tight mb-8">
              We bring the AI.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                You bring the audience.
              </span>
            </h2>
            <p className="text-white/45 text-base mb-12 max-w-xl mx-auto">
              If you train, accelerate, or educate operators — let&apos;s build something
              together.
            </p>
            <MagneticButton
              href="mailto:partnerships@level9os.com?subject=Partnership%20-%20Level9OS"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 text-white font-semibold hover:shadow-2xl hover:shadow-emerald-500/30 transition-shadow text-lg"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-pulse" />
              Start a Partnership Conversation
            </MagneticButton>
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
            <Link href="/how-we-work" className="text-white/30 hover:text-white/70 transition-colors">
              How We Work
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

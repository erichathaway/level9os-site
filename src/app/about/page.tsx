"use client";

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter } from "@/components/Shared";
import CursorGradient from "@/components/motion/CursorGradient";
import MagneticButton from "@/components/motion/MagneticButton";
import LiveTicker from "@/components/motion/LiveTicker";
import MagneticCard from "@/components/motion/MagneticCard";
import RevealMask from "@/components/motion/RevealMask";

export default function AboutPage() {
  return (
    <main className="min-h-screen relative">
      <FloatingNav />
      <CursorGradient color="rgba(16,185,129,0.08)" />
      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Level9 the company
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

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                The Story · Level9
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
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  the leverage lives.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/50 text-lg max-w-2xl mb-8 font-light leading-relaxed">
              Level9 is a product company, not a consulting practice. We build production-grade AI
              systems for the operational layer. The function that connects everything and
              determines whether strategy actually survives contact with reality.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE ORIGIN
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-12">
          <RevealMask>
            <div className="text-emerald-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-6">
              The Origin
            </div>
          </RevealMask>
          <RevealMask delay={100}>
            <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-10 leading-[1.15]">
              We stopped fixing other people&apos;s systems
              <br />
              <span className="text-white/40">and started building the ones we wished existed.</span>
            </h2>
          </RevealMask>

          <div className="space-y-6 text-white/55 text-base leading-relaxed">
            <FadeIn delay={0.2}>
              <p>
                Three decades of operational leadership across six continents made one pattern
                impossible to ignore. Strategy failures are almost never about strategy.
                They&apos;re about the layer beneath it: how decisions get made, how work gets
                coordinated, how alignment gets measured.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p>
                Marketing has automation. Sales has CRM. Finance has models. Operations, the
                function that ties all of those together, is still running on spreadsheets,
                offsites, and hope. That&apos;s where Level9 was built.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-white/70">
                Level9 exists because the operational layer finally deserves the same AI
                investment every other function already has. And because decades of pattern
                recognition inside global enterprises deserves to be productized, not sold by
                the hour.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE MODEL
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-violet-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Model
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 leading-[1.1] max-w-3xl">
                Pods replace departments.
                <br />
                <span className="text-white/40">One human manager. Dozens of workflows. Measured continuously.</span>
              </h2>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
            {[
              {
                num: "01",
                title: "Playbook",
                desc: "Strategy translated into sequenced, measurable execution. The COO Playbook methodology.",
                color: "#8b5cf6",
              },
              {
                num: "02",
                title: "Pod",
                desc: "Autonomous execution unit. n8n workflows + Pinecone RAG + governance layer. One human manages many.",
                color: "#10b981",
              },
              {
                num: "03",
                title: "Measurement",
                desc: "LucidORG ECI scoring. Real-time friction detection. Targeted intervention flags.",
                color: "#06b6d4",
              },
            ].map((item, i) => (
              <FadeIn key={item.num} delay={i * 0.15}>
                <MagneticCard
                  className="rounded-2xl h-full"
                  glowColor={`${item.color}25`}
                  maxTilt={4}
                >
                  <div
                    className="rounded-2xl p-7 h-full border backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}08 0%, transparent 100%)`,
                      borderColor: `${item.color}20`,
                    }}
                  >
                    <div
                      className="text-[11px] font-mono tracking-[0.2em] mb-6"
                      style={{ color: `${item.color}80` }}
                    >
                      {item.num}
                    </div>
                    <h3
                      className="text-2xl font-black mb-4 tracking-tight"
                      style={{ color: item.color }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
              <p className="text-white/50 text-sm">
                Marketing + outbound + customer care department of 10 →{" "}
                <span className="text-emerald-400 font-bold">1 manager + OutboundOS umbrella</span>{" "}
                (LinkupOS, ABM Engine, AutoCS pods). Proven first on Level9 itself at{" "}
                <span className="text-emerald-400 font-mono">~$5/month</span> operating cost.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE PROOF — We run Level9 on Level9
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 text-center">
          <RevealMask>
            <div className="text-cyan-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
              The Proof
            </div>
          </RevealMask>
          <RevealMask delay={100}>
            <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-8 leading-[1.05]">
              Everything we sell,
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                we run on ourselves first.
              </span>
            </h2>
          </RevealMask>

          <FadeIn delay={0.3}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 my-16">
              {[
                { num: 138, label: "Workflows Live", color: "#10b981" },
                { num: 48, label: "Domain Officers", color: "#8b5cf6" },
                { num: 6, label: "Products Deployed", color: "#06b6d4" },
                { num: 30, label: "Years Pattern Recognition", color: "#f59e0b", suffix: "+" },
              ].map((s) => (
                <div key={s.label} className="group cursor-default">
                  <div
                    className="text-4xl sm:text-5xl font-black mb-2 transition-transform group-hover:scale-110 tabular-nums"
                    style={{ color: s.color }}
                  >
                    <Counter target={s.num} suffix={s.suffix || ""} />
                  </div>
                  <div className="text-white/25 text-[11px] uppercase tracking-[0.25em] font-mono">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <p className="text-white/45 text-base max-w-2xl mx-auto leading-relaxed">
              If it breaks for us, it never ships to you. If it works for us, we know exactly what
              it takes to make it work for you, because we did it first.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OPERATIONAL DNA — Where the experience comes from
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <RevealMask>
              <div className="text-white/30 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                Operational DNA
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6 leading-[1.1]">
                Built inside the rooms we&apos;re now
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  building the tools for.
                </span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed">
                Level9&apos;s operating model wasn&apos;t theorized. It was extracted from three
                decades of running operations inside global enterprises. The frameworks we sell
                are the ones we actually used.
              </p>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 max-w-4xl mx-auto">
              {[
                { num: 30, suffix: "+", label: "Years Experience" },
                { num: 6, suffix: "", label: "Continents" },
                { num: 60, suffix: "+", label: "Countries" },
                { num: 5, suffix: "", label: "Global Enterprises" },
                { num: 6, suffix: "", label: "AI Products Built" },
              ].map((s) => (
                <div key={s.label} className="text-center group cursor-default">
                  <div className="text-3xl sm:text-4xl font-black text-white/80 group-hover:text-white transition-colors tabular-nums">
                    <Counter target={s.num} suffix={s.suffix} />
                  </div>
                  <div className="text-white/25 text-[11px] uppercase tracking-[0.25em] font-mono mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
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
              background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white/95 leading-[1.05] tracking-tight mb-8">
              Ready to see
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
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
                href="/how-we-work"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                How We Work →
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
              <img src="/logo-9.svg" alt="Level9OS" className="w-full h-full" />
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
            <Link href="/products" className="text-white/30 hover:text-white/70 transition-colors">
              Products
            </Link>
            <Link href="/how-we-work" className="text-white/30 hover:text-white/70 transition-colors">
              How We Work
            </Link>
            <Link href="/partnerships" className="text-white/30 hover:text-white/70 transition-colors">
              Partnerships
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

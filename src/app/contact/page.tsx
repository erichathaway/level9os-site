"use client";

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn } from "@level9/brand/components/motion";
import { CursorGradient } from "@level9/brand/components/motion";
import { MagneticButton } from "@level9/brand/components/motion";
import { LiveTicker } from "@level9/brand/components/motion";
import { RevealMask } from "@level9/brand/components/motion";

export default function ContactPage() {
  return (
    <main className="min-h-screen relative flex flex-col">
      <FloatingNav />
      <CursorGradient color="rgba(139,92,246,0.08)" />
      <LiveTicker />

      <section
        className="flex-1 relative flex items-center justify-center overflow-hidden pt-32 pb-20"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] rounded-full top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2"
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
              "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
          }}
        />

        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                Start a Conversation
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Let&apos;s talk about
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                  what&apos;s not working.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.5}>
            <p className="text-white/50 text-lg leading-relaxed mb-14 max-w-xl mx-auto">
              Whether you need a fractional COO, strategic advisory, a pod deployment, or just want
              to know which product solves your problem, start here.
            </p>
          </FadeIn>

          <FadeIn delay={0.7}>
            <div className="flex flex-col items-center gap-5 mb-16">
              <MagneticButton
                href="mailto:hello@level9os.com?subject=Level9OS%20-%20Let's%20Talk"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow text-lg"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-pulse" />
                hello@level9os.com
              </MagneticButton>
              <a
                href="mailto:partnerships@level9os.com?subject=Level9OS%20-%20Partnership"
                className="text-white/40 hover:text-white/70 text-xs font-mono tracking-wider transition-colors"
              >
                For partnerships: partnerships@level9os.com →
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={1}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-white/[0.05]">
              {[
                {
                  label: "For Products",
                  desc: "See the stack",
                  href: "/products",
                  color: "#8b5cf6",
                },
                {
                  label: "For Engagements",
                  desc: "How we work",
                  href: "/how-we-work",
                  color: "#06b6d4",
                },
                {
                  label: "For Partnerships",
                  desc: "The story",
                  href: "/about",
                  color: "#ec4899",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all group text-left"
                >
                  <div
                    className="text-[11px] font-mono tracking-wider uppercase mb-1"
                    style={{ color: `${item.color}80` }}
                  >
                    {item.label}
                  </div>
                  <div className="text-white/70 text-sm font-semibold group-hover:text-white transition-colors flex items-center justify-between">
                    <span>{item.desc}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="py-8 border-t border-white/[0.04]" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg overflow-hidden">
              <img src="/logo-9.svg" alt="Level9OS" className="w-full h-full" />
            </div>
            <div className="text-white/30 text-[12px] font-mono">
              &copy; 2026 Level9OS ·{" "}
              <a
                href="https://erichathaway.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors"
              >
                Founder →
              </a>
            </div>
          </div>
          <div className="text-white/20 text-[11px] font-mono tracking-wider">
            Built, not advised.
          </div>
        </div>
      </footer>
    </main>
  );
}

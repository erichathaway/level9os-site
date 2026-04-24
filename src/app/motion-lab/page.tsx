"use client";

import { useState } from "react";
import { FadeIn, RevealMask, MagneticButton } from "@level9/brand/components/motion";
import HeroCrystallize from "@/components/motion/HeroCrystallize";
import HeroOrbit from "@/components/motion/HeroOrbit";

type Variant = "B" | "C";

export default function MotionLab() {
  const [variant, setVariant] = useState<Variant>("B");
  const [replayKey, setReplayKey] = useState(0);
  const replay = () => setReplayKey(k => k + 1);
  const pick = (v: Variant) => {
    setVariant(v);
    setReplayKey(k => k + 1);
  };

  return (
    <main className="min-h-dvh relative" style={{ background: "var(--bg-root)" }}>
      {/* Lab controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1.5">
        <button
          onClick={() => pick("B")}
          className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition ${
            variant === "B" ? "bg-white/[0.14] text-white" : "text-white/50 hover:text-white/80"
          }`}
        >
          B · Crystallize
        </button>
        <button
          onClick={() => pick("C")}
          className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition ${
            variant === "C" ? "bg-white/[0.14] text-white" : "text-white/50 hover:text-white/80"
          }`}
        >
          C · Operating System
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button
          onClick={replay}
          className="px-4 py-2 rounded-full text-xs font-mono tracking-wider text-white/70 hover:text-white bg-white/5"
        >
          Replay ↻
        </button>
      </div>

      <section
        className="min-h-dvh relative overflow-hidden flex items-center"
        style={{ background: "var(--bg-root)" }}
      >
        {/* Concept C uses the original ambient mesh; Concept B supplies its own */}
        {variant === "C" && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute w-[800px] h-[800px] rounded-full top-1/4 right-0 -translate-y-1/2"
              style={{
                background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
                filter: "blur(100px)",
              }}
            />
            <div
              className="absolute w-[600px] h-[600px] rounded-full bottom-0 left-1/4"
              style={{
                background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)",
                filter: "blur(100px)",
              }}
            />
            <div
              className="absolute w-[500px] h-[500px] rounded-full top-1/3 left-0"
              style={{
                background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 60%)",
                filter: "blur(100px)",
              }}
            />
          </div>
        )}

        {/* Grid background (shared) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
          }}
        />

        {/* Motion layer */}
        {variant === "B" ? (
          <HeroCrystallize replayKey={replayKey} />
        ) : (
          <HeroOrbit replayKey={replayKey} />
        )}

        {/* Hero copy (matches live hero) */}
        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-32 relative z-10 w-full">
          <FadeIn key={`eyebrow-${replayKey}`}>
            <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                Operations is the only side you actually control
              </span>
            </div>
          </FadeIn>
          <div className="space-y-2 mb-12">
            <RevealMask key={`h1-${replayKey}`}>
              <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                AI is a gold rush.
              </h1>
            </RevealMask>
            <RevealMask key={`h2-${replayKey}`} delay={140}>
              <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-black leading-[1.05] tracking-tight text-white/55">
                Everyone&apos;s building it to make more money.
              </h1>
            </RevealMask>
            <RevealMask key={`h3-${replayKey}`} delay={280}>
              <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[1.05] tracking-tight pt-4">
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                  We build it for the side
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                  you actually control.
                </span>
              </h1>
            </RevealMask>
          </div>
          <FadeIn key={`body-${replayKey}`} delay={0.6}>
            <p className="text-white/50 text-lg sm:text-xl leading-relaxed max-w-2xl mb-12 font-light">
              Save the money. Save the time. Control the outcome.{" "}
              <span className="text-white/80">
                AI for operations. The function that connects everything and determines whether
                strategy actually survives contact with reality.
              </span>
            </p>
          </FadeIn>
          <FadeIn key={`cta-${replayKey}`} delay={0.9}>
            <div className="flex flex-wrap items-center gap-4">
              <MagneticButton
                href="#"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow"
              >
                <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                See What We&apos;ve Built
              </MagneticButton>
              <MagneticButton
                href="#"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                How We Work <span>→</span>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Notes */}
      <section className="py-20 px-8 max-w-3xl mx-auto text-white/70 text-sm leading-relaxed">
        <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">
          Motion Lab · Variant {variant}
        </div>
        {variant === "B" ? (
          <>
            <h3 className="text-white/90 text-lg font-bold mb-3">Crystallize</h3>
            <p className="mb-3">
              A mesh gradient field flows through the hero continuously. On load, the Level9 chip
              precipitates out of the field at top-left: starts as a blurred scaled-up gradient
              shape, then sharpens and resolves into the chip over 1.6s.
            </p>
            <p className="mb-3 text-white/55">
              The mesh never stops. Five color blobs (violet, cyan, teal, fuchsia) drift on
              independent slow loops from 28 to 46 seconds, so no pattern ever repeats visibly.
              After formation the chip stays crisp, the field keeps flowing behind the content.
            </p>
            <p className="text-white/40">
              References: Arc browser space transitions, Stripe gradient meshes, Vercel marketing
              pages.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-white/90 text-lg font-bold mb-3">Operating System</h3>
            <p className="mb-3">
              The Level9 chip sits at top-left from t=0. Six product satellites (StratOS violet,
              CommandOS emerald, OutboundOS amber, LucidORG cyan, Playbook slate, MAX fuchsia)
              fly in from the screen edges on curved paths and settle into orbit.
            </p>
            <p className="mb-3 text-white/55">
              Each satellite has its own orbital radius (140 to 240 px) and period (38 to 62
              seconds per revolution), so the system never syncs up. Thin orbital rings fade in
              after settlement for structure. Runs forever.
            </p>
            <p className="text-white/40">
              References: Anthropic constellation hero, Retool node graphs, Figma multiplayer
              cursors.
            </p>
          </>
        )}
      </section>
    </main>
  );
}

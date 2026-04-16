"use client";

import Link from "next/link";
import Image from "next/image";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter, AnimatedBar } from "@/components/Shared";
import CursorGradient from "@/components/motion/CursorGradient";
import MagneticButton from "@/components/motion/MagneticButton";
import LiveTicker from "@/components/motion/LiveTicker";
import MagneticCard from "@/components/motion/MagneticCard";
import RevealMask from "@/components/motion/RevealMask";
import { dnaStats, problemStats, clientLogos, transformations, twoHalves } from "@/data/stats";
import { products } from "@/data/products";
import { stack } from "@/data/stack";
import { partners } from "@/data/partners";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <FloatingNav />
      <CursorGradient />
      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════════
          HERO — The Two Halves thesis
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="min-h-screen relative overflow-hidden flex items-center"
        style={{ background: "var(--bg-root)" }}
      >
        {/* Ambient gradient mesh */}
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

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-32 relative z-10 w-full">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                Operations is the only side you actually control
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-12">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                AI is a gold rush.
              </h1>
            </RevealMask>
            <RevealMask delay={140}>
              <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-black leading-[1.05] tracking-tight text-white/55">
                Everyone&apos;s building it to make more money.
              </h1>
            </RevealMask>
            <RevealMask delay={280}>
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

          <FadeIn delay={0.6}>
            <p className="text-white/50 text-lg sm:text-xl leading-relaxed max-w-2xl mb-12 font-light">
              Save the money. Save the time. Control the outcome.{" "}
              <span className="text-white/80">
                AI for operations. The function that connects everything and determines whether
                strategy actually survives contact with reality.
              </span>
            </p>
          </FadeIn>

          <FadeIn delay={0.9}>
            <div className="flex flex-wrap items-center gap-4">
              <MagneticButton
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow"
              >
                <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                See What We&apos;ve Built
              </MagneticButton>
              <MagneticButton
                href="/how-we-work"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                How We Work <span>→</span>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/20">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE TWO HALVES — The positioning frame
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-20 text-center">
            <RevealMask>
              <div className="text-white/40 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                Two Halves of the Gold Rush
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 leading-[1.05] max-w-3xl mx-auto">
                Everyone&apos;s building the revenue half.
                <br />
                <span className="text-white/40">Almost nobody is building ours.</span>
              </h2>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* The Other Half */}
            <FadeIn direction="left">
              <div className="rounded-2xl p-10 h-full border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/30 mb-4">
                  {twoHalves.other.label}
                </div>
                <h3 className="text-3xl font-black text-white/50 mb-6 line-through decoration-white/15 decoration-[1px]">
                  {twoHalves.other.headline}
                </h3>
                <div className="space-y-3 mb-8">
                  {twoHalves.other.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-white/30 text-sm"
                    >
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/[0.06]">
                  <p className="text-white/40 text-sm italic">{twoHalves.other.outcome}</p>
                </div>
              </div>
            </FadeIn>

            {/* Our Half */}
            <FadeIn direction="right" delay={0.15}>
              <MagneticCard
                className="rounded-2xl h-full"
                glowColor="rgba(139,92,246,0.25)"
                maxTilt={4}
              >
                <div
                  className="rounded-2xl p-10 h-full border bg-gradient-to-br from-violet-500/[0.08] via-cyan-500/[0.04] to-fuchsia-500/[0.04] relative overflow-hidden"
                  style={{ borderColor: "rgba(139,92,246,0.3)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-500 to-fuchsia-500" />
                  <div className="text-[11px] font-mono tracking-[0.3em] uppercase mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {twoHalves.ours.label}
                  </div>
                  <h3 className="text-3xl font-black mb-6">
                    <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                      {twoHalves.ours.headline}
                    </span>
                  </h3>
                  <div className="space-y-3 mb-8">
                    {twoHalves.ours.items.map((item, i) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-white/80 text-sm"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:
                              i % 3 === 0
                                ? "#8b5cf6"
                                : i % 3 === 1
                                ? "#06b6d4"
                                : "#ec4899",
                          }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/[0.1]">
                    <p className="text-white/80 text-sm font-semibold">
                      {twoHalves.ours.outcome}
                    </p>
                  </div>
                </div>
              </MagneticCard>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="text-center">
              <p className="text-white/55 text-lg max-w-2xl mx-auto leading-relaxed">
                Sales AI helps you sell more, but the market decides if it works. Operations AI
                helps you spend less and waste less,{" "}
                <span className="text-white/85">and you decide every input.</span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE STACK — 8 layers of the operating system
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-violet-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Operating System
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-6 leading-[1.05] max-w-3xl">
                Eight layers.
                <br />
                <span className="text-white/40">From the boardroom to the build server.</span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/40 text-lg max-w-2xl">
                Every layer of how an organization actually runs. Covered by AI we&apos;ve built,
                governed, and proven on ourselves first.
              </p>
            </RevealMask>
          </div>

          <div className="space-y-3">
            {stack.map((layer, i) => (
              <FadeIn key={layer.id} delay={i * 0.06}>
                <MagneticCard
                  className="rounded-2xl"
                  glowColor={`${layer.color}20`}
                  maxTilt={2}
                >
                  <div
                    className="rounded-2xl border bg-[#0a0a14]/40 backdrop-blur-sm overflow-hidden group hover:bg-[#0a0a14]/60 transition-colors"
                    style={{ borderColor: `${layer.color}15` }}
                  >
                    {/* Top accent line */}
                    <div
                      className="h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, ${layer.color}, ${layer.color}30, transparent)`,
                      }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 md:p-8 items-start">
                      {/* Number + Title */}
                      <div className="md:col-span-3">
                        <div
                          className="text-[11px] font-mono tracking-[0.3em] mb-2"
                          style={{ color: `${layer.color}aa` }}
                        >
                          LAYER {layer.number}
                        </div>
                        <h3
                          className="text-2xl sm:text-3xl font-black tracking-tight mb-2"
                          style={{ color: layer.color }}
                        >
                          {layer.title}
                        </h3>
                        <div className="text-white/30 text-[12px] uppercase tracking-wider font-mono">
                          {layer.audience}
                        </div>
                      </div>

                      {/* Problem + Answer */}
                      <div className="md:col-span-5">
                        <div className="mb-4">
                          <div className="text-white/25 text-[11px] uppercase tracking-wider font-mono mb-1.5">
                            Problem
                          </div>
                          <p className="text-white/55 text-sm leading-relaxed">
                            {layer.problem}
                          </p>
                        </div>
                        <div>
                          <div
                            className="text-[11px] uppercase tracking-wider font-mono mb-1.5"
                            style={{ color: `${layer.color}80` }}
                          >
                            Answer
                          </div>
                          <p className="text-white/85 text-sm leading-relaxed font-medium">
                            {layer.answer}
                          </p>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div className="md:col-span-4">
                        <div className="text-white/25 text-[11px] uppercase tracking-wider font-mono mb-3">
                          Capabilities
                        </div>
                        <div className="space-y-2">
                          {layer.capabilities.map((cap) => (
                            <div
                              key={cap}
                              className="flex items-center gap-2 text-white/60 text-xs"
                            >
                              <div
                                className="w-1 h-1 rounded-full flex-shrink-0"
                                style={{ background: layer.color }}
                              />
                              <span>{cap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400/80 hover:text-violet-400 transition-colors group"
              >
                Deep dive on the named products{" "}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE PROBLEM — Why operations needs AI
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-20">
            <RevealMask>
              <div className="text-red-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Problem
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-6 leading-[1.05]">
                Operations is the last function
                <br />
                <span className="text-white/40">still running on gut feel.</span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Marketing has automation. Sales has CRM. Finance has models. The function that
                connects everything, that actually executes strategy, is still spreadsheets,
                offsites, and hope.
              </p>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {problemStats.map((item, i) => (
              <FadeIn key={item.stat} delay={i * 0.15}>
                <MagneticCard
                  className="rounded-2xl h-full"
                  glowColor="rgba(239,68,68,0.15)"
                  maxTilt={4}
                >
                  <div className="rounded-2xl border border-red-500/[0.12] p-7 h-full bg-gradient-to-br from-red-500/[0.03] to-transparent group">
                    <div className="text-5xl font-black text-red-400/80 mb-4 tracking-tight group-hover:text-red-400 transition-colors">
                      {item.stat}
                    </div>
                    <div className="text-white/60 text-sm mb-4 leading-relaxed">{item.label}</div>
                    <div className="text-white/20 text-[11px] font-mono uppercase tracking-wider">
                      {item.src}
                    </div>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY OPERATIONS — The control thesis
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="text-violet-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-6">
                The Control Argument
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-8 leading-[1.05]">
                You can&apos;t control the market.
                <br />
                You can&apos;t control your competitors.
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  You can control how you operate.
                </span>
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-5">
                That&apos;s why we build for the operations side of the house. The function where
                30 years of pattern recognition meets modern AI architecture, and where leverage
                actually compounds, because you decide every input.
              </p>
              <p className="text-white/35 text-sm leading-relaxed mb-10">
                Sales AI helps you sell more. Marketing AI helps you generate more. Both are
                useful. Neither controls the outcome. Operations AI controls the outcome, because
                operations is the only thing inside your perimeter.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "Outcome-Controlled",
                  "AI-Native",
                  "Self-Correcting",
                  "Measurable",
                  "Governance-First",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-[12px] px-4 py-2 rounded-full border border-violet-500/25 text-violet-400/70 font-mono tracking-wider uppercase hover:border-violet-500/50 hover:text-violet-400 transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="space-y-4">
                {transformations.map((item) => (
                  <div
                    key={item.after}
                    className="group p-5 rounded-2xl border border-white/[0.05] hover:border-white/[0.12] transition-all hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-red-400/40 text-[13px] line-through font-mono">
                        {item.before}
                      </span>
                      <span className="text-white/20">→</span>
                      <span className="text-white/80 text-sm font-semibold group-hover:text-white transition-colors">
                        {item.after}
                      </span>
                    </div>
                    <AnimatedBar value={item.barVal} color={item.color} />
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NAMED PRODUCTS — The 6 anchors
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <RevealMask>
                <div className="text-violet-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                  The Named Products
                </div>
              </RevealMask>
              <RevealMask delay={100}>
                <h2 className="text-4xl sm:text-5xl font-black text-white/90 leading-[1.05]">
                  The anchors of the stack.
                </h2>
              </RevealMask>
            </div>
            <FadeIn delay={0.3}>
              <Link
                href="/products"
                className="group text-sm font-semibold text-violet-400/80 hover:text-violet-400 transition-colors inline-flex items-center gap-2"
              >
                Full deep dive{" "}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08}>
                <Link href={`/products#${p.id}`} className="block h-full">
                  <MagneticCard
                    className="rounded-2xl h-full"
                    glowColor={`${p.color}20`}
                    maxTilt={5}
                  >
                    <div
                      className="rounded-2xl p-6 h-full border bg-[#0a0a14]/60 backdrop-blur-sm group relative overflow-hidden"
                      style={{ borderColor: `${p.color}15` }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                        style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}20)` }}
                      />

                      <div className="flex items-start justify-between mb-6">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-transform group-hover:scale-110"
                          style={{
                            background: `${p.color}15`,
                            border: `1px solid ${p.color}30`,
                            color: p.color,
                          }}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: p.color }}
                          />
                          <span
                            className="text-[8px] font-mono tracking-wider"
                            style={{ color: `${p.color}90` }}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-white/90 mb-1.5 group-hover:text-white transition-colors">
                        {p.name}
                      </h3>
                      <div
                        className="text-[11px] font-mono tracking-wider mb-5"
                        style={{ color: `${p.color}80` }}
                      >
                        {p.layer}
                      </div>

                      <div className="mb-3">
                        <div className="text-white/25 text-[11px] uppercase tracking-wider font-mono mb-1.5">
                          Problem
                        </div>
                        <p className="text-white/45 text-xs leading-relaxed">{p.problem}</p>
                      </div>
                      <div className="mb-6">
                        <div
                          className="text-[11px] uppercase tracking-wider font-mono mb-1.5"
                          style={{ color: `${p.color}90` }}
                        >
                          Answer
                        </div>
                        <p className="text-white/75 text-xs leading-relaxed font-medium">
                          {p.answer}
                        </p>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-white/[0.06]">
                        <span
                          className="text-xs font-semibold transition-all group-hover:translate-x-1"
                          style={{ color: p.color }}
                        >
                          Explore →
                        </span>
                      </div>
                    </div>
                  </MagneticCard>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OPERATIONAL DNA
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
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  building the tools for.
                </span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed">
                Three decades of operational leadership across global enterprises. The frameworks
                we sell are the ones we actually used. The pods we deploy are the ones we run on
                ourselves first.
              </p>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-16 max-w-3xl mx-auto">
              {dnaStats.map((s) => (
                <div key={s.label} className="text-center group cursor-default">
                  <div className="text-4xl sm:text-5xl font-black text-white/80 group-hover:text-white transition-colors tabular-nums">
                    <Counter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-white/25 text-[11px] uppercase tracking-[0.25em] font-mono mt-2">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Client logos */}
          <FadeIn delay={0.6}>
            <div className="text-center pt-12 border-t border-white/[0.04]">
              <div className="text-white/15 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-8">
                Built on experience from
              </div>
              <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
                {clientLogos.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2.5 group cursor-default transition-all hover:scale-110"
                  >
                    <Image
                      src={item.logo}
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5 opacity-30 group-hover:opacity-80 transition-opacity"
                    />
                    <span className="text-white/20 group-hover:text-white/60 text-base sm:text-lg font-semibold tracking-wide transition-colors">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PARTNERS PREVIEW
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <RevealMask>
                <div className="text-emerald-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                  The Partner Network
                </div>
              </RevealMask>
              <RevealMask delay={100}>
                <h2 className="text-4xl sm:text-5xl font-black text-white/90 leading-[1.05] max-w-3xl">
                  We don&apos;t sell to individuals.
                  <br />
                  <span className="text-white/40">We partner with the people who do.</span>
                </h2>
              </RevealMask>
            </div>
            <FadeIn delay={0.3}>
              <Link
                href="/partnerships"
                className="group text-sm font-semibold text-emerald-400/80 hover:text-emerald-400 transition-colors inline-flex items-center gap-2"
              >
                Full network{" "}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {partners.map((partner, i) => (
              <FadeIn key={partner.id} delay={i * 0.1}>
                <Link
                  href="/partnerships"
                  className="block h-full"
                >
                  <MagneticCard
                    className="rounded-2xl h-full"
                    glowColor={`${partner.color}20`}
                    maxTilt={4}
                  >
                    <div
                      className="rounded-2xl p-6 h-full border bg-[#0a0a14]/40 backdrop-blur-sm group hover:bg-[#0a0a14]/60 transition-colors"
                      style={{ borderColor: `${partner.color}15` }}
                    >
                      <div
                        className="text-[8px] font-mono tracking-[0.2em] uppercase mb-3"
                        style={{ color: `${partner.color}aa` }}
                      >
                        {partner.type}
                      </div>
                      <h3 className="text-lg font-black text-white/90 mb-2 group-hover:text-white transition-colors">
                        {partner.name}
                      </h3>
                      <p className="text-white/45 text-xs leading-relaxed">{partner.tagline}</p>
                    </div>
                  </MagneticCard>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-10 p-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] text-center">
              <p className="text-white/60 text-sm">
                <span className="text-emerald-400 font-semibold">Looking for a career in AI?</span>{" "}
                Individual learning lives on our non-profit education arm.{" "}
                <a
                  href="https://nextgenintern.com/individual-learning"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 transition-colors"
                >
                  nextgenintern.com →
                </a>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Final call
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "var(--bg-root)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[900px] h-[900px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black text-white/95 leading-[1.05] tracking-tight mb-8">
              Save the money.
              <br />
              Save the time.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Control the outcome.
              </span>
            </h2>
            <p className="text-white/45 text-lg mb-12 max-w-xl mx-auto">
              Whether you need a fractional COO with an AI stack behind them, a single pod
              deployed, or the full operating system installed, start with a conversation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="/how-we-work"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow text-lg"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-pulse" />
                How We Work With You
              </MagneticButton>
              <MagneticButton
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-5 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                See the Stack →
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="py-12 border-t border-white/[0.04]" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
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
              <Link href="/products" className="text-white/30 hover:text-white/70 transition-colors">
                Products
              </Link>
              <Link
                href="/how-we-work"
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                How We Work
              </Link>
              <Link
                href="/partnerships"
                className="text-white/30 hover:text-white/70 transition-colors"
              >
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
        </div>
      </footer>
    </main>
  );
}

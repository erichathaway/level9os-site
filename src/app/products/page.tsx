"use client";

import { useState } from "react";
import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn } from "@level9/brand/components/motion";
import { CursorGradient } from "@level9/brand/components/motion";
import { MagneticButton } from "@level9/brand/components/motion";
import { LiveTicker } from "@level9/brand/components/motion";
import { MagneticCard } from "@level9/brand/components/motion";
import { RevealMask } from "@level9/brand/components/motion";
import { products } from "@level9/brand/content/products";
import SiteFooter from "@/components/SiteFooter";

export default function ProductsPage() {
  const [active, setActive] = useState(0);

  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient color="rgba(6,182,212,0.08)" />
      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════════
          HERO — The named anchors of the stack
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative pt-40 pb-24 overflow-hidden"
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
          <div
            className="absolute w-[500px] h-[500px] rounded-full bottom-0 left-0"
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

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                Six Products · Four Pressure Points
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                One product per pressure point.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2rem,4.5vw,3.6rem)] font-black leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Plus the install manual and the voice layer.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/55 text-lg max-w-2xl mb-8 font-light leading-relaxed">
              <span className="text-white/85">StratOS</span> decides.{" "}
              <span className="text-white/85">CommandOS</span> coordinates.{" "}
              <span className="text-white/85">OutboundOS</span> executes (LinkedIn signal,
              outbound, customer care).{" "}
              <span className="text-white/85">LucidORG</span> measures. The{" "}
              <span className="text-white/85">COO Playbook</span> tells you how to install it.{" "}
              <span className="text-white/85">MAX</span> is how you talk to it. Everything sits on
              the governance chassis.
            </p>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400/80 hover:text-violet-400 transition-colors group mb-12"
            >
              See how the products map to the four pressure points and eight operating layers{" "}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {[
                { count: 4, label: "LIVE", color: "#10b981" },
                { count: 2, label: "IN PRODUCTION", color: "#ec4899" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{
                    borderColor: `${badge.color}30`,
                    background: `${badge.color}08`,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: badge.color }}
                  />
                  <span className="text-[11px] font-mono tracking-wider text-white/70">
                    {badge.count} {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRODUCT TAB SELECTOR + DEEP DIVE
          ═══════════════════════════════════════════════════════════ */}
      <section className="pb-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          {/* Sticky tab selector */}
          <div className="sticky top-6 z-40 mb-16 pointer-events-none">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 p-3 rounded-full bg-[#0a0a14]/85 backdrop-blur-xl border border-white/[0.06] max-w-4xl mx-auto pointer-events-auto shadow-2xl shadow-black/50">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActive(i);
                    const el = document.getElementById(p.id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`px-4 sm:px-6 py-2.5 rounded-full text-[13px] sm:text-sm font-semibold transition-all duration-300 ${
                    active === i ? "text-white shadow-lg" : "text-white/40 hover:text-white/80"
                  }`}
                  style={
                    active === i
                      ? {
                          background: `linear-gradient(135deg, ${p.color}, ${p.color}80)`,
                          boxShadow: `0 8px 30px ${p.color}30`,
                        }
                      : {}
                  }
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product cards in sequence */}
          <div className="space-y-32">
            {products.map((p, i) => (
              <div
                key={p.id}
                id={p.id}
                className="scroll-mt-32"
                onMouseEnter={() => setActive(i)}
              >
                <FadeIn>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left: Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <div
                          className="h-1 w-16 rounded-full"
                          style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}40)` }}
                        />
                        <span
                          className="text-[11px] font-mono tracking-[0.2em]"
                          style={{ color: `${p.color}aa` }}
                        >
                          {p.tag}
                        </span>
                        <div className="flex items-center gap-1.5 ml-auto px-2.5 py-1 rounded-full border" style={{ borderColor: `${p.color}30`, background: `${p.color}08` }}>
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: p.color }}
                          />
                          <span
                            className="text-[11px] font-mono tracking-wider"
                            style={{ color: `${p.color}cc` }}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>

                      <h2 className="text-5xl sm:text-6xl font-black text-white/95 mb-3 tracking-tight">
                        {p.name}
                      </h2>
                      <div
                        className="text-[12px] font-mono tracking-[0.2em] uppercase mb-8"
                        style={{ color: `${p.color}80` }}
                      >
                        {p.layer}
                      </div>

                      {/* Problem / Answer block */}
                      <div className="mb-8 space-y-5">
                        <div>
                          <div className="text-white/30 text-[11px] uppercase tracking-wider font-mono mb-2">
                            The Problem
                          </div>
                          <p className="text-white/60 text-base leading-relaxed">{p.problem}</p>
                        </div>
                        <div className="pl-4 border-l-2" style={{ borderColor: p.color }}>
                          <div
                            className="text-[11px] uppercase tracking-wider font-mono mb-2"
                            style={{ color: `${p.color}aa` }}
                          >
                            The Answer
                          </div>
                          <p className="text-white/90 text-base leading-relaxed font-medium">
                            {p.answer}
                          </p>
                        </div>
                      </div>

                      <p className="text-white/45 text-sm leading-relaxed mb-8">{p.desc}</p>

                      <div className="space-y-2.5 mb-10">
                        {p.features.map((f) => (
                          <div
                            key={f}
                            className="flex items-start gap-3 text-white/55 text-sm hover:text-white/75 transition-colors cursor-default group"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 group-hover:scale-150 transition-transform"
                              style={{ background: p.color }}
                            />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* Sub-pods (only umbrella products carry these) */}
                      {p.pods && p.pods.length > 0 && (
                        <div className="mb-10 pt-8 border-t border-white/[0.06]">
                          <div className="flex items-baseline justify-between mb-5">
                            <div
                              className="text-[11px] font-mono tracking-[0.3em] uppercase"
                              style={{ color: `${p.color}aa` }}
                            >
                              Pods inside the umbrella
                            </div>
                            <span className="text-white/30 text-[11px] font-mono">
                              {p.pods.length} pods
                            </span>
                          </div>
                          <div className="space-y-3">
                            {p.pods.map((pod) => (
                              <div
                                key={pod.id}
                                className="rounded-xl p-4 border bg-[#060610]/40 transition-colors hover:bg-[#060610]/70"
                                style={{ borderColor: `${pod.color}25` }}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Logo or letter badge */}
                                  {/* iPhone home-screen style chip — uniform frame around every pod icon */}
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                                    style={{
                                      background: `${pod.color}15`,
                                      border: `1px solid ${pod.color}40`,
                                    }}
                                  >
                                    {pod.logo ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img
                                        src={pod.logo}
                                        alt={pod.name}
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <span
                                        className="text-sm font-black"
                                        style={{ color: pod.color }}
                                      >
                                        {pod.name.charAt(0)}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
                                      <div className="flex items-baseline gap-3">
                                        <h4
                                          className="text-base font-bold"
                                          style={{ color: pod.color }}
                                        >
                                          {pod.name}
                                        </h4>
                                        <span
                                          className="text-[10px] font-mono tracking-[0.2em] uppercase"
                                          style={{ color: `${pod.color}80` }}
                                        >
                                          {pod.tag}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <div
                                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                                          style={{ background: pod.color }}
                                        />
                                        <span
                                          className="text-[10px] font-mono tracking-wider"
                                          style={{ color: `${pod.color}cc` }}
                                        >
                                          {pod.status}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-white/55 text-xs leading-relaxed mb-2">
                                      {pod.desc}
                                    </p>
                                    {(pod.href || pod.linkedinUrl) && (
                                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        {pod.href && (
                                          <a
                                            href={pod.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] font-semibold transition-colors"
                                            style={{ color: pod.color }}
                                          >
                                            Visit {pod.domain || pod.name} →
                                          </a>
                                        )}
                                        {pod.linkedinUrl && (
                                          <a
                                            href={pod.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-[11px] transition-colors"
                                            aria-label={`${pod.name} on LinkedIn`}
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                              className="w-3 h-3"
                                            >
                                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                            LinkedIn
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4">
                        {p.status === "LIVE" && p.external ? (
                          <a
                            href={p.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-7 py-4 rounded-full text-white font-semibold hover:shadow-2xl transition-all hover:scale-[1.02]"
                            style={{
                              background: `linear-gradient(135deg, ${p.color}, ${p.color}80)`,
                              boxShadow: `0 8px 30px ${p.color}30`,
                            }}
                          >
                            <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                            Visit {p.name}
                            <span className="ml-1">→</span>
                          </a>
                        ) : p.status === "LIVE" && p.pods ? (
                          <div
                            className="inline-flex items-center gap-3 px-7 py-4 rounded-full border text-sm font-semibold"
                            style={{
                              borderColor: `${p.color}40`,
                              background: `${p.color}10`,
                              color: p.color,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full animate-pulse"
                              style={{ background: p.color }}
                            />
                            {p.pods.length} pods live · see above
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-3 px-7 py-4 rounded-full border border-white/[0.08] bg-white/[0.02] text-white/50 text-sm">
                            <span
                              className="w-2 h-2 rounded-full animate-pulse"
                              style={{ background: p.color }}
                            />
                            {p.status === "IN PRODUCTION"
                              ? "Currently in production · contact for access"
                              : p.status}
                          </div>
                        )}
                        {p.domain && p.external && (
                          <span className="text-[12px] font-mono text-white/25 tracking-wider">
                            {p.domain}
                          </span>
                        )}
                        {p.linkedinUrl && (
                          <a
                            href={p.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-white/[0.10] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-xs transition-colors"
                            aria-label={`${p.name} on LinkedIn`}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Visual panel */}
                    <div className="relative">
                      <MagneticCard
                        glowColor={`${p.color}25`}
                        maxTilt={6}
                        className="rounded-3xl"
                      >
                        <div
                          className="rounded-3xl p-10 border relative overflow-hidden min-h-[440px]"
                          style={{
                            background: `linear-gradient(135deg, ${p.color}12 0%, ${p.color}02 100%)`,
                            borderColor: `${p.color}25`,
                          }}
                        >
                          <div
                            className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{
                              background: `linear-gradient(90deg, ${p.color}, ${p.color}20, transparent)`,
                            }}
                          />

                          <div
                            className="absolute inset-0 pointer-events-none opacity-[0.06]"
                            style={{
                              backgroundImage: `linear-gradient(${p.color} 1px, transparent 1px), linear-gradient(90deg, ${p.color} 1px, transparent 1px)`,
                              backgroundSize: "32px 32px",
                            }}
                          />

                          {/* Status terminal block — pods view for umbrella products, status rows otherwise */}
                          <div className="relative z-10">
                            <div
                              className="text-[11px] font-mono tracking-[0.2em] uppercase mb-6"
                              style={{ color: `${p.color}aa` }}
                            >
                              {p.pods ? "POD MAP" : "SYSTEM STATUS"}
                            </div>

                            {p.pods ? (
                              <div className="space-y-3 mb-8">
                                {p.pods.map((pod) => (
                                  <div
                                    key={pod.id}
                                    className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.04]"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      {pod.logo ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                          src={pod.logo}
                                          alt={pod.name}
                                          className="w-7 h-7 rounded-md flex-shrink-0"
                                        />
                                      ) : (
                                        <div
                                          className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black flex-shrink-0"
                                          style={{
                                            background: `${pod.color}15`,
                                            border: `1px solid ${pod.color}40`,
                                            color: pod.color,
                                          }}
                                        >
                                          {pod.name.charAt(0)}
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <div
                                          className="text-sm font-bold tracking-tight"
                                          style={{ color: pod.color }}
                                        >
                                          {pod.name}
                                        </div>
                                        <div className="text-white/40 text-[10px] font-mono tracking-wider uppercase truncate">
                                          {pod.tag}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <div
                                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                                        style={{ background: pod.color }}
                                      />
                                      <span
                                        className="text-[10px] font-mono tracking-wider"
                                        style={{ color: `${pod.color}cc` }}
                                      >
                                        {pod.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-3 mb-8">
                                {[
                                  { k: "LAYER", v: p.layer.split(" · ")[0].toUpperCase() },
                                  { k: "STATUS", v: p.status },
                                  { k: "PROVIDER", v: "MULTI-MODEL" },
                                  { k: "GOVERNANCE", v: "GATED" },
                                  {
                                    k: "DEPLOYMENT",
                                    v: p.external ? "PUBLIC" : "INTERNAL",
                                  },
                                ].map((row) => (
                                  <div
                                    key={row.k}
                                    className="flex items-center justify-between text-xs font-mono py-2 border-b border-white/[0.04]"
                                  >
                                    <span className="text-white/35 tracking-wider">{row.k}</span>
                                    <span
                                      className="font-bold tracking-wider"
                                      style={{ color: p.color }}
                                    >
                                      {row.v}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div
                              className="text-[8px] font-mono tracking-wider text-white/25 text-center pt-4 border-t border-white/[0.05]"
                            >
                              {p.pods
                                ? "· UMBRELLA · ONE GOVERNANCE TRAIL ·"
                                : "· OPERATING SYSTEM ACTIVE ·"}
                            </div>
                          </div>
                        </div>
                      </MagneticCard>
                    </div>
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE INTEGRATION ARGUMENT
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "#060610" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 text-center">
          <RevealMask>
            <div className="text-cyan-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
              The Integration
            </div>
          </RevealMask>
          <RevealMask delay={100}>
            <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-6 leading-[1.05]">
              Each product stands alone.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Together, they break the cycle.
              </span>
            </h2>
          </RevealMask>
          <FadeIn delay={0.3}>
            <p className="text-white/55 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
              Misalignment becomes drag. Drag becomes cost. Cost forces reactive leadership.
              Reactive leadership locks in more misalignment. Each product is one intervention
              site in that loop. The full stack is the unfair advantage.
            </p>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="flex flex-wrap justify-center items-center gap-3 text-[12px] font-mono tracking-wider uppercase mb-3">
              <span className="text-violet-400/80">01 Decide · StratOS</span>
              <span className="text-white/20">→</span>
              <span className="text-emerald-400/80">02 Coordinate · CommandOS</span>
              <span className="text-white/20">→</span>
              <span className="text-amber-400/80">03 Execute · OutboundOS</span>
              <span className="text-white/20">→</span>
              <span className="text-cyan-400/80">04 Measure · LucidORG</span>
              <span className="text-white/20">↺</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3 text-[11px] font-mono tracking-wider uppercase">
              <span className="text-red-400/70">Vault chassis underneath</span>
              <span className="text-white/20">·</span>
              <span className="text-slate-400/70">Playbook installs it</span>
              <span className="text-white/20">·</span>
              <span className="text-fuchsia-400/70">MAX talks to it</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "var(--bg-root)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[800px] h-[800px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white/95 leading-[1.05] tracking-tight mb-6">
              Which anchor
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                solves your problem?
              </span>
            </h2>
            <p className="text-white/45 text-base mb-10 max-w-lg mx-auto">
              Not sure yet? Let&apos;s talk about what you&apos;re trying to fix and which piece of
              the stack actually matches.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="/how-we-work"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow"
              >
                <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                How We Work With You
              </MagneticButton>
              <MagneticButton
                href="mailto:hello@level9os.com"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                Start a conversation →
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}

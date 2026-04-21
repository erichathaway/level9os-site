"use client";
/**
 * /architecture — Deep-dive page that explains the full taxonomy:
 * 4 pressure points (the home-page surface) →
 * 8 operating layers (what a builder sees inside the stack) →
 * 8 COO Playbook domains (what an operator sees from the methodology side).
 *
 * Audience: technical buyers, operators, partners who want to verify there's
 * real architecture under the four-pressure-point story.
 */

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn } from "@level9/brand/components/motion";
import { CursorGradient } from "@level9/brand/components/motion";
import { MagneticButton } from "@level9/brand/components/motion";
import { LiveTicker } from "@level9/brand/components/motion";
import { MagneticCard } from "@level9/brand/components/motion";
import { RevealMask } from "@level9/brand/components/motion";
import { pressurePoints, chassis, installManual } from "@level9/brand/content/pressurePoints";
import { stack } from "@level9/brand/content/stack";
import { playbookDomains, domainByTitle } from "@level9/brand/content/playbookDomains";
import SiteFooter from "@/components/SiteFooter";

const layerById = (id: string) => stack.find((l) => l.id === id);

export default function ArchitecturePage() {
  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient color="rgba(139,92,246,0.08)" />
      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════════
          HERO — The full architecture frame
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
                The Architecture · 4 → 8 → 8
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Four pressure points on the surface.
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2rem,4.5vw,3.6rem)] font-black leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Eight operating layers underneath.
                </span>
              </h1>
            </RevealMask>
            <RevealMask delay={300}>
              <h1 className="text-[clamp(2rem,4.5vw,3.6rem)] font-black leading-[1.05] tracking-tight text-white/55">
                Eight playbook domains pointing in.
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.5}>
            <p className="text-white/55 text-lg max-w-2xl mb-10 font-light leading-relaxed">
              The home page tells the four-pressure-point story because that&apos;s the buyer
              surface. This page is the architecture underneath. Each pressure point is one
              intervention site in the alignment cycle, mapped down to the operating-system layers
              we build, and mapped up to the COO Playbook domains operators already know.
            </p>
          </FadeIn>

          <FadeIn delay={0.7}>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { count: 4, label: "PRESSURE POINTS", color: "#8b5cf6" },
                { count: 8, label: "OPERATING LAYERS", color: "#06b6d4" },
                { count: 8, label: "PLAYBOOK DOMAINS", color: "#ec4899" },
                { count: 1, label: "GOVERNANCE CHASSIS", color: "#ef4444" },
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
          THE CYCLE — Visual ribbon of the alignment loop
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-12">
            <RevealMask>
              <div className="text-violet-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Alignment Cycle
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 leading-[1.1] max-w-3xl mx-auto">
                Misalignment becomes drag.
                <br />
                <span className="text-white/40">
                  Drag becomes cost. Cost forces reactive leadership. The loop locks in.
                </span>
              </h2>
            </RevealMask>
          </div>

          {/* Cycle diagram — four nodes around a closed loop */}
          <FadeIn delay={0.2}>
            <div className="relative max-w-4xl mx-auto">
              {/* Failure ribbon */}
              <div className="mb-8 flex items-center justify-center flex-wrap gap-3 text-[11px] font-mono tracking-[0.25em] uppercase">
                <span className="text-red-400/70">Misalignment</span>
                <span className="text-white/20">→</span>
                <span className="text-amber-400/70">Drag</span>
                <span className="text-white/20">→</span>
                <span className="text-orange-400/70">Cost</span>
                <span className="text-white/20">→</span>
                <span className="text-fuchsia-400/70">Reactive leadership</span>
                <span className="text-white/20">↺</span>
              </div>

              {/* Pressure point ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {pressurePoints.map((pp) => (
                  <Link
                    key={pp.id}
                    href={`#${pp.id}`}
                    className="group relative block rounded-xl border bg-[#0a0a14]/60 p-5 transition-all hover:scale-[1.02] hover:bg-[#0a0a14]/80"
                    style={{ borderColor: `${pp.color}25` }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                      style={{
                        background: `linear-gradient(90deg, ${pp.color}, ${pp.color}30)`,
                      }}
                    />
                    <div
                      className="text-[10px] font-mono tracking-wider mb-1"
                      style={{ color: `${pp.color}aa` }}
                    >
                      {pp.number}
                    </div>
                    <div
                      className="text-2xl font-black mb-1"
                      style={{ color: pp.color }}
                    >
                      {pp.verb}
                    </div>
                    <div className="text-white/60 text-[11px] leading-snug">
                      Breaks {pp.breaks.toLowerCase()}
                    </div>
                    <div
                      className="text-[10px] font-mono tracking-wider mt-3 pt-3 border-t"
                      style={{
                        borderColor: `${pp.color}15`,
                        color: `${pp.color}cc`,
                      }}
                    >
                      {pp.product}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Chassis underline */}
              <div
                className="mt-3 rounded-xl border bg-[#0a0a14]/40 p-4 text-center"
                style={{ borderColor: `${chassis.color}25` }}
              >
                <div
                  className="text-[10px] font-mono tracking-[0.3em] uppercase mb-1"
                  style={{ color: `${chassis.color}aa` }}
                >
                  {chassis.tag}
                </div>
                <div
                  className="text-base font-bold"
                  style={{ color: chassis.color }}
                >
                  {chassis.name} runs under all four
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PER-PRESSURE-POINT DEEP DIVE
          Each section: 4-point context + 8-layer mapping + 8-domain mapping
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16 text-center">
            <RevealMask>
              <div className="text-cyan-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Mapping
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 leading-[1.1] max-w-3xl mx-auto">
                Each pressure point maps both ways.
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/45 text-base max-w-2xl mx-auto mt-4 leading-relaxed">
                Down to operating layers. Up to playbook domains. The four-pressure-point view is
                the index. These are the contents.
              </p>
            </RevealMask>
          </div>

          <div className="space-y-12">
            {pressurePoints.map((pp) => (
              <div key={pp.id} id={pp.id} className="scroll-mt-24">
                <FadeIn>
                  <MagneticCard
                    className="rounded-2xl"
                    glowColor={`${pp.color}20`}
                    maxTilt={2}
                  >
                    <div
                      className="rounded-2xl border bg-[#0a0a14]/40 backdrop-blur-sm overflow-hidden"
                      style={{ borderColor: `${pp.color}25` }}
                    >
                      <div
                        className="h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, ${pp.color}, ${pp.color}30, transparent)`,
                        }}
                      />

                      {/* Header */}
                      <div className="p-7 md:p-10 border-b" style={{ borderColor: `${pp.color}10` }}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                          <div>
                            <div
                              className="text-[11px] font-mono tracking-[0.3em] mb-2"
                              style={{ color: `${pp.color}aa` }}
                            >
                              PRESSURE POINT {pp.number} · BREAKS {pp.breaks.toUpperCase()}
                            </div>
                            <h3
                              className="text-4xl sm:text-5xl font-black tracking-tight mb-3"
                              style={{ color: pp.color }}
                            >
                              {pp.verb}
                            </h3>
                            <p className="text-white/70 text-base leading-relaxed max-w-2xl">
                              {pp.answer}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {pp.productHref.startsWith("http") ? (
                              <a
                                href={pp.productHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.03]"
                                style={{
                                  background: `${pp.color}15`,
                                  border: `1px solid ${pp.color}40`,
                                  color: pp.color,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                                  style={{ background: pp.color }}
                                />
                                Visit {pp.product} →
                              </a>
                            ) : (
                              <Link
                                href={pp.productHref}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.03]"
                                style={{
                                  background: `${pp.color}15`,
                                  border: `1px solid ${pp.color}40`,
                                  color: pp.color,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                                  style={{ background: pp.color }}
                                />
                                {pp.product} ({pp.productStatus}) →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mapping grid: layers (down) + domains (up) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Operating layers (down) */}
                        <div
                          className="p-7 md:p-10 border-b md:border-b-0 md:border-r"
                          style={{ borderColor: `${pp.color}10` }}
                        >
                          <div className="text-white/30 text-[11px] uppercase tracking-[0.3em] font-mono mb-1">
                            Maps Down To
                          </div>
                          <div
                            className="text-sm font-bold mb-5"
                            style={{ color: `${pp.color}cc` }}
                          >
                            Operating layers we build
                          </div>
                          <div className="space-y-3">
                            {pp.layers.map((layerId) => {
                              const layer = layerById(layerId);
                              if (!layer) return null;
                              return (
                                <div
                                  key={layerId}
                                  className="flex items-start gap-3 p-3 rounded-lg border bg-[#060610]/40 transition-colors hover:bg-[#060610]/70"
                                  style={{ borderColor: `${layer.color}20` }}
                                >
                                  <div
                                    className="text-[10px] font-mono tracking-wider px-2 py-1 rounded flex-shrink-0"
                                    style={{
                                      background: `${layer.color}15`,
                                      color: layer.color,
                                    }}
                                  >
                                    L{layer.number}
                                  </div>
                                  <div>
                                    <div
                                      className="text-sm font-bold leading-tight"
                                      style={{ color: layer.color }}
                                    >
                                      {layer.title}
                                    </div>
                                    <div className="text-white/45 text-[11px] mt-0.5">
                                      {layer.audience}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Playbook domains (up) */}
                        <div className="p-7 md:p-10">
                          <div className="text-white/30 text-[11px] uppercase tracking-[0.3em] font-mono mb-1">
                            Maps Up To
                          </div>
                          <div
                            className="text-sm font-bold mb-5"
                            style={{ color: `${pp.color}cc` }}
                          >
                            COO Playbook domains
                          </div>
                          <div className="space-y-3">
                            {pp.playbookDomains.map((domainTitle) => {
                              const d = domainByTitle(domainTitle);
                              if (!d) return null;
                              return (
                                <div
                                  key={domainTitle}
                                  className="flex items-start gap-3 p-3 rounded-lg border bg-[#060610]/40 transition-colors hover:bg-[#060610]/70"
                                  style={{ borderColor: `${d.color}20` }}
                                >
                                  <div
                                    className="text-[10px] font-mono tracking-wider px-2 py-1 rounded flex-shrink-0"
                                    style={{
                                      background: `${d.color}15`,
                                      color: d.color,
                                    }}
                                  >
                                    D{d.n}
                                  </div>
                                  <div>
                                    <div
                                      className="text-sm font-bold leading-tight"
                                      style={{ color: d.color }}
                                    >
                                      {d.title}
                                    </div>
                                    <div className="text-white/45 text-[11px] mt-0.5">
                                      Operating Domain {d.n} of 8
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Capabilities footer */}
                      <div
                        className="p-7 md:p-10 border-t"
                        style={{ borderColor: `${pp.color}10`, background: `${pp.color}03` }}
                      >
                        <div className="text-white/30 text-[11px] uppercase tracking-[0.3em] font-mono mb-3">
                          What ships
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          {pp.capabilities.map((cap) => (
                            <div
                              key={cap}
                              className="flex items-start gap-2 text-white/65 text-sm"
                            >
                              <div
                                className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                                style={{ background: pp.color }}
                              />
                              <span>{cap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </MagneticCard>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE GOVERNANCE CHASSIS — runs under all four
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: "#060610" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-12">
            <RevealMask>
              <div
                className="text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4"
                style={{ color: `${chassis.color}80` }}
              >
                {chassis.tag}
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 leading-[1.1] max-w-3xl">
                {chassis.name}.
                <br />
                <span className="text-white/40">Not a feature. The foundation.</span>
              </h2>
            </RevealMask>
          </div>

          <FadeIn delay={0.2}>
            <MagneticCard
              className="rounded-2xl"
              glowColor={`${chassis.color}25`}
              maxTilt={2}
            >
              <div
                className="rounded-2xl border bg-[#0a0a14]/40 backdrop-blur-sm overflow-hidden"
                style={{ borderColor: `${chassis.color}30` }}
              >
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, ${chassis.color}, ${chassis.color}30, transparent)`,
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-7 md:p-10 items-start">
                  <div className="md:col-span-7">
                    <p className="text-white/75 text-base leading-relaxed mb-5">
                      {chassis.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Sits under Decide",
                        "Sits under Coordinate",
                        "Sits under Execute",
                        "Sits under Measure",
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-3 py-1.5 rounded-full border font-mono tracking-wider"
                          style={{
                            borderColor: `${chassis.color}25`,
                            color: `${chassis.color}cc`,
                            background: `${chassis.color}08`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-5">
                    <div className="text-white/30 text-[11px] uppercase tracking-[0.3em] font-mono mb-3">
                      What it enforces
                    </div>
                    <div className="space-y-2">
                      {chassis.capabilities.map((cap) => (
                        <div
                          key={cap}
                          className="flex items-start gap-2 text-white/65 text-sm"
                        >
                          <div
                            className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: chassis.color }}
                          />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mt-4 pt-4 border-t text-[11px] font-mono tracking-wider"
                      style={{ borderColor: `${chassis.color}15`, color: `${chassis.color}80` }}
                    >
                      Maps to Layer 07 · Governance →{" "}
                      <span className="text-white/40">
                        Playbook Domain 5 · Adaptive Governance
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </MagneticCard>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE INSTALL MANUAL — COO Playbook
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-12">
            <RevealMask>
              <div className="text-slate-400/60 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                {installManual.tag}
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 leading-[1.1] max-w-3xl">
                {installManual.name}.
                <br />
                <span className="text-white/40">
                  How the four pressure points get installed in 30 / 90 / 180.
                </span>
              </h2>
            </RevealMask>
          </div>

          <FadeIn delay={0.2}>
            <MagneticCard
              className="rounded-2xl"
              glowColor={`${installManual.color}25`}
              maxTilt={2}
            >
              <div
                className="rounded-2xl border bg-[#0a0a14]/40 backdrop-blur-sm overflow-hidden"
                style={{ borderColor: `${installManual.color}30` }}
              >
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, ${installManual.color}, ${installManual.color}30, transparent)`,
                  }}
                />
                <div className="p-7 md:p-10">
                  <p className="text-white/70 text-base leading-relaxed mb-8 max-w-3xl">
                    {installManual.description}
                  </p>

                  <div className="text-white/30 text-[11px] uppercase tracking-[0.3em] font-mono mb-4">
                    The eight operating domains
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {playbookDomains.map((d) => (
                      <div
                        key={d.n}
                        className="rounded-lg border bg-[#060610]/60 p-3"
                        style={{ borderColor: `${d.color}20` }}
                      >
                        <div
                          className="text-[10px] font-mono tracking-wider mb-1"
                          style={{ color: d.color }}
                        >
                          DOMAIN {d.n}
                        </div>
                        <div className="text-white/85 text-[13px] font-bold leading-tight">
                          {d.title}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                    <div className="text-white/40 text-sm">
                      The full playbook lives at{" "}
                      <span className="text-white/70 font-mono">{installManual.domain}</span>
                    </div>
                    <a
                      href={installManual.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-[1.03]"
                      style={{
                        background: `${installManual.color}15`,
                        border: `1px solid ${installManual.color}40`,
                        color: `${installManual.color}dd`,
                      }}
                    >
                      Visit {installManual.domain} →
                    </a>
                  </div>
                </div>
              </div>
            </MagneticCard>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE BUILDER — Cross-link to erichathaway.com/architect
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: "#060610" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.04] via-cyan-500/[0.02] to-fuchsia-500/[0.04] p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-500 to-fuchsia-500" />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative">
                <div className="md:col-span-8">
                  <div className="text-[11px] tracking-[0.5em] uppercase font-mono font-semibold text-white/40 mb-4">
                    The Architect
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white/95 leading-[1.1] mb-4">
                    Want to know who built this?
                  </h2>
                  <p className="text-white/55 text-base leading-relaxed max-w-xl">
                    The four pressure points came out of three decades running operations inside
                    Microsoft, Credit Suisse, T-Mobile, S&amp;P Global, and global enterprises.
                    The architecture is the productized version.
                  </p>
                </div>
                <div className="md:col-span-4 flex md:justify-end">
                  <a
                    href="https://erichathaway.com/architect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-7 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow"
                  >
                    Meet Eric Hathaway
                    <span>→</span>
                  </a>
                </div>
              </div>
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
              Pick a pressure point.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Install one product.
              </span>
            </h2>
            <p className="text-white/45 text-base mb-10 max-w-lg mx-auto">
              You don&apos;t need the whole stack on day one. Pick the pressure point that&apos;s
              hurting most and start there. The rest snaps in when you&apos;re ready.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow"
              >
                <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                See the products
              </MagneticButton>
              <MagneticButton
                href="/how-we-work"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                How we install →
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

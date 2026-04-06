"use client";

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter } from "@/components/Shared";

export default function CommandOS() {
  return (
    <div className="min-h-screen relative">
      <FloatingNav />

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-center" style={{ background: "var(--bg-dark)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full top-1/4 right-0 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)", filter: "blur(80px)" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full bottom-0 left-1/4" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)", filter: "blur(80px)" }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-32 relative z-10">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[9px] font-black shadow-lg shadow-emerald-500/20 tracking-wider">CMD</div>
              <div>
                <div className="text-[10px] text-emerald-400/60 tracking-[0.3em] uppercase font-semibold">CommandOS</div>
                <div className="text-[9px] text-white/25">Multi-Agent Orchestration</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.85] tracking-tight mb-8">
              <span className="text-white/90">Agents managing</span><br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">teams of agents.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-white/40 text-lg leading-relaxed max-w-2xl mb-12">
              A unified command center for orchestrating autonomous AI agents across multiple projects. Three leadership agents supervise up to 15 execution agents with real-time observability, governance enforcement, and automatic session continuity.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            {[
              { target: 15, suffix: "+", label: "AI Agents", color: "#10b981" },
              { target: 3, suffix: "", label: "Leadership Tiers", color: "#06b6d4" },
              { target: 6, suffix: "", label: "Orchestration Workflows", color: "#8b5cf6" },
              { target: 4, suffix: "", label: "Dashboard Views", color: "#f59e0b" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={0.3 + i * 0.1}>
                <div className="group cursor-default">
                  <div className="text-4xl sm:text-5xl font-black mb-1 group-hover:scale-110 transition-transform" style={{ color: s.color }}>
                    <Counter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-white/25 text-[9px] uppercase tracking-wider">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.6}>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/level9"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all hover:scale-[1.02]">
                Learn more at Level9
              </Link>
              <a href="mailto:eric@erichathaway.com"
                className="text-white/30 hover:text-white/60 text-sm transition-colors border border-white/[0.08] rounded-full px-6 py-4 hover:border-white/[0.15]">
                Start a conversation
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ THE ARCHITECTURE ═══ */}
      <section className="py-24 relative" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-emerald-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">Architecture</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Three-tier AI leadership.</h2>
              <p className="text-white/30 text-base max-w-2xl mx-auto">Not just agents doing work. Agents managing agents, with governance, health monitoring, and human oversight built into every layer.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                tier: "TIER 1",
                title: "Coordinator",
                desc: "Observes fleet state every 5 minutes. Matches queued tasks to idle agents. Detects stalls, enforces scheduling, auto-recovers stuck sessions.",
                color: "#10b981",
                icon: "C",
                details: ["Task-to-agent matching", "Heartbeat monitoring", "Peak/off-peak scheduling", "Auto-recovery"],
              },
              {
                tier: "TIER 2",
                title: "Health & Governance",
                desc: "Runs every 30 minutes. Checks infrastructure reachability, detects errors, monitors token costs, logs advisories across the fleet.",
                color: "#06b6d4",
                icon: "H",
                details: ["Infrastructure health checks", "Token cost tracking", "Error detection", "Governance logging"],
              },
              {
                tier: "TIER 3",
                title: "Project Manager",
                desc: "Human-in-the-loop via dashboard. Reviews decisions, sets priorities, directs pivots, approves off-plan work. The human stays in control.",
                color: "#8b5cf6",
                icon: "PM",
                details: ["Decision queue & approval", "Priority management", "Cross-project visibility", "Audit trail"],
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.15}>
                <div className="rounded-xl border border-white/[0.06] p-8 hover:border-white/[0.12] transition-all group cursor-default h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>{item.icon}</div>
                    <div>
                      <div className="text-[8px] font-mono tracking-wider" style={{ color: `${item.color}60` }}>{item.tier}</div>
                      <div className="text-white/80 font-bold group-hover:text-white transition-colors">{item.title}</div>
                    </div>
                  </div>
                  <p className="text-white/35 text-sm leading-relaxed mb-6">{item.desc}</p>
                  <div className="space-y-2">
                    {item.details.map((d) => (
                      <div key={d} className="flex items-center gap-2 text-white/25 text-xs">
                        <div className="w-1 h-1 rounded-full" style={{ background: item.color }} />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CAPABILITIES ═══ */}
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="text-emerald-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-6">Capabilities</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6">Enterprise orchestration.<br />Startup economics.</h2>
              <p className="text-white/40 text-base leading-relaxed mb-8">
                Run 15 agents across multiple projects from a single dashboard. Automatic session rotation handles rate limits and timeouts. Governance-as-data means every decision is logged, structured, and auditable.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Multi-LLM", "Self-Healing", "Governed", "Observable", "Scalable"].map((tag) => (
                  <span key={tag} className="text-[9px] px-3 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400/50 font-mono">{tag}</span>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="space-y-4">
                {[
                  { label: "Multi-agent orchestration", desc: "Up to 15 agents executing in parallel across different projects", color: "#10b981" },
                  { label: "Automatic session continuity", desc: "Detects rate limits, checkpoints work, spawns new sessions seamlessly", color: "#06b6d4" },
                  { label: "Real-time fleet dashboard", desc: "Four views: Chat, Fleet Command, Governance, Results", color: "#8b5cf6" },
                  { label: "Governance framework", desc: "Pre-authorized, within-corridor, and off-plan decision tiers", color: "#f59e0b" },
                  { label: "Cross-project intelligence", desc: "Dependency tracking, resource allocation, unified backlog", color: "#ec4899" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-all group cursor-default">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-white/70 text-sm font-semibold group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                    <p className="text-white/25 text-xs leading-relaxed pl-3.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ THE STACK ═══ */}
      <section className="py-24 relative" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-white/20 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">Built With</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white/90">Production-grade. Not a prototype.</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "React + Vite", desc: "Dashboard frontend" },
              { name: "Supabase", desc: "Realtime database" },
              { name: "n8n", desc: "Orchestration engine" },
              { name: "Claude Code", desc: "Agent runtime" },
              { name: "Tailscale", desc: "Secure networking" },
              { name: "tmux", desc: "Session management" },
              { name: "Vercel", desc: "Dashboard hosting" },
              { name: "PostgreSQL", desc: "11-table schema" },
            ].map((tech) => (
              <FadeIn key={tech.name}>
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 text-center hover:border-emerald-500/15 transition-all cursor-default group">
                  <div className="text-white/60 text-sm font-semibold group-hover:text-white/80 transition-colors">{tech.name}</div>
                  <div className="text-white/20 text-[9px] font-mono mt-1">{tech.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "var(--bg-dark)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)", filter: "blur(80px)" }} />
        </div>
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white/90 leading-[0.9] tracking-tight mb-6">
              One person. Fifteen agents.<br />Zero chaos.
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-lg mx-auto">
              CommandOS is part of the Level9 AI ecosystem, built by Eric Hathaway alongside StratOS, LucidORG, and LinkupOS.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/level9"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all hover:scale-[1.02] text-lg">
                Explore Level9
              </Link>
              <a href="mailto:eric@erichathaway.com"
                className="text-white/50 hover:text-white/90 text-sm transition-colors border border-white/[0.10] rounded-full px-6 py-4 hover:border-white/[0.25]">
                Get in touch
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="py-8 border-t border-white/[0.03]" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white/15 text-[9px] font-mono">&copy; 2026 CommandOS · Built by Level9OS</span>
          <span className="text-white/15 text-[9px]">Agents managing agents. By design.</span>
        </div>
      </div>
    </div>
  );
}

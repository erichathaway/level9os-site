"use client";

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter } from "@/components/Shared";

export default function StratOS() {
  return (
    <div className="min-h-screen relative">
      <FloatingNav />

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-center" style={{ background: "var(--bg-dark)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full top-1/4 right-0 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)", filter: "blur(80px)" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full bottom-0 left-1/4" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 60%)", filter: "blur(80px)" }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-32 relative z-10">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-[9px] font-black shadow-lg shadow-violet-500/20 tracking-wider">SOS</div>
              <div>
                <div className="text-[10px] text-violet-400/60 tracking-[0.3em] uppercase font-semibold">StratOS</div>
                <div className="text-[9px] text-white/25">AI Strategic Operating System</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.85] tracking-tight mb-8">
              <span className="text-white/90">Pressure-test every</span><br />
              <span className="text-white/90">decision before it</span><br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">costs real money.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-white/40 text-lg leading-relaxed max-w-2xl mb-4">
              A 10-person simulated executive leadership team debates your strategic decisions through three structured rounds. Kill criteria. Dissent by design. Every assumption challenged before it reaches the boardroom.
            </p>
            <p className="text-white/25 text-sm max-w-xl mb-12">
              Powered by 169 documents of organizational intelligence. Each AI executive has a distinct perspective, cognitive style, and domain expertise. No groupthink. No politics. Just rigorous strategic pressure-testing.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            {[
              { target: 10, suffix: "", label: "AI Executives", color: "#8b5cf6" },
              { target: 3, suffix: "", label: "Debate Rounds", color: "#a855f7" },
              { target: 2, suffix: "", label: "Kill Gates", color: "#c084fc" },
              { target: 169, suffix: "", label: "Doc Intelligence", color: "#7c3aed" },
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
              <a href="https://stratos.lucidorg.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold hover:shadow-xl hover:shadow-violet-500/25 transition-all hover:scale-[1.02]">
                Try StratOS Live
              </a>
              <Link href="/level9"
                className="text-white/30 hover:text-white/60 text-sm transition-colors border border-white/[0.08] rounded-full px-6 py-4 hover:border-white/[0.15]">
                Level9 Consulting
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section className="py-24 relative" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-violet-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">The Problem</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Strategic decisions are made in echo chambers.</h2>
              <p className="text-white/30 text-base max-w-2xl mx-auto">Executives surround themselves with agreement. Boards get polished decks, not honest debate. Bad decisions survive because nobody in the room will challenge them.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: "67%", label: "Of strategies fail at execution", src: "Harvard Business Review", color: "#ef4444" },
              { stat: "9 mo", label: "Average time to kill a failing initiative", src: "McKinsey", color: "#ef4444" },
              { stat: "$37M", label: "Lost per year from miscommunication", src: "Holmes Report", color: "#ef4444" },
            ].map((item, i) => (
              <FadeIn key={item.stat} delay={i * 0.15}>
                <div className="rounded-xl border border-red-500/10 p-6 group cursor-default hover:border-red-500/20 transition-all hover:bg-red-500/[0.02]">
                  <div className="text-4xl font-black text-red-400/70 group-hover:text-red-400 transition-colors mb-3">{item.stat}</div>
                  <div className="text-white/50 text-sm mb-2">{item.label}</div>
                  <div className="text-white/20 text-[9px] font-mono">{item.src}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE ARCHITECTURE ═══ */}
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-violet-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">How It Works</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Three rounds. Ten executives. Zero groupthink.</h2>
              <p className="text-white/30 text-base max-w-2xl mx-auto">Every decision goes through a structured debate protocol designed to surface dissent, challenge assumptions, and identify failure modes before they become expensive.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                round: "ROUND 1",
                title: "Initial Positions",
                desc: "Each of the 10 AI executives independently analyzes the strategic question from their domain perspective. No cross-contamination. Pure independent assessment.",
                color: "#8b5cf6",
                icon: "R1",
                details: ["Independent analysis", "Domain-specific perspective", "Initial risk assessment", "Opportunity identification"],
              },
              {
                round: "ROUND 2",
                title: "Structured Debate",
                desc: "Executives challenge each other's positions. Dissent is required, not tolerated. The system forces disagreement to surface blind spots and hidden assumptions.",
                color: "#a855f7",
                icon: "R2",
                details: ["Cross-functional challenge", "Forced dissent protocol", "Assumption stress-testing", "Blind spot detection"],
              },
              {
                round: "ROUND 3",
                title: "Kill Gate Decision",
                desc: "Final synthesis with explicit kill criteria. If the decision survives three rounds of structured dissent, it has earned the right to proceed. If not, you saved real money.",
                color: "#7c3aed",
                icon: "R3",
                details: ["Kill criteria evaluation", "Final risk synthesis", "Go/No-Go recommendation", "Implementation roadmap"],
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.15}>
                <div className="rounded-xl border border-white/[0.06] p-8 hover:border-white/[0.12] transition-all group cursor-default h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>{item.icon}</div>
                    <div>
                      <div className="text-[8px] font-mono tracking-wider" style={{ color: `${item.color}60` }}>{item.round}</div>
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

      {/* ═══ THE EXECUTIVES ═══ */}
      <section className="py-24 relative" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="text-violet-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-6">The Team</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6">10 AI executives.<br />10 distinct perspectives.</h2>
              <p className="text-white/40 text-base leading-relaxed mb-8">
                Each executive has a unique cognitive style, domain expertise, and decision-making framework. The CFO thinks differently from the CHRO. The CTO challenges differently than the CMO. That&apos;s the point.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Dissent-by-Design", "No Groupthink", "Domain Expert", "Structured Debate", "Kill Criteria"].map((tag) => (
                  <span key={tag} className="text-[9px] px-3 py-1.5 rounded-full border border-violet-500/20 text-violet-400/50 font-mono">{tag}</span>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="space-y-4">
                {[
                  { label: "CEO & Strategic Vision", desc: "Long-term positioning, competitive dynamics, market timing", color: "#8b5cf6" },
                  { label: "CFO & Financial Analysis", desc: "Capital allocation, risk modeling, ROI pressure-testing", color: "#a855f7" },
                  { label: "COO & Execution Feasibility", desc: "Operational readiness, resource constraints, timeline realism", color: "#7c3aed" },
                  { label: "CTO & Technical Architecture", desc: "Technology dependencies, build vs. buy, scalability risk", color: "#6d28d9" },
                  { label: "CHRO & Organizational Impact", desc: "Culture fit, talent readiness, change management risk", color: "#c084fc" },
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
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-white/20 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">Built With</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white/90">Production-grade. Not a prototype.</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Next.js", desc: "Frontend framework" },
              { name: "n8n", desc: "10-workflow engine" },
              { name: "Claude & GPT", desc: "Multi-LLM debate" },
              { name: "Vercel", desc: "Edge deployment" },
              { name: "Google Docs", desc: "169-doc intelligence" },
              { name: "Supabase", desc: "Decision storage" },
              { name: "ElevenLabs", desc: "Voice synthesis" },
              { name: "Custom API", desc: "Orchestration layer" },
            ].map((tech) => (
              <FadeIn key={tech.name}>
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 text-center hover:border-violet-500/15 transition-all cursor-default group">
                  <div className="text-white/60 text-sm font-semibold group-hover:text-white/80 transition-colors">{tech.name}</div>
                  <div className="text-white/20 text-[9px] font-mono mt-1">{tech.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "#080b14" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)", filter: "blur(80px)" }} />
        </div>
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white/90 leading-[0.9] tracking-tight mb-6">
              Your boardroom deserves<br />better than consensus.
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-lg mx-auto">
              StratOS is part of the Level9 AI ecosystem, built by Eric Hathaway alongside CommandOS, LucidORG, and LinkupOS.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://stratos.lucidorg.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold hover:shadow-xl hover:shadow-violet-500/25 transition-all hover:scale-[1.02] text-lg">
                Try StratOS Live
              </a>
              <a href="mailto:eric@erichathaway.com"
                className="text-white/50 hover:text-white/90 text-sm transition-colors border border-white/[0.10] rounded-full px-6 py-4 hover:border-white/[0.25]">
                Get in touch
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="py-8 border-t border-white/[0.03]" style={{ background: "#080b14" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white/15 text-[9px] font-mono">&copy; 2026 StratOS · Built by Level9OS</span>
          <span className="text-white/15 text-[9px]">Dissent by design. Decisions by evidence.</span>
        </div>
      </div>
    </div>
  );
}

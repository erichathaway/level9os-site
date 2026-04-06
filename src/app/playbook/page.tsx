"use client";

import { useState } from "react";
import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import WireframeCube from "@/components/WireframeCube";
import { FadeIn, Counter } from "@/components/Shared";

export default function Playbook() {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: "#030306" }}>
      <FloatingNav />

      {/* ═══ HERO — Centered, cube top-right ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-center">
        {/* Mesh gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.03) 0%, transparent 50%)
          `
        }} />

        <div className="max-w-[880px] mx-auto px-6 sm:px-12 py-32 relative z-10">
          <FadeIn>
            {/* Alignment bars */}
            <div className="flex flex-col gap-[3px] w-16 mb-10">
              <div className="h-[2px] rounded-full w-full" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
              <div className="h-[2px] rounded-full w-3/4 opacity-60" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
              <div className="h-[2px] rounded-full w-full" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
              <div className="h-[2px] rounded-full w-1/2 opacity-40" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
            </div>

            <div className="text-[9px] tracking-[0.2em] uppercase font-semibold mb-8" style={{ color: "#64748B" }}>By Eric Hathaway</div>

            {/* Title block with cube in negative space */}
            <div className="relative mb-8">
              <h1>
                <span className="block font-editorial text-[clamp(1.3rem,2.5vw,1.8rem)] italic mb-2" style={{ color: "#94A3B8" }}>The</span>
                <span className="block text-[clamp(3.5rem,9vw,7rem)] font-black leading-[0.9] tracking-tight pb-2" style={{
                  background: "linear-gradient(135deg, #F1F5F9 0%, #8B5CF6 35%, #EC4899 65%, #06B6D4 100%)",
                  WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>COO<br />Playbook</span>
              </h1>

              {/* Cube — 2x bigger, positioned in title negative space */}
              <div className="absolute -top-[5rem] right-[-8.5%] sm:right-[-5.5%] pointer-events-none hidden sm:block">
                <WireframeCube size={144} />
              </div>
            </div>

            <div className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-8" style={{ color: "#475569" }}>Diagnose · Design · Execute · Scale</div>

            <p className="text-xl leading-relaxed max-w-xl mb-3" style={{ color: "#C8D0DC" }}>
              Not a book. An AI-guided execution platform.
            </p>
            <p className="text-sm leading-relaxed max-w-lg mb-12" style={{ color: "#475569" }}>
              87K+ words of methodology. 24-week implementation. 9 training courses. AI execution consultant. The operating layer beneath every framework you already use.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center gap-4 mb-16">
              <a href="https://playbook.erichathaway.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/25 transition-all hover:scale-[1.02] text-lg">
                Open the Playbook
              </a>
              <Link href="/level9"
                className="text-sm transition-colors rounded-full px-6 py-5" style={{ color: "#475569", border: "1px solid rgba(139,92,246,0.15)" }}>
                Level9 Consulting
              </Link>
            </div>
          </FadeIn>

          {/* Stats bar */}
          <FadeIn delay={0.25}>
            <div className="flex flex-wrap items-center gap-10 sm:gap-14">
              {[
                { val: "87K+", label: "Words" },
                { val: "24", label: "Weeks" },
                { val: "9", label: "Courses" },
                { val: "6", label: "Frameworks" },
                { val: "AI", label: "Consultant" },
              ].map((s) => (
                <div key={s.label} className="group cursor-default">
                  <div className="text-2xl font-black transition-all group-hover:scale-110" style={{ color: "#8B5CF630" }}>{s.val}</div>
                  <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: "#334155" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Mobile cube */}
        <div className="absolute bottom-12 right-8 pointer-events-none opacity-50 sm:hidden">
          <WireframeCube size={50} />
        </div>
      </section>

      {/* ═══ THE PROBLEM — Full-width impact ═══ */}
      <section className="py-24 relative" style={{ background: "#0A0E1A" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4, #EC4899)" }} />
        <div className="max-w-[880px] mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: "#F1F5F9" }}>
                67% of strategies fail at execution.
              </h2>
              <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: "#64748B" }}>
                Not because of strategy. Because of alignment. The COO Playbook is the operating layer that connects your frameworks to your people.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { stat: "$37M", desc: "Lost per year from miscommunication alone", src: "Holmes Report", color: "#EF4444" },
              { stat: "23%", desc: "Of payroll wasted on misaligned work", src: "Asana", color: "#EF4444" },
              { stat: "9 mo", desc: "Average time to kill a failing initiative", src: "McKinsey", color: "#EF4444" },
            ].map((item, i) => (
              <FadeIn key={item.stat} delay={i * 0.1}>
                <div className="rounded-xl p-6 text-center transition-all hover:translate-y-[-2px]" style={{
                  background: "#0d1021", border: "1px solid rgba(239,68,68,0.1)"
                }}>
                  <div className="text-3xl font-black mb-2" style={{ color: `${item.color}80` }}>{item.stat}</div>
                  <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>{item.desc}</p>
                  <p className="text-[9px] font-mono" style={{ color: "#334155" }}>{item.src}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHAT'S INSIDE — Interactive sections ═══ */}
      <section className="py-24 relative" style={{ background: "#030306" }}>
        <div className="max-w-[880px] mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-[9px] tracking-[0.2em] uppercase font-semibold mb-4" style={{ color: "#64748B" }}>What&apos;s inside</div>
              <h2 className="text-3xl sm:text-4xl font-black" style={{ color: "#F1F5F9" }}>Four integrated systems.</h2>
              <p className="text-sm mt-4 max-w-md mx-auto" style={{ color: "#475569" }}>Not content. Execution infrastructure.</p>
            </div>
          </FadeIn>

          {/* Tab selector */}
          <div className="flex justify-center gap-3 mb-10">
            {[
              { title: "Playbook", color: "#EC4899" },
              { title: "Execute", color: "#10B981" },
              { title: "Learn", color: "#06B6D4" },
              { title: "Resources", color: "#F59E0B" },
            ].map((tab, i) => (
              <button key={tab.title} onClick={() => setActiveSection(i)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                  background: activeSection === i ? `${tab.color}15` : "transparent",
                  border: `1px solid ${activeSection === i ? `${tab.color}30` : "rgba(139,92,246,0.08)"}`,
                  color: activeSection === i ? tab.color : "#475569",
                }}>
                {tab.title}
              </button>
            ))}
          </div>

          {/* Active section content */}
          {[
            { title: "The Playbook", num: "8", label: "Strategic Modules", desc: "The Alignment Thesis. ECI Framework. 8 Operating Domains. Human+AI Architecture. Lean Ops Model. The CxfO Role.", detail: "The foundational methodology. Every module includes diagnostic tools, implementation frameworks, and measurement criteria. Start here to understand the system.", tier: "FREE", color: "#EC4899" },
            { title: "Execute", num: "24", label: "Week Program", desc: "12 executable modules with daily agendas, specific deliverables, templates, coaching questions, and checklists.", detail: "Week 1: Diagnostic. Weeks 2-4: Stabilize and baseline. Weeks 5-12: Build and optimize. Weeks 13-24: Scale and sustain. Every day is planned.", tier: "INCLUDED", color: "#10B981" },
            { title: "Learn", num: "9", label: "Training Courses", desc: "From Purpose-Led Leadership to AI Readiness to Intervention Sprints. 50K+ words of structured training.", detail: "Not just for the COO. Your entire team gets training: leadership, cross-functional accountability, meeting efficacy, empowerment, process mapping, AI readiness.", tier: "INCLUDED", color: "#06B6D4" },
            { title: "Resources", num: "87K+", label: "Words Indexed", desc: "Execution Dashboard. Templates. Articles. Worksheets. AI execution consultant.", detail: "Ask the Playbook: an AI chat assistant trained on all 87K+ words. Templates for every stage: workflow playbooks, role clarity matrices, decision rights, CEO briefs.", tier: "INCLUDED", color: "#F59E0B" },
          ].map((s, i) => (
            <div key={s.title} className={`transition-all duration-500 ${activeSection === i ? "opacity-100" : "opacity-0 hidden"}`}>
              <div className="rounded-2xl p-8 sm:p-10" style={{ background: "#0d1021", border: `1px solid ${s.color}15` }}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 12px ${s.color}40` }} />
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded" style={{
                        color: s.tier === "FREE" ? "#10B981" : "#8B5CF6",
                        background: s.tier === "FREE" ? "rgba(16,185,129,0.08)" : "rgba(139,92,246,0.08)",
                      }}>{s.tier}</span>
                    </div>
                    <h3 className="text-2xl font-black mb-2" style={{ color: "#F1F5F9" }}>{s.title}</h3>
                    <p className="text-sm leading-relaxed max-w-lg" style={{ color: "#94A3B8" }}>{s.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-6 hidden sm:block">
                    <div className="text-5xl font-black" style={{ color: `${s.color}40` }}>{s.num}</div>
                    <div className="text-[9px] font-mono mt-1" style={{ color: "#334155" }}>{s.label}</div>
                  </div>
                </div>
                <div className="w-full h-px my-6" style={{ background: "rgba(139,92,246,0.08)" }} />
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ THE EXPERIENCE — Three pillars ═══ */}
      <section className="py-24 relative" style={{ background: "#0A0E1A" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4, #EC4899)" }} />
        <div className="max-w-[880px] mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="text-[9px] tracking-[0.2em] uppercase font-semibold mb-4" style={{ color: "#64748B" }}>The experience</div>
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: "#F1F5F9" }}>What makes this different.</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { title: "AI Execution Consultant", desc: "Ask questions about your operations in natural language. Get answers backed by 87K+ words of indexed methodology. Not a chatbot. A trained consultant.", icon: "AI", color: "#8B5CF6" },
              { title: "24-Week Guided Program", desc: "Your team knows exactly what to do, every single day. Daily agendas. Specific deliverables. Coaching questions. No ambiguity.", icon: "24W", color: "#06B6D4" },
              { title: "Built for Teams", desc: "9 training courses from Purpose-Led Leadership to AI Readiness. Not just the COO. Everyone who touches execution gets trained.", icon: "9C", color: "#EC4899" },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className="rounded-xl p-7 h-full transition-all duration-300 hover:translate-y-[-2px] group" style={{
                  background: "#0d1021", border: "1px solid rgba(139,92,246,0.08)",
                }}>
                  <div className="text-2xl font-black mb-5 transition-all group-hover:scale-110" style={{ color: `${f.color}35` }}>{f.icon}</div>
                  <h3 className="text-base font-bold mb-3" style={{ color: "#F1F5F9" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROPRIETARY FRAMEWORKS ═══ */}
      <section className="py-24 relative" style={{ background: "#030306" }}>
        <div className="max-w-[880px] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 items-start">
            <FadeIn direction="left">
              <div className="text-[9px] tracking-[0.12em] uppercase font-semibold mb-6" style={{ color: "#64748B" }}>Core IP</div>
              <h2 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: "#F1F5F9" }}>Six proprietary<br />frameworks.</h2>
              <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                Built from 30 years of operational pattern recognition. The connective tissue beneath EOS, OKRs, and Agile.
              </p>
            </FadeIn>

            <FadeIn direction="right" delay={0.15}>
              <div className="space-y-3">
                {[
                  { name: "ECI Score", detail: "4 pillars. 11 indicators. 37 metrics." },
                  { name: "CxfO Role", detail: "Novel executive function. Bottom-up alignment." },
                  { name: "Lean Ops", detail: "2-person ops. $250K+ savings." },
                  { name: "8 Domains", detail: "The 2026 COO challenge framework." },
                  { name: "30/90/180", detail: "Phased, non-disruptive implementation." },
                  { name: "Alignment Cycle", detail: "7-step rhythm. Align to Sustain." },
                ].map((fw) => (
                  <div key={fw.name} className="flex items-start gap-3 p-4 rounded-xl transition-all group cursor-default" style={{
                    background: "#0d1021", border: "1px solid rgba(139,92,246,0.08)",
                  }}>
                    <div className="w-[2px] h-6 rounded-full flex-shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(180deg, #8B5CF6, #06B6D4)" }} />
                    <div>
                      <h3 className="font-semibold text-sm transition-colors group-hover:text-white" style={{ color: "#C8D0DC" }}>{fw.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{fw.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ IMPACT ═══ */}
      <section className="py-24 relative" style={{ background: "#0A0E1A" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4, #EC4899)" }} />
        <div className="max-w-[880px] mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: "#F1F5F9" }}>What execution looks like.</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { target: 21, suffix: "%", label: "EBITDA increase", sub: "90 days", color: "#8B5CF6" },
              { target: 42, suffix: "%", label: "Productivity", sub: "Cross-functional", color: "#06B6D4" },
              { target: 3, suffix: "wks", label: "To identify failures", sub: "vs. 9 months", color: "#EC4899" },
              { target: 2, suffix: "x", label: "Initiative success", sub: "With kill criteria", color: "#10B981" },
            ].map((r, i) => (
              <FadeIn key={r.label} delay={i * 0.1}>
                <div className="group cursor-default">
                  <div className="text-3xl sm:text-5xl font-black mb-2 transition-all group-hover:scale-110" style={{ color: r.color }}>
                    <Counter target={r.target} suffix={r.suffix} />
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "#C8D0DC" }}>{r.label}</div>
                  <div className="text-[9px] font-mono mt-1" style={{ color: "#475569" }}>{r.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "#030306" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 60%)"
        }} />
        <div className="max-w-[880px] mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <div className="flex flex-col gap-[3px] w-16 mx-auto mb-10">
              <div className="h-[2px] rounded-full w-full" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
              <div className="h-[2px] rounded-full w-3/4 opacity-60 ml-auto" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
              <div className="h-[2px] rounded-full w-full" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
              <div className="h-[2px] rounded-full w-1/2 opacity-40" style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
            </div>

            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[0.9] tracking-tight mb-6" style={{ color: "#F1F5F9" }}>
              The missing operating layer.
            </h2>
            <p className="text-base mb-10 max-w-md mx-auto" style={{ color: "#475569" }}>
              Beneath EOS. Beneath OKRs. Beneath Agile. The connective tissue that makes frameworks actually work at scale.
            </p>
            <a href="https://playbook.erichathaway.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/25 transition-all hover:scale-[1.02] text-lg">
              Open the Playbook
            </a>
          </FadeIn>
        </div>
      </section>

      <div className="py-8" style={{ background: "#030306", borderTop: "1px solid rgba(139,92,246,0.08)" }}>
        <div className="max-w-[880px] mx-auto px-6 sm:px-12 flex items-center justify-between">
          <span className="text-[9px] font-mono" style={{ color: "#334155" }}>&copy; 2026 Level9OS</span>
          <span className="text-[9px]" style={{ color: "#334155" }}>The COO Playbook</span>
        </div>
      </div>
    </div>
  );
}

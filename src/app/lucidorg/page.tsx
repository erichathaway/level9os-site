"use client";

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter } from "@/components/Shared";

export default function LucidORG() {
  return (
    <div className="min-h-screen relative">
      <FloatingNav />

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-center" style={{ background: "var(--bg-dark)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full top-1/4 right-0 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 60%)", filter: "blur(80px)" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full bottom-0 left-1/4" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 60%)", filter: "blur(80px)" }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-32 relative z-10">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white text-[9px] font-black shadow-lg shadow-sky-500/20 tracking-wider">LO</div>
              <div>
                <div className="text-[10px] text-sky-400/60 tracking-[0.3em] uppercase font-semibold">LucidORG</div>
                <div className="text-[9px] text-white/25">AI Org Platform</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.85] tracking-tight mb-8">
              <span className="text-white/90">Measure what</span><br />
              <span className="text-white/90">matters. Align what</span><br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-300 bg-clip-text text-transparent">doesn&apos;t.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-white/40 text-lg leading-relaxed max-w-2xl mb-4">
              An AI-powered organizational measurement platform that makes alignment visible, hiring intentional, training intelligent, and board reporting automatic. Four integrated modules. One unified methodology.
            </p>
            <p className="text-white/25 text-sm max-w-xl mb-12">
              Co-founded by Eric and Sasha Hathaway. Powered by the ECI framework: 4 pillars, 11 execution metrics, 37 strategic data points, and the OrgGPT AI engine.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            {[
              { target: 4, suffix: "", label: "AI Modules", color: "#0ea5e9" },
              { target: 11, suffix: "", label: "Execution Metrics", color: "#06b6d4" },
              { target: 37, suffix: "", label: "Strategic Data Points", color: "#0ea5e9" },
              { target: 4, suffix: "", label: "Alignment Pillars", color: "#06b6d4" },
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
              <a href="https://lucidorg.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold hover:shadow-xl hover:shadow-sky-500/25 transition-all hover:scale-[1.02]">
                Visit LucidORG
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
              <div className="text-sky-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">The Problem</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Organizations measure everything<br />except what actually matters.</h2>
              <p className="text-white/30 text-base max-w-2xl mx-auto">Revenue. Headcount. Retention rate. None of these tell you whether your people are aligned, your processes are efficient, or your leadership is actually leading. LucidORG measures what the dashboards miss.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: "$7.8T", label: "Global cost of disengaged employees", src: "Gallup 2024", color: "#ef4444" },
              { stat: "87%", label: "Of AI implementations fail to deliver ROI", src: "Gartner 2024", color: "#ef4444" },
              { stat: "23%", label: "Of payroll wasted on misaligned work", src: "Asana", color: "#ef4444" },
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

      {/* ═══ FOUR MODULES ═══ */}
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-sky-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">The Platform</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Four modules. One mission.</h2>
              <p className="text-white/30 text-base max-w-lg mx-auto">Each module is AI-powered and integrates with the ECI measurement framework to create a unified view of organizational health.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                name: "LucidEDU",
                tag: "AI TRAINING",
                desc: "AI implementation training that meets your organization where it is. Not generic courses. Curriculum calibrated to your team's actual readiness, role requirements, and strategic context.",
                color: "#0ea5e9",
                details: ["Role-specific AI training paths", "Readiness assessment engine", "Progress tracking & certification", "Custom curriculum generation"],
              },
              {
                name: "LucidHR",
                tag: "ALIGNED HIRING",
                desc: "Alignment-based hiring that goes beyond skills and experience. Measures cultural fit, strategic alignment, and execution compatibility before the first interview.",
                color: "#06b6d4",
                details: ["Alignment-based candidate scoring", "Cultural fit measurement", "Strategic role mapping", "Bias reduction protocols"],
              },
              {
                name: "LucidBOARD",
                tag: "BOARD REPORTING",
                desc: "Automated board-level reporting that transforms raw organizational data into executive-ready insights. No more slide decks built from spreadsheets.",
                color: "#0284c7",
                details: ["Automated executive dashboards", "ECI Score tracking over time", "Strategic initiative health", "Board-ready PDF generation"],
              },
              {
                name: "LucidWAY",
                tag: "EDUCATION PROGRAMS",
                desc: "Structured education programs for organizational transformation. From leadership development to process optimization, delivered through the LucidORG methodology.",
                color: "#0369a1",
                details: ["Leadership development tracks", "Process optimization courses", "Change management training", "Organizational design programs"],
              },
            ].map((item, i) => (
              <FadeIn key={item.name} delay={i * 0.1}>
                <div className="rounded-xl border border-white/[0.06] p-8 hover:border-white/[0.12] transition-all group cursor-default h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[9px] font-black" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>{item.name.replace("Lucid", "")}</div>
                    <div>
                      <div className="text-[8px] font-mono tracking-wider" style={{ color: `${item.color}60` }}>{item.tag}</div>
                      <div className="text-white/80 font-bold group-hover:text-white transition-colors">{item.name}</div>
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

      {/* ═══ FOUR PILLARS ═══ */}
      <section className="py-24 relative" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="text-sky-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-6">ECI Framework</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6">Four pillars of<br />organizational health.</h2>
              <p className="text-white/40 text-base leading-relaxed mb-8">
                The Execution Capacity Index measures what traditional metrics miss. 11 execution indicators across 37 strategic data points, powered by the OrgGPT AI engine.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Alignment", "People", "Process", "Leadership"].map((tag) => (
                  <span key={tag} className="text-[9px] px-3 py-1.5 rounded-full border border-sky-500/20 text-sky-400/50 font-mono">{tag}</span>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="space-y-4">
                {[
                  { label: "Alignment", desc: "Strategic clarity, goal coherence, cross-functional communication", color: "#0ea5e9" },
                  { label: "People", desc: "Talent readiness, engagement quality, development investment", color: "#06b6d4" },
                  { label: "Process", desc: "Execution efficiency, workflow optimization, decision velocity", color: "#0284c7" },
                  { label: "Leadership", desc: "Vision communication, accountability culture, change capacity", color: "#0369a1" },
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

      {/* ═══ METHODOLOGY ═══ */}
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-sky-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">Methodology</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Assess. Align. Execute.</h2>
              <p className="text-white/30 text-base max-w-2xl mx-auto">A three-phase approach that starts with measurement, creates alignment, and drives execution. Not a one-time audit. A continuous improvement engine.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { phase: "PHASE 1", title: "Assess", desc: "Baseline your organization against the ECI framework. 11 metrics, 37 data points. Identify the gaps between where you are and where you need to be.", color: "#0ea5e9" },
              { phase: "PHASE 2", title: "Align", desc: "Design the intervention. Custom training paths, hiring calibration, process optimization. Every recommendation backed by data from the assessment.", color: "#06b6d4" },
              { phase: "PHASE 3", title: "Execute", desc: "Deploy the changes with built-in measurement. Track progress against baseline. OrgGPT provides real-time recommendations as your organization evolves.", color: "#0284c7" },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.15}>
                <div className="rounded-xl border border-white/[0.06] p-8 hover:border-white/[0.12] transition-all group cursor-default h-full">
                  <div className="text-[8px] font-mono tracking-wider mb-3" style={{ color: `${item.color}60` }}>{item.phase}</div>
                  <h3 className="text-xl font-black text-white/80 group-hover:text-white transition-colors mb-4">{item.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EXPECTED ROI ═══ */}
      <section className="py-24 relative" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-sky-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">Expected Impact</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90">What aligned organizations look like.</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { target: 20, suffix: "%", label: "Productivity increase", sub: "Cross-functional", color: "#0ea5e9" },
              { target: 45, suffix: "%", label: "Execution success rate", sub: "Strategic initiatives", color: "#06b6d4" },
              { target: 35, suffix: "%", label: "Meeting effectiveness", sub: "Decision velocity", color: "#0284c7" },
              { target: 30, suffix: "%", label: "Turnover reduction", sub: "Aligned culture", color: "#0369a1" },
            ].map((r, i) => (
              <FadeIn key={r.label} delay={i * 0.1}>
                <div className="group cursor-default">
                  <div className="text-3xl sm:text-5xl font-black mb-2 transition-all group-hover:scale-110" style={{ color: r.color }}>
                    <Counter target={r.target} suffix={r.suffix} />
                  </div>
                  <div className="text-white/50 text-sm font-semibold">{r.label}</div>
                  <div className="text-white/20 text-[9px] font-mono mt-1">{r.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "var(--bg-dark)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 60%)", filter: "blur(80px)" }} />
        </div>
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white/90 leading-[0.9] tracking-tight mb-6">
              Stop guessing.<br />Start measuring.
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-lg mx-auto">
              LucidORG is the measurement platform beneath the Level9 AI ecosystem. Co-founded by Eric and Sasha Hathaway. Built on 30 years of operational pattern recognition.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://lucidorg.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold hover:shadow-xl hover:shadow-sky-500/25 transition-all hover:scale-[1.02] text-lg">
                Visit LucidORG
              </a>
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
          <span className="text-white/15 text-[9px] font-mono">&copy; 2026 LucidORG · Built by Level9OS</span>
          <span className="text-white/15 text-[9px]">AI-powered organizational measurement.</span>
        </div>
      </div>
    </div>
  );
}

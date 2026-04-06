"use client";

import { useState } from "react";
import Image from "next/image";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter, AnimatedBar } from "@/components/Shared";

export default function Level9() {
  const [activeProduct, setActiveProduct] = useState(0);

  const products = [
    {
      name: "StratOS",
      tag: "AI STRATEGIC OPERATING SYSTEM",
      status: "LIVE",
      color: "#8b5cf6",
      gradient: "from-violet-600 to-fuchsia-600",
      desc: "A 10-person simulated executive leadership team pressure-tests every strategic decision before it costs real money. Three rounds of structured debate. Kill criteria. Dissent by design.",
      features: ["Simulated ELT with 10 AI executives", "3-round structured debate protocol", "Built-in kill criteria and decision gates", "Dissent-by-design methodology"],
      metric: { num: 10, suffix: "", label: "AI Executives" },
      href: "/stratos",
    },
    {
      name: "LucidORG",
      tag: "AI ORGANIZATIONAL PLATFORM",
      status: "LIVE",
      color: "#0ea5e9",
      gradient: "from-sky-600 to-cyan-600",
      desc: "The parent platform. AI-powered training (LucidEDU), aligned hiring (LucidHR), board-level reporting (LucidBOARD), and the operational methodology that ties it all together.",
      features: ["LucidEDU: AI implementation training", "LucidHR: Alignment-based hiring", "LucidBOARD: Board reporting automation", "Operational alignment methodology"],
      metric: { num: 4, suffix: "", label: "AI Modules" },
      href: "/lucidorg",
    },
    {
      name: "LinkupOS",
      tag: "AI MARKETING ENGINE",
      status: "LIVE",
      color: "#f59e0b",
      gradient: "from-amber-500 to-orange-600",
      desc: "A fully automated AI marketing engine for LinkedIn. Content generation, scheduling, engagement analytics, and audience growth, running 19 workflows on autopilot at ~$5/month.",
      features: ["19 automated n8n workflows", "AI content generation pipeline", "LinkedIn engagement automation", "~$5/month operating cost"],
      metric: { num: 19, suffix: "", label: "AI Workflows" },
      href: "/linkupos",
    },
    {
      name: "CommandOS",
      tag: "AI AGENT ORCHESTRATION SYSTEM",
      status: "LIVE",
      color: "#10b981",
      gradient: "from-emerald-500 to-teal-600",
      desc: "A unified command center for orchestrating autonomous AI agents across multiple projects. Coordinator, governance, and project management agents supervise teams of up to 15 execution agents with real-time observability and automatic session continuity.",
      features: ["Multi-agent orchestration (up to 15 agents)", "Three-tier AI leadership: Coordinator, Governance, PM", "Automatic session rotation and continuity", "Real-time fleet observability dashboard", "Multi-LLM support across providers"],
      metric: { num: 15, suffix: "+", label: "AI Agents" },
      href: "/commandos",
    },
    {
      name: "COO Playbook",
      tag: "EXECUTIVE METHODOLOGY",
      status: "PUBLISHED",
      color: "#64748b",
      gradient: "from-slate-500 to-zinc-600",
      desc: "The definitive execution methodology for modern COOs. Five paradigm shifts, 18 chapters, 12+ frameworks, and stage-specific implementation guides built from 30 years of operational pattern recognition.",
      features: ["Five paradigm shifts for modern operations", "18 chapters with implementation guides", "12+ operational frameworks", "30/90/180-day stage-based playbooks", "30+ visualizations and models"],
      metric: { num: 18, suffix: "", label: "Chapters" },
      href: "/playbook",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <FloatingNav />

      {/* ═══ HERO — AI Accelerator ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-center" style={{ background: "var(--bg-dark)" }}>
        {/* Animated gradient bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full top-1/4 right-0 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)", filter: "blur(80px)" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full bottom-0 left-1/4" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 60%)", filter: "blur(80px)" }} />
        </div>

        {/* Grid lines bg */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-32 relative z-10">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-violet-500/20">L9</div>
              <div>
                <div className="text-[10px] text-violet-400/60 tracking-[0.3em] uppercase font-semibold">Level9</div>
                <div className="text-[9px] text-white/25">AI Accelerator for Operations</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.85] tracking-tight mb-8">
              <span className="text-white/90">AI that builds the</span><br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">operating system</span><br />
              <span className="text-white/90">your org is missing.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-white/40 text-lg leading-relaxed max-w-2xl mb-12">
              Four production AI systems. Not experiments. Fully deployed platforms that transform how organizations make decisions, measure alignment, orchestrate agents, and scale operations.
            </p>
          </FadeIn>

          {/* Hero stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            {[
              { target: 6, suffix: "", label: "Products & Systems", color: "#8b5cf6" },
              { target: 19, suffix: "+", label: "Automated Workflows", color: "#06b6d4" },
              { target: 30, suffix: "+", label: "Years Operations", color: "#ec4899" },
              { target: 5, suffix: "", label: "$/Month OpCost", color: "#f59e0b" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={0.3 + i * 0.1}>
                <div className="group cursor-default">
                  <div className="text-4xl sm:text-5xl font-black mb-1 group-hover:scale-110 transition-transform" style={{ color: s.color }}>
                    <Counter target={s.target} suffix={s.suffix} prefix={s.label === "$/Month OpCost" ? "$" : ""} />
                  </div>
                  <div className="text-white/25 text-[9px] uppercase tracking-wider">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.6}>
            <div className="flex flex-wrap items-center gap-4">
              <a href="mailto:eric@erichathaway.com"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-xl hover:shadow-violet-500/25 transition-all hover:scale-[1.02]">
                <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                Start a conversation
              </a>
              <a href="https://stratos.lucidorg.com" target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 text-sm transition-colors border border-white/[0.08] rounded-full px-6 py-4 hover:border-white/[0.15]">
                Try StratOS Live
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ THE PROBLEM — Why operations needs AI ═══ */}
      <section className="py-24 relative" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-red-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">The Problem</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Operations is the last function<br />still running on gut feel.</h2>
              <p className="text-white/30 text-base max-w-2xl mx-auto">Marketing has automation. Sales has CRM. Finance has models. But operations, the function that connects everything, is still running on spreadsheets, offsites, and hope.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: "67%", label: "Of strategies fail at execution", src: "Harvard Business Review", color: "#ef4444" },
              { stat: "$7.8T", label: "Global cost of disengaged employees", src: "Gallup 2024", color: "#ef4444" },
              { stat: "87%", label: "Of AI implementations fail to deliver ROI", src: "Gartner 2024", color: "#ef4444" },
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

          <FadeIn delay={0.4}>
            <div className="text-center mt-12">
              <p className="text-white/50 text-lg font-semibold">We don&apos;t consult on the problem. <span className="text-violet-400">We built the AI to solve it.</span></p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ PRODUCTS — The AI Stack ═══ */}
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-violet-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">The AI Stack</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Six products. One mission.</h2>
              <p className="text-white/30 text-base max-w-lg mx-auto">Each product is production-deployed and built on 30 years of operational pattern recognition.</p>
            </div>
          </FadeIn>

          {/* Product selector tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {products.map((p, i) => (
              <button key={p.name} onClick={() => setActiveProduct(i)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeProduct === i
                    ? "text-white shadow-lg"
                    : "text-white/30 border border-white/[0.06] hover:border-white/[0.12] hover:text-white/50"
                }`}
                style={activeProduct === i ? { background: `linear-gradient(135deg, ${p.color}, ${p.color}80)`, boxShadow: `0 8px 30px ${p.color}25` } : {}}>
                {p.name}
              </button>
            ))}
          </div>

          {/* Active product detail */}
          {products.map((p, i) => (
            <div key={p.name} className={`transition-all duration-500 ${activeProduct === i ? "opacity-100" : "opacity-0 absolute pointer-events-none"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 items-start">
                {/* Left: Info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${p.gradient}`} />
                    <span className="text-[9px] font-mono" style={{ color: `${p.color}80` }}>{p.tag}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.color }} />
                      <span className="text-[9px] font-mono" style={{ color: `${p.color}60` }}>{p.status}</span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-white/90 mb-4">{p.name}</h3>
                  <p className="text-white/40 text-base leading-relaxed mb-8">{p.desc}</p>

                  <div className="space-y-3 mb-8">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-white/50 text-sm hover:text-white/70 transition-colors cursor-default">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                        {f}
                      </div>
                    ))}
                  </div>

                  <a href={p.href} target={p.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:translate-x-2" style={{ color: p.color }}>
                    Explore {p.name} <span>→</span>
                  </a>
                </div>

                {/* Right: Visual */}
                <div className="rounded-2xl border border-white/[0.06] p-8 relative overflow-hidden" style={{ background: `${p.color}05` }}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}40)` }} />

                  {/* Big metric */}
                  <div className="text-center mb-8">
                    <div className="text-7xl sm:text-8xl font-black" style={{ color: `${p.color}80` }}>
                      <Counter target={p.metric.num} suffix={p.metric.suffix} />
                    </div>
                    <div className="text-white/30 text-sm mt-2">{p.metric.label}</div>
                  </div>

                  {/* Tech stack indicators */}
                  <div className="grid grid-cols-2 gap-3">
                    {["n8n Workflows", "AI Models", "API Endpoints", "Data Pipelines"].map((tech) => (
                      <div key={tech} className="bg-white/[0.03] rounded-lg p-3 text-center border border-white/[0.04]">
                        <div className="text-white/40 text-[10px]">{tech}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MAX — Coming Soon ═══ */}
      <section className="py-20 relative" style={{ background: "#080b14" }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/[0.05] mb-8">
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-fuchsia-400/70 text-[9px] font-mono tracking-wider">COMING SOON</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">MAX</h2>
            <p className="text-white/30 text-lg max-w-xl mx-auto mb-4">
              The AI chat agent for your organizational data. Ask questions about your operations in natural language. Get answers backed by real metrics.
            </p>
            <p className="text-white/20 text-sm max-w-lg mx-auto">
              Powered by the same data layer as LinkupOS and designed to plug directly into StratOS, creating a unified AI intelligence layer across your entire operation.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ WHY AI FOR OPS — The thesis ═══ */}
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="text-violet-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-6">The Thesis</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6">Operations is the only<br />side of the house you<br />actually control.</h2>
              <p className="text-white/40 text-base leading-relaxed mb-6">
                You can&apos;t control the market. You can&apos;t control competitors. You can&apos;t always control your board. But you CAN control how your organization makes decisions, measures alignment, and executes strategy.
              </p>
              <p className="text-white/30 text-sm leading-relaxed mb-8">
                That&apos;s why we build AI for operations. Not marketing automation or sales tools. The operational layer is where the leverage is. It&apos;s where 30 years of pattern recognition meets modern AI architecture.
              </p>
              <div className="flex flex-wrap gap-3">
                {["AI-Native", "Self-Correcting", "Measurable", "Scalable"].map((tag) => (
                  <span key={tag} className="text-[9px] px-3 py-1.5 rounded-full border border-violet-500/20 text-violet-400/50 font-mono">{tag}</span>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="space-y-5">
                {[
                  { before: "Spreadsheets & gut feel", after: "AI-driven decision architecture", color: "#8b5cf6", barVal: 92 },
                  { before: "Annual surveys", after: "Real-time organizational intelligence", color: "#06b6d4", barVal: 87 },
                  { before: "Manual reporting", after: "Automated board-level insights", color: "#ec4899", barVal: 95 },
                  { before: "Hope-based strategy", after: "Pressure-tested decisions", color: "#f59e0b", barVal: 88 },
                ].map((item) => (
                  <div key={item.after} className="group cursor-default p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-all hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-red-400/50 text-[9px] line-through">{item.before}</span>
                      <span className="text-white/15">→</span>
                      <span className="text-white/70 text-sm font-semibold group-hover:text-white transition-colors">{item.after}</span>
                    </div>
                    <AnimatedBar value={item.barVal} color={item.color} />
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ RESULTS — Measured Impact ═══ */}
      <section className="py-24 relative" style={{ background: "#080b14" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-emerald-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">Measured Impact</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90">What AI-powered operations looks like.</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center mb-16">
            {[
              { target: 21, suffix: "%", label: "EBITDA increase", sub: "90-day engagement", color: "#8b5cf6" },
              { target: 42, suffix: "%", label: "Productivity gains", sub: "Cross-functional", color: "#06b6d4" },
              { target: 1400, suffix: "", label: "Hours/mo automated", sub: "Process systemization", color: "#ec4899" },
              { target: 2, suffix: "x", label: "Initiative success", sub: "With kill criteria", color: "#f59e0b" },
              { target: 5, suffix: "", label: "$/mo operating cost", sub: "LinkupOS", color: "#10b981", prefix: "$" },
            ].map((r, i) => (
              <FadeIn key={r.label} delay={i * 0.1}>
                <div className="group cursor-default">
                  <div className="text-3xl sm:text-5xl font-black mb-2 transition-all group-hover:scale-110" style={{ color: r.color }}>
                    <Counter target={r.target} suffix={r.suffix} prefix={r.prefix || ""} />
                  </div>
                  <div className="text-white/50 text-sm font-semibold">{r.label}</div>
                  <div className="text-white/20 text-[9px] font-mono mt-1">{r.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Client logos */}
          <FadeIn delay={0.5}>
            <div className="text-center">
              <div className="text-white/15 text-[9px] tracking-[0.5em] uppercase font-semibold mb-6">Built with experience from</div>
              <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
                {[
                  { name: "Microsoft", logo: "/images/logos/microsoft.svg" },
                  { name: "T-Mobile", logo: "/images/logos/t-mobile.svg" },
                  { name: "Credit Suisse", logo: "/images/logos/credit-suisse.svg" },
                  { name: "S&P Global", logo: "/images/logos/sp-global.svg" },
                  { name: "Zoot", logo: "/images/logos/zoot.svg" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5 group cursor-default">
                    <img src={item.logo} alt="" className="w-5 h-5 opacity-30 group-hover:opacity-60 transition-opacity" />
                    <span className="text-white/15 group-hover:text-white/40 text-base sm:text-lg font-semibold tracking-wide transition-colors">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ AI BUILDER — Credibility ═══ */}
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <Image src="/images/brand/headshot-square.jpg" alt="Eric Hathaway" width={300} height={300} className="w-full max-w-[300px] rounded-2xl shadow-2xl shadow-violet-500/10 mx-auto" />
            </FadeIn>
            <FadeIn direction="right" delay={0.2}>
              <div className="text-white/20 text-[9px] tracking-[0.5em] uppercase font-semibold mb-6">The Builder</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white/90 mb-6">30 years of operations.<br />4 AI systems built.<br /><span className="text-violet-400">Not experiments.</span></h2>
              <p className="text-white/40 text-base leading-relaxed mb-6">
                Eric Hathaway spent three decades inside organizations, from CTO to CEO to Global VP, across 6 continents and 60+ countries. Now he builds the AI systems he wished existed.
              </p>
              <p className="text-white/30 text-sm leading-relaxed mb-8">
                StratOS, LucidORG, LinkupOS, and CommandOS aren&apos;t consultant deliverables. They&apos;re production-grade AI platforms, built full-stack with n8n, modern APIs, and real operational data.
              </p>
              <a href="/about" className="inline-flex items-center gap-2 text-violet-400/70 hover:text-violet-400 text-sm font-semibold transition-colors">
                Read the full story <span>→</span>
              </a>
            </FadeIn>
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
              Ready to give your<br />operations an AI brain?
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-lg mx-auto">
              Whether you need AI strategy, a production system built, or want to see what StratOS can do for your next decision, the conversation starts here.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="mailto:eric@erichathaway.com"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-xl hover:shadow-violet-500/25 transition-all hover:scale-[1.02] text-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                Let&apos;s talk AI
              </a>
              <a href="https://stratos.lucidorg.com" target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white/90 text-sm transition-colors border border-white/[0.10] rounded-full px-6 py-4 hover:border-white/[0.25]">
                Try StratOS
              </a>
              <a href="https://linkedin.com/in/erichathaway1" target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white/90 text-sm transition-colors border border-white/[0.10] rounded-full px-6 py-4 hover:border-white/[0.25]">
                LinkedIn
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <div className="py-8 border-t border-white/[0.03]" style={{ background: "#080b14" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white/15 text-[9px] font-mono">&copy; 2026 Level9 · A practice by Level9OS</span>
          <span className="text-white/15 text-[9px]">AI-powered operations. Built, not advised.</span>
        </div>
      </div>
    </div>
  );
}

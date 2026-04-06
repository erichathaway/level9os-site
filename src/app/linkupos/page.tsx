"use client";

import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter } from "@/components/Shared";

export default function LinkupOS() {
  return (
    <div className="min-h-screen relative" style={{ background: "#030306" }}>
      <FloatingNav />

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-center">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse at 30% 40%, rgba(245,158,11,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(249,115,22,0.04) 0%, transparent 50%)
          `
        }} />

        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-32 relative z-10">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-amber-500/20 tracking-wider">UP</div>
              <div>
                <div className="text-[10px] text-amber-400/60 tracking-[0.3em] uppercase font-semibold">LinkupOS</div>
                <div className="text-[9px] text-white/25">AI Signal Engine for LinkedIn</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.85] tracking-tight mb-8">
              <span className="text-white/90">You don&apos;t need to</span><br />
              <span className="text-white/90">post more. You need to</span><br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">matter more.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-white/40 text-lg leading-relaxed max-w-2xl mb-4">
              Voice-calibrated AI generates research-backed content in your voice, posts it at optimal times, engages your network, and grows your visibility. Every day. On autopilot.
            </p>
            <p className="text-white/25 text-sm max-w-xl mb-12">
              Backed by 350K+ words of verified research from McKinsey, HBR, Gartner, Deloitte, and Bain. Every stat cited. Every post quality-gated. Zero hallucinations.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-12">
            {[
              { target: 350, suffix: "K+", label: "Research Words", color: "#f59e0b" },
              { target: 5, suffix: "", label: "Min/Day", color: "#f97316" },
              { target: 70, suffix: "+", label: "AI Workflows", color: "#f59e0b" },
              { target: 10, suffix: "x", label: "More Consistent", color: "#f97316" },
              { target: 80, suffix: "%", label: "Less Time", color: "#f59e0b" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={0.3 + i * 0.08}>
                <div className="group cursor-default">
                  <div className="text-3xl sm:text-4xl font-black mb-1 group-hover:scale-110 transition-transform" style={{ color: s.color }}>
                    <Counter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-white/25 text-[9px] uppercase tracking-wider">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.6}>
            <div className="flex flex-wrap items-center gap-4">
              <a href="https://linkupos.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-xl hover:shadow-amber-500/25 transition-all hover:scale-[1.02]">
                Visit LinkupOS
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
      <section className="py-24 relative" style={{ background: "#0A0E1A" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-4">Smart people are invisible on LinkedIn.</h2>
              <p className="text-white/30 text-base max-w-lg mx-auto">You know your stuff. Your network doesn&apos;t. Because consistency beats talent, and nobody has time to post every day.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "Voice-Calibrated AI", desc: "Not generic ChatGPT. LinkupOS learns your actual writing style, tone, and professional voice. Content that sounds like you because it was trained on you.", icon: "Voice", color: "#f59e0b" },
              { title: "Research-Backed Content", desc: "350K+ words of verified intelligence from McKinsey, HBR, Gartner. Every citation checked. Every stat real. Zero hallucinations.", icon: "Research", color: "#f97316" },
              { title: "Quality-Gated Output", desc: "A second AI reviews everything before it reaches LinkedIn. Built-in embarrassment check. Full audit log of every action taken.", icon: "Quality", color: "#f59e0b" },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className="rounded-xl p-7 h-full transition-all duration-300 hover:translate-y-[-2px] group" style={{
                  background: "#0d1021", border: "1px solid rgba(245,158,11,0.1)",
                }}>
                  <div className="text-[9px] font-mono tracking-wider uppercase mb-4" style={{ color: `${f.color}60` }}>{f.icon}</div>
                  <h3 className="text-base font-bold text-white/80 mb-3 group-hover:text-white transition-colors">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-white/30 group-hover:text-white/45 transition-colors">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-24 relative" style={{ background: "#030306" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="mb-16">
              <div className="text-amber-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">Daily Workflow</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white/90">7:30am. Your inbox. Done.</h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {[
              { time: "7:30am", title: "Daily briefing arrives", desc: "Posts, comments, warm intros, and engagement opportunities tailored to your voice and network.", color: "#f59e0b" },
              { time: "Auto", title: "Content posts to LinkedIn", desc: "Optimal timing. Strategic scheduling. Your feed stays active whether you're in meetings or on a plane.", color: "#f97316" },
              { time: "Auto", title: "Engagement runs in background", desc: "Relevant comments on key posts. Connection requests to high-value contacts. All in your voice.", color: "#f59e0b" },
              { time: "Weekly", title: "Performance insights", desc: "What's working. What's not. Audience growth. Engagement trends. Data, not guesswork.", color: "#f97316" },
            ].map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08}>
                <div className="flex items-start gap-5 p-5 rounded-xl transition-all hover:bg-white/[0.01]" style={{ border: "1px solid rgba(245,158,11,0.06)" }}>
                  <div className="text-[9px] font-mono font-bold w-14 flex-shrink-0 pt-1" style={{ color: `${step.color}70` }}>{step.time}</div>
                  <div>
                    <h3 className="text-sm font-bold text-white/70 mb-1">{step.title}</h3>
                    <p className="text-xs text-white/30 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-24 relative" style={{ background: "#0A0E1A" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-amber-400/40 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">Pricing</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white/90">Start free. Scale when ready.</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: "Free", price: "$0", features: "5 comments/wk, 2 posts", featured: false },
              { name: "Starter", price: "$29", features: "15 comments, 3 posts, 5 intros", featured: true },
              { name: "Growth", price: "$59", features: "25 comments, deep voice, Topic Asst", featured: false },
              { name: "Scale", price: "$89", features: "50 comments daily, 5 posts, unlimited", featured: false },
              { name: "Premium", price: "$149", features: "We post, comment, connect for you", featured: false },
            ].map((tier) => (
              <FadeIn key={tier.name}>
                <div className={`rounded-xl p-5 text-center transition-all h-full ${tier.featured ? "ring-1 ring-amber-500/30" : ""}`} style={{
                  background: tier.featured ? "rgba(245,158,11,0.06)" : "#0d1021",
                  border: `1px solid ${tier.featured ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.06)"}`,
                }}>
                  <div className="text-[9px] font-mono text-white/30 mb-2">{tier.name}</div>
                  <div className="text-2xl font-black text-amber-400 mb-3">{tier.price}</div>
                  <p className="text-[10px] text-white/25 leading-relaxed">{tier.features}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="text-center mt-10">
              <a href="https://linkupos.com" target="_blank" rel="noopener noreferrer"
                className="text-amber-400/50 hover:text-amber-400 text-sm transition-colors">See full pricing at linkupos.com →</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="py-24 relative" style={{ background: "#030306" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-white/90">Real results. Real people.</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { quote: "Profile views spiked in Week 2. Speaking invitations by Month 3.", metric: "Week 2" },
              { quote: "Replaced my ghostwriter. Was paying $1.2K/mo. Now $89/mo and better content.", metric: "$1.2K saved" },
              { quote: "200 to 900 followers in 2 months. Inbound leads from comments alone.", metric: "4.5x growth" },
            ].map((review, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-xl p-6 h-full" style={{ background: "#0d1021", border: "1px solid rgba(245,158,11,0.08)" }}>
                  <div className="text-lg font-black mb-3" style={{ color: "#f59e0b40" }}>{review.metric}</div>
                  <p className="text-sm leading-relaxed font-editorial italic" style={{ color: "#94A3B8" }}>&ldquo;{review.quote}&rdquo;</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "#0A0E1A" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.05) 0%, transparent 60%)"
        }} />
        <div className="max-w-3xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white/90 leading-[0.9] tracking-tight mb-6">
              Your content team.<br />For the price of coffee.
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-lg mx-auto">
              Voice-calibrated. Research-backed. Quality-gated. Start free and scale when your LinkedIn starts opening doors.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://linkupos.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-xl hover:shadow-amber-500/25 transition-all hover:scale-[1.02] text-lg">
                Start Free
              </a>
              <a href="mailto:eric@erichathaway.com"
                className="text-white/50 hover:text-white/90 text-sm transition-colors border border-white/[0.10] rounded-full px-6 py-4 hover:border-white/[0.25]">
                Get in touch
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="py-8 border-t border-white/[0.03]" style={{ background: "#030306" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white/15 text-[9px] font-mono">&copy; 2026 LinkupOS. Built by Level9OS</span>
          <span className="text-white/15 text-[9px]">AI-powered LinkedIn signal engine.</span>
        </div>
      </div>
    </div>
  );
}

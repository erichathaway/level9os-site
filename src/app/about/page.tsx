"use client";

import Image from "next/image";
import FloatingNav from "@/components/FloatingNav";
import { FadeIn, Counter } from "@/components/Shared";

export default function Story() {
  return (
    <div className="min-h-screen relative">
      <FloatingNav />

      {/* ═══ HERO — Photo-forward, executive ═══ */}
      <section className="relative overflow-hidden" style={{ background: "#f5f5f0" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 pt-28 sm:pt-36 pb-16 relative z-10">
          {/* Photo: full-width, hero-scale */}
          <div className="relative mb-12 sm:mb-16">
            <Image src="/images/brand/headshot-main.jpg" alt="Eric Hathaway" width={1200} height={600}
              className="w-full max-h-[520px] object-cover rounded-2xl shadow-2xl shadow-black/10" style={{ objectPosition: "center 25%" }} />
          </div>

          {/* Title + body: centered, clean */}
          <div className="max-w-3xl">
            <div className="text-black/20 text-[9px] tracking-[0.5em] uppercase font-mono mb-6">The Story</div>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-black/90 leading-[0.9] tracking-tight mb-8">
              Montana kid. Six continents.<br />
              <span className="font-editorial italic font-normal text-black/30">Still building.</span>
            </h1>
            <p className="text-black/50 text-lg leading-relaxed max-w-2xl mb-4">
              I grew up in Montana with the kind of curiosity that doesn&apos;t sit still. Left home, lived on four continents, visited sixty countries, and spent thirty years inside organizations: building them, breaking them, fixing them, and eventually figuring out why most of them don&apos;t work as well as the people inside them.
            </p>
            <p className="text-black/30 text-sm leading-relaxed max-w-xl">
              This isn&apos;t a resume. You can find that on <a href="https://linkedin.com/in/erichathaway1" target="_blank" rel="noopener noreferrer" className="text-black/50 hover:text-black transition-colors underline underline-offset-2">LinkedIn</a>. This is the version that explains why I do what I do.
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-8 sm:gap-12 mt-12 pt-8 border-t border-black/[0.06]">
            {[
              { target: 30, suffix: "+", label: "Years" },
              { target: 6, suffix: "", label: "Continents" },
              { target: 60, suffix: "+", label: "Countries" },
              { target: 4, suffix: "", label: "Languages" },
              { target: 6, suffix: "", label: "AI Systems" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.1}>
                <div className="group cursor-default">
                  <div className="text-3xl sm:text-4xl font-black text-black/60 transition-all duration-300 group-hover:text-black/90">
                    <Counter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-[8px] text-black/25 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CAREER TIMELINE — Big visual ═══ */}
      <section className="py-24 relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <div className="text-white/20 text-[9px] tracking-[0.5em] uppercase font-semibold mb-4">The Journey</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white/90">30 years. 6 continents. One throughline.</h2>
          </div>

          {/* Vertical timeline */}
          <div className="relative">
            {/* Center line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/30 via-cyan-500/20 to-emerald-500/30" />

            {[
              { year: "1991–1993", role: "CTO", company: "Mono-Lite", loc: "Montana, USA", insight: "First build. Technology leadership before startup culture existed.", color: "#8b5cf6", logo: "/images/logos/mono-lite.svg" },
              { year: "1993–1996", role: "Managing Director, SE Asia", company: "S&P Global", loc: "Singapore & SE Asia", insight: "Six countries, nine markets. 20%+ market share growth through strategic M&A.", color: "#ec4899", logo: "/images/logos/sp-global.svg" },
              { year: "1996–2000", role: "CEO, Czech Republic", company: "Credit Suisse", loc: "Prague, Czech Republic", insight: "Empty office → full operation. 30%+ margin increase. Operational architecture IS the common language.", color: "#06b6d4", logo: "/images/logos/credit-suisse.svg" },
              { year: "2000–2008", role: "Global Managing Partner", company: "H&H Management", loc: "Hong Kong", insight: "35% execution efficiency increase. 3 post-acquisition integrations. Mentored hundreds of leaders.", color: "#ec4899" },
              { year: "2008–2014", role: "Director", company: "Microsoft → T-Mobile", loc: "Redmond → Bellevue, WA", insight: "94 offices unified at Microsoft. Built analytics at T-Mobile. Doubled operational throughput at both.", color: "#8b5cf6", logo: "/images/logos/microsoft.svg" },
              { year: "2015–2019", role: "Global VP, Marketing", company: "Zoot Enterprises", loc: "Bozeman, MT", insight: "Enterprise scale across every time zone. 20%+ engagement increase, 25% rework reduction.", color: "#06b6d4", logo: "/images/logos/zoot.svg" },
              { year: "2020–Present", role: "Founder & COO", company: "LucidORG · Level9 · StratOS · CommandOS", loc: "Montana, USA", insight: "Stopped fixing other people's systems. Built 4 production AI systems. Taught at MSU.", color: "#10b981", logo: "/images/logos/lucidorg.svg" },
            ].map((t, i) => (
              <FadeIn key={t.year} delay={i * 0.08}>
                <div className={`relative flex items-start gap-6 sm:gap-0 mb-12 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                  {/* Dot on line */}
                  <div className="absolute left-6 sm:left-1/2 top-6 w-4 h-4 rounded-full border-2 bg-[#030306] -translate-x-1/2 z-10" style={{ borderColor: t.color }} />
                  <div className="absolute left-6 sm:left-1/2 top-6 w-4 h-4 rounded-full -translate-x-1/2 z-0 animate-ping" style={{ background: `${t.color}20` }} />

                  {/* Content card */}
                  <div className={`ml-14 sm:ml-0 sm:w-[45%] ${i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'}`}>
                    <div className="rounded-xl border border-white/[0.06] p-6 hover:border-white/[0.12] transition-all group cursor-default" style={{ borderLeftWidth: i % 2 !== 0 ? 3 : 1, borderRightWidth: i % 2 === 0 ? 3 : 1, borderLeftColor: i % 2 !== 0 ? t.color : undefined, borderRightColor: i % 2 === 0 ? t.color : undefined }}>
                      <div className="flex items-center gap-3 mb-3" style={{ justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                        {t.logo && <img src={t.logo} alt="" className="w-4 h-4 opacity-50" />}
                        <span className="text-[9px] font-mono" style={{ color: `${t.color}70` }}>{t.year}</span>
                        <span className="text-white/15 text-[9px]">{t.loc}</span>
                      </div>
                      <div className="text-lg font-bold text-white/80 group-hover:text-white transition-colors mb-1">{t.role}</div>
                      <div className="text-sm text-white/50 font-semibold mb-3">{t.company}</div>
                      <p className="text-white/30 text-sm leading-relaxed">{t.insight}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE THROUGH LINE — what I learned, not where I worked ═══ */}
      <section className="relative" style={{ background: "var(--bg-dark)" }}>
        {/* Purple wave background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image src="/images/brand/purple-wave-bg.jpg" alt="" fill className="object-cover opacity-15" />
        </div>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-32 relative z-10">
          <div className="text-white/25 text-[10px] tracking-[0.4em] uppercase font-mono mb-16">What Thirty Years Taught Me</div>

          <div className="space-y-20">
            {[
              {
                insight: "The system is the language.",
                story: "My first real test was Prague. Credit Suisse sent me to build their Czech operation from nothing: empty office, no team, no clients, and I didn't speak Czech. What I learned: when you can't rely on a common spoken language, you build systems that communicate for you. Operational architecture doesn't need translation. It IS the translation.",
                context: "CEO, Credit Suisse · Prague · 2001-2005",
                color: "#8b5cf6",
                num: "01",
              },
              {
                insight: "Self-correcting beats supervised. Every time.",
                story: "Six countries across Southeast Asia. Six completely different business cultures. I tried to manage them individually and nearly burned out. Then I built one system that self-corrected, and watched it outperform everything I'd ever managed hands-on. That's when alignment stopped being a nice idea and became the entire thesis.",
                context: "Managing Director, S&P Global · Singapore · 2005-2011",
                color: "#06b6d4",
                num: "02",
              },
              {
                insight: "Misalignment compounds exponentially.",
                story: "At Microsoft, with 100+ global stakeholders, I saw something that changed how I think about scale: a 5% misalignment at headquarters becomes a 50% gap by the time it reaches the field. Nobody notices until it's too expensive to fix. At T-Mobile, I built the analytics to make it visible. At Zoot, I codified it. If it's not written, it's not real. It's just hope.",
                context: "Microsoft · T-Mobile · Zoot · 2013-2019",
                color: "#ec4899",
                num: "03",
              },
              {
                insight: "If you need a transformation, you already lost.",
                story: "I stopped fixing other people's systems and started building the ones I wished existed. StratOS: an AI that pressure-tests your decisions before they cost real money. Level9: fractional COO practice with a measurement framework (ECI Score) that makes alignment visible. LucidORG: the platform underneath it all, co-founded with my daughter Sasha.",
                context: "LucidORG · Level9 · StratOS · 2019-Present",
                color: "#8b5cf6",
                num: "04",
              },
            ].map((lesson, i) => (
              <FadeIn key={lesson.insight} delay={i * 0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-start relative">
                  {/* Accent line */}
                  <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-[2px] rounded-full" style={{ background: `linear-gradient(180deg, ${lesson.color}40, transparent)` }} />
                  <div className="sm:col-span-4 sm:pl-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl font-black" style={{ color: `${lesson.color}15` }}>{lesson.num}</span>
                      <div className="text-[9px] font-mono" style={{ color: `${lesson.color}50` }}>{lesson.context}</div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white/80 leading-tight">&ldquo;{lesson.insight}&rdquo;</h3>
                  </div>
                  <div className="sm:col-span-8">
                    <p className="text-white/45 text-base leading-relaxed sm:pl-8 border-l-2 sm:border-l border-white/[0.06] pl-4">{lesson.story}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE HUMAN — Light, warm ═══ */}
      <section className="relative" style={{ background: "var(--bg-cream, #faf8f5)" }}>
        {/* Globe watermark */}
        <div className="absolute top-12 right-0 w-[400px] h-[220px] pointer-events-none opacity-[0.06] hidden sm:block">
          <Image src="/images/brand/globe.png" alt="" width={400} height={220} className="w-full h-full object-contain" />
        </div>
        <div className="max-w-4xl mx-auto px-6 sm:px-12 py-32 relative z-10">
          <div className="flex items-center gap-6 mb-12">
            <Image src="/images/brand/headshot-square.jpg" alt="Eric Hathaway" width={80} height={80} className="w-20 h-20 rounded-full object-cover shadow-lg shadow-black/10 border-2 border-white" />
            <div>
              <div className="text-black/20 text-[10px] tracking-[0.4em] uppercase font-mono">The Human Version</div>
              <div className="text-black/60 text-lg font-semibold mt-1">Beyond the boardroom.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16">
            <FadeIn direction="left">
              <p className="text-black/60 text-xl leading-relaxed mb-8">
                Hong Kong. Zurich. Prague. Bali. Panama. Eventually you circle back to where you started. Not because you ran out of places, but because you figured out that the best place to build from is wherever you feel grounded.
              </p>
              <p className="text-black/40 text-base leading-relaxed mb-8">
                Father first. Builder always. I run LucidORG with my daughter Sasha. I mentor founders. I write about the things most people in boardrooms are afraid to say out loud.
              </p>
              <p className="text-black/30 text-sm font-editorial italic">
                &ldquo;Not here to tell, sell, or compel. Just spark impactful questioning of all things.&rdquo;
              </p>
            </FadeIn>
            <div>
              <div className="space-y-6">
                {[
                  { label: "Home", value: "Montana" },
                  { label: "Lived", value: "Hong Kong, Zurich, Prague, Bali, Panama" },
                  { label: "Traveled", value: "60+ countries, 6 continents" },
                  { label: "Family", value: "Father. Co-founder with his daughter." },
                  { label: "Music", value: "BigE Sessions: original sonic rhythm & soul" },
                  { label: "Podcast", value: "LucidUNPLUGGED: organizational efficiency" },
                ].map((item) => (
                  <div key={item.label} className="border-b border-black/[0.06] pb-4 group cursor-default">
                    <div className="text-[9px] text-black/25 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-black/50 group-hover:text-black/80 text-sm transition-colors">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WRITING — Dark ═══ */}
      <section className="relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-32">
          <div className="text-white/25 text-[10px] tracking-[0.4em] uppercase font-mono mb-4">Writing</div>
          <h2 className="text-3xl font-black text-white/85 mb-4">Selected articles.</h2>
          <div className="flex items-center gap-4 mb-16">
            <a href="https://erichathaway.substack.com" target="_blank" rel="noopener noreferrer" className="text-violet-400/50 hover:text-violet-400 text-sm transition-colors">Personal Substack</a>
            <span className="text-white/10">&middot;</span>
            <a href="https://lucidinsights.substack.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400/50 hover:text-cyan-400 text-sm transition-colors">Lucid Insights</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: "Why Your AI Strategy Might Not Be Working", quote: "AI is moving companies forward faster, but it's also exposing the fact that they were never structurally sound to begin with.", source: "Lucid Insights", date: "Mar 2025", url: "https://lucidinsights.substack.com", color: "#06b6d4" },
              { title: "The Death of The Handshake", quote: "The market pays for every avoided truth, with compound interest.", source: "MINDSHIFT Monday", date: "Oct 2025", url: "https://erichathaway.substack.com", color: "#8b5cf6" },
              { title: "Empires Fall From The Tyranny of Small Men", quote: "Small men don't dream of creating; they dream of controlling what others built.", source: "FUTURE Friday", date: "Dec 2025", url: "https://erichathaway.substack.com", color: "#8b5cf6" },
              { title: "We're Too Busy Fighting Fires!", quote: "If your organization is constantly fighting fires, it's because you've allowed the conditions for those fires to exist.", source: "Lucid Insights", date: "Feb 2025", url: "https://lucidinsights.substack.com", color: "#06b6d4" },
            ].map((a) => (
              <a key={a.title} href={a.url} target="_blank" rel="noopener noreferrer" className="card-dark p-6 group block hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider">{a.source}</span>
                  <span className="text-white/10 text-[9px]">{a.date}</span>
                </div>
                <h3 className="text-white/60 group-hover:text-white font-bold mb-3 transition-colors">{a.title}</h3>
                <p className="text-white/25 group-hover:text-white/45 text-sm font-editorial italic transition-colors">&ldquo;{a.quote}&rdquo;</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LISTEN — Light ═══ */}
      <section className="relative" style={{ background: "var(--bg-cream, #faf8f5)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <div className="text-black/20 text-[10px] tracking-[0.4em] uppercase font-mono mb-4">Listen</div>
            <h2 className="text-2xl font-black text-black/80 mb-2">LucidUNPLUGGED</h2>
            <p className="text-black/35 text-sm max-w-md">Conversations on organizational efficiency, leadership, and the invisible systems that determine whether organizations thrive or just survive.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="card-light px-6 py-4 text-black/40 hover:text-black/70 text-sm transition-colors">Apple Podcasts</a>
            <a href="#" className="card-light px-6 py-4 text-black/40 hover:text-black/70 text-sm transition-colors">Spotify</a>
          </div>
        </div>
      </section>

      {/* ═══ WHAT I'M BUILDING — Dark ═══ */}
      <section className="relative" style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-32">
          <div className="text-white/25 text-[10px] tracking-[0.4em] uppercase font-mono mb-4">Current Projects</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[
              { title: "StratOS", desc: "10-person simulated ELT. Pressure-tests every decision.", status: "LIVE", color: "#8b5cf6", href: "/stratos" },
              { title: "CommandOS", desc: "15+ AI agents. Three-tier leadership. Fleet orchestration.", status: "LIVE", color: "#10b981", href: "/commandos" },
              { title: "COO Playbook", desc: "87K+ words. 24-week program. AI execution consultant.", status: "PUBLISHED", color: "#64748b", href: "/playbook" },
              { title: "LinkupOS", desc: "AI signal engine for LinkedIn. Voice-calibrated. 70+ workflows.", status: "LIVE", color: "#f59e0b", href: "/linkupos" },
              { title: "Level9", desc: "The consulting practice. Advises, builds, and deploys all of it.", status: "ACTIVE", color: "#06b6d4", href: "/level9" },
              { title: "LucidORG", desc: "The parent platform. LucidEDU, LucidHR, LucidBOARD.", status: "OPERATING", color: "#0ea5e9", href: "/lucidorg" },
            ].map((b) => (
              <a key={b.title} href={b.href} className="card-dark p-8 group block relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 50% 0%, ${b.color}08, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: b.color }} />
                    <span className="text-[9px] font-mono" style={{ color: `${b.color}60` }}>{b.status}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white/70 group-hover:text-white transition-colors mb-3">{b.title}</h3>
                  <p className="text-white/30 group-hover:text-white/50 text-sm leading-relaxed transition-colors">{b.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden" style={{ background: "#080b14" }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-12 py-32 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[0.9] tracking-tight mb-6">
              <span className="text-white/50">I&apos;m always interested in</span><br />
              <span className="text-white/90">the next conversation.</span>
            </h2>
            <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent mx-auto my-8" />
            <div className="flex items-center justify-center gap-4 mb-12">
              <a href="mailto:eric@erichathaway.com" className="cta-primary text-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                Let&apos;s talk
              </a>
              <a href="https://linkedin.com/in/erichathaway1" target="_blank" rel="noopener noreferrer" className="cta-secondary">LinkedIn</a>
            </div>

            {/* LinkedIn QR */}
            <div className="flex flex-col items-center gap-3">
              <a href="https://linkedin.com/in/erichathaway1" target="_blank" rel="noopener noreferrer">
                <Image src="/images/linkedin-qr.png" alt="LinkedIn QR Code" width={120} height={120} className="opacity-40 hover:opacity-70 transition-opacity" />
              </a>
              <span className="text-white/15 text-[9px] font-mono">Scan to connect on LinkedIn</span>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="py-8 border-t border-white/[0.03]" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          <span className="text-white/15 text-[9px] font-mono">&copy; 2026 Level9OS</span>
          <span className="text-white/15 text-[9px]">Built with intention. Powered by experience.</span>
        </div>
      </div>
    </div>
  );
}

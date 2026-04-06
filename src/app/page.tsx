"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import FloatingNav from "@/components/FloatingNav";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  /* ─── Splash state ─── */
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("level9os-entered")) return false;
    }
    return true;
  });

  const handleEnter = () => {
    sessionStorage.setItem("level9os-entered", "true");
    setShowSplash(false);
  };

  /* ─── Scroll state ─── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [panelIndex, setPanelIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleScroll = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const max = c.scrollWidth - c.clientWidth;
    setProgress(max > 0 ? c.scrollLeft / max : 0);
    setPanelIndex(Math.round(c.scrollLeft / c.clientWidth));
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    c.addEventListener("scroll", handleScroll);
    return () => c.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* ─── Mouse tracking (desktop only) ─── */
  const targetMouse = useRef({ x: 50, y: 50 });
  const lerpRef = useRef<number>(0);
  useEffect(() => {
    if (isMobile) return;
    const handler = (e: MouseEvent) => {
      targetMouse.current = { x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 };
    };
    window.addEventListener("mousemove", handler);
    const lerp = () => {
      setMousePos(prev => ({
        x: prev.x + (targetMouse.current.x - prev.x) * 0.03,
        y: prev.y + (targetMouse.current.y - prev.y) * 0.03,
      }));
      lerpRef.current = requestAnimationFrame(lerp);
    };
    lerpRef.current = requestAnimationFrame(lerp);
    return () => { window.removeEventListener("mousemove", handler); cancelAnimationFrame(lerpRef.current); };
  }, [isMobile]);

  const labels = ["", "FRICTION", "THE EDGE", "PROOF", "BUILD", "SCALE", "ARCHITECT", "CONNECT"];

  /* ─── Panel 3: auto-cycling numbers ─── */
  const [activeNum, setActiveNum] = useState(0);
  const [hoveredNum, setHoveredNum] = useState<number | null>(null);
  const numPaused = useRef(false);
  useEffect(() => { numPaused.current = hoveredNum !== null; }, [hoveredNum]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!numPaused.current) {
        setActiveNum(prev => {
          let next: number;
          do { next = Math.floor(Math.random() * 5); } while (next === prev);
          return next;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ─── Panel 5/6: flip card state ─── */
  const [hoveredBuildCard, setHoveredBuildCard] = useState<number | null>(null);
  const [hoveredScaleCard, setHoveredScaleCard] = useState<number | null>(null);

  /* ─── Panel 7: product orbit ─── */
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const orbitSpeed = useRef(0.08);
  const orbitTarget = useRef(0.08);
  useEffect(() => {
    let frame: number;
    const tick = () => {
      orbitSpeed.current += (orbitTarget.current - orbitSpeed.current) * 0.05;
      if (Math.abs(orbitSpeed.current) > 0.001) {
        setOrbitAngle(prev => (prev + orbitSpeed.current) % 360);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { orbitTarget.current = hoveredProduct !== null ? 0 : 0.08; }, [hoveredProduct]);

  const products = [
    { title: "StratOS", tag: "AI Strategic OS", stat: "10", desc: "10-person simulated executive leadership team. Three rounds of structured debate before any decision costs real money. Kill criteria and dissent built into every cycle.", color: "#8b5cf6", href: "/stratos", icon: "S" },
    { title: "CommandOS", tag: "Agent Orchestration", stat: "15+", desc: "Orchestrates 15+ autonomous AI agents across multiple projects simultaneously. Coordinator, governance, and project management agents with real-time fleet observability.", color: "#10b981", href: "/commandos", icon: "C" },
    { title: "COO Playbook", tag: "Execution Platform", stat: "87K+", desc: "87K+ words of methodology. 24-week guided implementation. 9 training courses for your entire team. AI execution consultant. The operating layer beneath EOS and OKRs.", color: "#64748b", href: "/playbook", icon: "P" },
    { title: "LucidORG", tag: "AI Org Platform", stat: "4", desc: "The measurement platform. LucidEDU for AI training, LucidHR for aligned hiring, LucidBOARD for board reporting. Co-founded with Sasha Hathaway.", color: "#0ea5e9", href: "/lucidorg", icon: "O" },
    { title: "LinkupOS", tag: "AI Signal Engine", stat: "19", desc: "Fully automated AI marketing engine for LinkedIn. 19 n8n workflows handle content generation, scheduling, engagement analytics, and audience growth on autopilot.", color: "#f59e0b", href: "/linkupos", icon: "U" },
    { title: "Level9", tag: "AI Accelerator for Ops", stat: "6", desc: "The consulting practice that advises, builds, and deploys all of it. Fractional COO services, AI strategy, operational transformation. 6 production systems. 30 years of pattern recognition.", color: "#06b6d4", href: "/level9", icon: "L" },
  ];

  /* ─── Panel 4: money page flip ─── */
  const [moneyFlipped, setMoneyFlipped] = useState(false);
  const costSets = [
    [
      { cost: "$37M", label: "Lost per year from miscommunication alone", src: "Holmes Report" },
      { cost: "$7.8T", label: "Global cost of disengaged employees", src: "Gallup 2024" },
      { cost: "67%", label: "Of strategies fail at execution", src: "Harvard Business Review" },
      { cost: "9 mo", label: "Average time to kill a failing initiative", src: "McKinsey" },
      { cost: "23%", label: "Of payroll wasted on misaligned work", src: "Asana Anatomy of Work" },
    ],
    [
      { cost: "$12.9M", label: "Wasted per $1B on underperforming projects", src: "PMI Pulse 2024" },
      { cost: "85%", label: "Of leadership teams spend < 1hr/mo on strategy", src: "Harvard Business Review" },
      { cost: "$450B", label: "Lost annually to employee disengagement in the US", src: "Gallup" },
      { cost: "71%", label: "Of employees can't name their company's strategy", src: "IBM Strategy Survey" },
      { cost: "40%", label: "Of strategic value is lost to poor execution", src: "Marakon Associates" },
    ],
  ];
  const gainSets = [
    [
      { gain: "21%", label: "EBITDA margin increase in 90 days", src: "Level9 Engagement" },
      { gain: "42%", label: "Cross-functional productivity gains", src: "Level9 Engagement" },
      { gain: "1,400", label: "Hours/month automated from systemization", src: "Level9 Engagement" },
      { gain: "2x", label: "Initiative success rate with kill criteria", src: "Level9 Engagement" },
      { gain: "3 wks", label: "To identify failing projects (vs 9 months)", src: "Level9 Engagement" },
    ],
    [
      { gain: "17%", label: "Revenue growth from aligned organizations", src: "LSA Global" },
      { gain: "58%", label: "Faster decision-making with clear frameworks", src: "Bain & Company" },
      { gain: "3.5x", label: "Higher shareholder returns from aligned companies", src: "McKinsey" },
      { gain: "91%", label: "Employee retention when strategy is clear", src: "Deloitte" },
      { gain: "6 wks", label: "Average time to first measurable impact", src: "Level9 Engagement" },
    ],
  ];
  const activeCostSet = moneyFlipped ? 1 : 0;
  const activeGainSet = moneyFlipped ? 1 : 0;

  /* ─── Panel 8: flight dot ─── */
  const flightNodes = [
    { x: 8, y: 15 }, { x: 72, y: 10 }, { x: 55, y: 82 }, { x: 80, y: 35 },
    { x: 12, y: 72 }, { x: 35, y: 8 }, { x: 92, y: 50 }, { x: 42, y: 92 },
  ];
  const [flightIdx, setFlightIdx] = useState(0);
  const [flightMoving, setFlightMoving] = useState(false);
  useEffect(() => {
    const moveTimer = setTimeout(() => setFlightMoving(true), 1600);
    const arriveTimer = setTimeout(() => {
      setFlightMoving(false);
      setFlightIdx(prev => (prev + 1) % flightNodes.length);
    }, 4850);
    return () => { clearTimeout(moveTimer); clearTimeout(arriveTimer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightIdx]);

  return (
    <>
      {/* ═══ SPLASH SCREEN ═══ */}
      <AnimatePresence>
        {showSplash && (
          <motion.div key="splash" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <SplashScreen onEnter={handleEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN SITE ═══ */}
      {!showSplash && (
        <div className="fixed inset-0 bg-[#030306] overflow-hidden">
          <FloatingNav showBack={false} />

          {/* Ambient glow */}
          <div className="fixed inset-0 pointer-events-none transition-all duration-[3000ms] hidden sm:block" style={{
            background: `
              radial-gradient(ellipse 50% 40% at ${15 + progress * 70}% ${30 + Math.sin(progress * Math.PI * 2) * 20}%, rgba(139,92,246,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at ${80 - progress * 60}% ${70 - Math.sin(progress * Math.PI) * 20}%, rgba(6,182,212,0.08) 0%, transparent 50%)
            `,
          }} />

          {/* Progress bar */}
          <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
            <div className="h-full transition-all duration-200" style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4, #ec4899)" }} />
          </div>

          <div className="fixed top-6 left-6 sm:left-8 z-50 text-[9px] font-mono text-white/25">{String(panelIndex + 1).padStart(2, "0")} / 08</div>
          <div className="fixed bottom-6 right-6 sm:right-8 z-50 text-[9px] font-mono text-white/25 tracking-widest">{labels[panelIndex]}</div>

          {/* ═══ HORIZONTAL SCROLL ═══ */}
          <div ref={containerRef} className="flex h-screen overflow-x-auto overflow-y-hidden snap-x snap-mandatory relative z-10" style={{ scrollbarWidth: "none" }}>

            {/* ═══ 1: ENTRANCE ═══ */}
            <section className="flex-shrink-0 w-screen h-screen snap-center flex items-center justify-center relative overflow-hidden">
              <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:block">
                <div className="animate-pulse" style={{ animationDuration: "2s" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/20">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="text-center relative z-10">
                <div className="text-white/40 text-[12px] tracking-[0.8em] uppercase mb-12 font-light">Level9OS</div>
                <h1 className="text-[clamp(2.8rem,10vw,11rem)] font-black leading-[0.8] tracking-[-0.04em] px-4 sm:px-0"
                  style={{
                    backgroundImage: isMobile
                      ? "linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(6,182,212,0.8) 50%, rgba(236,72,153,0.7) 100%)"
                      : `
                      radial-gradient(circle 680px at ${mousePos.x}% ${mousePos.y}%, rgba(139,92,246,0.95) 0%, transparent 45%),
                      radial-gradient(circle 530px at ${mousePos.x + 5}% ${mousePos.y - 5}%, rgba(6,182,212,0.8) 0%, transparent 40%),
                      radial-gradient(circle 600px at ${mousePos.x - 3}% ${mousePos.y + 8}%, rgba(236,72,153,0.7) 0%, transparent 42%),
                      linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)
                    `,
                    WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>
                  I make<br />organizations<br />work.
                </h1>
                <div className="mt-16 flex flex-col items-center gap-2">
                  <div className="w-px h-12 bg-gradient-to-b from-violet-500/50 to-transparent" />
                  <div className="text-white/35 text-[9px] tracking-[0.4em] uppercase">scroll</div>
                </div>
              </div>
            </section>

            {/* ═══ 2: THE FRICTION ═══ */}
            <section className="flex-shrink-0 w-screen h-screen snap-center relative overflow-hidden flex items-center">
              <div className="absolute inset-0 select-none overflow-hidden hidden sm:block">
                {[
                  { text: "DRIFT", x: 75, y: 20, size: "8rem" },
                  { text: "SILOS", x: 10, y: 70, size: "6rem" },
                  { text: "FRICTION", x: 60, y: 80, size: "5rem" },
                ].map((w) => (
                  <div key={w.text} className="absolute pointer-events-none" style={{ left: `${w.x}%`, top: `${w.y}%` }}>
                    <div className="flex" style={{ fontSize: w.size }}>
                      {w.text.split("").map((letter, li) => {
                        const dx = (w.x + li * 3) - mousePos.x;
                        const dy = w.y - mousePos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const force = Math.max(0, 1 - dist / 30);
                        const pushX = force * dx * 2;
                        const pushY = force * dy * 1.5;
                        const baseRot = w.text === "FRICTION" ? 25 : 15;
                        const rot = force * (li % 2 === 0 ? baseRot : -baseRot);
                        const opacity = 0.06 + force * 0.12;
                        const wordStyle: React.CSSProperties = {};

                        if (w.text === "DRIFT" && force > 0.05) {
                          wordStyle.transition = "transform 2s ease-out";
                        }
                        if (w.text === "SILOS" && force > 0) {
                          wordStyle.borderLeft = `1px solid rgba(255,255,255,${force * 0.12})`;
                          wordStyle.borderRight = `1px solid rgba(255,255,255,${force * 0.12})`;
                          wordStyle.padding = `${force * 12}px 2px`;
                          wordStyle.marginRight = `${force * 14}px`;
                          wordStyle.background = `rgba(255,255,255,${force * 0.03})`;
                        }
                        if (w.text === "FRICTION" && force > 0) {
                          wordStyle.marginRight = `${force * 6}px`;
                          wordStyle.boxShadow = `inset 1px -1px 0 rgba(255,255,255,${force * 0.06})`;
                        }

                        const siloY = w.text === "SILOS" && force > 0 ? (li % 2 === 0 ? -4 : 4) * force : 0;

                        return (
                          <span key={li} className="inline-block">
                            <span className="font-black tracking-tighter inline-block transition-all duration-700 ease-out"
                              style={{
                                color: `rgba(255,255,255,${opacity})`,
                                transform: `translate(${pushX}px, ${pushY + siloY}px) rotate(${rot}deg)`,
                                ...wordStyle,
                              }}>
                              {letter}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-16">
                <div className="text-violet-400/50 text-[10px] tracking-[0.4em] uppercase mb-12 font-mono">The friction nobody talks about</div>
                <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black text-white leading-[0.85] tracking-tight mb-16">
                  Your strategy<br />isn&apos;t the problem.
                </h2>
                <div className="space-y-8">
                  {[
                    { stat: "67%", text: "of well-formulated strategies fail due to poor execution", src: "Harvard Business Review" },
                    { stat: "86%", text: "of employees cite lack of alignment as the primary cause of workplace failures", src: "McKinsey & Company" },
                    { stat: "$37M", text: "lost per year, per company, from misunderstood communications alone", src: "Holmes Report" },
                  ].map((item) => (
                    <div key={item.stat} className="flex items-start gap-6 group cursor-default">
                      <span className="text-3xl font-black text-violet-400/50 group-hover:text-violet-400 transition-all duration-500 min-w-[100px]">{item.stat}</span>
                      <div>
                        <span className="text-white/50 group-hover:text-white/80 text-base leading-relaxed transition-all duration-500 block">{item.text}</span>
                        <span className="text-white/15 group-hover:text-white/30 text-[9px] font-mono transition-all duration-500">{item.src}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-20 h-px bg-gradient-to-r from-violet-500/40 to-transparent mt-16" />
              </div>
            </section>

            {/* ═══ 3: THE EDGE ═══ */}
            <section className="flex-shrink-0 w-screen h-screen snap-center flex items-center relative overflow-hidden">
              <div className="absolute inset-0 hidden sm:block">
                {[
                  { num: "87%", x: 5, y: 8, size: "clamp(4rem,14vw,12rem)", color: "#8b5cf6", label: "AI implementations fail to deliver ROI", src: "Gartner 2024" },
                  { num: "70%", x: 55, y: 5, size: "clamp(3rem,12vw,10rem)", color: "#06b6d4", label: "Digital transformations fail at alignment", src: "McKinsey" },
                  { num: "86%", x: 30, y: 35, size: "clamp(3rem,12vw,9rem)", color: "#10b981", label: "Of employees cite lack of alignment as top failure cause", src: "McKinsey & Company" },
                  { num: "75%", x: 8, y: 55, size: "clamp(3.5rem,11vw,9rem)", color: "#ec4899", label: "M&A integrations destroy value in 18 months", src: "Bain & Company" },
                  { num: "67%", x: 52, y: 60, size: "clamp(2.5rem,10vw,8rem)", color: "#f59e0b", label: "Strategic initiatives fail at execution", src: "Harvard Business Review" },
                ].map((item, idx) => {
                  const isActive = hoveredNum === idx || (hoveredNum === null && activeNum === idx);
                  return (
                    <div key={`num-${idx}`} className="absolute cursor-pointer" style={{ left: `${item.x}%`, top: `${item.y}%` }}
                      onMouseEnter={() => setHoveredNum(idx)}
                      onMouseLeave={() => setHoveredNum(null)}>
                      <span className="font-black tracking-tighter block transition-opacity duration-700"
                        style={{ fontSize: item.size, color: item.color, opacity: isActive ? 0.6 : 0.05 }}>
                        {item.num}
                      </span>
                      <div className="mt-2 max-w-[300px] transition-opacity duration-700" style={{ opacity: isActive ? 1 : 0 }}>
                        <span className="text-white/60 text-sm block">{item.label}</span>
                        <span className="text-white/20 text-[9px] font-mono block mt-1">{item.src}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative sm:absolute sm:right-[5%] sm:top-1/2 sm:-translate-y-1/2 max-w-lg text-center sm:text-right z-10 px-6 sm:px-0 mx-auto">
                <p className="text-[clamp(1.3rem,2.5vw,2.2rem)] font-extralight text-white/60 leading-[1.5] mb-8 cursor-default">
                  <span className="hover:text-white transition-colors duration-500">Technology is a commodity.</span><br />
                  <span className="hover:text-white transition-colors duration-500">Talent is available.</span><br />
                  <span className="hover:text-white transition-colors duration-500">Capital is cheap.</span><br />
                  <span className="hover:text-white transition-colors duration-500">Frameworks are published.</span>
                </p>
                <div className="w-16 h-px bg-gradient-to-l from-violet-500 to-cyan-500 my-8 ml-auto" />
                <p className="text-[clamp(1.5rem,2.8vw,2.5rem)] font-semibold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                  Alignment is the<br />only edge left.
                </p>
                <p className="text-white/25 text-xs mt-6 max-w-sm ml-auto leading-relaxed cursor-default font-mono">
                  Sources: Gartner, McKinsey, Bain, HBR
                </p>
              </div>
            </section>

            {/* ═══ 4: THE MONEY PAGE ═══ */}
            <section className="flex-shrink-0 w-screen h-screen snap-center flex items-center relative">
              <div className="max-w-6xl mx-auto px-6 sm:px-16 w-full overflow-y-auto max-h-screen py-8 sm:py-0 sm:overflow-visible">
                <div className="mb-6 sm:mb-10 flex items-end justify-between">
                  <div>
                    <div className="text-red-400/40 text-[10px] tracking-[0.4em] uppercase font-mono mb-3">The Cost of Getting It Wrong</div>
                    <h2 className="text-xl sm:text-3xl font-black text-white/90 mb-2">Misalignment isn&apos;t just inefficiency.<br /><span className="text-red-400/70">It&apos;s money on fire.</span></h2>
                  </div>
                  <div className={`hidden sm:block text-[9px] font-mono tracking-widest uppercase transition-all duration-700 ${moneyFlipped ? "text-cyan-400/60" : "text-white/15"}`}>
                    {moneyFlipped ? "Showing alternate data" : "Hover to flip board"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12"
                  onMouseEnter={() => !isMobile && setMoneyFlipped(true)} onMouseLeave={() => !isMobile && setMoneyFlipped(false)}>
                  <div>
                    <div className="text-[9px] text-red-400/40 tracking-[0.3em] uppercase font-mono mb-6">Without Alignment</div>
                    <div className="space-y-4">
                      {costSets[activeCostSet].map((item, i) => (
                        <div key={`cost-${activeCostSet}-${i}-${moneyFlipped}`} className="flex items-start gap-5 group cursor-default border-b border-white/[0.04] pb-4 hover:border-red-500/15 transition-all">
                          <span className="text-2xl font-black min-w-[90px] origin-left inline-flex">
                            {item.cost.split("").map((ch, ci) => (
                              <span key={`${activeCostSet}-${i}-${ci}`} className="inline-block"
                                style={{
                                  animation: `splitFlap 0.4s ease-in-out ${i * 0.06 + ci * 0.04}s both`,
                                  color: "rgba(248,113,113,0.7)",
                                  background: "rgba(248,113,113,0.06)",
                                  padding: "1px 3px", margin: "0 1px", borderRadius: "3px",
                                }}>{ch}</span>
                            ))}
                          </span>
                          <div>
                            <span className="text-white/50 group-hover:text-white/80 text-sm transition-colors block">{item.label}</span>
                            <span className="text-white/15 text-[9px] font-mono">{item.src}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-green-400/40 tracking-[0.3em] uppercase font-mono mb-6">With Alignment</div>
                    <div className="space-y-4">
                      {gainSets[activeGainSet].map((item, i) => (
                        <div key={`gain-${activeGainSet}-${i}-${moneyFlipped}`} className="flex items-start gap-5 group cursor-default border-b border-white/[0.04] pb-4 hover:border-green-500/15 transition-all">
                          <span className="text-2xl font-black min-w-[90px] origin-left inline-flex">
                            {item.gain.split("").map((ch, ci) => (
                              <span key={`${activeGainSet}-${i}-${ci}`} className="inline-block"
                                style={{
                                  animation: `splitFlap 0.4s ease-in-out ${i * 0.06 + ci * 0.04}s both`,
                                  color: "rgba(74,222,128,0.7)",
                                  background: "rgba(74,222,128,0.06)",
                                  padding: "1px 3px", margin: "0 1px", borderRadius: "3px",
                                }}>{ch}</span>
                            ))}
                          </span>
                          <div>
                            <span className="text-white/50 group-hover:text-white/80 text-sm transition-colors block">{item.label}</span>
                            <span className="text-white/15 text-[9px] font-mono">{item.src}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-white/40 text-sm max-w-lg">The gap between these columns is alignment. That&apos;s it. Same people, same tools, same market. Different operating system.</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    {["Microsoft", "Credit Suisse", "T-Mobile", "S&P Global", "Zoot"].map((logo) => (
                      <span key={logo} className="text-white/15 hover:text-white/40 text-xs font-semibold transition-colors cursor-default">{logo}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ 5: BUILD ═══ */}
            <section className="flex-shrink-0 w-screen h-screen snap-center flex items-start sm:items-center overflow-y-auto">
              <div className="max-w-5xl mx-auto px-6 sm:px-16 w-full pt-16 pb-8 sm:py-0">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 sm:gap-12">
                  <div className="sm:col-span-2">
                    <div className="text-white/30 text-[10px] font-mono mb-4">1991-2000</div>
                    <h3 className="text-[2.5rem] sm:text-[4rem] font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent leading-none mb-6">Build</h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-8">Three continents. Nine markets. Zero playbook. Built it anyway.</p>
                    <div className="space-y-3">
                      {["9 markets, 20%+ market share growth", "Full P&L ownership, 30%+ margin increase", "The system IS the common language"].map((p) => (
                        <div key={p} className="flex items-center gap-3">
                          <div className="w-1 h-1 rounded-full bg-violet-500/60" />
                          <span className="text-white/35 text-xs">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-3 flex flex-col justify-center gap-4">
                    {[
                      { num: "01", title: "CEO, Credit Suisse", loc: "Prague, Czech Republic", period: "1996-2000", story: "Empty office to full operation. Full P&L in a foreign market. 30%+ margin increase.", tags: ["CEO", "30%+"],
                        back: { company: "CREDIT SUISSE", logo: "/images/logos/credit-suisse.svg", metrics: [{ val: "30%+", label: "Margins" }, { val: "25%", label: "Rework cut" }, { val: "P&L", label: "Full ownership" }], highlight: "Operational architecture IS the common language." }},
                      { num: "02", title: "MD, SE Asia, S&P Global", loc: "Singapore & SE Asia", period: "1993-1996", story: "9 global markets via strategic M&A. 20%+ market share growth across six countries.", tags: ["M&A", "20%+"],
                        back: { company: "S&P GLOBAL", logo: "/images/logos/sp-global.svg", metrics: [{ val: "9", label: "Markets" }, { val: "20%+", label: "Share growth" }, { val: "6", label: "Countries" }], highlight: "Self-correcting systems beat supervised ones." }},
                      { num: "03", title: "CTO, Mono-Lite", loc: "Montana", period: "1991-1993", story: "First build. End-to-end systems architecture before 'startup culture' existed.", tags: ["TECHNOLOGY"],
                        back: { company: "MONO-LITE", logo: "/images/logos/mono-lite.svg", metrics: [{ val: "0 to 1", label: "Greenfield" }, { val: "Full stack", label: "End-to-end" }], highlight: "Systems are only as good as the humans who use them." }},
                      { num: "04", title: "COO, LucidORG", loc: "Montana", period: "2022-2025", story: "Built AI platform measuring organizational efficiency. 4 modules. Co-founded with daughter.", tags: ["AI", "COO"],
                        back: { company: "LUCIDORG", logo: "/images/logos/lucidorg.svg", metrics: [{ val: "4", label: "AI modules" }, { val: "20%+", label: "Performance" }, { val: "2x", label: "Exec success" }], highlight: "Built the system I wished existed." }},
                    ].map((role, idx) => (
                      isMobile ? (
                        <div key={role.num} className="border border-white/[0.06] rounded-xl p-4">
                          <div className="text-[9px] text-violet-400/50 font-mono mb-1">{role.num} &middot; {role.period}</div>
                          <h4 className="text-base font-bold text-white">{role.title}</h4>
                          <p className="text-white/40 text-xs mt-1">{role.loc}</p>
                          <p className="text-white/30 text-sm leading-relaxed mt-2">{role.story}</p>
                        </div>
                      ) : (
                        <div key={role.num} className="relative cursor-pointer"
                          style={{ perspective: "1200px", minHeight: "155px" }}
                          onMouseEnter={() => setHoveredBuildCard(idx)}
                          onMouseLeave={() => setHoveredBuildCard(null)}>
                          <div className="w-full h-full transition-transform duration-700 ease-in-out"
                            style={{ transformStyle: "preserve-3d", transform: hoveredBuildCard === idx ? "rotateX(180deg)" : "rotateX(0deg)" }}>
                            <div className="absolute inset-0 border border-white/[0.06] rounded-xl p-5 hover:border-violet-500/20 transition-all duration-500 overflow-hidden"
                              style={{ backfaceVisibility: "hidden" }}>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="text-[9px] text-violet-400/50 font-mono mb-1">{role.num} &middot; {role.period}</div>
                                  <h4 className="text-base font-bold text-white">{role.title}</h4>
                                  <p className="text-white/40 text-[10px] mt-0.5">{role.loc}</p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">{role.tags.map((t) => <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full border border-violet-500/20 text-violet-400/40">{t}</span>)}</div>
                              </div>
                              <p className="text-white/30 text-xs leading-relaxed mt-2">{role.story}</p>
                            </div>
                            <div className="absolute inset-0 border border-violet-500/20 rounded-xl p-5 bg-violet-500/[0.04] flex flex-col justify-center overflow-hidden"
                              style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}>
                              <div className="flex items-center gap-2.5 mb-3">
                                {role.back.logo && <img src={role.back.logo} alt="" className="w-5 h-5 opacity-60" />}
                                <div className="text-sm font-black text-violet-400/50 tracking-wider">{role.back.company}</div>
                              </div>
                              <div className="flex gap-6 mb-3">
                                {role.back.metrics.map((m) => (
                                  <div key={m.label}>
                                    <div className="text-xl font-black text-white/80">{m.val}</div>
                                    <div className="text-[8px] text-white/30 font-mono mt-0.5">{m.label}</div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-white/40 text-xs italic leading-relaxed">&ldquo;{role.back.highlight}&rdquo;</p>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ 6: SCALE ═══ */}
            <section className="flex-shrink-0 w-screen h-screen snap-center flex items-start sm:items-center overflow-y-auto">
              <div className="max-w-5xl mx-auto px-6 sm:px-16 w-full pt-16 pb-8 sm:py-0">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 sm:gap-12">
                  <div className="sm:col-span-3 flex flex-col justify-center gap-3 order-2 sm:order-1">
                    {[
                      { num: "05", title: "Director, WWPS, Microsoft", loc: "Redmond, WA", period: "2008-2012", story: "Global platform rollout across 94 offices. 100+ stakeholders. 2x operational throughput.", tags: ["94 OFFICES"],
                        back: { company: "MICROSOFT", logo: "/images/logos/microsoft.svg", metrics: [{ val: "94", label: "Offices" }, { val: "100+", label: "Stakeholders" }, { val: "2x", label: "Throughput" }], highlight: "5% at HQ compounds to 50% in the field." }},
                      { num: "06", title: "Director, Analytics, T-Mobile", loc: "Bellevue, WA", period: "2012-2014", story: "Made alignment measurable for the first time. Post-acquisition integration. 2x throughput.", tags: ["ANALYTICS"],
                        back: { company: "T-MOBILE", logo: "/images/logos/t-mobile.svg", metrics: [{ val: "2x", label: "Throughput" }, { val: "1st", label: "Measurable" }, { val: "M&A", label: "Integration" }], highlight: "Dashboards, not offsites." }},
                      { num: "07", title: "Global VP, Zoot Enterprises", loc: "Bozeman, MT", period: "2015-2019", story: "Enterprise scale, every time zone. 20%+ engagement, 25% rework reduction.", tags: ["20%+ ENG."],
                        back: { company: "ZOOT", logo: "/images/logos/zoot.svg", metrics: [{ val: "20%+", label: "Engagement" }, { val: "25%", label: "Rework cut" }, { val: "Global", label: "All zones" }], highlight: "Made the implicit explicit. Codified it." }},
                      { num: "08", title: "Exec Director, NextGen Interns", loc: "Montana", period: "2024-Present", story: "Leading the next generation. AI readiness, The LucidWAY. Taught Org Behavior at MSU.", tags: ["EDUCATION"],
                        back: { company: "NEXTGEN + MSU", logo: "/images/logos/nextgen.svg", metrics: [{ val: "100s", label: "Students" }, { val: "MSU", label: "Professor" }, { val: "AI", label: "Readiness" }], highlight: "Mentoring the next generation of operators." }},
                    ].map((role, idx) => (
                      isMobile ? (
                        <div key={role.num} className="border border-white/[0.06] rounded-xl p-4">
                          <div className="text-[9px] text-cyan-400/50 font-mono mb-1">{role.num} &middot; {role.period}</div>
                          <h4 className="text-base font-bold text-white">{role.title}</h4>
                          <p className="text-white/35 text-xs">{role.loc}</p>
                          <p className="text-white/30 text-sm leading-relaxed mt-2">{role.story}</p>
                        </div>
                      ) : (
                        <div key={role.num} className="relative cursor-pointer"
                          style={{ perspective: "1200px", minHeight: "155px" }}
                          onMouseEnter={() => setHoveredScaleCard(idx)}
                          onMouseLeave={() => setHoveredScaleCard(null)}>
                          <div className="w-full h-full transition-transform duration-700 ease-in-out"
                            style={{ transformStyle: "preserve-3d", transform: hoveredScaleCard === idx ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                            <div className="absolute inset-0 border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/20 transition-all duration-500 overflow-hidden"
                              style={{ backfaceVisibility: "hidden" }}>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="text-[9px] text-cyan-400/50 font-mono mb-1">{role.num} &middot; {role.period}</div>
                                  <h4 className="text-base font-bold text-white">{role.title}</h4>
                                  <p className="text-white/40 text-[10px] mt-0.5">{role.loc}</p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">{role.tags.map((t) => <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full border border-cyan-500/20 text-cyan-400/40">{t}</span>)}</div>
                              </div>
                              <p className="text-white/30 text-xs leading-relaxed mt-2">{role.story}</p>
                            </div>
                            <div className="absolute inset-0 border border-cyan-500/20 rounded-xl p-5 bg-cyan-500/[0.04] flex flex-col justify-center overflow-hidden"
                              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                              <div className="flex items-center gap-2.5 mb-3">
                                {role.back.logo && <img src={role.back.logo} alt="" className="w-5 h-5 opacity-60" />}
                                <div className="text-sm font-black text-cyan-400/50 tracking-wider">{role.back.company}</div>
                              </div>
                              <div className="flex gap-6 mb-3">
                                {role.back.metrics.map((m) => (
                                  <div key={m.label}>
                                    <div className="text-xl font-black text-white/80">{m.val}</div>
                                    <div className="text-[8px] text-white/30 font-mono mt-0.5">{m.label}</div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-white/40 text-xs italic leading-relaxed">&ldquo;{role.back.highlight}&rdquo;</p>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="sm:col-span-2 flex flex-col justify-center text-left sm:text-right order-1 sm:order-2">
                    <div className="text-white/30 text-[10px] font-mono mb-4">2000-PRESENT</div>
                    <h3 className="text-[2.5rem] sm:text-[4rem] font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-none mb-6">Scale</h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-8">Enterprise to AI. From managing to measuring to building.</p>
                    <div className="space-y-3">
                      {["94 offices, 100+ stakeholders", "AI platforms, nonprofits, education", "From managing to measuring to building"].map((p) => (
                        <div key={p} className="flex items-center justify-start sm:justify-end gap-3">
                          <span className="text-white/35 text-xs">{p}</span>
                          <div className="w-1 h-1 rounded-full bg-cyan-500/60" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ 7: ARCHITECT — Orbit ═══ */}
            <section className="flex-shrink-0 w-screen h-screen snap-center flex items-center justify-center relative overflow-hidden">
              {/* Desktop orbit */}
              <div className="hidden sm:block relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="text-center max-w-[280px]">
                    {hoveredProduct === null ? (
                      <>
                        <div className="text-white/25 text-[10px] font-mono mb-3">2020-PRESENT</div>
                        <h3 className="text-[3.5rem] font-black bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent leading-none mb-3">Architect</h3>
                        <p className="text-white/25 text-xs">Built the systems I wished existed.</p>
                      </>
                    ) : (
                      <div className="rounded-2xl p-6 pointer-events-auto" style={{ background: "#0d1021", border: `1px solid ${products[hoveredProduct].color}25`, boxShadow: `0 0 40px ${products[hoveredProduct].color}10` }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black"
                            style={{ background: `${products[hoveredProduct].color}15`, border: `1px solid ${products[hoveredProduct].color}30`, color: products[hoveredProduct].color }}>
                            {products[hoveredProduct].icon}
                          </div>
                          <div className="text-left">
                            <h4 className="text-base font-bold text-white">{products[hoveredProduct].title}</h4>
                            <p className="text-[9px]" style={{ color: `${products[hoveredProduct].color}70` }}>{products[hoveredProduct].tag}</p>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-3" style={{ color: `${products[hoveredProduct].color}70` }}>{products[hoveredProduct].stat}</div>
                        <p className="text-xs leading-relaxed mb-4" style={{ color: "#94A3B8" }}>{products[hoveredProduct].desc}</p>
                        <Link href={products[hoveredProduct].href} className="text-[9px] font-mono transition-colors" style={{ color: `${products[hoveredProduct].color}60` }}>EXPLORE &rarr;</Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-[680px] h-[680px] rounded-full border border-white/[0.06]" />
                  <div className="absolute w-[480px] h-[480px] rounded-full border border-white/[0.03]" />
                  <div className="absolute w-[280px] h-[280px] rounded-full border border-white/[0.02]" />
                  <div className="absolute w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)" }} />
                </div>

                {Array.from({ length: 12 }, (_, pi) => {
                  const pa = ((pi / 12) * 360 + orbitAngle * 0.3) * (Math.PI / 180);
                  const pr = 340;
                  return (
                    <div key={`particle-${pi}`} className="absolute pointer-events-none"
                      style={{
                        top: "50%", left: "50%",
                        transform: `translate(calc(-50% + ${Math.cos(pa) * pr}px), calc(-50% + ${Math.sin(pa) * pr}px))`,
                        width: pi % 3 === 0 ? 3 : 1.5, height: pi % 3 === 0 ? 3 : 1.5,
                        borderRadius: "50%",
                        background: `rgba(139,92,246,${0.1 + Math.sin(orbitAngle * 0.02 + pi) * 0.08})`,
                      }} />
                  );
                })}

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {products.map((p, i) => {
                    const a = ((i / products.length) * 360 + orbitAngle) * (Math.PI / 180);
                    const px = 50 + Math.cos(a) * 34;
                    const py = 50 + Math.sin(a) * 34;
                    return (
                      <line key={`line-${i}`} x1="50%" y1="50%" x2={`${px}%`} y2={`${py}%`}
                        stroke={hoveredProduct === i ? `${p.color}25` : "rgba(255,255,255,0.015)"}
                        strokeWidth={hoveredProduct === i ? "0.8" : "0.3"}
                        strokeDasharray={hoveredProduct === i ? "none" : "4 4"}
                        style={{ transition: "all 0.5s ease" }} />
                    );
                  })}
                </svg>

                {products.map((p, i) => {
                  const a = ((i / products.length) * 360 + orbitAngle) * (Math.PI / 180);
                  const r = 340;
                  const x = Math.cos(a) * r;
                  const y = Math.sin(a) * r;
                  const isHovered = hoveredProduct === i;
                  return (
                    <Link key={p.title} href={p.href}
                      onMouseEnter={() => setHoveredProduct(i)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      className="absolute z-30 cursor-pointer"
                      style={{
                        top: "50%", left: "50%",
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${isHovered ? 1.25 : 1})`,
                        transition: "transform 0.4s ease",
                      }}>
                      <div className="relative mx-auto w-16 h-16" style={{ perspective: "200px" }}>
                        <div className="absolute -inset-3 rounded-2xl transition-all duration-700" style={{
                          background: `radial-gradient(circle, ${p.color}${isHovered ? "20" : "0a"}, transparent 70%)`,
                          filter: "blur(10px)",
                        }} />
                        <div className="w-full h-full relative" style={{
                          transformStyle: "preserve-3d",
                          animation: `miniCube${i} ${14 + i * 2}s linear infinite`,
                          animationPlayState: isHovered ? "paused" : "running",
                        }}>
                          {[
                            { transform: "translateZ(28px)" },
                            { transform: "rotateY(180deg) translateZ(28px)" },
                            { transform: "rotateY(90deg) translateZ(28px)" },
                            { transform: "rotateY(-90deg) translateZ(28px)" },
                            { transform: "rotateX(90deg) translateZ(28px)" },
                            { transform: "rotateX(-90deg) translateZ(28px)" },
                          ].map((face, fi) => (
                            <div key={fi} className="absolute inset-0 rounded-lg flex items-center justify-center text-xl font-black transition-all duration-500"
                              style={{
                                transform: face.transform,
                                backfaceVisibility: "hidden",
                                background: `linear-gradient(135deg, ${p.color}${isHovered ? "22" : "12"}, #080b14)`,
                                border: `1px solid ${p.color}${isHovered ? "50" : "28"}`,
                                color: `${p.color}${isHovered ? "ff" : "cc"}`,
                                boxShadow: isHovered ? `inset 0 0 15px ${p.color}15, 0 0 8px ${p.color}10` : `0 0 4px ${p.color}08`,
                              }}>
                              {p.icon}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-center mt-3 whitespace-nowrap">
                        <h4 className="text-sm font-bold transition-colors" style={{ color: isHovered ? "#F1F5F9" : "rgba(255,255,255,0.7)" }}>{p.title}</h4>
                        <p className="text-[10px] transition-colors" style={{ color: isHovered ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.25)" }}>{p.tag}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile product list */}
              <div className="sm:hidden px-6 pt-16 pb-8 w-full overflow-y-auto max-h-screen">
                <div className="text-center mb-8">
                  <div className="text-white/25 text-[10px] font-mono mb-3">2020-PRESENT</div>
                  <h3 className="text-[2.5rem] font-black bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent leading-none mb-3">Architect</h3>
                  <p className="text-white/25 text-xs">Built the systems I wished existed.</p>
                </div>
                <div className="space-y-3">
                  {products.map((p) => (
                    <Link key={p.title} href={p.href}
                      className="flex items-center gap-4 px-4 py-4 rounded-xl transition-all active:scale-[0.98]"
                      style={{ background: "#0d1021", border: `1px solid ${p.color}18` }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${p.color}12, #080b14)`,
                          border: `1px solid ${p.color}30`,
                          color: `${p.color}cc`,
                          boxShadow: `0 0 8px ${p.color}10`,
                        }}>{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>{p.title}</h4>
                        <p className="text-[10px]" style={{ color: `${p.color}60` }}>{p.tag}</p>
                        <p className="text-[10px] mt-1 line-clamp-2" style={{ color: "rgba(255,255,255,0.25)" }}>{p.desc}</p>
                      </div>
                      <span className="text-xl font-black flex-shrink-0" style={{ color: `${p.color}40` }}>{p.stat}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ 8: CONNECT ═══ */}
            <section className="flex-shrink-0 w-screen h-screen snap-center flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                <Image src="/images/brand/globe.png" alt="" width={800} height={800} className="w-[80%] max-w-[800px] object-contain" />
              </div>
              <div className="absolute inset-0">
                {!isMobile && (() => {
                  const current = flightNodes[flightIdx];
                  const next = flightNodes[(flightIdx + 1) % flightNodes.length];
                  const targetX = flightMoving ? next.x : current.x;
                  const targetY = flightMoving ? next.y : current.y;
                  const dur = "3.25s";
                  const ease = "cubic-bezier(0.4,0,0.2,1)";
                  const trans = flightMoving ? `left ${dur} ${ease}, top ${dur} ${ease}` : "none";
                  return (
                    <>
                      {Array.from({ length: 20 }, (_, ti) => {
                        const delay = (ti + 1) * 0.04;
                        const opacity = Math.max(0, 0.5 - ti * 0.025);
                        const size = Math.max(2, 6 - ti * 0.2);
                        return (
                          <div key={`tail-${ti}`} className="absolute pointer-events-none"
                            style={{
                              zIndex: 14,
                              left: `${targetX}%`, top: `${targetY}%`,
                              width: size, height: size, borderRadius: "50%",
                              background: `rgba(139,92,246,${opacity})`,
                              transition: flightMoving ? `left ${dur} ${ease} ${delay}s, top ${dur} ${ease} ${delay}s` : "none",
                              transform: "translate(-50%, -50%)",
                            }} />
                        );
                      })}
                      <div className="absolute pointer-events-none"
                        style={{
                          zIndex: 15,
                          left: `${targetX}%`, top: `${targetY}%`,
                          width: 6, height: 6, borderRadius: "50%",
                          background: "rgba(139,92,246,0.8)",
                          boxShadow: "0 0 8px rgba(139,92,246,0.5), 0 0 20px rgba(139,92,246,0.15)",
                          transition: trans,
                          transform: "translate(-50%, -50%)",
                        }} />
                    </>
                  );
                })()}

                {!isMobile && [
                  { name: "Montana", detail: "Home base. Where it started.", role: "", x: 6, y: 12, size: "2.8rem", op: 0.08 },
                  { name: "Prague", detail: "CEO, Credit Suisse", role: "Built Czech operations from zero", x: 72, y: 8, size: "2.2rem", op: 0.07 },
                  { name: "Singapore", detail: "MD, S&P Global", role: "6-country regional transformation", x: 55, y: 82, size: "2rem", op: 0.07 },
                  { name: "Hong Kong", detail: "MD, Standard & Poor's", role: "SE Asia regional transformation", x: 80, y: 32, size: "1.6rem", op: 0.06 },
                  { name: "Zurich", detail: "Credit Suisse", role: "Global business development", x: 12, y: 72, size: "1.8rem", op: 0.07 },
                  { name: "Bali", detail: "LucidORG", role: "Co-founded with Sasha", x: 88, y: 68, size: "1.5rem", op: 0.06 },
                  { name: "Panama", detail: "Winning by Design", role: "Revenue ops transformation", x: 20, y: 88, size: "1.4rem", op: 0.06 },
                  { name: "Redmond", detail: "Director, Microsoft", role: "100+ stakeholders, global ops", x: 35, y: 5, size: "1.3rem", op: 0.05 },
                  { name: "Bellevue", detail: "Director, T-Mobile", role: "Made alignment measurable", x: 92, y: 48, size: "1.2rem", op: 0.05 },
                  { name: "Bozeman", detail: "Level9", role: "Building StratOS, CommandOS, LinkupOS", x: 42, y: 92, size: "1.2rem", op: 0.05 },
                ].map((place) => (
                  <div key={place.name} className="absolute group/city cursor-default" style={{ left: `${place.x}%`, top: `${place.y}%` }}>
                    <span className="font-black tracking-tight transition-all duration-500 group-hover/city:scale-110 block origin-left"
                      style={{ fontSize: place.size, color: `rgba(255,255,255,${place.op})` }}>
                      <span className="group-hover/city:!text-violet-400 transition-colors duration-500">{place.name}</span>
                    </span>
                    <div className="transition-all duration-500 mt-1 opacity-0 group-hover/city:opacity-100 max-h-0 group-hover/city:max-h-20 overflow-hidden">
                      <span className="block text-[9px] text-violet-400/80 font-semibold">{place.detail}</span>
                      {place.role && <span className="block text-[9px] text-white/30 mt-0.5">{place.role}</span>}
                    </div>
                    <div className="absolute -inset-6 rounded-xl transition-all duration-700 -z-10 blur-xl opacity-0 group-hover/city:opacity-100 bg-violet-400/[0.04] hidden sm:block" />
                  </div>
                ))}
              </div>

              <div className="relative z-10 text-center max-w-2xl px-4 sm:px-8">
                <div className="flex items-center justify-center gap-16 mb-12">
                  {[{ num: "6", label: "continents" }, { num: "60+", label: "countries" }, { num: "30+", label: "years" }].map((s) => (
                    <div key={s.label} className="group cursor-default">
                      <div className="text-3xl font-black text-white/70 group-hover:text-white transition-colors duration-300 mb-1">{s.num}</div>
                      <div className="text-white/30 group-hover:text-white/50 text-[9px] uppercase tracking-wider transition-colors duration-300">{s.label}</div>
                    </div>
                  ))}
                </div>

                <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[0.9] tracking-tight mb-6">
                  <span className="text-white/80 hover:text-white transition-colors duration-500 cursor-default">Organizations should</span><br />
                  <span style={{
                    backgroundImage: isMobile
                      ? "linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(6,182,212,0.8) 50%, rgba(236,72,153,0.7) 100%)"
                      : `radial-gradient(circle 800px at ${mousePos.x}% ${mousePos.y}%, rgba(139,92,246,0.95) 0%, transparent 40%), radial-gradient(circle 600px at ${mousePos.x + 5}% ${mousePos.y - 5}%, rgba(6,182,212,0.8) 0%, transparent 35%), radial-gradient(circle 700px at ${mousePos.x - 3}% ${mousePos.y + 8}%, rgba(236,72,153,0.7) 0%, transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)`,
                    WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>work as beautifully</span><br />
                  <span className="text-white/80 hover:text-white transition-colors duration-500 cursor-default">as the people inside them.</span>
                </h2>

                <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent mx-auto my-8" />

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <Link href="/about" className="text-white/50 hover:text-white/90 text-sm transition-colors border border-white/[0.10] rounded-full px-5 py-3 sm:px-6 sm:py-4 hover:border-white/[0.25]">
                    The Story
                  </Link>
                  <a href="mailto:eric@erichathaway.com" className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-violet-500/25 bg-violet-500/[0.06] hover:bg-violet-500/[0.15] hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/15 transition-all group text-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/80 group-hover:text-white transition-colors">Let&apos;s talk</span>
                  </a>
                  <a href="https://linkedin.com/in/erichathaway1" target="_blank" rel="noopener noreferrer"
                    className="text-white/50 hover:text-white/90 text-sm transition-colors border border-white/[0.10] rounded-full px-6 py-4 hover:border-white/[0.25]">
                    LinkedIn
                  </a>
                </div>
              </div>
            </section>

          </div>

          <style jsx>{`
            div::-webkit-scrollbar { display: none; }
            @keyframes splitFlap {
              0% { transform: perspective(200px) rotateX(0deg); opacity: 1; }
              35% { transform: perspective(200px) rotateX(-90deg); opacity: 0; }
              50% { transform: perspective(200px) rotateX(90deg); opacity: 0; }
              100% { transform: perspective(200px) rotateX(0deg); opacity: 1; }
            }
            @keyframes miniCube0 { 0% { transform: rotateX(-12deg) rotateY(0deg); } 100% { transform: rotateX(-12deg) rotateY(360deg); } }
            @keyframes miniCube1 { 0% { transform: rotateX(-8deg) rotateY(0deg) rotateZ(3deg); } 100% { transform: rotateX(-8deg) rotateY(360deg) rotateZ(3deg); } }
            @keyframes miniCube2 { 0% { transform: rotateX(-15deg) rotateY(0deg) rotateZ(-2deg); } 100% { transform: rotateX(-15deg) rotateY(-360deg) rotateZ(-2deg); } }
            @keyframes miniCube3 { 0% { transform: rotateX(-10deg) rotateY(0deg) rotateZ(5deg); } 100% { transform: rotateX(-10deg) rotateY(360deg) rotateZ(5deg); } }
            @keyframes miniCube4 { 0% { transform: rotateX(-6deg) rotateY(0deg) rotateZ(-3deg); } 100% { transform: rotateX(-6deg) rotateY(-360deg) rotateZ(-3deg); } }
            @keyframes miniCube5 { 0% { transform: rotateX(-11deg) rotateY(0deg) rotateZ(4deg); } 100% { transform: rotateX(-11deg) rotateY(360deg) rotateZ(4deg); } }
          `}</style>
        </div>
      )}
    </>
  );
}

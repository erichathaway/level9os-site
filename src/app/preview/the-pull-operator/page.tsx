"use client";
/**
 * Variation 2: The Pull — Operator
 * Route: /preview/the-pull-operator
 *
 * 8s terminal-style canvas (grid boots up, cube assembles from vertices).
 * Horizontal snap-x panels, 6 panels.
 * Operator-to-operator tone. McKinsey rigor. Dense stat strips per panel.
 * Monospace labels everywhere. Semantic color per panel (StratOS pattern).
 * Dual-glow CTA buttons with 2s pulse.
 * Bleed-from-next, liquid dots, persistent mini-cube.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@level9/brand/components/motion";

const OperatorCanvas = dynamic(
  () => import("./_components/OperatorCanvas"),
  { ssr: false }
);

// Semantic color per panel — StratOS palette
const PANELS = [
  {
    id: "hook",
    color: "#8b5cf6",
    rgb: "139,92,246",
    label: "LEVEL9OS",
    eyebrow: "Operating System",
    headline: "Your first AI operating system. Or your last one.",
    body: "Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you.",
    stats: [
      { value: "74%", label: "of SMBs running AI with zero governance" },
      { value: "$27k", label: "avg annual cost of unaudited AI per team" },
      { value: "0", label: "AI operating systems built for SMB, until now" },
    ],
    cta: null,
  },
  {
    id: "problem",
    color: "#ef4444",
    rgb: "239,68,68",
    label: "THE PROBLEM",
    eyebrow: "Problem Statement",
    headline: "You are already running AI. No one is watching it.",
    body: "Every prompt you send. Ungoverned. Every agent you deploy. Unmeasured. Every document you generate. Untrusted. That is an operating problem.",
    stats: [
      { value: "3.2x", label: "higher error rate in ungoverned AI outputs" },
      { value: "18 days", label: "avg time to detect a governance failure" },
      { value: "61%", label: "of AI decisions made without human review" },
    ],
    cta: null,
  },
  {
    id: "product",
    color: "#6366f1",
    rgb: "99,102,241",
    label: "THE PRODUCT",
    eyebrow: "Product Architecture",
    headline: "Six tools. One operating layer. No lock-in.",
    body: "StratOS deliberates. CommandOS coordinates. OutboundOS executes. LucidORG measures. COO Playbook installs the methodology. MAX runs the content.",
    stats: [
      { value: "6", label: "integrated operating tools" },
      { value: "8", label: "operating layers in the full stack" },
      { value: "30d", label: "avg time to full deployment" },
    ],
    cta: null,
  },
  {
    id: "vault",
    color: "#ef4444",
    rgb: "239,68,68",
    label: "THE VAULT",
    eyebrow: "Governance Infrastructure",
    headline: "48 domain officers. 3 governance gates. One audit trail.",
    body: "Every decision flagged before it ships. Every agent output logged and traceable. This is not a compliance checkbox. It is how you survive the audit your clients have not sent yet.",
    stats: [
      { value: "48", label: "specialized domain officer agents" },
      { value: "3", label: "mandatory governance gates per decision" },
      { value: "100%", label: "decisions logged with full attribution" },
    ],
    cta: null,
  },
  {
    id: "library",
    color: "#06b6d4",
    rgb: "6,182,212",
    label: "INTELLIGENCE LIBRARY",
    eyebrow: "Pod Architecture",
    headline: "Purpose-built pods. Not a platform you customize forever.",
    body: "StratOS for decisions. CommandOS for coordination. LinkUpOS, ABM Engine, AutoCS for execution. LucidORG for measurement. Each pod ships in days, not quarters.",
    stats: [
      { value: "5+", label: "execution pods available at launch" },
      { value: "Days", label: "not quarters, to deploy each pod" },
      { value: "Exit", label: "anytime if the math changes" },
    ],
    cta: null,
  },
  {
    id: "start",
    color: "#8b5cf6",
    rgb: "139,92,246",
    label: "START HERE",
    eyebrow: "Next Step",
    headline: "Book a 30-minute session. See the whole stack live.",
    body: "No slides. No decks. We run the system in the call. You leave knowing exactly what would change in your business if you installed it.",
    stats: [
      { value: "30min", label: "live system demonstration" },
      { value: "0", label: "slide decks. zero." },
      { value: "1", label: "decision you need to make after the call" },
    ],
    cta: "Book a session",
  },
];

function MiniCube({ rotation, color }: { rotation: number; color: string }) {
  return (
    <svg
      width="44" height="44" viewBox="0 0 44 44" fill="none"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <rect x="12" y="12" width="18" height="18" stroke={color} strokeWidth="1.5" strokeOpacity="0.9" fill="none" />
      <rect x="5" y="5" width="18" height="18" stroke={color} strokeWidth="1" strokeOpacity="0.3" fill="none" />
      <line x1="5" y1="5" x2="12" y2="12" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="23" y1="5" x2="30" y2="12" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="5" y1="23" x2="12" y2="30" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="23" y1="23" x2="30" y2="30" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  );
}

export default function ThePullOperator() {
  const [splashDone, setSplashDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleComplete = useCallback(() => setSplashDone(true), []);
  const handleSkip = useCallback(() => { setSplashDone(true); setShowSkip(false); }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActivePanel(Math.max(0, Math.min(idx, PANELS.length - 1)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [splashDone]);

  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  const panel = PANELS[activePanel];
  const cubeRotation = activePanel * 10;

  return (
    <div className="po-root" style={{ "--panel-color": panel.color, "--panel-rgb": panel.rgb } as React.CSSProperties}>
      <style>{`
        .po-root {
          background: #030306;
          color: rgba(255,255,255,0.92);
          font-family: var(--font-inter), system-ui, sans-serif;
          height: 100dvh;
          overflow: hidden;
          position: relative;
        }
        /* Splash */
        .po-splash {
          position: fixed; inset: 0; z-index: 50;
          transition: opacity 1.2s ease;
        }
        .po-splash.done { opacity: 0; pointer-events: none; }
        /* Skip */
        .po-skip {
          position: fixed; bottom: 2.5rem; right: 2.5rem; z-index: 200;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); background: transparent;
          border: 1px solid rgba(255,255,255,0.12); border-radius: 4px;
          padding: 0.5rem 1rem; cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          animation: skip-in 0.5s ease forwards;
        }
        @keyframes skip-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .po-skip:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.25); }
        /* Cube header */
        .po-cube {
          position: fixed; top: 1.25rem; left: 1.5rem; z-index: 100;
          opacity: 0; transition: opacity 0.8s ease 0.5s; pointer-events: none;
        }
        .po-cube.visible { opacity: 1; }
        /* Panel label strip top */
        .po-label-strip {
          position: fixed; top: 1.25rem; left: 50%; transform: translateX(-50%);
          z-index: 100; font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--panel-color); opacity: 0;
          transition: opacity 0.8s ease 0.5s, color 0.4s ease;
          display: flex; align-items: center; gap: 0.75rem;
        }
        .po-label-strip.visible { opacity: 1; }
        .po-label-strip::before, .po-label-strip::after {
          content: ""; display: inline-block; width: 20px; height: 1px;
          background: var(--panel-color); opacity: 0.5;
          transition: background 0.4s ease;
        }
        /* Counter */
        .po-counter {
          position: fixed; top: 1.25rem; right: 2rem; z-index: 100;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem; letter-spacing: 0.12em;
          color: rgba(255,255,255,0.2); opacity: 0;
          transition: opacity 0.8s ease 0.5s;
        }
        .po-counter.visible { opacity: 1; }
        /* Scroll container */
        .po-scroll {
          display: flex; height: 100dvh;
          overflow-x: auto; overflow-y: hidden;
          scroll-snap-type: x mandatory; scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .po-scroll::-webkit-scrollbar { display: none; }
        /* Panel */
        .po-panel {
          min-width: calc(100vw - 36px);
          width: calc(100vw - 36px);
          height: 100dvh; scroll-snap-align: start;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .po-panel:last-child { min-width: 100vw; width: 100vw; }
        /* Bleed */
        .po-bleed {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 36px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px; opacity: 0.25;
        }
        .po-bleed-line { width: 1px; height: 20px; background: rgba(255,255,255,0.4); }
        .po-bleed-arrow { font-size: 0.65rem; color: rgba(255,255,255,0.5); }
        /* Panel inner */
        .po-inner {
          max-width: 720px; width: 88%;
          display: flex; flex-direction: column; gap: 1.5rem;
          position: relative; z-index: 2;
        }
        /* Eyebrow */
        .po-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.64rem; letter-spacing: 0.2em; text-transform: uppercase;
          display: flex; align-items: center; gap: 0.6rem;
          transition: color 0.4s ease;
        }
        .po-eyebrow-dot {
          width: 4px; height: 4px; border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
        /* Headline */
        .po-headline {
          font-size: clamp(1.9rem, 4vw, 3.75rem);
          font-weight: 900; line-height: 1.07; letter-spacing: -0.03em; margin: 0;
          color: rgba(255,255,255,0.94);
        }
        /* Body */
        .po-body {
          font-size: clamp(0.92rem, 1.4vw, 1.05rem); line-height: 1.7;
          color: rgba(255,255,255,0.55); max-width: 52ch; margin: 0;
        }
        /* Stat strip */
        .po-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0; border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 1.25rem 0;
        }
        .po-stat {
          display: flex; flex-direction: column; gap: 0.35rem;
          padding: 0 1rem;
        }
        .po-stat + .po-stat {
          border-left: 1px solid rgba(255,255,255,0.08);
        }
        .po-stat-val {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 700; letter-spacing: -0.02em; line-height: 1;
          transition: color 0.4s ease;
        }
        .po-stat-label {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.38); line-height: 1.4;
        }
        /* Dual-glow CTA */
        .po-cta {
          padding: 0.875rem 2.25rem;
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.82rem; letter-spacing: 0.1em; text-transform: uppercase;
          font-weight: 600; text-decoration: none;
          color: rgba(255,255,255,0.92);
          width: fit-content;
          display: inline-block;
          transition: box-shadow 0.3s ease, background 0.3s ease;
          animation: cta-pulse 2s ease-in-out infinite;
        }
        @keyframes cta-pulse {
          0%,100% { box-shadow: 0 0 16px rgba(var(--panel-rgb),0.35), 0 0 4px rgba(var(--panel-rgb),0.2); }
          50% { box-shadow: 0 0 32px rgba(var(--panel-rgb),0.55), 0 0 12px rgba(var(--panel-rgb),0.35); }
        }
        .po-swipe-hint {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.25); display: flex; align-items: center; gap: 0.5rem;
          animation: swipe-r 2s ease-in-out infinite;
        }
        @keyframes swipe-r { 0%,100%{ transform:translateX(0); } 50%{ transform:translateX(5px); } }
        /* Progress dots */
        .po-dots {
          position: fixed; bottom: 1.75rem; left: 50%; transform: translateX(-50%);
          display: flex; gap: 6px; z-index: 100;
          opacity: 0; transition: opacity 0.8s ease 0.5s;
        }
        .po-dots.visible { opacity: 1; }
        .po-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,0.15); border: none; padding: 0;
          cursor: pointer; transition: background 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
        }
        .po-dot.active {
          background: var(--panel-color);
          transform: scale(1.5);
          box-shadow: 0 0 8px rgba(var(--panel-rgb),0.7);
        }
        @media (max-width: 640px) {
          .po-stats { grid-template-columns: repeat(3,1fr); }
          .po-stat { padding: 0 0.5rem; }
          .po-headline { font-size: clamp(1.6rem,7vw,2.5rem); }
        }
      `}</style>

      {/* Canvas Splash */}
      <div className={`po-splash ${splashDone ? "done" : ""}`}>
        <OperatorCanvas onComplete={handleComplete} />
      </div>

      {/* Skip */}
      {showSkip && !splashDone && (
        <button className="po-skip" onClick={handleSkip}>Skip intro</button>
      )}

      {/* Mini cube */}
      <div className={`po-cube ${splashDone ? "visible" : ""}`}>
        <MiniCube rotation={cubeRotation} color={panel.color} />
      </div>

      {/* Label strip */}
      <div className={`po-label-strip ${splashDone ? "visible" : ""}`} style={{ color: panel.color }}>
        {panel.label}
      </div>

      {/* Counter */}
      <div className={`po-counter ${splashDone ? "visible" : ""}`}>
        {String(activePanel + 1).padStart(2, "0")} / 06
      </div>

      {/* Progress dots */}
      <div className={`po-dots ${splashDone ? "visible" : ""}`}>
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            className={`po-dot ${i === activePanel ? "active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Panel ${i + 1}`}
          />
        ))}
      </div>

      {/* Panels */}
      {splashDone && (
        <div ref={scrollRef} className="po-scroll">
          {PANELS.map((p, i) => (
            <div
              key={p.id}
              className="po-panel"
              style={{ "--panel-color": p.color, "--panel-rgb": p.rgb } as React.CSSProperties}
            >
              {/* Mesh */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: `radial-gradient(ellipse 700px 500px at 30% 50%, rgba(${p.rgb},0.07) 0%, transparent 70%)`,
              }} />

              <div className="po-inner">
                <FadeIn>
                  <div className="po-eyebrow" style={{ color: p.color }}>
                    <div className="po-eyebrow-dot" style={{ background: p.color }} />
                    {p.eyebrow}
                  </div>
                </FadeIn>
                <FadeIn delay={0.06}>
                  <h2 className="po-headline">{p.headline}</h2>
                </FadeIn>
                <FadeIn delay={0.12}>
                  <p className="po-body">{p.body}</p>
                </FadeIn>
                <FadeIn delay={0.18}>
                  <div className="po-stats">
                    {p.stats.map((s) => (
                      <div key={s.label} className="po-stat">
                        <div className="po-stat-val" style={{ color: p.color }}>{s.value}</div>
                        <div className="po-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </FadeIn>
                {p.cta && (
                  <FadeIn delay={0.24}>
                    <a
                      href="#"
                      className="po-cta"
                      style={{
                        background: `rgba(${p.rgb},0.12)`,
                        border: `1px solid rgba(${p.rgb},0.4)`,
                      }}
                    >
                      {p.cta}
                    </a>
                  </FadeIn>
                )}
                {i === 0 && (
                  <FadeIn delay={0.5}>
                    <div className="po-swipe-hint">
                      <span>&#8594;</span> Swipe to continue
                    </div>
                  </FadeIn>
                )}
              </div>

              {/* Bleed */}
              {i < PANELS.length - 1 && (
                <div className="po-bleed">
                  <div className="po-bleed-line" />
                  <span className="po-bleed-arrow">&#8250;</span>
                  <div className="po-bleed-line" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

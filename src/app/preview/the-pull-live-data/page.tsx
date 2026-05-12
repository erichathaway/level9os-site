"use client";
/**
 * Variation 5: The Pull — Live Data
 * Route: /preview/the-pull-live-data
 *
 * 10s canvas splash (same as reference).
 * Horizontal snap-x, 6 panels.
 * Panel 4 is the interactive comparison widget (Claude / GPT / Gemini).
 * Proof-driven tone. The product demos itself mid-pitch.
 * Bleed-from-next, liquid dots, persistent mini-cube.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@level9/brand/components/motion";
import { MagneticCard } from "@level9/brand/components/motion";

const ParticleCubeCanvas = dynamic(
  () => import("../operating-room/_components/ParticleCubeCanvas"),
  { ssr: false }
);

const ComparisonWidget = dynamic(
  () => import("./_components/ComparisonWidget"),
  { ssr: false }
);

const PANELS = [
  {
    id: "hook",
    type: "content" as const,
    color: "#8b5cf6",
    rgb: "139,92,246",
    eyebrow: "Level9OS",
    headline: "Your first AI operating system. Or your last one.",
    body: "Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you.",
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 25% 55%, rgba(139,92,246,0.09) 0%, transparent 70%)",
  },
  {
    id: "problem",
    type: "content" as const,
    color: "#ef4444",
    rgb: "239,68,68",
    eyebrow: "The Problem",
    headline: "You are already running AI. No one is watching it.",
    body: "Every prompt you send. Ungoverned. Every agent you deploy. Unmeasured. Every document you generate. Untrusted. That is an operating problem, and it has a cost.",
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 60% 45%, rgba(239,68,68,0.08) 0%, transparent 70%)",
  },
  {
    id: "product",
    type: "content" as const,
    color: "#6366f1",
    rgb: "99,102,241",
    eyebrow: "The Product",
    headline: "Six tools. One operating layer. No lock-in.",
    body: "StratOS deliberates. CommandOS coordinates. OutboundOS executes. LucidORG measures. COO Playbook installs the methodology. MAX runs the content.",
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 40% 55%, rgba(99,102,241,0.09) 0%, transparent 70%)",
  },
  {
    id: "vault",
    type: "widget" as const,
    color: "#8b5cf6",
    rgb: "139,92,246",
    eyebrow: "The Comparison",
    headline: "Not all models are equal. The governance layer picks the right one.",
    body: null,
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 50% 50%, rgba(139,92,246,0.07) 0%, transparent 70%), radial-gradient(ellipse 400px 400px at 80% 20%, rgba(6,182,212,0.04) 0%, transparent 60%)",
  },
  {
    id: "library",
    type: "content" as const,
    color: "#06b6d4",
    rgb: "6,182,212",
    eyebrow: "Intelligence Library",
    headline: "Purpose-built pods. Not a platform you customize forever.",
    body: "StratOS for decisions. CommandOS for coordination. LinkUpOS, ABM Engine, AutoCS for execution. LucidORG for measurement. Each pod ships in days, not quarters.",
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 30% 60%, rgba(6,182,212,0.09) 0%, transparent 70%)",
  },
  {
    id: "start",
    type: "content" as const,
    color: "#8b5cf6",
    rgb: "139,92,246",
    eyebrow: "Start Here",
    headline: "Book a 30-minute session. See the whole stack live.",
    body: "No slides. No decks. We run the system in the call. You leave knowing exactly what would change in your business if you installed it.",
    cta: "Book a session",
    mesh: "radial-gradient(ellipse 800px 600px at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%)",
  },
];

function MiniCube({ rotation, color }: { rotation: number; color: string }) {
  return (
    <svg
      width="46" height="46" viewBox="0 0 46 46" fill="none"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1)",
        filter: `drop-shadow(0 0 5px ${color}55)`,
      }}
    >
      <rect x="13" y="13" width="20" height="20" stroke={color} strokeWidth="1.5" strokeOpacity="0.85" fill="none" />
      <rect x="5" y="5" width="20" height="20" stroke={color} strokeWidth="1" strokeOpacity="0.3" fill="none" />
      <line x1="5" y1="5" x2="13" y2="13" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="25" y1="5" x2="33" y2="13" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="5" y1="25" x2="13" y2="33" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="25" y1="25" x2="33" y2="33" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  );
}

export default function ThePullLiveData() {
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
  const cubeRotation = activePanel * 11;

  return (
    <div className="ld-root">
      <style>{`
        .ld-root {
          background: #030306;
          color: rgba(255,255,255,0.92);
          font-family: var(--font-inter), system-ui, sans-serif;
          height: 100dvh;
          overflow: hidden;
          position: relative;
        }
        .ld-splash {
          position: fixed; inset: 0; z-index: 50;
          transition: opacity 1.5s ease;
        }
        .ld-splash.done { opacity: 0; pointer-events: none; }
        .ld-skip {
          position: fixed; bottom: 2.5rem; right: 2.5rem; z-index: 200;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); background: transparent;
          border: 1px solid rgba(255,255,255,0.12); border-radius: 6px;
          padding: 0.5rem 1rem; cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          animation: skip-in 0.5s ease forwards;
        }
        @keyframes skip-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .ld-skip:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.25); }
        /* Cube top-left */
        .ld-cube {
          position: fixed; top: 1.25rem; left: 1.5rem; z-index: 100;
          opacity: 0; transition: opacity 0.8s ease 0.5s; pointer-events: none;
        }
        .ld-cube.visible { opacity: 1; }
        /* Counter */
        .ld-counter {
          position: fixed; top: 1.5rem; right: 2rem; z-index: 100;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.22); opacity: 0;
          transition: opacity 0.8s ease 0.5s;
        }
        .ld-counter.visible { opacity: 1; }
        /* Scroll */
        .ld-scroll {
          display: flex; height: 100dvh;
          overflow-x: auto; overflow-y: hidden;
          scroll-snap-type: x mandatory; scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .ld-scroll::-webkit-scrollbar { display: none; }
        /* Panel */
        .ld-panel {
          min-width: calc(100vw - 36px);
          width: calc(100vw - 36px);
          height: 100dvh; scroll-snap-align: start;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .ld-panel:last-child { min-width: 100vw; width: 100vw; }
        /* Bleed */
        .ld-bleed {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 36px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px; opacity: 0.25;
        }
        .ld-bleed-line { width: 1px; height: 20px; background: rgba(255,255,255,0.4); }
        .ld-bleed-arrow { font-size: 0.65rem; color: rgba(255,255,255,0.5); }
        /* Content panel inner */
        .ld-inner {
          max-width: 680px; width: 88%;
          display: flex; flex-direction: column; gap: 1.75rem;
          position: relative; z-index: 2;
        }
        /* Widget panel inner */
        .ld-widget-inner {
          max-width: 760px; width: 92%;
          display: flex; flex-direction: column; gap: 1.5rem;
          position: relative; z-index: 2;
        }
        .ld-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.66rem; letter-spacing: 0.18em; text-transform: uppercase;
          display: flex; align-items: center; gap: 0.75rem;
        }
        .ld-eyebrow::before {
          content: ""; display: inline-block; width: 22px; height: 1px; opacity: 0.6;
        }
        .ld-headline {
          font-size: clamp(2.2rem, 5vw, 4.75rem);
          font-weight: 900; line-height: 1.06; letter-spacing: -0.035em; margin: 0;
          color: rgba(255,255,255,0.94);
        }
        /* Widget headline smaller */
        .ld-widget-headline {
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          font-weight: 900; line-height: 1.1; letter-spacing: -0.03em; margin: 0;
          color: rgba(255,255,255,0.94);
        }
        .ld-body {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem); line-height: 1.72;
          color: rgba(255,255,255,0.58); max-width: 52ch; margin: 0;
        }
        .ld-cta {
          padding: 0.9rem 2.5rem; border-radius: 8px;
          color: rgba(255,255,255,0.92); font-weight: 700; font-size: 0.95rem;
          text-decoration: none; width: fit-content; display: inline-block;
          transition: box-shadow 0.25s ease, background 0.25s ease;
        }
        .ld-cta:hover { filter: brightness(1.1); }
        .ld-swipe-hint {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.63rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.28); animation: swipe-r 2s ease-in-out infinite;
        }
        @keyframes swipe-r { 0%,100%{ transform:translateX(0); } 50%{ transform:translateX(5px); } }
        /* Live data badge on widget panel */
        .ld-live-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: #10b981; padding: 0.25rem 0.6rem;
          border: 1px solid rgba(16,185,129,0.35); border-radius: 4px;
          background: rgba(16,185,129,0.08); width: fit-content;
        }
        .ld-live-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #10b981;
          animation: live-pulse 1.5s ease-in-out infinite;
        }
        @keyframes live-pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }
        /* Progress dots */
        .ld-dots {
          position: fixed; bottom: 1.75rem; left: 50%; transform: translateX(-50%);
          display: flex; gap: 6px; z-index: 100;
          opacity: 0; transition: opacity 0.8s ease 0.5s;
        }
        .ld-dots.visible { opacity: 1; }
        .ld-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.15); border: none; padding: 0;
          cursor: pointer; transition: background 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
        }
        .ld-dot.active {
          background: var(--ld-dot-color, #8b5cf6);
          transform: scale(1.45);
          box-shadow: 0 0 10px var(--ld-dot-color, rgba(139,92,246,0.7));
        }
        /* Widget panel: dot is cyan-tinted */
        .ld-dot.widget-active {
          background: #8b5cf6;
          transform: scale(1.6);
          box-shadow: 0 0 14px rgba(139,92,246,0.8), 0 0 4px rgba(6,182,212,0.4);
        }
        @media (max-width: 640px) {
          .ld-widget-inner { width: 96%; }
          .ld-headline { font-size: clamp(1.9rem, 7vw, 3rem); }
          .ld-widget-headline { font-size: clamp(1.3rem, 5vw, 2rem); }
        }
      `}</style>

      {/* Canvas Splash */}
      <div className={`ld-splash ${splashDone ? "done" : ""}`}>
        <ParticleCubeCanvas onComplete={handleComplete} />
      </div>

      {/* Skip */}
      {showSkip && !splashDone && (
        <button className="ld-skip" onClick={handleSkip}>Skip intro</button>
      )}

      {/* Mini cube */}
      <div className={`ld-cube ${splashDone ? "visible" : ""}`}>
        <MiniCube rotation={cubeRotation} color={panel.color} />
      </div>

      {/* Counter */}
      <div className={`ld-counter ${splashDone ? "visible" : ""}`}>
        {String(activePanel + 1).padStart(2, "0")} / 06
      </div>

      {/* Progress dots */}
      <div className={`ld-dots ${splashDone ? "visible" : ""}`}>
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            className={`ld-dot ${i === activePanel ? (p.type === "widget" ? "widget-active" : "active") : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Panel ${i + 1}`}
            style={{ "--ld-dot-color": p.color } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Panels */}
      {splashDone && (
        <div ref={scrollRef} className="ld-scroll">
          {PANELS.map((p, i) => (
            <div key={p.id} className="ld-panel">
              {/* Mesh */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: p.mesh,
              }} />

              {p.type === "widget" ? (
                /* Widget panel — comparison centerpiece */
                <div className="ld-widget-inner">
                  <FadeIn>
                    <div className="ld-eyebrow" style={{ color: p.color, "--eyebrow-color": p.color } as React.CSSProperties}>
                      <style>{`.ld-eyebrow::before { background: ${p.color}; }`}</style>
                      {p.eyebrow}
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.06}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                      <h2 className="ld-widget-headline">{p.headline}</h2>
                      <div className="ld-live-badge">
                        <div className="ld-live-dot" />
                        Static · Real data coming
                      </div>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.14}>
                    <MagneticCard glowColor="rgba(139,92,246,0.08)" maxTilt={2}>
                      <ComparisonWidget />
                    </MagneticCard>
                  </FadeIn>
                </div>
              ) : (
                /* Standard content panel */
                <div className="ld-inner">
                  <FadeIn>
                    <div className="ld-eyebrow" style={{ color: p.color }}>
                      <style>{`.ld-eyebrow::before { background: ${p.color}; }`}</style>
                      {p.eyebrow}
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.08}>
                    <h2 className="ld-headline">{p.headline}</h2>
                  </FadeIn>
                  {p.body && (
                    <FadeIn delay={0.16}>
                      <p className="ld-body">{p.body}</p>
                    </FadeIn>
                  )}
                  {p.cta && (
                    <FadeIn delay={0.24}>
                      <a
                        href="#"
                        className="ld-cta"
                        style={{
                          background: `rgba(${p.rgb},0.15)`,
                          border: `1px solid rgba(${p.rgb},0.45)`,
                          boxShadow: `0 0 24px rgba(${p.rgb},0.3)`,
                        }}
                      >
                        {p.cta}
                      </a>
                    </FadeIn>
                  )}
                  {i === 0 && (
                    <FadeIn delay={0.5}>
                      <div className="ld-swipe-hint">
                        <span>&#8594;</span> Swipe to continue
                      </div>
                    </FadeIn>
                  )}
                </div>
              )}

              {/* Bleed */}
              {i < PANELS.length - 1 && (
                <div className="ld-bleed">
                  <div className="ld-bleed-line" />
                  <span className="ld-bleed-arrow">&#8250;</span>
                  <div className="ld-bleed-line" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
/**
 * Variation 1: The Pull — Cinematic
 * Route: /preview/the-pull-cinematic
 *
 * Full 12s particle-to-cube canvas splash.
 * Horizontal snap-x panels (6 panels).
 * Aurora text gradient on every panel headline.
 * Mesh gradient overlays. Bleed-from-next edge reveal.
 * Persistent rotating mini-cube in top-left.
 * Liquid progress dots.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@level9/brand/components/motion";
const CinematicCanvas = dynamic(
  () => import("./_components/CinematicCanvas"),
  { ssr: false }
);

const PANELS = [
  {
    id: "hook",
    eyebrow: "Level9OS",
    headline: "Your first AI operating system. Or your last one.",
    body: "Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you.",
    cta: null,
    mesh: "radial-gradient(ellipse 800px 600px at 20% 60%, rgba(139,92,246,0.1) 0%, transparent 70%), radial-gradient(ellipse 600px 400px at 80% 30%, rgba(236,72,153,0.06) 0%, transparent 70%)",
  },
  {
    id: "problem",
    eyebrow: "The Problem",
    headline: "You are already running AI. No one is watching it.",
    body: "Every prompt you send. Ungoverned. Every agent you deploy. Unmeasured. Every document you generate. Untrusted. That is not a vendor problem. That is an operating problem.",
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 30% 50%, rgba(239,68,68,0.08) 0%, transparent 70%), radial-gradient(ellipse 500px 400px at 70% 70%, rgba(139,92,246,0.05) 0%, transparent 70%)",
  },
  {
    id: "product",
    eyebrow: "The Product",
    headline: "Six tools. One operating layer. No lock-in.",
    body: "StratOS deliberates. CommandOS coordinates. OutboundOS executes. LucidORG measures. COO Playbook installs the methodology. MAX runs the content. All connected. All yours to exit if the math changes.",
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 60% 40%, rgba(99,102,241,0.09) 0%, transparent 70%), radial-gradient(ellipse 500px 400px at 20% 70%, rgba(6,182,212,0.05) 0%, transparent 70%)",
  },
  {
    id: "vault",
    eyebrow: "The Vault",
    headline: "48 domain officers. 3 governance gates. One audit trail.",
    body: "Every decision flagged before it ships. Every agent output logged and traceable. This is not a compliance checkbox. It is how you survive the audit your clients have not sent yet.",
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 40% 55%, rgba(139,92,246,0.1) 0%, transparent 70%), radial-gradient(ellipse 400px 400px at 80% 20%, rgba(239,68,68,0.06) 0%, transparent 70%)",
  },
  {
    id: "library",
    eyebrow: "Intelligence Library",
    headline: "Purpose-built pods. Not a platform you customize forever.",
    body: "StratOS for decisions. CommandOS for coordination. LinkUpOS, ABM Engine, AutoCS for execution. LucidORG for measurement. Each pod ships in days, not quarters.",
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 50% 40%, rgba(6,182,212,0.09) 0%, transparent 70%), radial-gradient(ellipse 500px 400px at 20% 70%, rgba(99,102,241,0.05) 0%, transparent 70%)",
  },
  {
    id: "start",
    eyebrow: "Start Here",
    headline: "Book a 30-minute session. See the whole stack live.",
    body: "No slides. No decks. We run the system in the call. You leave knowing exactly what would change in your business if you installed it.",
    cta: "Book a session",
    mesh: "radial-gradient(ellipse 800px 600px at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%), radial-gradient(ellipse 500px 400px at 20% 20%, rgba(6,182,212,0.05) 0%, transparent 70%)",
  },
];

// Mini cube SVG — rotates per panel
function MiniCube({ rotation }: { rotation: number }) {
  return (
    <svg
      width="48" height="48" viewBox="0 0 48 48" fill="none"
      style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
    >
      <rect x="14" y="14" width="20" height="20" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5" fill="none" />
      <rect x="6" y="6" width="20" height="20" stroke="rgba(139,92,246,0.35)" strokeWidth="1" fill="none" />
      <line x1="6" y1="6" x2="14" y2="14" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
      <line x1="26" y1="6" x2="34" y2="14" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
      <line x1="6" y1="26" x2="14" y2="34" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
      <line x1="26" y1="26" x2="34" y2="34" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
    </svg>
  );
}

export default function ThePullCinematic() {
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

  const cubeRotation = activePanel * 13;

  return (
    <div className="pc-root">
      <style>{`
        @property --aurora-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        .pc-root {
          background: #030306;
          color: rgba(255,255,255,0.92);
          font-family: var(--font-inter), system-ui, sans-serif;
          height: 100dvh;
          overflow: hidden;
          position: relative;
        }
        /* Splash */
        .pc-splash {
          position: fixed;
          inset: 0;
          z-index: 50;
          transition: opacity 1.5s ease;
        }
        .pc-splash.done {
          opacity: 0;
          pointer-events: none;
        }
        /* Skip */
        .pc-skip {
          position: fixed;
          bottom: 2.5rem;
          right: 2.5rem;
          z-index: 200;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease;
          animation: skip-in 0.5s ease forwards;
        }
        @keyframes skip-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .pc-skip:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.25); }
        /* Mini cube top-left */
        .pc-cube-header {
          position: fixed;
          top: 1.5rem;
          left: 1.5rem;
          z-index: 100;
          opacity: 0;
          transition: opacity 0.8s ease 0.5s;
          pointer-events: none;
        }
        .pc-cube-header.visible { opacity: 1; }
        /* Panel counter */
        .pc-counter {
          position: fixed;
          top: 1.75rem;
          right: 2rem;
          z-index: 100;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.25);
          opacity: 0;
          transition: opacity 0.8s ease 0.5s;
        }
        .pc-counter.visible { opacity: 1; }
        /* Scroll container */
        .pc-scroll {
          display: flex;
          height: 100dvh;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .pc-scroll::-webkit-scrollbar { display: none; }
        /* Panel */
        .pc-panel {
          min-width: calc(100vw - 40px);
          width: calc(100vw - 40px);
          height: 100dvh;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        /* Last panel is full width (no bleed) */
        .pc-panel:last-child {
          min-width: 100vw;
          width: 100vw;
        }
        /* Bleed strip — right edge peek of next panel content */
        .pc-bleed {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          opacity: 0.3;
        }
        .pc-bleed-line {
          width: 1px;
          height: 24px;
          background: rgba(139,92,246,0.6);
        }
        .pc-bleed-arrow {
          font-size: 0.7rem;
          color: rgba(139,92,246,0.8);
        }
        .pc-panel-inner {
          max-width: 680px;
          width: 88%;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          position: relative;
          z-index: 2;
        }
        .pc-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(139,92,246,0.85);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .pc-eyebrow::before {
          content: "";
          display: inline-block;
          width: 24px;
          height: 1px;
          background: rgba(139,92,246,0.6);
        }
        /* Aurora headline */
        .pc-headline {
          font-size: clamp(2.5rem, 6vw, 5.5rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.035em;
          margin: 0;
          background: linear-gradient(
            var(--aurora-angle),
            #8b5cf6 0%,
            #c084fc 25%,
            #06b6d4 50%,
            #ec4899 75%,
            #8b5cf6 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: aurora-sweep 8s linear infinite;
        }
        @keyframes aurora-sweep {
          to { --aurora-angle: 360deg; }
        }
        .pc-body {
          font-size: clamp(1rem, 1.6vw, 1.15rem);
          line-height: 1.72;
          color: rgba(255,255,255,0.6);
          max-width: 52ch;
          margin: 0;
        }
        .pc-cta-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .pc-cta {
          padding: 0.9rem 2.5rem;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.5);
          border-radius: 8px;
          color: rgba(255,255,255,0.92);
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          transition: background 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 0 0 0 rgba(139,92,246,0.3);
        }
        .pc-cta:hover {
          background: rgba(139,92,246,0.25);
          box-shadow: 0 0 32px rgba(139,92,246,0.4), 0 0 8px rgba(139,92,246,0.2);
        }
        .pc-swipe-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.63rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          animation: swipe-pulse 2s ease-in-out infinite;
        }
        @keyframes swipe-pulse { 0%,100%{ transform:translateX(0); } 50%{ transform:translateX(6px); } }
        /* Progress dots */
        .pc-dots {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 100;
          opacity: 0;
          transition: opacity 0.8s ease 0.5s;
        }
        .pc-dots.visible { opacity: 1; }
        .pc-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
        }
        .pc-dot.active {
          background: #8b5cf6;
          transform: scale(1.4);
          box-shadow: 0 0 10px rgba(139,92,246,0.7);
        }
        @media (max-width: 640px) {
          .pc-panel { min-width: calc(100vw - 20px); width: calc(100vw - 20px); }
          .pc-headline { font-size: clamp(2rem, 8vw, 3.5rem); }
        }
      `}</style>

      {/* Canvas Splash */}
      <div className={`pc-splash ${splashDone ? "done" : ""}`}>
        <CinematicCanvas onComplete={handleComplete} />
      </div>

      {/* Skip */}
      {showSkip && !splashDone && (
        <button className="pc-skip" onClick={handleSkip}>Skip intro</button>
      )}

      {/* Mini cube header */}
      <div className={`pc-cube-header ${splashDone ? "visible" : ""}`}>
        <MiniCube rotation={cubeRotation} />
      </div>

      {/* Panel counter */}
      <div className={`pc-counter ${splashDone ? "visible" : ""}`}>
        {String(activePanel + 1).padStart(2, "0")} / 06
      </div>

      {/* Progress dots */}
      <div className={`pc-dots ${splashDone ? "visible" : ""}`}>
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            className={`pc-dot ${i === activePanel ? "active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Panel ${i + 1}`}
          />
        ))}
      </div>

      {/* Panels */}
      {splashDone && (
        <div ref={scrollRef} className="pc-scroll">
          {PANELS.map((p, i) => (
            <div key={p.id} className="pc-panel">
              {/* Mesh gradient */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: p.mesh,
              }} />

              <div className="pc-panel-inner">
                <FadeIn key={`${p.id}-content`}>
                  <div className="pc-eyebrow">{p.eyebrow}</div>
                </FadeIn>
                <FadeIn delay={0.08}>
                  <h2 className="pc-headline">{p.headline}</h2>
                </FadeIn>
                <FadeIn delay={0.16}>
                  <p className="pc-body">{p.body}</p>
                </FadeIn>
                {p.cta && (
                  <FadeIn delay={0.24}>
                    <div className="pc-cta-wrap">
                      <a href="#" className="pc-cta">{p.cta}</a>
                    </div>
                  </FadeIn>
                )}
                {i === 0 && (
                  <FadeIn delay={0.5}>
                    <div className="pc-swipe-hint">
                      <span>&#8594;</span> Swipe to continue
                    </div>
                  </FadeIn>
                )}
              </div>

              {/* Bleed-from-next hint (not on last panel) */}
              {i < PANELS.length - 1 && (
                <div className="pc-bleed">
                  <div className="pc-bleed-line" />
                  <span className="pc-bleed-arrow">&#8250;</span>
                  <div className="pc-bleed-line" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
/**
 * Variation 3: The Pull — Vertical
 * Route: /preview/the-pull-vertical
 *
 * Same 10s particle-to-cube canvas splash as the reference.
 * VERTICAL snap-y scroll — 6 panels stacked at 100vh.
 * Sticky rotating mini-cube in top-right, linked to scroll.
 * Top progress bar fills as user scrolls through panels.
 * Bleed-from-next: bottom 8% of next panel peeks below fold.
 * Liquid progress dots (right edge).
 */

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@level9/brand/components/motion";

const ParticleCubeCanvas = dynamic(
  () => import("../operating-room/_components/ParticleCubeCanvas"),
  { ssr: false }
);

const PANELS = [
  {
    id: "hook",
    eyebrow: "Level9OS",
    headline: "Your first AI operating system. Or your last one.",
    body: "Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you.",
    cta: null,
    color: "#8b5cf6",
    rgb: "139,92,246",
    mesh: "radial-gradient(ellipse 700px 500px at 30% 40%, rgba(139,92,246,0.09) 0%, transparent 70%)",
  },
  {
    id: "problem",
    eyebrow: "The Problem",
    headline: "You are already running AI. No one is watching it.",
    body: "Every prompt you send. Ungoverned. Every agent you deploy. Unmeasured. Every document you generate. Untrusted. That is not a vendor problem. That is an operating problem.",
    cta: null,
    color: "#ef4444",
    rgb: "239,68,68",
    mesh: "radial-gradient(ellipse 700px 500px at 60% 50%, rgba(239,68,68,0.08) 0%, transparent 70%)",
  },
  {
    id: "product",
    eyebrow: "The Product",
    headline: "Six tools. One operating layer. No lock-in.",
    body: "StratOS deliberates. CommandOS coordinates. OutboundOS executes. LucidORG measures. COO Playbook installs the methodology. MAX runs the content. All connected. All yours to exit if the math changes.",
    cta: null,
    color: "#6366f1",
    rgb: "99,102,241",
    mesh: "radial-gradient(ellipse 700px 500px at 40% 60%, rgba(99,102,241,0.09) 0%, transparent 70%)",
  },
  {
    id: "vault",
    eyebrow: "The Vault",
    headline: "48 domain officers. 3 governance gates. One audit trail.",
    body: "Every decision flagged before it ships. Every agent output logged and traceable. This is not a compliance checkbox. It is how you survive the audit your clients have not sent yet.",
    cta: null,
    color: "#8b5cf6",
    rgb: "139,92,246",
    mesh: "radial-gradient(ellipse 700px 500px at 70% 30%, rgba(139,92,246,0.1) 0%, transparent 70%)",
  },
  {
    id: "library",
    eyebrow: "Intelligence Library",
    headline: "Purpose-built pods. Not a platform you customize forever.",
    body: "StratOS for decisions. CommandOS for coordination. LinkUpOS, ABM Engine, AutoCS for execution. LucidORG for measurement. Each pod ships in days, not quarters.",
    cta: null,
    color: "#06b6d4",
    rgb: "6,182,212",
    mesh: "radial-gradient(ellipse 700px 500px at 30% 60%, rgba(6,182,212,0.09) 0%, transparent 70%)",
  },
  {
    id: "start",
    eyebrow: "Start Here",
    headline: "Book a 30-minute session. See the whole stack live.",
    body: "No slides. No decks. We run the system in the call. You leave knowing exactly what would change in your business if you installed it.",
    cta: "Book a session",
    color: "#8b5cf6",
    rgb: "139,92,246",
    mesh: "radial-gradient(ellipse 800px 600px at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%)",
  },
];

function MiniCube({ rotation, color }: { rotation: number; color: string }) {
  return (
    <svg
      width="52" height="52" viewBox="0 0 52 52" fill="none"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 1s cubic-bezier(0.34,1.56,0.64,1)",
        filter: `drop-shadow(0 0 6px ${color}66)`,
      }}
    >
      <rect x="16" y="16" width="20" height="20" stroke={color} strokeWidth="1.5" strokeOpacity="0.8" fill="none" />
      <rect x="8" y="8" width="20" height="20" stroke={color} strokeWidth="1" strokeOpacity="0.35" fill="none" />
      <line x1="8" y1="8" x2="16" y2="16" stroke={color} strokeWidth="1" strokeOpacity="0.35" />
      <line x1="28" y1="8" x2="36" y2="16" stroke={color} strokeWidth="1" strokeOpacity="0.35" />
      <line x1="8" y1="28" x2="16" y2="36" stroke={color} strokeWidth="1" strokeOpacity="0.35" />
      <line x1="28" y1="28" x2="36" y2="36" stroke={color} strokeWidth="1" strokeOpacity="0.35" />
    </svg>
  );
}

export default function ThePullVertical() {
  const [splashDone, setSplashDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
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
      const totalScroll = el.scrollHeight - el.clientHeight;
      const progress = totalScroll > 0 ? el.scrollTop / totalScroll : 0;
      setScrollProgress(progress);
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setActivePanel(Math.max(0, Math.min(idx, PANELS.length - 1)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [splashDone]);

  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * el.clientHeight, behavior: "smooth" });
  };

  const cubeRotation = activePanel * 12 + scrollProgress * 30;
  const panel = PANELS[activePanel];

  return (
    <div className="pv-root">
      <style>{`
        .pv-root {
          background: #030306;
          color: rgba(255,255,255,0.92);
          font-family: var(--font-inter), system-ui, sans-serif;
          height: 100dvh;
          overflow: hidden;
          position: relative;
        }
        /* Splash */
        .pv-splash {
          position: fixed;
          inset: 0;
          z-index: 50;
          transition: opacity 1.5s ease;
        }
        .pv-splash.done {
          opacity: 0;
          pointer-events: none;
        }
        /* Skip */
        .pv-skip {
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
        .pv-skip:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.25); }
        /* Top progress bar */
        .pv-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255,255,255,0.06);
          z-index: 100;
          opacity: 0;
          transition: opacity 0.8s ease 0.5s;
        }
        .pv-progress-bar.visible { opacity: 1; }
        .pv-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #06b6d4);
          transition: width 0.15s ease;
          border-radius: 0 2px 2px 0;
        }
        /* Sticky mini cube top-right */
        .pv-cube-header {
          position: fixed;
          top: 1.25rem;
          right: 1.5rem;
          z-index: 100;
          opacity: 0;
          transition: opacity 0.8s ease 0.5s;
          pointer-events: none;
        }
        .pv-cube-header.visible { opacity: 1; }
        /* Vertical scroll container */
        .pv-scroll {
          height: 100dvh;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .pv-scroll::-webkit-scrollbar { display: none; }
        /* Each panel is 100vh, last one slightly taller to allow snap */
        .pv-panel {
          height: 100dvh;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        /* Bleed from next panel — bottom peek */
        .pv-bleed-bottom {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding-bottom: 1.5rem;
          opacity: 0.35;
        }
        .pv-bleed-label {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .pv-bleed-arrow {
          font-size: 1rem;
          color: rgba(255,255,255,0.4);
          animation: bounce-down 1.8s ease-in-out infinite;
        }
        @keyframes bounce-down { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(5px); } }
        /* Right-side dots nav */
        .pv-dots {
          position: fixed;
          right: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 100;
          opacity: 0;
          transition: opacity 0.8s ease 0.5s;
        }
        .pv-dots.visible { opacity: 1; }
        .pv-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
        }
        .pv-dot.active {
          background: var(--pv-dot-color, #8b5cf6);
          transform: scale(1.5);
          box-shadow: 0 0 10px var(--pv-dot-color, rgba(139,92,246,0.7));
        }
        /* Panel content */
        .pv-panel-inner {
          max-width: 660px;
          width: 88%;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          position: relative;
          z-index: 2;
          padding: 4rem 0 6rem;
        }
        .pv-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .pv-eyebrow::before {
          content: "";
          display: inline-block;
          width: 24px;
          height: 1px;
          opacity: 0.6;
        }
        .pv-headline {
          font-size: clamp(2.2rem, 5vw, 4.5rem);
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -0.035em;
          margin: 0;
        }
        .pv-body {
          font-size: clamp(1rem, 1.5vw, 1.12rem);
          line-height: 1.72;
          color: rgba(255,255,255,0.58);
          max-width: 52ch;
          margin: 0;
        }
        .pv-cta {
          padding: 0.9rem 2.5rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.92);
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          width: fit-content;
          transition: box-shadow 0.25s ease, background 0.25s ease;
        }
        .pv-swipe-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.63rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          animation: bounce-hint 2s ease-in-out infinite;
        }
        @keyframes bounce-hint { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(4px); } }
        @media (max-width: 640px) {
          .pv-dots { right: 0.75rem; }
          .pv-cube-header { right: 0.75rem; }
          .pv-headline { font-size: clamp(1.9rem, 7vw, 3rem); }
        }
      `}</style>

      {/* Canvas Splash */}
      <div className={`pv-splash ${splashDone ? "done" : ""}`}>
        <ParticleCubeCanvas onComplete={handleComplete} />
      </div>

      {/* Skip */}
      {showSkip && !splashDone && (
        <button className="pv-skip" onClick={handleSkip}>Skip intro</button>
      )}

      {/* Top progress bar */}
      <div className={`pv-progress-bar ${splashDone ? "visible" : ""}`}>
        <div className="pv-progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {/* Sticky mini cube top-right */}
      <div className={`pv-cube-header ${splashDone ? "visible" : ""}`}>
        <MiniCube rotation={cubeRotation} color={panel.color} />
      </div>

      {/* Right-side progress dots */}
      <div className={`pv-dots ${splashDone ? "visible" : ""}`}>
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            className={`pv-dot ${i === activePanel ? "active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Panel ${i + 1}`}
            style={{ "--pv-dot-color": p.color } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Vertical panels */}
      {splashDone && (
        <div ref={scrollRef} className="pv-scroll">
          {PANELS.map((p, i) => (
            <div key={p.id} className="pv-panel">
              {/* Mesh gradient */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: p.mesh,
              }} />

              <div className="pv-panel-inner">
                <FadeIn>
                  <div
                    className="pv-eyebrow"
                    style={{
                      color: p.color,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ["--eyebrow-color" as any]: p.color,
                    }}
                  >
                    <style>{`.pv-eyebrow::before { background: ${p.color}; }`}</style>
                    {p.eyebrow}
                  </div>
                </FadeIn>
                <FadeIn delay={0.08}>
                  <h2 className="pv-headline" style={{ color: "rgba(255,255,255,0.94)" }}>{p.headline}</h2>
                </FadeIn>
                <FadeIn delay={0.16}>
                  <p className="pv-body">{p.body}</p>
                </FadeIn>
                {p.cta && (
                  <FadeIn delay={0.24}>
                    <a
                      href="#"
                      className="pv-cta"
                      style={{
                        background: `rgba(${p.rgb},0.15)`,
                        border: `1px solid rgba(${p.rgb},0.4)`,
                        boxShadow: `0 0 0 0 rgba(${p.rgb},0.3)`,
                      }}
                    >
                      {p.cta}
                    </a>
                  </FadeIn>
                )}
                {i === 0 && (
                  <FadeIn delay={0.5}>
                    <div className="pv-swipe-hint">
                      <span>&#8595;</span> Scroll to continue
                    </div>
                  </FadeIn>
                )}
              </div>

              {/* Bleed bottom hint */}
              {i < PANELS.length - 1 && (
                <div className="pv-bleed-bottom">
                  <div className="pv-bleed-arrow">&#8964;</div>
                  <div className="pv-bleed-label">{PANELS[i + 1].eyebrow}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

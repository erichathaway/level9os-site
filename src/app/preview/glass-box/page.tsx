"use client";
/**
 * Prototype 2: Glass Box
 * Route: /preview/glass-box
 * Concept: Six-panel horizontal snap-scroll. Each panel = one capability layer.
 * Semantic color per panel. Swipe-driven story before signup.
 */

import { useEffect, useRef, useState } from "react";
import { FadeIn } from "@level9/brand/components/motion";
import { RevealMask } from "@level9/brand/components/motion";

const PANELS = [
  {
    id: "os",
    color: "#8b5cf6",
    colorRgb: "139,92,246",
    colorName: "violet",
    eyebrow: "Operating System",
    headline: "Your first AI operating system. Or your last one.",
    body: "Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you.",
    cta: null,
  },
  {
    id: "problem",
    color: "#ef4444",
    colorRgb: "239,68,68",
    colorName: "red",
    eyebrow: "The Problem",
    headline: "Every prompt you send. Ungoverned.",
    body: "You are already running AI. You just do not know what it decided, why it decided it, or whether anyone checked. That is not a vendor problem. That is an operating problem.",
    cta: null,
  },
  {
    id: "product",
    color: "#6366f1",
    colorRgb: "99,102,241",
    colorName: "indigo",
    eyebrow: "The Product",
    headline: "Six tools. One operating layer. No lock-in.",
    body: "StratOS deliberates. CommandOS coordinates. OutboundOS executes. LucidORG measures. COO Playbook installs the methodology. MAX runs the content. All connected. All yours to exit if the math changes.",
    cta: null,
  },
  {
    id: "vault",
    color: "#8b5cf6",
    colorRgb: "139,92,246",
    colorName: "violet",
    eyebrow: "The Vault",
    headline: "48 domain officers. 3 governance gates. One audit trail.",
    body: "Every decision flagged before it ships. Every agent output logged and traceable. This is not a compliance checkbox. It is how you survive the audit your clients have not sent yet.",
    cta: null,
  },
  {
    id: "stack",
    color: "#06b6d4",
    colorRgb: "6,182,212",
    colorName: "cyan",
    eyebrow: "The Stack",
    headline: "Purpose-built pods. Not a platform you customize forever.",
    body: "StratOS for decisions. CommandOS for coordination. LinkUpOS, ABM Engine, AutoCS for execution. LucidORG for measurement. Each pod ships in days, not quarters.",
    cta: null,
  },
  {
    id: "start",
    color: "#8b5cf6",
    colorRgb: "139,92,246",
    colorName: "violet",
    eyebrow: "Start Here",
    headline: "Book a 30-minute session. See the whole stack live.",
    body: "No slides. No decks. We run the system in the call. You leave knowing exactly what would change in your business if you installed it.",
    cta: "Book a session",
  },
];

export default function GlassBoxPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActivePanel(Math.max(0, Math.min(idx, PANELS.length - 1)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  const panel = PANELS[activePanel];

  return (
    <div className="gb-root" style={{ "--panel-color": panel.color, "--panel-rgb": panel.colorRgb } as React.CSSProperties}>
      <style>{`
        .gb-root {
          height: 100dvh;
          overflow: hidden;
          background: var(--bg-root);
          color: var(--text-primary);
          font-family: var(--font-inter), system-ui, sans-serif;
          position: relative;
        }
        /* Dots nav */
        .gb-dots {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 100;
        }
        .gb-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          border: none;
          padding: 0;
        }
        .gb-dot.active {
          background: var(--panel-color);
          transform: scale(1.3);
          box-shadow: 0 0 8px var(--panel-color);
        }
        /* Scroll container */
        .gb-scroll {
          display: flex;
          height: 100dvh;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .gb-scroll::-webkit-scrollbar { display: none; }
        /* Each panel */
        .gb-panel {
          min-width: 100vw;
          width: 100vw;
          height: 100dvh;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .gb-panel-inner {
          max-width: 640px;
          width: 90%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 2;
        }
        .gb-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--panel-color);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .gb-eyebrow::before {
          content: "";
          display: inline-block;
          width: 20px;
          height: 1px;
          background: var(--panel-color);
          opacity: 0.7;
        }
        .gb-headline {
          font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin: 0;
          color: var(--text-primary);
        }
        .gb-body {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem);
          line-height: 1.7;
          color: var(--text-secondary);
          margin: 0;
          max-width: 52ch;
        }
        .gb-cta {
          padding: 0.875rem 2.25rem;
          background: var(--panel-color);
          color: white;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          display: inline-block;
          transition: box-shadow 0.3s ease;
          box-shadow: 0 0 0 0 rgba(var(--panel-rgb), 0.4);
          width: fit-content;
        }
        .gb-cta:hover {
          box-shadow: 0 0 28px rgba(var(--panel-rgb), 0.5), 0 0 8px rgba(var(--panel-rgb), 0.3);
        }
        /* Panel mesh gradient */
        .gb-mesh {
          position: absolute;
          inset: 0;
          pointer-events: none;
          transition: background 0.8s ease;
        }
        /* Panel counter */
        .gb-counter {
          position: fixed;
          top: 2rem;
          right: 2rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          color: var(--text-ghost);
          z-index: 100;
        }
        /* Swipe hint (panel 1 only) */
        .gb-swipe-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-ghost);
          animation: swipe-cue 2s ease-in-out infinite;
          margin-top: 0.5rem;
        }
        @keyframes swipe-cue {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(6px); }
        }
        .gb-swipe-arrow {
          font-size: 1rem;
          line-height: 1;
        }
        /* Divider line */
        .gb-divider {
          width: 48px;
          height: 1px;
          background: rgba(var(--panel-rgb), 0.4);
        }
        /* Mobile full width */
        @media (max-width: 640px) {
          .gb-panel-inner {
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* Panel counter */}
      <div className="gb-counter">{String(activePanel + 1).padStart(2, "0")} / 06</div>

      {/* Dots nav */}
      <div className="gb-dots">
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            className={`gb-dot ${i === activePanel ? "active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to panel ${i + 1}`}
            style={{ "--panel-color": p.color } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Scroll container */}
      <div ref={containerRef} className="gb-scroll">
        {PANELS.map((p, i) => (
          <div key={p.id} className="gb-panel">
            {/* Mesh gradient — unique per panel */}
            <div
              className="gb-mesh"
              style={{
                background: `
                  radial-gradient(ellipse 700px 500px at 20% 60%, rgba(${p.colorRgb},0.07) 0%, transparent 70%),
                  radial-gradient(ellipse 500px 400px at 80% 30%, rgba(${p.colorRgb},0.04) 0%, transparent 70%)
                `,
              }}
            />

            <div className="gb-panel-inner">
              <RevealMask>
                <div className="gb-eyebrow">{p.eyebrow}</div>
              </RevealMask>

              <RevealMask>
                <div className="gb-divider" style={{ background: `rgba(${p.colorRgb},0.4)` }} />
              </RevealMask>

              <RevealMask>
                <h2 className="gb-headline">{p.headline}</h2>
              </RevealMask>

              <RevealMask>
                <p className="gb-body">{p.body}</p>
              </RevealMask>

              {p.cta && (
                <RevealMask>
                  <a href="#" className="gb-cta">
                    {p.cta}
                  </a>
                </RevealMask>
              )}

              {i === 0 && (
                <FadeIn delay={1.2}>
                  <div className="gb-swipe-hint">
                    <span className="gb-swipe-arrow">&#8594;</span>
                    Swipe to enter
                  </div>
                </FadeIn>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

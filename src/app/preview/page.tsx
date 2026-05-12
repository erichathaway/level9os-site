"use client";
/**
 * /preview — Design Direction Selector
 * Eric lands here, sees three concept doors, clicks through.
 * Three cards horizontal on desktop, vertical on mobile.
 */

import { MagneticCard } from "@level9/brand/components/motion";
import { FadeIn } from "@level9/brand/components/motion";

const CONCEPTS = [
  {
    id: "operating-room",
    name: "Operating Room",
    tagline: "Cinematic canvas entry. 15s particle-to-cube splash. Deep narrative scroll.",
    pitch: "Visitors stop and watch before they read a word. The most dramatic entry. Highest creative budget.",
    href: "/preview/operating-room",
    color: "#8b5cf6",
    rgb: "139,92,246",
    badge: "Canvas",
  },
  {
    id: "glass-box",
    name: "Glass Box",
    tagline: "Six-panel horizontal swipe. Each panel is a capability layer. Semantic color per panel.",
    pitch: "Swipe-driven story before signup. Visitor agency over forced animation. Clean, architectural.",
    href: "/preview/glass-box",
    color: "#6366f1",
    rgb: "99,102,241",
    badge: "Scroll",
  },
  {
    id: "console",
    name: "The Console",
    tagline: "Marketing site feels like the product. Sidebar nav, ConsoleGraphic hero, Aurora headline.",
    pitch: "Visitors feel inside Level9OS before they sign up. Lowest build risk. Highest product signal.",
    href: "/preview/console",
    color: "#06b6d4",
    rgb: "6,182,212",
    badge: "Dashboard",
  },
];

export default function PreviewIndex() {
  return (
    <div className="pi-root">
      <style>{`
        .pi-root {
          min-height: 100dvh;
          background: #030306;
          color: rgba(255,255,255,0.9);
          font-family: var(--font-inter), system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 3rem;
          position: relative;
          overflow: hidden;
        }
        .pi-mesh {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 800px 600px at 30% 40%, rgba(139,92,246,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 600px 500px at 70% 60%, rgba(6,182,212,0.03) 0%, transparent 70%);
        }
        .pi-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          z-index: 2;
        }
        .pi-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(139,92,246,0.8);
        }
        .pi-title {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: rgba(255,255,255,0.92);
        }
        .pi-sub {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
          max-width: 44ch;
          margin: 0 auto;
        }
        /* Cards grid */
        .pi-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 340px));
          gap: 1.25rem;
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1060px;
        }
        .pi-card {
          background: #0d0d18;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: border-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .pi-card:hover {
          border-color: rgba(var(--card-rgb), 0.35);
        }
        .pi-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          border-radius: 16px 16px 0 0;
        }
        .pi-card-badge {
          display: inline-flex;
          align-items: center;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--card-color);
          background: rgba(var(--card-rgb), 0.1);
          border: 1px solid rgba(var(--card-rgb), 0.2);
          border-radius: 4px;
          padding: 0.25rem 0.625rem;
          width: fit-content;
        }
        .pi-card-name {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: rgba(255,255,255,0.92);
        }
        .pi-card-tagline {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.6;
        }
        .pi-card-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0.25rem 0;
        }
        .pi-card-pitch {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.42);
          line-height: 1.65;
          font-style: italic;
        }
        .pi-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.65rem 1.5rem;
          background: rgba(var(--card-rgb), 0.12);
          border: 1px solid rgba(var(--card-rgb), 0.25);
          border-radius: 8px;
          color: var(--card-color);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease;
          width: fit-content;
        }
        .pi-card-cta:hover {
          background: rgba(var(--card-rgb), 0.22);
          border-color: var(--card-color);
        }
        .pi-card-arrow {
          font-size: 0.9rem;
          transition: transform 0.2s ease;
        }
        .pi-card-cta:hover .pi-card-arrow {
          transform: translateX(3px);
        }
        .pi-footer-note {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.2);
          text-align: center;
          position: relative;
          z-index: 2;
        }
        /* Mobile: single column */
        @media (max-width: 900px) {
          .pi-grid {
            grid-template-columns: minmax(0, 420px);
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .pi-root { padding: 2.5rem 1.25rem; }
          .pi-card { padding: 1.5rem; }
        }
      `}</style>

      <div className="pi-mesh" />

      <FadeIn delay={0}>
        <div className="pi-header">
          <div className="pi-eyebrow">Level9OS Site Rebuild · Design Review</div>
          <h1 className="pi-title">Pick a direction.</h1>
          <p className="pi-sub">Three concepts. Same headline. The variable is how you feel it.</p>
        </div>
      </FadeIn>

      <div className="pi-grid">
        {CONCEPTS.map((c, i) => (
          <FadeIn key={c.id} delay={i * 0.1}>
            <div style={{ "--card-color": c.color, "--card-rgb": c.rgb } as React.CSSProperties}>
            <MagneticCard
              className="pi-card"
              glowColor={`rgba(${c.rgb},0.1)`}
              maxTilt={3}
            >
              <div
                className="pi-card-accent"
                style={{ background: c.color, opacity: 0.7 }}
              />
              <span className="pi-card-badge">{c.badge}</span>
              <div className="pi-card-name">{c.name}</div>
              <div className="pi-card-tagline">{c.tagline}</div>
              <div className="pi-card-divider" />
              <div className="pi-card-pitch">{c.pitch}</div>
              <a href={c.href} className="pi-card-cta">
                Open
                <span className="pi-card-arrow">&#8594;</span>
              </a>
            </MagneticCard>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.4}>
        <div className="pi-footer-note">rebuild branch · preview environment · not production</div>
      </FadeIn>
    </div>
  );
}

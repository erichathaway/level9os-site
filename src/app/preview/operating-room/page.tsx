"use client";
/**
 * Prototype 1: Operating Room
 * Route: /preview/operating-room
 * Concept: Cinematic canvas particle-to-cube splash entry (15s), then hero.
 * Canvas-based (not DOM). Skip affordance at 4s. Three text overlays during scatter.
 * After splash: headline + sub fade in beneath locked cube.
 * Below hero: three problem stat cards with mesh gradient + stagger reveal.
 */

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@level9/brand/components/motion";
import { MagneticCard } from "@level9/brand/components/motion";

// Dynamic import keeps SSR clean for the canvas component
const ParticleCubeCanvas = dynamic(
  () => import("./_components/ParticleCubeCanvas"),
  { ssr: false }
);

const STATS = [
  {
    stat: "74%",
    label: "of SMBs running AI have no governance layer.",
    color: "#ef4444",
    rgb: "239,68,68",
  },
  {
    stat: "$27k",
    label: "average annual cost of unaudited AI decisions per team.",
    color: "#8b5cf6",
    rgb: "139,92,246",
  },
  {
    stat: "0",
    label: "production-ready AI operating systems built for SMB, until now.",
    color: "#06b6d4",
    rgb: "6,182,212",
  },
];

export default function OperatingRoomPage() {
  const [splashDone, setSplashDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  // Show skip button at 4s
  useState(() => {
    const t = setTimeout(() => setShowSkip(true), 4000);
    return () => clearTimeout(t);
  });

  const handleComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  const handleSkip = useCallback(() => {
    setSplashDone(true);
    setShowSkip(false);
  }, []);

  return (
    <div className="or-root">
      <style>{`
        .or-root {
          background: #030306;
          color: var(--text-primary);
          font-family: var(--font-inter), system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        /* Splash */
        .or-splash {
          position: fixed;
          inset: 0;
          z-index: 50;
          transition: opacity 1.5s ease;
        }
        .or-splash.done {
          opacity: 0;
          pointer-events: none;
        }
        /* Skip button */
        .or-skip {
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
          animation: skip-appear 0.5s ease forwards;
        }
        @keyframes skip-appear {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .or-skip:hover {
          color: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.25);
        }
        /* Hero (shown after splash) */
        .or-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 2rem 4rem;
          position: relative;
          overflow: hidden;
          transition: opacity 1.5s ease 0.5s;
          opacity: 0;
        }
        .or-hero.visible {
          opacity: 1;
        }
        .or-hero-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--violet);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .or-hero-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--violet);
          animation: blink-dot 2s ease-in-out infinite;
        }
        @keyframes blink-dot { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
        .or-hero-headline {
          font-size: clamp(2.2rem, 4.5vw, 4rem);
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -0.03em;
          max-width: 16ch;
          margin: 0 auto 1.5rem;
        }
        .or-hero-sub {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem);
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 48ch;
          margin: 0 auto 2.5rem;
        }
        /* Mesh gradient behind hero */
        .or-mesh {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 700px 500px at 50% 40%, rgba(139,92,246,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 500px 400px at 20% 70%, rgba(6,182,212,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 500px 400px at 80% 30%, rgba(236,72,153,0.03) 0%, transparent 70%);
        }
        /* Problem stats */
        .or-stats-section {
          padding: 4rem 2rem 5rem;
          position: relative;
        }
        .or-stats-inner {
          max-width: 1000px;
          margin: 0 auto;
        }
        .or-stats-mesh {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 800px 400px at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 70%);
        }
        .or-stats-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .or-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
        }
        .or-stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 14px;
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          overflow: hidden;
        }
        .or-stat-number {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .or-stat-label {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }
        .or-stat-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          border-radius: 14px 14px 0 0;
        }
        @media (max-width: 640px) {
          .or-hero-headline { max-width: 100%; }
        }
      `}</style>

      {/* Canvas Splash */}
      <div className={`or-splash ${splashDone ? "done" : ""}`}>
        <ParticleCubeCanvas onComplete={handleComplete} />
      </div>

      {/* Skip button */}
      {showSkip && !splashDone && (
        <button className="or-skip" onClick={handleSkip}>
          Skip intro
        </button>
      )}

      {/* Hero content (fades in after splash) */}
      <section className={`or-hero ${splashDone ? "visible" : ""}`}>
        <div className="or-mesh" />
        <div className="or-hero-eyebrow">
          <span className="or-hero-dot" />
          Level9OS
        </div>
        <h1 className="or-hero-headline">
          Your first AI operating system. Or your last one.
        </h1>
        <p className="or-hero-sub">
          Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you.
        </p>
        <a
          href="#"
          style={{
            padding: "0.875rem 2.25rem",
            background: "var(--violet)",
            color: "white",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.95rem",
            textDecoration: "none",
            boxShadow: "0 0 24px rgba(139,92,246,0.4)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          See how it works
        </a>
      </section>

      {/* Problem stat cards */}
      {splashDone && (
        <section className="or-stats-section">
          <div className="or-stats-mesh" />
          <div className="or-stats-inner">
            <FadeIn>
              <div className="or-stats-eyebrow">The problem, measured</div>
            </FadeIn>
            <div className="or-stats-grid">
              {STATS.map((s, i) => (
                <FadeIn key={s.stat} delay={i * 0.12}>
                  <MagneticCard
                    className="or-stat-card"
                    glowColor={`rgba(${s.rgb},0.1)`}
                    maxTilt={4}
                  >
                    <div
                      className="or-stat-accent"
                      style={{ background: s.color }}
                    />
                    <div
                      className="or-stat-number"
                      style={{ color: s.color }}
                    >
                      {s.stat}
                    </div>
                    <div className="or-stat-label">{s.label}</div>
                  </MagneticCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

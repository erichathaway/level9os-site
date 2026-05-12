"use client";
/**
 * Prototype 3: The Console
 * Route: /preview/console
 * Concept: Marketing site feels like the product itself.
 * Hero: ConsoleGraphic (right 60%) + headline/CTAs (left 40%).
 * Persistent left sidebar nav (250px), CursorGradient, Aurora headline.
 * One additional section: Voice Pitch Hub.
 */

import { useState } from "react";
import { CursorGradient } from "@level9/brand/components/motion";
import { MagneticButton } from "@level9/brand/components/motion";
import { ConsoleGraphic } from "@level9/brand/components/architecture";
import { FadeIn } from "@level9/brand/components/motion";
import { MagneticCard } from "@level9/brand/components/motion";
import ConsoleSidebar from "./_components/ConsoleSidebar";
import WaveformPlayer from "./_components/WaveformPlayer";

const NAV_ITEMS = [
  { id: "platform",   label: "Platform" },
  { id: "products",   label: "Products" },
  { id: "governance", label: "Governance" },
  { id: "pricing",    label: "Pricing" },
  { id: "compare",    label: "Compare" },
];

const VOICE_CLIPS = [
  { label: "60-second overview", duration: "0:30", bars: 28 },
  { label: "Governance deep-dive", duration: "1:30", bars: 28 },
  { label: "Full platform walkthrough", duration: "5:00", bars: 28 },
];

export default function ConsolePage() {
  const [activeNav, setActiveNav] = useState("platform");

  return (
    <div className="console-root">
      <style>{`
        @property --aurora-x {
          syntax: "<percentage>";
          inherits: true;
          initial-value: 30%;
        }
        .console-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg-root);
          color: var(--text-primary);
          font-family: var(--font-inter), system-ui, sans-serif;
          overflow-x: hidden;
        }
        .console-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        /* Aurora headline */
        .text-aurora {
          --aurora-x: 30%;
          background-image:
            radial-gradient(circle 380px at calc(var(--aurora-x) - 110px) 50%, rgba(236,72,153,0.9) 0%, rgba(236,72,153,0) 55%),
            radial-gradient(circle 480px at var(--aurora-x) 50%, rgba(139,92,246,0.95) 0%, rgba(139,92,246,0) 55%),
            radial-gradient(circle 380px at calc(var(--aurora-x) + 110px) 50%, rgba(6,182,212,0.85) 0%, rgba(6,182,212,0) 55%),
            linear-gradient(0deg, rgba(255,255,255,1), rgba(255,255,255,1));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: aurora-drift 6s ease-in-out infinite alternate;
          transition: --aurora-x 3.25s ease;
        }
        @keyframes aurora-drift {
          0%   { --aurora-x: 20%; }
          50%  { --aurora-x: 60%; }
          100% { --aurora-x: 85%; }
        }
        /* Hero layout */
        .hero-section {
          display: flex;
          align-items: center;
          min-height: 100vh;
          gap: 0;
          position: relative;
          overflow: hidden;
        }
        .hero-left {
          width: 40%;
          padding: 4rem 2.5rem 4rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1.75rem;
          position: relative;
          z-index: 2;
        }
        .hero-right {
          width: 60%;
          height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--violet);
          opacity: 0.85;
        }
        .hero-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--violet);
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{ opacity: 1; } 50%{ opacity: 0.3; } }
        .hero-headline {
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .hero-sub {
          font-size: clamp(0.9rem, 1.4vw, 1.05rem);
          line-height: 1.65;
          color: var(--text-secondary);
          max-width: 36ch;
          margin: 0;
        }
        .cta-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn-primary {
          padding: 0.75rem 1.75rem;
          background: var(--violet);
          color: white;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: box-shadow 0.3s ease, transform 0.2s ease;
          box-shadow: 0 0 0 0 rgba(139,92,246,0.4);
        }
        .btn-primary:hover {
          box-shadow: 0 0 24px rgba(139,92,246,0.6), 0 0 8px rgba(139,92,246,0.3);
        }
        .btn-ghost {
          padding: 0.75rem 1.75rem;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.9rem;
          text-decoration: none;
          transition: border-color 0.3s ease, color 0.3s ease;
        }
        .btn-ghost:hover {
          border-color: var(--violet);
          color: var(--text-primary);
        }
        /* Voice Hub */
        .voice-section {
          padding: 5rem 3rem;
          border-top: 1px solid var(--border-subtle);
          position: relative;
        }
        .section-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 0.75rem;
        }
        .section-headline {
          font-size: clamp(1.4rem, 2.5vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .section-sub {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.65;
          max-width: 52ch;
          margin-bottom: 2.5rem;
        }
        .voice-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          max-width: 1000px;
        }
        .voice-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: border-color 0.3s ease;
        }
        .voice-card:hover {
          border-color: rgba(139,92,246,0.35);
        }
        .voice-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .voice-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .voice-duration {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }
        .waveform-container {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 32px;
        }
        .waveform-bar {
          flex: 1;
          border-radius: 2px;
          background: rgba(139,92,246,0.3);
          animation: wave-idle 1.4s ease-in-out infinite;
        }
        @keyframes wave-idle {
          0%,100%{ opacity: 0.3; }
          50%{ opacity: 0.6; }
        }
        .voice-play-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.3);
          color: var(--violet);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
          flex-shrink: 0;
        }
        .voice-play-btn:hover {
          background: rgba(139,92,246,0.25);
          border-color: var(--violet);
        }
        /* Mesh gradient overlay */
        .mesh-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 600px 400px at 20% 50%, rgba(139,92,246,0.05) 0%, transparent 70%),
            radial-gradient(ellipse 500px 350px at 80% 20%, rgba(6,182,212,0.04) 0%, transparent 70%);
        }
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .hero-section {
            flex-direction: column;
            min-height: auto;
          }
          .hero-left {
            width: 100%;
            padding: 2.5rem 1.5rem 1rem;
          }
          .hero-right {
            width: 100%;
            height: 60vw;
            min-height: 300px;
          }
          .voice-section {
            padding: 3rem 1.5rem;
          }
        }
      `}</style>

      <CursorGradient color="rgba(139,92,246,0.07)" size={700} />

      <ConsoleSidebar items={NAV_ITEMS} active={activeNav} onSelect={setActiveNav} />

      <main className="console-main">
        {/* Hero */}
        <section className="hero-section">
          <div className="mesh-overlay" />

          <div className="hero-left">
            <FadeIn delay={0.1}>
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                AI Operating System
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="hero-headline">
                <span className="text-aurora">
                  Your first AI operating system.
                </span>
                {" "}
                <span style={{ color: "var(--text-primary)" }}>Or your last one.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p className="hero-sub">
                Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you.
              </p>
            </FadeIn>

            <FadeIn delay={0.45}>
              <div className="cta-row">
                <MagneticButton href="#" className="btn-primary">
                  See how it works
                </MagneticButton>
                <MagneticButton href="#" className="btn-ghost">
                  Compare plans
                </MagneticButton>
              </div>
            </FadeIn>
          </div>

          <div className="hero-right">
            <ConsoleGraphic />
          </div>
        </section>

        {/* Voice Pitch Hub */}
        <section className="voice-section">
          <div className="mesh-overlay" />
          <FadeIn>
            <div className="section-eyebrow">Voice Pitch Hub</div>
            <h2 className="section-headline">Hear it in 30 seconds. Or 5 minutes.</h2>
            <p className="section-sub">Three formats. Same answer. Pick the one that fits where you are right now.</p>
          </FadeIn>
          <div className="voice-grid">
            {VOICE_CLIPS.map((clip, i) => (
              <FadeIn key={clip.label} delay={i * 0.12}>
                <MagneticCard
                  className="voice-card"
                  glowColor="rgba(139,92,246,0.12)"
                  maxTilt={3}
                >
                  <div className="voice-card-header">
                    <span className="voice-label">{clip.label}</span>
                    <span className="voice-duration">{clip.duration}</span>
                  </div>
                  <WaveformPlayer bars={clip.bars} index={i} />
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

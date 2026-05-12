"use client";
/**
 * Variation 4: The Pull — Voice
 * Route: /preview/the-pull-voice
 *
 * 8s canvas splash. On cube-settle, a 40Hz audio pulse plays (visitor-initiated).
 * Horizontal snap-x, 6 panels.
 * Each panel has a waveform-style play button (simulated playback, no real audio yet).
 * Panel 1: 0:30 intro clip. Panel 4: 1:30 vault deep. Panel 6: 5:00 full pitch.
 * Bleed-from-next, liquid dots, persistent mini-cube.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@level9/brand/components/motion";

const ParticleCubeCanvas = dynamic(
  () => import("../operating-room/_components/ParticleCubeCanvas"),
  { ssr: false }
);

const WaveformPlayer = dynamic(
  () => import("./_components/WaveformPlayer"),
  { ssr: false }
);

const PANELS = [
  {
    id: "hook",
    color: "#8b5cf6",
    rgb: "139,92,246",
    eyebrow: "The Introduction",
    headline: "Your first AI operating system. Or your last one.",
    body: "Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you.",
    audioLabel: "30-second intro",
    audioDuration: "0:30",
    audioSeconds: 30,
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 25% 55%, rgba(139,92,246,0.09) 0%, transparent 70%)",
  },
  {
    id: "problem",
    color: "#ef4444",
    rgb: "239,68,68",
    eyebrow: "The Problem",
    headline: "You are already running AI. No one is watching it.",
    body: "Every prompt you send. Ungoverned. Every agent you deploy. Unmeasured. Every document you generate. Untrusted.",
    audioLabel: "The problem explained",
    audioDuration: "0:45",
    audioSeconds: 45,
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 60% 45%, rgba(239,68,68,0.08) 0%, transparent 70%)",
  },
  {
    id: "product",
    color: "#6366f1",
    rgb: "99,102,241",
    eyebrow: "The Product",
    headline: "Six tools. One operating layer. No lock-in.",
    body: "StratOS deliberates. CommandOS coordinates. OutboundOS executes. LucidORG measures. COO Playbook installs the methodology. MAX runs the content.",
    audioLabel: "Product walkthrough",
    audioDuration: "1:00",
    audioSeconds: 60,
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 40% 55%, rgba(99,102,241,0.09) 0%, transparent 70%)",
  },
  {
    id: "vault",
    color: "#8b5cf6",
    rgb: "139,92,246",
    eyebrow: "The Vault",
    headline: "48 domain officers. 3 governance gates. One audit trail.",
    body: "Every decision flagged before it ships. Every agent output logged and traceable.",
    audioLabel: "Vault deep dive",
    audioDuration: "1:30",
    audioSeconds: 90,
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 70% 30%, rgba(139,92,246,0.1) 0%, transparent 70%)",
  },
  {
    id: "library",
    color: "#06b6d4",
    rgb: "6,182,212",
    eyebrow: "Intelligence Library",
    headline: "Purpose-built pods. Not a platform you customize forever.",
    body: "StratOS for decisions. CommandOS for coordination. LinkUpOS, ABM Engine, AutoCS for execution. LucidORG for measurement.",
    audioLabel: "Pod architecture overview",
    audioDuration: "0:50",
    audioSeconds: 50,
    cta: null,
    mesh: "radial-gradient(ellipse 700px 500px at 30% 60%, rgba(6,182,212,0.09) 0%, transparent 70%)",
  },
  {
    id: "start",
    color: "#8b5cf6",
    rgb: "139,92,246",
    eyebrow: "The Full Pitch",
    headline: "Book a 30-minute session. See the whole stack live.",
    body: "No slides. No decks. We run the system in the call. Or listen to the full 5-minute pitch here before you decide.",
    audioLabel: "Full pitch",
    audioDuration: "5:00",
    audioSeconds: 300,
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

export default function ThePullVoice() {
  const [splashDone, setSplashDone] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioPlayedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleComplete = useCallback(() => {
    setSplashDone(true);
    // Show audio prompt shortly after splash completes
    setTimeout(() => setShowAudioPrompt(true), 800);
  }, []);

  const handleSkip = useCallback(() => {
    setSplashDone(true);
    setShowSkip(false);
    setTimeout(() => setShowAudioPrompt(true), 800);
  }, []);

  const enableAudio = useCallback(() => {
    setAudioEnabled(true);
    setShowAudioPrompt(false);
    // Play 40Hz pulse on cube settle
    if (!audioPlayedRef.current) {
      audioPlayedRef.current = true;
      try {
        const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 40;
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } catch {
        // Audio context not available — silent fail
      }
    }
  }, []);

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
  const cubeRotation = activePanel * 9;

  return (
    <div className="pv2-root">
      <style>{`
        .pv2-root {
          background: #030306;
          color: rgba(255,255,255,0.92);
          font-family: var(--font-inter), system-ui, sans-serif;
          height: 100dvh;
          overflow: hidden;
          position: relative;
        }
        .pv2-splash {
          position: fixed; inset: 0; z-index: 50;
          transition: opacity 1.5s ease;
        }
        .pv2-splash.done { opacity: 0; pointer-events: none; }
        .pv2-skip {
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
        .pv2-skip:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.25); }
        /* Audio enable prompt */
        .pv2-audio-prompt {
          position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%);
          z-index: 150;
          display: flex; align-items: center; gap: 0.75rem;
          background: rgba(10,10,20,0.9); border: 1px solid rgba(139,92,246,0.35);
          border-radius: 10px; padding: 0.85rem 1.5rem;
          backdrop-filter: blur(8px);
          animation: prompt-in 0.5s ease forwards;
          white-space: nowrap;
        }
        @keyframes prompt-in { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .pv2-audio-icon {
          font-size: 1.1rem;
          animation: icon-pulse 2s ease-in-out infinite;
        }
        @keyframes icon-pulse { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.12); } }
        .pv2-audio-text {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }
        .pv2-audio-btn {
          padding: 0.4rem 1rem;
          background: rgba(139,92,246,0.2);
          border: 1px solid rgba(139,92,246,0.45);
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          cursor: pointer; transition: background 0.2s ease;
        }
        .pv2-audio-btn:hover { background: rgba(139,92,246,0.35); }
        .pv2-audio-dismiss {
          background: transparent; border: none; padding: 0 0.25rem;
          color: rgba(255,255,255,0.3); cursor: pointer; font-size: 0.9rem;
          transition: color 0.2s ease;
        }
        .pv2-audio-dismiss:hover { color: rgba(255,255,255,0.6); }
        /* Audio enabled indicator */
        .pv2-audio-indicator {
          position: fixed; top: 1.25rem; right: 2rem; z-index: 100;
          display: flex; align-items: center; gap: 0.4rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(139,92,246,0.7); opacity: 0;
          transition: opacity 0.6s ease;
        }
        .pv2-audio-indicator.on { opacity: 1; }
        .pv2-audio-pulse {
          width: 5px; height: 5px; border-radius: 50%; background: #8b5cf6;
          animation: blink 1.5s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
        /* Cube */
        .pv2-cube {
          position: fixed; top: 1.25rem; left: 1.5rem; z-index: 100;
          opacity: 0; transition: opacity 0.8s ease 0.5s; pointer-events: none;
        }
        .pv2-cube.visible { opacity: 1; }
        /* Scroll */
        .pv2-scroll {
          display: flex; height: 100dvh;
          overflow-x: auto; overflow-y: hidden;
          scroll-snap-type: x mandatory; scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .pv2-scroll::-webkit-scrollbar { display: none; }
        /* Panel */
        .pv2-panel {
          min-width: calc(100vw - 36px);
          width: calc(100vw - 36px);
          height: 100dvh; scroll-snap-align: start;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .pv2-panel:last-child { min-width: 100vw; width: 100vw; }
        /* Bleed */
        .pv2-bleed {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 36px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px; opacity: 0.25;
        }
        .pv2-bleed-line { width: 1px; height: 20px; background: rgba(255,255,255,0.4); }
        .pv2-bleed-arrow { font-size: 0.65rem; color: rgba(255,255,255,0.5); }
        /* Panel inner */
        .pv2-inner {
          max-width: 680px; width: 88%;
          display: flex; flex-direction: column; gap: 1.75rem;
          position: relative; z-index: 2;
        }
        .pv2-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.66rem; letter-spacing: 0.18em; text-transform: uppercase;
          display: flex; align-items: center; gap: 0.75rem;
        }
        .pv2-eyebrow::before {
          content: ""; display: inline-block; width: 22px; height: 1px; opacity: 0.6;
        }
        .pv2-headline {
          font-size: clamp(2rem, 4.5vw, 4.25rem);
          font-weight: 900; line-height: 1.07; letter-spacing: -0.035em; margin: 0;
          color: rgba(255,255,255,0.94);
        }
        .pv2-body {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem); line-height: 1.72;
          color: rgba(255,255,255,0.58); max-width: 52ch; margin: 0;
        }
        .pv2-cta {
          padding: 0.9rem 2.5rem; border-radius: 8px;
          color: rgba(255,255,255,0.92); font-weight: 700; font-size: 0.95rem;
          text-decoration: none; width: fit-content; display: inline-block;
          transition: box-shadow 0.25s ease;
        }
        .pv2-swipe-hint {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.63rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.28); animation: swipe-r 2s ease-in-out infinite;
        }
        @keyframes swipe-r { 0%,100%{ transform:translateX(0); } 50%{ transform:translateX(5px); } }
        /* Progress dots */
        .pv2-dots {
          position: fixed; bottom: 1.75rem; left: 50%; transform: translateX(-50%);
          display: flex; gap: 6px; z-index: 100;
          opacity: 0; transition: opacity 0.8s ease 0.5s;
        }
        .pv2-dots.visible { opacity: 1; }
        .pv2-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.15); border: none; padding: 0;
          cursor: pointer; transition: background 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
        }
        .pv2-dot.active {
          background: var(--pv2-dot-color, #8b5cf6);
          transform: scale(1.45);
          box-shadow: 0 0 10px var(--pv2-dot-color, rgba(139,92,246,0.7));
        }
        @media (max-width: 640px) {
          .pv2-headline { font-size: clamp(1.8rem, 7vw, 2.75rem); }
          .pv2-audio-prompt { white-space: normal; max-width: calc(100vw - 2rem); }
        }
      `}</style>

      {/* Canvas Splash */}
      <div className={`pv2-splash ${splashDone ? "done" : ""}`}>
        <ParticleCubeCanvas onComplete={handleComplete} />
      </div>

      {/* Skip */}
      {showSkip && !splashDone && (
        <button className="pv2-skip" onClick={handleSkip}>Skip intro</button>
      )}

      {/* Audio enable prompt */}
      {showAudioPrompt && !audioEnabled && (
        <div className="pv2-audio-prompt">
          <span className="pv2-audio-icon">🔊</span>
          <span className="pv2-audio-text">Enable sound</span>
          <button className="pv2-audio-btn" onClick={enableAudio}>Enable</button>
          <button className="pv2-audio-dismiss" onClick={() => setShowAudioPrompt(false)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Audio indicator */}
      <div className={`pv2-audio-indicator ${audioEnabled ? "on" : ""}`}>
        <div className="pv2-audio-pulse" />
        Audio on
      </div>

      {/* Mini cube */}
      <div className={`pv2-cube ${splashDone ? "visible" : ""}`}>
        <MiniCube rotation={cubeRotation} color={panel.color} />
      </div>

      {/* Progress dots */}
      <div className={`pv2-dots ${splashDone ? "visible" : ""}`}>
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            className={`pv2-dot ${i === activePanel ? "active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Panel ${i + 1}`}
            style={{ "--pv2-dot-color": p.color } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Panels */}
      {splashDone && (
        <div ref={scrollRef} className="pv2-scroll">
          {PANELS.map((p, i) => (
            <div key={p.id} className="pv2-panel">
              {/* Mesh */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: p.mesh,
              }} />

              <div className="pv2-inner">
                <FadeIn>
                  <div className="pv2-eyebrow" style={{ color: p.color }}>
                    <style>{`.pv2-eyebrow::before { background: ${p.color}; }`}</style>
                    {p.eyebrow}
                  </div>
                </FadeIn>
                <FadeIn delay={0.08}>
                  <h2 className="pv2-headline">{p.headline}</h2>
                </FadeIn>
                <FadeIn delay={0.14}>
                  <p className="pv2-body">{p.body}</p>
                </FadeIn>

                {/* Waveform player */}
                <FadeIn delay={0.2}>
                  <WaveformPlayer
                    durationLabel={p.audioDuration}
                    durationSeconds={p.audioSeconds}
                    rgb={p.rgb}
                    label={p.audioLabel}
                  />
                </FadeIn>

                {p.cta && (
                  <FadeIn delay={0.28}>
                    <a
                      href="#"
                      className="pv2-cta"
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
                  <FadeIn delay={0.6}>
                    <div className="pv2-swipe-hint">
                      <span>&#8594;</span> Swipe to continue
                    </div>
                  </FadeIn>
                )}
              </div>

              {/* Bleed */}
              {i < PANELS.length - 1 && (
                <div className="pv2-bleed">
                  <div className="pv2-bleed-line" />
                  <span className="pv2-bleed-arrow">&#8250;</span>
                  <div className="pv2-bleed-line" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

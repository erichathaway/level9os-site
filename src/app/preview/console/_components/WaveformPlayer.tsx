"use client";

import { useState } from "react";

interface WaveformPlayerProps {
  bars: number;
  index: number;
}

// Deterministic bar heights from index seed — no randomness on each render
function getBarHeights(bars: number, seed: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < bars; i++) {
    // Simple pseudo-random based on position and seed
    const t = Math.sin((i + seed * 7.3) * 2.1 + seed) * 0.5 + 0.5;
    result.push(Math.max(0.15, t));
  }
  return result;
}

export default function WaveformPlayer({ bars, index }: WaveformPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const heights = getBarHeights(bars, index);

  return (
    <>
      <style>{`
        .wfp-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .wfp-bars {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 2px;
          height: 32px;
          overflow: hidden;
        }
        .wfp-bar {
          flex: 1;
          border-radius: 2px;
          background: rgba(139,92,246,0.3);
          transition: background 0.3s ease;
        }
        .wfp-bar.playing {
          background: rgba(139,92,246,0.7);
          animation: wfp-pulse 0.8s ease-in-out infinite;
        }
        @keyframes wfp-pulse {
          0%,100% { opacity: 0.6; transform: scaleY(0.8); }
          50%      { opacity: 1;   transform: scaleY(1);   }
        }
        .wfp-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.25);
          color: var(--violet);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
          flex-shrink: 0;
        }
        .wfp-btn:hover {
          background: rgba(139,92,246,0.22);
          border-color: var(--violet);
        }
        .wfp-btn.playing {
          background: rgba(139,92,246,0.25);
          border-color: var(--violet);
          box-shadow: 0 0 12px rgba(139,92,246,0.4);
        }
        .wfp-note {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem;
          color: var(--text-ghost);
          letter-spacing: 0.06em;
          margin-top: 0.25rem;
        }
      `}</style>

      <div className="wfp-row">
        <div className="wfp-bars">
          {heights.map((h, i) => (
            <div
              key={i}
              className={`wfp-bar ${playing ? "playing" : ""}`}
              style={{
                height: `${Math.round(h * 100)}%`,
                animationDelay: playing ? `${(i * 40) % 800}ms` : "0ms",
              }}
            />
          ))}
        </div>

        <button
          className={`wfp-btn ${playing ? "playing" : ""}`}
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <rect x="0" y="0" width="3.5" height="12" rx="1.5" />
              <rect x="6.5" y="0" width="3.5" height="12" rx="1.5" />
            </svg>
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <path d="M1 0.5L9.5 6L1 11.5V0.5Z" />
            </svg>
          )}
        </button>
      </div>

      <p className="wfp-note">Audio placeholder. Production will stream from cmd_secrets vault.</p>
    </>
  );
}

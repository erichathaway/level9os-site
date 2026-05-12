"use client";
/**
 * WaveformPlayer
 * Static waveform SVG with play/pause toggle.
 * Simulates playback by advancing a progress bar over fake duration.
 * No real audio. Real ElevenLabs clips wire in later.
 */

import { useState, useEffect, useRef } from "react";

interface Props {
  durationLabel: string;  // e.g. "0:30", "1:30", "5:00"
  durationSeconds: number;
  rgb: string;
  label: string;
}

// Static waveform: 48 bars of varying heights
const BARS = [
  4,8,14,22,18,30,24,16,34,28,20,38,32,26,42,36,30,46,40,34,38,30,26,22,
  18,24,30,36,42,38,32,28,24,30,36,42,38,34,28,24,20,16,22,28,34,28,22,12
];

export default function WaveformPlayer({ durationLabel, durationSeconds, rgb, label }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      const tick = 100; // ms
      const increment = tick / (durationSeconds * 1000);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + increment;
          if (next >= 1) {
            setPlaying(false);
            return 0;
          }
          return next;
        });
      }, tick);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, durationSeconds]);

  const toggle = () => {
    if (progress >= 1) setProgress(0);
    setPlaying(p => !p);
  };

  const elapsed = Math.floor(progress * durationSeconds);
  const elMin = Math.floor(elapsed / 60);
  const elSec = elapsed % 60;
  const elStr = `${elMin}:${String(elSec).padStart(2, "0")}`;

  const splitPoint = Math.floor(progress * BARS.length);

  return (
    <div className="wf-root">
      <style>{`
        .wf-root {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(4px);
          position: relative;
          overflow: hidden;
        }
        .wf-root::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(${rgb}, 0.4);
        }
        .wf-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .wf-label {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          flex: 1;
        }
        .wf-duration {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.28);
        }
        .wf-play-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(${rgb},0.5);
          background: rgba(${rgb},0.1);
          color: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease;
          flex-shrink: 0;
          font-size: 0.8rem;
        }
        .wf-play-btn:hover {
          background: rgba(${rgb},0.22);
          box-shadow: 0 0 12px rgba(${rgb},0.4);
        }
        /* Waveform bars */
        .wf-bars {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 48px;
          cursor: pointer;
        }
        .wf-bar {
          flex: 1;
          border-radius: 2px;
          min-height: 3px;
          transition: background 0.1s ease;
        }
        /* Time display */
        .wf-time {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.25);
        }
        .wf-time-current {
          color: rgba(${rgb},0.85);
        }
      `}</style>

      <div className="wf-header">
        <div className="wf-label">{label}</div>
        <div className="wf-duration">{durationLabel}</div>
        <button
          className="wf-play-btn"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶"}
        </button>
      </div>

      <div className="wf-bars" onClick={toggle}>
        {BARS.map((h, i) => {
          const filled = i < splitPoint;
          return (
            <div
              key={i}
              className="wf-bar"
              style={{
                height: `${h}px`,
                background: filled
                  ? `rgba(${rgb},${0.5 + (h / 48) * 0.5})`
                  : `rgba(255,255,255,${0.08 + (h / 48) * 0.1})`,
              }}
            />
          );
        })}
      </div>

      <div className="wf-time">
        <span className="wf-time-current">{elStr}</span>
        <span>{durationLabel}</span>
      </div>
    </div>
  );
}

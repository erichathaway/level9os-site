"use client";

import { useEffect, useState } from "react";

/**
 * LiveTicker — mission-control HUD strip showing the operating system is alive.
 * Status codes, not vanity counts. No claimed numbers.
 */
const defaultMetrics = [
  { label: "STRATOS", value: "NOMINAL", color: "#8b5cf6" },
  { label: "COMMANDOS", value: "NOMINAL", color: "#10b981" },
  { label: "LINKUPOS", value: "LIVE", color: "#f59e0b" },
  { label: "GOVERNANCE", value: "GREEN", color: "#06b6d4" },
  { label: "DOGFOOD", value: "CONTINUOUS", color: "#ec4899" },
];

export default function LiveTicker({
  metrics = defaultMetrics,
  interval = 2800,
}: {
  metrics?: typeof defaultMetrics;
  interval?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % metrics.length), interval);
    return () => clearInterval(id);
  }, [metrics.length, interval]);

  const current = metrics[idx];

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0a0a14]/80 backdrop-blur-xl border border-white/[0.06] shadow-lg shadow-black/40">
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: current.color, boxShadow: `0 0 8px ${current.color}` }}
        />
        <span className="text-[8px] font-mono tracking-[0.2em] text-white/40 uppercase">LIVE</span>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <div className="flex items-center gap-2 min-w-[160px]">
        <span className="text-[9px] font-mono text-white/40 tracking-wider">{current.label}</span>
        <span className="text-xs font-bold tracking-wider" style={{ color: current.color }}>
          · {current.value}
        </span>
      </div>
    </div>
  );
}

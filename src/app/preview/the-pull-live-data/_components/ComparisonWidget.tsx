"use client";
/**
 * ComparisonWidget
 * Three-column (Claude, GPT, Gemini) x three-row (Cost, Lying Risk, Quality) interactive table.
 * Hover/tap a row to see micro-detail. Static data. Feels alive.
 */

import { useState } from "react";

const MODELS = [
  { name: "Claude", color: "#8b5cf6", rgb: "139,92,246" },
  { name: "GPT", color: "#10b981", rgb: "16,185,129" },
  { name: "Gemini", color: "#06b6d4", rgb: "6,182,212" },
];

const ROWS = [
  {
    id: "cost",
    label: "Cost per task",
    icon: "$",
    values: ["$0.012", "$0.018", "$0.009"],
    details: [
      "Optimized via prompt caching and context compression. Lowest at scale.",
      "Higher per-call cost. No native caching at SMB tier without engineering overhead.",
      "Competitive unit cost, but inconsistent output quality raises retry rate.",
    ],
    winner: 2, // Gemini lowest
  },
  {
    id: "risk",
    label: "Hallucination risk",
    icon: "!",
    values: ["LOW", "MEDIUM", "LOW"],
    colors: ["#10b981", "#f59e0b", "#10b981"],
    details: [
      "Constitutional AI training significantly reduces confident fabrication rate in structured tasks.",
      "Higher hallucination rate on fact-dense B2B tasks without retrieval augmentation.",
      "Strong on factual tasks, but reasoning chains degrade under complex multi-step prompts.",
    ],
    winner: 0, // Claude — equal but first
  },
  {
    id: "quality",
    label: "Quality score",
    icon: "Q",
    values: ["94", "91", "87"],
    details: [
      "Scored across reasoning depth, formatting fidelity, and instruction adherence on 200 SMB tasks.",
      "Strong general performance. Scores drop 8 points on nuanced operator-level instructions.",
      "Best for speed. Scores drop on multi-constraint tasks requiring structured output.",
    ],
    winner: 0, // Claude
  },
];

export default function ComparisonWidget() {
  const [activeRow, setActiveRow] = useState<string | null>(null);

  return (
    <div className="cw-root">
      <style>{`
        .cw-root {
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.02);
        }
        /* Header row */
        .cw-header {
          display: grid;
          grid-template-columns: 1.4fr repeat(3, 1fr);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .cw-header-cell {
          padding: 0.75rem 1rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cw-header-cell:first-child {
          color: rgba(255,255,255,0.35);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
        }
        .cw-model-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        /* Data row */
        .cw-row {
          display: grid;
          grid-template-columns: 1.4fr repeat(3, 1fr);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: background 0.2s ease;
          position: relative;
        }
        .cw-row:last-child {
          border-bottom: none;
        }
        .cw-row:hover, .cw-row.active {
          background: rgba(255,255,255,0.04);
        }
        .cw-row-label {
          padding: 1rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .cw-row-icon {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.6rem;
          color: rgba(255,255,255,0.5);
          font-weight: 700;
        }
        .cw-row-name {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .cw-cell {
          padding: 1rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cw-value {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: rgba(255,255,255,0.85);
          position: relative;
        }
        .cw-value.winner::after {
          content: "▲";
          position: absolute;
          top: -8px;
          right: -12px;
          font-size: 0.45rem;
          color: #10b981;
          opacity: 0.8;
        }
        .cw-risk-badge {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        /* Detail expansion */
        .cw-detail-row {
          display: grid;
          grid-template-columns: 1.4fr repeat(3, 1fr);
          background: rgba(255,255,255,0.025);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .cw-detail-row.open {
          max-height: 160px;
        }
        .cw-detail-empty {
          padding: 0.75rem 1rem;
        }
        .cw-detail-cell {
          padding: 0.75rem 1rem;
          font-size: 0.72rem;
          line-height: 1.55;
          color: rgba(255,255,255,0.45);
        }
        /* Tap hint */
        .cw-hint {
          padding: 0.6rem 1rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          border-top: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        @media (max-width: 500px) {
          .cw-header-cell, .cw-value { font-size: 0.78rem; }
          .cw-cell { padding: 0.75rem 0.5rem; }
          .cw-row-label { padding: 0.75rem 0.5rem; }
          .cw-detail-cell { padding: 0.5rem 0.5rem; font-size: 0.65rem; }
        }
      `}</style>

      {/* Header */}
      <div className="cw-header">
        <div className="cw-header-cell">Metric</div>
        {MODELS.map(m => (
          <div key={m.name} className="cw-header-cell">
            <div className="cw-model-dot" style={{ background: m.color }} />
            {m.name}
          </div>
        ))}
      </div>

      {/* Data rows */}
      {ROWS.map((row) => {
        const isActive = activeRow === row.id;
        return (
          <div key={row.id}>
            <div
              className={`cw-row ${isActive ? "active" : ""}`}
              onClick={() => setActiveRow(isActive ? null : row.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && setActiveRow(isActive ? null : row.id)}
              aria-expanded={isActive}
            >
              <div className="cw-row-label">
                <div className="cw-row-icon">{row.icon}</div>
                <div className="cw-row-name">{row.label}</div>
              </div>
              {row.values.map((val, mi) => (
                <div key={mi} className="cw-cell">
                  {row.id === "risk" && row.colors ? (
                    <span
                      className="cw-risk-badge"
                      style={{
                        color: row.colors[mi],
                        background: `${row.colors[mi]}20`,
                        border: `1px solid ${row.colors[mi]}40`,
                      }}
                    >
                      {val}
                    </span>
                  ) : (
                    <span
                      className={`cw-value ${mi === row.winner ? "winner" : ""}`}
                      style={{ color: mi === row.winner ? MODELS[mi].color : "rgba(255,255,255,0.85)" }}
                    >
                      {val}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Detail expansion */}
            <div className={`cw-detail-row ${isActive ? "open" : ""}`}>
              <div className="cw-detail-empty" />
              {row.details.map((d, mi) => (
                <div key={mi} className="cw-detail-cell" style={{ borderLeft: `1px solid rgba(${MODELS[mi].rgb},0.15)` }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="cw-hint">Tap a row for detail</div>
    </div>
  );
}

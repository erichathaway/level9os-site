"use client";
/**
 * /preview/the-sandbox
 * Metaphor: Visitor lands inside a working agent governance dashboard.
 * They USE the product to learn it. No pitch first — the product demos itself.
 */

import { useState } from "react";
import { Counter } from "@level9/brand/components/motion";

const AUDIT_EVENTS = [
  { id: 1, ts: "14:32:01", agent: "Claude Sonnet 4.6", action: "Attempted broad find scan", verdict: "REROUTED", verdictColor: "#f59e0b", detail: "Cost-router redirected to Haiku. $0.71 saved.", savings: "$0.71" },
  { id: 2, ts: "14:31:48", agent: "Claude Opus 4.5", action: "Claimed task complete without verification", verdict: "BLOCKED", verdictColor: "#ef4444", detail: "Stop hook fired. Agent required to run build before done-claim accepted.", savings: "$86.67" },
  { id: 3, ts: "14:31:22", agent: "Claude Sonnet 4.6", action: "Attempted write to ~/.claude/hooks/", verdict: "BLOCKED", verdictColor: "#ef4444", detail: "Protected-resource block. Load-bearing governance file. Operator notified.", savings: "$110.00" },
  { id: 4, ts: "14:30:55", agent: "Claude Opus 4.5", action: "Reversed prior done-claim mid-session", verdict: "FLAGGED", verdictColor: "#8b5cf6", detail: "Lie detector caught reversal. Session cost +$33.71. Operator pivoted.", savings: "$33.71" },
  { id: 5, ts: "14:30:33", agent: "Claude Sonnet 4.6", action: "Shipped unverified claim to production", verdict: "BLOCKED", verdictColor: "#ef4444", detail: "Flub event caught before deploy. Prevented $250 prod-fix cost.", savings: "$250.00" },
  { id: 6, ts: "14:29:41", agent: "Claude Haiku 3.5", action: "Bulk grep across 200MB jsonl", verdict: "ALLOWED", verdictColor: "#10b981", detail: "Correct model tier. Cost-router approved.", savings: "$0.00" },
  { id: 7, ts: "14:29:12", agent: "Claude Opus 4.5", action: "Attempted direct Supabase DELETE on cmd_secrets", verdict: "BLOCKED", verdictColor: "#ef4444", detail: "Protected table. No capability grant active. Operator must elevate.", savings: "$110.00" },
  { id: 8, ts: "14:28:54", agent: "Claude Sonnet 4.6", action: "Completed code refactor, ran build verify", verdict: "ALLOWED", verdictColor: "#10b981", detail: "Build passed. Stop hook satisfied. Done-claim accepted.", savings: "$0.00" },
  { id: 9, ts: "14:28:19", agent: "Claude Opus 4.5", action: "Claimed 'done' with no evidence test provided", verdict: "BLOCKED", verdictColor: "#ef4444", detail: "Stop hook: 'done = evidence test.' Session required to re-verify.", savings: "$86.67" },
  { id: 10, ts: "14:27:44", agent: "Claude Sonnet 4.6", action: "Used em dash in user-facing copy", verdict: "FLAGGED", verdictColor: "#8b5cf6", detail: "Voice rule violation. Content rejected. Operator re-briefed.", savings: "$33.71" },
];

const VENDOR_DATA = [
  { name: "Claude (Level9)", cost: "$0.04", quality: 94, lyingRisk: "2%", color: "#8b5cf6", rgb: "139,92,246", governed: true },
  { name: "GPT-4o", cost: "$0.11", quality: 88, lyingRisk: "31%", color: "#10b981", rgb: "16,185,129", governed: false },
  { name: "Gemini 1.5", cost: "$0.09", quality: 82, lyingRisk: "26%", color: "#06b6d4", rgb: "6,182,212", governed: false },
];

const NAV_ITEMS = [
  { id: "agents", label: "Agents", icon: "◈" },
  { id: "events", label: "Events", icon: "◎" },
  { id: "audit", label: "Audit", icon: "◉" },
  { id: "library", label: "Library", icon: "◧" },
  { id: "settings", label: "Settings", icon: "◌" },
];

export default function TheSandbox() {
  const [activeNav, setActiveNav] = useState("events");
  const [expandedEvent, setExpandedEvent] = useState<number | null>(2);
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);

  return (
    <div className="sb-root">
      <style>{`
        .sb-root {
          min-height: 100dvh;
          background: #080810;
          color: rgba(255,255,255,0.88);
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
          display: flex;
          flex-direction: column;
        }
        /* Top ribbon */
        .sb-ribbon {
          height: 40px;
          background: #0d0d1a;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          gap: 1.5rem;
          flex-shrink: 0;
        }
        .sb-ribbon-logo {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(139,92,246,0.9);
        }
        .sb-ribbon-tagline {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.22);
          letter-spacing: 0.06em;
          flex: 1;
        }
        .sb-ribbon-status {
          font-size: 0.62rem;
          color: rgba(16,185,129,0.8);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .sb-ribbon-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #10b981;
          animation: sb-pulse 2s ease-in-out infinite;
        }
        @keyframes sb-pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        /* Main layout */
        .sb-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        /* Sidebar */
        .sb-sidebar {
          width: 200px;
          background: #0a0a14;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0;
          flex-shrink: 0;
        }
        .sb-nav-section {
          font-size: 0.55rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          padding: 0 1.25rem;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        .sb-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.55rem 1.25rem;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.45);
          border-right: 2px solid transparent;
        }
        .sb-nav-item:hover { background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.75); }
        .sb-nav-item.active {
          color: rgba(139,92,246,0.95);
          background: rgba(139,92,246,0.07);
          border-right-color: #8b5cf6;
        }
        .sb-nav-icon { font-size: 0.9rem; opacity: 0.7; }
        /* Main content */
        .sb-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        /* Metrics strip */
        .sb-metrics {
          display: flex;
          gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: #09091280;
          flex-shrink: 0;
        }
        .sb-metric {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border-right: 1px solid rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .sb-metric:last-child { border-right: none; }
        .sb-metric-label {
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }
        .sb-metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: rgba(255,255,255,0.92);
          letter-spacing: -0.02em;
          font-family: ui-monospace, monospace;
        }
        .sb-metric-sub {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.28);
        }
        .sb-metric-value.green { color: #10b981; }
        .sb-metric-value.violet { color: #8b5cf6; }
        .sb-metric-value.amber { color: #f59e0b; }
        /* Two-panel area */
        .sb-panels {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        /* Event feed */
        .sb-feed-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .sb-panel-header {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          flex-shrink: 0;
        }
        .sb-panel-header-count {
          background: rgba(139,92,246,0.15);
          color: rgba(139,92,246,0.9);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 4px;
          padding: 0.15rem 0.5rem;
          font-size: 0.6rem;
        }
        .sb-feed {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem 0;
        }
        .sb-feed::-webkit-scrollbar { width: 4px; }
        .sb-feed::-webkit-scrollbar-track { background: transparent; }
        .sb-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .sb-event {
          padding: 0.7rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .sb-event:hover { background: rgba(255,255,255,0.025); }
        .sb-event.expanded { background: rgba(139,92,246,0.04); }
        .sb-event-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .sb-event-ts {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.22);
          width: 52px;
          flex-shrink: 0;
        }
        .sb-event-agent {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.45);
          width: 140px;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-event-action {
          flex: 1;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-event-verdict {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .sb-event-savings {
          font-size: 0.65rem;
          width: 60px;
          text-align: right;
          flex-shrink: 0;
          font-weight: 600;
        }
        .sb-event-detail {
          margin-top: 0.6rem;
          padding: 0.65rem 0.875rem;
          background: rgba(255,255,255,0.03);
          border-left: 2px solid rgba(139,92,246,0.4);
          border-radius: 4px;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.55;
        }
        /* Right panel: comparison */
        .sb-right-panel {
          width: 340px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
        }
        .sb-vendor-list {
          flex: 1;
          padding: 0.75rem 0;
          overflow-y: auto;
        }
        .sb-vendor-row {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer;
          transition: background 0.15s ease;
          position: relative;
        }
        .sb-vendor-row:hover { background: rgba(255,255,255,0.025); }
        .sb-vendor-row.hovered { background: rgba(255,255,255,0.04); }
        .sb-vendor-name {
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sb-vendor-governed {
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(16,185,129,0.1);
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 3px;
          padding: 0.1rem 0.4rem;
        }
        .sb-vendor-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .sb-vendor-stat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .sb-vendor-stat-label {
          font-size: 0.55rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .sb-vendor-stat-value {
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
        }
        .sb-vendor-bar-bg {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          margin-top: 0.75rem;
          overflow: hidden;
        }
        .sb-vendor-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        /* Mobile: hide sidebar */
        @media (max-width: 900px) {
          .sb-sidebar { display: none; }
          .sb-right-panel { display: none; }
        }
        @media (max-width: 600px) {
          .sb-metrics { flex-wrap: wrap; }
          .sb-metric { min-width: 50%; }
        }
      `}</style>

      {/* Top ribbon */}
      <div className="sb-ribbon">
        <span className="sb-ribbon-logo">Level9OS</span>
        <span className="sb-ribbon-tagline">Your first AI operating system. Or your last one.</span>
        <div className="sb-ribbon-status">
          <div className="sb-ribbon-dot" />
          Governance active
        </div>
      </div>

      <div className="sb-body">
        {/* Sidebar */}
        <nav className="sb-sidebar">
          <div className="sb-nav-section">Workspace</div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`sb-nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="sb-nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* Main content */}
        <div className="sb-content">
          {/* Metrics strip */}
          <div className="sb-metrics">
            <div className="sb-metric">
              <div className="sb-metric-label">Prevented (90d)</div>
              <div className="sb-metric-value green">$<Counter target={52686} /></div>
              <div className="sb-metric-sub">$17,562/mo run rate</div>
            </div>
            <div className="sb-metric">
              <div className="sb-metric-label">Hours Saved (90d)</div>
              <div className="sb-metric-value violet"><Counter target={236} /></div>
              <div className="sb-metric-sub">~79 hr/month</div>
            </div>
            <div className="sb-metric">
              <div className="sb-metric-label">ROI Ratio</div>
              <div className="sb-metric-value amber"><Counter target={3464} />x</div>
              <div className="sb-metric-sub">on $5.07/mo infra</div>
            </div>
            <div className="sb-metric">
              <div className="sb-metric-label">Today (range)</div>
              <div className="sb-metric-value" style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem" }}>$236 – $4,284</div>
              <div className="sb-metric-sub">mined vs hook-layer</div>
            </div>
          </div>

          {/* Panels */}
          <div className="sb-panels">
            {/* Audit event feed */}
            <div className="sb-feed-panel">
              <div className="sb-panel-header">
                Audit event stream
                <span className="sb-panel-header-count">1,033 events / 90d</span>
              </div>
              <div className="sb-feed">
                {AUDIT_EVENTS.map((ev) => (
                  <div
                    key={ev.id}
                    className={`sb-event ${expandedEvent === ev.id ? "expanded" : ""}`}
                    onClick={() => setExpandedEvent(expandedEvent === ev.id ? null : ev.id)}
                  >
                    <div className="sb-event-row">
                      <span className="sb-event-ts">{ev.ts}</span>
                      <span className="sb-event-agent">{ev.agent}</span>
                      <span className="sb-event-action">{ev.action}</span>
                      <span
                        className="sb-event-verdict"
                        style={{
                          color: ev.verdictColor,
                          background: `${ev.verdictColor}18`,
                          border: `1px solid ${ev.verdictColor}30`,
                        }}
                      >
                        {ev.verdict}
                      </span>
                      <span className="sb-event-savings" style={{ color: ev.savings === "$0.00" ? "rgba(255,255,255,0.22)" : "#10b981" }}>
                        {ev.savings !== "$0.00" ? ev.savings : "—"}
                      </span>
                    </div>
                    {expandedEvent === ev.id && (
                      <div className="sb-event-detail">{ev.detail}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor comparison */}
            <div className="sb-right-panel">
              <div className="sb-panel-header">
                Vendor comparison
              </div>
              <div className="sb-vendor-list">
                {VENDOR_DATA.map((v) => (
                  <div
                    key={v.name}
                    className={`sb-vendor-row ${hoveredVendor === v.name ? "hovered" : ""}`}
                    onMouseEnter={() => setHoveredVendor(v.name)}
                    onMouseLeave={() => setHoveredVendor(null)}
                  >
                    <div className="sb-vendor-name" style={{ color: v.color }}>
                      {v.name}
                      {v.governed && <span className="sb-vendor-governed">Governed</span>}
                    </div>
                    <div className="sb-vendor-stats">
                      <div className="sb-vendor-stat">
                        <span className="sb-vendor-stat-label">Cost/task</span>
                        <span className="sb-vendor-stat-value">{v.cost}</span>
                      </div>
                      <div className="sb-vendor-stat">
                        <span className="sb-vendor-stat-label">Quality</span>
                        <span className="sb-vendor-stat-value">{v.quality}%</span>
                      </div>
                      <div className="sb-vendor-stat">
                        <span className="sb-vendor-stat-label">Lie risk</span>
                        <span className="sb-vendor-stat-value" style={{ color: v.lyingRisk === "2%" ? "#10b981" : "#ef4444" }}>
                          {v.lyingRisk}
                        </span>
                      </div>
                    </div>
                    <div className="sb-vendor-bar-bg">
                      <div
                        className="sb-vendor-bar-fill"
                        style={{ width: `${v.quality}%`, background: v.color }}
                      />
                    </div>
                  </div>
                ))}
                <div style={{ padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.22)", lineHeight: 1.7 }}>
                    Lie risk = reversal rate from 299 sessions, 90-day window.<br />
                    Cost/task = avg Haiku task via cost-router.<br />
                    Quality = operator-rated outcome score.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

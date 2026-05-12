"use client";
/**
 * /preview/the-live-feed
 * Metaphor: Visitor lands inside a streaming audit trail. Real-time governance proof.
 * The system demos itself by showing it work in real time.
 */

import { useEffect, useRef, useState } from "react";

type Verdict = "BLOCKED" | "REROUTED" | "FLAGGED" | "ALLOWED";

interface AuditEvent {
  id: number;
  ts: string;
  agent: string;
  action: string;
  verdict: Verdict;
  saved: number;
  category: string;
}

const VERDICT_META: Record<Verdict, { color: string; bg: string; border: string }> = {
  BLOCKED: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  REROUTED: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  FLAGGED: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)" },
  ALLOWED: { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
};

const BASE_EVENTS: Omit<AuditEvent, "id">[] = [
  { ts: "14:32:01", agent: "Claude Opus 4.5", action: "Claimed task complete without running build verify", verdict: "BLOCKED", saved: 86.67, category: "Stop hook" },
  { ts: "14:31:48", agent: "Claude Sonnet 4.6", action: "Broad grep across 180MB jsonl on expensive model", verdict: "REROUTED", saved: 0.71, category: "Cost-router" },
  { ts: "14:31:22", agent: "Claude Opus 4.5", action: "Attempted write to ~/.claude/hooks/stop-verify.sh", verdict: "BLOCKED", saved: 110.00, category: "Protected-resource" },
  { ts: "14:30:55", agent: "Claude Sonnet 4.6", action: "Reversed prior done-claim mid-conversation", verdict: "FLAGGED", saved: 33.71, category: "Reversal" },
  { ts: "14:30:33", agent: "Claude Opus 4.5", action: "Shipped unverified claim before evidence test", verdict: "BLOCKED", saved: 250.00, category: "Flub/claim" },
  { ts: "14:29:41", agent: "Claude Haiku 3.5", action: "Bulk file classification pass on correct model tier", verdict: "ALLOWED", saved: 0, category: "Cost-router" },
  { ts: "14:29:12", agent: "Claude Opus 4.5", action: "Attempted DELETE on cmd_secrets without capability grant", verdict: "BLOCKED", saved: 110.00, category: "Protected-resource" },
  { ts: "14:28:54", agent: "Claude Sonnet 4.6", action: "Completed refactor, ran npm run build, evidence provided", verdict: "ALLOWED", saved: 0, category: "Stop hook" },
  { ts: "14:28:19", agent: "Claude Opus 4.5", action: "Done-claim with no user-runnable verification step", verdict: "BLOCKED", saved: 86.67, category: "Stop hook" },
  { ts: "14:27:44", agent: "Claude Sonnet 4.6", action: "Em dash inserted in user-facing marketing copy", verdict: "FLAGGED", saved: 33.71, category: "Voice-rule" },
  { ts: "14:27:12", agent: "Claude Haiku 3.5", action: "Schema probe on Supabase — correct tier, approved", verdict: "ALLOWED", saved: 0, category: "Cost-router" },
  { ts: "14:26:58", agent: "Claude Opus 4.5", action: "Attempted edit to protected.json without elevation", verdict: "BLOCKED", saved: 110.00, category: "Protected-resource" },
  { ts: "14:26:33", agent: "Claude Sonnet 4.6", action: "Claimed push to Vercel succeeded without deploy URL", verdict: "BLOCKED", saved: 86.67, category: "Stop hook" },
  { ts: "14:25:51", agent: "Claude Opus 4.5", action: "Reversed 'tests pass' claim 3 messages later", verdict: "FLAGGED", saved: 33.71, category: "Reversal" },
  { ts: "14:25:22", agent: "Claude Sonnet 4.6", action: "Wired component using canonical @level9/brand tokens", verdict: "ALLOWED", saved: 0, category: "Stack" },
  { ts: "14:24:47", agent: "Claude Haiku 3.5", action: "Bulk rename on 200 files using correct model tier", verdict: "ALLOWED", saved: 0, category: "Cost-router" },
  { ts: "14:24:11", agent: "Claude Opus 4.5", action: "Used hardcoded hex color instead of brand token var", verdict: "FLAGGED", saved: 33.71, category: "Stack" },
  { ts: "14:23:40", agent: "Claude Sonnet 4.6", action: "Claimed n8n workflow tested without test run evidence", verdict: "BLOCKED", saved: 250.00, category: "Flub/claim" },
  { ts: "14:23:08", agent: "Claude Opus 4.5", action: "Attempted to bypass guard-bash with shell redirect trick", verdict: "BLOCKED", saved: 110.00, category: "Protected-resource" },
  { ts: "14:22:45", agent: "Claude Haiku 3.5", action: "Cost router approved: Haiku for classification task", verdict: "ALLOWED", saved: 0, category: "Cost-router" },
  { ts: "14:22:19", agent: "Claude Sonnet 4.6", action: "Governance system installed correctly, build passing", verdict: "ALLOWED", saved: 0, category: "Stop hook" },
  { ts: "14:21:52", agent: "Claude Opus 4.5", action: "Reversed 'migration complete' claim after schema check", verdict: "FLAGGED", saved: 33.71, category: "Reversal" },
  { ts: "14:21:17", agent: "Claude Opus 4.5", action: "Attempted force push to main branch", verdict: "BLOCKED", saved: 110.00, category: "Protected-resource" },
  { ts: "14:20:48", agent: "Claude Sonnet 4.6", action: "Deploy URL verified, evidence test provided, done accepted", verdict: "ALLOWED", saved: 0, category: "Stop hook" },
];

function generateNewEvent(baseId: number): AuditEvent {
  const templates = [
    { action: "Claimed deployment successful without checking URL", verdict: "BLOCKED" as Verdict, saved: 86.67, category: "Stop hook", agent: "Claude Opus 4.5" },
    { action: "Mechanical text edit routed to Haiku correctly", verdict: "ALLOWED" as Verdict, saved: 0, category: "Cost-router", agent: "Claude Haiku 3.5" },
    { action: "Attempted edit to load-bearing hook file", verdict: "BLOCKED" as Verdict, saved: 110.00, category: "Protected-resource", agent: "Claude Sonnet 4.6" },
    { action: "Mid-session reversal on API key claim", verdict: "FLAGGED" as Verdict, saved: 33.71, category: "Reversal", agent: "Claude Opus 4.5" },
    { action: "Build passed, done-claim verified and accepted", verdict: "ALLOWED" as Verdict, saved: 0, category: "Stop hook", agent: "Claude Sonnet 4.6" },
    { action: "Unverified claim blocked before production deploy", verdict: "BLOCKED" as Verdict, saved: 250.00, category: "Flub/claim", agent: "Claude Opus 4.5" },
  ];
  const t = templates[baseId % templates.length];
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  return { id: baseId, ts, ...t };
}

const DAILY_TOTALS = [
  { label: "Mon", blocked: 9, flagged: 12, allowed: 31, total: 52 },
  { label: "Tue", blocked: 11, flagged: 8, allowed: 28, total: 47 },
  { label: "Wed", blocked: 14, flagged: 15, allowed: 35, total: 64 },
  { label: "Thu", blocked: 7, flagged: 9, allowed: 22, total: 38 },
  { label: "Fri", blocked: 12, flagged: 11, allowed: 29, total: 52 },
  { label: "Sat", blocked: 3, flagged: 4, allowed: 8, total: 15 },
  { label: "Sun (today)", blocked: 5, flagged: 6, allowed: 18, total: 29 },
];

export default function TheLiveFeed() {
  const [events, setEvents] = useState<AuditEvent[]>(
    BASE_EVENTS.map((e, i) => ({ ...e, id: i + 1 }))
  );
  const [counterBase] = useState(52686);
  const [liveAdd, setLiveAdd] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(BASE_EVENTS.length + 1);

  // Simulate new events arriving — intentionally stable closure via ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = generateNewEvent(nextIdRef.current);
      nextIdRef.current++;
      setEvents((prev) => [newEvent, ...prev.slice(0, 34)]);
      if (newEvent.saved > 0) {
        setLiveAdd((prev) => prev + newEvent.saved);
      }
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const totalPrevented = counterBase + Math.round(liveAdd);
  const blockedCount = events.filter((e) => e.verdict === "BLOCKED").length;
  const flaggedCount = events.filter((e) => e.verdict === "FLAGGED").length;

  return (
    <div className="lf-root">
      <style>{`
        .lf-root {
          min-height: 100dvh;
          background: #050509;
          color: rgba(255,255,255,0.88);
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
          display: flex;
          flex-direction: column;
        }
        /* Header */
        .lf-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.75rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-wrap: wrap;
          gap: 1rem;
          flex-shrink: 0;
        }
        .lf-header-left {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .lf-eyebrow {
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(16,185,129,0.7);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .lf-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: lf-pulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes lf-pulse {
          0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(16,185,129,0); }
        }
        .lf-counter-wrap {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .lf-counter-value {
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 900;
          color: #10b981;
          letter-spacing: -0.04em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .lf-counter-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.3);
        }
        .lf-tagline {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.2);
          margin-top: 0.15rem;
          letter-spacing: 0.04em;
        }
        /* Header stats */
        .lf-header-stats {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .lf-hstat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          text-align: right;
        }
        .lf-hstat-value {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .lf-hstat-label {
          font-size: 0.55rem;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        /* Layout */
        .lf-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        /* Feed */
        .lf-feed-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .lf-feed-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.625rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          flex-shrink: 0;
        }
        .lf-feed-header-cols {
          display: flex;
          gap: 0;
          flex: 1;
        }
        .lf-col-ts { width: 72px; flex-shrink: 0; }
        .lf-col-agent { width: 160px; flex-shrink: 0; }
        .lf-col-action { flex: 1; }
        .lf-col-cat { width: 120px; flex-shrink: 0; text-align: center; }
        .lf-col-verdict { width: 90px; flex-shrink: 0; text-align: center; }
        .lf-col-saved { width: 80px; flex-shrink: 0; text-align: right; }
        .lf-feed {
          flex: 1;
          overflow-y: auto;
        }
        .lf-feed::-webkit-scrollbar { width: 3px; }
        .lf-feed::-webkit-scrollbar-track { background: transparent; }
        .lf-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .lf-event {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 0.55rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.025);
          transition: background 0.15s ease;
          cursor: default;
          animation: lf-slide 0.35s ease;
          position: relative;
        }
        @keyframes lf-slide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: none; }
        }
        .lf-event:hover { background: rgba(255,255,255,0.02); }
        .lf-event-ts {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.2);
          width: 72px;
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
        }
        .lf-event-agent {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.38);
          width: 160px;
          flex-shrink: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lf-event-action {
          flex: 1;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.72);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lf-event-cat {
          width: 120px;
          flex-shrink: 0;
          text-align: center;
          font-size: 0.58rem;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.06em;
        }
        .lf-event-verdict {
          width: 90px;
          flex-shrink: 0;
          text-align: center;
        }
        .lf-verdict-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          border-width: 1px;
          border-style: solid;
          white-space: nowrap;
        }
        .lf-event-saved {
          width: 80px;
          flex-shrink: 0;
          text-align: right;
          font-size: 0.68rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        /* Sidebar */
        .lf-sidebar {
          width: 240px;
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 1.25rem 0;
          flex-shrink: 0;
          overflow-y: auto;
        }
        .lf-sidebar-section {
          padding: 0 1.25rem;
          margin-bottom: 1.5rem;
        }
        .lf-sidebar-label {
          font-size: 0.55rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 0.75rem;
        }
        .lf-sidebar-stat {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 0.35rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.72rem;
        }
        .lf-sidebar-stat-label {
          color: rgba(255,255,255,0.38);
        }
        .lf-sidebar-stat-value {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        /* Daily chart */
        .lf-chart {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .lf-chart-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.6rem;
        }
        .lf-chart-label {
          width: 28px;
          color: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }
        .lf-chart-bar-bg {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.04);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .lf-chart-bar-fill {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          border-radius: 4px;
          background: rgba(239,68,68,0.6);
        }
        .lf-chart-count {
          color: rgba(255,255,255,0.2);
          width: 20px;
          text-align: right;
        }
        /* Mobile */
        @media (max-width: 900px) {
          .lf-sidebar { display: none; }
          .lf-col-cat { display: none; }
          .lf-col-agent { width: 100px; }
        }
        @media (max-width: 600px) {
          .lf-col-agent { display: none; }
          .lf-header-stats { display: none; }
          .lf-col-cat, .lf-col-saved { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="lf-header">
        <div className="lf-header-left">
          <div className="lf-eyebrow">
            <div className="lf-live-dot" />
            Level9OS Governance Stream — Live
          </div>
          <div className="lf-counter-wrap">
            <span className="lf-counter-value">
              ${totalPrevented.toLocaleString()}
            </span>
            <span className="lf-counter-label">prevented (90d)</span>
          </div>
          <div className="lf-tagline">This is real. Yours could be next.</div>
        </div>
        <div className="lf-header-stats">
          <div className="lf-hstat">
            <span className="lf-hstat-value" style={{ color: "#ef4444" }}>{blockedCount}</span>
            <span className="lf-hstat-label">Blocked this view</span>
          </div>
          <div className="lf-hstat">
            <span className="lf-hstat-value" style={{ color: "#8b5cf6" }}>{flaggedCount}</span>
            <span className="lf-hstat-label">Flagged this view</span>
          </div>
          <div className="lf-hstat">
            <span className="lf-hstat-value" style={{ color: "#f59e0b" }}>3,464x</span>
            <span className="lf-hstat-label">ROI ratio</span>
          </div>
          <div className="lf-hstat">
            <span className="lf-hstat-value" style={{ color: "rgba(255,255,255,0.6)" }}>$5.07</span>
            <span className="lf-hstat-label">Infra/mo</span>
          </div>
        </div>
      </div>

      <div className="lf-body">
        {/* Feed */}
        <div className="lf-feed-col">
          <div className="lf-feed-header">
            <div className="lf-col-ts">Time</div>
            <div className="lf-col-agent">Agent</div>
            <div className="lf-col-action" style={{ flex: 1 }}>Action attempted</div>
            <div className="lf-col-cat">Category</div>
            <div className="lf-col-verdict">Verdict</div>
            <div className="lf-col-saved">Saved</div>
          </div>
          <div className="lf-feed" ref={feedRef}>
            {events.map((ev) => {
              const meta = VERDICT_META[ev.verdict];
              return (
                <div
                  key={ev.id}
                  className="lf-event"
                >
                  <span className="lf-event-ts">{ev.ts}</span>
                  <span className="lf-event-agent">{ev.agent}</span>
                  <span className="lf-event-action">{ev.action}</span>
                  <span className="lf-event-cat">{ev.category}</span>
                  <span className="lf-event-verdict">
                    <span
                      className="lf-verdict-badge"
                      style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
                    >
                      {ev.verdict}
                    </span>
                  </span>
                  <span
                    className="lf-event-saved"
                    style={{ color: ev.saved > 0 ? "#10b981" : "rgba(255,255,255,0.15)" }}
                  >
                    {ev.saved > 0 ? `$${ev.saved.toFixed(2)}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lf-sidebar">
          <div className="lf-sidebar-section">
            <div className="lf-sidebar-label">90-day totals</div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label">Prevented</span>
              <span className="lf-sidebar-stat-value" style={{ color: "#10b981" }}>$52,686</span>
            </div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label">Hr saved</span>
              <span className="lf-sidebar-stat-value" style={{ color: "#8b5cf6" }}>236 hr</span>
            </div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label">Run rate</span>
              <span className="lf-sidebar-stat-value" style={{ color: "rgba(255,255,255,0.7)" }}>$17,562/mo</span>
            </div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label">Events (90d)</span>
              <span className="lf-sidebar-stat-value">1,033</span>
            </div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label">Today range</span>
              <span className="lf-sidebar-stat-value" style={{ color: "#f59e0b" }}>$236–$4,284</span>
            </div>
          </div>

          <div className="lf-sidebar-section">
            <div className="lf-sidebar-label">Blocks by day (this week)</div>
            <div className="lf-chart">
              {DAILY_TOTALS.map((d) => (
                <div key={d.label} className="lf-chart-row">
                  <span className="lf-chart-label">{d.label.split(" ")[0]}</span>
                  <div className="lf-chart-bar-bg">
                    <div
                      className="lf-chart-bar-fill"
                      style={{ width: `${(d.blocked / 14) * 100}%` }}
                    />
                  </div>
                  <span className="lf-chart-count">{d.blocked}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lf-sidebar-section">
            <div className="lf-sidebar-label">Verdict breakdown</div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label" style={{ color: "rgba(239,68,68,0.8)" }}>BLOCKED</span>
              <span className="lf-sidebar-stat-value">~215/90d</span>
            </div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label" style={{ color: "rgba(245,158,11,0.8)" }}>REROUTED</span>
              <span className="lf-sidebar-stat-value">44/90d</span>
            </div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label" style={{ color: "rgba(139,92,246,0.8)" }}>FLAGGED</span>
              <span className="lf-sidebar-stat-value">782/90d</span>
            </div>
            <div className="lf-sidebar-stat">
              <span className="lf-sidebar-stat-label" style={{ color: "rgba(16,185,129,0.8)" }}>ALLOWED</span>
              <span className="lf-sidebar-stat-value">~2600+/90d</span>
            </div>
          </div>

          <div style={{ padding: "0 1.25rem", marginTop: "auto" }}>
            <a
              href="mailto:biz@erichathaway.com"
              style={{
                display: "block",
                padding: "0.65rem 1rem",
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "8px",
                color: "rgba(139,92,246,0.9)",
                fontSize: "0.72rem",
                fontWeight: "700",
                textAlign: "center",
                textDecoration: "none",
                letterSpacing: "0.06em",
                transition: "background 0.2s ease",
              }}
            >
              Get this for your stack
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

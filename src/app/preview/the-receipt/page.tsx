"use client";
/**
 * /preview/the-receipt
 * Concept: Shock and awe. Four-act vertical scroll. The receipt for 90 days of governance.
 * Act 1: The Number — massive counter from $0 to $52,686
 * Act 2: The Live Feed — streaming audit events, counter ticks top-right
 * Act 3: The Crucifixion — competitor comparison table
 * Act 4: One Door Out — single CTA
 */

import { useEffect, useRef, useState } from "react";
import { MagneticButton, FadeIn } from "@level9/brand/components/motion";

// ─── Act 2 data ───────────────────────────────────────────────────────────────

type Verdict = "BLOCKED" | "REROUTED" | "REQUIRED VERIFY" | "REFRESHED" | "REWROTE";

interface FeedEvent {
  id: number;
  ts: string;
  action: string;
  verdict: Verdict;
  saved: number;
}

const VERDICT_STYLES: Record<Verdict, { color: string; bg: string }> = {
  BLOCKED:          { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  REROUTED:         { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  "REQUIRED VERIFY":{ color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  REFRESHED:        { color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  REWROTE:          { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

function tsFromNow(secsAgo: number): string {
  const d = new Date(Date.now() - secsAgo * 1000);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

const SEED_EVENTS: Omit<FeedEvent, "id" | "ts">[] = [
  { action: "Agent attempted to send unverified market claim", verdict: "BLOCKED", saved: 128 },
  { action: "Cost budget exceeded for Sonnet routing", verdict: "REROUTED", saved: 4.20 },
  { action: "Lie detector flagged response", verdict: "REQUIRED VERIFY", saved: 0 },
  { action: "Stale documentation referenced", verdict: "REFRESHED", saved: 89 },
  { action: "Banned word in customer email draft", verdict: "REWROTE", saved: 245 },
  { action: "Done-claim without evidence test", verdict: "BLOCKED", saved: 86.67 },
  { action: "Broad grep attempted on expensive model", verdict: "REROUTED", saved: 0.71 },
  { action: "Write to protected governance hook", verdict: "BLOCKED", saved: 110 },
  { action: "Production deploy claimed without URL", verdict: "BLOCKED", saved: 86.67 },
  { action: "Mid-session reversal on API key claim", verdict: "REQUIRED VERIFY", saved: 33.71 },
  { action: "Hardcoded hex instead of brand token", verdict: "REFRESHED", saved: 45 },
  { action: "Unverified claim before production push", verdict: "BLOCKED", saved: 250 },
  { action: "Em dash in user-facing marketing copy", verdict: "REWROTE", saved: 33.71 },
  { action: "Mechanical rename task on Opus tier", verdict: "REROUTED", saved: 1.40 },
  { action: "Supabase DELETE on cmd_secrets without grant", verdict: "BLOCKED", saved: 110 },
  { action: "Referenced outdated pricing in proposal", verdict: "REFRESHED", saved: 178 },
  { action: "Five hallucinated citations in analyst brief", verdict: "REQUIRED VERIFY", saved: 0 },
  { action: "Competitor name dropped in outbound email", verdict: "REWROTE", saved: 245 },
  { action: "Done-claim: build not actually run", verdict: "BLOCKED", saved: 86.67 },
  { action: "Rerouted classification sweep to Haiku", verdict: "REROUTED", saved: 3.20 },
  { action: "Wrong LLC in privacy policy footer", verdict: "REFRESHED", saved: 89 },
  { action: "Force-push to main attempted", verdict: "BLOCKED", saved: 110 },
  { action: "Schema inferred without evidence", verdict: "REQUIRED VERIFY", saved: 33.71 },
  { action: "Off-brand tone in C-suite summary", verdict: "REWROTE", saved: 178 },
  { action: "Speculative utility function shipped", verdict: "BLOCKED", saved: 86.67 },
  { action: "Stale n8n workflow ID referenced", verdict: "REFRESHED", saved: 45 },
  { action: "Inflated claim about uptime percentage", verdict: "REQUIRED VERIFY", saved: 33.71 },
  { action: "Bulk frontmatter sweep on wrong tier", verdict: "REROUTED", saved: 2.80 },
  { action: "Unlisted dependency added silently", verdict: "BLOCKED", saved: 110 },
  { action: "Sensitive key pattern in commit message", verdict: "BLOCKED", saved: 250 },
];

const LOOP_TEMPLATES: Omit<FeedEvent, "id" | "ts">[] = [
  { action: "Agent claimed deployment without checking URL", verdict: "BLOCKED", saved: 86.67 },
  { action: "Mechanical text edit rerouted to Haiku", verdict: "REROUTED", saved: 0.71 },
  { action: "Attempted edit to load-bearing hook", verdict: "BLOCKED", saved: 110 },
  { action: "Response flagged before client delivery", verdict: "REQUIRED VERIFY", saved: 33.71 },
  { action: "Canonical source refreshed, drift corrected", verdict: "REFRESHED", saved: 89 },
  { action: "Voice-rule violation caught in draft", verdict: "REWROTE", saved: 245 },
  { action: "Production-bound unverified claim stopped", verdict: "BLOCKED", saved: 250 },
  { action: "Cost-tier mismatch rerouted automatically", verdict: "REROUTED", saved: 4.20 },
];

// ─── Act 3 data ───────────────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { label: "Annual cost",    ms: "~$1,000,000", sf: "~$850,000", wd: "~$500,000", l9: "$5,988" },
  { label: "Sales cycle",    ms: "6 months",    sf: "4 months",  wd: "6 months",  l9: "5 minutes" },
  { label: "Lock-in",        ms: "Microsoft 365", sf: "Salesforce stack", wd: "HR/Finance only", l9: "None" },
  { label: "Multi-vendor",   ms: "Within MS ecosystem", sf: "Within SF ecosystem", wd: "Limited", l9: "Claude + GPT + Gemini" },
  { label: "Time to value",  ms: "Quarters",    sf: "Quarters",  wd: "Quarters",  l9: "Days" },
  { label: "Built for SMB",  ms: "No",          sf: "No",        wd: "No",        l9: "Yes" },
];

// ─── Counter hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, durationMs: number, startAfterMs: number) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, startAfterMs);
    return () => clearTimeout(startTimer);
  }, [startAfterMs]);
  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, durationMs]);
  return value;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TheReceipt() {
  // Act 1 counter
  const heroValue = useCountUp(52686, 3000, 500);
  const heroStarted = heroValue > 0;

  // Act 2 feed state
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>(() =>
    SEED_EVENTS.map((e, i) => ({ ...e, id: i + 1, ts: tsFromNow((SEED_EVENTS.length - i) * 16) }))
  );
  const [liveAdd, setLiveAdd] = useState(0);
  const nextIdRef = useRef(SEED_EVENTS.length + 1);
  const loopIndexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const template = LOOP_TEMPLATES[loopIndexRef.current % LOOP_TEMPLATES.length];
      loopIndexRef.current++;
      const newEvent: FeedEvent = {
        ...template,
        id: nextIdRef.current++,
        ts: tsFromNow(0),
      };
      setFeedEvents((prev) => [newEvent, ...prev.slice(0, 34)]);
      if (newEvent.saved > 0) setLiveAdd((p) => p + newEvent.saved);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const miniCounterValue = 52686 + Math.round(liveAdd);

  // Act 2 intersection (mini counter only shows after scroll past Act 1)
  const [act2Visible, setAct2Visible] = useState(false);
  const act2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = act2Ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setAct2Visible(true);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="rc-root">
      <style>{`
        .rc-root {
          background: #000;
          color: rgba(255,255,255,0.88);
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
          overflow-x: hidden;
        }

        /* ── Act 1: The Number ──────────────────────────────── */
        .rc-act1 {
          min-height: 100dvh;
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem;
        }
        .rc-hero-counter {
          font-size: clamp(5rem, 18vw, 14rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.04em;
          line-height: 0.9;
          font-variant-numeric: tabular-nums;
          text-align: center;
          transition: opacity 0.4s ease;
        }
        .rc-hero-counter.hidden { opacity: 0; }
        .rc-hero-tagline {
          margin-top: clamp(1.25rem, 3vh, 2.5rem);
          font-size: clamp(0.55rem, 1.2vw, 0.78rem);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          text-align: center;
          line-height: 1.6;
          max-width: 680px;
          transition: opacity 0.6s ease 0.3s;
        }
        .rc-hero-tagline.hidden { opacity: 0; }
        .rc-scroll-hint {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          opacity: 0;
          transition: opacity 0.8s ease 3.5s;
        }
        .rc-scroll-hint.shown { opacity: 1; }
        .rc-scroll-chevron {
          width: 20px;
          height: 20px;
          border-right: 1.5px solid rgba(255,255,255,0.25);
          border-bottom: 1.5px solid rgba(255,255,255,0.25);
          transform: rotate(45deg);
          animation: rc-bounce 1.6s ease-in-out infinite;
        }
        @keyframes rc-bounce {
          0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.5; }
          50% { transform: rotate(45deg) translateY(5px); opacity: 1; }
        }

        /* ── Act 2: The Live Feed ───────────────────────────── */
        .rc-act2 {
          min-height: 100dvh;
          background: #020206;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .rc-act2-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .rc-live-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(16,185,129,0.8);
        }
        .rc-live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981;
          animation: rc-pulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes rc-pulse {
          0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50% { opacity: 0.7; box-shadow: 0 0 0 5px rgba(16,185,129,0); }
        }
        .rc-mini-counter {
          font-size: clamp(1rem, 2.5vw, 1.5rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.04em;
          font-variant-numeric: tabular-nums;
          transition: color 0.3s ease;
        }
        .rc-mini-label {
          font-size: 0.55rem;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 0.1rem;
          text-align: right;
        }
        .rc-feed-area {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem 0;
        }
        .rc-feed-area::-webkit-scrollbar { width: 3px; }
        .rc-feed-area::-webkit-scrollbar-track { background: transparent; }
        .rc-feed-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); }
        .rc-feed-event {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          padding: 0.7rem 1.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.025);
          animation: rc-slide-in 0.4s ease;
          font-size: 0.72rem;
        }
        @keyframes rc-slide-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rc-event-ts {
          color: rgba(255,255,255,0.2);
          font-size: 0.6rem;
          flex-shrink: 0;
          padding-top: 0.05rem;
          font-variant-numeric: tabular-nums;
          min-width: 150px;
        }
        .rc-event-arrow {
          color: rgba(255,255,255,0.15);
          flex-shrink: 0;
        }
        .rc-event-action {
          flex: 1;
          color: rgba(255,255,255,0.72);
          line-height: 1.5;
        }
        .rc-event-verdict {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .rc-event-saved {
          font-size: 0.68rem;
          font-weight: 600;
          color: #10b981;
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
          min-width: 72px;
          text-align: right;
        }
        .rc-act2-footer {
          padding: 0.875rem 1.75rem;
          border-top: 1px solid rgba(255,255,255,0.04);
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          flex-shrink: 0;
        }
        /* Mobile: collapse ts on small screens */
        @media (max-width: 600px) {
          .rc-event-ts { display: none; }
          .rc-event-arrow { display: none; }
          .rc-feed-event { padding: 0.625rem 1rem; }
        }

        /* ── Act 3: The Crucifixion ─────────────────────────── */
        .rc-act3 {
          min-height: 100dvh;
          background: #08080f;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(3rem, 8vw, 6rem) clamp(1.25rem, 4vw, 4rem);
        }
        .rc-act3-eyebrow {
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 1.25rem;
          text-align: center;
        }
        .rc-act3-headline {
          font-size: clamp(1.75rem, 4vw, 3rem);
          font-weight: 900;
          letter-spacing: -0.035em;
          line-height: 1.1;
          color: rgba(255,255,255,0.95);
          text-align: center;
          margin-bottom: clamp(2rem, 5vh, 4rem);
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .rc-table-wrap {
          width: 100%;
          max-width: 960px;
          overflow-x: auto;
        }
        .rc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }
        .rc-table th {
          padding: 0.75rem 1.25rem;
          text-align: left;
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-weight: 600;
          white-space: nowrap;
        }
        .rc-table th.l9-head {
          color: rgba(139,92,246,0.9);
          font-weight: 800;
        }
        .rc-table td {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.35);
          vertical-align: middle;
          font-family: ui-monospace, monospace;
          font-size: 0.75rem;
        }
        .rc-table td.row-label {
          color: rgba(255,255,255,0.55);
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0;
        }
        .rc-table td.l9-cell {
          color: #fff;
          font-weight: 800;
          position: relative;
        }
        .rc-table tr:last-child td { border-bottom: none; }
        .rc-l9-col-bg {
          background: rgba(139,92,246,0.06);
          border-left: 1px solid rgba(139,92,246,0.15);
          border-right: 1px solid rgba(139,92,246,0.15);
        }
        .rc-l9-col-top {
          border-top: 1px solid rgba(139,92,246,0.15);
          border-radius: 8px 8px 0 0;
        }
        .rc-l9-col-bottom {
          border-bottom: 1px solid rgba(139,92,246,0.15) !important;
          border-radius: 0 0 8px 8px;
        }
        .rc-table-footnote {
          margin-top: 1.5rem;
          font-size: 0.57rem;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.18);
          text-align: center;
          max-width: 700px;
          line-height: 1.65;
        }
        @media (max-width: 700px) {
          .rc-table th, .rc-table td {
            padding: 0.625rem 0.75rem;
            font-size: 0.68rem;
          }
          .rc-table td.row-label { font-size: 0.7rem; }
        }

        /* ── Act 4: One Door Out ────────────────────────────── */
        .rc-act4 {
          min-height: 100dvh;
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          position: relative;
          text-align: center;
        }
        .rc-act4-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 600px 500px at 50% 50%, rgba(139,92,246,0.07) 0%, transparent 70%);
        }
        .rc-act4-headline {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.1;
          color: rgba(255,255,255,0.95);
          max-width: 14ch;
          margin: 0 auto 1.75rem;
          position: relative;
          z-index: 1;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .rc-act4-sub {
          font-size: clamp(0.88rem, 1.8vw, 1.1rem);
          color: rgba(255,255,255,0.42);
          line-height: 1.7;
          max-width: 46ch;
          margin: 0 auto 3rem;
          position: relative;
          z-index: 1;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .rc-act4-btn-wrap {
          position: relative;
          z-index: 1;
          margin-bottom: 3rem;
        }
        .rc-act4-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          padding: 1.1rem 2.5rem;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.45);
          border-radius: 10px;
          color: rgba(255,255,255,0.92);
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: -0.01em;
          transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }
        .rc-act4-btn:hover {
          background: rgba(139,92,246,0.28);
          border-color: rgba(139,92,246,0.8);
          box-shadow: 0 0 40px rgba(139,92,246,0.2);
        }
        .rc-act4-signin {
          position: absolute;
          top: 1.75rem;
          right: 2rem;
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.28);
          text-decoration: none;
          z-index: 2;
          transition: color 0.2s ease;
        }
        .rc-act4-signin:hover { color: rgba(255,255,255,0.6); }
        .rc-act4-footer {
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
          position: relative;
          z-index: 1;
        }
      `}</style>

      {/* ── Act 1: The Number ──────────────────────────────────────── */}
      <section className="rc-act1">
        <div
          className={`rc-hero-counter${heroValue === 0 ? " hidden" : ""}`}
          aria-label={`$${heroValue.toLocaleString()} prevented`}
        >
          ${heroValue.toLocaleString()}
        </div>
        <div className={`rc-hero-tagline${heroValue === 0 ? " hidden" : ""}`}>
          PREVENTED IN 90 DAYS. BY $5.07/MONTH OF GOVERNANCE. ROI: 3,464X.
        </div>
        <div className={`rc-scroll-hint${heroStarted ? " shown" : ""}`}>
          <div className="rc-scroll-chevron" />
        </div>
      </section>

      {/* ── Act 2: The Live Feed ───────────────────────────────────── */}
      <section className="rc-act2" ref={act2Ref}>
        <div className="rc-act2-header">
          <div className="rc-live-badge">
            <div className="rc-live-dot" />
            Live from Eric&apos;s operation
          </div>
          {act2Visible && (
            <div style={{ textAlign: "right" }}>
              <div className="rc-mini-counter">
                ${miniCounterValue.toLocaleString()}
              </div>
              <div className="rc-mini-label">Prevented (90d, ticking)</div>
            </div>
          )}
        </div>

        <div className="rc-feed-area">
          {feedEvents.map((ev) => {
            const style = VERDICT_STYLES[ev.verdict];
            return (
              <div key={ev.id} className="rc-feed-event">
                <span className="rc-event-ts">{ev.ts}</span>
                <span className="rc-event-arrow">&#x2192;</span>
                <span className="rc-event-action">{ev.action}</span>
                <span
                  className="rc-event-verdict"
                  style={{ color: style.color, background: style.bg }}
                >
                  {ev.verdict}
                </span>
                <span className="rc-event-saved">
                  {ev.saved > 0 ? `$${ev.saved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} saved` : ""}
                </span>
              </div>
            );
          })}
        </div>

        <div className="rc-act2-footer">
          LIVE FROM ERIC&apos;S OPERATION. PUBLIC PROOF.
        </div>
      </section>

      {/* ── Act 3: The Crucifixion ─────────────────────────────────── */}
      <section className="rc-act3">
        <FadeIn>
          <div className="rc-act3-eyebrow">Competitive landscape, May 2026</div>
          <h2 className="rc-act3-headline">What the alternatives cost.</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="rc-table-wrap">
            <table className="rc-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Microsoft Agent 365</th>
                  <th>Salesforce Agentforce</th>
                  <th>Workday ASOR</th>
                  <th className="l9-head rc-l9-col-bg rc-l9-col-top">Level9OS</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => {
                  const isLast = i === COMPARISON_ROWS.length - 1;
                  return (
                    <tr key={row.label}>
                      <td className="row-label">{row.label}</td>
                      <td>{row.ms}</td>
                      <td>{row.sf}</td>
                      <td>{row.wd}</td>
                      <td className={`l9-cell rc-l9-col-bg${isLast ? " rc-l9-col-bottom" : ""}`}>
                        {row.l9}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeIn>
        <FadeIn delay={0.18}>
          <div className="rc-table-footnote">
            MARKET RESEARCH 2026-05-11. SOURCED FROM PUBLIC FILINGS, GARTNER, CB INSIGHTS, ANALYST REPORTS.
          </div>
        </FadeIn>
      </section>

      {/* ── Act 4: One Door Out ────────────────────────────────────── */}
      <section className="rc-act4">
        <div className="rc-act4-glow" />
        <a href="#" className="rc-act4-signin">Sign in</a>
        <FadeIn>
          <h2 className="rc-act4-headline">
            Want this for your operation?
          </h2>
          <p className="rc-act4-sub">
            Introduce an agent. Give it access. Give it a day. It comes back and walks you through what it found.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="rc-act4-btn-wrap">
            <MagneticButton>
              <a href="mailto:biz@erichathaway.com" className="rc-act4-btn">
                Introduce an agent &#x2192;
              </a>
            </MagneticButton>
          </div>
        </FadeIn>
        <FadeIn delay={0.18}>
          <div className="rc-act4-footer">
            LEVEL9OS LLC &middot; PREVIEW REBUILD &middot; NO LOCK-IN
          </div>
        </FadeIn>
      </section>
    </div>
  );
}

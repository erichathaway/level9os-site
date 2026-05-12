"use client";
/**
 * /preview — Design Direction Selector
 * Six fundamentally different approaches using governance ROI numbers as hero proof.
 * Plus two Conversation variants being compared for navigation pattern.
 */

import { MagneticCard } from "@level9/brand/components/motion";
import { FadeIn } from "@level9/brand/components/motion";

const CONVERSATION_VARIANTS = [
  {
    id: "the-conversation-pure",
    name: "Chat-Only",
    tagline: "Modules render inline inside the chat thread. Scroll up to revisit any past module.",
    pitch: "Single-column chat takes the entire viewport. The chat history IS the navigation. No tabs, no right panel.",
    href: "/preview/the-conversation-pure",
    color: "#8b5cf6",
    rgb: "139,92,246",
    badge: "Chat-Only",
  },
  {
    id: "the-conversation-tabs",
    name: "Chat + Panel",
    tagline: "Chat on the left, active module on the right. Tabs let you revisit any unlocked module.",
    pitch: "Two-column layout. Chat drives unlocking. Right panel shows the active module. Tab strip at top for navigation.",
    href: "/preview/the-conversation-tabs",
    color: "#6366f1",
    rgb: "99,102,241",
    badge: "Chat + Panel",
  },
];

const FEATURED = {
  id: "the-receipt",
  name: "The Receipt",
  tagline: "Shock and awe. Four-act vertical scroll combining the strongest elements from all five approaches.",
  pitch: "Act 1: massive counter from $0 to $52,686. Act 2: streaming audit feed with ticking mini-counter. Act 3: competitor comparison table. Act 4: single magnetic CTA. No swipe panels. No horizontal scroll. Pure vertical drama.",
  href: "/preview/the-receipt",
  color: "#8b5cf6",
  rgb: "139,92,246",
  badge: "New",
};

const APPROACHES = [
  {
    id: "the-sandbox",
    name: "The Sandbox",
    tagline: "Visitor lands inside a working governance dashboard. The product demos itself.",
    pitch: "Full-screen dashboard UI: sidebar nav, live audit event stream, vendor comparison widget, real metrics. No pitch first. You are already inside the thing.",
    href: "/preview/the-sandbox",
    color: "#10b981",
    rgb: "16,185,129",
    badge: "Dashboard",
  },
  {
    id: "the-conversation",
    name: "The Conversation",
    tagline: "Single chat interface as the entire site. Agent-led dialogue.",
    pitch: "No traditional page architecture. An onboarding agent opens with the $52,686 number. Visitor clicks suggested replies to navigate. The agent IS the UX.",
    href: "/preview/the-conversation",
    color: "#8b5cf6",
    rgb: "139,92,246",
    badge: "Chat",
  },
  {
    id: "the-calculator",
    name: "The Calculator",
    tagline: "Self-quantified value before any pitch. Your number is the hook.",
    pitch: "No marketing copy above the fold. Enter company size, tools, spend. Get projected monthly waste and prevented cost. Anchored by real 90-day data below.",
    href: "/preview/the-calculator",
    color: "#f59e0b",
    rgb: "245,158,11",
    badge: "Calculator",
  },
  {
    id: "the-magazine",
    name: "The Magazine",
    tagline: "Premium editorial longform. Stripe Press meets The Atlantic.",
    pitch: "Big Playfair Display headline, drop cap, pull quotes at full-bleed, generous whitespace. Scroll-driven narrative essay that uses the numbers as paragraph anchors.",
    href: "/preview/the-magazine",
    color: "#6d4c41",
    rgb: "109,76,65",
    badge: "Editorial",
  },
  {
    id: "the-live-feed",
    name: "The Live Feed",
    tagline: "Streaming audit trail. Governance proof in real time.",
    pitch: "Full-screen feed. $52,686 counter ticks up. New events auto-append: agent action, verdict (BLOCKED/REROUTED/FLAGGED), dollars saved. The system demos itself working.",
    href: "/preview/the-live-feed",
    color: "#ef4444",
    rgb: "239,68,68",
    badge: "Live",
  },
];

export default function PreviewIndex() {
  return (
    <div className="pi-root">
      <style>{`
        .pi-root {
          min-height: 100dvh;
          background: #030306;
          color: rgba(255,255,255,0.9);
          font-family: var(--font-inter), system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem 2rem 5rem;
          gap: 0;
          position: relative;
          overflow: hidden;
        }
        .pi-mesh {
          position: fixed; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 900px 700px at 25% 35%, rgba(139,92,246,0.05) 0%, transparent 70%),
            radial-gradient(ellipse 700px 600px at 75% 65%, rgba(16,185,129,0.03) 0%, transparent 70%),
            radial-gradient(ellipse 500px 400px at 50% 90%, rgba(239,68,68,0.025) 0%, transparent 70%);
        }
        .pi-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          z-index: 2;
          margin-bottom: 1rem;
        }
        .pi-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(139,92,246,0.8);
        }
        .pi-title {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: rgba(255,255,255,0.92);
        }
        .pi-sub {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.42);
          line-height: 1.65;
          max-width: 52ch;
          margin: 0 auto;
        }
        /* Proof strip */
        .pi-proof {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
          padding: 1rem 0 2.5rem;
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin: 1.5rem 0 2.5rem;
          width: 100%;
          max-width: 880px;
        }
        .pi-proof-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }
        .pi-proof-value {
          font-size: 1.05rem;
          font-weight: 800;
          color: rgba(255,255,255,0.88);
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .pi-proof-label {
          font-size: 0.58rem;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: ui-monospace, monospace;
          text-align: center;
        }
        /* Section label */
        .pi-section-label {
          width: 100%;
          max-width: 1120px;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
          position: relative;
          z-index: 2;
        }
        .pi-section-label-text {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          white-space: nowrap;
        }
        .pi-section-label-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        /* Grid: 3 then 2 */
        .pi-grid-top {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 340px));
          gap: 1.25rem;
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1060px;
          margin-bottom: 0.75rem;
        }
        .pi-grid-bottom {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 340px));
          gap: 1.25rem;
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 700px;
          margin-bottom: 3rem;
        }
        /* Card */
        .pi-card {
          background: #0d0d18;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: border-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .pi-card:hover { border-color: rgba(var(--card-rgb),0.3); }
        .pi-card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 16px 16px 0 0;
        }
        .pi-card-badge {
          display: inline-flex;
          align-items: center;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--card-color);
          background: rgba(var(--card-rgb),0.1);
          border: 1px solid rgba(var(--card-rgb),0.2);
          border-radius: 4px;
          padding: 0.25rem 0.625rem;
          width: fit-content;
        }
        .pi-card-name {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: rgba(255,255,255,0.92);
        }
        .pi-card-tagline {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.62);
          line-height: 1.6;
        }
        .pi-card-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0.1rem 0;
        }
        .pi-card-pitch {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.65;
          font-style: italic;
        }
        .pi-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.65rem 1.5rem;
          background: rgba(var(--card-rgb),0.12);
          border: 1px solid rgba(var(--card-rgb),0.25);
          border-radius: 8px;
          color: var(--card-color);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease;
          width: fit-content;
        }
        .pi-card-cta:hover {
          background: rgba(var(--card-rgb),0.22);
          border-color: var(--card-color);
        }
        .pi-card-arrow {
          font-size: 0.9rem;
          transition: transform 0.2s ease;
        }
        .pi-card-cta:hover .pi-card-arrow { transform: translateX(3px); }
        .pi-footer-note {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.18);
          text-align: center;
          position: relative;
          z-index: 2;
        }
        /* Featured card */
        .pi-featured-wrap {
          width: 100%;
          max-width: 1060px;
          margin-bottom: 1.75rem;
          position: relative;
          z-index: 2;
        }
        .pi-featured-card {
          background: #0d0d18;
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 16px;
          padding: 2.25rem 2rem;
          display: flex;
          align-items: flex-start;
          gap: 2rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 60px rgba(139,92,246,0.08), 0 0 120px rgba(139,92,246,0.04);
        }
        .pi-featured-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
          border-radius: 16px 16px 0 0;
        }
        .pi-featured-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .pi-featured-badges {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .pi-featured-new {
          display: inline-flex;
          align-items: center;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.6rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #fff;
          background: rgba(139,92,246,0.8);
          border-radius: 4px;
          padding: 0.25rem 0.625rem;
          font-weight: 700;
        }
        .pi-featured-type {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(139,92,246,0.8);
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 4px;
          padding: 0.25rem 0.625rem;
        }
        .pi-featured-name {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: rgba(255,255,255,0.95);
        }
        .pi-featured-tagline {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          max-width: 52ch;
        }
        .pi-featured-pitch {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.32);
          line-height: 1.7;
          font-style: italic;
          max-width: 56ch;
        }
        .pi-featured-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.4);
          border-radius: 8px;
          color: rgba(255,255,255,0.9);
          font-size: 0.92rem;
          font-weight: 700;
          text-decoration: none;
          width: fit-content;
          transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .pi-featured-cta:hover {
          background: rgba(139,92,246,0.3);
          border-color: rgba(139,92,246,0.7);
          box-shadow: 0 0 24px rgba(139,92,246,0.2);
        }
        .pi-featured-arrow {
          font-size: 0.9rem;
          transition: transform 0.2s ease;
        }
        .pi-featured-cta:hover .pi-featured-arrow { transform: translateX(3px); }
        @media (max-width: 680px) {
          .pi-featured-card { flex-direction: column; gap: 1.25rem; }
        }
        /* Mobile */
        @media (max-width: 1000px) {
          .pi-grid-top { grid-template-columns: repeat(2, minmax(0, 380px)); }
          .pi-grid-bottom { grid-template-columns: minmax(0, 380px); }
        }
        @media (max-width: 680px) {
          .pi-grid-top, .pi-grid-bottom {
            grid-template-columns: minmax(0, 420px);
            justify-content: center;
          }
          .pi-root { padding: 2.5rem 1.25rem 4rem; }
          .pi-card { padding: 1.5rem; }
          .pi-proof { gap: 1.25rem; }
        }
        /* Conversation testing banner */
        .pi-test-banner {
          width: 100%;
          max-width: 1060px;
          background: rgba(139,92,246,0.06);
          border: 1px solid rgba(139,92,246,0.22);
          border-radius: 14px;
          padding: 1.5rem 1.75rem;
          margin-bottom: 2rem;
          position: relative;
          z-index: 2;
        }
        .pi-test-banner-label {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.75rem;
        }
        .pi-test-star { color: #f59e0b; font-size: 0.85rem; }
        .pi-test-heading {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .pi-test-sub {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.38);
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .pi-test-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.875rem;
        }
        @media (max-width: 600px) {
          .pi-test-grid { grid-template-columns: minmax(0, 1fr); }
        }
        .pi-test-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 1.125rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: border-color 0.2s ease;
        }
        .pi-test-card:hover { border-color: rgba(var(--tc-rgb),0.3); }
        .pi-test-card-badge {
          font-family: ui-monospace, monospace;
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--tc-color);
          background: rgba(var(--tc-rgb),0.1);
          border: 1px solid rgba(var(--tc-rgb),0.2);
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          width: fit-content;
        }
        .pi-test-card-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: rgba(255,255,255,0.88);
          letter-spacing: -0.01em;
        }
        .pi-test-card-tagline { font-size: 0.78rem; color: rgba(255,255,255,0.5); line-height: 1.55; }
        .pi-test-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.25rem;
          padding: 0.55rem 1.125rem;
          background: rgba(var(--tc-rgb),0.1);
          border: 1px solid rgba(var(--tc-rgb),0.22);
          border-radius: 8px;
          color: var(--tc-color);
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          width: fit-content;
          transition: background 0.15s ease;
        }
        .pi-test-card-cta:hover { background: rgba(var(--tc-rgb),0.2); }
      `}</style>

      <div className="pi-mesh" />

      <FadeIn delay={0}>
        <div className="pi-header">
          <div className="pi-eyebrow">Level9OS Site Rebuild · Design Review</div>
          <h1 className="pi-title">Six fundamentally different approaches.</h1>
          <p className="pi-sub">
            Not variations of the same theme. Six distinct entry metaphors, each using the same governance ROI numbers as the framing element.
          </p>
        </div>
      </FadeIn>

      {/* Proof strip */}
      <FadeIn delay={0.08}>
        <div className="pi-proof">
          {[
            { value: "$52,686", label: "Prevented (90d)" },
            { value: "$17,562/mo", label: "Run rate prevented" },
            { value: "$5.07/mo", label: "Infra cost" },
            { value: "3,464x", label: "ROI ratio" },
            { value: "236 hr", label: "Operator time saved" },
            { value: "$236–$4,284", label: "Today alone" },
          ].map((s) => (
            <div key={s.label} className="pi-proof-stat">
              <span className="pi-proof-value">{s.value}</span>
              <span className="pi-proof-label">{s.label}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Currently testing: Conversation variants */}
      <FadeIn delay={0.09}>
        <div className="pi-test-banner">
          <div className="pi-test-banner-label">
            <span className="pi-test-star">&#x2605;</span>
            <span className="pi-test-heading">Currently testing: pick the navigation pattern</span>
          </div>
          <p className="pi-test-sub">
            Same content. Same modules. Same agent voice. Only the shell pattern differs. Which one works better?
          </p>
          <div className="pi-test-grid">
            {CONVERSATION_VARIANTS.map((v) => (
              <div
                key={v.id}
                className="pi-test-card"
                style={{ "--tc-color": v.color, "--tc-rgb": v.rgb } as React.CSSProperties}
              >
                <span className="pi-test-card-badge">{v.badge}</span>
                <div className="pi-test-card-name">{v.name}</div>
                <div className="pi-test-card-tagline">{v.tagline}</div>
                <a href={v.href} className="pi-test-card-cta">
                  Open &#8594;
                </a>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Featured: The Receipt */}
      <FadeIn delay={0.1}>
        <div className="pi-featured-wrap">
          <div className="pi-featured-card">
            <div className="pi-featured-left">
              <div className="pi-featured-badges">
                <span className="pi-featured-new">&#x2605; NEW</span>
                <span className="pi-featured-type">Shock &amp; Awe</span>
              </div>
              <div className="pi-featured-name">{FEATURED.name}</div>
              <div className="pi-featured-tagline">{FEATURED.tagline}</div>
              <div className="pi-featured-pitch">{FEATURED.pitch}</div>
              <a href={FEATURED.href} className="pi-featured-cta">
                Open <span className="pi-featured-arrow">&#8594;</span>
              </a>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.14}>
        <div className="pi-section-label">
          <span className="pi-section-label-text">Five reference approaches</span>
          <div className="pi-section-label-line" />
        </div>
      </FadeIn>

      {/* First 3 */}
      <div className="pi-grid-top">
        {APPROACHES.slice(0, 3).map((c, i) => (
          <FadeIn key={c.id} delay={0.15 + i * 0.07}>
            <div style={{ "--card-color": c.color, "--card-rgb": c.rgb } as React.CSSProperties}>
              <MagneticCard className="pi-card" glowColor={`rgba(${c.rgb},0.1)`} maxTilt={3}>
                <div className="pi-card-accent" style={{ background: c.color, opacity: 0.7 }} />
                <span className="pi-card-badge">{c.badge}</span>
                <div className="pi-card-name">{c.name}</div>
                <div className="pi-card-tagline">{c.tagline}</div>
                <div className="pi-card-divider" />
                <div className="pi-card-pitch">{c.pitch}</div>
                <a href={c.href} className="pi-card-cta">
                  Open <span className="pi-card-arrow">&#8594;</span>
                </a>
              </MagneticCard>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Last 2 */}
      <div className="pi-grid-bottom">
        {APPROACHES.slice(3).map((c, i) => (
          <FadeIn key={c.id} delay={0.36 + i * 0.07}>
            <div style={{ "--card-color": c.color, "--card-rgb": c.rgb } as React.CSSProperties}>
              <MagneticCard className="pi-card" glowColor={`rgba(${c.rgb},0.1)`} maxTilt={3}>
                <div className="pi-card-accent" style={{ background: c.color, opacity: 0.7 }} />
                <span className="pi-card-badge">{c.badge}</span>
                <div className="pi-card-name">{c.name}</div>
                <div className="pi-card-tagline">{c.tagline}</div>
                <div className="pi-card-divider" />
                <div className="pi-card-pitch">{c.pitch}</div>
                <a href={c.href} className="pi-card-cta">
                  Open <span className="pi-card-arrow">&#8594;</span>
                </a>
              </MagneticCard>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.55}>
        <div className="pi-footer-note">rebuild branch · preview environment · not production · level9os.com untouched</div>
      </FadeIn>
    </div>
  );
}

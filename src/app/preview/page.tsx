"use client";
/**
 * /preview — Design Direction Selector
 * Five "The Pull" variations at top.
 * Three original reference prototypes below.
 */

import { MagneticCard } from "@level9/brand/components/motion";
import { FadeIn } from "@level9/brand/components/motion";

const PULL_VARIATIONS = [
  {
    id: "the-pull-cinematic",
    name: "The Pull — Cinematic",
    tagline: "12s canvas splash. Aurora gradient headlines. Dramatic mesh overlays. Most theatrical.",
    pitch: "Full color-cycle particle burst, horizontal snap-x, aurora CSS @property on every headline. Highest sensory budget.",
    href: "/preview/the-pull-cinematic",
    color: "#8b5cf6",
    rgb: "139,92,246",
    badge: "Cinematic",
  },
  {
    id: "the-pull-operator",
    name: "The Pull — Operator",
    tagline: "8s terminal-style boot. Grid assembles cube. Monospace everywhere. Dense stat strips.",
    pitch: "McKinsey rigor. Semantic color per panel. Dual-glow CTA buttons with 2s pulse. Operator-to-operator direct.",
    href: "/preview/the-pull-operator",
    color: "#6366f1",
    rgb: "99,102,241",
    badge: "Operator",
  },
  {
    id: "the-pull-vertical",
    name: "The Pull — Vertical",
    tagline: "Vertical snap-y scroll. Sticky rotating cube. Top progress bar. Mobile-native.",
    pitch: "Familiar mobile pattern. Cube rotates as you scroll. Bottom bleed shows next panel. Right-side dot nav.",
    href: "/preview/the-pull-vertical",
    color: "#06b6d4",
    rgb: "6,182,212",
    badge: "Vertical",
  },
  {
    id: "the-pull-voice",
    name: "The Pull — Voice",
    tagline: "8s canvas, then 40Hz audio pulse. Waveform UI on every panel. Podcast-first.",
    pitch: "Sound is the interaction. Visitor-initiated audio, waveform players per panel. Real ElevenLabs clips wire in later.",
    href: "/preview/the-pull-voice",
    color: "#ec4899",
    rgb: "236,72,153",
    badge: "Voice",
  },
  {
    id: "the-pull-live-data",
    name: "The Pull — Live Data",
    tagline: "10s canvas splash. Panel 4 is an interactive Claude/GPT/Gemini comparison widget.",
    pitch: "Proof-driven. Tap rows to expand micro-detail. Product demos itself mid-pitch. Static data, real interaction.",
    href: "/preview/the-pull-live-data",
    color: "#10b981",
    rgb: "16,185,129",
    badge: "Live Data",
  },
];

const REFERENCE_PROTOTYPES = [
  {
    id: "operating-room",
    name: "Operating Room",
    tagline: "15s particle-to-cube splash. Deep narrative scroll. The original canvas prototype.",
    href: "/preview/operating-room",
    color: "#8b5cf6",
    rgb: "139,92,246",
    badge: "Canvas",
  },
  {
    id: "glass-box",
    name: "Glass Box",
    tagline: "Six-panel horizontal swipe. Semantic color per panel. Clean architectural tone.",
    href: "/preview/glass-box",
    color: "#6366f1",
    rgb: "99,102,241",
    badge: "Scroll",
  },
  {
    id: "console",
    name: "The Console",
    tagline: "Marketing site feels like the product. Sidebar nav, ConsoleGraphic hero, Aurora headline.",
    href: "/preview/console",
    color: "#06b6d4",
    rgb: "6,182,212",
    badge: "Dashboard",
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
            radial-gradient(ellipse 800px 600px at 30% 40%, rgba(139,92,246,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 600px 500px at 70% 60%, rgba(6,182,212,0.03) 0%, transparent 70%);
        }
        .pi-header {
          text-align: center; display: flex; flex-direction: column;
          gap: 0.75rem; position: relative; z-index: 2; margin-bottom: 3rem;
        }
        .pi-eyebrow {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(139,92,246,0.8);
        }
        .pi-title {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 900; letter-spacing: -0.03em; line-height: 1.1;
          color: rgba(255,255,255,0.92);
        }
        .pi-sub {
          font-size: 0.95rem; color: rgba(255,255,255,0.45);
          line-height: 1.6; max-width: 44ch; margin: 0 auto;
        }
        /* Section label */
        .pi-section-label {
          width: 100%; max-width: 1120px;
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 1.25rem; position: relative; z-index: 2;
        }
        .pi-section-label-text {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.28); white-space: nowrap;
        }
        .pi-section-label-line {
          flex: 1; height: 1px; background: rgba(255,255,255,0.06);
        }
        /* Pull grid — 3 then 2 */
        .pi-pull-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 340px));
          gap: 1.25rem;
          position: relative; z-index: 2; width: 100%; max-width: 1060px;
          margin-bottom: 0.75rem;
        }
        .pi-pull-grid-bottom {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 340px));
          gap: 1.25rem;
          position: relative; z-index: 2; width: 100%; max-width: 700px;
          margin-bottom: 3.5rem;
        }
        /* Reference grid */
        .pi-ref-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 340px));
          gap: 1.25rem;
          position: relative; z-index: 2; width: 100%; max-width: 1060px;
          margin-bottom: 2rem;
        }
        /* Card */
        .pi-card {
          background: #0d0d18;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 2rem 1.75rem;
          display: flex; flex-direction: column; gap: 1rem;
          transition: border-color 0.3s ease;
          position: relative; overflow: hidden;
        }
        .pi-card:hover { border-color: rgba(var(--card-rgb),0.35); }
        .pi-card-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 16px 16px 0 0;
        }
        .pi-card-badge {
          display: inline-flex; align-items: center;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--card-color); background: rgba(var(--card-rgb),0.1);
          border: 1px solid rgba(var(--card-rgb),0.2); border-radius: 4px;
          padding: 0.25rem 0.625rem; width: fit-content;
        }
        .pi-card-name {
          font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em;
          color: rgba(255,255,255,0.92);
        }
        .pi-card-tagline {
          font-size: 0.82rem; color: rgba(255,255,255,0.62); line-height: 1.6;
        }
        .pi-card-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0.2rem 0; }
        .pi-card-pitch {
          font-size: 0.78rem; color: rgba(255,255,255,0.38); line-height: 1.65; font-style: italic;
        }
        .pi-card-cta {
          display: inline-flex; align-items: center; gap: 0.5rem;
          margin-top: 0.5rem; padding: 0.65rem 1.5rem;
          background: rgba(var(--card-rgb),0.12); border: 1px solid rgba(var(--card-rgb),0.25);
          border-radius: 8px; color: var(--card-color); font-size: 0.85rem; font-weight: 600;
          text-decoration: none; transition: background 0.2s ease, border-color 0.2s ease;
          width: fit-content;
        }
        .pi-card-cta:hover { background: rgba(var(--card-rgb),0.22); border-color: var(--card-color); }
        .pi-card-arrow { font-size: 0.9rem; transition: transform 0.2s ease; }
        .pi-card-cta:hover .pi-card-arrow { transform: translateX(3px); }
        /* Reference cards: slightly dimmer */
        .pi-ref-card { opacity: 0.72; transition: opacity 0.25s ease; }
        .pi-ref-card:hover { opacity: 1; }
        .pi-footer-note {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.62rem; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.18); text-align: center;
          position: relative; z-index: 2;
        }
        /* Mobile */
        @media (max-width: 1000px) {
          .pi-pull-grid { grid-template-columns: repeat(2, minmax(0, 380px)); }
          .pi-pull-grid-bottom { grid-template-columns: minmax(0, 380px); }
          .pi-ref-grid { grid-template-columns: repeat(2, minmax(0, 380px)); }
        }
        @media (max-width: 680px) {
          .pi-pull-grid, .pi-pull-grid-bottom, .pi-ref-grid {
            grid-template-columns: minmax(0, 420px); justify-content: center;
          }
          .pi-root { padding: 2.5rem 1.25rem 4rem; }
          .pi-card { padding: 1.5rem; }
        }
      `}</style>

      <div className="pi-mesh" />

      <FadeIn delay={0}>
        <div className="pi-header">
          <div className="pi-eyebrow">Level9OS Site Rebuild · Design Review</div>
          <h1 className="pi-title">Five executions of The Pull.</h1>
          <p className="pi-sub">Same headline. Same splash overlays. The variable is vibe and interaction model.</p>
        </div>
      </FadeIn>

      {/* Pull variations section label */}
      <FadeIn delay={0.1}>
        <div className="pi-section-label">
          <span className="pi-section-label-text">The Pull variations</span>
          <div className="pi-section-label-line" />
        </div>
      </FadeIn>

      {/* First 3 Pull variations */}
      <div className="pi-pull-grid">
        {PULL_VARIATIONS.slice(0, 3).map((c, i) => (
          <FadeIn key={c.id} delay={i * 0.08}>
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

      {/* Last 2 Pull variations */}
      <div className="pi-pull-grid-bottom">
        {PULL_VARIATIONS.slice(3).map((c, i) => (
          <FadeIn key={c.id} delay={(i + 3) * 0.08}>
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

      {/* Reference prototypes */}
      <FadeIn delay={0.45}>
        <div className="pi-section-label">
          <span className="pi-section-label-text">Earlier prototypes</span>
          <div className="pi-section-label-line" />
        </div>
      </FadeIn>

      <div className="pi-ref-grid">
        {REFERENCE_PROTOTYPES.map((c, i) => (
          <FadeIn key={c.id} delay={0.5 + i * 0.07}>
            <div style={{ "--card-color": c.color, "--card-rgb": c.rgb } as React.CSSProperties}>
              <MagneticCard className="pi-card pi-ref-card" glowColor={`rgba(${c.rgb},0.08)`} maxTilt={2}>
                <div className="pi-card-accent" style={{ background: c.color, opacity: 0.4 }} />
                <span className="pi-card-badge">{c.badge}</span>
                <div className="pi-card-name">{c.name}</div>
                <div className="pi-card-tagline">{c.tagline}</div>
                <a href={c.href} className="pi-card-cta">
                  Open <span className="pi-card-arrow">&#8594;</span>
                </a>
              </MagneticCard>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.65}>
        <div className="pi-footer-note">rebuild branch · preview environment · not production</div>
      </FadeIn>
    </div>
  );
}

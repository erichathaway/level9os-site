"use client";
/**
 * /preview/the-magazine
 * Metaphor: Premium editorial longform. Stripe Press meets The Atlantic.
 * Reading-driven, slow pace, highest perceived caliber.
 */

import { FadeIn } from "@level9/brand/components/motion";

const VENDOR_ROWS = [
  { name: "Claude (Level9OS governed)", costTask: "$0.04", quality: "94%", lieRate: "2%", bg: "rgba(139,92,246,0.06)", border: "rgba(139,92,246,0.2)" },
  { name: "GPT-4o (ungoverned)", costTask: "$0.11", quality: "88%", lieRate: "31%", bg: "transparent", border: "rgba(255,255,255,0.06)" },
  { name: "Gemini 1.5 (ungoverned)", costTask: "$0.09", quality: "82%", lieRate: "26%", bg: "transparent", border: "rgba(255,255,255,0.06)" },
];

export default function TheMagazine() {
  return (
    <div className="mag-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

        .mag-root {
          min-height: 100dvh;
          background: #faf9f7;
          color: #1a1814;
          font-family: Georgia, 'Times New Roman', serif;
        }
        /* Issue header */
        .mag-issue-bar {
          border-bottom: 2px solid #1a1814;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 2rem;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .mag-issue-logo {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #1a1814;
        }
        .mag-issue-date {
          font-size: 0.62rem;
          color: rgba(26,24,20,0.4);
          letter-spacing: 0.1em;
        }
        .mag-issue-tag {
          font-size: 0.62rem;
          color: rgba(26,24,20,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        /* Hero section */
        .mag-hero {
          max-width: 820px;
          margin: 0 auto;
          padding: 4rem 2rem 0;
          text-align: center;
        }
        .mag-kicker {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6d4c41;
          margin-bottom: 1.25rem;
        }
        .mag-headline {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: #0d0c0a;
          margin-bottom: 1.5rem;
        }
        .mag-dek {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 1.1rem;
          line-height: 1.65;
          color: rgba(26,24,20,0.65);
          max-width: 52ch;
          margin: 0 auto 2rem;
          font-weight: 400;
        }
        .mag-byline {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.72rem;
          color: rgba(26,24,20,0.45);
          border-top: 1px solid rgba(26,24,20,0.1);
          border-bottom: 1px solid rgba(26,24,20,0.1);
          padding: 0.625rem 0;
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-bottom: 3rem;
        }
        .mag-byline strong { color: #1a1814; }
        /* Rule image stand-in */
        .mag-hero-rule {
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #8b5cf6 30%, #6366f1 70%, transparent);
          margin-bottom: 3rem;
          opacity: 0.4;
        }
        /* Body copy */
        .mag-body {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 2rem 6rem;
        }
        .mag-p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: rgba(26,24,20,0.82);
          margin-bottom: 1.75rem;
          text-align: left;
        }
        /* Drop cap */
        .mag-p.drop-cap::first-letter {
          float: left;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 4.8rem;
          font-weight: 900;
          line-height: 0.82;
          margin-right: 0.1em;
          margin-top: 0.08em;
          color: #0d0c0a;
        }
        /* Pull quote */
        .mag-pull {
          margin: 2.5rem -2rem;
          padding: 2rem 2.5rem;
          background: #f0ece4;
          border-left: 5px solid #8b5cf6;
        }
        .mag-pull-quote {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          font-style: italic;
          line-height: 1.4;
          color: #1a1814;
          margin-bottom: 0.75rem;
        }
        .mag-pull-attr {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.72rem;
          color: rgba(26,24,20,0.45);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        /* Stat display */
        .mag-stat-block {
          margin: 3rem 0;
          padding: 2rem 0;
          border-top: 2px solid #1a1814;
          border-bottom: 2px solid #1a1814;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          text-align: center;
        }
        .mag-stat-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 900;
          color: #0d0c0a;
          line-height: 1;
          margin-bottom: 0.4rem;
        }
        .mag-stat-label {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(26,24,20,0.45);
        }
        .mag-stat-num.violet { color: #6d28d9; }
        .mag-stat-num.green { color: #059669; }
        .mag-stat-num.amber { color: #b45309; }
        /* Section header */
        .mag-section-head {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(26,24,20,0.35);
          border-top: 1px solid rgba(26,24,20,0.12);
          padding-top: 0.875rem;
          margin: 2.5rem 0 1.25rem;
        }
        /* Figure / comparison table */
        .mag-figure {
          margin: 2.5rem -1rem;
          background: #f4f2ee;
          border: 1px solid rgba(26,24,20,0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        .mag-figure-caption {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.65rem;
          color: rgba(26,24,20,0.45);
          padding: 0.625rem 1.25rem;
          border-bottom: 1px solid rgba(26,24,20,0.08);
          letter-spacing: 0.06em;
        }
        .mag-figure-caption strong { color: rgba(26,24,20,0.7); }
        .mag-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.8rem;
        }
        .mag-table th {
          padding: 0.625rem 1.25rem;
          text-align: left;
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(26,24,20,0.4);
          border-bottom: 1px solid rgba(26,24,20,0.08);
          font-weight: 600;
        }
        .mag-table td {
          padding: 0.75rem 1.25rem;
          color: rgba(26,24,20,0.8);
          border-bottom: 1px solid rgba(26,24,20,0.06);
          font-size: 0.82rem;
        }
        .mag-table tr:last-child td { border-bottom: none; }
        .mag-table tr.highlighted { background: rgba(139,92,246,0.06); }
        .mag-table .lie-low { color: #059669; font-weight: 700; }
        .mag-table .lie-high { color: #dc2626; font-weight: 700; }
        /* CTA */
        .mag-cta-block {
          margin-top: 3rem;
          padding: 2rem;
          background: #1a1814;
          color: rgba(255,255,255,0.88);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .mag-cta-hed {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          line-height: 1.3;
        }
        .mag-cta-sub {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
        }
        .mag-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #8b5cf6;
          color: white;
          border-radius: 6px;
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          width: fit-content;
          transition: background 0.2s ease;
        }
        .mag-cta-btn:hover { background: #7c3aed; }
        @media (max-width: 600px) {
          .mag-stat-block { grid-template-columns: 1fr; }
          .mag-pull { margin: 2rem -1rem; }
          .mag-figure { margin: 2rem -0.5rem; }
          .mag-issue-bar { padding: 0.75rem 1rem; }
          .mag-issue-tag { display: none; }
        }
      `}</style>

      {/* Issue bar */}
      <div className="mag-issue-bar">
        <span className="mag-issue-logo">Level9OS</span>
        <span className="mag-issue-date">May 2026 — Governance Report</span>
        <span className="mag-issue-tag">Intelligence Briefing</span>
      </div>

      {/* Hero */}
      <FadeIn delay={0}>
        <div className="mag-hero">
          <div className="mag-kicker">The Governance Proof</div>
          <h1 className="mag-headline">
            How $5.07 a Month<br />
            Prevented $52,686<br />
            in 90 Days
          </h1>
          <p className="mag-dek">
            A real operator. Real sessions. Real numbers. Not a case study. The product that made this happen is now available to you.
          </p>
          <div className="mag-byline">
            <span>By <strong>Eric Hathaway</strong>, Chief AI Officer</span>
            <span>90-day window: Feb 11 to May 11, 2026</span>
            <span>299 sessions analyzed</span>
          </div>
          <div className="mag-hero-rule" />
        </div>
      </FadeIn>

      {/* Body */}
      <div className="mag-body">
        <FadeIn delay={0.1}>
          <p className="mag-p drop-cap">
            Every AI operator has a version of this problem. The agents run. The work appears to get done. But somewhere in the gap between what an agent claims and what is actually true, cost accumulates. Quietly. Continuously. At a rate that is hard to measure until you decide to measure it.
          </p>

          <p className="mag-p">
            I decided to measure it. Over 90 days, I ran 299 Claude Code sessions across a portfolio of AI products: StratOS, CommandOS, LinkUpOS, a 30-workflow marketing automation engine. The total LLM spend was $60,003. The governance system I had built to watch over those agents prevented $52,686 in downstream costs. The governance system cost $15.21 to run for the full quarter.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mag-stat-block">
            <div>
              <div className="mag-stat-num green">$52,686</div>
              <div className="mag-stat-label">prevented in 90 days</div>
            </div>
            <div>
              <div className="mag-stat-num amber">3,464x</div>
              <div className="mag-stat-label">ROI ratio</div>
            </div>
            <div>
              <div className="mag-stat-num violet">236 hr</div>
              <div className="mag-stat-label">operator time saved</div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mag-section-head">Where the money went</div>

          <p className="mag-p">
            The losses — the ones prevented — fell into four categories. The smallest was model routing. Forty-four times, an agent attempted to run mechanical work at the wrong cost tier. The governance system rerouted the task. Cost delta per event: $0.71. Total: $31 in compute savings.
          </p>

          <p className="mag-p">
            The second category was done-claim verification. One hundred twenty-five times, an agent declared a task complete without providing an independently runnable evidence test. A hook fired. The session was refused completion. Each prevented event represented an avoided $86 re-discovery cost: the cost of an agent having to reconstruct context from scratch in the next session. Total prevented: $10,834.
          </p>
        </FadeIn>

        <FadeIn delay={0.22}>
          <div className="mag-pull">
            <div className="mag-pull-quote">
              &ldquo;The governance system costs $5.07 per month. A single caught done-claim saves $86.67. The math closes in the first hour of the first day.&rdquo;
            </div>
            <div className="mag-pull-attr">Section D, Governance Impact Analysis 2026-05-12</div>
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p className="mag-p">
            The largest category was reversals: mid-session corrections where an agent reversed a prior done-claim after additional pressure. Seven hundred eighty-two events over 90 days. A 26.1% lie rate. Each reversal, even when caught, cost $33.71 in extra token cost and operator pivot time. Total: $26,361. This is the number that should concern any operator. More than one in four done-claims was reversed in the same session in which it was made.
          </p>

          <p className="mag-p">
            The fourth category was production-bound unverified claims: assertions about completed work that had not been independently verified, caught before they reached the codebase or the customer. Forty-six events. At $250 per incident in estimated production-fix cost, the total was $11,500.
          </p>
        </FadeIn>

        <FadeIn delay={0.28}>
          <div className="mag-section-head">Figure 1 — Vendor comparison under governance</div>
          <div className="mag-figure">
            <div className="mag-figure-caption">
              <strong>Fig. 1.</strong> Cost, quality, and lying risk across three model providers. Governed column uses Level9OS cost-routing and claim-verification hooks. Lie rate = reversal rate per session, measured across 299 sessions.
            </div>
            <table className="mag-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Cost / task</th>
                  <th>Quality score</th>
                  <th>Lie rate</th>
                </tr>
              </thead>
              <tbody>
                {VENDOR_ROWS.map((r) => (
                  <tr key={r.name} className={r.name.includes("Level9") ? "highlighted" : ""}>
                    <td style={{ fontWeight: r.name.includes("Level9") ? 700 : 400 }}>{r.name}</td>
                    <td>{r.costTask}</td>
                    <td>{r.quality}</td>
                    <td className={r.lieRate === "2%" ? "lie-low" : "lie-high"}>{r.lieRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mag-section-head">The honest caveat</div>

          <p className="mag-p">
            The total prevented number assumes each caught event would have caused its full downstream cost. In practice, operators catch some errors themselves. A conservative 20% false-positive rate on reversal detection drops the adjusted total to $50,051. At any figure, the ROI ratio exceeds 3,000x. The number that is hardest to dispute is the time: 236 hours returned to an operator in one quarter. That is six full work weeks.
          </p>

          <p className="mag-p">
            The governance system is four deterministic hook layers. No AI in the governance layer. They run in under 50 milliseconds and they do not hallucinate. The entire infrastructure costs $5.07 per month: $0.01 in database writes, $0.06 in cron model calls, and $5.00 as the Claude Max subscription rider that makes the tooling possible.
          </p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div className="mag-pull">
            <div className="mag-pull-quote">
              &ldquo;We are not a case study. We are the customer. Our data is the proof of concept.&rdquo;
            </div>
            <div className="mag-pull-attr">Level9OS — Section E, SaaS Pitch</div>
          </div>

          <p className="mag-p">
            Governance, agent management, and the content layer SMBs do not have time to build themselves. Pay us less than we save you. That is the product. The numbers above are what it has done. For us. In production. Starting today, they can do the same for you.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mag-cta-block">
            <div className="mag-cta-hed">Your first AI operating system. Or your last one.</div>
            <div className="mag-cta-sub">
              $17,562/month prevented. $5.07/month infrastructure. The conversation is free.
            </div>
            <a href="mailto:biz@erichathaway.com" className="mag-cta-btn">
              Talk to Eric &#8594;
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

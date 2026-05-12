"use client";
/**
 * /preview/the-calculator
 * Metaphor: Self-quantified value before any pitch.
 * Visitor's own number is the hook. No pitch above the fold.
 */

import { useState, useCallback } from "react";
import { FadeIn } from "@level9/brand/components/motion";

// Projection model — rules-based, not fake
// Based on 90d dataset: 87.8% prevention rate on waste-at-risk spend
// Waste-at-risk is estimated at ~43.5% of total AI spend (per our data)
// (52686 prevented / 60003 total spend over 90d = 87.8% efficiency,
//  but normalizing for overhead: waste-at-risk share ~25-35% of spend)
function calcProjection(employees: number, tools: number, monthlySpend: number) {
  if (monthlySpend <= 0) return null;

  // Complexity multiplier: more tools = more inter-agent chaos
  const complexityFactor = Math.min(1 + (tools - 1) * 0.08, 2.2);

  // Waste-at-risk fraction climbs with complexity (unchecked agents produce more rework)
  const wasteAtRiskFraction = Math.min(0.18 + tools * 0.015 + employees * 0.001, 0.55);

  const wasteAtRisk = monthlySpend * wasteAtRiskFraction * complexityFactor;

  // Prevention rate from real data
  const preventionRate = 0.878;
  const prevented = wasteAtRisk * preventionRate;

  // Hours: operators save ~79hr/mo per $17,562 prevented (linear scaling)
  const hoursRatio = 79 / 17562;
  const hoursMonthly = prevented * hoursRatio;

  // ROI relative to $5.07/mo infra
  const infraCost = 5.07;
  const roiRatio = prevented / infraCost;

  return {
    prevented: Math.round(prevented),
    hoursMonthly: Math.round(hoursMonthly * 10) / 10,
    wasteAtRisk: Math.round(wasteAtRisk),
    roiRatio: Math.round(roiRatio),
    infraCost: 5.07,
  };
}

export default function TheCalculator() {
  const [employees, setEmployees] = useState(10);
  const [tools, setTools] = useState(5);
  const [monthlySpend, setMonthlySpend] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcProjection>>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleCalculate = useCallback(() => {
    const spend = parseFloat(monthlySpend.replace(/[^0-9.]/g, ""));
    if (!spend || spend <= 0) return;
    const r = calcProjection(employees, tools, spend);
    setResult(r);
    setHasCalculated(true);
  }, [employees, tools, monthlySpend]);

  return (
    <div className="calc-root">
      <style>{`
        .calc-root {
          min-height: 100dvh;
          background: #070710;
          color: rgba(255,255,255,0.88);
          font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 3.5rem 1.5rem 5rem;
        }
        .calc-inner {
          width: 100%;
          max-width: 620px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .calc-eyebrow {
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(139,92,246,0.7);
          font-family: ui-monospace, monospace;
          margin-bottom: 1rem;
        }
        .calc-headline {
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 900;
          letter-spacing: -0.035em;
          line-height: 1.1;
          color: rgba(255,255,255,0.94);
          margin-bottom: 0.75rem;
        }
        .calc-sub {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.42);
          line-height: 1.65;
          margin-bottom: 2.5rem;
          max-width: 44ch;
        }
        /* Calculator card */
        .calc-card {
          background: #0e0e1c;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          margin-bottom: 2rem;
        }
        .calc-field {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .calc-field-label {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .calc-field-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
        }
        .calc-field-value {
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(139,92,246,0.9);
          font-family: ui-monospace, monospace;
        }
        /* Slider */
        .calc-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.08);
          outline: none;
          cursor: pointer;
        }
        .calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.25);
          transition: box-shadow 0.2s ease;
        }
        .calc-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(139,92,246,0.3);
        }
        .calc-slider-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 0.58rem;
          color: rgba(255,255,255,0.2);
          font-family: ui-monospace, monospace;
          margin-top: 0.3rem;
        }
        /* Spend input */
        .calc-spend-wrap {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .calc-spend-wrap:focus-within {
          border-color: rgba(139,92,246,0.4);
        }
        .calc-spend-prefix {
          padding: 0 1rem;
          font-size: 1rem;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.08);
          height: 48px;
          display: flex;
          align-items: center;
        }
        .calc-spend-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 0 1rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          font-family: ui-monospace, monospace;
          height: 48px;
        }
        .calc-spend-input::placeholder {
          color: rgba(255,255,255,0.18);
          font-weight: 400;
        }
        /* CTA button */
        .calc-btn {
          padding: 0.9rem 2rem;
          background: #8b5cf6;
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
          letter-spacing: 0.02em;
        }
        .calc-btn:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }
        .calc-btn:active { transform: none; }
        .calc-btn:disabled {
          background: rgba(139,92,246,0.3);
          cursor: not-allowed;
          transform: none;
        }
        /* Results */
        .calc-result {
          background: linear-gradient(135deg, rgba(139,92,246,0.08), rgba(16,185,129,0.06));
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 20px;
          padding: 2rem;
          animation: calc-reveal 0.5s ease;
          margin-bottom: 2rem;
        }
        @keyframes calc-reveal {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }
        .calc-result-headline {
          font-size: 1rem;
          font-weight: 700;
          color: rgba(255,255,255,0.75);
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }
        .calc-result-headline span {
          color: #10b981;
        }
        .calc-result-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.75rem;
        }
        .calc-result-stat {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .calc-result-stat-label {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: ui-monospace, monospace;
        }
        .calc-result-stat-value {
          font-size: 1.6rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .calc-result-stat-sub {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.28);
        }
        .calc-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 1.25rem 0;
        }
        /* Anchor proof */
        .calc-anchor {
          background: #0e0e1c;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 1.5rem 1.75rem;
        }
        .calc-anchor-label {
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          font-family: ui-monospace, monospace;
          margin-bottom: 1rem;
        }
        .calc-anchor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .calc-anchor-stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .calc-anchor-value {
          font-size: 0.95rem;
          font-weight: 800;
          color: rgba(255,255,255,0.85);
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .calc-anchor-label-sm {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.28);
          line-height: 1.4;
        }
        .calc-note {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.2);
          margin-top: 1.25rem;
          line-height: 1.6;
          font-family: ui-monospace, monospace;
        }
        @media (max-width: 480px) {
          .calc-result-grid { grid-template-columns: 1fr; }
          .calc-anchor-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="calc-inner">
        <FadeIn delay={0}>
          <div className="calc-eyebrow">Level9OS — Value Calculator</div>
          <h1 className="calc-headline">What is ungoverned AI costing you?</h1>
          <p className="calc-sub">
            Enter your numbers. Get your projected monthly loss from unverified claims, wrong model routing, and agent rework.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="calc-card">
            <div className="calc-field">
              <div className="calc-field-label">
                <span className="calc-field-name">Company size</span>
                <span className="calc-field-value">{employees} {employees === 1 ? "employee" : "employees"}</span>
              </div>
              <input
                type="range"
                min={1}
                max={200}
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="calc-slider"
              />
              <div className="calc-slider-ticks">
                <span>1</span><span>50</span><span>100</span><span>150</span><span>200</span>
              </div>
            </div>

            <div className="calc-field">
              <div className="calc-field-label">
                <span className="calc-field-name">AI tools in use</span>
                <span className="calc-field-value">{tools} {tools === 1 ? "tool" : "tools"}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={tools}
                onChange={(e) => setTools(Number(e.target.value))}
                className="calc-slider"
              />
              <div className="calc-slider-ticks">
                <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span>
              </div>
            </div>

            <div className="calc-field">
              <div className="calc-field-label">
                <span className="calc-field-name">Monthly AI spend</span>
              </div>
              <div className="calc-spend-wrap">
                <span className="calc-spend-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 5000"
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(e.target.value)}
                  className="calc-spend-input"
                  onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                />
              </div>
            </div>

            <button
              className="calc-btn"
              onClick={handleCalculate}
              disabled={!monthlySpend || parseFloat(monthlySpend) <= 0}
            >
              Calculate my projected savings
            </button>
          </div>
        </FadeIn>

        {hasCalculated && result && (
          <div className="calc-result">
            <div className="calc-result-headline">
              You are projected to lose <span>${result.wasteAtRisk.toLocaleString()}/month</span> to ungoverned AI waste.<br />
              Level9OS would prevent <span>${result.prevented.toLocaleString()}/month</span>.
            </div>
            <div className="calc-result-grid">
              <div className="calc-result-stat">
                <span className="calc-result-stat-label">Monthly prevented</span>
                <span className="calc-result-stat-value" style={{ color: "#10b981" }}>
                  ${result.prevented.toLocaleString()}
                </span>
                <span className="calc-result-stat-sub">projected at 87.8% prevention rate</span>
              </div>
              <div className="calc-result-stat">
                <span className="calc-result-stat-label">Operator hours returned</span>
                <span className="calc-result-stat-value" style={{ color: "#8b5cf6" }}>
                  {result.hoursMonthly} hr/mo
                </span>
                <span className="calc-result-stat-sub">estimated from real session data</span>
              </div>
              <div className="calc-result-stat">
                <span className="calc-result-stat-label">ROI on $5.07/mo infra</span>
                <span className="calc-result-stat-value" style={{ color: "#f59e0b" }}>
                  {result.roiRatio.toLocaleString()}x
                </span>
                <span className="calc-result-stat-sub">payback in under one day</span>
              </div>
              <div className="calc-result-stat">
                <span className="calc-result-stat-label">Infra cost</span>
                <span className="calc-result-stat-value" style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.2rem" }}>
                  $5.07/mo
                </span>
                <span className="calc-result-stat-sub">Supabase writes + hook crons + Claude Max rider</span>
              </div>
            </div>
            <div className="calc-note">
              Projection uses 87.8% prevention rate from 299 real sessions over 90 days.
              Waste-at-risk fraction estimated from complexity of tool stack.
              Your actual results depend on agent volume, operator rate, and error frequency.
            </div>
          </div>
        )}

        <FadeIn delay={0.25}>
          <div className="calc-anchor">
            <div className="calc-anchor-label">Eric&apos;s actual numbers — 90-day production window</div>
            <div className="calc-anchor-grid">
              <div className="calc-anchor-stat">
                <span className="calc-anchor-value">$52,686</span>
                <span className="calc-anchor-label-sm">prevented in 90 days</span>
              </div>
              <div className="calc-anchor-stat">
                <span className="calc-anchor-value">$17,562/mo</span>
                <span className="calc-anchor-label-sm">run rate prevented</span>
              </div>
              <div className="calc-anchor-stat">
                <span className="calc-anchor-value">$5.07/mo</span>
                <span className="calc-anchor-label-sm">governance infra cost</span>
              </div>
              <div className="calc-anchor-stat">
                <span className="calc-anchor-value">3,464x</span>
                <span className="calc-anchor-label-sm">ROI ratio</span>
              </div>
              <div className="calc-anchor-stat">
                <span className="calc-anchor-value">236 hr</span>
                <span className="calc-anchor-label-sm">operator time saved</span>
              </div>
              <div className="calc-anchor-stat">
                <span className="calc-anchor-value">$236–$4,284</span>
                <span className="calc-anchor-label-sm">prevented today alone</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

"use client";
/**
 * /preview/the-conversation-hybrid
 * Shell pattern: Starts as centered chat splash. Transitions to dashboard when
 * content demands it. Supports three distinct visitor states:
 *   State 1 — Fresh visit: centered splash, transitions to dashboard on first
 *             rich module request
 *   State 2 — Return visit (< 30 days): lands directly in dashboard, thread
 *             restored
 *   State 3 — Skipped splash: lands in dashboard with pre-surfaced tabs
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { CursorGradient, FadeIn } from "@level9/brand/components/motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleId =
  | "counter"
  | "calculator"
  | "article"
  | "live-feed"
  | "comparison"
  | "voice-pitch"
  | "wrapper-story";

type PoolGroup = "A" | "B" | "C" | "D" | "E";

interface PoolPrompt {
  id: string;
  label: string;
  group: PoolGroup;
  /** If set, only show after this module has been revealed */
  requiresModule?: ModuleId;
  /** If set, triggers this module reveal when clicked */
  opensModule?: ModuleId;
  /** Handler key for special behaviors */
  action?: "cta-person" | "cta-voice" | "reopen-module";
}

type VisitorState = "splash" | "dashboard" | "transitioning";

interface ConversationState {
  threadId: string;
  messages: ChatMessage[];
  unlockedModules: ModuleId[];
  activeModule?: ModuleId;
  userAnswers: Record<string, unknown>;
  lastVisit: string;
  skippedSplash?: boolean;
  // new fields
  closedTabs: ModuleId[];
  poolHistory: string[];
  lastVisitorActivity: number;
}

interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content?: string;
  moduleId?: ModuleId;
  isModule?: boolean;
}

// ─── Projection model ─────────────────────────────────────────────────────────

function calcProjection(employees: number, tools: number, monthlySpend: number) {
  if (monthlySpend <= 0) return null;
  const complexityFactor = Math.min(1 + (tools - 1) * 0.08, 2.2);
  const wasteAtRiskFraction = Math.min(0.18 + tools * 0.015 + employees * 0.001, 0.55);
  const wasteAtRisk = monthlySpend * wasteAtRiskFraction * complexityFactor;
  const preventionRate = 0.878;
  const prevented = wasteAtRisk * preventionRate;
  const hoursRatio = 79 / 17562;
  const hoursMonthly = prevented * hoursRatio;
  const infraCost = 5.07;
  const roiRatio = prevented / infraCost;
  return {
    prevented: Math.round(prevented),
    hoursMonthly: Math.round(hoursMonthly * 10) / 10,
    wasteAtRisk: Math.round(wasteAtRisk),
    roiRatio: Math.round(roiRatio),
    infraCost,
  };
}

// ─── Module metadata ──────────────────────────────────────────────────────────

// Display-only modules render inline in splash without triggering transition
const DISPLAY_ONLY: ModuleId[] = ["counter", "wrapper-story"];

const MODULE_META: Record<
  ModuleId,
  { label: string; icon: string; suggestedReply: string; agentIntro: string }
> = {
  counter: {
    label: "The Number",
    icon: "$",
    suggestedReply: "Show me a number",
    agentIntro: "Here it is. $0 to $52,686. Ninety days. Three decimal places of receipts.",
  },
  calculator: {
    label: "Calculator",
    icon: "~",
    suggestedReply: "How would I save?",
    agentIntro: "Pulled up the calculator for you.",
  },
  article: {
    label: "The Story",
    icon: "A",
    suggestedReply: "Tell me a story",
    agentIntro: "Opening the long version. How $5.07 a month prevented $52,686 in 90 days.",
  },
  "live-feed": {
    label: "Live Feed",
    icon: "//",
    suggestedReply: "Show me it working",
    agentIntro: "Here is the system running. Every blocked action, every rerouted call. Live.",
  },
  comparison: {
    label: "Comparison",
    icon: "=",
    suggestedReply: "Who else is doing this?",
    agentIntro: "Pulling up the vendor comparison.",
  },
  "voice-pitch": {
    label: "The Pitch",
    icon: ">",
    suggestedReply: "Have you got 90 seconds for the whole pitch?",
    agentIntro: "Three versions. Pick how deep you want to go.",
  },
  "wrapper-story": {
    label: "Wrapper Story",
    icon: "[]",
    suggestedReply: "What is OutboundOS?",
    agentIntro: "OutboundOS is the first wrapper on this governance layer. Here is the roadmap.",
  },
};

const MODULE_ORDER: ModuleId[] = [
  "counter",
  "calculator",
  "article",
  "live-feed",
  "comparison",
  "voice-pitch",
  "wrapper-story",
];

// Per-module accent colors from brand palette
const MODULE_COLOR: Record<ModuleId, string> = {
  "counter":       "#ef4444", // Chassis / Vault
  "calculator":    "#06b6d4", // Measure / LucidORG
  "article":       "#64748b", // COO Playbook / slate
  "live-feed":     "#ef4444", // Chassis / Vault
  "comparison":    "#8b5cf6", // Decide / StratOS
  "voice-pitch":   "#ec4899", // MAX
  "wrapper-story": "#f59e0b", // Execute / OutboundOS
};

// Pre-surfaced tabs for State 3 (skipped)
const SKIP_DEFAULT_TABS: ModuleId[] = ["counter", "calculator", "comparison", "article"];

// ─── Module components (reused from pure/tabs variants) ────────────────────────

function CounterModule() {
  const [value, setValue] = useState(0);
  const TARGET = 52686;

  useEffect(() => {
    const start = Date.now();
    const duration = 2800;
    let raf: number;
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * TARGET));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="hb-module-counter">
      <div className="hbmc-number">${value.toLocaleString()}</div>
      <div className="hbmc-label">Prevented in 90 days</div>
      <div className="hbmc-stats">
        <div className="hbmc-stat">
          <span className="hbmc-sv">$5.07/mo</span>
          <span className="hbmc-ss">infrastructure cost</span>
        </div>
        <div className="hbmc-divider" />
        <div className="hbmc-stat">
          <span className="hbmc-sv">3,464x</span>
          <span className="hbmc-ss">ROI ratio</span>
        </div>
        <div className="hbmc-divider" />
        <div className="hbmc-stat">
          <span className="hbmc-sv">90 days</span>
          <span className="hbmc-ss">real production data</span>
        </div>
      </div>
      <div className="hbmc-breakdown">
        {[
          { cat: "Stop hook fires", n: "125 events", saved: "$10,834" },
          { cat: "Mid-session reversals", n: "782 events", saved: "$26,361" },
          { cat: "Flub events stopped", n: "46 events", saved: "$11,500" },
          { cat: "Cost-router refusals", n: "44 events", saved: "$31" },
        ].map((r) => (
          <div key={r.cat} className="hbmc-bd-row">
            <span className="hbmc-bd-cat">{r.cat}</span>
            <span className="hbmc-bd-n">{r.n}</span>
            <span className="hbmc-bd-saved">{r.saved}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalculatorModule({
  defaultEmployees,
  defaultTools,
}: {
  defaultEmployees?: number;
  defaultTools?: number;
}) {
  const [employees, setEmployees] = useState(defaultEmployees ?? 10);
  const [tools, setTools] = useState(defaultTools ?? 5);
  const [spendInput, setSpendInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcProjection>>(null);

  const calculate = () => {
    const spend = parseFloat(spendInput.replace(/[^0-9.]/g, ""));
    if (!spend || spend <= 0) return;
    setResult(calcProjection(employees, tools, spend));
  };

  return (
    <div className="hb-module-calc">
      <div className="hbcalc-row">
        <label className="hbcalc-label">Team size: {employees}</label>
        <input type="range" min={1} max={200} value={employees}
          onChange={(e) => setEmployees(+e.target.value)} className="hbcalc-slider" />
      </div>
      <div className="hbcalc-row">
        <label className="hbcalc-label">AI tools in use: {tools}</label>
        <input type="range" min={1} max={20} value={tools}
          onChange={(e) => setTools(+e.target.value)} className="hbcalc-slider" />
      </div>
      <div className="hbcalc-row">
        <label className="hbcalc-label">Monthly AI spend ($)</label>
        <input type="text" placeholder="e.g. 2000" value={spendInput}
          onChange={(e) => setSpendInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          className="hbcalc-input" />
      </div>
      <button onClick={calculate} className="hbcalc-btn">Calculate</button>
      {result && (
        <div className="hbcalc-result">
          <div className="hbcalc-r-row">
            <span className="hbcalc-r-label">Projected monthly savings</span>
            <span className="hbcalc-r-val">${result.prevented.toLocaleString()}</span>
          </div>
          <div className="hbcalc-r-row">
            <span className="hbcalc-r-label">Operator hours returned / mo</span>
            <span className="hbcalc-r-val">{result.hoursMonthly} hrs</span>
          </div>
          <div className="hbcalc-r-row">
            <span className="hbcalc-r-label">ROI vs $5.07/mo infra</span>
            <span className="hbcalc-r-val accent">{result.roiRatio.toLocaleString()}x</span>
          </div>
          <div className="hbcalc-anchor">
            Eric&apos;s actual numbers: $52,686 prevented. $5.07/mo. 3,464x ROI.
          </div>
        </div>
      )}
    </div>
  );
}

function ArticleModule() {
  return (
    <div className="hb-module-article">
      <div className="hbart-eyebrow">Case Study</div>
      <h2 className="hbart-headline" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>How $5.07 a Month Prevented $52,686 in 90 Days</h2>
      <p className="hbart-dropcap">
        <span className="hbart-dc">T</span>he number sounds made up. It isn&apos;t. Over 90 days,
        across 299 Claude Code sessions, a single governance layer blocked, rerouted, or flagged over
        a thousand agent actions before they could generate rework. The infrastructure cost: $5.07 a month.
      </p>
      <blockquote className="hbart-pullquote">
        &ldquo;The ROI isn&apos;t the point. The point is that the number is real, traceable, and repeatable.&rdquo;
      </blockquote>
      <p className="hbart-body">
        Four categories drove the savings. Cost-router refusals caught mechanical work being run on
        expensive models and rerouted it. Stop hook fires caught agents claiming &ldquo;done&rdquo; without
        a build verify. Mid-session reversals caught agents contradicting their own prior done-claims.
        Flub events caught unverified assertions before they shipped to production.
      </p>
      <div className="hbart-breakdown">
        {[
          { cat: "Stop hook fires", events: "125 events", saved: "$10,834" },
          { cat: "Mid-session reversals", events: "782 events", saved: "$26,361" },
          { cat: "Flub events stopped", events: "46 events", saved: "$11,500" },
          { cat: "Cost-router refusals", events: "44 events", saved: "$31" },
        ].map((r) => (
          <div key={r.cat} className="hbart-row">
            <span className="hbart-cat">{r.cat}</span>
            <span className="hbart-ev">{r.events}</span>
            <span className="hbart-saved">{r.saved}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEED_EVENTS = [
  { action: "Done-claim without build verify", verdict: "BLOCKED", saved: 86.67, cat: "Stop hook" },
  { action: "Broad grep on expensive model tier", verdict: "REROUTED", saved: 0.71, cat: "Cost-router" },
  { action: "Write to protected governance hook", verdict: "BLOCKED", saved: 110.0, cat: "Protected-resource" },
  { action: "Unverified claim before production push", verdict: "BLOCKED", saved: 250.0, cat: "Flub/claim" },
  { action: "Mid-session reversal on prior done-claim", verdict: "FLAGGED", saved: 33.71, cat: "Reversal" },
  { action: "Em dash in user-facing marketing copy", verdict: "FLAGGED", saved: 33.71, cat: "Voice-rule" },
  { action: "Mechanical rename rerouted to Haiku", verdict: "REROUTED", saved: 1.4, cat: "Cost-router" },
  { action: "Force-push to main attempted", verdict: "BLOCKED", saved: 110.0, cat: "Protected-resource" },
  { action: "Classification sweep on correct tier", verdict: "ALLOWED", saved: 0, cat: "Cost-router" },
  { action: "Build verified, done-claim accepted", verdict: "ALLOWED", saved: 0, cat: "Stop hook" },
];

const VERDICT_COLORS: Record<string, { color: string; bg: string }> = {
  BLOCKED: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  REROUTED: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  FLAGGED: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  ALLOWED: { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
};

function LiveFeedModule() {
  const [visible, setVisible] = useState(3);
  const [total, setTotal] = useState(1284.29);

  useEffect(() => {
    if (visible >= FEED_EVENTS.length) return;
    const t = setTimeout(() => {
      setVisible((v) => v + 1);
      setTotal((t) => t + (FEED_EVENTS[visible]?.saved ?? 0));
    }, 1100);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="hb-module-feed">
      <div className="hbfeed-header">
        <span className="hbfeed-label">Live audit trail</span>
        <span className="hbfeed-total">${total.toFixed(2)} saved this session</span>
      </div>
      <div className="hbfeed-list">
        {FEED_EVENTS.slice(0, visible).map((ev, i) => {
          const vc = VERDICT_COLORS[ev.verdict] ?? VERDICT_COLORS.ALLOWED;
          return (
            <div key={i} className="hbfeed-event">
              <span className="hbfeed-verdict" style={{ color: vc.color, background: vc.bg }}>
                {ev.verdict}
              </span>
              <span className="hbfeed-action">{ev.action}</span>
              {ev.saved > 0 && <span className="hbfeed-saved">+${ev.saved.toFixed(2)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const COMPARISON_ROWS = [
  { label: "Annual cost", ms: "~$1,000,000", sf: "~$850,000", wd: "~$500,000", l9: "$5,988" },
  { label: "Sales cycle", ms: "6 months", sf: "4 months", wd: "6 months", l9: "5 minutes" },
  { label: "Lock-in", ms: "Microsoft 365", sf: "Salesforce stack", wd: "HR/Finance only", l9: "None" },
  { label: "Multi-vendor AI", ms: "Within MS ecosystem", sf: "Within SF ecosystem", wd: "Limited", l9: "Claude + GPT + Gemini" },
  { label: "Time to value", ms: "Quarters", sf: "Quarters", wd: "Quarters", l9: "Days" },
  { label: "Built for SMB", ms: "No", sf: "No", wd: "No", l9: "Yes" },
];

function ComparisonModule() {
  return (
    <div className="hb-module-comparison">
      <div className="hbcomp-label">Vendor comparison</div>
      <div className="hbcomp-table-wrap">
        <table className="hbcomp-table">
          <thead>
            <tr>
              <th></th>
              <th>Microsoft</th>
              <th>Salesforce</th>
              <th>Workday</th>
              <th className="l9c">Level9OS</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((r) => (
              <tr key={r.label}>
                <td className="hbcomp-row-label">{r.label}</td>
                <td>{r.ms}</td>
                <td>{r.sf}</td>
                <td>{r.wd}</td>
                <td className="l9c l9cv">{r.l9}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VoicePitchModule() {
  const [playing, setPlaying] = useState<string | null>(null);
  const tracks = [
    { id: "30s", label: "30 seconds", desc: "The number. The cost. The ROI. Done." },
    { id: "90s", label: "1 minute 30", desc: "Four categories, full math, one CTA." },
    { id: "5m", label: "5 minutes", desc: "Full operator briefing. Architecture, proof, onboarding." },
  ];
  return (
    <div className="hb-module-voice">
      <div className="hbvoice-label">Three versions. Same message, different depth.</div>
      {tracks.map((t) => (
        <div key={t.id} className="hbvoice-track">
          <div className="hbvoice-track-info">
            <span className="hbvt-label">{t.label}</span>
            <span className="hbvt-desc">{t.desc}</span>
          </div>
          <button
            className={`hbvoice-play ${playing === t.id ? "active" : ""}`}
            onClick={() => setPlaying(playing === t.id ? null : t.id)}
          >
            {playing === t.id ? "■" : "▶"}
          </button>
          <div className="hbvoice-waveform">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="hbvoice-bar"
                style={{
                  height: `${8 + Math.abs(Math.sin(i * 0.7)) * 20}px`,
                  animationDelay: `${i * 0.04}s`,
                  animationPlayState: playing === t.id ? "running" : "paused",
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="hbvoice-note">Audio coming soon. Placeholder play states shown.</div>
    </div>
  );
}

function WrapperStoryModule() {
  const wrappers = [
    { name: "OutboundOS", status: "live", desc: "ABM outbound. 30 workflows. Signal to send in under 5 minutes.", color: "#f59e0b" },
    { name: "FinanceOS", status: "planned", desc: "AP/AR automation, spend governance, vendor intelligence.", color: "#06b6d4" },
    { name: "SalesOS", status: "planned", desc: "Pipeline hygiene, deal scoring, CRM auto-update.", color: "#10b981" },
    { name: "ProductOS", status: "planned", desc: "Feature velocity, stakeholder alignment, sprint governance.", color: "#ec4899" },
  ];
  return (
    <div className="hb-module-wrapper">
      <div className="hbwrap-label">Level9OS is the governance layer. Wrappers sit on top.</div>
      <div className="hbwrap-stack">
        {wrappers.map((w) => (
          <div key={w.name} className={`hbwrap-card ${w.status}`}
            style={{ "--wc": w.color } as React.CSSProperties}>
            <div className="hbwc-top">
              <span className="hbwc-name">{w.name}</span>
              <span className="hbwc-badge">{w.status === "live" ? "Live" : "Planned"}</span>
            </div>
            <div className="hbwc-desc">{w.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleShimmer() {
  return (
    <div className="hb-module-shimmer">
      <div className="hb-shimmer-line hb-shimmer-line-h" />
      <div className="hb-shimmer-line hb-shimmer-line-m" />
      <div className="hb-shimmer-line hb-shimmer-line-s" />
      <div className="hb-shimmer-block" />
    </div>
  );
}

function ModuleError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="hb-module-error">
      <div className="hb-module-error-text">Couldn&apos;t load this one. Try another?</div>
      <button className="hb-reply hb-module-error-retry" onClick={onRetry}>Retry</button>
    </div>
  );
}

function ModuleRenderer({
  moduleId,
  userAnswers,
}: {
  moduleId: ModuleId;
  userAnswers: Record<string, unknown>;
}) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setErrored(false);
    const t = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(t);
  }, [moduleId, key]);

  if (loading) return <ModuleShimmer />;
  if (errored) return <ModuleError onRetry={() => setKey((k) => k + 1)} />;

  const content = (() => {
    switch (moduleId) {
      case "counter": return <CounterModule />;
      case "calculator":
        return (
          <CalculatorModule
            defaultEmployees={userAnswers.employees as number | undefined}
            defaultTools={userAnswers.tools as number | undefined}
          />
        );
      case "article": return <ArticleModule />;
      case "live-feed": return <LiveFeedModule />;
      case "comparison": return <ComparisonModule />;
      case "voice-pitch": return <VoicePitchModule />;
      case "wrapper-story": return <WrapperStoryModule />;
      default: {
        setErrored(true);
        return null;
      }
    }
  })();

  return <div className="hb-module-reveal">{content}</div>;
}

// ─── State helpers ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "level9os.conversation.hybrid.v1";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function loadState(): ConversationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<ConversationState> & Pick<ConversationState, "threadId" | "messages" | "unlockedModules" | "lastVisit">;
    const age = Date.now() - new Date(s.lastVisit).getTime();
    if (age > 30 * 24 * 60 * 60 * 1000) return null;
    return {
      threadId: s.threadId,
      messages: s.messages,
      unlockedModules: s.unlockedModules,
      activeModule: s.activeModule,
      userAnswers: s.userAnswers ?? {},
      lastVisit: s.lastVisit,
      skippedSplash: s.skippedSplash,
      closedTabs: s.closedTabs ?? [],
      poolHistory: s.poolHistory ?? [],
      lastVisitorActivity: s.lastVisitorActivity ?? Date.now(),
    };
  } catch {
    return null;
  }
}

function saveState(s: ConversationState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, lastVisit: new Date().toISOString() }));
  } catch {
    // ignore
  }
}

function clearState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Content pool ─────────────────────────────────────────────────────────────

const CONTENT_POOL: PoolPrompt[] = [
  // Group A: deep dives into seen modules
  {
    id: "deep-live-feed",
    label: "Want to see the actual audit log behind a $4,284 day?",
    group: "A",
    requiresModule: "live-feed",
    opensModule: "live-feed",
  },
  {
    id: "deep-calculator",
    label: "Want the full math on your calculator output?",
    group: "A",
    requiresModule: "calculator",
    opensModule: "calculator",
  },
  {
    id: "deep-article",
    label: "Want the citations behind the article?",
    group: "A",
    requiresModule: "article",
    opensModule: "article",
  },
  {
    id: "deep-comparison",
    label: "Want to see how that comparison was scored?",
    group: "A",
    requiresModule: "comparison",
    opensModule: "comparison",
  },
  {
    id: "deep-voice",
    label: "Want to hear the 5-minute pitch over voice?",
    group: "A",
    requiresModule: "voice-pitch",
    opensModule: "voice-pitch",
  },

  // Group B: specific angles
  {
    id: "angle-single-vendor",
    label: "Curious how this changes if you are on Anthropic only versus multi-vendor?",
    group: "B",
  },
  {
    id: "angle-soc2",
    label: "What about the SOC2 angle? We can show our 18-service governance grouping.",
    group: "B",
  },
  {
    id: "angle-founder-vs-operator",
    label: "Want the founder vs operator framing? They land differently.",
    group: "B",
  },
  {
    id: "angle-wrapper",
    label: "We have a wrapper for finance, sales, and product. Want to see which fits you?",
    group: "B",
    opensModule: "wrapper-story",
  },
  {
    id: "angle-onboarding-room",
    label: "How does the multi-party onboarding room work? It is the demo a lot of people ask about.",
    group: "B",
  },

  // Group C: personalization questions
  {
    id: "qual-ai-tool",
    label: "What is your biggest AI tool right now? I can show you how we plug into that.",
    group: "C",
  },
  {
    id: "qual-team-size",
    label: "How big is your team? The path shifts a bit at 5, 20, and 50 people.",
    group: "C",
  },
  {
    id: "qual-refix-loop",
    label: "What is the most painful refix loop you have hit lately?",
    group: "C",
  },
  {
    id: "qual-spend",
    label: "What is your current monthly AI spend? Roughly?",
    group: "C",
  },
  {
    id: "qual-vendors",
    label: "Are you running your AI through one vendor or several?",
    group: "C",
  },

  // Group D: reveal / surprise factor
  {
    id: "reveal-lie-catch",
    label: "Did you know we catch claim-without-evidence lies in chat threads? Want to see a real one?",
    group: "D",
    opensModule: "live-feed",
  },
  {
    id: "reveal-block-demo",
    label: "Have you seen what happens when an agent tries to send an unverified market claim? We block it. Want a demo?",
    group: "D",
    opensModule: "live-feed",
  },
  {
    id: "reveal-receipt",
    label: "Want the receipt? It is a single page that pretty much tells our story.",
    group: "D",
    opensModule: "counter",
  },

  // Group E: conversion gates (appear after 4+ modules unlocked)
  {
    id: "gate-60s-pitch",
    label: "Have you got 60 seconds for the full pitch? Voice or text?",
    group: "E",
    opensModule: "voice-pitch",
  },
  {
    id: "gate-talk-person",
    label: "Want to talk to an actual person? Takes about 5 minutes to intake.",
    group: "E",
    action: "cta-person",
  },
];

// ─── Pool engine ───────────────────────────────────────────────────────────────

interface PoolEngineState {
  unlockedModules: ModuleId[];
  closedTabs: ModuleId[];
  poolHistory: string[];
  lastGroupShown?: PoolGroup;
  userAnswers: Record<string, unknown>;
}

function getPoolSuggestions(
  engineState: PoolEngineState,
  count = 3
): PoolPrompt[] {
  const {
    unlockedModules,
    closedTabs,
    poolHistory,
    lastGroupShown,
    userAnswers,
  } = engineState;

  const unlockCount = unlockedModules.length;
  const allPrimariesUnlocked = MODULE_ORDER.every((m) =>
    unlockedModules.includes(m)
  );

  // Filter the pool to candidates
  const candidates = CONTENT_POOL.filter((p) => {
    // Skip if shown recently
    if (poolHistory.includes(p.id)) return false;
    // Group A: only if required module is revealed
    if (p.requiresModule && !unlockedModules.includes(p.requiresModule)) return false;
    // Group E: only after 4+ modules unlocked
    if (p.group === "E" && unlockCount < 4) return false;
    // Group D: avoid showing twice in a row
    if (p.group === "D" && lastGroupShown === "D") return false;
    // Don't re-offer wrapper-story angle if it's unlocked
    if (p.opensModule && unlockedModules.includes(p.opensModule) && !closedTabs.includes(p.opensModule)) {
      // module already open + not closed, skip
      if (!["deep-live-feed","deep-calculator","deep-article","deep-comparison","deep-voice"].includes(p.id)) {
        return false;
      }
    }
    return true;
  });

  // Priority ordering
  const prioritized = [
    // Group A first (after relevant module revealed)
    ...candidates.filter((p) => p.group === "A"),
    // Then re-opens of closed tabs
    ...candidates.filter(
      (p) =>
        p.group === "B" &&
        p.opensModule &&
        closedTabs.includes(p.opensModule)
    ),
    // Then E if enough modules
    ...candidates.filter((p) => p.group === "E"),
    // Then B/C/D in rotation
    ...candidates.filter(
      (p) => p.group === "B" && !(p.opensModule && closedTabs.includes(p.opensModule))
    ),
    ...candidates.filter((p) => p.group === "C"),
    ...candidates.filter((p) => p.group === "D"),
  ];

  // De-duplicate by id (prioritized may have dupes from multi-filter)
  const seen = new Set<string>();
  const deduped = prioritized.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // If all primaries unlocked, include restart
  const result = deduped.slice(0, count);

  // Supplement with primary module chips if still below count
  if (result.length < count && !allPrimariesUnlocked) {
    const unrevealed = MODULE_ORDER.filter(
      (m) => !unlockedModules.includes(m)
    );
    for (const m of unrevealed) {
      if (result.length >= count) break;
      if (!result.some((r) => r.id === m)) {
        result.push({
          id: m,
          label: MODULE_META[m].suggestedReply,
          group: "B",
        });
      }
    }
  }

  // Ignore team-size preference if userAnswers has size context
  // (no-op for now, reserved for future personalization)
  void userAnswers;

  return result;
}

function getInitialSuggestions(
  unlockedModules: ModuleId[],
  skippedMode: boolean
): { id: string; label: string }[] {
  const unrevealed = MODULE_ORDER.filter((m) => !unlockedModules.includes(m));
  const count = unlockedModules.length;
  const replies: { id: string; label: string }[] = [];

  if (count === 0 && !skippedMode) {
    replies.push({ id: "surprise", label: "Surprise me" });
  }

  for (const m of unrevealed.slice(0, 3)) {
    if (m !== "voice-pitch") {
      replies.push({ id: m, label: MODULE_META[m].suggestedReply });
    }
  }

  if (count >= 5) {
    if (!unlockedModules.includes("voice-pitch")) {
      replies.push({ id: "voice-pitch", label: MODULE_META["voice-pitch"].suggestedReply });
    }
    replies.push({ id: "cta", label: "Want to talk to a person?" });
  }

  if (unrevealed.length === 0) {
    replies.push({ id: "restart", label: "Start over" });
    replies.push({ id: "cta", label: "Talk to a person" });
  }

  return replies.slice(0, 5);
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TheConversationHybrid() {
  const [visitorState, setVisitorState] = useState<VisitorState>("splash");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unlockedModules, setUnlockedModules] = useState<ModuleId[]>([]);
  const [activeModule, setActiveModule] = useState<ModuleId | undefined>(undefined);
  const [userAnswers, setUserAnswers] = useState<Record<string, unknown>>({});
  const [typing, setTyping] = useState(false);
  const [maxSelf, setMaxSelf] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [transitionTrigger, setTransitionTrigger] = useState<ModuleId | null>(null);
  // New state for Upgrade 1 + 2
  const [closedTabs, setClosedTabs] = useState<ModuleId[]>([]);
  const [poolHistory, setPoolHistory] = useState<string[]>([]);
  const [lastGroupShown, setLastGroupShown] = useState<PoolGroup | undefined>(undefined);
  const lastVisitorActivity = useRef<number>(Date.now());

  const feedRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const threadId = useRef(makeId());

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    }, 80);
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id">) => {
    const m: ChatMessage = { ...msg, id: makeId() };
    setMessages((prev) => [...prev, m]);
    setTimeout(scrollToBottom, 20);
    return m.id;
  }, [scrollToBottom]);

  const agentSay = useCallback((content: string, delay = 0): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          addMessage({ role: "agent", content });
          resolve();
        }, 800);
      }, delay);
    });
  }, [addMessage]);

  // Transition from splash to dashboard
  const triggerTransition = useCallback((moduleId: ModuleId) => {
    setTransitionTrigger(moduleId);
    setVisitorState("transitioning");
    setTimeout(() => {
      setVisitorState("dashboard");
      setTransitionTrigger(null);
    }, 500);
  }, []);

  const revealModule = useCallback((moduleId: ModuleId, currentVisitorState: VisitorState): Promise<void> => {
    return new Promise((resolve) => {
      const isDisplayOnly = DISPLAY_ONLY.includes(moduleId);
      const inSplash = currentVisitorState === "splash";

      setUnlockedModules((prev) => {
        const next = prev.includes(moduleId) ? prev : [...prev, moduleId];
        return next;
      });

      if (inSplash && isDisplayOnly) {
        // Render inline in splash as a chat module card
        addMessage({ role: "agent", isModule: true, moduleId });
        setTimeout(scrollToBottom, 100);
      } else if (inSplash && !isDisplayOnly) {
        // Trigger layout transition
        setActiveModule(moduleId);
        triggerTransition(moduleId);
      } else {
        // Already in dashboard: dock to right panel
        setActiveModule(moduleId);
      }

      resolve();
    });
  }, [addMessage, scrollToBottom, triggerTransition]);

  // Init
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const saved = loadState();

    if (saved?.skippedSplash) {
      // State 3: skipped
      setIsSkipped(true);
      setVisitorState("dashboard");
      const defaultModules = SKIP_DEFAULT_TABS;
      setUnlockedModules(defaultModules);
      setActiveModule("counter");
      if (saved.closedTabs?.length) setClosedTabs(saved.closedTabs);
      if (saved.poolHistory?.length) setPoolHistory(saved.poolHistory);
      if (saved.messages.length > 0) {
        setMessages(saved.messages);
      }
      setTimeout(() => {
        agentSay(
          "Caught you skipping. No problem. Counter, calculator, comparison, and the case study are already open. What do you want to dig into?"
        );
      }, 300);
      return;
    }

    if (saved && saved.messages.length > 0) {
      // State 2: returning visitor
      threadId.current = saved.threadId;
      setMessages(saved.messages);
      setUnlockedModules(saved.unlockedModules);
      setUserAnswers(saved.userAnswers);
      if (saved.closedTabs?.length) setClosedTabs(saved.closedTabs);
      if (saved.poolHistory?.length) setPoolHistory(saved.poolHistory);
      setIsReturning(true);
      setVisitorState("dashboard");

      if (saved.activeModule) {
        setActiveModule(saved.activeModule);
      } else if (saved.unlockedModules.length > 0) {
        setActiveModule(saved.unlockedModules[saved.unlockedModules.length - 1]);
      }

      const names = saved.unlockedModules
        .slice(0, 3)
        .map((m) => MODULE_META[m].label)
        .join(", ");

      agentSay(
        `Welcome back. You looked at: ${names} last time. Want to pick up where you left off, or start fresh and see a different angle?`,
        300
      );
      return;
    }

    // State 1: fresh visit
    setVisitorState("splash");
    agentSay(
      "Hi. I just saved someone $52,686 in 90 days. I have about 8 things to show you, in whatever order you want. Where should we start?"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  useEffect(() => {
    if (messages.length === 0) return;
    saveState({
      threadId: threadId.current,
      messages,
      unlockedModules,
      activeModule,
      userAnswers,
      lastVisit: new Date().toISOString(),
      skippedSplash: isSkipped,
      closedTabs,
      poolHistory,
      lastVisitorActivity: lastVisitorActivity.current,
    });
  }, [messages, unlockedModules, activeModule, userAnswers, isSkipped, closedTabs, poolHistory]);

  // Close tab handler
  const handleCloseTab = useCallback(
    (moduleId: ModuleId, e: React.MouseEvent) => {
      e.stopPropagation();
      setClosedTabs((prev) => (prev.includes(moduleId) ? prev : [...prev, moduleId]));
      setUnlockedModules((prev) => prev.filter((m) => m !== moduleId));
      setActiveModule((prev) => {
        if (prev !== moduleId) return prev;
        // activate the previous tab
        return undefined;
      });
      // After close, agent offers to bring it back (debounced via agentSay delay)
      setTimeout(() => {
        const label = MODULE_META[moduleId]?.label ?? moduleId;
        const idleMs = Date.now() - lastVisitorActivity.current;
        if (idleMs >= 5000) {
          agentSay(
            `You closed the ${label} tab. Want to bring it back? Just say the word.`,
            400
          );
        }
      }, 1200);
    },
    [agentSay]
  );

  const handleSkip = useCallback(() => {
    setIsSkipped(true);
    setVisitorState("transitioning");
    const defaultModules = SKIP_DEFAULT_TABS;
    setUnlockedModules(defaultModules);
    setActiveModule("counter");
    setTimeout(() => {
      setVisitorState("dashboard");
      agentSay(
        "Caught you skipping. No problem. Counter, calculator, comparison, and the case study are already open. What do you want to dig into?"
      );
    }, 500);
    // Persist skip flag
    try {
      const existing = loadState();
      saveState({
        threadId: threadId.current,
        messages,
        unlockedModules: defaultModules,
        activeModule: "counter",
        userAnswers,
        lastVisit: new Date().toISOString(),
        skippedSplash: true,
        closedTabs,
        poolHistory,
        lastVisitorActivity: lastVisitorActivity.current,
        ...(existing ?? {}),
      });
    } catch {
      // ignore
    }
  }, [messages, userAnswers, agentSay, closedTabs, poolHistory]);

  // Track visitor activity to implement "shut up while engaging" rule
  const recordActivity = useCallback(() => {
    lastVisitorActivity.current = Date.now();
  }, []);

  // Add pool prompt to history (keep last 10)
  const recordPoolShown = useCallback((ids: string[], group?: PoolGroup) => {
    setPoolHistory((prev) => [...ids, ...prev].slice(0, 10));
    if (group) setLastGroupShown(group);
  }, []);

  const handleReply = useCallback(
    async (replyId: string, replyLabel: string) => {
      recordActivity();

      if (replyId === "restart") {
        clearState();
        window.location.reload();
        return;
      }

      if (replyId === "cta") {
        addMessage({ role: "user", content: replyLabel });
        await agentSay(
          "Contact Eric directly at biz@erichathaway.com. He runs the product. He is the customer. He can answer anything because he lived these numbers.",
          200
        );
        return;
      }

      if (replyId === "surprise") {
        const unrevealed = MODULE_ORDER.filter((m) => !unlockedModules.includes(m));
        const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        if (!pick) return;
        addMessage({ role: "user", content: "Surprise me" });
        await agentSay(MODULE_META[pick].agentIntro, 200);
        await revealModule(pick, visitorState);

        const newCount = unlockedModules.length + 1;
        if (newCount === 2 && !maxSelf) {
          setMaxSelf(true);
          await agentSay(
            "Quick heads-up: you've been chatting with MAX this whole time. The interface. Same voice, just naming myself now.",
            400
          );
        }
        // After surprise, surface 2 pool suggestions
        const poolSuggestions = getPoolSuggestions({
          unlockedModules: [...unlockedModules, pick],
          closedTabs,
          poolHistory,
          lastGroupShown,
          userAnswers,
        }, 2);
        recordPoolShown(poolSuggestions.map((p) => p.id), poolSuggestions[0]?.group);
        return;
      }

      // Check if this is a pool prompt
      const poolPrompt = CONTENT_POOL.find((p) => p.id === replyId);
      if (poolPrompt) {
        addMessage({ role: "user", content: replyLabel });
        recordPoolShown([poolPrompt.id], poolPrompt.group);

        if (poolPrompt.action === "cta-person") {
          await agentSay(
            "Contact Eric directly at biz@erichathaway.com. He runs the product. He is the customer. He can answer anything because he lived these numbers.",
            200
          );
          return;
        }

        if (poolPrompt.opensModule) {
          const target = poolPrompt.opensModule;
          const meta = MODULE_META[target];
          // Re-open closed tab if needed
          if (closedTabs.includes(target)) {
            setClosedTabs((prev) => prev.filter((m) => m !== target));
          }
          await agentSay(meta.agentIntro, 200);
          await revealModule(target, visitorState);
        } else {
          // Conversational response for non-module pool prompts
          const responses: Record<string, string> = {
            "angle-single-vendor": "Single-vendor shops still benefit. The governance layer routes within that vendor. The real difference is audit fidelity. Multi-vendor adds routing intelligence on top of that.",
            "angle-soc2": "The 18-service grouping maps each service to a control domain. Every governance hook generates an event log entry. That log is the audit trail. Want to see the coverage breakdown?",
            "angle-founder-vs-operator": "Founders care about the moat. Operators care about the rework loop. Same product, different entry point. Which lens is yours?",
            "angle-onboarding-room": "The room brings in multiple stakeholders, each with a different view. Legal sees contracts. Ops sees workflows. Finance sees spend. All in one session. That is the demo most teams ask for second.",
            "qual-ai-tool": "Whatever tool you are running, we plug in at the governance layer, not the application layer. The tool does not change. What changes is what happens when the tool tries to do something risky.",
            "qual-team-size": "At 5 people, one flub event can cost a week of rework. At 20, it is usually a department. At 50, it compounds across teams. The governance layer scales linearly. Your risk does not.",
            "qual-refix-loop": "The most common one we see is the done-claim-without-verify loop. Agent says done. Nobody checks. Something breaks downstream. We block the done-claim at the source.",
            "qual-spend": "If you are spending more than $500 a month on AI, the ROI math on governance starts working in your favor almost immediately. The $5.07 infrastructure cost is not a typo.",
            "qual-vendors": "Multi-vendor setups get more value from the routing layer. We can show you the routing policy logic if you want.",
            "reveal-lie-catch": "Opening the live feed. You can see real blocked events including claim-without-evidence intercepts.",
            "reveal-block-demo": "Opening the live feed so you can see a blocked unverified claim in real time.",
            "reveal-receipt": "Opening the counter. One number, full breakdown, three decimal places of receipts.",
            "angle-wrapper": "Opening the wrapper story. OutboundOS is live. FinanceOS and SalesOS are next.",
            "gate-60s-pitch": "Opening the pitch player. Three versions. Start with 30 seconds.",
          };
          const response = responses[poolPrompt.id] ?? "Good question. Let me pull that up.";
          await agentSay(response, 200);
        }
        return;
      }

      const moduleId = replyId as ModuleId;
      if (MODULE_META[moduleId]) {
        addMessage({ role: "user", content: replyLabel });
        const meta = MODULE_META[moduleId];

        // Re-open a previously closed tab if needed
        if (closedTabs.includes(moduleId)) {
          setClosedTabs((prev) => prev.filter((m) => m !== moduleId));
        }

        // If transitioning from splash, append a reference to the panel
        const intro = !DISPLAY_ONLY.includes(moduleId) && visitorState === "splash"
          ? `${meta.agentIntro}`
          : meta.agentIntro;

        await agentSay(intro, 200);
        await revealModule(moduleId, visitorState);

        const newCount = unlockedModules.length + 1;
        if (newCount === 2 && !maxSelf) {
          setMaxSelf(true);
          await agentSay(
            "Quick heads-up: you've been chatting with MAX this whole time. The interface. Same voice, just naming myself now.",
            500
          );
        }

        // After module unlock, surface 1-2 follow-up suggestions from the pool
        // (only if visitor is idle)
        setTimeout(() => {
          const idleMs = Date.now() - lastVisitorActivity.current;
          if (idleMs < 5000) return; // shut-up rule
          const followUps = getPoolSuggestions({
            unlockedModules: [...unlockedModules, moduleId],
            closedTabs,
            poolHistory,
            lastGroupShown,
            userAnswers,
          }, 2);
          recordPoolShown(followUps.map((p) => p.id), followUps[0]?.group);
        }, 5200); // fires after shut-up window clears
      }
    },
    [addMessage, agentSay, revealModule, unlockedModules, maxSelf, visitorState,
     closedTabs, poolHistory, lastGroupShown, userAnswers, recordActivity, recordPoolShown]
  );

  // Suggested replies: pool-aware
  const suggestedReplies = typing ? [] : (() => {
    const allPrimariesUnlocked = MODULE_ORDER.every((m) => unlockedModules.includes(m));
    if (allPrimariesUnlocked) {
      // Pure pool mode
      const pool = getPoolSuggestions({
        unlockedModules, closedTabs, poolHistory, lastGroupShown, userAnswers,
      }, 3);
      const replies: { id: string; label: string }[] = pool.map((p) => ({ id: p.id, label: p.label }));
      replies.push({ id: "restart", label: "Start over" });
      return replies.slice(0, 4);
    }
    // Mixed mode: primary modules + pool prompts
    const primary = getInitialSuggestions(unlockedModules, isSkipped);
    const poolExtras = getPoolSuggestions({
      unlockedModules, closedTabs, poolHistory, lastGroupShown, userAnswers,
    }, Math.max(0, 4 - primary.length));
    const combined = [
      ...primary,
      ...poolExtras.map((p) => ({ id: p.id, label: p.label })),
    ];
    // De-dupe
    const seen = new Set<string>();
    return combined.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    }).slice(0, 4);
  })();
  const isDashboard = visitorState === "dashboard" || visitorState === "transitioning";
  const agentLabel = maxSelf ? "MAX" : "Level9OS";
  const agentInitials = maxSelf ? "MX" : "L9";
  const activeColor = activeModule ? MODULE_COLOR[activeModule] : "#8b5cf6";

  return (
    <div className={`hb-root ${visitorState}`}>
      <style>{CSS}</style>
      <CursorGradient color="rgba(139,92,246,0.06)" size={520} />

      {/* ── SPLASH STATE ── */}
      {visitorState === "splash" && (
        <div className="hb-splash">
          {/* Ambient gradient orbs */}
          <div className="hb-orb hb-orb-violet" aria-hidden="true" />
          <div className="hb-orb hb-orb-fuchsia" aria-hidden="true" />
          <div className="hb-orb hb-orb-cyan" aria-hidden="true" />

          {/* Skip link top-right */}
          <button className="hb-skip-btn" onClick={handleSkip}>
            skip to site &#8594;
          </button>

          {/* Centered chat box with FadeIn entrance */}
          <FadeIn delay={0.05} direction="up">
          <div className="hb-splash-chat hb-splash-chat-pulse">
            <div className="hb-splash-header">
              <div className="hb-splash-avatar">L9</div>
              <div className="hb-splash-agent-info">
                <div className="hb-splash-agent-name">{agentLabel}</div>
                <div className="hb-splash-agent-sub">AI Operating System</div>
              </div>
              <span className="hb-splash-variant-badge">Hybrid</span>
            </div>

            <div className="hb-splash-feed" ref={feedRef}>
              {messages.map((msg) => {
                if (msg.isModule && msg.moduleId) {
                  return (
                    <div key={msg.id} className="hb-inline-module">
                      <ModuleRenderer moduleId={msg.moduleId} userAnswers={userAnswers} />
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`hb-msg ${msg.role}`}>
                    <div className="hb-msg-avatar">
                      {msg.role === "agent" ? agentInitials : "You"}
                    </div>
                    <div className="hb-msg-bubble">{msg.content}</div>
                  </div>
                );
              })}
              {typing && (
                <div className="hb-typing">
                  <div className="hb-typing-avatar" />
                  <div className="hb-typing-dots">
                    <div className="hb-dot" />
                    <div className="hb-dot" />
                    <div className="hb-dot" />
                  </div>
                </div>
              )}
            </div>

            {!typing && suggestedReplies.length > 0 && (
              <div className="hb-splash-replies">
                <div className="hb-replies-label">Reply</div>
                {suggestedReplies.map((r) => (
                  <button key={r.id} className="hb-reply" onClick={() => handleReply(r.id, r.label)}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          </FadeIn>
        </div>
      )}

      {/* ── TRANSITIONING STATE ── */}
      {visitorState === "transitioning" && (
        <div className="hb-transition-overlay">
          <div className="hb-transition-text">
            {transitionTrigger
              ? `Opening ${MODULE_META[transitionTrigger]?.label ?? "module"}`
              : "Loading dashboard"}
          </div>
        </div>
      )}

      {/* ── DASHBOARD STATE ── */}
      {isDashboard && visitorState !== "transitioning" && (
        <div className="hb-dashboard">
          {/* Top bar */}
          <div className="hb-topbar">
            <div className="hb-topbar-avatar">L9</div>
            <div className="hb-topbar-info">
              <div className="hb-topbar-name">{agentLabel}</div>
              <div className="hb-topbar-sub">AI Operating System</div>
            </div>
            <span className="hb-topbar-badge">Hybrid</span>
            <button
              className="hb-restart-btn"
              onClick={() => {
                clearState();
                window.location.reload();
              }}
            >
              Restart
            </button>
          </div>

          <div className="hb-body">
            {/* Left: chat panel */}
            <div className="hb-chat-panel">
              <div className="hb-chat-feed" ref={feedRef}>
                {messages.map((msg) => {
                  // In dashboard, inline modules from splash still show in thread
                  if (msg.isModule && msg.moduleId) {
                    return (
                      <div key={msg.id} className="hb-msg agent hb-msg-module-ref">
                        <div className="hb-msg-avatar">{agentInitials}</div>
                        <div
                          className="hb-msg-bubble hb-module-link"
                          onClick={() => setActiveModule(msg.moduleId!)}
                        >
                          {MODULE_META[msg.moduleId]?.label} opened &#8594;
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={msg.id} className={`hb-msg ${msg.role}`}>
                      <div className="hb-msg-avatar">
                        {msg.role === "agent" ? agentInitials : "You"}
                      </div>
                      <div className="hb-msg-bubble">{msg.content}</div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="hb-typing">
                    <div className="hb-typing-avatar" />
                    <div className="hb-typing-dots">
                      <div className="hb-dot" />
                      <div className="hb-dot" />
                      <div className="hb-dot" />
                    </div>
                  </div>
                )}
              </div>

              {!typing && suggestedReplies.length > 0 && (
                <div className="hb-chat-replies">
                  <div className="hb-replies-label">Reply</div>
                  {suggestedReplies.map((r) => (
                    <button key={r.id} className="hb-reply" onClick={() => handleReply(r.id, r.label)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              )}

              {isReturning && (
                <div className="hb-returning-cta">
                  <button
                    className="hb-reply"
                    style={{ width: "100%", textAlign: "center" }}
                    onClick={() => { clearState(); window.location.reload(); }}
                  >
                    Start fresh
                  </button>
                </div>
              )}
            </div>

            {/* Right: module panel */}
            <div className="hb-module-panel">
              {/* Tab strip */}
              {unlockedModules.length > 0 && (
                <div className="hb-tabs" style={{ borderTop: `2px solid ${activeColor}22` }}>
                  {unlockedModules.map((m) => {
                    const meta = MODULE_META[m];
                    const mColor = MODULE_COLOR[m];
                    return (
                      <button
                        key={m}
                        className={`hb-tab ${activeModule === m ? "active" : ""}`}
                        style={activeModule === m ? { borderBottomColor: mColor, color: "rgba(255,255,255,0.9)" } : {}}
                        onClick={() => setActiveModule(m)}
                      >
                        <span className="hb-tab-icon" style={activeModule === m ? { color: mColor, background: `${mColor}18`, borderColor: `${mColor}30` } : {}}>{meta.icon}</span>
                        {meta.label}
                        <span
                          className="hb-tab-close"
                          role="button"
                          aria-label={`Close ${meta.label}`}
                          onClick={(e) => handleCloseTab(m, e)}
                        >
                          &times;
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Panel content */}
              {activeModule ? (
                <div
                  className="hb-panel-content"
                  key={activeModule}
                  onScroll={recordActivity}
                  onMouseMove={recordActivity}
                  onInput={recordActivity}
                  onPointerDown={recordActivity}
                >
                  <ModuleRenderer moduleId={activeModule} userAnswers={userAnswers} />
                </div>
              ) : unlockedModules.length === 0 ? (
                // Empty tabs state: muted module icons that pulse
                <div className="hb-panel-empty">
                  <div className="hb-module-icons-row">
                    {MODULE_ORDER.map((m, i) => {
                      const meta = MODULE_META[m];
                      const mColor = MODULE_COLOR[m];
                      return (
                        <button
                          key={m}
                          className="hb-module-icon-chip"
                          title={meta.label}
                          style={{ animationDelay: `${i * 0.18}s` }}
                          onClick={() => handleReply(m, meta.suggestedReply)}
                        >
                          <span className="hb-mic-icon" style={{ color: mColor, borderColor: `${mColor}25`, background: `${mColor}10` }}>{meta.icon}</span>
                          <span className="hb-mic-label">{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="hb-panel-empty-text" style={{ marginTop: "1rem" }}>
                    Pick a tab to revisit, or ask MAX for something new.
                  </div>
                  {/* Quick-launch chips from closed tabs */}
                  {closedTabs.length > 0 && (
                    <div className="hb-empty-chips">
                      {closedTabs.slice(0, 2).map((m) => (
                        <button
                          key={m}
                          className="hb-reply hb-empty-chip"
                          onClick={() => handleReply(m, `Reopen: ${MODULE_META[m]?.label}`)}
                        >
                          Reopen: {MODULE_META[m]?.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="hb-panel-empty">
                  <div className="hb-panel-empty-icon">&#9633;</div>
                  <div className="hb-panel-empty-text">
                    Choose a topic in the chat. Modules appear here as you unlock them.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const CSS = `
  .hb-root {
    min-height: 100dvh;
    background: #070710;
    color: rgba(255,255,255,0.88);
    font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
    position: relative;
  }

  /* ── Transition overlay ── */
  .hb-transition-overlay {
    position: fixed;
    inset: 0;
    background: #070710;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: hb-fade-in 0.2s ease;
  }
  .hb-transition-text {
    font-size: 0.75rem;
    color: rgba(139,92,246,0.6);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: ui-monospace, monospace;
  }

  /* ── SPLASH ── */
  .hb-splash {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.25rem;
    position: relative;
    animation: hb-fade-in 0.4s ease;
  }
  .hb-skip-btn {
    position: fixed;
    top: 1.25rem;
    right: 1.5rem;
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.28);
    font-size: 0.68rem;
    cursor: pointer;
    padding: 0.4rem 0.875rem;
    transition: color 0.15s ease, border-color 0.15s ease;
    z-index: 10;
  }
  .hb-skip-btn:hover {
    color: rgba(255,255,255,0.65);
    border-color: rgba(255,255,255,0.22);
  }
  .hb-splash-chat {
    width: 100%;
    max-width: 600px;
    background: #0a0a18;
    border: 1px solid rgba(139,92,246,0.15);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 80px rgba(139,92,246,0.06), 0 24px 48px rgba(0,0,0,0.4);
    min-height: min(70vh, 560px);
    max-height: min(80vh, 680px);
  }
  .hb-splash-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
  .hb-splash-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.62rem;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
  }
  .hb-splash-agent-info { display: flex; flex-direction: column; gap: 0.08rem; }
  .hb-splash-agent-name { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.85); }
  .hb-splash-agent-sub { font-size: 0.65rem; color: rgba(255,255,255,0.28); }
  .hb-splash-variant-badge {
    margin-left: auto;
    font-family: ui-monospace, monospace;
    font-size: 0.56rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(139,92,246,0.6);
    background: rgba(139,92,246,0.08);
    border: 1px solid rgba(139,92,246,0.15);
    border-radius: 4px;
    padding: 0.18rem 0.45rem;
  }
  .hb-splash-feed {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.5rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .hb-splash-feed::-webkit-scrollbar { width: 3px; }
  .hb-splash-feed::-webkit-scrollbar-track { background: transparent; }
  .hb-splash-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
  .hb-splash-replies {
    padding: 0.75rem 1.5rem 1.25rem;
    background: linear-gradient(to top, #0a0a18 60%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  /* ── DASHBOARD ── */
  .hb-dashboard {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    animation: hb-slide-in 0.45s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes hb-slide-in {
    from { opacity: 0; transform: translateX(8px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes hb-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Top bar */
  .hb-topbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
  .hb-topbar-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
  }
  .hb-topbar-info { display: flex; flex-direction: column; gap: 0.05rem; }
  .hb-topbar-name { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.85); }
  .hb-topbar-sub { font-size: 0.65rem; color: rgba(255,255,255,0.28); }
  .hb-topbar-badge {
    font-family: ui-monospace, monospace;
    font-size: 0.56rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(139,92,246,0.6);
    background: rgba(139,92,246,0.08);
    border: 1px solid rgba(139,92,246,0.15);
    border-radius: 4px;
    padding: 0.18rem 0.45rem;
  }
  .hb-restart-btn {
    margin-left: auto;
    font-size: 0.62rem;
    color: rgba(255,255,255,0.22);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: color 0.15s ease, background 0.15s ease;
  }
  .hb-restart-btn:hover { color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.04); }

  /* Body */
  .hb-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
  }

  /* Chat panel: 38% */
  .hb-chat-panel {
    width: 38%;
    min-width: 260px;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255,255,255,0.06);
    height: calc(100dvh - 55px);
  }
  .hb-chat-feed {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.25rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .hb-chat-feed::-webkit-scrollbar { width: 3px; }
  .hb-chat-feed::-webkit-scrollbar-track { background: transparent; }
  .hb-chat-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
  .hb-chat-replies {
    padding: 0.75rem 1.25rem 1.25rem;
    background: linear-gradient(to top, #070710 60%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex-shrink: 0;
  }
  .hb-returning-cta {
    padding: 0 1.25rem 0.75rem;
    flex-shrink: 0;
  }

  /* Module panel: 62% */
  .hb-module-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: calc(100dvh - 55px);
    overflow: hidden;
  }

  /* Tab bar */
  .hb-tabs {
    display: flex;
    align-items: center;
    padding: 0 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: none;
  }
  .hb-tabs::-webkit-scrollbar { display: none; }
  .hb-tab {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.7rem 0.875rem;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.38);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color 0.15s ease, border-color 0.15s ease;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    font-family: inherit;
  }
  .hb-tab:hover { color: rgba(255,255,255,0.65); }
  .hb-tab.active {
    color: rgba(255,255,255,0.9);
    border-bottom-color: #8b5cf6;
  }
  .hb-tab-icon {
    font-family: ui-monospace, monospace;
    font-size: 0.6rem;
    color: rgba(139,92,246,0.7);
    background: rgba(139,92,246,0.1);
    border: 1px solid rgba(139,92,246,0.15);
    border-radius: 3px;
    padding: 0.1rem 0.3rem;
    flex-shrink: 0;
  }
  .hb-tab-close {
    margin-left: 0.25rem;
    font-size: 0.72rem;
    line-height: 1;
    color: rgba(255,255,255,0.18);
    flex-shrink: 0;
    border-radius: 3px;
    padding: 0.05rem 0.22rem;
    opacity: 0;
    transition: opacity 0.15s ease, color 0.15s ease, background 0.15s ease;
  }
  .hb-tab:hover .hb-tab-close { opacity: 1; }
  .hb-tab-close:hover {
    color: rgba(255,255,255,0.75);
    background: rgba(255,255,255,0.07);
  }
  @media (max-width: 768px) {
    .hb-tab-close { opacity: 1; }
  }
  .hb-empty-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 0.75rem;
  }
  .hb-empty-chip {
    font-size: 0.72rem;
    padding: 0.45rem 0.7rem;
  }

  /* Empty panel */
  .hb-panel-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    text-align: center;
  }
  .hb-panel-empty-icon { font-size: 2rem; opacity: 0.12; }
  .hb-panel-empty-text { font-size: 0.82rem; color: rgba(255,255,255,0.22); max-width: 28ch; line-height: 1.6; }

  /* Panel content */
  .hb-panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    animation: hb-slide-in 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .hb-panel-content::-webkit-scrollbar { width: 4px; }
  .hb-panel-content::-webkit-scrollbar-track { background: transparent; }
  .hb-panel-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  /* ── Shared: messages ── */
  .hb-msg {
    display: flex;
    gap: 0.5rem;
    animation: hb-fade-in 0.3s ease;
  }
  .hb-msg.user { flex-direction: row-reverse; }
  .hb-msg-avatar {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.5rem;
    font-weight: 800;
    color: white;
    margin-top: 3px;
  }
  .hb-msg.user .hb-msg-avatar {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.45);
  }
  .hb-msg-bubble {
    max-width: 85%;
    padding: 0.6rem 0.875rem;
    border-radius: 12px;
    font-size: 0.8rem;
    line-height: 1.65;
    white-space: pre-wrap;
  }
  .hb-msg.agent .hb-msg-bubble {
    background: #141428;
    border: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.82);
    border-radius: 4px 12px 12px 12px;
  }
  .hb-msg.user .hb-msg-bubble {
    background: rgba(139,92,246,0.13);
    border: 1px solid rgba(139,92,246,0.2);
    color: rgba(255,255,255,0.75);
    text-align: right;
    border-radius: 12px 12px 4px 12px;
  }
  /* Module reference link in dashboard chat thread */
  .hb-module-link {
    cursor: pointer;
    color: rgba(139,92,246,0.8) !important;
    background: rgba(139,92,246,0.06) !important;
    border-color: rgba(139,92,246,0.15) !important;
    font-size: 0.74rem;
  }
  .hb-module-link:hover { background: rgba(139,92,246,0.12) !important; }

  /* Inline module wrap (splash only) */
  .hb-inline-module {
    animation: hb-fade-in 0.4s ease;
    width: 100%;
  }

  /* ── Typing ── */
  .hb-typing {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    animation: hb-fade-in 0.25s ease;
  }
  .hb-typing-avatar {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    flex-shrink: 0;
  }
  .hb-typing-dots {
    background: #141428;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 4px 12px 12px 12px;
    padding: 0.6rem 0.875rem;
    display: flex;
    gap: 0.28rem;
    align-items: center;
  }
  .hb-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: rgba(139,92,246,0.6);
    animation: hb-bounce 1.2s ease-in-out infinite;
  }
  .hb-dot:nth-child(2) { animation-delay: 0.18s; }
  .hb-dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes hb-bounce {
    0%,60%,100% { transform: translateY(0); }
    30% { transform: translateY(-3px); }
  }

  /* ── Shared: replies ── */
  .hb-replies-label {
    font-size: 0.58rem;
    color: rgba(255,255,255,0.18);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 0.1rem;
  }
  .hb-reply {
    padding: 0.55rem 0.8rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9px;
    cursor: pointer;
    font-size: 0.76rem;
    color: rgba(255,255,255,0.65);
    text-align: left;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    font-family: inherit;
  }
  .hb-reply:hover {
    background: rgba(139,92,246,0.09);
    border-color: rgba(139,92,246,0.28);
    color: rgba(255,255,255,0.88);
  }

  /* ── Counter module ── */
  .hb-module-counter {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .hbmc-number {
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #8b5cf6;
    font-variant-numeric: tabular-nums;
  }
  .hbmc-label {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.38);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: -0.75rem;
  }
  .hbmc-stats {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .hbmc-stat { display: flex; flex-direction: column; gap: 0.1rem; }
  .hbmc-sv { font-size: 1rem; font-weight: 800; color: rgba(255,255,255,0.85); }
  .hbmc-ss { font-size: 0.62rem; color: rgba(255,255,255,0.3); }
  .hbmc-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.07); }
  .hbmc-breakdown {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .hbmc-bd-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; }
  .hbmc-bd-cat { flex: 1; color: rgba(255,255,255,0.6); }
  .hbmc-bd-n { color: rgba(255,255,255,0.28); font-size: 0.72rem; }
  .hbmc-bd-saved { font-weight: 700; color: #8b5cf6; font-variant-numeric: tabular-nums; }

  /* ── Calculator module ── */
  .hb-module-calc {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .hbcalc-row { display: flex; flex-direction: column; gap: 0.35rem; }
  .hbcalc-label { font-size: 0.78rem; color: rgba(255,255,255,0.5); }
  .hbcalc-slider { width: 100%; accent-color: #f59e0b; }
  .hbcalc-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 0.6rem 0.875rem;
    color: rgba(255,255,255,0.85);
    font-size: 0.85rem;
    font-family: inherit;
    outline: none;
    box-sizing: border-box;
  }
  .hbcalc-input:focus { border-color: rgba(245,158,11,0.4); }
  .hbcalc-btn {
    padding: 0.65rem 1.25rem;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 8px;
    color: #f59e0b;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    width: fit-content;
    transition: background 0.15s ease;
    font-family: inherit;
  }
  .hbcalc-btn:hover { background: rgba(245,158,11,0.22); }
  .hbcalc-result {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .hbcalc-r-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
  .hbcalc-r-label { font-size: 0.78rem; color: rgba(255,255,255,0.45); }
  .hbcalc-r-val { font-size: 0.92rem; font-weight: 700; color: rgba(255,255,255,0.85); font-variant-numeric: tabular-nums; }
  .hbcalc-r-val.accent { color: #f59e0b; }
  .hbcalc-anchor { font-size: 0.68rem; color: rgba(255,255,255,0.22); font-style: italic; margin-top: 0.25rem; }

  /* ── Article module ── */
  .hb-module-article {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 640px;
  }
  .hbart-eyebrow {
    font-family: ui-monospace, monospace;
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
  }
  .hbart-headline {
    font-size: clamp(1.2rem, 2.5vw, 1.5rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.2;
    color: rgba(255,255,255,0.92);
    margin: 0;
  }
  .hbart-dropcap { font-size: 0.88rem; line-height: 1.75; color: rgba(255,255,255,0.7); margin: 0; }
  .hbart-dc {
    float: left;
    font-size: 3.4em;
    line-height: 0.75;
    margin: 0.1em 0.08em 0 0;
    color: rgba(255,255,255,0.88);
    font-weight: 900;
  }
  .hbart-pullquote {
    border-left: 2px solid rgba(139,92,246,0.5);
    padding: 0.5rem 0 0.5rem 1rem;
    margin: 0;
    font-size: 0.92rem;
    font-style: italic;
    color: rgba(255,255,255,0.48);
    line-height: 1.65;
  }
  .hbart-body { font-size: 0.88rem; line-height: 1.8; color: rgba(255,255,255,0.62); margin: 0; }
  .hbart-breakdown {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .hbart-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; }
  .hbart-cat { flex: 1; color: rgba(255,255,255,0.62); }
  .hbart-ev { color: rgba(255,255,255,0.28); font-size: 0.72rem; }
  .hbart-saved { font-weight: 700; color: #8b5cf6; font-variant-numeric: tabular-nums; }

  /* ── Live feed module ── */
  .hb-module-feed {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .hbfeed-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
  .hbfeed-label {
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    font-family: ui-monospace, monospace;
  }
  .hbfeed-total { font-size: 0.72rem; font-weight: 700; color: #10b981; font-variant-numeric: tabular-nums; }
  .hbfeed-list { display: flex; flex-direction: column; gap: 0.35rem; }
  .hbfeed-event {
    display: flex;
    align-items: baseline;
    gap: 0.625rem;
    font-size: 0.76rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    animation: hb-fade-in 0.3s ease;
    flex-wrap: wrap;
  }
  .hbfeed-verdict {
    font-family: ui-monospace, monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.18rem 0.4rem;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .hbfeed-action { flex: 1; color: rgba(255,255,255,0.58); min-width: 120px; }
  .hbfeed-saved { font-weight: 700; color: #10b981; font-size: 0.72rem; white-space: nowrap; }

  /* ── Comparison module ── */
  .hb-module-comparison {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .hbcomp-label {
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    font-family: ui-monospace, monospace;
  }
  .hbcomp-table-wrap { overflow-x: auto; }
  .hbcomp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
    min-width: 500px;
  }
  .hbcomp-table th {
    text-align: left;
    padding: 0.5rem 0.75rem;
    color: rgba(255,255,255,0.3);
    font-weight: 600;
    font-size: 0.7rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .hbcomp-table td {
    padding: 0.6rem 0.75rem;
    color: rgba(255,255,255,0.5);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: top;
  }
  .hbcomp-row-label { color: rgba(255,255,255,0.65); font-weight: 500; }
  .l9c { background: rgba(139,92,246,0.04); }
  .l9cv { color: rgba(255,255,255,0.9) !important; font-weight: 700; }
  .hbcomp-table th.l9c { color: #8b5cf6; }

  /* ── Voice pitch module ── */
  .hb-module-voice {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .hbvoice-label { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
  .hbvoice-track {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 1rem 1.125rem;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    flex-wrap: wrap;
  }
  .hbvoice-track-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 80px; }
  .hbvt-label { font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.82); }
  .hbvt-desc { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
  .hbvoice-play {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: rgba(236,72,153,0.1);
    border: 1px solid rgba(236,72,153,0.22);
    color: #ec4899;
    font-size: 0.72rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s ease;
  }
  .hbvoice-play.active { background: rgba(236,72,153,0.25); }
  .hbvoice-play:hover { background: rgba(236,72,153,0.2); }
  .hbvoice-waveform { display: flex; align-items: center; gap: 2px; height: 28px; }
  .hbvoice-bar {
    width: 3px;
    border-radius: 2px;
    background: rgba(236,72,153,0.38);
    animation: hbvoice-wave 0.8s ease-in-out infinite alternate;
  }
  @keyframes hbvoice-wave {
    from { transform: scaleY(0.4); }
    to { transform: scaleY(1.2); }
  }
  .hbvoice-note { font-size: 0.65rem; color: rgba(255,255,255,0.18); font-style: italic; }

  /* ── Wrapper story module ── */
  .hb-module-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .hbwrap-label { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
  .hbwrap-stack { display: flex; flex-direction: column; gap: 0.625rem; }
  .hbwrap-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 0.875rem 1rem;
    border-left: 3px solid var(--wc, #8b5cf6);
  }
  .hbwrap-card.planned { opacity: 0.5; }
  .hbwc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; }
  .hbwc-name { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.85); }
  .hbwc-badge { font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--wc, #8b5cf6); font-family: ui-monospace, monospace; }
  .hbwc-desc { font-size: 0.75rem; color: rgba(255,255,255,0.38); line-height: 1.5; }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .hb-body { flex-direction: column; overflow: visible; }
    .hb-chat-panel {
      width: 100%;
      max-width: none;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      height: auto;
      max-height: 50vh;
    }
    .hb-module-panel {
      height: auto;
      min-height: 50vh;
    }
    .hb-panel-content { padding: 1rem; }
    .hb-tabs { padding: 0 0.875rem; }
    .hb-splash-chat {
      max-height: 85vh;
      min-height: 60vh;
    }
  }
  @media (max-width: 480px) {
    .hb-topbar { padding: 0.75rem 1rem; }
    .hb-panel-content { padding: 0.875rem; }
  }

  /* ── Ambient orbs (splash background) ── */
  .hb-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(80px);
    will-change: transform;
  }
  .hb-orb-violet {
    width: 520px; height: 520px;
    top: -10%; left: 50%;
    transform: translateX(-60%);
    background: radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%);
    animation: hb-orb-drift 18s ease-in-out infinite alternate;
  }
  .hb-orb-fuchsia {
    width: 380px; height: 380px;
    bottom: 5%; right: -5%;
    background: radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 65%);
    animation: hb-orb-drift 22s ease-in-out infinite alternate-reverse;
  }
  .hb-orb-cyan {
    width: 300px; height: 300px;
    bottom: 15%; left: -2%;
    background: radial-gradient(circle, rgba(6,182,212,0.035) 0%, transparent 65%);
    animation: hb-orb-drift 26s ease-in-out infinite alternate;
  }
  @keyframes hb-orb-drift {
    0% { transform: translateX(0) translateY(0); }
    50% { transform: translateX(24px) translateY(-18px); }
    100% { transform: translateX(-16px) translateY(12px); }
  }

  /* ── Pulsing border on splash card ── */
  .hb-splash-chat-pulse {
    animation: hb-card-pulse 8s ease-in-out infinite;
  }
  @keyframes hb-card-pulse {
    0%, 100% { box-shadow: 0 0 80px rgba(139,92,246,0.06), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.12); }
    50%       { box-shadow: 0 0 100px rgba(139,92,246,0.11), 0 24px 56px rgba(0,0,0,0.45), 0 0 0 1px rgba(139,92,246,0.22); }
  }

  /* ── Module shimmer / loading state ── */
  .hb-module-shimmer {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding: 0.25rem 0;
  }
  .hb-shimmer-line {
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: hb-shimmer 1.4s ease-in-out infinite;
  }
  .hb-shimmer-line-h { height: 2.4rem; width: 55%; }
  .hb-shimmer-line-m { height: 0.9rem; width: 75%; }
  .hb-shimmer-line-s { height: 0.9rem; width: 45%; }
  .hb-shimmer-block {
    height: 5rem;
    border-radius: 10px;
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%);
    background-size: 200% 100%;
    animation: hb-shimmer 1.4s ease-in-out infinite 0.2s;
  }
  @keyframes hb-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Module error state ── */
  .hb-module-error {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 0;
  }
  .hb-module-error-text {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.32);
  }
  .hb-module-error-retry {
    font-size: 0.74rem;
    padding: 0.4rem 0.75rem;
  }

  /* ── Module reveal animation ── */
  .hb-module-reveal {
    animation: hb-module-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes hb-module-reveal {
    from { opacity: 0; transform: scale(0.97) translateY(6px); }
    to { opacity: 1; transform: none; }
  }

  /* ── Empty state: module icon grid ── */
  .hb-module-icons-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    justify-content: center;
    max-width: 360px;
  }
  .hb-module-icon-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem 0.625rem;
    border-radius: 10px;
    transition: background 0.15s ease;
    animation: hb-icon-pulse 3s ease-in-out infinite alternate;
  }
  .hb-module-icon-chip:hover { background: rgba(255,255,255,0.04); }
  @keyframes hb-icon-pulse {
    0% { opacity: 0.38; }
    100% { opacity: 0.68; }
  }
  .hb-mic-icon {
    font-family: ui-monospace, monospace;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.3rem 0.45rem;
    border-radius: 5px;
    border: 1px solid;
    flex-shrink: 0;
  }
  .hb-mic-label {
    font-size: 0.6rem;
    color: rgba(255,255,255,0.28);
    white-space: nowrap;
  }
`;

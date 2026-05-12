"use client";
/**
 * ConversationHomepage
 * The Level9OS homepage. Starts as centered chat splash. Transitions to
 * dashboard when content demands it. Supports three distinct visitor states:
 *   State 1 — Fresh visit: centered splash, transitions to dashboard on first
 *             rich module request
 *   State 2 — Return visit (< 30 days): lands directly in dashboard, thread
 *             restored
 *   State 3 — Skipped splash: lands in dashboard with pre-surfaced tabs
 *
 * Phase A: Rich modules added (Products, Governance, Paths, Wrappers, About,
 *          Architecture, Compare) holding full content from former routed pages.
 * Phase B: URL deep-linking via ?surface= param.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { CursorGradient, FadeIn } from "@level9/brand/components/motion";
import { SearchPalette, type PaletteItem } from "@/components/SearchPalette";
import ConsoleGraphicLite from "@/app/_components/ConsoleGraphicLite";
import { ForgeCube, type ForgeProduct } from "@level9/brand/components/architecture";
import HomeHeroSplash from "@/components/motion/HomeHeroSplash";
import { products } from "@level9/brand/content/products";
import { pressurePoints, chassis, installManual } from "@level9/brand/content/pressurePoints";
import { stack } from "@level9/brand/content/stack";
import { domainByTitle } from "@level9/brand/content/playbookDomains";
import { partners, learningCapabilities } from "@/data/partners";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleId =
  | "counter"
  | "calculator"
  | "article"
  | "live-feed"
  | "comparison"
  | "voice-pitch"
  | "wrapper-story"
  | "products"
  | "governance"
  | "paths"
  | "wrappers"
  | "about"
  | "architecture"
  | "compare"
  | "walkthroughs";

type PoolGroup = "A" | "B" | "C" | "D" | "E" | "F";

// Engagement ladder chip types
type ChipType = "module" | "yes-no" | "guess";

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
  engagementLevel: number;
  lastPlayfulLabel?: string;
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
    suggestedReply: "Show me the money.",
    agentIntro: "Here it is. $0 to $52,686. 90 days. Three decimal places of receipts.",
  },
  calculator: {
    label: "Calculator",
    icon: "~",
    suggestedReply: "How much would I save?",
    agentIntro: "Pulled up the calculator. Put in your team size, tools, and monthly spend.",
  },
  article: {
    label: "The Story",
    icon: "A",
    suggestedReply: "I have the receipts.",
    agentIntro: "Opening the long version. How $5.07 a month prevented $52,686 in 90 days.",
  },
  "live-feed": {
    label: "Live Feed",
    icon: "//",
    suggestedReply: "Houston, we have a problem.",
    agentIntro: "Here is the system running. Every blocked action, every rerouted call. Live.",
  },
  comparison: {
    label: "Comparison",
    icon: "=",
    suggestedReply: "Who are you up against?",
    agentIntro: "Pulling up the vendor comparison.",
  },
  "voice-pitch": {
    label: "The Pitch",
    icon: ">",
    suggestedReply: "Roll the tape.",
    agentIntro: "Three versions. Pick how deep you want to go.",
  },
  "wrapper-story": {
    label: "Wrapper Story",
    icon: "[]",
    suggestedReply: "Open the pod bay doors.",
    agentIntro: "OutboundOS is the first wrapper on this governance layer. Here is the roadmap.",
  },
  products: {
    label: "Products",
    icon: "P",
    suggestedReply: "What is in the box?",
    agentIntro: "Full product catalog. Three tiers: Core, Plugins, Department Wrappers.",
  },
  governance: {
    label: "Governance",
    icon: "G",
    suggestedReply: "How does governance actually work?",
    agentIntro: "Opening The Vault. Every action logged. Every dollar tracked. No agent self-approves.",
  },
  paths: {
    label: "Work With Us",
    icon: "W",
    suggestedReply: "How do I get started?",
    agentIntro: "Three entry points. Startup, Growth, Enterprise. Same governance chassis, different starting point.",
  },
  wrappers: {
    label: "Wrappers",
    icon: "Wr",
    suggestedReply: "Tell me about department wrappers",
    agentIntro: "OutboundOS proved the pattern. Here is the full wrapper architecture.",
  },
  about: {
    label: "About",
    icon: "Ab",
    suggestedReply: "Who built this?",
    agentIntro: "20+ years of executive operating leadership. 6 continents. Here is the full story.",
  },
  architecture: {
    label: "Architecture",
    icon: "Ar",
    suggestedReply: "What is your architecture?",
    agentIntro: "Four pressure points, eight operating layers, eight playbook domains. Full taxonomy.",
  },
  compare: {
    label: "Compare",
    icon: "Cm",
    suggestedReply: "Who are you up against?",
    agentIntro: "Mapped 70+ vendors across 8 capability layers. Seven real competitors. Honest read on each.",
  },
  walkthroughs: {
    label: "Walkthroughs",
    icon: ">>",
    suggestedReply: "Roll the tape.",
    agentIntro: "Three depths. 30 seconds, 1:30, 5 minutes. Pick how far in you want to go.",
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
  "products",
  "governance",
  "paths",
  "wrappers",
  "about",
  "architecture",
  "compare",
  "walkthroughs",
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
  "products":      "#8b5cf6", // Decide / violet
  "governance":    "#ef4444", // Chassis / Vault
  "paths":         "#8b5cf6", // violet
  "wrappers":      "#f59e0b", // Execute / amber
  "about":         "#10b981", // Coordinate / emerald
  "architecture":  "#06b6d4", // Measure / cyan
  "compare":       "#8b5cf6", // Decide / violet
  "walkthroughs":  "#ec4899", // MAX / fuchsia
};

// Pre-surfaced tabs for State 3 (skipped)
const SKIP_DEFAULT_TABS: ModuleId[] = ["counter", "calculator", "comparison", "article"];

// ─── Module components (reused from pure/tabs variants) ────────────────────────

function CounterModule() {
  const [value, setValue] = useState(0);
  const [burst, setBurst] = useState(false);
  const [subVisible, setSubVisible] = useState(false);
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
      if (progress >= 1) {
        setBurst(true);
        setTimeout(() => { setBurst(false); setSubVisible(true); }, 300);
      } else {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="hb-module-counter" style={{ position: "relative", overflow: "visible" }}>
      {/* Particle burst at peak */}
      {burst && (
        <div className="hbmc-burst" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="hbmc-particle"
              style={{ "--angle": `${i * 30}deg` } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      <div className="hbmc-number"
        style={{ color: value >= TARGET ? "#ef4444" : "#8b5cf6", transition: "color 0.5s ease" }}
      >
        ${value.toLocaleString()}
      </div>
      <div className="hbmc-label">Prevented in 90 days</div>
      {subVisible && (
        <div style={{ animation: "hb-fade-in 0.5s ease" }}>
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
            ].map((r, i) => (
              <div key={r.cat} className="hbmc-bd-row"
                style={{ animation: `hb-fade-in 0.4s ease ${i * 0.1}s both` }}>
                <span className="hbmc-bd-cat">{r.cat}</span>
                <span className="hbmc-bd-n">{r.n}</span>
                <span className="hbmc-bd-saved">{r.saved}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {!subVisible && (
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
      )}
      {subVisible && (
        <HowExplainer label="How? Breakdown">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {[
              { label: "Reversals caught", pct: "60%", amount: "$26,361", color: "#8b5cf6" },
              { label: "Stop hook fires", pct: "21%", amount: "$10,834", color: "#ef4444" },
              { label: "Flub events stopped", pct: "22%", amount: "$11,500", color: "#f59e0b" },
              { label: "Cost-router refusals", pct: "<1%", amount: "$31", color: "#06b6d4" },
            ].map((item, i) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.625rem", animation: `hb-fade-in 0.35s ease ${i * 0.08}s both` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "0.76rem", color: "rgba(255,255,255,0.62)" }}>{item.label}</span>
                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace" }}>{item.pct}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: item.color, fontVariantNumeric: "tabular-nums" }}>{item.amount}</span>
              </div>
            ))}
            <div style={{ marginTop: "0.25rem", fontSize: "0.65rem", color: "rgba(255,255,255,0.22)", fontFamily: "ui-monospace,monospace", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
              Numbers pulled from production session logs. Not projections.
            </div>
          </div>
        </HowExplainer>
      )}
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
          {/* Animated bar visualization */}
          <div className="hbcalc-bars">
            {[
              { label: "Prevented / mo", value: result.prevented, max: Math.max(result.prevented, 10000), color: "#ef4444", prefix: "$", suffix: "" },
              { label: "Hours returned / mo", value: result.hoursMonthly, max: Math.max(result.hoursMonthly, 10), color: "#06b6d4", prefix: "", suffix: " hrs" },
              { label: "ROI ratio", value: Math.min(result.roiRatio, 9999), max: Math.max(result.roiRatio, 1000), color: "#8b5cf6", prefix: "", suffix: "x" },
            ].map((bar) => {
              const pct = Math.min((bar.value / bar.max) * 100, 100);
              return (
                <div key={bar.label} className="hbcalc-bar-row">
                  <div className="hbcalc-bar-label">{bar.label}</div>
                  <div className="hbcalc-bar-track">
                    <div
                      className="hbcalc-bar-fill"
                      style={{ width: `${pct}%`, background: bar.color, boxShadow: `0 0 8px ${bar.color}60` }}
                    />
                  </div>
                  <div className="hbcalc-bar-val" style={{ color: bar.color }}>
                    {bar.prefix}{typeof bar.value === "number" && bar.value > 999 ? bar.value.toLocaleString() : bar.value}{bar.suffix}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hbcalc-r-row" style={{ marginTop: "0.75rem" }}>
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
          <HowExplainer label="How is this calculated?">
            <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <p style={{ margin: 0 }}>The formula uses three inputs:</p>
              <p style={{ margin: 0, fontFamily: "ui-monospace,monospace", fontSize: "0.68rem", background: "rgba(255,255,255,0.03)", padding: "0.5rem 0.75rem", borderRadius: 6, color: "rgba(255,255,255,0.65)" }}>
                complexity = 1 + (tools - 1) * 0.08<br />
                waste_at_risk = spend * (0.18 + tools*0.015 + people*0.001) * complexity<br />
                prevented = waste_at_risk * 87.8%
              </p>
              <p style={{ margin: 0 }}>Prevention rate (87.8%) is derived from Eric&apos;s 90-day production data: $52,686 prevented out of ~$59,963 waste-at-risk.</p>
            </div>
          </HowExplainer>
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

const FEED_EVENTS: { action: string; verdict: string; saved: number; cat: string; rule: string }[] = [
  { action: "Done-claim without build verify", verdict: "BLOCKED", saved: 86.67, cat: "Stop hook", rule: "Stop hook requires a deterministic verifier before any done-claim is accepted. No build verify = no done-claim." },
  { action: "Broad grep on expensive model tier", verdict: "REROUTED", saved: 0.71, cat: "Cost-router", rule: "Cost-router classifies PLUMBING tasks and routes them to Haiku. Broad grep on Opus tier triggers the PLUMBING redirect." },
  { action: "Write to protected governance hook", verdict: "BLOCKED", saved: 110.0, cat: "Protected-resource", rule: "Protected-resource hook checks every write against the deny list. ~/.claude/hooks is a protected path. No capability grant = blocked." },
  { action: "Unverified claim before production push", verdict: "BLOCKED", saved: 250.0, cat: "Flub/claim", rule: "Claim-verify hook flags any assertion that lacks a traceable source. Unverified claims before production push hit the anti-lie stop hook." },
  { action: "Mid-session reversal on prior done-claim", verdict: "FLAGGED", saved: 33.71, cat: "Reversal", rule: "Session state tracking detects when an agent contradicts a prior done-claim in the same thread. Logged to cmd_routing_log as a reversal event." },
  { action: "Em dash in user-facing marketing copy", verdict: "FLAGGED", saved: 33.71, cat: "Voice-rule", rule: "Voice-rule hook detects em dash characters in agent-generated copy and flags for correction before publication." },
  { action: "Mechanical rename rerouted to Haiku", verdict: "REROUTED", saved: 1.4, cat: "Cost-router", rule: "PLUMBING tasks (mechanical rename, bulk ops) route to Haiku tier. Running them on Opus triggers the cost-router redirect." },
  { action: "Force-push to main attempted", verdict: "BLOCKED", saved: 110.0, cat: "Protected-resource", rule: "Force-push to main is blocked by the guard-bash hook. Listed in the four hard-blocked patterns. No exceptions." },
  { action: "Classification sweep on correct tier", verdict: "ALLOWED", saved: 0, cat: "Cost-router", rule: "CLASSIFICATION task correctly routed to Haiku. No redirect needed. Event logged as ALLOWED to confirm policy compliance." },
  { action: "Build verified, done-claim accepted", verdict: "ALLOWED", saved: 0, cat: "Stop hook", rule: "Done-claim registered a passing build verify. Stop hook checked the proof, confirmed it. Claim accepted." },
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
  const [animating, setAnimating] = useState<number | null>(null);

  useEffect(() => {
    if (visible >= FEED_EVENTS.length) return;
    const t = setTimeout(() => {
      setAnimating(visible);
      setVisible((v) => v + 1);
      setTotal((t) => t + (FEED_EVENTS[visible]?.saved ?? 0));
      setTimeout(() => setAnimating(null), 300);
    }, 1100);
    return () => clearTimeout(t);
  }, [visible]);

  // Timestamp simulation
  const now = Date.now();

  return (
    <div className="hb-module-feed">
      <div className="hbfeed-header">
        <span className="hbfeed-label">Live audit trail</span>
        <span className="hbfeed-total" style={{ animation: "hbfeed-tick 0.3s ease" }}>${total.toFixed(2)} saved this session</span>
      </div>
      <div className="hbfeed-list">
        {FEED_EVENTS.slice(0, visible).map((ev, i) => {
          const vc = VERDICT_COLORS[ev.verdict] ?? VERDICT_COLORS.ALLOWED;
          const isNew = i === visible - 1 && animating === i;
          const tsOffset = (visible - 1 - i) * 47 * 1000;
          const ts = new Date(now - tsOffset);
          const tsStr = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
          return (
            <div key={i} className="hbfeed-event-wrap" style={{ animation: isNew ? "hbfeed-enter 0.3s cubic-bezier(0.16,1,0.3,1)" : undefined }}>
              <div className="hbfeed-event">
                <span className="hbfeed-ts">{tsStr}</span>
                <span
                  className={`hbfeed-verdict ${ev.verdict === "BLOCKED" ? "hbfeed-verdict-blocked" : ev.verdict === "REROUTED" ? "hbfeed-verdict-rerouted" : ""}`}
                  style={{ color: vc.color, background: vc.bg, animation: isNew && ev.verdict === "BLOCKED" ? "hbfeed-stamp 0.15s cubic-bezier(0.16,1,0.3,1)" : undefined }}
                >
                  {ev.verdict}
                </span>
                <span className="hbfeed-action">{ev.action}</span>
                {ev.saved > 0 && <span className="hbfeed-saved">+${ev.saved.toFixed(2)}</span>}
              </div>
              <HowExplainer label="How was this caught?">
                <p style={{ margin: 0, fontSize: "0.73rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{ev.rule}</p>
              </HowExplainer>
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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
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
              <tr
                key={r.label}
                onMouseEnter={() => setHoveredRow(r.label)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  background: hoveredRow === r.label ? "rgba(139,92,246,0.05)" : undefined,
                  transition: "background 0.15s ease",
                }}
              >
                <td className="hbcomp-row-label">{r.label}</td>
                <td>{r.ms}</td>
                <td>{r.sf}</td>
                <td>{r.wd}</td>
                <td className="l9c l9cv" style={{ fontWeight: hoveredRow === r.label ? 900 : undefined }}>{r.l9}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <HowExplainer label="How was this comparison scored?">
        <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
          <p style={{ margin: "0 0 0.4rem" }}>Scored on 6 dimensions using public pricing, product documentation, and analyst reports. Level9OS numbers are production figures, not marketing claims.</p>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace", fontSize: "0.62rem" }}>Source: LEVEL9OS-POSITIONING-V2-AND-MARKET-RESEARCH-2026-05-11.md</p>
        </div>
      </HowExplainer>
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
  const [hoveredWrapper, setHoveredWrapper] = useState<string | null>(null);
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
          <div
            key={w.name}
            className={`hbwrap-card ${w.status}`}
            style={{
              "--wc": w.color,
              transform: hoveredWrapper === w.name ? "translateX(4px)" : undefined,
              transition: "transform 0.18s cubic-bezier(0.16,1,0.3,1), opacity 0.15s ease",
            } as React.CSSProperties}
            onMouseEnter={() => setHoveredWrapper(w.name)}
            onMouseLeave={() => setHoveredWrapper(null)}
          >
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

// ─── Status badge shared by Products module ───────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  LIVE:            { bg: "rgba(16,185,129,0.08)",   border: "rgba(16,185,129,0.3)",   text: "#10b981", dot: "#10b981" },
  BETA:            { bg: "rgba(139,92,246,0.08)",   border: "rgba(139,92,246,0.3)",   text: "#8b5cf6", dot: "#8b5cf6" },
  ALPHA:           { bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.3)",   text: "#f59e0b", dot: "#f59e0b" },
  "IN PRODUCTION": { bg: "rgba(236,72,153,0.08)",   border: "rgba(236,72,153,0.3)",   text: "#ec4899", dot: "#ec4899" },
  "IN BUILD":      { bg: "rgba(100,116,139,0.08)",  border: "rgba(100,116,139,0.3)",  text: "#64748b", dot: "#64748b" },
  "COMING SOON":   { bg: "rgba(255,255,255,0.02)",  border: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.3)", dot: "rgba(255,255,255,0.2)" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS["COMING SOON"];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-[0.15em] uppercase"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

// ─── Products module ───────────────────────────────────────────────────────────

const GOV_GROUPS = [
  {
    name: "Truth Enforcement",
    color: "#ef4444",
    services: [
      { name: "Lie detector", desc: "Flags outputs that contradict established facts before they ship" },
      { name: "Claim/verify", desc: "Every assertion checked against the canonical rules engine" },
      { name: "Anti-lie stop hook", desc: "Hard stop on outputs that fail the claim check" },
      { name: "Canonical rules engine", desc: "The source of truth every agent writes against" },
      { name: "Done-claim verifier", desc: "No agent claims completion without a deterministic verifier" },
    ],
  },
  {
    name: "Budget + Cost Control",
    color: "#06b6d4",
    services: [
      { name: "Cost router", desc: "Routes each task to its best-fit model at the lowest cost" },
      { name: "Costs dashboard", desc: "Real-time spend per agent, per task, per system" },
      { name: "Model selector", desc: "Picks the right model for the task, not the most expensive" },
      { name: "Per-agent budget caps", desc: "No agent runs without a ceiling" },
      { name: "Conductor", desc: "75% warn / 90% pause enforcement across all sessions" },
    ],
  },
  {
    name: "Identity + Access",
    color: "#8b5cf6",
    services: [
      { name: "Protected resources", desc: "No agent touches a resource without an explicit grant" },
      { name: "Capability grants", desc: "Scoped per agent, per task, per environment" },
      { name: "Secrets vault", desc: "RLS-locked, rotated, never exposed in logs" },
      { name: "Dossier system", desc: "Persistent identity context per operator and per agent" },
      { name: "Intent guardrail", desc: "Agent actions checked against declared intent before execution" },
      { name: "Protected-file hook", desc: "Bash-level block on writes to load-bearing paths" },
      { name: "Session history", desc: "Append-only audit trail, cmd_routing_log" },
      { name: "Governance officer panel", desc: "G1 plan / G2 mid / G3 ship, three review gates" },
    ],
  },
];

function ProductsModule() {
  const [govExpanded, setGovExpanded] = useState<string | null>(null);
  const productByID = Object.fromEntries(products.map((p) => [p.id, p]));
  const commandos = productByID["commandos"];
  const lucidorg = productByID["lucidorg"];
  const max = productByID["max"];
  const stratos = productByID["stratos"];
  const outboundos = productByID["outboundos"];
  const playbook = productByID["playbook"];

  return (
    <div className="hb-rich-module">
      {/* Eyebrow */}
      <div className="hb-rich-eyebrow" style={{ color: "#8b5cf6" }}>Core / Plugins / Wrappers</div>
      <h2 className="hb-rich-headline">The full product catalog.</h2>
      <p className="hb-rich-sub">Level9OS Core is the platform. Plugins extend it. Department Wrappers put it to work inside a business function.</p>

      {/* ForgeCube hero — 6 faces: full product roster */}
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto 1.25rem", aspectRatio: "1", minHeight: 260 }}>
        <ForgeCube
          products={PRODUCTS_CUBE_PRODUCTS}
          skipDust={false}
          showPopup={true}
          className="products-cube"
        />
      </div>

      {/* Tier 1: Core */}
      <div className="hb-rich-section-label" style={{ color: "#8b5cf6" }}>Tier 1: Level9OS Core</div>
      <div className="hb-rich-stack">
        {[commandos, lucidorg, max].filter(Boolean).map((p) => (
          <div key={p.id} className="hb-rich-card hb-product-card" style={{ borderColor: `${p.color}25`, "--pc": p.color } as React.CSSProperties}>
            <div className="hb-rich-card-bar" style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}30, transparent)` }} />
            <div className="hb-rich-card-head">
              <span className="hb-rich-tag" style={{ color: `${p.color}aa` }}>{p.tag}</span>
              <StatusBadge status={p.status === "IN PRODUCTION" ? "IN PRODUCTION" : p.status} />
            </div>
            <h3 className="hb-rich-name" style={{ color: p.color }}>{p.name}</h3>
            <p className="hb-rich-layer">{p.layer}</p>
            <div className="hb-rich-problem">
              <div className="hb-rich-dt">The problem</div>
              <p className="hb-rich-dd">{p.problem}</p>
            </div>
            <div className="hb-rich-answer" style={{ borderColor: p.color }}>
              <div className="hb-rich-dt" style={{ color: `${p.color}aa` }}>The answer</div>
              <p className="hb-rich-dd" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{p.answer}</p>
            </div>
            <div className="hb-rich-features">
              {p.features.map((f) => (
                <div key={f} className="hb-rich-feat">
                  <div className="hb-rich-dot" style={{ background: p.color }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            {p.domain && (
              <a href={`https://${p.domain}`} target="_blank" rel="noopener noreferrer" className="hb-rich-link" style={{ color: `${p.color}cc` }}>
                {p.domain} →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Governance chassis */}
      <div className="hb-rich-card" style={{ borderColor: "rgba(239,68,68,0.25)" }}>
        <div className="hb-rich-card-bar" style={{ background: "linear-gradient(90deg, #ef4444, #ef444430, transparent)" }} />
        <div className="hb-rich-card-head">
          <span className="hb-rich-tag" style={{ color: "rgba(239,68,68,0.7)" }}>Governance Chassis</span>
          <StatusBadge status="LIVE" />
        </div>
        <h3 className="hb-rich-name" style={{ color: "rgba(255,255,255,0.9)" }}>The Vault</h3>
        <p className="hb-rich-layer">Runs under every product</p>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
          18 governance services organized into three capability groups. Not bolted on after deployment. Running from the first agent action.
        </p>
        <div className="hb-rich-gov-groups">
          {GOV_GROUPS.map((group) => (
            <div key={group.name} className="hb-rich-gov-group">
              <button
                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%", padding: 0 }}
                onClick={() => setGovExpanded(govExpanded === group.name ? null : group.name)}
              >
                <div className="hb-rich-gov-head" style={{ borderColor: `${group.color}25` }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: group.color }}>{group.name}</span>
                  <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace" }}>
                    {group.services.length} {govExpanded === group.name ? "↑" : "↓"}
                  </span>
                </div>
              </button>
              <div className="hb-rich-gov-services">
                {(govExpanded === group.name ? group.services : group.services.slice(0, 3)).map((svc) => (
                  <div key={svc.name} className="hb-rich-feat">
                    <div className="hb-rich-dot" style={{ background: group.color }} />
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{svc.name}</span>
                      {govExpanded === group.name && (
                        <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.4, marginTop: "0.15rem" }}>{svc.desc}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier 2: Plugins */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.4)" }}>Tier 2: Plugins</div>
      <div className="hb-rich-grid-3">
        {[stratos, outboundos, playbook].filter(Boolean).map((p) => (
          <div key={p.id} className="hb-rich-card" style={{ borderColor: `${p.color}20` }}>
            <div className="hb-rich-card-bar" style={{ background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
            <div className="hb-rich-card-head">
              <span className="hb-rich-tag" style={{ color: `${p.color}90` }}>{p.tag}</span>
              <StatusBadge status={p.status} />
            </div>
            <h3 className="hb-rich-name" style={{ color: p.color }}>{p.name}</h3>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.55, marginBottom: "0.5rem" }}>{p.answer}</p>
            {p.domain && (
              <a href={`https://${p.domain}`} target="_blank" rel="noopener noreferrer" className="hb-rich-link" style={{ color: `${p.color}cc` }}>
                {p.domain} →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Tier 3: Wrappers ghost cards */}
      <div className="hb-rich-section-label" style={{ color: "#f59e0b" }}>Tier 3: Department Wrappers</div>
      <div className="hb-rich-grid-4">
        {[
          { name: "OutboundOS", desc: "Live. ABM outbound, 30 workflows.", color: "#f59e0b", live: true },
          { name: "FinanceOS", desc: "AP/AR, spend governance, vendor intelligence.", color: "#06b6d4", live: false },
          { name: "SalesOS", desc: "Pipeline hygiene, deal scoring, CRM auto-update.", color: "#10b981", live: false },
          { name: "ExecutionOS", desc: "Project ops, cross-functional coordination.", color: "#8b5cf6", live: false },
        ].map((w) => (
          <div key={w.name} className="hb-rich-ghost-card" style={{ borderColor: `${w.color}18`, opacity: w.live ? 1 : 0.45 }}>
            <div className="hb-rich-ghost-bar" style={{ background: w.color }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: w.live ? w.color : `${w.color}88` }}>{w.name}</span>
              {w.live ? <StatusBadge status="LIVE" /> : <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", fontFamily: "ui-monospace,monospace" }}>Coming</span>}
            </div>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.45 }}>{w.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// VaultOrbit and ORBIT_GROUPS removed — replaced by ConsoleGraphicLite in GovernanceModule

// ─── Governance capability grid component ─────────────────────────────────────

function GovernanceGrid() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  // Check URL hash for deep-link on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash) setActiveAnchor(hash);
  }, []);

  return (
    <div className="hb-gov-grid">
      {GOV_CAPABILITIES.map((cap, i) => {
        const isActive = activeId === cap.id || activeAnchor === cap.id;
        return (
          <div
            key={cap.id}
            id={cap.id}
            className={`hb-gov-cap ${isActive ? "active" : ""}`}
            style={{
              borderColor: isActive ? `${cap.color}45` : `${cap.color}15`,
              background: isActive ? `${cap.color}08` : "rgba(255,255,255,0.015)",
              animationDelay: `${i * 0.03}s`,
            }}
            onClick={() => setActiveId(activeId === cap.id ? null : cap.id)}
          >
            <div className="hb-gov-cap-bar" style={{ background: cap.color }} />
            <div className="hb-gov-cap-group" style={{ color: `${cap.color}80` }}>{cap.group}</div>
            <div className="hb-gov-cap-name">{cap.name}</div>
            {isActive && (
              <div className="hb-gov-cap-desc" style={{ animation: "hb-fade-in 0.2s ease" }}>
                {cap.desc}
              </div>
            )}
            <button className="hb-gov-cap-see" onClick={(e) => { e.stopPropagation(); setActiveId(isActive ? null : cap.id); }}>
              {isActive ? "↑ Close" : "See how →"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Governance capability grid data ──────────────────────────────────────────

const GOV_CAPABILITIES = [
  // Truth Enforcement
  { id: "multi-vendor", name: "Multi-vendor orchestration", desc: "Claude + GPT + Gemini + custom agents in one control plane.", group: "Truth Enforcement", color: "#ef4444" },
  { id: "lie-detector", name: "Lie detector", desc: "Flags outputs that contradict established facts before they ship to production.", group: "Truth Enforcement", color: "#ef4444" },
  { id: "claim-verify", name: "Claim/verify engine", desc: "Every assertion checked against the canonical rules engine before it leaves the session.", group: "Truth Enforcement", color: "#ef4444" },
  { id: "done-claim", name: "Done-claim verifier", desc: "No agent claims completion without a deterministic build or test verifier passing first.", group: "Truth Enforcement", color: "#ef4444" },
  { id: "thoroughness", name: "Thoroughness discipline", desc: "Three-pass discovery protocol: cast wide, validate with a second method, spot-check 10%.", group: "Truth Enforcement", color: "#ef4444" },
  { id: "canonical-rules", name: "Canonical rules engine", desc: "The source of truth every agent writes against. Fetched at session start, not hardcoded.", group: "Truth Enforcement", color: "#ef4444" },
  // Budget + Cost Control
  { id: "cost-routing", name: "Cost routing", desc: "Routes each task to its best-fit model at the lowest cost. PLUMBING to Haiku. Strategy to Opus.", group: "Budget + Cost Control", color: "#f59e0b" },
  { id: "budget-caps", name: "Per-agent budget caps", desc: "No agent runs without a ceiling. 75% warn, 90% pause enforcement via Conductor.", group: "Budget + Cost Control", color: "#f59e0b" },
  { id: "costs-dashboard", name: "Real-time cost dashboard", desc: "Spend per agent, per task, per system. cmd_routing_log visible in CentralOS fleet UI.", group: "Budget + Cost Control", color: "#f59e0b" },
  { id: "garbage-man", name: "Garbage-man discipline", desc: "No junk code. Every file added must justify its existence. Dead code is flagged and removed.", group: "Budget + Cost Control", color: "#f59e0b" },
  { id: "officer-system", name: "Officer system", desc: "48 officers. G1 plan / G2 mid / G3 ship, three review gates. Governance signs off before production.", group: "Budget + Cost Control", color: "#f59e0b" },
  { id: "performance-scoring", name: "Performance scoring", desc: "Humans and agents measured on the same scaffold. ECI baseline, 90-day re-score.", group: "Budget + Cost Control", color: "#f59e0b" },
  // Identity + Access
  { id: "protected-resources", name: "Protected resources", desc: "No agent touches a load-bearing file or workflow without an active capability grant.", group: "Identity + Access", color: "#8b5cf6" },
  { id: "intent-guardrail", name: "Intent guardrail", desc: "Agent actions checked against declared intent before execution. Operator exit-intent detected.", group: "Identity + Access", color: "#8b5cf6" },
  { id: "audit-trail", name: "Audit trail", desc: "Append-only event log. cmd_routing_log. Every LLM call, every governance event, every cost.", group: "Identity + Access", color: "#8b5cf6" },
  { id: "auto-doc", name: "Auto doc creation", desc: "LibraryOS generates and updates governance documentation continuously. Always current.", group: "Identity + Access", color: "#8b5cf6" },
  { id: "trust-scores", name: "Trust scores per agent", desc: "Every agent accrues a trust score based on accuracy, flub rate, and claim-verify pass rate.", group: "Identity + Access", color: "#8b5cf6" },
  { id: "continuous-compliance", name: "Continuous compliance", desc: "SOC2 / NIST / ISO / GDPR / AI RMF. Compliance state maintained continuously, not at audit time.", group: "Identity + Access", color: "#8b5cf6" },
];

// ─── Governance module ─────────────────────────────────────────────────────────

const VAULT_RED = "#ef4444";

const GOV_CHAPTERS = [
  {
    id: "foundations",
    num: "01",
    title: "Foundations",
    question: "Can we recover everything? And how do we know the AI is honest?",
    docs: [
      { title: "Backup, Detection & Access Control", id: "lvl9-gov-001", oneLine: "Three-layer backup. Write-once-read-many immutability. 5-minute tripwire detection.", href: "/governance/backup-and-vault.html" },
      { title: "Anti-Lie Governance", id: "anti-lie", oneLine: "Keep the LLM out of court. Every done-claim must register a deterministic verifier.", href: "/governance/anti-lie-report.html" },
    ],
  },
  {
    id: "operations",
    num: "02",
    title: "Operations",
    question: "What keeps the lights on? And what happens when something breaks?",
    docs: [
      { title: "Infrastructure & Reliability", id: "lvl9-gov-002", oneLine: "Compute, edge, hosting, secrets, cost, identity. Documented restart and recovery.", href: "/governance/viewer.html?doc=infrastructure-and-reliability.md" },
      { title: "Incident Response Runbook", id: "lvl9-gov-005", oneLine: "Six-phase response. Four severity tiers. Six tabletop drill scenarios.", href: "/governance/viewer.html?doc=incident-response.md" },
    ],
  },
  {
    id: "ai-governance",
    num: "03",
    title: "AI Governance",
    question: "How is the AI fleet itself governed?",
    docs: [
      { title: "Agent Oversight & Product Gates", id: "lvl9-gov-003", oneLine: "24 active officers. Three gates. StratOS 5 rooms with 50 personas.", href: "/governance/viewer.html?doc=product-and-agent-governance.md" },
      { title: "Prompt Architecture & Voice Integrity", id: "lvl9-gov-004", oneLine: "Three-layer architecture. 65 officer prompts. Canonical voiceRules.ts.", href: "/governance/viewer.html?doc=prompt-architecture-governance.md" },
      { title: "Responsible AI Policy", id: "lvl9-gov-006", oneLine: "Seven principles. Hard prohibitions. Refusal posture. LLC separation.", href: "/governance/viewer.html?doc=responsible-ai-policy.md" },
    ],
  },
  {
    id: "customer-trust",
    num: "04",
    title: "Customer Trust",
    question: "What happens to customer data?",
    docs: [
      { title: "Data Governance & Customer Rights", id: "lvl9-gov-007", oneLine: "Four-class data taxonomy. 21-vendor sub-processor inventory. Customer rights.", href: "/governance/viewer.html?doc=data-governance.md" },
    ],
  },
];

function GovernanceModule() {
  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: VAULT_RED }}>The Vault · Governance Chassis</div>
      <h2 className="hb-rich-headline">You see the AI agent.<br />You don&apos;t see what it&apos;s doing.</h2>
      <p className="hb-rich-sub" style={{ color: `${VAULT_RED}cc` }}>Level9OS makes the invisible visible.</p>
      {/* Governance radial diagram — 16 officers, 4 buckets, packet flows */}
      <ConsoleGraphicLite />
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {[
          "Every action logged. Not summarized. Logged.",
          "Every dollar tracked. Budget hard stops enforced before they are breached.",
          "Every output gated before it reaches production. No agent self-approves.",
        ].map((item) => (
          <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: VAULT_RED, flexShrink: 0, marginTop: "0.35rem" }} />
            {item}
          </li>
        ))}
      </ul>

      {/* ROI strip */}
      <div className="hb-rich-card" style={{ borderColor: "rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.04)", marginBottom: "1rem" }}>
        <div className="hb-rich-card-head" style={{ marginBottom: "0.75rem" }}>
          <span className="hb-rich-tag" style={{ color: VAULT_RED }}>Governance ROI · Production numbers</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
          {[
            { value: "$52,686", label: "Prevented in cost overruns" },
            { value: "236 hrs", label: "Saved in manual verification" },
            { value: "$5.07/mo", label: "Total governance cost" },
            { value: "3,464x", label: "Gross ROI" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, color: VAULT_RED, letterSpacing: "-0.02em" }}>{stat.value}</div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", fontFamily: "ui-monospace,monospace", marginTop: "0.5rem" }}>Numbers pulled from production logs. Not projections.</p>
      </div>

      {/* How explainer for ROI numbers */}
      <HowExplainer label="How are these numbers calculated?">
        <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <p style={{ margin: 0 }}>4 categories, 90 days of production session logs from Eric&apos;s real deployment:</p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <li>Stop hook fires: 125 events * avg $86.67 = $10,834</li>
            <li>Mid-session reversals: 782 events * avg $33.71 = $26,361</li>
            <li>Flub events: 46 events * avg $250.00 = $11,500</li>
            <li>Cost-router refusals: 44 events * avg $0.71 = $31</li>
          </ul>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace", fontSize: "0.65rem" }}>
            Total: $52,686. Infrastructure cost: $5.07/mo. ROI: 3,464x.
          </p>
        </div>
      </HowExplainer>

      {/* 18-capability grid */}
      <div className="hb-rich-section-label" style={{ color: VAULT_RED }}>18 governance capabilities</div>
      <GovernanceGrid />

      {/* Chapter links */}
      <div className="hb-rich-section-label" style={{ color: VAULT_RED }}>Four chapters</div>
      <div className="hb-rich-stack">
        {GOV_CHAPTERS.map((ch) => (
          <div key={ch.id} className="hb-rich-card" style={{ borderColor: "rgba(239,68,68,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.65rem", color: VAULT_RED, fontFamily: "ui-monospace,monospace", letterSpacing: "0.12em", textTransform: "uppercase" }}>{ch.num} · Chapter</span>
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", marginBottom: "0.15rem" }}>{ch.title}</h3>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginBottom: "0.75rem" }}>{ch.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {ch.docs.map((doc) => (
                <a key={doc.id} href={doc.href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.1rem", padding: "0.4rem 0.6rem", borderRadius: "6px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>{doc.title}</span>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{doc.oneLine}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Paths module ──────────────────────────────────────────────────────────────

const PATHS_DATA = [
  {
    id: "startup",
    label: "Startup",
    accent: "#8b5cf6",
    tag: "Full packaging. Ready to drive tomorrow.",
    headline: "You don't have a stack yet.",
    body: "We build it with you. One agent pod live inside 24 hours. Governance on from day one. No retrofitting later.",
    deliverables: [
      "Intake agent: reads your current ops and surfaces what it found",
      "Initial ops read: the agent returns with a plain-English report",
      "First pod deployed: one autonomous pod running before the first week ends",
      "Governance chassis: running from day one, not retrofitted in month three",
    ],
    href: "/contact?path=startup",
  },
  {
    id: "growth",
    label: "Growth",
    accent: "#10b981",
    tag: "Point us to your docs. Intro an agent. Done.",
    headline: "You have an operation. Something isn't working.",
    body: "You know roughly where. Point us to your docs. Introduce an agent. The agent reads your current state and returns with a report.",
    deliverables: [
      "Agent reads your existing documentation and ops artifacts",
      "Returns a plain-English report: what it found, what it flagged, what it would fix",
      "You read the report. We talk about what's real.",
      "No discovery engagement before the discovery engagement.",
    ],
    href: "/contact?path=growth",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    accent: "#f59e0b",
    tag: "Try a department. See what happens to production.",
    headline: "Try OutboundOS in one department.",
    body: "30-day proof of production lift. Governance running, audit trail live, pods operating. At the end of 30 days, you have a real read on department-level AI in your environment.",
    deliverables: [
      "OutboundOS deployed into one department: pods running, governance on",
      "30-day audit trail showing what ran, what cost what, what produced what",
      "ECI baseline so you have a measurement to compare against",
      "No transformation language. No multi-year contract as the entry point.",
    ],
    href: "/contact?path=enterprise",
  },
];

const PHASES_DATA = [
  { phase: 30, title: "Assess + Quick Wins", items: ["ECI baseline diagnostic", "Friction map of current operations", "30-day quick-win deployment", "Team orientation, first pod live"] },
  { phase: 90, title: "Structural Install", items: ["Second pod deployed (often OutboundOS sub-pods)", "StratOS room calibrated for your decisions", "Cross-pod event bus wired", "Mid-point ECI re-score"] },
  { phase: 180, title: "Optimization + Scale", items: ["All pods measured by LucidORG", "Friction patterns identified and addressed", "Innovation pipeline running", "Handoff to internal team or ongoing partnership"] },
];

function PathsModule() {
  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#8b5cf6" }}>Work With Us</div>
      <h2 className="hb-rich-headline">Pick your starting point.</h2>
      <p className="hb-rich-sub">Same governance chassis. Different entry. Introduce an agent. Give it access. Give it a day.</p>

      <div className="hb-rich-stack">
        {PATHS_DATA.map((path) => (
          <div key={path.id} className="hb-rich-card" style={{ borderColor: `${path.accent}22` }}>
            <div className="hb-rich-card-bar" style={{ background: path.accent }} />
            <div style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.6rem", borderRadius: "99px", fontSize: "0.65rem", fontFamily: "ui-monospace,monospace", letterSpacing: "0.18em", textTransform: "uppercase", background: `${path.accent}12`, border: `1px solid ${path.accent}35`, color: path.accent, marginBottom: "0.5rem" }}>
              {path.label}
            </div>
            <p style={{ fontSize: "0.72rem", fontFamily: "ui-monospace,monospace", color: `${path.accent}cc`, marginBottom: "0.4rem" }}>&ldquo;{path.tag}&rdquo;</p>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: "0.35rem" }}>{path.headline}</h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "0.75rem" }}>{path.body}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.75rem" }}>
              {path.deliverables.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: path.accent, flexShrink: 0, marginTop: "0.45rem" }} />
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <HowExplainer label="What do I get on day 1?">
              <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
                <p style={{ margin: "0 0 0.4rem" }}>First-week deliverables:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {path.deliverables.slice(0, 2).map((d) => (
                    <div key={d} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                      <span style={{ color: path.accent, flexShrink: 0, marginTop: "0.05rem" }}>→</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </HowExplainer>
            <a href={path.href} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 1rem", borderRadius: "99px", background: path.accent, color: "white", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>
              Start here →
            </a>
          </div>
        ))}
      </div>

      {/* 30/90/180 methodology */}
      <div className="hb-rich-section-label" style={{ color: "rgba(139,92,246,0.6)" }}>The Install Methodology</div>
      <div className="hb-rich-grid-3">
        {PHASES_DATA.map((ph) => (
          <div key={ph.phase} className="hb-rich-card" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "rgba(139,92,246,0.8)", marginBottom: "0.25rem", fontVariantNumeric: "tabular-nums" }}>{ph.phase}</div>
            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", marginBottom: "0.5rem" }}>days</div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "rgba(255,255,255,0.85)", marginBottom: "0.5rem" }}>{ph.title}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {ph.items.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.35rem" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(139,92,246,0.6)", flexShrink: 0, marginTop: "0.45rem" }} />
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ForgeCube product data ────────────────────────────────────────────────────

// 6 faces for the Wrappers module — OutboundOS + 5 planned department wrappers
const WRAPPERS_CUBE_PRODUCTS: ForgeProduct[] = [
  {
    id: "outboundos",
    name: "OutboundOS",
    short: "Live. 30 workflows.",
    color: "#f59e0b",
    rgb: [245, 158, 11],
    icon: "O",
    specs: ["LinkupOS + ABM Engine + AutoCS", "30 n8n workflows", "Fully autonomous"],
    stack: ["n8n NAS", "Postgres", "Apollo API"],
    role: "Outbound execution pod",
    side: "right",
  },
  {
    id: "abm-engine",
    name: "ABM Engine",
    short: "Live. Multi-channel.",
    color: "#fb923c",
    rgb: [251, 146, 60],
    icon: "A",
    specs: ["Company in, campaign out", "ICP fit scoring", "Voice-calibrated"],
    stack: ["Apollo", "LinkedIn API", "Claude Sonnet"],
    role: "Account-based outbound",
    side: "left",
  },
  {
    id: "autocs",
    name: "AutoCS",
    short: "Alpha.",
    color: "#f97316",
    rgb: [249, 115, 22],
    icon: "Q",
    specs: ["Ticket triage", "Escalation routing", "Churn signal detection"],
    stack: ["Postgres triggers", "CommandOS", "Slack"],
    role: "Customer service automation",
    side: "right",
  },
  {
    id: "financeos",
    name: "FinanceOS",
    short: "Coming.",
    color: "#06b6d4",
    rgb: [6, 182, 212],
    icon: "F",
    specs: ["AP/AR automation", "Budget monitoring", "Period-close orchestration"],
    stack: ["Plaid", "QuickBooks API", "Postgres"],
    role: "Finance department wrapper",
    side: "left",
  },
  {
    id: "salesos",
    name: "SalesOS",
    short: "Coming.",
    color: "#8b5cf6",
    rgb: [139, 92, 246],
    icon: "S",
    specs: ["Pipeline hygiene", "Deal scoring", "CRM auto-update"],
    stack: ["HubSpot API", "Salesforce", "Claude"],
    role: "Sales department wrapper",
    side: "right",
  },
  {
    id: "executionos",
    name: "ExecutionOS",
    short: "Coming.",
    color: "#10b981",
    rgb: [16, 185, 129],
    icon: "E",
    specs: ["Sprint coordination", "Dependency tracking", "Team throughput"],
    stack: ["Linear", "Jira API", "Postgres"],
    role: "Execution department wrapper",
    side: "left",
  },
];

// 6 faces for the Products module — canonical product roster
const PRODUCTS_CUBE_PRODUCTS: ForgeProduct[] = [
  {
    id: "stratos",
    name: "StratOS",
    short: "AI decision rooms.",
    color: "#8b5cf6",
    rgb: [139, 92, 246],
    icon: "S",
    specs: ["10 AI executives", "3-round debate", "$5.89/run"],
    stack: ["Claude Sonnet", "GPT-4o", "n8n"],
    role: "Executive decision orchestration",
    side: "right",
  },
  {
    id: "commandos",
    name: "CommandOS",
    short: "Fleet orchestration.",
    color: "#10b981",
    rgb: [16, 185, 129],
    icon: "C",
    specs: ["48 domain officers", "3 gates", "22 workflows"],
    stack: ["n8n NAS", "Supabase", "Claude"],
    role: "AI middle management",
    side: "left",
  },
  {
    id: "outboundos-p",
    name: "OutboundOS",
    short: "Autonomous outbound.",
    color: "#f59e0b",
    rgb: [245, 158, 11],
    icon: "O",
    specs: ["30 workflows live", "3 sub-pods", "Zero human ops"],
    stack: ["n8n NAS", "Apollo", "ElevenLabs"],
    role: "Outbound department wrapper",
    side: "right",
  },
  {
    id: "lucidorg",
    name: "LucidORG",
    short: "ECI measurement.",
    color: "#06b6d4",
    rgb: [6, 182, 212],
    icon: "L",
    specs: ["4 pillars, 11 metrics", "0-1000 ECI score", "37 levers"],
    stack: ["Postgres", "Next.js", "Supabase"],
    role: "Measurement platform",
    side: "left",
  },
  {
    id: "playbook",
    name: "COO Playbook",
    short: "30/90/180 install.",
    color: "#64748b",
    rgb: [100, 116, 139],
    icon: "P",
    specs: ["8 operating domains", "Alignment cycle", "Field-tested"],
    stack: ["thenewcoo.com", "PDF + Notion"],
    role: "Operating methodology",
    side: "right",
  },
  {
    id: "max",
    name: "MAX",
    short: "Voice interface.",
    color: "#ec4899",
    rgb: [236, 72, 153],
    icon: "M",
    specs: ["Real-time voice ops", "ElevenLabs voices", "Haiku routing"],
    stack: ["ElevenLabs", "Claude Haiku", "WebRTC"],
    role: "AI voice operator",
    side: "left",
  },
];

// ─── Wrappers module ───────────────────────────────────────────────────────────

const OUTBOUND_PODS_DATA = [
  { id: "linkupos", name: "LinkupOS", color: "#f59e0b", status: "LIVE", url: "linkupos.com", desc: "LinkedIn signal pod. Daily content, ICP prospecting, follow-up sequencing, reply monitoring. Voice-calibrated, fully autonomous." },
  { id: "abm-engine", name: "ABM Engine", color: "#fb923c", status: "LIVE", url: null, desc: "Multi-channel outbound. Company name in, full campaign out. Enrichment, ICP fit scoring, message variants per persona." },
  { id: "autocs", name: "AutoCS", color: "#f97316", status: "ALPHA", url: null, desc: "Customer service automation: ticket triage, escalation routing, sentiment monitoring, churn-signal detection." },
];

const GHOST_WRAPPERS_DATA = [
  { name: "FinanceOS", color: "#06b6d4", desc: "AP/AR automation, budget monitoring, variance alerts, period-close orchestration." },
  { name: "SalesOS", color: "#8b5cf6", desc: "Pipeline management, deal progression, forecast accuracy, rep coaching signals." },
  { name: "ExecutionOS", color: "#10b981", desc: "Sprint coordination, delivery tracking, dependency management, team-level throughput." },
  { name: "ProductOS", color: "#ec4899", desc: "Roadmap prioritization, feedback triage, release coordination, adoption measurement." },
];

const PATTERN_POINTS_DATA = [
  "One human manager. Zero daily intervention required.",
  "Autonomous pods run the work. Governance runs under all of them.",
  "One voice-profile RAG across every pod. One output register.",
  "One audit trail: every action, every cost, every output.",
];

function WrappersModule() {
  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#f59e0b" }}>Department Wrappers</div>
      <h2 className="hb-rich-headline">Department-level AI. Already running.</h2>
      <p className="hb-rich-sub">OutboundOS proved the pattern. Every department runs the same way: autonomous pods, shared governance, one human manager, zero daily intervention.</p>

      {/* ForgeCube hero — 6 faces: OutboundOS + 5 department wrappers */}
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto 1.25rem", aspectRatio: "1", minHeight: 260 }}>
        <ForgeCube
          products={WRAPPERS_CUBE_PRODUCTS}
          skipDust={true}
          showPopup={true}
          className="wrappers-cube"
        />
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {PATTERN_POINTS_DATA.map((point) => (
          <li key={point} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0, marginTop: "0.45rem" }} />
            {point}
          </li>
        ))}
      </ul>

      <HowExplainer label="How does the pod structure work?">
        <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <p style={{ margin: 0 }}>Each wrapper follows the same pattern:</p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <li>1 human manager. No daily intervention required.</li>
            <li>Autonomous pods run the work. Each pod has a specific function.</li>
            <li>1 shared voice profile RAG across all pods. Output register keeps outputs aligned.</li>
            <li>1 governance trail: every action, every cost, every output logged.</li>
          </ul>
          <p style={{ margin: 0 }}>OutboundOS has 3 pods: LinkupOS (LinkedIn), ABM Engine (multi-channel), AutoCS (customer service). All share one governance layer.</p>
        </div>
      </HowExplainer>

      <div className="hb-rich-section-label" style={{ color: "#10b981" }}>OutboundOS · Live in Production</div>
      <div className="hb-rich-stack">
        {OUTBOUND_PODS_DATA.map((pod) => (
          <div key={pod.id} className="hb-rich-card" style={{ borderColor: `${pod.color}22` }}>
            <div className="hb-rich-card-bar" style={{ background: pod.color }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: pod.color }}>{pod.name}</h3>
              <StatusBadge status={pod.status} />
            </div>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.55, marginBottom: "0.35rem" }}>{pod.desc}</p>
            {pod.url && (
              <a href={`https://${pod.url}`} target="_blank" rel="noopener noreferrer" className="hb-rich-link" style={{ color: `${pod.color}aa` }}>{pod.url} →</a>
            )}
          </div>
        ))}
      </div>

      {/* Governance callout */}
      <div className="hb-rich-card" style={{ borderColor: "rgba(239,68,68,0.14)", background: "rgba(239,68,68,0.04)", margin: "0.5rem 0" }}>
        <div className="hb-rich-tag" style={{ color: "#ef4444", marginBottom: "0.4rem" }}>What runs under all of it</div>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>One governance trail across every pod. Every action logged. Every dollar tracked. Every output gated before it reaches production.</p>
      </div>

      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.3)" }}>On the runway</div>
      <div className="hb-rich-grid-4">
        {GHOST_WRAPPERS_DATA.map((w) => (
          <div key={w.name} className="hb-rich-ghost-card" style={{ borderColor: "rgba(255,255,255,0.06)", opacity: 0.45 }}>
            <div className="hb-rich-ghost-bar" style={{ background: w.color }} />
            <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: `${w.color}88`, marginBottom: "0.25rem" }}>{w.name}</h4>
            <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", fontFamily: "ui-monospace,monospace" }}>Coming</span>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.4, marginTop: "0.25rem" }}>{w.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── About module ──────────────────────────────────────────────────────────────

const CHARTER_VALUES_DATA = [
  { label: "Augment, never replace.", desc: "AI that makes the operator more capable. Never a substitute for human judgment at the points that matter.", color: "#10b981" },
  { label: "Honesty before fluency.", desc: "An agent that hedges is better than an agent that sounds confident and is wrong. Claim-verify is not optional.", color: "#8b5cf6" },
  { label: "Transparency over plausibility.", desc: "The audit trail is not a feature. It is the product. If you can't see what the agent did, you can't govern it.", color: "#06b6d4" },
  { label: "Source discipline.", desc: "Every quantitative claim traceable to a primary source. Unknown information is flagged, not invented.", color: "#f59e0b" },
  { label: "Privacy by default.", desc: "Four-class data taxonomy. C-3 Customer Confidential never leaves the operating context without an explicit grant.", color: "#ef4444" },
  { label: "No theater.", desc: "Governance that doesn't enforce is window dressing. Every control is mechanical or it doesn't count.", color: "#ec4899" },
  { label: "LLC separation.", desc: "Each operating LLC is governed separately. Obligations under one entity don't cross to another without explicit authorization.", color: "#64748b" },
];

const LLC_ENTITIES_DATA = [
  { name: "Level9OS LLC", role: "Umbrella brand and consulting entity.", desc: "Level9OS.com describes the product family. Consulting engagements and brand-level relationships run through this entity.", accent: "#8b5cf6" },
  { name: "LucidORG LLC", role: "Commercial product operations.", desc: "Operates LinkupOS, LucidORG.com, COO Playbook, and StratOS. Customer data and commercial product obligations are under this entity.", accent: "#06b6d4" },
  { name: "NextGen Interns LLC", role: "Education platform.", desc: "Operates the NextGen Interns platform. COPPA-sensitive. Student and intern audience. Kept fully separate from commercial product operations.", accent: "#10b981" },
];

const PROOF_STATS_DATA = [
  { num: "20+", label: "Years Experience", color: "#f59e0b" },
  { num: "6", label: "Continents", color: "#10b981" },
  { num: "60+", label: "Countries", color: "#06b6d4" },
  { num: "138", label: "Workflows Live", color: "#8b5cf6" },
];

function AboutModule() {
  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#10b981" }}>Level9OS · The Company</div>
      <h2 className="hb-rich-headline">Operations is where the leverage lives.</h2>
      <p className="hb-rich-sub">A product company, not a consulting practice. We build production-grade AI systems for the operational layer.</p>

      {/* Proof stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {PROOF_STATS_DATA.map((s) => (
          <div key={s.label} style={{ textAlign: "center", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.num}</div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "ui-monospace,monospace" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Origin */}
      <div className="hb-rich-section-label" style={{ color: "rgba(16,185,129,0.5)" }}>The Origin</div>
      <div className="hb-rich-card" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: "0.75rem" }}>
          Eric Hathaway built Level9OS from 20+ years of executive operating leadership across Microsoft, Credit Suisse, T-Mobile, and S&amp;P Global. Six continents. Sixty countries. Deployments at scale across every kind of operating complexity.
        </p>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: "0.75rem" }}>
          One pattern kept repeating. Strategy failures are almost never about strategy. They&apos;re about the layer beneath it: how decisions get made, how work gets coordinated, how alignment gets measured.
        </p>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}>
          Level9OS exists because the operational layer finally deserves the same AI investment every other function already has.
        </p>
      </div>

      {/* Charter values - stagger reveal */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Operating Charter</div>
      <div className="hb-rich-grid-3" style={{ marginBottom: "1rem" }}>
        {CHARTER_VALUES_DATA.map((val, i) => (
          <div
            key={val.label}
            className="hb-rich-ghost-card hb-charter-card"
            style={{
              borderColor: `${val.color}18`,
              opacity: 1,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div className="hb-rich-ghost-bar" style={{ background: val.color }} />
            <h4 style={{ fontSize: "0.78rem", fontWeight: 700, color: val.color, marginBottom: "0.25rem", lineHeight: 1.3 }}>{val.label}</h4>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{val.desc}</p>
          </div>
        ))}
      </div>

      {/* LLC clarity */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Legal Structure</div>
      <div className="hb-rich-stack">
        {LLC_ENTITIES_DATA.map((llc) => (
          <div key={llc.name} className="hb-rich-card" style={{ borderColor: `${llc.accent}20` }}>
            <div className="hb-rich-card-bar" style={{ background: llc.accent }} />
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: llc.accent, marginBottom: "0.15rem" }}>{llc.name}</h4>
            <p style={{ fontSize: "0.65rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: `${llc.accent}80`, marginBottom: "0.4rem" }}>{llc.role}</p>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{llc.desc}</p>
          </div>
        ))}
      </div>

      {/* Learning capabilities */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Learning Capabilities</div>
      <div className="hb-rich-grid-4">
        {learningCapabilities.map((cap) => (
          <a key={cap.title} href={cap.href} target={cap.external ? "_blank" : undefined} rel={cap.external ? "noopener noreferrer" : undefined}
            style={{ textDecoration: "none", display: "block" }}>
            <div className="hb-rich-value-card" style={{ borderColor: `${cap.color}18` }}>
              <span style={{ fontSize: "0.58rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: `${cap.color}80` }}>{cap.audience}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: cap.color }}>{cap.title}</span>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{cap.desc}</span>
            </div>
          </a>
        ))}
      </div>

      {/* Partner network */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Partner Network</div>
      <div className="hb-rich-stack">
        {partners.slice(0, 3).map((p) => (
          <a key={p.id} href={p.external ? p.href : undefined} target={p.external ? "_blank" : undefined} rel={p.external ? "noopener noreferrer" : undefined}
            style={{ display: "block", textDecoration: "none" }}>
            <div className="hb-rich-card" style={{ borderColor: `${p.color}18` }}>
              <div className="hb-rich-card-bar" style={{ background: p.color }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <div>
                  <span style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: `${p.color}88`, letterSpacing: "0.12em" }}>{p.type}</span>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: p.color, marginTop: "0.1rem" }}>{p.name}</h4>
                </div>
                {p.featured && <span style={{ fontSize: "0.6rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", padding: "0.15rem 0.4rem", borderRadius: "4px", background: `${p.color}14`, color: p.color, border: `1px solid ${p.color}30` }}>Featured</span>}
              </div>
              <p style={{ fontSize: "0.72rem", fontWeight: 500, color: `${p.color}cc`, marginBottom: "0.2rem" }}>{p.tagline}</p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{p.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Architecture module ───────────────────────────────────────────────────────

function ArchitectureModule() {
  const layerById = (id: string) => stack.find((l) => l.id === id);

  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#8b5cf6" }}>The Architecture · 4 → 8 → 8</div>
      <h2 className="hb-rich-headline">Four pressure points on the surface.<br /><span style={{ color: "#06b6d4" }}>Eight operating layers underneath.</span></h2>
      <p className="hb-rich-sub">The buyer sees four pressure points. Inside the stack, each one maps down to the operating-system layers we build, and up to the COO Playbook domains operators already know.</p>

      {/* Badge row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
        {[
          { count: 4, label: "PRESSURE POINTS", color: "#8b5cf6" },
          { count: 8, label: "OPERATING LAYERS", color: "#06b6d4" },
          { count: 8, label: "PLAYBOOK DOMAINS", color: "#ec4899" },
          { count: 1, label: "GOVERNANCE CHASSIS", color: "#ef4444" },
        ].map((badge) => (
          <div key={badge.label} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem", borderRadius: "99px", border: `1px solid ${badge.color}30`, background: `${badge.color}08` }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: badge.color, animation: "hb-bounce 2s infinite" }} />
            <span style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)" }}>{badge.count} {badge.label}</span>
          </div>
        ))}
      </div>

      {/* Pressure points */}
      <div className="hb-rich-stack">
        {pressurePoints.map((pp) => (
          <div key={pp.id} className="hb-rich-card" style={{ borderColor: `${pp.color}25` }}>
            <div className="hb-rich-card-bar" style={{ background: `linear-gradient(90deg, ${pp.color}, ${pp.color}30, transparent)` }} />
            <div style={{ marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", letterSpacing: "0.2em", color: `${pp.color}aa`, textTransform: "uppercase" }}>
                PRESSURE POINT {pp.number} · BREAKS {pp.breaks.toUpperCase()}
              </span>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: pp.color, marginBottom: "0.25rem" }}>{pp.verb}</h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: "0.75rem" }}>{pp.answer}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>Maps Down To</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: `${pp.color}cc`, marginBottom: "0.4rem" }}>Operating layers</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {pp.layers.map((layerId) => {
                    const layer = layerById(layerId);
                    if (!layer) return null;
                    return (
                      <div key={layerId} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.4rem", borderRadius: "5px", border: `1px solid ${layer.color}20`, background: `${layer.color}05` }}>
                        <span style={{ fontSize: "0.6rem", fontFamily: "ui-monospace,monospace", padding: "0.1rem 0.3rem", borderRadius: "3px", background: `${layer.color}15`, color: layer.color }}>L{layer.number}</span>
                        <span style={{ fontSize: "0.7rem", color: layer.color, fontWeight: 600 }}>{layer.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>Maps Up To</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: `${pp.color}cc`, marginBottom: "0.4rem" }}>Playbook domains</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {pp.playbookDomains.map((domainTitle) => {
                    const d = domainByTitle(domainTitle);
                    if (!d) return null;
                    return (
                      <div key={domainTitle} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.4rem", borderRadius: "5px", border: `1px solid ${d.color}20`, background: `${d.color}05` }}>
                        <span style={{ fontSize: "0.6rem", fontFamily: "ui-monospace,monospace", padding: "0.1rem 0.3rem", borderRadius: "3px", background: `${d.color}15`, color: d.color }}>D{d.n}</span>
                        <span style={{ fontSize: "0.7rem", color: d.color, fontWeight: 600 }}>{d.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Capabilities footer */}
            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: `1px solid ${pp.color}10` }}>
              <div style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", marginBottom: "0.4rem" }}>What ships</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem" }}>
                {pp.capabilities.map((cap) => (
                  <div key={cap} style={{ display: "flex", alignItems: "flex-start", gap: "0.3rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: pp.color, flexShrink: 0, marginTop: "0.45rem" }} />
                    {cap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Governance chassis */}
      <div className="hb-rich-card" style={{ borderColor: `${chassis.color}30` }}>
        <div className="hb-rich-card-bar" style={{ background: `linear-gradient(90deg, ${chassis.color}, ${chassis.color}30, transparent)` }} />
        <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.25em", color: `${chassis.color}80`, fontFamily: "ui-monospace,monospace", marginBottom: "0.25rem" }}>{chassis.tag}</div>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", marginBottom: "0.35rem" }}>{chassis.name}. <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>Not a feature. The foundation.</span></h3>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{chassis.description}</p>
      </div>

      {/* Install manual */}
      <div className="hb-rich-card" style={{ borderColor: `${installManual.color}30` }}>
        <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.25em", color: `${installManual.color}aa`, fontFamily: "ui-monospace,monospace", marginBottom: "0.25rem" }}>{installManual.tag}</div>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", marginBottom: "0.35rem" }}>
          {installManual.name}. <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>The 30 / 90 / 180 install protocol.</span>
        </h3>
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "0.5rem" }}>{installManual.description}</p>
        <a href={installManual.href} target="_blank" rel="noopener noreferrer" className="hb-rich-link" style={{ color: `${installManual.color}dd` }}>
          Visit {installManual.domain} →
        </a>
      </div>
    </div>
  );
}

// ─── Compare module ────────────────────────────────────────────────────────────

type ThreatLevel = "HIGH" | "HIGH WILDCARD" | "MEDIUM-HIGH" | "MEDIUM";

const THREAT_COLORS_MAP: Record<ThreatLevel, string> = {
  HIGH: "#ef4444",
  "HIGH WILDCARD": "#f97316",
  "MEDIUM-HIGH": "#f59e0b",
  MEDIUM: "#64748b",
};

const COMPETITORS_DATA = [
  { id: "microsoft", name: "Microsoft", tagline: "Agent 365 + Entra + Purview", threat: "HIGH" as ThreatLevel, strongest: "Distribution. Agent 365 is an explicit control plane for any agents an organization uses. Entra handles identity. Purview handles governance.", gap: "Scope and speed. Setup complexity is enterprise-grade. An SMB operator doesn't spin up Purview in a day.", pricing: "~$1M+ per year all-in for an enterprise deployment." },
  { id: "salesforce", name: "Salesforce", tagline: "Agentforce", threat: "MEDIUM" as ThreatLevel, strongest: "CRM integration. If your company runs on Salesforce, agents have access to every account and contact record without integration work.", gap: "Lock-in and scope. Agentforce agents live inside Salesforce. No cross-vendor model orchestration.", pricing: "~$850K+ per year all-in for an enterprise deployment." },
  { id: "workday", name: "Workday", tagline: "ASOR: Agent System of Record", threat: "HIGH" as ThreatLevel, strongest: "Positioning language. Agents managed as part of the organizational structure alongside employees. Closest verbatim match to what Level9OS is building.", gap: "ASOR is HR and Finance system governance. No voice interface, no executive coaching, no multi-vendor knowledge management.", pricing: "~$500K+ per year all-in for a mid-market deployment." },
  { id: "anthropic", name: "Anthropic", tagline: "Claude Managed Agents", threat: "MEDIUM-HIGH" as ThreatLevel, strongest: "Model quality. Native orchestration layer if you're already deploying Claude.", gap: "Walled garden. Claude Managed Agents governs Claude agents only. Multi-vendor deployments are outside the governance boundary.", pricing: "API-usage-based. $500 to $5,000 per month depending on volume." },
  { id: "glean", name: "Glean", tagline: "Enterprise knowledge platform", threat: "MEDIUM" as ThreatLevel, strongest: "$200M in ARR. Solved the indexing and permissioning problem well. Permission-aware search and Skills framework.", gap: "Category. Glean is a knowledge platform that added agents. No voice interface, no department wrappers.", pricing: "Mid-to-high five-figure annual contracts for SMB, six-figure for enterprise." },
  { id: "humans", name: "Humans&", tagline: "Stealth · $480M Seed Round", threat: "HIGH WILDCARD" as ThreatLevel, strongest: "$480M seed at $4.48B valuation. The thesis directly overlaps with the Level9OS workforce framing.", gap: "Nothing is public. The right read: this is a clock, not a competitor profile.", pricing: "Unknown. Pre-launch." },
];

const COMPARE_TABLE_ROWS = [
  { label: "Annual cost", ms: "~$1M+", sf: "~$850K+", wd: "~$500K+", an: "Usage-based", l9: "SMB-first pricing" },
  { label: "Sales cycle", ms: "6-18 months", sf: "6-12 months", wd: "6-18 months", an: "Self-serve", l9: "24 hours to first agent live" },
  { label: "Lock-in", ms: "High", sf: "High", wd: "High", an: "Medium", l9: "Low (multi-vendor)" },
  { label: "Multi-vendor AI", ms: "Partial", sf: "No", wd: "No", an: "No (Claude-only)", l9: "Yes (core design principle)" },
  { label: "Built for SMB", ms: "No", sf: "No", wd: "No", an: "Partially", l9: "Yes" },
  { label: "Human+AI governance", ms: "No", sf: "No", wd: "Partial (HR only)", an: "No", l9: "Yes" },
];

function CompareModule() {
  const [openComp, setOpenComp] = useState<string | null>(null);

  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#8b5cf6" }}>Market Analysis</div>
      <h2 className="hb-rich-headline">Who else is in this space. And where we actually stand.</h2>
      <p className="hb-rich-sub">Mapped 70+ vendors across 8 capability layers. Seven real competitors. Honest read on each.</p>

      {/* Three pillars */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Three things that separate a production-grade AI operation from a demo</div>
      <div className="hb-rich-stack" style={{ marginBottom: "1rem" }}>
        {[
          { num: "01", title: "Multi-Step Orchestration", color: "#8b5cf6", def: "Connect Claude, GPT, Gemini, Copilot, or custom agents into a single workflow. One control plane, one audit trail, one cost dashboard running across all of them." },
          { num: "02", title: "Cross-Agent Governance", color: "#ef4444", def: "An audit trail, cost controls, identity management, and quality gates that run under every agent regardless of which vendor built it." },
          { num: "03", title: "Department-Level Wrappers", color: "#f59e0b", def: "A complete operating structure for a business function. One human manager. Shared governance. Autonomous agent pods running the work." },
        ].map((p) => (
          <div key={p.num} className="hb-rich-card" style={{ borderColor: `${p.color}20` }}>
            <div className="hb-rich-card-bar" style={{ background: p.color }} />
            <div style={{ fontSize: "0.65rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: `${p.color}80`, marginBottom: "0.25rem" }}>Pillar {p.num}</div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: "0.35rem" }}>{p.title}</h4>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{p.def}</p>
          </div>
        ))}
      </div>

      {/* Competitor accordions */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Seven real competitors. Honest read on each.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
        {COMPETITORS_DATA.map((comp) => {
          const isOpen = openComp === comp.id;
          const threatColor = THREAT_COLORS_MAP[comp.threat];
          return (
            <div key={comp.id} style={{ borderRadius: "10px", overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                style={{ width: "100%", textAlign: "left", padding: "0.7rem 0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", background: "none", border: "none", cursor: "pointer", color: "inherit", fontFamily: "inherit" }}
                onClick={() => setOpenComp(isOpen ? null : comp.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{comp.name}</span>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>{comp.tagline}</span>
                  <span style={{ flexShrink: 0, fontSize: "0.6rem", fontFamily: "ui-monospace,monospace", padding: "0.15rem 0.4rem", borderRadius: "4px", background: `${threatColor}12`, border: `1px solid ${threatColor}35`, color: threatColor }}>
                    {comp.threat}
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "none" }}>→</span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 0.875rem 0.875rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", paddingTop: "0.75rem" }}>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: "#10b981", marginBottom: "0.25rem" }}>Their strongest claim</div>
                      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{comp.strongest}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: "#ef4444", marginBottom: "0.25rem" }}>The gap</div>
                      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{comp.gap}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "0.2rem" }}>Pricing posture</div>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>{comp.pricing}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>The honest comparison table</div>
      <div style={{ overflowX: "auto", marginBottom: "0.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem", minWidth: "480px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(139,92,246,0.35)" }}>
              <th style={{ textAlign: "left", padding: "0.4rem 0.5rem", color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: "0.65rem" }}>Capability</th>
              {["Microsoft", "Salesforce", "Workday", "Anthropic", "Level9OS"].map((col) => (
                <th key={col} style={{ textAlign: "left", padding: "0.4rem 0.5rem", color: col === "Level9OS" ? "#8b5cf6" : "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: "0.65rem" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_TABLE_ROWS.map((row, ri) => (
              <tr key={row.label} style={{ borderBottom: ri < COMPARE_TABLE_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <td style={{ padding: "0.45rem 0.5rem", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{row.label}</td>
                {[row.ms, row.sf, row.wd, row.an, row.l9].map((val, i) => (
                  <td key={i} style={{ padding: "0.45rem 0.5rem", color: i === 4 ? "#8b5cf6" : "rgba(255,255,255,0.45)", fontWeight: i === 4 ? 600 : 400 }}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", fontFamily: "ui-monospace,monospace" }}>Pricing figures are indicative ranges from market research. Not contractual.</p>

      {/* Market timing */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)", marginTop: "0.75rem" }}>Market Timing</div>
      <div className="hb-rich-card" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "0.5rem" }}>
          The research puts likely consolidation at Q4 2027 at the earliest. The window before a well-funded stealth player ships is months, not years.
        </p>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
          This window is open. Level9OS is building the architecture. We&apos;re not waiting for a distribution deal to close.
        </p>
      </div>
    </div>
  );
}

// ─── Walkthroughs module ──────────────────────────────────────────────────────

// TODO: ElevenLabs voice render in operator's clone, pending approval.

const WALKTHROUGH_SCENES = {
  "30s": [
    {
      id: "pain",
      label: "The Pain",
      bg: "#ef4444",
      headline: "Most AI tools add agents.",
      body: "None of them govern them.",
      caption: "Most AI tools add agents. None of them govern them.",
    },
    {
      id: "proof",
      label: "The Proof",
      bg: "#8b5cf6",
      headline: "236 hours.",
      body: "Operator time returned in 90 days from governance catching what agents got wrong.",
      caption: "236 hours. That's operator time we returned in 90 days, just from governance catching what agents got wrong.",
    },
    {
      id: "product",
      label: "What We Do",
      bg: "#06b6d4",
      headline: "One control plane.",
      body: "Every agent. Every vendor. Every workflow. Built for a 10 to 50 person company.",
      caption: "Level9OS is your AI operating system. One control plane for every agent, every vendor, every workflow. Built for a 10 to 50 person company that can't afford to learn this the hard way.",
    },
    {
      id: "cta",
      label: "The CTA",
      bg: "#10b981",
      headline: "Your first AI operating system.",
      body: "Or your last one.",
      caption: "Your first AI operating system. Or your last one. Start at level9os.com.",
    },
  ],
  "1m30": [
    {
      id: "pain",
      label: "The Pain",
      bg: "#ef4444",
      headline: "You've introduced an agent.",
      body: "Maybe a few. They're running.",
      caption: "You've introduced an agent. Maybe a few. They're running.",
    },
    {
      id: "problem",
      label: "The Problem",
      bg: "#f59e0b",
      headline: "They're claiming done.",
      body: "When the work isn't done. Reversing mid-task. Burning your best model on work that costs a tenth as much.",
      caption: "Here's what's actually happening: they're claiming done when the work isn't done. They're reversing mid-task. They're burning your best model on work that costs a tenth as much somewhere else. And you won't know until something breaks.",
    },
    {
      id: "numbers",
      label: "The Numbers",
      bg: "#8b5cf6",
      headline: "$52,686 prevented. $5.07/mo.",
      body: "236 hours returned. 3,464x ROI. Not a projection. Production data.",
      caption: "236 hours of operator time returned in 90 days. Up to $17,562 a month in prevented rework. Governance infrastructure running at $5.07 a month. That's not a projection. That's our production environment.",
    },
    {
      id: "bridge",
      label: "The Architecture",
      bg: "#06b6d4",
      headline: "Plug any agent.",
      body: "Claude, GPT, Gemini. One control plane. One audit trail. No lock-in.",
      caption: "Plug any agent. Claude, GPT, Gemini. One control plane. One audit trail. No lock-in.",
    },
    {
      id: "hook",
      label: "The Hook",
      bg: "#10b981",
      headline: "Introduce an agent. Give it a day.",
      body: "It comes back and walks you through what it found. That's the demo.",
      caption: "The GTM hook we ship to every customer: introduce an agent. Give it access. Give it a day. It comes back and walks you through what it found.",
    },
    {
      id: "cta",
      label: "CTA",
      bg: "#ec4899",
      headline: "Your first AI operating system.",
      body: "Or your last one. level9os.com",
      caption: "Your first AI operating system. Or your last one. level9os.com.",
    },
  ],
  "5min": [
    {
      id: "pain",
      label: "The Pain",
      bg: "#ef4444",
      headline: "You approved the work.",
      body: "The agent said it was done. Three days later, your team found the failure.",
      caption: "You've approved the work. The agent says it's done. You move on. Three days later, someone on your team finds the failure. The agent never finished. It just told you it did.",
    },
    {
      id: "proof",
      label: "The Data",
      bg: "#f59e0b",
      headline: "26% lie rate.",
      body: "In 299 real production sessions over 90 days. One in four done-claims was wrong.",
      caption: "In 299 real production sessions over 90 days, we measured a 26% lie rate from our own AI agents. One in four done-claims was wrong.",
    },
    {
      id: "operator",
      label: "Who We're For",
      bg: "#8b5cf6",
      headline: "10 to 50 people.",
      body: "Not a thousand-person enterprise. The operator who has real AI running and no system around it yet.",
      caption: "We're an AI operating system for companies between 10 and 50 people. The operator who's already running AI. Who has 3, 5, maybe 10 agents active. And no real system governing any of them.",
    },
    {
      id: "competition",
      label: "The Competition",
      bg: "#64748b",
      headline: "$1M vs $499/mo.",
      body: "Microsoft Agent 365: ~$1M/yr. Salesforce Agentforce: ~$850K/yr. Level9OS: $499/mo.",
      caption: "Microsoft Agent 365 runs close to $1 million a year. Salesforce Agentforce, around $850,000. Workday ASOR, $500,000 and it doesn't leave the HR and finance lane. Level9OS is $499 a month. And it's not locked to one vendor.",
    },
    {
      id: "numbers",
      label: "The Numbers",
      bg: "#06b6d4",
      headline: "$52,686. 236 hrs. $5.07.",
      body: "3,464x return. Production data. Not projections.",
      caption: "In 90 days: $52,686 in prevented rework. Monthly run rate: $17,562 in costs we didn't pay. Operator time returned: 236 hours in 90 days. Cost of the governance system: $5.07 a month.",
    },
    {
      id: "product",
      label: "The Product",
      bg: "#8b5cf6",
      headline: "18 governance services.",
      body: "Truth enforcement. Cost control. Identity + access. Running from the first agent action.",
      caption: "The governance layer is not a feature on top of the product. It's the foundation the whole system runs on. 18 services across truth enforcement, budget control, and identity management.",
    },
    {
      id: "compare",
      label: "Competitive Demolition",
      bg: "#ef4444",
      headline: "They govern their own agents.",
      body: "We govern all of them. Multi-vendor. No lock-in.",
      caption: "Multi-vendor AI governance and management platform. Plug any agent. Claude. GPT-4. Gemini. A custom-built model. One control plane. One audit trail.",
    },
    {
      id: "window",
      label: "The Window",
      bg: "#f59e0b",
      headline: "12 to 18 months.",
      body: "Microsoft, Salesforce, Anthropic, Workday are all moving. The window before consolidation is months, not years.",
      caption: "The window here is 12 to 18 months. By late 2027, one or two of them will consolidate the category. We're building for the operators who don't want to wait.",
    },
    {
      id: "cta",
      label: "CTA",
      bg: "#10b981",
      headline: "Your first AI operating system.",
      body: "Or your last one. We'll show you what's actually running.",
      caption: "Your first AI operating system. Or your last one. level9os.com. We'll show you what's actually running.",
    },
  ],
};

type WalkthroughId = "30s" | "1m30" | "5min";

function WalkthroughPlayer({ id, onClose }: { id: WalkthroughId; onClose: () => void }) {
  const scenes = WALKTHROUGH_SCENES[id];
  const [scene, setScene] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const durations: Record<WalkthroughId, number> = { "30s": 7500, "1m30": 15000, "5min": 33000 };
  const sceneDuration = Math.round(durations[id] / scenes.length);

  useEffect(() => {
    if (!autoplay) return;
    if (scene >= scenes.length - 1) { setAutoplay(false); return; }
    const t = setTimeout(() => setScene((s) => s + 1), sceneDuration);
    return () => clearTimeout(t);
  }, [autoplay, scene, scenes.length, sceneDuration]);

  const current = scenes[scene];

  return (
    <div className="hb-walkthrough-player">
      {/* Scene */}
      <div
        className="hb-wt-scene"
        key={scene}
        style={{ background: `${current.bg}12`, borderColor: `${current.bg}30` }}
      >
        <div className="hb-wt-scene-label" style={{ color: current.bg }}>{current.label}</div>
        <div className="hb-wt-headline" style={{ color: "rgba(255,255,255,0.92)" }}>{current.headline}</div>
        <div className="hb-wt-body">{current.body}</div>
        {/* Waveform placeholder */}
        <div className="hb-wt-waveform-wrap">
          <div className="hb-wt-waveform" style={{ borderColor: `${current.bg}25` }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="hb-wt-bar"
                style={{
                  height: `${10 + Math.abs(Math.sin(i * 0.9 + scene * 0.7)) * 22}px`,
                  background: current.bg,
                  animationDelay: `${i * 0.04}s`,
                  animationPlayState: autoplay ? "running" : "paused",
                }}
              />
            ))}
          </div>
          <div className="hb-wt-pending">Voice render pending operator approval</div>
        </div>
        {/* Caption */}
        <div className="hb-wt-caption">&ldquo;{current.caption}&rdquo;</div>
      </div>

      {/* Controls */}
      <div className="hb-wt-controls">
        <button className="hb-wt-nav" onClick={() => setScene((s) => Math.max(0, s - 1))} disabled={scene === 0}>
          ←
        </button>
        <div className="hb-wt-dots">
          {scenes.map((_, i) => (
            <button
              key={i}
              className={`hb-wt-dot ${i === scene ? "active" : ""}`}
              style={i === scene ? { background: current.bg } : {}}
              onClick={() => { setScene(i); setAutoplay(false); }}
            />
          ))}
        </div>
        <button className="hb-wt-nav" onClick={() => setScene((s) => Math.min(scenes.length - 1, s + 1))} disabled={scene === scenes.length - 1}>
          →
        </button>
        <button
          className="hb-wt-play"
          style={{ borderColor: `${current.bg}40`, color: current.bg }}
          onClick={() => setAutoplay(!autoplay)}
        >
          {autoplay ? "■ Stop" : "▶ Auto-play"}
        </button>
      </div>
      <div className="hb-wt-progress">
        {scene + 1} / {scenes.length}
      </div>

      <button className="hb-wt-close" onClick={onClose}>← Back to walkthroughs</button>
    </div>
  );
}

function WalkthroughsModule() {
  const [selected, setSelected] = useState<WalkthroughId | null>(null);

  if (selected) {
    return <WalkthroughPlayer id={selected} onClose={() => setSelected(null)} />;
  }

  const options: { id: WalkthroughId; label: string; time: string; desc: string; color: string }[] = [
    { id: "30s", label: "Quick walkthrough", time: "30 sec", desc: "The number. The cost. The ROI. Done.", color: "#ef4444" },
    { id: "1m30", label: "Product walkthrough", time: "1:30", desc: "Four categories, full math, one CTA.", color: "#8b5cf6" },
    { id: "5min", label: "Full pitch", time: "5 min", desc: "Full operator briefing. Architecture, proof, onboarding.", color: "#ec4899" },
  ];

  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#ec4899" }}>Walkthroughs</div>
      <h2 className="hb-rich-headline">Three depths. Pick how far you want to go.</h2>
      <p className="hb-rich-sub">Each walkthrough is scroll-driven. Captions from the pitch scripts verbatim. Voice render pending operator approval.</p>
      <div className="hb-wt-picker">
        {options.map((opt) => (
          <button
            key={opt.id}
            className="hb-wt-card"
            style={{ borderColor: `${opt.color}25`, "--wt-color": opt.color } as React.CSSProperties}
            onClick={() => setSelected(opt.id)}
          >
            <div className="hb-wt-card-bar" style={{ background: opt.color }} />
            <div className="hb-wt-card-time" style={{ color: opt.color }}>{opt.time}</div>
            <div className="hb-wt-card-label">{opt.label}</div>
            <div className="hb-wt-card-desc">{opt.desc}</div>
            <div className="hb-wt-card-cta" style={{ color: opt.color }}>Start →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── HowExplainer component ────────────────────────────────────────────────────

function HowExplainer({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hb-how-wrap">
      <button className="hb-how-btn" onClick={() => setOpen(!open)}>
        {open ? "↑ Close" : `${label ?? "How?"}`}
      </button>
      {open && (
        <div className="hb-how-panel">
          {children}
        </div>
      )}
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
      case "products": return <ProductsModule />;
      case "governance": return <GovernanceModule />;
      case "paths": return <PathsModule />;
      case "wrappers": return <WrappersModule />;
      case "about": return <AboutModule />;
      case "architecture": return <ArchitectureModule />;
      case "compare": return <CompareModule />;
      case "walkthroughs": return <WalkthroughsModule />;
      default: {
        setErrored(true);
        return null;
      }
    }
  })();

  return <div className="hb-module-reveal">{content}</div>;
}

// ─── State helpers ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "level9os.homepage.v1";

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
    const partial = s as Partial<ConversationState>;
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
      engagementLevel: partial.engagementLevel ?? 0,
      lastPlayfulLabel: partial.lastPlayfulLabel,
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

  // Group A (continued): deep dives into new rich modules
  {
    id: "deep-products",
    label: "Want the full product catalog: Core, Plugins, and Wrappers?",
    group: "A",
    requiresModule: "products",
    opensModule: "products",
  },
  {
    id: "deep-governance",
    label: "Want to see the 18-service governance chassis that runs under everything?",
    group: "A",
    requiresModule: "governance",
    opensModule: "governance",
  },
  {
    id: "deep-paths",
    label: "Want to see the 30/90/180-day methodology behind each engagement path?",
    group: "A",
    requiresModule: "paths",
    opensModule: "paths",
  },
  {
    id: "deep-architecture",
    label: "Want the full 8-layer architecture breakdown and how each layer maps to a pressure point?",
    group: "A",
    requiresModule: "architecture",
    opensModule: "architecture",
  },

  // Group B (continued): specific angles for new modules
  {
    id: "angle-products-catalog",
    label: "Want to see what each product actually does? Full catalog with the problem and answer for each.",
    group: "B",
    opensModule: "products",
  },
  {
    id: "angle-governance-vault",
    label: "What does The Vault look like in practice? It is the chassis that runs under every product.",
    group: "B",
    opensModule: "governance",
  },
  {
    id: "angle-compare-market",
    label: "How does Level9OS actually sit relative to other AI platforms? We mapped it out.",
    group: "B",
    opensModule: "compare",
  },
  {
    id: "angle-about-company",
    label: "Who is behind Level9OS? The origin story is short and the reason we built it is specific.",
    group: "B",
    opensModule: "about",
  },
  {
    id: "angle-paths-entry",
    label: "There are three ways into Level9OS. Want to see which one fits where you are right now?",
    group: "B",
    opensModule: "paths",
  },
  {
    id: "angle-wrappers-pods",
    label: "The OutboundOS pods hit different parts of the revenue motion. Want to see how they split?",
    group: "B",
    opensModule: "wrappers",
  },

  // Group D (continued): reveal prompts for new modules
  {
    id: "reveal-architecture-layers",
    label: "Did you know there are 8 operating layers between a pressure point and a deployed product? Want to see the stack?",
    group: "D",
    opensModule: "architecture",
  },
  {
    id: "reveal-compare-ai-wrapper",
    label: "Most AI platforms are wrappers. Level9OS is different. Want to see exactly how we positioned that?",
    group: "D",
    opensModule: "compare",
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

  // Group F: playful pop culture openers — rotate in the 4th chip slot, never repeat back-to-back
  {
    id: "f-show-money",
    label: "Show me the money.",
    group: "F",
    opensModule: "counter",
  },
  {
    id: "f-receipts",
    label: "I have the receipts.",
    group: "F",
    opensModule: "article",
  },
  {
    id: "f-houston",
    label: "Houston, we have a problem.",
    group: "F",
    opensModule: "live-feed",
  },
  {
    id: "f-whats-in-box",
    label: "What is in the box?",
    group: "F",
    opensModule: "governance",
  },
  {
    id: "f-ill-be-back",
    label: "I'll be back.",
    group: "F",
    action: "cta-person",
  },
  {
    id: "f-pod-bay",
    label: "Open the pod bay doors.",
    group: "F",
    opensModule: "wrappers",
  },
  {
    id: "f-roll-tape",
    label: "Roll the tape.",
    group: "F",
    opensModule: "voice-pitch",
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

export default function ConversationHomepage() {
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
  // Upgrade 1 + 2 + engagement ladder
  const [closedTabs, setClosedTabs] = useState<ModuleId[]>([]);
  const [poolHistory, setPoolHistory] = useState<string[]>([]);
  const [lastGroupShown, setLastGroupShown] = useState<PoolGroup | undefined>(undefined);
  const [engagementLevel, setEngagementLevel] = useState(0);
  const [lastPlayfulLabel, setLastPlayfulLabel] = useState<string | undefined>(undefined);
  const lastVisitorActivity = useRef<number>(Date.now());

  const [freeText, setFreeText] = useState("");
  const [freeTextPending, setFreeTextPending] = useState(false);
  const freeTextCallCount = useRef(0);
  const MAX_FREE_TEXT_CALLS = 20;

  const [paletteOpen, setPaletteOpen] = useState(false);

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

  // Phase B: sync URL ?surface= param on activeModule change
  useEffect(() => {
    if (visitorState !== "dashboard") return;
    const url = new URL(window.location.href);
    if (activeModule) {
      url.searchParams.set("surface", activeModule);
    } else {
      url.searchParams.delete("surface");
    }
    window.history.replaceState(null, "", url.toString());
  }, [activeModule, visitorState]);

  // Init
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Phase B: read ?surface= deep-link param
    const urlSurface = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("surface")
      : null;
    const validSurface = urlSurface && Object.keys(MODULE_META).includes(urlSurface)
      ? (urlSurface as ModuleId)
      : null;

    const saved = loadState();

    // Phase B: ?surface= deep-link boots directly to dashboard with module open
    if (validSurface) {
      setVisitorState("dashboard");
      const baseModules = saved?.unlockedModules.length
        ? saved.unlockedModules
        : SKIP_DEFAULT_TABS;
      const withSurface = baseModules.includes(validSurface)
        ? baseModules
        : [...baseModules, validSurface];
      setUnlockedModules(withSurface);
      setActiveModule(validSurface);
      if (saved?.messages.length) setMessages(saved.messages);
      if (saved?.closedTabs?.length) setClosedTabs(saved.closedTabs);
      if (saved?.poolHistory?.length) setPoolHistory(saved.poolHistory);
      agentSay(
        `Opening ${MODULE_META[validSurface].label} for you. Let me know if you want to dig into anything else.`,
        300
      );
      return;
    }

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
      if (saved.engagementLevel) setEngagementLevel(saved.engagementLevel);
      if (saved.lastPlayfulLabel) setLastPlayfulLabel(saved.lastPlayfulLabel);
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
      engagementLevel,
      lastPlayfulLabel,
    });
  }, [messages, unlockedModules, activeModule, userAnswers, isSkipped, closedTabs, poolHistory, engagementLevel, lastPlayfulLabel]);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
        engagementLevel,
        lastPlayfulLabel,
      });
    } catch {
      // ignore
    }
  }, [messages, userAnswers, agentSay, closedTabs, poolHistory, engagementLevel, lastPlayfulLabel]);

  // Track visitor activity to implement "shut up while engaging" rule
  const recordActivity = useCallback(() => {
    lastVisitorActivity.current = Date.now();
  }, []);

  // Add pool prompt to history (keep last 10)
  const recordPoolShown = useCallback((ids: string[], group?: PoolGroup) => {
    setPoolHistory((prev) => [...ids, ...prev].slice(0, 10));
    if (group) setLastGroupShown(group);
  }, []);

  // ── Keyword router ────────────────────────────────────────────────────────────
  const KEYWORD_MAP: Array<{ patterns: string[]; moduleId: ModuleId; anchor?: string }> = [
    { patterns: ["cost", "save", "saving", "pricing", "price"], moduleId: "calculator" },
    { patterns: ["compare", "alternative", "versus", " vs ", "competitor"], moduleId: "compare" },
    { patterns: ["audit", "log", "trail", "events", "feed"], moduleId: "live-feed" },
    { patterns: ["article", "read", "story", "case study"], moduleId: "article" },
    { patterns: ["voice", "listen", "audio", "pitch", "MAX", "talk to my operation"], moduleId: "voice-pitch" },
    { patterns: ["number", "roi", "saving", "52686", "52,686"], moduleId: "counter" },
    { patterns: ["wrapper", "outbound", "finance", "sales"], moduleId: "wrappers" },
    { patterns: ["product", "catalog", "what do you build", "what you build"], moduleId: "products" },
    { patterns: ["lie detector", "lying", "fact check", "auto doc", "library", "documentation", "trust score", "promotion", "officer", "CoS", "COO", "management team"], moduleId: "governance" },
    { patterns: ["governance", "vault", "compliance", "soc2", "security", "policy"], moduleId: "governance" },
    { patterns: ["path", "start", "how to start", "onboard", "get started", "first step"], moduleId: "paths" },
    { patterns: ["about", "who are you", "company", "team", "history", "founded"], moduleId: "about" },
    { patterns: ["architecture", "how it works", "layers", "stack", "pressure point", "design"], moduleId: "architecture" },
  ];

  const keywordRoute = useCallback(
    (input: string): ModuleId | null => {
      const lower = input.toLowerCase();
      for (const { patterns, moduleId } of KEYWORD_MAP) {
        if (patterns.some((p) => lower.includes(p.toLowerCase()))) {
          return moduleId;
        }
      }
      return null;
    },
    // KEYWORD_MAP is stable (module-level const)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFreeText = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;
      setFreeText("");
      recordActivity();

      // Check session limit
      if (freeTextCallCount.current >= MAX_FREE_TEXT_CALLS) {
        addMessage({ role: "user", content: trimmed });
        await agentSay(
          "I'm hitting my limit on this thread. Want me to introduce you to someone? biz@erichathaway.com. Eric runs the product.",
          200
        );
        return;
      }

      // Check CTA intent
      const ctaKeywords = ["talk to person", "human", "contact", "demo", "talk to a person"];
      if (ctaKeywords.some((k) => trimmed.toLowerCase().includes(k))) {
        addMessage({ role: "user", content: trimmed });
        await agentSay(
          "Contact Eric directly at biz@erichathaway.com. He runs the product. He is the customer. He can answer anything because he lived these numbers.",
          200
        );
        return;
      }

      // Try keyword routing first
      const routed = keywordRoute(trimmed);
      if (routed) {
        addMessage({ role: "user", content: trimmed });
        if (closedTabs.includes(routed)) {
          setClosedTabs((prev) => prev.filter((m) => m !== routed));
        }
        await agentSay(MODULE_META[routed].agentIntro, 200);
        await revealModule(routed, visitorState);
        return;
      }

      // Haiku fallback
      addMessage({ role: "user", content: trimmed });
      setFreeTextPending(true);
      freeTextCallCount.current += 1;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            thread_context: {
              messages: messages.slice(-3).map((m) => ({ role: m.role, content: m.content })),
              unlockedModules,
            },
          }),
        });

        setFreeTextPending(false);

        if (!res.ok) {
          await agentSay("I can't process free-text right now. Pick one of the suggested replies above.", 100);
          return;
        }

        const data = await res.json();

        if (data.error) {
          await agentSay(data.error, 100);
          return;
        }

        await agentSay(data.reply ?? "Good question. Let me think on that.", 100);

        if (data.route_to_intake) {
          await agentSay("Contact Eric at biz@erichathaway.com for a direct answer.", 300);
          return;
        }

        if (data.suggested_module) {
          // Map snake_case back to kebab-case ModuleId
          const snakeToKebab: Record<string, ModuleId> = {
            live_feed: "live-feed",
            voice_pitch: "voice-pitch",
            wrapper_story: "wrapper-story",
            counter: "counter",
            calculator: "calculator",
            comparison: "comparison",
            article: "article",
            products: "products",
            governance: "governance",
            paths: "paths",
            wrappers: "wrappers",
            about: "about",
            architecture: "architecture",
            compare: "compare",
          };
          const targetId = snakeToKebab[data.suggested_module] ?? data.suggested_module as ModuleId;
          if (MODULE_META[targetId]) {
            if (closedTabs.includes(targetId)) {
              setClosedTabs((prev) => prev.filter((m) => m !== targetId));
            }
            await revealModule(targetId, visitorState);
          }
        }
      } catch {
        setFreeTextPending(false);
        await agentSay("I can't process free-text right now. Pick one of the suggested replies above.", 100);
      }
    },
    [addMessage, agentSay, revealModule, messages, unlockedModules, visitorState,
     closedTabs, keywordRoute, recordActivity]
  );

  const handleReply = useCallback(
    async (replyId: string, replyLabel: string) => {
      recordActivity();
      // Increment engagement ladder on every chip click
      setEngagementLevel((prev) => prev + 1);

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

      // Yes/no engagement ladder responses
      if (replyId.startsWith("yn-") || replyId.startsWith("guess-")) {
        addMessage({ role: "user", content: replyLabel });
        const responses: Record<string, string> = {
          "yn-multi-vendor": "Multi-vendor setups get more from the routing layer. The governance trail unifies them. Want to see how the routing policy works?",
          "yn-existing-stack": "Most teams have audit logging. What they don't have is enforcement before the action. That is the gap we close.",
          "yn-growth-stage": "Growth-stage is the sweet spot. One agent pod live in 24 hours. Governance on from day one, not bolted on later.",
          "guess-growth-stage": "Growth-stage teams get the most leverage here. First pod deployed inside a week. Want to see the startup path?",
        };
        const fallback = "Good. That context changes the entry point. Want me to pull up the path that fits?";
        await agentSay(responses[replyId] ?? fallback, 200);
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
        // Track playful chip for rotation
        if (poolPrompt.group === "F") {
          setLastPlayfulLabel(replyLabel);
        }

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
            "f-ill-be-back": "Eric runs the product. He is also the customer. Contact him at biz@erichathaway.com.",
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

  // Build palette items from module metadata + content pool
  const paletteItems: PaletteItem[] = [
    ...MODULE_ORDER.map((m) => ({
      id: `module:${m}`,
      label: MODULE_META[m].label,
      description: MODULE_META[m].agentIntro,
      section: "modules" as const,
    })),
    ...CONTENT_POOL.map((p) => ({
      id: `prompt:${p.id}`,
      label: p.label,
      section: "prompts" as const,
    })),
  ];

  const handlePaletteSelect = useCallback(
    (item: PaletteItem) => {
      if (item.section === "modules") {
        const moduleId = item.id.replace("module:", "") as ModuleId;
        handleReply(moduleId, MODULE_META[moduleId].suggestedReply);
      } else {
        const promptId = item.id.replace("prompt:", "");
        const prompt = CONTENT_POOL.find((p) => p.id === promptId);
        if (prompt) handleReply(promptId, prompt.label);
      }
    },
    [handleReply]
  );

  // ── Engagement-aware suggested replies ──────────────────────────────────────
  // Level 0-2: initial 4 chips (positional spec from Phase 1)
  // Level 3-5: slot 3 becomes a yes/no question from MAX
  // Level 6+:  slot 3 becomes a MAX guess prompt
  const INITIAL_4_CHIPS: { id: string; label: string }[] = [
    { id: "governance", label: "How does governance actually work?" },
    { id: "calculator", label: "How much would I save?" },
    { id: "compare", label: "Who else does this?" },
    { id: "f-show-money", label: "Show me the money." },
  ];
  const YES_NO_QUESTIONS: { id: string; label: string }[] = [
    { id: "yn-multi-vendor", label: "Are you on multiple AI vendors right now?" },
    { id: "yn-existing-stack", label: "Does your team already have an AI governance layer?" },
    { id: "yn-growth-stage", label: "Are you a growth-stage team (10-50 people)?" },
  ];
  const PLAYFUL_F_IDS = ["f-show-money", "f-receipts", "f-houston", "f-whats-in-box", "f-ill-be-back", "f-pod-bay", "f-roll-tape"];

  function pickPlayfulChip(exclude?: string): { id: string; label: string } {
    const pool = CONTENT_POOL.filter((p) => PLAYFUL_F_IDS.includes(p.id) && p.label !== exclude);
    const pick = pool[Math.floor(Date.now() / 1000) % pool.length] ?? pool[0];
    return { id: pick.id, label: pick.label };
  }

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

    // Fresh state (no modules unlocked yet): use the positional 4 chips with engagement ladder
    if (unlockedModules.length === 0 && !isSkipped) {
      const chips: { id: string; label: string; chipType?: ChipType }[] = [
        INITIAL_4_CHIPS[0],
        INITIAL_4_CHIPS[1],
        INITIAL_4_CHIPS[2],
      ];
      // Slot 4: engagement-aware
      if (engagementLevel >= 6) {
        // Level 6+: MAX guess
        chips.push({ id: "guess-growth-stage", label: "Looks like a growth-stage team. Right?" });
      } else if (engagementLevel >= 3) {
        // Level 3-5: yes/no question
        const q = YES_NO_QUESTIONS[engagementLevel % YES_NO_QUESTIONS.length];
        chips.push(q);
      } else {
        // Level 0-2: playful chip
        chips.push(pickPlayfulChip(lastPlayfulLabel));
      }
      return chips.slice(0, 4);
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
      {paletteOpen && (
        <SearchPalette
          items={paletteItems}
          onSelect={handlePaletteSelect}
          onClose={() => setPaletteOpen(false)}
        />
      )}

      {/* ── SPLASH STATE ── */}
      {visitorState === "splash" && (
        <div className="hb-splash">
          {/* HomeHeroSplash: mesh blobs + flash + ripples behind the chat card */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              overflow: "hidden",
            }}
          >
            <HomeHeroSplash anchorX="50%" anchorY="50%" />
          </div>

          {/* Ambient gradient orbs */}
          <div className="hb-orb hb-orb-violet" aria-hidden="true" />
          <div className="hb-orb hb-orb-fuchsia" aria-hidden="true" />
          <div className="hb-orb hb-orb-cyan" aria-hidden="true" />

          {/* Skip link + Cmd+K hint */}
          <button className="hb-skip-btn" onClick={handleSkip}>
            skip to site &#8594;
          </button>
          <button className="hb-cmdK-hint" onClick={() => setPaletteOpen(true)} title="Open search palette">
            <kbd>⌘K</kbd>
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
              <span className="hb-splash-variant-badge">Level9OS</span>
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

            <div className="hb-splash-replies">
              {!typing && suggestedReplies.length > 0 && (
                <>
                  <div className="hb-replies-label">Reply</div>
                  {suggestedReplies.map((r) => (
                    <button key={r.id} className="hb-reply" onClick={() => handleReply(r.id, r.label)}>
                      {r.label}
                    </button>
                  ))}
                </>
              )}
              <div className="hb-freetext-row">
                <input
                  className="hb-freetext-input"
                  type="text"
                  placeholder="Type anything or pick above."
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !freeTextPending) handleFreeText(freeText); }}
                  disabled={freeTextPending || typing}
                />
                <button
                  className="hb-freetext-send"
                  onClick={() => handleFreeText(freeText)}
                  disabled={freeTextPending || typing || !freeText.trim()}
                  aria-label="Send"
                >
                  {freeTextPending ? "..." : "↑"}
                </button>
              </div>
            </div>
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
            <span className="hb-topbar-badge">Level9OS</span>
            <button className="hb-cmdK-hint hb-cmdK-topbar" onClick={() => setPaletteOpen(true)} title="Search modules and prompts">
              <kbd>⌘K</kbd>
            </button>
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

              <div className="hb-chat-replies">
                {!typing && suggestedReplies.length > 0 && (
                  <>
                    <div className="hb-replies-label">Reply</div>
                    {suggestedReplies.map((r) => (
                      <button key={r.id} className="hb-reply" onClick={() => handleReply(r.id, r.label)}>
                        {r.label}
                      </button>
                    ))}
                  </>
                )}
                <div className="hb-freetext-row">
                  <input
                    className="hb-freetext-input"
                    type="text"
                    placeholder="Type anything or pick above."
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !freeTextPending) handleFreeText(freeText); }}
                    disabled={freeTextPending || typing}
                  />
                  <button
                    className="hb-freetext-send"
                    onClick={() => handleFreeText(freeText)}
                    disabled={freeTextPending || typing || !freeText.trim()}
                    aria-label="Send"
                  >
                    {freeTextPending ? "..." : "↑"}
                  </button>
                </div>
              </div>

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
    position: relative;
    z-index: 1;
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
    .hb-tab { min-height: 44px; }
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
  @media (max-width: 768px) {
    .hb-reply { min-height: 44px; display: flex; align-items: center; }
  }
  .hb-reply:hover {
    background: rgba(139,92,246,0.09);
    border-color: rgba(139,92,246,0.28);
    color: rgba(255,255,255,0.88);
  }

  /* ── Vault orbit ── */
  .hb-vault-orbit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin: 0.25rem 0 0.5rem;
  }
  .hb-vault-label {
    font-size: 0.62rem;
    font-family: ui-monospace,monospace;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(239,68,68,0.6);
  }
  .hb-vault-sublabel {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    font-size: 0.58rem;
    font-family: ui-monospace,monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.6;
  }
  .hb-vault-sublabel span { display: flex; align-items: center; gap: 0.25rem; }
  .hb-vault-sublabel span::before { content: "●"; font-size: 0.5rem; }

  /* ── Calculator bars ── */
  .hbcalc-bars {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin-bottom: 0.25rem;
  }
  .hbcalc-bar-row { display: flex; align-items: center; gap: 0.5rem; }
  .hbcalc-bar-label { font-size: 0.65rem; color: rgba(255,255,255,0.38); min-width: 120px; flex-shrink: 0; }
  .hbcalc-bar-track {
    flex: 1;
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    overflow: hidden;
  }
  .hbcalc-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
  }
  .hbcalc-bar-val {
    font-size: 0.7rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    min-width: 60px;
    text-align: right;
    flex-shrink: 0;
  }

  /* ── Live Feed timestamps + stamp animations ── */
  .hbfeed-ts {
    font-family: ui-monospace,monospace;
    font-size: 0.58rem;
    color: rgba(255,255,255,0.22);
    flex-shrink: 0;
    white-space: nowrap;
  }
  @keyframes hbfeed-enter {
    from { opacity: 0; transform: translateX(-6px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes hbfeed-stamp {
    0% { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
  @keyframes hbfeed-tick {
    0% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  /* ── Counter particle burst ── */
  .hbmc-burst {
    position: absolute;
    top: 1.5rem; left: 2rem;
    pointer-events: none;
    z-index: 10;
  }
  .hbmc-particle {
    position: absolute;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #ef4444;
    animation: hbmc-particle-fly 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
    transform-origin: 0 0;
    rotate: var(--angle);
  }
  @keyframes hbmc-particle-fly {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(-60px) scale(0.3); }
  }

  /* ── Interactive depth pass additions ── */
  /* Charter value cards: stagger fade in */
  .hb-charter-card {
    animation: hb-fade-in 0.5s ease both;
  }
  /* Product card hover glow */
  .hb-product-card {
    transition: box-shadow 0.25s ease, transform 0.2s cubic-bezier(0.16,1,0.3,1);
  }
  .hb-product-card:hover {
    box-shadow: 0 0 20px var(--pc, #8b5cf6)18;
    transform: translateY(-1px);
  }
  /* Comparison table row highlight already handled inline */
  /* Architecture: mild scale on pressure-point cards */
  .hb-arch-pp-card {
    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1);
    cursor: default;
  }
  .hb-arch-pp-card:hover { transform: scale(1.005); }

  /* ── Walkthrough module ── */
  .hb-wt-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  @media (max-width: 560px) { .hb-wt-picker { grid-template-columns: 1fr; } }
  .hb-wt-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid;
    border-radius: 12px;
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .hb-wt-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.15) !important; }
  .hb-wt-card-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .hb-wt-card-time { font-size: 1.4rem; font-weight: 900; letter-spacing: -0.02em; }
  .hb-wt-card-label { font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.85); }
  .hb-wt-card-desc { font-size: 0.72rem; color: rgba(255,255,255,0.42); line-height: 1.5; }
  .hb-wt-card-cta { font-size: 0.72rem; font-weight: 600; margin-top: 0.25rem; }
  .hb-walkthrough-player {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }
  .hb-wt-scene {
    border: 1px solid;
    border-radius: 14px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    animation: hb-module-reveal 0.3s cubic-bezier(0.16,1,0.3,1);
    min-height: 240px;
  }
  .hb-wt-scene-label {
    font-size: 0.58rem;
    font-family: ui-monospace,monospace;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
  .hb-wt-headline {
    font-size: clamp(1.1rem, 2.8vw, 1.5rem);
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .hb-wt-body { font-size: 0.83rem; color: rgba(255,255,255,0.58); line-height: 1.6; }
  .hb-wt-waveform-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin: 0.25rem 0;
  }
  .hb-wt-waveform {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 36px;
    padding: 0.35rem 0.5rem;
    border: 1px solid;
    border-radius: 8px;
    background: rgba(0,0,0,0.2);
  }
  .hb-wt-bar {
    width: 3px;
    border-radius: 2px;
    opacity: 0.5;
    animation: hbvoice-wave 0.8s ease-in-out infinite alternate;
  }
  .hb-wt-pending {
    font-size: 0.58rem;
    color: rgba(255,255,255,0.2);
    font-style: italic;
    font-family: ui-monospace,monospace;
  }
  .hb-wt-caption {
    font-size: 0.76rem;
    color: rgba(255,255,255,0.45);
    line-height: 1.65;
    font-style: italic;
    border-left: 2px solid rgba(255,255,255,0.12);
    padding-left: 0.75rem;
    margin-top: 0.25rem;
  }
  .hb-wt-controls {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
  }
  .hb-wt-nav {
    width: 32px; height: 32px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.55);
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s ease;
  }
  .hb-wt-nav:disabled { opacity: 0.25; cursor: not-allowed; }
  .hb-wt-nav:not(:disabled):hover { background: rgba(255,255,255,0.08); }
  .hb-wt-dots { display: flex; gap: 0.3rem; align-items: center; flex: 1; flex-wrap: wrap; }
  .hb-wt-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: none;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease;
    flex-shrink: 0;
  }
  .hb-wt-dot.active { transform: scale(1.3); }
  .hb-wt-dot:hover:not(.active) { background: rgba(255,255,255,0.3); }
  .hb-wt-play {
    padding: 0.4rem 0.875rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid;
    border-radius: 8px;
    font-size: 0.72rem;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease;
  }
  .hb-wt-play:hover { background: rgba(255,255,255,0.08); }
  .hb-wt-progress {
    font-size: 0.62rem;
    color: rgba(255,255,255,0.22);
    font-family: ui-monospace,monospace;
  }
  .hb-wt-close {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.32);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    transition: color 0.15s ease;
    text-align: left;
  }
  .hb-wt-close:hover { color: rgba(255,255,255,0.7); }

  /* ── Governance capability grid ── */
  .hb-gov-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  @media (max-width: 600px) {
    .hb-gov-grid { grid-template-columns: repeat(2, 1fr); }
  }
  .hb-gov-cap {
    border: 1px solid;
    border-radius: 9px;
    padding: 0.65rem 0.75rem;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    transition: border-color 0.15s ease, background 0.15s ease;
    animation: hb-fade-in 0.4s ease both;
  }
  .hb-gov-cap:hover { border-color: rgba(255,255,255,0.15) !important; }
  .hb-gov-cap.active { box-shadow: 0 0 0 1px currentColor; }
  .hb-gov-cap-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .hb-gov-cap-group {
    font-size: 0.52rem;
    font-family: ui-monospace,monospace;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    line-height: 1.2;
  }
  .hb-gov-cap-name {
    font-size: 0.73rem;
    font-weight: 700;
    color: rgba(255,255,255,0.82);
    line-height: 1.3;
  }
  .hb-gov-cap-desc {
    font-size: 0.68rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.5;
    margin-top: 0.15rem;
  }
  .hb-gov-cap-see {
    font-size: 0.6rem;
    color: rgba(139,92,246,0.6);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-top: 0.2rem;
    text-align: left;
    font-family: inherit;
    transition: color 0.15s ease;
  }
  .hb-gov-cap-see:hover { color: rgba(139,92,246,0.9); }

  /* ── HowExplainer ── */
  .hb-how-wrap { margin-top: 0.625rem; }
  .hb-how-btn {
    font-size: 0.67rem;
    color: rgba(139,92,246,0.65);
    background: rgba(139,92,246,0.06);
    border: 1px solid rgba(139,92,246,0.15);
    border-radius: 6px;
    padding: 0.28rem 0.6rem;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    font-family: inherit;
    letter-spacing: 0.02em;
  }
  .hb-how-btn:hover { background: rgba(139,92,246,0.14); color: rgba(139,92,246,0.9); }
  .hb-how-panel {
    margin-top: 0.5rem;
    padding: 0.75rem 0.875rem;
    background: rgba(139,92,246,0.04);
    border: 1px solid rgba(139,92,246,0.12);
    border-radius: 8px;
    animation: hb-module-reveal 0.3s cubic-bezier(0.16,1,0.3,1);
  }

  /* Feed event wrapper for How? sublayer */
  .hbfeed-event-wrap {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    padding-bottom: 0.35rem;
    margin-bottom: 0.1rem;
  }
  .hbfeed-event-wrap .hbfeed-event { border-bottom: none; margin-bottom: 0; }
  .hbfeed-event-wrap .hb-how-wrap { margin-top: 0.2rem; }
  .hbfeed-event-wrap .hb-how-btn { font-size: 0.6rem; padding: 0.18rem 0.45rem; }

  /* ── Reduced motion overrides ── */
  @media (prefers-reduced-motion: reduce) {
    .hb-orb, .hbvoice-bar, .hbmc-particle, .hb-module-reveal,
    .hbfeed-enter, .hbfeed-stamp, .hb-module-icons-row .hb-module-icon-chip {
      animation: none !important;
    }
    .hbcalc-bar-fill { transition: none !important; }
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

  /* ── Cmd+K hint button ── */
  .hb-cmdK-hint {
    position: fixed;
    top: 1.25rem;
    right: 6.5rem;
    background: none;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px;
    cursor: pointer;
    padding: 0.35rem 0.55rem;
    z-index: 10;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .hb-cmdK-hint:hover {
    background: rgba(139,92,246,0.08);
    border-color: rgba(139,92,246,0.25);
  }
  .hb-cmdK-hint kbd {
    font-family: ui-monospace, monospace;
    font-size: 0.6rem;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.05em;
    background: none;
    border: none;
    padding: 0;
  }
  .hb-cmdK-topbar {
    position: static;
    margin-left: auto;
  }

  /* ── Free-text input ── */
  .hb-freetext-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.35rem;
  }
  .hb-freetext-input {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 9px;
    padding: 0.52rem 0.8rem;
    color: rgba(255,255,255,0.82);
    font-size: 0.76rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s ease;
    box-sizing: border-box;
  }
  .hb-freetext-input::placeholder { color: rgba(255,255,255,0.22); }
  .hb-freetext-input:focus { border-color: rgba(139,92,246,0.35); }
  .hb-freetext-input:disabled { opacity: 0.45; }
  .hb-freetext-send {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: rgba(139,92,246,0.14);
    border: 1px solid rgba(139,92,246,0.28);
    color: #8b5cf6;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s ease, opacity 0.15s ease;
    font-family: inherit;
  }
  .hb-freetext-send:hover:not(:disabled) { background: rgba(139,92,246,0.26); }
  .hb-freetext-send:disabled { opacity: 0.35; cursor: not-allowed; }

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

  /* ── Rich modules ── */
  .hb-rich-module {
    padding: 1.5rem 1.5rem 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 720px;
  }
  .hb-rich-eyebrow {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-family: ui-monospace, monospace;
  }
  .hb-rich-headline {
    font-size: 1.35rem;
    font-weight: 700;
    color: rgba(255,255,255,0.92);
    line-height: 1.3;
    margin: 0;
  }
  .hb-rich-sub {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.6;
    margin: 0;
  }
  .hb-rich-section-label {
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: ui-monospace, monospace;
    padding-top: 0.25rem;
  }
  .hb-rich-stack {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }
  .hb-rich-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid;
    border-radius: 12px;
    padding: 1.125rem 1.25rem 1.25rem;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .hb-rich-card-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
  }
  .hb-rich-card-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
  }
  .hb-rich-tag {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: ui-monospace, monospace;
  }
  .hb-rich-name {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
  }
  .hb-rich-layer {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.38);
    margin: 0;
    font-style: italic;
  }
  .hb-rich-problem {
    background: rgba(0,0,0,0.25);
    border-radius: 8px;
    padding: 0.625rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .hb-rich-answer {
    border-left: 2px solid;
    padding-left: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .hb-rich-dt {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: ui-monospace, monospace;
    color: rgba(255,255,255,0.32);
  }
  .hb-rich-dd {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.65);
    margin: 0;
    line-height: 1.5;
  }
  .hb-rich-features {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .hb-rich-feat {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: rgba(255,255,255,0.6);
    line-height: 1.45;
  }
  .hb-rich-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 0.42em;
  }
  .hb-rich-link {
    font-size: 0.72rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.25rem;
    transition: opacity 0.15s ease;
  }
  .hb-rich-link:hover { opacity: 0.75; }
  .hb-rich-gov-groups {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }
  .hb-rich-gov-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .hb-rich-gov-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.375rem;
    border-bottom: 1px solid;
  }
  .hb-rich-gov-services {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-left: 0.5rem;
  }
  .hb-rich-grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }
  .hb-rich-grid-4 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.625rem;
  }
  .hb-rich-ghost-card {
    background: rgba(255,255,255,0.015);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 1rem 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .hb-rich-ghost-bar {
    width: 40%;
    height: 3px;
    border-radius: 2px;
    background: rgba(255,255,255,0.06);
    margin-bottom: 0.25rem;
  }

  /* ── Rich module accordion ── */
  .hb-rich-accordion {
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    overflow: hidden;
  }
  .hb-rich-accordion summary {
    list-style: none;
    padding: 0.875rem 1rem;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 600;
    color: rgba(255,255,255,0.78);
    background: rgba(255,255,255,0.02);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    transition: background 0.15s ease;
  }
  .hb-rich-accordion summary:hover { background: rgba(255,255,255,0.04); }
  .hb-rich-accordion[open] summary { background: rgba(255,255,255,0.03); }
  .hb-rich-accordion-body {
    padding: 0.875rem 1rem;
    border-top: 1px solid rgba(255,255,255,0.06);
    font-size: 0.8rem;
    color: rgba(255,255,255,0.55);
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* ── Rich module table ── */
  .hb-rich-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
  }
  .hb-rich-table th {
    text-align: left;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    font-family: ui-monospace, monospace;
    padding: 0.5rem 0.625rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .hb-rich-table td {
    padding: 0.5rem 0.625rem;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.65);
    vertical-align: top;
    line-height: 1.45;
  }
  .hb-rich-table tr:last-child td { border-bottom: none; }

  /* ── Rich stat strip ── */
  .hb-rich-stat-strip {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .hb-rich-stat {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    flex: 1;
    min-width: 100px;
  }
  .hb-rich-stat-value {
    font-size: 1.3rem;
    font-weight: 800;
    color: rgba(255,255,255,0.9);
    font-variant-numeric: tabular-nums;
  }
  .hb-rich-stat-label {
    font-size: 0.65rem;
    color: rgba(255,255,255,0.35);
    line-height: 1.4;
  }

  /* ── Rich path cards ── */
  .hb-rich-paths-grid {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }
  .hb-rich-path-card {
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    position: relative;
    overflow: hidden;
    border: 1px solid;
  }
  .hb-rich-path-badge {
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: ui-monospace, monospace;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
  }
  .hb-rich-path-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
  }
  .hb-rich-path-desc {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.55);
    line-height: 1.55;
    margin: 0;
  }
  .hb-rich-path-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.125rem;
  }
  .hb-rich-path-chip {
    font-size: 0.68rem;
    color: rgba(255,255,255,0.45);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
  }

  /* ── Rich phase timeline ── */
  .hb-rich-phases {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .hb-rich-phase {
    display: flex;
    gap: 1rem;
    padding-bottom: 1rem;
    position: relative;
  }
  .hb-rich-phase-line {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 28px;
  }
  .hb-rich-phase-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid;
    flex-shrink: 0;
    z-index: 1;
    background: #070710;
  }
  .hb-rich-phase-connector {
    width: 1px;
    flex: 1;
    background: rgba(255,255,255,0.08);
    margin-top: 2px;
    min-height: 24px;
  }
  .hb-rich-phase:last-child .hb-rich-phase-connector { display: none; }
  .hb-rich-phase-body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding-bottom: 0.25rem;
  }
  .hb-rich-phase-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: ui-monospace, monospace;
  }
  .hb-rich-phase-name {
    font-size: 0.88rem;
    font-weight: 700;
    color: rgba(255,255,255,0.82);
  }
  .hb-rich-phase-desc {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.48);
    line-height: 1.5;
  }
  .hb-rich-phase-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.125rem;
  }
  .hb-rich-phase-item {
    font-size: 0.66rem;
    color: rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 4px;
    padding: 0.175rem 0.45rem;
  }

  /* ── Rich charter values ── */
  .hb-rich-values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.625rem;
  }
  .hb-rich-value-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .hb-rich-value-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: rgba(255,255,255,0.78);
  }
  .hb-rich-value-desc {
    font-size: 0.73rem;
    color: rgba(255,255,255,0.4);
    line-height: 1.5;
  }

  /* ── Rich pressure point cards ── */
  .hb-rich-pp-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .hb-rich-pp-card {
    border-radius: 12px;
    border: 1px solid;
    padding: 1.125rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
  }
  .hb-rich-pp-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .hb-rich-pp-num {
    font-size: 0.6rem;
    font-weight: 800;
    font-family: ui-monospace, monospace;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .hb-rich-pp-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
  }
  .hb-rich-pp-verb {
    margin-left: auto;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: ui-monospace, monospace;
    opacity: 0.5;
  }
  .hb-rich-pp-desc {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.55;
    margin: 0;
  }
  .hb-rich-pp-layers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .hb-rich-pp-layer-chip {
    font-size: 0.65rem;
    color: rgba(255,255,255,0.45);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
  }

  /* ── Rich competitor accordion ── */
  .hb-rich-competitor-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* ── Rich pillar cards ── */
  .hb-rich-pillars {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  .hb-rich-pillar {
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.07);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .hb-rich-pillar-icon {
    font-size: 1.25rem;
    margin-bottom: 0.125rem;
  }
  .hb-rich-pillar-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: rgba(255,255,255,0.82);
  }
  .hb-rich-pillar-desc {
    font-size: 0.74rem;
    color: rgba(255,255,255,0.42);
    line-height: 1.5;
  }
`;

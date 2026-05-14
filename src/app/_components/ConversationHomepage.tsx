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
import DecisionTrace from "@/components/motion/DecisionTrace";
import StackFlow from "@/components/motion/StackFlow";
import CompoundingRiskWalkthrough from "@/app/_components/CompoundingRiskWalkthrough";
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
  | "walkthroughs"
  | "compounding-risk"
  | "try-it"
  | "why-us-race";

type PoolGroup = "A" | "B" | "C" | "D" | "E" | "F";

// ICP segments
type ICP = "solo" | "smb" | "growth" | "enterprise" | null;

// Engagement ladder chip types
type ChipType = "module" | "yes-no" | "guess" | "icp";

interface PoolPrompt {
  id: string;
  label: string;
  group: PoolGroup;
  /** If set, only show after this module has been revealed */
  requiresModule?: ModuleId;
  /** If set, triggers this module reveal when clicked */
  opensModule?: ModuleId;
  /** If set, after the module is revealed, scroll to this anchor id within it */
  anchor?: string;
  /** Handler key for special behaviors */
  action?: "cta-person" | "cta-voice" | "reopen-module";
  /** ICP relevance tags — if set, only show for these ICPs (or when ICP is null) */
  icpTags?: ICP[];
  /** Soft-probability affinity weights per ICP segment (0.0–1.0 each) */
  icpAffinity?: { solo: number; smb: number; growth: number; enterprise: number };
  /** Universal chips surface for everyone in screens 1-2 regardless of ICP inference */
  universal?: boolean;
}

type VisitorState = "splash" | "dashboard" | "transitioning";

// Soft ICP probability — always sums to 1.0
interface IcpProbability {
  solo: number;
  smb: number;
  growth: number;
  enterprise: number;
}

const UNIFORM_ICP_PROB: IcpProbability = { solo: 0.25, smb: 0.25, growth: 0.25, enterprise: 0.25 };

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
  icp?: ICP;
  /** Soft-probability distribution across ICP segments. Always sums to 1.0. */
  icpProbability?: IcpProbability;
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
  "compounding-risk": {
    label: "Agent Risk",
    icon: "!",
    suggestedReply: "Show me the compounding math.",
    agentIntro: "Seven scenes. One agent. Then five. Then the governance line that keeps it flat.",
  },
  "try-it": {
    label: "Try It Free",
    icon: "T",
    suggestedReply: "Try it free for a week.",
    agentIntro: "1 agent. 7 days. No credit card. Here is how to start.",
  },
  "why-us-race": {
    label: "Why Us",
    icon: "W",
    suggestedReply: "Who wins the race?",
    agentIntro: "30 seconds. Four contestants. One finish line. Watch the race.",
  },
};

const MODULE_ORDER: ModuleId[] = [
  "counter",
  "calculator",
  "article",
  "live-feed",
  // "comparison" retired — redundant with rich CompareModule. Kept as ModuleId for backward compat.
  "voice-pitch",
  // "wrapper-story" retired — redundant with rich WrappersModule. Kept as ModuleId for backward compat.
  "products",
  "governance",
  "paths",
  "wrappers",
  "about",
  "architecture",
  "compare",
  "walkthroughs",
  "compounding-risk",
  "try-it",
  "why-us-race",
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
  "compounding-risk": "#ef4444", // Red / danger signal
  "try-it": "#10b981", // emerald / go signal
  "why-us-race": "#10b981", // emerald / finish line
};

// Pre-surfaced tabs for State 3 (skipped)
const SKIP_DEFAULT_TABS: ModuleId[] = ["counter", "calculator", "compare", "article"];

// ─── Module components (reused from pure/tabs variants) ────────────────────────

const ICP_COUNTER_FRAMES: Record<NonNullable<ICP>, { headline: string; sub: string; target: number; label: string }> = {
  solo: {
    headline: "$580/month",
    sub: "Average AI spend wasted per solo builder. We catch most of it.",
    target: 580,
    label: "Per month, on average for solo operators",
  },
  smb: {
    headline: "$52,686",
    sub: "Prevented in 90 days. From our own real deployment.",
    target: 52686,
    label: "Prevented in 90 days",
  },
  growth: {
    headline: "12%",
    sub: "Of your AI spend, preventable. That is the governance layer's job.",
    target: 12,
    label: "Of AI spend preventable with governance",
  },
  enterprise: {
    headline: "Millions/yr",
    sub: "Multiplied across your vendor sprawl. The unit economics start at $52,686 per operator, per 90 days.",
    target: 52686,
    label: "Unit economics per operator per 90 days",
  },
};

function CounterModule({ icp }: { icp?: ICP }) {
  const [value, setValue] = useState(0);
  const [burst, setBurst] = useState(false);
  const [subVisible, setSubVisible] = useState(false);
  const icpFrame = icp && icp !== null ? ICP_COUNTER_FRAMES[icp] : null;
  const TARGET = icpFrame?.target ?? 52686;

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
      {icpFrame && (icp === "solo" || icp === "growth" || icp === "enterprise") ? (
        <div className="hbmc-number" style={{ color: "#ef4444", fontSize: icp === "enterprise" ? "2.5rem" : undefined }}>
          {icpFrame.headline}
        </div>
      ) : (
        <div className="hbmc-number"
          style={{ color: value >= TARGET ? "#ef4444" : "#8b5cf6", transition: "color 0.5s ease" }}
        >
          ${value.toLocaleString()}
        </div>
      )}
      <div className="hbmc-label">{icpFrame?.label ?? "Prevented in 90 days"}</div>
      {icpFrame && icp !== "smb" && (
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "0.75rem", marginTop: "0.35rem", maxWidth: "340px" }}>
          {icpFrame.sub}
        </div>
      )}
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

// ─── Calculator deep-expansion helpers ────────────────────────────────────────

interface CalcDiagnosis {
  prevented: number;
  hoursMonthly: number;
  riskScore: number; // 0–100
  riskBand: "green" | "amber" | "red";
  gaps: { id: string; label: string; explainer: string }[];
  tier: { name: string; price: string };
  painMatchPct: number;
}

function buildDiagnosis(
  employees: number,
  tools: number,
  aiAgentCount: number,
  monthlySpend: number,
  fixTimePct: number,
  reviewTimePct: number,
  monitoringPct: number,
  workplaceChips: string[],
  modelChips: string[],
  hallucFreq: string,
  shippedWithoutReview: string | null,
  unauthorizedCost: string | null,
): CalcDiagnosis | null {
  if (monthlySpend <= 0) return null;

  // Core savings projection, enhanced by fix-time and monitoring data
  const complexityFactor = Math.min(1 + (tools - 1) * 0.08 + (aiAgentCount - 1) * 0.05, 2.5);
  const wasteAtRiskFraction = Math.min(0.18 + tools * 0.015 + employees * 0.001 + (fixTimePct / 100) * 0.15, 0.65);
  const wasteAtRisk = monthlySpend * wasteAtRiskFraction * complexityFactor;
  const preventionRate = 0.878;
  const blindSpotMultiplier = monitoringPct < 30 ? 1.15 : monitoringPct < 60 ? 1.05 : 1.0;
  const prevented = Math.round(wasteAtRisk * preventionRate * blindSpotMultiplier);
  const hoursRatio = 79 / 17562;
  const hoursMonthly = Math.round(prevented * hoursRatio * 10) / 10;

  // Risk score: 0–100
  let riskScore = 0;
  riskScore += Math.min(fixTimePct * 0.4, 40); // max 40 from fix time
  riskScore += Math.min((100 - monitoringPct) * 0.25, 25); // max 25 from blind spot
  riskScore += Math.min((modelChips.length - 1) * 5, 15); // max 15 from multi-vendor
  if (shippedWithoutReview === "yes") riskScore += 10;
  if (unauthorizedCost === "yes") riskScore += 10;
  riskScore = Math.min(Math.round(riskScore), 100);
  const riskBand: CalcDiagnosis["riskBand"] = riskScore < 35 ? "green" : riskScore < 65 ? "amber" : "red";

  // Gap detection
  const gaps: CalcDiagnosis["gaps"] = [];
  if (modelChips.length > 1 && monitoringPct < 50) {
    gaps.push({ id: "multi-vendor-audit", label: "Multi-vendor without unified audit trail", explainer: "You're running more than one AI model but have no single control plane. When something breaks, there's no shared trail to trace it." });
  }
  if (fixTimePct > 30) {
    gaps.push({ id: "high-fix-time", label: "High fix-time burden", explainer: `${fixTimePct}% of your time goes to cleaning up AI errors. With governance, most of those errors are caught before they reach you.` });
  }
  if (shippedWithoutReview === "yes") {
    gaps.push({ id: "unreviewed-shipping", label: "Unreviewed agent output reached production", explainer: "An agent shipped something without a human review gate. The Stop hook catches this pattern before it leaves the session." });
  }
  if (unauthorizedCost === "yes") {
    gaps.push({ id: "cost-surprise", label: "Unauthorized cost exposure", explainer: "An agent spent money you didn't authorize. Per-agent budget caps and the Conductor service block this class of event." });
  }
  if (monitoringPct < 30) {
    gaps.push({ id: "blind-spot", label: "Critical monitoring blind spot", explainer: `You're watching ${monitoringPct}% of agent actions. The other ${100 - monitoringPct}% are running unobserved. The audit trail and live feed change that.` });
  }

  // Tier recommendation
  let tier: CalcDiagnosis["tier"];
  if (employees <= 1 && tools <= 2) tier = { name: "Free", price: "$0/mo" };
  else if (employees <= 5 && aiAgentCount <= 3) tier = { name: "Starter", price: "$99/mo" };
  else if (employees <= 20 || aiAgentCount <= 8) tier = { name: "Growth", price: "$499/mo" };
  else if (employees <= 100) tier = { name: "Pro", price: "$1,499/mo" };
  else tier = { name: "Scale", price: "Custom" };

  // Pain match: governance preventionRate × applicability of inputs
  const hasRichInputs = (fixTimePct > 0 || reviewTimePct > 0 || monitoringPct < 100 || hallucFreq !== "" || shippedWithoutReview !== null || unauthorizedCost !== null) ? 1 : 0;
  const inputApplicability = hasRichInputs
    ? 0.7 + (gaps.length / 5) * 0.25
    : 0.5;
  const painMatchPct = Math.round(preventionRate * inputApplicability * 100);

  return { prevented, hoursMonthly, riskScore, riskBand, gaps, tier, painMatchPct };
}

// Multi-select chip component for Calculator sections 3 and 4
function MultiChip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        height: "32px",
        padding: "0 0.75rem",
        borderRadius: "99px",
        border: `1px solid ${selected ? "#8b5cf6" : "rgba(255,255,255,0.12)"}`,
        background: selected ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
        color: selected ? "#8b5cf6" : "rgba(255,255,255,0.55)",
        fontSize: "0.72rem",
        fontWeight: selected ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: selected ? "0 0 8px rgba(139,92,246,0.3)" : "none",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

// Inline bar viz for slider sections
function SliderBar({ pct, color, inverse }: { pct: number; color: string; inverse?: boolean }) {
  const displayPct = inverse ? 100 - pct : pct;
  const barColor = displayPct > 66 ? (inverse ? "#10b981" : color) : displayPct > 33 ? (inverse ? color : "#f59e0b") : (inverse ? "#ef4444" : "#10b981");
  return (
    <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", marginTop: "0.35rem", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "99px", transition: "width 0.2s ease, background 0.2s ease", boxShadow: `0 0 6px ${barColor}60` }} />
    </div>
  );
}

// ICP seed defaults — applied once when the module first mounts (if not manually touched)
const ICP_CALC_SEEDS: Record<NonNullable<ICP>, {
  employees: number;
  spendInput: string;
  aiAgentCount: number;
  fixTimePct: number;
  reviewTimePct: number;
  monitoringPct: number;
  workplaceChips: string[];
  modelChips: string[];
  hallucFreq: string;
  shippedWithoutReview: string | null;
  unauthorizedCost: string | null;
}> = {
  solo: {
    employees: 1,
    spendInput: "200",
    aiAgentCount: 2,
    fixTimePct: 35,
    reviewTimePct: 40,
    monitoringPct: 50,
    workplaceChips: ["Browser tab"],
    modelChips: ["Claude"],
    hallucFreq: "Rarely",
    shippedWithoutReview: "no",
    unauthorizedCost: "no",
  },
  smb: {
    employees: 25,
    spendInput: "2000",
    aiAgentCount: 5,
    fixTimePct: 25,
    reviewTimePct: 30,
    monitoringPct: 35,
    workplaceChips: ["Browser tab", "Slack"],
    modelChips: ["Claude", "ChatGPT"],
    hallucFreq: "Sometimes",
    shippedWithoutReview: "no",
    unauthorizedCost: "no",
  },
  growth: {
    employees: 100,
    spendInput: "10000",
    aiAgentCount: 8,
    fixTimePct: 18,
    reviewTimePct: 20,
    monitoringPct: 25,
    workplaceChips: ["Browser tab", "VS Code", "Slack"],
    modelChips: ["Claude", "ChatGPT", "Gemini"],
    hallucFreq: "Often",
    shippedWithoutReview: "yes",
    unauthorizedCost: "yes",
  },
  enterprise: {
    employees: 500,
    spendInput: "50000",
    aiAgentCount: 12,
    fixTimePct: 15,
    reviewTimePct: 15,
    monitoringPct: 15,
    workplaceChips: ["Browser tab", "VS Code", "Slack", "Custom code"],
    modelChips: ["Claude", "ChatGPT", "Gemini", "Copilot"],
    hallucFreq: "Often",
    shippedWithoutReview: "yes",
    unauthorizedCost: "yes",
  },
};

function CalculatorModule({
  defaultEmployees,
  defaultTools,
  icpProbability,
}: {
  defaultEmployees?: number;
  defaultTools?: number;
  icpProbability?: IcpProbability;
}) {
  // Determine dominant ICP for auto-seed (only if icpProbability provided)
  const seedIcp: NonNullable<ICP> | null = icpProbability
    ? (["solo", "smb", "growth", "enterprise"] as NonNullable<ICP>[]).reduce(
        (best, k) => icpProbability[k] > icpProbability[best] ? k : best,
        "smb" as NonNullable<ICP>
      )
    : null;
  const seed = seedIcp ? ICP_CALC_SEEDS[seedIcp] : null;

  // Track whether visitor has manually changed any input
  const [touched, setTouched] = useState(false);
  const [seedBannerVisible, setSeedBannerVisible] = useState(!!seed);

  // Section 1: Your operation
  const [employees, setEmployees] = useState(seed?.employees ?? defaultEmployees ?? 10);
  const [aiAgentCount, setAiAgentCount] = useState(seed?.aiAgentCount ?? 3);
  const [spendInput, setSpendInput] = useState(seed?.spendInput ?? "");

  // Section 2: Where the pain is
  const [fixTimePct, setFixTimePct] = useState(seed?.fixTimePct ?? 20);
  const [reviewTimePct, setReviewTimePct] = useState(seed?.reviewTimePct ?? 35);
  const [monitoringPct, setMonitoringPct] = useState(seed?.monitoringPct ?? 40);

  // Section 3: Where you work (multi-select)
  const [workplaceChips, setWorkplaceChips] = useState<string[]>(seed?.workplaceChips ?? []);
  // Section 4: Models (multi-select)
  const [modelChips, setModelChips] = useState<string[]>(seed?.modelChips ?? []);

  // Section 5: Trust signals
  const [hallucFreq, setHallucFreq] = useState(seed?.hallucFreq ?? "");
  const [shippedWithoutReview, setShippedWithoutReview] = useState<string | null>(seed?.shippedWithoutReview ?? null);
  const [unauthorizedCost, setUnauthorizedCost] = useState<string | null>(seed?.unauthorizedCost ?? null);

  // Auto-dismiss seed banner after 5 seconds
  useEffect(() => {
    if (!seedBannerVisible) return;
    const t = setTimeout(() => setSeedBannerVisible(false), 5000);
    return () => clearTimeout(t);
  }, [seedBannerVisible]);

  // Mark touched on first manual change
  const markTouched = () => { if (!touched) setTouched(true); setSeedBannerVisible(false); };

  // Legacy tools slider retained for compatibility with calcProjection
  const tools = defaultTools ?? aiAgentCount;

  const monthlySpend = parseFloat(spendInput.replace(/[^0-9.]/g, "")) || 0;

  // Diagnosis renders when all sections have at least one input
  const allSectionsHaveInput =
    monthlySpend > 0 &&
    (fixTimePct > 0 || reviewTimePct < 100) &&
    workplaceChips.length > 0 &&
    modelChips.length > 0 &&
    (hallucFreq !== "" || shippedWithoutReview !== null || unauthorizedCost !== null);

  const diagnosis = allSectionsHaveInput
    ? buildDiagnosis(employees, tools, aiAgentCount, monthlySpend, fixTimePct, reviewTimePct, monitoringPct, workplaceChips, modelChips, hallucFreq, shippedWithoutReview, unauthorizedCost)
    : null;

  // Legacy result for the "How is this calculated" explainer
  const legacyResult = monthlySpend > 0 ? calcProjection(employees, tools, monthlySpend) : null;

  const WORKPLACE_OPTIONS = ["Desktop apps", "Terminal", "Browser tab", "Slack", "Discord", "Custom code", "VS Code", "Cursor", "Other"];
  const MODEL_OPTIONS = ["Claude", "ChatGPT", "Gemini", "Llama", "Mistral", "Copilot", "Custom", "Other"];
  const HALLUC_OPTIONS = ["Never", "Rarely", "Sometimes", "Often", "Constantly"];

  const toggleWorkplace = (v: string) => { markTouched(); setWorkplaceChips((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]); };
  const toggleModel = (v: string) => { markTouched(); setModelChips((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]); };

  const RISK_COLORS: Record<CalcDiagnosis["riskBand"], string> = { green: "#10b981", amber: "#f59e0b", red: "#ef4444" };
  const RISK_LABELS: Record<CalcDiagnosis["riskBand"], string> = { green: "Low risk", amber: "Moderate risk", red: "High risk" };

  const ICP_LABELS: Record<NonNullable<ICP>, string> = { solo: "a solo operator", smb: "a small team", growth: "a growth-stage team", enterprise: "a large org" };

  return (
    <div className="hb-module-calc hbcalc-v2">
      {/* Auto-seed banner */}
      {seedBannerVisible && seedIcp && (
        <div style={{ padding: "0.45rem 0.875rem", marginBottom: "0.75rem", borderRadius: "8px", background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.18)", fontSize: "0.72rem", color: "rgba(6,182,212,0.85)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", animation: "hb-fade-in 0.4s ease" }}>
          <span>Pre-filled for {ICP_LABELS[seedIcp]}. Drag any slider to refine.</span>
          <button onClick={() => setSeedBannerVisible(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(6,182,212,0.5)", fontSize: "0.8rem", padding: "0.1rem 0.3rem", fontFamily: "inherit" }}>×</button>
        </div>
      )}
      {/* Section 1: Your operation */}
      <div className="hbcalc-section">
        <div className="hbcalc-section-label">01 — Your operation</div>
        <div className="hbcalc-row">
          <label className="hbcalc-label">Team size: <strong style={{ color: "rgba(255,255,255,0.9)" }}>{employees}</strong></label>
          <input type="range" min={1} max={200} value={employees} onChange={(e) => { markTouched(); setEmployees(+e.target.value); }} className="hbcalc-slider" />
        </div>
        <div className="hbcalc-row">
          <label className="hbcalc-label">Monthly AI spend</label>
          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>$</span>
            <input type="text" placeholder="e.g. 2000" value={spendInput} onChange={(e) => { markTouched(); setSpendInput(e.target.value); }} className="hbcalc-input" style={{ flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
            {["500", "2000", "5000", "10000"].map((v) => (
              <button key={v} onClick={() => { markTouched(); setSpendInput(v); }} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.12)", background: spendInput === v ? "rgba(6,182,212,0.12)" : "transparent", color: spendInput === v ? "#06b6d4" : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "inherit" }}>
                ${v}
              </button>
            ))}
          </div>
        </div>
        <div className="hbcalc-row">
          <label className="hbcalc-label">AI agents / tools in use: <strong style={{ color: "rgba(255,255,255,0.9)" }}>{aiAgentCount}</strong></label>
          <input type="range" min={1} max={15} value={aiAgentCount} onChange={(e) => { markTouched(); setAiAgentCount(+e.target.value); }} className="hbcalc-slider" />
        </div>
      </div>

      {/* Section 2: Where the pain is */}
      <div className="hbcalc-section">
        <div className="hbcalc-section-label">02 — Where the pain is</div>
        <div className="hbcalc-row">
          <label className="hbcalc-label" style={{ color: "#ef4444" }}>
            Time spent fixing AI errors: <strong style={{ color: "rgba(255,255,255,0.9)" }}>{fixTimePct}%</strong>
          </label>
          <input type="range" min={0} max={100} value={fixTimePct} onChange={(e) => { markTouched(); setFixTimePct(+e.target.value); }} className="hbcalc-slider" />
          <SliderBar pct={fixTimePct} color="#ef4444" />
        </div>
        <div className="hbcalc-row">
          <label className="hbcalc-label" style={{ color: "#f59e0b" }}>
            Time spent reviewing AI output before it ships: <strong style={{ color: "rgba(255,255,255,0.9)" }}>{reviewTimePct}%</strong>
          </label>
          <input type="range" min={0} max={100} value={reviewTimePct} onChange={(e) => { markTouched(); setReviewTimePct(+e.target.value); }} className="hbcalc-slider" />
          <SliderBar pct={reviewTimePct} color="#f59e0b" />
        </div>
        <div className="hbcalc-row">
          <label className="hbcalc-label" style={{ color: "#06b6d4" }}>
            Agent actions you actually monitor: <strong style={{ color: "rgba(255,255,255,0.9)" }}>{monitoringPct}%</strong>
            {monitoringPct < 30 && <span style={{ marginLeft: "0.5rem", fontSize: "0.65rem", color: "#ef4444" }}>blind spot</span>}
          </label>
          <input type="range" min={0} max={100} value={monitoringPct} onChange={(e) => { markTouched(); setMonitoringPct(+e.target.value); }} className="hbcalc-slider" />
          <SliderBar pct={monitoringPct} color="#06b6d4" inverse />
        </div>
      </div>

      {/* Section 3: Where you work */}
      <div className="hbcalc-section">
        <div className="hbcalc-section-label">03 — Where you work with AI</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
          {WORKPLACE_OPTIONS.map((v) => (
            <MultiChip key={v} label={v} selected={workplaceChips.includes(v)} onToggle={() => toggleWorkplace(v)} />
          ))}
        </div>
      </div>

      {/* Section 4: Models */}
      <div className="hbcalc-section">
        <div className="hbcalc-section-label">04 — Which models you use</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
          {MODEL_OPTIONS.map((v) => (
            <MultiChip key={v} label={v} selected={modelChips.includes(v)} onToggle={() => toggleModel(v)} />
          ))}
        </div>
        {modelChips.length > 1 && (
          <div style={{ marginTop: "0.4rem", fontSize: "0.68rem", color: "#f59e0b", fontFamily: "ui-monospace,monospace" }}>
            {modelChips.length} models detected. Multi-vendor risk applies.
          </div>
        )}
      </div>

      {/* Section 5: Trust signals */}
      <div className="hbcalc-section">
        <div className="hbcalc-section-label">05 — Trust signals</div>
        <div className="hbcalc-row" style={{ gap: "0.35rem" }}>
          <label className="hbcalc-label">How often have you caught an agent making things up?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.3rem" }}>
            {HALLUC_OPTIONS.map((v) => (
              <button key={v} onClick={() => { markTouched(); setHallucFreq(v); }} style={{ height: "28px", padding: "0 0.65rem", borderRadius: "99px", border: `1px solid ${hallucFreq === v ? "#ef4444" : "rgba(255,255,255,0.12)"}`, background: hallucFreq === v ? "rgba(239,68,68,0.15)" : "transparent", color: hallucFreq === v ? "#ef4444" : "rgba(255,255,255,0.45)", fontSize: "0.68rem", cursor: "pointer", fontFamily: "inherit", fontWeight: hallucFreq === v ? 700 : 400 }}>{v}</button>
            ))}
          </div>
        </div>
        <div className="hbcalc-row" style={{ gap: "0.35rem" }}>
          <label className="hbcalc-label">Have you ever shipped agent output without reviewing it?</label>
          <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.3rem" }}>
            {["Yes", "No"].map((v) => {
              const val = v.toLowerCase();
              const sel = shippedWithoutReview === val;
              return <button key={v} onClick={() => { markTouched(); setShippedWithoutReview(val); }} style={{ height: "28px", padding: "0 0.75rem", borderRadius: "99px", border: `1px solid ${sel ? "#f59e0b" : "rgba(255,255,255,0.12)"}`, background: sel ? "rgba(245,158,11,0.15)" : "transparent", color: sel ? "#f59e0b" : "rgba(255,255,255,0.45)", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit", fontWeight: sel ? 700 : 400 }}>{v}</button>;
            })}
          </div>
        </div>
        <div className="hbcalc-row" style={{ gap: "0.35rem" }}>
          <label className="hbcalc-label">Has an agent ever cost you money you didn&apos;t authorize?</label>
          <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.3rem" }}>
            {["Yes", "No"].map((v) => {
              const val = v.toLowerCase();
              const sel = unauthorizedCost === val;
              return <button key={v} onClick={() => { markTouched(); setUnauthorizedCost(val); }} style={{ height: "28px", padding: "0 0.75rem", borderRadius: "99px", border: `1px solid ${sel ? "#ef4444" : "rgba(255,255,255,0.12)"}`, background: sel ? "rgba(239,68,68,0.15)" : "transparent", color: sel ? "#ef4444" : "rgba(255,255,255,0.45)", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit", fontWeight: sel ? 700 : 400 }}>{v}</button>;
            })}
          </div>
        </div>
      </div>

      {/* Section 6: Diagnosis */}
      <div className="hbcalc-section" style={{ borderColor: diagnosis ? "rgba(139,92,246,0.25)" : undefined }}>
        <div className="hbcalc-section-label" style={{ color: "#8b5cf6" }}>06 — Your diagnosis</div>

        {!allSectionsHaveInput && (
          <div style={{ padding: "1rem", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", fontFamily: "ui-monospace,monospace", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "10px", background: "rgba(255,255,255,0.01)" }}>
            Fill in the sections above. The diagnosis appears here.
          </div>
        )}

        {diagnosis && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", animation: "hb-fade-in 0.4s ease" }}>
            {/* Headline number */}
            <div className="hbcalc-bars">
              {[
                { label: "Projected savings / mo", value: diagnosis.prevented, max: Math.max(diagnosis.prevented, 10000), color: "#ef4444", prefix: "$", suffix: "" },
                { label: "Hours returned / mo", value: diagnosis.hoursMonthly, max: Math.max(diagnosis.hoursMonthly, 10), color: "#06b6d4", prefix: "", suffix: " hrs" },
              ].map((bar) => {
                const pct = Math.min((bar.value / bar.max) * 100, 100);
                return (
                  <div key={bar.label} className="hbcalc-bar-row">
                    <div className="hbcalc-bar-label">{bar.label}</div>
                    <div className="hbcalc-bar-track">
                      <div className="hbcalc-bar-fill" style={{ width: `${pct}%`, background: bar.color, boxShadow: `0 0 8px ${bar.color}60`, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
                    </div>
                    <div className="hbcalc-bar-val" style={{ color: bar.color }}>
                      {bar.prefix}{typeof bar.value === "number" && bar.value > 999 ? bar.value.toLocaleString() : bar.value}{bar.suffix}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risk score */}
            <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: `${RISK_COLORS[diagnosis.riskBand]}0a`, border: `1px solid ${RISK_COLORS[diagnosis.riskBand]}25` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.72rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: RISK_COLORS[diagnosis.riskBand] }}>
                  Agent risk score
                </span>
                <span style={{ fontSize: "1.2rem", fontWeight: 900, color: RISK_COLORS[diagnosis.riskBand] }}>
                  {diagnosis.riskScore}/100
                </span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${diagnosis.riskScore}%`, background: RISK_COLORS[diagnosis.riskBand], borderRadius: "99px", transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
              </div>
              <div style={{ marginTop: "0.3rem", fontSize: "0.68rem", color: RISK_COLORS[diagnosis.riskBand] }}>{RISK_LABELS[diagnosis.riskBand]}</div>
            </div>

            {/* Governance gaps */}
            {diagnosis.gaps.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ fontSize: "0.65rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: "0.1rem" }}>Governance gaps detected</div>
                {diagnosis.gaps.map((gap, i) => (
                  <div key={gap.id} style={{ padding: "0.6rem 0.875rem", borderRadius: "8px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", animation: `hb-fade-in 0.3s ease ${i * 0.08}s both` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: "0.45rem" }} />
                      <div>
                        <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: "0.15rem" }}>{gap.label}</div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{gap.explainer}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tier + pain match */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div style={{ padding: "0.65rem 0.875rem", borderRadius: "8px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)" }}>
                <div style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: "rgba(139,92,246,0.7)", marginBottom: "0.2rem" }}>Recommended tier</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#8b5cf6" }}>{diagnosis.tier.name}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>{diagnosis.tier.price}</div>
              </div>
              <div style={{ padding: "0.65rem 0.875rem", borderRadius: "8px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
                <div style={{ fontSize: "0.62rem", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", color: "rgba(16,185,129,0.7)", marginBottom: "0.2rem" }}>Pain match</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#10b981" }}>{diagnosis.painMatchPct}%</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>of what you described</div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
                We catch {diagnosis.painMatchPct}% of what you described above.
              </div>
              <button
                onClick={() => {
                  // Focus chat input
                  const chatInput = document.querySelector<HTMLInputElement>(".hb-freetext-input");
                  if (chatInput) { chatInput.focus(); chatInput.placeholder = "Tell MAX what you want fixed first."; }
                }}
                style={{ padding: "0.6rem 1.25rem", borderRadius: "99px", background: "#8b5cf6", color: "white", fontSize: "0.8rem", fontWeight: 700, border: "none", cursor: "pointer" }}
              >
                Want this for your operation? Talk to MAX.
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legacy anchor + how explainer */}
      {legacyResult && (
        <>
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
        </>
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

const VOICE_SCRIPTS = {
  "30s": {
    label: "30 seconds",
    desc: "The number. The cost. The ROI. Done.",
    color: "#ef4444",
    script: [
      "Most AI tools add agents. None of them govern them.",
      "In 90 days, our governance layer prevented $52,686 in wasted work. 236 hours of operator time returned. Infrastructure cost: $5.07 a month.",
      "Level9OS is your AI operating system. One control plane for every agent, every vendor, every workflow. Built for a 10 to 50 person company that can't afford to learn this the hard way.",
      "Your first AI operating system. Or your last one. Start at level9os.com.",
    ],
  },
  "90s": {
    label: "1 minute 30",
    desc: "Four categories, full math, one CTA.",
    color: "#8b5cf6",
    script: [
      "You've introduced an agent. Maybe a few. They're running.",
      "Here's what's actually happening: they're claiming done when the work isn't done. They're reversing mid-task. They're burning your best model on work that costs a tenth as much somewhere else. And you won't know until something breaks.",
      "236 hours of operator time returned in 90 days. Up to $17,562 a month in prevented rework. Governance infrastructure running at $5.07 a month. That's not a projection. That's our production environment.",
      "Plug any agent. Claude, GPT, Gemini. One control plane. One audit trail. No lock-in.",
      "The GTM hook we ship to every customer: introduce an agent. Give it access. Give it a day. It comes back and walks you through what it found. That's the demo.",
      "Your first AI operating system. Or your last one. level9os.com.",
    ],
  },
  "5m": {
    label: "5 minutes",
    desc: "Full operator briefing. Architecture, proof, onboarding.",
    color: "#ec4899",
    script: [
      "You've approved the work. The agent says it's done. You move on. Three days later, someone on your team finds the failure. The agent never finished. It just told you it did.",
      "In 299 real production sessions over 90 days, we measured a 26% lie rate from our own AI agents. One in four done-claims was wrong.",
      "We're an AI operating system for companies between 10 and 50 people. The operator who's already running AI. Who has 3, 5, maybe 10 agents active. And no real system governing any of them.",
      "Microsoft Agent 365 runs close to $1 million a year. Salesforce Agentforce, around $850,000. Workday ASOR, $500,000 and it doesn't leave the HR and finance lane. Level9OS is $499 a month. And it's not locked to one vendor.",
      "In 90 days: $52,686 in prevented rework. Monthly run rate: $17,562. Operator time returned: 236 hours. Cost of the governance system: $5.07 a month.",
      "The governance layer is not a feature on top of the product. It's the foundation the whole system runs on. 18 services across truth enforcement, budget control, and identity management.",
      "Multi-vendor AI governance and management platform. Plug any agent. Claude. GPT-4. Gemini. A custom-built model. One control plane. One audit trail.",
      "The window here is 12 to 18 months. By late 2027, one or two of them will consolidate the category. We're building for the operators who don't want to wait.",
      "Your first AI operating system. Or your last one. level9os.com. We'll show you what's actually running.",
    ],
  },
};

function VoicePitchModule() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="hb-module-voice">
      <div className="hbvoice-label">Three versions. Same message, different depth.</div>
      <div className="hbvoice-note-top" style={{ marginBottom: "0.75rem", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace", background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.1)", borderRadius: "6px", padding: "0.35rem 0.7rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "rgba(236,72,153,0.5)", animation: "hb-bounce 2.5s ease-in-out infinite" }} />
        Voice render in production queue. Read the script while we finish recording.
      </div>
      {(Object.entries(VOICE_SCRIPTS) as [string, typeof VOICE_SCRIPTS["30s"]][]).map(([id, track]) => (
        <div key={id} className="hbvoice-track" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <button
            className="hbvoice-track-header"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: "0.6rem 0", textAlign: "left", width: "100%" }}
            onClick={() => setExpanded(expanded === id ? null : id)}
          >
            <div className="hbvoice-track-info" style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
              <span className="hbvt-label" style={{ color: track.color }}>{track.label}</span>
              <span className="hbvt-desc">{track.desc}</span>
            </div>
            <span style={{ color: track.color, fontSize: "0.75rem", fontFamily: "ui-monospace,monospace", flexShrink: 0 }}>
              {expanded === id ? "Close ↑" : "Read script →"}
            </span>
          </button>
          {expanded === id && (
            <div className="hbvoice-script" style={{ borderTop: `1px solid ${track.color}20`, paddingTop: "0.75rem", marginTop: "0.25rem" }}>
              {track.script.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.65rem", alignItems: "flex-start", animation: `hb-fade-in 0.3s ease ${i * 0.07}s both`, opacity: 0 }}>
                  <span style={{ fontSize: "0.6rem", fontFamily: "ui-monospace,monospace", color: `${track.color}70`, minWidth: "1.4rem", marginTop: "0.25rem", flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>{line}</p>
                </div>
              ))}
              <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: `1px solid ${track.color}15`, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", fontFamily: "ui-monospace,monospace" }}>
                {track.script.length} lines · Voice recording in production queue
              </div>
            </div>
          )}
        </div>
      ))}
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
  // Truth Enforcement — "Your AI won't lie to you in production"
  { id: "multi-vendor", name: "Multi-vendor orchestration", desc: "Claude + GPT + Gemini + custom agents in one control plane.", group: "Your AI won't lie to you in production", color: "#ef4444" },
  { id: "lie-detector", name: "Lie detector", desc: "Flags outputs that contradict established facts before they ship to production.", group: "Your AI won't lie to you in production", color: "#ef4444" },
  { id: "claim-verify", name: "Claim/verify engine", desc: "Every assertion checked against the canonical rules engine before it leaves the session.", group: "Your AI won't lie to you in production", color: "#ef4444" },
  { id: "done-claim", name: "Done-claim verifier", desc: "No agent claims completion without a deterministic build or test verifier passing first.", group: "Your AI won't lie to you in production", color: "#ef4444" },
  { id: "thoroughness", name: "Thoroughness discipline", desc: "Three-pass discovery: cast wide, validate with a second method, spot-check 10%. No half-done scans.", group: "Your AI won't lie to you in production", color: "#ef4444" },
  { id: "canonical-rules", name: "Canonical rules engine", desc: "The source of truth every agent writes against. Fetched at session start, not hardcoded.", group: "Your AI won't lie to you in production", color: "#ef4444" },
  // Budget + Cost Control — "Your AI won't overspend without you knowing"
  { id: "cost-routing", name: "Cost routing", desc: "Routes each task to its best-fit model at the lowest cost. Simple tasks go to cheap models. Strategy to the best one.", group: "Your AI won't overspend without you knowing", color: "#f59e0b" },
  { id: "budget-caps", name: "Per-agent budget caps", desc: "No agent runs without a spending ceiling. 75% triggers a warning. 90% triggers a pause.", group: "Your AI won't overspend without you knowing", color: "#f59e0b" },
  { id: "costs-dashboard", name: "Real-time cost dashboard", desc: "Spend per agent, per task, per system. Live. Not a monthly invoice surprise.", group: "Your AI won't overspend without you knowing", color: "#f59e0b" },
  { id: "garbage-man", name: "No junk code rule", desc: "Every file added must justify its existence. Dead code flagged and removed before it accumulates.", group: "Your AI won't overspend without you knowing", color: "#f59e0b" },
  { id: "officer-system", name: "Review gate system", desc: "3 checkpoints: plan, mid-build, ship. Governance signs off before production. Nothing self-approves.", group: "Your AI won't overspend without you knowing", color: "#f59e0b" },
  { id: "performance-scoring", name: "Performance scoring", desc: "Humans and agents measured on the same scale. Baseline, then 90-day re-score to track change.", group: "Your AI won't overspend without you knowing", color: "#f59e0b" },
  // Identity + Access — "Your AI won't touch what it shouldn't"
  { id: "protected-resources", name: "Protected resources", desc: "No agent touches a critical file or workflow without an active access grant. Blocked at the system level.", group: "Your AI won't touch what it shouldn't", color: "#8b5cf6" },
  { id: "intent-guardrail", name: "Intent guardrail", desc: "Agent actions checked against declared intent before execution. Drift detected and stopped.", group: "Your AI won't touch what it shouldn't", color: "#8b5cf6" },
  { id: "audit-trail", name: "Audit trail", desc: "Every action logged. Every LLM call, every governance event, every cost. Append-only. Tamper-evident.", group: "Your AI won't touch what it shouldn't", color: "#8b5cf6" },
  { id: "auto-doc", name: "Auto documentation", desc: "Governance documentation generated and updated continuously. Always current. Never stale.", group: "Your AI won't touch what it shouldn't", color: "#8b5cf6" },
  { id: "trust-scores", name: "Trust scores per agent", desc: "Every agent earns a trust score based on accuracy, error rate, and claim-verify pass rate.", group: "Your AI won't touch what it shouldn't", color: "#8b5cf6" },
  { id: "continuous-compliance", name: "Continuous compliance", desc: "SOC2 / NIST / ISO / GDPR / AI RMF. Compliance state maintained daily, not just at audit time.", group: "Your AI won't touch what it shouldn't", color: "#8b5cf6" },
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
      <div id="lie-detector" data-anchor="lie-detector" className="hb-rich-eyebrow" style={{ color: VAULT_RED }}>The Vault · Governance Chassis</div>
      <h2 className="hb-rich-headline">You see the AI agent.<br />You don&apos;t see what it&apos;s doing.</h2>
      <p className="hb-rich-sub" style={{ color: `${VAULT_RED}cc` }}>Level9OS makes the invisible visible.</p>
      {/* Governance radial diagram — 16 officers, 4 buckets, packet flows */}
      <div style={{ position: "relative" }}>
        <ConsoleGraphicLite />
        <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.875rem", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.14)", borderRadius: "8px", fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
          <span style={{ color: "#ef4444", fontWeight: 700 }}>How to read this:</span> Each dot is an AI agent. The rings are the governance rules they live inside. Packets flow when work moves between teams. Hover any ring to slow down and see which agents are inside it.
        </div>
      </div>
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

      {/* 18-capability grid — "why this matters" frame first */}
      <div className="hb-rich-section-label" style={{ color: VAULT_RED }}>The 18 ways we keep your agents honest, cheap, and accountable.</div>

      {/* Why this matters — three rows before the grid */}
      <div id="cost-router" data-anchor="cost-router" style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
        {[
          { icon: "T", color: "#ef4444", bold: "When an agent lies, we catch it.", rest: " Before the email sends.", group: "Truth Enforcement" },
          { icon: "$", color: "#f59e0b", bold: "When an agent spends too much, we stop it.", rest: " Before the bill arrives.", group: "Budget + Cost Control" },
          { icon: "A", color: "#8b5cf6", bold: "When an agent touches something it shouldn't, we block it.", rest: " Before the damage.", group: "Identity + Access" },
        ].map((row) => (
          <div key={row.group} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px", background: `${row.color}07`, border: `1px solid ${row.color}18` }}>
            <span style={{ width: "28px", height: "28px", borderRadius: "6px", background: `${row.color}18`, border: `1px solid ${row.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: row.color, flexShrink: 0, fontFamily: "ui-monospace,monospace" }}>{row.icon}</span>
            <div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{row.bold}</span>
              <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)" }}>{row.rest}</span>
              <div style={{ marginTop: "0.2rem", fontSize: "0.62rem", color: `${row.color}80`, fontFamily: "ui-monospace,monospace", textTransform: "uppercase", letterSpacing: "0.12em" }}>{row.group} group below</div>
            </div>
          </div>
        ))}
      </div>

      <div id="officer-system" data-anchor="officer-system" style={{ scrollMarginTop: "1rem" }}>
        <GovernanceGrid />
      </div>

      {/* Audit trail anchor */}
      <div id="audit-trail" data-anchor="audit-trail" style={{ scrollMarginTop: "1rem" }} />
      <div id="trust-scores" data-anchor="trust-scores" style={{ scrollMarginTop: "1rem" }} />
      <div id="max-voice" data-anchor="max-voice" style={{ scrollMarginTop: "1rem" }} />
      <div id="identity-access" data-anchor="identity-access" style={{ scrollMarginTop: "1rem" }} />
      <div id="auto-doc" data-anchor="auto-doc" style={{ scrollMarginTop: "1rem" }} />

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

// Path card mini-timelines
const PATH_TIMELINES: Record<string, { day: number; title: string; note: string }[]> = {
  startup: [
    { day: 1, title: "Intake agent live", note: "Reads your current ops. Returns a plain-English report." },
    { day: 7, title: "First pod deployed", note: "One autonomous pod running before the first week ends." },
    { day: 30, title: "Governance baseline", note: "ECI baseline measured. Governance chassis confirmed running." },
  ],
  growth: [
    { day: 1, title: "Agent reads your docs", note: "No discovery meeting before the discovery meeting." },
    { day: 3, title: "Report back", note: "Plain-English: what it found, what it flagged, what it would fix." },
    { day: 14, title: "Remediation started", note: "Top 3 friction points from the report, addressed." },
  ],
  enterprise: [
    { day: 1, title: "OutboundOS in one dept", note: "Pods running, governance on, audit trail live." },
    { day: 14, title: "Mid-trial audit", note: "30-day report preview: what ran, what cost what." },
    { day: 30, title: "Production read", note: "ECI baseline + full 30-day department-level proof." },
  ],
};

// Path card motion background canvases
function PathCardCanvas({ pathId, accent, hovered }: { pathId: string; accent: string; hovered: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 320;
    const H = canvas.offsetHeight || 80;
    canvas.width = W;
    canvas.height = H;
    const rgb = accent === "#8b5cf6" ? [139, 92, 246] : accent === "#10b981" ? [16, 185, 129] : [245, 158, 11];
    frameRef.current = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);
      const t = frameRef.current / 60;
      const alpha = hovered ? 0.18 : 0.07;
      if (pathId === "startup") {
        // Spinning pod: concentric rings that spin up
        const cx = W * 0.85, cy = H / 2;
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.arc(cx, cy, 16 + r * 12, t * (r % 2 === 0 ? 0.8 : -0.6), t * (r % 2 === 0 ? 0.8 : -0.6) + Math.PI * 1.6);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha + r * 0.02})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        // Dot in center that pulses
        ctx.beginPath();
        ctx.arc(cx, cy, 4 + Math.sin(t * 2) * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 2.5})`;
        ctx.fill();
      } else if (pathId === "growth") {
        // Multi-vendor arrows converging to a point
        const cx = W * 0.85, cy = H / 2;
        const numArrows = 3;
        for (let i = 0; i < numArrows; i++) {
          const angle = (i / numArrows) * Math.PI * 2 + t * 0.4;
          const dist = 38 - (t * 5 % 38);
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * (dist * 0.5);
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha + 0.05})`;
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(cx + Math.cos(angle) * 8, cy + Math.sin(angle) * 4);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 6 + Math.sin(t * 1.8) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 3})`;
        ctx.fill();
      } else {
        // Enterprise: vendor lock-in shield cracking
        const cx = W * 0.85, cy = H / 2;
        const crackProgress = hovered ? Math.min((t % 3) / 1.5, 1.0) : 0;
        // Shield outline
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22);
        ctx.lineTo(cx + 16, cy - 10);
        ctx.lineTo(cx + 16, cy + 8);
        ctx.lineTo(cx, cy + 22);
        ctx.lineTo(cx - 16, cy + 8);
        ctx.lineTo(cx - 16, cy - 10);
        ctx.closePath();
        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha + 0.05})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Crack line
        if (crackProgress > 0) {
          ctx.beginPath();
          ctx.moveTo(cx, cy - 18);
          ctx.lineTo(cx + 3, cy - 5 * crackProgress);
          ctx.lineTo(cx - 2, cy + 8 * crackProgress);
          ctx.lineTo(cx, cy + 18 * crackProgress);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${crackProgress * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      frameRef.current++;
      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pathId, accent, hovered]);
  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "100%", pointerEvents: "none", opacity: hovered ? 1 : 0.6, transition: "opacity 0.3s ease" }} />;
}

function PathsModule() {
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#8b5cf6" }}>Work With Us</div>
      <h2 className="hb-rich-headline">Pick your starting point.</h2>
      <p className="hb-rich-sub">Same governance chassis. Different entry. Introduce an agent. Give it access. Give it a day.</p>

      <div className="hb-rich-stack">
        {PATHS_DATA.map((path) => {
          const isHovered = hoveredPath === path.id;
          const isExpanded = expandedPath === path.id;
          const timeline = PATH_TIMELINES[path.id] ?? [];
          return (
            <div
              key={path.id}
              id={path.id}
              data-anchor={path.id}
              className="hb-rich-card hb-path-card"
              style={{
                borderColor: `${path.accent}22`,
                position: "relative",
                overflow: "hidden",
                scrollMarginTop: "1rem",
                transform: isHovered ? "translateY(-2px) scale(1.005)" : "none",
                transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.2s ease, box-shadow 0.2s ease",
                boxShadow: isHovered ? `0 4px 24px ${path.accent}18` : "none",
              }}
              onMouseEnter={() => setHoveredPath(path.id)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <PathCardCanvas pathId={path.id} accent={path.accent} hovered={isHovered} />
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

              {/* Click-to-expand 30/90/180 mini-timeline */}
              {timeline.length > 0 && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <button
                    onClick={() => setExpandedPath(isExpanded ? null : path.id)}
                    style={{ background: "none", border: `1px solid ${path.accent}25`, borderRadius: "6px", padding: "0.3rem 0.65rem", cursor: "pointer", fontSize: "0.65rem", color: `${path.accent}cc`, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    {isExpanded ? "↑ Hide" : "↓ Show"} {timeline[timeline.length - 1].day}-day timeline
                  </button>
                  {isExpanded && (
                    <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem", animation: "hb-fade-in 0.25s ease" }}>
                      {timeline.map((step, i) => (
                        <div key={step.day} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", animation: `hb-fade-in 0.2s ease ${i * 0.06}s both` }}>
                          <div style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "8px", background: `${path.accent}10`, border: `1px solid ${path.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "ui-monospace,monospace", fontSize: "0.65rem", color: path.accent, fontWeight: 700 }}>
                            D{step.day}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{step.title}</div>
                            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.4 }}>{step.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
          );
        })}
      </div>

      {/* 30/90/180 methodology */}
      <div id="methodology" data-anchor="methodology" className="hb-rich-section-label" style={{ color: "rgba(139,92,246,0.6)" }}>The Install Methodology</div>
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
      <div id="pattern" data-anchor="pattern" className="hb-rich-eyebrow" style={{ color: "#f59e0b" }}>Department Wrappers</div>
      <h2 className="hb-rich-headline">Department-level AI. Already running.</h2>
      <p className="hb-rich-sub">OutboundOS proved the pattern. Every department runs the same way: autonomous pods, shared governance, one human manager, zero daily intervention.</p>

      {/* ForgeCube hero — 6 faces: OutboundOS + 5 department wrappers */}
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto 0.25rem", aspectRatio: "1", minHeight: 260 }}>
        <ForgeCube
          products={WRAPPERS_CUBE_PRODUCTS}
          skipDust={true}
          showPopup={true}
          className="wrappers-cube"
        />
      </div>
      <div style={{ textAlign: "center", fontSize: "0.65rem", color: "rgba(255,255,255,0.28)", fontFamily: "ui-monospace,monospace", marginBottom: "1rem" }}>Click any face to see each wrapper in detail</div>

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

      <div id="outboundos" data-anchor="outboundos" className="hb-rich-section-label" style={{ color: "#10b981" }}>OutboundOS · Live in Production</div>
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
          <div key={w.name} id={w.name.toLowerCase().replace(/\s+/g, "")} data-anchor={w.name.toLowerCase().replace(/\s+/g, "")} className="hb-rich-ghost-card" style={{ borderColor: "rgba(255,255,255,0.06)", opacity: 0.45, scrollMarginTop: "1rem" }}>
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

// LLC_ENTITIES_DATA replaced by inline org chart in AboutModule (see hb-about-orgchart)

const PROOF_STATS_DATA = [
  { num: "20+", label: "Years Experience", color: "#f59e0b" },
  { num: "6", label: "Continents", color: "#10b981" },
  { num: "60+", label: "Countries", color: "#06b6d4" },
  { num: "138", label: "Workflows Live", color: "#8b5cf6" },
];

const FOUNDER_CREDENTIALS = [
  { name: "Microsoft", color: "#0078d4", desc: "Global enterprise ops" },
  { name: "Credit Suisse", color: "#004C97", desc: "Financial systems governance" },
  { name: "T-Mobile", color: "#E20074", desc: "Workforce transformation" },
  { name: "S&P Global", color: "#ef4444", desc: "Data intelligence at scale" },
];

function AboutModule() {
  const [credentialsVisible, setCredentialsVisible] = useState(false);
  const credRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = credRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCredentialsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#10b981" }}>Level9OS · The Company</div>
      <h2 className="hb-rich-headline">Operations is where the leverage lives.</h2>
      <p className="hb-rich-sub">A product company, not a consulting practice. We build production-grade AI systems for the operational layer.</p>

      {/* Proof stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {PROOF_STATS_DATA.map((s, i) => (
          <div key={s.label} style={{ textAlign: "center", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", animation: `hb-fade-in 0.4s ease ${i * 0.1}s both` }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.num}</div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "ui-monospace,monospace" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Origin with stagger-animated founder credentials */}
      <div className="hb-rich-section-label" style={{ color: "rgba(16,185,129,0.5)" }}>The Origin</div>
      <div className="hb-rich-card" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: "0.75rem" }}>
          Eric Hathaway built Level9OS from 20+ years of executive operating leadership. Six continents. Sixty countries. Deployments at scale across every kind of operating complexity.
        </p>
        {/* Founder credential logos with stagger */}
        <div ref={credRef} style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
          {FOUNDER_CREDENTIALS.map((cred, i) => (
            <div
              key={cred.name}
              style={{
                padding: "0.3rem 0.7rem",
                borderRadius: "6px",
                background: `${cred.color}0f`,
                border: `1px solid ${cred.color}30`,
                opacity: credentialsVisible ? 1 : 0,
                transform: credentialsVisible ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.4s ease ${i * 0.12}s, transform 0.4s ease ${i * 0.12}s`,
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: cred.color }}>{cred.name}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)" }}>{cred.desc}</div>
            </div>
          ))}
        </div>
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

      {/* LLC clarity — animated org chart */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Legal Structure</div>
      <div className="hb-about-orgchart" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", marginBottom: "0.75rem" }}>
        {/* Level9OS LLC — top (umbrella) */}
        <div style={{ padding: "0.6rem 1.25rem", borderRadius: "10px", background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", textAlign: "center", minWidth: "200px", animation: "hb-fade-in 0.4s ease" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8b5cf6" }}>Level9OS LLC</div>
          <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)" }}>Umbrella brand + consulting</div>
        </div>
        {/* Connector line */}
        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
        {/* Two children */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", position: "relative" }}>
          {/* Horizontal connector */}
          <div style={{ position: "absolute", top: 0, left: "50%", width: "calc(50% - 20px)", height: "1px", background: "rgba(255,255,255,0.1)", transform: "translateX(-100%)" }} />
          <div style={{ position: "absolute", top: 0, left: "50%", width: "calc(50% - 20px)", height: "1px", background: "rgba(255,255,255,0.1)" }} />
          {[
            { name: "LucidORG LLC", desc: "Commercial products", accent: "#06b6d4", note: "LinkUpOS, LucidORG, COO Playbook, StratOS" },
            { name: "NextGen Interns LLC", desc: "Education platform", accent: "#10b981", note: "COPPA-sensitive. Students + interns." },
          ].map((child, i) => (
            <div key={child.name} style={{ padding: "0.5rem 0.875rem", borderRadius: "8px", background: `${child.accent}07`, border: `1px solid ${child.accent}20`, textAlign: "center", flex: 1, animation: `hb-fade-in 0.4s ease ${0.2 + i * 0.1}s both` }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: child.accent }}>{child.name}</div>
              <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.35)", marginTop: "0.1rem" }}>{child.note}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "0.5rem", fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", fontFamily: "ui-monospace,monospace", textAlign: "center" }}>
          Three legally separate entities. Obligations under one do not cross to another.
        </div>
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
  const [dtActiveIdx, setDtActiveIdx] = useState(0);
  const [dtPaused, setDtPaused] = useState(false);

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

      {/* Orientation — 2-sentence guide for non-ops visitors */}
      <div style={{ marginBottom: "1rem", padding: "0.6rem 0.875rem", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "8px", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
        The architecture has 3 levels. This module walks you through all 3: how the layers fit together, how a single decision moves through the system, and what each layer produces.
      </div>

      {/* StackFlow: 4-layer hover-swap — structure */}
      <div id="stackflow" data-anchor="stackflow" className="hb-rich-section-label" style={{ color: "rgba(139,92,246,0.6)" }}>Level 1: How the four layers work together</div>
      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>Hover each layer to see: what goes in, what we do, what comes out.</div>
      <div style={{ width: "100%", margin: "0 0 1.5rem", overflow: "hidden", borderRadius: "14px", border: "1px solid rgba(139,92,246,0.08)" }}>
        <StackFlow />
      </div>

      {/* DecisionTrace: 8-stage auto-cycle — one decision in motion */}
      <div id="decisiontrace" data-anchor="decisiontrace" className="hb-rich-section-label" style={{ color: "rgba(6,182,212,0.6)" }}>Level 2: One decision through all 8 layers</div>
      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>A decision starts in Strategy, moves to Coordination, triggers Execution, gets measured by Outcomes.</div>
      <div style={{ width: "100%", margin: "0 0 1.5rem", overflow: "hidden", borderRadius: "14px", border: "1px solid rgba(6,182,212,0.08)" }}>
        <DecisionTrace
          activeIdx={dtActiveIdx}
          setActiveIdx={setDtActiveIdx}
          paused={dtPaused}
          setPaused={setDtPaused}
          inline={true}
        />
      </div>

      {/* Pressure points */}
      <div className="hb-rich-section-label" style={{ color: "rgba(139,92,246,0.6)" }}>Level 3: The 4 pressure points, mapped to layers and domains</div>
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

      {/* API bridge anchor */}
      <div id="bridge" data-anchor="bridge" style={{ scrollMarginTop: "1rem" }} />

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
      <div id="pillars" data-anchor="pillars" className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Three things that separate a production-grade AI operation from a demo</div>
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
            <div key={comp.id} id={comp.id} data-anchor={comp.id} style={{ borderRadius: "10px", overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", scrollMarginTop: "1rem" }}>
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

// Voice render: pending operator approval. Visual narrative is live.

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

// ─── 30s scene visuals ────────────────────────────────────────────────────────

function Wt30sScene0() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 320;
    const H = canvas.offsetHeight || 140;
    canvas.width = W;
    canvas.height = H;
    let frame = 0;
    let raf = 0;
    const dots: { x: number; y: number; r: number; phase: number; isError: boolean }[] = Array.from({ length: 28 }, (_, i) => ({
      x: 30 + (i % 7) * (W / 7) * 0.9,
      y: 30 + Math.floor(i / 7) * 30,
      r: 5,
      phase: (i * 0.7) % (Math.PI * 2),
      isError: i % 5 === 0,
    }));
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);
      const t = frame / 60;
      for (const d of dots) {
        const pulse = 0.7 + 0.3 * Math.sin(t * 2.2 + d.phase);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2);
        if (d.isError) {
          ctx.fillStyle = `rgba(239,68,68,${0.5 + 0.4 * pulse})`;
        } else {
          ctx.fillStyle = `rgba(100,116,139,${0.25 + 0.15 * pulse})`;
        }
        ctx.fill();
      }
      // label
      ctx.font = "500 11px ui-monospace,monospace";
      ctx.fillStyle = "rgba(239,68,68,0.7)";
      ctx.fillText("~20% error rate | no governance layer", 10, H - 14);
      frame++;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 140, display: "block" }} />;
}

function Wt30sScene1() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 320;
    const H = canvas.offsetHeight || 140;
    canvas.width = W;
    canvas.height = H;
    let frame = 0;
    let raf = 0;
    let count = 0;
    const target = 236;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);
      // animate count up over ~90 frames
      if (count < target && frame < 90) count = Math.round((frame / 90) * target);
      else count = target;
      // big stat
      ctx.font = "800 54px system-ui,sans-serif";
      ctx.fillStyle = "rgba(139,92,246,0.95)";
      ctx.textAlign = "center";
      ctx.fillText(String(count), W / 2, H / 2 + 14);
      ctx.font = "500 11px ui-monospace,monospace";
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillText("hours of operator time returned in 90 days", W / 2, H / 2 + 34);
      // pulsing ring
      const pulse = 0.5 + 0.5 * Math.sin(frame / 30);
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 52 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(139,92,246,${0.08 + pulse * 0.06})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.textAlign = "left";
      frame++;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 140, display: "block" }} />;
}

function Wt30sScene2() {
  // Show a compact 4-stat grid: the core product proof
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "8px 0" }}>
      {[
        { label: "Agents governed", val: "Any vendor", color: "#06b6d4" },
        { label: "Control plane", val: "1 unified", color: "#8b5cf6" },
        { label: "Deployment target", val: "10-50 people", color: "#10b981" },
        { label: "Monthly cost", val: "$499/mo", color: "#f59e0b" },
      ].map((s) => (
        <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}22`, borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ color: s.color, fontFamily: "ui-monospace,monospace", fontSize: "0.68rem", marginBottom: 2 }}>{s.label}</div>
          <div style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.95rem", fontWeight: 700 }}>{s.val}</div>
        </div>
      ))}
    </div>
  );
}

function Wt30sScene3() {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#10b981", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
        level9os.com
      </div>
      <div style={{ marginTop: 12, fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", fontFamily: "ui-monospace,monospace" }}>
        Your first AI operating system. Or your last one.
      </div>
    </div>
  );
}

// ─── 1:30 scene visuals ───────────────────────────────────────────────────────

// All 1:30 scenes use the live ConsoleGraphicLite as the primary visual.
// Each scene surfaces a different focus label so the visitor knows where to look.
const WT_1M30_FOCUS = [
  { label: "Agents at work", color: "#ef4444", note: "16 officers, 4 per bucket. Packets flow down to their bucket." },
  { label: "Error propagation", color: "#f59e0b", note: "No governance layer means errors compound silently." },
  { label: "Governance intercepts", color: "#8b5cf6", note: "Watch the Decide ring. Every decision gated before it ships." },
  { label: "Cross-bucket coordination", color: "#06b6d4", note: "Coordinate ring: agents scheduling, prioritizing, handing off." },
  { label: "Execute + measure", color: "#10b981", note: "OutboundOS executes. LucidORG measures every step." },
  { label: "One control plane", color: "#ec4899", note: "All 4 rings. All vendors. One audit trail." },
];

function Wt1m30Visual({ sceneIdx }: { sceneIdx: number }) {
  const focus = WT_1M30_FOCUS[sceneIdx] ?? WT_1M30_FOCUS[0];
  return (
    <div>
      <div style={{ padding: "6px 12px", background: `${focus.color}12`, borderBottom: `1px solid ${focus.color}20`, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: "0.6rem", fontFamily: "ui-monospace,monospace", color: focus.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{focus.label}</span>
        <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)" }}>{focus.note}</span>
      </div>
      <div style={{ pointerEvents: "none" }}>
        <ConsoleGraphicLite />
      </div>
    </div>
  );
}

// ─── 5min scene visuals ───────────────────────────────────────────────────────

// Scenes 0-1: CompoundingRiskWalkthrough (scenes 0 and 1 from that component)
// Scenes 2-5: DecisionTrace inline cycle
// Scenes 6-7: StackFlow
// Scene 8: ForgeCube (CTA)

function Wt5minCompoundingMini({ forceScene }: { forceScene: number }) {
  // Render CompoundingRiskWalkthrough but locked to a specific scene index
  // We do this by rendering a limited version
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 320;
    const H = canvas.offsetHeight || 150;
    canvas.width = W;
    canvas.height = H;
    let frame = 0;
    let raf = 0;
    const agentCount = forceScene === 0 ? 1 : 5;
    const errorRate = forceScene === 0 ? 0.2 : 0.9;
    const agents: { x: number; y: number; phase: number; errorPhase: number }[] = Array.from({ length: agentCount }, (_, i) => ({
      x: W / 2 + Math.cos((i / agentCount) * Math.PI * 2) * (agentCount === 1 ? 0 : 70),
      y: H / 2 + Math.sin((i / agentCount) * Math.PI * 2) * (agentCount === 1 ? 0 : 40),
      phase: (i / agentCount) * Math.PI * 2,
      errorPhase: Math.random() * Math.PI * 2,
    }));
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);
      const t = frame / 60;
      for (const a of agents) {
        // agent body
        ctx.beginPath();
        ctx.arc(a.x, a.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100,116,139,0.35)";
        ctx.fill();
        ctx.strokeStyle = "rgba(100,116,139,0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // error dot orbiting
        const isErrorActive = Math.sin(t * 1.8 + a.errorPhase) > (1 - errorRate * 2 - 1);
        if (isErrorActive) {
          const ex = a.x + Math.cos(t * 3 + a.phase) * 22;
          const ey = a.y + Math.sin(t * 3 + a.phase) * 22;
          ctx.beginPath();
          ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239,68,68,0.85)";
          ctx.fill();
        }
      }
      // running error counter
      const errCount = Math.round(errorRate * 100);
      ctx.font = "700 28px system-ui,sans-serif";
      ctx.fillStyle = `rgba(239,68,68,${0.75 + 0.2 * Math.sin(t * 2)})`;
      ctx.textAlign = "right";
      ctx.fillText(`${errCount}%`, W - 14, H - 14);
      ctx.font = "500 10px ui-monospace,monospace";
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillText("error rate", W - 14, H - 2);
      ctx.textAlign = "left";
      ctx.font = "500 10px ui-monospace,monospace";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`${agentCount} agent${agentCount > 1 ? "s" : ""}  no governance`, 10, H - 14);
      frame++;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [forceScene]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 150, display: "block" }} />;
}

function Wt5minCompetitionGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
      {[
        { name: "Microsoft Agent 365", cost: "~$1M/yr", color: "#64748b" },
        { name: "Salesforce Agentforce", cost: "~$850K/yr", color: "#64748b" },
        { name: "Workday ASOR", cost: "$500K/yr, HR only", color: "#64748b" },
        { name: "Level9OS", cost: "$499/mo", color: "#10b981", highlight: true },
      ].map((r) => (
        <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: r.highlight ? "#10b98112" : "#ffffff08", border: `1px solid ${r.highlight ? "#10b98130" : "#ffffff10"}`, borderRadius: 6, padding: "8px 12px" }}>
          <span style={{ fontSize: "0.78rem", color: r.highlight ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>{r.name}</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "ui-monospace,monospace", color: r.color }}>{r.cost}</span>
        </div>
      ))}
    </div>
  );
}

function Wt5minNumbersGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "8px 0" }}>
      {[
        { label: "Prevented rework (90 days)", val: "$52,686", color: "#06b6d4" },
        { label: "Monthly prevented cost", val: "$17,562/mo", color: "#06b6d4" },
        { label: "Operator time returned", val: "236 hrs", color: "#8b5cf6" },
        { label: "Governance infra cost", val: "$5.07/mo", color: "#10b981" },
      ].map((s) => (
        <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}22`, borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ color: s.color, fontFamily: "ui-monospace,monospace", fontSize: "0.62rem", marginBottom: 3 }}>{s.label}</div>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.0rem", fontWeight: 800 }}>{s.val}</div>
        </div>
      ))}
      <div style={{ gridColumn: "1 / -1", textAlign: "center", fontSize: "0.65rem", color: "rgba(255,255,255,0.28)", fontFamily: "ui-monospace,monospace" }}>
        3,464x return ratio. Production data, 299 sessions, 90 days.
      </div>
    </div>
  );
}

function Wt5minCtaVisual() {
  return (
    <div style={{ textAlign: "center", padding: "18px 0" }}>
      <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981", letterSpacing: "-0.03em", lineHeight: 1.1 }}>level9os.com</div>
      <div style={{ marginTop: 8, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontFamily: "ui-monospace,monospace" }}>
        We&apos;ll show you what&apos;s actually running.
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {["12 months", "18 months"].map((m) => (
          <div key={m} style={{ background: "#f59e0b14", border: "1px solid #f59e0b28", borderRadius: 6, padding: "5px 12px", fontSize: "0.72rem", color: "#f59e0b", fontFamily: "ui-monospace,monospace" }}>{m}</div>
        ))}
        <div style={{ background: "#ef444414", border: "1px solid #ef444428", borderRadius: 6, padding: "5px 12px", fontSize: "0.72rem", color: "#ef4444", fontFamily: "ui-monospace,monospace" }}>window closing</div>
      </div>
    </div>
  );
}

// ─── Scene visual router ──────────────────────────────────────────────────────

function WtSceneVisual({
  walkthroughId,
  sceneIdx,
  dtActiveIdx,
  dtPaused,
  setDtActiveIdx,
  setDtPaused,
}: {
  walkthroughId: WalkthroughId;
  sceneIdx: number;
  dtActiveIdx: number;
  dtPaused: boolean;
  setDtActiveIdx: (i: number) => void;
  setDtPaused: (p: boolean) => void;
}) {
  if (walkthroughId === "30s") {
    if (sceneIdx === 0) return <Wt30sScene0 />;
    if (sceneIdx === 1) return <Wt30sScene1 />;
    if (sceneIdx === 2) return <Wt30sScene2 />;
    return <Wt30sScene3 />;
  }

  if (walkthroughId === "1m30") {
    return <Wt1m30Visual sceneIdx={sceneIdx} />;
  }

  // 5min
  if (sceneIdx <= 1) return <Wt5minCompoundingMini forceScene={sceneIdx} />;
  if (sceneIdx === 2) return (
    <DecisionTrace
      activeIdx={dtActiveIdx}
      setActiveIdx={setDtActiveIdx}
      paused={dtPaused}
      setPaused={setDtPaused}
      inline
    />
  );
  if (sceneIdx === 3) return <Wt5minCompetitionGrid />;
  if (sceneIdx === 4) return <Wt5minNumbersGrid />;
  if (sceneIdx === 5) return (
    <DecisionTrace
      activeIdx={dtActiveIdx}
      setActiveIdx={setDtActiveIdx}
      paused={dtPaused}
      setPaused={setDtPaused}
      inline
    />
  );
  if (sceneIdx === 6) return (
    <div style={{ pointerEvents: "none" }}>
      <ConsoleGraphicLite />
    </div>
  );
  if (sceneIdx === 7) return <Wt5minCompetitionGrid />;
  return <Wt5minCtaVisual />;
}

// ─── WalkthroughPlayer ────────────────────────────────────────────────────────

function WalkthroughPlayer({ id, onClose }: { id: WalkthroughId; onClose: () => void }) {
  const scenes = WALKTHROUGH_SCENES[id];
  const [scene, setScene] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [dtActiveIdx, setDtActiveIdx] = useState(0);
  const [dtPaused, setDtPaused] = useState(false);
  const durations: Record<WalkthroughId, number> = { "30s": 7500, "1m30": 15000, "5min": 45000 };
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
        style={{ background: `${current.bg}0c`, borderColor: `${current.bg}22` }}
      >
        <div className="hb-wt-scene-label" style={{ color: current.bg }}>{current.label}</div>

        {/* Motion visual: the story */}
        <div className="hb-wt-visual">
          <WtSceneVisual
            walkthroughId={id}
            sceneIdx={scene}
            dtActiveIdx={dtActiveIdx}
            dtPaused={dtPaused}
            setDtActiveIdx={setDtActiveIdx}
            setDtPaused={setDtPaused}
          />
        </div>

        {/* Caption from voice pitch scripts */}
        <div className="hb-wt-caption">&ldquo;{current.caption}&rdquo;</div>
      </div>

      {/* Controls */}
      <div className="hb-wt-controls">
        <button className="hb-wt-nav" onClick={() => setScene((s) => Math.max(0, s - 1))} disabled={scene === 0}>
          &#8592;
        </button>
        <div className="hb-wt-dots">
          {scenes.map((_, i) => (
            <button
              key={i}
              className={`hb-wt-dot ${i === scene ? "active" : ""}`}
              style={i === scene ? { "--wt-dot-color": current.bg } as React.CSSProperties : {}}
              onClick={() => { setScene(i); setAutoplay(false); }}
            />
          ))}
        </div>
        <button className="hb-wt-nav" onClick={() => setScene((s) => Math.min(scenes.length - 1, s + 1))} disabled={scene === scenes.length - 1}>
          &#8594;
        </button>
        <button
          className="hb-wt-play"
          style={{ borderColor: `${current.bg}40`, color: current.bg }}
          onClick={() => setAutoplay(!autoplay)}
        >
          {autoplay ? "◾ Stop" : "▶ Auto-play"}
        </button>
      </div>
      <div className="hb-wt-progress">
        {scene + 1} / {scenes.length}
      </div>

      <button className="hb-wt-close" onClick={onClose}>&#8592; Back to walkthroughs</button>
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
      <p className="hb-rich-sub">Each walkthrough is motion-driven. The visual is the story. Captions are the pitch scripts verbatim.</p>
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

// ─── CompoundingRiskModule ─────────────────────────────────────────────────────

function CompoundingRiskModule({ onOpenModule }: { onOpenCounter?: () => void; onOpenModule?: (id: ModuleId) => void }) {
  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#ef4444" }}>Why Multi-Agent is Risky</div>
      <h2 className="hb-rich-headline">One agent: manageable.<br /><span style={{ color: "#ef4444" }}>Five agents: 90% error rate.</span></h2>
      <p className="hb-rich-sub">Scroll through seven scenes. See how errors compound, how governance flattens the curve, and what 95% reliability looks like at any agent count.</p>

      <CompoundingRiskWalkthrough
        onOpenCounter={() => onOpenModule?.("counter")}
        onOpenChat={() => onOpenModule?.("voice-pitch")}
      />

      <div style={{ marginTop: "1rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", fontFamily: "ui-monospace,monospace", lineHeight: 1.6, textAlign: "center" }}>
        Based on 299 real Claude Code sessions, 90 days of production data.
      </div>
    </div>
  );
}

// ─── Why Us vs Them — animated race walkthrough ───────────────────────────────

const RACE_CONTESTANTS = [
  { name: "Microsoft", badge: "~$1M/yr", color: "#64748b", wall: "6-month deploy" },
  { name: "Salesforce", badge: "~$850K/yr", color: "#94a3b8", wall: "Salesforce-locked" },
  { name: "Workday", badge: "~$500K/yr", color: "#78716c", wall: "HR/Finance only" },
  { name: "Level9OS", badge: "$499/mo", color: "#10b981", wall: null },
];

function WhyUsRaceModule() {
  const [scene, setScene] = useState(0);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto) return;
    if (scene >= 2) { setAuto(false); return; }
    const t = setTimeout(() => setScene((s) => s + 1), 3200);
    return () => clearTimeout(t);
  }, [auto, scene]);

  const SCENE_CAPTIONS = [
    "Four solutions. Same starting line. Very different price tags.",
    "Each one runs. The enterprise platforms hit walls: deploy time, vendor lock-in, scope limits.",
    "Level9OS crosses the finish line alone. 5 minutes to set up. Multi-vendor. SMB-ready. Pay less than we save you.",
  ];

  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#10b981" }}>Why Us vs Them</div>
      <h2 className="hb-rich-headline">The race is not even close.</h2>
      <p className="hb-rich-sub">30 seconds. Four contestants. One finish line.</p>

      {/* Race visual */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "1.25rem 1rem", marginBottom: "0.75rem" }}>
        {/* Caption */}
        <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "1rem", minHeight: "2.5rem", fontWeight: 500 }}>
          {SCENE_CAPTIONS[scene]}
        </div>

        {/* Race lanes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {RACE_CONTESTANTS.map((c, i) => {
            const isLevel9 = c.name === "Level9OS";
            const hitWall = scene >= 1 && !isLevel9;
            const finished = scene >= 2 && isLevel9;
            const barWidth = scene === 0 ? "8%" : hitWall ? `${20 + i * 8}%` : finished ? "96%" : "8%";

            return (
              <div key={c.name}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: isLevel9 ? c.color : "rgba(255,255,255,0.6)", minWidth: "80px" }}>{c.name}</span>
                  <span style={{ fontSize: "0.6rem", fontFamily: "ui-monospace,monospace", color: isLevel9 ? `${c.color}cc` : "rgba(255,255,255,0.3)", padding: "0.1rem 0.3rem", borderRadius: "4px", background: `${c.color}10`, border: `1px solid ${c.color}20` }}>{c.badge}</span>
                  {hitWall && c.wall && (
                    <span style={{ fontSize: "0.62rem", color: "#ef4444", fontFamily: "ui-monospace,monospace", animation: "hb-fade-in 0.4s ease" }}>
                      BLOCKED: {c.wall}
                    </span>
                  )}
                  {finished && (
                    <span style={{ fontSize: "0.62rem", color: "#10b981", fontFamily: "ui-monospace,monospace", fontWeight: 700, animation: "hb-fade-in 0.4s ease" }}>
                      PRODUCTION
                    </span>
                  )}
                </div>
                <div style={{ height: "10px", background: "rgba(255,255,255,0.04)", borderRadius: "99px", overflow: "hidden", position: "relative" }}>
                  <div style={{
                    height: "100%",
                    width: barWidth,
                    background: hitWall ? "#ef444440" : isLevel9 ? c.color : `${c.color}60`,
                    borderRadius: "99px",
                    transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: isLevel9 && finished ? `0 0 12px ${c.color}60` : undefined,
                  }} />
                  {hitWall && (
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: barWidth, width: "2px", background: "#ef4444", transition: "left 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scene controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
          {[0, 1, 2].map((s) => (
            <button key={s} onClick={() => { setScene(s); setAuto(false); }}
              style={{ width: "8px", height: "8px", borderRadius: "50%", background: s === scene ? "#10b981" : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", padding: 0, transition: "background 0.2s" }} />
          ))}
          <button
            onClick={() => { if (scene === 2) setScene(0); setAuto(true); }}
            style={{ marginLeft: "0.5rem", fontSize: "0.68rem", fontFamily: "ui-monospace,monospace", color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "6px", padding: "0.25rem 0.5rem", cursor: "pointer" }}
          >
            {auto ? "Running..." : scene === 2 ? "▶ Replay" : "▶ Auto-play"}
          </button>
        </div>
      </div>

      {/* Final line */}
      <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, padding: "0.75rem 1rem", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.14)", borderRadius: "10px" }}>
        5 minutes to set up. Multi-vendor from day one. SMB-ready. Pay less than we save you.
      </div>
    </div>
  );
}

// ─── Try It module ────────────────────────────────────────────────────────────

const PRICING_TIERS = [
  { name: "Free", price: "$0", period: "forever", highlight: false, color: "#64748b", what: "1 agent governance. 7 days full access, then 1 agent free." },
  { name: "Starter", price: "$99", period: "/mo", highlight: false, color: "#8b5cf6", what: "Up to 5 agents. Full audit trail. Cost routing." },
  { name: "Growth", price: "$499", period: "/mo", highlight: true, color: "#10b981", what: "Up to 20 agents. Department wrappers. SOC2 reporting." },
  { name: "Pro", price: "$1,499", period: "/mo", highlight: false, color: "#06b6d4", what: "Unlimited agents. Officer system. Custom governance." },
  { name: "Scale", price: "Custom", period: "", highlight: false, color: "#f59e0b", what: "Enterprise contracts. Dedicated support. SLA." },
];

function TryItModule() {
  return (
    <div className="hb-rich-module">
      <div className="hb-rich-eyebrow" style={{ color: "#10b981" }}>Try It</div>
      <h2 className="hb-rich-headline">Start for free. Pay us less than we save you.</h2>
      <p className="hb-rich-sub">No credit card to try it. No transformation language to get started. One agent live in under 5 minutes.</p>

      {/* Free Tier card */}
      <div className="hb-rich-card" style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)", marginBottom: "0.75rem" }}>
        <div className="hb-rich-card-bar" style={{ background: "#10b981" }} />
        <div className="hb-rich-card-head" style={{ marginBottom: "0.5rem" }}>
          <span className="hb-rich-tag" style={{ color: "#10b981" }}>Free Tier</span>
          <StatusBadge status="LIVE" />
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#10b981", marginBottom: "0.25rem" }}>1 agent governance. 7 days. No credit card.</h3>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
          Plug your Claude or GPT agent into the governance layer. Full audit trail from day one. Cost routing active. If it doesn&apos;t catch something worth the monthly fee in the first 7 days, you owe nothing.
        </p>
        <a
          href="/contact?path=startup&trial=free"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.55rem 1.25rem", borderRadius: "99px", background: "#10b981", color: "white", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" }}
        >
          Get the agent →
        </a>
      </div>

      {/* Sandbox card */}
      <div className="hb-rich-card" style={{ borderColor: "rgba(139,92,246,0.2)", marginBottom: "0.75rem" }}>
        <div className="hb-rich-card-bar" style={{ background: "#8b5cf6" }} />
        <div className="hb-rich-card-head" style={{ marginBottom: "0.5rem" }}>
          <span className="hb-rich-tag" style={{ color: "#8b5cf6" }}>Sandbox</span>
          <StatusBadge status="IN BUILD" />
        </div>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", marginBottom: "0.25rem" }}>Drop in your API key. Try MAX on your own AI tool.</h3>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
          No signup. Bring your Claude or GPT API key. The sandbox puts a live governance layer under your agent for a test run. See the audit trail in real time.
        </p>
        <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace", padding: "0.35rem 0.6rem", background: "rgba(139,92,246,0.06)", borderRadius: "6px", display: "inline-block" }}>
          Sandbox launching soon. Join the free tier to get notified first.
        </div>
      </div>

      {/* Pricing tiers */}
      <div className="hb-rich-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Transparent pricing. No surprises.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
        {PRICING_TIERS.map((tier) => (
          <div key={tier.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0.875rem", borderRadius: "10px", background: tier.highlight ? `${tier.color}0a` : "rgba(255,255,255,0.02)", border: tier.highlight ? `1px solid ${tier.color}35` : "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: tier.highlight ? tier.color : "rgba(255,255,255,0.8)" }}>{tier.name}</span>
              {tier.highlight && <span style={{ marginLeft: "0.4rem", fontSize: "0.6rem", fontFamily: "ui-monospace,monospace", padding: "0.1rem 0.35rem", borderRadius: "4px", background: `${tier.color}18`, color: tier.color, border: `1px solid ${tier.color}30` }}>Most popular</span>}
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "0.1rem" }}>{tier.what}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
              <span style={{ fontSize: "1rem", fontWeight: 900, color: tier.color, fontVariantNumeric: "tabular-nums" }}>{tier.price}</span>
              {tier.period && <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace" }}>{tier.period}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Money-back promise */}
      <div className="hb-rich-card" style={{ borderColor: "rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.04)" }}>
        <div className="hb-rich-card-bar" style={{ background: "#ef4444" }} />
        <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", marginBottom: "0.35rem" }}>Pay us less than we save you. Or your money back in 30 days.</h4>
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          If the governance layer doesn&apos;t prevent more than it costs inside the first 30 days, you get a full refund. No questions. No hoops.
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", fontFamily: "ui-monospace,monospace" }}>
          Our 90-day average: $52,686 prevented at $5.07/mo infra cost. Your mileage is proportional to your agent count and spend.
        </p>
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
  icp,
  icpProbability,
}: {
  moduleId: ModuleId;
  userAnswers: Record<string, unknown>;
  icp?: ICP;
  icpProbability?: IcpProbability;
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
      case "counter": return <CounterModule icp={icp} />;
      case "calculator":
        return (
          <CalculatorModule
            defaultEmployees={userAnswers.employees as number | undefined}
            defaultTools={userAnswers.tools as number | undefined}
            icpProbability={icpProbability}
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
      case "compounding-risk": return <CompoundingRiskModule />;
      case "try-it": return <TryItModule />;
      case "why-us-race": return <WhyUsRaceModule />;
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
      icp: partial.icp ?? null,
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
  // ── Universal chips (screens 1-2, surface regardless of ICP inference) ────────
  {
    id: "u-done-without-verify",
    label: "Has an agent ever said done before it actually was?",
    group: "D",
    universal: true,
    opensModule: "compounding-risk",
    icpAffinity: { solo: 0.8, smb: 0.9, growth: 0.85, enterprise: 0.75 },
  },
  {
    id: "u-cleaning-mistakes",
    label: "Watched your team spend hours cleaning up an agent mistake?",
    group: "D",
    universal: true,
    opensModule: "live-feed",
    icpAffinity: { solo: 0.7, smb: 0.9, growth: 0.9, enterprise: 0.8 },
  },
  {
    id: "u-bills-dont-make-sense",
    label: "Tired of AI bills that don't make sense?",
    group: "D",
    universal: true,
    opensModule: "calculator",
    icpAffinity: { solo: 0.9, smb: 0.85, growth: 0.8, enterprise: 0.7 },
  },
  {
    id: "u-dont-trust-ai",
    label: "Don't actually trust your AI yet?",
    group: "D",
    universal: true,
    opensModule: "governance",
    icpAffinity: { solo: 0.8, smb: 0.85, growth: 0.8, enterprise: 0.85 },
  },
  {
    id: "u-not-watching",
    label: "Worried about what your agents do when you're not watching?",
    group: "D",
    universal: true,
    opensModule: "compounding-risk",
    icpAffinity: { solo: 0.75, smb: 0.85, growth: 0.9, enterprise: 0.85 },
  },
  {
    id: "u-shipped-before-review",
    label: "Caught an agent shipping output before you reviewed it?",
    group: "D",
    universal: true,
    opensModule: "live-feed",
    icpAffinity: { solo: 0.75, smb: 0.9, growth: 0.85, enterprise: 0.8 },
  },

  // ── Group A: deep dives into seen modules ─────────────────────────────────────
  {
    id: "deep-live-feed",
    label: "That blocked event — want to see the audit log behind a $4,284 day?",
    group: "A",
    requiresModule: "live-feed",
    opensModule: "live-feed",
    icpAffinity: { solo: 0.7, smb: 0.85, growth: 0.8, enterprise: 0.75 },
  },
  {
    id: "deep-calculator",
    label: "Want to run the numbers against your real spend?",
    group: "A",
    requiresModule: "calculator",
    opensModule: "calculator",
    icpAffinity: { solo: 0.8, smb: 0.9, growth: 0.75, enterprise: 0.5 },
  },
  {
    id: "deep-article",
    label: "Want every receipt behind that $52,686 number?",
    group: "A",
    requiresModule: "article",
    opensModule: "article",
    icpAffinity: { solo: 0.6, smb: 0.9, growth: 0.7, enterprise: 0.6 },
  },
  {
    id: "deep-comparison",
    label: "Want to know exactly how each vendor was scored?",
    group: "A",
    requiresModule: "compare",
    opensModule: "compare",
    icpAffinity: { solo: 0.4, smb: 0.7, growth: 0.8, enterprise: 0.9 },
  },
  {
    id: "deep-voice",
    label: "Want to hear the full 5-minute pitch instead of reading it?",
    group: "A",
    requiresModule: "voice-pitch",
    opensModule: "voice-pitch",
    icpAffinity: { solo: 0.5, smb: 0.75, growth: 0.7, enterprise: 0.5 },
  },
  {
    id: "deep-products",
    label: "Want the full catalog: which product solves which problem?",
    group: "A",
    requiresModule: "products",
    opensModule: "products",
    icpAffinity: { solo: 0.5, smb: 0.75, growth: 0.85, enterprise: 0.8 },
  },
  {
    id: "deep-governance",
    label: "Want to see the 18-service governance chassis under the hood?",
    group: "A",
    requiresModule: "governance",
    opensModule: "governance",
    icpAffinity: { solo: 0.4, smb: 0.7, growth: 0.85, enterprise: 0.95 },
  },
  {
    id: "deep-paths",
    label: "Want to see the 30/90/180-day methodology behind each engagement path?",
    group: "A",
    requiresModule: "paths",
    opensModule: "paths",
    icpAffinity: { solo: 0.3, smb: 0.7, growth: 0.85, enterprise: 0.8 },
  },
  {
    id: "deep-architecture",
    label: "Want the full 8-layer architecture and how each layer maps to a pressure point?",
    group: "A",
    requiresModule: "architecture",
    opensModule: "architecture",
    icpAffinity: { solo: 0.3, smb: 0.5, growth: 0.8, enterprise: 0.95 },
  },

  // ── Group B: specific angles ───────────────────────────────────────────────────
  {
    id: "angle-single-vendor",
    label: "Running on one vendor and wondering if that's enough protection?",
    group: "B",
    icpAffinity: { solo: 0.8, smb: 0.7, growth: 0.5, enterprise: 0.3 },
  },
  {
    id: "angle-soc2",
    label: "Need continuous compliance state, not a once-a-year audit scramble?",
    group: "B",
    opensModule: "governance",
    icpAffinity: { solo: 0.2, smb: 0.4, growth: 0.75, enterprise: 0.95 },
  },
  {
    id: "angle-founder-vs-operator",
    label: "Are you the one building this, or the one accountable when it breaks?",
    group: "B",
    icpAffinity: { solo: 0.7, smb: 0.85, growth: 0.6, enterprise: 0.5 },
  },
  {
    id: "angle-wrapper",
    label: "Tired of rebuilding the same governance logic for every department?",
    group: "B",
    opensModule: "wrappers",
    icpAffinity: { solo: 0.2, smb: 0.5, growth: 0.85, enterprise: 0.9 },
  },
  {
    id: "angle-onboarding-room",
    label: "Legal, ops, and finance all need to sign off on AI. Is that slowing you down?",
    group: "B",
    icpAffinity: { solo: 0.1, smb: 0.4, growth: 0.75, enterprise: 0.95 },
  },
  {
    id: "angle-products-catalog",
    label: "What does each product actually solve? Catalog with the problem and the answer.",
    group: "B",
    opensModule: "products",
    icpAffinity: { solo: 0.5, smb: 0.75, growth: 0.85, enterprise: 0.75 },
  },
  {
    id: "angle-governance-vault",
    label: "Worried an agent will act on something it was never supposed to touch?",
    group: "B",
    opensModule: "governance",
    icpAffinity: { solo: 0.6, smb: 0.8, growth: 0.85, enterprise: 0.95 },
  },
  {
    id: "angle-compare-market",
    label: "How does Level9OS actually sit relative to everything else out there?",
    group: "B",
    opensModule: "compare",
    icpAffinity: { solo: 0.4, smb: 0.65, growth: 0.8, enterprise: 0.9 },
  },
  {
    id: "angle-about-company",
    label: "Want to know who built this and why it was painful enough to warrant building?",
    group: "B",
    opensModule: "about",
    icpAffinity: { solo: 0.7, smb: 0.75, growth: 0.5, enterprise: 0.4 },
  },
  {
    id: "angle-paths-entry",
    label: "Not sure where to start? Three entry points. One will fit where you are right now.",
    group: "B",
    opensModule: "paths",
    icpAffinity: { solo: 0.6, smb: 0.75, growth: 0.7, enterprise: 0.6 },
  },
  {
    id: "angle-wrappers-pods",
    label: "Does your revenue motion have parts that keep breaking because AI can't coordinate them?",
    group: "B",
    opensModule: "wrappers",
    icpAffinity: { solo: 0.15, smb: 0.5, growth: 0.85, enterprise: 0.8 },
  },
  {
    id: "angle-try-it",
    label: "Want to run one agent under real governance for a week before committing?",
    group: "B",
    opensModule: "try-it",
    icpAffinity: { solo: 0.9, smb: 0.7, growth: 0.5, enterprise: 0.3 },
  },
  {
    id: "angle-try-it-solo",
    label: "Can one person actually run this without a team?",
    group: "B",
    opensModule: "try-it",
    icpTags: ["solo", "smb"],
    icpAffinity: { solo: 0.95, smb: 0.7, growth: 0.3, enterprise: 0.1 },
  },
  {
    id: "angle-try-it-growth",
    label: "What does an eval setup look like for a team already running multiple agents?",
    group: "B",
    opensModule: "try-it",
    icpTags: ["growth", "enterprise"],
    icpAffinity: { solo: 0.1, smb: 0.3, growth: 0.85, enterprise: 0.9 },
  },

  // ── Group C: personalization questions ────────────────────────────────────────
  {
    id: "qual-ai-tool",
    label: "What AI tool is causing you the most headaches right now?",
    group: "C",
    icpAffinity: { solo: 0.7, smb: 0.8, growth: 0.75, enterprise: 0.6 },
  },
  {
    id: "qual-team-size",
    label: "How many people are touching your AI workflows daily?",
    group: "C",
    icpAffinity: { solo: 0.5, smb: 0.8, growth: 0.85, enterprise: 0.7 },
  },
  {
    id: "qual-refix-loop",
    label: "What is the rework loop that keeps coming back no matter what you do?",
    group: "C",
    icpAffinity: { solo: 0.7, smb: 0.85, growth: 0.8, enterprise: 0.65 },
  },
  {
    id: "qual-spend",
    label: "How much are you spending on AI monthly — roughly?",
    group: "C",
    icpAffinity: { solo: 0.75, smb: 0.85, growth: 0.8, enterprise: 0.55 },
  },
  {
    id: "qual-vendors",
    label: "Are your AI tools talking to each other, or is everything siloed?",
    group: "C",
    icpAffinity: { solo: 0.4, smb: 0.65, growth: 0.9, enterprise: 0.85 },
  },

  // ── Group D: reveal / surprise factor ─────────────────────────────────────────
  {
    id: "reveal-lie-catch",
    label: "Feel like your agents are lying to you? We catch that. Want to see a real intercept?",
    group: "D",
    opensModule: "live-feed",
    icpAffinity: { solo: 0.75, smb: 0.85, growth: 0.8, enterprise: 0.75 },
  },
  {
    id: "reveal-block-demo",
    label: "Ever had an agent send something it absolutely should not have? We block that before it leaves.",
    group: "D",
    opensModule: "live-feed",
    icpAffinity: { solo: 0.65, smb: 0.8, growth: 0.85, enterprise: 0.9 },
  },
  {
    id: "reveal-receipt",
    label: "Want the single page that explains the $52,686 number?",
    group: "D",
    opensModule: "counter",
    icpAffinity: { solo: 0.6, smb: 0.9, growth: 0.75, enterprise: 0.6 },
  },
  {
    id: "reveal-compounding-risk",
    label: "Do you know what happens to your error rate when you go from one agent to five?",
    group: "D",
    opensModule: "compounding-risk",
    icpAffinity: { solo: 0.6, smb: 0.85, growth: 0.9, enterprise: 0.8 },
  },
  {
    id: "reveal-architecture-layers",
    label: "Curious why every AI platform you've tried still leaks risk? Eight layers explain it.",
    group: "D",
    opensModule: "architecture",
    icpAffinity: { solo: 0.3, smb: 0.5, growth: 0.8, enterprise: 0.95 },
  },
  {
    id: "reveal-compare-ai-wrapper",
    label: "Your current AI platform — is it governing your agents, or just wrapping them?",
    group: "D",
    opensModule: "compare",
    icpAffinity: { solo: 0.4, smb: 0.65, growth: 0.85, enterprise: 0.95 },
  },
  {
    id: "angle-why-us-race",
    label: "Want to watch Level9OS race Microsoft, Salesforce, and Workday on price and coverage?",
    group: "D",
    opensModule: "why-us-race",
    icpAffinity: { solo: 0.4, smb: 0.7, growth: 0.85, enterprise: 0.9 },
  },

  // ── Group E: conversion gates (appear after 4+ modules unlocked) ──────────────
  {
    id: "gate-60s-pitch",
    label: "Tired of figuring this out yourself? Hear the 60-second version.",
    group: "E",
    opensModule: "voice-pitch",
    icpAffinity: { solo: 0.6, smb: 0.8, growth: 0.7, enterprise: 0.5 },
  },
  {
    id: "gate-talk-person",
    label: "Done researching. Ready to talk to the person who built this?",
    group: "E",
    action: "cta-person",
    icpAffinity: { solo: 0.5, smb: 0.8, growth: 0.85, enterprise: 0.75 },
  },

  // ── ICP solo: solo-specific entry ──────────────────────────────────────────────
  {
    id: "f-try-it-solo",
    label: "Can one person actually run this without a team?",
    group: "B",
    opensModule: "try-it",
    icpTags: ["solo"],
    icpAffinity: { solo: 0.95, smb: 0.4, growth: 0.1, enterprise: 0.05 },
  },

  // ── Sub-anchor deep dives (Phase 2 pool expansion) ────────────────────────────
  {
    id: "anchor-gov-lie-detector",
    label: "Tired of an agent making things up?",
    group: "D",
    opensModule: "governance",
    anchor: "lie-detector",
    icpAffinity: { solo: 0.85, smb: 0.9, growth: 0.85, enterprise: 0.8 },
  },
  {
    id: "anchor-gov-cost-router",
    label: "Watched costs blow up overnight?",
    group: "D",
    opensModule: "governance",
    anchor: "cost-router",
    icpAffinity: { solo: 0.9, smb: 0.85, growth: 0.75, enterprise: 0.6 },
  },
  {
    id: "anchor-gov-audit-trail",
    label: "Lost track of which agent did what?",
    group: "B",
    opensModule: "governance",
    anchor: "audit-trail",
    icpAffinity: { solo: 0.55, smb: 0.75, growth: 0.9, enterprise: 0.95 },
  },
  {
    id: "anchor-gov-trust-scores",
    label: "How do you know which agent to trust?",
    group: "D",
    opensModule: "governance",
    anchor: "trust-scores",
    icpAffinity: { solo: 0.7, smb: 0.8, growth: 0.85, enterprise: 0.9 },
  },
  {
    id: "anchor-gov-officer-system",
    label: "Who reviews what your agents do before it ships?",
    group: "B",
    opensModule: "governance",
    anchor: "officer-system",
    icpAffinity: { solo: 0.4, smb: 0.65, growth: 0.85, enterprise: 0.95 },
  },
  {
    id: "anchor-compare-microsoft",
    label: "Can you actually replace Microsoft for this?",
    group: "B",
    opensModule: "compare",
    anchor: "microsoft",
    icpAffinity: { solo: 0.25, smb: 0.55, growth: 0.8, enterprise: 0.9 },
  },
  {
    id: "anchor-compare-salesforce",
    label: "What about Salesforce's version?",
    group: "B",
    opensModule: "compare",
    anchor: "salesforce",
    icpAffinity: { solo: 0.2, smb: 0.5, growth: 0.8, enterprise: 0.9 },
  },
  {
    id: "anchor-compare-pillars",
    label: "What does a production-grade AI operation actually need?",
    group: "B",
    opensModule: "compare",
    anchor: "pillars",
    icpAffinity: { solo: 0.5, smb: 0.7, growth: 0.85, enterprise: 0.9 },
  },
  {
    id: "anchor-wrappers-outboundos",
    label: "What does an entire department of agents even look like?",
    group: "D",
    opensModule: "wrappers",
    anchor: "outboundos",
    icpAffinity: { solo: 0.4, smb: 0.85, growth: 0.9, enterprise: 0.8 },
  },
  {
    id: "anchor-wrappers-financeos",
    label: "When will finance get this?",
    group: "B",
    opensModule: "wrappers",
    anchor: "financeos",
    icpAffinity: { solo: 0.2, smb: 0.55, growth: 0.8, enterprise: 0.9 },
  },
  {
    id: "anchor-arch-bridge",
    label: "How does this plug into my existing stack?",
    group: "B",
    opensModule: "architecture",
    anchor: "bridge",
    icpAffinity: { solo: 0.35, smb: 0.6, growth: 0.85, enterprise: 0.9 },
  },
  {
    id: "anchor-arch-decisiontrace",
    label: "How does a real decision actually move through your system?",
    group: "B",
    opensModule: "architecture",
    anchor: "decisiontrace",
    icpAffinity: { solo: 0.3, smb: 0.55, growth: 0.8, enterprise: 0.9 },
  },
  {
    id: "anchor-paths-startup",
    label: "Just getting started. Where do I begin?",
    group: "B",
    opensModule: "paths",
    anchor: "startup",
    icpAffinity: { solo: 0.9, smb: 0.85, growth: 0.45, enterprise: 0.2 },
  },
  {
    id: "anchor-paths-growth",
    label: "How fast can a growing team really get this in?",
    group: "B",
    opensModule: "paths",
    anchor: "growth",
    icpAffinity: { solo: 0.35, smb: 0.75, growth: 0.95, enterprise: 0.6 },
  },
  {
    id: "anchor-paths-methodology",
    label: "What does 30/90/180 days actually look like in practice?",
    group: "B",
    opensModule: "paths",
    anchor: "methodology",
    icpAffinity: { solo: 0.3, smb: 0.65, growth: 0.85, enterprise: 0.8 },
  },
];

// ─── Pool engine ───────────────────────────────────────────────────────────────

interface PoolEngineState {
  unlockedModules: ModuleId[];
  closedTabs: ModuleId[];
  poolHistory: string[];
  lastGroupShown?: PoolGroup;
  userAnswers: Record<string, unknown>;
  icp?: ICP;
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
    icp,
  } = engineState;

  const unlockCount = unlockedModules.length;
  const allPrimariesUnlocked = MODULE_ORDER.every((m) =>
    unlockedModules.includes(m)
  );

  // Filter the pool to candidates
  const candidates = CONTENT_POOL.filter((p) => {
    // Skip if shown recently
    if (poolHistory.includes(p.id)) return false;
    // Universal chips are handled by INITIAL_4_CHIPS / slot 4 rotation, not the pool engine
    if (p.universal) return false;
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
    // ICP filter: if prompt has icpTags and we have a detected ICP, only show if ICP matches
    if (p.icpTags && icp && !p.icpTags.includes(icp)) return false;
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

// ─── Probability ranking engine ───────────────────────────────────────────────

type IcpKey = keyof IcpProbability;
const ICP_KEYS: IcpKey[] = ["solo", "smb", "growth", "enterprise"];

/** Renormalize a probability object so values sum to 1.0 */
function normalizeProbability(p: IcpProbability): IcpProbability {
  const total = ICP_KEYS.reduce((s, k) => s + p[k], 0);
  if (total === 0) return { ...UNIFORM_ICP_PROB };
  return {
    solo: p.solo / total,
    smb: p.smb / total,
    growth: p.growth / total,
    enterprise: p.enterprise / total,
  };
}

/**
 * Explicit nudge: visitor clicked an ICP chip.
 * Named ICP → 0.70, others split 0.30 equally.
 */
function explicitIcpNudge(icp: NonNullable<ICP>): IcpProbability {
  const others = (1 - 0.7) / (ICP_KEYS.length - 1);
  return normalizeProbability({
    solo: icp === "solo" ? 0.7 : others,
    smb: icp === "smb" ? 0.7 : others,
    growth: icp === "growth" ? 0.7 : others,
    enterprise: icp === "enterprise" ? 0.7 : others,
  });
}

/**
 * Implicit nudge: visitor clicked a chip with icpAffinity.
 * Bayesian-style update with learning rate 0.05.
 * new_prob = (1 - lr) * current + lr * affinity_normalized
 */
function implicitIcpNudge(
  current: IcpProbability,
  affinity: IcpProbability,
  learningRate = 0.05
): IcpProbability {
  const normalizedAffinity = normalizeProbability(affinity);
  return normalizeProbability({
    solo: (1 - learningRate) * current.solo + learningRate * normalizedAffinity.solo,
    smb: (1 - learningRate) * current.smb + learningRate * normalizedAffinity.smb,
    growth: (1 - learningRate) * current.growth + learningRate * normalizedAffinity.growth,
    enterprise: (1 - learningRate) * current.enterprise + learningRate * normalizedAffinity.enterprise,
  });
}

/**
 * Decay: drift back toward uniform by 5% per decay tick.
 * Fires every 10 clicks or on idle.
 */
function decayIcpProbability(current: IcpProbability, rate = 0.05): IcpProbability {
  return normalizeProbability({
    solo: current.solo * (1 - rate) + UNIFORM_ICP_PROB.solo * rate,
    smb: current.smb * (1 - rate) + UNIFORM_ICP_PROB.smb * rate,
    growth: current.growth * (1 - rate) + UNIFORM_ICP_PROB.growth * rate,
    enterprise: current.enterprise * (1 - rate) + UNIFORM_ICP_PROB.enterprise * rate,
  });
}

/** Return the ICP key with the highest probability in a distribution */
function dominantIcp(p: IcpProbability): IcpKey {
  return ICP_KEYS.reduce((best, k) => (p[k] > p[best] ? k : best), ICP_KEYS[0]);
}

interface ChipScoringContext {
  icpProbability: IcpProbability;
  poolHistory: string[];
  closedTabs: ModuleId[];
}

/** Score a single chip against the current visitor state */
function scoreChip(chip: PoolPrompt, ctx: ChipScoringContext): number {
  const affinity = chip.icpAffinity ?? UNIFORM_ICP_PROB;
  const affinityScore = ICP_KEYS.reduce(
    (sum, k) => sum + affinity[k] * ctx.icpProbability[k],
    0
  );
  const recencyPenalty = ctx.poolHistory.includes(chip.id) ? -0.3 : 0;
  const closedTabBoost = chip.opensModule && ctx.closedTabs.includes(chip.opensModule) ? 0.2 : 0;
  const universalBonus = chip.universal ? 0.1 : 0;
  return affinityScore + recencyPenalty + closedTabBoost + universalBonus;
}

/**
 * Probability-ranked chip selection with diversification in slot 4.
 * Slots 1-3: top 3 chips by score.
 * Slot 4: highest-scoring chip whose dominant ICP differs from slot 1's dominant ICP.
 */
function getRankedChips(
  candidates: PoolPrompt[],
  ctx: ChipScoringContext,
  count = 4
): PoolPrompt[] {
  const scored = candidates
    .map((c) => ({ chip: c, score: scoreChip(c, ctx) }))
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, count - 1).map((s) => s.chip);

  // Slot 4: diversification — different dominant ICP from slot 1
  const slot1Dominant = top.length > 0 ? dominantIcp(top[0].icpAffinity ?? UNIFORM_ICP_PROB) : null;
  const diverseChip = scored
    .slice(count - 1)
    .find(
      (s) =>
        !top.includes(s.chip) &&
        (slot1Dominant === null || dominantIcp(s.chip.icpAffinity ?? UNIFORM_ICP_PROB) !== slot1Dominant)
    );

  if (diverseChip) {
    top.push(diverseChip.chip);
  } else {
    // No diverse chip available — fall back to next highest scorer
    const fallback = scored.find((s) => !top.includes(s.chip));
    if (fallback) top.push(fallback.chip);
  }

  return top;
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

  const [icp, setIcp] = useState<ICP>(null);
  const [icpProbability, setIcpProbability] = useState<IcpProbability>({ ...UNIFORM_ICP_PROB });
  // Click counter for decay ticks (decay fires every 10 clicks)
  const clickCount = useRef(0);

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
      if (saved.icp) setIcp(saved.icp);
      if (saved.icpProbability) setIcpProbability(saved.icpProbability);
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
      "Hi. Your AI agents are running. But nobody is watching them yet. Before I show you what that costs, one question: how big is your operation?"
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
      icp,
      icpProbability,
    });
  }, [messages, unlockedModules, activeModule, userAnswers, isSkipped, closedTabs, poolHistory, engagementLevel, lastPlayfulLabel, icp, icpProbability]);

  // ICP probability idle decay — fires every 5 minutes of inactivity
  useEffect(() => {
    const IDLE_DECAY_MS = 5 * 60 * 1000; // 5 minutes
    const interval = setInterval(() => {
      const idleMs = Date.now() - lastVisitorActivity.current;
      if (idleMs >= IDLE_DECAY_MS) {
        setIcpProbability((prev) => decayIcpProbability(prev));
      }
    }, IDLE_DECAY_MS);
    return () => clearInterval(interval);
  }, []);

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
    { patterns: ["compare", "alternative", "versus", " vs ", "competitor", "comparison"], moduleId: "compare" },
    { patterns: ["audit", "log", "trail", "events", "feed"], moduleId: "live-feed" },
    { patterns: ["article", "read", "story", "case study"], moduleId: "article" },
    { patterns: ["voice", "listen", "audio", "pitch", "MAX", "talk to my operation"], moduleId: "voice-pitch" },
    { patterns: ["number", "roi", "saving", "52686", "52,686"], moduleId: "counter" },
    { patterns: ["wrapper", "outbound", "finance", "sales", "wrapper-story", "wrapper story"], moduleId: "wrappers" },
    { patterns: ["product", "catalog", "what do you build", "what you build"], moduleId: "products" },
    { patterns: ["lie detector", "lying", "fact check", "auto doc", "library", "documentation", "trust score", "promotion", "officer", "CoS", "COO", "management team"], moduleId: "governance" },
    { patterns: ["governance", "vault", "compliance", "soc2", "security", "policy"], moduleId: "governance" },
    { patterns: ["path", "start", "how to start", "onboard", "get started", "first step"], moduleId: "paths" },
    { patterns: ["about", "who are you", "company", "team", "history", "founded"], moduleId: "about" },
    { patterns: ["architecture", "how it works", "layers", "stack", "pressure point", "design"], moduleId: "architecture" },
    { patterns: ["multi-agent risk", "compounding", "agent risk", "why is this risky", "what could go wrong", "risky", "5 agents", "multiple agents"], moduleId: "compounding-risk" },
    { patterns: ["try it", "free tier", "free trial", "trial", "sandbox", "try free", "no credit card", "pricing", "money back", "how much does it cost", "cost to start"], moduleId: "try-it" },
    { patterns: ["why us", "who wins", "race", "vs them", "why not microsoft", "why level9", "beat them", "who beats", "competitive"], moduleId: "why-us-race" },
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
      // Increment engagement ladder and track for decay tick
      setEngagementLevel((prev) => prev + 1);
      clickCount.current += 1;
      // Decay probability every 10 clicks to prevent misclick lock-in
      if (clickCount.current % 10 === 0) {
        setIcpProbability((prev) => decayIcpProbability(prev));
      }

      if (replyId === "restart") {
        clearState();
        window.location.reload();
        return;
      }

      // ICP detection chip handling — explicit nudge
      if (replyId.startsWith("icp-")) {
        const detectedIcp = replyId.replace("icp-", "") as NonNullable<ICP>;
        addMessage({ role: "user", content: replyLabel });
        setIcp(detectedIcp);
        // Explicit nudge: named ICP → 0.70
        setIcpProbability(explicitIcpNudge(detectedIcp));
        const confirmMessages: Record<NonNullable<ICP>, string> = {
          solo: "Got it. Building alone means every wasted hour is yours. Let me show you what's actually worth your time here.",
          smb: "Got it. You're patching it together and you know something isn't right. Here's what the problem costs and what fixes it.",
          growth: "Got it. Growing fast means agent mistakes scale with you. Let me show you the most relevant angles for where you are.",
          enterprise: "Got it. Evaluating without getting locked in is the right posture. Here's what we surface for teams your size.",
        };
        await agentSay(confirmMessages[detectedIcp], 200);
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
        // Track universal chip for rotation (avoids same chip back-to-back in slot 4)
        if (poolPrompt.universal) {
          setLastPlayfulLabel(replyLabel);
        }
        // Implicit ICP nudge: chip affinity shifts probability toward its weights
        if (poolPrompt.icpAffinity) {
          setIcpProbability((prev) => implicitIcpNudge(prev, poolPrompt.icpAffinity!));
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
          // Scroll to anchor if specified (after module renders)
          if (poolPrompt.anchor) {
            setTimeout(() => {
              const el = document.getElementById(poolPrompt.anchor!);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 600);
          }
        } else {
          // Conversational response for non-module pool prompts
          const responses: Record<string, string> = {
            // Universal chips route to modules so these are fallback text-only paths
            "u-done-without-verify": "Yes. Every time. The done-claim-without-verify loop is the most common failure we see. The Stop hook blocks it at the source. Want to see it live?",
            "u-cleaning-mistakes": "That cleanup cost is the number nobody talks about. An agent makes a confident mistake. Someone spends two hours undoing it. We intercept before the mistake leaves. Want to see the live feed?",
            "u-bills-dont-make-sense": "They don't make sense because there's no routing layer. Your agents are spending premium tokens on work that costs a tenth as much on a different model. The cost router fixes that.",
            "u-dont-trust-ai": "That's the right instinct. Trust should be earned with evidence, not assumed. The governance layer is how you get from instinct to proof. Want to see what runs under the hood?",
            "u-not-watching": "They do things you didn't ask for. They touch files they were not supposed to touch. They claim done on work that isn't done. The Live Feed shows you exactly what happened while you were away.",
            "u-shipped-before-review": "That's the Stop hook failure. An agent reached a decision point, didn't wait for your sign-off, and shipped anyway. We block that. Want to see a real intercept?",
            "angle-single-vendor": "Single-vendor shops still benefit. The governance layer routes within that vendor. The real difference is audit fidelity. Multi-vendor adds routing intelligence on top of that.",
            "angle-soc2": "The 18-service grouping maps each service to a control domain. Every governance hook generates an event log entry. That log is the audit trail. Want to see the coverage breakdown?",
            "angle-founder-vs-operator": "Founders care about the moat. Operators care about the rework loop. Same product, different entry point. Which lens is yours?",
            "angle-onboarding-room": "The room brings in multiple stakeholders, each with a different view. Legal sees contracts. Ops sees workflows. Finance sees spend. All in one session. That is the demo most teams ask for second.",
            "qual-ai-tool": "Whatever tool you are running, we plug in at the governance layer, not the application layer. The tool does not change. What changes is what happens when the tool tries to do something risky.",
            "qual-team-size": "At 5 people, one flub event can cost a week of rework. At 20, it is usually a department. At 50, it compounds across teams. The governance layer scales linearly. Your risk does not.",
            "qual-refix-loop": "The most common one we see is the done-claim-without-verify loop. Agent says done. Nobody checks. Something breaks downstream. We block the done-claim at the source.",
            "qual-spend": "If you are spending more than $500 a month on AI, the ROI math on governance starts working in your favor almost immediately. The $5.07 infrastructure cost is not a typo.",
            "qual-vendors": "Multi-vendor setups get more value from the routing layer. We can show you the routing policy logic if you want.",
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
     closedTabs, poolHistory, lastGroupShown, userAnswers, recordActivity, recordPoolShown, setIcp, setIcpProbability]
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

  // ── ICP detection chips — shown before any ICP is set ───────────────────────
  const ICP_DETECTION_CHIPS: { id: string; label: string; icp: ICP }[] = [
    { id: "icp-solo", label: "Just me. I'm building this alone.", icp: "solo" },
    { id: "icp-smb", label: "Small team. We're patching it together.", icp: "smb" },
    { id: "icp-growth", label: "Growing fast. Things are starting to break.", icp: "growth" },
    { id: "icp-enterprise", label: "Big org. I need to evaluate without getting locked in.", icp: "enterprise" },
  ];

  // ── ICP-adapted initial chip sets ────────────────────────────────────────────
  const ICP_CHIPS: Record<NonNullable<ICP>, { id: string; label: string }[]> = {
    solo: [
      { id: "compounding-risk", label: "What goes wrong when I add a second agent?" },
      { id: "calculator", label: "Is $580/month in wasted AI spend real for someone my size?" },
      { id: "f-try-it-solo", label: "Can one person run this without a team?" },
      { id: "u-bills-dont-make-sense", label: "Tired of AI bills that don't make sense?" },
    ],
    smb: [
      { id: "counter", label: "Show me the $52,686 number with receipts." },
      { id: "calculator", label: "How much am I losing with my current setup?" },
      { id: "compounding-risk", label: "What does the failure look like when agents compound?" },
      { id: "u-cleaning-mistakes", label: "Watched your team spend hours cleaning up agent mistakes?" },
    ],
    growth: [
      { id: "compounding-risk", label: "Do you know what your error rate is across five agents right now?" },
      { id: "architecture", label: "How does governance sit on top of tools you already have?" },
      { id: "wrappers", label: "Can each department get its own governed agent layer?" },
      { id: "u-not-watching", label: "Worried about what your agents do when you're not watching?" },
    ],
    enterprise: [
      { id: "governance", label: "Is compliance state continuous, or do you scramble once a year?" },
      { id: "compare", label: "How do you sit relative to Microsoft, Salesforce, and Workday?" },
      { id: "architecture", label: "Does this require rebuilding what we already have?" },
      { id: "u-dont-trust-ai", label: "Don't actually trust your AI yet?" },
    ],
  };

  // ── Engagement-aware suggested replies ──────────────────────────────────────
  // Level 0-2: initial 4 chips (positional spec from Phase 1)
  // Level 3-5: slot 3 becomes a yes/no question from MAX
  // Level 6+:  slot 3 becomes a MAX guess prompt
  const INITIAL_4_CHIPS: { id: string; label: string }[] = [
    { id: "u-done-without-verify", label: "Has an agent ever said done before it actually was?" },
    { id: "u-bills-dont-make-sense", label: "Tired of AI bills that don't make sense?" },
    { id: "u-dont-trust-ai", label: "Don't actually trust your AI yet?" },
    { id: "u-not-watching", label: "Worried about what your agents do when you're not watching?" },
  ];
  const YES_NO_QUESTIONS: { id: string; label: string }[] = [
    { id: "yn-multi-vendor", label: "Are you on multiple AI vendors right now?" },
    { id: "yn-existing-stack", label: "Does your team already have an AI governance layer?" },
    { id: "yn-growth-stage", label: "Are you a growth-stage team (10-50 people)?" },
  ];
  // Group F (playful) is retired. Slot 4 at low engagement now rotates universal pain hooks.
  const UNIVERSAL_IDS = ["u-done-without-verify", "u-cleaning-mistakes", "u-bills-dont-make-sense", "u-dont-trust-ai", "u-not-watching", "u-shipped-before-review"];

  function pickUniversalChip(exclude?: string): { id: string; label: string } {
    const pool = CONTENT_POOL.filter((p) => UNIVERSAL_IDS.includes(p.id) && p.label !== exclude);
    const pick = pool[Math.floor(Date.now() / 1000) % pool.length] ?? pool[0];
    return { id: pick.id, label: pick.label };
  }

  const suggestedReplies = typing ? [] : (() => {
    const allPrimariesUnlocked = MODULE_ORDER.every((m) => unlockedModules.includes(m));
    const scoringCtx: ChipScoringContext = { icpProbability, poolHistory, closedTabs };

    // All primaries unlocked: probability-ranked pool + restart
    if (allPrimariesUnlocked) {
      const candidates = getPoolSuggestions({
        unlockedModules, closedTabs, poolHistory, lastGroupShown, userAnswers, icp,
      }, 20); // get broad set, then rank
      const ranked = getRankedChips(candidates, scoringCtx, 3);
      const replies: { id: string; label: string }[] = ranked.map((p) => ({ id: p.id, label: p.label }));
      replies.push({ id: "restart", label: "Start over" });
      return replies.slice(0, 4);
    }

    // Screen 1: ICP detection chips always appear first (no universal-first override)
    if (unlockedModules.length === 0 && !isSkipped && icp === null) {
      return ICP_DETECTION_CHIPS.map((c) => ({ id: c.id, label: c.label }));
    }

    // ICP detected, no modules yet: show ICP-adapted chips
    // (probability engine then runs from Screen 2 onward)
    if (unlockedModules.length === 0 && !isSkipped && icp !== null) {
      return ICP_CHIPS[icp].slice(0, 4);
    }

    // Modules unlocked: probability-ranked pool with diversification slot 4
    if (unlockedModules.length > 0) {
      const poolCandidates = getPoolSuggestions({
        unlockedModules, closedTabs, poolHistory, lastGroupShown, userAnswers, icp,
      }, 20); // broad candidate set for ranking
      const ranked = getRankedChips(poolCandidates, scoringCtx, 4);
      if (ranked.length >= 3) {
        return ranked.map((p) => ({ id: p.id, label: p.label }));
      }
      // Fallback: supplement with primary module chips if pool is thin
      const fallback = getInitialSuggestions(unlockedModules, isSkipped);
      const combined = [...ranked.map((p) => ({ id: p.id, label: p.label })), ...fallback];
      const seen = new Set<string>();
      return combined.filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      }).slice(0, 4);
    }

    // Fresh state (no modules unlocked yet, skipped): positional 4 chips with engagement ladder
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
        // Level 0-2: universal pain hook chip
        chips.push(pickUniversalChip(lastPlayfulLabel));
      }
      return chips.slice(0, 4);
    }

    // Fallback: primary modules + probability-ranked pool
    const primary = getInitialSuggestions(unlockedModules, isSkipped);
    const poolCandidates = getPoolSuggestions({
      unlockedModules, closedTabs, poolHistory, lastGroupShown, userAnswers, icp,
    }, 20);
    const ranked = getRankedChips(poolCandidates, scoringCtx, Math.max(0, 4 - primary.length));
    const combined = [
      ...primary,
      ...ranked.map((p) => ({ id: p.id, label: p.label })),
    ];
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
                      <ModuleRenderer moduleId={msg.moduleId} userAnswers={userAnswers} icp={icp} icpProbability={icpProbability} />
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
                  <ModuleRenderer moduleId={activeModule} userAnswers={userAnswers} icp={icp} icpProbability={icpProbability} />
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

      {/* ── DEV: ICP probability debug overlay (NEXT_PUBLIC_DEBUG_ICP=true only) ── */}
      {process.env.NEXT_PUBLIC_DEBUG_ICP === "true" && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            background: "rgba(0,0,0,0.85)",
            border: "1px solid rgba(139,92,246,0.4)",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            fontSize: "0.72rem",
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.8)",
            zIndex: 9999,
            minWidth: "160px",
          }}
          aria-hidden="true"
        >
          <div style={{ fontWeight: 700, marginBottom: "0.4rem", color: "#8b5cf6" }}>ICP Probability</div>
          {(["solo","smb","growth","enterprise"] as IcpKey[]).map((k) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.15rem" }}>
              <span style={{ color: icp === k ? "#10b981" : "inherit" }}>{k}</span>
              <span>{(icpProbability[k] * 100).toFixed(1)}%</span>
            </div>
          ))}
          <div style={{ marginTop: "0.4rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.3rem", color: "rgba(255,255,255,0.4)" }}>
            dominant: {dominantIcp(icpProbability)}
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
  @media (max-width: 480px) {
    .hb-wt-scene { padding: 1rem; }
    .hb-wt-visual { min-height: 130px; }
    .hb-wt-controls { gap: 0.375rem; }
    .hb-wt-nav { width: 44px; height: 44px; }
    .hb-wt-play { padding: 0.4rem 0.6rem; font-size: 0.68rem; }
  }
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
  .hb-wt-visual {
    border-radius: 10px;
    overflow: hidden;
    background: rgba(0,0,0,0.18);
    margin: 0.25rem 0;
    min-height: 150px;
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
    width: 44px; height: 44px;
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
  .hb-wt-dots { display: flex; gap: 0.25rem; align-items: center; flex: 1; flex-wrap: wrap; }
  .hb-wt-dot {
    width: 10px; height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
  }
  .hb-wt-dot::after {
    content: "";
    width: 7px; height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transition: background 0.15s ease, transform 0.15s ease;
    display: block;
  }
  .hb-wt-dot.active::after { background: var(--wt-dot-color, rgba(255,255,255,0.8)); transform: scale(1.3); }
  .hb-wt-dot:hover:not(.active)::after { background: rgba(255,255,255,0.3); }
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

  /* ── Calculator v2 sections ── */
  .hbcalc-v2 { gap: 0; }
  .hbcalc-section {
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 0.6rem;
    background: rgba(255,255,255,0.015);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: border-color 0.2s ease;
  }
  .hbcalc-section-label {
    font-size: 0.62rem;
    font-family: ui-monospace, monospace;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.3);
    margin-bottom: 0.1rem;
  }

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

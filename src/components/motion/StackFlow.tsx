"use client";

/**
 * StackFlow. the level9os "decision tree" hero. Lives between the WHAT WE
 * BUILT product gallery and the operating-architecture console graphic.
 * The gallery shows what we shipped; this section shows HOW the four
 * buckets work together; the console below dives into the agents inside
 * each bucket. So this is the connective tissue.
 *
 * Interaction model: layer cards stay FIXED in size. Hover/tap a card and
 * the side panels swap their content to show that layer's inputs (left)
 * and outputs + impact (right). The card itself glows in its layer color
 * to emphasize which bucket the visitor is examining. No inline
 * expansion → page never jumps. Mini-viz of the layer's inner workings
 * lives in the left panel under the inputs.
 *
 * Reading order on hover: side → middle → side. INPUTS feed in from the
 * left (from existing systems + upstream layer), the LAYER CARD shows the
 * verb + product + specs (the inner workings detail surfaces in the left
 * panel below the inputs), OUTPUTS + IMPACT show on the right.
 */

import { useEffect, useRef, useState } from "react";

type Layer = {
  id: string;
  verb: string;
  product: string;
  color: string;
  tagline: string;
  specs: string[];
  inputs: string[];
  techDescription: string;
  techBullets: string[];
  governanceLabel: string;        // "G1 plan gate", "G2 mid gate", etc.
  governanceDescription: string;  // 1-line plain English
  governanceBullets: string[];    // 2-3 bullets describing what the gate does
  outputs: string[];              // simple, 3 bullets
  impact: string[];
  inputTransitLabel: string;
  outputTransitLabel: string;
  miniVizKind: "rooms" | "hierarchy" | "pods" | "metrics";
  human: string;
};

const LAYERS: Layer[] = [
  {
    id: "decide",
    verb: "Decide",
    product: "StratOS",
    color: "#8b5cf6",
    tagline: "AI decision rooms · multi-model, multi-agent, fully governed.",
    specs: ["6 rooms", "10 ELT seats", "3 rounds", "multi-model"],
    inputs: [
      "Vision + capital constraints from Strategy",
      "Your operational data: OKRs, financials, CRM, history",
      "Market research from cited multi-source research agents",
      "Brand, legal, and regulatory guardrails",
    ],
    techDescription:
      "Six simulated executive rooms run a 3-round structured debate per decision. Sonnet 4.6, Haiku, and GPT-4o argue from different model families to reduce single-model bias.",
    techBullets: [
      "60 simulated executives · CEO/COO/CFO/CMO/CTO/CLO/CHRO/CPO/CRO/Design",
      "Round 1 framing · Round 2 dissent · Round 3 synthesis",
      "Multi-LLM voting with forced dissent on unanimous consensus",
    ],
    governanceLabel: "G1 · pre-decision gate",
    governanceDescription:
      "Every option scored against kill criteria before it leaves the room. Unanimous votes force a dissent round.",
    governanceBullets: [
      "Kill criteria built into every decision. No ship without exit terms.",
      "Dissent forced when vote is unanimous to break groupthink",
      "Full vote/challenge audit trail per round",
    ],
    outputs: [
      "Strategic decisions, branded handoff packets",
      "KPIs + kill criteria",
      "Replayable audit trail",
    ],
    impact: [
      "Eight-hour offsites collapse to thirty-minute audited recs",
      "Decisions become evidence-backed and defensible",
    ],
    inputTransitLabel: "vision · options · capital",
    outputTransitLabel: "decisions · OKRs · kill criteria",
    miniVizKind: "rooms",
    human: "ELT review",
  },
  {
    id: "coordinate",
    verb: "Coordinate",
    product: "CommandOS",
    color: "#10b981",
    tagline: "Three-tier governed agent fleet with 48 specialist resources.",
    specs: ["15 doers", "3 managers", "20 governors", "48 resource agents"],
    inputs: [
      "Decisions + OKRs from Decide layer",
      "Existing project state, owners, deadlines",
      "Resource availability across functions",
      "Standing policy + governance rules",
    ],
    techDescription:
      "Fifteen doer agents pick up decisions and break them into sequenced work. Three managers oversee them; twenty governors enforce policy; forty-eight specialist resource agents pull in on demand.",
    techBullets: [
      "Three-tier hierarchy: 3 mgrs over 15 doers, 20 governors enforce policy",
      "48 McKinsey-grade specialists on demand (consultants, designers, ops, legal)",
      "Multi-LLM routing: Haiku triage · Sonnet analysis · Perplexity research",
    ],
    governanceLabel: "G2 · mid-execution gate",
    governanceDescription:
      "Twenty governor agents enforce sequencing, dependency integrity, and escalation thresholds while work is in flight.",
    governanceBullets: [
      "Sequencing checks: nothing starts before its prerequisites are met",
      "Dependency integrity: handoffs validated, no orphan tasks",
      "Escalation thresholds: drift triggers manager review, not silent failure",
    ],
    outputs: [
      "Sequenced tasks with owners + deadlines",
      "Dependency graph (a plan, not a backlog)",
      "Live handoff trail",
    ],
    impact: [
      "Cross-functional cracks visible before they hurt the quarter",
      "48 specialists on demand, no consultant invoice",
    ],
    inputTransitLabel: "decisions · OKRs · kill criteria",
    outputTransitLabel: "tasks · sequencing · owners",
    miniVizKind: "hierarchy",
    human: "Dept leads",
  },
  {
    id: "execute",
    verb: "Execute",
    product: "OutboundOS",
    color: "#f59e0b",
    tagline: "Three-pod outbound + customer chassis. One voice, one trail.",
    specs: ["3 pods", "voice-calibrated", "multi-channel", "fully governed"],
    inputs: [
      "Tasks + sequencing + owners from Coordinate",
      "Your voice profile (brand register, banned phrases)",
      "CRM data + customer signal history",
      "Channel constraints (LinkedIn, email, calls, in-app)",
    ],
    techDescription:
      "Three coordinated pods share one voice profile: LinkupOS for autonomous LinkedIn signal, ABM Engine for multi-channel ABM, AutoCS for customer success. Same register, one governance trail.",
    techBullets: [
      "LinkupOS: posts, comments, intros, anchored to your voice",
      "ABM Engine: account research + custom touches at company-of-1 cost",
      "AutoCS: QBR prep, expansion signals, churn watch in the same voice",
    ],
    governanceLabel: "G3 · pre-send gate",
    governanceDescription:
      "Voice-rules linted, banned phrases scanned, brand register checked on every output before it leaves the building.",
    governanceBullets: [
      "Voice-rules check on every send: no em-dashes, no banned phrases",
      "Brand register validation: tone matches your profile or it doesn't ship",
      "Audit log per touch: who/when/what/why for every customer interaction",
    ],
    outputs: [
      "Voice-on-brand outbound + customer touches",
      "Engagement signal stream back up the stack",
      "Per-touch audit trail",
    ],
    impact: [
      "One brand voice across every touch, no drift",
      "Pipeline + CS keep running while you focus elsewhere",
    ],
    inputTransitLabel: "tasks · sequencing · owners",
    outputTransitLabel: "outputs · signals · telemetry",
    miniVizKind: "pods",
    human: "Pod leads",
  },
  {
    id: "measure",
    verb: "Measure",
    product: "LucidORG",
    color: "#06b6d4",
    tagline: "ECI score, friction detection, velocity tracking. Real-time.",
    specs: ["ECI 0-1000", "11 metrics", "37 levers", "4 pillars"],
    inputs: [
      "Telemetry from Execute layer pods",
      "System signals: latency, errors, cost, queue depth",
      "Human feedback: overrides, escalations, tags",
      "Comparison baselines from prior cycles",
    ],
    techDescription:
      "Four-pillar composite ECI score on a 0-1000 scale. Eleven measured metrics. Thirty-seven actionable levers. Friction detection at every handoff in real time.",
    techBullets: [
      "ECI · 0-1000 organizational efficiency index, four pillars",
      "11 metrics tell you what · 37 levers tell you which knob moves it",
      "Real-time friction detection: which handoff is slowing you down right now",
    ],
    governanceLabel: "validation gate",
    governanceDescription:
      "Output validation: ECI thresholds enforced, friction alerts triggered, lever recommendations validated before reaching humans.",
    governanceBullets: [
      "ECI thresholds enforced. Alerts route to the right human, not noise.",
      "Friction alerts triggered only when above baseline + statistical filter",
      "Lever recommendations validated against prior outcomes before surfacing",
    ],
    outputs: [
      "ECI score + delta",
      "Friction alerts + velocity scores",
      "Lever recommendations",
    ],
    impact: [
      "Operational intuition becomes a number you can govern by",
      "Closes the loop: feeds back into the next Decide round",
    ],
    inputTransitLabel: "outputs · signals · telemetry",
    outputTransitLabel: "ECI · friction · velocity → back to Strategy",
    miniVizKind: "metrics",
    human: "Analytics",
  },
];

/* Overview hover targets. Strategy header band at the top and the
   modular-use caption at the bottom. Hovering either swaps the side
   panels to a stack-wide explainer instead of layer-specific detail. */
type Overview = {
  id: "strategy" | "modular";
  color: string;
  leftHeader: string;
  leftItems: string[];
  rightHeader: string;
  rightItems: string[];
};

const OVERVIEWS: Record<"strategy" | "modular", Overview> = {
  strategy: {
    id: "strategy",
    color: "#a78bfa",
    leftHeader: "Top-down inputs",
    leftItems: [
      "Vision and the company's north-star",
      "Capital constraints + budget envelope",
      "Market signals from research agents",
      "Brand, regulatory, legal guardrails",
    ],
    rightHeader: "Full-stack outcomes",
    rightItems: [
      "Decisions tied to outcomes, not opinions",
      "Cross-functional execution at company-of-1 cost",
      "ECI score: org-wide efficiency in one number",
      "End-to-end audit trail from intent to result",
    ],
  },
  modular: {
    id: "modular",
    color: "#67e8f9",
    leftHeader: "Usage patterns",
    leftItems: [
      "Whole stack: install all four buckets, ECI lift in 90 days",
      "Single bucket: just need decisioning? just outbound? pick one",
      "Hybrid: some agents, some humans, governance everywhere",
      "Standalone: each layer plugs into existing systems",
    ],
    rightHeader: "Plugs into",
    rightItems: [
      "CRM (Salesforce, HubSpot) for customer signal",
      "Comms (Slack, email, LinkedIn) for outbound + CS",
      "Docs (Notion, Drive) for context + research",
      "Identity + audit (SSO, SCIM, audit log streaming)",
    ],
  },
};

const PARTICLE_COUNT = 18;
const PARTICLE_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#a78bfa", "#67e8f9"];

type Particle = {
  id: number;
  leftOffset: number;
  duration: number;
  delay: number;
  color: string;
  size: number;
};

/* ─── Mini-vizzes ────────────────────────────────────────────────────── */

function RoomsMini({ color }: { color: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }, (_, ri) => (
        <div key={ri} className="relative w-full aspect-square">
          {Array.from({ length: 10 }, (_, si) => {
            const angle = (si / 10) * Math.PI * 2 - Math.PI / 2;
            const r = 38;
            const cx = 50 + r * Math.cos(angle);
            const cy = 50 + r * Math.sin(angle);
            return (
              <span
                key={si}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: "translate(-50%, -50%)",
                  background: color,
                  opacity: 0.7,
                  boxShadow: `0 0 4px ${color}99`,
                  animation: "stackflow-peer 4s ease-in-out infinite",
                  animationDelay: `${(ri * 0.4 + si * 0.07) % 4}s`,
                }}
              />
            );
          })}
          <div className="absolute inset-0 rounded-full" style={{ border: `1px dashed ${color}26` }} />
        </div>
      ))}
    </div>
  );
}

function HierarchyMini({ color }: { color: string }) {
  const rows = [
    { count: 3,  opacity: 1.0, label: "3 mgrs" },
    { count: 15, opacity: 0.85, label: "15 doers" },
    { count: 20, opacity: 0.55, label: "20 governors" },
    { count: 24, opacity: 0.35, label: "48 resource agents" }, // visualize 24 to fit width
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((row, ri) => (
        <div key={ri} className="flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            {Array.from({ length: row.count }, (_, i) => (
              <span
                key={i}
                className="flex-1 h-1.5 rounded-sm min-w-[3px]"
                style={{
                  background: color,
                  opacity: row.opacity,
                  animation: "stackflow-peer 5s ease-in-out infinite",
                  animationDelay: `${(ri * 0.3 + i * 0.05) % 5}s`,
                }}
              />
            ))}
          </div>
          <div className="text-[8px] font-mono uppercase tracking-wider w-24 text-right" style={{ color: `${color}88` }}>
            {row.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function PodsMini({ color }: { color: string }) {
  const pods = ["LinkupOS", "ABM Engine", "AutoCS"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {pods.map((p, i) => (
        <div
          key={p}
          className="rounded-md px-2 py-2.5 text-[9px] font-mono tracking-wider uppercase text-center"
          style={{
            border: `1px solid ${color}50`,
            background: `${color}12`,
            color: `${color}E6`,
            animation: "stackflow-peer 4s ease-in-out infinite",
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {p}
        </div>
      ))}
    </div>
  );
}

function MetricsMini({ color }: { color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end gap-1 h-12">
        {Array.from({ length: 11 }, (_, i) => {
          const h = 30 + Math.sin((i + 1) * 0.9) * 18 + Math.cos(i * 0.5) * 12;
          return (
            <span
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${Math.max(15, h + 20)}%`,
                background: `linear-gradient(180deg, ${color}, ${color}55)`,
                opacity: 0.45 + (i % 3) * 0.18,
                animation: "stackflow-peer 5s ease-in-out infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-wider" style={{ color: `${color}99` }}>
        <span>0</span>
        <span>ECI · live</span>
        <span>1000</span>
      </div>
    </div>
  );
}

function MiniViz({ kind, color }: { kind: Layer["miniVizKind"]; color: string }) {
  if (kind === "rooms") return <RoomsMini color={color} />;
  if (kind === "hierarchy") return <HierarchyMini color={color} />;
  if (kind === "pods") return <PodsMini color={color} />;
  return <MetricsMini color={color} />;
}

/* ─── Side panels ────────────────────────────────────────────────────── */

/* ─── Motion graphics for the side-panel walkthroughs ─────────────────
   Each viz is self-contained: pure CSS keyframes, no JS state, no SVG
   path math beyond what's needed for the radial layouts. Used in three
   contexts:
   - default state (no hover): "what comes in" + "what goes out" overview
   - Strategy hover: top-down inputs converging + full-stack outcomes
   - Modular hover: usage-pattern cycling + plugs-into-your-stack
   ──────────────────────────────────────────────────────────────────── */

/** Horizontal flow row: label on the left, three small dots traveling
 *  rightward toward an arrow. Used to show one input/output stream.
 *  Reused inside StrategyInputsViz and DefaultLeftViz. */
function FlowRow({
  label,
  color,
  delay = 0,
}: {
  label: string;
  color: string;
  delay?: number;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
      <span className="w-20 text-right truncate" style={{ color: `${color}CC` }}>
        {label}
      </span>
      <div className="relative flex-1 h-4 overflow-hidden">
        <div className="absolute inset-y-1/2 left-0 right-0 h-px" style={{ background: `${color}26` }} />
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute top-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              left: 0,
              transform: "translate(-50%, -50%)",
              background: color,
              boxShadow: `0 0 6px ${color}`,
              animation: `stackflow-flow-row 3.6s linear infinite`,
              animationDelay: `${delay + i * 1.2}s`,
            }}
          />
        ))}
      </div>
      <span style={{ color: `${color}AA` }}>▸</span>
    </div>
  );
}

/** Default LEFT viz: existing systems feeding in, animated. Shows 5
 *  source labels each with a flowing dot traveling toward the spine. */
function DefaultLeftViz() {
  return (
    <div className="space-y-3">
      <SectionHeader label="Existing systems · feed in" color="#a78bfa" />
      <div className="space-y-2.5">
        <FlowRow label="Slack" color="#a78bfa" delay={0} />
        <FlowRow label="Email" color="#a78bfa" delay={0.4} />
        <FlowRow label="Salesforce" color="#a78bfa" delay={0.8} />
        <FlowRow label="Notion" color="#a78bfa" delay={1.2} />
        <FlowRow label="Drive" color="#a78bfa" delay={1.6} />
      </div>
      <div className="text-[10px] text-white/35 pt-2 border-t border-white/[0.06] leading-relaxed">
        Hover any layer for tool detail · or hover Strategy / the modular pill for stack-wide overview.
      </div>
    </div>
  );
}

/** Default RIGHT viz: outcomes coming out of the stack. Four outcome
 *  tiles stagger-pulse to convey "what you get back." Humans-in-loop
 *  collapsed to a single caption so the panel reads as one idea, not two. */
function DefaultRightViz() {
  const outcomes = [
    { label: "Decisions", color: "#8b5cf6" },
    { label: "Execution", color: "#10b981" },
    { label: "Touchpoints", color: "#f59e0b" },
    { label: "ECI score", color: "#06b6d4" },
  ];
  return (
    <div className="space-y-3">
      <SectionHeader label="What you get back" color="#67e8f9" />
      <div className="grid grid-cols-2 gap-2">
        {outcomes.map((o, i) => (
          <div
            key={o.label}
            className="rounded-lg border px-3 py-3 text-[11px] font-mono uppercase tracking-wider text-center"
            style={{
              borderColor: `${o.color}30`,
              background: `${o.color}10`,
              color: `${o.color}E6`,
              animation: "stackflow-outcome-pulse 4.2s ease-in-out infinite",
              animationDelay: `${i * 1}s`,
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
      <div className="text-[10px] text-white/40 leading-relaxed pt-2 border-t border-white/[0.06]">
        Humans in the loop: review · override · intervene at every layer.
      </div>
    </div>
  );
}

/** Strategy LEFT: 4 top-down inputs converging into a single arrow at
 *  the right edge. Caption labels what each input is. */
function StrategyLeftViz() {
  return (
    <div className="space-y-3">
      <SectionHeader label="Top-down inputs" color="#a78bfa" />
      <div className="space-y-3">
        <FlowRow label="Vision" color="#a78bfa" delay={0} />
        <FlowRow label="Capital" color="#67e8f9" delay={0.5} />
        <FlowRow label="Market" color="#10b981" delay={1.0} />
        <FlowRow label="Guardrails" color="#f59e0b" delay={1.5} />
      </div>
      <div className="text-[11px] text-white/55 leading-relaxed pt-2">
        Vision, capital, market signals, and guardrails feed in from the board.
        Each becomes a typed input the stack can debate, plan, execute, and measure.
      </div>
    </div>
  );
}

/** Strategy RIGHT: animated ECI gauge + outcome tiles + feedback loop. */
function StrategyRightViz() {
  return (
    <div className="space-y-4">
      <SectionHeader label="Full-stack outcomes" color="#a78bfa" />
      {/* ECI animated gauge */}
      <div className="relative rounded-lg border p-4 text-center" style={{ borderColor: "#a78bfa28", background: "#a78bfa08" }}>
        <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/45 mb-2">
          ECI · org-wide efficiency
        </div>
        <div
          className="text-3xl font-black tabular-nums"
          style={{
            color: "#a78bfa",
            animation: "stackflow-eci-pulse 3.6s ease-in-out infinite",
          }}
        >
          0-1000
        </div>
        <div className="relative h-1.5 mt-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #a78bfa, #67e8f9)",
              animation: "stackflow-eci-fill 4s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      {/* Outcome tiles */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Decisions", color: "#8b5cf6" },
          { label: "Execution", color: "#10b981" },
          { label: "Audit trail", color: "#f59e0b" },
          { label: "Velocity", color: "#06b6d4" },
        ].map((o, i) => (
          <div
            key={o.label}
            className="rounded-md border px-2.5 py-2 text-[10px] font-mono uppercase tracking-wider text-center"
            style={{
              borderColor: `${o.color}30`,
              background: `${o.color}10`,
              color: `${o.color}E6`,
              animation: "stackflow-outcome-pulse 4.2s ease-in-out infinite",
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
      {/* Loop indicator */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400/65">
        <span style={{ animation: "stackflow-loop 3s linear infinite", display: "inline-block" }}>↻</span>
        feeds back to the next round
      </div>
    </div>
  );
}

/** Modular LEFT: animated cycling through usage patterns. The 4 buckets
 *  light in different combinations to show "any one or all together." */
function ModularLeftViz() {
  const buckets = [
    { id: "decide",     label: "Decide",     color: "#8b5cf6" },
    { id: "coordinate", label: "Coordinate", color: "#10b981" },
    { id: "execute",    label: "Execute",    color: "#f59e0b" },
    { id: "measure",    label: "Measure",    color: "#06b6d4" },
  ];
  return (
    <div className="space-y-3">
      <SectionHeader label="Usage patterns" color="#67e8f9" />
      <div className="space-y-1.5">
        {buckets.map((b, i) => (
          <div
            key={b.id}
            className="rounded-md border px-3 py-2 text-[11px] font-mono uppercase tracking-wider"
            style={{
              borderColor: `${b.color}40`,
              background: `${b.color}10`,
              color: `${b.color}D0`,
              animation: "stackflow-usage-cycle 8s ease-in-out infinite",
              animationDelay: `${i * 2}s`,
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" style={{ background: b.color }} />
            {b.label}
          </div>
        ))}
      </div>
      <div className="text-[11px] text-white/55 leading-relaxed pt-2 border-t border-white/[0.06]">
        Pick one bucket. Pick a few. Or run the whole stack. Each layer plugs into
        your existing systems standalone.
      </div>
    </div>
  );
}

/** Modular RIGHT: a center node with 4 lines radiating to integration
 *  pills (CRM, Comms, Docs, Identity), pulsing dots travel each line. */
function ModularRightViz() {
  const plugs = [
    { label: "CRM",      sub: "Salesforce · HubSpot",   color: "#8b5cf6", x: 90,  y: 20 },
    { label: "Comms",    sub: "Slack · email · Zoom",   color: "#10b981", x: 90,  y: 75 },
    { label: "Docs",     sub: "Notion · Drive",         color: "#f59e0b", x: 5,   y: 75 },
    { label: "Identity", sub: "SSO · SCIM · audit",     color: "#06b6d4", x: 5,   y: 20 },
  ];
  return (
    <div className="space-y-3">
      <SectionHeader label="Plugs into" color="#67e8f9" />
      <div className="relative h-44 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* Center node = the stack */}
        <div
          className="absolute left-1/2 top-1/2 w-12 h-12 rounded-lg -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            boxShadow: "0 0 20px rgba(139,92,246,0.4)",
          }}
        >
          <span className="text-[9px] font-mono uppercase tracking-wider text-white">Stack</span>
        </div>
        {/* Connector dots traveling from each corner toward center */}
        {plugs.map((p, i) => (
          <div key={p.label}>
            {/* Plug pill */}
            <div
              className="absolute rounded-md border px-2 py-1 text-[9px] font-mono uppercase tracking-wider"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform:
                  p.x > 50
                    ? "translate(-100%, -50%)"
                    : "translate(0%, -50%)",
                borderColor: `${p.color}50`,
                background: `${p.color}15`,
                color: `${p.color}E6`,
              }}
            >
              {p.label}
            </div>
            {/* Pulsing connector dot, animates from plug → center */}
            <span
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: p.color,
                boxShadow: `0 0 6px ${p.color}`,
                animation: `stackflow-plug-${p.x > 50 ? "rl" : "lr"}-${p.y > 50 ? "bt" : "tb"} 3s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
        {plugs.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-white/55 truncate">{p.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Reusable section header used across both side panels for consistency. */
function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className="text-[10px] tracking-[0.3em] uppercase font-mono" style={{ color: `${color}AA` }}>
      {label}
    </div>
  );
}

/* Reusable bullet row. same dot + indent + size everywhere so reading
   feels uniform across input/output/governance/impact sections. */
function BulletList({
  items,
  color,
  size = "sm",
  delayBase = 0,
}: {
  items: string[];
  color: string;
  size?: "sm" | "xs";
  delayBase?: number;
}) {
  const text = size === "sm" ? "text-sm" : "text-[13px]";
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 ${text} leading-snug text-white/80`}
          style={{ animation: "stackflow-fadein 0.35s ease-out both", animationDelay: `${delayBase + i * 0.04}s` }}
        >
          <span className="w-1 h-1 rounded-full flex-shrink-0 mt-2" style={{ background: color }} />
          <span>{it}</span>
        </div>
      ))}
    </div>
  );
}

function LeftPanel({ active, overview }: { active: Layer | null; overview: Overview | null }) {
  if (overview) {
    if (overview.id === "strategy") return <div key="L-strategy"><StrategyLeftViz /></div>;
    if (overview.id === "modular") return <div key="L-modular"><ModularLeftViz /></div>;
  }
  if (active) {
    return (
      <div className="space-y-4" key={`L-${active.id}`}>
        {/* INPUTS. what flows in. Bullets only, no preamble. */}
        <div className="space-y-2">
          <SectionHeader label={`Inputs · @ ${active.verb}`} color={active.color} />
          <BulletList items={active.inputs} color={active.color} size="xs" />
        </div>

        {/* INSIDE. just the mini-viz. The prose tech description was
            cut to reduce visual density; the visual carries the meaning. */}
        <div className="pt-3 border-t space-y-2.5" style={{ borderColor: `${active.color}22` }}>
          <SectionHeader label="Inside" color={active.color} />
          <MiniViz kind={active.miniVizKind} color={active.color} />
        </div>
      </div>
    );
  }
  /* Default state: animated walkthrough of "what's feeding in." */
  return <div key="L-default"><DefaultLeftViz /></div>;
}

function RightPanel({ active, overview }: { active: Layer | null; overview: Overview | null }) {
  if (overview) {
    if (overview.id === "strategy") return <div key="R-strategy"><StrategyRightViz /></div>;
    if (overview.id === "modular") return <div key="R-modular"><ModularRightViz /></div>;
  }
  if (active) {
    return (
      <div className="space-y-4" key={`R-${active.id}`}>
        {/* GOVERNANCE. gate label + 2 short bullets. Description prose
            cut to reduce density; gate label is enough context. */}
        <div className="space-y-2">
          <SectionHeader label={`Governance · ${active.governanceLabel}`} color={active.color} />
          <BulletList items={active.governanceBullets.slice(0, 2)} color={active.color} size="xs" />
        </div>

        {/* OUTPUTS. three short lines, plain English. */}
        <div className="pt-3 border-t space-y-2" style={{ borderColor: `${active.color}22` }}>
          <SectionHeader label={`Outputs · @ ${active.verb}`} color={active.color} />
          <BulletList items={active.outputs} color={active.color} size="xs" delayBase={0.08} />
        </div>

        {/* IMPACT. two bullets, what changes for the org / user. */}
        <div className="pt-3 border-t space-y-2" style={{ borderColor: `${active.color}22` }}>
          <SectionHeader label="Impact · for your org" color={active.color} />
          <BulletList items={active.impact} color={active.color} size="xs" delayBase={0.14} />
        </div>
      </div>
    );
  }
  /* Default state: animated walkthrough of "what comes out." */
  return <div key="R-default"><DefaultRightViz /></div>;
}

/* ─── Layer card ─────────────────────────────────────────────────────── */

function LayerCard({
  layer,
  active,
  onEnter,
  onLeave,
}: {
  layer: Layer;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="relative rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-pointer"
      style={{
        borderColor: active ? layer.color : `${layer.color}28`,
        background: active ? `${layer.color}10` : "rgba(255,255,255,0.02)",
        boxShadow: active
          ? `0 0 0 1px ${layer.color}55, 0 0 32px ${layer.color}30, inset 0 1px 0 ${layer.color}40`
          : "none",
        transform: active ? "translateZ(0) scale(1.012)" : "translateZ(0) scale(1)",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => (active ? onLeave() : onEnter())}
    >
      {/* Top accent stripe. brightens when active */}
      <div
        className="absolute top-0 left-0 right-0 h-px rounded-t-xl transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${layer.color}, transparent)`,
          opacity: active ? 1 : 0.5,
        }}
      />

      <div className="px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 transition-all"
              style={{
                background: layer.color,
                boxShadow: active ? `0 0 14px ${layer.color}, 0 0 28px ${layer.color}66` : `0 0 8px ${layer.color}AA`,
              }}
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight" style={{ color: layer.color }}>
                  {layer.verb}
                </span>
                <span className="text-white/45 text-[10px] font-mono uppercase tracking-wider">
                  {layer.product}
                </span>
              </div>
              <div className={`text-xs mt-0.5 transition-colors ${active ? "text-white/85" : "text-white/55"}`}>
                {layer.tagline}
              </div>
            </div>
          </div>
          {/* Spec chips */}
          <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
            {layer.specs.map((s) => (
              <span
                key={s}
                className="text-[9px] font-mono tracking-wider uppercase px-2 py-1 rounded-full whitespace-nowrap transition-all"
                style={{
                  border: `1px solid ${active ? layer.color : `${layer.color}30`}`,
                  color: active ? "white" : `${layer.color}CC`,
                  background: active ? `${layer.color}25` : `${layer.color}08`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────── */

export default function StackFlow() {
  const [particles, setParticles] = useState<Particle[]>([]);
  /* activeId can be a layer id ('decide'/'coordinate'/'execute'/'measure'),
     an overview id ('strategy'/'modular'), or null. The two panels resolve
     it into either a Layer or an Overview to render the correct content. */
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = LAYERS.find((l) => l.id === activeId) ?? null;
  const overview =
    activeId === "strategy" || activeId === "modular" ? OVERVIEWS[activeId] : null;
  const activeColor = active?.color ?? overview?.color ?? null;

  /* Auto-walkthrough: when the section enters viewport for the first time
     AND the visitor hasn't moved their cursor inside it yet, cycle through
     the four layers (Decide → Coordinate → Execute → Measure) on a 4s
     cadence so the visitor sees the rollover pattern without hunting for
     it. Any mousemove inside the section stops the walk and hands control
     back to the visitor. */
  const sectionRef = useRef<HTMLElement>(null);
  const [autoWalking, setAutoWalking] = useState(false);
  const [interactionLock, setInteractionLock] = useState(false);
  const interactionLockRef = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && !interactionLockRef.current) setAutoWalking(true);
      },
      { threshold: 0.4 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!autoWalking || interactionLock) return;
    const ids = ["decide", "coordinate", "execute", "measure"];
    let i = 0;
    setActiveId(ids[0]);
    const tick = setInterval(() => {
      i += 1;
      if (i >= ids.length || interactionLockRef.current) {
        clearInterval(tick);
        setAutoWalking(false);
        if (!interactionLockRef.current) setActiveId(null);
        return;
      }
      setActiveId(ids[i]);
    }, 4000);
    return () => clearInterval(tick);
  }, [autoWalking, interactionLock]);

  /* Lock the auto-walk the moment the visitor moves their cursor inside
     the section. The ref version is read inside the interval closure
     above so the cycle aborts mid-flight, not just at the next tick. */
  const lockInteraction = () => {
    if (interactionLockRef.current) return;
    interactionLockRef.current = true;
    setInteractionLock(true);
  };

  useEffect(() => {
    /* Duration window 12-17s gives the slow, deliberate flow the user wanted .
       the equalized keyframe segments make travel speed feel uniform across
       all four legs. Larger leftOffset (±18) plus the bumped jitter (±10)
       widens the cluster spread at each gate. */
    const ps: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      leftOffset: (Math.random() - 0.5) * 36,
      duration: 12 + Math.random() * 5,
      delay: -(Math.random() * 14),
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 5 + Math.random() * 3,
    }));
    setParticles(ps);
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={lockInteraction}
      className="py-24 sm:py-32 relative"
      style={{ background: "var(--bg-root)" }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Eyebrow + headline + supporting paragraph */}
        <div className="text-center mb-12">
          <div className="text-violet-400/55 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
            The Stack · how the four buckets work together
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white/90 leading-[1.05] max-w-3xl mx-auto">
            Information flows top to bottom.
            <br />
            <span className="text-white/40">Governed at every layer.</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Strategy in. Decisions, coordination, execution, measurement out. Existing
            systems augmented, humans in the loop, governance at every transition.
            <span className="block mt-2 text-white/35 text-sm">
              Hover any layer to see what flows in, how it works, what comes out, and how it changes the org.
            </span>
          </p>
        </div>

        {/* Diagram. 3-column grid: side panel · spine · side panel. The side
            panels are SHARED real estate that swaps content based on
            activeId, so the layout never grows. */}
        <div className="relative grid grid-cols-1 md:grid-cols-[260px_1fr_260px] gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">

          {/* LEFT PANEL. default = existing systems, hover layer = inputs +
              inside, hover Strategy/Modular = stack-wide overview */}
          <aside
            className="md:self-stretch md:min-h-[520px] rounded-2xl border bg-white/[0.015] backdrop-blur-sm p-4 transition-colors duration-300"
            style={{
              borderColor: activeColor ? `${activeColor}28` : "rgba(255,255,255,0.06)",
            }}
          >
            <LeftPanel active={active} overview={overview} />
          </aside>

          {/* CENTER. spine */}
          <div className="relative">
            {/* Strategy header band. hoverable. Triggers stack-wide
                overview in the side panels (top-down inputs / full-stack
                outcomes) instead of any single layer's detail. */}
            <div
              className="rounded-xl border bg-white/[0.02] backdrop-blur-sm p-3 mb-2 text-center cursor-pointer transition-all duration-300"
              style={{
                borderColor: activeId === "strategy" ? "#a78bfa" : "rgba(255,255,255,0.08)",
                background:
                  activeId === "strategy" ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.02)",
              }}
              onMouseEnter={() => setActiveId("strategy")}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId(activeId === "strategy" ? null : "strategy")}
            >
              <div
                className="text-[10px] tracking-[0.3em] uppercase font-mono transition-colors"
                style={{ color: activeId === "strategy" ? "#c4b5fd" : "rgba(255,255,255,0.45)" }}
              >
                Strategy · Board · CEO
              </div>
              <div className="text-white/55 text-xs mt-0.5">vision · capital · north-star</div>
              <div className="text-[9px] tracking-wider text-violet-300/60 mt-1 font-mono">▸ hover for stack inputs</div>
            </div>

            {/* Vertical particle spine */}
            <div className="pointer-events-none absolute inset-x-0 top-[68px] bottom-[40px] flex justify-center z-0">
              <div className="relative w-px h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-400/30 via-white/[0.10] to-cyan-400/30" />
                {particles.map((p) => {
                  /* Two animations run in parallel: stackflow-down handles
                     the staged Y travel with pile-up pauses; stackflow-jitter
                     adds a tiny X wiggle on a different period so paused
                     particles don't all sit at the same X. reads as a
                     small cluster instead of a synchronized line. */
                  const jitterDur = 1.5 + (p.id % 3) * 0.4;
                  return (
                    <div
                      key={p.id}
                      className="absolute rounded-full"
                      style={{
                        left: `calc(50% + ${p.leftOffset}px)`,
                        top: 0,
                        width: p.size,
                        height: p.size,
                        transform: "translate(-50%, 0)",
                        background: p.color,
                        boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}66`,
                        animation: `stackflow-down ${p.duration}s linear infinite, stackflow-jitter ${jitterDur}s ease-in-out infinite`,
                        animationDelay: `${p.delay}s, ${p.delay * 0.7}s`,
                        willChange: "top, transform, opacity",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Layer stack */}
            <div className="relative z-10 space-y-2">
              {LAYERS.map((l, i) => (
                <div key={l.id}>
                  {/* Transit + governance band between layers */}
                  {i > 0 && (
                    <div className="flex items-center gap-3 my-1.5">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                      <div className="text-[9px] font-mono tracking-[0.25em] uppercase text-amber-400/65 flex items-center gap-1.5 whitespace-nowrap">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-amber-400/80"
                          style={{ animation: "stackflow-gate 2.6s ease-in-out infinite", animationDelay: `${i * 0.45}s` }}
                        />
                        G{i} · {l.inputTransitLabel}
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                    </div>
                  )}

                  <LayerCard
                    layer={l}
                    active={activeId === l.id}
                    onEnter={() => setActiveId(l.id)}
                    onLeave={() => setActiveId(null)}
                  />
                </div>
              ))}

              {/* Final feedback transit */}
              <div className="flex items-center gap-3 my-1.5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
                <div className="text-[9px] font-mono tracking-[0.25em] uppercase text-cyan-400/65 flex items-center gap-1.5">
                  <span style={{ animation: "stackflow-loop 3s linear infinite", display: "inline-block" }}>↻</span>
                  {LAYERS[LAYERS.length - 1].outputTransitLabel}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL. default = humans in loop, hover layer = governance +
              outputs + impact, hover Strategy/Modular = stack-wide outcomes */}
          <aside
            className="md:self-stretch md:min-h-[520px] rounded-2xl border bg-white/[0.015] backdrop-blur-sm p-4 transition-colors duration-300"
            style={{
              borderColor: activeColor ? `${activeColor}28` : "rgba(255,255,255,0.06)",
            }}
          >
            <RightPanel active={active} overview={overview} />
          </aside>
        </div>

        {/* Modular-use line. hoverable. Answers "what if i just need one
            piece?" by swapping the side panels to a stack-wide explainer
            (usage patterns / what it plugs into). */}
        <div className="text-center mt-10 max-w-3xl mx-auto">
          <div
            className="inline-block px-4 py-2 rounded-full border text-sm cursor-pointer transition-all duration-300"
            style={{
              borderColor: activeId === "modular" ? "#67e8f9" : "rgba(139,92,246,0.25)",
              background:
                activeId === "modular" ? "rgba(103,232,249,0.10)" : "rgba(139,92,246,0.05)",
              color: activeId === "modular" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)",
            }}
            onMouseEnter={() => setActiveId("modular")}
            onMouseLeave={() => setActiveId(null)}
            onClick={() => setActiveId(activeId === "modular" ? null : "modular")}
          >
            Use the whole stack. Or pick the bucket you need.
            <span className={activeId === "modular" ? "text-white/65 ml-2" : "text-white/35 ml-2"}>
              Each layer runs standalone, plugs into your existing systems.
            </span>
            <span className="text-[9px] text-cyan-300/60 ml-2 font-mono whitespace-nowrap">▸ hover for usage patterns</span>
          </div>
        </div>

        {/* Bottom takeaways */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {[
            { tone: "violet",  text: "Augments existing systems and teams, never replaces them." },
            { tone: "amber",   text: "Governance at every transition: G1, G2, G3 gates between layers." },
            { tone: "cyan",    text: "Humans stay in the loop at every layer where it matters." },
          ].map((c) => (
            <div
              key={c.text}
              className={`text-white/65 text-sm leading-relaxed text-center sm:text-left border-l-2 pl-4 ${
                c.tone === "violet" ? "border-violet-500/40" : c.tone === "amber" ? "border-amber-400/40" : "border-cyan-400/40"
              }`}
            >
              {c.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

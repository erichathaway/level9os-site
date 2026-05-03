"use client";

/**
 * DecisionTrace. The "live working dashboard" companion below the operating
 * console graphic. Walks the visitor through one strategic move flowing
 * through the full stack, showing how OutboundOS doubles as a market
 * sensor (not just a transmitter), how LucidORG measures every step, and
 * how governance + learning loops close the cycle. Copy is intentionally
 * generic so the same trace fits any strategic decision (new product,
 * pricing change, geographic expansion, big hire, capital allocation).
 *
 * Eight stages auto-cycle on a ~3.5s cadence. Hovering any stage card
 * pauses the cycle and brightens the detail strip below. Cursor-out
 * resumes from the held stage. Above the ribbon, a live-style ticker
 * pulses agent counts, governance gates, and ECI to give the section a
 * "live ops console" feel without needing real backend data.
 *
 * Visually distinct from StackFlow above: that one shows STRUCTURE (how
 * the four buckets work together). This one shows MOTION (how one
 * decision actually flows). Same brand colors, different job.
 */

import { useEffect, useRef } from "react";

export type Stage = {
  id: number;
  verb: string;
  product: string;
  productColor: string;
  ring: string;            // which ConsoleGraphic ring it maps to
  mini: string;            // one-glance stat shown on the card
  detail: string;          // 1-2 line explanation under the ribbon
  agentCount: number;      // bumped into the ticker when this stage is active
};

export const STAGES: Stage[] = [
  {
    id: 1,
    verb: "Input",
    product: "Strategy",
    productColor: "#8b5cf6",
    ring: "R1",
    mini: "Strategic move",
    detail: "A board-level proposal lands. Vision, capital constraints, and brand guardrails feed into the stack as typed inputs.",
    agentCount: 0,
  },
  {
    id: 2,
    verb: "ELT debate",
    product: "StratOS",
    productColor: "#8b5cf6",
    ring: "R3 Decide",
    mini: "10 seats. 3 rounds",
    detail: "Ten simulated executive seats run a 3-round structured debate. Multi-LLM consensus across Sonnet 4.6, Haiku, GPT-4o. Forced dissent on unanimous outcomes.",
    agentCount: 10,
  },
  {
    id: 3,
    verb: "Board handoff",
    product: "StratOS",
    productColor: "#8b5cf6",
    ring: "R3 Decide",
    mini: "G1 . packet shipped",
    detail: "Branded handoff packet sized for the board: strategic definition, KPIs, kill criteria, full audit trail. G1 governance signs off before it leaves the room.",
    agentCount: 10,
  },
  {
    id: 4,
    verb: "Org + distribution",
    product: "CommandOS",
    productColor: "#10b981",
    ring: "R3 Coordinate",
    mini: "G2 . 86 agents",
    detail: "Three managers oversee fifteen doers. Twenty governors enforce sequencing and policy. Forty-eight specialist resource agents pull in. Cross-functional rollout distributed across the org.",
    agentCount: 86,
  },
  {
    id: 5,
    verb: "Outbound",
    product: "OutboundOS",
    productColor: "#f59e0b",
    ring: "R3 Execute",
    mini: "LinkupOS . AutoCS",
    detail: "LinkupOS pushes anchored signal across LinkedIn (posts, comments, intros). AutoCS handles customer touches in the same voice. Voice-rules linted on every send.",
    agentCount: 8,
  },
  {
    id: 6,
    verb: "ABM",
    product: "OutboundOS . ABM",
    productColor: "#fb923c",
    ring: "R3 Execute",
    mini: "Multi-channel ABM",
    detail: "ABM Engine runs account research and custom multi-channel sequences at company-of-1 cost. Accounts identified, sequenced, touched, scored.",
    agentCount: 5,
  },
  {
    id: 7,
    verb: "Measure",
    product: "LucidORG",
    productColor: "#06b6d4",
    ring: "R3 Measure",
    mini: "ECI 720 to 785",
    detail: "Real-time ECI delta. Friction at every handoff. Velocity per lane. Lever recommendations validated against prior cycles before surfacing to humans.",
    agentCount: 6,
  },
  {
    id: 8,
    verb: "Loop",
    product: "Strategy",
    productColor: "#8b5cf6",
    ring: "R1 + R3",
    mini: "Feedback to Strategy",
    detail: "ECI score, friction alerts, and velocity insights close the loop back into the next Strategy round. The stack learns from its own signal.",
    agentCount: 0,
  },
];

const STAGE_MS = 3500;

/* Live-style ticker stats. The agent count + ECI shift slightly per active
   stage to feel responsive; the rest are static-but-pulsing decoration. */
type TickerProps = {
  activeStage: Stage;
};

function Ticker({ activeStage }: TickerProps) {
  return (
    <div className="flex items-center justify-center gap-x-5 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/55 mb-5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] mx-auto max-w-fit">
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-300/90 tabular-nums">{activeStage.agentCount}</span>
        <span>agents</span>
      </span>
      <span className="text-white/15">·</span>
      <span className="flex items-center gap-2">
        <span>ECI</span>
        <span className="text-cyan-300/90 tabular-nums">720</span>
      </span>
    </div>
  );
}

function StageCard({
  stage,
  active,
  onEnter,
  onLeave,
}: {
  stage: Stage;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="relative rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-pointer flex-shrink-0"
      style={{
        width: 124,
        borderColor: active ? stage.productColor : `${stage.productColor}22`,
        background: active ? `${stage.productColor}10` : "rgba(255,255,255,0.02)",
        boxShadow: active
          ? `0 0 0 1px ${stage.productColor}55, 0 0 28px ${stage.productColor}30`
          : "none",
        transform: active ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${stage.productColor}, transparent)`,
          opacity: active ? 1 : 0.4,
        }}
      />
      <div className="px-3 py-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[9px] font-mono uppercase tracking-wider"
            style={{ color: active ? stage.productColor : `${stage.productColor}99` }}
          >
            {String(stage.id).padStart(2, "0")} {stage.verb}
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: stage.productColor,
              boxShadow: active ? `0 0 8px ${stage.productColor}` : "none",
            }}
          />
        </div>
        <div className={`text-sm font-bold transition-colors`} style={{ color: active ? "white" : "rgba(255,255,255,0.75)" }}>
          {stage.product}
        </div>
      </div>
    </div>
  );
}

/* Static "trace beam" line that runs behind the cards, with a moving dot
   that visually anchors the auto-cycle position. The dot lives at the
   percentage of the active stage (1/8, 2/8, etc) and slides over 0.6s. */
function TraceBeam({ activeIndex, total }: { activeIndex: number; total: number }) {
  const pct = total > 1 ? (activeIndex / (total - 1)) * 100 : 0;
  return (
    <div className="relative h-px mx-auto my-3" style={{ width: "calc(100% - 60px)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 via-amber-500/30 to-cyan-500/30" />
      <span
        className="absolute -top-1 w-2.5 h-2.5 rounded-full"
        style={{
          left: `${pct}%`,
          transform: "translateX(-50%)",
          background: STAGES[activeIndex]?.productColor ?? "#fff",
          boxShadow: `0 0 12px ${STAGES[activeIndex]?.productColor ?? "#fff"}`,
          transition: "left 0.6s cubic-bezier(0.4,0,0.2,1), background 0.4s, box-shadow 0.4s",
        }}
      />
    </div>
  );
}

/* Controlled-component version. Active index + paused state are driven by
   the parent (page.tsx) so the same active stage can also drive a glow
   overlay on the ConsoleGraphic above. */
type DecisionTraceProps = {
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  paused: boolean;
  setPaused: (p: boolean) => void;
  /* When true, render the trace inline (no own section / heading). Used
     when the trace lives inside the operating-architecture section. */
  inline?: boolean;
};

export default function DecisionTrace({
  activeIdx,
  setActiveIdx,
  paused,
  setPaused,
  inline = false,
}: DecisionTraceProps) {
  const intervalRef = useRef<number | null>(null);

  /* Auto-cycle. Pauses when paused=true (set by stage hover). Restarts from
     wherever it left off when un-paused. */
  useEffect(() => {
    if (paused) return;
    intervalRef.current = window.setInterval(() => {
      setActiveIdx((activeIdx + 1) % STAGES.length);
    }, STAGE_MS);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // activeIdx intentionally not in deps; we want one interval that uses
    // the latest closure value via re-mount each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, activeIdx]);

  const activeStage = STAGES[activeIdx];

  const Body = (
    <>
      {!inline && (
        <div className="text-center mb-10">
          <div className="text-violet-400/55 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
            Live trace · one decision through the stack
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white/90 leading-[1.05] max-w-3xl mx-auto">
            Watch one strategic move
            <br />
            <span className="text-white/40">flow through. End to end.</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Outbound doubles as a sensor. LucidORG measures every step.
            Governance gates run between layers. The stack learns from its
            own signal and closes the loop. Same path runs for any
            strategic decision your operation makes.
            <span className="block mt-2 text-white/35 text-sm">
              Hover any stage to pause and read.
            </span>
          </p>
        </div>
      )}

      {/* Live ticker */}
      <Ticker activeStage={activeStage} />

        {/* Active-stage detail — minimal: colored verb + plain explanation.
            Sits ABOVE the cards as the bridge between canvas and selector. */}
        <div
          key={`detail-${activeStage.id}`}
          className="max-w-3xl mx-auto mb-5 px-2 text-center"
        >
          <div className="text-2xl sm:text-3xl font-black mb-2" style={{ color: activeStage.productColor }}>
            {activeStage.verb}
          </div>
          <p
            className="text-white/70 text-sm sm:text-base leading-relaxed"
            style={{ animation: "trace-fadein 0.4s ease-out both" }}
          >
            {activeStage.detail}
          </p>
        </div>

        {/* Stage cards. On narrow viewports the row scrolls horizontally;
            on wide it fits the 8 cards in a single line. */}
        <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0 pb-2">
          <div className="flex items-stretch gap-2 min-w-fit">
            {STAGES.map((s, i) => (
              <StageCard
                key={s.id}
                stage={s}
                active={i === activeIdx}
                onEnter={() => {
                  setActiveIdx(i);
                  setPaused(true);
                }}
                onLeave={() => setPaused(false)}
              />
            ))}
          </div>
        </div>

        {/* Trace beam UNDER the cards as a connecting visual */}
        <TraceBeam activeIndex={activeIdx} total={STAGES.length} />

      {/* Caption tying back to the stack story */}
      <div className="text-center mt-10 max-w-3xl mx-auto">
        <div className="inline-block px-4 py-2 rounded-full border border-violet-500/25 bg-violet-500/[0.05] text-white/65 text-sm">
          One decision. Every layer. Fully governed.
          <span className="text-white/35 ml-2">
            The same path runs for any decision your operation makes.
          </span>
        </div>
      </div>
    </>
  );

  if (inline) return <div>{Body}</div>;
  return (
    <section className="py-24 sm:py-32 relative" style={{ background: "var(--bg-root)" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {Body}
      </div>
    </section>
  );
}

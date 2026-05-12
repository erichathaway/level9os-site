"use client";
/**
 * /preview/the-conversation-pure
 * Shell pattern: Chat-only. Modules render INLINE inside the chat thread.
 * No tabs. No right panel. Scroll up to revisit any past module.
 * The chat history IS the navigation.
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleId =
  | "counter"
  | "calculator"
  | "article"
  | "live-feed"
  | "comparison"
  | "voice-pitch"
  | "wrapper-story";

interface ConversationState {
  threadId: string;
  messages: ChatMessage[];
  unlockedModules: ModuleId[];
  userAnswers: Record<string, unknown>;
  lastVisit: string;
}

interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content?: string;
  moduleId?: ModuleId;
  isModule?: boolean;
}

// ─── Projection model (from the-calculator) ───────────────────────────────────

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

const MODULE_META: Record<ModuleId, { label: string; suggestedReply: string; agentIntro: string }> = {
  counter: {
    label: "The Number",
    suggestedReply: "Show me a number",
    agentIntro: "Here it is. $0 to $52,686. Ninety days. Three decimal places of receipts.",
  },
  calculator: {
    label: "The Calculator",
    suggestedReply: "How would I save?",
    agentIntro: "Your operation, your numbers. Tell me a little about your setup first.",
  },
  article: {
    label: "The Story",
    suggestedReply: "Tell me a story",
    agentIntro:
      "This is the long version. How $5.07 a month prevented $52,686 in 90 days. Pull quotes, hard numbers, the actual receipts.",
  },
  "live-feed": {
    label: "The Live Feed",
    suggestedReply: "Show me it working",
    agentIntro:
      "This is the system running. Every blocked action, every rerouted call, every dollar saved. Live.",
  },
  comparison: {
    label: "The Comparison",
    suggestedReply: "Who else is doing this?",
    agentIntro:
      "Microsoft, Salesforce, Workday, Anthropic, Glean. Here is what they charge and what they prevent.",
  },
  "voice-pitch": {
    label: "The Pitch",
    suggestedReply: "Have you got 90 seconds for the whole pitch?",
    agentIntro: "Three versions. Pick how deep you want to go.",
  },
  "wrapper-story": {
    label: "The Wrapper Story",
    suggestedReply: "What is OutboundOS?",
    agentIntro:
      "OutboundOS is the first wrapper we built on this governance layer. Here is the roadmap.",
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

// ─── Inline module components ──────────────────────────────────────────────────

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
    <div className="module-counter">
      <div className="mc-number">${value.toLocaleString()}</div>
      <div className="mc-label">Prevented in 90 days</div>
      <div className="mc-stats">
        <div className="mc-stat">
          <span className="mc-stat-value">$5.07/mo</span>
          <span className="mc-stat-sub">infrastructure cost</span>
        </div>
        <div className="mc-stat-divider" />
        <div className="mc-stat">
          <span className="mc-stat-value">3,464x</span>
          <span className="mc-stat-sub">ROI ratio</span>
        </div>
        <div className="mc-stat-divider" />
        <div className="mc-stat">
          <span className="mc-stat-value">90 days</span>
          <span className="mc-stat-sub">real production data</span>
        </div>
      </div>
    </div>
  );
}

function CalculatorModule({
  defaultEmployees,
  defaultTools,
  onAnswers,
}: {
  defaultEmployees?: number;
  defaultTools?: number;
  onAnswers?: (a: { employees: number; tools: number; spend: number }) => void;
}) {
  const [employees, setEmployees] = useState(defaultEmployees ?? 10);
  const [tools, setTools] = useState(defaultTools ?? 5);
  const [spendInput, setSpendInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcProjection>>(null);

  const calculate = () => {
    const spend = parseFloat(spendInput.replace(/[^0-9.]/g, ""));
    if (!spend || spend <= 0) return;
    setResult(calcProjection(employees, tools, spend));
    onAnswers?.({ employees, tools, spend });
  };

  return (
    <div className="module-calc">
      <div className="mcalc-row">
        <label className="mcalc-label">Team size: {employees}</label>
        <input
          type="range"
          min={1}
          max={200}
          value={employees}
          onChange={(e) => setEmployees(+e.target.value)}
          className="mcalc-slider"
        />
      </div>
      <div className="mcalc-row">
        <label className="mcalc-label">AI tools in use: {tools}</label>
        <input
          type="range"
          min={1}
          max={20}
          value={tools}
          onChange={(e) => setTools(+e.target.value)}
          className="mcalc-slider"
        />
      </div>
      <div className="mcalc-row">
        <label className="mcalc-label">Monthly AI spend ($)</label>
        <input
          type="text"
          placeholder="e.g. 2000"
          value={spendInput}
          onChange={(e) => setSpendInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          className="mcalc-input"
        />
      </div>
      <button onClick={calculate} className="mcalc-btn">Calculate</button>

      {result && (
        <div className="mcalc-result">
          <div className="mcalc-r-row">
            <span className="mcalc-r-label">Projected monthly savings</span>
            <span className="mcalc-r-value">${result.prevented.toLocaleString()}</span>
          </div>
          <div className="mcalc-r-row">
            <span className="mcalc-r-label">Operator hours returned / mo</span>
            <span className="mcalc-r-value">{result.hoursMonthly} hrs</span>
          </div>
          <div className="mcalc-r-row">
            <span className="mcalc-r-label">ROI vs $5.07/mo infra</span>
            <span className="mcalc-r-value accent">{result.roiRatio.toLocaleString()}x</span>
          </div>
          <div className="mcalc-anchor">
            Eric&apos;s actual numbers: $52,686 prevented. $5.07/mo. 3,464x ROI.
          </div>
        </div>
      )}
    </div>
  );
}

function ArticleModule() {
  return (
    <div className="module-article">
      <div className="mart-eyebrow">Case Study</div>
      <h2 className="mart-headline">
        How $5.07 a Month Prevented $52,686 in 90 Days
      </h2>
      <p className="mart-dropcap">
        <span className="mart-dc">T</span>he number sounds made up. It isn&apos;t. Over 90 days, across 299 Claude
        Code sessions, a single governance layer blocked, rerouted, or flagged over a thousand agent actions
        before they could generate rework. The infrastructure cost to run it: $5.07 a month.
      </p>
      <blockquote className="mart-pullquote">
        &ldquo;The ROI isn&apos;t the point. The point is that the number is real, traceable, and repeatable.&rdquo;
      </blockquote>
      <p className="mart-body">
        Four categories drove the savings. Cost-router refusals caught mechanical work being run on expensive
        models and rerouted it. Stop hook fires caught agents claiming &ldquo;done&rdquo; without a build verify.
        Mid-session reversals caught agents contradicting their own prior done-claims. Flub events caught
        unverified assertions before they shipped to production.
      </p>
      <div className="mart-breakdown">
        <div className="mart-brow">The breakdown</div>
        {[
          { cat: "Stop hook fires", events: "125", saved: "$10,834" },
          { cat: "Mid-session reversals", events: "782", saved: "$26,361" },
          { cat: "Flub events stopped", events: "46", saved: "$11,500" },
          { cat: "Cost-router refusals", events: "44", saved: "$31" },
        ].map((r) => (
          <div key={r.cat} className="mart-row">
            <span className="mart-row-cat">{r.cat}</span>
            <span className="mart-row-events">{r.events} events</span>
            <span className="mart-row-saved">{r.saved}</span>
          </div>
        ))}
      </div>
      <p className="mart-body">
        The honest summary: most of the savings come from the Stop hook and reversal detection. Both are
        deterministic. No AI in the governance layer. Hooks that fire in under 50ms and don&apos;t hallucinate.
      </p>
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
    <div className="module-feed">
      <div className="mfeed-header">
        <span className="mfeed-label">Live audit trail</span>
        <span className="mfeed-total">${total.toFixed(2)} saved this session</span>
      </div>
      <div className="mfeed-list">
        {FEED_EVENTS.slice(0, visible).map((ev, i) => {
          const vc = VERDICT_COLORS[ev.verdict] ?? VERDICT_COLORS.ALLOWED;
          return (
            <div key={i} className="mfeed-event">
              <span
                className="mfeed-verdict"
                style={{ color: vc.color, background: vc.bg }}
              >
                {ev.verdict}
              </span>
              <span className="mfeed-action">{ev.action}</span>
              {ev.saved > 0 && (
                <span className="mfeed-saved">+${ev.saved.toFixed(2)}</span>
              )}
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
    <div className="module-comparison">
      <div className="mcomp-header">
        <span className="mcomp-label">Vendor comparison</span>
      </div>
      <div className="mcomp-table-wrap">
        <table className="mcomp-table">
          <thead>
            <tr>
              <th></th>
              <th>Microsoft</th>
              <th>Salesforce</th>
              <th>Workday</th>
              <th className="l9-col">Level9OS</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((r) => (
              <tr key={r.label}>
                <td className="mcomp-row-label">{r.label}</td>
                <td>{r.ms}</td>
                <td>{r.sf}</td>
                <td>{r.wd}</td>
                <td className="l9-col l9-val">{r.l9}</td>
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
    { id: "30s", label: "30 second", desc: "The number. The cost. The ROI. Done." },
    { id: "90s", label: "1 minute 30", desc: "Four categories, full math, one CTA." },
    { id: "5m", label: "5 minutes", desc: "Full operator briefing. Architecture, proof, onboarding." },
  ];

  return (
    <div className="module-voice">
      <div className="mvoice-label">Three versions. Same message, different depth.</div>
      {tracks.map((t) => (
        <div key={t.id} className="mvoice-track">
          <div className="mvoice-track-info">
            <span className="mvoice-track-label">{t.label}</span>
            <span className="mvoice-track-desc">{t.desc}</span>
          </div>
          <button
            className={`mvoice-play ${playing === t.id ? "active" : ""}`}
            onClick={() => setPlaying(playing === t.id ? null : t.id)}
          >
            {playing === t.id ? "■" : "▶"}
          </button>
          <div className="mvoice-waveform">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="mvoice-bar"
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
      <div className="mvoice-note">Audio coming soon. Placeholder play states shown.</div>
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
    <div className="module-wrapper">
      <div className="mwrap-label">Level9OS is the governance layer. Wrappers sit on top.</div>
      <div className="mwrap-stack">
        {wrappers.map((w) => (
          <div key={w.name} className={`mwrap-card ${w.status}`} style={{ "--wc": w.color } as React.CSSProperties}>
            <div className="mwrap-card-top">
              <span className="mwrap-name">{w.name}</span>
              <span className="mwrap-badge">{w.status === "live" ? "Live" : "Planned"}</span>
            </div>
            <div className="mwrap-desc">{w.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleRenderer({ moduleId, userAnswers }: { moduleId: ModuleId; userAnswers: Record<string, unknown> }) {
  switch (moduleId) {
    case "counter": return <CounterModule />;
    case "calculator": return (
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
    default: return null;
  }
}

// ─── State helpers ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "level9os.conversation.v1";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function loadState(): ConversationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as ConversationState;
    const age = Date.now() - new Date(s.lastVisit).getTime();
    if (age > 30 * 24 * 60 * 60 * 1000) return null;
    return s;
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

// ─── Suggested reply logic ─────────────────────────────────────────────────────

function getSuggestedReplies(unlockedModules: ModuleId[], awaitingCalcInput: boolean): { id: string; label: string }[] {
  if (awaitingCalcInput) return [];

  const unrevealed = MODULE_ORDER.filter((m) => !unlockedModules.includes(m));
  const count = unlockedModules.length;

  const replies: { id: string; label: string }[] = [];

  // Show surprise option early
  if (count === 0) {
    replies.push({ id: "surprise", label: "Surprise me" });
  }

  // Add unrevealed module triggers (first 3 unrevealed)
  for (const m of unrevealed.slice(0, 3)) {
    const meta = MODULE_META[m];
    if (m !== "voice-pitch" && m !== "calculator") {
      replies.push({ id: m, label: meta.suggestedReply });
    }
  }

  // After 5 modules: add pitch + CTA
  if (count >= 5) {
    if (!unlockedModules.includes("voice-pitch")) {
      replies.push({ id: "voice-pitch", label: MODULE_META["voice-pitch"].suggestedReply });
    }
    replies.push({ id: "cta", label: "Want to talk to a person?" });
  }

  // After all modules revealed
  if (unrevealed.length === 0) {
    replies.push({ id: "restart", label: "Restart and see a different order" });
    replies.push({ id: "cta", label: "Talk to a person" });
  }

  return replies.slice(0, 5);
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TheConversationPure() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unlockedModules, setUnlockedModules] = useState<ModuleId[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, unknown>>({});
  const [typing, setTyping] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [awaitingCalcInput, setAwaitingCalcInput] = useState(false);
  const [maxSelf, setMaxSelf] = useState(false);
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
    setMessages((prev) => {
      const next = [...prev, m];
      return next;
    });
    setTimeout(scrollToBottom, 20);
    return m.id;
  }, [scrollToBottom]);

  const agentSay = useCallback((content: string, delay = 0) => {
    return new Promise<void>((resolve) => {
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

  const revealModule = useCallback((moduleId: ModuleId) => {
    return new Promise<void>((resolve) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addMessage({ role: "agent", isModule: true, moduleId });
        setUnlockedModules((prev) => {
          const next = prev.includes(moduleId) ? prev : [...prev, moduleId];
          return next;
        });
        setTimeout(scrollToBottom, 100);
        resolve();
      }, 700);
    });
  }, [addMessage, scrollToBottom]);

  // Init
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const saved = loadState();
    if (saved && saved.messages.length > 0) {
      // Returning visitor
      threadId.current = saved.threadId;
      setMessages(saved.messages);
      setUnlockedModules(saved.unlockedModules);
      setUserAnswers(saved.userAnswers);
      setIsReturning(true);

      const names = saved.unlockedModules
        .slice(0, 3)
        .map((m) => MODULE_META[m].label)
        .join(", ");

      agentSay(
        `Welcome back. Last time you looked at: ${names}. Want to pick up where you left off, or start fresh and see a different angle?`,
        300
      );
    } else {
      // Fresh visit
      agentSay(
        "Hi. I just saved someone $52,686 in 90 days. I have about 8 things to show you, in whatever order you want. Where should we start?"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state whenever messages or modules change
  useEffect(() => {
    if (messages.length === 0) return;
    saveState({
      threadId: threadId.current,
      messages,
      unlockedModules,
      userAnswers,
      lastVisit: new Date().toISOString(),
    });
  }, [messages, unlockedModules, userAnswers]);

  const handleReply = useCallback(
    async (replyId: string, replyLabel: string) => {
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
        await revealModule(pick);

        // MAX handoff after 2-3 modules
        const newCount = unlockedModules.length + 1;
        if (newCount === 2 && !maxSelf) {
          setMaxSelf(true);
          await agentSay(
            "Quick heads-up: you've been chatting with MAX this whole time. The interface. Same voice, just naming myself now.",
            400
          );
        }
        return;
      }

      const moduleId = replyId as ModuleId;
      if (MODULE_META[moduleId]) {
        addMessage({ role: "user", content: replyLabel });

        if (moduleId === "calculator" && !userAnswers.calcSetup) {
          // Gate: ask for setup first
          setAwaitingCalcInput(true);
          await agentSay(MODULE_META.calculator.agentIntro, 200);
          await revealModule("calculator");
          setUnlockedModules((prev) => (prev.includes("calculator") ? prev : [...prev, "calculator"]));
          setAwaitingCalcInput(false);
          return;
        }

        await agentSay(MODULE_META[moduleId].agentIntro, 200);
        await revealModule(moduleId);

        const newCount = unlockedModules.length + 1;
        if (newCount === 2 && !maxSelf) {
          setMaxSelf(true);
          await agentSay(
            "Quick heads-up: you've been chatting with MAX this whole time. The interface. Same voice, just naming myself now.",
            500
          );
        }
      }
    },
    [addMessage, agentSay, revealModule, unlockedModules, userAnswers, maxSelf]
  );

  const suggestedReplies = typing
    ? []
    : getSuggestedReplies(unlockedModules, awaitingCalcInput);

  return (
    <div className="cp-root">
      <style>{`
        .cp-root {
          min-height: 100dvh;
          background: #070710;
          color: rgba(255,255,255,0.88);
          font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── Thread ── */
        .cp-thread {
          width: 100%;
          max-width: 720px;
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 1.25rem;
        }

        /* ── Header ── */
        .cp-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 0 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 0.5rem;
        }
        .cp-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
          color: white;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .cp-agent-info { display: flex; flex-direction: column; gap: 0.1rem; }
        .cp-agent-name { font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.85); }
        .cp-agent-sub { font-size: 0.67rem; color: rgba(255,255,255,0.3); }
        .cp-restart-btn {
          margin-left: auto;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.25);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .cp-restart-btn:hover { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.05); }
        .cp-variant-badge {
          font-family: ui-monospace, monospace;
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(139,92,246,0.6);
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
        }

        /* ── Feed ── */
        .cp-feed {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          padding: 1rem 0 0.5rem;
        }
        .cp-feed::-webkit-scrollbar { width: 4px; }
        .cp-feed::-webkit-scrollbar-track { background: transparent; }
        .cp-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        /* ── Messages ── */
        .cp-msg {
          display: flex;
          gap: 0.625rem;
          animation: cp-fade 0.35s ease;
        }
        @keyframes cp-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
        .cp-msg.user { flex-direction: row-reverse; }
        .cp-msg-avatar {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.55rem;
          font-weight: 800;
          color: white;
          margin-top: 3px;
        }
        .cp-msg.user .cp-msg-avatar {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
        }
        .cp-msg-bubble {
          max-width: 78%;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          font-size: 0.85rem;
          line-height: 1.7;
          white-space: pre-wrap;
        }
        .cp-msg.agent .cp-msg-bubble {
          background: #141428;
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
          border-radius: 4px 14px 14px 14px;
        }
        .cp-msg.user .cp-msg-bubble {
          background: rgba(139,92,246,0.14);
          border: 1px solid rgba(139,92,246,0.22);
          color: rgba(255,255,255,0.8);
          text-align: right;
          border-radius: 14px 14px 4px 14px;
        }

        /* ── Inline module cards ── */
        .cp-module-wrap {
          width: 100%;
          animation: cp-fade 0.4s ease;
        }
        .cp-module-wrap .cp-msg-avatar {
          margin-top: 3px;
        }

        /* ── Typing indicator ── */
        .cp-typing {
          display: flex;
          gap: 0.625rem;
          align-items: center;
          animation: cp-fade 0.25s ease;
        }
        .cp-typing-avatar {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          flex-shrink: 0;
        }
        .cp-typing-dots {
          background: #141428;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px 14px 14px 14px;
          padding: 0.75rem 1rem;
          display: flex;
          gap: 0.3rem;
          align-items: center;
        }
        .cp-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(139,92,246,0.6);
          animation: cp-bounce 1.2s ease-in-out infinite;
        }
        .cp-dot:nth-child(2) { animation-delay: 0.18s; }
        .cp-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes cp-bounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }

        /* ── Suggested replies ── */
        .cp-replies-wrap {
          width: 100%;
          max-width: 720px;
          padding: 0.75rem 1.25rem 2rem;
          background: linear-gradient(to top, #070710 70%, transparent);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .cp-replies-label {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.15rem;
        }
        .cp-reply {
          padding: 0.65rem 0.9rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
          text-align: left;
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }
        .cp-reply:hover {
          background: rgba(139,92,246,0.1);
          border-color: rgba(139,92,246,0.3);
          color: rgba(255,255,255,0.9);
        }

        /* ── Counter module ── */
        .module-counter {
          background: #0d0d20;
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 14px;
          padding: 1.75rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
        }
        .mc-number {
          font-size: clamp(2.5rem, 8vw, 3.5rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #8b5cf6;
          font-variant-numeric: tabular-nums;
        }
        .mc-label {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .mc-stats {
          display: flex;
          gap: 1.25rem;
          align-items: center;
          margin-top: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .mc-stat { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
        .mc-stat-value { font-size: 0.95rem; font-weight: 800; color: rgba(255,255,255,0.85); }
        .mc-stat-sub { font-size: 0.62rem; color: rgba(255,255,255,0.3); }
        .mc-stat-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.08); }

        /* ── Calculator module ── */
        .module-calc {
          background: #0d0d20;
          border: 1px solid rgba(245,158,11,0.15);
          border-radius: 14px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }
        .mcalc-row { display: flex; flex-direction: column; gap: 0.35rem; }
        .mcalc-label { font-size: 0.78rem; color: rgba(255,255,255,0.55); }
        .mcalc-slider {
          width: 100%;
          accent-color: #f59e0b;
        }
        .mcalc-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.6rem 0.875rem;
          color: rgba(255,255,255,0.85);
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
        }
        .mcalc-input:focus { border-color: rgba(245,158,11,0.4); }
        .mcalc-btn {
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
        }
        .mcalc-btn:hover { background: rgba(245,158,11,0.22); }
        .mcalc-result {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .mcalc-r-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        .mcalc-r-label { font-size: 0.78rem; color: rgba(255,255,255,0.45); }
        .mcalc-r-value { font-size: 0.92rem; font-weight: 700; color: rgba(255,255,255,0.85); font-variant-numeric: tabular-nums; }
        .mcalc-r-value.accent { color: #f59e0b; }
        .mcalc-anchor {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.25);
          font-style: italic;
          margin-top: 0.25rem;
        }

        /* ── Article module ── */
        .module-article {
          background: #0e0e1a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 1.75rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }
        .mart-eyebrow {
          font-family: ui-monospace, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }
        .mart-headline {
          font-size: clamp(1.1rem, 2.5vw, 1.35rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.25;
          color: rgba(255,255,255,0.92);
          margin: 0;
        }
        .mart-dropcap {
          font-size: 0.85rem;
          line-height: 1.75;
          color: rgba(255,255,255,0.72);
          margin: 0;
        }
        .mart-dc {
          float: left;
          font-size: 3.2em;
          line-height: 0.75;
          margin: 0.1em 0.08em 0 0;
          color: rgba(255,255,255,0.85);
          font-weight: 900;
        }
        .mart-pullquote {
          border-left: 2px solid rgba(139,92,246,0.5);
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 0;
          font-size: 0.9rem;
          font-style: italic;
          color: rgba(255,255,255,0.5);
          line-height: 1.65;
        }
        .mart-body {
          font-size: 0.85rem;
          line-height: 1.8;
          color: rgba(255,255,255,0.65);
          margin: 0;
        }
        .mart-breakdown {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .mart-brow {
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 0.25rem;
        }
        .mart-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
        }
        .mart-row-cat { flex: 1; color: rgba(255,255,255,0.65); }
        .mart-row-events { color: rgba(255,255,255,0.3); font-size: 0.72rem; }
        .mart-row-saved { font-weight: 700; color: #8b5cf6; font-variant-numeric: tabular-nums; }

        /* ── Live feed module ── */
        .module-feed {
          background: #0a0a16;
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 14px;
          padding: 1.25rem;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mfeed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .mfeed-label {
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          font-family: ui-monospace, monospace;
        }
        .mfeed-total {
          font-size: 0.72rem;
          font-weight: 700;
          color: #10b981;
          font-variant-numeric: tabular-nums;
        }
        .mfeed-list { display: flex; flex-direction: column; gap: 0.4rem; }
        .mfeed-event {
          display: flex;
          align-items: baseline;
          gap: 0.625rem;
          font-size: 0.76rem;
          padding: 0.45rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          animation: cp-fade 0.3s ease;
          flex-wrap: wrap;
        }
        .mfeed-verdict {
          font-family: ui-monospace, monospace;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.45rem;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .mfeed-action { flex: 1; color: rgba(255,255,255,0.6); min-width: 120px; }
        .mfeed-saved { font-weight: 700; color: #10b981; font-size: 0.72rem; white-space: nowrap; }

        /* ── Comparison module ── */
        .module-comparison {
          background: #0d0d1e;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 1.25rem;
          width: 100%;
          overflow: hidden;
        }
        .mcomp-header { margin-bottom: 0.875rem; }
        .mcomp-label {
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          font-family: ui-monospace, monospace;
        }
        .mcomp-table-wrap { overflow-x: auto; }
        .mcomp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
          min-width: 440px;
        }
        .mcomp-table th {
          text-align: left;
          padding: 0.4rem 0.625rem;
          color: rgba(255,255,255,0.3);
          font-weight: 600;
          font-size: 0.68rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .mcomp-table td {
          padding: 0.5rem 0.625rem;
          color: rgba(255,255,255,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: top;
        }
        .mcomp-row-label { color: rgba(255,255,255,0.62); font-weight: 500; }
        .l9-col { background: rgba(139,92,246,0.05); }
        .l9-val { color: rgba(255,255,255,0.88) !important; font-weight: 700; }
        .mcomp-table th.l9-col { color: #8b5cf6; }

        /* ── Voice pitch module ── */
        .module-voice {
          background: #0d0d1e;
          border: 1px solid rgba(236,72,153,0.15);
          border-radius: 14px;
          padding: 1.5rem;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mvoice-label {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.45);
        }
        .mvoice-track {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 0.875rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .mvoice-track-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 80px;
        }
        .mvoice-track-label { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.8); }
        .mvoice-track-desc { font-size: 0.7rem; color: rgba(255,255,255,0.35); }
        .mvoice-play {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(236,72,153,0.12);
          border: 1px solid rgba(236,72,153,0.25);
          color: #ec4899;
          font-size: 0.7rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s ease;
        }
        .mvoice-play.active { background: rgba(236,72,153,0.28); }
        .mvoice-play:hover { background: rgba(236,72,153,0.22); }
        .mvoice-waveform {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 28px;
        }
        .mvoice-bar {
          width: 3px;
          border-radius: 2px;
          background: rgba(236,72,153,0.4);
          animation: mvoice-wave 0.8s ease-in-out infinite alternate;
        }
        @keyframes mvoice-wave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1.2); }
        }
        .mvoice-note {
          font-size: 0.66rem;
          color: rgba(255,255,255,0.2);
          font-style: italic;
        }

        /* ── Wrapper story module ── */
        .module-wrapper {
          background: #0d0d1e;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 1.5rem;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mwrap-label { font-size: 0.78rem; color: rgba(255,255,255,0.45); }
        .mwrap-stack { display: flex; flex-direction: column; gap: 0.5rem; }
        .mwrap-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 0.875rem 1rem;
          border-left: 3px solid var(--wc, #8b5cf6);
          transition: border-color 0.15s ease;
        }
        .mwrap-card.planned { opacity: 0.55; }
        .mwrap-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.3rem;
        }
        .mwrap-name { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.85); }
        .mwrap-badge {
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--wc, #8b5cf6);
          font-family: ui-monospace, monospace;
        }
        .mwrap-desc { font-size: 0.75rem; color: rgba(255,255,255,0.4); line-height: 1.5; }

        /* ── Mobile ── */
        @media (max-width: 520px) {
          .cp-thread { padding: 0 0.875rem; }
          .cp-replies-wrap { padding: 0.75rem 0.875rem 1.75rem; }
          .module-counter { padding: 1.25rem 1rem; }
          .module-article { padding: 1.25rem 1rem; }
          .mcomp-table { font-size: 0.7rem; }
        }
      `}</style>

      <div className="cp-thread">
        <div className="cp-header">
          <div className="cp-avatar">L9</div>
          <div className="cp-agent-info">
            <div className="cp-agent-name">{maxSelf ? "MAX" : "Level9OS"}</div>
            <div className="cp-agent-sub">AI Operating System</div>
          </div>
          <span className="cp-variant-badge">Chat-only</span>
          <button
            className="cp-restart-btn"
            onClick={() => {
              clearState();
              window.location.reload();
            }}
          >
            Restart
          </button>
        </div>

        <div className="cp-feed" ref={feedRef}>
          {messages.map((msg) => {
            if (msg.isModule && msg.moduleId) {
              return (
                <div key={msg.id} className="cp-msg agent cp-module-wrap">
                  <div className="cp-msg-avatar">L9</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <ModuleRenderer moduleId={msg.moduleId} userAnswers={userAnswers} />
                  </div>
                </div>
              );
            }
            return (
              <div key={msg.id} className={`cp-msg ${msg.role}`}>
                <div className="cp-msg-avatar">{msg.role === "agent" ? (maxSelf ? "MX" : "L9") : "You"}</div>
                <div className="cp-msg-bubble">{msg.content}</div>
              </div>
            );
          })}
          {typing && (
            <div className="cp-typing">
              <div className="cp-typing-avatar" />
              <div className="cp-typing-dots">
                <div className="cp-dot" />
                <div className="cp-dot" />
                <div className="cp-dot" />
              </div>
            </div>
          )}
        </div>
      </div>

      {!typing && suggestedReplies.length > 0 && (
        <div className="cp-replies-wrap">
          <div className="cp-replies-label">Reply</div>
          {suggestedReplies.map((r) => (
            <button key={r.id} className="cp-reply" onClick={() => handleReply(r.id, r.label)}>
              {r.label}
            </button>
          ))}
        </div>
      )}

      {isReturning && (
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            padding: "0 1.25rem 0.5rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            className="cp-reply"
            style={{ flex: 1, textAlign: "center" }}
            onClick={() => {
              clearState();
              window.location.reload();
            }}
          >
            Start fresh
          </button>
        </div>
      )}
    </div>
  );
}

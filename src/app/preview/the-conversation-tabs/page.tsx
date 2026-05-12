"use client";
/**
 * /preview/the-conversation-tabs
 * Shell pattern: Two-column. Chat on left (~40%), right panel shows active module.
 * Tabs at top of right panel show all unlocked modules. Modules slide in when unlocked.
 * On mobile: stack vertically. Tabs become horizontal chip carousel.
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
  activeModule?: ModuleId;
  userAnswers: Record<string, unknown>;
  lastVisit: string;
}

interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content: string;
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

const MODULE_META: Record<ModuleId, { label: string; icon: string; suggestedReply: string; agentIntro: string }> = {
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

// ─── Module panel components ──────────────────────────────────────────────────

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
    <div className="tp-module-inner">
      <div className="tp-counter-num">${value.toLocaleString()}</div>
      <div className="tp-counter-label">Prevented in 90 days</div>
      <div className="tp-counter-stats">
        <div className="tp-counter-stat">
          <span className="tp-cs-val">$5.07/mo</span>
          <span className="tp-cs-sub">infrastructure cost</span>
        </div>
        <div className="tp-cs-divider" />
        <div className="tp-counter-stat">
          <span className="tp-cs-val">3,464x</span>
          <span className="tp-cs-sub">ROI ratio</span>
        </div>
        <div className="tp-cs-divider" />
        <div className="tp-counter-stat">
          <span className="tp-cs-val">90 days</span>
          <span className="tp-cs-sub">real production data</span>
        </div>
      </div>
      <div className="tp-counter-sub-grid">
        {[
          { cat: "Stop hook fires", n: "125 events", saved: "$10,834" },
          { cat: "Mid-session reversals", n: "782 events", saved: "$26,361" },
          { cat: "Flub events stopped", n: "46 events", saved: "$11,500" },
          { cat: "Cost-router refusals", n: "44 events", saved: "$31" },
        ].map((r) => (
          <div key={r.cat} className="tp-counter-breakdown-row">
            <span className="tp-cbs-cat">{r.cat}</span>
            <span className="tp-cbs-n">{r.n}</span>
            <span className="tp-cbs-saved">{r.saved}</span>
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
    <div className="tp-module-inner">
      <div className="tp-calc-row">
        <label className="tp-calc-label">Team size: {employees}</label>
        <input type="range" min={1} max={200} value={employees}
          onChange={(e) => setEmployees(+e.target.value)} className="tp-calc-slider" />
      </div>
      <div className="tp-calc-row">
        <label className="tp-calc-label">AI tools in use: {tools}</label>
        <input type="range" min={1} max={20} value={tools}
          onChange={(e) => setTools(+e.target.value)} className="tp-calc-slider" />
      </div>
      <div className="tp-calc-row">
        <label className="tp-calc-label">Monthly AI spend ($)</label>
        <input type="text" placeholder="e.g. 2000" value={spendInput}
          onChange={(e) => setSpendInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          className="tp-calc-input" />
      </div>
      <button onClick={calculate} className="tp-calc-btn">Calculate</button>
      {result && (
        <div className="tp-calc-result">
          <div className="tp-cr-row">
            <span className="tp-cr-label">Projected monthly savings</span>
            <span className="tp-cr-val">${result.prevented.toLocaleString()}</span>
          </div>
          <div className="tp-cr-row">
            <span className="tp-cr-label">Operator hours returned / mo</span>
            <span className="tp-cr-val">{result.hoursMonthly} hrs</span>
          </div>
          <div className="tp-cr-row">
            <span className="tp-cr-label">ROI vs $5.07/mo infra</span>
            <span className="tp-cr-val accent">{result.roiRatio.toLocaleString()}x</span>
          </div>
          <div className="tp-calc-anchor">
            Eric&apos;s actual numbers: $52,686 prevented. $5.07/mo. 3,464x ROI.
          </div>
        </div>
      )}
    </div>
  );
}

function ArticleModule() {
  return (
    <div className="tp-module-inner tp-article">
      <div className="tp-art-eyebrow">Case Study</div>
      <h2 className="tp-art-headline">How $5.07 a Month Prevented $52,686 in 90 Days</h2>
      <p className="tp-art-dropcap">
        <span className="tp-art-dc">T</span>he number sounds made up. It isn&apos;t. Over 90 days, across 299
        Claude Code sessions, a single governance layer blocked, rerouted, or flagged over a thousand agent
        actions before they could generate rework. The infrastructure cost: $5.07 a month.
      </p>
      <blockquote className="tp-art-pullquote">
        &ldquo;The ROI isn&apos;t the point. The point is that the number is real, traceable, and repeatable.&rdquo;
      </blockquote>
      <p className="tp-art-body">
        Four categories drove the savings. Cost-router refusals caught mechanical work being run on expensive
        models and rerouted it. Stop hook fires caught agents claiming &ldquo;done&rdquo; without a build verify.
        Mid-session reversals caught agents contradicting their own prior done-claims. Flub events caught
        unverified assertions before they shipped to production.
      </p>
      <div className="tp-art-breakdown">
        {[
          { cat: "Stop hook fires", events: "125 events", saved: "$10,834" },
          { cat: "Mid-session reversals", events: "782 events", saved: "$26,361" },
          { cat: "Flub events stopped", events: "46 events", saved: "$11,500" },
          { cat: "Cost-router refusals", events: "44 events", saved: "$31" },
        ].map((r) => (
          <div key={r.cat} className="tp-art-row">
            <span className="tp-art-cat">{r.cat}</span>
            <span className="tp-art-ev">{r.events}</span>
            <span className="tp-art-saved">{r.saved}</span>
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
    <div className="tp-module-inner">
      <div className="tp-feed-header">
        <span className="tp-feed-label">Live audit trail</span>
        <span className="tp-feed-total">${total.toFixed(2)} saved this session</span>
      </div>
      <div className="tp-feed-list">
        {FEED_EVENTS.slice(0, visible).map((ev, i) => {
          const vc = VERDICT_COLORS[ev.verdict] ?? VERDICT_COLORS.ALLOWED;
          return (
            <div key={i} className="tp-feed-event">
              <span className="tp-feed-verdict" style={{ color: vc.color, background: vc.bg }}>{ev.verdict}</span>
              <span className="tp-feed-action">{ev.action}</span>
              {ev.saved > 0 && <span className="tp-feed-saved">+${ev.saved.toFixed(2)}</span>}
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
    <div className="tp-module-inner">
      <div className="tp-comp-label">Vendor comparison</div>
      <div className="tp-comp-table-wrap">
        <table className="tp-comp-table">
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
                <td className="tp-comp-row-label">{r.label}</td>
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
    { id: "30s", label: "30 seconds", desc: "The number. The cost. The ROI. Done." },
    { id: "90s", label: "1 minute 30", desc: "Four categories, full math, one CTA." },
    { id: "5m", label: "5 minutes", desc: "Full operator briefing. Architecture, proof, onboarding." },
  ];
  return (
    <div className="tp-module-inner">
      <div className="tp-voice-label">Three versions. Same message, different depth.</div>
      {tracks.map((t) => (
        <div key={t.id} className="tp-voice-track">
          <div className="tp-voice-track-info">
            <span className="tp-vt-label">{t.label}</span>
            <span className="tp-vt-desc">{t.desc}</span>
          </div>
          <button
            className={`tp-voice-play ${playing === t.id ? "active" : ""}`}
            onClick={() => setPlaying(playing === t.id ? null : t.id)}
          >
            {playing === t.id ? "■" : "▶"}
          </button>
          <div className="tp-voice-waveform">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="tp-voice-bar"
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
      <div className="tp-voice-note">Audio coming soon. Placeholder play states shown.</div>
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
    <div className="tp-module-inner">
      <div className="tp-wrap-label">Level9OS is the governance layer. Wrappers sit on top.</div>
      <div className="tp-wrap-stack">
        {wrappers.map((w) => (
          <div key={w.name} className={`tp-wrap-card ${w.status}`}
            style={{ "--wc": w.color } as React.CSSProperties}>
            <div className="tp-wc-top">
              <span className="tp-wc-name">{w.name}</span>
              <span className="tp-wc-badge">{w.status === "live" ? "Live" : "Planned"}</span>
            </div>
            <div className="tp-wc-desc">{w.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModulePanel({
  moduleId,
  userAnswers,
}: {
  moduleId: ModuleId;
  userAnswers: Record<string, unknown>;
}) {
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

const STORAGE_KEY = "level9os.conversation.tabs.v1";

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

function getSuggestedReplies(
  unlockedModules: ModuleId[]
): { id: string; label: string }[] {
  const unrevealed = MODULE_ORDER.filter((m) => !unlockedModules.includes(m));
  const count = unlockedModules.length;
  const replies: { id: string; label: string }[] = [];

  if (count === 0) {
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
    replies.push({ id: "restart", label: "Restart and see a different order" });
    replies.push({ id: "cta", label: "Talk to a person" });
  }

  return replies.slice(0, 5);
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TheConversationTabs() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unlockedModules, setUnlockedModules] = useState<ModuleId[]>([]);
  const [activeModule, setActiveModule] = useState<ModuleId | undefined>(undefined);
  const [userAnswers, setUserAnswers] = useState<Record<string, unknown>>({});
  const [typing, setTyping] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [maxSelf, setMaxSelf] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
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

  const revealModule = useCallback((moduleId: ModuleId): Promise<void> => {
    return new Promise((resolve) => {
      setUnlockedModules((prev) => {
        const next = prev.includes(moduleId) ? prev : [...prev, moduleId];
        return next;
      });
      setActiveModule(moduleId);
      setPanelVisible(true);
      resolve();
    });
  }, []);

  // Init
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const saved = loadState();
    if (saved && saved.messages.length > 0) {
      threadId.current = saved.threadId;
      setMessages(saved.messages);
      setUnlockedModules(saved.unlockedModules);
      setUserAnswers(saved.userAnswers);
      if (saved.activeModule) {
        setActiveModule(saved.activeModule);
        setPanelVisible(true);
      }
      setIsReturning(true);

      const names = saved.unlockedModules
        .slice(0, 3)
        .map((m) => MODULE_META[m].label)
        .join(", ");

      agentSay(
        `Welcome back. Last time you looked at: ${names}. Want to pick up where you left off, or start fresh?`,
        300
      );
    } else {
      agentSay(
        "Hi. I just saved someone $52,686 in 90 days. I have about 8 things to show you, in whatever order you want. Where should we start?"
      );
    }
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
    });
  }, [messages, unlockedModules, activeModule, userAnswers]);

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
        const meta = MODULE_META[pick];
        await agentSay(`${meta.agentIntro}`, 200);
        await revealModule(pick);

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
    [addMessage, agentSay, revealModule, unlockedModules, maxSelf]
  );

  const suggestedReplies = typing ? [] : getSuggestedReplies(unlockedModules);

  return (
    <div className="ct-root">
      <style>{`
        .ct-root {
          min-height: 100dvh;
          background: #070710;
          color: rgba(255,255,255,0.88);
          font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Top header bar ── */
        .ct-topbar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .ct-avatar {
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
        .ct-agent-info { display: flex; flex-direction: column; gap: 0.05rem; }
        .ct-agent-name { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.85); }
        .ct-agent-sub { font-size: 0.65rem; color: rgba(255,255,255,0.28); }
        .ct-variant-badge {
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
        .ct-restart-btn {
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
        .ct-restart-btn:hover { color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.04); }

        /* ── Body: two column ── */
        .ct-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          min-height: 0;
        }

        /* ── Left: chat ── */
        .ct-chat {
          width: 38%;
          min-width: 280px;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.06);
          height: calc(100dvh - 61px);
        }
        .ct-feed {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.25rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ct-feed::-webkit-scrollbar { width: 3px; }
        .ct-feed::-webkit-scrollbar-track { background: transparent; }
        .ct-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        /* ── Messages ── */
        .ct-msg {
          display: flex;
          gap: 0.5rem;
          animation: ct-fade 0.3s ease;
        }
        @keyframes ct-fade {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: none; }
        }
        .ct-msg.user { flex-direction: row-reverse; }
        .ct-msg-avatar {
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
        .ct-msg.user .ct-msg-avatar {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.45);
        }
        .ct-msg-bubble {
          max-width: 85%;
          padding: 0.6rem 0.875rem;
          border-radius: 12px;
          font-size: 0.8rem;
          line-height: 1.65;
          white-space: pre-wrap;
        }
        .ct-msg.agent .ct-msg-bubble {
          background: #141428;
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.82);
          border-radius: 4px 12px 12px 12px;
        }
        .ct-msg.user .ct-msg-bubble {
          background: rgba(139,92,246,0.13);
          border: 1px solid rgba(139,92,246,0.2);
          color: rgba(255,255,255,0.75);
          text-align: right;
          border-radius: 12px 12px 4px 12px;
        }

        /* ── Module unlock notification in chat ── */
        .ct-unlock-msg {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.73rem;
          color: rgba(139,92,246,0.8);
          animation: ct-fade 0.3s ease;
          padding: 0.4rem 0;
        }
        .ct-unlock-arrow { font-size: 0.65rem; }

        /* ── Typing ── */
        .ct-typing {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          animation: ct-fade 0.25s ease;
        }
        .ct-typing-avatar {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          flex-shrink: 0;
        }
        .ct-typing-dots {
          background: #141428;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px 12px 12px 12px;
          padding: 0.6rem 0.875rem;
          display: flex;
          gap: 0.28rem;
          align-items: center;
        }
        .ct-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(139,92,246,0.6);
          animation: ct-bounce 1.2s ease-in-out infinite;
        }
        .ct-dot:nth-child(2) { animation-delay: 0.18s; }
        .ct-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes ct-bounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-3px); }
        }

        /* ── Suggested replies ── */
        .ct-replies {
          padding: 0.75rem 1.25rem 1.25rem;
          background: linear-gradient(to top, #070710 60%, transparent);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex-shrink: 0;
        }
        .ct-replies-label {
          font-size: 0.58rem;
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.1rem;
        }
        .ct-reply {
          padding: 0.55rem 0.8rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          cursor: pointer;
          font-size: 0.76rem;
          color: rgba(255,255,255,0.65);
          text-align: left;
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }
        .ct-reply:hover {
          background: rgba(139,92,246,0.09);
          border-color: rgba(139,92,246,0.28);
          color: rgba(255,255,255,0.88);
        }

        /* ── Right: panel ── */
        .ct-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: calc(100dvh - 61px);
          overflow: hidden;
        }

        /* ── Tab bar ── */
        .ct-tabs {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 0 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow-x: auto;
          flex-shrink: 0;
          scrollbar-width: none;
        }
        .ct-tabs::-webkit-scrollbar { display: none; }
        .ct-tab {
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
        .ct-tab:hover { color: rgba(255,255,255,0.65); }
        .ct-tab.active {
          color: rgba(255,255,255,0.9);
          border-bottom-color: #8b5cf6;
        }
        .ct-tab-icon {
          font-family: ui-monospace, monospace;
          font-size: 0.6rem;
          color: rgba(139,92,246,0.7);
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 3px;
          padding: 0.1rem 0.3rem;
          flex-shrink: 0;
        }

        /* Empty panel state */
        .ct-panel-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 2rem;
          text-align: center;
        }
        .ct-panel-empty-icon {
          font-size: 2rem;
          opacity: 0.15;
        }
        .ct-panel-empty-text {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.22);
          max-width: 28ch;
          line-height: 1.6;
        }

        /* ── Panel content ── */
        .ct-panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          animation: ct-slide-in 0.35s ease;
        }
        .ct-panel-content::-webkit-scrollbar { width: 4px; }
        .ct-panel-content::-webkit-scrollbar-track { background: transparent; }
        .ct-panel-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        @keyframes ct-slide-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: none; }
        }

        /* ── Shared module inner styles ── */
        .tp-module-inner {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Counter */
        .tp-counter-num {
          font-size: clamp(2.8rem, 5vw, 4rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #8b5cf6;
          font-variant-numeric: tabular-nums;
        }
        .tp-counter-label {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.38);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: -0.75rem;
        }
        .tp-counter-stats {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .tp-counter-stat { display: flex; flex-direction: column; gap: 0.1rem; }
        .tp-cs-val { font-size: 1rem; font-weight: 800; color: rgba(255,255,255,0.85); }
        .tp-cs-sub { font-size: 0.62rem; color: rgba(255,255,255,0.3); }
        .tp-cs-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.07); }
        .tp-counter-sub-grid {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tp-counter-breakdown-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
        }
        .tp-cbs-cat { flex: 1; color: rgba(255,255,255,0.6); }
        .tp-cbs-n { color: rgba(255,255,255,0.28); font-size: 0.72rem; }
        .tp-cbs-saved { font-weight: 700; color: #8b5cf6; font-variant-numeric: tabular-nums; }

        /* Calculator */
        .tp-calc-row { display: flex; flex-direction: column; gap: 0.35rem; }
        .tp-calc-label { font-size: 0.78rem; color: rgba(255,255,255,0.5); }
        .tp-calc-slider { width: 100%; accent-color: #f59e0b; }
        .tp-calc-input {
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
        .tp-calc-input:focus { border-color: rgba(245,158,11,0.4); }
        .tp-calc-btn {
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
        .tp-calc-btn:hover { background: rgba(245,158,11,0.22); }
        .tp-calc-result {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .tp-cr-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
        .tp-cr-label { font-size: 0.78rem; color: rgba(255,255,255,0.45); }
        .tp-cr-val { font-size: 0.92rem; font-weight: 700; color: rgba(255,255,255,0.85); font-variant-numeric: tabular-nums; }
        .tp-cr-val.accent { color: #f59e0b; }
        .tp-calc-anchor { font-size: 0.68rem; color: rgba(255,255,255,0.22); font-style: italic; margin-top: 0.25rem; }

        /* Article */
        .tp-article { max-width: 640px; }
        .tp-art-eyebrow {
          font-family: ui-monospace, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .tp-art-headline {
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.2;
          color: rgba(255,255,255,0.92);
          margin: 0;
        }
        .tp-art-dropcap { font-size: 0.88rem; line-height: 1.75; color: rgba(255,255,255,0.7); margin: 0; }
        .tp-art-dc {
          float: left;
          font-size: 3.4em;
          line-height: 0.75;
          margin: 0.1em 0.08em 0 0;
          color: rgba(255,255,255,0.88);
          font-weight: 900;
        }
        .tp-art-pullquote {
          border-left: 2px solid rgba(139,92,246,0.5);
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 0;
          font-size: 0.92rem;
          font-style: italic;
          color: rgba(255,255,255,0.48);
          line-height: 1.65;
        }
        .tp-art-body { font-size: 0.88rem; line-height: 1.8; color: rgba(255,255,255,0.62); margin: 0; }
        .tp-art-breakdown {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tp-art-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; }
        .tp-art-cat { flex: 1; color: rgba(255,255,255,0.62); }
        .tp-art-ev { color: rgba(255,255,255,0.28); font-size: 0.72rem; }
        .tp-art-saved { font-weight: 700; color: #8b5cf6; font-variant-numeric: tabular-nums; }

        /* Live feed */
        .tp-feed-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
        .tp-feed-label {
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          font-family: ui-monospace, monospace;
        }
        .tp-feed-total { font-size: 0.72rem; font-weight: 700; color: #10b981; font-variant-numeric: tabular-nums; }
        .tp-feed-list { display: flex; flex-direction: column; gap: 0.35rem; }
        .tp-feed-event {
          display: flex;
          align-items: baseline;
          gap: 0.625rem;
          font-size: 0.76rem;
          padding: 0.45rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          animation: ct-fade 0.3s ease;
          flex-wrap: wrap;
        }
        .tp-feed-verdict {
          font-family: ui-monospace, monospace;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.18rem 0.4rem;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .tp-feed-action { flex: 1; color: rgba(255,255,255,0.58); min-width: 120px; }
        .tp-feed-saved { font-weight: 700; color: #10b981; font-size: 0.72rem; white-space: nowrap; }

        /* Comparison */
        .tp-comp-label {
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          font-family: ui-monospace, monospace;
          margin-bottom: 0.75rem;
        }
        .tp-comp-table-wrap { overflow-x: auto; }
        .tp-comp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
          min-width: 500px;
        }
        .tp-comp-table th {
          text-align: left;
          padding: 0.5rem 0.75rem;
          color: rgba(255,255,255,0.3);
          font-weight: 600;
          font-size: 0.7rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .tp-comp-table td {
          padding: 0.6rem 0.75rem;
          color: rgba(255,255,255,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: top;
        }
        .tp-comp-row-label { color: rgba(255,255,255,0.65); font-weight: 500; }
        .l9-col { background: rgba(139,92,246,0.04); }
        .l9-val { color: rgba(255,255,255,0.9) !important; font-weight: 700; }
        .tp-comp-table th.l9-col { color: #8b5cf6; }

        /* Voice pitch */
        .tp-voice-label { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
        .tp-voice-track {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 1rem 1.125rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex-wrap: wrap;
        }
        .tp-voice-track-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 80px; }
        .tp-vt-label { font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.82); }
        .tp-vt-desc { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
        .tp-voice-play {
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
        .tp-voice-play.active { background: rgba(236,72,153,0.25); }
        .tp-voice-play:hover { background: rgba(236,72,153,0.2); }
        .tp-voice-waveform { display: flex; align-items: center; gap: 2px; height: 28px; }
        .tp-voice-bar {
          width: 3px;
          border-radius: 2px;
          background: rgba(236,72,153,0.38);
          animation: mvoice-wave 0.8s ease-in-out infinite alternate;
        }
        @keyframes mvoice-wave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1.2); }
        }
        .tp-voice-note { font-size: 0.65rem; color: rgba(255,255,255,0.18); font-style: italic; }

        /* Wrapper story */
        .tp-wrap-label { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
        .tp-wrap-stack { display: flex; flex-direction: column; gap: 0.625rem; }
        .tp-wrap-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 0.875rem 1rem;
          border-left: 3px solid var(--wc, #8b5cf6);
        }
        .tp-wrap-card.planned { opacity: 0.5; }
        .tp-wc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; }
        .tp-wc-name { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.85); }
        .tp-wc-badge { font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--wc, #8b5cf6); font-family: ui-monospace, monospace; }
        .tp-wc-desc { font-size: 0.75rem; color: rgba(255,255,255,0.38); line-height: 1.5; }

        /* ── Mobile: stack vertically ── */
        @media (max-width: 768px) {
          .ct-body { flex-direction: column; overflow: visible; }
          .ct-chat {
            width: 100%;
            max-width: none;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            height: auto;
            max-height: 55vh;
          }
          .ct-panel {
            height: auto;
            min-height: 50vh;
          }
          .ct-panel-content { padding: 1rem; }
          .ct-tabs { padding: 0 0.875rem; }
        }
      `}</style>

      {/* Top bar */}
      <div className="ct-topbar">
        <div className="ct-avatar">L9</div>
        <div className="ct-agent-info">
          <div className="ct-agent-name">{maxSelf ? "MAX" : "Level9OS"}</div>
          <div className="ct-agent-sub">AI Operating System</div>
        </div>
        <span className="ct-variant-badge">Chat + Panel</span>
        <button
          className="ct-restart-btn"
          onClick={() => {
            clearState();
            window.location.reload();
          }}
        >
          Restart
        </button>
      </div>

      <div className="ct-body">
        {/* Left: chat */}
        <div className="ct-chat">
          <div className="ct-feed" ref={feedRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`ct-msg ${msg.role}`}>
                <div className="ct-msg-avatar">{msg.role === "agent" ? (maxSelf ? "MX" : "L9") : "You"}</div>
                <div className="ct-msg-bubble">{msg.content}</div>
              </div>
            ))}
            {typing && (
              <div className="ct-typing">
                <div className="ct-typing-avatar" />
                <div className="ct-typing-dots">
                  <div className="ct-dot" />
                  <div className="ct-dot" />
                  <div className="ct-dot" />
                </div>
              </div>
            )}
          </div>

          {!typing && suggestedReplies.length > 0 && (
            <div className="ct-replies">
              <div className="ct-replies-label">Reply</div>
              {suggestedReplies.map((r) => (
                <button key={r.id} className="ct-reply" onClick={() => handleReply(r.id, r.label)}>
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {isReturning && (
            <div style={{ padding: "0 1.25rem 0.75rem" }}>
              <button
                className="ct-reply"
                style={{ width: "100%", textAlign: "center" }}
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

        {/* Right: panel */}
        <div className="ct-panel">
          {/* Tab bar */}
          {unlockedModules.length > 0 && (
            <div className="ct-tabs">
              {unlockedModules.map((m) => {
                const meta = MODULE_META[m];
                return (
                  <button
                    key={m}
                    className={`ct-tab ${activeModule === m ? "active" : ""}`}
                    onClick={() => setActiveModule(m)}
                  >
                    <span className="ct-tab-icon">{meta.icon}</span>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Panel content */}
          {!panelVisible || !activeModule ? (
            <div className="ct-panel-empty">
              <div className="ct-panel-empty-icon">◻</div>
              <div className="ct-panel-empty-text">
                Choose a topic in the chat. Modules appear here as you unlock them.
              </div>
            </div>
          ) : (
            <div className="ct-panel-content" key={activeModule}>
              <ModulePanel moduleId={activeModule} userAnswers={userAnswers} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

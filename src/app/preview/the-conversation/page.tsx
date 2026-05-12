"use client";
/**
 * /preview/the-conversation
 * Metaphor: Single chat interface as the entire site. Agent-led dialogue.
 * No traditional page architecture. The agent IS the navigation.
 */

import { useState, useEffect, useRef } from "react";

interface Choice {
  id: string;
  label: string;
  nextThread: string;
}

// Content beat definitions keyed by thread ID
const THREADS: Record<string, { messages: Array<{ role: "agent" | "user"; content: string; chart?: React.ReactNode }>; choices: Choice[] }> = {
  intro: {
    messages: [
      {
        role: "agent",
        content: "Hi. I just saved someone $52,686 last quarter. Give me 90 seconds and I will show you how.",
      },
    ],
    choices: [
      { id: "math", label: "Show me the math", nextThread: "math" },
      { id: "who", label: "Who saved it?", nextThread: "who" },
      { id: "what", label: "What is Level9OS?", nextThread: "what" },
    ],
  },
  math: {
    messages: [
      { role: "user", content: "Show me the math" },
      {
        role: "agent",
        content:
          "Sure. Here is the breakdown from 90 days of real production data — 299 sessions, measured not estimated.\n\nThe four categories:\n\n1. Cost-router refusals — 44 events. Mechanical work was being run on expensive models. Rerouted to cheaper ones. $31 saved in compute.\n\n2. Stop hook fires — 125 events. Agent claimed 'done' without verification. Each one prevented a $86 re-discovery cost. $10,834 prevented.\n\n3. Mid-session reversals caught — 782 events. Agent reversed a prior done-claim mid-conversation. Each costs $33 to catch and fix. $26,361 prevented.\n\n4. Flub events stopped — 46 unverified claims before they shipped to production. At $250 each, that is $11,500 prevented.\n\nTotal: $52,686 prevented. Infrastructure cost: $5.07/month. ROI ratio: 3,464x.",
      },
    ],
    choices: [
      { id: "governs", label: "What governs the agents?", nextThread: "governs" },
      { id: "customer", label: "What would my numbers look like?", nextThread: "customer" },
      { id: "back_what", label: "What is Level9OS?", nextThread: "what" },
    ],
  },
  who: {
    messages: [
      { role: "user", content: "Who saved it?" },
      {
        role: "agent",
        content:
          "Eric Hathaway. Chief AI Officer. He runs a portfolio of AI products — StratOS, CommandOS, LinkUpOS — and a 30-workflow marketing automation stack.\n\nHe is also the customer. These numbers come from his own sessions: 299 Claude Code sessions over 90 days, $60,003 in LLM spend total.\n\nLevel9OS is the governance layer he built for himself. We are not selling you a case study. We are selling you the thing that makes our own operation run at 3,464x ROI.",
      },
    ],
    choices: [
      { id: "math2", label: "Show me the math", nextThread: "math" },
      { id: "what2", label: "What is Level9OS?", nextThread: "what" },
      { id: "customer2", label: "What would my numbers look like?", nextThread: "customer" },
    ],
  },
  what: {
    messages: [
      { role: "user", content: "What is Level9OS?" },
      {
        role: "agent",
        content:
          "Level9OS is an AI operating system for operators who run more than one AI agent.\n\nFour layers:\n\n1. Governance. Hooks that fire before and after every agent action. They block bad behavior, catch unverified claims, enforce cost routing.\n\n2. Agent management. A roster of named agents with defined capabilities. The orchestrator routes work to the right model at the right cost.\n\n3. Content layer. Voice rules, canonical brand tokens, legal templates. Agents pull from one source instead of hallucinating their own.\n\n4. Audit trail. Every decision logged to Supabase. You see what was blocked, what was allowed, what it cost, what it saved.\n\nYou pay $5.07/month for the infrastructure. You keep the $17,562/month it prevents from leaving.",
      },
    ],
    choices: [
      { id: "math3", label: "Show me the $52,686 math", nextThread: "math" },
      { id: "customer3", label: "What would my numbers look like?", nextThread: "customer" },
      { id: "governs2", label: "How does governance work?", nextThread: "governs" },
    ],
  },
  governs: {
    messages: [
      { role: "user", content: "What governs the agents?" },
      {
        role: "agent",
        content:
          "Four hook layers:\n\nPre-tool-use: fires before any agent touches a file, runs a command, or calls an API. The cost-router lives here. The protected-resource check lives here.\n\nStop hook: fires when an agent claims 'done.' It checks: did you run a build? Did you provide an evidence test? If not, the session is refused until it complies.\n\nUserPromptSubmit: fires on every incoming message. Detects exit-intent, injects reminders.\n\nClaim-without-evidence (FLUB): cross-session pattern matching. Flags agents that ship assertions they have not verified.\n\nThat is it. No AI in the governance layer. Deterministic hooks. They run in under 50ms and they do not hallucinate.",
      },
    ],
    choices: [
      { id: "customer4", label: "What would my numbers look like?", nextThread: "customer" },
      { id: "math4", label: "Show me the full math", nextThread: "math" },
      { id: "cta", label: "I want to talk to someone", nextThread: "cta" },
    ],
  },
  customer: {
    messages: [
      { role: "user", content: "What would my numbers look like?" },
      {
        role: "agent",
        content:
          "Rough projection based on our 90-day dataset.\n\nIf you spend $10,000/month on LLMs:\nOur prevention rate is 87.8% of spend at risk.\nThat puts your projected prevented waste at $8,781/month.\n\nLevel9OS costs $500/month at our starting tier.\n\nROI: 17.6x. Payback period: 1.7 days.\n\nConservative version — at $72/hr operator time (senior engineer, fully loaded):\nStill $3,161/month prevented. Still 6.3x ROI.\n\nThe honest number is the time. 236 hours returned to an operator in 90 days is not debatable. That is time back on work that moves your business.",
      },
    ],
    choices: [
      { id: "cta2", label: "I want to talk to someone", nextThread: "cta" },
      { id: "governs3", label: "How does governance work exactly?", nextThread: "governs" },
      { id: "math5", label: "Show me the full math again", nextThread: "math" },
    ],
  },
  cta: {
    messages: [
      { role: "user", content: "I want to talk to someone" },
      {
        role: "agent",
        content:
          "Contact Eric directly at biz@erichathaway.com.\n\nHe runs the product. He is the customer. He can answer any question about the numbers because he lived them.\n\nIf you are running more than three AI agents and spending more than $2,000/month on LLMs, we should talk. The conversation is free. The governance is not, but it pays for itself on day one.",
      },
    ],
    choices: [
      { id: "restart", label: "Start over", nextThread: "intro" },
    ],
  },
};

export default function TheConversation() {
  const [currentThread, setCurrentThread] = useState("intro");
  const [messages, setMessages] = useState<Array<{ role: "agent" | "user"; content: string; id: number }>>([]);
  const [typing, setTyping] = useState(false);
  const msgCounterRef = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    }, 50);
  };

  const addMessage = (msg: { role: "agent" | "user"; content: string }) => {
    msgCounterRef.current += 1;
    const id = msgCounterRef.current;
    setMessages((prev) => [...prev, { ...msg, id }]);
    scrollToBottom();
  };

  const playThread = (threadId: string, skipUserMsg = false) => {
    const thread = THREADS[threadId];
    if (!thread) return;

    const agentMsgs = thread.messages.filter((m) => !skipUserMsg || m.role !== "user");
    let delay = 0;

    agentMsgs.forEach((msg, i) => {
      const msgDelay = i === 0 && msg.role === "agent" ? 600 : 300;
      delay += i === 0 ? 0 : msgDelay;

      setTimeout(() => {
        if (msg.role === "agent") {
          setTyping(true);
          setTimeout(() => {
            setTyping(false);
            addMessage(msg);
          }, 900);
        } else {
          addMessage(msg);
        }
      }, delay);
    });
  };

  // Initialize with intro thread — intentionally empty deps (run once on mount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    playThread("intro", true);
  }, []);

  const handleChoice = (choice: Choice) => {
    if (choice.nextThread === "intro") {
      setMessages([]);
      setCurrentThread("intro");
      setTimeout(() => playThread("intro", true), 100);
      return;
    }
    addMessage({ role: "user", content: choice.label });
    setCurrentThread(choice.nextThread);
    setTimeout(() => {
      const thread = THREADS[choice.nextThread];
      const agentMsgs = thread.messages.filter((m) => m.role === "agent");
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        agentMsgs.forEach((msg, i) => {
          setTimeout(() => addMessage(msg), i * 300);
        });
      }, 900);
    }, 200);
  };

  const choices = THREADS[currentThread]?.choices ?? [];

  return (
    <div className="cv-root">
      <style>{`
        .cv-root {
          min-height: 100dvh;
          background: #070710;
          color: rgba(255,255,255,0.88);
          font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
        }
        .cv-thread {
          width: 100%;
          max-width: 680px;
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.25rem 0;
        }
        .cv-header {
          text-align: center;
          padding: 2rem 0 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .cv-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          letter-spacing: 0.05em;
        }
        .cv-agent-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
        }
        .cv-agent-sub {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.28);
        }
        .cv-feed {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 1rem;
        }
        .cv-feed::-webkit-scrollbar { width: 4px; }
        .cv-feed::-webkit-scrollbar-track { background: transparent; }
        .cv-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .cv-msg {
          display: flex;
          gap: 0.75rem;
          animation: cv-fade 0.4s ease;
        }
        @keyframes cv-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        .cv-msg.user {
          flex-direction: row-reverse;
        }
        .cv-msg-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.58rem;
          font-weight: 700;
          color: white;
          margin-top: 2px;
        }
        .cv-msg.user .cv-msg-avatar {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
        }
        .cv-msg-bubble {
          max-width: 82%;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          font-size: 0.85rem;
          line-height: 1.65;
          white-space: pre-wrap;
        }
        .cv-msg.agent .cv-msg-bubble {
          background: #141428;
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
          border-radius: 4px 14px 14px 14px;
        }
        .cv-msg.user .cv-msg-bubble {
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.25);
          color: rgba(255,255,255,0.8);
          text-align: right;
          border-radius: 14px 14px 4px 14px;
        }
        .cv-typing {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          animation: cv-fade 0.3s ease;
        }
        .cv-typing-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          flex-shrink: 0;
        }
        .cv-typing-dots {
          background: #141428;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px 14px 14px 14px;
          padding: 0.75rem 1rem;
          display: flex;
          gap: 0.35rem;
          align-items: center;
        }
        .cv-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(139,92,246,0.6);
          animation: cv-bounce 1.2s ease-in-out infinite;
        }
        .cv-dot:nth-child(2) { animation-delay: 0.2s; }
        .cv-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cv-bounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        /* Choice bar */
        .cv-choices-wrap {
          width: 100%;
          max-width: 680px;
          padding: 1rem 1.25rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: linear-gradient(to top, #070710 80%, transparent);
        }
        .cv-choices-label {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.22);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .cv-choice {
          padding: 0.7rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.83rem;
          color: rgba(255,255,255,0.75);
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
          text-align: left;
        }
        .cv-choice:hover {
          background: rgba(139,92,246,0.12);
          border-color: rgba(139,92,246,0.35);
          color: rgba(255,255,255,0.92);
        }
        .cv-stats-row {
          display: flex;
          gap: 1.5rem;
          padding: 0.75rem 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin: 0.5rem 0;
        }
        .cv-stat {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .cv-stat-value {
          font-size: 1.2rem;
          font-weight: 800;
          color: #8b5cf6;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .cv-stat-label {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.35);
        }
      `}</style>

      <div className="cv-thread">
        <div className="cv-header">
          <div className="cv-avatar">L9</div>
          <div className="cv-agent-name">Level9OS</div>
          <div className="cv-agent-sub">AI Operating System</div>
        </div>
        <div className="cv-feed" ref={feedRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`cv-msg ${msg.role}`}>
              <div className="cv-msg-avatar">{msg.role === "agent" ? "L9" : "You"}</div>
              <div className="cv-msg-bubble">{msg.content}</div>
            </div>
          ))}
          {typing && (
            <div className="cv-typing">
              <div className="cv-typing-avatar" />
              <div className="cv-typing-dots">
                <div className="cv-dot" />
                <div className="cv-dot" />
                <div className="cv-dot" />
              </div>
            </div>
          )}
        </div>
      </div>

      {!typing && choices.length > 0 && (
        <div className="cv-choices-wrap">
          <div className="cv-choices-label">Choose your reply</div>
          {choices.map((c) => (
            <button key={c.id} className="cv-choice" onClick={() => handleChoice(c)}>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

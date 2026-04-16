/**
 * The Operating System — 8 layers of capability.
 * This is the proof-of-breadth surface. Restrained naming.
 * Each layer is a real thing that's been built and is running.
 */

export interface StackLayer {
  id: string;
  number: string;
  title: string;
  audience: string;
  color: string;
  problem: string;
  answer: string;
  capabilities: string[];
}

export const stack: StackLayer[] = [
  {
    id: "strategy",
    number: "01",
    title: "Strategy",
    audience: "ELT · Board · Innovation",
    color: "#8b5cf6",
    problem: "Strategic decisions made in the dark by people who agree too easily.",
    answer: "AI executive deliberation with built-in dissent and full audit trail.",
    capabilities: [
      "StratOS executive room",
      "Multi-model decisioning across providers",
      "Innovation pipeline",
      "Governance audit (GOV / GOV-TEST)",
    ],
  },
  {
    id: "management",
    number: "02",
    title: "Management",
    audience: "PMO · COO · Coordination",
    color: "#10b981",
    problem: "Cross-functional projects die in handoffs. The PMO is expensive and slow.",
    answer: "AI middle management that plans, dispatches, reviews, and ships.",
    capabilities: [
      "CommandOS orchestration",
      "Forty-eight domain officers",
      "Three-gate review system",
      "COO Trust Engine",
    ],
  },
  {
    id: "execution",
    number: "03",
    title: "Execution",
    audience: "The pods · Doing the work",
    color: "#f59e0b",
    problem: "Functional teams burn budget on work that could run itself.",
    answer: "Autonomous execution pods. One human manager. Zero daily intervention.",
    capabilities: [
      "LinkupOS — signal / marketing pod",
      "ABM Engine — outbound pod",
      "Auto-CS — customer success monitoring",
      "Marketing Engine pipelines",
    ],
  },
  {
    id: "build",
    number: "04",
    title: "Build & QA",
    audience: "Engineering · Code governance",
    color: "#06b6d4",
    problem: "Code rots. Tests get skipped. Quality slips between sprints.",
    answer: "Self-healing development with mandatory zero-warning policy.",
    capabilities: [
      "Auto-fix agents",
      "Auto-test agents",
      "Code governance enforcement",
      "Zero-warning build gate",
    ],
  },
  {
    id: "measurement",
    number: "05",
    title: "Measurement",
    audience: "The nervous system",
    color: "#14b8a6",
    problem: "You measure outputs but don't know where execution actually breaks.",
    answer: "Real-time friction detection across four pillars and thirty-seven levers.",
    capabilities: [
      "LucidORG ECI scoring",
      "Friction maps",
      "Real-time observability",
      "Alignment Operating Cycle integration",
    ],
  },
  {
    id: "interface",
    number: "06",
    title: "Interface",
    audience: "The voice · Everyone",
    color: "#ec4899",
    problem: "You have data but you can't ask it questions.",
    answer: "Conversational ops — natural-language Q&A across every metric.",
    capabilities: [
      "MAX — talk to your operation",
      "Live dashboards",
      "Slack ops bridge",
      "Voice-first option",
    ],
  },
  {
    id: "governance",
    number: "07",
    title: "Governance",
    audience: "Security · Compliance · Audit",
    color: "#ef4444",
    problem: "AI without guardrails is a liability waiting to bill you.",
    answer: "Every action audited, every dollar tracked, every output gated.",
    capabilities: [
      "Secrets vault — RLS-locked, scoped",
      "Budget enforcement at task / agent / system",
      "Quality audit on every output",
      "Full audit trail across the stack",
    ],
  },
  {
    id: "methodology",
    number: "08",
    title: "Methodology",
    audience: "The install manual",
    color: "#64748b",
    problem: "Operations is the function nobody knows how to fix.",
    answer: "Three decades of pattern recognition, productized as an install protocol.",
    capabilities: [
      "COO Playbook (4 parts)",
      "30 / 90 / 180 install protocol",
      "ECI framework",
      "CxfO model · Lean Ops",
    ],
  },
];

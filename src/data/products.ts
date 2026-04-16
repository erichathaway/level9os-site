/**
 * Canonical product definitions used across all pages.
 * Single source of truth — edit here to update site-wide.
 *
 * Voice rule: lead with the PROBLEM and the ANSWER.
 * Features come second. Vanity metrics are not allowed here.
 */

export type ProductStatus = "LIVE" | "IN PRODUCTION" | "COMING SOON";

export interface Product {
  id: string;
  name: string;
  layer: string; // which layer of the operating stack
  tag: string;
  problem: string;
  answer: string;
  status: ProductStatus;
  color: string;
  gradient: string;
  desc: string;
  features: string[];
  href: string;
  domain?: string;
  external: boolean; // true = links out to product domain, false = internal anchor
}

export const products: Product[] = [
  {
    id: "stratos",
    name: "StratOS",
    layer: "Strategy · ELT / Board",
    tag: "AI DECISION ENGINE",
    problem: "Strategic decisions made in the dark by people who agree too easily.",
    answer:
      "An AI executive room that pressure-tests every decision against ten dissenting perspectives — before it costs real money.",
    status: "LIVE",
    color: "#8b5cf6",
    gradient: "from-violet-600 to-fuchsia-600",
    desc: "A 10-person simulated executive leadership team debates every strategic question across three structured rounds. Built-in groupthink detection. Kill criteria. Full governance audit trail. Replaces the eight-hour offsite with a thirty-minute audited recommendation.",
    features: [
      "10 AI executives across CEO / COO / CFO / CMO / CTO / CLO / CHRO / CPO / CRO / Design",
      "Three-round structured debate with synthesis and challenge",
      "Groupthink detection — flags unanimous votes for forced dissent",
      "Full governance audit trail (GOV + GOV-TEST)",
      "Room calibration for startup, SMB, enterprise, board, non-profit",
      "Multi-model decisioning across Claude, GPT, and Perplexity",
    ],
    href: "https://stratos.lucidorg.com",
    domain: "stratos.lucidorg.com",
    external: true,
  },
  {
    id: "commandos",
    name: "CommandOS",
    layer: "Management · PMO / Coordination",
    tag: "AGENT ORCHESTRATION",
    problem: "Cross-functional projects die in handoffs. The PMO is expensive and slow.",
    answer:
      "AI middle management that plans, dispatches, reviews, and ships every project. Forty-eight domain officers. Three governance gates. One source of truth.",
    status: "IN PRODUCTION",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
    desc: "A unified command center for orchestrating autonomous AI agents across multiple concurrent projects. Coordinator, governance, and project-management agents supervise teams of domain specialists. Multi-provider LLM routing routes each task to its best-fit model. Real-time observability and automatic session continuity.",
    features: [
      "Forty-eight domain officers across eight categories (strategy, creative, sales, people, technical, personal, research, governance)",
      "Three-gate project review system: Plan / Mid-Project / Final",
      "Multi-provider LLM routing — Claude, GPT, Perplexity",
      "COO Trust Engine learns the gap between AI recommendations and human decisions",
      "Real-time fleet observability dashboard",
      "Automatic session rotation and context continuity across days",
    ],
    href: "/products#commandos",
    external: false,
  },
  {
    id: "linkupos",
    name: "LinkupOS",
    layer: "Execution · Signal / Marketing Pod",
    tag: "AUTONOMOUS SIGNAL POD",
    problem: "Your professional brand eats your time and never feels strategic.",
    answer:
      "A fully autonomous LinkedIn signal pod. Content, prospecting, follow-up, and analytics — running on five dollars a month. Replaces a content team.",
    status: "LIVE",
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-600",
    desc: "The first proof that a single human can replace an entire marketing department with one AI pod. Daily content generation, ICP prospecting, follow-up sequencing, reply monitoring, lifecycle management, weekly analytics, and compliance — all running on autopilot, indistinguishable from human output through a learned voice profile.",
    features: [
      "Autonomous daily and weekly pipelines — no human prompts required",
      "Voice-profile learning makes generated comments indistinguishable from yours",
      "Pinecone-backed intelligence library so every signal is grounded in your knowledge",
      "Five-tier subscription billing with self-serve onboarding",
      "Daily briefing, auto-post, follow-up engine, reply monitor, lifecycle drip",
      "Replaces content, prospecting, qualification, and follow-up teams",
    ],
    href: "https://linkupos.com",
    domain: "linkupos.com",
    external: true,
  },
  {
    id: "playbook",
    name: "COO Playbook",
    layer: "Methodology · The Manual",
    tag: "INSTALL PROTOCOL",
    problem: "Operations is the function nobody knows how to fix.",
    answer:
      "Three decades of operational pattern recognition, productized into a 30/90/180 install protocol. The methodology every other product runs on.",
    status: "LIVE",
    color: "#64748b",
    gradient: "from-slate-500 to-zinc-600",
    desc: "The complete operating manual for installing AI-native operations. Five paradigm shifts. Eighteen chapters. Twelve frameworks. Stage-specific implementation guides built from running operations inside Microsoft, Credit Suisse, T-Mobile, S&P Global, and global enterprises across six continents.",
    features: [
      "Eight Operating Domains framework — the modern COO challenge map",
      "Implementation Readiness assessment (ECI diagnostic)",
      "Lean Ops — the two-person operations function (COO + CxfO)",
      "30/90/180 phased install methodology — non-disruptive",
      "Alignment Cycle — seven-phase continuous improvement loop",
      "The methodology is the install protocol for every other product in the stack",
    ],
    href: "https://thenewcoo.com",
    domain: "thenewcoo.com",
    external: true,
  },
  {
    id: "lucidorg",
    name: "LucidORG",
    layer: "Measurement · The Nervous System",
    tag: "FRICTION DETECTION",
    problem: "You measure outputs but don't know where execution actually breaks.",
    answer:
      "Real-time friction detection across four pillars and thirty-seven levers. Tells you exactly where execution is failing — and which lever to pull.",
    status: "LIVE",
    color: "#06b6d4",
    gradient: "from-cyan-600 to-blue-600",
    desc: "The measurement and diagnostic platform underneath everything. ECI (Execution Capability Index) scoring across four pillars, eleven metrics, and thirty-seven focus areas. Real-time friction detection. The nervous system that tells leadership where execution actually breaks down — instead of measuring outputs after the damage is done.",
    features: [
      "ECI (Execution Capability Index) — zero-to-one-thousand score",
      "Four pillars, eleven metrics, thirty-seven intervention levers",
      "AI-versus-human performance comparison analytics",
      "Real-time friction detection with targeted intervention flags",
      "Shared Divergence Map — surfaces where leadership actually disagrees",
      "Integrates with the Alignment Operating Cycle",
    ],
    href: "https://lucidorg.com",
    domain: "lucidorg.com",
    external: true,
  },
  {
    id: "max",
    name: "MAX",
    layer: "Interface · The Voice",
    tag: "CONVERSATIONAL OPS",
    problem: "You have data but you can't ask it questions.",
    answer:
      "Talk to your operation in plain English. Every metric, every pod, every decision — one conversation away.",
    status: "IN PRODUCTION",
    color: "#ec4899",
    gradient: "from-fuchsia-500 to-pink-600",
    desc: "The conversational layer across the entire stack. Ask any question about your operation in plain English and get an answer backed by real metrics, pod state, governance decisions, and execution data. Powered by the same intelligence layer as every other product. The single voice for the operating system.",
    features: [
      "Natural-language Q&A across every pod and every metric",
      "Unified intelligence layer across StratOS + CommandOS + LucidORG",
      "Conversational memory across sessions",
      "Proactive alerts when key metrics drift",
      "Optional voice-first interface",
      "Enterprise deployment — your data stays inside your perimeter",
    ],
    href: "/products#max",
    external: false,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

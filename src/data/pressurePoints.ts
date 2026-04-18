/**
 * The four pressure points of the alignment cycle.
 * Primary taxonomy for Level9OS. Maps down to the 8 operating layers (stack.ts)
 * and up to the 8 COO Playbook domains (thenewcoo.com).
 *
 * Cycle: misalignment -> drag -> cost -> reactive leadership -> repeat
 * Each pressure point is one intervention site in the cycle.
 * Governance chassis runs under all four. COO Playbook installs all of it.
 */

export type PressurePointStatus = "LIVE" | "IN PRODUCTION" | "COMING SOON";

export interface PressurePoint {
  id: string;
  number: string;                 // "01" ... "04"
  verb: string;                   // "Decide", "Coordinate", "Execute", "Measure"
  breaks: string;                 // what it breaks in the cycle
  product: string;                // primary product name
  productId: string;              // id from products.ts
  productStatus: PressurePointStatus;
  productHref: string;            // anchor or external
  category: string;               // buyer-category translation (Gartner/Forrester/HBR)
  color: string;                  // accent
  gradient: string;               // tailwind gradient pair
  problem: string;
  answer: string;
  capabilities: string[];
  layers: string[];               // which stack.ts layer ids roll up into this pressure point
  playbookDomains: string[];      // which COO Playbook 8 domains point here
}

export const pressurePoints: PressurePoint[] = [
  {
    id: "decide",
    number: "01",
    verb: "Decide",
    breaks: "Misalignment",
    product: "StratOS",
    productId: "stratos",
    productStatus: "LIVE",
    productHref: "https://stratos.lucidorg.com",
    category: "Decision Intelligence · AI Governance",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-fuchsia-500",
    problem: "Strategic decisions made in the dark by people who agree too easily.",
    answer: "A ten-person simulated executive room that pressure-tests every decision against dissenting perspectives, with kill criteria declared up front and every word audited.",
    capabilities: [
      "StratOS 10-exec decision chamber",
      "Three-round structured debate with groupthink detection",
      "Kill criteria + audit trail (GOV / GOV-TEST)",
      "Multi-model routing (Claude, GPT-4o, Perplexity)",
    ],
    layers: ["strategy"],
    playbookDomains: ["Architect Alignment", "Financial Leverage"],
  },
  {
    id: "coordinate",
    number: "02",
    verb: "Coordinate",
    breaks: "Drag",
    product: "CommandOS",
    productId: "commandos",
    productStatus: "IN PRODUCTION",
    productHref: "/products#commandos",
    category: "Enterprise Orchestration · Agent Control Plane",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-500",
    problem: "Cross-functional projects die in handoffs. The PMO is expensive and slow.",
    answer: "Agents managing agents. Three leadership-tier agents supervise a fleet of forty-eight domain officers. Session rotation, auto-recovery, governance gates at every handoff.",
    capabilities: [
      "CommandOS three-tier orchestrator (coordinator · health · PM)",
      "Forty-eight domain officers across 8 ops categories",
      "Automatic session rotation + context continuity",
      "Real-time fleet observability dashboard",
    ],
    layers: ["management"],
    playbookDomains: ["Systematize Execution", "Adaptive Governance"],
  },
  {
    id: "execute",
    number: "03",
    verb: "Execute",
    breaks: "Cost",
    product: "OutboundOS",
    productId: "outboundos",
    productStatus: "LIVE",
    productHref: "/products#outboundos",
    category: "Agentic Operations · Autonomous Outbound + Care",
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-500",
    problem: "Functional teams burn budget on work that could run itself.",
    answer: "Autonomous execution pods under one roof. LinkedIn signal, multi-channel outbound, account-based prospecting, customer care. All governed, voice-calibrated, running on a small monthly footprint.",
    capabilities: [
      "LinkupOS · LinkedIn signal pod (19 workflows)",
      "ABM Engine · multi-channel outbound + prospecting",
      "AutoCS · customer service + retention automation",
      "Voice-profile RAG across every pod (Pinecone + pgvector)",
    ],
    layers: ["execution", "build"],
    playbookDomains: ["Human + AI Architecture", "Continuous Operating Loop"],
  },
  {
    id: "measure",
    number: "04",
    verb: "Measure",
    breaks: "Reactive leadership",
    product: "LucidORG",
    productId: "lucidorg",
    productStatus: "LIVE",
    productHref: "https://lucidorg.com",
    category: "Digital Twin of the Organization · ECI",
    color: "#06b6d4",
    gradient: "from-cyan-500 to-blue-500",
    problem: "You measure outputs but don't know where execution actually breaks.",
    answer: "Execution Capability Index across four pillars, eleven metrics, and thirty-seven intervention levers. Real-time friction detection before damage shows up in revenue.",
    capabilities: [
      "LucidORG ECI scoring (zero-to-one-thousand)",
      "Four pillars · 37 intervention levers",
      "Shared Divergence Map (c-suite vs mid-mgmt)",
      "MAX conversational layer (IN PRODUCTION)",
    ],
    layers: ["measurement", "interface"],
    playbookDomains: ["Execution Assessment", "Systemic Execution Culture"],
  },
];

/* The governance chassis runs under all four. Separate concept, not a fifth pressure point. */
export const chassis = {
  id: "vault",
  name: "The Vault",
  tag: "GOVERNANCE CHASSIS",
  color: "#ef4444",
  description:
    "Audit trail, budget enforcement, quality gates, secrets vault. AEGIS-aligned. OpenTelemetry-instrumented. Policy-as-code. Not a feature of one product. The foundation every product sits on.",
  capabilities: [
    "GOV + GOV-TEST append-only audit trail",
    "Per-task · per-agent · per-system budget enforcement",
    "Quality gates (zero-warning policy)",
    "RLS-locked secrets vault · scoped · rotated",
  ],
  layers: ["governance"],
  playbookDomains: ["Adaptive Governance"],
};

/* The COO Playbook sits outside the cycle as the install manual. */
export const installManual = {
  id: "playbook",
  name: "COO Playbook",
  tag: "INSTALL PROTOCOL",
  color: "#64748b",
  domain: "thenewcoo.com",
  href: "https://thenewcoo.com",
  description:
    "The 30 / 90 / 180 install protocol. Five paradigm shifts. Eighteen chapters. Twelve frameworks. Stage-specific implementation guides built from three decades of operational pattern recognition.",
  capabilities: [
    "Eight Operating Domains (the diagnostic frame)",
    "ECI Framework (diagnostic instrument)",
    "30/90/180 phased install protocol",
    "Alignment Cycle (seven-phase improvement loop)",
  ],
  layers: ["methodology"],
};

/* Mapping helper: get which pressure point a stack layer rolls up into */
export function pressurePointForLayer(layerId: string): PressurePoint | undefined {
  if (layerId === "governance" || layerId === "methodology") return undefined;
  return pressurePoints.find((p) => p.layers.includes(layerId));
}

/* Mapping helper: get products grouped by pressure point */
export function groupProductsByPressurePoint<T extends { id: string }>(
  products: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = {
    decide: [],
    coordinate: [],
    execute: [],
    measure: [],
    chassis: [],
    manual: [],
  };

  for (const p of products) {
    if (p.id === "stratos") groups.decide.push(p);
    else if (p.id === "commandos") groups.coordinate.push(p);
    else if (p.id === "outboundos") groups.execute.push(p);
    else if (p.id === "lucidorg" || p.id === "max") groups.measure.push(p);
    else if (p.id === "playbook") groups.manual.push(p);
  }
  return groups;
}

/**
 * Headline metrics displayed across the site.
 * Voice rule: NO vanity counters. Operational DNA only.
 * If we don't have proof, we don't claim a number.
 */

export const dnaStats = [
  { target: 30, suffix: "+", label: "Years Operations" },
  { target: 6, suffix: "", label: "Continents" },
  { target: 60, suffix: "+", label: "Countries" },
  { target: 8, suffix: "", label: "Capability Layers" },
];

export const problemStats = [
  {
    stat: "67%",
    label: "Of strategies fail at execution",
    src: "Harvard Business Review",
  },
  {
    stat: "$7.8T",
    label: "Global cost of disengaged employees",
    src: "Gallup 2024",
  },
  {
    stat: "87%",
    label: "Of AI implementations fail to deliver ROI",
    src: "Gartner 2024",
  },
];

export const clientLogos = [
  { name: "Microsoft", logo: "/logos/microsoft.svg" },
  { name: "T-Mobile", logo: "/logos/t-mobile.svg" },
  { name: "Credit Suisse", logo: "/logos/credit-suisse.svg" },
  { name: "S&P Global", logo: "/logos/sp-global.svg" },
  { name: "Zoot", logo: "/logos/zoot.svg" },
];

export const transformations = [
  {
    before: "Spreadsheets & gut feel",
    after: "AI-driven decision architecture",
    color: "#8b5cf6",
    barVal: 92,
  },
  {
    before: "Annual surveys",
    after: "Real-time organizational intelligence",
    color: "#06b6d4",
    barVal: 87,
  },
  {
    before: "Manual reporting",
    after: "Automated board-level insights",
    color: "#ec4899",
    barVal: 95,
  },
  {
    before: "Hope-based strategy",
    after: "Pressure-tested decisions",
    color: "#f59e0b",
    barVal: 88,
  },
];

/**
 * The Two Halves — the central positioning frame.
 * Used in the Hero and Two Halves section.
 */
export const twoHalves = {
  other: {
    label: "What Most Are Building",
    headline: "AI to replace people for revenue",
    items: [
      "Replace sales reps to chase more pipeline",
      "Replace marketers to chase content velocity",
      "Data consumption + analysis dashboards",
      "Insight tools that still need a human to act",
      "More noise. Same operating bottlenecks.",
    ],
    outcome: "Aimed at the revenue half. Outcome controlled by the market.",
  },
  ours: {
    label: "What We Build",
    headline: "AI to govern operational execution",
    items: [
      "Cut decision cycles from quarters to days",
      "Cut build cycles from sprints to hours",
      "Reduce meeting time + close cross-functional cracks",
      "Governed execution: audit, budget, quality gates",
      "Augment the workforce. Empower, don't manage.",
    ],
    outcome: "Aimed at the operational half. Outcome controlled by you.",
  },
};

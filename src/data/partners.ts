/**
 * Partner network — non-profits, accelerators, education programs.
 * Level9 doesn't sell to individuals. We partner with the people who do.
 */

export type PartnerType = "Non-profit" | "Accelerator" | "Education" | "Regional";

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  tagline: string;
  description: string;
  href: string;
  external: boolean;
  featured?: boolean;
  color: string;
}

export const partners: Partner[] = [
  {
    id: "nextgenintern",
    name: "NextGenIntern",
    type: "Non-profit",
    tagline: "The 501(c)(3) home for AI careers and individual learning.",
    description:
      "Our non-profit education arm. NextGenIntern is the front door for individuals who want a career in AI operations — high schoolers exploring, college students upskilling, and career changers looking for an entry point that actually leads somewhere. All learning content for individuals lives here.",
    href: "https://nextgenintern.com/individual-learning",
    external: true,
    featured: true,
    color: "#10b981",
  },
  {
    id: "founder-institute",
    name: "Founder Institute",
    type: "Accelerator",
    tagline: "The world's largest pre-seed startup accelerator.",
    description:
      "Partnered to bring operational AI to early-stage founders. The pod model and StratOS room calibration are part of the Founder Institute curriculum for operations-heavy startups.",
    href: "https://fi.co",
    external: true,
    color: "#8b5cf6",
  },
  {
    id: "scaling-montana",
    name: "Scaling Montana",
    type: "Regional",
    tagline: "Mid-market growth program for Montana operators.",
    description:
      "Regional partnership bringing AI-native operations to Montana-based companies in the scale-up phase. Operational diagnostics, pod deployment, and the COO Playbook methodology — adapted for the Mountain West operating context.",
    href: "#",
    external: false,
    color: "#06b6d4",
  },
  {
    id: "kilyana",
    name: "Kilyana Business School",
    type: "Education",
    tagline: "Executive education for AI-native operations.",
    description:
      "Curriculum partnership for executive education. The COO Playbook methodology, ECI scoring, and Lean Ops model are taught as part of the Kilyana executive curriculum for operating leaders.",
    href: "#",
    external: false,
    color: "#f59e0b",
  },
];

export const learningCapabilities = [
  {
    title: "AI Career Track",
    audience: "Individuals · Students · Career changers",
    desc: "Foundational and applied AI operations training. Hosted by NextGenIntern.",
    href: "https://nextgenintern.com/individual-learning",
    external: true,
    color: "#10b981",
  },
  {
    title: "Founder Curriculum",
    audience: "Early-stage founders",
    desc: "Operations-as-code for pre-seed and seed companies. Co-taught with Founder Institute.",
    href: "https://fi.co",
    external: true,
    color: "#8b5cf6",
  },
  {
    title: "Executive Education",
    audience: "C-suite · Operating leaders",
    desc: "The COO Playbook methodology and ECI framework, taught as a 6-week executive program.",
    href: "#",
    external: false,
    color: "#f59e0b",
  },
  {
    title: "University Speaking",
    audience: "Higher ed · Graduate programs",
    desc: "Guest lectures and curriculum partnerships at MSU and other regional universities.",
    href: "#",
    external: false,
    color: "#06b6d4",
  },
];

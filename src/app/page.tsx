"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FloatingNav from "@/components/FloatingNav";
import {
  FadeIn,
  Counter,
  CursorGradient,
  MagneticButton,
  LiveTicker,
  MagneticCard,
  RevealMask,
} from "@level9/brand/components/motion";
import { dnaStats, problemStats, clientLogos, twoHalves } from "@/data/stats";
import { pressurePoints, chassis } from "@level9/brand/content/pressurePoints";
import { UMBRELLA_TAGLINE_PARTS, UMBRELLA_TAGLINE } from "@level9/brand/content";
import { products as CANONICAL_PRODUCTS } from "@level9/brand/content/products";
import { ConsoleGraphic, ForgeCube, type ForgeProduct, type ConsoleHighlight } from "@level9/brand/components/architecture";
import {
  StratosTile,
  CommandosTile,
  OutboundosTile,
  LucidorgTile,
  PlaybookTile,
  MaxTile,
} from "@level9/brand/components/tiles";
import SiteFooter from "@/components/SiteFooter";
import HomeHeroSplash from "@/components/motion/HomeHeroSplash";
import StackFlow from "@/components/motion/StackFlow";
import DecisionTrace from "@/components/motion/DecisionTrace";
import RenderWhenVisible from "@/components/RenderWhenVisible";

/* Cube-viz product roster for the hero ForgeCube. id, name, and color come
 * from @level9/brand/content/products (the canonical product roster). The
 * cube-specific extras (single-letter icon, one-line role, specs/stack
 * arrays for the hover popup, fixed popup side) live below and merge in by
 * id. The rgb tuple used for canvas fills is derived from the canonical
 * hex color so it can never drift. Order = cube face order. */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

type CubeExtras = Pick<ForgeProduct, "short" | "icon" | "side" | "role" | "specs" | "stack">;

const CUBE_EXTRAS: Record<string, CubeExtras> = {
  stratos: {
    short: "Decision OS", icon: "S", side: "left",
    role: "10-person simulated exec room. 3 rounds. Kill criteria built in.",
    specs: ["10 workflows · 3 rounds / run", "$5.89 per run · Sonnet 4.6", "Governance-audited recommendations"],
    stack: ["n8n", "Supabase", "Claude Sonnet 4.6", "Next.js", "Vercel"],
  },
  commandos: {
    short: "Fleet Orchestration", icon: "C", side: "right",
    role: "48 domain officers. 3 governance gates. Agents managing agents.",
    specs: ["48 officers · 8 categories", "G1 plan · G2 mid · G3 final", "22 n8n workflows · multi-LLM routing"],
    stack: ["Claude Haiku + Sonnet", "GPT-4o", "Perplexity", "n8n NAS", "tmux"],
  },
  outboundos: {
    short: "Outbound Umbrella", icon: "O", side: "right",
    role: "LinkupOS + ABM Engine + AutoCS. One voice, one governance trail.",
    specs: ["3 pods under one voice profile", "Multi-channel · voice-calibrated", "Replaces marketing + outbound + CS"],
    stack: ["Postgres triggers", "Apollo", "LinkedIn API", "Supabase", "Vercel"],
  },
  lucidorg: {
    short: "Digital Twin", icon: "L", side: "left",
    role: "The nervous system. Measures AI vs human at every interaction point.",
    specs: ["4 pillars · 11 metrics · 37 levers", "ECI scoring · 0-1000 scale", "Real-time friction detection"],
    stack: ["Supabase", "TypeScript", "Recharts", "Next.js", "Vercel"],
  },
  playbook: {
    short: "Methodology Product", icon: "P", side: "left",
    role: "87K+ words. 24-week install. The operating layer beneath EOS and OKRs.",
    specs: ["4-part methodology · book + product", "ECI / CxfO / Lean Ops / AHI", "9 training courses bundled"],
    stack: ["Substack", "n8n", "ElevenLabs", "Perplexity", "Notion"],
  },
  max: {
    short: "Voice Layer", icon: "M", side: "right",
    role: "Conversational layer over all four pressure points. Plain-English answers, metric-grounded.",
    specs: ["Cross-product query layer", "Voice-aware · governance-aware", "Coming soon"],
    stack: ["Claude Sonnet 4.6", "Supabase RAG", "Next.js", "Vercel"],
  },
};

const CUBE_FACE_ORDER = ["stratos", "commandos", "outboundos", "lucidorg", "playbook", "max"] as const;

const productByID = Object.fromEntries(CANONICAL_PRODUCTS.map((p) => [p.id, p]));

const FORGE_PRODUCTS: ForgeProduct[] = CUBE_FACE_ORDER.map((id) => {
  const canonical = productByID[id];
  const extras = CUBE_EXTRAS[id];
  if (!canonical) throw new Error(`FORGE_PRODUCTS: id "${id}" not found in canonical products`);
  return {
    id: canonical.id,
    name: canonical.name,
    color: canonical.color,
    rgb: hexToRgb(canonical.color),
    ...extras,
  };
});

/* Tile component map for the WHAT WE BUILT gallery. Order matches the
 * cube face order so the two surfaces tell the same story. */
const TILE_BY_PRODUCT: Record<string, () => JSX.Element> = {
  stratos: StratosTile,
  commandos: CommandosTile,
  outboundos: OutboundosTile,
  lucidorg: LucidorgTile,
  playbook: PlaybookTile,
  max: MaxTile,
};

/* Per-stage highlight config for the operating console. Each entry maps a
   DecisionTrace stage (index 0-7, matching STAGES order) to the canvas
   elements that should glow up while that stage is active. Stages 1 and 8
   (Input + Loop) bias to decide and measure so the canvas does not open up
   between cycles. packetPairs bias the cross-core bezier traffic toward
   the active product. */
const STAGE_HIGHLIGHT: ConsoleHighlight[] = [
  { bucket: "decide",  product: "stratos",   r1Sectors: ["biz_strategy", "governance_risk"], r4Numbers: [1, 4],       packetPairs: [["stratos", "playbook"]] },
  { bucket: "decide",  product: "stratos",   r1Sectors: ["biz_strategy", "research"],        r4Numbers: [1, 5, 7],    packetPairs: [["stratos", "playbook"], ["stratos", "commandos"]] },
  { bucket: "decide",  product: "stratos",   r1Sectors: ["governance_risk", "biz_strategy"], r4Numbers: [1, 5],       packetPairs: [["stratos", "commandos"]] },
  { bucket: "coord",   product: "commandos", r1Sectors: ["people_org", "governance_risk"],   r4Numbers: [2, 3, 4, 5], packetPairs: [["commandos", "linkup"], ["commandos", "autocs"]] },
  { bucket: "exec",    product: "linkup",    r1Sectors: ["sales_cs", "creative"],            r4Numbers: [3, 6],       packetPairs: [["linkup", "abm"]] },
  { bucket: "exec",    product: "abm",       r1Sectors: ["sales_cs", "creative"],            r4Numbers: [3, 6],       packetPairs: [["abm", "autocs"], ["abm", "linkup"]] },
  { bucket: "measure", product: "lucidorg",  r1Sectors: ["governance_risk", "technical"],    r4Numbers: [4, 5, 7, 8], packetPairs: [["lucidorg", "stratos"], ["lucidorg", "commandos"]] },
  { bucket: "measure", product: "lucidorg",  r1Sectors: ["research", "biz_strategy", "governance_risk"], r4Numbers: [1, 4, 8], packetPairs: [["lucidorg", "stratos"]] },
];

/* Desktop-only architecture block. Owns its own traceIdx + tracePaused so
   the 3.5s auto-cycle re-renders ONLY this subtree, not the entire Home
   component (which has ~1100 lines and many heavy children). Mobile
   stacked cards stay rendered by Home, between this block and its sibling
   mobile fallback. */
/* Map each canvas bucket to a representative stage index in
   STAGE_HIGHLIGHT so canvas hover jumps the rich highlight to match the
   visitor's cursor. Pick the stage where that bucket's primary product
   carries the most distinctive R1+R4 pattern. */
const BUCKET_TO_STAGE: Record<string, number> = {
  decide: 1,   // ELT debate: stratos primary, biz_strategy + research, R4 1/5/7
  coord: 3,    // Org + distribution: commandos, people_org + governance_risk, R4 2/3/4/5
  exec: 4,     // Outbound: linkup, sales_cs + creative, R4 3/6
  measure: 6,  // Measure: lucidorg, governance_risk + technical, R4 4/5/7/8
};

function DesktopArchitecture() {
  const [traceIdx, setTraceIdx] = useState(0);
  const [tracePaused, setTracePaused] = useState(false);
  const [canvasUserActive, setCanvasUserActive] = useState(false);
  /* Auto-cycle pauses while the visitor is hovering/pinning a bucket
     directly on the canvas, so canvas exploration and trace cycle do not
     fight each other. */
  const cyclePaused = tracePaused || canvasUserActive;
  /* When the visitor hovers a bucket on the canvas, jump the highlight
     prop to a stage that matches that bucket. The auto-cycle is paused
     for the duration, so canvas hover and the rich stage emphasis stay
     in lockstep. */
  const handleBucketHover = (bucket: string | null) => {
    if (bucket && bucket in BUCKET_TO_STAGE) {
      setTraceIdx(BUCKET_TO_STAGE[bucket]);
    }
  };
  return (
    <>
      <FadeIn delay={0.2}>
        <div className="hidden sm:block">
          <ConsoleGraphic
            highlight={STAGE_HIGHLIGHT[traceIdx]}
            onUserActiveChange={setCanvasUserActive}
            onBucketHover={handleBucketHover}
          />
        </div>
      </FadeIn>
      {/* Pulled up via -mt to close the dead space inside the canvas frame
          (the elliptical floor projection leaves transparent pixels at the
          bottom of the canvas backing store). */}
      <div className="hidden sm:block -mt-24">
        <DecisionTrace
          activeIdx={traceIdx}
          setActiveIdx={setTraceIdx}
          paused={cyclePaused}
          setPaused={setTracePaused}
          inline
        />
      </div>
    </>
  );
}

export default function Home() {
  /* Cube anchor coords for the splash. Computed from the cube container's
     bounding box relative to the hero section so the flash + ripples
     emanate from the actual cube center, not the section's geometric
     middle (the section also holds eyebrow + tagline + CTAs). */
  const cubeRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [cubeAnchor, setCubeAnchor] = useState({ x: "50%", y: "50%" });

  useEffect(() => {
    const compute = () => {
      const cube = cubeRef.current?.getBoundingClientRect();
      const hero = heroRef.current?.getBoundingClientRect();
      if (!cube || !hero) return;
      const xPct = ((cube.left + cube.width / 2 - hero.left) / hero.width) * 100;
      const yPct = ((cube.top + cube.height / 2 - hero.top) / hero.height) * 100;
      setCubeAnchor({ x: `${xPct.toFixed(2)}%`, y: `${yPct.toFixed(2)}%` });
    };
    compute();
    /* Recompute on resize so the anchor follows responsive layout shifts. */
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient />
      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════════
          HERO. Cube as the centerpiece. The cube lands on the canvas
          (dust → wire transition at ~2.2s), at which point the splash
          flash + 4 pond ripples emanate from the cube center. The
          umbrella tagline is the closing line. The chip eyebrow names
          what we do above the fold; the gold-rush thesis lives on.
          ═══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="min-h-dvh relative overflow-hidden flex flex-col items-center justify-center"
        style={{ background: "var(--bg-root)" }}
      >
        {/* Faint grid wash */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
          }}
        />

        {/* Signature splash: mesh blobs + cube-anchored flash + pond ripples.
            Anchor coords are computed from the cube container's actual
            position (cubeAnchor), recomputed on resize. */}
        <HomeHeroSplash anchorX={cubeAnchor.x} anchorY={cubeAnchor.y} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-12 pt-28 pb-20 flex flex-col items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-mono tracking-[0.3em] uppercase text-white/60">
                AI for operations · the half it all runs on
              </span>
            </div>
          </FadeIn>

          {/* The cube. ~52vmin caps so it never overruns small screens.
              showPopup={false} on home. the popups belong on /products
              where there's room. Whole cube is a link to /products so any
              click lands you in the catalog. cubeRef anchors the splash. */}
          <div
            ref={cubeRef}
            className="relative mb-10"
            style={{ width: "min(58vmin, 56vh, 560px)", height: "min(58vmin, 56vh, 560px)" }}
          >
            <ForgeCube products={FORGE_PRODUCTS} href="/products" showPopup={false} />
          </div>

          <h1 className="text-center text-[clamp(1.7rem,3.6vw,3.2rem)] font-black leading-[1.1] tracking-tight max-w-3xl mb-5">
            <span className="text-white/85">{UMBRELLA_TAGLINE_PARTS.before}</span>{" "}
            <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
              {UMBRELLA_TAGLINE_PARTS.emphasis}
            </span>{" "}
            <span className="text-white/85">{UMBRELLA_TAGLINE_PARTS.after}</span>
          </h1>

          <FadeIn delay={0.4}>
            <p className="text-center text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mb-10 font-light">
              Six AI products on the operations side. One operating chassis. The function that
              connects everything and decides whether strategy actually survives contact with reality.
            </p>
          </FadeIn>

          <FadeIn delay={0.55}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow"
              >
                <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                See What We&apos;ve Built
              </MagneticButton>
              <MagneticButton
                href="/how-we-work"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                How We Work <span>→</span>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10 pointer-events-none">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/20">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHAT WE BUILT. six product tile loops, live-rendered from
          @level9/brand/components/tiles. Same animations Eric uses for
          LinkedIn Experience media. Click any tile to jump into the
          product on /products. Replaces the old "Two More Pieces"
          (Playbook + MAX) section by including those two as tiles.
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <RevealMask>
                <div className="text-violet-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                  What we built
                </div>
              </RevealMask>
              <RevealMask delay={100}>
                <h2 className="text-4xl sm:text-5xl font-black text-white/90 leading-[1.05] max-w-3xl">
                  Six products, live in production.
                  <br />
                  <span className="text-white/40">One per pressure point.</span>
                </h2>
              </RevealMask>
            </div>
            <FadeIn delay={0.3}>
              <Link
                href="/products"
                className="group text-sm font-semibold text-violet-400/80 hover:text-violet-400 transition-colors inline-flex items-center gap-2"
              >
                All six in detail{" "}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </FadeIn>
          </div>

          {/* 3 cols on desktop, 2 on tablet, 1 on mobile. Each card is a
              16:9 aspect window scaled around the 1200x630 tile component. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FORGE_PRODUCTS.map((p, i) => {
              const Tile = TILE_BY_PRODUCT[p.id];
              return (
                <FadeIn key={p.id} delay={i * 0.08}>
                  <Link
                    href={`/products#${p.id}`}
                    className="group block rounded-2xl border bg-surface-40 backdrop-blur-sm overflow-hidden transition-colors hover:bg-surface-60"
                    style={{ borderColor: `${p.color}20` }}
                  >
                    <div
                      className="relative w-full overflow-hidden"
                      style={{
                        aspectRatio: "1200 / 630",
                        background: "#000",
                        containerType: "inline-size",
                      }}
                    >
                      {/* Tile is authored at fixed 1200x630. Scale it down to
                          card width via container query units (cqw = % of
                          container inline-size). transform-origin top-left so
                          the scaled tile fills the card from the upper-left.
                          Bottom 3 tiles (i >= 3) defer rendering until they
                          intersect the viewport (with a 300px pre-warm
                          buffer), so first paint isn't running 6 animated
                          SVGs simultaneously when only 1-2 are visible.
                          The first 3 render eagerly to keep above-the-fold
                          paint immediate. */}
                      {i < 3 ? (
                        <div
                          className="absolute top-0 left-0"
                          style={{
                            width: 1200,
                            height: 630,
                            transform: "scale(calc(100cqw / 1200px))",
                            transformOrigin: "top left",
                          }}
                        >
                          <Tile />
                        </div>
                      ) : (
                        <RenderWhenVisible
                          rootMargin="300px"
                          className="absolute top-0 left-0"
                        >
                          <div
                            style={{
                              width: 1200,
                              height: 630,
                              transform: "scale(calc(100cqw / 1200px))",
                              transformOrigin: "top left",
                            }}
                          >
                            <Tile />
                          </div>
                        </RenderWhenVisible>
                      )}
                    </div>
                    <div className="p-5 border-t" style={{ borderColor: `${p.color}15` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-lg font-black tracking-tight" style={{ color: p.color }}>
                          {p.name}
                        </h3>
                        <span className="text-[10px] font-mono tracking-wider uppercase" style={{ color: `${p.color}aa` }}>
                          {p.short}
                        </span>
                      </div>
                      <p className="text-white/55 text-xs leading-relaxed">{p.role}</p>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE TWO HALVES. The positioning frame
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-20 text-center">
            <RevealMask>
              <div className="text-white/40 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                Two Halves of the Gold Rush
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 leading-[1.05] max-w-3xl mx-auto">
                Everyone&apos;s building the revenue half.
                <br />
                <span className="text-white/40">We build the half it all runs on.</span>
              </h2>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* The Other Half */}
            <FadeIn direction="left">
              <div className="rounded-2xl p-10 h-full border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/30 mb-4">
                  {twoHalves.other.label}
                </div>
                <h3 className="text-3xl font-black text-white/50 mb-6 line-through decoration-white/15 decoration-[1px]">
                  {twoHalves.other.headline}
                </h3>
                <div className="space-y-3 mb-8">
                  {twoHalves.other.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-white/30 text-sm"
                    >
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/[0.06]">
                  <p className="text-white/40 text-sm italic">{twoHalves.other.outcome}</p>
                </div>
              </div>
            </FadeIn>

            {/* Our Half */}
            <FadeIn direction="right" delay={0.15}>
              <MagneticCard
                className="rounded-2xl h-full"
                glowColor="rgba(139,92,246,0.25)"
                maxTilt={4}
              >
                <div
                  className="rounded-2xl p-10 h-full border bg-gradient-to-br from-violet-500/[0.08] via-cyan-500/[0.04] to-fuchsia-500/[0.04] relative overflow-hidden"
                  style={{ borderColor: "rgba(139,92,246,0.3)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-500 to-fuchsia-500" />
                  <div className="text-[11px] font-mono tracking-[0.3em] uppercase mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {twoHalves.ours.label}
                  </div>
                  <h3 className="text-3xl font-black mb-6">
                    <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                      {twoHalves.ours.headline}
                    </span>
                  </h3>
                  <div className="space-y-3 mb-8">
                    {twoHalves.ours.items.map((item, i) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-white/80 text-sm"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:
                              i % 3 === 0
                                ? "var(--violet)"
                                : i % 3 === 1
                                ? "var(--cyan)"
                                : "var(--fuchsia)",
                          }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/[0.1]">
                    <p className="text-white/80 text-sm font-semibold">
                      {twoHalves.ours.outcome}
                    </p>
                  </div>
                </div>
              </MagneticCard>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="text-center">
              <p className="text-white/55 text-lg max-w-2xl mx-auto leading-relaxed">
                Most AI is built to replace people for revenue: more content, more leads, more
                dashboards. The market still decides if any of it works. We build for the side
                you actually control:{" "}
                <span className="text-white/85">
                  faster decision cycles, fewer meetings, fewer cross-functional cracks, governed
                  execution that augments the workforce instead of managing them.
                </span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE STACK. explainer hero. Goes ABOVE the operating architecture
          section because the visitor needs the "what flows where, governed
          how" picture before they read the deeper console graphic.
          ═══════════════════════════════════════════════════════════ */}
      <StackFlow />

      {/* ═══════════════════════════════════════════════════════════
          WHAT WE DO. the operating architecture (Console graphic)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-10 text-center">
            <RevealMask>
              <div className="text-white/40 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                What we do
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 leading-[1.05] max-w-3xl mx-auto">
                The operating architecture.
                <br />
                <span className="text-white/40">End to end, in one view.</span>
              </h2>
            </RevealMask>
          </div>

          {/* Desktop / tablet: the radial console graphic + inline decision
              trace, both wrapped in DesktopArchitecture which owns the
              auto-cycle state so it does not re-render the rest of Home. */}
          <DesktopArchitecture />

          {/* Mobile-only: 4 BIG stacked layer cards. Same architecture, no
              shrinking, generous space, on-brand glow. Each card is one ring
              of the operating console, presented as a primary mobile artifact. */}
          <div className="sm:hidden space-y-6 mb-8">
            {[
              {
                tag: "R1 · Perimeter",
                title: "Governance",
                desc: "48 domain officers across 8 categories. 3 governance gates. COO and CxfO at the wheel.",
                color: "#f59e0b",
                tagClass: "text-amber-400/90",
              },
              {
                tag: "R2 · Mid ring",
                title: "Four buckets",
                desc: "Decide. Coordinate. Execute. Measure. The four places strategy breaks on the way to execution.",
                color: "#8b5cf6",
                tagClass: "text-violet-400/90",
              },
              {
                tag: "R3 · Inner band",
                title: "Eight products",
                desc: "One product per pressure point, docked into its bucket. Each a real system in production.",
                color: "#06b6d4",
                tagClass: "text-cyan-400/90",
              },
              {
                tag: "R4 · Core",
                title: "Eight domains",
                desc: "The 8 Operating Domains every COO must master. Radiating from the core, served by the products.",
                color: "#ec4899",
                tagClass: "text-fuchsia-400/90",
              },
            ].map((card, i) => (
              <FadeIn key={card.tag} delay={0.2 + i * 0.08}>
                <div
                  className="relative rounded-2xl p-7 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}10, transparent 70%)`,
                    border: `1px solid ${card.color}30`,
                    boxShadow: `0 0 60px ${card.color}10, inset 0 1px 0 rgba(255,255,255,0.04)`,
                  }}
                >
                  {/* Accent glow orb top-right */}
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${card.color}, transparent 70%)`, filter: "blur(20px)" }}
                  />
                  <div className={`text-[12px] font-mono tracking-[0.3em] uppercase font-semibold mb-4 ${card.tagClass}`}>
                    {card.tag}
                  </div>
                  <h3 className="text-3xl font-black text-white/95 mb-4 leading-[1.05] tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-white/70 text-base leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
            {/* Tap-out CTA: full architecture lives on its own page */}
            <FadeIn delay={0.6}>
              <Link
                href="/architecture"
                className="block text-center py-5 px-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/40 mb-1">
                  See the full operating console
                </div>
                <div className="text-white/85 text-base font-semibold">
                  Open the architecture page →
                </div>
              </Link>
            </FadeIn>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE CYCLE. 4 pressure points where strategy breaks
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="mb-16">
            <RevealMask>
              <div className="text-violet-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Alignment Cycle
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-6 leading-[1.05] max-w-3xl">
                Four pressure points.
                <br />
                <span className="text-white/40">
                  Where strategy actually breaks on the way to execution.
                </span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
                Misalignment creates drag. Drag becomes cost. Cost forces reactive leadership.
                Reactive leadership locks in more misalignment. Every operation runs this loop.
                We built one product per pressure point to break it.
              </p>
            </RevealMask>
          </div>

          {/* Cycle ribbon */}
          <FadeIn delay={0.25}>
            <div className="mb-12 flex items-center justify-center flex-wrap gap-3 text-[11px] font-mono tracking-[0.25em] uppercase">
              <span className="text-red-400/70">Misalignment</span>
              <span className="text-white/20">→</span>
              <span className="text-amber-400/70">Drag</span>
              <span className="text-white/20">→</span>
              <span className="text-orange-400/70">Cost</span>
              <span className="text-white/20">→</span>
              <span className="text-fuchsia-400/70">Reactive leadership</span>
              <span className="text-white/20">↺</span>
              <span className="text-white/40">repeat</span>
            </div>
          </FadeIn>

          {/* 4 pressure point cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pressurePoints.map((pp, i) => (
              <FadeIn key={pp.id} delay={i * 0.08}>
                <MagneticCard
                  className="rounded-2xl h-full"
                  glowColor={`${pp.color}25`}
                  maxTilt={3}
                >
                  <div
                    className="rounded-2xl border bg-surface-40 backdrop-blur-sm overflow-hidden group hover:bg-surface-60 transition-colors h-full"
                    style={{ borderColor: `${pp.color}20` }}
                  >
                    {/* Top accent line */}
                    <div
                      className="h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, ${pp.color}, ${pp.color}30, transparent)`,
                      }}
                    />

                    <div className="p-7 md:p-8">
                      {/* Header row: number + breaks badge */}
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <div
                            className="text-[11px] font-mono tracking-[0.3em] mb-1.5"
                            style={{ color: `${pp.color}aa` }}
                          >
                            PRESSURE POINT {pp.number}
                          </div>
                          <h3
                            className="text-3xl sm:text-4xl font-black tracking-tight"
                            style={{ color: pp.color }}
                          >
                            {pp.verb}
                          </h3>
                        </div>
                        <div
                          className="px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider uppercase"
                          style={{
                            borderColor: `${pp.color}30`,
                            background: `${pp.color}10`,
                            color: `${pp.color}cc`,
                          }}
                        >
                          Breaks {pp.breaks}
                        </div>
                      </div>

                      {/* Problem */}
                      <div className="mb-4">
                        <div className="text-white/30 text-[11px] uppercase tracking-wider font-mono mb-1.5">
                          Problem
                        </div>
                        <p className="text-white/65 text-sm leading-relaxed">{pp.problem}</p>
                      </div>

                      {/* Answer */}
                      <div className="mb-6 pl-3 border-l-2" style={{ borderColor: pp.color }}>
                        <div
                          className="text-[11px] uppercase tracking-wider font-mono mb-1.5"
                          style={{ color: `${pp.color}aa` }}
                        >
                          Answer
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed font-medium">
                          {pp.answer}
                        </p>
                      </div>

                      {/* Capabilities */}
                      <div className="space-y-1.5 mb-6">
                        {pp.capabilities.map((cap) => (
                          <div
                            key={cap}
                            className="flex items-start gap-2 text-white/60 text-xs"
                          >
                            <div
                              className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                              style={{ background: pp.color }}
                            />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>

                      {/* Product anchor */}
                      <div
                        className="flex items-center justify-between pt-5 border-t"
                        style={{ borderColor: `${pp.color}15` }}
                      >
                        <div>
                          <div className="text-white/25 text-[10px] uppercase tracking-wider font-mono mb-0.5">
                            Built as
                          </div>
                          <div className="text-white/85 text-base font-bold">{pp.product}</div>
                          <div className="text-white/40 text-[11px] mt-0.5">{pp.category}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: pp.color }}
                          />
                          <span
                            className="text-[10px] font-mono tracking-wider"
                            style={{ color: `${pp.color}cc` }}
                          >
                            {pp.productStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>

          {/* Governance chassis. runs underneath all four */}
          <FadeIn delay={0.45}>
            <div className="mt-5">
              <MagneticCard
                className="rounded-2xl"
                glowColor={`${chassis.color}20`}
                maxTilt={2}
              >
                <div
                  className="rounded-2xl border bg-surface-40 backdrop-blur-sm overflow-hidden"
                  style={{ borderColor: `${chassis.color}25` }}
                >
                  <div
                    className="h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, ${chassis.color}, ${chassis.color}30, transparent)`,
                    }}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-7 md:p-8 items-center">
                    <div className="md:col-span-4">
                      <div
                        className="text-[11px] font-mono tracking-[0.3em] mb-2"
                        style={{ color: `${chassis.color}aa` }}
                      >
                        {chassis.tag}
                      </div>
                      <h3
                        className="text-2xl sm:text-3xl font-black tracking-tight mb-1"
                        style={{ color: chassis.color }}
                      >
                        {chassis.name}
                      </h3>
                      <div className="text-white/35 text-[11px] uppercase tracking-wider font-mono">
                        Runs under all four
                      </div>
                    </div>
                    <div className="md:col-span-5">
                      <p className="text-white/70 text-sm leading-relaxed">
                        {chassis.description}
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <div className="space-y-1.5">
                        {chassis.capabilities.map((cap) => (
                          <div
                            key={cap}
                            className="flex items-start gap-2 text-white/55 text-xs"
                          >
                            <div
                              className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                              style={{ background: chassis.color }}
                            />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </MagneticCard>
            </div>
          </FadeIn>

          <FadeIn delay={0.55}>
            <div className="mt-12 text-center">
              <Link
                href="/architecture"
                className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400/80 hover:text-violet-400 transition-colors group"
              >
                See the full architecture: 4 pressure points → 8 operating layers → 8 playbook domains{" "}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE PROBLEM. Why operations needs AI
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-20">
            <RevealMask>
              <div className="text-red-400/50 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                The Problem
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-6 leading-[1.05]">
                Operations is the last function
                <br />
                <span className="text-white/40">still running on gut feel.</span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Marketing has automation. Sales has CRM. Finance has models. The function that
                connects everything, that actually executes strategy, is still spreadsheets,
                offsites, and hope.
              </p>
            </RevealMask>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {problemStats.map((item, i) => (
              <FadeIn key={item.stat} delay={i * 0.15}>
                <MagneticCard
                  className="rounded-2xl h-full"
                  glowColor="rgba(239,68,68,0.15)"
                  maxTilt={4}
                >
                  <div className="rounded-2xl border border-red-500/[0.12] p-7 h-full bg-gradient-to-br from-red-500/[0.03] to-transparent group">
                    <div className="text-5xl font-black text-red-400/80 mb-4 tracking-tight group-hover:text-red-400 transition-colors">
                      {item.stat}
                    </div>
                    <div className="text-white/60 text-sm mb-4 leading-relaxed">{item.label}</div>
                    <div className="text-white/20 text-[11px] font-mono uppercase tracking-wider">
                      {item.src}
                    </div>
                  </div>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OPERATIONAL DNA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative" style={{ background: "var(--bg-root)" }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <RevealMask>
              <div className="text-white/30 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-4">
                Operational DNA
              </div>
            </RevealMask>
            <RevealMask delay={100}>
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6 leading-[1.1]">
                Built inside the rooms we&apos;re now
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  building the tools for.
                </span>
              </h2>
            </RevealMask>
            <RevealMask delay={200}>
              <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed">
                20+ years of executive operating leadership across global enterprises. The
                frameworks we sell are the ones we actually used. The pods we deploy are the ones
                we run on ourselves first.
              </p>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-16 max-w-3xl mx-auto">
              {dnaStats.map((s) => (
                <div key={s.label} className="text-center group cursor-default">
                  <div className="text-4xl sm:text-5xl font-black text-white/80 group-hover:text-white transition-colors tabular-nums">
                    <Counter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-white/25 text-[11px] uppercase tracking-[0.25em] font-mono mt-2">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Client logos */}
          <FadeIn delay={0.6}>
            <div className="text-center pt-12 border-t border-white/[0.04]">
              <div className="text-white/15 text-[11px] tracking-[0.5em] uppercase font-mono font-semibold mb-8">
                Built on experience from
              </div>
              <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
                {clientLogos.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2.5 group cursor-default transition-all hover:scale-110"
                  >
                    <Image
                      src={item.logo}
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5 opacity-30 group-hover:opacity-80 transition-opacity"
                    />
                    <span className="text-white/20 group-hover:text-white/60 text-base sm:text-lg font-semibold tracking-wide transition-colors">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA. Final call
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden" style={{ background: "var(--bg-root)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[900px] h-[900px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
          <FadeIn>
            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black text-white/95 leading-[1.05] tracking-tight mb-8">
              Save the money.
              <br />
              Save the time.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Control the outcome.
              </span>
            </h2>
            <p className="text-white/45 text-lg mb-12 max-w-xl mx-auto">
              Whether you need a fractional COO with an AI stack behind them, a single pod
              deployed, or the full operating system installed, start with a conversation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton
                href="/how-we-work"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/30 transition-shadow text-lg"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-pulse" />
                How We Work With You
              </MagneticButton>
              <MagneticButton
                href="/architecture"
                className="inline-flex items-center gap-3 px-8 py-5 rounded-full border border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/[0.25] text-sm font-semibold transition-colors"
                strength={0.2}
              >
                See the Architecture →
              </MagneticButton>
            </div>

            {/* Umbrella tagline closer. the line the hero opened on,
                returned at the end as the parting thought. */}
            <FadeIn delay={0.4}>
              <p className="mt-16 text-white/40 text-sm sm:text-base font-light italic max-w-xl mx-auto leading-relaxed">
                {UMBRELLA_TAGLINE}
              </p>
            </FadeIn>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <SiteFooter />
    </main>
  );
}

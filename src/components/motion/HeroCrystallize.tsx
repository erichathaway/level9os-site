"use client";

import { motion } from "framer-motion";
import Level9Mark from "./Level9Mark";

/**
 * Concept B — Crystallize (v2, with arrival moment).
 *
 * Layers (back to front):
 *  1. Base ambient — the original three static glows from the live hero,
 *     kept so B doesn't lose the familiar baseline atmosphere.
 *  2. Animated mesh — five colored blobs drifting on independent slow loops
 *     (28-46s). This is what makes the hero feel alive.
 *  3. Arrival bloom — a soft gradient halo that pulses up at crystallization
 *     and settles into a permanent subtle glow behind the chip.
 *  4. Arrival ripple — a single expanding gradient ring emitted from the
 *     chip at the moment it resolves. One-shot punch.
 *  5. Chip — precipitates out of the field at top-left (blur → sharpen).
 */

// Chip sits at top-left, offset 24px on each side, size 64 → center at (56, 56)
const CHIP_X = 56;
const CHIP_Y = 56;

const CRYSTAL_DELAY = 1.5;
const CRYSTAL_DUR = 0.9;
// Fire the flash + ripples at the IMPACT moment, not when the chip finishes
// settling. With the snappy ease-out, the icon visually "hits" around 45% of
// the way through its animation — that's when we want the splash to fire.
const ARRIVAL_T = 1.7;

const FLASH1_DUR = 0.55;
// Ripples start the instant the icon hits — same moment as the flash, so the
// main wave reads as "born from" the logo hit. They expand outward during the
// wordmark text reveal (2.6s → 3.4s) so the two events feel linked.
const RIPPLE_START_T = ARRIVAL_T;

// Pond ripples. The whole hero is the water surface. Each ripple is a
// FULL-HERO radial gradient band — a soft ring of brightness at radius r,
// transparent everywhere else. Animating r outward makes the band travel
// across the pond surface. r goes past the far corner so the wave drifts
// off the page.
const RIPPLE_COUNT = 4;
const RIPPLE_STAGGER = 0.7;
const RIPPLE_DUR = 7.0;
const RIPPLE_MAX_R = 3000;

const blobs = [
  { color: "139,92,246", alpha: 0.55, size: 900, top: "22%", left: "18%", flow: 1, dur: 28 },
  { color: "6,182,212",  alpha: 0.40, size: 720, top: "55%", left: "45%", flow: 2, dur: 34 },
  { color: "13,148,136", alpha: 0.35, size: 680, top: "78%", left: "28%", flow: 3, dur: 40 },
  { color: "236,72,153", alpha: 0.28, size: 560, top: "45%", left: "78%", flow: 4, dur: 46 },
  { color: "139,92,246", alpha: 0.30, size: 500, top: "18%", left: "60%", flow: 5, dur: 38 },
];

export default function HeroCrystallize({ replayKey = 0 }: { replayKey?: number }) {
  return (
    <>
      <style>{`
        @keyframes l9-flow-1 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-30%,-70%) }
          50%  { transform: translate(-60%,-40%) }
          75%  { transform: translate(-40%,-60%) }
          100% { transform: translate(-50%,-50%) }
        }
        @keyframes l9-flow-2 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-70%,-40%) }
          50%  { transform: translate(-30%,-60%) }
          75%  { transform: translate(-55%,-30%) }
          100% { transform: translate(-50%,-50%) }
        }
        @keyframes l9-flow-3 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-40%,-60%) }
          50%  { transform: translate(-65%,-45%) }
          75%  { transform: translate(-35%,-55%) }
          100% { transform: translate(-50%,-50%) }
        }
        @keyframes l9-flow-4 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-60%,-30%) }
          50%  { transform: translate(-40%,-70%) }
          75%  { transform: translate(-55%,-45%) }
          100% { transform: translate(-50%,-50%) }
        }
        @keyframes l9-flow-5 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-35%,-65%) }
          50%  { transform: translate(-70%,-35%) }
          75%  { transform: translate(-45%,-55%) }
          100% { transform: translate(-50%,-50%) }
        }
      `}</style>

      {/* Layer 1 — Base ambient (same as live hero, static) */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full top-1/4 right-0 -translate-y-1/2"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full bottom-0 left-1/4"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full top-1/3 left-0"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 60%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* Layer 2 — Animated mesh field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {blobs.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              top: b.top,
              left: b.left,
              background: `radial-gradient(circle, rgba(${b.color},${b.alpha}) 0%, transparent 62%)`,
              filter: "blur(90px)",
              willChange: "transform",
              animation: `l9-flow-${b.flow} ${b.dur}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 4a — First flash at arrival (the HIT, fires when chip resolves) */}
      <motion.div
        key={`flash1-${replayKey}`}
        className="absolute pointer-events-none rounded-full"
        style={{
          top: CHIP_Y,
          left: CHIP_X,
          width: 200,
          height: 200,
          marginLeft: -100,
          marginTop: -100,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(167,139,250,0.6) 28%, rgba(6,182,212,0.3) 55%, transparent 75%)",
          filter: "blur(14px)",
          willChange: "transform, opacity",
          mixBlendMode: "screen",
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 1, 0], scale: [0.3, 2.4, 3.2] }}
        transition={{
          duration: FLASH1_DUR,
          delay: ARRIVAL_T,
          times: [0, 0.18, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* Layer 4b — Pond ripples. Full-hero radial-gradient bands that
          travel outward from the chip. Each ripple is one <PondRipple>.
          Start right after the first flash ends, and taper hard on alpha
          so the main wave is subtle and the follows get progressively
          softer. */}
      {Array.from({ length: RIPPLE_COUNT }).map((_, i) => {
        // Ripple 0 is the main wave (biggest band, highest alpha).
        // Follow waves taper in band-width and peak alpha.
        const bandHalf = [95, 75, 60, 48][i];
        const peakAlpha = [0.11, 0.075, 0.05, 0.032][i];
        const tint = [
          "220,232,255", // main wave — cool white
          "200,220,245", // follow 1 — cool blue-white
          "215,225,240", // follow 2 — light blue-white
          "205,222,235", // follow 3 — cyan-white
        ][i];
        const delay = RIPPLE_START_T + i * RIPPLE_STAGGER;
        return (
          <PondRipple
            key={`pond-${i}-${replayKey}`}
            chipX={CHIP_X}
            chipY={CHIP_Y}
            index={i}
            bandHalf={bandHalf}
            peakAlpha={peakAlpha}
            tint={tint}
            delay={delay}
            duration={RIPPLE_DUR}
            maxR={RIPPLE_MAX_R}
          />
        );
      })}

      {/* Layer 5 — Chip crystallizes from the field */}
      <motion.div
        key={`chip-${replayKey}`}
        className="absolute z-30 flex items-center gap-3"
        style={{ top: 24, left: 24, willChange: "transform, opacity, filter" }}
        initial={{ opacity: 0, scale: 1.5, filter: "blur(28px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: CRYSTAL_DUR, delay: CRYSTAL_DELAY, ease: [0.16, 1, 0.3, 1] }}
      >
        <Level9Mark size={64} gradientIdSuffix="-crystal" />
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 1.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-white/95 font-black text-base tracking-wide">
            LEVEL9<span className="text-white/60 font-light tracking-wider">OS</span>
          </span>
          <span className="text-white/40 text-[10px] font-mono tracking-[0.2em] uppercase">
            AI for Operations
          </span>
        </motion.div>
      </motion.div>
    </>
  );
}

/**
 * A single pond ripple. Covers the entire hero. The background is a radial
 * gradient centered on the chip with a narrow bright band at radius R and
 * transparent everywhere else. Animating R outward makes the band travel
 * across the pond surface like a real wave crest.
 *
 * We animate R via a motion value and feed it into the gradient's calc()
 * stops so the band position updates every frame without React re-rendering
 * the whole DOM node.
 */
type PondRippleProps = {
  chipX: number;
  chipY: number;
  index: number;
  bandHalf: number;
  peakAlpha: number;
  tint: string;
  delay: number;
  duration: number;
  maxR: number;
};

function PondRipple({
  chipX,
  chipY,
  index,
  bandHalf,
  peakAlpha,
  tint,
  delay,
  duration,
  maxR,
}: PondRippleProps) {
  const varName = `--l9-rip-${index}` as `--${string}`;
  const feather = Math.round(bandHalf * 0.55);

  // Gradient: transparent → faint → peak band → faint → transparent.
  // All stops are expressed as offsets from the current R (in px).
  const background =
    `radial-gradient(circle at ${chipX}px ${chipY}px, ` +
    `transparent calc(var(${varName}) - ${bandHalf}px), ` +
    `rgba(${tint},${(peakAlpha * 0.25).toFixed(3)}) calc(var(${varName}) - ${feather}px), ` +
    `rgba(${tint},${peakAlpha.toFixed(3)}) var(${varName}), ` +
    `rgba(${tint},${(peakAlpha * 0.25).toFixed(3)}) calc(var(${varName}) + ${feather}px), ` +
    `transparent calc(var(${varName}) + ${bandHalf}px))`;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={
        {
          [varName]: "0px",
          background,
          mixBlendMode: "screen",
          willChange: "opacity",
        } as React.CSSProperties
      }
      initial={{ [varName]: "0px", opacity: 0 }}
      animate={{ [varName]: `${maxR}px`, opacity: [0, 1, 1, 0] }}
      transition={{
        [varName]: { duration, delay, ease: "linear" },
        opacity: {
          duration,
          delay,
          times: [0, 0.06, 0.7, 1],
          ease: [0.33, 0, 0.67, 1],
        },
      }}
    />
  );
}

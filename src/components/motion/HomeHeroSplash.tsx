"use client";

/**
 * Home-hero splash. Lives inside the home page hero section.
 * Renders:
 *   - Animated mesh field (5 blobs drifting on slow CSS loops)
 *   - The HIT flash at t=ARRIVAL_T, centered on the ForgeCube
 *   - 4 pond ripples expanding from the cube across the full hero, drifting off
 *
 * The cube itself is the hero centerpiece (rendered by the page). It enters
 * with a dust phase that resolves into a wireframe at t=2.2s; that moment IS
 * the "hit" and triggers the flash + ripples emanating from cube center.
 */

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Anchor coords as percent strings so the splash tracks cube-center wherever
// the responsive cube lives. The cube is the centered hero element, so 50/50.
const ANCHOR_X = "50%";
const ANCHOR_Y = "50%";

// Timing — synced to ForgeCube's dust→wire transition (~2.2s with skipDust=false).
const ARRIVAL_T = 2.2;
const FLASH1_DUR = 0.6;

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

export default function HomeHeroSplash() {
  // The 5 mesh blobs run infinite CSS keyframe animations (28-46s loops). Once
  // the user scrolls past the hero, those animations are still pumping the
  // compositor on offscreen pixels. We watch the blob container with an
  // IntersectionObserver and pause via animation-play-state when it's not
  // visible. Visually identical (paused animation isn't visible anyway), but
  // the GPU/main-thread cost drops to zero on the rest of the page.
  const meshRef = useRef<HTMLDivElement>(null);
  const [meshVisible, setMeshVisible] = useState(true);

  useEffect(() => {
    const el = meshRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setMeshVisible(entry.isIntersecting),
      { rootMargin: "100px" }, // small buffer so it resumes before the user scrolls back into view
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes l9s-flow-1 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-30%,-70%) }
          50%  { transform: translate(-60%,-40%) }
          75%  { transform: translate(-40%,-60%) }
          100% { transform: translate(-50%,-50%) }
        }
        @keyframes l9s-flow-2 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-70%,-40%) }
          50%  { transform: translate(-30%,-60%) }
          75%  { transform: translate(-55%,-30%) }
          100% { transform: translate(-50%,-50%) }
        }
        @keyframes l9s-flow-3 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-40%,-60%) }
          50%  { transform: translate(-65%,-45%) }
          75%  { transform: translate(-35%,-55%) }
          100% { transform: translate(-50%,-50%) }
        }
        @keyframes l9s-flow-4 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-60%,-30%) }
          50%  { transform: translate(-40%,-70%) }
          75%  { transform: translate(-55%,-45%) }
          100% { transform: translate(-50%,-50%) }
        }
        @keyframes l9s-flow-5 {
          0%   { transform: translate(-50%,-50%) }
          25%  { transform: translate(-35%,-65%) }
          50%  { transform: translate(-70%,-35%) }
          75%  { transform: translate(-45%,-55%) }
          100% { transform: translate(-50%,-50%) }
        }
      `}</style>

      {/* Animated mesh field (layers on top of the hero's existing base ambient) */}
      <div ref={meshRef} className="absolute inset-0 pointer-events-none overflow-hidden">
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
              animation: `l9s-flow-${b.flow} ${b.dur}s ease-in-out infinite`,
              animationPlayState: meshVisible ? "running" : "paused",
            }}
          />
        ))}
      </div>

      {/* The HIT flash — anchored at cube center via percent + translate-50 */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: ANCHOR_Y,
          left: ANCHOR_X,
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(167,139,250,0.6) 28%, rgba(6,182,212,0.3) 55%, transparent 75%)",
          filter: "blur(14px)",
          willChange: "transform, opacity",
          mixBlendMode: "screen",
          zIndex: 5,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 1, 0], scale: [0.3, 2.0, 2.8] }}
        transition={{
          duration: FLASH1_DUR,
          delay: ARRIVAL_T,
          times: [0, 0.18, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* 4 pond ripples */}
      {Array.from({ length: RIPPLE_COUNT }).map((_, i) => {
        const bandHalf = [95, 75, 60, 48][i];
        const peakAlpha = [0.11, 0.075, 0.05, 0.032][i];
        const tint = [
          "220,232,255",
          "200,220,245",
          "215,225,240",
          "205,222,235",
        ][i];
        const delay = ARRIVAL_T + i * RIPPLE_STAGGER;
        return (
          <PondRipple
            key={i}
            anchorX={ANCHOR_X}
            anchorY={ANCHOR_Y}
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
    </>
  );
}

type PondRippleProps = {
  anchorX: string;
  anchorY: string;
  index: number;
  bandHalf: number;
  peakAlpha: number;
  tint: string;
  delay: number;
  duration: number;
  maxR: number;
};

function PondRipple({
  anchorX,
  anchorY,
  index,
  bandHalf,
  peakAlpha,
  tint,
  delay,
  duration,
  maxR,
}: PondRippleProps) {
  const varName = `--l9s-rip-${index}` as `--${string}`;
  const feather = Math.round(bandHalf * 0.55);

  const background =
    `radial-gradient(circle at ${anchorX} ${anchorY}, ` +
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
          zIndex: 3,
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

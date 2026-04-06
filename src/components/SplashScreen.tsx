"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LAYERS = [
  "Signal", "Decision", "Alignment", "Leadership",
  "Communication", "Process", "Measurement", "Feedback", "Adaptation",
];

const COLORS: [number, number, number][] = [
  [139, 92, 246], // violet
  [99, 102, 241], // indigo
  [6, 182, 212],  // cyan
];

const T = {
  SCATTER: 1500,
  LABELS: 3500,
  MISCONNECT: 6000,
  PULSE: 8500,
  ORGANIZE: 11000,
  LOOP_FORM: 14000,
  LOOP_SPIN: 16000,
  TITLE: 18000,
  CTA: 21000,
};

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  label: string;
  baseAngle: number;
};

export default function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const startRef = useRef(0);
  const [phase, setPhase] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.width / dpr;
    const h = () => canvas.height / dpr;
    const cx = () => w() / 2;
    const cy = () => h() / 2;

    // Initialize 9 nodes scattered randomly
    const nodes: Node[] = LAYERS.map((label, i) => {
      const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
      return {
        x: cx() + (Math.random() - 0.5) * w() * 0.7,
        y: cy() + (Math.random() - 0.5) * h() * 0.6,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        targetX: 0,
        targetY: 0,
        label,
        baseAngle: angle,
      };
    });

    // Wrong connections (misalignment)
    const wrongConnections: [number, number][] = [
      [0, 4], [1, 7], [2, 6], [3, 8], [5, 1], [6, 3],
    ];

    startRef.current = performance.now();

    const animate = () => {
      const t = performance.now() - startRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w(), h());

      // Subtle vignette
      const vg = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), Math.max(w(), h()) * 0.7);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w(), h());

      // Color cycling
      const cycleDur = 8000;
      const transDur = 1500;
      const colorPhase = (t % (cycleDur * COLORS.length));
      const ci = Math.floor(colorPhase / cycleDur);
      const elapsed = colorPhase - ci * cycleDur;
      const cf = elapsed > cycleDur - transDur ? (elapsed - (cycleDur - transDur)) / transDur : 0;
      const c1 = COLORS[ci % COLORS.length];
      const c2 = COLORS[(ci + 1) % COLORS.length];
      const R = Math.round(c1[0] + (c2[0] - c1[0]) * cf);
      const G = Math.round(c1[1] + (c2[1] - c1[1]) * cf);
      const B = Math.round(c1[2] + (c2[2] - c1[2]) * cf);

      const radius = Math.min(w(), h()) * 0.28;

      // Update node positions
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const loopAngle = n.baseAngle + (t > T.LOOP_SPIN ? t * 0.00008 : 0);
        const loopX = cx() + Math.cos(loopAngle) * radius;
        const loopY = cy() + Math.sin(loopAngle) * radius;

        if (t < T.ORGANIZE) {
          // Drift freely with drag
          n.x += n.vx;
          n.y += n.vy;
          n.vx *= 0.995;
          n.vy *= 0.995;
          // Gentle containment
          if (n.x < 60 || n.x > w() - 60) n.vx *= -0.5;
          if (n.y < 60 || n.y > h() - 60) n.vy *= -0.5;
          // Random jitter during chaos phase
          if (t > T.MISCONNECT && t < T.ORGANIZE) {
            n.vx += (Math.random() - 0.5) * 0.15;
            n.vy += (Math.random() - 0.5) * 0.15;
          }
        } else {
          // Pull toward loop position
          const pull = Math.min(1, (t - T.ORGANIZE) / 3000) * 0.08;
          n.x += (loopX - n.x) * pull;
          n.y += (loopY - n.y) * pull;
          n.vx *= 0.9;
          n.vy *= 0.9;
        }
      }

      // Draw wrong connections (red, jagged) — visible during misconnect phase
      if (t > T.MISCONNECT && t < T.LOOP_FORM) {
        const connAlpha = t < T.ORGANIZE
          ? Math.min(1, (t - T.MISCONNECT) / 1500) * 0.3
          : Math.max(0, 1 - (t - T.ORGANIZE) / 2000) * 0.3;

        for (const [a, b] of wrongConnections) {
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          // Jagged line
          const dx = nodes[b].x - nodes[a].x;
          const dy = nodes[b].y - nodes[a].y;
          const segs = 6;
          for (let s = 1; s <= segs; s++) {
            const jx = nodes[a].x + dx * (s / segs) + (Math.random() - 0.5) * 8;
            const jy = nodes[a].y + dy * (s / segs) + (Math.random() - 0.5) * 8;
            ctx.lineTo(jx, jy);
          }
          ctx.strokeStyle = `rgba(239,68,68,${connAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw correct loop connections — after organize
      if (t > T.LOOP_FORM) {
        const loopAlpha = Math.min(1, (t - T.LOOP_FORM) / 2000) * 0.4;
        for (let i = 0; i < 9; i++) {
          const next = (i + 1) % 9;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[next].x, nodes[next].y);
          ctx.strokeStyle = `rgba(${R},${G},${B},${loopAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Flow indicator — a dot moving along the loop
        if (t > T.LOOP_SPIN) {
          const flowProgress = ((t - T.LOOP_SPIN) * 0.0003) % 1;
          const flowIdx = Math.floor(flowProgress * 9);
          const flowFrac = (flowProgress * 9) % 1;
          const fa = nodes[flowIdx];
          const fb = nodes[(flowIdx + 1) % 9];
          const fx = fa.x + (fb.x - fa.x) * flowFrac;
          const fy = fa.y + (fb.y - fa.y) * flowFrac;

          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${R},${G},${B},0.8)`;
          ctx.fill();
          const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 16);
          fg.addColorStop(0, `rgba(${R},${G},${B},0.25)`);
          fg.addColorStop(1, "transparent");
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(fx, fy, 16, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw nodes
      const nodeAlpha = t < T.SCATTER ? Math.min(1, t / T.SCATTER) : 1;
      const labelAlpha = t > T.LABELS ? Math.min(1, (t - T.LABELS) / 1500) : 0;
      const organized = t > T.LOOP_FORM;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const nodeSize = organized ? 6 : 4;
        const glowSize = organized ? 24 : 12;

        // Glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowSize);
        g.addColorStop(0, `rgba(${R},${G},${B},${nodeAlpha * 0.3})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Node dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${B},${nodeAlpha * 0.8})`;
        ctx.fill();

        // Label
        if (labelAlpha > 0) {
          ctx.font = `${organized ? "600" : "400"} ${organized ? 11 : 10}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = `rgba(255,255,255,${labelAlpha * (organized ? 0.6 : 0.3)})`;
          ctx.fillText(n.label, n.x, n.y + (organized ? 20 : -14));
        }
      }

      // Phase text overlays
      if (t > T.LABELS && t < T.ORGANIZE) setPhase(1);
      if (t > T.MISCONNECT && t < T.ORGANIZE) setPhase(2);
      if (t > T.ORGANIZE && t < T.LOOP_FORM) setPhase(3);
      if (t > T.TITLE) { setShowTitle(true); setPhase(0); }
      if (t > T.CTA) setShowCTA(true);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const phaseTexts = [
    "",
    "Organizations don\u2019t fail randomly.",
    "They fail in patterns.",
    "We mapped them.",
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#030306]">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Phase text overlays */}
      <AnimatePresence mode="wait">
        {phase > 0 && !showTitle && (
          <motion.div
            key={`phase-${phase}`}
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-end justify-center pb-[18%] sm:pb-[12%] pointer-events-none z-20"
          >
            <p className="text-white/50 text-base sm:text-lg font-light tracking-wide text-center px-8">
              {phaseTexts[phase]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
          >
            <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-black tracking-[-0.03em] leading-[0.85] text-center px-6"
              style={{
                backgroundImage: "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(6,182,212,0.8), rgba(236,72,153,0.7))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Level9OS
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-white/40 text-sm sm:text-base mt-4 text-center px-8 max-w-md"
            >
              The AI Operating System for Execution
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-[15%] sm:bottom-[18%] left-0 right-0 flex justify-center z-30"
          >
            <button
              onClick={onEnter}
              className="px-10 py-4 rounded-full border border-violet-500/30 bg-violet-500/[0.08] text-white/80 hover:text-white hover:bg-violet-500/[0.15] hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/15 transition-all text-base font-semibold tracking-wide"
            >
              Enter
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip */}
      <button
        onClick={onEnter}
        className="absolute top-6 left-6 z-30 text-white/15 hover:text-white/40 text-[10px] font-mono tracking-wider transition-colors"
      >
        SKIP
      </button>
    </div>
  );
}

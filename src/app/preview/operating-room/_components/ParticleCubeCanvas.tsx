"use client";
/**
 * ParticleCubeCanvas
 * Canvas-based 15s particle-to-cube splash sequence.
 * 50 particles burst from center, scatter through 3 text overlays,
 * resolve into a wireframe cube with tracer dots.
 * Color cycles: violet -> indigo -> cyan on 8s loop.
 *
 * This is a NEW canvas component — does NOT import from thenewcoo.
 */

import { useEffect, useRef, useCallback } from "react";

interface Props {
  onComplete: () => void;
}

// Color palette cycling: violet -> indigo -> cyan
const COLOR_CYCLE = [
  { r: 139, g: 92, b: 246 },   // violet
  { r: 99,  g: 102, b: 241 },  // indigo
  { r: 6,   g: 182, b: 212 },  // cyan
];

const TOTAL_DURATION = 15000;
const CONVERGE_START = 7000;
const CUBE_LOCK = 11000;
const FADE_OUT = 13500;

const TEXTS = [
  { text: "Every prompt you send.", sub: "Ungoverned.", t: 0, end: 2500 },
  { text: "Every agent you deploy.", sub: "Unmeasured.", t: 2800, end: 5500 },
  { text: "Every document you generate.", sub: "Untrusted.", t: 5800, end: 8500 },
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

// Cube vertices (normalized -1..1 box)
function cubeVertices(size: number): [number, number, number][] {
  const h = size / 2;
  return [
    [-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h],
    [-h,-h, h],[h,-h, h],[h,h, h],[-h,h, h],
  ];
}

const CUBE_EDGES = [
  [0,1],[1,2],[2,3],[3,0], // back face
  [4,5],[5,6],[6,7],[7,4], // front face
  [0,4],[1,5],[2,6],[3,7], // sides
];

function projectVertex(
  v: [number, number, number],
  rotX: number,
  rotY: number,
  cx: number,
  cy: number
): [number, number] {
  const [x, y, z] = v;
  // Rotate Y
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;
  // Rotate X
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const y1 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;
  // Perspective
  const fov = 500;
  const scale = fov / (fov + z2 + 200);
  return [cx + x1 * scale, cy + y1 * scale];
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  tx: number; ty: number; // target (cube vertex position or screen edge)
  size: number;
  alpha: number;
  phase: "scatter" | "converge";
  vertexIdx: number;
}

export default function ParticleCubeCanvas({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const initParticles = useCallback((cx: number, cy: number, cubeSize: number): Particle[] => {
    const verts = cubeVertices(cubeSize);
    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      const vi = i % verts.length;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        tx: cx + verts[vi][0],
        ty: cy + verts[vi][1],
        size: 2 + Math.random() * 2,
        alpha: 0.6 + Math.random() * 0.4,
        phase: "scatter",
        vertexIdx: vi,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const cx = W / 2;
    const cy = H / 2;
    const cubeSize = Math.min(W, H) * 0.28;

    const particles = initParticles(cx, cy, cubeSize);
    startTimeRef.current = performance.now();
    let lastTime = startTimeRef.current;

    // Tracers: dots that move along cube edges
    const tracers = Array.from({ length: 8 }, (_, i) => ({
      edge: i % CUBE_EDGES.length,
      t: Math.random(),
      speed: 0.3 + Math.random() * 0.4,
    }));

    // Color cycle state
    let colorT = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = now - startTimeRef.current;
      // Color cycle (8s loop)
      colorT += dt / 8;
      const cyclePos = colorT % 1;
      const c0 = COLOR_CYCLE[Math.floor(cyclePos * 3) % 3];
      const c1 = COLOR_CYCLE[(Math.floor(cyclePos * 3) + 1) % 3];
      const ct = (cyclePos * 3) % 1;
      const r = Math.round(lerp(c0.r, c1.r, ct));
      const g = Math.round(lerp(c0.g, c1.g, ct));
      const b = Math.round(lerp(c0.b, c1.b, ct));

      // Splash alpha
      let splashAlpha = 1;
      if (elapsed > FADE_OUT) {
        splashAlpha = 1 - Math.min((elapsed - FADE_OUT) / 1500, 1);
      }

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = splashAlpha;

      // Background
      ctx.fillStyle = "#030306";
      ctx.fillRect(0, 0, W, H);

      // Mesh gradient
      const grad1 = ctx.createRadialGradient(W * 0.2, H * 0.6, 0, W * 0.2, H * 0.6, W * 0.5);
      grad1.addColorStop(0, `rgba(${r},${g},${b},0.06)`);
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, W, H);

      // --- Particles ---
      const convergeProgress = elapsed > CONVERGE_START
        ? Math.min((elapsed - CONVERGE_START) / (CUBE_LOCK - CONVERGE_START), 1)
        : 0;

      particles.forEach((p) => {
        if (convergeProgress > 0) {
          const verts = cubeVertices(cubeSize);
          const rotY = elapsed < CUBE_LOCK
            ? elapsed * 0.0004
            : CUBE_LOCK * 0.0004;
          const rotX = elapsed < CUBE_LOCK
            ? elapsed * 0.00015
            : CUBE_LOCK * 0.00015;
          const [tx, ty] = projectVertex(
            verts[p.vertexIdx],
            rotX, rotY,
            cx, cy
          );
          p.x = lerp(p.x, tx, easeOut(convergeProgress) * dt * 3);
          p.y = lerp(p.y, ty, easeOut(convergeProgress) * dt * 3);
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.985;
          p.vy *= 0.985;
        }

        const alpha = p.alpha * splashAlpha;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Particle trail
        if (convergeProgress < 1) {
          ctx.save();
          ctx.globalAlpha = 0.15 * (1 - convergeProgress);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.08, p.y - p.vy * 0.08);
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.restore();
        }
      });

      // --- Wireframe cube ---
      const cubeAlpha = convergeProgress > 0.3
        ? Math.min((convergeProgress - 0.3) / 0.7, 1)
        : 0;
      if (cubeAlpha > 0) {
        const rotY = elapsed < CUBE_LOCK
          ? elapsed * 0.0004
          : CUBE_LOCK * 0.0004;
        const rotX = elapsed < CUBE_LOCK
          ? elapsed * 0.00015
          : CUBE_LOCK * 0.00015;
        const verts = cubeVertices(cubeSize);
        const projected = verts.map(v => projectVertex(v as [number,number,number], rotX, rotY, cx, cy));

        ctx.save();
        ctx.globalAlpha = cubeAlpha * 0.55 * splashAlpha;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = `rgba(${r},${g},${b},0.4)`;
        ctx.shadowBlur = 4;

        CUBE_EDGES.forEach(([a, b_]) => {
          ctx.beginPath();
          ctx.moveTo(projected[a][0], projected[a][1]);
          ctx.lineTo(projected[b_][0], projected[b_][1]);
          ctx.stroke();
        });
        ctx.restore();

        // Tracers along edges
        if (cubeAlpha > 0.5) {
          tracers.forEach(tracer => {
            tracer.t += dt * tracer.speed;
            if (tracer.t > 1) { tracer.t -= 1; tracer.edge = (tracer.edge + 1) % CUBE_EDGES.length; }
            const [ai, bi] = CUBE_EDGES[tracer.edge];
            const ax = lerp(projected[ai][0], projected[bi][0], tracer.t);
            const ay = lerp(projected[ai][1], projected[bi][1], tracer.t);
            ctx.save();
            ctx.globalAlpha = cubeAlpha * 0.85 * splashAlpha;
            ctx.beginPath();
            ctx.arc(ax, ay, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.shadowColor = `rgba(${r},${g},${b},1)`;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
          });
        }
      }

      // --- Text overlays ---
      TEXTS.forEach(({ text, sub, t, end }) => {
        if (elapsed < t || elapsed > end + 1200) return;
        let textAlpha = 0;
        if (elapsed >= t && elapsed < t + 600) {
          textAlpha = easeOut((elapsed - t) / 600);
        } else if (elapsed >= t + 600 && elapsed < end) {
          textAlpha = 1;
        } else if (elapsed >= end && elapsed < end + 1200) {
          textAlpha = 1 - easeInOut((elapsed - end) / 1200);
        }
        if (textAlpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = textAlpha * splashAlpha;
        ctx.textAlign = "center";

        const fontSize = Math.min(W * 0.042, 48);
        ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.shadowColor = `rgba(${r},${g},${b},0.3)`;
        ctx.shadowBlur = 20;
        ctx.fillText(text, cx, cy - (cubeAlpha > 0 ? cubeSize * 0.85 : 40));

        const subSize = Math.min(W * 0.028, 32);
        ctx.font = `600 ${subSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.shadowBlur = 12;
        ctx.fillText(sub, cx, cy - (cubeAlpha > 0 ? cubeSize * 0.85 : 40) + subSize * 1.5);
        ctx.restore();
      });

      ctx.restore();

      if (elapsed >= TOTAL_DURATION) {
        onComplete();
        return;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initParticles, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}

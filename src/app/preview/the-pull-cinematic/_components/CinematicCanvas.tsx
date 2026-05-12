"use client";
/**
 * CinematicCanvas — 12s particle-to-cube splash.
 * Color cycle violet -> indigo -> cyan on 8s loop, 1.5s blends.
 * Three text overlays during scatter phase.
 */

import { useEffect, useRef, useCallback } from "react";

interface Props {
  onComplete: () => void;
}

const COLOR_CYCLE = [
  { r: 139, g: 92, b: 246 },   // violet
  { r: 99,  g: 102, b: 241 },  // indigo
  { r: 6,   g: 182, b: 212 },  // cyan
];

const TOTAL_DURATION = 12000;
const CONVERGE_START = 5500;
const CUBE_LOCK = 9000;
const FADE_OUT = 10500;

const TEXTS = [
  { text: "Every prompt you send.", sub: "Ungoverned.", t: 0, end: 2200 },
  { text: "Every agent you deploy.", sub: "Unmeasured.", t: 2500, end: 4700 },
  { text: "Every document you generate.", sub: "Untrusted.", t: 5000, end: 7200 },
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function cubeVertices(size: number): [number, number, number][] {
  const h = size / 2;
  return [
    [-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h],
    [-h,-h, h],[h,-h, h],[h,h, h],[-h,h, h],
  ];
}

const CUBE_EDGES = [
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7],
];

function projectVertex(v: [number,number,number], rotX: number, rotY: number, cx: number, cy: number): [number,number] {
  const [x, y, z] = v;
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const y1 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;
  const fov = 500;
  const scale = fov / (fov + z2 + 200);
  return [cx + x1 * scale, cy + y1 * scale];
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  vertexIdx: number;
}

export default function CinematicCanvas({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const doneRef = useRef(false);

  const initParticles = useCallback((cx: number, cy: number, cubeSize: number): Particle[] => {
    const verts = cubeVertices(cubeSize);
    return Array.from({ length: 60 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 140;
      const vi = i % verts.length;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        alpha: 0.5 + Math.random() * 0.5,
        vertexIdx: vi,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const cx = W / 2;
    const cy = H / 2;
    const cubeSize = Math.min(W, H) * 0.3;

    const particles = initParticles(cx, cy, cubeSize);
    startTimeRef.current = performance.now();
    let lastTime = startTimeRef.current;

    const tracers = Array.from({ length: 10 }, (_, i) => ({
      edge: i % CUBE_EDGES.length,
      t: Math.random(),
      speed: 0.25 + Math.random() * 0.45,
    }));

    let colorT = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = now - startTimeRef.current;

      // Color cycle — 8s loop, 1.5s blend zone
      colorT += dt / 8;
      const cyclePos = colorT % 1;
      const seg = Math.floor(cyclePos * 3) % 3;
      const c0 = COLOR_CYCLE[seg];
      const c1 = COLOR_CYCLE[(seg + 1) % 3];
      const ct = (cyclePos * 3) % 1;
      const r = Math.round(lerp(c0.r, c1.r, easeInOut(ct)));
      const g = Math.round(lerp(c0.g, c1.g, easeInOut(ct)));
      const b = Math.round(lerp(c0.b, c1.b, easeInOut(ct)));

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

      // Mesh gradient blobs — dramatic, drifting
      const t0 = elapsed / 6000;
      const gx1 = W * (0.2 + 0.1 * Math.sin(t0));
      const gy1 = H * (0.6 + 0.1 * Math.cos(t0 * 0.7));
      const grad1 = ctx.createRadialGradient(gx1, gy1, 0, gx1, gy1, W * 0.55);
      grad1.addColorStop(0, `rgba(${r},${g},${b},0.09)`);
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, W, H);

      const gx2 = W * (0.8 + 0.08 * Math.cos(t0 * 0.9));
      const gy2 = H * (0.3 + 0.08 * Math.sin(t0 * 1.1));
      const grad2 = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, W * 0.4);
      grad2.addColorStop(0, `rgba(236,72,153,0.05)`);
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, W, H);

      const convergeProgress = elapsed > CONVERGE_START
        ? Math.min((elapsed - CONVERGE_START) / (CUBE_LOCK - CONVERGE_START), 1)
        : 0;

      // Particles
      particles.forEach((p) => {
        if (convergeProgress > 0) {
          const verts = cubeVertices(cubeSize);
          const rotY = elapsed < CUBE_LOCK ? elapsed * 0.0004 : CUBE_LOCK * 0.0004;
          const rotX = elapsed < CUBE_LOCK ? elapsed * 0.00015 : CUBE_LOCK * 0.00015;
          const [tx, ty] = projectVertex(verts[p.vertexIdx] as [number,number,number], rotX, rotY, cx, cy);
          p.x = lerp(p.x, tx, easeOut(convergeProgress) * dt * 3.5);
          p.y = lerp(p.y, ty, easeOut(convergeProgress) * dt * 3.5);
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.982;
          p.vy *= 0.982;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * splashAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        if (convergeProgress < 1) {
          ctx.save();
          ctx.globalAlpha = 0.18 * (1 - convergeProgress) * splashAlpha;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.1, p.y - p.vy * 0.1);
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.restore();
        }
      });

      // Wireframe cube
      const cubeAlpha = convergeProgress > 0.3 ? Math.min((convergeProgress - 0.3) / 0.7, 1) : 0;
      if (cubeAlpha > 0) {
        const rotY = elapsed < CUBE_LOCK ? elapsed * 0.0004 : CUBE_LOCK * 0.0004;
        const rotX = elapsed < CUBE_LOCK ? elapsed * 0.00015 : CUBE_LOCK * 0.00015;
        const verts = cubeVertices(cubeSize);
        const projected = verts.map(v => projectVertex(v as [number,number,number], rotX, rotY, cx, cy));

        ctx.save();
        ctx.globalAlpha = cubeAlpha * 0.6 * splashAlpha;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
        ctx.shadowBlur = 8;
        CUBE_EDGES.forEach(([a, b_]) => {
          ctx.beginPath();
          ctx.moveTo(projected[a][0], projected[a][1]);
          ctx.lineTo(projected[b_][0], projected[b_][1]);
          ctx.stroke();
        });
        ctx.restore();

        // Tracers
        if (cubeAlpha > 0.4) {
          tracers.forEach(tracer => {
            tracer.t += dt * tracer.speed;
            if (tracer.t > 1) { tracer.t -= 1; tracer.edge = (tracer.edge + 1) % CUBE_EDGES.length; }
            const [ai, bi] = CUBE_EDGES[tracer.edge];
            const ax = lerp(projected[ai][0], projected[bi][0], tracer.t);
            const ay = lerp(projected[ai][1], projected[bi][1], tracer.t);
            ctx.save();
            ctx.globalAlpha = cubeAlpha * 0.9 * splashAlpha;
            ctx.beginPath();
            ctx.arc(ax, ay, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.shadowColor = `rgba(${r},${g},${b},1)`;
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.restore();
          });
        }
      }

      // Text overlays
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
        const yOff = cubeAlpha > 0 ? cubeSize * 0.9 : 44;

        const fontSize = Math.min(W * 0.044, 52);
        ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.94)";
        ctx.shadowColor = `rgba(${r},${g},${b},0.4)`;
        ctx.shadowBlur = 24;
        ctx.fillText(text, cx, cy - yOff);

        const subSize = Math.min(W * 0.028, 34);
        ctx.font = `600 ${subSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
        ctx.shadowBlur = 14;
        ctx.fillText(sub, cx, cy - yOff + subSize * 1.6);
        ctx.restore();
      });

      ctx.restore();

      if (elapsed >= TOTAL_DURATION) {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
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
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}

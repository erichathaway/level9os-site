"use client";
/**
 * OperatorCanvas — 8s terminal-style cube emergence.
 * Grid of vertices lights up, particles scatter, cube assembles.
 * Less dramatic particle burst, more "system booting" aesthetic.
 */

import { useEffect, useRef, useCallback } from "react";

interface Props {
  onComplete: () => void;
}

const TOTAL_DURATION = 8000;
const GRID_PHASE_END = 3000;
const ASSEMBLE_START = 3000;
const CUBE_LOCK = 6500;
const FADE_OUT = 7000;

const TEXTS = [
  { text: "Every prompt you send.", sub: "Ungoverned.", t: 0, end: 1800 },
  { text: "Every agent you deploy.", sub: "Unmeasured.", t: 2000, end: 3800 },
  { text: "Every document you generate.", sub: "Untrusted.", t: 4000, end: 5800 },
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

interface GridNode {
  x: number; y: number;
  alpha: number;
  targetAlpha: number;
  pulse: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  vertexIdx: number;
}

export default function OperatorCanvas({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const doneRef = useRef(false);

  const initGrid = useCallback((W: number, H: number): GridNode[] => {
    const nodes: GridNode[] = [];
    const cols = 20, rows = 12;
    const gw = W / cols, gh = H / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          x: c * gw + gw / 2,
          y: r * gh + gh / 2,
          alpha: 0,
          targetAlpha: Math.random() * 0.4,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }
    return nodes;
  }, []);

  const initParticles = useCallback((cx: number, cy: number, cubeSize: number): Particle[] => {
    const verts = cubeVertices(cubeSize);
    return Array.from({ length: 32 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      const vi = i % verts.length;
      return {
        x: cx + (Math.random() - 0.5) * cubeSize * 0.5,
        y: cy + (Math.random() - 0.5) * cubeSize * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2,
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
    const cubeSize = Math.min(W, H) * 0.28;

    let gridNodes = initGrid(W, H);
    const particles = initParticles(cx, cy, cubeSize);
    startTimeRef.current = performance.now();
    let lastTime = startTimeRef.current;

    const tracers = Array.from({ length: 6 }, (_, i) => ({
      edge: i % CUBE_EDGES.length,
      t: Math.random(),
      speed: 0.3 + Math.random() * 0.4,
    }));

    const color = { r: 99, g: 102, b: 241 }; // indigo base for operator

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      gridNodes = initGrid(W, H);
    };
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = now - startTimeRef.current;
      const { r, g, b } = color;

      let splashAlpha = 1;
      if (elapsed > FADE_OUT) {
        splashAlpha = 1 - Math.min((elapsed - FADE_OUT) / 1000, 1);
      }

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = splashAlpha;

      ctx.fillStyle = "#030306";
      ctx.fillRect(0, 0, W, H);

      // Grid phase
      const gridProgress = Math.min(elapsed / GRID_PHASE_END, 1);
      gridNodes.forEach(node => {
        node.pulse += dt * 2;
        const baseAlpha = node.targetAlpha * gridProgress;
        const pulsed = baseAlpha * (0.7 + 0.3 * Math.sin(node.pulse));
        ctx.save();
        ctx.globalAlpha = pulsed * splashAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fill();
        ctx.restore();
      });

      // Draw connecting lines between close grid nodes during grid phase
      if (gridProgress < 0.8) {
        ctx.save();
        ctx.globalAlpha = gridProgress * 0.06 * splashAlpha;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < gridNodes.length; i += 4) {
          for (let j = i + 1; j < Math.min(i + 8, gridNodes.length); j++) {
            const dx = gridNodes[i].x - gridNodes[j].x;
            const dy = gridNodes[i].y - gridNodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              ctx.beginPath();
              ctx.moveTo(gridNodes[i].x, gridNodes[i].y);
              ctx.lineTo(gridNodes[j].x, gridNodes[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      const assembleProgress = elapsed > ASSEMBLE_START
        ? Math.min((elapsed - ASSEMBLE_START) / (CUBE_LOCK - ASSEMBLE_START), 1)
        : 0;

      // Particles assembling into cube vertices
      particles.forEach((p) => {
        if (assembleProgress > 0) {
          const verts = cubeVertices(cubeSize);
          const rotY = elapsed < CUBE_LOCK ? elapsed * 0.0005 : CUBE_LOCK * 0.0005;
          const rotX = elapsed < CUBE_LOCK ? elapsed * 0.0002 : CUBE_LOCK * 0.0002;
          const [tx, ty] = projectVertex(verts[p.vertexIdx] as [number,number,number], rotX, rotY, cx, cy);
          p.x = lerp(p.x, tx, easeOut(assembleProgress) * dt * 4);
          p.y = lerp(p.y, ty, easeOut(assembleProgress) * dt * 4);
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.97;
          p.vy *= 0.97;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * splashAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // Wireframe cube
      const cubeAlpha = assembleProgress > 0.4 ? Math.min((assembleProgress - 0.4) / 0.6, 1) : 0;
      if (cubeAlpha > 0) {
        const rotY = elapsed < CUBE_LOCK ? elapsed * 0.0005 : CUBE_LOCK * 0.0005;
        const rotX = elapsed < CUBE_LOCK ? elapsed * 0.0002 : CUBE_LOCK * 0.0002;
        const verts = cubeVertices(cubeSize);
        const projected = verts.map(v => projectVertex(v as [number,number,number], rotX, rotY, cx, cy));

        ctx.save();
        ctx.globalAlpha = cubeAlpha * 0.65 * splashAlpha;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
        ctx.shadowBlur = 6;
        CUBE_EDGES.forEach(([a, b_]) => {
          ctx.beginPath();
          ctx.moveTo(projected[a][0], projected[a][1]);
          ctx.lineTo(projected[b_][0], projected[b_][1]);
          ctx.stroke();
        });
        ctx.restore();

        if (cubeAlpha > 0.5) {
          tracers.forEach(tracer => {
            tracer.t += dt * tracer.speed;
            if (tracer.t > 1) { tracer.t -= 1; tracer.edge = (tracer.edge + 1) % CUBE_EDGES.length; }
            const [ai, bi] = CUBE_EDGES[tracer.edge];
            const ax = lerp(projected[ai][0], projected[bi][0], tracer.t);
            const ay = lerp(projected[ai][1], projected[bi][1], tracer.t);
            ctx.save();
            ctx.globalAlpha = cubeAlpha * 0.9 * splashAlpha;
            ctx.beginPath();
            ctx.arc(ax, ay, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.shadowColor = `rgba(${r},${g},${b},1)`;
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.restore();
          });
        }
      }

      // Text overlays — terminal-style: appear crisp
      TEXTS.forEach(({ text, sub, t, end }) => {
        if (elapsed < t || elapsed > end + 800) return;
        let textAlpha = 0;
        if (elapsed >= t && elapsed < t + 400) {
          textAlpha = easeOut((elapsed - t) / 400);
        } else if (elapsed >= t + 400 && elapsed < end) {
          textAlpha = 1;
        } else if (elapsed >= end && elapsed < end + 800) {
          textAlpha = 1 - easeInOut((elapsed - end) / 800);
        }
        if (textAlpha <= 0) return;

        const yPos = cy - (cubeAlpha > 0 ? cubeSize * 0.85 : 32);
        ctx.save();
        ctx.globalAlpha = textAlpha * splashAlpha;
        ctx.textAlign = "center";

        const fontSize = Math.min(W * 0.038, 44);
        ctx.font = `700 ${fontSize}px ui-monospace, SFMono-Regular, monospace`;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText(text, cx, yPos);

        const subSize = Math.min(W * 0.026, 30);
        ctx.font = `500 ${subSize}px ui-monospace, SFMono-Regular, monospace`;
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.fillText(sub, cx, yPos + subSize * 1.7);
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
  }, [initGrid, initParticles, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}

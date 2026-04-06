"use client";

import { useEffect, useRef } from "react";

const rY = (x: number, z: number, a: number): [number, number] =>
  [x * Math.cos(a) - z * Math.sin(a), x * Math.sin(a) + z * Math.cos(a)];
const rX = (y: number, z: number, a: number): [number, number] =>
  [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const pj = (x: number, y: number, z: number, cx: number, cy: number, f: number): [number, number, number] => {
  const s = f / (f + z);
  return [cx + x * s, cy + y * s, s];
};

function buildCube(size: number) {
  const n = 4;
  const verts: [number, number, number][] = [];
  const vMap = new Map<string, number>();
  const edges: [number, number][] = [];
  const eSet = new Set<string>();
  const s = size / n;
  const h = size / 2;

  const v = (ix: number, iy: number, iz: number) => {
    const k = `${ix},${iy},${iz}`;
    if (vMap.has(k)) return vMap.get(k)!;
    const idx = verts.length;
    verts.push([ix * s - h, iy * s - h, iz * s - h]);
    vMap.set(k, idx);
    return idx;
  };

  const e = (a: number, b: number) => {
    if (a === b) return;
    const k = Math.min(a, b) + "," + Math.max(a, b);
    if (!eSet.has(k)) { eSet.add(k); edges.push([a, b]); }
  };

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      v(i, j, 0); v(i, j, n);
      v(i, 0, j); v(i, n, j);
      v(0, i, j); v(n, i, j);
    }
  }

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j < n; j++) {
      e(v(i, j, 0), v(i, j + 1, 0)); e(v(j, i, 0), v(j + 1, i, 0));
      e(v(i, j, n), v(i, j + 1, n)); e(v(j, i, n), v(j + 1, i, n));
      e(v(i, 0, j), v(i, 0, j + 1)); e(v(j, 0, i), v(j + 1, 0, i));
      e(v(i, n, j), v(i, n, j + 1)); e(v(j, n, i), v(j + 1, n, i));
      e(v(0, i, j), v(0, i, j + 1)); e(v(0, j, i), v(0, j + 1, i));
      e(v(n, i, j), v(n, i, j + 1)); e(v(n, j, i), v(n, j + 1, i));
    }
  }

  return { verts, edges };
}

const COLORS: [number, number, number][] = [
  [139, 92, 246],
  [99, 102, 241],
  [6, 182, 212],
];

export default function WireframeCube({ size = 200 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const w = size * 2;
    const h = size * 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const cx = w / 2;
    const cy = h / 2;
    const cubeSize = size * 0.7;
    const { verts, edges } = buildCube(cubeSize);
    const FOCAL = 500;
    const start = performance.now();

    const tracers = [
      { e: 0, p: 0 },
      { e: Math.floor(edges.length * 0.33), p: 0.4 },
      { e: Math.floor(edges.length * 0.66), p: 0.8 },
    ];

    const animate = () => {
      const t = performance.now() - start;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cycleDur = 8000;
      const transDur = 1500;
      const phase = (t % (cycleDur * COLORS.length));
      const ci = Math.floor(phase / cycleDur);
      const elapsed = phase - ci * cycleDur;
      const cf = elapsed > cycleDur - transDur ? (elapsed - (cycleDur - transDur)) / transDur : 0;
      const c1 = COLORS[ci % COLORS.length];
      const c2 = COLORS[(ci + 1) % COLORS.length];
      const R = Math.round(c1[0] + (c2[0] - c1[0]) * cf);
      const G = Math.round(c1[1] + (c2[1] - c1[1]) * cf);
      const B = Math.round(c1[2] + (c2[2] - c1[2]) * cf);

      const aY = (t * 0.00018) % (Math.PI * 2);
      const aX = (t * 0.00011 + 0.35) % (Math.PI * 2);

      const projected: [number, number, number][] = verts.map(([vx, vy, vz]) => {
        const [rx, rz] = rY(vx, vz, aY);
        const [ry, rz2] = rX(vy, rz, aX);
        return pj(rx, ry, rz2, cx, cy, FOCAL);
      });

      for (const [a, b] of edges) {
        const [ax, ay, as2] = projected[a];
        const [bx, by, bs] = projected[b];
        const depth = (as2 + bs) / 2;
        const alpha = 0.04 + depth * 0.08;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`;
        ctx.lineWidth = 0.3 + depth * 0.3;
        ctx.stroke();
      }

      for (const [px, py, ps] of projected) {
        const alpha = 0.1 + ps * 0.2;
        const r = 0.6 + ps * 0.8;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${B},${alpha})`;
        ctx.fill();
      }

      for (const tr of tracers) {
        tr.p += 0.006;
        if (tr.p >= 1) { tr.p = 0; tr.e = (tr.e + 1) % edges.length; }
        const [a, b] = edges[tr.e];
        const [ax, ay] = projected[a];
        const [bx, by] = projected[b];
        const tx = ax + (bx - ax) * tr.p;
        const ty = ay + (by - ay) * tr.p;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${B},0.7)`;
        ctx.fill();
        const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, 8);
        g.addColorStop(0, `rgba(${R},${G},${B},0.2)`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(tx, ty, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none"
      style={{ width: size * 2, height: size * 2 }}
    />
  );
}

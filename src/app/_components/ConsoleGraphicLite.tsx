"use client";
/**
 * ConsoleGraphicLite — governance-module hero for the rebuild dashboard.
 *
 * Forked from @level9/brand/components/architecture/ConsoleGraphic.tsx.
 * Simplified for the chat-sidebar module context:
 *   R1 · 16 officers (4 per bucket category) rotating continuously
 *   R2 · 4 bucket quadrants (Decide / Coordinate / Execute / Measure)
 *   R3 · 8 product discs docked into buckets (smaller scale)
 *   R4 · 4 domain anchors (one per bucket) radiating outward
 *
 * Hover a bucket: pins it, glows the sector, shows a popup label.
 * Packet flows (bezier arcs) trickle from R1 down into the bucket ring.
 * Designed for a ~600x600 default container; scales responsively.
 */

import { useEffect, useMemo, useRef, useState } from "react";

type BucketId = "decide" | "coord" | "exec" | "measure";

const BUCKETS: {
  id: BucketId;
  label: string;
  color: string;
  rgb: [number, number, number];
  breaks: string;
  officers: string[];
  product: string;
  domain: string;
}[] = [
  {
    id: "decide",
    label: "Decide",
    color: "#8b5cf6",
    rgb: [139, 92, 246],
    breaks: "Misalignment",
    officers: ["CEO-AI", "CFO-AI", "CPO-AI", "CLO-AI"],
    product: "StratOS",
    domain: "Architect Alignment",
  },
  {
    id: "coord",
    label: "Coordinate",
    color: "#10b981",
    rgb: [16, 185, 129],
    breaks: "Drag",
    officers: ["CMD-AI", "PMO-AI", "OPS-AI", "HR-AI"],
    product: "CommandOS",
    domain: "Systematize the Run",
  },
  {
    id: "exec",
    label: "Execute",
    color: "#f59e0b",
    rgb: [245, 158, 11],
    breaks: "Cost",
    officers: ["ABM-AI", "CS-AI", "MKT-AI", "LNK-AI"],
    product: "OutboundOS",
    domain: "Financial Leverage",
  },
  {
    id: "measure",
    label: "Measure",
    color: "#06b6d4",
    rgb: [6, 182, 212],
    breaks: "Reactive leadership",
    officers: ["ECI-AI", "RPT-AI", "AUD-AI", "KPI-AI"],
    product: "LucidORG",
    domain: "Execution Assessment",
  },
];

const BUCKET_MID_ANGLE: Record<BucketId, number> = {
  decide:  -Math.PI * 3 / 4,
  coord:   -Math.PI / 4,
  exec:    Math.PI / 4,
  measure: Math.PI * 3 / 4,
};

type V2 = [number, number];

/* simple tilt-projection so the canvas looks slightly 3D */
function projectFloor(x: number, z: number, tilt: number, cx: number, cy: number, focal: number): V2 {
  const y2 = -z * Math.sin(tilt);
  const z2 = z * Math.cos(tilt);
  const s = focal / (focal + z2);
  return [cx + x * s, cy + y2 * s];
}

type Packet = {
  bucketId: BucketId;
  t: number;         // 0..1 progress along bezier
  speed: number;
  bright: boolean;
};

export default function ConsoleGraphicLite() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [hoveredBucket, setHoveredBucket] = useState<BucketId | null>(null);
  const [pinnedBucket, setPinnedBucket] = useState<BucketId | null>(null);
  const hoveredRef = useRef<BucketId | null>(null);
  const pinnedRef = useRef<BucketId | null>(null);
  const mouseRef = useRef<V2>([-9999, -9999]);
  const geomRef = useRef({ cx: 0, cy: 0, R_OUTER: 0, R_BUCKET: 0, TILT: 0.32, FOCAL: 1800 });

  useEffect(() => { hoveredRef.current = hoveredBucket; }, [hoveredBucket]);
  useEffect(() => { pinnedRef.current = pinnedBucket; }, [pinnedBucket]);

  // 8 product discs: 2 per bucket quadrant
  const PRODUCTS = useMemo(() => [
    { id: "stratos",   bucket: "decide"  as BucketId, name: "StratOS",    color: "#8b5cf6", icon: "S", slot: 0 },
    { id: "playbook",  bucket: "decide"  as BucketId, name: "Playbook",   color: "#ec4899", icon: "P", slot: 1 },
    { id: "commandos", bucket: "coord"   as BucketId, name: "CommandOS",  color: "#10b981", icon: "C", slot: 0 },
    { id: "max",       bucket: "coord"   as BucketId, name: "MAX",        color: "#ec4899", icon: "M", slot: 1 },
    { id: "linkup",    bucket: "exec"    as BucketId, name: "LinkUpOS",   color: "#f59e0b", icon: "L", slot: 0 },
    { id: "abm",       bucket: "exec"    as BucketId, name: "ABM",        color: "#fb923c", icon: "A", slot: 1 },
    { id: "lucidorg",  bucket: "measure" as BucketId, name: "LucidORG",  color: "#06b6d4", icon: "L", slot: 0 },
    { id: "education", bucket: "measure" as BucketId, name: "Education",  color: "#6366f1", icon: "E", slot: 1 },
  ], []);

  const packetsRef = useRef<Packet[]>([]);
  const lastPacketSpawn = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = canvas.parentElement!;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    let isVisible = false;
    const vis = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const wasHidden = !isVisible;
          isVisible = e.isIntersecting;
          if (isVisible && wasHidden && rafRef.current === 0) {
            rafRef.current = requestAnimationFrame(render);
          }
        }
      },
      { threshold: 0.05 }
    );
    vis.observe(canvas);

    const start = performance.now();
    const SPIN_SPEED = 0.000028; // radians / ms

    function bezierPoint(p0: V2, p1: V2, p2: V2, p3: V2, t: number): V2 {
      const u = 1 - t;
      return [
        u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
        u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1],
      ];
    }

    const render = () => {
      const now = performance.now();
      const t = now - start;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const shortSide = Math.min(w, h);
      const R_OUTER = shortSide * 0.44;
      const R_BUCKET = R_OUTER * 0.68;
      const R_PRODUCT = R_OUTER * 0.44;
      const R_DOMAIN = R_OUTER * 0.22;
      const TILT = 0.32;
      const FOCAL = 1800;
      const SPIN = t * SPIN_SPEED;

      geomRef.current = { cx, cy, R_OUTER, R_BUCKET, TILT, FOCAL };

      const activeBucket = pinnedRef.current ?? hoveredRef.current;

      // Intro fade-in (0..1 over first 1.4s)
      const appear = Math.min(1, t / 1400);

      // ── Background floor pad
      {
        const segs = 64;
        ctx.beginPath();
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          const [px, py] = projectFloor(Math.cos(a) * R_OUTER, Math.sin(a) * R_OUTER, TILT, cx, cy, FOCAL);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, R_OUTER * 0.9);
        g.addColorStop(0, `rgba(139,92,246,${0.10 * appear})`);
        g.addColorStop(0.6, `rgba(139,92,246,${0.04 * appear})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fill();
      }

      // ── Fine radial grid
      ctx.strokeStyle = `rgba(139,92,246,${0.055 * appear})`;
      ctx.lineWidth = 0.4;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const [x1, y1] = projectFloor(Math.cos(a) * R_DOMAIN * 1.05, Math.sin(a) * R_DOMAIN * 1.05, TILT, cx, cy, FOCAL);
        const [x2, y2] = projectFloor(Math.cos(a) * R_OUTER, Math.sin(a) * R_OUTER, TILT, cx, cy, FOCAL);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      function drawRing(r: number, rgb: string, alpha: number, lw = 1, dash?: [number, number]) {
        ctx.strokeStyle = `rgba(${rgb}, ${alpha * appear})`;
        ctx.lineWidth = lw;
        if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const a = (i / 80) * Math.PI * 2;
          const [px, py] = projectFloor(Math.cos(a) * r, Math.sin(a) * r, TILT, cx, cy, FOCAL);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── R1 · Governance perimeter
      drawRing(R_OUTER,          "245,158,11", 0.55, 1.2);
      drawRing(R_OUTER * 0.958,  "245,158,11", 0.20, 0.5, [3, 3]);

      // 16 officers across 4 buckets, spinning with SPIN offset
      BUCKETS.forEach((bucket, bi) => {
        const sectorStart = bi * (Math.PI / 2) - Math.PI / 2 + SPIN;
        const sectorEnd = sectorStart + Math.PI / 2;
        const isActive = activeBucket === bucket.id;
        const isDimmed = activeBucket !== null && !isActive;

        // Sector wedge emphasis on hover
        if (isActive) {
          const segs = 18;
          ctx.beginPath();
          for (let i = 0; i <= segs; i++) {
            const a = sectorStart + (i / segs) * (sectorEnd - sectorStart);
            const [px, py] = projectFloor(Math.cos(a) * R_OUTER * 1.04, Math.sin(a) * R_OUTER * 1.04, TILT, cx, cy, FOCAL);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          for (let i = segs; i >= 0; i--) {
            const a = sectorStart + (i / segs) * (sectorEnd - sectorStart);
            const [px, py] = projectFloor(Math.cos(a) * R_OUTER * 0.94, Math.sin(a) * R_OUTER * 0.94, TILT, cx, cy, FOCAL);
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},0.12)`;
          ctx.fill();
        }

        // 4 officers per bucket
        bucket.officers.forEach((officer, oi) => {
          const a = sectorStart + ((oi + 0.5) / 4) * (sectorEnd - sectorStart);
          const [px, py] = projectFloor(Math.cos(a) * R_OUTER * 0.984, Math.sin(a) * R_OUTER * 0.984, TILT, cx, cy, FOCAL);
          const mul = isDimmed ? 0.3 : isActive ? 1.35 : 1;
          const dotR = isActive ? 2.0 : 1.4;

          const glow = ctx.createRadialGradient(px, py, 0, px, py, isActive ? 9 : 5);
          glow.addColorStop(0, `rgba(245,158,11,${0.35 * mul * appear})`);
          glow.addColorStop(1, `rgba(245,158,11,0)`);
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(px, py, isActive ? 9 : 5, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = `rgba(245,158,11,${0.78 * mul * appear})`;
          ctx.beginPath(); ctx.arc(px, py, dotR, 0, Math.PI * 2); ctx.fill();

          // Officer label on hover
          if (isActive) {
            ctx.save();
            ctx.font = `600 7px Inter,sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = `rgba(255,255,255,0.75)`;
            const [lx, ly] = projectFloor(Math.cos(a) * R_OUTER * 1.075, Math.sin(a) * R_OUTER * 1.075, TILT, cx, cy, FOCAL);
            ctx.fillText(officer, lx, ly);
            ctx.restore();
          }
        });

        // Sector dividers
        const [d1x, d1y] = projectFloor(Math.cos(sectorStart) * R_OUTER * 0.93, Math.sin(sectorStart) * R_OUTER * 0.93, TILT, cx, cy, FOCAL);
        const [d2x, d2y] = projectFloor(Math.cos(sectorStart) * R_OUTER * 1.04, Math.sin(sectorStart) * R_OUTER * 1.04, TILT, cx, cy, FOCAL);
        ctx.strokeStyle = `rgba(245,158,11,${0.5 * appear})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(d1x, d1y); ctx.lineTo(d2x, d2y); ctx.stroke();
      });

      // ── Packet flows (R1 → R2 bezier arcs)
      const pktNow = now;
      if (pktNow - lastPacketSpawn.current > 420) {
        lastPacketSpawn.current = pktNow;
        const randomBucket = BUCKETS[Math.floor(Math.random() * 4)];
        packetsRef.current.push({
          bucketId: randomBucket.id,
          t: 0,
          speed: 0.006 + Math.random() * 0.004,
          bright: Math.random() < 0.22,
        });
        // Limit to 12 active packets
        if (packetsRef.current.length > 12) packetsRef.current.shift();
      }

      packetsRef.current = packetsRef.current.filter((p) => p.t < 1);
      packetsRef.current.forEach((pkt) => {
        pkt.t = Math.min(1, pkt.t + pkt.speed);
        const bucket = BUCKETS.find((b) => b.id === pkt.bucketId)!;
        const bucketAngle = BUCKET_MID_ANGLE[pkt.bucketId] + SPIN;

        // Packet origin on R1, destination on R2
        const originAngle = bucketAngle + 0.22 * (Math.random() > 0.5 ? 1 : -1);
        const p0 = projectFloor(Math.cos(originAngle) * R_OUTER, Math.sin(originAngle) * R_OUTER, TILT, cx, cy, FOCAL);
        const p3 = projectFloor(Math.cos(bucketAngle) * R_BUCKET, Math.sin(bucketAngle) * R_BUCKET, TILT, cx, cy, FOCAL);
        // Control points curve through center area
        const p1: V2 = [p0[0] + (p3[0] - p0[0]) * 0.3, p0[1] + (p3[1] - p0[1]) * 0.1];
        const p2: V2 = [p0[0] + (p3[0] - p0[0]) * 0.7, p0[1] + (p3[1] - p0[1]) * 0.9];

        const [px, py] = bezierPoint(p0, p1, p2, p3, pkt.t);
        const alpha = pkt.bright ? 0.85 : 0.45;
        const r = pkt.bright ? 2.2 : 1.5;

        const isActivePkt = activeBucket === pkt.bucketId;
        const pktMul = activeBucket === null ? 1 : isActivePkt ? 1.4 : 0.3;

        ctx.fillStyle = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},${alpha * pktMul * appear})`;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();

        if (pkt.bright || isActivePkt) {
          const glow2 = ctx.createRadialGradient(px, py, 0, px, py, 6);
          glow2.addColorStop(0, `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},0.3)`);
          glow2.addColorStop(1, `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},0)`);
          ctx.fillStyle = glow2;
          ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
        }
      });

      // ── R2 · Bucket ring
      drawRing(R_BUCKET,         "139,92,246", 0.28, 0.9);
      drawRing(R_BUCKET * 0.92,  "139,92,246", 0.10, 0.4, [2, 3]);

      BUCKETS.forEach((bucket, bi) => {
        const mid = bi * (Math.PI / 2) - Math.PI / 4;
        const isActive = activeBucket === bucket.id;
        const isDimmed = activeBucket !== null && !isActive;
        const mul = isDimmed ? 0.3 : isActive ? 1.4 : 1;

        const [bx, by] = projectFloor(Math.cos(mid) * R_BUCKET, Math.sin(mid) * R_BUCKET, TILT, cx, cy, FOCAL);

        // Bucket disc glow
        const bucketGlow = ctx.createRadialGradient(bx, by, 0, bx, by, isActive ? 36 : 22);
        bucketGlow.addColorStop(0, `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},${0.28 * mul * appear})`);
        bucketGlow.addColorStop(1, `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},0)`);
        ctx.fillStyle = bucketGlow;
        ctx.beginPath(); ctx.arc(bx, by, isActive ? 36 : 22, 0, Math.PI * 2); ctx.fill();

        // Bucket disc
        ctx.strokeStyle = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},${0.7 * mul * appear})`;
        ctx.fillStyle = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},${(isActive ? 0.2 : 0.08) * appear})`;
        ctx.lineWidth = isActive ? 1.5 : 1;
        ctx.beginPath(); ctx.arc(bx, by, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Bucket label
        ctx.save();
        ctx.font = `${isActive ? "800" : "700"} ${isActive ? 9 : 8}px Inter,sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(255,255,255,${(isDimmed ? 0.3 : 0.9) * appear})`;
        ctx.shadowColor = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},0.7)`;
        ctx.shadowBlur = isActive ? 5 : 0;
        ctx.fillText(bucket.label.toUpperCase(), bx, by);
        ctx.shadowBlur = 0;
        ctx.restore();

        // "BREAKS X" tag on hover
        if (isActive) {
          const tagR = R_BUCKET * 0.83;
          const [tx2, ty2] = projectFloor(Math.cos(mid) * tagR, Math.sin(mid) * tagR, TILT, cx, cy, FOCAL);
          ctx.save();
          ctx.font = "600 7px Inter,sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},0.7)`;
          ctx.fillText(`breaks: ${bucket.breaks}`, tx2, ty2 + 18);
          ctx.restore();
        }
      });

      // ── R3 · Product discs
      PRODUCTS.forEach((prod) => {
        const bucket = BUCKETS.find((b) => b.id === prod.bucket)!;
        const bi = BUCKETS.indexOf(bucket);
        const sectorMid = bi * (Math.PI / 2) - Math.PI / 4;
        const isActive = activeBucket === prod.bucket;
        const isDimmed = activeBucket !== null && !isActive;
        const mul = isDimmed ? 0.2 : isActive ? 1.3 : 1;
        // Two products per bucket: slot 0 slightly left, slot 1 slightly right
        const offset = (prod.slot - 0.5) * 0.28;
        const a = sectorMid + offset;
        const [px2, py2] = projectFloor(Math.cos(a) * R_PRODUCT, Math.sin(a) * R_PRODUCT, TILT, cx, cy, FOCAL);

        const hexToRgb = (hex: string): [number, number, number] => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return [r, g, b];
        };
        const [r2, g2, b2] = hexToRgb(prod.color);

        ctx.strokeStyle = `rgba(${r2},${g2},${b2},${0.65 * mul * appear})`;
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${(isActive ? 0.18 : 0.06) * appear})`;
        ctx.lineWidth = isActive ? 1.4 : 0.9;
        const disc = isActive ? 11 : 8;
        ctx.beginPath(); ctx.arc(px2, py2, disc, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.save();
        ctx.font = `700 ${isActive ? 7 : 6}px Inter,sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(255,255,255,${(isDimmed ? 0.2 : 0.8) * appear})`;
        ctx.fillText(prod.icon, px2, py2);
        ctx.restore();

        if (isActive) {
          const [lx2, ly2] = projectFloor(Math.cos(a) * (R_PRODUCT - 22), Math.sin(a) * (R_PRODUCT - 22), TILT, cx, cy, FOCAL);
          ctx.save();
          ctx.font = "500 6.5px Inter,sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${r2},${g2},${b2},0.75)`;
          ctx.fillText(prod.name, lx2, ly2);
          ctx.restore();
        }
      });

      // ── R4 · Domain anchor spokes
      BUCKETS.forEach((bucket, bi) => {
        const a = bi * (Math.PI / 2) - Math.PI / 4;
        const isActive = activeBucket === bucket.id;
        const isDimmed = activeBucket !== null && !isActive;
        const mul = isDimmed ? 0.2 : isActive ? 1.4 : 0.7;

        const [x1, y1] = projectFloor(Math.cos(a) * R_DOMAIN * 0.9, Math.sin(a) * R_DOMAIN * 0.9, TILT, cx, cy, FOCAL);
        const [x2, y2] = projectFloor(Math.cos(a) * R_DOMAIN * 2.2, Math.sin(a) * R_DOMAIN * 2.2, TILT, cx, cy, FOCAL);

        ctx.strokeStyle = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},${0.3 * mul * appear})`;
        ctx.lineWidth = isActive ? 1.5 : 0.8;
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.setLineDash([]);

        const [dx2, dy2] = projectFloor(Math.cos(a) * R_DOMAIN * 0.88, Math.sin(a) * R_DOMAIN * 0.88, TILT, cx, cy, FOCAL);
        const domGlow = ctx.createRadialGradient(dx2, dy2, 0, dx2, dy2, 12);
        domGlow.addColorStop(0, `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},${0.35 * mul * appear})`);
        domGlow.addColorStop(1, `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},0)`);
        ctx.fillStyle = domGlow;
        ctx.beginPath(); ctx.arc(dx2, dy2, 12, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},${0.55 * mul * appear})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.arc(dx2, dy2, 5, 0, Math.PI * 2); ctx.stroke();

        if (isActive) {
          ctx.save();
          ctx.font = "600 7px Inter,sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${bucket.rgb[0]},${bucket.rgb[1]},${bucket.rgb[2]},0.8)`;
          const [lx3, ly3] = projectFloor(Math.cos(a) * R_DOMAIN * 0.55, Math.sin(a) * R_DOMAIN * 0.55, TILT, cx, cy, FOCAL);
          ctx.fillText(bucket.domain.substring(0, 14), lx3, ly3);
          ctx.restore();
        }
      });

      // ── Core pulse
      const corePulse = 0.84 + Math.sin(t * 0.002) * 0.08;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 * corePulse);
      coreGrad.addColorStop(0, `rgba(139,92,246,${0.32 * appear})`);
      coreGrad.addColorStop(1, `rgba(139,92,246,0)`);
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(cx, cy, 22 * corePulse, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = `rgba(139,92,246,${0.6 * appear})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke();

      ctx.save();
      ctx.font = "700 8px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(255,255,255,${0.8 * appear})`;
      ctx.fillText("L9", cx, cy);
      ctx.restore();

      if (isVisible) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        rafRef.current = 0;
      }
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
      vis.disconnect();
    };
  }, [PRODUCTS]);

  // Hit-test: map pointer to bucket
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    mouseRef.current = [mx, my];

    const { cx, cy, R_BUCKET, TILT, FOCAL } = geomRef.current;

    let found: BucketId | null = null;
    for (let bi = 0; bi < BUCKETS.length; bi++) {
      const bucket = BUCKETS[bi];
      const mid = bi * (Math.PI / 2) - Math.PI / 4;
      const [bx, by] = projectFloor(Math.cos(mid) * R_BUCKET, Math.sin(mid) * R_BUCKET, TILT, cx, cy, FOCAL);
      const dist = Math.hypot(mx - bx, my - by);
      if (dist < 28) { found = bucket.id; break; }
    }
    setHoveredBucket(found);
  };

  const handleMouseLeave = () => setHoveredBucket(null);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const { cx, cy, R_BUCKET, TILT, FOCAL } = geomRef.current;

    let found: BucketId | null = null;
    for (let bi = 0; bi < BUCKETS.length; bi++) {
      const bucket = BUCKETS[bi];
      const mid = bi * (Math.PI / 2) - Math.PI / 4;
      const [bx, by] = projectFloor(Math.cos(mid) * R_BUCKET, Math.sin(mid) * R_BUCKET, TILT, cx, cy, FOCAL);
      if (Math.hypot(mx - bx, my - by) < 28) { found = bucket.id; break; }
    }
    setPinnedBucket((prev) => prev === found ? null : found);
  };

  const activeBucket = pinnedBucket ?? hoveredBucket;
  const activeBucketData = activeBucket ? BUCKETS.find((b) => b.id === activeBucket) : null;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 580, margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "100%",
          minHeight: 280,
          cursor: "crosshair",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            cursor: "crosshair",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </div>

      {/* Bucket info popup */}
      {activeBucketData && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.55rem 0.8rem",
            borderRadius: 8,
            border: `1px solid ${activeBucketData.color}30`,
            background: `${activeBucketData.color}08`,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "hb-fade-in 0.18s ease",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: activeBucketData.color,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: activeBucketData.color,
                fontFamily: "Inter,sans-serif",
              }}
            >
              {activeBucketData.label}
            </div>
            <div
              style={{
                fontSize: "0.62rem",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "ui-monospace,monospace",
              }}
            >
              breaks: {activeBucketData.breaks} &nbsp;&middot;&nbsp; {activeBucketData.product}
            </div>
          </div>
          <div
            style={{
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.25)",
              fontFamily: "ui-monospace,monospace",
            }}
          >
            {pinnedBucket ? "pinned ↓" : "hover"}
          </div>
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          fontSize: "0.62rem",
          color: "rgba(255,255,255,0.2)",
          marginTop: "0.4rem",
          fontFamily: "ui-monospace,monospace",
          letterSpacing: "0.08em",
        }}
      >
        Pin a bucket to focus &nbsp;&middot;&nbsp; {BUCKETS.length * 4} officers &nbsp;&middot;&nbsp; 8 products
      </div>
    </div>
  );
}

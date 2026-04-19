"use client";
/** level9os | ConsoleGraphic — inline version of the cube-lab Console prototype.
 *  Renders the full operating-architecture radial plan:
 *    R1 (outer) · Governance perimeter (48 officers in 8 categories + 3 gates)
 *    R2         · 4 Bucket quadrants (Decide / Coordinate / Execute / Measure) + KPI dials
 *    R3         · 8 Product discs, docked into their bucket
 *    R4 (core)  · 8 Operating Domain spokes radiating out
 *
 *  Self-contained: data inlined, no cube-lab imports. Sized to parent
 *  container. Ambient telemetry: tracer pips around each ring, activity
 *  blips on the bucket ring, ambient cross-core packets, live ops log.
 *  Dialed-down color palette for McKinsey-professional tone.
 */

import { useEffect, useMemo, useRef, useState } from "react";

/* ─── taxonomy (inlined; mirrors cube-lab/taxonomy.ts) ─── */
type Rgb = [number, number, number];

const GOVERNANCE = {
  officerCount: 48,
  categories: [
    { id: "biz_strategy",    name: "Business Strategy", count: 6 },
    { id: "creative",        name: "Creative",          count: 12 },
    { id: "sales_cs",        name: "Sales · Customer",  count: 3 },
    { id: "people_org",      name: "People · Org",      count: 4 },
    { id: "technical",       name: "Technical",         count: 7 },
    { id: "personal",        name: "Personal",          count: 4 },
    { id: "research",        name: "Research · Intel",  count: 4 },
    { id: "governance_risk", name: "Governance · Risk", count: 8 },
  ],
  gates: [
    { id: "g1", name: "G1 · PLAN",  sub: "option pitch · pre-start" },
    { id: "g2", name: "G2 · MID",   sub: "alignment · 50% mark" },
    { id: "g3", name: "G3 · FINAL", sub: "polish-only sign-off" },
  ],
};

type BucketId = "decide" | "coord" | "exec" | "measure";
const BUCKETS: { id: BucketId; n: string; name: string; color: string; rgb: Rgb; breaks: string }[] = [
  { id: "decide",  n: "01", name: "Decide",     color: "#8b5cf6", rgb: [139, 92, 246], breaks: "Misalignment" },
  { id: "coord",   n: "02", name: "Coordinate", color: "#10b981", rgb: [16, 185, 129], breaks: "Drag" },
  { id: "exec",    n: "03", name: "Execute",    color: "#f59e0b", rgb: [245, 158, 11], breaks: "Cost" },
  { id: "measure", n: "04", name: "Measure",    color: "#06b6d4", rgb: [6, 182, 212],  breaks: "Reactive leadership" },
];

type Product = { id: string; name: string; bucket: BucketId; sub: string; color: string; rgb: Rgb; icon: string; specs: string[]; domains: number[] };
const PRODUCTS: Product[] = [
  { id: "stratos",   name: "StratOS",    bucket: "decide",  sub: "Executive Deliberation", color: "#8b5cf6", rgb: [139, 92, 246], icon: "S",
    specs: ["10 AI executives · 3 rounds", "$5.89 / run · Sonnet 4.6", "Gov-audited recommendations"], domains: [1, 5, 7] },
  { id: "playbook",  name: "Playbook",   bucket: "decide",  sub: "COO Methodology", color: "#ec4899", rgb: [236, 72, 153], icon: "P",
    specs: ["8 Operating Domains", "Alignment Cycle · 7 phases", "30 / 90 / 180 install"], domains: [1, 2, 4, 5, 8] },
  { id: "commandos", name: "CommandOS",  bucket: "coord",   sub: "Fleet Orchestration", color: "#10b981", rgb: [16, 185, 129], icon: "C",
    specs: ["48 domain officers", "3 gates · multi-LLM routing", "22 n8n workflows · NAS"], domains: [2, 3, 4, 5] },
  { id: "linkup",    name: "LinkUpOS",   bucket: "exec",    sub: "Signal Engine (pod)", color: "#f59e0b", rgb: [245, 158, 11], icon: "L",
    specs: ["24 workflows · 87k-word RAG", "$5 / mo · zero human", "Postgres triggers · live"], domains: [3, 6] },
  { id: "abm",       name: "ABM Engine", bucket: "exec",    sub: "Multi-channel Outbound", color: "#f59e0b", rgb: [245, 158, 11], icon: "A",
    specs: ["Company-in · campaign-out", "Apollo + LinkedIn API", "Voice-calibrated per-target"], domains: [3, 6] },
  { id: "autocs",    name: "AutoCS",     bucket: "exec",    sub: "Customer Care Pod", color: "#f59e0b", rgb: [245, 158, 11], icon: "Q",
    specs: ["Feedback → tasks bridge", "Postgres trigger sync", "CS Issues dashboard live"], domains: [3, 7] },
  { id: "lucidorg",  name: "LucidORG",   bucket: "measure", sub: "ECI · Digital Twin", color: "#06b6d4", rgb: [6, 182, 212], icon: "L",
    specs: ["4 pillars · 11 metrics", "37 levers · 0–1000 score", "Friction detection · real-time"], domains: [4, 5, 7, 8] },
  { id: "education", name: "Education",  bucket: "measure", sub: "Learning Pipeline", color: "#6366f1", rgb: [99, 102, 241], icon: "E",
    specs: ["OB 101 / 200 / 300", "CEU · SHRM / PMI pathway", "StratOS as student lab"], domains: [3, 8] },
];

type Domain = { n: number; id: string; name: string; sub: string; color: string; rgb: Rgb; kpi: string };
const DOMAINS: Domain[] = [
  { n: 1, id: "align",      name: "Architect Alignment",         sub: "Autonomous execution",   color: "#8b5cf6", rgb: [139, 92, 246], kpi: "Decisions made from dashboards vs asking people" },
  { n: 2, id: "systemize",  name: "Systematize the Run",          sub: "Org runs itself",       color: "#06b6d4", rgb: [6, 182, 212],  kpi: "Time to adapt to priority change < 30d" },
  { n: 3, id: "humai",      name: "Human + AI Architecture",      sub: "Collaborative layer",   color: "#ec4899", rgb: [236, 72, 153], kpi: "AI-Trust Score · Load Reduction hrs" },
  { n: 4, id: "loop",       name: "Continuous Operating Loop",    sub: "Align → Sustain cycle", color: "#8b5cf6", rgb: [139, 92, 246], kpi: "Cycle time strategy → execution" },
  { n: 5, id: "adapt-gov",  name: "Adaptive Governance",          sub: "Trigger-based sessions",color: "#10b981", rgb: [16, 185, 129], kpi: "Action-completion rate, not perception" },
  { n: 6, id: "fin-lev",    name: "Financial Leverage",           sub: "ROI-quantified",        color: "#f59e0b", rgb: [245, 158, 11], kpi: "EBITDA margin · alignment score" },
  { n: 7, id: "exec-assess",name: "Execution Assessment",         sub: "ECI-driven quarterly",  color: "#06b6d4", rgb: [6, 182, 212],  kpi: "ECI score trend · hierarchical variance" },
  { n: 8, id: "culture",    name: "Systemic Execution Culture",   sub: "System > individual",   color: "#ec4899", rgb: [236, 72, 153], kpi: "System continuity across leadership transition" },
];

/* ─── math helpers ─── */
type V3 = [number, number, number];
const rX = (y: number, z: number, a: number): [number, number] => [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const proj = (v: V3, cx: number, cy: number, f: number): [number, number, number] => {
  const s = f / (f + v[2]);
  return [cx + v[0] * s, cy + v[1] * s, s];
};
function projectFloor(x: number, z: number, tiltX: number, cx: number, cy: number, focal: number): [number, number] {
  const [y2, z2] = rX(0, z, tiltX);
  const [px, py] = proj([x, y2, z2], cx, cy, focal);
  return [px, py];
}

const BUCKET_ANGLE: Record<BucketId, { start: number; end: number; mid: number }> = {
  decide:  { start: -Math.PI,       end: -Math.PI / 2,  mid: -Math.PI * 3 / 4 },
  coord:   { start: -Math.PI / 2,   end: 0,             mid: -Math.PI / 4     },
  exec:    { start: 0,              end: Math.PI / 2,   mid: Math.PI / 4      },
  measure: { start: Math.PI / 2,    end: Math.PI,       mid: Math.PI * 3 / 4  },
};

const OP_TEMPLATES = [
  { service: "CMD-Conductor",      verb: "cycle",              ms: 42 },
  { service: "Officer-Dispatcher", verb: "dispatch",           ms: 380 },
  { service: "Gate-Watcher",       verb: "scan",               ms: 55 },
  { service: "StratOS-Runner",     verb: "round-3 complete",   ms: 2100 },
  { service: "LinkUpOS-Signal",    verb: "packet → apollo",    ms: 120 },
  { service: "LucidORG · ECI",     verb: "lever eval",         ms: 340 },
  { service: "Playbook-Briefing",  verb: "morning dispatch",   ms: 180 },
  { service: "ABM-Engine",         verb: "wave → target 3/28", ms: 260 },
  { service: "AutoCS · CS-Issues", verb: "trigger → cmd_tasks",ms: 65 },
  { service: "Officer · quality",  verb: "G3 sign-off",        ms: 420 },
  { service: "Officer · security", verb: "risk review",        ms: 510 },
  { service: "Officer · research", verb: "perplexity fetch",   ms: 890 },
  { service: "cmd_routing_log",    verb: "write",              ms: 18 },
  { service: "cmd_secrets · RPC",  verb: "get-secret",         ms: 9 },
  { service: "Education · OB 301", verb: "lesson dispatch",    ms: 140 },
];

export default function ConsoleGraphic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [hoveredDomain, setHoveredDomain] = useState<number | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const domainHitRef = useRef<{ n: number; x: number; y: number; r: number }[]>([]);
  const productHitRef = useRef<{ id: string; x: number; y: number; r: number }[]>([]);

  const [opsLog, setOpsLog] = useState<{ t: number; tpl: typeof OP_TEMPLATES[0]; id: number }[]>([]);
  const opsIdRef = useRef(0);

  const bucketKPI = useMemo(() => ({
    decide:  { label: "RUNS / 24H",         val: 12,  max: 20 },
    coord:   { label: "OFFICER CALLS / HR", val: 38,  max: 60 },
    exec:    { label: "SIGNALS / HR",       val: 142, max: 200 },
    measure: { label: "ECI · AVG",          val: 712, max: 1000 },
  }), []);

  useEffect(() => {
    const id = setInterval(() => {
      const tpl = OP_TEMPLATES[Math.floor(Math.random() * OP_TEMPLATES.length)];
      opsIdRef.current++;
      setOpsLog((prev) => [
        { t: Date.now(), tpl, id: opsIdRef.current },
        ...prev,
      ].slice(0, 8));
    }, 900);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px"; canvas.style.height = rect.height + "px";
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!);

    const start = performance.now();
    const TRACER_COL: Rgb = [200, 215, 240];
    const ringTracers = [
      { ring: 1 as const, angle: 0,                 speed: 0.012, color: TRACER_COL },
      { ring: 1 as const, angle: Math.PI * 2 / 3,   speed: 0.012, color: TRACER_COL },
      { ring: 1 as const, angle: Math.PI * 4 / 3,   speed: 0.012, color: TRACER_COL },
      { ring: 2 as const, angle: Math.PI / 2,       speed: -0.016, color: TRACER_COL },
      { ring: 3 as const, angle: 0,                 speed: 0.022, color: TRACER_COL },
    ];

    type Packet = { from: string; to: string; progress: number; color: Rgb; speed: number };
    const packets: Packet[] = [];
    let packetSpawn = 0;

    const blips: { angle: number; life: number; color: Rgb }[] = [];
    let lastBlip = 0;

    const dustSeeds = Array.from({ length: 200 }, (_, i) => ({
      i,
      seedX: ((i * 97 + 13) % 2200) - 1100,
      seedY: ((i * 53 + 31) % 1500) - 750,
      delay: (i % 19) / 24,
    }));

    const render = () => {
      const now = performance.now();
      const t = now - start;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2 + 10;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const shortSide = Math.min(w, h);
      const R_OUTER = shortSide * 0.46;
      const R_BUCKET = R_OUTER * 0.76;
      const R_PRODUCT = R_OUTER * 0.50;
      const R_DOMAIN = R_OUTER * 0.24;
      const FOCAL = 2400;
      const TILT = 0.42;
      const SPIN = t * 0.00003;

      const T_DUST = 1600;
      const T_TOTAL = 4800;

      if (t < T_DUST) {
        const pct = t / T_DUST;
        for (const d of dustSeeds) {
          const targetAngle = (d.i / dustSeeds.length) * Math.PI * 2;
          const [tx, ty] = projectFloor(Math.cos(targetAngle) * R_OUTER, Math.sin(targetAngle) * R_OUTER, TILT, cx, cy, FOCAL);
          const local = Math.max(0, Math.min(1, (pct - d.delay) * 1.5));
          const e = 1 - Math.pow(1 - local, 3);
          const px = d.seedX + (tx - d.seedX) * e;
          const py = d.seedY + (ty - d.seedY) * e;
          ctx.fillStyle = `rgba(139,92,246,${0.1 + e * 0.45})`;
          ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2); ctx.fill();
        }
      }

      /* Slow radar sweep */
      {
        const sweepT = (t / 7000) % 1;
        const aStart = sweepT * Math.PI * 2 - Math.PI / 8;
        const aEnd = aStart + Math.PI / 4;
        const segs = 28;
        const [c0x, c0y] = projectFloor(0, 0, TILT, cx, cy, FOCAL);
        ctx.beginPath();
        ctx.moveTo(c0x, c0y);
        for (let i = 0; i <= segs; i++) {
          const a = aStart + (aEnd - aStart) * (i / segs);
          const [px, py] = projectFloor(Math.cos(a) * R_OUTER * 1.02, Math.sin(a) * R_OUTER * 1.02, TILT, cx, cy, FOCAL);
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        const g = ctx.createRadialGradient(c0x, c0y, 10, c0x, c0y, R_OUTER);
        g.addColorStop(0, "rgba(180,200,240,0.04)");
        g.addColorStop(1, "rgba(180,200,240,0)");
        ctx.fillStyle = g;
        ctx.fill();
      }

      /* Fine radial grid */
      ctx.strokeStyle = "rgba(139,92,246,0.06)";
      ctx.lineWidth = 0.4;
      for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        const [p1x, p1y] = projectFloor(Math.cos(a) * R_DOMAIN * 1.05, Math.sin(a) * R_DOMAIN * 1.05, TILT, cx, cy, FOCAL);
        const [p2x, p2y] = projectFloor(Math.cos(a) * R_OUTER, Math.sin(a) * R_OUTER, TILT, cx, cy, FOCAL);
        ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke();
      }
      for (let k = 0; k < 5; k++) {
        const r = R_DOMAIN + ((R_OUTER - R_DOMAIN) * k) / 4;
        ctx.strokeStyle = `rgba(139,92,246,0.04)`;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        const segs = 80;
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          const [px, py] = projectFloor(Math.cos(a) * r, Math.sin(a) * r, TILT, cx, cy, FOCAL);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      /* Floor pad */
      const floorPadAppear = Math.min(1, Math.max(0, (t - T_DUST * 0.6) / 600));
      if (floorPadAppear > 0.02) {
        const segs = 72;
        ctx.beginPath();
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          const [px, py] = projectFloor(Math.cos(a) * R_OUTER, Math.sin(a) * R_OUTER, TILT, cx, cy, FOCAL);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        const gradR = ctx.createRadialGradient(cx, cy + 6, 8, cx, cy + 6, R_OUTER * 0.9);
        gradR.addColorStop(0, `rgba(139,92,246,${0.12 * floorPadAppear})`);
        gradR.addColorStop(0.7, `rgba(139,92,246,${0.04 * floorPadAppear})`);
        gradR.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradR; ctx.fill();
      }

      const drawRing = (r: number, color: string, alpha: number, lw = 1, dash?: [number, number]) => {
        ctx.strokeStyle = `rgba(${color}, ${alpha})`;
        ctx.lineWidth = lw;
        if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
        ctx.beginPath();
        const segs = 80;
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          const [px, py] = projectFloor(Math.cos(a) * r, Math.sin(a) * r, TILT, cx, cy, FOCAL);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      };

      /* R1 · GOVERNANCE perimeter */
      const govAppear = Math.min(1, Math.max(0, (t - T_DUST * 0.7) / (T_TOTAL / 4)));
      if (govAppear > 0.02) {
        drawRing(R_OUTER,         "245,158,11", 0.6 * govAppear, 1.2);
        drawRing(R_OUTER * 0.955, "245,158,11", 0.22 * govAppear, 0.5, [3, 3]);

        let officerIdx = 0;
        for (let ci = 0; ci < GOVERNANCE.categories.length; ci++) {
          const cat = GOVERNANCE.categories[ci];
          const aStart = (ci / 8) * Math.PI * 2 - Math.PI / 2 + SPIN;
          const aEnd = ((ci + 1) / 8) * Math.PI * 2 - Math.PI / 2 + SPIN;

          const [dx1, dy1] = projectFloor(Math.cos(aStart) * R_OUTER * 0.94, Math.sin(aStart) * R_OUTER * 0.94, TILT, cx, cy, FOCAL);
          const [dx2, dy2] = projectFloor(Math.cos(aStart) * R_OUTER * 1.03, Math.sin(aStart) * R_OUTER * 1.03, TILT, cx, cy, FOCAL);
          ctx.strokeStyle = `rgba(245,158,11, ${0.6 * govAppear})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(dx1, dy1); ctx.lineTo(dx2, dy2); ctx.stroke();

          for (let d = 0; d < cat.count; d++) {
            const a = aStart + (d + 0.5) / cat.count * (aEnd - aStart);
            const [px, py] = projectFloor(Math.cos(a) * R_OUTER * 0.985, Math.sin(a) * R_OUTER * 0.985, TILT, cx, cy, FOCAL);
            const appear = Math.min(1, Math.max(0, govAppear * 2 - officerIdx * 0.006));
            const glow = ctx.createRadialGradient(px, py, 0, px, py, 4);
            glow.addColorStop(0, `rgba(245,158,11, ${0.18 * appear})`);
            glow.addColorStop(1, `rgba(245,158,11, 0)`);
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgba(245,158,11, ${0.75 * appear})`;
            ctx.beginPath(); ctx.arc(px, py, 1.3, 0, Math.PI * 2); ctx.fill();
            officerIdx++;
          }

          const aMid = (aStart + aEnd) / 2;
          const labelR = R_OUTER * 1.11;
          const [lx, ly] = projectFloor(Math.cos(aMid) * labelR, Math.sin(aMid) * labelR, TILT, cx, cy, FOCAL);
          ctx.save();
          ctx.font = `600 9px "JetBrains Mono", monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(255,255,255, ${0.78 * govAppear})`;
          ctx.shadowBlur = 0;
          ctx.fillText(cat.name.toUpperCase(), lx, ly - 5);
          ctx.font = `500 8px "JetBrains Mono", monospace`;
          ctx.fillStyle = `rgba(245,158,11, ${0.6 * govAppear})`;
          ctx.fillText(`${cat.count} officers`, lx, ly + 6);
          ctx.restore();
        }

        const gateAppear = Math.min(1, Math.max(0, govAppear * 2 - 0.4));
        GOVERNANCE.gates.forEach((gate, gi) => {
          const a = (gi / 3) * Math.PI * 2 - Math.PI / 2 + SPIN;
          const r = R_OUTER * 1.04;
          const [px, py] = projectFloor(Math.cos(a) * r, Math.sin(a) * r, TILT, cx, cy, FOCAL);
          const size = 14 * gateAppear;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(a + Math.PI / 2);
          ctx.strokeStyle = `rgba(245,158,11, ${0.85 * gateAppear})`;
          ctx.fillStyle = `rgba(245,158,11, ${0.14 * gateAppear})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.rect(-size, -size / 2, size * 2, size);
          ctx.fill(); ctx.stroke();
          ctx.font = `700 9px Inter, sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(255,255,255, 0.9)";
          ctx.fillText(gate.name.split(" ")[0], 0, 0);
          ctx.restore();
        });
      }

      /* R2 · BUCKET quadrants */
      const bucketAppear = Math.min(1, Math.max(0, (t - T_DUST - 400) / 1100));
      if (bucketAppear > 0.02) {
        drawRing(R_BUCKET,        "139,92,246", 0.3 * bucketAppear, 0.8);
        drawRing(R_BUCKET * 0.92, "139,92,246", 0.12 * bucketAppear, 0.4, [2, 3]);

        for (let qi = 0; qi < 4; qi++) {
          const a = -Math.PI + qi * (Math.PI / 2);
          const [p1x, p1y] = projectFloor(Math.cos(a) * R_DOMAIN * 1.3, Math.sin(a) * R_DOMAIN * 1.3, TILT, cx, cy, FOCAL);
          const [p2x, p2y] = projectFloor(Math.cos(a) * R_OUTER * 0.94, Math.sin(a) * R_OUTER * 0.94, TILT, cx, cy, FOCAL);
          ctx.strokeStyle = `rgba(180,200,255, ${0.14 * bucketAppear})`;
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke();
          ctx.setLineDash([]);
        }

        for (const b of BUCKETS) {
          const ang = BUCKET_ANGLE[b.id];
          const aMid = ang.mid;
          const isRelated = hoveredDomain !== null && PRODUCTS.some((p) => p.domains.includes(hoveredDomain) && p.bucket === b.id);
          const isRelatedProd = hoveredProduct !== null && PRODUCTS.find((p) => p.id === hoveredProduct)?.bucket === b.id;
          const dimmed = (hoveredDomain !== null && !isRelated) || (hoveredProduct !== null && !isRelatedProd);
          const emphasis = isRelated || isRelatedProd;

          const segs = 32;
          ctx.beginPath();
          for (let i = 0; i <= segs; i++) {
            const a = ang.start + (ang.end - ang.start) * (i / segs);
            const [px, py] = projectFloor(Math.cos(a) * R_BUCKET, Math.sin(a) * R_BUCKET, TILT, cx, cy, FOCAL);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          for (let i = segs; i >= 0; i--) {
            const a = ang.start + (ang.end - ang.start) * (i / segs);
            const [px, py] = projectFloor(Math.cos(a) * R_PRODUCT * 1.06, Math.sin(a) * R_PRODUCT * 1.06, TILT, cx, cy, FOCAL);
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          const [mcx, mcy] = projectFloor(Math.cos(aMid) * (R_PRODUCT + R_BUCKET) / 2, Math.sin(aMid) * (R_PRODUCT + R_BUCKET) / 2, TILT, cx, cy, FOCAL);
          const grad = ctx.createRadialGradient(mcx, mcy, 4, mcx, mcy, 220);
          const baseOp = dimmed ? 0.3 : emphasis ? 1 : 0.65;
          grad.addColorStop(0, `rgba(${b.rgb.join(",")}, ${0.28 * baseOp * bucketAppear})`);
          grad.addColorStop(1, `rgba(${b.rgb.join(",")}, ${0.04 * baseOp * bucketAppear})`);
          ctx.fillStyle = grad; ctx.fill();
          ctx.strokeStyle = `rgba(${b.rgb.join(",")}, ${(emphasis ? 1 : 0.55) * bucketAppear * (dimmed ? 0.3 : 1)})`;
          ctx.lineWidth = emphasis ? 1.5 : 0.85;
          ctx.stroke();

          const [lx, ly] = projectFloor(Math.cos(aMid) * R_BUCKET * 0.88, Math.sin(aMid) * R_BUCKET * 0.88, TILT, cx, cy, FOCAL);
          ctx.save();
          ctx.font = `700 13px Inter, sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${b.rgb.join(",")}, ${baseOp * bucketAppear})`;
          ctx.shadowColor = b.color; ctx.shadowBlur = emphasis ? 5 : 0;
          ctx.fillText(b.name.toUpperCase(), lx, ly - 6);
          ctx.restore();
          ctx.save();
          ctx.font = `500 7px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.fillStyle = `rgba(255,255,255, ${(dimmed ? 0.3 : 0.55) * bucketAppear})`;
          ctx.fillText(`${b.n} · ${b.breaks.toLowerCase()}`, lx, ly + 8);
          ctx.restore();

          const kpi = bucketKPI[b.id];
          const dialR = 14;
          const [dx, dy] = projectFloor(Math.cos(aMid) * R_BUCKET * 1.02, Math.sin(aMid) * R_BUCKET * 1.02, TILT, cx, cy, FOCAL);
          ctx.beginPath();
          ctx.arc(dx, dy, dialR, Math.PI, Math.PI * 2, false);
          ctx.strokeStyle = `rgba(${b.rgb.join(",")}, ${0.25 * bucketAppear})`;
          ctx.lineWidth = 2.4;
          ctx.stroke();
          const fillFrac = Math.min(1, kpi.val / kpi.max);
          ctx.beginPath();
          ctx.arc(dx, dy, dialR, Math.PI, Math.PI + Math.PI * fillFrac, false);
          ctx.strokeStyle = `rgba(${b.rgb.join(",")}, ${0.9 * bucketAppear})`;
          ctx.lineWidth = 2.4;
          ctx.stroke();
          ctx.save();
          ctx.font = `700 9px "JetBrains Mono", monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${b.rgb.join(",")}, ${bucketAppear})`;
          ctx.shadowColor = b.color; ctx.shadowBlur = 4;
          ctx.fillText(String(kpi.val), dx, dy - 4);
          ctx.restore();
          ctx.save();
          ctx.font = `500 6px "JetBrains Mono", monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(255,255,255, ${0.55 * bucketAppear})`;
          ctx.fillText(kpi.label, dx, dy + 6);
          ctx.restore();
        }
      }

      /* Activity blips */
      if (bucketAppear > 0.5 && now - lastBlip > 220) {
        lastBlip = now;
        const b = BUCKETS[Math.floor(Math.random() * BUCKETS.length)];
        const ang = BUCKET_ANGLE[b.id];
        blips.push({ angle: ang.start + Math.random() * (ang.end - ang.start), life: 1, color: b.rgb });
      }
      for (let i = blips.length - 1; i >= 0; i--) {
        const bl = blips[i];
        bl.life -= 0.014;
        if (bl.life <= 0) { blips.splice(i, 1); continue; }
        const [px, py] = projectFloor(Math.cos(bl.angle) * R_BUCKET, Math.sin(bl.angle) * R_BUCKET, TILT, cx, cy, FOCAL);
        const size = 2 + (1 - bl.life) * 4;
        const alpha = bl.life * 0.45;
        const g = ctx.createRadialGradient(px, py, 0, px, py, size * 2);
        g.addColorStop(0, `rgba(${bl.color.join(",")}, ${alpha})`);
        g.addColorStop(1, `rgba(${bl.color.join(",")}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, size * 2, 0, Math.PI * 2); ctx.fill();
      }

      /* R3 · PRODUCT discs */
      const prodAppear = Math.min(1, Math.max(0, (t - T_DUST - 1000) / 1100));
      if (prodAppear > 0.02) {
        drawRing(R_PRODUCT * 1.06, "180,200,255", 0.1 * prodAppear, 0.4, [2, 3]);
        drawRing(R_PRODUCT * 0.88, "180,200,255", 0.1 * prodAppear, 0.4, [2, 3]);
      }

      productHitRef.current = [];
      const byBucket: Record<BucketId, Product[]> = { decide: [], coord: [], exec: [], measure: [] };
      PRODUCTS.forEach((p) => byBucket[p.bucket].push(p));
      const productScreen = new Map<string, [number, number]>();

      for (const b of BUCKETS) {
        const ang = BUCKET_ANGLE[b.id];
        const group = byBucket[b.id];
        const n = group.length;
        group.forEach((p, i) => {
          const frac = (i + 1) / (n + 1);
          const a = ang.start + (ang.end - ang.start) * frac + SPIN;
          const r = R_PRODUCT * 0.97;
          const [px, py] = projectFloor(Math.cos(a) * r, Math.sin(a) * r, TILT, cx, cy, FOCAL);
          productScreen.set(p.id, [px, py]);

          const isHoverProd = hoveredProduct === p.id;
          const isRelated = hoveredDomain !== null && p.domains.includes(hoveredDomain);
          const dimmed = (hoveredDomain !== null && !isRelated) || (hoveredProduct !== null && !isHoverProd);
          const emphasis = isHoverProd || isRelated;

          const haloR = (emphasis ? 22 : 16) * prodAppear;
          const baseA = dimmed ? 0.10 : emphasis ? 0.55 : 0.22;
          const g = ctx.createRadialGradient(px, py, 0, px, py, haloR);
          g.addColorStop(0, `rgba(${p.rgb.join(",")}, ${baseA * prodAppear})`);
          g.addColorStop(1, `rgba(${p.rgb.join(",")}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(px, py, haloR, 0, Math.PI * 2); ctx.fill();

          const coreR = (emphasis ? 11 : 9) * prodAppear;
          ctx.beginPath(); ctx.arc(px, py, coreR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.rgb.join(",")}, ${(emphasis ? 0.28 : 0.14) * prodAppear})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${p.rgb.join(",")}, ${(emphasis ? 0.95 : 0.65) * prodAppear * (dimmed ? 0.5 : 1)})`;
          ctx.lineWidth = emphasis ? 1.3 : 0.85;
          ctx.stroke();

          ctx.save();
          ctx.font = `800 ${emphasis ? 13 : 11}px Inter, sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${p.rgb.join(",")}, ${(dimmed ? 0.4 : emphasis ? 1 : 0.82) * prodAppear})`;
          ctx.shadowColor = p.color; ctx.shadowBlur = emphasis ? 6 : 0;
          ctx.fillText(p.icon, px, py);
          ctx.restore();

          const nameR = R_PRODUCT * 1.19;
          const [nx, ny] = projectFloor(Math.cos(a) * nameR, Math.sin(a) * nameR, TILT, cx, cy, FOCAL);
          ctx.save();
          ctx.font = `700 9px "JetBrains Mono", monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${p.rgb.join(",")}, ${(dimmed ? 0.4 : 0.95) * prodAppear})`;
          ctx.fillText(p.name, nx, ny);
          ctx.restore();

          p.domains.forEach((dn, di) => {
            const offset = (di - (p.domains.length - 1) / 2) * 9;
            const bxx = px + offset;
            const byy = py + coreR + 9;
            const isHoverDom = hoveredDomain === dn;
            ctx.save();
            ctx.font = `700 7px "JetBrains Mono", monospace`;
            ctx.textAlign = "center";
            ctx.fillStyle = `rgba(${p.rgb.join(",")}, ${(isHoverDom ? 1 : 0.4) * (dimmed ? 0.35 : 1) * prodAppear})`;
            ctx.fillText(String(dn), bxx, byy);
            ctx.restore();
          });

          productHitRef.current.push({ id: p.id, x: px, y: py, r: coreR + 8 });
        });
      }

      /* R4 · DOMAIN spokes */
      const domAppear = Math.min(1, Math.max(0, (t - T_DUST - 2000) / 900));
      if (domAppear > 0.02) {
        drawRing(R_DOMAIN * 1.1, "180,200,240", 0.22 * domAppear, 0.7);
        drawRing(R_DOMAIN * 0.7, "180,200,240", 0.10 * domAppear, 0.4, [2, 3]);
        const [ccx, ccy] = projectFloor(0, 0, TILT, cx, cy, FOCAL);
        ctx.beginPath(); ctx.arc(ccx, ccy, 22 * domAppear, 0, Math.PI * 2);
        const gg = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, 28);
        gg.addColorStop(0, `rgba(236,72,153, ${0.18 * domAppear})`);
        gg.addColorStop(1, `rgba(236,72,153, 0)`);
        ctx.fillStyle = gg; ctx.fill();
      }

      domainHitRef.current = [];
      DOMAINS.forEach((d, i) => {
        const a = (i / DOMAINS.length) * Math.PI * 2 - Math.PI / 2 + SPIN;
        const [sx1, sy1] = projectFloor(Math.cos(a) * 6, Math.sin(a) * 6, TILT, cx, cy, FOCAL);
        const [sx2, sy2] = projectFloor(Math.cos(a) * R_DOMAIN, Math.sin(a) * R_DOMAIN, TILT, cx, cy, FOCAL);

        const isHover = hoveredDomain === d.n;
        const dimmed = hoveredDomain !== null && !isHover;
        const appearI = Math.min(1, Math.max(0, domAppear - i * 0.04) * 1.5);

        ctx.strokeStyle = `rgba(${d.rgb.join(",")}, ${(isHover ? 1 : 0.65) * (dimmed ? 0.3 : 1) * appearI})`;
        ctx.lineWidth = isHover ? 2.2 : 1.1;
        ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2); ctx.stroke();

        const [bpx, bpy] = projectFloor(Math.cos(a) * R_DOMAIN * 1.08, Math.sin(a) * R_DOMAIN * 1.08, TILT, cx, cy, FOCAL);
        const badgeR = (isHover ? 11 : 8.5) * appearI;

        const g2 = ctx.createRadialGradient(bpx, bpy, 0, bpx, bpy, badgeR * 2);
        g2.addColorStop(0, `rgba(${d.rgb.join(",")}, ${(isHover ? 0.42 : 0.16) * appearI})`);
        g2.addColorStop(1, `rgba(${d.rgb.join(",")}, 0)`);
        ctx.fillStyle = g2;
        ctx.beginPath(); ctx.arc(bpx, bpy, badgeR * 2, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath(); ctx.arc(bpx, bpy, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.rgb.join(",")}, ${(isHover ? 0.6 : 0.28) * (dimmed ? 0.3 : 1) * appearI})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${d.rgb.join(",")}, ${(dimmed ? 0.3 : 0.85) * appearI})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();

        ctx.save();
        ctx.font = `700 ${isHover ? 11 : 9.5}px Inter, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(255,255,255, ${(dimmed ? 0.45 : 0.92) * appearI})`;
        ctx.shadowColor = d.color; ctx.shadowBlur = isHover ? 5 : 0;
        ctx.fillText(String(d.n), bpx, bpy);
        ctx.restore();

        domainHitRef.current.push({ n: d.n, x: bpx, y: bpy, r: badgeR + 10 });
      });

      if (domAppear > 0.5) {
        const [ccx, ccy] = projectFloor(0, 0, TILT, cx, cy, FOCAL);
        ctx.save();
        ctx.font = `700 9px "JetBrains Mono", monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(255,255,255, ${0.85 * domAppear})`;
        ctx.fillText("CORE", ccx, ccy - 4);
        ctx.font = `500 7px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(255,255,255, ${0.45 * domAppear})`;
        ctx.fillText("8 DOMAINS", ccx, ccy + 6);
        ctx.restore();
      }

      /* Ring tracers */
      if (govAppear > 0.3) {
        for (const tr of ringTracers) {
          tr.angle += tr.speed;
          const ringR = tr.ring === 1 ? R_OUTER * 0.985 : tr.ring === 2 ? R_BUCKET : R_DOMAIN * 1.08;
          const [px, py] = projectFloor(Math.cos(tr.angle) * ringR, Math.sin(tr.angle) * ringR, TILT, cx, cy, FOCAL);
          const glow = ctx.createRadialGradient(px, py, 0, px, py, 6);
          glow.addColorStop(0, `rgba(${tr.color.join(",")}, 0.35)`);
          glow.addColorStop(1, `rgba(${tr.color.join(",")}, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.beginPath(); ctx.arc(px, py, 1.1, 0, Math.PI * 2); ctx.fill();
        }
      }

      /* Ambient cross-core packets */
      if (domAppear > 0.5 && now - packetSpawn > 240) {
        packetSpawn = now;
        const from = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const candidates = PRODUCTS.filter((x) => x.id !== from.id);
        const to = candidates[Math.floor(Math.random() * candidates.length)];
        packets.push({ from: from.id, to: to.id, progress: 0, color: from.rgb, speed: 0.012 + Math.random() * 0.008 });
      }
      for (let pi = packets.length - 1; pi >= 0; pi--) {
        const pk = packets[pi];
        pk.progress += pk.speed;
        if (pk.progress >= 1) { packets.splice(pi, 1); continue; }
        const fromP = productScreen.get(pk.from);
        const toP = productScreen.get(pk.to);
        if (!fromP || !toP) { packets.splice(pi, 1); continue; }
        const [fx, fy] = fromP;
        const [tx, ty] = toP;
        const [cxP, cyP] = projectFloor(0, 0, TILT, cx, cy, FOCAL);
        const a = pk.progress;
        const px = Math.pow(1 - a, 2) * fx + 2 * (1 - a) * a * cxP + a * a * tx;
        const py = Math.pow(1 - a, 2) * fy + 2 * (1 - a) * a * cyP + a * a * ty;
        const pAlpha = 0.75 * (1 - Math.abs(a - 0.5) * 1.5);
        const g = ctx.createRadialGradient(px, py, 0, px, py, 9);
        g.addColorStop(0, `rgba(${pk.color.join(",")}, ${Math.max(0, pAlpha)})`);
        g.addColorStop(1, `rgba(${pk.color.join(",")}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255, ${Math.max(0, pAlpha * 0.9)})`;
        ctx.beginPath(); ctx.arc(px, py, 1.3, 0, Math.PI * 2); ctx.fill();
      }

      /* Chain highlight on hovered domain */
      if (hoveredDomain !== null) {
        const d = DOMAINS.find((x) => x.n === hoveredDomain)!;
        const domHit = domainHitRef.current.find((x) => x.n === hoveredDomain);
        const servingProducts = PRODUCTS.filter((p) => p.domains.includes(hoveredDomain));
        if (domHit) {
          for (const sp of servingProducts) {
            const prodHit = productHitRef.current.find((x) => x.id === sp.id);
            if (!prodHit) continue;
            const midX = (domHit.x + prodHit.x) / 2;
            const midY = (domHit.y + prodHit.y) / 2;
            ctx.strokeStyle = `rgba(${d.rgb.join(",")}, 0.75)`;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(domHit.x, domHit.y);
            ctx.quadraticCurveTo(midX, midY, prodHit.x, prodHit.y);
            ctx.stroke();
            ctx.strokeStyle = `rgba(${d.rgb.join(",")}, 0.22)`;
            ctx.lineWidth = 6;
            ctx.stroke();
            const pulseT = ((t / 900) + servingProducts.indexOf(sp) * 0.18) % 1;
            const tt = pulseT;
            const pxp = (1 - tt) * (1 - tt) * domHit.x + 2 * (1 - tt) * tt * midX + tt * tt * prodHit.x;
            const pyp = (1 - tt) * (1 - tt) * domHit.y + 2 * (1 - tt) * tt * midY + tt * tt * prodHit.y;
            const gg = ctx.createRadialGradient(pxp, pyp, 0, pxp, pyp, 11);
            gg.addColorStop(0, `rgba(${d.rgb.join(",")}, 0.95)`);
            gg.addColorStop(1, `rgba(${d.rgb.join(",")}, 0)`);
            ctx.fillStyle = gg;
            ctx.beginPath(); ctx.arc(pxp, pyp, 11, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(255,255,255, 0.95)";
            ctx.beginPath(); ctx.arc(pxp, pyp, 1.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      if (govAppear > 0.5) {
        const ticks = [{ a: -Math.PI / 2, l: "N" }, { a: 0, l: "E" }, { a: Math.PI / 2, l: "S" }, { a: -Math.PI, l: "W" }];
        for (const tk of ticks) {
          const [px, py] = projectFloor(Math.cos(tk.a) * R_OUTER * 1.19, Math.sin(tk.a) * R_OUTER * 1.19, TILT, cx, cy, FOCAL);
          ctx.save();
          ctx.font = `600 9px "JetBrains Mono", monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(139,92,246, 0.28)`;
          ctx.fillText(tk.l, px, py);
          ctx.restore();
        }
      }

      /* hit-test */
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      let bestDom: number | null = null;
      let bestDomD = 22;
      for (const dh of domainHitRef.current) {
        const dd = Math.hypot(dh.x - mx, dh.y - my);
        if (dd < bestDomD) { bestDomD = dd; bestDom = dh.n; }
      }
      if (bestDom !== hoveredDomain) setHoveredDomain(bestDom);
      if (bestDom === null) {
        let bestProd: string | null = null;
        let bestProdD = 24;
        for (const ph of productHitRef.current) {
          const dd = Math.hypot(ph.x - mx, ph.y - my);
          if (dd < bestProdD) { bestProdD = dd; bestProd = ph.id; }
        }
        if (bestProd !== hoveredProduct) setHoveredProduct(bestProd);
      } else {
        if (hoveredProduct !== null) setHoveredProduct(null);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredDomain, hoveredProduct]);

  const domain = hoveredDomain !== null ? DOMAINS.find((d) => d.n === hoveredDomain) : null;
  const domainProducts = domain ? PRODUCTS.filter((p) => p.domains.includes(domain.n)) : [];
  const product = hoveredProduct !== null ? PRODUCTS.find((p) => p.id === hoveredProduct) : null;

  return (
    <div className="relative w-full" style={{ aspectRatio: "1.18 / 1" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        className="absolute inset-0 cursor-default"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; }}
      />

      {/* Live ops log */}
      <div className="absolute top-3 right-3 z-20 pointer-events-none w-64 max-w-[90%]">
        <div className="border border-violet-400/30 bg-black/75 backdrop-blur-sm px-3 py-2 font-mono"
          style={{ boxShadow: "0 10px 30px rgba(139,92,246,0.15)" }}>
          <div className="flex items-center justify-between text-[9px] tracking-[0.3em] uppercase text-violet-300/85 mb-1.5">
            <span>LIVE OPS</span>
            <span className="text-white/40">tail · {opsLog.length}</span>
          </div>
          <div className="space-y-[2px]">
            {opsLog.slice(0, 5).map((op) => (
              <div key={op.id} className="text-[9px] text-white/70 flex gap-2 items-baseline leading-snug">
                <span className="text-violet-400/60">›</span>
                <span className="text-white/85 flex-shrink-0 w-32 truncate">{op.tpl.service}</span>
                <span className="text-white/45 truncate">{op.tpl.verb}</span>
                <span className="text-white/30 flex-shrink-0 ml-auto">{op.tpl.ms}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover cards */}
      {domain && (
        <div className="absolute top-3 left-3 z-20 w-64 pointer-events-none">
          <div className="rounded-xl border p-4 backdrop-blur-md"
            style={{
              borderColor: `${domain.color}55`,
              background: `linear-gradient(135deg, rgba(0,0,0,0.92), ${domain.color}0d)`,
              boxShadow: `0 16px 50px ${domain.color}35`,
            }}>
            <div className="text-[9px] font-mono tracking-[0.35em] uppercase mb-1" style={{ color: domain.color }}>
              DOMAIN {domain.n}
            </div>
            <div className="text-base font-black text-white/95 leading-tight mb-1">{domain.name}</div>
            <div className="text-[10px] font-mono text-white/50 mb-3 italic">{domain.sub}</div>
            <div className="pt-3 border-t border-white/[0.08]">
              <div className="text-[9px] font-mono tracking-widest uppercase text-white/45 mb-1.5">
                served by {domainProducts.length} products
              </div>
              <div className="flex flex-wrap gap-1.5">
                {domainProducts.map((p) => (
                  <span key={p.id}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border"
                    style={{ borderColor: `${p.color}40`, color: `${p.color}dd`, background: `${p.color}08` }}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!domain && product && (
        <div className="absolute top-3 left-3 z-20 w-64 pointer-events-none">
          <div className="rounded-xl border p-4 backdrop-blur-md"
            style={{
              borderColor: `${product.color}55`,
              background: `linear-gradient(135deg, rgba(0,0,0,0.92), ${product.color}0d)`,
              boxShadow: `0 16px 50px ${product.color}35`,
            }}>
            <div className="text-[9px] font-mono tracking-[0.35em] uppercase mb-1" style={{ color: product.color }}>
              {product.sub}
            </div>
            <div className="text-base font-black text-white/95 leading-tight mb-2">{product.name}</div>
            <div className="text-[9px] font-mono uppercase tracking-wider mb-3" style={{ color: BUCKETS.find((b) => b.id === product.bucket)?.color }}>
              Bucket · {BUCKETS.find((b) => b.id === product.bucket)?.name}
            </div>
            <div className="space-y-1">
              {product.specs.map((s) => (
                <div key={s} className="text-[11px] font-mono text-white/70 flex gap-2 items-start">
                  <span style={{ color: product.color }}>›</span><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

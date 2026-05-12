"use client";
/**
 * CompoundingRiskWalkthrough
 * 7-scene scroll-controlled motion-graphic: "Why is multi-agent risky?"
 *
 * Scenes advance on scroll or auto-advance after 5s of inactivity.
 * Each scene has a real motion graphic as the message; captions are labels.
 * No em dashes. No banned phrases. No ElevenLabs voice.
 *
 * Scene 1: One agent — low error rate (dots pop ~20%)
 * Scene 2: Compounding — 5 agents added, error counter rises to 90%
 * Scene 3: Black box — chaos resolves into opaque cube, question marks
 * Scene 4: Hours and days — clock spins, patchwork fixes pile up
 * Scene 5: Agents catching agents — L9 chassis, watchers intercept errors
 * Scene 6: Flattening the curve — line chart, with vs without governance
 * Scene 7: CTA — L9 mark, two action buttons
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Brand colors ──────────────────────────────────────────────────────────────
const VIOLET = "#8b5cf6";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const SPRING = "cubic-bezier(0.16, 1, 0.3, 1)";

// ─── Scene 1: Single agent ─────────────────────────────────────────────────────

function Scene1({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const errorDots: { x: number; y: number; life: number; maxLife: number }[] = [];
    let lastError = 0;

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const now = performance.now() - startRef.current;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 - 20;

      // Agent circle
      const pulse = 0.94 + Math.sin(now * 0.002) * 0.06;
      const agentR = 42 * pulse;

      const agentGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, agentR * 1.6);
      agentGlow.addColorStop(0, `rgba(139,92,246,0.25)`);
      agentGlow.addColorStop(1, `rgba(139,92,246,0)`);
      ctx.fillStyle = agentGlow;
      ctx.beginPath(); ctx.arc(cx, cy, agentR * 1.6, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = VIOLET;
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(139,92,246,0.12)";
      ctx.beginPath(); ctx.arc(cx, cy, agentR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "700 14px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AGENT", cx, cy);

      // Spawn error dots ~20% rate (every ~5s)
      if (now - lastError > 4800 + Math.random() * 2000) {
        lastError = now;
        const angle = Math.random() * Math.PI * 2;
        const dist = agentR + 20 + Math.random() * 30;
        errorDots.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          life: 0,
          maxLife: 2200,
        });
      }

      // Draw and age error dots
      for (let i = errorDots.length - 1; i >= 0; i--) {
        const d = errorDots[i];
        d.life += 16;
        if (d.life > d.maxLife) { errorDots.splice(i, 1); continue; }
        const alpha = Math.min(1, d.life / 300) * (1 - d.life / d.maxLife);
        ctx.fillStyle = `rgba(239,68,68,${alpha * 0.85})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,200,200,${alpha * 0.6})`;
        ctx.font = "10px Inter,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("!", d.x, d.y);
      }

      // Error rate label
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "600 11px ui-monospace,monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("~20% error rate", cx, cy + agentR + 18);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", maxWidth: 340, height: 200, opacity: Math.min(1, progress * 4) }}
      />
    </div>
  );
}

// ─── Scene 2: Compounding agents ──────────────────────────────────────────────

function Scene2({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(performance.now());

  const agentCount = Math.min(5, Math.ceil(progress * 5));
  const errorRates = [20, 40, 60, 75, 90];
  const currentRate = errorRates[Math.min(agentCount - 1, 4)] ?? 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const errorDots: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    let lastSpawn = 0;
    const spawnInterval = Math.max(200, 1400 - agentCount * 220);

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const now = performance.now() - startRef.current;
      ctx.clearRect(0, 0, w, h);

      const positions: { x: number; y: number }[] = [];
      for (let i = 0; i < agentCount; i++) {
        const a = (i / Math.max(1, agentCount)) * Math.PI * 2 - Math.PI / 2;
        const r = agentCount === 1 ? 0 : 70;
        positions.push({ x: w / 2 + Math.cos(a) * r, y: h / 2 + Math.sin(a) * r });
      }

      // Spawn errors
      if (now - lastSpawn > spawnInterval) {
        lastSpawn = now;
        const src = positions[Math.floor(Math.random() * positions.length)];
        errorDots.push({
          x: src.x,
          y: src.y,
          vx: (Math.random() - 0.5) * 3.5,
          vy: (Math.random() - 0.5) * 3.5,
          life: 0,
        });
      }

      // Update and draw error dots
      for (let i = errorDots.length - 1; i >= 0; i--) {
        const d = errorDots[i];
        d.life++;
        d.x += d.vx; d.y += d.vy;
        if (d.life > 80 || d.x < 0 || d.x > w || d.y < 0 || d.y > h) { errorDots.splice(i, 1); continue; }
        const alpha = Math.min(1, d.life / 12) * (1 - d.life / 80);
        ctx.fillStyle = `rgba(239,68,68,${alpha})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, 4.5, 0, Math.PI * 2); ctx.fill();
      }

      // Agent circles
      positions.forEach((pos, idx) => {
        const delay = idx * 0.2;
        const pulse = 0.93 + Math.sin(now * 0.002 + delay) * 0.07;
        const r = 28 * pulse;
        const ag = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 1.5);
        ag.addColorStop(0, `rgba(139,92,246,0.2)`);
        ag.addColorStop(1, `rgba(139,92,246,0)`);
        ctx.fillStyle = ag;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.5, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = VIOLET;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = "rgba(139,92,246,0.1)";
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "600 9px Inter,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`A${idx + 1}`, pos.x, pos.y);
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
    // spawnInterval is derived from agentCount; only agentCount matters as dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentCount]);

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <div style={{
        display: "inline-block",
        padding: "0.3rem 0.75rem",
        borderRadius: 8,
        background: `rgba(239,68,68,0.12)`,
        border: `1px solid rgba(239,68,68,0.3)`,
        fontSize: "0.9rem",
        fontWeight: 800,
        color: RED,
        fontVariantNumeric: "tabular-nums",
        fontFamily: "ui-monospace,monospace",
        marginBottom: "0.5rem",
        transition: "color 0.4s",
      }}>
        Combined error rate: {currentRate}%
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", maxWidth: 360, height: 200, display: "block", margin: "0 auto" }}
      />
      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontFamily: "ui-monospace,monospace", marginTop: "0.35rem" }}>
        {agentCount} agent{agentCount !== 1 ? "s" : ""} active
      </div>
    </div>
  );
}

// ─── Scene 3: Black box ────────────────────────────────────────────────────────

function Scene3({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    // Question mark positions orbiting the box
    const qmarks = Array.from({ length: 6 }, (_, i) => ({
      angle: (i / 6) * Math.PI * 2,
      radius: 80,
      phase: (i / 6) * Math.PI * 2,
    }));

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const now = (performance.now() - startRef.current) / 1000;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const boxSize = 68;

      // Black box
      ctx.fillStyle = "rgba(10,10,20,0.95)";
      ctx.strokeStyle = `rgba(239,68,68,0.5)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize);
      ctx.fill(); ctx.stroke();

      // Grid lines inside box (redacted feel)
      ctx.strokeStyle = `rgba(239,68,68,0.1)`;
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        const x = cx - boxSize / 2 + (boxSize / 4) * i;
        ctx.beginPath(); ctx.moveTo(x, cy - boxSize / 2); ctx.lineTo(x, cy + boxSize / 2); ctx.stroke();
        const y = cy - boxSize / 2 + (boxSize / 4) * i;
        ctx.beginPath(); ctx.moveTo(cx - boxSize / 2, y); ctx.lineTo(cx + boxSize / 2, y); ctx.stroke();
      }

      // "?" marks orbiting
      qmarks.forEach((qm) => {
        const a = qm.angle + now * 0.4;
        const r = qm.radius + Math.sin(now * 1.2 + qm.phase) * 8;
        const qx = cx + Math.cos(a) * r;
        const qy = cy + Math.sin(a) * r;
        const alpha = 0.5 + Math.sin(now * 2.1 + qm.phase) * 0.3;
        ctx.fillStyle = `rgba(239,68,68,${alpha})`;
        ctx.font = "700 16px Inter,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", qx, qy);
      });

      // Debugger figure trying to peer in — small magnifier icon
      const debugX = cx + boxSize / 2 + 28;
      const debugY = cy;
      ctx.strokeStyle = `rgba(245,158,11,0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(debugX - 4, debugY - 4, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(debugX + 3, debugY + 3); ctx.lineTo(debugX + 10, debugY + 10); ctx.stroke();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const op = Math.min(1, progress * 3);
  return (
    <div style={{ width: "100%", textAlign: "center", opacity: op }}>
      <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 320, height: 200, display: "block", margin: "0 auto" }} />
    </div>
  );
}

// ─── Scene 4: Hours and days ───────────────────────────────────────────────────

function Scene4({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const patches: { x: number; y: number; w: number; h: number; born: number; broken: boolean }[] = [];
    let lastPatch = 0;

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const now = performance.now() - startRef.current;
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.45;

      // Clock face
      ctx.strokeStyle = `rgba(245,158,11,0.5)`;
      ctx.fillStyle = `rgba(245,158,11,0.05)`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      // Clock ticks
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r1 = 44; const r2 = 52;
        ctx.strokeStyle = `rgba(245,158,11,0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }

      // Hour hand (fast spin)
      const hourA = (t * 0.8) % (Math.PI * 2) - Math.PI / 2;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(hourA) * 34, cy + Math.sin(hourA) * 34);
      ctx.stroke();

      // Minute hand (very fast)
      const minA = (t * 6) % (Math.PI * 2) - Math.PI / 2;
      ctx.strokeStyle = `rgba(245,158,11,0.65)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(minA) * 44, cy + Math.sin(minA) * 44);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = AMBER;
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();

      // Patches spawning every ~1.8s
      if (now - lastPatch > 1800) {
        lastPatch = now;
        const px = cx - 110 + Math.random() * 200;
        const py = cy + 68 + Math.random() * 30;
        patches.push({ x: px, y: py, w: 40 + Math.random() * 50, h: 10 + Math.random() * 12, born: now, broken: false });
        if (patches.length > 7) patches.shift();
        // Random old patches break
        patches.forEach((p) => { if (Math.random() < 0.3) p.broken = true; });
      }

      // Draw patches
      patches.forEach((p) => {
        const age = (now - p.born) / 1000;
        const alpha = Math.min(1, age * 2);
        if (p.broken) {
          ctx.strokeStyle = `rgba(239,68,68,${alpha * 0.5})`;
          ctx.fillStyle = `rgba(239,68,68,${alpha * 0.08})`;
        } else {
          ctx.strokeStyle = `rgba(245,158,11,${alpha * 0.55})`;
          ctx.fillStyle = `rgba(245,158,11,${alpha * 0.1})`;
        }
        ctx.lineWidth = 1;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        if (p.broken) {
          ctx.fillStyle = `rgba(239,68,68,${alpha * 0.6})`;
          ctx.font = "7px ui-monospace,monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("FAIL", p.x + p.w / 2, p.y + p.h / 2);
        }
      });

      // Productivity meter (falling)
      const meterX = cx + 70;
      const meterY = cy - 40;
      const meterH = 80;
      const meterW = 16;
      const fill = Math.max(0.08, 0.85 - t * 0.045);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.fillRect(meterX, meterY, meterW, meterH);
      ctx.strokeRect(meterX, meterY, meterW, meterH);
      const fillColor = fill > 0.5 ? EMERALD : fill > 0.25 ? AMBER : RED;
      ctx.fillStyle = fillColor;
      ctx.fillRect(meterX, meterY + meterH * (1 - fill), meterW, meterH * fill);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "6px ui-monospace,monospace";
      ctx.textAlign = "center";
      ctx.fillText("PROD", meterX + meterW / 2, meterY - 6);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const op = Math.min(1, progress * 3);
  return (
    <div style={{ width: "100%", textAlign: "center", opacity: op }}>
      <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 320, height: 220, display: "block", margin: "0 auto" }} />
    </div>
  );
}

// ─── Scene 5: Agents catching agents ──────────────────────────────────────────

function Scene5({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const AGENT_COUNT = 5;
    const catches: { x: number; y: number; life: number }[] = [];
    let lastCatch = 0;

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const now = performance.now() - startRef.current;
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 + 10;

      // Central L9 governance ring
      const ringPulse = 0.92 + Math.sin(t * 1.8) * 0.08;
      ctx.strokeStyle = `rgba(239,68,68,0.45)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 28 * ringPulse, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(239,68,68,0.08)`;
      ctx.fill();
      ctx.fillStyle = `rgba(239,68,68,0.8)`;
      ctx.font = "700 9px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("L9", cx, cy);

      // 5 agents + watchers
      for (let i = 0; i < AGENT_COUNT; i++) {
        const angle = (i / AGENT_COUNT) * Math.PI * 2 - Math.PI / 2;
        const agX = cx + Math.cos(angle) * 88;
        const agY = cy + Math.sin(angle) * 88;

        // Governance spoke from L9 to watcher
        ctx.strokeStyle = `rgba(239,68,68,0.15)`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(agX, agY - 28); ctx.stroke();
        ctx.setLineDash([]);

        // Watcher agent (above main agent)
        const watcherY = agY - 26;
        ctx.strokeStyle = RED;
        ctx.fillStyle = `rgba(239,68,68,0.12)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(agX, watcherY, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = `rgba(239,68,68,0.8)`;
        ctx.font = "600 7px Inter,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("W", agX, watcherY);

        // Main agent
        const pulse = 0.93 + Math.sin(t * 1.5 + i) * 0.07;
        const r = 18 * pulse;
        ctx.strokeStyle = VIOLET;
        ctx.fillStyle = `rgba(139,92,246,0.1)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(agX, agY, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,0.7)`;
        ctx.font = `600 7px Inter,sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`A${i + 1}`, agX, agY);
      }

      // Catch events — error intercepted by watcher
      if (now - lastCatch > 900) {
        lastCatch = now;
        const idx = Math.floor(Math.random() * AGENT_COUNT);
        const angle = (idx / AGENT_COUNT) * Math.PI * 2 - Math.PI / 2;
        catches.push({
          x: cx + Math.cos(angle) * 88,
          y: cy + Math.sin(angle) * 88 - 26,
          life: 0,
        });
        if (catches.length > 5) catches.shift();
      }

      catches.forEach((c) => {
        c.life += 16;
        if (c.life > 1400) return;
        const a = Math.min(1, c.life / 300) * (1 - c.life / 1400);
        // Checkmark
        ctx.strokeStyle = `rgba(16,185,129,${a})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x - 7, c.y);
        ctx.lineTo(c.x - 2, c.y + 6);
        ctx.lineTo(c.x + 8, c.y - 6);
        ctx.stroke();
        // Glow
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 14);
        g.addColorStop(0, `rgba(16,185,129,${a * 0.4})`);
        g.addColorStop(1, `rgba(16,185,129,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(c.x, c.y, 14, 0, Math.PI * 2); ctx.fill();
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const op = Math.min(1, progress * 3);
  return (
    <div style={{ width: "100%", textAlign: "center", opacity: op }}>
      <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 320, height: 220, display: "block", margin: "0 auto" }} />
    </div>
  );
}

// ─── Scene 6: Flattening the curve ────────────────────────────────────────────

function Scene6({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const now = (performance.now() - startRef.current) / 1000;
      ctx.clearRect(0, 0, w, h);

      const PAD = { l: 44, r: 20, t: 24, b: 36 };
      const chartW = w - PAD.l - PAD.r;
      const chartH = h - PAD.t - PAD.b;

      // Axes
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.l, PAD.t); ctx.lineTo(PAD.l, PAD.t + chartH);
      ctx.lineTo(PAD.l + chartW, PAD.t + chartH);
      ctx.stroke();

      // Y axis labels
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "8px ui-monospace,monospace";
      ctx.textAlign = "right";
      ["100%", "75%", "50%", "25%", "5%"].forEach((label, i) => {
        const y = PAD.t + (i / 4) * chartH;
        ctx.fillText(label, PAD.l - 4, y + 3);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(PAD.l + chartW, y); ctx.stroke();
      });

      // X label
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.textAlign = "center";
      ctx.fillText("Number of agents", PAD.l + chartW / 2, PAD.t + chartH + 20);

      // Draw animate-in: drawPct cycles 0..1 over 3.5s
      const drawPct = Math.min(1, now / 3.5);

      // Without governance: exponential rise (y = 20 + 74 * x^1.6)
      ctx.strokeStyle = `rgba(239,68,68,0.75)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const woPts = Math.floor(drawPct * 100);
      for (let i = 0; i <= woPts; i++) {
        const x = i / 100;
        const rate = 0.20 + 0.74 * Math.pow(x, 1.4);
        const px = PAD.l + x * chartW;
        const py = PAD.t + (1 - Math.min(1, rate)) * chartH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // With governance: flat at ~5%
      ctx.strokeStyle = `rgba(16,185,129,0.8)`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const wPts = Math.floor(drawPct * 100);
      for (let i = 0; i <= wPts; i++) {
        const x = i / 100;
        const rate = 0.05 + 0.01 * Math.sin(x * 8 + now);
        const px = PAD.l + x * chartW;
        const py = PAD.t + (1 - rate) * chartH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Legend
      const lx = PAD.l + chartW - 85;
      const ly = PAD.t + 12;
      ctx.fillStyle = `rgba(239,68,68,0.75)`;
      ctx.fillRect(lx, ly, 18, 2.5);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "8px Inter,sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Without L9", lx + 22, ly + 4);
      ctx.fillStyle = `rgba(16,185,129,0.8)`;
      ctx.fillRect(lx, ly + 14, 18, 2.5);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillText("With L9", lx + 22, ly + 18);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const op = Math.min(1, progress * 3);
  return (
    <div style={{ width: "100%", textAlign: "center", opacity: op }}>
      <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 380, height: 210, display: "block", margin: "0 auto" }} />
      <div style={{ fontSize: "0.72rem", color: EMERALD, fontFamily: "ui-monospace,monospace", fontWeight: 700, marginTop: "0.4rem" }}>
        95% reliability. Any number of agents.
      </div>
    </div>
  );
}

// ─── Scene 7: CTA ─────────────────────────────────────────────────────────────

function Scene7({
  progress,
  onCounterClick,
  onChatClick,
}: {
  progress: number;
  onCounterClick: () => void;
  onChatClick: () => void;
}) {
  const op = Math.min(1, progress * 3);
  return (
    <div style={{ textAlign: "center", opacity: op, padding: "1.5rem 0" }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "rgba(139,92,246,0.12)",
        border: `2px solid ${VIOLET}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 1.25rem",
        fontSize: "1.1rem",
        fontWeight: 900,
        color: VIOLET,
      }}>
        L9
      </div>
      <p style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.88)", marginBottom: "0.5rem", lineHeight: 1.4 }}>
        This is governance. This is Level9OS.
      </p>
      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.25rem", fontFamily: "ui-monospace,monospace" }}>
        Give it a day.
      </p>
      <div style={{ display: "flex", gap: "0.625rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={onCounterClick}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 99,
            border: `1px solid ${VIOLET}40`,
            background: `rgba(139,92,246,0.12)`,
            color: VIOLET,
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter,sans-serif",
            transition: "background 0.15s",
          }}
        >
          Show me the math
        </button>
        <button
          onClick={onChatClick}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 99,
            border: "none",
            background: VIOLET,
            color: "white",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter,sans-serif",
            transition: "opacity 0.15s",
          }}
        >
          Talk to MAX
        </button>
      </div>
    </div>
  );
}

// ─── Scene data ────────────────────────────────────────────────────────────────

const SCENE_CAPTIONS = [
  { title: "One agent.", body: "~20% errors. Catchable." },
  { title: "Two. Three. Five.", body: "Errors compound. So do sub-agents." },
  { title: "When something breaks, you don't know which agent.", body: "Or which step. Or why." },
  { title: "Hours to find. Days to fix.", body: "Patchwork piles up. So do incidents." },
  { title: "Agents watching agents.", body: "Errors caught at the moment they happen." },
  { title: "Flattening the curve.", body: "95% reliability at any agent count." },
  { title: "This is governance. This is Level9OS.", body: "Give it a day." },
];

// ─── Main export ───────────────────────────────────────────────────────────────

export default function CompoundingRiskWalkthrough({
  onOpenCounter,
  onOpenChat,
}: {
  onOpenCounter?: () => void;
  onOpenChat?: () => void;
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const lastScrollTime = useRef(Date.now());
  const TOTAL_SCENES = 7;

  const advanceTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_SCENES - 1, idx));
    setSceneIndex(clamped);
    setSceneProgress(0);
    // Animate progress 0 -> 1 over 400ms
    const start = performance.now();
    const tick = () => {
      const pct = Math.min(1, (performance.now() - start) / 400);
      setSceneProgress(pct);
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Auto-advance if idle for 5s
  useEffect(() => {
    const check = setInterval(() => {
      if (Date.now() - lastScrollTime.current > 5000 && sceneIndex < TOTAL_SCENES - 1) {
        advanceTo(sceneIndex + 1);
        lastScrollTime.current = Date.now();
      }
    }, 500);
    return () => clearInterval(check);
  }, [sceneIndex, advanceTo]);

  // Scroll handler: wheel + touch
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWheelTime = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime.current < 700) return;
      lastWheelTime.current = now;
      lastScrollTime.current = now;
      if (e.deltaY > 0 && sceneIndex < TOTAL_SCENES - 1) advanceTo(sceneIndex + 1);
      else if (e.deltaY < 0 && sceneIndex > 0) advanceTo(sceneIndex - 1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [sceneIndex, advanceTo]);

  // Touch support
  const touchStartY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 30) return;
    lastScrollTime.current = Date.now();
    if (delta > 0 && sceneIndex < TOTAL_SCENES - 1) advanceTo(sceneIndex + 1);
    else if (delta < 0 && sceneIndex > 0) advanceTo(sceneIndex - 1);
  };

  const p = sceneProgress;

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ width: "100%", userSelect: "none" }}
    >
      {/* Scene graphic */}
      <div
        style={{
          width: "100%",
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.75rem 0",
          transition: `opacity 0.25s ${SPRING}`,
        }}
        key={sceneIndex}
      >
        {sceneIndex === 0 && <Scene1 progress={p} />}
        {sceneIndex === 1 && <Scene2 progress={p} />}
        {sceneIndex === 2 && <Scene3 progress={p} />}
        {sceneIndex === 3 && <Scene4 progress={p} />}
        {sceneIndex === 4 && <Scene5 progress={p} />}
        {sceneIndex === 5 && <Scene6 progress={p} />}
        {sceneIndex === 6 && (
          <Scene7
            progress={p}
            onCounterClick={onOpenCounter ?? (() => {})}
            onChatClick={onOpenChat ?? (() => {})}
          />
        )}
      </div>

      {/* Caption */}
      <div
        style={{
          padding: "0.75rem",
          borderRadius: 10,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
          marginBottom: "0.75rem",
          transition: `opacity 0.3s ${SPRING}`,
          opacity: Math.min(1, p * 4),
        }}
      >
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: "0.2rem" }}>
          {SCENE_CAPTIONS[sceneIndex].title}
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
          {SCENE_CAPTIONS[sceneIndex].body}
        </div>
      </div>

      {/* Progress dots + navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        {Array.from({ length: TOTAL_SCENES }, (_, i) => (
          <button
            key={i}
            onClick={() => { lastScrollTime.current = Date.now(); advanceTo(i); }}
            style={{
              width: i === sceneIndex ? 18 : 7,
              height: 7,
              borderRadius: 99,
              border: "none",
              background: i === sceneIndex ? VIOLET : "rgba(255,255,255,0.15)",
              cursor: "pointer",
              transition: `all 0.25s ${SPRING}`,
              padding: 0,
            }}
          />
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: "0.6rem", color: "rgba(255,255,255,0.18)", fontFamily: "ui-monospace,monospace" }}>
        scroll or tap dots to advance
      </div>
    </div>
  );
}

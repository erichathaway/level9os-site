"use client";
/**
 * /preview/explainer
 *
 * Scroll-driven motion graphic explainer for Level9OS.
 * 6 scenes, ~85 seconds of narration, one scene per 100vh of vertical scroll.
 *
 * Scene palette (from brand tokens):
 *   Scene 1 (Pain)          — red chassis    #ef4444
 *   Scene 2 (What we do)    — violet decide  #8b5cf6
 *   Scene 3 (How)           — multi-vendor flow
 *   Scene 4 (Differentiation)— amber execute #f59e0b
 *   Scene 5 (Results)       — cyan measure + red chassis
 *   Scene 6 (CTA)           — fuchsia MAX    #ec4899
 *
 * Accessibility:
 *   - Voiceover text rendered as visible captions in each scene
 *   - Keyboard navigation: ArrowDown advances scene, ArrowUp goes back
 *   - Skip button (top-right) jumps directly to Scene 6 (CTA)
 *   - prefers-reduced-motion: replaces all heavy animations with simple fades
 *
 * Audio:
 *   TODO: Ambient drone audio player would dock here. A <audio> element with
 *   mute toggle can be wired to /audio/level9-ambient.mp3 once produced.
 *   The mute button UI slot is reserved in the top-right area next to the skip button.
 *
 * Brand discipline:
 *   - All colors from var(--*) CSS custom properties (globals.css) matching
 *     @level9/brand/tokens/colors canonical values
 *   - Motion primitives: FadeIn, Counter, RevealMask, MagneticButton, MagneticCard
 *     from @level9/brand/components/motion
 *   - Typography: --font-inter (body), --font-playfair (editorial moments)
 *   - Spring easing: cubic-bezier(0.16, 1, 0.3, 1) throughout
 *   - Footer attribution: Level9OS LLC
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  FadeIn,
  Counter,
  RevealMask,
  MagneticButton,
  MagneticCard,
} from "@level9/brand/components/motion";

// ─── Scene constants ──────────────────────────────────────────────────────────

const SCENE_COUNT = 6;

// ─── Hooks ────────────────────────────────────────────────────────────────────

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── Scene 1: The Pain ───────────────────────────────────────────────────────

function PainScene({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const agentCount = 10;
  // Deterministic positions so SSR and client match
  const agents = Array.from({ length: agentCount }, (_, i) => ({
    id: i,
    x: [12, 28, 45, 62, 78, 18, 35, 55, 72, 88][i],
    y: [20, 55, 30, 65, 40, 72, 15, 48, 25, 60][i],
    shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "square" : "diamond",
    hasChaos: i < 4,
    chaosType: (["dollar", "x", "question", "dollar"] as const)[i % 4],
  }));

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "var(--bg-root)" }}>
      {/* Red tint overlay that fades in when active */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(239,68,68,0.07) 0%, transparent 70%)",
          opacity: active ? 1 : 0,
          transition: reducedMotion ? "opacity 0.3s" : "opacity 1.5s ease",
          pointerEvents: "none",
        }}
      />

      {/* Agent icons */}
      {agents.map((agent, i) => (
        <div
          key={agent.id}
          style={{
            position: "absolute",
            left: `${agent.x}%`,
            top: `${agent.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: active ? 1 : 0,
            transition: reducedMotion
              ? "opacity 0.3s"
              : `opacity 0.6s ease ${i * 0.08}s`,
          }}
        >
          {/* Agent shape */}
          <div
            style={{
              width: 28,
              height: 28,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: agent.shape === "circle" ? "50%" : agent.shape === "square" ? "4px" : "4px",
              transform: agent.shape === "diamond" ? "rotate(45deg)" : "none",
              animation: active && !reducedMotion ? "agentPulse 2.5s ease-in-out infinite" : "none",
              animationDelay: `${i * 0.3}s`,
            }}
          />
          {/* Chaos indicators */}
          {agent.hasChaos && active && (
            <div
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                fontSize: 14,
                fontWeight: 700,
                animation: reducedMotion ? "none" : "chaosAppear 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
                animationDelay: reducedMotion ? "0s" : `${0.8 + i * 0.2}s`,
                opacity: reducedMotion ? 1 : 0,
                color: agent.chaosType === "dollar" ? "#f59e0b"
                  : agent.chaosType === "question" ? "#8b5cf6"
                  : "#ef4444",
              }}
            >
              {agent.chaosType === "dollar" ? "$" : agent.chaosType === "question" ? "?" : "×"}
            </div>
          )}
        </div>
      ))}

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          maxWidth: 600,
        }}
      >
        <FadeIn delay={active ? 0.4 : 0}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              background: "rgba(3,3,6,0.7)",
              padding: "12px 24px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            &ldquo;They&rsquo;re claiming done when the work isn&rsquo;t done.&rdquo;
          </p>
        </FadeIn>
        <FadeIn delay={active ? 1.2 : 0}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(12px, 1.4vw, 14px)",
              color: "var(--text-muted)",
              marginTop: 8,
            }}
          >
            You won&rsquo;t know until something breaks.
          </p>
        </FadeIn>
      </div>

      {/* Scene label */}
      <SceneLabel label="01 — The Problem" color="var(--red)" active={active} />

      <style>{`
        @keyframes agentPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes chaosAppear {
          from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Scene 2: What We Do ─────────────────────────────────────────────────────

function WhatWeDoScene({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const tags = [
    { label: "Audit", color: "#06b6d4", icon: "✓", delay: 1.2 },
    { label: "Cost cap", color: "#f59e0b", icon: "◆", delay: 1.6 },
    { label: "Output check", color: "#8b5cf6", icon: "●", delay: 2.0 },
  ];

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-root)" }}
    >
      {/* Hub */}
      <FadeIn delay={active ? 0.2 : 0}>
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
          {/* Orbit ring */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: "50%",
              border: "1px solid rgba(139,92,246,0.4)",
              animation: active && !reducedMotion ? "orbitSpin 8s linear infinite" : "none",
            }}
          />
          {/* Hub circle */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(139,92,246,0.2)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: 22,
                color: "#8b5cf6",
                letterSpacing: "-0.02em",
              }}
            >
              L9
            </span>
          </div>
        </div>
      </FadeIn>

      {/* Tags */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 32,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {tags.map((tag) => (
          <FadeIn key={tag.label} delay={active ? tag.delay : 0}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                background: `${tag.color}18`,
                border: `1px solid ${tag.color}40`,
              }}
            >
              <span style={{ color: tag.color, fontSize: 14 }}>{tag.icon}</span>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                {tag.label}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Caption */}
      <div style={{ marginTop: 48, textAlign: "center", maxWidth: 520, padding: "0 24px" }}>
        <FadeIn delay={active ? 0.6 : 0}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--text-primary)",
              fontWeight: 600,
              lineHeight: 1.4,
              marginBottom: 12,
            }}
          >
            One control plane.
          </p>
        </FadeIn>
        <FadeIn delay={active ? 0.9 : 0}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            We sit between you and every AI tool you use. We catch the lies, log the
            actions, cap the costs, govern the outputs.
          </p>
        </FadeIn>
      </div>

      <SceneLabel label="02 — What We Do" color="var(--violet)" active={active} />

      <style>{`
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Scene 3: How We Do It ───────────────────────────────────────────────────

const LEFT_TOOLS = [
  { label: "Claude", color: "#8b5cf6" },
  { label: "GPT-4", color: "#10b981" },
  { label: "Gemini", color: "#06b6d4" },
  { label: "Slack", color: "#a78bfa" },
  { label: "Custom model", color: "#64748b" },
];

const RIGHT_OUTPUTS = [
  { label: "Audit log", icon: "≡", color: "#06b6d4" },
  { label: "Library", icon: "◧", color: "#8b5cf6" },
  { label: "Dashboard", icon: "▦", color: "#f59e0b" },
];

function ArchitectureScene({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-root)" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "clamp(16px, 3vw, 48px)",
          alignItems: "center",
          maxWidth: 900,
          width: "90%",
          padding: "0 16px",
        }}
      >
        {/* Left: input tools */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            Your existing stack
          </p>
          {LEFT_TOOLS.map((tool, i) => (
            <FadeIn key={tool.label} delay={active ? 0.1 + i * 0.12 : 0} direction="right">
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                  border: `1px solid ${tool.color}30`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{ width: 6, height: 6, borderRadius: "50%", background: tool.color }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {tool.label}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Center: chassis */}
        <FadeIn delay={active ? 0.3 : 0}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Arrow indicators */}
            <div
              style={{
                fontSize: 18,
                color: "rgba(139,92,246,0.5)",
                animation: active && !reducedMotion ? "arrowPulse 1.5s ease-in-out infinite" : "none",
              }}
            >
              ⇄
            </div>
            <div
              style={{
                padding: "24px 20px",
                borderRadius: "var(--radius-xl)",
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.35)",
                boxShadow: "0 0 32px rgba(139,92,246,0.15)",
                textAlign: "center",
                minWidth: 120,
                animation: active && !reducedMotion ? "chassisPulse 3s ease-in-out infinite" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#8b5cf6",
                  letterSpacing: "-0.01em",
                }}
              >
                Level9OS
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 4,
                  letterSpacing: "0.05em",
                }}
              >
                governance chassis
              </div>
              {/* Processing lines */}
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                {[60, 80, 45].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: 2,
                      width: `${w}%`,
                      margin: "0 auto",
                      borderRadius: 2,
                      background: "rgba(139,92,246,0.3)",
                      animation: active && !reducedMotion ? `scanLine 2s ease-in-out infinite` : "none",
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Right: outputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            Outputs
          </p>
          {RIGHT_OUTPUTS.map((out, i) => (
            <FadeIn key={out.label} delay={active ? 0.5 + i * 0.15 : 0} direction="left">
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                  border: `1px solid ${out.color}30`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: out.color, fontSize: 14 }}>{out.icon}</span>
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {out.label}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Bottom caption */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <FadeIn delay={active ? 1.1 : 0}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              color: "var(--text-muted)",
              background: "rgba(3,3,6,0.7)",
              padding: "8px 20px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Multi-vendor. One audit trail. No lock-in.
          </p>
        </FadeIn>
      </div>

      <SceneLabel label="03 — How It Works" color="#06b6d4" active={active} />

      <style>{`
        @keyframes chassisPulse {
          0%, 100% { box-shadow: 0 0 32px rgba(139,92,246,0.15); }
          50% { box-shadow: 0 0 48px rgba(139,92,246,0.28); }
        }
        @keyframes arrowPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes scanLine {
          0%, 100% { opacity: 0.3; transform: scaleX(1); }
          50% { opacity: 0.8; transform: scaleX(1.05); }
        }
      `}</style>
    </div>
  );
}

// ─── Scene 4: Why It's Different ─────────────────────────────────────────────

const COMPETITORS = [
  { name: "Microsoft Agent 365", price: "~$1M / yr", lock: "MS-locked" },
  { name: "Salesforce Agentforce", price: "~$850K / yr", lock: "SF-locked" },
  { name: "Workday ASOR", price: "~$500K / yr", lock: "HR/Finance only" },
];

function DifferentiationScene({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-root)" }}
    >
      {/* Competitor cards */}
      <div
        style={{
          display: "flex",
          gap: "clamp(8px, 2vw, 20px)",
          marginBottom: 32,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {COMPETITORS.map((comp, i) => (
          <FadeIn key={comp.name} delay={active ? 0.1 + i * 0.2 : 0} direction="down">
            <div style={{ position: "relative" }}>
              <div
                style={{
                  padding: "20px 18px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  textAlign: "center",
                  minWidth: 150,
                  opacity: active ? 0.5 : 1,
                  transition: "opacity 0.5s ease 1.2s",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  {comp.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "clamp(16px, 2vw, 22px)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 6,
                  }}
                >
                  {comp.price}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 11,
                    color: "#ef4444",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  {comp.lock}
                </div>
              </div>
              {/* Red X */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  opacity: active ? 1 : 0,
                  transform: active && !reducedMotion ? "scale(1)" : "scale(0.5)",
                  transition: reducedMotion
                    ? `opacity 0.3s ease ${0.9 + i * 0.2}s`
                    : `opacity 0.35s ease ${0.9 + i * 0.2}s, transform 0.35s cubic-bezier(0.16,1,0.3,1) ${0.9 + i * 0.2}s`,
                }}
              >
                <span style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>
                  ×
                </span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Level9OS card */}
      <FadeIn delay={active ? 1.6 : 0} direction="up">
        <MagneticCard
          className="rounded-xl"
          glowColor="rgba(139,92,246,0.2)"
          maxTilt={4}
        >
          <div
            style={{
              padding: "28px 36px",
              borderRadius: "var(--radius-xl)",
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.4)",
              boxShadow: "0 0 48px rgba(139,92,246,0.15)",
              textAlign: "center",
              minWidth: 220,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                color: "#8b5cf6",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Level9OS
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              $499 / mo
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {["Multi-vendor", "Built for 10-50 people"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 12,
                    color: "#8b5cf6",
                    background: "rgba(139,92,246,0.12)",
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </MagneticCard>
      </FadeIn>

      {/* Bottom line */}
      <FadeIn delay={active ? 2.2 : 0}>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "clamp(12px, 1.5vw, 15px)",
            color: "var(--text-muted)",
            marginTop: 24,
            textAlign: "center",
            maxWidth: 460,
            lineHeight: 1.5,
            padding: "0 16px",
          }}
        >
          Built for operators who can&rsquo;t afford to learn this the hard way.
        </p>
      </FadeIn>

      <SceneLabel label="04 — Why It's Different" color="var(--amber)" active={active} />
    </div>
  );
}

// ─── Scene 5: Results ────────────────────────────────────────────────────────

function ResultsScene({ active }: { active: boolean; reducedMotion?: boolean }) {
  const counters = [
    {
      prefix: "$",
      target: 52686,
      suffix: "",
      label: "prevented in 90 days",
      color: "#ef4444",
      size: "clamp(36px, 5vw, 56px)",
      delay: 0,
      duration: 2500,
    },
    {
      prefix: "",
      target: 236,
      suffix: " hrs",
      label: "operator time returned",
      color: "#06b6d4",
      size: "clamp(28px, 4vw, 44px)",
      delay: 300,
      duration: 1500,
    },
    {
      prefix: "$",
      target: 507,
      suffix: "",
      label: "cost / month (governance system)",
      color: "#f59e0b",
      size: "clamp(20px, 2.5vw, 28px)",
      delay: 600,
      duration: 1200,
      isDecimal: true,
    },
    {
      prefix: "",
      target: 3464,
      suffix: "x",
      label: "gross ROI",
      color: "#8b5cf6",
      size: "clamp(28px, 4vw, 44px)",
      delay: 900,
      duration: 2000,
      footnote: "34.8x net",
    },
  ];

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-root)" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(16px, 3vw, 40px)",
          maxWidth: 700,
          width: "90%",
        }}
      >
        {counters.map((c, i) => (
          <FadeIn key={c.label} delay={active ? 0.2 + i * 0.3 : 0}>
            <div
              style={{
                padding: "clamp(16px, 2vw, 28px)",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-surface)",
                border: `1px solid ${c.color}20`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: c.size,
                  fontWeight: 700,
                  color: c.color,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                }}
              >
                {active ? (
                  c.isDecimal ? (
                    // $5.07 — render as static with FadeIn (no integer tween for decimals)
                    <span>$5.07</span>
                  ) : (
                    <Counter
                      target={c.target}
                      prefix={c.prefix}
                      suffix={c.suffix}
                    />
                  )
                ) : (
                  <span>{c.prefix}0{c.suffix}</span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "clamp(11px, 1.2vw, 13px)",
                  color: "var(--text-muted)",
                  marginTop: 6,
                  lineHeight: 1.3,
                }}
              >
                {c.label}
              </div>
              {c.footnote && (
                <div
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 10,
                    color: "var(--text-subtle)",
                    marginTop: 4,
                  }}
                >
                  {c.footnote}
                </div>
              )}
            </div>
          </FadeIn>
        ))}
      </div>

      {/* "Not a projection" editorial statement */}
      <FadeIn delay={active ? 1.8 : 0}>
        <div style={{ marginTop: 32, textAlign: "center", padding: "0 16px" }}>
          <div
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(18px, 2.5vw, 28px)",
              color: "var(--text-primary)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            Not a projection.
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(12px, 1.5vw, 15px)",
              color: "var(--text-muted)",
              marginTop: 6,
            }}
          >
            This is our production environment. We are the customer.
          </div>
        </div>
      </FadeIn>

      <SceneLabel label="05 — The Results" color="var(--cyan)" active={active} />
    </div>
  );
}

// ─── Scene 6: CTA ────────────────────────────────────────────────────────────

function CTAScene({ active }: { active: boolean; reducedMotion?: boolean }) {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#030306" }}
    >
      {/* GTM hook */}
      <div style={{ textAlign: "center", maxWidth: 600, padding: "0 24px" }}>
        <div style={{ overflow: "hidden", paddingBottom: "0.2em", marginBottom: 8 }}>
          <RevealMask delay={active ? 200 : 0}>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(24px, 4vw, 44px)",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              Introduce an agent. Give it a day.
            </h2>
          </RevealMask>
        </div>
        <FadeIn delay={active ? 0.6 : 0}>
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(16px, 2.5vw, 24px)",
              color: "var(--text-secondary)",
              lineHeight: 1.4,
              fontStyle: "italic",
              marginBottom: 40,
            }}
          >
            It walks you through what it found.
          </p>
        </FadeIn>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <FadeIn delay={active ? 1.0 : 0}>
            <MagneticButton
              href="/"
              className="cta-btn-primary"
              strength={0.25}
            >
              <span className="cta-btn-label">Talk to MAX &nbsp;&rsaquo;</span>
            </MagneticButton>
          </FadeIn>
          <FadeIn delay={active ? 1.3 : 0}>
            <MagneticButton
              href="/compare"
              className="cta-btn-secondary"
              strength={0.25}
            >
              <span className="cta-btn-label">See the comparison &nbsp;&rsaquo;</span>
            </MagneticButton>
          </FadeIn>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <FadeIn delay={active ? 1.8 : 0}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 11,
              color: "var(--text-subtle)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Level9OS LLC
          </p>
        </FadeIn>
      </div>

      <SceneLabel label="06 — Get Started" color="var(--fuchsia)" active={active} />

      <style>{`
        .cta-btn-primary {
          display: inline-flex;
          align-items: center;
          padding: 14px 28px;
          border-radius: var(--radius-full);
          background: rgba(236,72,153,0.1);
          border: 1px solid rgba(236,72,153,0.5);
          color: var(--text-primary);
          text-decoration: none;
          font-family: var(--font-inter);
          font-size: clamp(14px, 1.6vw, 16px);
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .cta-btn-primary:hover {
          background: rgba(236,72,153,0.18);
          border-color: rgba(236,72,153,0.7);
          box-shadow: 0 0 24px rgba(236,72,153,0.2);
        }
        .cta-btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 14px 28px;
          border-radius: var(--radius-full);
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.4);
          color: var(--text-secondary);
          text-decoration: none;
          font-family: var(--font-inter);
          font-size: clamp(14px, 1.6vw, 16px);
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .cta-btn-secondary:hover {
          background: rgba(139,92,246,0.14);
          border-color: rgba(139,92,246,0.6);
        }
        .cta-btn-label {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

// ─── Shared: Scene Label ──────────────────────────────────────────────────────

function SceneLabel({
  label,
  color,
  active,
}: {
  label: string;
  color: string;
  active: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "6%",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: active ? 1 : 0,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 14px",
          borderRadius: "var(--radius-full)",
          background: "rgba(0,0,0,0.5)",
          border: `1px solid ${color}30`,
        }}
      >
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressDots({
  current,
  total,
  onDotClick,
}: {
  current: number;
  total: number;
  onDotClick: (i: number) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        right: "clamp(12px, 2vw, 24px)",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 100,
      }}
      role="navigation"
      aria-label="Scene navigation"
    >
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to scene ${i + 1}`}
          aria-current={i === current ? "true" : undefined}
          style={{
            width: i === current ? 8 : 6,
            height: i === current ? 8 : 6,
            borderRadius: "50%",
            background: i === current ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ExplainerPage() {
  const [activeScene, setActiveScene] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);

  // Smooth-scroll to a given scene index
  const scrollToScene = useCallback((index: number) => {
    const el = sceneRefs.current[index];
    if (!el) return;
    isScrollingRef.current = true;
    el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    setActiveScene(index);
    setTimeout(() => { isScrollingRef.current = false; }, 800);
  }, [reducedMotion]);

  // IntersectionObserver: track which scene is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sceneRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveScene(i);
          }
        },
        { threshold: 0.5 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToScene(Math.min(activeScene + 1, SCENE_COUNT - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToScene(Math.max(activeScene - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeScene, scrollToScene]);

  const SCENE_CAPTIONS = [
    "Scene 1: The Problem — agents running without oversight",
    "Scene 2: What Level9OS Does — one control plane for every agent",
    "Scene 3: Architecture — your stack flows through the governance chassis",
    "Scene 4: Differentiation — enterprise alternatives cost 17x to 167x more",
    "Scene 5: Results — $52,686 prevented, 236 hours returned, $5.07/month cost",
    "Scene 6: Call to action — introduce an agent, give it a day",
  ];

  return (
    <>
      {/* Skip to CTA button (accessibility) */}
      <button
        onClick={() => scrollToScene(SCENE_COUNT - 1)}
        aria-label="Skip to call to action"
        style={{
          position: "fixed",
          top: "clamp(12px, 2vw, 20px)",
          right: "clamp(40px, 5vw, 64px)",
          zIndex: 200,
          fontFamily: "var(--font-inter)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          background: "rgba(0,0,0,0.5)",
          border: "1px solid var(--border-subtle)",
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          cursor: "pointer",
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-medium)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
        }}
      >
        Skip &rsaquo;
      </button>

      {/* TODO: Audio mute toggle slot — dock a <button> here that controls
          an ambient drone <audio src="/audio/level9-ambient.mp3" loop />
          element once audio production is complete. */}

      {/* Progress dots */}
      <ProgressDots
        current={activeScene}
        total={SCENE_COUNT}
        onDotClick={scrollToScene}
      />

      {/* Screen-reader scene descriptions */}
      <div aria-live="polite" className="sr-only">
        {SCENE_CAPTIONS[activeScene]}
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        style={{ width: "100%", background: "var(--bg-root)" }}
      >
        {/* Scene 1 */}
        <div
          ref={(el) => { sceneRefs.current[0] = el; }}
          style={{ height: "100vh", position: "relative" }}
          aria-label={SCENE_CAPTIONS[0]}
        >
          <PainScene active={activeScene === 0} reducedMotion={reducedMotion} />
        </div>

        {/* Scene 2 */}
        <div
          ref={(el) => { sceneRefs.current[1] = el; }}
          style={{ height: "100vh", position: "relative" }}
          aria-label={SCENE_CAPTIONS[1]}
        >
          <WhatWeDoScene active={activeScene === 1} reducedMotion={reducedMotion} />
        </div>

        {/* Scene 3 */}
        <div
          ref={(el) => { sceneRefs.current[2] = el; }}
          style={{ height: "100vh", position: "relative" }}
          aria-label={SCENE_CAPTIONS[2]}
        >
          <ArchitectureScene active={activeScene === 2} reducedMotion={reducedMotion} />
        </div>

        {/* Scene 4 */}
        <div
          ref={(el) => { sceneRefs.current[3] = el; }}
          style={{ height: "100vh", position: "relative" }}
          aria-label={SCENE_CAPTIONS[3]}
        >
          <DifferentiationScene active={activeScene === 3} reducedMotion={reducedMotion} />
        </div>

        {/* Scene 5 */}
        <div
          ref={(el) => { sceneRefs.current[4] = el; }}
          style={{ height: "100vh", position: "relative" }}
          aria-label={SCENE_CAPTIONS[4]}
        >
          <ResultsScene active={activeScene === 4} reducedMotion={reducedMotion} />
        </div>

        {/* Scene 6 */}
        <div
          ref={(el) => { sceneRefs.current[5] = el; }}
          style={{ height: "100vh", position: "relative" }}
          aria-label={SCENE_CAPTIONS[5]}
        >
          <CTAScene active={activeScene === 5} reducedMotion={reducedMotion} />
        </div>
      </div>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import Level9Mark from "./Level9Mark";

/**
 * Concept C — Operating System.
 * Level9 chip at top-left = the OS core. Six product satellites fly in from
 * screen edges and settle into orbit. Metaphor: Level9OS at center, the six
 * products orbiting. Each has its own radius and period; loops forever.
 */

type Sat = {
  name: string;
  color: string;
  radius: number;
  baseAngle: number;
  orbitDur: number;
  flyFrom: { x: number; y: number };
  arriveDelay: number;
};

const FLY_DUR = 1.3;
const CHIP_X = 56;
const CHIP_Y = 56;

const sats: Sat[] = [
  { name: "stratos",    color: "#8b5cf6", radius: 140, baseAngle:  20, orbitDur: 38, flyFrom: { x:  900, y: -200 }, arriveDelay: 0.4 },
  { name: "commandos",  color: "#10b981", radius: 180, baseAngle:  80, orbitDur: 48, flyFrom: { x: 1100, y:  200 }, arriveDelay: 0.7 },
  { name: "outboundos", color: "#f59e0b", radius: 220, baseAngle: 150, orbitDur: 58, flyFrom: { x:  600, y:  600 }, arriveDelay: 1.0 },
  { name: "lucidorg",   color: "#06b6d4", radius: 160, baseAngle: 200, orbitDur: 42, flyFrom: { x:  100, y:  700 }, arriveDelay: 1.3 },
  { name: "playbook",   color: "#64748b", radius: 200, baseAngle: 260, orbitDur: 52, flyFrom: { x: -200, y:  400 }, arriveDelay: 1.6 },
  { name: "max",        color: "#ec4899", radius: 240, baseAngle: 320, orbitDur: 62, flyFrom: { x:  300, y: -300 }, arriveDelay: 1.9 },
];

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}

export default function HeroOrbit({ replayKey = 0 }: { replayKey?: number }) {
  const uniqueRadii = Array.from(new Set(sats.map(s => s.radius))).sort((a, b) => a - b);

  return (
    <>
      <style>{sats.map(s => `
        @keyframes l9-orbit-${s.name} {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `).join("\n")}</style>

      {/* Orbital rings */}
      <div
        className="absolute pointer-events-none"
        style={{ top: CHIP_Y, left: CHIP_X }}
        key={`rings-${replayKey}`}
      >
        {uniqueRadii.map((r, i) => (
          <motion.div
            key={r}
            className="absolute rounded-full"
            style={{
              width: r * 2,
              height: r * 2,
              top: -r,
              left: -r,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 1.6 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      {/* Chip (static, visible from t=0) */}
      <div className="absolute z-30 flex items-center gap-3" style={{ top: 24, left: 24 }}>
        <Level9Mark size={64} gradientIdSuffix="-orbit" />
        <div className="flex flex-col">
          <span className="text-white/95 font-black text-base tracking-wide">
            LEVEL9<span className="text-white/60 font-light tracking-wider">OS</span>
          </span>
          <span className="text-white/40 text-[10px] font-mono tracking-[0.2em] uppercase">
            AI for Operations
          </span>
        </div>
      </div>

      {/* Satellites — chip-center-anchored container */}
      <div
        className="absolute pointer-events-none"
        style={{ top: CHIP_Y, left: CHIP_X }}
        key={`sats-${replayKey}`}
      >
        {sats.map(s => {
          const restX = s.radius * Math.cos(deg2rad(s.baseAngle));
          const restY = s.radius * Math.sin(deg2rad(s.baseAngle));
          const arriveTime = s.arriveDelay + FLY_DUR;
          return (
            <div
              key={s.name}
              className="absolute"
              style={{
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                animation: `l9-orbit-${s.name} ${s.orbitDur}s linear infinite`,
                animationDelay: `${arriveTime}s`,
                animationPlayState: "running",
                willChange: "transform",
              }}
            >
              <motion.div
                className="absolute"
                style={{ top: 0, left: 0, willChange: "transform, opacity" }}
                initial={{ x: s.flyFrom.x, y: s.flyFrom.y, opacity: 0, scale: 0.4 }}
                animate={{ x: restX, y: restY, opacity: 1, scale: 1 }}
                transition={{
                  duration: FLY_DUR,
                  delay: s.arriveDelay,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: 14,
                    height: 14,
                    marginLeft: -7,
                    marginTop: -7,
                    background: s.color,
                    boxShadow: `0 0 14px ${s.color}, 0 0 32px ${s.color}aa`,
                  }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>
    </>
  );
}

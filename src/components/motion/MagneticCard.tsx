"use client";

import { useRef, useState, ReactNode } from "react";

/**
 * MagneticCard — 3D tilt on hover, spotlight that follows cursor.
 * For premium hover states on product cards and features.
 */
export default function MagneticCard({
  children,
  className = "",
  glowColor = "rgba(139,92,246,0.15)",
  maxTilt = 6,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [hover, setHover] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      ry: (x - 0.5) * maxTilt * 2,
      rx: -(y - 0.5) * maxTilt * 2,
    });
    setGlowPos({ x: x * 100, y: y * 100 });
  };

  const handleLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setHover(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleLeave}
      className={`relative transition-transform duration-300 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Glow spotlight */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor} 0%, transparent 50%)`,
          opacity: hover ? 1 : 0,
        }}
      />
      {children}
    </div>
  );
}

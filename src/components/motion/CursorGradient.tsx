"use client";

import { useEffect, useState } from "react";

/**
 * CursorGradient — ambient radial light that follows the cursor.
 * Subtle, premium. Only rendered on devices with fine pointers.
 */
export default function CursorGradient({
  color = "rgba(139,92,246,0.08)",
  size = 600,
}: {
  color?: string;
  size?: number;
}) {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on devices with fine pointers (skip touch)
    const mql = window.matchMedia("(pointer: fine)");
    setEnabled(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mql.addEventListener("change", onChange);

    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      mql.removeEventListener("change", onChange);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="fixed pointer-events-none z-0 transition-opacity duration-500"
      style={{
        left: pos.x - size / 2,
        top: pos.y - size / 2,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
        filter: "blur(40px)",
        willChange: "transform",
      }}
    />
  );
}

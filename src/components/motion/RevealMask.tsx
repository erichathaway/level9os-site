"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

/**
 * RevealMask — content slides up from behind a mask when it scrolls into view.
 * Cinematic reveal, used for section headers.
 */
export default function RevealMask({
  children,
  delay = 0,
  duration = 900,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div
        style={{
          transform: visible ? "translateY(0)" : "translateY(110%)",
          opacity: visible ? 1 : 0,
          transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity ${duration}ms ease ${delay}ms`,
          willChange: "transform, opacity",
        }}
      >
        {children}
      </div>
    </div>
  );
}

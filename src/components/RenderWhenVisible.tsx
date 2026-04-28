"use client";

/**
 * Defers rendering of an expensive subtree until the wrapper is within a
 * configurable distance of the viewport. Used on the home-page WHAT WE
 * BUILT product gallery to keep the bottom-of-fold product tiles from
 * burning paint cycles before the user can see them.
 *
 * Each canonical product tile is a fully-animated SVG authored at 1200x630.
 * Six tiles all rendered at first paint = 6 simultaneous animation timers
 * even when only 1-2 tiles are above the fold. Speed Index suffers.
 *
 * With this wrapper:
 *   - Wrapper div is always in the DOM (so layout slot is reserved via the
 *     parent's aspectRatio + containerType, no layout shift on swap).
 *   - Children only render once IntersectionObserver fires.
 *   - rootMargin defaults to 200px for a single viewport of pre-warm.
 *     Adjust per-call if the child needs more time to settle.
 *
 * Falls back to rendering immediately on browsers without IO support and
 * during SSR (the server-rendered output is the placeholder; the client
 * upgrades on observation).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Distance in CSS pixels before the viewport edge to trigger render. */
  rootMargin?: string;
  /** Optional placeholder to render before intersection. Defaults to nothing. */
  fallback?: ReactNode;
  className?: string;
}

export default function RenderWhenVisible({
  children,
  rootMargin = "200px",
  fallback = null,
  className,
}: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}

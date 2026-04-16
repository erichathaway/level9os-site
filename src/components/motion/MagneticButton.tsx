"use client";

import { useRef, useState, ReactNode } from "react";

/**
 * MagneticButton — cursor-attraction effect. Button subtly follows
 * the cursor when hovered. Premium hover feel.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  target,
  rel,
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * strength;
    const distY = (e.clientY - centerY) * strength;
    setOffset({ x: distX, y: distY });
  };

  const handleLeave = () => setOffset({ x: 0, y: 0 });

  const style = {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    transition: offset.x === 0 && offset.y === 0
      ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
      : "transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: "transform",
  };

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

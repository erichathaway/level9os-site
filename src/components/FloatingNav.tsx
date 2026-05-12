"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// ── Nav structure (Phase 7 spec) ──────────────────────────────────────────────

const NAV_GROUPS = [
  {
    id: "platform",
    label: "Platform",
    href: "/",
    dropdown: null,
  },
  {
    id: "governance",
    label: "Governance",
    href: "/?surface=governance",
    dropdown: null,
    accent: "#ef4444",
  },
  {
    id: "products",
    label: "Products",
    href: null,
    accent: "#8b5cf6",
    dropdown: [
      { label: "CommandOS", desc: "Governance + agent management", href: "/?surface=products" },
      { label: "LucidORG", desc: "Operations intelligence", href: "/?surface=products" },
      { label: "MAX", desc: "Voice operating interface", href: "/?surface=products" },
      { label: "StratOS", desc: "Strategic decision rooms", href: "/?surface=products" },
      { label: "OutboundOS", desc: "Outbound automation wrapper", href: "/?surface=wrappers" },
      { label: "COO Playbook", desc: "Operating methodology", href: "/?surface=products" },
    ],
  },
  {
    id: "see-it-work",
    label: "See It Work",
    href: null,
    accent: "#06b6d4",
    dropdown: [
      { label: "Calculator", desc: "How much would you save?", href: "/?surface=calculator" },
      { label: "Live Feed", desc: "Real-time audit trail", href: "/?surface=live-feed" },
      { label: "Voice Pitch", desc: "Hear the pitch", href: "/?surface=voice-pitch" },
      { label: "Compare", desc: "vs Microsoft / Salesforce / Workday", href: "/?surface=compare" },
      { label: "Walkthroughs", desc: "30s, 1:30, 5min", href: "/?surface=walkthroughs" },
    ],
  },
  {
    id: "get-started",
    label: "Get Started",
    href: null,
    accent: "#10b981",
    dropdown: [
      { label: "Paths", desc: "Startup / Growth / Enterprise", href: "/?surface=paths" },
      { label: "Contact", desc: "Talk to Eric directly", href: "/contact" },
    ],
  },
  {
    id: "more",
    label: "More",
    href: null,
    accent: "#64748b",
    dropdown: [
      { label: "About", desc: "Company, charter, origins", href: "/?surface=about" },
      { label: "Stay Level", desc: "Eric Hathaway · weekly newsletter", href: "https://erichathaway.substack.com", external: true },
      { label: "Lucid Insights", desc: "Field notes · weekly", href: "https://lucidinsights.substack.com", external: true },
    ],
  },
];

type DropdownItem = {
  label: string;
  desc: string;
  href: string;
  external?: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function FloatingNav() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled((prev) => {
          const next = window.scrollY > 50;
          return prev === next ? prev : next;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleGroupEnter = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(id);
  };

  const handleGroupLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const handleDropdownEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleDropdownLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  // Animation: crystallize in on home
  const isHome = pathname === "/";
  const chipInitial = isHome ? { opacity: 0, scale: 1.5, filter: "blur(28px)" } : undefined;
  const chipAnimate = isHome ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined;
  const chipTransition = isHome
    ? { duration: 0.9, delay: 1.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    : undefined;
  const textInitial = isHome ? { opacity: 0, x: -8 } : undefined;
  const textAnimate = isHome ? { opacity: 1, x: 0 } : undefined;
  const textTransition = isHome
    ? { duration: 0.9, delay: 1.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    : undefined;

  const activeGroup = NAV_GROUPS.find((g) => g.id === activeDropdown);
  const activeItems = (activeGroup?.dropdown ?? []) as DropdownItem[];
  const activeAccent = activeGroup?.accent ?? "#8b5cf6";

  return (
    <>
      {/* Top-left logo */}
      <Link
        href="/"
        className={`fixed top-6 left-6 sm:left-8 z-[60] flex items-center gap-3 group transition-all duration-500 ${
          scrolled ? "scale-95" : "scale-100"
        }`}
      >
        <motion.div
          initial={chipInitial}
          animate={chipAnimate}
          transition={chipTransition}
          style={{ willChange: isHome ? "transform, opacity, filter" : undefined }}
        >
          <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
            <Image src="/brand/logos/level9/chip.svg" alt="Level9OS" width={44} height={44} className="w-full h-full" />
          </div>
        </motion.div>
        <motion.div
          className="hidden sm:block"
          initial={textInitial}
          animate={textAnimate}
          transition={textTransition}
        >
          <div className="text-[11px] tracking-[0.3em] uppercase font-semibold text-white/50 group-hover:text-white/80 transition-colors">
            Level9<span className="text-white/30">OS</span>
          </div>
          <div className="text-[8px] text-white/20 tracking-wide">AI for Operations</div>
        </motion.div>
      </Link>

      {/* Desktop nav bar — grouped items with hover dropdowns */}
      <div
        ref={dropdownRef}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] hidden md:flex items-center gap-1"
        style={{
          background: "rgba(7,7,16,0.82)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "99px",
          padding: "0.35rem 0.75rem",
        }}
      >
        {NAV_GROUPS.map((group) => {
          const isActive = activeDropdown === group.id;
          const isCurrentPage = group.href === "/" && pathname === "/";

          if (group.dropdown === null && group.href) {
            // Direct link, no dropdown
            return (
              <Link
                key={group.id}
                href={group.href}
                className="fn-item"
                style={{
                  color: group.accent && isCurrentPage ? group.accent : undefined,
                  fontWeight: isCurrentPage ? 700 : undefined,
                }}
              >
                {group.label}
                {group.accent && (
                  <span
                    className="fn-item-dot"
                    style={{ background: group.accent, opacity: 0.8, boxShadow: `0 0 6px ${group.accent}` }}
                  />
                )}
              </Link>
            );
          }

          // Dropdown group
          return (
            <div
              key={group.id}
              className="relative"
              onMouseEnter={() => handleGroupEnter(group.id)}
              onMouseLeave={handleGroupLeave}
            >
              <button
                className="fn-item"
                style={{
                  color: isActive ? (group.accent ?? "rgba(255,255,255,0.9)") : undefined,
                  background: isActive ? `${group.accent ?? "#8b5cf6"}10` : undefined,
                }}
                onClick={() => setActiveDropdown(isActive ? null : group.id)}
              >
                {group.label}
                <span
                  className="fn-chevron"
                  style={{ transform: isActive ? "rotate(180deg)" : undefined }}
                >
                  ▾
                </span>
              </button>
            </div>
          );
        })}

        {/* Dropdown panel (shared, positioned absolutely below bar) */}
        {activeDropdown && activeGroup?.dropdown && (
          <div
            className="fn-dropdown"
            style={{ borderColor: `${activeAccent}25` }}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            {activeItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="fn-dd-item"
                onClick={() => setActiveDropdown(null)}
              >
                <span
                  className="fn-dd-dot"
                  style={{ background: activeAccent }}
                />
                <span className="fn-dd-content">
                  <span className="fn-dd-label">{item.label}</span>
                  <span className="fn-dd-desc">{item.desc}</span>
                </span>
                {item.external && <span className="fn-dd-ext">↗</span>}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Top-right hamburger (mobile + desktop fallback) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-6 right-6 sm:right-8 z-[60] w-11 h-11 rounded-full border border-white/[0.3] bg-elevated-95 backdrop-blur-xl flex flex-col items-center justify-center gap-[5px] transition-all hover:scale-110 hover:border-violet-400/70 hover:shadow-lg hover:shadow-violet-500/30 shadow-lg shadow-black/40 md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className={`w-4 h-[2px] bg-white/90 rounded transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`w-4 h-[2px] bg-white/90 rounded transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`w-4 h-[2px] bg-white/90 rounded transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>

      {/* Fullscreen menu overlay (mobile) */}
      <div
        className={`fixed inset-0 z-[59] transition-all duration-500 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-[#030306]" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.1) 0%, transparent 50%), radial-gradient(ellipse at center, rgba(236,72,153,0.05) 0%, transparent 60%)",
          }}
        />

        <div
          className="relative h-full overflow-y-auto px-8 pt-24 pb-12"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            {NAV_GROUPS.map((group) => (
              <div key={group.id}>
                {group.href ? (
                  <Link
                    href={group.href}
                    onClick={() => setOpen(false)}
                    className="block text-[clamp(1.8rem,3.5vw,2.4rem)] font-black text-white/50 hover:text-white transition-colors"
                    style={{ color: group.accent ? `${group.accent}cc` : undefined }}
                  >
                    {group.label}
                  </Link>
                ) : (
                  <>
                    <div
                      className="text-[clamp(1.8rem,3.5vw,2.4rem)] font-black"
                      style={{ color: group.accent ? `${group.accent}80` : "rgba(255,255,255,0.3)" }}
                    >
                      {group.label}
                    </div>
                    <div className="mt-2 mb-4 ml-2 flex flex-col gap-2">
                      {(group.dropdown as DropdownItem[]).map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          onClick={() => setOpen(false)}
                          className="text-white/50 hover:text-white/90 text-sm flex items-center gap-2 transition-colors"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: group.accent ?? "#8b5cf6" }}
                          />
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-white/[0.06]">
            <div className="text-[11px] tracking-[0.3em] uppercase font-mono text-white/25 mb-3">Get In Touch</div>
            <a
              href="mailto:hello@level9os.com"
              className="text-white/50 hover:text-white/80 text-sm font-mono transition-colors block mb-4"
            >
              hello@level9os.com
            </a>
            <a
              href="https://www.linkedin.com/company/98800696"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ring-1 ring-white/[0.08] group-hover:ring-white/[0.20]"
                style={{ background: "#0A66C215", color: "#0A66C2dd" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </span>
              <span className="text-sm text-white/65 group-hover:text-white/95 transition-colors font-medium">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      {/* Nav styles */}
      <style>{`
        .fn-item {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          padding: 0.4rem 0.7rem;
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
          transition: color 0.15s ease, background 0.15s ease;
          white-space: nowrap;
          text-decoration: none;
          position: relative;
        }
        .fn-item:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.05); }
        .fn-item-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          margin-left: 0.15rem;
          animation: fn-pulse 2s ease-in-out infinite;
        }
        @keyframes fn-pulse {
          0%,100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .fn-chevron {
          font-size: 0.55rem;
          opacity: 0.4;
          transition: transform 0.15s ease, opacity 0.15s ease;
          margin-left: 0.1rem;
        }
        .fn-item:hover .fn-chevron { opacity: 0.8; }
        .fn-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(7,7,16,0.96);
          backdrop-filter: blur(24px);
          border: 1px solid;
          border-radius: 14px;
          padding: 0.5rem;
          min-width: 220px;
          z-index: 100;
          animation: fn-dd-in 0.18s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }
        @keyframes fn-dd-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .fn-dd-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.55rem 0.75rem;
          border-radius: 9px;
          text-decoration: none;
          transition: background 0.12s ease;
          cursor: pointer;
        }
        .fn-dd-item:hover { background: rgba(255,255,255,0.05); }
        .fn-dd-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .fn-dd-content {
          display: flex;
          flex-direction: column;
          gap: 0.05rem;
          flex: 1;
        }
        .fn-dd-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.82);
          line-height: 1.2;
        }
        .fn-dd-desc {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.32);
          line-height: 1.3;
        }
        .fn-dd-ext {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.22);
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
}

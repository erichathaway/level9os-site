"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { products } from "@level9/brand/content/products";

const pages = [
  { label: "Overview", href: "/" },
  { label: "Architecture", href: "/architecture" },
  { label: "Products", href: "/products" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Partnerships", href: "/partnerships" },
];

const secondary = [
  { label: "About Level9", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Product roster derived from the canonical roster in
 * `@level9/brand/content/products`. Only the nav-specific display metadata
 * (chip desc, logo folder override for coo-playbook) is kept local.
 * Names, IDs, colors, and order come from the brand package.
 */
const NAV_DESC: Record<string, string> = {
  stratos:    "AI Decision Rooms",
  commandos:  "Agent Orchestration",
  outboundos: "LinkupOS · ABM · AutoCS",
  playbook:   "Execution Methodology",
  lucidorg:   "Measurement Platform",
  max:        "Coming Soon",
};

// canonical logo folders don't always match product ids (playbook → coo-playbook)
const LOGO_DIR: Record<string, string> = {
  playbook: "coo-playbook",
};

const navProducts = products.map((p) => ({
  label: p.name,
  href: `/products#${p.id}`,
  color: p.color,
  icon: p.name.charAt(0),
  desc: NAV_DESC[p.id] ?? p.tag,
  image: `/brand/logos/${LOGO_DIR[p.id] ?? p.id}/chip.svg`,
}));

const external = [
  { label: "Lucid Insights", href: "https://lucidinsights.substack.com", desc: "Field notes · weekly" },
  { label: "The Alignment Advantage", href: "#", desc: "Book · 2026" },
];

export default function FloatingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // On the home page only, the chip crystallizes in (blur → sharp) and the
  // wordmark slides in after. Timings match HomeHeroSplash so the icon-hit
  // aligns with the flash + pond ripples. Other pages render the chip
  // instantly without entry animation.
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

  return (
    <>
      {/* Top-left logo / brand mark */}
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

      {/* Top-right menu trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-6 right-6 sm:right-8 z-[60] w-11 h-11 rounded-full border border-white/[0.3] bg-elevated-95 backdrop-blur-xl flex flex-col items-center justify-center gap-[5px] transition-all hover:scale-110 hover:border-violet-400/70 hover:shadow-lg hover:shadow-violet-500/30 shadow-lg shadow-black/40"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className={`w-4 h-[2px] bg-white/90 rounded transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`w-4 h-[2px] bg-white/90 rounded transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`w-4 h-[2px] bg-white/90 rounded transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>

      {/* Fullscreen menu overlay */}
      <div
        className={`fixed inset-0 z-[59] transition-all duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      >
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 bg-[#030306]" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.1) 0%, transparent 50%), radial-gradient(ellipse at center, rgba(236,72,153,0.05) 0%, transparent 60%)",
          }}
        />

        <div
          className="relative h-full flex items-start sm:items-center justify-center px-6 sm:px-16 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile: pt-24 leaves room for the fixed top-right hamburger close
              button (top-6 + 44px button = ~70px). Desktop: items-center handles
              spacing. Reduced mobile gap so the long stacked menu doesn't
              push past viewport. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16 max-w-6xl w-full pt-24 pb-12 sm:py-0">
            {/* Primary nav */}
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase font-mono text-white/25 mb-8">
                Navigate
              </div>
              <div className="space-y-4">
                {pages.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block text-[clamp(1.8rem,3.5vw,2.4rem)] font-black transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent"
                          : "text-white/50 hover:text-white hover:translate-x-2"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-white/[0.06] space-y-3">
                {secondary.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block text-white/40 hover:text-white/80 text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase font-mono text-white/25 mb-8">
                Products
              </div>
              <div className="space-y-3">
                {navProducts.map((p) => (
                  <Link
                    key={p.label}
                    href={p.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 group cursor-pointer py-2"
                  >
                    {/* iPhone home-screen style: every icon sits in an identical
                        rounded-square chip frame with the product accent color
                        as a subtle border + background tint. Internal art varies
                        (logo SVG vs letter mark), the outer frame stays uniform. */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `${p.color}12`,
                        border: `1px solid ${p.color}30`,
                      }}
                    >
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.label}
                          width={44}
                          height={44}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span
                          className="text-sm font-black"
                          style={{ color: `${p.color}cc` }}
                        >
                          {p.icon}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white/60 group-hover:text-white transition-colors">
                        {p.label}
                      </h4>
                      <p className="text-[12px] transition-colors" style={{ color: `${p.color}80` }}>
                        {p.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Thinking / Resources */}
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase font-mono text-white/25 mb-8">
                Our Thinking
              </div>
              <div className="space-y-4">
                {external.map((item) => {
                  const isExternal = item.href.startsWith("http");
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="block group"
                    >
                      <div className="text-white/60 group-hover:text-white text-base font-semibold transition-colors">
                        {item.label}{" "}
                        {isExternal && (
                          <span className="inline-block transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        )}
                      </div>
                      <div className="text-white/25 text-[12px] uppercase tracking-wider font-mono">
                        {item.desc}
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-white/[0.06]">
                <div className="text-[11px] tracking-[0.3em] uppercase font-mono text-white/25 mb-3">
                  Get In Touch
                </div>
                <a
                  href="mailto:hello@level9os.com"
                  className="text-white/50 hover:text-white/80 text-sm font-mono transition-colors"
                >
                  hello@level9os.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

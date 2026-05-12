"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
const pages = [
  { label: "Platform", href: "/" },
  { label: "Architecture", href: "/?surface=architecture" },
  { label: "Products", href: "/?surface=products" },
  { label: "Governance", href: "/?surface=governance" },
  { label: "Work With Us", href: "/?surface=paths" },
];

const secondary = [
  { label: "About Level9OS", href: "/?surface=about" },
  { label: "Contact", href: "/contact" },
];

const external = [
  { label: "Stay Level", href: "https://erichathaway.substack.com", desc: "Eric Hathaway · weekly" },
  { label: "Lucid Insights", href: "https://lucidinsights.substack.com", desc: "Field notes · weekly" },
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
              spacing. Two columns: Navigate + Our Thinking. */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16 max-w-3xl w-full pt-24 pb-12 sm:py-0"
          >
            {/* Primary nav */}
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase font-mono text-white/25 mb-8">
                Navigate
              </div>
              <div className="space-y-4">
                {pages.map((item) => {
                  // Active only for the root route; surface links don't change pathname
                  const isActive = item.href === "/" && pathname === "/";
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
                  className="text-white/50 hover:text-white/80 text-sm font-mono transition-colors block"
                >
                  hello@level9os.com
                </a>
                <a
                  href="https://www.linkedin.com/company/98800696"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 mt-4 transition-all duration-300"
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
                  <span className="text-sm text-white/65 group-hover:text-white/95 transition-colors font-medium">
                    LinkedIn
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

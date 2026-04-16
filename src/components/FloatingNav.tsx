"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  { label: "Overview", href: "/" },
  { label: "Products", href: "/products" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Partnerships", href: "/partnerships" },
];

const secondary = [
  { label: "About Level9", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const products = [
  { label: "StratOS", href: "/products#stratos", color: "#8b5cf6", icon: "S", desc: "AI Decision Rooms" },
  { label: "CommandOS", href: "/products#commandos", color: "#10b981", icon: "C", desc: "Agent Orchestration" },
  { label: "LinkupOS", href: "/products#linkupos", color: "#f59e0b", icon: "U", desc: "Signal Engine" },
  { label: "COO Playbook", href: "/products#playbook", color: "#64748b", icon: "P", desc: "Execution Methodology" },
  { label: "LucidORG", href: "/products#lucidorg", color: "#06b6d4", icon: "O", desc: "Measurement Platform" },
  { label: "MAX", href: "/products#max", color: "#ec4899", icon: "M", desc: "Coming Soon" },
];

const external = [
  { label: "Lucid Insights", href: "https://lucidinsights.substack.com", desc: "Field notes · weekly" },
  { label: "The Alignment Advantage", href: "#", desc: "Book · 2026" },
];

export default function FloatingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Top-left logo / brand mark */}
      <Link
        href="/"
        className={`fixed top-6 left-6 sm:left-8 z-[60] flex items-center gap-3 group transition-all duration-500 ${
          scrolled ? "scale-95" : "scale-100"
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-cyan-500 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
          L9
        </div>
        <div className="hidden sm:block">
          <div className="text-[9px] tracking-[0.3em] uppercase font-semibold text-white/50 group-hover:text-white/80 transition-colors">
            Level9<span className="text-white/30">OS</span>
          </div>
          <div className="text-[8px] text-white/20 tracking-wide">AI for Operations</div>
        </div>
      </Link>

      {/* Top-right menu trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-6 right-6 sm:right-8 z-[60] w-11 h-11 rounded-full border border-white/[0.08] bg-[#0a0a14]/80 backdrop-blur-xl flex flex-col items-center justify-center gap-[5px] transition-all hover:scale-110 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/20"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className={`w-4 h-[1.5px] bg-white/60 transition-all duration-300 ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
        <span className={`w-4 h-[1.5px] bg-white/60 transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`w-4 h-[1.5px] bg-white/60 transition-all duration-300 ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
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
          className="relative h-full flex items-center justify-center px-6 sm:px-16 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16 max-w-6xl w-full py-24 sm:py-0">
            {/* Primary nav */}
            <div>
              <div className="text-[9px] tracking-[0.3em] uppercase font-mono text-white/25 mb-8">
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
              <div className="text-[9px] tracking-[0.3em] uppercase font-mono text-white/25 mb-8">
                Products
              </div>
              <div className="space-y-3">
                {products.map((p) => (
                  <Link
                    key={p.label}
                    href={p.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 group cursor-pointer py-2"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `${p.color}12`,
                        border: `1px solid ${p.color}30`,
                        color: `${p.color}cc`,
                      }}
                    >
                      {p.icon}
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white/60 group-hover:text-white transition-colors">
                        {p.label}
                      </h4>
                      <p className="text-[10px] transition-colors" style={{ color: `${p.color}80` }}>
                        {p.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Thinking / Resources */}
            <div>
              <div className="text-[9px] tracking-[0.3em] uppercase font-mono text-white/25 mb-8">
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
                      <div className="text-white/25 text-[10px] uppercase tracking-wider font-mono">
                        {item.desc}
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-white/[0.06]">
                <div className="text-[9px] tracking-[0.3em] uppercase font-mono text-white/25 mb-3">
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

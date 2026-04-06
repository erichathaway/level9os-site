"use client";

import { useState } from "react";
import Link from "next/link";

const pages = [
  { label: "Home", href: "/" },
  { label: "The Story", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const products = [
  { label: "LinkupOS", href: "/linkupos", color: "#f59e0b", icon: "U", desc: "AI Signal Engine" },
  { label: "COO Playbook", href: "/playbook", color: "#64748b", icon: "P", desc: "Execution Platform" },
  { label: "LucidORG", href: "/lucidorg", color: "#0ea5e9", icon: "O", desc: "AI Org Platform" },
  { label: "StratOS", href: "/stratos", color: "#8b5cf6", icon: "S", desc: "AI Strategic OS" },
  { label: "CommandOS", href: "/commandos", color: "#10b981", icon: "C", desc: "Agent Orchestration" },
];

const company = {
  label: "Level9 Consulting", href: "/level9", color: "#06b6d4", icon: "L9", desc: "AI Accelerator for Ops",
};

export default function FloatingNav({ showBack = true }: { showBack?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-6 right-6 sm:right-8 z-[60] w-10 h-10 rounded-full border border-white/[0.08] bg-[#1a1a2e]/90 backdrop-blur-xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-110 hover:border-violet-500/30 shadow-lg shadow-black/20"
        aria-label="Menu">
        <span className={`w-4 h-[1.5px] bg-white/50 transition-all duration-300 ${open ? "rotate-45 translate-y-[3px]" : ""}`} />
        <span className={`w-4 h-[1.5px] bg-white/50 transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`w-4 h-[1.5px] bg-white/50 transition-all duration-300 ${open ? "-rotate-45 -translate-y-[3px]" : ""}`} />
      </button>

      <div className={`fixed inset-0 z-[59] bg-[#030306] transition-all duration-500 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}>
        <div className="h-full flex items-center justify-center px-6 sm:px-16 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-24 max-w-4xl w-full py-24 sm:py-0">
            <div>
              <div className="text-[9px] tracking-[0.2em] uppercase font-mono text-white/25 mb-6">Level9OS</div>
              <div className="space-y-3">
                {pages.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                    className={`block text-[clamp(1.3rem,3vw,2rem)] font-black transition-all duration-300 ${item.label === "Home" ? "bg-gradient-to-r from-violet-400/60 via-cyan-400/60 to-fuchsia-400/60 bg-clip-text text-transparent hover:from-violet-400 hover:via-cyan-400 hover:to-fuchsia-400" : "text-white/60 hover:text-white"}`}>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <Link href={company.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-4 group cursor-pointer py-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-all duration-300"
                    style={{ background: `${company.color}12`, border: `1px solid ${company.color}25`, color: `${company.color}cc` }}>
                    <span className="group-hover:scale-110 transition-transform inline-block">{company.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white/60 group-hover:text-white transition-colors duration-300">{company.label}</h4>
                    <p className="text-[10px] transition-colors duration-300" style={{ color: `${company.color}60` }}>{company.desc}</p>
                  </div>
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
                <a href="https://erichathaway.com" target="_blank" rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/60 text-sm transition-colors block">Eric Hathaway &rarr;</a>
                <a href="https://linkedin.com/in/erichathaway1" target="_blank" rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/60 text-sm transition-colors block">LinkedIn &rarr;</a>
              </div>
            </div>

            <div>
              <div className="text-[9px] tracking-[0.2em] uppercase font-mono text-white/25 mb-6">Products</div>
              <div className="space-y-3">
                {products.map((p) => (
                  <Link key={p.label} href={p.href} onClick={() => setOpen(false)}
                    className="flex items-center gap-4 group cursor-pointer py-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-all duration-300"
                      style={{ background: `${p.color}12`, border: `1px solid ${p.color}25`, color: `${p.color}cc` }}>
                      <span className="group-hover:scale-110 transition-transform inline-block">{p.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white/60 group-hover:text-white transition-colors duration-300">{p.label}</h4>
                      <p className="text-[10px] transition-colors duration-300" style={{ color: `${p.color}60` }}>{p.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBack && (
        <Link href="/"
          className="fixed top-6 left-6 sm:left-8 z-[55] flex items-center gap-2 text-xs transition-all group px-3 py-1.5 rounded-full bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/[0.06] text-white/40 hover:text-white/70 shadow-lg shadow-black/20">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
          <span className="hidden sm:inline">Back</span>
        </Link>
      )}
    </>
  );
}

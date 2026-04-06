"use client";

import FloatingNav from "@/components/FloatingNav";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#030306] flex items-center justify-center relative overflow-hidden">
      <FloatingNav />

      {/* Subtle ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)", filter: "blur(80px)" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)", filter: "blur(80px)" }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 sm:px-8 text-center relative z-10">
        <div className="text-[10px] text-gray-700 tracking-[0.4em] uppercase mb-12">Connect</div>

        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black leading-[0.9] tracking-tight mb-8">
          <span className="text-white/50 hover:text-white transition-colors duration-300 cursor-default">I&apos;m always interested</span>
          <br />
          <span className="text-white/50 hover:text-white transition-colors duration-300 cursor-default">in the</span>
          {" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">next conversation.</span>
        </h1>

        <p className="text-white/25 text-sm leading-relaxed mb-12 max-w-md mx-auto">
          Whether you need a fractional COO, strategic advisory, or just want to talk about what&apos;s not working — reach out.
        </p>

        <div className="flex flex-col items-center gap-4">
          <a href="mailto:eric@erichathaway.com"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-violet-500/20 bg-violet-500/[0.05] hover:bg-violet-500/[0.15] hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/15 transition-all group text-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 group-hover:text-white transition-colors">eric@erichathaway.com</span>
          </a>

          <a href="https://linkedin.com/in/erichathaway1"
            className="text-gray-600 hover:text-white/50 text-sm transition-colors border border-white/[0.06] rounded-full px-6 py-3 hover:border-white/[0.15]">
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

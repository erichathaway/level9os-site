"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LegalFooter } from "@level9/brand/legal";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Architecture", href: "/architecture" },
  { label: "Products", href: "/products" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter({ variant = "standard" }: { variant?: "standard" | "minimal" }) {
  const pathname = usePathname();

  return (
    <footer
      className={`${variant === "minimal" ? "pt-8" : "pt-12"} pb-4 border-t border-white/[0.04]`}
      style={{ background: "var(--bg-root)" }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className={`${variant === "minimal" ? "w-7 h-7" : "w-8 h-8"} rounded-lg overflow-hidden`}>
            <Image src="/brand/logos/level9/chip.svg" alt="Level9OS" width={32} height={32} className="w-full h-full" />
          </div>
          {variant === "standard" && (
            <div>
              <div className="text-white/50 text-xs font-semibold tracking-wide">Level9OS</div>
              <div className="text-white/20 text-[11px] font-mono">AI for Operations</div>
            </div>
          )}
          {variant === "minimal" && (
            <div className="text-white/30 text-[12px] font-mono">
              &copy; 2026 Level9OS LLC &middot;{" "}
              <a
                href="https://erichathaway.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors"
              >
                Founder &rarr;
              </a>
            </div>
          )}
        </div>

        {variant === "standard" && (
          <div className="flex items-center gap-6 text-[12px] font-mono tracking-wider uppercase flex-wrap justify-center">
            {navLinks
              .filter((link) => link.href !== pathname)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/30 hover:text-white/70 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            <a
              href="https://linkedin.com/company/level9os"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors"
              aria-label="Level9OS on LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        )}

        {variant === "standard" && (
          <div className="text-white/20 text-[11px] font-mono">
            &copy; 2026 Level9OS LLC &middot;{" "}
            <a
              href="https://erichathaway.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/40 transition-colors"
            >
              Founder &rarr;
            </a>
          </div>
        )}

        {variant === "minimal" && (
          <div className="text-white/20 text-[11px] font-mono tracking-wider">
            Built, not advised.
          </div>
        )}
      </div>

      {/* Canonical legal row. Copyright + Privacy / Terms / Cookies links
          resolved from @level9/brand/legal via siteSlug='level9os-site'.
          The hand-rolled copyright above stays for the "Founder →" link;
          this canonical row adds the legal-compliance surface. */}
      <div className="mt-6 pt-4 border-t border-white/[0.03] opacity-60">
        <LegalFooter siteSlug="level9os-site" className="!py-0" />
      </div>
    </footer>
  );
}

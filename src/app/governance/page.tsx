"use client";

import FloatingNav from "@/components/FloatingNav";
import { FadeIn, RevealMask, MagneticCard, CursorGradient, LiveTicker } from "@level9/brand/components/motion";
import SiteFooter from "@/components/SiteFooter";

/* ═══════════════════════════════════════════════════════════
   GOVERNANCE — The Vault landing page
   The chassis under everything: backup, detection, access control,
   anti-lie verification. Each card links to the canonical document.
   ═══════════════════════════════════════════════════════════ */

type DocCard = {
  id: string;
  title: string;
  oneLine: string;
  description: string;
  primaryHref: string;        // the "View" target (HTML or viewer.html?doc=...)
  primaryLabel: string;
  secondaryHref?: string;     // optional download or alt link
  secondaryLabel?: string;
  badges: { label: string; tone?: "vault" | "live" | "design" | "muted" }[];
  meta: { dt: string; dd: string }[];
};

const VAULT_RED = "#ef4444";

const PRIMARY_DOCS: DocCard[] = [
  {
    id: "lvl9-gov-001",
    title: "Backup, Detection & Access Control",
    oneLine: "The Vault chassis. Three-layer backup with WORM immutability, 5-minute tripwire detection, LLM-as-judge access control on the five most-destructive operations.",
    description:
      "LVL9-GOV-001. Operational governance for the Level9 stack. Maps against 3-2-1-1-0, NIST CSF 2.0, ISO 27001, SOC 2 TSC. Includes BIA, RTO/RPO targets per asset, vendor concentration register, recovery procedures, and an open-issues register (GOV-1 through GOV-8).",
    primaryHref: "/governance/backup-and-vault.html",
    primaryLabel: "View document",
    secondaryHref: "/governance/backup-and-vault.md",
    secondaryLabel: "Download .md",
    badges: [
      { label: "v1.4", tone: "vault" },
      { label: "Live", tone: "live" },
      { label: "Internal · NDA-shareable", tone: "muted" },
    ],
    meta: [
      { dt: "Document ID", dd: "LVL9-GOV-001" },
      { dt: "Effective", dd: "2026-05-02" },
      { dt: "Owner", dd: "Eric Hathaway" },
      { dt: "Next review", dd: "2026-08-02" },
    ],
  },
  {
    id: "anti-lie-report",
    title: "Anti-Lie Governance",
    oneLine:
      "Keep the LLM out of court. Every \"done\" claim must register a deterministic verifier that reads canonical state — Vercel, GitHub, Supabase, the file system — and returns PASS, FAIL, or ERROR. No model. No probability.",
    description:
      "Eight-component product report. The 10 Laws, cmd_claims / cmd_verifications / cmd_law_violations data plane, the Stop hook chokepoint, the OPS-Lie-Watchdog n8n workflow, and the proxy layer for non-Claude-Code calls. Build 17.10. Sibling chassis to LVL9-GOV-001.",
    primaryHref: "/governance/viewer.html?doc=anti-lie-report.md",
    primaryLabel: "View report",
    secondaryHref: "/governance/viewer.html?doc=anti-lie-design.md",
    secondaryLabel: "View original design",
    badges: [
      { label: "Build 17.10", tone: "vault" },
      { label: "Live", tone: "live" },
      { label: "Internal · NDA-shareable", tone: "muted" },
    ],
    meta: [
      { dt: "Status", dd: "Build 17.10" },
      { dt: "Effective", dd: "2026-05-02" },
      { dt: "Owner", dd: "Eric Hathaway" },
      { dt: "Sibling chassis", dd: "LVL9-GOV-001" },
    ],
  },
];

const SUPPORTING_DOCS: { title: string; href: string; oneLine: string }[] = [
  {
    title: "Anti-Lie · Original Design",
    href: "/governance/viewer.html?doc=anti-lie-design.md",
    oneLine:
      "The 2026-04-29 design memo. Architecture, the five chokepoints, walk-back protocol, why an LLM judge is structurally insufficient.",
  },
  {
    title: "Anti-Lie · Market Research",
    href: "/governance/viewer.html?doc=anti-lie-market-research.md",
    oneLine:
      "Where this fits in the 2026 LLM-governance landscape. Comparison vs. RAGAS, Galileo, Patronus, Arize, Lakera.",
  },
  {
    title: "Anti-Lie · Commandos Prompt",
    href: "/governance/viewer.html?doc=anti-lie-commandos-prompt.md",
    oneLine:
      "The system-prompt scaffolding that names the 10 Laws and the verifier registration contract.",
  },
];

export default function GovernancePage() {
  return (
    <main className="min-h-dvh relative">
      <FloatingNav />
      <CursorGradient color="rgba(239,68,68,0.08)" />
      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════════
          HERO — The Vault
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative pt-40 pb-24 overflow-hidden"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[700px] h-[700px] rounded-full top-0 right-0"
            style={{
              background: "radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 60%)",
              filter: "blur(120px)",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full bottom-0 left-0"
            style={{
              background: "radial-gradient(circle, rgba(20,8,46,0.6) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
          <FadeIn>
            <div
              className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.45)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: VAULT_RED }}
              />
              <span
                className="text-[12px] font-mono tracking-[0.3em] uppercase"
                style={{ color: VAULT_RED }}
              >
                The Vault · Governance Chassis
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2 mb-10">
            <RevealMask>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white/95">
                Operational
              </h1>
            </RevealMask>
            <RevealMask delay={150}>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${VAULT_RED} 0%, #f97316 50%, ${VAULT_RED} 100%)`,
                  }}
                >
                  Governance.
                </span>
              </h1>
            </RevealMask>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-white/55 text-lg max-w-2xl mb-8 font-light leading-relaxed">
              Backup, detection, access control, and anti-lie verification. The chassis under
              every Level9 product. Audit trail, budget enforcement, quality gates, secrets vault.
              AEGIS-aligned. Policy-as-code. Not a feature of one product. The foundation every
              product sits on.
            </p>
          </FadeIn>

          <FadeIn delay={0.55}>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">
              <span className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                3-2-1-1-0 Backup Rule
              </span>
              <span className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                LLM-as-Judge
              </span>
              <span className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                Object Lock · Compliance Mode
              </span>
              <span className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                NIST CSF 2.0
              </span>
              <span className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                ISO 27001 A.8.13
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRIMARY DOCUMENTS
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="flex items-baseline gap-4 mb-3">
              <span
                className="text-[11px] font-mono tracking-[0.22em] uppercase"
                style={{ color: VAULT_RED }}
              >
                01 · Live Documents
              </span>
            </div>
            <h2
              className="font-bold text-3xl sm:text-4xl tracking-tight text-white/95 mb-12"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              The two governance chassis.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PRIMARY_DOCS.map((doc, i) => (
              <FadeIn key={doc.id} delay={0.1 + i * 0.1}>
                <MagneticCard className="h-full">
                  <article
                    className="relative h-full p-8 sm:p-10 rounded-2xl overflow-hidden"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Top accent rule */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: VAULT_RED }}
                    />

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {doc.badges.map((b) => (
                        <span
                          key={b.label}
                          className="text-[10px] font-mono tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
                          style={
                            b.tone === "vault"
                              ? {
                                  background: "rgba(239,68,68,0.10)",
                                  color: VAULT_RED,
                                  border: "1px solid rgba(239,68,68,0.35)",
                                }
                              : b.tone === "live"
                              ? {
                                  background: "rgba(16,185,129,0.10)",
                                  color: "#10b981",
                                  border: "1px solid rgba(16,185,129,0.35)",
                                }
                              : b.tone === "design"
                              ? {
                                  background: "rgba(245,158,11,0.10)",
                                  color: "#f59e0b",
                                  border: "1px solid rgba(245,158,11,0.35)",
                                }
                              : {
                                  background: "rgba(255,255,255,0.04)",
                                  color: "rgba(255,255,255,0.55)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                }
                          }
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>

                    <h3
                      className="text-2xl sm:text-3xl font-bold tracking-tight text-white/95 mb-4"
                      style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
                    >
                      {doc.title}
                    </h3>

                    <p className="text-white/65 leading-relaxed mb-5 italic">{doc.oneLine}</p>

                    <p className="text-white/45 text-sm leading-relaxed mb-8">{doc.description}</p>

                    {/* Metadata grid */}
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-8 pb-8 border-b border-white/[0.06]">
                      {doc.meta.map((m) => (
                        <div key={m.dt}>
                          <dt className="text-[10px] font-mono tracking-[0.16em] uppercase text-white/35 mb-0.5">
                            {m.dt}
                          </dt>
                          <dd className="text-sm text-white/85">{m.dd}</dd>
                        </div>
                      ))}
                    </dl>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={doc.primaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition"
                        style={{
                          background: VAULT_RED,
                          color: "white",
                        }}
                      >
                        <span>{doc.primaryLabel}</span>
                        <span aria-hidden="true">→</span>
                      </a>
                      {doc.secondaryHref && (
                        <a
                          href={doc.secondaryHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.85)",
                            border: "1px solid rgba(255,255,255,0.10)",
                          }}
                        >
                          {doc.secondaryLabel}
                        </a>
                      )}
                    </div>
                  </article>
                </MagneticCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SUPPORTING DOCUMENTS
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="flex items-baseline gap-4 mb-3">
              <span
                className="text-[11px] font-mono tracking-[0.22em] uppercase"
                style={{ color: VAULT_RED }}
              >
                02 · Supporting Material
              </span>
            </div>
            <h2
              className="font-bold text-3xl sm:text-4xl tracking-tight text-white/95 mb-3"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              Source documents and design memos.
            </h2>
            <p className="text-white/55 text-base mb-12 max-w-2xl">
              The build journals, market research, and original design memos that the live
              chassis above grew out of. For reviewers who want to see the work, not just the
              outcome.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUPPORTING_DOCS.map((doc, i) => (
              <FadeIn key={doc.href} delay={0.1 + i * 0.08}>
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full p-6 rounded-xl transition group"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="text-[10px] font-mono tracking-[0.18em] uppercase mb-3"
                    style={{ color: VAULT_RED }}
                  >
                    Memo
                  </div>
                  <h3 className="text-lg font-semibold text-white/90 mb-2 group-hover:text-white transition">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-white/55 leading-relaxed">{doc.oneLine}</p>
                  <div className="mt-4 text-[12px] font-mono text-white/35 group-hover:text-white/55 transition">
                    Open →
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          POSTURE
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative py-24 sm:py-32"
        style={{ background: "var(--bg-root)" }}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-12">
          <FadeIn>
            <div className="flex items-baseline gap-4 mb-3">
              <span
                className="text-[11px] font-mono tracking-[0.22em] uppercase"
                style={{ color: VAULT_RED }}
              >
                03 · Posture
              </span>
            </div>
            <h2
              className="font-bold text-3xl sm:text-4xl tracking-tight text-white/95 mb-8"
              style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
            >
              What this is, and what it is not.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn delay={0.1}>
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">What this IS</h3>
                <ul className="space-y-2 text-white/65 text-[15px] leading-relaxed">
                  <li>
                    Operational governance for a single-operator stack running AI agents at scale.
                  </li>
                  <li>
                    The technical-controls evidence half of a SOC 2 Type II package, mapped against
                    NIST CSF 2.0 and ISO 27001 A.8.13.
                  </li>
                  <li>
                    A reference architecture for the solo and small-operator segment that no other
                    published document currently serves at this depth.
                  </li>
                  <li>Honest about residual risk. Open issues tracked as a register.</li>
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">What this is NOT</h3>
                <ul className="space-y-2 text-white/65 text-[15px] leading-relaxed">
                  <li>
                    Not a complete information security policy. Application-layer security is out
                    of scope.
                  </li>
                  <li>
                    Not for regulated data (HIPAA, PCI-DSS, FedRAMP, GDPR Article 9). Customer
                    data is protected by underlying platforms.
                  </li>
                  <li>
                    Not multi-tenant access governance. Not built for &gt;$10M ARR scale or
                    insider-threat scenarios.
                  </li>
                  <li>
                    Not a vendor risk assessment. Vendors carry their own attestations; we
                    document concentration risk.
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <p className="mt-12 text-white/40 text-sm font-mono tracking-wider">
              Classified Internal · Shareable under NDA · © Eric Hathaway · Effective 2026-05-02
            </p>
          </FadeIn>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

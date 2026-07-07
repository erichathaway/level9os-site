/**
 * /portal/[lens] — Living Record R3 Phase 2 lens-scoped portal skeleton.
 *
 * Server component. Valid lenses: internal, board, investor. Any other
 * value renders the standard Next.js `notFound()` 404 (no other dynamic
 * route in this repo exists yet to establish a different convention, so
 * this follows the framework default).
 *
 * Data comes from src/lib/portal/renderings.ts — the exact same
 * server-only, lens-gated query used by /api/portal/renderings. No
 * client-side fetch of this data ever happens; everything below is
 * rendered on the server before the response leaves the process.
 */

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import {
  getApprovedRenderingsForLens,
  isValidLens,
  VALID_LENSES,
  type Lens,
} from "@/lib/portal/renderings";
import internalTheme from "@/portal-themes/internal.json";
import boardTheme from "@/portal-themes/board.json";
import investorTheme from "@/portal-themes/investor.json";

// R3 Phase 4: per-lens token theming. Each JSON file is a flat map of CSS
// custom properties whose VALUES are existing brand tokens (var(--emerald),
// var(--slate), var(--cyan), var(--radius-*) from globals.css) — no
// invented hex. Injected as a scoped inline style on the page wrapper
// below; the DOM structure never branches per lens, only these variable
// values do.
const LENS_THEMES: Record<Lens, Record<string, string>> = {
  internal: internalTheme,
  board: boardTheme,
  investor: investorTheme,
};

// Strip raw HTML tokens from rendered markdown. content_md is composed by
// render.mjs from our own record data (never end-user input), but some
// fields (e.g. governance violation labels) originate from other systems.
// We don't trust dangerouslySetInnerHTML with unescaped raw HTML passthrough
// just because the pipeline is "internal" — marked does NOT sanitize HTML by
// default, so any `<tag>` in a markdown source string would pass straight
// through to the DOM. Overriding the `html` token renderer to a no-op is a
// zero-dependency way to close that off without adding a second package
// (DOMPurify etc.) beyond the one new dependency this task allows.
const renderer = new marked.Renderer();
renderer.html = () => "";
marked.setOptions({ renderer });

const LENS_LABEL: Record<Lens, string> = {
  internal: "Internal",
  board: "Board",
  investor: "Investor",
};

interface PageProps {
  params: { lens: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const lens = params.lens;
  const label = isValidLens(lens) ? LENS_LABEL[lens] : "Portal";
  return {
    title: `${label} Portal · Level9OS`,
    robots: { index: false, follow: false },
  };
}

export default async function PortalLensPage({ params }: PageProps) {
  const { lens } = params;

  if (!isValidLens(lens)) {
    notFound();
  }

  const { renderings } = await getApprovedRenderingsForLens(lens);

  // Scoped inline style: standard CSS custom properties plus the lens
  // theme's vars, injected on this one wrapper. Every descendant that
  // references var(--portal-accent) / var(--portal-radius) inherits
  // whichever lens's values were injected here — no per-lens branching in
  // the JSX below.
  const wrapperStyle: CSSProperties = {
    minHeight: "100dvh",
    background: "var(--bg-root)",
    color: "var(--text-primary)",
    padding: "48px 24px",
    ...(LENS_THEMES[lens] as CSSProperties),
  };

  return (
    <main style={wrapperStyle}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--portal-accent)",
              border: "1px solid var(--portal-accent)",
              borderRadius: "var(--radius-full)",
              padding: "4px 10px",
            }}
          >
            {LENS_LABEL[lens]} lens
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: 32,
            color: "var(--text-primary)",
          }}
        >
          Living Record Portal
        </h1>

        {renderings.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {renderings.map((r) => (
              <RenderingCard key={`${r.template}-${r.period}`} rendering={r} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: 32,
        color: "var(--text-secondary)",
      }}
    >
      No approved content for this lens yet.
    </div>
  );
}

function RenderingCard({
  rendering,
}: {
  rendering: { template: string; period: string; status: string; content_md: string | null };
}) {
  const { template, period, content_md } = rendering;

  return (
    <article
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--portal-radius, var(--radius-lg))",
        padding: 32,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          marginBottom: 16,
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
        }}
      >
        {template} · {period}
      </div>
      {content_md ? (
        <div
          className="portal-markdown"
          style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: marked.parse(content_md, { async: false }) }}
        />
      ) : (
        <p style={{ color: "var(--text-secondary)" }}>
          This rendering has been approved but its content has not been generated yet.
        </p>
      )}
    </article>
  );
}

export function generateStaticParams() {
  return VALID_LENSES.map((lens) => ({ lens }));
}

/**
 * Portal renderings — shared server-only data access for the Living Record
 * R3 Phase 2 lens-scoped portal.
 *
 * Used by BOTH `src/app/api/portal/renderings/route.ts` (the public API
 * route) and `src/app/portal/[lens]/page.tsx` (the server component). This
 * is the idiomatic Next.js App Router pattern for sharing data-fetching
 * logic between a Route Handler and a Server Component without an internal
 * HTTP self-fetch (which would need a guessed deployment origin).
 *
 * All Supabase querying/filtering happens here, server-side only. Nothing
 * in this module is imported by client components. A lens NEVER receives
 * another lens's rendering: every query filters by `rnd_templates.audience`
 * before any rendering row is read, so cross-lens leakage is structurally
 * impossible, not just filtered client-side.
 */

// ─── Lens vocabulary ──────────────────────────────────────────────────────

export const VALID_LENSES = ["internal", "board", "investor"] as const;
export type Lens = (typeof VALID_LENSES)[number];

export function isValidLens(value: string): value is Lens {
  return (VALID_LENSES as readonly string[]).includes(value);
}

// ─── Approved/current status vocabulary ──────────────────────────────────
//
// Read from the actual rendering-engine source
// (Level9/governance/level9-operations/services/rendering-engine/render.mjs)
// and the actual rnd_renderings rows (queried directly, not assumed):
//
// - render.mjs sets status='published' (gate='auto-publish' templates) or
//   status='awaiting_gate' (gate='operator-gate' templates) on FIRST render,
//   and leaves status untouched on re-render (`else` branch only updates
//   content/content_md/verified_at).
// - approve.mjs moves 'awaiting_gate' -> 'published' and REFUSES any row
//   not currently 'awaiting_gate' — that refusal IS the approval gate.
// - The two live seed rows (weekly-ops-report/2026-W26,
//   quarterly-board-pack/2026-Q2) carry status='current', an R1 seed-era
//   value that predates the R2 engine's own 'published'/'awaiting_gate'
//   vocabulary. check-stale.mjs treats 'current' and 'published' as the
//   same "live, monitor for staleness" bucket alongside 'awaiting_gate'
//   (which it also monitors but which approve.mjs treats as NOT yet
//   approved). Because render.mjs's own re-render path never touches
//   status, 'current' is the row's durable "this is the active version"
//   state, functionally equivalent to 'published' for display purposes.
//
// Approved for portal display: 'current' and 'published'.
// Excluded: 'awaiting_gate' (not yet through the approval gate) and
// 'stale' (flagged by check-stale.mjs as out of date).
const APPROVED_STATUSES = ["current", "published"];

// ─── Supabase env resolution ──────────────────────────────────────────────
//
// Same variable names + fallback order as src/app/api/chat/route.ts:
// NEXT_PUBLIC_SUPABASE_URL, then SUPABASE_ANON_KEY ?? NEXT_PUBLIC_SUPABASE_ANON_KEY.
//
// chat/route.ts uses those env vars only as a vehicle to reach the
// get_secret RPC for a DIFFERENT secret (the Anthropic key) — it never
// needs a fallback for the Supabase URL/key themselves, because if they're
// absent it just returns null and the caller degrades gracefully. This
// route is different: it needs the Supabase URL/anon key THEMSELVES to
// read rnd_templates/rnd_renderings (both anon-readable per the
// rendering-engine README's "Access" section — no service_role needed for
// reads). So when env vars are absent, this falls back to the same
// non-secret bootstrap constants already committed elsewhere in this exact
// portfolio for this exact Supabase project — see
// level9-governance/lib/supabase.mjs ("Public anon key — safe to embed,
// RLS-locked tables are protected by policy") and
// linkupos-site/src/lib/routing-log.js (identical env-var-first /
// hardcoded-fallback shape). This is not a new pattern; it's the
// established one for this project ref.
const FALLBACK_SUPABASE_URL = "https://xwmjrphmdjhlhveyyfey.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3bWpycGhtZGpobGh2ZXl5ZmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTc5MDgsImV4cCI6MjA4NzE5MzkwOH0.P1DfiIshwfC6Qq80q7MxmwBgy86Q9qg8d3qc_acWEuI";

interface SupabaseConfig {
  url: string;
  key: string;
}

function resolveSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    FALLBACK_SUPABASE_ANON_KEY;
  return { url, key };
}

async function supabaseSelect<T>(config: SupabaseConfig, path: string): Promise<T[]> {
  const res = await fetch(`${config.url}/rest/v1/${path}`, {
    headers: { apikey: config.key },
    // Portal content changes only via render.mjs/approve.mjs runs (rare,
    // operator-triggered); no need for Next.js Data Cache to serve stale
    // gated content indefinitely, but a short revalidate avoids hammering
    // Supabase on every request.
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`SELECT ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface RndTemplateRow {
  id: string;
  name: string;
  audience: string;
}

interface RndRenderingRow {
  id: string;
  template_id: string;
  period: string;
  status: string;
  content_md: string | null;
  published_at: string | null;
  verified_at: string | null;
}

export interface PortalRendering {
  template: string;
  period: string;
  status: string;
  content_md: string | null;
  published_at: string | null;
}

export interface PortalLensResult {
  lens: Lens;
  renderings: PortalRendering[];
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch every approved/current rendering whose template audience matches
 * `lens`. Server-only. Returns `renderings: []` if Supabase is unreachable
 * or the lens has no templates/renderings yet — callers render that as the
 * "no approved content yet" empty state, never as a thrown error that could
 * leak internals.
 */
export async function getApprovedRenderingsForLens(lens: Lens): Promise<PortalLensResult> {
  const config = resolveSupabaseConfig();

  let templates: RndTemplateRow[];
  try {
    templates = await supabaseSelect<RndTemplateRow>(
      config,
      `rnd_templates?audience=eq.${encodeURIComponent(lens)}&select=id,name,audience`
    );
  } catch (err) {
    console.error("[portal/renderings] template lookup failed:", err);
    return { lens, renderings: [] };
  }

  if (templates.length === 0) {
    return { lens, renderings: [] };
  }

  const templateIds = templates.map((t) => t.id);
  const templateNameById = new Map(templates.map((t) => [t.id, t.name]));
  const statusFilter = APPROVED_STATUSES.join(",");
  const idsFilter = templateIds.join(",");

  let renderings: RndRenderingRow[];
  try {
    renderings = await supabaseSelect<RndRenderingRow>(
      config,
      `rnd_renderings?template_id=in.(${idsFilter})&status=in.(${statusFilter})&select=id,template_id,period,status,content_md,published_at,verified_at&order=period.desc`
    );
  } catch (err) {
    console.error("[portal/renderings] rendering lookup failed:", err);
    return { lens, renderings: [] };
  }

  return {
    lens,
    renderings: renderings.map((r) => ({
      template: templateNameById.get(r.template_id) ?? "unknown-template",
      period: r.period,
      status: r.status,
      content_md: r.content_md,
      published_at: r.published_at,
    })),
  };
}

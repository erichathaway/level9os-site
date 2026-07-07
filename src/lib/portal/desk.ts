/**
 * The Desk — Living Record R3 Phase 3 faceted query engine.
 *
 * Server-only. Used by `src/app/api/desk/search/route.ts` and by
 * `src/app/desk/page.tsx` (to resolve the profile list for the
 * dev/preview-gated LensSwitcher). Reuses the Supabase env-resolution +
 * fetch helper already established in `src/lib/portal/renderings.ts`
 * (Phase 2) rather than re-deriving it.
 *
 * Visibility rule (all gating happens HERE, server-side, before any asset
 * leaves this module — never in a client component):
 *
 *   An asset is VISIBLE to a profile if:
 *     - audience_class is 'public' or 'internal', OR
 *     - audience_class is 'dept' AND asset.dept_owner === profile.dept, OR
 *     - audience_class appears in profile.clearances
 *
 *   Everything else is LOCKED. A locked asset is still returned so the
 *   caller can render an existence-only stub, but ONLY id/title/asset_type
 *   ever leave this module for a locked row — description, dept_owner,
 *   audience_class, current_version, last_verified_at are never attached to
 *   a locked result. That is a structural guarantee (see `toDeskAsset`
 *   below), not a client-side filter.
 */

import { resolveSupabaseConfig, supabaseSelect } from "./renderings";

// ─── Types ─────────────────────────────────────────────────────────────────

interface RecUserProfileRow {
  id: string;
  display_name: string;
  dept: string;
  role: string;
  clearances: string[];
}

export interface DeskProfile {
  id: string;
  display_name: string;
  dept: string;
  role: string;
  clearances: string[];
}

interface RecAssetRow {
  id: string;
  title: string;
  asset_type: string;
  dept_owner: string;
  audience_class: string;
  description: string | null;
  current_version: string | null;
  last_verified_at: string | null;
  created_at: string;
}

export interface VisibleDeskAsset {
  locked: false;
  id: string;
  title: string;
  asset_type: string;
  dept_owner: string;
  audience_class: string;
  description: string | null;
  current_version: string | null;
  last_verified_at: string | null;
}

// Existence-only stub. No other field is ever populated for a locked asset.
export interface LockedDeskAsset {
  locked: true;
  id: string;
  title: string;
  asset_type: string;
}

export type DeskAsset = VisibleDeskAsset | LockedDeskAsset;

export interface DeskSearchParams {
  profileId: string;
  query?: string;
  dept?: string;
  type?: string;
}

export interface DeskSearchResult {
  profile: { id: string; dept: string; clearances: string[] } | null;
  assets: DeskAsset[];
  error?: string;
}

// ─── Visibility ─────────────────────────────────────────────────────────────

function isVisible(asset: RecAssetRow, profile: RecUserProfileRow): boolean {
  if (asset.audience_class === "public" || asset.audience_class === "internal") {
    return true;
  }
  if (asset.audience_class === "dept" && asset.dept_owner === profile.dept) {
    return true;
  }
  return profile.clearances.includes(asset.audience_class);
}

function toDeskAsset(asset: RecAssetRow, profile: RecUserProfileRow): DeskAsset {
  if (!isVisible(asset, profile)) {
    return { locked: true, id: asset.id, title: asset.title, asset_type: asset.asset_type };
  }
  return {
    locked: false,
    id: asset.id,
    title: asset.title,
    asset_type: asset.asset_type,
    dept_owner: asset.dept_owner,
    audience_class: asset.audience_class,
    description: asset.description,
    current_version: asset.current_version,
    last_verified_at: asset.last_verified_at,
  };
}

// ─── Profiles (for the LensSwitcher + profile lookup) ──────────────────────

/**
 * All rec_user_profiles rows, for the dev/preview-only LensSwitcher. Never
 * imported by anything reachable from a production request path that
 * doesn't already gate on dev/preview — see src/app/desk/page.tsx.
 */
export async function getDeskProfiles(): Promise<DeskProfile[]> {
  const config = resolveSupabaseConfig();
  try {
    return await supabaseSelect<DeskProfile>(
      config,
      "rec_user_profiles?select=id,display_name,dept,role,clearances&order=dept.asc"
    );
  } catch (err) {
    console.error("[desk] profile list lookup failed:", err);
    return [];
  }
}

// ─── Search ─────────────────────────────────────────────────────────────────

/**
 * Faceted asset search for a single profile. Text query matches
 * title/description (case-insensitive substring, PostgREST `ilike`).
 * Facet filters (`dept`, `type`) narrow by dept_owner / asset_type.
 *
 * The filters/query apply across ALL matching assets, visible and locked
 * alike — a locked asset that matches the query still surfaces as an
 * existence-only stub. Visibility is decided per-row after the query runs,
 * never by excluding locked rows from the result set.
 */
export async function searchDesk(params: DeskSearchParams): Promise<DeskSearchResult> {
  const config = resolveSupabaseConfig();

  let profiles: RecUserProfileRow[];
  try {
    profiles = await supabaseSelect<RecUserProfileRow>(
      config,
      `rec_user_profiles?id=eq.${encodeURIComponent(params.profileId)}&select=id,display_name,dept,role,clearances`
    );
  } catch (err) {
    console.error("[desk/search] profile lookup failed:", err);
    return { profile: null, assets: [], error: "profile lookup failed" };
  }

  const profile = profiles[0];
  if (!profile) {
    return { profile: null, assets: [], error: "unknown profile" };
  }

  const qs: string[] = [
    "select=id,title,asset_type,dept_owner,audience_class,description,current_version,last_verified_at,created_at",
    "order=last_verified_at.desc.nullslast,created_at.desc",
  ];
  if (params.dept) {
    qs.push(`dept_owner=eq.${encodeURIComponent(params.dept)}`);
  }
  if (params.type) {
    qs.push(`asset_type=eq.${encodeURIComponent(params.type)}`);
  }
  if (params.query && params.query.trim()) {
    // PostgREST embedded-filter `ilike` syntax: `*` is the wildcard. Strip
    // any `*`/`%` the caller typed so they can't inject their own wildcard
    // patterns into the filter.
    const q = params.query.trim().replace(/[%*]/g, "");
    qs.push(
      `or=(title.ilike.*${encodeURIComponent(q)}*,description.ilike.*${encodeURIComponent(q)}*)`
    );
  }

  let assets: RecAssetRow[];
  try {
    assets = await supabaseSelect<RecAssetRow>(config, `rec_assets?${qs.join("&")}`);
  } catch (err) {
    console.error("[desk/search] asset query failed:", err);
    return {
      profile: { id: profile.id, dept: profile.dept, clearances: profile.clearances },
      assets: [],
      error: "asset query failed",
    };
  }

  return {
    profile: { id: profile.id, dept: profile.dept, clearances: profile.clearances },
    assets: assets.map((a) => toDeskAsset(a, profile)),
  };
}

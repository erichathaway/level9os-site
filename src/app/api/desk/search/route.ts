/**
 * /api/desk/search
 *
 * Living Record R3 Phase 3: server-only faceted search over rec_assets,
 * gated per-profile. Accepts:
 *   - `profile` (required) — a rec_user_profiles.id
 *   - `q`       (optional) — free-text query, matched against title/description
 *   - `dept`    (optional) — facet filter on dept_owner
 *   - `type`    (optional) — facet filter on asset_type
 *
 * All visibility gating happens in src/lib/portal/desk.ts, before any
 * asset row reaches this handler. Locked assets come back as
 * existence-only stubs (id/title/asset_type) — this route never adds
 * fields back onto a locked result.
 *
 * `profile` is a caller-supplied id, not an authenticated session — see
 * the comment on LensSwitcher.tsx. This route enforces the audience_class
 * visibility rule for whichever profile id it's given; it does not (yet)
 * verify the caller IS that profile.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchDesk } from "@/lib/portal/desk";
import { matchDeskAlias } from "@/lib/portal/aliases";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const profileId = sp.get("profile");

  if (!profileId) {
    return NextResponse.json(
      { error: "profile query param (rec_user_profiles.id) is required." },
      { status: 400 }
    );
  }

  const query = sp.get("q") ?? undefined;
  const dept = sp.get("dept") ?? undefined;
  const type = sp.get("type") ?? undefined;

  const result = await searchDesk({ profileId, query, dept, type });

  if (result.error === "unknown profile") {
    return NextResponse.json({ error: "unknown profile" }, { status: 404 });
  }

  const alias = matchDeskAlias(query);

  return NextResponse.json({ ...result, alias });
}

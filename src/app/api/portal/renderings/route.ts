/**
 * /api/portal/renderings
 *
 * Living Record R3 Phase 2: server-gated read of approved rnd_renderings
 * for a single lens. Accepts `?lens=internal|board|investor`.
 *
 * All Supabase querying/filtering happens in src/lib/portal/renderings.ts,
 * which filters by `rnd_templates.audience` BEFORE reading any rendering
 * row. A lens can never receive another lens's content through this route.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApprovedRenderingsForLens, isValidLens } from "@/lib/portal/renderings";

export async function GET(req: NextRequest) {
  const lensParam = req.nextUrl.searchParams.get("lens");

  if (!lensParam || !isValidLens(lensParam)) {
    return NextResponse.json(
      { error: "lens query param is required and must be one of: internal, board, investor." },
      { status: 400 }
    );
  }

  const result = await getApprovedRenderingsForLens(lensParam);
  return NextResponse.json(result);
}

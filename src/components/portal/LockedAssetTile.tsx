/**
 * LockedAssetTile — Living Record R3 Phase 3.
 *
 * Renders an existence-only Desk search result: the asset is known to
 * exist, but the current profile lacks visibility. Only id/title/asset_type
 * ever reach this component (enforced server-side in src/lib/portal/desk.ts)
 * — there is no description, owner, or content to accidentally render here.
 *
 * Styling uses only existing brand tokens: `.bg-surface-40` + `.frosted-locked`
 * (globals.css) for the frosted-glass treatment, and the standard
 * --border-subtle / --text-* / --radius-lg custom properties. Zero new
 * hardcoded hex.
 */

import type { LockedDeskAsset } from "@/lib/portal/desk";

export default function LockedAssetTile({ asset }: { asset: LockedDeskAsset }) {
  return (
    <div
      className="bg-surface-40 frosted-locked"
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-subtle)",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
        }}
      >
        {asset.asset_type}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-muted)" }}>
        {asset.title}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-subtle)" }}>
        exists · request access
      </div>
    </div>
  );
}

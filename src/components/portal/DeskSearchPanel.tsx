"use client";

/**
 * DeskSearchPanel — Living Record R3 Phase 3.
 *
 * Client component: search box + facet chips + results. Calls
 * /api/desk/search directly (never queries Supabase from the browser) —
 * every gating decision already happened server-side by the time this
 * component receives a response. See src/app/api/desk/search/route.ts and
 * src/lib/portal/desk.ts.
 */

import { useEffect, useState } from "react";
import LockedAssetTile from "./LockedAssetTile";
import type { DeskAlias } from "@/lib/portal/aliases";
import type { DeskAsset } from "@/lib/portal/desk";

const DEPT_FACETS = ["sales", "finance", "partnerships", "engineering", "marketing", "exec"];
const TYPE_FACETS = ["deck", "doc", "report", "dataset", "template"];

interface SearchResponse {
  profile: { id: string; dept: string; clearances: string[] } | null;
  assets: DeskAsset[];
  alias: DeskAlias | null;
  error?: string;
}

export default function DeskSearchPanel({ profileId }: { profileId: string }) {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ profile: profileId });
    if (query.trim()) params.set("q", query.trim());
    if (dept) params.set("dept", dept);
    if (type) params.set("type", type);

    let cancelled = false;
    setLoading(true);
    fetch(`/api/desk/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data: SearchResponse) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        console.error("[DeskSearchPanel] search failed:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profileId, query, dept, type]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search the Desk (try "board deck")'
        style={{
          width: "100%",
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          fontSize: 15,
          marginBottom: 16,
        }}
      />

      {result?.alias && (
        <a
          href={result.alias.href}
          style={{
            display: "block",
            marginBottom: 16,
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--violet)",
            background: "var(--violet-soft)",
            color: "var(--text-primary)",
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Did you mean: {result.alias.label} &rarr; {result.alias.href}
        </a>
      )}

      <FacetRow label="Dept" options={DEPT_FACETS} active={dept} onSelect={setDept} />
      <FacetRow label="Type" options={TYPE_FACETS} active={type} onSelect={setType} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {loading && <p style={{ color: "var(--text-muted)" }}>Searching...</p>}
        {!loading && result?.assets.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>No results.</p>
        )}
        {!loading &&
          result?.assets.map((asset) =>
            asset.locked ? (
              <LockedAssetTile key={asset.id} asset={asset} />
            ) : (
              <VisibleAssetTile key={asset.id} asset={asset} />
            )
          )}
      </div>
    </div>
  );
}

function FacetRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  active: string | null;
  onSelect: (value: string | null) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 40 }}>{label}</span>
      <Chip label="All" isActive={active === null} onClick={() => onSelect(null)} />
      {options.map((opt) => (
        <Chip key={opt} label={opt} isActive={active === opt} onClick={() => onSelect(opt)} />
      ))}
    </div>
  );
}

function Chip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: "var(--radius-full)",
        border: `1px solid ${isActive ? "var(--violet)" : "var(--border-medium)"}`,
        background: isActive ? "var(--violet-soft)" : "transparent",
        color: isActive ? "var(--text-primary)" : "var(--text-muted)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function VisibleAssetTile({
  asset,
}: {
  asset: Extract<DeskAsset, { locked: false }>;
}) {
  return (
    <div
      className="bg-surface-70"
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
          color: "var(--text-muted)",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
        }}
      >
        {asset.asset_type} · {asset.dept_owner} · {asset.audience_class}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{asset.title}</div>
      {asset.description && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {asset.description}
        </p>
      )}
    </div>
  );
}

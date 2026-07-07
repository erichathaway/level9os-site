"use client";

/**
 * LensSwitcher — Living Record R3 Phase 3.
 *
 * THIS IS NOT AUTHENTICATION. It is a dev/preview-only convenience that
 * lets whoever is looking at the Desk page pick which rec_user_profiles
 * row to view the search results as, via `?as=<profile_id>` (persisted to
 * a `desk_profile` cookie so it survives navigation without the query
 * param). It proves the visibility rule; it does not enforce who a real
 * signed-in user is allowed to impersonate. src/app/desk/page.tsx only
 * renders this component — and only honors `?as=`/the cookie at all — when
 * `isDevOrPreview` is true (mirrors the isPreview gate in
 * src/app/layout.tsx). In production the Desk always falls back to the
 * least-privileged profile.
 */

import { useRouter } from "next/navigation";
import type { DeskProfile } from "@/lib/portal/desk";

interface LensSwitcherProps {
  profiles: DeskProfile[];
  activeProfileId: string;
}

export default function LensSwitcher({ profiles, activeProfileId }: LensSwitcherProps) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    document.cookie = `desk_profile=${id}; path=/; max-age=2592000`;
    router.push(`/desk?as=${id}`);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
        fontSize: 12,
        color: "var(--text-muted)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-full)",
          padding: "3px 8px",
          color: "var(--amber)",
        }}
      >
        Dev · not auth
      </span>
      <label htmlFor="lens-switcher-select">Viewing as</label>
      <select
        id="lens-switcher-select"
        value={activeProfileId}
        onChange={handleChange}
        style={{
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-sm)",
          padding: "4px 8px",
          fontSize: 12,
        }}
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.display_name} · {p.dept}
          </option>
        ))}
      </select>
    </div>
  );
}

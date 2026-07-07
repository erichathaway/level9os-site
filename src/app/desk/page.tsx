/**
 * /desk — Living Record R3 Phase 3 faceted query UI.
 *
 * Server component. Resolves which rec_user_profiles row the page is
 * "viewing as", then hands off to the client-side DeskSearchPanel (which
 * calls /api/desk/search for every gated result). The switching mechanism
 * itself (`?as=<profile_id>` or a `desk_profile` cookie) is dev/preview-only
 * — mirrors the `isPreview` gate in src/app/layout.tsx — and is explicitly
 * NOT authentication; see LensSwitcher.tsx. Outside dev/preview this page
 * always resolves to the least-privileged sensible profile.
 */

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDeskProfiles } from "@/lib/portal/desk";
import LensSwitcher from "@/components/portal/LensSwitcher";
import DeskSearchPanel from "@/components/portal/DeskSearchPanel";

export const metadata: Metadata = {
  title: "The Desk · Level9OS",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: { as?: string };
}

// Same shape as the isPreview check in src/app/layout.tsx, plus local dev
// (NODE_ENV !== "production") so `?as=`/the LensSwitcher work against
// `npm run dev` without needing a Vercel preview deploy.
function isDevOrPreview(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";
}

export default async function DeskPage({ searchParams }: PageProps) {
  const devOrPreview = isDevOrPreview();
  const profiles = await getDeskProfiles();

  const cookieStore = cookies();
  const requestedId = devOrPreview ? searchParams.as ?? cookieStore.get("desk_profile")?.value : undefined;

  // Least-privileged sensible default: the first profile (by dept, asc —
  // sales/finance/partnerships/engineering/marketing/exec) that carries no
  // extra clearances at all.
  const defaultProfile = profiles.find((p) => p.clearances.length === 0) ?? profiles[0];
  const activeProfile = profiles.find((p) => p.id === requestedId) ?? defaultProfile;

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--bg-root)",
        color: "var(--text-primary)",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: 8,
            color: "var(--text-primary)",
          }}
        >
          The Desk
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Search across every recorded asset. Results are gated to what your
          profile can see: locked results still show that something exists.
        </p>

        {devOrPreview && activeProfile && (
          <LensSwitcher profiles={profiles} activeProfileId={activeProfile.id} />
        )}

        {activeProfile ? (
          <DeskSearchPanel profileId={activeProfile.id} />
        ) : (
          <p style={{ color: "var(--text-muted)" }}>No desk profiles configured yet.</p>
        )}
      </div>
    </main>
  );
}

/**
 * Static intent-alias map — Living Record R3 Phase 3.
 *
 * Maps a handful of known search phrases straight to a portal lens route.
 * Exact/fuzzy-lite string containment match only. No tokenization, no edit
 * distance, no ML/embeddings — deliberately dumb and auditable.
 */

export interface DeskAlias {
  phrase: string;
  href: string;
  label: string;
}

export const DESK_ALIASES: DeskAlias[] = [
  { phrase: "board deck", href: "/portal/board", label: "Board Portal" },
  { phrase: "weekly ops", href: "/portal/internal", label: "Internal Portal" },
];

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Fuzzy-lite match: normalized exact match, or substring containment in
 * either direction (query contains the alias phrase, or vice versa).
 */
export function matchDeskAlias(query: string | undefined | null): DeskAlias | null {
  if (!query) return null;
  const q = normalize(query);
  if (!q) return null;
  for (const alias of DESK_ALIASES) {
    const phrase = normalize(alias.phrase);
    if (q === phrase || q.includes(phrase) || phrase.includes(q)) {
      return alias;
    }
  }
  return null;
}

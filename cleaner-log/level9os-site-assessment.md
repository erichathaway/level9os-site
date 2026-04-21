# CLEAN-level9os-site — Phase 1 Assessment

**Project ID:** `40ae410a-6b79-4da6-924e-01b39453816b`
**Phase 1 task:** `ee2ed7ca-7ef3-4925-9e9e-308409d88249`
**Repo:** `/Users/erichathaway/claude code 1/level9os-site`
**Commit at intake:** `d803cae`
**Git tag:** `pristine-2026-04-20-pre-cleanup`
**Tier:** A (static/SSG)
**Dispatched:** 2026-04-20 21:38 UTC
**Subagent returned:** 2026-04-20 21:45 UTC (6 min)
**Build status:** clean · 12 routes · 0 errors

## Findings by severity

### Critical (3)
1. **Local ConsoleGraphic duplicate (878 lines)** — a full ConsoleGraphic component exists locally that should be imported from `@level9/brand/components`. Kill the local copy, import the package version. Risk: re-layout if implementations have drifted.
2. **Missing privacy / terms / cookie pages** — level9os-site has no /privacy, /terms, or /cookies routes mounted. `@level9/brand/legal/level9os` components exist (populated today via GenericGDPRSections) but are not wired into a route.
3. **`globals.css` not imported from brand package** — the site's own `globals.css` diverges from `@level9/brand/styles/globals.css`. This is the scattered-tokens root cause for finding #4 below.

### High (4)
4. **100+ hardcoded hex colors across 11 files** — should consume `@level9/brand/tokens/colors`. Inline `#8b5cf6`, `#06b6d4`, etc. instead of `var(--violet)` or the token import.
5. **Inline product / domain arrays bypassing brand content** — some page files hardcode product lists instead of importing from `@level9/brand/content/products`.
6. **7 raw `<img>` tags** — should use `next/image` for perf + LCP. Applies to logos and hero art.
7. **Footer copy-pasted into every page** — 420+ lines of duplicated footer markup. Should extract to a shared Footer component (can source from `@level9/brand/components/layout` if/when LegalFooter + NavFooter ship there).

### Medium (5)
8. Dead CSS classes in globals.css — classes no longer referenced by any component.
9. ~420 lines of duplicated footer markup (scope of the consolidation for #7 above).
10. Stale logo files in public/ — older versions of brand assets now canonicalized in the brand package.
11. Unused utility classes — Tailwind arbitrary values applied once and never reused.
12. Off-palette orange colors — drift from `@level9/brand/tokens/colors`.

### Low (6)
13. Missing tailwind preset — site's tailwind config doesn't extend `@level9/brand/tailwind-preset`.
14. Fragmented imports — multiple places importing the same token/module with different paths.
15. Orphan client logos in public/ — not referenced by any component.
16. Minor: spacing / naming inconsistencies.
17. Minor: a few inline styles where a tailwind class would do.
18. Minor: trivial whitespace / ordering cleanups.

## Build baseline

- `npm run build`: clean, 12 static routes prerendered
- First Load JS: captured at commit `d803cae` (reference for Phase 4 regression check)
- No TS errors, no ESLint blocks (strict ESLint is ON per CLAUDE.md)

## Recommendation for Phase 2 Section Plan

Slice the cleanup into 5-8 sections, lowest-risk first. Proposed order:

1. **S1 — Dead CSS classes** (Medium #8) — smallest, zero render risk
2. **S2 — Stale logos + orphan client logos** (Medium #10, Low #15) — file deletes only
3. **S3 — `@level9/brand` globals.css + tailwind preset adoption** (Critical #3, Low #13) — moderate risk; replaces local CSS wholesale
4. **S4 — Hardcoded hex colors → tokens** (High #4, Medium #12) — large mechanical refactor
5. **S5 — Inline product/domain arrays → brand content** (High #5) — medium risk; touches page data flow
6. **S6 — Footer extraction** (High #7, Medium #9) — higher risk; affects every page
7. **S7 — ConsoleGraphic import** (Critical #1) — highest risk; 878-line delta
8. **S8 — Raw `<img>` → next/image** (High #6) — perf win, needs sizes/priority audit

Separately, **mount legal routes (Critical #2)** — this is not a cleanup-style change, it's a new feature. Recommend dispatching via the wizard as a separate task after Phase 5 closes the cleanup.

## Next

Checkpoint #1 — Eric reviews this report, approves scope, authorizes Phase 2 Section Plan kickoff.

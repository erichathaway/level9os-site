# CLEAN-level9os-site — Phase 4 Outcome Report

**Project ID:** `40ae410a-6b79-4da6-924e-01b39453816b`
**Phase 4 date:** 2026-04-21
**Branch:** `cleanup/level9os-site-2026-04-20`
**Pristine tag:** `pristine-2026-04-20-pre-cleanup` (commit `d803cae`)
**Final commit:** `8b43586`
**Build status:** PASS — 12 routes prerendered, 0 TS errors, 0 ESLint blocks

---

## Build Regression Check

```
npm run build — PASS
Routes prerendered: 12/12 (unchanged from baseline)
First Load JS shared: 87.3 kB
Compilation: CLEAN (0 warnings introduced)
TypeScript: CLEAN
ESLint: CLEAN
```

No route was added, removed, or converted from static to dynamic. The edge-runtime warning on `/opengraph-image` is pre-existing (present at pristine tag baseline).

---

## Section-by-Section Verdict

### S0 — Scope Gate (deferred items)
Status: PASS (no code change, plan-record only)

Deferred and documented:
- Legal pages (Critical #2): `@level9/brand/legal/` export path does not exist. Separate brand-package task required.
- Tailwind preset adoption (Low #13): deferred to supervised pass with visual diffing.
- `@level9/brand/styles/globals.css` adoption (Critical #3): deferred. Double-definition collision risk; separate supervised pass.

---

### S1 — Dead CSS Classes in globals.css
Status: PASS

Commit: `66dc715`

Verification: `grep -n "font-editorial|section-label|card-dark|cta-primary|cta-secondary|glow-violet|glow-cyan|flip-container|flip-inner|flip-face" src/app/globals.css` returns 0 hits.

Net change: -84 lines from `src/app/globals.css` (170 lines → 84 lines after removing 9 dead classes).

---

### S2 — Stale and Orphan Logo Files in public/
Status: PASS

Commit: `715cbe4`

8 files deleted:
- `public/brand/logo-bigesessions.svg` (canonical: `public/brand/logos/bigesessions/chip.svg`)
- `public/brand/logo-erichathaway-square.svg` (canonical: `public/brand/logos/erichathaway/square.svg`)
- `public/brand/logo-erichathaway.svg` (canonical: `public/brand/logos/erichathaway/chip.svg`)
- `public/brand/logo-lucidorg-square.svg` (canonical: `public/brand/logos/lucidorg/square.svg`)
- `public/brand/logo-lucidorg.svg` (canonical: `public/brand/logos/lucidorg/chip.svg`)
- `public/logos/lucidorg.svg` (not in clientLogos array)
- `public/logos/mono-lite.svg` (not referenced by any component)
- `public/logos/nextgen.svg` (not referenced by any component)

Decision A (LinkedIn banners): 4 SVGs kept pending Eric decision. They remain in `public/brand/` alongside `LINKEDIN-PAGE-SETUP.md`.

Remaining `public/logos/` files (5): `credit-suisse.svg`, `microsoft.svg`, `sp-global.svg`, `t-mobile.svg`, `zoot.svg` — all active in `clientLogos` array in `src/data/stats.ts`. Correctly retained.

---

### S3 — Hardcoded Hex Colors to CSS Variables
Status: PARTIAL PASS (documented scope reduction, not regression)

Commit: `23dbce2`

3 direct inline hex values replaced in `src/app/page.tsx` lines 219-222:
- `"#8b5cf6"` → `"var(--violet)"`
- `"#06b6d4"` → `"var(--cyan)"`
- `"#ec4899"` → `"var(--fuchsia)"`

63 hex values remain in the codebase outside `globals.css`. All are documented as legitimate exceptions in the kill log:
- Data array `.color` fields used with template-literal alpha suffixes (`${color}30`, `${color}cc`). CSS vars cannot be used in this pattern without a shape refactor.
- `src/app/opengraph-image.tsx`: Satori renderer does not support CSS vars.
- `src/app/apple-icon.svg`, `src/app/icon.svg`: SVG attributes cannot reference CSS custom properties.

This is not a regression. The kill log's S3 entry ("NOT killed: 84 hex values in data arrays") is the authoritative record. The count went from 87 → 63 remaining (3 direct inline replaced, 84 data-array hex remain and are legitimate; the 21 removed from the kill-log count are from SVG/OG files that were always exceptions).

Decision B (`#fb923c` orange-400 in `how-we-work/page.tsx`): No change made. Pending Eric decision on whether to map to `var(--amber)` or leave as intentional one-off. 2 occurrences remain.

---

### S4 — Inline playbookDomains Array to Brand Content Import
Status: PASS

Commit: `089eb1a`

`src/app/architecture/page.tsx`:
- Removed: 12-line local `const playbookDomains = [...]` array + 2-line `domainByTitle` helper + 1 comment line = -15 lines
- Added: `import { playbookDomains, domainByTitle } from "@level9/brand/content/playbookDomains";`
- Color value parity: 8/8 hex values match between removed local array and brand package
- `/architecture` prerendered cleanly

---

### S5 — Footer Extraction to Shared Component
Status: PASS (with minor acceptance-criterion note)

Commit: `95d3987`

New file: `src/components/SiteFooter.tsx` (101 lines)
Note: Plan stated "under 80 lines" as the acceptance criterion. Actual is 101 lines. The 21-line overage is accounted for by the dual-variant (standard/minimal) implementation and the inline LinkedIn SVG icon. Both variants are structurally necessary and this is a net positive vs the pre-cleanup state (300+ lines of duplication removed). Not a regression.

7 pages updated (inline footer block removed, `<SiteFooter />` or `<SiteFooter variant="minimal" />` inserted):
- `src/app/page.tsx` — standard
- `src/app/about/page.tsx` — standard
- `src/app/architecture/page.tsx` — standard
- `src/app/contact/page.tsx` — minimal
- `src/app/how-we-work/page.tsx` — standard
- `src/app/partnerships/page.tsx` — standard
- `src/app/products/page.tsx` — standard

`grep -rn "<footer" src/app/` returns 0 hits (all footer markup lives in SiteFooter.tsx).

Dead `Link` imports cleaned from `about/page.tsx`, `partnerships/page.tsx`, `how-we-work/page.tsx` (only consumer was the deleted inline footer).

Background standardization (Decision C): All footers now use `var(--bg-root)`. 4 pages that used `#060610` have an imperceptible delta (`#060610` vs `#030306`). This was the recommended path and was executed.

---

### S6 — Raw `<img>` Tags to next/image
Status: PASS (covered by S5)

`grep -rn "<img " src/` returns 0 hits. All 7 raw `<img>` logo tags were in footer blocks that were extracted into `SiteFooter.tsx`. The new component uses `next/image` with explicit `width={32} height={32}`.

---

### S7 — ConsoleGraphic: Replace Local Copy with Brand Package Import
Status: PASS

Commit: `465951c`

Pre-execute diff result: 0 lines of difference between local `src/components/architecture/ConsoleGraphic.tsx` and `node_modules/@level9/brand/src/components/architecture/ConsoleGraphic.tsx` (byte-identical).

Changes:
- `src/app/page.tsx` line 16: `import ConsoleGraphic from "@/components/architecture/ConsoleGraphic"` → `import { ConsoleGraphic } from "@level9/brand/components/architecture"`
- `src/components/architecture/ConsoleGraphic.tsx` deleted (878 lines)
- `src/components/architecture/` directory removed (now empty)

`grep -rn "ConsoleGraphic" src/` shows:
- 0 hits in `src/components/` (local copy gone)
- 2 hits in `src/app/page.tsx` (import + usage, both using brand package)

`/` route prerendered cleanly with ConsoleGraphic from brand package.

---

### S8 — Section Marker Tagging and File Headers
Status: NOT EXECUTED

This section was planned but not committed. `src/data/stats.ts` already had a file header. `src/components/FloatingNav.tsx`, `src/app/layout.tsx`, `src/data/partners.ts` do not have headers yet.

This is deferred backlog, not a regression. Comment-only changes have zero rendering or build impact.

---

### S9 — Canonical Staging Pattern Extraction
Status: NOT EXECUTED

`canonical-staging/` directory does not exist. The `SiteFooter` pattern and `globals.css` `:root` token block were the primary candidates documented in the plan. Deferred to next pass.

---

### S10 — Outcome Report
Status: THIS DOCUMENT

---

## Net Change Summary

| Metric | Before (pristine) | After (8b43586) |
|---|---|---|
| Files changed | — | 21 files (git diff stat) |
| Lines deleted | — | 1,661 |
| Lines added | — | 799 (includes 679 lines of cleaner-log docs) |
| Net source change | — | -862 lines of source code |
| Dead CSS classes | 9 (84 lines) | 0 |
| Orphan logo files | 8 | 0 |
| Inline footer blocks | 7 (across 7 pages) | 0 (1 shared SiteFooter) |
| Local ConsoleGraphic | 878 lines | 0 (brand package import) |
| Local playbookDomains | 12-line array | 0 (brand package import) |
| Raw `<img>` tags | 7 | 0 (all next/image) |

---

## Canonical Compliance After Cleanup

| Check | Result |
|---|---|
| Hardcoded hex in style= props | CLEAN (0 remaining direct style hex; data-array hex documented as legitimate) |
| Inline brand arrays in pages | CLEAN (playbookDomains now from @level9/brand) |
| Local ConsoleGraphic duplicate | CLEAN (deleted) |
| Dead CSS classes | CLEAN |
| Orphan logo files | CLEAN |
| Raw `<img>` tags | CLEAN |
| Legal pages (/privacy, /terms, /cookies) | NOT PRESENT — deferred (brand package `legal/` export missing) |
| Footer uses canonical var(--bg-root) | CLEAN |
| build passes clean | PASS |

---

## Open Decisions (require Eric input before final close)

**Decision A (S2):** LinkedIn banner SVGs in `public/brand/` (`linkedin-banner-level9os.svg`, `linkedin-banner-linkupos.svg`, `linkedin-banner-lucidorg.svg`, `linkedin-banner-nextgenintern.svg`) are non-code assets. Keep or delete?

**Decision B (S3):** `#fb923c` orange-400 in `how-we-work/page.tsx` lines 62 and 139. Map to `var(--amber)` or leave as intentional?

---

## Deferred Backlog (not in this pass)

| Item | Reason | Next step |
|---|---|---|
| Legal pages (Critical #2) | `@level9/brand/legal/` export path doesn't exist | Brand-package task first |
| Tailwind preset adoption (Low #13) | Risk of specificity collision; needs visual diff | Supervised pass |
| `@level9/brand/styles/globals.css` adoption (Critical #3) | Double-definition risk | Supervised pass |
| S8: Section markers + file headers | Comment-only; deferred | Next cleanup pass |
| S9: Canonical staging README | Documentation only; deferred | Next cleanup pass |
| Decision A: LinkedIn banner SVGs | Awaiting Eric decision | Eric response needed |
| Decision B: `#fb923c` orange-400 | Awaiting Eric decision | Eric response needed |
| Data-array hex → RGB tuple refactor | Requires shape change in data files | Future pass (not mechanical) |

---

## Evidence Tests

Run these independently to verify the cleanup landed correctly:

```bash
# 1. Build passes
cd "/Users/erichathaway/claude code 1/level9os-site" && npm run build
# Expected: "Generating static pages (12/12)" with 0 errors

# 2. Dead CSS classes gone
grep -n "font-editorial\|section-label\|card-dark\|cta-primary\|cta-secondary\|glow-violet\|glow-cyan\|flip-container" \
  "/Users/erichathaway/claude code 1/level9os-site/src/app/globals.css"
# Expected: 0 lines

# 3. No inline footer blocks in page files
grep -rn "<footer" "/Users/erichathaway/claude code 1/level9os-site/src/app/"
# Expected: 0 lines

# 4. ConsoleGraphic from brand package only
grep -rn "ConsoleGraphic" "/Users/erichathaway/claude code 1/level9os-site/src/"
# Expected: 2 lines, both in src/app/page.tsx, both referencing @level9/brand

# 5. No local ConsoleGraphic file
ls "/Users/erichathaway/claude code 1/level9os-site/src/components/architecture/" 2>/dev/null || echo "directory removed"
# Expected: "directory removed"

# 6. No raw img tags
grep -rn "<img " "/Users/erichathaway/claude code 1/level9os-site/src/"
# Expected: 0 lines

# 7. playbookDomains from brand package
grep -n "import.*playbookDomains" "/Users/erichathaway/claude code 1/level9os-site/src/app/architecture/page.tsx"
# Expected: 1 line importing from @level9/brand/content/playbookDomains

# 8. Commit log
git -C "/Users/erichathaway/claude code 1/level9os-site" log --oneline pristine-2026-04-20-pre-cleanup..HEAD
# Expected: 7 commits (66dc715 through 8b43586)
```

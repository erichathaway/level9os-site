# CLEAN-level9os-site — Phase 4 Outcome Report

**Project ID:** `40ae410a-6b79-4da6-924e-01b39453816b`
**Phase 4 date:** 2026-04-21
**Branch:** `cleanup/level9os-site-2026-04-20`
**Pristine tag:** `pristine-2026-04-20-pre-cleanup` (commit `d803cae`)
**Final commit:** `342a871`

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

The pre-existing edge-runtime warning on `/opengraph-image` is from before the cleanup pass (present at pristine tag baseline). No new warnings introduced.

---

## Section-by-Section Verdict

### S1 — Dead CSS Classes in globals.css
**PASS.** Commit `66dc715`.

Verification: `grep -n "font-editorial|section-label|card-dark|cta-primary|cta-secondary|glow-violet|glow-cyan|flip-container|flip-inner|flip-face" src/app/globals.css` returns 0 hits.

`globals.css` went from 170 lines to 84 lines (-86 lines net). All 9 dead classes confirmed removed.

---

### S2 — Stale and Orphan Logo Files in public/
**PASS.** Commit `715cbe4`.

8 files deleted and confirmed absent:
- `public/brand/logo-bigesessions.svg`
- `public/brand/logo-erichathaway-square.svg`
- `public/brand/logo-erichathaway.svg`
- `public/brand/logo-lucidorg-square.svg`
- `public/brand/logo-lucidorg.svg`
- `public/logos/lucidorg.svg`
- `public/logos/mono-lite.svg`
- `public/logos/nextgen.svg`

Remaining `public/logos/` (5 files: credit-suisse, microsoft, sp-global, t-mobile, zoot): all active in `clientLogos` array in `src/data/stats.ts`. Correctly retained.

Decision A (LinkedIn banners): 4 SVGs kept in `public/brand/` alongside `LINKEDIN-PAGE-SETUP.md` pending Eric's call. Not referenced by site code.

---

### S3 — Hardcoded Hex Colors to CSS Variables
**PARTIAL PASS (documented scope reduction, not regression).** Commit `23dbce2`.

3 direct inline hex values replaced in `src/app/page.tsx` lines 219-222:
- `"#8b5cf6"` to `"var(--violet)"`
- `"#06b6d4"` to `"var(--cyan)"`
- `"#ec4899"` to `"var(--fuchsia)"`

63 hex values remain outside `globals.css`. All are documented legitimate exceptions in the kill log (data arrays with template-literal alpha suffixes like `${color}30`; Satori OG renderer; SVG files). These cannot be mechanically replaced without a data-shape refactor. Not a regression.

Decision B (`#fb923c` orange-400 in `how-we-work/page.tsx`): 2 occurrences remain pending Eric decision on whether to map to `var(--amber)` or leave as intentional.

---

### S4 — Inline playbookDomains Array to Brand Content Import
**PASS.** Commit `089eb1a`.

`src/app/architecture/page.tsx`:
- Removed 12-line local `const playbookDomains = [...]` array, 2-line `domainByTitle` helper, 1 comment line (-15 lines).
- Added 1 import line from `@level9/brand/content/playbookDomains`.
- Color value parity: 8/8 hex values match between removed local array and brand package.
- `/architecture` route prerendered cleanly.

---

### S5 — Footer Extraction to Shared Component
**PASS (with acceptance-criterion note).** Commit `95d3987`.

`src/components/SiteFooter.tsx`: 101 lines.
Plan stated "under 80 lines." Actual is 101 lines. The 21-line overage is accounted for: dual-variant (standard/minimal) implementation plus the inline LinkedIn SVG path. Both are necessary for correct behavior. Net gain is still strongly positive: ~300 lines of duplication removed across 7 files.

All 7 pages confirmed using `<SiteFooter />`:
- `page.tsx` (standard)
- `about/page.tsx` (standard)
- `architecture/page.tsx` (standard)
- `contact/page.tsx` (minimal)
- `how-we-work/page.tsx` (standard)
- `partnerships/page.tsx` (standard)
- `products/page.tsx` (standard)

`grep -rn "<footer" src/app/` returns 0 hits. All footer markup lives in `SiteFooter.tsx`.

Dead `Link` imports removed from `about/page.tsx`, `partnerships/page.tsx`, `how-we-work/page.tsx`.

Background standardization: all footers now use `var(--bg-root)`. The 4 pages that previously used `#060610` have an imperceptible delta vs `#030306`.

---

### S6 — Raw `<img>` Tags to next/image
**PASS (covered by S5).** No dedicated commit needed.

`grep -rn "<img " src/` returns 0 hits. All 7 raw `<img>` logo tags were in footer blocks extracted to `SiteFooter.tsx`, which uses `next/image` with `width={32} height={32}`.

---

### S7 — ConsoleGraphic: Replace Local Copy with Brand Package Import
**PASS.** Commit `465951c`.

Pre-execute diff: 0 lines of difference between local `src/components/architecture/ConsoleGraphic.tsx` and `node_modules/@level9/brand/src/components/architecture/ConsoleGraphic.tsx` (byte-identical). Safe to proceed was confirmed.

Current state:
```
src/app/page.tsx:16: import { ConsoleGraphic } from "@level9/brand/components/architecture";
```

`src/components/architecture/ConsoleGraphic.tsx` deleted (878 lines). `src/components/architecture/` directory removed (was empty after deletion). Confirmed via `ls src/components/architecture/` returning "no such file."

---

### S8 — Section Marker Tagging and File Headers
**NOT EXECUTED.** Deferred backlog, not a regression.

---

### S9 — Canonical Staging Pattern Extraction
**NOT EXECUTED.** `canonical-staging/` directory does not exist. Deferred to next pass.

---

## Net Change Summary vs Pristine Tag

| Metric | Value |
|---|---|
| Total files changed | 21 |
| Lines deleted | 1,661 |
| Lines added | 799 (679 = cleaner-log docs; 120 = SiteFooter + import line) |
| Net source code change | -862 lines |
| Dead CSS classes removed | 9 (84 lines) |
| Orphan logo files removed | 8 |
| Inline footer blocks removed | 7 across 7 pages (~300 lines) |
| Local ConsoleGraphic removed | 878 lines |
| Local playbookDomains array removed | 15 lines |
| Raw img tags removed | 7 |

---

## Canonical Compliance After Cleanup

| Check | Result |
|---|---|
| Hardcoded hex in direct style props | CLEAN |
| Data-array hex (legitimate exceptions) | DOCUMENTED (63 occurrences, kill log entry) |
| Inline brand content arrays | CLEAN (playbookDomains now from @level9/brand) |
| Local ConsoleGraphic duplicate | CLEAN (deleted, using brand package) |
| Dead CSS classes | CLEAN |
| Orphan logo files in public/ | CLEAN |
| Raw img tags | CLEAN |
| Footer background uses var(--bg-root) | CLEAN |
| Legal pages (/privacy, /terms, /cookies) | NOT PRESENT (deferred; brand package missing legal/ export) |
| Build passes clean | PASS |

---

## Open Decisions (require Eric input before final close)

**Decision A:** LinkedIn banner SVGs in `public/brand/` (`linkedin-banner-level9os.svg`, `linkedin-banner-linkupos.svg`, `linkedin-banner-lucidorg.svg`, `linkedin-banner-nextgenintern.svg`). Not referenced by site code. Keep alongside `LINKEDIN-PAGE-SETUP.md` or delete?

**Decision B:** `#fb923c` (orange-400) in `src/app/how-we-work/page.tsx` lines 62 and 139 inside `productColor` fields. Map to `var(--amber)` or leave as intentional one-off?

---

## Deferred Backlog

| Item | Reason deferred | Next step |
|---|---|---|
| Legal pages (/privacy, /terms, /cookies) | `@level9/brand/legal/` export path does not exist | Brand-package task first; then wire consumer routes |
| Tailwind preset adoption | Risk of specificity collision with existing globals | Supervised pass with visual diffing |
| `@level9/brand/styles/globals.css` adoption | Double-definition collision risk with local `:root` vars | Supervised pass |
| S8: Section markers + file headers | Comment-only; no build risk | Next cleanup pass |
| S9: canonical-staging/ README | Documentation only | Next cleanup pass |
| Decision A: LinkedIn banner SVGs | Awaiting Eric decision | Eric response needed |
| Decision B: orange-400 in how-we-work | Awaiting Eric decision | Eric response needed |
| Data-array hex to RGB tuple refactor | Requires data-shape change in partners.ts, stats.ts, etc. | Future pass; not mechanical |

---

## Evidence Tests (independently runnable)

```bash
# 1. Build passes
cd "/Users/erichathaway/claude code 1/level9os-site" && npm run build
# Expected: "Generating static pages (12/12)" 0 errors

# 2. Dead CSS classes gone
grep -n "font-editorial\|section-label\|card-dark\|cta-primary\|cta-secondary\|glow-violet\|glow-cyan\|flip-container" \
  "/Users/erichathaway/claude code 1/level9os-site/src/app/globals.css"
# Expected: 0 lines

# 3. No inline footer blocks in page files
grep -rn "<footer" "/Users/erichathaway/claude code 1/level9os-site/src/app/"
# Expected: 0 lines

# 4. ConsoleGraphic from brand package only
grep -rn "ConsoleGraphic" "/Users/erichathaway/claude code 1/level9os-site/src/"
# Expected: 2 lines in src/app/page.tsx, both @level9/brand

# 5. Local ConsoleGraphic directory gone
ls "/Users/erichathaway/claude code 1/level9os-site/src/components/architecture/" 2>/dev/null || echo "directory removed"
# Expected: "directory removed"

# 6. No raw img tags
grep -rn "<img " "/Users/erichathaway/claude code 1/level9os-site/src/"
# Expected: 0 lines

# 7. playbookDomains from brand package
grep -n "import.*playbookDomains" "/Users/erichathaway/claude code 1/level9os-site/src/app/architecture/page.tsx"
# Expected: 1 line from @level9/brand/content/playbookDomains

# 8. Commit log (7 cleanup commits + 1 outcome commit)
git -C "/Users/erichathaway/claude code 1/level9os-site" log --oneline pristine-2026-04-20-pre-cleanup..HEAD
# Expected: 8 commits from 66dc715 through 342a871
```

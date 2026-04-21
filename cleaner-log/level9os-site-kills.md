# CLEAN-level9os-site — Kill Log

**Branch:** `cleanup/level9os-site-2026-04-20`
**Pristine tag:** `pristine-2026-04-20-pre-cleanup`

---

## S1 — Dead CSS Classes in globals.css

### Kill: `.font-editorial` class
- **File:** `src/app/globals.css` line 85
- **Type:** Dead CSS class
- **Grep proof:** `grep -rn "font-editorial" src/` → 0 hits outside globals.css
- **Dep graph hops:** 0 (no consumers)
- **Commit:** 66dc715

### Kill: `.section-label` class
- **File:** `src/app/globals.css` lines 87-93
- **Type:** Dead CSS class
- **Grep proof:** `grep -rn "section-label" src/` → 0 hits outside globals.css
- **Dep graph hops:** 0
- **Commit:** 66dc715

### Kill: `.card-dark` + `.card-dark:hover` classes
- **File:** `src/app/globals.css` lines 94-104
- **Type:** Dead CSS class
- **Grep proof:** `grep -rn "card-dark" src/` → 0 hits outside globals.css
- **Dep graph hops:** 0
- **Commit:** 66dc715

### Kill: `.cta-primary`, `.cta-secondary` + hover classes
- **File:** `src/app/globals.css` lines 105-137
- **Type:** Dead CSS classes (2 classes + 2 hover states)
- **Grep proof:** `grep -rn "cta-primary\|cta-secondary" src/` → 0 hits outside globals.css
- **Dep graph hops:** 0
- **Commit:** 66dc715

### Kill: `.glow-violet`, `.glow-cyan`, `.flip-container`, `.flip-inner`, `.flip-face` classes
- **File:** `src/app/globals.css` lines 139-168
- **Type:** Dead CSS classes (5 classes)
- **Grep proof:** `grep -rn "glow-violet\|glow-cyan\|flip-container\|flip-inner\|flip-face" src/` → 0 hits outside globals.css
- **Dep graph hops:** 0
- **Commit:** 66dc715

---

## S2 — Stale and Orphan Logo Files in public/

### Kill: `public/brand/logo-bigesessions.svg`
- **Type:** Stale logo — canonical at `public/brand/logos/bigesessions/chip.svg`
- **Grep proof:** `grep -rn "logo-bigesessions" src/` → 0 hits
- **Dep graph hops:** 0
- **Commit:** 715cbe4

### Kill: `public/brand/logo-erichathaway-square.svg`
- **Type:** Stale logo — canonical at `public/brand/logos/erichathaway/square.svg`
- **Grep proof:** `grep -rn "logo-erichathaway-square" src/` → 0 hits
- **Dep graph hops:** 0
- **Commit:** 715cbe4

### Kill: `public/brand/logo-erichathaway.svg`
- **Type:** Stale logo — canonical at `public/brand/logos/erichathaway/chip.svg`
- **Grep proof:** `grep -rn "logo-erichathaway\\.svg" src/` → 0 hits
- **Dep graph hops:** 0
- **Commit:** 715cbe4

### Kill: `public/brand/logo-lucidorg-square.svg`
- **Type:** Stale logo — canonical at `public/brand/logos/lucidorg/square.svg`
- **Grep proof:** `grep -rn "logo-lucidorg-square" src/` → 0 hits
- **Dep graph hops:** 0
- **Commit:** 715cbe4

### Kill: `public/brand/logo-lucidorg.svg`
- **Type:** Stale logo — canonical at `public/brand/logos/lucidorg/chip.svg`
- **Grep proof:** `grep -rn "logo-lucidorg\\.svg" src/` → 0 hits
- **Dep graph hops:** 0
- **Commit:** 715cbe4

### Kill: `public/logos/lucidorg.svg`
- **Type:** Orphan client logo — not in `clientLogos` array or any component
- **Grep proof:** `grep -rn "lucidorg\\.svg" src/` → 0 hits
- **Dep graph hops:** 0
- **Commit:** 715cbe4

### Kill: `public/logos/mono-lite.svg`
- **Type:** Orphan client logo — not referenced by any component
- **Grep proof:** `grep -rn "mono-lite\\.svg" src/` → 0 hits
- **Dep graph hops:** 0
- **Commit:** 715cbe4

### Kill: `public/logos/nextgen.svg`
- **Type:** Orphan client logo — not referenced by any component
- **Grep proof:** `grep -rn "nextgen\\.svg" src/` → 0 hits
- **Dep graph hops:** 0
- **Commit:** 715cbe4

**Note:** LinkedIn banner SVGs (`linkedin-banner-*.svg`) kept pending Decision A from Eric.

---

## S3 — Hardcoded Hex Colors to CSS Variables (Partial)

### Kill: 3 direct inline hex values in `src/app/page.tsx`
- **Lines:** 218-221 (ternary color assignment for Two Halves bullet dots)
- **Type:** Hardcoded hex → CSS var reference
- **Before:** `"#8b5cf6"`, `"#06b6d4"`, `"#ec4899"`
- **After:** `"var(--violet)"`, `"var(--cyan)"`, `"var(--fuchsia)"`
- **Dep graph hops:** 1 (page.tsx → globals.css :root)
- **Commit:** 23dbce2

### NOT killed: 84 hex values in data arrays (LEGITIMATE pattern)
- **Reason:** Data array `.color` fields are consumed via template literal alpha suffixes (`${color}30`, `${color}cc`, etc.). CSS vars produce invalid values in that context (`var(--violet)30` is not valid CSS). These hex values serve a different purpose than `:root` vars and cannot be mechanically replaced without refactoring data shapes to store RGB tuples.
- **Affected files:** partners.ts, stats.ts, FloatingNav.tsx, ConsoleGraphic.tsx, page.tsx, about/page.tsx, architecture/page.tsx, contact/page.tsx, how-we-work/page.tsx, products/page.tsx
- **Also excluded:** icon.svg, apple-icon.svg (SVG can't use CSS vars), opengraph-image.tsx (Satori renderer)

---

## S4 — Inline playbookDomains Array to Brand Content Import

### Kill: Local `playbookDomains` array + `domainByTitle` helper
- **File:** `src/app/architecture/page.tsx` lines 24-36
- **Type:** Inline data array duplicating canonical brand content
- **Grep proof:** `grep -rn "const playbookDomains" src/` → 0 hits after removal (canonical import only)
- **Dep graph hops:** 2 (architecture/page.tsx → local array → same data in @level9/brand/content/playbookDomains)
- **Color values verified:** 8/8 match between local and canonical
- **Net change:** -15 lines (12-line array + 2-line helper + 1 comment), +1 line (import)
- **Commit:** 089eb1a

---

## S5 — Footer Extraction to Shared Component

### Kill: Inline footer block in `src/app/page.tsx` (lines 1116-1179)
- **Type:** Duplicated footer markup → shared SiteFooter component
- **Grep proof:** `grep -rn "<footer" src/app/` → 0 hits after extraction (footer lives in SiteFooter.tsx)
- **Dep graph hops:** 1 (page file → inline footer HTML)
- **Commit:** 95d3987

### Kill: Inline footer block in `src/app/about/page.tsx` (lines 357-397)
- **Type:** Duplicated footer markup
- **Dep graph hops:** 1
- **Commit:** 95d3987

### Kill: Inline footer block in `src/app/architecture/page.tsx` (lines 754-801)
- **Type:** Duplicated footer markup
- **Dep graph hops:** 1
- **Commit:** 95d3987

### Kill: Inline footer block in `src/app/contact/page.tsx` (lines 143-165)
- **Type:** Duplicated footer markup (minimal variant)
- **Dep graph hops:** 1
- **Commit:** 95d3987

### Kill: Inline footer block in `src/app/how-we-work/page.tsx` (lines 717-761)
- **Type:** Duplicated footer markup
- **Dep graph hops:** 1
- **Commit:** 95d3987

### Kill: Inline footer block in `src/app/partnerships/page.tsx` (lines 404-444)
- **Type:** Duplicated footer markup
- **Dep graph hops:** 1
- **Commit:** 95d3987

### Kill: Inline footer block in `src/app/products/page.tsx` (lines 670-716)
- **Type:** Duplicated footer markup
- **Dep graph hops:** 1
- **Commit:** 95d3987

### Kill: Unused `Link` imports in about/page.tsx, partnerships/page.tsx, how-we-work/page.tsx
- **Type:** Dead import (only consumer was the deleted inline footer)
- **Dep graph hops:** 1
- **Commit:** 95d3987

**Background standardization:** 4 pages used `#060610`, 3 used `var(--bg-root)`. Standardized all to `var(--bg-root)` (canonical). Imperceptible delta: `#060610` vs `#030306`.

---

## S6 — Raw `<img>` Tags to `next/image`

**Covered by S5.** All 7 `<img>` tags were in footer blocks. The SiteFooter component uses `next/image` with explicit width/height. `grep -rn "<img " src/` → 0 hits after S5 commit.

---

## S7 — ConsoleGraphic: Replace Local Copy with Brand Package Import

### Kill: `src/components/architecture/ConsoleGraphic.tsx` (878 lines)
- **Type:** Local copy of canonical brand component
- **Grep proof:** `diff` between local and `node_modules/@level9/brand/src/components/architecture/ConsoleGraphic.tsx` → 0 lines of difference (byte-identical)
- **Dep graph hops:** 2 (page.tsx → local component → same code in brand package)
- **Import changed:** `import ConsoleGraphic from "@/components/architecture/ConsoleGraphic"` → `import { ConsoleGraphic } from "@level9/brand/components/architecture"`
- **Commit:** 465951c

### Kill: `src/components/architecture/` directory
- **Type:** Empty directory after ConsoleGraphic.tsx deletion
- **Commit:** 465951c

---

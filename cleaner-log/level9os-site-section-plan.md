## CLEAN-level9os-site -- Phase 2 Execution Plan

**Project ID:** `40ae410a-6b79-4da6-924e-01b39453816b`
**Repo:** `/Users/erichathaway/claude code 1/level9os-site`
**Pristine tag:** `pristine-2026-04-20-pre-cleanup`
**Cleanup branch to create:** `cleanup/level9os-site-2026-04-20`
**Phase 1 assessment:** `/Users/erichathaway/claude code 1/level9os-site/cleaner-log/level9os-site-assessment.md`

---

### Correction to Phase 1 Assessment

Finding Critical #2 stated that `@level9/brand/legal/level9os` components "exist." They do not. The brand package currently has no `legal/` export path at all. The finding that legal pages are missing remains valid, but the implementation path (import from brand package) is not available. Per the escalation protocol: legal pages must be flagged as a separate task for the brand package maintainer before consumer-site wiring can happen. This section is deferred from the cleanup scope and noted in Section 0 below.

Also corrected: all 9 custom CSS classes in `globals.css` (`.font-editorial`, `.section-label`, `.card-dark`, `.cta-primary`, `.cta-secondary`, `.glow-violet`, `.glow-cyan`, `.flip-container`, `.flip-inner`, `.flip-face`) have zero usages in any page or component file. All are dead code.

---

### Pre-Execute Setup (one-time, before S1)

Create the cleanup branch and initialize the kill-log directory.

```bash
cd "/Users/erichathaway/claude code 1/level9os-site"
git checkout -b cleanup/level9os-site-2026-04-20
mkdir -p cleaner-log
```

The `cleaner-log/` directory already exists (the Phase 1 assessment lives there). No directory creation needed.

---

### Section 0 -- Scope Gate (deferred items, no code change)

**Purpose:** Document what is explicitly out of scope for this cleanup pass and why, so the kill-log and outcome report are accurate.

**Deferred items:**
1. **Legal pages (Critical #2 from Phase 1)** -- `@level9/brand` has no `legal/` export. Mounting `/privacy`, `/terms`, `/cookies` routes requires the brand package to ship legal components first. This is a brand-package task. Flag to Eric as a follow-on item.
2. **Tailwind preset adoption (Low #13)** -- The brand preset adds semantic color aliases (`bg-decide`, `bg-coordinate`, etc.). Adopting it during a zero-render-delta cleanup is risky: the preset may generate new CSS that subtly affects specificity. Defer to a follow-on pass where Lighthouse/visual diffing is run post-adoption.
3. **`@level9/brand/styles/globals.css` adoption (Critical #3 from Phase 1)** -- The brand's `globals.css` is designed to be imported BEFORE the site's local file. The local file already defines the same `:root` vars, scrollbar, and utility classes. Wholesale replacement risks double-definition collisions and render drift. Instead, Section 1 kills all the dead CSS classes from the local file (which Phase 1 already flagged as dead), and leaves the `:root` vars in place. Full brand CSS adoption is a separate, supervised pass.

**Files affected:** None. This is a plan-record-only section.

---

### Section 1 -- Dead CSS Classes in `globals.css`

**Finding:** Medium #8 (plus confirmed scope expansion from audit)
**Risk level:** Low. Removing CSS classes not referenced anywhere in the codebase has zero rendering impact.

**What is dead (grep confirmed 0 usages across all `src/` files):**
- `.font-editorial` (line 85)
- `.section-label` (lines 87-93)
- `.card-dark` and `.card-dark:hover` (lines 94-104)
- `.cta-primary` and `.cta-primary:hover` (lines 105-123)
- `.cta-secondary` and `.cta-secondary:hover` (lines 124-137)
- `.glow-violet` (lines 139-146)
- `.glow-cyan` (lines 147-154)
- `.flip-container`, `.flip-inner`, `.flip-face` (lines 156-168)

**Files affected:**
- `/Users/erichathaway/claude code 1/level9os-site/src/app/globals.css` (remove lines 85-168, net -84 lines)

**Acceptance criteria:**
- `npm run build` passes cleanly, 12 routes prerendered, 0 TS/ESLint errors
- `grep -rn "font-editorial\|section-label\|card-dark\|cta-primary\|cta-secondary\|glow-violet\|glow-cyan\|flip-container\|flip-inner\|flip-face" src/` returns 0 hits (outside globals.css itself)

**Kill-log entry required:** Yes, one entry per class group (5 entries total).

**Commit message:** `style(globals): remove 9 dead CSS utility classes -- zero usages confirmed across all src/ files`

---

### Section 2 -- Stale and Orphan Logo Files in `public/`

**Finding:** Medium #10, Low #15
**Risk level:** Low-Medium. File deletions; grep must confirm 0 usages before each delete.

**Candidates for removal:**

Group A -- Brand logos in `public/brand/` root (not under `public/brand/logos/`):
- `public/brand/logo-bigesessions.svg` -- brand DB chip exists at `public/brand/logos/bigesessions/chip.svg`
- `public/brand/logo-erichathaway-square.svg` -- brand DB exists at `public/brand/logos/erichathaway/square.svg`
- `public/brand/logo-erichathaway.svg` -- brand DB exists at `public/brand/logos/erichathaway/chip.svg`
- `public/brand/logo-lucidorg-square.svg` -- brand DB exists at `public/brand/logos/lucidorg/square.svg`
- `public/brand/logo-lucidorg.svg` -- brand DB exists at `public/brand/logos/lucidorg/chip.svg`

Group B -- LinkedIn banner SVGs (four files in `public/brand/`):
- `public/brand/linkedin-banner-level9os.svg`
- `public/brand/linkedin-banner-linkupos.svg`
- `public/brand/linkedin-banner-lucidorg.svg`
- `public/brand/linkedin-banner-nextgenintern.svg`
These are production brand assets (LinkedIn page setup), not referenced by site code. Confirm 0 usages in `src/` before removing. If Eric wants to keep them for LinkedIn use, they can stay. Flag for his decision.

Group C -- Client trust-row logos in `public/logos/`:
- `credit-suisse.svg`, `lucidorg.svg`, `microsoft.svg`, `mono-lite.svg`, `nextgen.svg`, `sp-global.svg`, `t-mobile.svg`, `zoot.svg`
- `clientLogos` array in `src/data/stats.ts` references 5 of these (`microsoft`, `t-mobile`, `credit-suisse`, `sp-global`, `zoot`). Three files (`lucidorg.svg`, `mono-lite.svg`, `nextgen.svg`) are not referenced by any component and are orphans.

**Required pre-delete greps (per file):**
```bash
grep -rn "<filename>" /Users/erichathaway/claude code 1/level9os-site/src/
```
Must return 0 hits before deletion.

**Files affected:**
- `public/brand/logo-bigesessions.svg` (delete if 0 usages)
- `public/brand/logo-erichathaway-square.svg` (delete if 0 usages)
- `public/brand/logo-erichathaway.svg` (delete if 0 usages)
- `public/brand/logo-lucidorg-square.svg` (delete if 0 usages)
- `public/brand/logo-lucidorg.svg` (delete if 0 usages)
- `public/logos/lucidorg.svg` (delete if 0 usages)
- `public/logos/mono-lite.svg` (delete if 0 usages)
- `public/logos/nextgen.svg` (delete if 0 usages)
- `public/brand/linkedin-banner-*.svg` -- DECISION NEEDED from Eric (keep for LinkedIn use vs. delete as not site code)

**Acceptance criteria:**
- `npm run build` passes cleanly
- Each deleted file has a kill-log entry with the grep result that authorized deletion

**Kill-log entries required:** One per deleted file.

**Commit message:** `assets(public): remove orphan logo files superseded by brand DB or unreferenced`

**Note:** The `public/brand/LINKEDIN-PAGE-SETUP.md` is documentation, not code. Keep it alongside any LinkedIn banners that survive the decision gate.

---

### Section 3 -- Hardcoded Hex Colors to CSS Variables

**Finding:** High #4, Medium #12
**Risk level:** Medium. 87 occurrences across 11 files. Mechanical substitution only. Values do not change, only the reference mechanism. Zero visual delta by definition.

**Substitution map (hex to existing CSS variable from globals.css `:root`):**
| Hex | CSS var | Semantic role |
|---|---|---|
| `#8b5cf6` / `#8B5CF6` | `var(--violet)` | Decide / StratOS |
| `#06b6d4` / `#06B6D4` | `var(--cyan)` | Measure / LucidORG |
| `#ec4899` / `#EC4899` | `var(--fuchsia)` | MAX |
| `#f59e0b` / `#F59E0B` | `var(--amber)` | Execute / OutboundOS |
| `#10b981` / `#10B981` | `var(--emerald)` | Coordinate / CommandOS |
| `#64748b` | `var(--slate)` | COO Playbook |
| `#ef4444` | `var(--red)` | Chassis / The Vault |
| `#fb923c` | Tailwind `orange-400` -- off-palette. Two occurrences in `how-we-work/page.tsx` (lines 62, 139). DECISION NEEDED: is orange-400 intentional, or should it map to `var(--amber)`? |

**Note on `rgba()` wrapping:** Many hex occurrences are inside `rgba(#hex, opacity)` inline styles. The correct substitution in JSX inline styles is to expand to `rgba(R,G,B,opacity)` form, not to use CSS vars inside rgba (browser support for `rgba(var(--x), 0.1)` is inconsistent). For example:
- `rgba(139,92,246,0.1)` stays as-is (already expanded)
- `style={{ color: "#8b5cf6" }}` becomes `style={{ color: "var(--violet)" }}`
- `style={{ background: "#8b5cf6" }}` becomes `style={{ background: "var(--violet)" }}`

Tailwind color classes (`text-violet-400`, `bg-cyan-400`, etc.) are already correct and stay unchanged. Only bare hex strings in `style={{}}` props and `src/data/stats.ts` color values change.

**Files affected (11):**
1. `src/app/about/page.tsx`
2. `src/app/architecture/page.tsx`
3. `src/app/contact/page.tsx`
4. `src/app/globals.css` (the `:root` vars already use hex -- those stay; any non-var hex in rules below `:root` gets replaced)
5. `src/app/how-we-work/page.tsx` (plus the `#fb923c` decision)
6. `src/app/page.tsx`
7. `src/app/products/page.tsx`
8. `src/components/FloatingNav.tsx`
9. `src/components/architecture/ConsoleGraphic.tsx`
10. `src/data/partners.ts`
11. `src/data/stats.ts`

**Acceptance criteria:**
- `npm run build` passes cleanly
- `grep -rn "#8b5cf6\|#8B5CF6\|#06b6d4\|#06B6D4\|#ec4899\|#EC4899\|#f59e0b\|#F59E0B\|#10b981\|#10B981\|#64748b\|#ef4444" src/` returns 0 hits outside of `globals.css` `:root` block and `ConsoleGraphic.tsx` (if deferred to S7)

**Commit message:** `style(tokens): replace 87 hardcoded hex values with CSS var references -- no visual change`

---

### Section 4 -- Inline `playbookDomains` Array to Brand Content Import

**Finding:** High #5 (specific instance: `src/app/architecture/page.tsx`)
**Risk level:** Low-Medium. The brand package exports `playbookDomains` with the same shape (`n`, `title`, `color`) plus additional fields. The page only uses `n`, `title`, `color`. All present in the canonical export.

**What changes:**
- `src/app/architecture/page.tsx`: remove the 10-line local `const playbookDomains = [...]` array (lines 24-33), remove the local `domainByTitle` helper (line 36), replace with:
  ```ts
  import { playbookDomains, getDomainByTitle } from "@level9/brand/content/playbookDomains";
  ```
  Then replace all `domainByTitle(title)` calls with `getDomainByTitle(title)`.

**Pre-change verification:** Confirm the brand export's color values match the local array values. Visual diff check: rendered colors must be identical.

**Files affected:**
- `/Users/erichathaway/claude code 1/level9os-site/src/app/architecture/page.tsx` (remove ~12 lines, add 1 import line)

**Acceptance criteria:**
- `npm run build` passes cleanly
- `/architecture` route prerendered with 0 TS errors
- Brand package color values confirmed to match local array (audit shows they do: same 8 hex values)

**Kill-log entry required:** Yes, for the deleted local array.

**Commit message:** `content(architecture): replace local playbookDomains array with @level9/brand/content/playbookDomains import`

---

### Section 5 -- Footer Extraction to Shared Component

**Finding:** High #7, Medium #9
**Risk level:** Medium-High. Touches 7 page files. The footer markup is similar but not identical across pages (nav link sets vary slightly per page, background color is inconsistent: some use `#060610`, some use `var(--bg-root)`). Extraction requires:
1. Confirming the exact structural differences between footers
2. Building a single `src/components/SiteFooter.tsx` that handles all variants
3. Replacing the inline footer block in each page file

**Known differences already found:**
- `page.tsx` footer includes LinkedIn link and a slightly wider nav set (Architecture, Products, How We Work, Partnerships, About, Contact)
- `products/page.tsx` footer nav: Home, Architecture, How We Work, Partnerships, About, Contact (no LinkedIn)
- Background: 4 pages use `#060610` (hardcoded), 3 pages use `var(--bg-root)`. These are the same value (`#030306` vs `#060610` -- actually different). The extraction should standardize to `var(--bg-root)` (canonical).

**DECISION NEEDED on background inconsistency:** Four pages use `#060610` in the footer instead of `var(--bg-root)` (`#030306`). Options:
1. Standardize to `var(--bg-root)` (correct, tiny imperceptible delta on those 4 pages)
2. Standardize to `#060610` (wrong; bypasses the token system)
3. Keep per-page overrides (defeats the purpose of shared component)

Recommendation: Option 1.

**Files affected:**
- `src/components/SiteFooter.tsx` (new file, ~60 lines)
- `src/app/page.tsx` (replace ~63-line footer block with `<SiteFooter />`)
- `src/app/about/page.tsx` (replace ~40-line footer block)
- `src/app/architecture/page.tsx` (replace ~47-line footer block)
- `src/app/contact/page.tsx` (replace ~22-line footer block)
- `src/app/how-we-work/page.tsx` (replace ~44-line footer block)
- `src/app/partnerships/page.tsx` (replace ~40-line footer block)
- `src/app/products/page.tsx` (replace ~46-line footer block)

**Acceptance criteria:**
- `npm run build` passes cleanly, all 12 routes prerendered
- Visual spot-check: footer renders identically on `/`, `/products`, `/architecture`, `/contact`
- `SiteFooter.tsx` is under 80 lines
- Net line-count change: negative (remove ~300 lines of duplication, add ~60 in component)

**Kill-log entry required:** Yes, for the deleted footer block in each page (7 entries) plus background color standardization note.

**Commit message:** `refactor(layout): extract duplicated footer markup to SiteFooter component -- 7 pages x ~42 lines of duplication removed`

---

### Section 6 -- Raw `<img>` Tags to `next/image`

**Finding:** High #6
**Risk level:** Low-Medium. 7 occurrences, all identical pattern. If Section 5 executes first, this becomes a 1-line change in `SiteFooter.tsx` instead of 7 files.

**Order dependency:** Execute after Section 5. If Section 5 is deferred, this section touches 7 files directly.

**Change per occurrence:**
```tsx
// Before
<img src="/brand/logos/level9/chip.svg" alt="Level9OS" className="w-full h-full" />

// After
<Image src="/brand/logos/level9/chip.svg" alt="Level9OS" width={32} height={32} className="w-full h-full" />
```

Add `import Image from "next/image";` to each affected file (or to `SiteFooter.tsx` if Section 5 already ran).

**Files affected (if Section 5 ran first):**
- `src/components/SiteFooter.tsx` only

**Files affected (if Section 5 deferred):**
- 7 page files (same list as Section 5)

**Acceptance criteria:**
- `npm run build` passes cleanly
- No ESLint `@next/next/no-img-element` warnings
- `grep -rn "<img " src/` returns 0 hits

**Commit message:** `perf(images): replace 7 raw <img> logo tags with next/image for LCP and lazy-load`

---

### Section 7 -- ConsoleGraphic: Replace Local Copy with Brand Package Import

**Finding:** Critical #1
**Risk level:** High. This is an 878-line component. The brand package has an identical 878-line version. A diff between the two files returns no changes. They are byte-identical.

**Pre-execute verification:**
```bash
diff "/Users/erichathaway/claude code 1/level9os-site/src/components/architecture/ConsoleGraphic.tsx" \
     "/Users/erichathaway/claude code 1/level9os-site/node_modules/@level9/brand/src/components/architecture/ConsoleGraphic.tsx"
```
If diff returns 0 lines: safe to proceed. If any diff: STOP and escalate.

**What changes:**
1. In `src/app/page.tsx` line 16: change `import ConsoleGraphic from "@/components/architecture/ConsoleGraphic"` to `import { ConsoleGraphic } from "@level9/brand/components/architecture"`
2. Delete `src/components/architecture/ConsoleGraphic.tsx` (878 lines)
3. Delete `src/components/architecture/` directory if now empty

**Rollback:** `git revert HEAD` restores both the import and the file.

**Files affected:**
- `src/app/page.tsx` (1-line import change)
- `src/components/architecture/ConsoleGraphic.tsx` (deletion, 878 lines)
- `src/components/architecture/` directory (deletion if empty)

**Acceptance criteria:**
- `npm run build` passes cleanly
- `/` route prerendered with ConsoleGraphic rendering correctly
- `grep -rn "ConsoleGraphic" src/` shows 0 results in `src/components/`; 1 result in `src/app/page.tsx` using the brand import

**Kill-log entry required:** Yes. The kill entry must include the diff result (0 lines) as justification.

**Commit message:** `refactor(architecture): delete local ConsoleGraphic (878 lines) -- import canonical version from @level9/brand/components/architecture`

---

### Section 8 -- Section Marker Tagging and File Headers

**Finding:** Scope item from intake (in-scope: "File header tagging, section markers, function labels, error tags")
**Risk level:** Zero. Comment-only changes. No rendered output change.

**Files that need headers/markers:**
- `src/data/stats.ts` -- already has partial header; add full format
- `src/data/partners.ts` -- no header
- `src/components/FloatingNav.tsx` -- no header
- `src/app/layout.tsx` -- no header
- `src/app/page.tsx` -- partial; add section markers to the 10+ unnamed sections
- `src/components/SiteFooter.tsx` -- add header when created in Section 5

**Acceptance criteria:**
- `npm run build` passes cleanly
- Every file in `src/` has a file-level comment block (either existing or added)
- No whitespace or rendering change

**Commit message:** `docs(headers): add file headers and section markers to all src/ files`

---

### Section 9 -- Canonical Staging Pattern Extraction

**Finding:** Intake scope item ("Reusable pattern extraction to `canonical-staging/`")
**Risk level:** Zero. Creating files, not modifying existing ones.

**Patterns to extract:** During execution of Sections 1-8, collect patterns that prove reusable across other Level9 sites:
1. The `SiteFooter` structure (if extracted in Section 5) -- candidates for `@level9/brand/components/layout`
2. The `globals.css` `:root` token block -- already a candidate for brand CSS adoption
3. The pressure-point card pattern from `architecture/page.tsx`
4. The LiveTicker + CursorGradient + FloatingNav composition pattern from `layout.tsx`

**Output:** `canonical-staging/README.md` documenting what each extracted pattern is, why it is a candidate for the brand package, and what needs to happen before it can be promoted.

**Acceptance criteria:**
- `npm run build` still passes (canonical-staging is not in the `src/` content path by default)
- At least one pattern documented with a clear promotion path

**Commit message:** `docs(canonical-staging): document reusable patterns extracted during cleanup pass`

---

### Section 10 -- Outcome Report

**Finding:** Intake scope item ("Outcome report with before/after metrics")
**Risk level:** Zero. Documentation only.

**Output file:** `cleaner-log/level9os-site-outcome.md`

**Content:**
- Before/after line counts per file
- Before/after file count in `src/` and `public/`
- Net lines deleted
- Kill-log summary (count of kills, by type)
- Build status before and after
- Section-by-section verdict
- Deferred items list with rationale
- ROI verdict (is the codebase measurably smaller and more canonical?)

**Commit message:** `docs(cleaner-log): Phase 4 outcome report for CLEAN-level9os-site`

---

### Execution Order Summary

| Section | Finding | Risk | Files Changed | New Files | Deleted Files |
|---|---|---|---|---|---|
| S1 | Dead CSS classes | Low | 1 (`globals.css`) | 0 | 0 |
| S2 | Orphan logo files | Low | 0 | 0 | 5-12 |
| S3 | Hex colors to vars | Medium | 11 | 0 | 0 |
| S4 | Inline domain array | Low-Med | 1 | 0 | 0 |
| S5 | Footer extraction | Med-High | 7 | 1 | 0 |
| S6 | `<img>` to next/image | Low-Med | 1 (or 7) | 0 | 0 |
| S7 | ConsoleGraphic import | High | 1 | 0 | 1 (878 lines) |
| S8 | Section markers | Zero | 6 | 0 | 0 |
| S9 | Canonical staging | Zero | 0 | 1-2 | 0 |
| S10 | Outcome report | Zero | 0 | 1 | 0 |

**Total estimate:** ~1,100 lines removed, ~60 lines added (SiteFooter), net ~-1,040 lines.

---

### Open Decisions Required from Eric Before Execute

**Decision A (Section 2):** LinkedIn banner SVGs in `public/brand/` (`linkedin-banner-level9os.svg`, `linkedin-banner-linkupos.svg`, `linkedin-banner-lucidorg.svg`, `linkedin-banner-nextgenintern.svg`) are not referenced by any site code. Options:
1. Delete them (they are offline marketing assets, not site assets, and can be recovered from the pristine backup)
2. Keep them alongside `LINKEDIN-PAGE-SETUP.md` as reference material

**Decision B (Section 3):** Two occurrences of `#fb923c` (orange-400) in `how-we-work/page.tsx` at lines 62 and 139 (inside `productColor` fields on two project records). This color is off-palette. Options:
1. Map to `var(--amber)` (`#f59e0b`) -- closest palette color, will shift the orange very slightly toward gold
2. Leave as-is and document as intentional one-off
3. Remove `productColor` field entirely if it is not visually rendered (confirm with a read of those lines)

**Decision C (Section 5):** Footer background inconsistency. 4 pages use `#060610`, 3 use `var(--bg-root)` (`#030306`). The extraction standardizes to one value. Options:
1. Standardize to `var(--bg-root)` (canonical, imperceptible delta on the 4 non-canonical pages)
2. Defer footer extraction from this pass entirely (zero-pixel guarantee maintained)

---

### Checkpoints

Per the intake, 4 Eric check-ins are required. Proposed checkpoint gates:

- **Checkpoint 1 (NOW):** Eric reviews and approves this Phase 2 plan, resolves Decisions A/B/C
- **Checkpoint 2 (after S4):** Eric reviews S1-S4 commits, confirms no regressions before higher-risk sections
- **Checkpoint 3 (after S7):** Eric reviews S5-S7 commits (footer extraction + ConsoleGraphic), highest-risk sections complete
- **Checkpoint 4 (after S10):** Eric reviews outcome report, approves close

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

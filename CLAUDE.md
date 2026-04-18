# Level9OS Site — Agent Context

## Project Overview

**level9os.com** — the marketing front for the Level9 product company.
The canonical site of the family. The 4-pressure-point taxonomy story
(Decide / Coordinate / Execute / Measure) lives here.

## Live state (as of 2026-04-18)

- Production URL: https://level9os.com
- Vercel project: `level9os-site` (team `decisioning-v1`)
- GitHub: `erichathaway/level9os-site` (public)
- Deploy: auto-deploys from `main` branch
- Routes (9):
  - `/` — Home: gold rush hero + Two Halves + 4-pressure-point cycle + chassis + "two more pieces" (Playbook + MAX) + Operational DNA + Partners + CTA
  - `/architecture` — Deep dive: 4 pressure points → 8 operating layers → 8 COO Playbook domains
  - `/products` — All 6 products (StratOS, CommandOS, OutboundOS umbrella, COO Playbook, LucidORG, MAX) with sub-pods
  - `/how-we-work` — Live commercial projects + recent releases + 30/90/180 methodology + dogfood proof
  - `/partnerships` — Partner network
  - `/about` — Level9 the company
  - `/contact` — Contact CTAs

## Architecture

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Deployed to Vercel
- TS target: bundler-style (no explicit target needed for level9os; works on default)
- Strict ESLint runs in production builds (no `ignoreDuringBuilds`)

## Shared brand system

Consumes **`@level9/brand`** (https://github.com/erichathaway/level9-brand) via
git ref. Single source of truth for the family of marketing front-ends.

**Currently uses (from the package):**
- `@level9/brand/components/motion` — `FadeIn`, `Counter`, `AnimatedBar`,
  `RevealMask`, `MagneticCard`, `MagneticButton`, `CursorGradient`, `LiveTicker`
- `@level9/brand/content/products` — canonical product roster + sub-pods
- `@level9/brand/content/pressurePoints` — the 4 pressure points + chassis + installManual
- `@level9/brand/content/stack` — the 8 operating layers

**Available but not yet wired:**
- `@level9/brand/components/layout` (v0.5+) — `SectionHeader`, `AmbientBackground`,
  `HeroEyebrow`, `CycleRibbon`, `PressurePointCard`, `PlaybookDomainCard`,
  `FooterPattern`. Migrating pages to use these is a future cleanup pass.
- `@level9/brand/content/playbookDomains` — the 8 COO Playbook domains (currently
  the architecture page has a hardcoded list — should switch to importing this)
- `@level9/brand/content/voiceRules` — em-dash check helpers + voice characteristics

To update the package version: `npm install @level9/brand --force` (force flag
because git ref caching).

## Site-specific files (NOT shared, stay local)

- `src/components/FloatingNav.tsx` — Level9OS-specific 3-column nav
- `src/data/stats.ts` — twoHalves copy, dnaStats, problemStats, clientLogos,
  transformations
- `src/data/partners.ts` — Level9OS partner network roster
- `public/brand/*` — LinkedIn page assets (banners + LINKEDIN-PAGE-SETUP.md)
- `public/logos/*` — small client-trust-row company logos (Microsoft / Credit
  Suisse / etc) — these are for the "built on experience from" row, not Level9 brands

## Voice rules (from `@level9/brand/content/voiceRules`)

- **No em dashes** (`—`) in user-facing copy. Use periods, colons, or rephrase.
- Direct, operator-to-operator. No keyword inflation.
- Specific over general.
- Augments the workforce — never positions AI as replacing people.

## Brand color palette (from `@level9/brand/tokens/colors`)

Each pressure point gets a deterministic color — DO NOT reassign:
- Decide → violet `#8b5cf6` (StratOS)
- Coordinate → emerald `#10b981` (CommandOS)
- Execute → amber `#f59e0b` (OutboundOS umbrella + LinkupOS pod)
- Measure → cyan `#06b6d4` (LucidORG)

Plus:
- Chassis (The Vault) → red `#ef4444`
- COO Playbook → slate `#64748b`
- MAX → fuchsia `#ec4899`

## Cross-project impacts

- This is the CANONICAL site for the family. Patterns proven here flow back
  into the `@level9/brand` package, then propagate to other sites.
- Visual design follows `@level9/brand` tokens — DO NOT redefine local design tokens
- All product references use canonical content from `@level9/brand/content/products`

## What NOT to touch

- `@level9/brand` package consumption — to change shared tokens/components,
  edit the PACKAGE repo, then bump the git ref here
- The "Two Halves" and "Pressure Points" copy without explicit approval —
  this is the brand thesis surface

## Recent decisions log

- **2026-04-18** — Phase 1 cleanup: deduped `public/` folders, dropped 11 logo
  concept HTMLs. 28 files changed.
- **2026-04-18** — Phase 3 migration: now consumes `@level9/brand` v0.4 for
  tokens, motion components, and content. Deleted 9 local files. Build clean
  at 12/12 routes.

## Build verification

```bash
npm run build  # should succeed cleanly
```

12 routes prerendered, all static.

## Prior intelligence

- `~/claude code 1/level9-brand/` — the canonical shared brand system
- `~/claude code 1/level9-brand/audit/preview.html` — visual logo audit
- `~/claude code 1/level9-brand/BRAND-AGENT-HANDOFF.md` — outstanding brand-agent design tasks
- `~/claude code 1/level9-brand/VERCEL-AUDIT.md` — Vercel project inventory

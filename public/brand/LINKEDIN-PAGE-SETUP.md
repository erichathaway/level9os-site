# LinkedIn Company Page Setup — Step-by-Step

## Up front: what I can and can't do

**Cannot do for you:**
- Create a LinkedIn company page (LinkedIn requires a real human in their UI; no public API)
- Upload logos or banners
- Edit About sections, taglines, specialties, custom buttons
- Pin posts or set featured content

**Can do for you:**
- Generate the banner SVG/PNG (done — see below)
- Write all copy (done — paste-ready blocks below)
- Post AS the page through Unipile **once it exists and you've added your personal LinkedIn as admin** (done — Pages tab in dashboard)

Time to set up each page in LinkedIn's UI: ~5 minutes if you have the assets ready (you do).

---

## Asset prep — convert SVG banners to PNG (one-time)

LinkedIn accepts PNG/JPG, not SVG. Easiest options:

**Option A — Browser screenshot (simplest):**
1. Open the SVG file in Chrome/Safari
2. Resize browser to ≥ 1600px wide
3. Take a full-resolution screenshot of just the banner area
4. Crop to 1584 × 396

**Option B — Command line (cleaner, exact dimensions):**
```bash
# Install once (mac):
brew install librsvg

# Convert each banner:
cd "/Users/erichathaway/claude code 1/level9os-site/public/brand"
rsvg-convert -w 1584 -h 396 linkedin-banner-level9os.svg   -o level9os-banner.png
rsvg-convert -w 1584 -h 396 linkedin-banner-linkupos.svg   -o linkupos-banner.png
```

Logo (300 × 300 PNG) — use the same approach with the canonical mark:
```bash
rsvg-convert -w 300 -h 300 ../logo-9.svg -o level9os-logo.png
# LinkUpOS logo: use the "U" chip — extract from the banner SVG, or use
# /logos/nextgen.svg as a placeholder amber crosshair until a dedicated
# linkupos-logo.svg is created.
```

---

## ═══ LEVEL9OS PAGE ═══

### 1. Logo (300 × 300)
Use the canonical "9" obsidian chip from [logo-9.svg](level9os-site/public/logo-9.svg). Export as PNG at 300×300 with the chip centered (it already is in the source).

### 2. Banner (1584 × 396)
Use [linkedin-banner-level9os.svg](level9os-site/public/brand/linkedin-banner-level9os.svg). Export per instructions above.

### 3. Tagline (220 char limit)
```
AI for operations. The function that connects everything and decides whether strategy survives contact with reality.
```

### 4. About section (2,000 char limit) — paste verbatim
```
AI is a gold rush. Everyone's building it to make more money.
We build it for the side you actually control.

Operations is the function that connects strategy, finance, product, and people, and determines whether any of it actually ships. Most AI strategy decks describe a future state. They do not describe an operating change. That is the gap we close.

Three decades of operational leadership across global enterprises. The frameworks we sell are the ones we actually used. The pods we deploy are the ones we run on ourselves first.

Our products:
StratOS — AI Decision Rooms
CommandOS — Agent Orchestration
LucidORG — Measurement Platform
LinkUpOS — Signal Engine
COO Playbook — Execution Methodology
MAX — Coming Soon

Save the money. Save the time. Control the outcome.

hello@level9os.com
```

### 5. Specialties (paste each as a separate tag)
`Artificial Intelligence` · `Operations` · `AI Strategy` · `Operating Models` · `Decision Systems` · `COO Services` · `Executive Operations` · `Org Design` · `AI Deployment` · `Strategy Execution`

### 6. Custom button
**Button text:** Visit Website
**URL:** `https://level9os.com`

### 7. Featured posts (pin 3 once you have content)
1. The "AI is a gold rush / Operations is the only side you control" thesis post (use the test post in PAGES-DEPLOY.md)
2. A StratOS room demo or screenshot
3. The COO Playbook intro

---

## ═══ LINKUPOS PAGE ═══

**This page does not exist yet.** You need to create it first. Here's how:

### Create the page
1. Go to LinkedIn → top-right "Work" menu → **Create a Company Page**
2. Choose **Small business** (under 200 employees)
3. Fill in:
   - **Page name:** `LinkUpOS`
   - **LinkedIn public URL:** `linkupos` (claim before someone else does)
   - **Website:** `https://linkupos.com`
   - **Industry:** `Software Development` (or `Marketing Services` — your call; Software is more truthful)
   - **Company size:** `1-10 employees`
   - **Company type:** `Privately held`
   - **Logo:** upload the LinkUpOS logo (see below)
   - **Tagline:** see below
4. Verify via your personal account → **You are now the admin.**
5. Add yourself again as admin under Settings → Manage Admins (belt + suspenders for the Unipile admin check).

### 1. Logo (300 × 300)
The LinkUpOS logo is the **upside-down anchor** in amber. The canonical file is [linkupos-site/public/favicon.svg](linkupos-site/public/favicon.svg) — Lucide anchor icon, rotated 180°, amber #F59E0B stroke on dark #030306 rounded square.

```bash
rsvg-convert -w 300 -h 300 linkupos-site/public/favicon.svg -o linkupos-logo.png
```

Or use `/linkupos-site/public/icon-512.png` directly — it's already 512×512 PNG, LinkedIn will downscale.

### 2. Banner (1584 × 396)
Use [linkedin-banner-linkupos.svg](level9os-site/public/brand/linkedin-banner-linkupos.svg).

### 3. Tagline (220 char limit, exact from live site)
```
Your signal engine. Built for you. AI-powered LinkedIn posts, comments, and intros in your voice. 5 minutes a day.
```

### 4. About section (2,000 char limit) — paste verbatim
```
You don't need to post more. You need to matter more.

We turn your expertise into signal people can't ignore. AI-powered. Personalized. 5 minutes a day.

LinkUpOS is the signal engine for LinkedIn. Daily comments, strategic posts, and warm intros — all written in your voice, all backed by research. We don't generate content. We amplify your thinking into consistent, high-signal visibility.

Built different:
Voice-calibrated AI that learns how you actually write
Quality-gated content that filters out the slop before it reaches your feed
Full LinkedIn automation that respects platform rules
Tier-fair pricing from $0 to $149/mo (competitors charge $197 to $895)

Who it's for:
Operators, founders, executives, and consultants who know LinkedIn matters but cannot afford the daily time tax. People who want to show up where it counts, in their own voice, without becoming content creators.

Owned and operated by Level9OS LLC.

hello@linkupos.com
```

### 5. Specialties
`LinkedIn Strategy` · `Personal Branding` · `Content Automation` · `AI Writing` · `Executive Visibility` · `B2B Marketing` · `Social Selling` · `Thought Leadership` · `Marketing Automation` · `SaaS`

### 6. Custom button
**Button text:** Visit Website
**URL:** `https://linkupos.com`

### 7. Featured posts (pin 3 once you have content)
1. The "Algorithm rewards engagement, not posting" test post (in PAGES-DEPLOY.md)
2. A pricing/comparison post showing the $29-149 tiers vs $197-895 competitors
3. A user testimonial or before/after voice-calibrated comment screenshot

---

## After both pages are live: connect them to LinkUpOS dashboard

1. Open Unipile + look up the org IDs:
```bash
curl -H "X-API-KEY: $UNIPILE_KEY" \
  "https://api33.unipile.com:16322/api/v1/users/me/organizations?account_id=iISS0hVgRsGYZzgTps8xxA"
```

2. Both Level9OS and LinkUpOS will appear in that response with numeric `id` values.

3. Open `linkupos-site/sql/2026-04-16_pages_seed.sql`, paste those org IDs into `<ORG_ID_LEVEL9>` and `<ORG_ID_LINKUPOS>`, run it.

4. Open the LinkUpOS dashboard → Pages tab → both pages appear → use the test posts in PAGES-DEPLOY.md step 8.

---

## ═══ NEXTGEN INTERN PAGE ═══

**Brand source:** live `thenextgenintern.com` (note: the URL is *thenextgenintern.com*, not *nextgenintern.com* — that domain is parked/for sale).

**Brand name:** "NextGen Intern" — TWO words. Use this everywhere on the LinkedIn page.

### Create the page
LinkedIn → Work menu → Create a Company Page → **Nonprofit** type (since it's a 501(c)(3)).
- **Page name:** `NextGen Intern`
- **LinkedIn public URL:** `nextgenintern`
- **Website:** `https://thenextgenintern.com`
- **Industry:** `Non-profit Organization Management` or `Higher Education`
- **Type:** `Nonprofit`

### 1. Logo (300 × 300)
TBD — no canonical logo file found in the codebase. Either upload your existing logo from thenextgenintern.com, or I can build a parallel "N" obsidian chip (Level9 family system, blue/indigo edge) if you want — say the word.

### 2. Banner (1584 × 396)
Use [linkedin-banner-nextgenintern.svg](level9os-site/public/brand/linkedin-banner-nextgenintern.svg). Blue/indigo gradient with verbatim hero from the live site.

### 3. Tagline (220 char limit)
```
Non-profit leadership education and real-world internships. Build something real before you graduate. Powered by The Lucid Way methodology.
```

### 4. About section (2,000 char limit) — paste verbatim
```
Build something real before you graduate.

Learn leadership. Use enterprise tools. Then build a real product you own in a 3-month internship.

NextGen Intern is a 501(c)(3) non-profit providing real-world internships and leadership education. We bridge the gap between learning and doing — between what college teaches and what work demands.

Traditional education teaches theory. The real world demands execution.

Our students don't just learn. They immediately apply everything by designing, managing, and building a real product they own. Real tools. Real projects. Real accountability.

Who we serve:
College students looking for an internship that actually leads somewhere
High school students exploring what leadership looks like
Universities looking for an institutional partner to extend the classroom
Companies and corporate leaders building real early-career pipelines
Individual learners who want skills before credentials

Powered by The Lucid Way methodology. Built and run by people who have shipped real things in the real world.

hello@thenextgenintern.com
```

### 5. Specialties
`Leadership Development` · `Internship Programs` · `Higher Education` · `Workforce Development` · `Non-profit` · `Career Education` · `Experiential Learning` · `University Partnerships` · `Talent Pipeline` · `Youth Leadership`

### 6. Custom button
**Button text:** Visit Website
**URL:** `https://thenextgenintern.com`

---

## ═══ LUCIDORG PAGE ═══

### 1. Logo (300 × 300)
Use [level9os-site/public/logos/lucidorg.svg](level9os-site/public/logos/lucidorg.svg) — connected-nodes triangle in cyan #06B6D4. Export at 300×300 with adequate padding around the mark.

### 2. Banner (1584 × 396)
Use [linkedin-banner-lucidorg.svg](level9os-site/public/brand/linkedin-banner-lucidorg.svg). Sky-blue + violet ambient with the connected-nodes lattice on the right.

### 3. Tagline (220 char limit)
```
The operating layer for org decisions. Alignment, decision rights, and change without theater.
```

### 4. About section (2,000 char limit) — paste verbatim
```
Strategy is fiction until the org agrees on it.

Most strategy problems are not strategy problems. They are alignment problems wearing a strategy costume.

LucidORG is the operating layer for org decisions. We help leadership teams turn the org chart into actual coordination — where decision rights are explicit, accountability is real, and change does not depend on theater to land.

What we do:
Map decision rights without the RACI bureaucracy
Surface the misalignment that nobody wants to say out loud
Design org structures that match the operating cadence, not the other way around
Run change programs that actually change behavior, not just slide decks
Build the measurement layer so leaders can see where coordination breaks

Who we work with:
CHROs and COOs leading transformation
Exec teams 6 to 12 months into a reorg that is not converging
Boards that need a structural read on operating health
PE-backed companies post-acquisition

Part of the Level9OS family. Built by operators who have lived through the reorgs that worked and the ones that did not.

hello@lucidorg.com
```

### 5. Specialties
`Organizational Design` · `Change Management` · `Leadership Development` · `Decision Rights` · `Org Effectiveness` · `Transformation` · `Operating Models` · `Executive Coaching` · `Alignment` · `Governance`

### 6. Custom button
**Button text:** Visit Website
**URL:** `https://lucidorg.com`

---

## Cross-page brand notes

- **Family relationship:** All 4 pages are part of Level9OS LLC. LinkUpOS footer already says "Owned and operated by Level9OS LLC." Consider adding similar disclosure to LucidORG and NextGen Intern About sections (already drafted above).
- **The Lucid Way methodology** is referenced in the NextGen Intern footer. This is a real cross-tie — NextGen Intern's leadership education is built on LucidORG's methodology. Posts on either page can occasionally reference the connection without it feeling forced.
- **Visual family system:** Level9OS uses the obsidian chip with white tilted "9". LinkUpOS uses the orange target with the upside-down anchor (its real logo). LucidORG uses the connected-nodes lattice. NextGen Intern uses an "N" obsidian chip in the Level9 family system (blue/indigo edge instead of cool gradient) — flag if you want a different mark there.

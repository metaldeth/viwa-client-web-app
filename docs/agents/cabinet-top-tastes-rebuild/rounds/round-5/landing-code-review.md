# Landing Code Review — viwa-site Bento Rebuild (Round 5 of 5 — Final)

**Date:** 2026-07-29  
**Repo:** `c:\wiva\viwa-site`  
**Scope:** Independent final code review; recheck Round 4 open findings only (no inherited verdict)  
**Reference:** 897×867 PNG (`image-6858bf64-d4a3-4c50-9f98-d15528af69cd.png`)  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`, `viwa-site/README.md`  
**Round 4 context:** `rounds/round-4/landing-code-review.md`, `rounds/round-4/fix-resolution.md`  
**Round 5 pixel (external):** `viwa-site/docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/landing-pixel-browser-report.md`  
**Mode:** Read-only — no production edits, no commit/push/deploy/Docker

---

## Executive summary

Round 4→5 landing fixes are **verified in current code**: hero logo **277×243** with `transform: none` (no scale compensation), **Oswald** loaded non-blocking with condensed fallback stack, scoped header CTA rest **#412F6B** vs global accent **#4A247D** on hero/primary CTAs, canonical grid tokens preserved, menu Escape/focus convention intact, serial/`entry=website` CTA wiring unchanged.

**Static gate:** `static-regression-check.ps1` → **PASS**.  
**Idempotent assets:** `verify-assets-idempotent.ps1` → **PASS** (2× processor + stable SVG hash; Round 4 **R4-O1 ops drift resolved**).  
**Link/path check:** index.html local refs → **PASS**.

**hasCriticalIssues (code):** `false` — no production logic regressions found.  
**releaseBlockers:** **3** — (1) meaningful small text contrast **R5-A1**, (2) deploy asset staging **C3**, (3) pixel masked diff gate **R5-P1** (28.7% > 12%; see Round 5 pixel report).

Round 5 is the **final code-review gate**. Ship requires resolving release blockers at commit/deploy; optional carry-over items documented below.

---

## Round 4 open findings — recheck

| ID | Round 4 finding | Round 5 status | Evidence |
|----|-----------------|----------------|----------|
| **C3** | Untracked `assets/generated/landing/*`, medallions, staging dirs | **⏸ OPEN (deploy gate)** | `git status`: 10 modified + `?? assets/generated/landing/`, `?? assets/generated/tastes/medallions/`, `?? assets/.generated-good/`, `?? assets/.staging-viwa-assets/` |
| **R4-A1** | Eyebrow `#4a247d` on black ~1.8:1 | **❌ OPEN → R5-A1 release** | Computed **1.84:1**; see Accessibility |
| **R4-O1** | Idempotent verify restored stale 24-asset manifest | **✅ RESOLVED** | `verify-assets-idempotent.ps1` PASS; manifest **38** assets; 77 generated files |
| **R4-F1** | Closed menu `role="dialog"` + toggling `aria-modal` | **⚠️ carry-over** | `index.html:24` — APG-inconsistent but functional |
| **R4-F2** | No Tab trap / `inert` when menu open | **⚠️ carry-over** | Focus handoff works; no trap |
| **R4-S1** | Header logo link ~54×29 touch | **⚠️ by design** | Compact header geometry |
| **R4-S2** | Desktop CTAs 125×30 / 197×36 | **⚠️ by design** | Reference compact sizing |
| **R4-S3** | Bento labels on dark photo lack text-shadow | **⚠️ carry-over** | Labels use `#fff` + indices have shadow; low risk |
| **R4-P1** | Montserrat referenced, not preloaded | **⚠️ carry-over** | Oswald fixed; `--viwa-font-display` still silent Inter fallback for section titles |
| **R4-T1** | Condensed OS-dependent | **✅ mitigated** | Oswald preloaded; offline → Arial Narrow stack |
| **R4-G1/G2** | Empty tastes API; dev subcopy | **⚠️ carry-over** | Below-fold only |
| **R4-P2** | ±1px feature/bottom y | **✅ resolved** | Round 5 pixel boundaries 13/13 @897 |

---

## Round 4→5 fix verification

| Fix | Status | Evidence |
|-----|--------|----------|
| Hero logo no-scale **277×243** | **✅** | `viwa-landing.css:135-151` — fixed box, `overflow: hidden`, `transform: none`; static gate forbids hero scale; pixel probe right=304 (<328) |
| Oswald nonblocking + fallback | **✅** | `index.html:14-16` preload + `media="print" onload` + noscript; `--viwa-font-condensed: 'Oswald', 'Arial Narrow', …` |
| Hero title 44px / 400 / 2-line | **✅** | `index.html:98` nbsp phrase; `viwa-landing.css:531-553` |
| Hero subtitle 14px | **✅** | `.viwa-hero-brand__sub { font-size: 0.875rem }` |
| Header logo 54×29 clip | **✅** | `viwa-landing.css:109-124` scale on header img only |
| Scoped CTA colors | **✅** | `--viwa-accent-header-cta: #412f6b` on `.viwa-header__cta`; hero/serial CTAs use `--viwa-accent: #4a247d` |
| Board minmax + bento inner | **✅** | `viwa-landing.css:356-358`, `587-591`; tokens `68/531/66/202`, fr bottom quad |
| Bottom touch mobile (R3-S4) | **✅** | `viwa-landing.css:949-955` |
| Menu Escape/focus (R3-F3) | **✅** | `index.html:286-309` same-state guard; close → `openBtn.focus()` |
| Serial / entry registration | **✅** | `landing-cta.js:22-28`, `config.js:12`; query + input refresh |

---

## Accessibility — contrast (R5-A1)

### Method

WCAG 2.x relative luminance on sRGB hex pairs (same method as Round 4; recomputed 2026-07-29).

### Computed pairs

| Foreground | Background | Ratio | WCAG AA normal (4.5:1) | Used for |
|------------|------------|-------|------------------------|----------|
| `#ffffff` | `#000000` | 21.0:1 | ✅ | Body text |
| `#ffffff` | `#4a247d` | 11.4:1 | ✅ | Primary btn label on accent fill |
| `#a0a0a0` | `#000000` | 8.0:1 | ✅ | Muted subcopy |
| **`#4a247d`** | **`#000000`** | **1.84:1** | **❌** | **Eyebrow + link text** |
| `#111111` | `#e8e8e8` | 15.4:1 | ✅ | Light bento cell |

### Actual computed use of `#4A247D` as **text** on black

| Element | Content | Size | Required vs decorative | Verdict |
|---------|---------|------|------------------------|---------|
| `.viwa-hero-brand__eyebrow` | «Vitamin Water» | **9px** uppercase (`0.5625rem`) | **Required** category label — identifies product line | **Release fail** |
| `.viwa-btn--link` (bottom science/rhythm) | «Узнать больше», «Найти станцию» | **~9px** (`0.5625rem` / `0.6875rem`) | **Required** interactive controls on `#000` | **Release fail** |
| Global `a { color: var(--viwa-accent) }` | Inherits unless overridden | — | Most nav/footer use `--viwa-muted` or `--viwa-text`; bottom links hit accent | Scope fix with link token |
| `.viwa-bento__plus` | «+» glyph | 10px on **accent fill** | White on purple — 11.4:1 | ✅ OK |
| `--viwa-focus` outline | Focus ring | N/A | Non-text | ✅ OK |
| Primary CTAs | White on accent **background** | — | Background color, not text-on-black | ✅ OK (reference-critical) |

**Conclusion:** Round 4 **R4-A1** remains valid and is elevated to **R5-A1 release blocker** for meaningful small text. This is not decorative branding — eyebrow and bottom links convey product category and primary navigation actions.

### Scoped fix proposal (does not change reference-critical CTA/background fills)

Add a text-only token; keep `--viwa-accent` for buttons, plus badge, focus:

```css
/* viwa-tokens.css */
--viwa-accent-text-on-dark: #9b7cc8; /* ~6.1:1 on #000000 */
--viwa-accent-text-on-dark-hover: #b08fd4; /* ~7.5:1 on #000000 */

/* viwa-landing.css — scoped selectors only */
.viwa-hero-brand__eyebrow {
  color: var(--viwa-accent-text-on-dark);
}
.viwa-btn--link {
  color: var(--viwa-accent-text-on-dark);
}
.viwa-btn--link:hover {
  color: var(--viwa-accent-text-on-dark-hover);
}
```

Do **not** change `--viwa-accent`, hero CTA `#4A247D` background, or header CTA `#412F6B` scope. Re-verify eyebrow pixel color against reference after token apply (may need `#8B6BB8` ~4.9:1 if design insists on darker purple).

---

## Focus-area review

### Hero logo (no-scale 277×243)

- Picture box and img both **277×243**; `object-fit: fill`; **`transform: none`** on hero img.
- Header/footer use separate transform clip (header only) — hero stretch isolated per spec.
- LCP: single `fetchpriority="high"` on hero logo.

### Oswald loading

- Preconnect + preload as style + non-blocking stylesheet swap (`media="print" onload="this.media='all'"`).
- Noscript fallback present.
- Condensed stack: `'Oswald', 'Arial Narrow', …` — graceful degradation if CDN blocked.
- Static gate requires `family=Oswald` in HTML and Oswald first in `--viwa-font-condensed`.

### Typography / geometry

- Vertical tokens: **68 / 531 / 66 / 202** px.
- Board columns: `minmax(0, 36.57%) minmax(0, 28.43%) minmax(0, 35%)`.
- Bento: `28.43fr / 35fr`, rows **228 / 303**.
- Bottom quad order: bubble → science → station → rhythm; fr **22.2 / 25.3 / 32.55 / 19.95**.
- Hero H1: `Вкус` + `<br>` + `в&nbsp;точной&nbsp;дозе` with `white-space: nowrap`.

### CTA scoped colors

| Control | Rest background | Text |
|---------|-----------------|------|
| Header «Найти станцию» | `#412f6b` (`--viwa-accent-header-cta`) | `#fff` |
| Hero / serial primary | `#4a247d` (`--viwa-accent`) | `#fff` |
| Bottom link CTAs | transparent | `#4a247d` text ← **R5-A1** |

Desktop header CTA **125×30** @ x747; hero CTA **197×36**; mobile touch **44px** on primary controls and bottom links.

### Registration serial / source

- `entryParam: 'website'` → `/register?entry=website[&serial=…]`.
- Serial from `#viwa-serial-input` or `?serial=` query; `landing-api.js` prefills input; `landing-cta.js` refreshes hrefs on input/change.
- Auth links → `/auth` via `data-viwa-cta="auth"`.

### Menu focus

```javascript
// index.html:286-309 — verified
if (open === isMenuOpen()) return;
if (e.key === 'Escape' && isMenuOpen()) setMenu(false);
// close: openBtn.focus(); second Escape while closed = no-op
```

Open → `closeBtn.focus()`; close → trigger focus retained.

### Mobile layouts (360 / 390 / 430)

| Check | 360 | 390 | 430 | Notes |
|-------|-----|-----|-----|-------|
| Stack order | ✅ | ✅ | ✅ | hero → bento → feature → bottom → below-fold |
| H-scroll guard | ✅ | ✅ | ✅ | `overflow-x: hidden`; pixel report confirms |
| Header 68px | ✅ | ✅ | ✅ | Token-driven |
| Hamburger 44×44 | ✅ | ✅ | ✅ | |
| Header CTA | hidden | hidden | ✅ 44px | `@430–767` band |
| Hero / serial CTAs 44px | ✅ | ✅ | ✅ | |
| Bottom link touch | ✅ | ✅ | ✅ | R3-S4 mobile override |
| Safe-area | ✅ | ✅ | ✅ | header, menu, below, footer |

Round 5 pixel responsive checks: no overflow @360/390/430/1440.

### Assets / manifest / idempotency

| Item | Status |
|------|--------|
| Manifest asset count | **38** (14 tastes + 14 medallions + logo + hero×2 + cabinet + landing×6) |
| On-disk generated files | **77** under `assets/generated/` |
| Landing WebP+PNG (6×2) | Present on disk |
| Medallions (14×2) | Present on disk |
| Processor idempotency | **PASS** — SVG hash stable across 2 runs |
| Manifest triple-sync | Asserted in idempotent script (site/client/ts) |
| Git staging | **C3 OPEN** — deploy tree untracked |

**Untracked deploy assets accounted:**

| Path | Role | Staging action at commit |
|------|------|--------------------------|
| `assets/generated/landing/*` | Bento + bottom rasters (12 files) | `git add` |
| `assets/generated/tastes/medallions/*` | 14 medallions × 2 formats | `git add` |
| `assets/.generated-good/` | Post-verify backup (ops) | Add to `.gitignore` or commit per team policy |
| `assets/.staging-viwa-assets/` | Processor staging (ops) | **Exclude** via `.gitignore` |
| Modified `assets/manifest.json` + `.good.bak` | 38-asset gate | Commit with generated tree |

---

## Verification run (this review)

| Check | Result | Notes |
|-------|--------|-------|
| `powershell -File scripts/static-regression-check.ps1` | **PASS** | All bento/Oswald/hero/no-scale/header-CTA hooks |
| `powershell -File scripts/verify-assets-idempotent.ps1` | **PASS** | ~120s; 2× processor; R4-O1 closed |
| Link/path check (`index.html` local href/src) | **PASS** | CSS, JS, icons, assets, legacy pages |
| `git status` | 10 modified + 4 untracked trees | No commit (per instructions) |
| Code read | Complete | `index.html`, `viwa-landing.css`, `viwa-tokens.css`, `landing-api.js`, `landing-cta.js`, `config.js`, scripts |
| Round 5 pixel @897 | **Not rerun here** | External report: SSIM **0.8467**, masked diff **28.7%** FAIL |
| Browser functional | **Not rerun here** | Round 5 pixel report: **0 failures** |
| Production edits | **None** | Read-only review |

---

## Release blockers & remaining fixes

### Release blockers (must fix before production deploy)

| ID | Blocker | Exact fix |
|----|---------|-----------|
| **R5-A1** | Eyebrow + bottom link text **1.84:1** on black | Add `--viwa-accent-text-on-dark` (~`#9b7cc8`); scope `.viwa-hero-brand__eyebrow` + `.viwa-btn--link` only |
| **C3** | Untracked generated landing + medallion assets | `git add assets/generated/landing assets/generated/tastes/medallions assets/manifest.json` (+ client mirror if deploy script expects sync) |
| **R5-P1** | Pixel masked diff **28.7%** > 12% gate | Typography/color tuning per Round 5 pixel hotspots (hero-brand grey drift, header-cta zone); re-run masked compare |

### Recommended before commit (non-blocking code)

| ID | Fix |
|----|-----|
| R4-P1 | Preload Montserrat or drop from `--viwa-font-display` stack |
| R4-F2 | Optional Tab trap / `inert` on `.viwa-page` when menu open |
| R4-G2 | Replace dev-facing section subcopy before public launch |
| Ops | Add `assets/.staging-viwa-assets/` to `.gitignore`; refresh `.generated-good` after manifest changes |

---

## Final verdict (Round 5/5)

| Field | Value |
|-------|-------|
| **hasCriticalIssues** | **`false`** (no code logic/security regressions) |
| **releaseBlockers** | **`["R5-A1-contrast-small-text", "C3-untracked-deploy-assets", "R5-P1-pixel-masked-diff"]`** |
| **requirementCompliance** | **pass-with-release-reservations** |
| **staticRegressionCheck** | **PASS** |
| **verifyAssetsIdempotent** | **PASS** |
| **linkPathCheck** | **PASS** |
| **round4OpsDrift (R4-O1)** | **resolved** |

**Sign-off:** Code structure, geometry hooks, Oswald policy, CTA scoping, serial wiring, menu focus, and asset pipeline are **ready for commit batch**. Production release remains **blocked** until **R5-A1** contrast, **C3** asset staging, and product acceptance of **R5-P1** pixel gate (or explicit waiver).

---

## Addendum — post-remediation final review (2026-07-29)

Independent read-only recheck after `landing-round5-remediation.md`. Mirror: `viwa-site/docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/landing-round5-final-review-addendum.md`.

| Item | Result |
|------|--------|
| **R5-A1** | **CLOSED** — `--viwa-accent-text-on-dark` scoped to eyebrow + bottom science/rhythm links; 6.11:1 / 7.73:1 hover |
| **Tonal tokens** | Ref-match nav/sub below AA (non-blocker); rhythm lines decorative waiver |
| **Hero title scaleX** | Semantic spans; desktop-only; mobile reset OK |
| **Feature bar** | Desktop flex-start + per-third padding; mobile centered |
| **Bottom typography** | Inter rhythm desktop; scoped link contrast |
| **13 boundaries** | Not rerun; assumed intact from pre-remediation pixel + remediation probe |
| **Static regression** | **PASS** |
| **verify-assets-idempotent** | **PASS** |
| **Release blockers** | **C3**, **R5-P1** (2 remaining) |

---

## JSON summary

```json
{
  "round": 5,
  "scope": "viwa-site-landing",
  "finalReview": true,
  "hasCriticalIssues": false,
  "releaseBlockers": [
    "R5-A1-contrast-small-text",
    "C3-untracked-deploy-assets",
    "R5-P1-pixel-masked-diff"
  ],
  "criticalCount": 0,
  "releaseBlockerCount": 3,
  "round4OpenRecheck": {
    "resolved": ["R4-O1", "R4-T1-mitigated", "R4-P2"],
    "open": ["C3", "R4-A1→R5-A1", "R4-F1", "R4-F2", "R4-S1", "R4-S2", "R4-S3", "R4-P1", "R4-G1", "R4-G2"]
  },
  "round4to5FixesVerified": [
    "hero-logo-277x243-no-scale",
    "oswald-nonblocking-preload",
    "header-cta-scoped-412F6B",
    "hero-cta-global-4A247D",
    "geometry-tokens-897x867",
    "menu-escape-focus",
    "serial-entry-website"
  ],
  "contrast": {
    "accentOnBlack": 1.84,
    "eyebrowFailsAA": true,
    "bottomLinkFailsAA": true,
    "proposedTextToken": "#9b7cc8"
  },
  "staticRegressionCheck": "PASS",
  "verifyAssetsIdempotent": "PASS",
  "linkPathCheck": "PASS",
  "pixelGate": "FAIL-masked-28.7pct",
  "lastMaskedSSIM": 0.8467
}
```

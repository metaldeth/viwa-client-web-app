# Landing Code Review — viwa-site Bento Rebuild (Round 3 of 5)

**Date:** 2026-07-29  
**Repo:** `c:\wiva\viwa-site`  
**Scope:** Independent re-review after Round 2 direct-measurement geometry rewrite  
**Reference:** 897×867 PNG (`image-6858bf64-d4a3-4c50-9f98-d15528af69cd.png`)  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`  
**Historical context:** `rounds/round-2/landing-code-review.md`, `rounds/round-2/fix-resolution.md`  
**Mode:** Read-only — no code edits

---

## Executive summary

Round 2 geometry fixes and regression repairs are **verified in current code**. Canonical tokens (68/531/66/202 rows, 36.57/28.43/35 columns, bento 228/303, bottom quad order/widths), hero logo stretch, flash `filter: none`, Escape/`isMenuOpen()` guard, non-blocking fonts, and LCP-only `fetchpriority="high"` all match fix-resolution and static gate hooks. Static regression **PASS**. API shell, mock guard, and error/retry paths unchanged — **no functional regressions from geometry rewrite**.

**Round 2 regressions R2-S7 / R2-F3:** **resolved**.

**C3 (untracked landing assets):** still deferred; **deploy gate** at final commit.

**Pixel gate:** not rerun this round — SSIM still open from Round 2 (0.204).

**hasCriticalIssues:** `false` for Round 3 code sign-off.

---

## Round 2 fix verification (known items)

| ID | Fix | Round 3 status | Evidence |
|----|-----|----------------|----------|
| G1 | Columns 36.57 / 28.43 / 35 | **✅ RESOLVED** | `viwa-tokens.css:42-44`; board grid `viwa-landing.css:352` |
| G2 | Bento rows 228 / 303 | **✅ RESOLVED** | `--viwa-bento-row-top/bottom`; `viwa-landing.css:536` |
| G3 | Header 68px | **✅ RESOLVED** | `--viwa-header-height: 68px`; `height: var(--viwa-header-height)` |
| G4 | Hero logo ~275×241 stretch | **✅ RESOLVED** | `aspect-ratio: 277/243`, `max-height: 241px`, `object-fit: fill` |
| G8 | Bottom quad order/widths | **✅ RESOLVED** | HTML bubble→science→station→rhythm; fr 22.2/25.3/32.55/19.95 |
| R2-S7 | Flash no invert | **✅ RESOLVED** | `.viwa-feature-bar__icon--flash img { filter: none }` (`viwa-landing.css:751-753`) |
| R2-F3 | Escape guard | **✅ RESOLVED** | `isMenuOpen()` + same-state no-op; Escape only when open (`index.html:282-309`) |
| P1 | Non-blocking fonts | **✅ RESOLVED** | HTML preload + `media="print" onload`; no `@import` in CSS/HTML |
| P2 | LCP priority only | **✅ RESOLVED** | Hero logo `fetchpriority="high"` once; 6 bento/bottom imgs `loading="lazy"` |
| C1/C2 | Science copy + mobile CTA touch | **✅ CARRY-OVER OK** | `science-exact-v1` hook; 44px touch @430–767 preserved |
| DOC | README 24-asset bento | **✅ RESOLVED** | `README.md:7-37` matches canonical geometry + LCP policy |

---

## Requirement checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| 897×867 canonical geometry | ✅ code | Tokens + CSS align with direct measurement; pixel SSIM unverified this round |
| Edge-to-edge black board, 1px `#333` borders | ✅ | `--viwa-border: #333333` |
| Header 68px | ✅ | Was 60px in R1/R2 early; intentional R2 geometry update |
| Columns 36.57 / 28.43 / 35 | ✅ | Replaces 40/30/30 |
| Rows 531 / 66 / 202 (+ header = 867) | ✅ | Sums to reference above-fold |
| Bento 228 / 303 | ✅ | Unequal rows on desktop |
| Bottom 4-col bubble \| science \| station \| rhythm | ✅ | Order + fr weights in tokens/CSS |
| Hero logo stretch | ✅ | Hero-only hooks; header logo 57×29 separate stretch |
| Exact science copy | ✅ | `data-viwa-ref-copy="science-exact-v1"` |
| Live API, no hardcoded prices | ✅ | Static gate + `landing-api.js` |
| `useMockApi: false`, prod fail-closed | ✅ | `config.js:11`; `resolveUseMock()` |
| Error/retry states | ✅ | `renderFlavorsError` / tiers error UI intact |
| Mobile stack + hamburger | ✅ | Single-column board <768px; menu overlay |
| Touch ≥44px mobile CTAs | ⚠️ | Header/menu/hero/serial OK; bottom strip links + header logo exceptions |
| A11y baseline | ⚠️ | Escape fixed; focus trap / dialog role partial |
| Performance / LCP | ✅ | Fonts + lazy policy fixed |
| C3 landing assets git | ⏸ | `?? assets/generated/landing/` (12 files) |
| `site-version.txt` not bumped | ✅ | Intentional |

---

## Critical findings (🔴)

| ID | Area | Finding | New? |
|----|------|---------|------|
| — | — | **No Round 3 code blockers** | — |
| **C3** | Deploy hygiene | **`assets/generated/landing/*` still untracked** — production 404 if deployed without staging | carry-over |

> **Round-3 code verdict:** Geometry rewrite + R2 regressions closed in code. C3 deploy-only. Pixel QA deferred.

---

## Noncritical findings (🟡)

### Resolved from Round 2

| ID | Status |
|----|--------|
| R2-S7 flash invert | ✅ fixed |
| R2-F3 Escape focus theft | ✅ fixed |
| R2-P1 blocking `@import` fonts | ✅ fixed |
| R2-P2 eager bento LCP | ✅ fixed (all bento/bottom lazy) |

### Carry-over (unchanged)

| ID | Area | Finding |
|----|------|---------|
| R3-F1 | A11y | `role="dialog"` on closed menu with `aria-modal="false"` — APG-inconsistent (was R2-F1) |
| R3-F2 | A11y | No Tab trap / `inert` on `.viwa-page` when menu open (was R2-F2) |
| R3-G1 | General | `#flavors` no initial `data-state="loading"` (JS sets on load; `aria-busy="true"` only) |
| R3-G2 | General | Dev-facing subcopy in flavors/tiers sections |
| R3-G3 | General | Empty tastes API → blank grid, no empty-state |
| R3-G4 | General | Tiers hard-fail when `items.length !== 2` |
| R3-S1 | Styles | Header logo link below 44px (57×29, `min-height: 0` on header logo) — trade-off for 68px header |
| R3-S2 | Styles | `.viwa-bento__label` / `.viwa-bento__flavor` on dark cells lack text-shadow (indices/list have it) |
| R3-S3 | Styles | Desktop header CTA 125×30 and hero CTA 197×36 @768+ — below 44px by design (G7) |
| R3-S4 | Styles | Bottom strip `.viwa-btn--link` overrides to `min-height: auto` — small touch target on mobile for «Узнать больше» / «Найти станцию» |
| R3-P1 | Perf | `--viwa-font-display: 'Montserrat'` referenced but not in font preload (Inter only) — silent fallback |
| R3-F3 | UX | Tablet 430–767 header crowding (logo + 44px CTA + hamburger) — geometry unchanged |

### Geometry rewrite — regression scan

| Area | Result |
|------|--------|
| API hooks / mock guard | ✅ no change |
| Below-fold IDs / CTA attrs | ✅ preserved |
| Science copy hook | ✅ preserved |
| Mobile stack order | ✅ hero → bento → feature → bottom → below-fold |
| Board grid breakpoint | ✅ desktop ≥768px only |
| Accidental revert of R1 fixes | ✅ none found |

---

## Mobile 360 / 390 / 430 (code review)

| Check | 360 | 390 | 430 | Notes |
|-------|-----|-----|-----|-------|
| Horizontal scroll guard | ✅ | ✅ | ✅ | `overflow-x: hidden` on body/page |
| Header height 68px | ✅ | ✅ | ✅ | Token-driven |
| Hamburger 44×44 | ✅ | ✅ | ✅ | `.viwa-menu-toggle` |
| Header CTA visible | ❌ | ❌ | ✅ | Hidden <430px; menu-only nav |
| Header CTA touch @430–767 | — | — | ✅ | `min-height: var(--viwa-touch-min)` |
| Hero CTA touch | ✅ | ✅ | ✅ | `min-height: 44px`, full-width cap 197px |
| Feature strip item height | ✅ | ✅ | ✅ | `min-height: 44px` mobile |
| Menu overlay links | ✅ | ✅ | ✅ | `min-height: 44px` |
| Serial input + continue | ✅ | ✅ | ✅ | Input + primary btn 44px |
| Bottom quad link touch | ⚠️ | ⚠️ | ⚠️ | R3-S4 — `min-height: auto` override |
| Safe-area insets | ✅ | ✅ | ✅ | body, menu overlay, below-fold, footer |

> Formal browser pixel/smoke at 360/390/430 not run this round — table from CSS/static analysis.

---

## Verification run (this review)

| Check | Result |
|-------|--------|
| `powershell -File scripts/static-regression-check.ps1` | **PASS** |
| `git status` | 10 modified + `?? assets/generated/landing/` (12 files) + staging dirs |
| Independent code read (`index.html`, `viwa-landing.css`, `viwa-tokens.css`, `landing-api.js`, `config.js`) | Complete |
| Round 2 pixel SSIM @897 | **Not rerun** — last 0.2042 (`round-2/landing-pixel-browser-report.md`) |
| Browser smoke / functional | **Not rerun** — Round 2 PASS assumed; no API/HTML hook changes since geometry fix |

---

## Delta vs Round 2

| Area | Round 2 | Round 3 |
|------|---------|---------|
| Header height | 60px (pre-geometry) | ✅ 68px verified |
| Column spec | 40/30/30 measured OK | ✅ 36.57/28.43/35 in code |
| Hero logo | ~210×228 | ✅ ~275×241 stretch hooks |
| R2-S7 flash invert | 🔴 regression | ✅ fixed |
| R2-F3 Escape | 🔴 regression | ✅ fixed |
| R2-P1 fonts | 🔴 `@import` | ✅ link/preload |
| R2-P2 LCP | partial eager | ✅ lazy bento/bottom |
| Static gate | PASS | PASS |
| hasCriticalIssues (code) | false | **false** |
| Pixel gate | FAIL 0.204 | open (not rerun) |

---

## Suggested fix priority (Round 4)

1. **Round 3 pixel browser @897** + mobile 360/390/430 — validate geometry in browser after rewrite.
2. **Stage `assets/generated/landing/*`** at final commit (C3).
3. Bottom strip link touch targets (R3-S4) — restore `min-height: 44px` or expand hit area on mobile.
4. Tab trap / `inert` when menu open (R3-F2).
5. Optional: preload Montserrat or drop from `--viwa-font-display` (R3-P1).

---

## JSON summary

```json
{
  "round": 3,
  "scope": "viwa-site-landing",
  "hasCriticalIssues": false,
  "criticalCount": 0,
  "deployGateAtCommit": ["C3-untracked-landing-assets"],
  "pixelGate": "not-rerun",
  "lastMaskedSSIM": 0.2042,
  "round2FixesVerified": [
    "G1-columns-36.57-28.43-35",
    "G2-bento-228-303",
    "G3-header-68px",
    "G4-hero-logo-stretch",
    "G8-bottom-quad-order-widths",
    "R2-S7-flash-no-invert",
    "R2-F3-escape-guard",
    "P1-nonblocking-fonts",
    "P2-lcp-priority-only"
  ],
  "noncriticalCount": 12,
  "newFindingIds": ["R3-F1", "R3-F2", "R3-G1", "R3-G2", "R3-G3", "R3-G4", "R3-S1", "R3-S2", "R3-S3", "R3-S4", "R3-P1", "R3-F3"],
  "resolvedFromR2": ["R2-S7", "R2-F3", "R2-P1", "R2-P2"],
  "requirementCompliance": "pass-with-reservations",
  "staticRegressionCheck": "PASS",
  "functionalSmoke": "not-rerun"
}
```

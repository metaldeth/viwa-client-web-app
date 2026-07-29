# Landing Code Review — viwa-site Bento Rebuild (Round 2 of 5)

**Date:** 2026-07-29  
**Repo:** `c:\wiva\viwa-site`  
**Scope:** Re-review after Round 1 fixes (C1/C2/N1–N2/N5/N10/N13/N14/N22–N24 partial)  
**Reference:** 897×867 PNG (`image-6858bf64-d4a3-4c50-9f98-d15528af69cd.png`)  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`  
**Inputs:** `rounds/round-1/landing-code-review.md`, `rounds/round-1/landing-fix-resolution.md`, `rounds/round-2/landing-pixel-browser-report.md`  
**Reviewers:** review-general, review-styles, review-performance, review-docs, review-final (parallel, `composer-2.5-fast`)  
**Mode:** Read-only — no code edits

---

## Executive summary

Round 1 blockers **C1 (science copy)** and **C2 (header CTA touch ≥44px)** are **verified fixed** in current code. Static regression gate **PASS**. API hooks, fail-closed mock guard, and error/retry flows remain intact — **no functional API regressions**.

**Round 2 geometry (browser @897×867):** header **60px** ✅, hero logo bbox **209.9×228px** (~210px height target) ✅, 40/30/30 grid columns match reference math ✅. Pixel SSIM still **FAIL** (0.204 masked) — typography/layout drift vs reference artboard remains Round 3+ work.

**C3 (untracked landing assets)** correctly **deferred** per task policy; still a **deploy gate** at final commit.

**New regressions from Round 1 fixes:** flash icon color broken by `filter: invert(1)` after N10 SVG recolor (R2-S7); Escape key unconditionally refocuses hamburger even when menu closed (R2-F3, from N5 partial fix).

**hasCriticalIssues:** `false` for Round 2 **code sign-off** (C1/C2 resolved, no new functional/API blockers). **Deploy gate:** C3. **Pixel gate:** still open (SSIM).

---

## Round 1 fix verification

| ID | Round 1 issue | Round 2 status | Evidence |
|----|---------------|----------------|----------|
| **C1** | Science body ≠ reference | **✅ RESOLVED** | `index.html:182` — exact sentence + `data-viwa-ref-copy="science-exact-v1"`; static gate asserts hook |
| **C2** | Header CTA 36px touch @430–767 | **✅ RESOLVED** | `viwa-landing.css:403-407, 420-426` — `min-height: var(--viwa-touch-min)` (44px); tablet MQ does not override height |
| **C3** | Untracked `assets/generated/landing/*` | **⏸ DEFERRED** | `git status`: `?? assets/generated/landing/` — 12 files on disk, static gate PASS; stage at final commit |
| **N1–N2** | Skip/main landmark | **✅ RESOLVED** | `<main id="main">` wraps board + below-fold (`index.html:74-244`); footer correctly outside |
| **N5** | Menu a11y | **⚠️ PARTIAL** | `role="dialog"`, `aria-modal` toggle, focus to close/return — **no Tab trap** (R2-G1); Escape regression (R2-F3) |
| **N10** | flash.svg legacy accent | **⚠️ REGRESSION** | SVG `#5C2DA8` correct, but `.viwa-feature-bar__icon img { filter: invert(1) }` inverts purple → wrong color (R2-S7) |
| **N13** | Bento contrast | **✅ IMPROVED** | `text-shadow` on dark overlay indices/list items |
| **N14** | Hardcoded `#111` | **✅ RESOLVED** | `--viwa-text-on-light` token |
| **N22–N24** | LCP / eager bento | **⚠️ PARTIAL** | Bottom bento `loading="lazy"`; top row still eager-default; fonts `@import` unchanged |

---

## Requirement checklist (reference + task-site-report)

| Requirement | Status | Notes |
|-------------|--------|-------|
| 897×867 bento grid (40/30/30) | ⚠️ | CSS + browser: cols 358.8 / 269.1 / 269.1 @897 ✅; masked SSIM 0.204 — visual parity FAIL |
| Edge-to-edge black board, 1px `#333` borders | ✅ | Pixel: border `rgb(51,51,51)` on board cells |
| Header 60px | ✅ | CSS token + browser measure **60px** all viewports (360/390/430/897/1440) |
| Accent `#5C2DA8` | ⚠️ | Token + CTA accent OK; flash icon wrong after invert (R2-S7) |
| Hero logo stretch ~210px @897 | ✅ | Browser: **h=209.9px, w=228px**; CSS `clamp(130px, 23.4vw, 210px)` |
| Exact copy vs reference | ✅ | Science body exact (C1 fixed); dev subs remain (N6) |
| Nav IA + CTA targets | ✅ | Functional smoke PASS |
| Feature strip labels | ✅ | B3/B6/B12, Mg Zn, calories |
| Bento cells 01–03 + Lab Range | ✅ | Layout/copy aligned |
| Below-fold hooks preserved | ✅ | `#viwa-flavors-grid`, `#viwa-tiers-list`, `#viwa-serial-input` |
| Live API, no hardcoded tier prices | ✅ | Functional + static PASS |
| `useMockApi: false`, prod fail-closed | ✅ | `config.js:11`; `resolveUseMock()` |
| Error/retry states | ✅ | API error/retry flow PASS in pixel run |
| Asset pipeline 24 assets | ✅ | On disk; C3 git staging deferred |
| Mobile: stack, hamburger, touch ≥44px | ✅ | Menu touch ≥44px; header CTA 44px @430–767 |
| Semantic HTML / a11y baseline | ⚠️ | Main landmark fixed; focus trap + Escape regression (R2-F2, R2-F3) |
| Performance / LCP | ⚠️ | Top bento eager-default; `@import` fonts (R2-P1–P2) |
| `site-version.txt` not bumped | ✅ | Intentional |

---

## Critical findings (🔴)

| ID | Area | Finding | New? |
|----|------|---------|------|
| — | — | **No new Round 2 code blockers** — C1/C2 resolved | — |
| **C3** | Deploy hygiene | **`assets/generated/landing/*` (12 files) still untracked** — deferred by policy; production 404 if committed without staging | carry-over |

> **Round-2 code verdict:** C1/C2 closed. C3 is deploy gate only (not Round 2 code blocker). Pixel SSIM gate remains open for Round 3+.

---

## Noncritical findings (🟡)

### New from Round 1 fixes (regressions)

| ID | Finding |
|----|---------|
| **R2-S7** | **Flash icon color regression:** `icons/flash.svg` set to `#5C2DA8` (N10), but `.viwa-feature-bar__icon img { filter: invert(1) }` (`viwa-landing.css:710-714`) inverts purple → ~`#A3D257`. drop/bubbles icons (light `#F5F5F7`) invert correctly. |
| **R2-F3** | **Escape focus theft:** `keydown` Escape calls `setMenu(false)` unconditionally (`index.html:298-300`) → refocuses `#viwa-menu-open` even when menu closed (e.g. while typing serial input). Introduced by N5 focus-return fix. |
| **R2-F1** | Static `role="dialog"` when menu closed with `aria-modal="false"` — APG-inconsistent (N5 partial). |
| **R2-F2** | Tab can reach header behind open overlay — no focus trap / `inert` (R2-G1). |

### Carry-over from Round 1 (unchanged or partial)

| ID | Area | Finding |
|----|------|---------|
| R2-G2 | General | `#flavors` lacks initial `data-state="loading"` (N7/N36) |
| R2-G3 | General | Dev-facing subcopy in flavors/tiers sections (N6) |
| R2-G4 | General | Empty tastes API → blank grid (N12) |
| R2-G5 | General | Tiers hard-fail when `items.length !== 2` (N8) |
| R2-S5 | Styles | Bento `.viwa-bento__label` / `.viwa-bento__flavor` on dark cells lack text-shadow |
| R2-S4 | Styles | Header logo link below 44px touch (28px img) — trade-off for 60px header |
| R2-P1 | Perf | Fonts `@import` in CSS — render-blocking (N22) |
| R2-P2 | Perf | Top bento row eager-default (`index.html:108,115`) — N23 partial |
| R2-P3 | Perf | Manifest gates tiers/tastes fetch (N27) |
| R2-D1–D3 | Docs | README stale: concept-16, 18 assets, hero-station (N30) |
| R2-F4 | UX | Tablet 430–767 header crowding (logo + 44px CTA + hamburger) |
| R2-F5 | Perf | Top bento eager — same as R2-P2 |

---

## Reviewer section summaries

### review-general — ✅ C1/C2 resolved / ⚠️ 1 partial a11y + C3 deferred

API wiring, mock guard, static regression PASS. Menu focus trap incomplete. No functional regressions from `<main>` wrap.

### review-styles — ✅ 6/7 verify points / ⚠️ 1 new regression (flash invert)

Header 60px, logo ~210@897, typography, C2 touch, bento text-shadow confirmed by CSS + pixel geometry. Flash icon color regression from invert + N10 combo.

### review-performance — ⚠️ N22–N24 partial / no new serious perf regressions

Hero `fetchpriority="high"` OK; bottom lazy OK; top bento still eager; `@import` fonts top CWV risk. `<main>` / overflow-x neutral.

### review-docs — ⚠️ README stale / script aligned

`static-regression-check.ps1` matches current hooks (PASS). README still describes concept-16 / 18 assets. New hooks undocumented in README.

### review-final — ✅ Round 2 code sign-off

C1/C2 verified; C3 deferred as expected; footer outside `<main>` correct. Recommend Escape guard before ship.

---

## Verification run (this review)

| Check | Result |
|-------|--------|
| `powershell -File scripts/static-regression-check.ps1` | **PASS** |
| `git status` (8 modified + untracked landing) | Uncommitted bento rebuild |
| Browser pixel QA @897×867 | **FAIL** — SSIM 0.2042, diff 50.3% (see `landing-pixel-browser-report.md`) |
| Geometry @897 | Header 60px ✅; hero logo 209.9×228 ✅; grid 40/30/30 ✅ |
| Functional smoke (pixel run) | **PASS** — 14 tastes, 2 tiers, CTA links, retry, no 404 |
| Responsive 360/390/430/1440 | **PASS** — no h-scroll, header 60px |

---

## Delta vs Round 1

| Area | Round 1 | Round 2 |
|------|---------|---------|
| C1 science copy | 🔴 | ✅ fixed |
| C2 touch target | 🔴 | ✅ fixed |
| C3 assets git | 🔴 deferred | ⏸ still deferred |
| Main landmark | 🟡 | ✅ fixed |
| Menu a11y | 🟡 | ⚠️ partial + Escape regression |
| Flash accent | 🟡 wrong hue | ⚠️ new invert regression |
| Header height | 61px measured | ✅ 60px |
| Hero logo | 251px | ✅ ~210px |
| Masked SSIM | 0.259 | 0.204 (typography tune shifted layout) |
| hasCriticalIssues (code) | true | **false** |

---

## Suggested fix priority (Round 3)

1. **Exclude flash from `invert(1)`** or use monochrome SVGs consistently (R2-S7).
2. **Guard Escape handler:** `if (menu.classList.contains('is-open')) setMenu(false)` (R2-F3).
3. **Continue pixel tuning** — SSIM still ~0.20; typography/grid drift vs reference.
4. **Demote top bento loading** or `fetchpriority="low"` (R2-P2).
5. **Stage `assets/generated/landing/*`** at final commit (C3).
6. Tab trap / `inert` on `.viwa-page` when menu open (R2-F2).
7. Update README for bento / 24 assets (R2-D1).

---

## JSON summary

```json
{
  "round": 2,
  "scope": "viwa-site-landing",
  "hasCriticalIssues": false,
  "criticalCount": 0,
  "criticalResolvedFromR1": ["C1", "C2"],
  "deployGateAtCommit": ["C3-untracked-landing-assets"],
  "pixelGate": "FAIL",
  "maskedSSIM": 0.2042,
  "noncriticalCount": 18,
  "newRegressions": ["R2-S7-flash-invert-regression", "R2-F3-escape-focus-theft"],
  "requirementCompliance": "pass-with-reservations",
  "staticRegressionCheck": "PASS",
  "functionalSmoke": "PASS"
}
```

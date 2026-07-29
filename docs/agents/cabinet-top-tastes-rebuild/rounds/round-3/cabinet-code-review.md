# Code Review — Cabinet TOP-3 Rebuild (Round 3 of 5)

**Date:** 2026-07-29  
**Repo:** `viwa-client-web-app`  
**Scope:** Independent re-review after Round 3 geometry compression (12px cabinet tokens, short-height tuning)  
**Reference:** Concept bento cabinet mock (399×832)  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-client-report.md`  
**Inputs:** `rounds/round-2/code-review.md`, `rounds/round-3/cabinet-pixel-browser-report.md`  
**Mode:** Code review + narrow safe fixes (R2-A1, R2-P1)

---

## Executive summary

Round 3 geometry compression is **verified in current SCSS**: shared `--viwa-cabinet-*` tokens on `SubscriptionPage.pageShell` (12px gap/radius/padding), card modules inherit consistently, and `@media (max-height: 820px)` tightens gap/padding for **360×800** viewports. No functional regressions found in plan visibility, taste slots, modals, safe-area/nav overlay, or single active nav semantics.

**Round 2 rechecks:**
- **R2-A1** (machine-path `/m/:serial/home` `aria-current` vs active styling): **fixed** — Home link uses `Link` with `isCabinetHomePath()` for both `linkActive` and `aria-current` (NavLink was overriding `aria-current` when inactive).
- **R2-P1** (catalog cache unit tests): **fixed** — `publicTastesCatalogCache.test.ts` covers cache hit, in-flight dedup, error retry.

**hasCriticalIssues:** `false` for Round 3 code sign-off. Pixel gate remains open (masked similarity 0.6423, plan–nav gap ~101px on 399×832).

---

## Geometry compression verification

| Area | Status | Evidence |
|------|--------|----------|
| 12px cabinet tokens | ✅ | `SubscriptionPage.module.scss:14-20` — gap, radius, padding, card bg/border |
| Card module inheritance | ✅ | `MonthlyProgressCard`, `FavoriteTastesRow`, `PlanSummaryCard`, `QrPromoCard` SCSS use `var(--viwa-cabinet-*)` |
| Short-height 360×800 | ✅ | `@media (max-height: 820px)` → gap/padding 10px; 800px height triggers rule |
| Progress density vs R2 | ✅ intentional | R2 `min-height: 150px` removed; progress card ~130px in R3 pixel measure |
| Taste card radius 12px | ✅ intentional | Compression from R1/R2 20px; matches `--viwa-cabinet-card-radius` |
| Side inset 16px | ✅ | `--viwa-cabinet-main-pad-x: 16px`; pixel report sideInsetLeft=16 |

---

## Requirement checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Full plan card visible (scroll) | ✅ | Plan at y≈554, nav at y≈767 on 399×832; 360×800 responsive: 4 cards, no h-scroll; `App.app` scrolls |
| Short-height 360×800 | ✅ | max-height token tweak + scroll; pixel responsive PASS |
| Safe-area / nav overlay | ✅ | Header `env(safe-area-inset-top)`; nav `padding-bottom: max(env(safe-area-inset-bottom), 0.375rem)`; main `scroll-padding-bottom: calc(72px + safe-area)` |
| Exactly 3 taste slots (load/error/success) | ✅ | `buildFavoriteTasteSlots` + tests; error `role="status"` without hiding row |
| QR modal | ✅ | `QrPromoCard` → `BottomSheetModal` scan flow preserved |
| Plan / billing modal | ✅ | `PlanSummaryCard` → description modal + SBP flow preserved |
| Single active nav state | ✅ | Home only; Profile stub; **R2-A1 fixed** for machine path |
| Header controls / touch | ⚠️ | Menu 36×36 disabled decorative; plan/QR/nav meet 44px min-height |
| 12px tokens + contrast | ✅ | Tokens aligned; `#f5f5f5`/`#a3a3a3` on `#0b0b0b`; QR `#333` on `#fff` ≥ AA |
| C1 `.env.production` gitignore | ✅ carry-over | `.gitignore:21` |
| C2 always 3 slots | ✅ carry-over | Unchanged behavior |
| No client PUT favorite tastes | ✅ | `loyaltyModule.favorites.test.ts` |
| Locale RU/EN parity | ✅ | 67 keys |

---

## Round 2 finding recheck

| ID | Round 2 finding | Round 3 status | Action |
|----|-----------------|----------------|--------|
| **R2-A1** | Machine path: `aria-current="page"` without `linkActive` | **✅ FIXED** | `BottomNav.tsx`: `Link` + `homeActive = isCabinetHomePath(pathname)`; test for `/m/VIWA-001/home` |
| **R2-P1** | No unit test for catalog cache | **✅ FIXED** | `publicTastesCatalogCache.test.ts` — 3 cases |

**R2-A1 root cause:** `NavLink` applies `aria-current` only when `isActive`; on `/m/:serial/home`, `to="/home"` is inactive so manual `aria-current` was stripped while pathname-based styling was also inconsistent (`isActive && onCabinetHome`).

---

## Fixes applied this round

| File | Change |
|------|--------|
| `src/components/BottomNav/BottomNav.tsx` | Home item: `NavLink` → `Link`; unified `homeActive` for class + `aria-current` |
| `src/components/BottomNav/BottomNav.test.tsx` | Machine-scoped home active state test |
| `src/utils/publicTastesCatalogCache.test.ts` | Cache hit, dedup, error-retry tests |

---

## Critical findings (🔴)

| ID | Area | Finding |
|----|------|---------|
| — | — | **No Round 3 code blockers** |

---

## Noncritical findings (🟡)

| ID | Area | Finding |
|----|------|---------|
| **R3-P1** | pixel / layout | Plan–nav vertical gap ~101px on 399×832 (>48px target) — `main` pad-bottom 4px leaves dead space; tune in Round 4 pixel pass |
| **R3-S1** | styles | Taste/progress card radius 12px vs reference 20px — intentional compression; document in pixel gate |
| **R3-S2** | styles | Orphan `.tierName` rule in `PlanSummaryCard.module.scss:51-56` (JSX removed R1) |
| **R3-A1** | a11y / touch | Header menu/bell controls 36×36px (disabled/decorative) — below `--viwa-touch-min` 44px |
| **R3-T1** | tests | `QrPromoCard.test.tsx` does not assert two-line subtitle DOM |
| **R3-T2** | tests | No test for unknown taste key → placeholder glyph after catalog ready |
| **R3-T3** | tests | `App.cabinet.test.tsx` covers `/home` only, not `/m/:serial/home` shell |
| **R3-N1** | carry-over | `SubscriptionPage` modal bodies monolithic (~390 lines) |
| **R3-N2** | carry-over | Decorative notification badge `"3"` in header |
| **R3-N3** | carry-over | Hardcoded hex in QR card (`#ffffff`, `#333333`) — reference fidelity |
| **R3-N4** | carry-over | Home link on machine path navigates to `/home` (URL strip) — product choice, not a11y bug post-fix |

---

## Area summaries

### Plan visibility & short viewport

`pageShell` is flex column; `main` holds four cards with compressed 12px rhythm; `BottomNav` is `sticky` + `margin-top: auto`. Plan card remains above nav on 399×832 (pixel geometry). On 360×800, `@media (max-height: 820px)` applies; vertical overflow scrolls via `App.app` (`overflow-y: auto`). No `overflow: hidden` blocks plan access.

### Taste slots

`FavoriteTastesRow` always maps 3 slots from `buildFavoriteTasteSlots`. Loading: keys as provisional labels. Error: `role="status"` + 3 slots. Success: catalog enrichment. Tests cover all three paths.

### Modals & nav

QR and plan modals wired through existing `BottomSheetModal` + billing phase machine. Bottom nav: one `Link` (Home), one disabled FAB, three stubs — single `aria-current="page"` on cabinet home paths.

### Tokens & contrast

Cabinet tokens centralized on `.pageShell`. WCAG notes in `viwa-tokens.css` apply; card bg `#0b0b0b` ≈ `--viwa-bg`. QR promo uses high-contrast dark-on-white subtitle.

---

## Verification (Round 3 re-run)

| Check | Result |
|-------|--------|
| `npm run lint` | PASS — 0 errors, 23 warnings (pre-existing) |
| `npm run locale:verify` | PASS — 67 subscription keys RU/EN |
| Cabinet-targeted `vitest` | PASS — 21 tests (BottomNav, tastes, QR, plan, cache, routes, fixture) |
| Full `vitest run` | PASS — **61 tests** (+4 vs Round 2) |
| `npm run build` | PASS — exit 0 |
| Pixel/browser @399×832 | **open** — R3 report: similarity 0.6423, functional mostly PASS pre R2-A1 code fix |

---

## JSON summary

```json
{
  "round": 3,
  "hasCriticalIssues": false,
  "criticalCount": 0,
  "noncriticalCount": 11,
  "round2FixesApplied": ["R2-A1-machine-path-nav", "R2-P1-catalog-cache-tests"],
  "geometryCompressionVerified": true,
  "requirementCompliance": "pass-code-pending-pixel",
  "blockers": [],
  "openGates": ["pixel-browser-plan-nav-gap", "cabinet-ssim-0.72"]
}
```

---

## Suggested fix priority (Round 4+)

1. Rerun cabinet pixel/browser after R2-A1 fix; tune plan–nav gap (R3-P1).
2. R3-T1–T3: QR subtitle DOM, unknown-key glyph, machine-path App shell test.
3. Remove dead `.tierName` CSS (R3-S2) when touching plan card styles.
4. Carry-over modal extraction / header touch targets as time permits.

# Code Review — Cabinet TOP-3 Rebuild (Round 2 of 5)

**Date:** 2026-07-29  
**Repo:** `viwa-client-web-app`  
**Scope:** Re-review after Round 1 fixes (`rounds/round-1/fix-resolution.md`)  
**Reference:** Concept bento cabinet mock (399×832) — progress, QR, read-only TOP-3 tastes, plan card, cabinet header, 5-slot bottom nav  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-client-report.md`  
**Inputs:** `rounds/round-1/code-review.md`, `rounds/round-1/fix-resolution.md`, `rounds/round-1/pixel-browser-report.md`  
**Reviewers:** review-general, review-renderer-structure, review-styles, review-performance, review-docs, review-final (parallel, `composer-2.5-fast`)  
**Mode:** Read-only — no code edits

---

## Executive summary

Round 1 blockers **C1 (`.env.production` commit risk)** and **C2 (taste row hidden on catalog load/error)** are **verified fixed** in current code. Targeted fixes for card shell, header stack, plan price-only UI, single active nav, progress/QR tuning, canonical pixel fixture (`peach-mango`), and session catalog cache are **present and tested**.

**Verification re-run (Round 2):** `npm run lint` 0 errors · `locale:verify` 67 keys · `vitest` 57 passed · `npm run build` exit 0.

**Pixel/browser gate:** still **deferred** to Round 2 pixel agent (Round 1 masked similarity 0.6517; structural fixes applied, rerun pending).

**New regressions:** machine-scoped `/m/:serial/home` bottom-nav `aria-current` decoupled from `NavLink` active state (R2-A1); no unit test for catalog cache dedup/retry (R2-P1).

**hasCriticalIssues:** `false` for Round 2 **code sign-off** (C1/C2 resolved, no new functional/API blockers). **Pixel gate:** open (Round 2 browser rerun).

---

## Round 1 fix verification

| ID | Round 1 issue | Round 2 status | Evidence |
|----|---------------|----------------|----------|
| **C1** | Untracked `.env.production` commit risk | **✅ RESOLVED** | `.gitignore:21` adds `.env.production`; `git status` shows only `M .gitignore`, not staged env file |
| **C2** | Taste row hidden during catalog load/error | **✅ RESOLVED** | `FavoriteTastesRow.tsx:101-133` always maps 3 slots from `buildFavoriteTasteSlots`; tests: loading + error paths keep 3 slots |
| pixel #2 | Missing taste card shell | **✅ RESOLVED** | `FavoriteTastesRow.module.scss:1-10` — elevated `#141414`, 20px radius, purple border |
| pixel #3 | Invalid `apricot` fixture key | **✅ RESOLVED** | `cabinetPixelFixture.ts` + `cabinetPixelFixture.test.ts` — `peach-mango` only; manifest gate rejects `apricot` |
| pixel #4 | Header menu/bell horizontal | **✅ RESOLVED** | `CabinetHeader.module.scss:14-42` — trailing column, `titleRow` + `bellRow`, 14px gap |
| pixel #5 / N15 | Extra plan tier line visible | **✅ RESOLVED** | `PlanSummaryCard.tsx:46-48` price-only UI; tier in `buildPlanAriaLabel` only |
| pixel #6 / N23 | Dual active bottom nav | **✅ RESOLVED** | `BottomNav.tsx:88-94,130-144` — Profile is `stub`, not `NavLink`; test asserts single active link |
| pixel #7 | Progress card density | **✅ RESOLVED** | `MonthlyProgressCard.module.scss:13-14,34` — `min-height: 150px`, +12px metric margin |
| pixel #8 | QR subtitle line-break | **✅ RESOLVED** | `QrPromoCard.tsx:27-28` + locale `qrCardSubtitleLine1/2`; SCSS two-line uppercase |
| N17 | Catalog fetch waterfall | **✅ RESOLVED** | `publicTastesCatalogCache.ts` session cache + in-flight dedup; slots render before catalog |
| N20–N21 | Missing JSDoc | **⚠️ PARTIAL** | `cabinetRoutes.ts`, `planSummary.ts`, `FavoriteTastesRow`, `CabinetHeader`, `PlanSummaryCard`, `BottomNav`, `QrPromoCard` have brief JSDoc; `MonthlyProgressCard` default export still undocumented (R2-D1) |

---

## Requirement checklist (reference + TOP-3 spec)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Reference layout (progress, QR, tastes, plan, header, bottom nav) | ⚠️ | Code structure aligned; pixel gate FAIL pending rerun |
| No legacy FLOW `AppHeader` on cabinet/auth shell | ✅ | `isViwaCabinetShellRoute` + `App.cabinet.test.tsx` |
| Progress semantics (used/limit, progressbar) | ✅ | `MonthlyProgressCard` `role="progressbar"`, 780/1000 test |
| QR promo card + scan modal | ✅ | `QrPromoCard` → modal flow preserved |
| Read-only TOP-3, API order, placeholders | ✅ | `buildFavoriteTasteSlots`, always 3 slots |
| Always 3 slots on load/error | ✅ | C2 fixed + tests |
| Truthful canonical keys (no fake catalog entries) | ✅ | Unknown keys → placeholder glyph + `favoritesUnknownKey`; fixture manifest test |
| Taste row elevated card shell | ✅ | Dark card shell on `FavoriteTastesRow` |
| Header trailing stack (menu + bell) | ✅ | Column layout with bell below |
| Plan tier in aria only (price visible) | ✅ | `PlanSummaryCard` + aria test via `/тариф/` |
| Bottom nav single active item | ✅ | Home only on `/home`; **machine path caveat** R2-A1 |
| Catalog session cache | ✅ | `loadPublicTastesCatalog` cache + pending dedup |
| `.env.production` gitignored | ✅ | C1 resolved |
| No client PUT favorite tastes | ✅ | `loyaltyModule.favorites.test.ts` |
| Billing / WS preservation | ✅ | `SubscriptionPage` modal flows unchanged |
| Locale RU/EN parity | ✅ | 67 keys verified |
| Tests / a11y baseline | ⚠️ | 57 pass; gaps: cache unit test, machine-path nav, full-page smoke (R2-T1–T3) |

---

## Critical findings (🔴)

| ID | Area | Finding | New? |
|----|------|---------|------|
| — | — | **No new Round 2 code blockers** — C1/C2 resolved | — |

> **Round-2 code verdict:** C1/C2 closed. Pixel SSIM gate remains open for Round 2 browser rerun.

---

## Noncritical findings (🟡)

### New from Round 1 fixes (regressions)

| ID | Area | Finding |
|----|------|---------|
| **R2-A1** | a11y / nav | **Machine-path nav inconsistency:** on `/m/:serial/home`, `BottomNav.tsx:156` sets `aria-current="page"` when `onCabinetHome` (pathname ends with `/home`), but `NavLink` to `/home` is **not** `isActive` — Home lacks `linkActive` styling while SR announces current page. Clicking Home also leaves machine-scoped URL. |
| **R2-P1** | performance / tests | **`publicTastesCatalogCache` has no unit test** for cache hit, in-flight dedup, or error retry (`pendingRequest` reset on catch). Logic looks correct; coverage gap only. |

### Carry-over from Round 1 (unchanged or partial)

| ID | Area | Finding |
|----|------|---------|
| R2-N1 | general | `SubscriptionPage.tsx` still ~390 lines with large inline modal bodies (N1) |
| R2-N2 | general | `FavoriteFlavorsSection` retained unmounted (N2) |
| R2-N3 | general | Untracked landing assets in manifest — unrelated to cabinet MR (N3) |
| R2-N4 | general | Decorative notification badge `"3"` in `CabinetHeader` (N4) |
| R2-N5 | renderer | `SubscriptionPage` modal render helpers monolithic (N6) |
| R2-N6 | renderer | `BottomNav` inline SVG icons (~60 lines) (N7) |
| R2-N7 | renderer | No `types.ts` in new component folders (N8) |
| R2-N8 | styles | Widespread `var(--token, #fallback)` in new SCSS (N10) |
| R2-N9 | styles | Hardcoded hex in QR card (`#ffffff`, `#333333`) — reference fidelity (N11) |
| R2-N10 | styles | Inline `style={{ width: progress.percent }}` on progress fill (N12) |
| R2-N11 | styles | Locale `planPerMonth` lowercase «мес» vs reference «МЕС» (N14) |
| R2-N12 | styles | Dead `.tierName` rule in `PlanSummaryCard.module.scss:51-56` (JSX removed, CSS orphaned) |
| R2-N13 | performance | `LoyaltyQrCode` vs `LoyaltyQrPreview` QR duplication (N18) |
| R2-D1 | docs | `MonthlyProgressCard` default export lacks JSDoc (N21 partial) |
| R2-D2 | docs | Orphan locale key `subscription.qrCardSubtitle` (single-line) alongside split lines — harmless but stale |
| R2-T1 | tests | No `SubscriptionPage` integration smoke with full cabinet stack (N24) |
| R2-T2 | tests | `App.cabinet.test.tsx` covers `/home` only, not `/m/:serial/home` (N25) |
| R2-T3 | tests | `QrPromoCard.test.tsx` does not assert two-line subtitle DOM (pixel #8 fix untested) |
| R2-T4 | tests | No test for unknown taste key → placeholder glyph after catalog ready |

---

## Reviewer section summaries

### review-general — ✅ C2 closed; ⚠️ R2-A1 machine nav

Read-only TOP-3 flow sound. Catalog error shows `role="status"` without hiding slots. Billing/WS unchanged.

### review-renderer-structure — ⚠️ carry-over N6–N8

New cabinet cards follow folder-per-component pattern. `SubscriptionPage` modals and `BottomNav` icons remain monolithic.

### review-styles — ✅ pixel fixes present; ⚠️ token fallbacks + dead `.tierName` CSS

Card shell, header stack, progress min-height, QR two-line subtitle implemented. Token convention debt unchanged.

### review-performance — ✅ cache added; ⚠️ R2-P1 no cache test

Session cache + dedup correct on read. No leak regressions.

### review-docs — ⚠️ partial JSDoc (R2-D1, R2-D2)

Most new exports documented; `MonthlyProgressCard` and stale QR locale key remain.

### review-final — ✅ Round 1 criticals closed; pixel gate open

Coherent changeset. C1/C2 verified. No contradictions between slot builder, cache, and row render. Machine-path nav a11y gap is only new functional-adjacent finding.

---

## Verification (Round 2 re-run)

| Check | Result |
|-------|--------|
| `npm run lint` | PASS — 0 errors, 23 warnings (pre-existing, unrelated) |
| `npm run locale:verify` | PASS — 67 subscription keys RU/EN |
| `npx vitest run` | PASS — 57 tests |
| `npm run build` | PASS — exit 0 |
| Pixel/browser @399×832 | **pending** — Round 2 browser agent |

---

## Suggested fix priority (Round 3+)

1. **Rerun pixel/browser** with updated fixture/masks (`TEMP_cabinet_pixel_browser.mjs`).
2. **R2-A1:** Tie `aria-current` / active styling to `NavLink` `isActive` (or machine-aware `to` path).
3. **R2-P1:** Add `publicTastesCatalogCache.test.ts` (cache hit, dedup, error retry).
4. **R2-T1–T4:** Integration smoke + machine-path nav test + QR subtitle + unknown-key glyph tests.
5. Carry-over style/docs debt (N10, dead `.tierName` CSS, modal extraction) as time permits.

---

## JSON summary

```json
{
  "round": 2,
  "hasCriticalIssues": false,
  "criticalCount": 0,
  "noncriticalCount": 18,
  "round1CriticalsResolved": ["C1-env-gitignore", "C2-always-three-slots"],
  "newRegressions": ["R2-A1-machine-path-nav-aria", "R2-P1-cache-no-unit-test"],
  "requirementCompliance": "pass-code-pending-pixel",
  "blockers": [],
  "openGates": ["pixel-browser-rerun-399x832"]
}
```

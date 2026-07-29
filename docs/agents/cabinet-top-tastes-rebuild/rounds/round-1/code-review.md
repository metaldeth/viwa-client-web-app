# Code Review — Cabinet TOP-3 Rebuild (Round 1 of 5)

**Date:** 2026-07-29  
**Repo:** `viwa-client-web-app`  
**Scope:** Uncommitted changes (cabinet redesign on `/home`, machine-scoped `/m/:serial/home`)  
**Reference:** Concept bento cabinet mock (399×832) — progress, QR, read-only TOP-3 tastes, plan card, cabinet header, 5-slot bottom nav  
**Reviewers simulated:** review-general, review-renderer-structure, review-styles, review-performance, review-docs, review-final  
**Mode:** Read-only — no code edits

---

## Executive summary

The redesign aligns well with the reference layout and meets core product requirements: legacy FLOW header hidden on cabinet shell routes, read-only exactly-3 taste slots with placeholders, no client `PUT /favorite-tastes`, subscription levels API + billing/WS flows preserved, QR scan modal intact, locale parity (64 keys), and targeted tests added.

**Blocking before commit:** untracked `.env.production` must not be included in the changeset.

**hasCriticalIssues:** `true` (commit-hygiene blocker only; no functional regressions found in cabinet requirements)

---

## Requirement checklist (reference + TOP-3 spec)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Reference layout (progress, QR, tastes, plan, header, bottom nav) | ✅ | Section order and visual language match mock |
| No legacy FLOW `AppHeader` on cabinet/auth shell | ✅ | `isViwaCabinetShellRoute` + `App.cabinet.test.tsx` |
| Progress semantics (used/limit, progressbar) | ✅ | `MonthlyProgressCard` `role="progressbar"`, 780/1000 test |
| QR promo card + scan modal | ✅ | `QrPromoCard` → `BottomSheetModal` + `LoyaltyQrCode` |
| Read-only TOP-3, API order, placeholders | ✅ | `buildFavoriteTasteSlots`, `MAX_FAVORITE_TASTES = 3`, no save UI |
| No client PUT favorite tastes | ✅ | `updateFavoriteTastes` removed; `loyaltyModule.favorites.test.ts` |
| Plan prices from API | ✅ | `fetchSubscriptionLevels` + `resolvePlanSummaryDisplay` |
| Billing / WS preservation | ✅ | `useClientSubscriptionWs`, billing modal + SBP flow unchanged |
| Bottom nav 5 slots + safe-area | ✅ | Sticky nav, `env(safe-area-inset-*)` on header/footer |
| Locale RU/EN parity | ✅ | New keys in both locales; verify script updated |
| Tests | ✅ | Unit/component tests for slots, progress, plan, QR, nav, routes |

---

## Critical findings (🔴)

| ID | Area | Finding |
|----|------|---------|
| C1 | Commit hygiene | **Untracked `.env.production`** in repo root contains production URLs (`VITE_VIWA_TELEMETRY_API_URL`, etc.). Must **not** be committed with this changeset. Add/confirm `.gitignore` coverage or delete local copy before commit. |
| C2 | Resilience (borderline) | **`FavoriteTastesRow` hides all 3 slots** while catalog is loading or on catalog error (`loadState !== 'ready'`). Requirement implies always-visible 3-slot row; slots could render immediately from `favoriteKeys` (catalog only enriches names/images). Not a runtime crash, but fails the “always 3 slots” UX under slow/failed catalog fetch. *Treat as critical only if offline catalog is in acceptance; otherwise downgrade to noncritical.* |

> **Round-1 verdict:** C1 is definitively critical for commit. C2 flagged for product confirmation — counted in `hasCriticalIssues` as conservative UX gap.

---

## Noncritical findings (🟡)

### Architecture / general (review-general)

| ID | Finding |
|----|---------|
| N1 | `SubscriptionPage.tsx` remains a ~390-line page component with large inline modal render bodies; billing logic correctly preserved but page violates single-responsibility — extract modals to subcomponents/hooks in a later pass. |
| N2 | `FavoriteFlavorsSection` (editable legacy) retained in repo but unmounted — acceptable; consider deprecation note in a follow-up. |
| N3 | Untracked **landing asset manifest entries** (`landing-*` in `manifest.json` / `viwaAssetManifest.json` + `public/assets/viwa/landing/`) appear unrelated to cabinet scope — avoid bundling into cabinet MR unless landing work is intentional. |
| N4 | Decorative notification badge hardcoded `"3"` in `CabinetHeader` — matches reference; document as non-functional placeholder until notifications ship. |

### Component structure (review-renderer-structure)

| ID | Finding |
|----|---------|
| N5 | New cabinet cards follow folder-per-component pattern (`*.module.scss`, `index.ts`) — good. |
| N6 | `SubscriptionPage` return is lean (~35 lines) but modal `render*Body` helpers (~100 lines each) should move to `SubscriptionPage/modals/` or dedicated components. |
| N7 | `BottomNav` inline SVG icon components (~60 lines) could live in `BottomNav/icons/` for readability. |
| N8 | No `types.ts` in new component folders — props defined inline in `.tsx` (acceptable for small props, inconsistent with stricter rule). |
| N9 | `registryPath` not configured in `AGENTS.md` — registry check N/A. |

### Styles (review-styles)

| ID | Finding |
|----|---------|
| N10 | Widespread `var(--token, #fallback)` in new SCSS violates project rule “no fallback in var()”. Examples: `SubscriptionPage.module.scss`, `MonthlyProgressCard.module.scss`, `FavoriteTastesRow.module.scss`. |
| N11 | Hardcoded hex colors (`#000`, `#fff`, `#2a2a2a`, `#333`) instead of exclusively theme tokens — partially intentional for reference fidelity; consider mapping to `--viwa-*` tokens for consistency. |
| N12 | Inline `style={{ width: \`${progress.percent}%\` }}` in `MonthlyProgressCard` — acceptable for dynamic width; could use CSS custom property set on parent. |
| N13 | Inline `style={{ paddingBottom: 'max(env(safe-area-inset-bottom)...' }}` on `BottomNav` — prefer SCSS `padding-bottom: max(env(safe-area-inset-bottom, 0px), 0.5rem)`. |
| N14 | Reference uses uppercase **«МЕС»**; locale `planPerMonth` renders lowercase **«мес»** — minor visual delta. |
| N15 | `PlanSummaryCard` shows extra `tierName` line under price; reference mock shows price only — minor layout delta. |

### Performance (review-performance)

| ID | Finding |
|----|---------|
| N16 | `FavoriteTastesRow` fetches public tastes catalog on every mount — no cache/dedup; acceptable for single page, consider shared cache if reused. |
| N17 | `FavoriteTastesRow` defers slot render until catalog resolves — unnecessary waterfall; slots from `favoriteKeys` could render synchronously. |
| N18 | `LoyaltyQrCode` (page) and `LoyaltyQrPreview` (card) duplicate QR+logo logic — minor DRY opportunity; both memoized appropriately. |
| N19 | No new subscription leaks; `useEffect` cleanups present in levels fetch and catalog fetch. |

### Documentation (review-docs)

| ID | Finding |
|----|---------|
| N20 | Exported utils lack JSDoc: `isViwaCabinetShellRoute`, `buildFavoriteTasteSlots`, `resolvePlanSummaryDisplay`, `resolveRecommendedLevel`. |
| N21 | New UI components lack JSDoc on default exports (`CabinetHeader`, `MonthlyProgressCard`, etc.) per `jsdoc-exports` rule. |
| N22 | `cabinetRoutes.ts` has one-line JSDoc on function — adequate; expand with route examples. |

### Final / cross-cutting (review-final)

| ID | Finding |
|----|---------|
| N23 | **Home + Profile nav both link to `/home`** — `Profile` gets `aria-current="page"` on cabinet; two distinct links, same target — acceptable stub but may confuse screen-reader users until profile route exists. |
| N24 | **No SubscriptionPage integration test** rendering full cabinet stack — coverage is per-component; consider one smoke test with mocked profile. |
| N25 | `App.cabinet.test.tsx` covers `/home` only — machine path `/m/VIWA-xxx/home` not asserted (regex covered in `cabinetRoutes.test.ts`). |
| N26 | Verification claimed in task report (lint/locale/test/build) not re-run in this review round — trust prior report; re-run before commit. |

---

## Reviewer section summaries

### review-general — ⚠️ 2 issues (C2, N1)

Read-only TOP-3 and billing/WS flows are sound. Main gap: taste row visibility during catalog load/error. Page still carries full billing modal complexity.

### review-renderer-structure — ⚠️ 3 suggestions (N6–N8)

New components well-factored; `SubscriptionPage` modals and `BottomNav` icons remain monolithic.

### review-styles — ⚠️ 6 suggestions (N10–N15)

Visual alignment strong; token/fallback conventions and minor ref typography deltas.

### review-performance — ✅ minimal risk

No leak regressions; optional catalog/slot render optimization.

### review-docs — ⚠️ 3 suggestions (N20–N22)

Missing JSDoc on new exports.

### review-final — ⚠️ 4 suggestions (N23–N26)

Coherent changeset; commit hygiene and integration-test gaps remain.

---

## Suggested fix priority (Round 2+)

1. **Exclude `.env.production`** from commit (C1).
2. Render 3 taste slots immediately from `favoriteKeys`; enrich async from catalog (C2/N17).
3. Move safe-area padding to SCSS (N13).
4. Add JSDoc on exported utils/components (N20–N21).
5. Extract subscription modals from `SubscriptionPage` (N6).

---

## JSON summary

```json
{
  "round": 1,
  "hasCriticalIssues": true,
  "criticalCount": 2,
  "noncriticalCount": 26,
  "requirementCompliance": "pass-with-reservations",
  "blockers": ["C1-untracked-env-production", "C2-taste-slots-hidden-on-catalog-failure"]
}
```

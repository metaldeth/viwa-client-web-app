# Cabinet TOP-3 — Client Rebuild Report

**Date:** 2026-07-29  
**Repo:** `viwa-client-web-app`  
**Scope:** Concept-16 cabinet redesign on `/home` and machine-scoped `/m/:serial/home`

## Summary

Rebuilt the subscription cabinet page to match the 399×832 reference: separate progress, QR, read-only favorite tastes row, plan summary card, new cabinet header, and 5-slot bottom navigation. Legacy FLOW `AppHeader` is hidden on cabinet/auth shell routes. Client no longer calls `PUT /client/me/favorite-tastes`.

**Round 1 fixes (2026-07-29):** taste row always shows 3 slots (load/error safe) in elevated card shell; header trailing stack; plan card price-only UI; single active bottom-nav item; progress/QR pixel tuning; canonical pixel fixture (`peach-mango`); `.env.production` gitignored.

## Changed areas

| Area | Change |
|------|--------|
| `App.tsx` | Conditional hide of legacy FLOW `AppHeader` via `isViwaCabinetShellRoute` |
| `SubscriptionPage` | New layout: `CabinetHeader`, `MonthlyProgressCard`, `QrPromoCard`, `FavoriteTastesRow`, `PlanSummaryCard` |
| `FavoriteTastesRow` | Always 3 slots from API keys; catalog cache enriches labels/images; dark card shell |
| `BottomNav` | Only **Главная** active on `/home`; Profile is stub (no duplicate NavLink) |
| `PlanSummaryCard` | Price + benefits only; tier in `aria-label` |
| `CabinetHeader` | КАБИНЕТ + hamburger row, bell below/right |
| `loyaltyModule` | Removed `updateFavoriteTastes` client endpoint |
| Locales | 67 subscription keys RU/EN verified |
| `.gitignore` | Added `.env.production` (local deployment secrets excluded) |

## Preserved

- Routing/auth/URL strip, WS profile merge, QR modal, billing/subscription modal flow
- `VolumeCircle` component retained (unused on home)
- `FavoriteFlavorsSection` retained in repo but unmounted on cabinet page

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | PASS (0 errors) |
| `npm run locale:verify` | PASS — 67 subscription keys RU/EN parity |
| `npm test` | PASS — 57 tests |
| `npm run build` | PASS |
| Pixel/browser | Deferred Round 2 (fixture/mask updated in `TEMP_cabinet_pixel_browser.mjs`) |

## Round 1 docs

- `rounds/round-1/fix-resolution.md`
- `rounds/round-1/code-review.md` (input)
- `rounds/round-1/pixel-browser-report.md` (input)

## Strict JSON

```json
{
  "files": [
    "src/components/FavoriteTastesRow/",
    "src/components/CabinetHeader/",
    "src/components/PlanSummaryCard/",
    "src/components/BottomNav/",
    "src/components/QrPromoCard/",
    "src/components/MonthlyProgressCard/MonthlyProgressCard.module.scss",
    "src/utils/favoriteTastesSlots.ts",
    "src/utils/publicTastesCatalogCache.ts",
    "src/utils/cabinetRoutes.ts",
    "src/utils/planSummary.ts",
    "src/constants/cabinetPixelFixture.ts",
    "src/assets/locales/ru.json",
    "src/assets/locales/en.json",
    "src/locale/subscriptionLocale.ts",
    "scripts/locale-verify-subscription.mjs",
    ".gitignore",
    "src/test/browserMocks.ts",
    "docs/agents/cabinet-top-tastes-rebuild/rounds/round-1/TEMP_cabinet_pixel_browser.mjs",
    "docs/agents/cabinet-top-tastes-rebuild/rounds/round-1/fix-resolution.md"
  ],
  "checks": {
    "lint": "pass",
    "localeVerify": "pass",
    "tests": "pass",
    "build": "pass"
  },
  "openQuestions": []
}
```

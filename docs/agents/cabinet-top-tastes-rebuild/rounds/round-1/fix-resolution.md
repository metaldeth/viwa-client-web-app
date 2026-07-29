# Round 1 fix resolution — cabinet client

**Date:** 2026-07-29  
**Sources:** `code-review.md`, `pixel-browser-report.md`

## Fixes applied

| ID | Issue | Resolution |
|----|-------|------------|
| C1 | Untracked `.env.production` commit risk | Added `.env.production` to `.gitignore` (local deployment file not committed) |
| C2 / pixel #2 | Taste row hidden during catalog load/error; missing card shell | `FavoriteTastesRow` always renders 3 slots from `favoriteKeys`; catalog enriches async; elevated dark card shell added |
| pixel #3 | Invalid `apricot` fixture key | Pixel runner + tests use canonical `peach-mango` (3rd slot); no fake catalog entry |
| pixel #4 | Header menu/bell horizontal | `CabinetHeader` trailing column: `КАБИНЕТ` + hamburger row, bell below with ~14px offset |
| pixel #5 / N15 | Extra plan tier line | Removed visible `.tierName`; tier retained in `aria-label` |
| pixel #6 / N23 | Dual active bottom nav links | Only **Главная** is `NavLink` active on `/home`; **Профиль** is non-navigating stub |
| pixel #7 | Progress card density | Added ~12px metric air + `min-height: 150px` on content row |
| pixel #8 | QR subtitle line-break | Split locale into `qrCardSubtitleLine1/2`; two-line uppercase styling |
| N17 | Catalog fetch waterfall | Added `loadPublicTastesCatalog` session cache |
| N20–N21 | Missing JSDoc | Added on `cabinetRoutes`, `planSummary`, key cabinet components |

## Pixel metric masking (Round 2 input)

Dynamic regions excluded from masked SSIM/diff in `TEMP_cabinet_pixel_browser.mjs`:

1. **QR promo bitmap** — client-specific `qrPayload` (upper-right QR card)
2. **Taste row photo circles** — catalog-driven images or honest placeholders

Structural gates (insets, card radii, slot count, nav) remain compared.

## Canonical pixel fixture

```text
favoriteTasteKeys: ['raspberry', 'lime', 'peach-mango']
```

Shared constant: `src/constants/cabinetPixelFixture.ts` (`CABINET_PIXEL_FAVORITE_KEYS`).

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | PASS (0 errors) |
| `npm run locale:verify` | PASS — 67 keys |
| `npm test` | PASS — 57 tests |
| `npm run build` | PASS |
| Pixel/browser rerun | deferred to Round 2 |

## Open questions

None.

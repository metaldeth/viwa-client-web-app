# Cabinet pixel+browser report — Round 2

**Date:** 2026-07-29T17:57:18.282Z
**Base URL:** http://127.0.0.1:5173
**Result:** **FAIL**

## Metrics (399×832, fair mask: bezel + QR + fruit photos)

| Metric | Round 2 | Round 1 | Δ |
|--------|---------|---------|---|
| Masked similarity | 0.6423 | 0.6517 | -0.0094 |
| SSIM | 0.451 | — | — |
| Masked diff ratio | 31.82% | 35.31% | -3.49pp |
| RMSE | 85.28 | 86.57 | -1.29 |
| Reference content crop top | 12px | — | — |

> Mask excludes: phone bezel/home-indicator strips, QR promo bitmap, taste photo circles. Reference auto-cropped to app content top before compare.

## Geometry delta vs Round 1

| Metric | R1 | R2 | Δ |
|--------|----|----|---|
| sideInsetLeft | 16 | 16 | 0 |
| header.h | 68 | 90 | +22 |
| progressCard.h | 138 | 129.9 | -8.1 |
| planCard.h | 170.9 | 112 | -58.9 |
| bottomNav.y | 759 | 767 | +8 |
| cardGap[0] | 16 | 12 | -4 |

## Top deviations vs reference

### 1. header stack height (~60px)
- **Expected:** ~150px stacked title+bell
- **Actual:** 90px
- **Fix:** CabinetHeader.module.scss trailing column gap/padding vs reference

### 2. global layout (fair mask) (~32px)
- **Expected:** ≤8% masked diff
- **Actual:** 31.8%
- **Fix:** Typography/QR copy line-breaks, header title placement, progress min-height vs reference

### 3. taste card shell radius (~8px)
- **Expected:** 20px
- **Actual:** 12px
- **Fix:** FavoriteTastesRow.module.scss — already has card shell; verify radius token

## Functional smoke

- ✅ Catalog loading: 3 slots visible before catalog resolves
- ✅ Catalog success: exactly 3 taste slots
- ✅ Catalog success: canonical taste labels present
- ✅ Catalog error: 3 slots still visible
- ✅ Catalog error: status message shown
- ✅ Placeholder case (1 favorite → 2 placeholders)
- ✅ No favorite PUT
- ✅ No FLOW header
- ✅ No horizontal scroll
- ✅ Single active bottom-nav item (aria-current=page)
- ✅ QR modal opens
- ✅ Plan opens billing modal
- ✅ Bottom nav SPA (no reload)
- ✅ Keyboard focus: BUTTON
- ✅ Safe-area CSS on header/nav

## Artifacts

- `pixel-reference.png`
- `pixel-reference-aligned-399x832.png`
- `actual-399x832.png`
- `diff-399x832-masked.png`
- `responsive-360x800.png`
- `responsive-390x844.png`
- `responsive-430x932.png`
- `desktop-1440-centered-phone.png`
- `pixel-browser-results.json`
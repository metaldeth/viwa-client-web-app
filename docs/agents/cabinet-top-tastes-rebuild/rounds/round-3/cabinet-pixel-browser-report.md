# Cabinet pixel+browser report — Round 3

> **⚠️ INVALID METHODOLOGY — SUPERSEDED.** This report compared browser viewport 399×832 directly to the outer 390×832 mockup (including phone bezel). False findings: header ~150px, plan–nav gap 101px. **Use `cabinet-pixel-browser-report-corrected.md` instead.**

**Date:** 2026-07-29T18:01:24.683Z
**Base URL:** http://127.0.0.1:5173
**Reference:** `round-2 pixel-reference.png` → `cabinet-pixel-reference.png`
**Pixel:** **FAIL** | **Functional:** **FAIL** | **Overall:** **FAIL**

## Metrics (399×832, fair mask: bezel + QR + fruit photos)

| Metric | Round 3 | Round 2 | Δ |
|--------|---------|---------|---|
| Masked similarity | 0.6423 | 0.6423 | 0 |
| SSIM | 0.451 | 0.451 | 0 |
| Masked diff ratio | 31.82% | 31.82% | 0pp |
| RMSE | 85.28 | 85.28 | 0 |
| Reference content crop top | 12px | 12 | — |

> Mask excludes: phone bezel/home-indicator strips, QR promo bitmap, taste photo circles. Reference auto-cropped to app content top before compare.

## Geometry delta vs Round 2

| Metric | R2 | R3 | Δ |
|--------|----|----|---|
| sideInsetLeft | 16 | 16 | 0 |
| header.h | 90 | 90 | 0 |
| header.y | 0 | 0 | 0 |
| progressCard.h | 129.9 | 129.9 | 0 |
| qrCard.h | 140 | 140 | 0 |
| tasteSection.h | 157.8 | 157.8 | 0 |
| tasteSection.r | 12 | 12 | 0 |
| planCard.h | 112 | 112 | 0 |
| planCard.y | 553.7 | 553.7 | 0 |
| bottomNav.y | 767 | 767 | 0 |
| cardGap[0] | 12 | 12 | 0 |

## Geometry validation (399×832)

- ✅ Side inset L: 16px
- ✅ Progress bar 780/1000
- ✅ 3 taste circle slots measured
- ✅ Plan card bottom (665.7px) above nav top (767px)
- ✅ No horizontal overflow
- ❌ Excessive blank gap plan–nav: 101.3px (>48px)

## Top deviations vs reference

### 1. plan–nav vertical gap (~77px)
- **Expected:** 8–48px content fill above nav
- **Actual:** 101.3px
- **Fix:** CabinetHome layout — reduce main padding-bottom or plan card margin after geometry compression

### 2. header stack height (~60px)
- **Expected:** ~150px stacked title+bell (reference artboard)
- **Actual:** 90px
- **Fix:** CabinetHeader.module.scss — trailing column gap/padding vs reference

### 3. global layout (fair mask) (~32px)
- **Expected:** ≤8% masked diff
- **Actual:** 31.8%
- **Fix:** Typography/QR copy line-breaks, header title placement, progress min-height vs reference

### 4. taste card shell radius (~8px)
- **Expected:** 20px
- **Actual:** 12px
- **Fix:** FavoriteTastesRow.module.scss — verify --viwa-radius-lg token on card shell

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
- ✅ Single active bottom-nav item on /home (aria-current=page)
- ✅ QR modal opens
- ✅ Plan opens billing modal
- ✅ Bottom nav SPA (no reload)
- ✅ Keyboard focus: BUTTON
- ✅ Safe-area CSS on header/nav
- ✅ Machine path /m/VIWA-TEST-001/home: single aria-current=page
- ✅ Machine path: single active nav link styling
- ✅ Machine path: 3 taste slots

## Responsive checks

- `cabinet-responsive-360x800.png`: overflow=no, inset=16px, cards=4
- `cabinet-responsive-390x844.png`: overflow=no, inset=16px, cards=4
- `cabinet-responsive-430x932.png`: overflow=no, inset=16px, cards=4

## Artifacts

- `cabinet-pixel-reference.png`
- `cabinet-pixel-reference-aligned-399x832.png`
- `cabinet-actual-399x832.png`
- `cabinet-diff-399x832-masked.png`
- `cabinet-overlay-399x832.png`
- `cabinet-responsive-360x800.png`
- `cabinet-responsive-390x844.png`
- `cabinet-responsive-430x932.png`
- `cabinet-pixel-browser-report.md`
- `cabinet-pixel-browser-results.json`
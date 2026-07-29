# Landing pixel+browser report — Round 3

**Date:** 2026-07-29T17:57:28.201Z
**Repo:** `C:\wiva\viwa-site` (read-only verification)
**Base URL:** http://127.0.0.1:8765
**Reference:** 897×867 canonical PNG (user design image via round-1 canonical path)
**Reference source:** `C:\Users\metal\.cursor\projects\c-wiva\assets\C__Users_metal_.cursor_projects_c-wiva_assets_c__Users_metal_AppData_Roaming_Cursor_User_workspaceStorage_3db40d35d3f4047b9fe7c179a72f5a37_images_image-6858bf64-d4a3-4c50-9f98-d15528af69cd.png`
**Pixel result:** **FAIL** | **Functional result:** **FAIL** | **Overall:** **FAIL**

## Metrics (897×867, bento photo regions masked)

| Metric | Value |
|--------|-------|
| Composite similarity | 0.449 |
| SSIM (masked structural) | 0.5342 |
| Masked diff ratio | 37.90% |
| RMSE (masked) | 76.48 |
| Diff pixels | 147678 / 389670 |

## Delta vs Round 1

| Metric | Round 1 | Round 3 | Δ |
|--------|---------|---------|---|
| SSIM | 0.259 | 0.5342 | +0.2752 |
| Composite similarity | 0.2668 | 0.449 | +0.1822 |
| Masked diff % | 50.25% | 37.90% | -12.35pp |
| RMSE | 99.56 | 76.48 | -23.08 |

## Delta vs Round 2

| Metric | Round 2 | Round 3 | Δ |
|--------|---------|---------|---|
| SSIM | 0.2042 | 0.5342 | +0.3300 |
| Composite similarity | 0.2365 | 0.449 | +0.2125 |
| Masked diff % | 50.32% | 37.90% | -12.42pp |
| RMSE | 100.24 | 76.48 | -23.76 |

> Bento/bottom photo crops masked (dynamic assets). Layout geometry + functional gates are primary.

## Geometry vs dynamic separation

- **Geometry/typography hotspots:** 2 ranked regions (masked compare)
- **Dynamic/photo hotspots:** 0 regions (excluded from geometry gate)

## Remaining pixel deltas (exact coordinates)

| # | Kind | Zone | BBox (x,y,w×h) | Diff px | Ref→Act color | Font sample |
|---|------|------|----------------|---------|---------------|-------------|
| 1 | geometry-typography | hero-bento-grid | (0,0) 897×867 | 143120 | #7d7b80→#6b696f | 700 34px "Arial Narrow" |
| 2 | geometry-typography | header | (745,3) 146×58 | 4536 | #3f2971→#593591 | — |

## Top deviations (ranked)

### 1. pixel hotspot: hero-bento-grid (~143120px)
- **Expected:** ref #7d7b80
- **Actual:** act #6b696f @ (0,0) 897×867px
- **Fix:** Tune hero-bento-grid CSS to match reference colors/typography

### 2. pixel hotspot: header (~4536px)
- **Expected:** ref #3f2971
- **Actual:** act #593591 @ (745,3) 146×58px
- **Fix:** Tune header CSS to match reference colors/typography

### 3. global pixel layout (masked photos) (~38px)
- **Expected:** ≤12% masked structural diff
- **Actual:** 37.9% (147678/389670px), SSIM=0.5342
- **Fix:** Review typography scale, hero logo clamp, header nav spacing, feature strip icons vs reference

### 4. hero column width (40%) (~31px)
- **Expected:** 359px (40% of 897)
- **Actual:** 328px
- **Fix:** viwa-landing.css `.viwa-board { grid-template-columns: 40fr 30fr 30fr }` at ≥768px

### 5. SSIM structural similarity (~22px)
- **Expected:** ≥0.75 masked SSIM
- **Actual:** 0.5342
- **Fix:** Align grid proportions, border #333, title/subtitle sizes to 897×867 reference

### 6. hero logo height vs R2 (~13px)
- **Expected:** 209.9px (R2)
- **Actual:** 222.8px
- **Fix:** Tune hero logo clamp after geometry row/column fix

### 7. header height (~8px)
- **Expected:** 60px (--viwa-header-height)
- **Actual:** 68px
- **Fix:** viwa-tokens.css --viwa-header-height; viwa-landing.css .viwa-header min-height

### 8. board grid columns vs R2
- **Expected:** 358.797px 269.094px 269.109px
- **Actual:** 328.031px 255.016px 313.953px
- **Fix:** Verify canonical 36.57/28.43/35 column ratios from direct measurement

## Geometry snapshot (897×867)

```json
{
  "viewport": {
    "w": 897,
    "h": 867
  },
  "doc": {
    "scrollW": 897,
    "clientW": 897
  },
  "header": {
    "x": 0,
    "y": 0,
    "w": 897,
    "h": 68,
    "borderColor": "rgb(255, 255, 255) rgb(255, 255, 255) rgb(51, 51, 51)",
    "bg": "rgb(0, 0, 0)"
  },
  "board": {
    "x": 0,
    "y": 68,
    "w": 897,
    "h": 800,
    "borderColor": "rgb(51, 51, 51) rgb(255, 255, 255) rgb(255, 255, 255)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "boardGridCols": "328.031px 255.016px 313.953px",
  "heroBrand": {
    "x": 0,
    "y": 69,
    "w": 328,
    "h": 531,
    "borderColor": "rgb(255, 255, 255) rgb(51, 51, 51) rgb(51, 51, 51) rgb(255, 255, 255)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "bento": {
    "x": 328,
    "y": 69,
    "w": 569,
    "h": 531,
    "borderColor": "rgb(255, 255, 255)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "col40Expected": 358.8,
  "col30Expected": 269.1,
  "heroColRatio": null,
  "bentoCells": [
    {
      "index": 1,
      "x": 328,
      "y": 69,
      "w": 284.5,
      "h": 228
    },
    {
      "index": 2,
      "x": 612.5,
      "y": 69,
      "w": 284.5,
      "h": 228
    },
    {
      "index": 3,
      "x": 328,
      "y": 297,
      "w": 284.5,
      "h": 303
    },
    {
      "index": 4,
      "x": 612.5,
      "y": 297,
      "w": 284.5,
      "h": 303
    }
  ],
  "featureBar": {
    "x": 0,
    "y": 600,
    "w": 897,
    "h": 66,
    "borderColor": "rgb(255, 255, 255) rgb(255, 255, 255) rgb(51, 51, 51)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "featureItems": [
    {
      "index": 1,
      "x": 0,
      "w": 299,
      "h": 66
    },
    {
      "index": 2,
      "x": 299,
      "w": 299,
      "h": 66
    },
    {
      "index": 3,
      "x": 598,
      "w": 299,
      "h": 66
    }
  ],
  "bottomBlocks": [],
  "heroLogo": {
    "x": 27,
    "y": 135.1,
    "w": 253.9,
    "h": 222.8,
    "objectFit": "fill",
    "aspect": 1.1
  },
  "accentColor": "rgb(92, 45, 168)",
  "titleFont": {
    "size": "32.292px",
    "weight": "700",
    "family": "\"Arial Narrow\", \"Helvetica Neue Condensed\", \"Franklin Gothic Medium\", Arial, sans-serif",
    "color": "rgb(255, 255, 255)"
  },
  "subtitleFont": null,
  "navFont": null,
  "borderSample": {
    "x": 328,
    "y": 69,
    "w": 284.5,
    "h": 228,
    "borderColor": "rgb(255, 255, 255) rgb(51, 51, 51) rgb(51, 51, 51) rgb(255, 255, 255)",
    "bg": "rgb(0, 0, 0)"
  }
}
```

## Responsive checks

| Viewport | H-scroll | Header h | Notes |
|----------|----------|----------|-------|
| 360x800 | OK | 68px | stacked board expected |
| 390x844 | OK | 68px | stacked board expected |
| 430x932 | OK | 68px | stacked board expected |
| 1440x900 | OK | 68px | desktop grid |

## Functional verification

- ✅ No hardcoded prices in HTML
- ✅ 14 tastes rendered from API
- ✅ 2 API tiers rendered
- ✅ Tier price from API (499)
- ✅ Tier price from API (699)
- ✅ Register CTA without serial (entry=website)
- ✅ Register CTA with serial + entry=website
- ✅ Register CTA preserves serial from URL query
- ✅ Cabinet auth link → /auth
- ✅ All 29 images loaded
- ✅ 22 anchor links present
- ✅ No horizontal overflow (897)
- ✅ Reduced motion CSS present
- ✅ No horizontal overflow (360)
- ✅ Mobile menu opens
- ✅ Menu touch targets ≥44px
- ✅ Escape closes mobile menu
- ✅ Keyboard Enter opens menu
- ✅ Menu link receives keyboard focus
- ✅ Safe-area rule present (0px in headless)

**Failures:**
- ❌ Escape refocuses hamburger when menu already closed (R2-F3 regression)
- ✅ API error/retry flow passed
- ✅ No image 404s

## Next fixes (Round 4)

1. Raise masked SSIM ≥0.75: align board row heights (68/531/66/202) and column ratios (36.57/28.43/35) to canonical 897×867 measurement
1. Cut masked structural diff to ≤12%: typography (hero title/subtitle), nav spacing, feature icon stroke weights
1. hero-bento-grid hotspot (0,0) 897×867: ref #7d7b80 vs act #6b696f
1. header hotspot (745,3) 146×58: ref #3f2971 vs act #593591
1. Hero title font size: expected ~44px, actual 32.292px
1. Board grid columns changed vs R2 (358.797px 269.094px 269.109px → 328.031px 255.016px 313.953px) — verify intentional geometry fix

## Artifacts

- `landing-reference-897x867.png`
- `landing-actual-897x867.png`
- `landing-diff-897x867-masked.png`
- `landing-overlay-897x867.png`
- `landing-responsive-360x800.png`
- `landing-responsive-390x844.png`
- `landing-responsive-430x932.png`
- `landing-desktop-1440x900.png`
- `landing-pixel-browser-report.md`
- `landing-pixel-browser-results.json`

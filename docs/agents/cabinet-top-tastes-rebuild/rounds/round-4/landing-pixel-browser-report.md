# Landing pixel+browser report — Round 4

**Date:** 2026-07-29T18:05:43.783Z
**Repo:** `C:\wiva\viwa-site` (read-only verification)
**Base URL:** http://127.0.0.1:8765
**Reference:** 897×867 canonical PNG (user design image via round-1 canonical path)
**Reference source:** `C:\Users\metal\.cursor\projects\c-wiva\assets\C__Users_metal_.cursor_projects_c-wiva_assets_c__Users_metal_AppData_Roaming_Cursor_User_workspaceStorage_3db40d35d3f4047b9fe7c179a72f5a37_images_image-6858bf64-d4a3-4c50-9f98-d15528af69cd.png`
**Pixel result:** **FAIL** | **Functional result:** **PASS** | **Overall:** **FAIL**

## Metrics (897×867, bento photo regions masked)

| Metric | Value |
|--------|-------|
| Composite similarity | 0.4667 |
| SSIM (masked structural) | 0.5615 |
| Masked diff ratio | 36.85% |
| RMSE (masked) | 77.44 |
| Diff pixels | 143582 / 389670 |

## Delta vs Round 3 (corrected baseline)

| Metric | Round 3 | Round 4 | Δ |
|--------|---------|---------|---|
| SSIM | 0.5342 | 0.5615 | +0.0273 |
| Composite similarity | 0.449 | 0.4667 | +0.0177 |
| Masked diff % | 37.90% | 36.85% | -1.05pp |
| RMSE | 76.48 | 77.44 | +0.96 |

> Bento/bottom photo crops masked (dynamic assets). Layout geometry + functional gates are primary.

## Geometry vs dynamic separation

- **Geometry/typography hotspots:** 2 ranked regions (masked compare)
- **Dynamic/photo hotspots:** 0 regions (excluded from geometry gate)

## Remaining pixel deltas (exact coordinates)

| # | Kind | Zone | BBox (x,y,w×h) | Diff px | Ref→Act color | Font sample |
|---|------|------|----------------|---------|---------------|-------------|
| 1 | geometry-typography | hero-bento-grid | (0,0) 897×867 | 141402 | #7c7b7c→#7a7a7b | 400 44px "Arial Narrow" |
| 2 | geometry-typography | header | (745,3) 146×58 | 2149 | #412f6b→#533e6f | — |

## Top deviations (ranked)

### 1. pixel hotspot: hero-bento-grid (~141402px)
- **Expected:** ref #7c7b7c
- **Actual:** act #7a7a7b @ (0,0) 897×867px
- **Fix:** Tune hero-bento-grid CSS to match reference colors/typography

### 2. pixel hotspot: header (~2149px)
- **Expected:** ref #412f6b
- **Actual:** act #533e6f @ (745,3) 146×58px
- **Fix:** Tune header CSS to match reference colors/typography

### 3. hero logo height vs R2 (~43px)
- **Expected:** 222.8px (R2)
- **Actual:** 265.8px
- **Fix:** Tune hero logo clamp after geometry row/column fix

### 4. global pixel layout (masked photos) (~37px)
- **Expected:** ≤12% masked structural diff
- **Actual:** 36.8% (143582/389670px), SSIM=0.5615
- **Fix:** Review typography scale, hero logo clamp, header nav spacing, feature strip icons vs reference

### 5. hero column width (40%) (~31px)
- **Expected:** 359px (40% of 897)
- **Actual:** 328px
- **Fix:** viwa-landing.css `.viwa-board { grid-template-columns: 40fr 30fr 30fr }` at ≥768px

### 6. SSIM structural similarity (~19px)
- **Expected:** ≥0.75 masked SSIM
- **Actual:** 0.5615
- **Fix:** Align grid proportions, border #333, title/subtitle sizes to 897×867 reference

### 7. header height (~8px)
- **Expected:** 60px (--viwa-header-height)
- **Actual:** 68px
- **Fix:** viwa-tokens.css --viwa-header-height; viwa-landing.css .viwa-header min-height

### 8. board grid columns vs R2
- **Expected:** 328.031px 255.016px 313.953px
- **Actual:** 328.031px 255.016px 313.938px
- **Fix:** Verify canonical 36.57/28.43/35 column ratios from direct measurement

## Canonical boundary verification (897×867)

| Check | Expected | Actual | Pass |
|-------|----------|--------|------|
| bento left boundary | 328 | 328 | ✅ |
| bento col2 left (583) | 583 | 583 | ✅ |
| hero logo size | 277×243 | 307×266 | ❌ |
| hero logo y (~119) | 119 | 118 | ✅ |
| header CTA x (~747) | 747 | 747 | ✅ |
| feature strip y (~599) | 599 | 600 | ✅ |
| bottom section y (~665) | 665 | 666 | ✅ |

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
  "boardGridCols": "328.031px 255.016px 313.938px",
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
      "w": 255,
      "h": 228
    },
    {
      "index": 2,
      "x": 583,
      "y": 69,
      "w": 314,
      "h": 228
    },
    {
      "index": 3,
      "x": 328,
      "y": 297,
      "w": 255,
      "h": 303
    },
    {
      "index": 4,
      "x": 583,
      "y": 297,
      "w": 314,
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
    "y": 117.5,
    "w": 306.9,
    "h": 265.8,
    "objectFit": "fill",
    "aspect": 1.2
  },
  "accentColor": "rgb(74, 36, 125)",
  "titleFont": {
    "size": "44px",
    "weight": "400",
    "family": "\"Arial Narrow\", \"Helvetica Neue Condensed\", \"Franklin Gothic Medium\", Arial, sans-serif",
    "color": "rgb(255, 255, 255)"
  },
  "subtitleFont": null,
  "navFont": null,
  "borderSample": {
    "x": 328,
    "y": 69,
    "w": 255,
    "h": 228,
    "borderColor": "rgb(255, 255, 255) rgb(51, 51, 51) rgb(51, 51, 51) rgb(255, 255, 255)",
    "bg": "rgb(0, 0, 0)"
  },
  "headerCta": {
    "x": 747,
    "y": 18.5,
    "w": 125,
    "h": 30
  },
  "bottomSection": {
    "x": 0,
    "y": 666,
    "w": 897,
    "h": 202
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
- ✅ Escape idle is no-op (focus unchanged; trigger focus retained after close)
- ✅ Keyboard Enter opens menu
- ✅ Menu link receives keyboard focus
- ✅ Safe-area rule present (0px in headless)
- ✅ API error/retry flow passed
- ✅ No image 404s

## Next fixes (Round 5)

1. Raise masked SSIM ≥0.75: align board row heights (68/531/66/202) and column ratios (36.57/28.43/35) to canonical 897×867 measurement
1. Cut masked structural diff to ≤12%: typography (hero title/subtitle), nav spacing, feature icon stroke weights
1. hero-bento-grid hotspot (0,0) 897×867: ref #7c7b7c vs act #7a7a7b
1. header hotspot (745,3) 146×58: ref #412f6b vs act #533e6f
1. Board grid columns changed vs R2 (358.797px 269.094px 269.109px → 328.031px 255.016px 313.938px) — verify intentional geometry fix

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

# Landing pixel+browser report — Round 2

**Date:** 2026-07-29T17:49:37.097Z
**Repo:** `C:\wiva\viwa-site` (read-only verification)
**Base URL:** http://127.0.0.1:8765
**Reference:** 897×867 canonical PNG
**Result:** **FAIL**

## Metrics (897×867, bento photo regions masked)

| Metric | Value |
|--------|-------|
| Composite similarity | 0.2365 |
| SSIM (masked structural) | 0.2042 |
| Masked diff ratio | 50.32% |
| RMSE (masked) | 100.24 |
| Diff pixels | 196080 / 389670 |

## Delta vs Round 1

| Metric | Round 1 | Round 2 | Δ |
|--------|---------|---------|---|
| SSIM | 0.259 | 0.2042 | -0.0548 |
| Composite similarity | 0.2668 | 0.2365 | -0.0303 |
| Masked diff % | 50.25% | 50.32% | +0.0724pp |
| RMSE | 99.56 | 100.24 | +0.6800 |

> Bento/bottom photo crops masked (dynamic assets). Layout geometry + functional gates are primary.

## Top deviations (ranked)

### 1. SSIM structural similarity (~55px)
- **Expected:** ≥0.75 masked SSIM
- **Actual:** 0.2042
- **Fix:** Align grid proportions, border #333, title/subtitle sizes to 897×867 reference

### 2. global pixel layout (masked photos) (~50px)
- **Expected:** ≤12% masked structural diff
- **Actual:** 50.3% (196080/389670px), SSIM=0.2042
- **Fix:** Review typography scale, hero logo clamp, header nav spacing, feature strip icons vs reference

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
    "h": 60,
    "borderColor": "rgb(255, 255, 255) rgb(255, 255, 255) rgb(51, 51, 51)",
    "bg": "rgb(0, 0, 0)"
  },
  "board": {
    "x": 0,
    "y": 60,
    "w": 897,
    "h": 755.4,
    "borderColor": "rgb(51, 51, 51) rgb(255, 255, 255) rgb(255, 255, 255)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "boardGridCols": "358.797px 269.094px 269.109px",
  "heroBrand": {
    "x": 0,
    "y": 61,
    "w": 358.8,
    "h": 466.4,
    "borderColor": "rgb(255, 255, 255) rgb(51, 51, 51) rgb(51, 51, 51) rgb(255, 255, 255)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "bento": {
    "x": 358.8,
    "y": 61,
    "w": 538.2,
    "h": 466.4,
    "borderColor": "rgb(255, 255, 255)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "col40Expected": 358.8,
  "col30Expected": 269.1,
  "heroColRatio": null,
  "bentoCells": [
    {
      "index": 1,
      "x": 358.8,
      "y": 61,
      "w": 269.1,
      "h": 233.2
    },
    {
      "index": 2,
      "x": 627.9,
      "y": 61,
      "w": 269.1,
      "h": 233.2
    },
    {
      "index": 3,
      "x": 358.8,
      "y": 294.2,
      "w": 269.1,
      "h": 233.2
    },
    {
      "index": 4,
      "x": 627.9,
      "y": 294.2,
      "w": 269.1,
      "h": 233.2
    }
  ],
  "featureBar": {
    "x": 0,
    "y": 527.4,
    "w": 897,
    "h": 53,
    "borderColor": "rgb(255, 255, 255) rgb(255, 255, 255) rgb(51, 51, 51)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "featureItems": [
    {
      "index": 1,
      "x": 0,
      "w": 299,
      "h": 52
    },
    {
      "index": 2,
      "x": 299,
      "w": 299,
      "h": 52
    },
    {
      "index": 3,
      "x": 598,
      "w": 299,
      "h": 52
    }
  ],
  "bottomBlocks": [
    {
      "index": 1,
      "x": 0,
      "y": 580.4,
      "w": 448.5,
      "h": 235
    },
    {
      "index": 2,
      "x": 448.5,
      "y": 580.4,
      "w": 448.5,
      "h": 235
    }
  ],
  "heroLogo": {
    "x": 24,
    "y": 97.3,
    "w": 228,
    "h": 209.9,
    "objectFit": "fill",
    "aspect": 1.1
  },
  "accentColor": "rgb(92, 45, 168)",
  "titleFont": {
    "size": "43.953px",
    "weight": "700",
    "family": "Montserrat, Inter, system-ui, -apple-system, \"Segoe UI\", sans-serif"
  },
  "borderSample": {
    "x": 358.8,
    "y": 61,
    "w": 269.1,
    "h": 233.2,
    "borderColor": "rgb(255, 255, 255) rgb(51, 51, 51) rgb(51, 51, 51) rgb(255, 255, 255)",
    "bg": "rgb(0, 0, 0)"
  }
}
```

## Responsive checks

| Viewport | H-scroll | Header h | Notes |
|----------|----------|----------|-------|
| 360x800 | OK | 60px | stacked board expected |
| 390x844 | OK | 60px | stacked board expected |
| 430x932 | OK | 60px | stacked board expected |
| 1440x900 | OK | 60px | desktop grid |

## Functional verification

- ✅ No hardcoded prices in HTML
- ✅ 14 tastes rendered from API
- ✅ 2 API tiers rendered
- ✅ Tier price from API (499)
- ✅ Tier price from API (699)
- ✅ Register CTA without serial
- ✅ Register CTA with serial
- ✅ Cabinet auth link → /auth
- ✅ No horizontal overflow (897)
- ✅ Reduced motion CSS present
- ✅ No horizontal overflow (360)
- ✅ Mobile menu opens
- ✅ Menu touch targets ≥44px
- ✅ Safe-area rule present (0px in headless)
- ✅ API error/retry flow passed
- ✅ No image 404s

## Artifacts

- `landing-reference-897x867.png`
- `landing-actual-897x867.png`
- `landing-diff-897x867-masked.png`
- `landing-responsive-360x800.png`
- `landing-responsive-390x844.png`
- `landing-responsive-430x932.png`
- `landing-desktop-1440x900.png`
- `landing-pixel-browser-report.md`
- `landing-pixel-browser-results.json`

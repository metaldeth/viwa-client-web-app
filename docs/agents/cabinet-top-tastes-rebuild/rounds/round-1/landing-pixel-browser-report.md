# Landing pixel+browser report — Round 1

**Date:** 2026-07-29T17:43:58.656Z
**Repo:** `C:\wiva\viwa-site` (read-only verification)
**Base URL:** http://127.0.0.1:8765
**Reference:** 897×867 canonical PNG
**Result:** **FAIL**

## Metrics (897×867, bento photo regions masked)

| Metric | Value |
|--------|-------|
| Composite similarity | 0.2668 |
| SSIM (masked structural) | 0.259 |
| Masked diff ratio | 50.25% |
| RMSE (masked) | 99.56 |
| Diff pixels | 195798 / 389670 |

> Bento/bottom photo crops masked (dynamic assets). Layout geometry + functional gates are primary.

## Top deviations (ranked)

### 1. global pixel layout (masked photos) (~50px)
- **Expected:** ≤12% masked structural diff
- **Actual:** 50.2% (195798/389670px), SSIM=0.259
- **Fix:** Review typography scale, hero logo clamp, header nav spacing, feature strip icons vs reference

### 2. SSIM structural similarity (~49px)
- **Expected:** ≥0.75 masked SSIM
- **Actual:** 0.259
- **Fix:** Align grid proportions, border #333, title/subtitle sizes to 897×867 reference

### 3. hero logo bbox height (~41px)
- **Expected:** ~210px tall in hero cell
- **Actual:** 251.2px (aspect 1.1)
- **Fix:** Tune `.viwa-logo__picture--hero` height clamp / flex growth in viwa-landing.css

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
    "h": 61,
    "borderColor": "rgb(255, 255, 255) rgb(255, 255, 255) rgb(51, 51, 51)",
    "bg": "rgb(0, 0, 0)"
  },
  "board": {
    "x": 0,
    "y": 61,
    "w": 897,
    "h": 760.9,
    "borderColor": "rgb(51, 51, 51) rgb(255, 255, 255) rgb(255, 255, 255)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "boardGridCols": "358.797px 269.094px 269.109px",
  "heroBrand": {
    "x": 0,
    "y": 62,
    "w": 358.8,
    "h": 466.4,
    "borderColor": "rgb(255, 255, 255) rgb(51, 51, 51) rgb(51, 51, 51) rgb(255, 255, 255)",
    "bg": "rgba(0, 0, 0, 0)"
  },
  "bento": {
    "x": 358.8,
    "y": 62,
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
      "y": 62,
      "w": 269.1,
      "h": 233.2
    },
    {
      "index": 2,
      "x": 627.9,
      "y": 62,
      "w": 269.1,
      "h": 233.2
    },
    {
      "index": 3,
      "x": 358.8,
      "y": 295.2,
      "w": 269.1,
      "h": 233.2
    },
    {
      "index": 4,
      "x": 627.9,
      "y": 295.2,
      "w": 269.1,
      "h": 233.2
    }
  ],
  "featureBar": {
    "x": 0,
    "y": 528.4,
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
      "y": 581.4,
      "w": 448.5,
      "h": 240.5
    },
    {
      "index": 2,
      "x": 448.5,
      "y": 581.4,
      "w": 448.5,
      "h": 240.5
    }
  ],
  "heroLogo": {
    "x": 24,
    "y": 21.9,
    "w": 272.6,
    "h": 251.2,
    "objectFit": "fill",
    "aspect": 1.1
  },
  "accentColor": "rgb(92, 45, 168)",
  "titleFont": {
    "size": "44px",
    "weight": "700",
    "family": "Montserrat, Inter, system-ui, -apple-system, \"Segoe UI\", sans-serif"
  },
  "borderSample": {
    "x": 358.8,
    "y": 62,
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
| 360x800 | OK | 61px | stacked board expected |
| 390x844 | OK | 61px | stacked board expected |
| 430x932 | OK | 61px | stacked board expected |
| 1440x900 | OK | 61px | desktop grid |

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

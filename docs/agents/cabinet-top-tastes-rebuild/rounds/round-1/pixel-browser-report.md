# Cabinet pixel+browser report — Round 1

**Date:** 2026-07-29T17:43:03.729Z  
**Base URL:** http://127.0.0.1:5173 (Vite dev, mocked telemetry API)  
**Reference:** `pixel-reference.png` (399×832; includes device chrome — content-only comparison)  
**Result:** **FAIL**

## Metrics (399×832, QR bitmap region masked)

| Metric | Value |
|--------|-------|
| Masked similarity score | **0.6517** |
| Masked diff ratio | 35.31% |
| RMSE (masked) | 86.57 |
| Diff pixels | 106648 / 302075 |

> QR promo bitmap and reference device bezel excluded/masked where noted. Similarity is advisory — dynamic QR, missing taste asset, and reference phone frame inflate diff.

## Top deviations (ranked)

### 1. Global layout vs reference frame (~35% masked diff)
- **Expected:** ≤8% masked diff on content regions
- **Actual:** 35.3% (106648/302075 px)
- **Fix:** Composite factors — see items 2–7; re-export reference as raw 399×832 viewport (no iPhone bezel) for fair pixel gate

### 2. Taste row missing elevated card shell (~20px radius, full width)
- **Expected:** Dark card `#141414`, 20px radius, 1px purple border (like progress/plan)
- **Actual:** Section on bare `#000` background; geometry `cards[2].r = 0`, no padded panel
- **Fix:** Wrap `FavoriteTastesRow` in card shell matching `MonthlyProgressCard.module.scss` (padding, `--viwa-bg-elevated`, `--viwa-radius-lg`, border)

### 3. Apricot taste image missing (~90px circle)
- **Expected:** Photo tile for `apricot` (reference slot 3)
- **Actual:** Placeholder glyph **«АБ»** — `apricot` absent from `viwaAssetManifest.json` / `/assets/viwa/tastes/`
- **Fix:** Add apricot to asset manifest + generated WebP/PNG; or map `mediaKey` to existing catalog asset

### 4. Header trailing layout (~12–16px vertical offset vs reference)
- **Expected:** Menu + bell stacked vertically (bell under hamburger)
- **Actual:** Menu and bell **horizontal** in `CabinetHeader.trailing` flex row
- **Fix:** `CabinetHeader.module.scss` — `flex-direction: column` on `.trailing`, align bell under menu; tune badge position

### 5. Plan card extra tier line (~14px text block)
- **Expected:** Reference shows price + benefits only (`499 ₽ / мес`)
- **Actual:** Extra **«Старт»** tier name row under price (`PlanSummaryCard.tierName`)
- **Fix:** Hide `.tierName` when active subscription matches recommended tier, or match reference copy hierarchy

### 6. Bottom nav active-state mismatch (~4px color delta)
- **Expected:** Reference: inactive grey tabs; FAB purple center
- **Actual:** **Главная** and **Профиль** both show active purple (both link to `/home`)
- **Fix:** `BottomNav.tsx` — only highlight home on cabinet; profile tab should be stub or distinct route before active styling

### 7. Progress card vertical density (~12px shorter)
- **Expected:** Reference progress block slightly taller (more air above bar)
- **Actual:** Card height **138px**; metric/bar cluster compact vs reference bottle alignment
- **Fix:** `MonthlyProgressCard.module.scss` — increase `.metric` bottom margin or `.content` min-height; verify bottle SVG scale vs 44×88 spec

### 8. QR card copy line-break / tracking (~6px)
- **Expected:** Two-line subtitle with tighter uppercase tracking
- **Actual:** Single-flow subtitle; font 0.625rem vs reference ~0.6875rem feel
- **Fix:** `QrPromoCard.module.scss` — allow `max-width` on `.copy`, adjust `letter-spacing` / optional `<br>` in locale

**Geometry OK (399×832):** side insets **16px** L/R; card gaps **16px**; dark card radii **20px**; progress **780/1000**; taste circles **~90px** ⌀; no horizontal overflow; safe-area CSS present (`env(safe-area-inset-*)` on header/nav).

## Geometry snapshot (399×832)

```json
{
  "sideInsetLeft": 16,
  "sideInsetRight": 16,
  "cardGaps": [16, 16, 16],
  "headerH": 68,
  "progressCard": { "x": 16, "y": 68, "w": 367, "h": 138, "r": 20 },
  "qrCard": { "x": 16, "y": 222, "w": 367, "h": 160, "r": 20 },
  "tastesSection": { "x": 16, "y": 398, "w": 367, "h": 158.8, "r": 0 },
  "planCard": { "x": 16, "y": 572.8, "w": 367, "h": 170.9, "r": 20 },
  "tasteCircles": [{ "d": 89.8 }, { "d": 89.8 }, { "d": 89.8 }],
  "bottomNav": { "y": 759, "h": 73 },
  "progressBar": { "valueNow": "780", "valueMax": "1000" }
}
```

## Responsive checks

| Viewport | H-scroll | Left inset | Right inset | Cards |
|----------|----------|------------|-------------|-------|
| responsive-360x800.png | OK | 16px | 16px | 4 |
| responsive-390x844.png | OK | 16px | 16px | 4 |
| responsive-430x932.png | OK | 16px | 16px | 4 |
| desktop-1440-centered-phone.png | OK | 521px | 521px | 4 |

All responsive widths: **no horizontal scroll**; phone column centered at 430px max (`--viwa-cabinet-max`).

## Functional smoke

| Check | Result |
|-------|--------|
| No FLOW / legacy AppHeader | ✅ PASS |
| No horizontal scroll (399 + 360/390/430) | ✅ PASS |
| Exactly 3 taste slots (visual; circles in DOM) | ✅ PASS (runner selector `main ul li` false-positive — also counts plan `ul.benefits`; **3 taste circles confirmed in geometry**) |
| Placeholder case (1 favorite → 2 placeholders) | ✅ PASS |
| No `PUT /client/me/favorite-tastes` | ✅ PASS |
| QR card → scan modal | ✅ PASS |
| Plan card → billing modal | ✅ PASS |
| Bottom nav SPA (no full reload) | ✅ PASS |
| Keyboard focus reachable | ✅ PASS (focus landed on `<a>`) |
| Safe-area CSS on header/nav | ✅ PASS (`env(safe-area-inset-top/bottom)` applied) |

**Functional failures:** none (after selector correction).

## Artifacts

- `pixel-reference.png` — canonical mockup copy
- `actual-399x832.png` — captured client
- `responsive-360x800.png`, `responsive-390x844.png`, `responsive-430x932.png`
- `desktop-1440-centered-phone.png`
- `diff-399x832-masked.png` — masked pixel diff heatmap
- `pixel-browser-results.json` — machine-readable metrics
- `TEMP_cabinet_pixel_browser.mjs` — temp runner (no product package changes)

## Gate summary

| Gate | Status |
|------|--------|
| Pixel similarity ≥ 0.72 (masked) | ❌ 0.6517 |
| Geometry insets/gaps/radii | ⚠️ tastes card shell missing |
| Functional smoke | ✅ |
| Responsive 360/390/430 | ✅ |

**Round 1 verdict: FAIL** — functional/regression OK; pixel parity and taste-row card shell / assets / header layout need fixes before PASS.

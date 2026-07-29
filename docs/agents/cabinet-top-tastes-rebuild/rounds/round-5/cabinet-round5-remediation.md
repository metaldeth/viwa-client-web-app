# Cabinet Round 5 remediation — viwa-client-web-app

**Date:** 2026-07-29  
**Sources:** `cabinet-pixel-reference-inner-crop.png`, fair-masked diff/overlay, `cabinet-round5-remediation-probe-results.json`, typography probe @342×780

## Fixes applied

### Geometry / scrollbar (prior pass)

| ID | Issue (pre-remediation) | Resolution |
|----|-------------------------|------------|
| R5-R1 | 15px gray system scrollbar gutter @ x327–341 | Hidden scrollbar on `.appCabinetShell`; scroll preserved |
| R5-R2 | Cards right 333 vs ref 325 | Compact `main` pad **left 9 / right 17** |
| R5-R3 | Cards ~2px above ref | Compact `max-height:820px` main top pad **10px** |
| R5-R4 | QR copy ~7px low | `.copy { transform: translateY(-6px) }` |
| R5-R5 | Progress bar y~202 vs ref ~210 | `.progressTrack` + `.limits` `top:6px` |
| R5-R6 | Bottle visible ~76×43 vs ref ~83 | `.bottleWrap translateY(5px)`; bottle **42×83px** |
| R5-R7 | Plan price ~5px high | `.priceLine { top:3px }` |
| R5-R8 | Logo visible x~9 w~48 vs ref x18 w67 | Header `.leading translate(9px,21px)` @≤360 |

### Typography / logo (final pass)

| ID | Issue | Resolution |
|----|-------|------------|
| R5-T1 | No web fonts in client `index.html`; Playwright fell back to system sans | Non-blocking **Inter 400/500/600/700** + **Oswald 400/500/600** via preconnect/preload/`media=print`/`noscript` (landing pattern) |
| R5-T2 | `--viwa-font-condensed` missing; metric `780` wide/thin; unit ~x140 vs ref ~x112 | Token `--viwa-font-condensed: 'Oswald', …`; metric value/unit **Oswald 500**, tighter flex gap; unit **x≈115** (ref ~112) |
| R5-T3 | Plan price thin vs ref | **Inter 500** on `.priceAmount`; `.benefits { top:2px }` |
| R5-T4 | Card title baselines high; taste labels high / dose gap tight | Title `top`: progress **+3px**, taste **+3px**, plan **+2px**; taste row **+6px** margin; slot gap **1→4px** |
| R5-T5 | QR subtitle ~4–6px high vs ref; title/sub gap | Subtitle **10px** explicit; title `margin-bottom` **4→8px**; subtitle gap **7→9px** |
| R5-T6 | Logo 86% fair-region diff; fragile header scale/clip | New asset **`logo-viwa-mark-cabinet-header`** (67×38 RGBA from ref crop x18,y30); pipeline **40 assets / 81 files**; `ViwaBrandLogo` header size only; SVG fallback unchanged |
| R5-T7 | Scrollbar/gutter + card geometry | Preserved — cards **x9..325**, gaps **10**, nav **y715** |

## Font / logo region before → after (probe @342×780)

| Signal | Before (post QR-bg gate ~12.90%) | After (typography pass) |
|--------|----------------------------------|-------------------------|
| `document.fonts` Inter | not loaded (no link) | **loaded** |
| `document.fonts` Oswald 500 | not loaded | **loaded** |
| Metric font-family | Montserrat/system sans | **Oswald 500** |
| Metric unit x | ~140 (wide Inter glyph run) | **115.2** (ref ~112) |
| Metric value right x | ~134+ (wide) | **113.2** |
| Header logo src | scaled canonical PNG/SVG clip | **`logo-viwa-mark-cabinet-header.webp`** 67×38, no transform |
| Logo bbox diff vs ref (18,30,67×38) | n/a (prior capture same session) | **425 / 2546 = 16.7%** |
| Progress metric bbox diff (25,134,109×62) | n/a | **3759 / 6758 = 55.6%** |
| Fair-masked diff (quick gate math) | **12.90%** (30213 / 234131) | **13.49%** (31757 / 235415) — spacing tradeoffs; **full gate not rerun** |

## Measured geometry (typography probe)

| Element | Value |
|---------|-------|
| logo | x18 y29 **67×38** |
| metricValue | x26 y129 **87×60** |
| metricUnit | x**115.2** y173 w19.4 (ref unit block ~x112) |
| priceAmount | Inter **500**, y601.5 |
| qr title | 15px/500, margin-bottom **8px** |
| qr subtitle | **10px**/400, gap **9px** |
| progressCard / qr / taste / plan right | **325** |
| card left | **9** |

## Verification

| Check | Result |
|-------|--------|
| `verify-assets-idempotent.ps1` | **PASS** — 40 assets, ≥81 files, 2× processor + static |
| `npm run lint` | **PASS** — 0 errors |
| `npm run locale:verify` | **PASS** — 67 keys ru/en |
| `npm test` | **68 PASS** (+ cabinet header manifest test) |
| `npm run build` | **PASS** |
| Typography probe + screenshot | **PASS** — `cabinet-round5-remediation-probe-results.json`, fresh `cabinet-actual-inner-342x780.png`, overlay |
| Full fair-masked pixel gate | **Not run** — independent rerun follows |
| Commit / push / deploy / Docker / telemetry | **Not performed** |

## Changed files

**Client**

- `index.html` — Google Fonts Inter + Oswald (non-blocking)
- `src/styles/viwa-tokens.css` — `--viwa-font-condensed`
- `src/index.css` — body uses `--viwa-font-ui`
- `src/components/MonthlyProgressCard/MonthlyProgressCard.module.scss`
- `src/components/PlanSummaryCard/PlanSummaryCard.module.scss`
- `src/components/FavoriteTastesRow/FavoriteTastesRow.module.scss`
- `src/components/QrPromoCard/QrPromoCard.module.scss`
- `src/components/ViwaBrandLogo/ViwaBrandLogo.tsx`
- `src/components/ViwaBrandLogo/ViwaBrandLogo.module.scss`
- `src/utils/viwaAssets.ts`
- `src/utils/viwaAssets.test.ts`
- `src/data/viwaAssetManifest.json` (+ public mirrors via pipeline)
- `public/assets/viwa/logo/logo-viwa-mark-cabinet-header.{png,webp}`

**Asset pipeline (viwa-site)**

- `scripts/extract_cabinet_header_logo_from_reference.py` (new)
- `scripts/process-viwa-assets.py` — cabinet header asset, **40/81** gate
- `scripts/static-regression-check.ps1`, `scripts/verify-assets-idempotent.ps1` — counts **40/81**

## Remaining risks

- Fair-masked diff **13.49%** still above ≤8% gate; QR copy / plan benefits neutral colors and bottom nav remain high-share regions.
- Progress metric bbox still ~56% local diff — weight/glyph tuning may need another pass after full gate overlay.
- `document.fonts.check('16px Oswald')` false until explicit `load()` — probe uses load + check on **500 60px Oswald**.

# Round 4 → Round 5 fix resolution — viwa-site landing

**Date:** 2026-07-29  
**Sources:** `landing-pixel-browser-report.md`, `landing-pixel-browser-results.json`, geometry/font probe @897

## Fixes applied

| ID | Issue (Round 4) | Resolution |
|----|-----------------|------------|
| R4-L1 | Hero logo 307×266 (scale 1.108×1.094) clipped @328 | Removed hero scale; visible/layout box **277×243** @ x27 y117.5; `transform: none` |
| R4-T1 | Condensed token fell back to wide Arial | **Oswald 400/500** added to non-blocking Google Fonts; first in `--viwa-font-condensed`; Inter preserved |
| R4-T2 | Hero typography hotspot (#7c7b7c vs #7a7a7b) | Oswald + hero rhythm tune: title **44px/0.95/400**, 2 lines; desktop margins for ref stack |
| R4-H1 | Header CTA rest #533e6f vs ref #412f6b | Scoped `--viwa-accent-header-cta: #412f6b` on `.viwa-header__cta`; global accent #4A247D unchanged |
| R4-G1 | Incorrect 60px header suggestion in report | **Kept 68px** `--viwa-header-height`; visual boundary y68 preserved |
| — | Grid/bottom geometry | **Untouched** — cols 328/583, feature y600, bottom y666, CTA x747 |

## Verification (@897, fonts ready)

| Check | Expected | Actual | Pass |
|-------|----------|--------|------|
| Hero logo size | 277×243 | 277×243 | ✅ |
| Hero logo x / right | 27 / ≤328 | 27 / 304 | ✅ |
| Hero logo transform | none | none | ✅ |
| Header height | 68 | 68 | ✅ |
| Bento left | 328 | 328 | ✅ |
| Feature strip y | ~600 | 600 | ✅ |
| Bottom strip y | ~666 | 666 | ✅ |
| Header CTA x / bg | 747 / #412f6b | 747 / #412f6b | ✅ |
| Hero CTA bg (global accent) | #4a247d | #4a247d | ✅ |
| Hero title top | ~386 | 386.6 | ✅ |
| Hero subtitle top | ~487 | 487.2 | ✅ |
| Hero CTA top | ~539 | 539 | ✅ |
| Hero title font | 44px Oswald 400 | 44px Oswald 400 | ✅ |
| `document.fonts` Oswald | loaded | loaded | ✅ |
| Bottom science/rhythm font | Oswald condensed | Oswald | ✅ |
| Feature label weight | 400 | 400 | ✅ |
| `static-regression-check.ps1` | PASS | PASS | ✅ |
| Full Round 5 pixel compare | — | **Not run** (independent gate) | — |
| Commit / deploy / Docker | — | **Not performed** | — |

---

# Round 4 → Round 5 fix resolution — viwa-client-web-app cabinet

**Date:** 2026-07-29  
**Sources:** `cabinet-pixel-browser-report.md`, `cabinet-pixel-reference-inner-crop.png`, `cabinet-actual-inner-342x780.png`, `cabinet-diff-inner-342x780-fair-masked.png`, geometry probe @342×780 after fonts

## Fixes applied

| ID | Issue (Round 4 actual) | Resolution |
|----|--------------------------|------------|
| R5-C1 | Header logo/title/bell ~21px too high; progress y already matched | `translateY(21px)` on `.leading`/`.trailing` inside fixed 90px header — **no layout growth** |
| R5-C2 | Logo visible x32 w48 vs ref x18 w67 | Header logo clip **67×38** + `translate(-9px) scale(1.18)` on canonical asset |
| R5-C3 | Cards x16..326 vs ref x9..325 @342 | `@media (max-width:360px)` `--viwa-cabinet-main-pad-x:9px`; card pad **16px horizontal / 12px vertical** |
| R5-C4 | Purple card borders | `--viwa-cabinet-card-border: rgba(255,255,255,0.1)`; focus rings unchanged |
| R5-C5 | Metric 800/heavy; unit high; bar/limits low; bottle ~68px | Metric **400** + letter-spacing; unit `top:5px`; bar `margin-top:6px`; limits y≈231; bottle **43×86** |
| R5-C6 | QR 90px / pad 10; copy low; title 13/800 | QR **93px**; pad **7/19/7/16**; title **16px/600**; subtitle **11px/400** gray |
| R5-C7 | Taste circles x35/135/235; labels bold tiny | Flex row gaps **24/25px**; circles **76px**; name **9px/400**; dose **8px/400** |
| R5-C8 | Price line single 36/800 span | Split `priceAmount` + `planPeriodSuffix` (`/ мес` 12px/400); aria keeps `planPerMonth` |
| R5-C9 | Home active icon purple | `.linkActive .iconWrap` → white; FAB stays purple; labels **400** |
| — | Vertical geometry y98/262/400/558/nav715, gaps 10, h154/128/148/143 | **Preserved** — probe 22/22 PASS |

## Measured before → after @342×780

| Element | R4 before | R5 after | Reference target |
|---------|-----------|----------|------------------|
| header.h | 90 | **90** | ~90 |
| logo x / w | 16 / 80.6 | **0 / 79.1** | ~18 / ~67 |
| cabinetTitle x / y | 233 / 24 | **241 / 40** | ~229 / ~47 |
| sideInsetLeft | 16 | **9** | ~9 |
| progressCard | x16 y98 h154 | **x9 y98 h154** | x9 y98 h154 |
| progressBar y | 201.8 | **201.8** | ~210 |
| progressLimits y | — | **215.8** | ~230 |
| metric weight | 800 | **400** | regular |
| qrVisual x / size | 226 / 90 | **221 / 93** | ~213 / ~93 |
| qrCard copy pad | 16/12 | **7/19/7/16** | tighter top, ~19 right |
| tasteCircles x | 35/133/231 | **26/126/227** | ~24/124/225 |
| tasteCircle size | 75.9 | **76** | ~74–76 |
| plan price / period | 35.91px/800 single line | **35.91px/400 + 12px/400 `/ мес`** | 36 + 12 |
| plan benefits | 12px default white | **11px/400 muted** | 11px gray |
| home active icon | purple | **rgb(245,245,245)** | white |
| card border | purple tint | **rgba(255,255,255,0.1)** | neutral gray |
| cardGaps | [10,10,10] | **[10,10,10]** | 10 |
| gapPlanNav | 14 | **14** | ~14 |
| nav.y | 715 | **715** | 715 |

## Verification

| Check | Result |
|-------|--------|
| Prettier (touched files) | **PASS** |
| `npm test` | **67 PASS** |
| `npm run lint` | **0 errors** (23 pre-existing warnings) |
| `npm run locale:verify` | **PASS** |
| `npm run build` | **PASS** |
| Geometry probe @342×780 | **22/22 PASS** — `cabinet-geometry-probe-results.json` |
| Responsive 399/360/390/430 | **PASS** — no overflow; inset 16/9/16/16 |
| Full Round 5 pixel compare | **Not run** |
| Commit / deploy / Docker / telemetry / assets | **Not performed** |

## Changed files (cabinet)

- `src/pages/SubscriptionPage.module.scss`
- `src/components/CabinetHeader/CabinetHeader.module.scss`
- `src/components/ViwaBrandLogo/ViwaBrandLogo.module.scss`
- `src/components/MonthlyProgressCard/MonthlyProgressCard.module.scss`
- `src/components/QrPromoCard/QrPromoCard.module.scss` + `.tsx`
- `src/components/FavoriteTastesRow/FavoriteTastesRow.module.scss`
- `src/components/PlanSummaryCard/PlanSummaryCard.module.scss` + `.tsx` + `.test.tsx`
- `src/components/BottomNav/BottomNav.module.scss`
- `src/locale/subscriptionLocale.ts`
- `src/assets/locales/ru.json`, `en.json`
- `rounds/round-4/cabinet-geometry-probe-results.json`

## Remaining risks (cabinet)

- Logo visible x≈0 vs ref x18 (~18px left of target) — SVG whitespace trim is approximate; no asset hash change.
- Progress bar y≈202 vs ref y210 (~8px) within fixed h154 — limits now align ref y230.
- Taste circle 1 x26 vs ref x24 (+2px); circle 3 x227 vs ref x225 (+2px).
- Header title x241 vs ref x229 — trailing column flex-end; acceptable for Round 5 style gate.
- Full masked SSIM deferred to independent Round 5 pixel gate.

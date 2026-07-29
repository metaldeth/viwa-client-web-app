# Cabinet pixel+browser report — Round 4/5

**Date:** 2026-07-29T18:25:22.370Z
**Base URL:** http://127.0.0.1:5173
**Reference:** `round-2/pixel-reference.png` (outer 390×832)
**Inner crop:** x=24..365, y=20..799 → **342×780** CSS viewport
**Pixel:** **FAIL** | **Functional:** **PASS** | **Geometry targets:** **PASS** | **Overall:** **FAIL**

## Methodology

- Canonical outer reference **390×832** with bezel; never compare 399×832 browser to bezel-inclusive image.
- Established inner crop **x=24..365, y=20..799 → 342×780**; capture app at **342×780 1:1** after `document.fonts.ready`.
- **(A) Raw content:** full inner crop compare.
- **(B) Fair masked:** QR dynamic center + fruit/medallion circle pixels only (not card shells/text/geometry).
- Third slot: app **peach-mango** vs reference **apricot** — reported as asset difference, masked in (B).

## Metrics A — raw content (342×780)

| Metric | R4 | R3 corrected | Δ |
|--------|-----|--------------|---|
| Similarity | 0.6847 | — | — |
| SSIM | 0.697 | — | — |
| Diff ratio | 34.06% | — | — |
| RMSE | 70.13 | — | — |

## Metrics B — fair masked (QR center + fruit/medallions only)

| Metric | R4 | R3 corrected | Δ |
|--------|-----|--------------|---|
| Masked similarity | 0.7349 | 0.6339 | 0.101 |
| SSIM | 0.7038 | 0.4181 | 0.2857 |
| Masked diff ratio | 26.81% | 31.92% | -5.11pp |
| RMSE | 62.18 | 87.8 | -25.62 |

## Geometry targets @342×780

**21/21 PASS**

- ✅ progress.y: 98 (target 98)
- ✅ progress.h: 154 (target 154)
- ✅ qr.y: 262 (target 262)
- ✅ qr.h: 128 (target 128)
- ✅ taste.y: 400 (target 400)
- ✅ taste.h: 148 (target 148)
- ✅ plan.y: 558 (target 558)
- ✅ plan.h: 143 (target 143)
- ✅ plan.bottom: 701 (target 701)
- ✅ nav.y: 715 (target 715)
- ✅ gapPlanNav: 14 (target 14)
- ✅ cardGap[0]: 10 (target 10)
- ✅ cardGap[1]: 10 (target 10)
- ✅ cardGap[2]: 10 (target 10)
- ✅ metric≈60px: 59.85 (target 60)
- ✅ price≈36px: 35.91 (target 36)
- ✅ qrVisual≈90px: 90 (target 90)
- ✅ tasteCircle≈76px: [75.9,75.9,75.9] (target 76)
- ✅ cardRadius=12: [12,12,12,12] (target 12)
- ✅ title≈10px/400: {"fontSize":"10px","fontWeight":"400","lineHeight":"normal","height":14} (target "10px/400")
- ✅ no overflow @342: false (target false)

## Overlay inspection (header/logo/typography/color)

Review `cabinet-overlay-inner-342x780.png` — remaining deltas vs reference inner crop:
- Header logo position/scale vs reference top-left mark
- Subscription title line weight/size/color
- Progress card metric typography and bar fill color
- QR card subtitle line-breaks and QR tile contrast
- Plan card price line and tier label spacing
- Bottom nav icon/label color vs reference purple strip

## Medallions (visual + load)

- Integrated **14** taste medallion assets @180×180 (circular CSS crop)
- Third slot **peach-mango** (canonical) differs from reference **apricot** photo — masked in fair metric
- Inspect circle openings / color balance in overlay and `cabinet-actual-inner-342x780.png`

## Top deviations

### 1. global layout (fair masked: QR center + fruit only)
- **Expected:** ≤8% masked diff
- **Actual:** 26.8%
- **Fix:** Typography/QR copy line-breaks, header logo/title positions, progress card copy rhythm

### 2. raw content (full inner crop)
- **Expected:** ≤12% raw diff
- **Actual:** 34.1%
- **Fix:** Card shells, header stack, nav chrome, typography colors vs reference

### 3. third taste asset (canonical vs reference)
- **Expected:** Reference mockup slot 3 ≈ apricot fruit photo
- **Actual:** App uses peach-mango medallion (product-correct; masked in fair metric)
- **Fix:** Report separately — not a regression; reference asset outdated for slot 3

## Functional smoke

- ✅ Catalog loading: 3 slots visible before catalog resolves
- ✅ Catalog success: exactly 3 taste slots
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
- ✅ Machine path /m/VIWA-TEST-001/home: single aria-current=page
- ✅ Machine path: 3 taste slots
- ✅ Safe-area CSS on header/nav
- ✅ Medallion assets: 14/14 webp load
- ✅ Medallion unknown-key status: 200
- ✅ Third taste slot: peach-mango medallion (canonical; ref shows apricot — asset diff expected)

## Responsive (functional — NOT pixel targets)

- `cabinet-functional-399x832.png`: overflow=no, inset=16px, cards=4
- `cabinet-responsive-360x800.png`: overflow=no, inset=16px, cards=4
- `cabinet-responsive-390x844.png`: overflow=no, inset=16px, cards=4
- `cabinet-responsive-430x932.png`: overflow=no, inset=16px, cards=4

## Artifacts

- `reference-inner-crop.json`
- `cabinet-pixel-reference-inner-crop.png`
- `cabinet-actual-inner-342x780.png`
- `cabinet-diff-inner-342x780-fair-masked.png`
- `cabinet-diff-inner-342x780-raw.png`
- `cabinet-overlay-inner-342x780.png`
- `cabinet-pixel-browser-report.md`
- `cabinet-pixel-browser-results.json`
- `cabinet-functional-342x780.png`
- `cabinet-functional-399x832.png`
- `cabinet-responsive-360x800.png`
- `cabinet-responsive-390x844.png`
- `cabinet-responsive-430x932.png`

## Next fixes

- Typography/QR copy line-breaks, header logo/title positions, progress card copy rhythm
- Card shells, header stack, nav chrome, typography colors vs reference
# Cabinet Round 5 — quantitative pixel diff analysis (remediation recheck)

**Generated:** 2026-07-29T18:54:04.656Z
**Scope:** read-only analysis; no production edits.

## Gate reproduction

| Parameter | Value |
|-----------|-------|
| Viewport | 342×780 inner crop |
| Diff threshold | per-channel > 18 |
| Fair-mask compared pixels | 234131 (official: 234131) |
| Fair-mask diff pixels | 55601 (official: 55616) |
| Fair-mask diff ratio | 23.75% (official: 23.75%) |
| Reproduction match | ⚠️ drift |

### Fair mask regions (excluded from compare)
- Bottom home-indicator strip: `y > 752`
- QR bitmap rect: `x 213..318`, `y 273..378`
- Taste fruit circles: centers `(64,470)`, `(164,470)`, `(265,470)`, `r=36`

## Gate gap (≤8% target)

- Current: **23.75%** (55601 diff / 234131 compared)
- Target: **≤8%** (≤18730 diff pixels)
- **Excess diff pixels to fix:** 36871 (−15.75pp)

## Requested disjoint regions (fair-masked)

| Region | Masked cmp | Masked diff | Masked diff% | Share |
|--------|------------|-------------|--------------|-------|
| deviceChrome | 24438 | 304 | 1.24% | 0.55% |
| logo | 2546 | 2194 | 86.17% | 3.95% |
| titleMenuBell | 4476 | 1032 | 23.06% | 1.86% |
| progressShell | 28778 | 502 | 1.74% | 0.9% |
| progressTitle | 4400 | 707 | 16.07% | 1.27% |
| progressMetric | 6360 | 3812 | 59.94% | 6.86% |
| progressUnit | 2400 | 214 | 8.92% | 0.38% |
| progressBar | 3016 | 2379 | 78.88% | 4.28% |
| progressBottle | 3486 | 1044 | 29.95% | 1.88% |
| qrBackground | 14012 | 13762 | 98.22% | 24.75% |
| qrMasked | 0 | 0 | 0% | 0% |
| qrCopy | 15200 | 14848 | 97.68% | 26.7% |
| tasteShell | 25946 | 2621 | 10.1% | 4.71% |
| tasteText | 7178 | 580 | 8.08% | 1.04% |
| tasteFruitMasked | 1485 | 1461 | 98.38% | 2.63% |
| planShell | 18652 | 693 | 3.72% | 1.25% |
| planTitle | 4400 | 636 | 14.45% | 1.14% |
| planPrice | 7560 | 1677 | 22.18% | 3.02% |
| planBenefits | 13520 | 2622 | 19.39% | 4.72% |
| planChevron | 1056 | 139 | 13.16% | 0.25% |
| bottomNav | 12996 | 2782 | 21.41% | 5% |

## All regions by masked diff (sorted)

| Region | Compared | Diff | Diff% | Masked cmp | Masked diff | Masked diff% | Share |
|--------|----------|------|-------|------------|-------------|--------------|-------|
| qrCopy | 15200 | 14848 | 97.68% | 15200 | 14848 | 97.68% | 26.7% |
| qrBackground | 14012 | 13762 | 98.22% | 14012 | 13762 | 98.22% | 24.75% |
| progressMetric | 6360 | 3812 | 59.94% | 6360 | 3812 | 59.94% | 6.86% |
| bottomNav | 22230 | 5147 | 23.15% | 12996 | 2782 | 21.41% | 5% |
| planBenefits | 13520 | 2622 | 19.39% | 13520 | 2622 | 19.39% | 4.72% |
| tasteShell | 25946 | 2621 | 10.1% | 25946 | 2621 | 10.1% | 4.71% |
| progressBar | 3016 | 2379 | 78.88% | 3016 | 2379 | 78.88% | 4.28% |
| logo | 2546 | 2194 | 86.17% | 2546 | 2194 | 86.17% | 3.95% |
| planPrice | 7560 | 1677 | 22.18% | 7560 | 1677 | 22.18% | 3.02% |
| gapBetweenCards | 13272 | 1530 | 11.53% | 13272 | 1530 | 11.53% | 2.75% |
| tasteFruitMasked | 13644 | 13378 | 98.05% | 1485 | 1461 | 98.38% | 2.63% |
| progressBottle | 3486 | 1044 | 29.95% | 3486 | 1044 | 29.95% | 1.88% |
| titleMenuBell | 4476 | 1032 | 23.06% | 4476 | 1032 | 23.06% | 1.86% |
| progressTitle | 4400 | 707 | 16.07% | 4400 | 707 | 16.07% | 1.27% |
| planShell | 18652 | 693 | 3.72% | 18652 | 693 | 3.72% | 1.25% |
| planTitle | 4400 | 636 | 14.45% | 4400 | 636 | 14.45% | 1.14% |
| tasteText | 7178 | 580 | 8.08% | 7178 | 580 | 8.08% | 1.04% |
| progressShell | 28778 | 502 | 1.74% | 28778 | 502 | 1.74% | 0.9% |
| deviceChrome | 24438 | 304 | 1.24% | 24438 | 304 | 1.24% | 0.55% |
| progressUnit | 2400 | 214 | 8.92% | 2400 | 214 | 8.92% | 0.38% |
| planChevron | 1056 | 139 | 13.16% | 1056 | 139 | 13.16% | 0.25% |
| unassigned | 18954 | 62 | 0.33% | 18954 | 62 | 0.33% | 0.11% |
| qrShell | 0 | 0 | 0% | 0 | 0 | 0% | 0% |
| qrMasked | 11236 | 9741 | 86.69% | 0 | 0 | 0% | 0% |

## Median colors (large flat samples)

| Sample | Ref median | Actual median | Δ |
|--------|------------|---------------|---|
| qrCardBackground | #e3e3e3 (n=14012) | #ffffff (n=14012) | Δ(28,28,28) |
| progressCardBg | #070707 (n=28778) | #0b0b0b (n=28778) | Δ(4,4,4) |
| planCardBg | #080808 (n=18652) | #0b0b0b (n=18652) | Δ(3,3,3) |
| tasteCardBg | #080808 (n=25946) | #0b0b0b (n=25946) | Δ(3,3,3) |
| qrCardBgInner | #e3e3e3 (n=10524) | #ffffff (n=10524) | Δ(28,28,28) |
| pageBg | #080808 (n=32226) | #000000 (n=32226) | Δ(-8,-8,-8) |
| cardBorderStrip | #090909 (n=8142) | #0b0b0b (n=8142) | Δ(2,2,2) |

## Typography / color upper-bound sims

| Sim | Δ diff px | Projected ratio | Notes |
|-----|-----------|-----------------|-------|
| Logo perfect-copy (67×38 bbox) | −2194 | 22.81% | scale/clip upper bound |
| Metric block perfect-copy | −4026 | 22.03% | scaleX/weight/glyph upper bound |
| Neutral text band perfect-copy | −31203 | 10.42% | QR copy + plan benefits colors |

**Gate math:** need **36871** fewer diff pixels (−15.75pp) to reach ≤8%. QR bg alone saves ~23660 px → **13.64%** (still fails). QR bg + logo perfect → **12.71%**. Even neutral-text perfect-copy leaves **10.42%** — multiple CSS layers required.


| Simulation | Touched px | New masked diff | New ratio | Δ diff px |
|------------|------------|-----------------|-----------|-----------|
| qrBgToRefMedian | 10524 | 45101 | 19.26% | −10500 |
| qrBgToActMedian | 10524 | 55601 | 23.75% | −0 |
| logoPerfectUpperBound | 2546 | 53407 | 22.81% | −2194 |
| metricTypographyPerfectUpperBound | 7440 | 51575 | 22.03% | −4026 |
| neutralTextPerfectUpperBound | 105560 | 24398 | 10.42% | −31203 |
| allCardShellsToRefMedian | — | 54177 | 23.14% | −1424 |
| qrBgRefMedianPlusLogoPerfect | — | 42907 | 18.33% | −12694 |

## Highest-ROI CSS changes (recommended)

### 1. QR card background → reference median #e3e3e3 (actual #ffffff)
- **CSS:** QrPromoCard.module.scss — card background off-white `#f5f5f5`/`#f6f6f6` family; actual reads pure white
- **Evidence:** {"qrBackgroundSharePct":24.75,"simDeltaDiffPixels":10500,"projectedRatioPct":19.26}

### 2. Dark card shell fills + 1px borders — progress/plan/taste shells still ~12–19% local diff
- **CSS:** Shared `--viwa-cabinet-card-bg` / border rgba(255,255,255,0.1) — align fill medians to ref (#1a1a1a-ish) and border strip
- **Evidence:** {"progressShellSharePct":0.9,"planShellSharePct":1.25,"allShellsSimDelta":1424,"borderRef":"#090909","borderAct":"#0b0b0b"}

## Notes
- `tasteFruitMasked` and `qrMasked` are excluded by fair mask — raw-only signal.
- Logo perfect-copy simulation is an **upper bound** (copies reference pixels into logo bbox).
- Metric typography/weight and neutral text colors remain high-diff in `progressMetric`, `qrCopy`, `planBenefits` — tune after flat color fixes.

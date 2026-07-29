# Round 2 fix resolution — viwa-site landing

**Date:** 2026-07-29  
**Sources:** direct 897×867 pixel measurement (canonical reference), `landing-code-review.md`, Round 2 regressions R2-S7 / R2-F3

## Fixes applied

| ID | Issue | Resolution |
|----|-------|------------|
| G1 | Wrong 40/30/30 column spec | Tokens + board grid: **36.57fr / 28.43fr / 35fr** (x 0–328 / 328–583 / 583–897) |
| G2 | Equal bento rows | Desktop bento rows **228px / 303px** (`--viwa-bento-row-top/bottom`) |
| G3 | Header 60px vs reference | **68px** border-box header; header logo **57×29** horizontal stretch via CSS |
| G4 | Hero logo too small (~228×210) | Hero box **~275×241** via `aspect-ratio: 277/243`, `max-height: 241px`, controlled `object-fit: fill` |
| G5 | H1 too high/wide | Two-line condensed H1 (`Вкус в<br>точной дозе`), `--viwa-font-condensed`, ~30–34px clamp |
| G6 | Nav bold 12px white | **9px** regular muted nav (`0.5625rem`, weight 400) |
| G7 | Desktop header CTA oversized touch | Desktop **125×30**; **44px touch only** mobile/tablet band (430–767) |
| G8 | Bottom wrong order / 50-50 blocks | **4-col quad:** bubble \| science \| station \| rhythm (22.2 / 25.3 / 32.55 / 19.95fr) |
| G9 | Feature strip / bento typography | Indices ~11px regular; labels 9–11px; feature two-level label/detail normal weight |
| G10 | Bottom typography | Headings ~16px condensed; body/lines ~9px |
| R2-S7 | Flash icon `invert(1)` purple break | `.viwa-feature-bar__icon--flash img { filter: none }` |
| R2-F3 | Escape refocus when menu closed | `isMenuOpen()` guard + `setMenu` no-op on same state; Escape only when open |
| P1 | Blocking font `@import` | Removed CSS `@import`; non-blocking `<link>` + preload in `index.html` |
| P2 | Bento LCP priority | Only hero logo `fetchpriority="high"`; bento/bottom `loading="lazy"` |
| DOC | README stale concept-16 / 18 assets | Updated to **24-asset bento** editorial grid + LCP policy |

## Preserved (no change)

- Exact science copy + `data-viwa-ref-copy="science-exact-v1"`
- Live API hooks: `#flavors`, `#viwa-flavors-grid`, `#viwa-tiers`, `#viwa-tiers-list`, `#serial`, `#viwa-serial-input`, `[data-viwa-cta]`, `useMockApi: false`
- Mobile stack + 44px touch on mobile CTAs
- SVG logo path/viewBox unchanged
- C3 landing generated assets still untracked until final commit

## Verification

| Check | Result |
|-------|--------|
| `static-regression-check.ps1` | PASS (Round 2 hooks) |
| Asset processor | skipped (no pipeline code change) |
| Pixel browser rerun | not requested |
| Commit / deploy / Docker | not performed |
| `site-version.txt` | not bumped |

## Open questions

None.

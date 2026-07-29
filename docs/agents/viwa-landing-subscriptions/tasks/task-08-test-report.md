# task-08-test-report — Generated assets integration

**Date:** 2026-07-29  
**Repos:** `viwa-site`, `viwa-client-web-app`  
**Branch targets:** `master` (site), `dev` (client) — uncommitted

## Done

- Processed 18 parent batch assets from `C:\Users\metal\.cursor\projects\c-wiva\assets\` with Pillow (cover crop / safe fit, no distortion).
- Outputs: WebP (q85) + PNG fallback per architecture §7.
- Canonical `viwa-site/assets/manifest.json` v1.0.0 with all 18 IDs, dimensions, `altRu`, `tasteMediaKey`.
- Mirrored `assets/generated/**` → site; `public/assets/viwa/**` + `src/data/viwaAssetManifest.json` → client.
- Site: `<picture>` hero + cabinet mock; `landing-api.js` loads manifest, taste tiles WebP/PNG + `altRu`, lazy below fold.
- Client: `viwaAssets.ts` manifest map; `FavoriteFlavorsSection` uses manifest `altRu` on `<img>`.

## Asset dimensions (verified)

| ID | Size |
|----|------|
| hero-bottle | 1200×1600 |
| hero-station | 1920×1080 |
| taste-* (×14) | 800×1000 |
| cabinet-mock-preview | 1170×2535 (9:19.5 safe fit) |
| logo-viwa-mark | 512×512 |

## Verification

| Check | Result |
|-------|--------|
| Manifest file existence (site + client) | PASS — 18 assets × webp/png |
| Image dimensions vs manifest | PASS (Python/Pillow) |
| Site `static-regression-check.ps1` | PASS |
| Client `npm run lint` | PASS — 0 errors (23 pre-existing warnings) |
| Client `npm run locale:verify` | PASS — 47 keys |
| Client `npm test` | PASS — 40/40 (run from `c:\wiva\wiva-client-web-app` literal path) |
| Client `npm run build` | PASS — exit 0; `dist/assets/viwa/**` — 37 files |

## Notes

- Originals remain outside repo (`C:\Users\metal\.cursor\projects\c-wiva\assets\`).
- Re-run pipeline: `python viwa-site/scripts/process-viwa-assets.py`.
- Tests/build from junction path `viwa-client-web-app` can fail path resolution; use literal `wiva-client-web-app` on this machine.

## Not in scope

- commit/push/deploy, Docker, task-09 prices/API wire-up, GenerateImage.

## Acceptance mapping

- [x] All 18 required asset IDs present
- [x] 14 taste images wired on site
- [x] `cabinet-mock-preview` in desktop right panel
- [x] Client favorites use generated taste imagery paths
- [x] `altRu` from manifest in site/client img alt
- [x] Lazy loading below fold on site tastes + cabinet
- [x] `manifest.json` version set (1.0.0)

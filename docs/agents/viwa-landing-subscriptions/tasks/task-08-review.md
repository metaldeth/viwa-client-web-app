# task-08-review: Generated assets integration (manifest §7)

**Session:** `viwa-landing-subscriptions`  
**Repos:** `viwa-site` + `viwa-client-web-app` (branch `master` / `dev`, uncommitted)  
**Task:** [task-08.md](./task-08.md)  
**Architecture:** [architecture.md](../architecture.md) v1.2 §7 (manifest schema, 18 asset IDs, WebP+PNG, altRu, lazy below fold)  
**Test report:** [task-08-test-report.md](./task-08-test-report.md)  
**Review agents (parallel):** `review-general`, `review-styles`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`; plan override — no `AGENTS.md` `reviewAgents` for cross-repo task)

## Изменённые / новые файлы (task-08 scope)

| Файл | Кратко |
|------|--------|
| `viwa-site/assets/manifest.json` | Canonical manifest v1.0.0 — 18 assets, altRu, tasteMediaKey |
| `viwa-site/assets/generated/**` | WebP+PNG (36 files): hero×2, tastes×14, cabinet, logo |
| `viwa-site/scripts/process-viwa-assets.py` | **NEW** — Pillow pipeline from external parent batch |
| `viwa-site/js/landing-api.js` | `loadManifest`, `tasteImagePaths`, `<picture>` taste tiles, lazy |
| `viwa-site/index.html` | `<picture>` hero-bottle + cabinet-mock-preview |
| `viwa-site/scripts/static-regression-check.ps1` | Extended — manifest file existence checks |
| `viwa-client-web-app/public/assets/viwa/**` | Mirror generated assets + `manifest.json` (37 files) |
| `viwa-client-web-app/src/data/viwaAssetManifest.json` | Bundled manifest copy (synced with site) |
| `viwa-client-web-app/src/utils/viwaAssets.ts` | Manifest map `tasteMediaKey` → paths + `altRu` |
| `viwa-client-web-app/src/components/FavoriteFlavorsSection/FavoriteFlavorsSection.tsx` | `<picture>` + manifest `altRu` + purple placeholder fallback |

**Originals (OK):** parent batch at `C:\Users\metal\.cursor\projects\c-wiva\assets\` — outside both repos; not committed.

**Не тронуто (OK):** Docker/compose; API handlers; `SubscriptionPage` hero/branding (not applicable in current UI); task-09 live price wire-up.

**Out of scope (not blockers):** SVG logo follow-up (separate track); PNG logo files exist and are valid — site header still uses text «VIWA».

---

## §7 — 18 manifest mappings

| # | Asset ID | Manifest | Disk (site) | Site integration | Client integration |
|---|----------|----------|-------------|------------------|-------------------|
| 1 | `hero-bottle` | 1200×1600 webp/png | ✅ | ✅ `index.html` `<picture>` (eager, LCP) | ✅ files in `public/assets/viwa/hero/` |
| 2 | `hero-station` | 1920×1080 webp/png | ✅ | 🟡 generated only — not referenced in HTML/JS | ✅ files only |
| 3–16 | `taste-{mediaKey}` ×14 | 800×1000 webp/png | ✅ | ✅ `landing-api.js` manifest → lazy `<picture>` | ✅ `FavoriteFlavorsSection` via `getTasteImagePaths` |
| 17 | `cabinet-mock-preview` | 1170×2535 webp/png | ✅ | ✅ desktop aside `<picture>` `loading="lazy"` | ✅ files only |
| 18 | `logo-viwa-mark` | 512×512 webp/png (PNG not SVG) | ✅ | 🟡 not wired — text logo in header (SVG follow-up) | ✅ files only |

**Canonical taste keys:** all 14 `tasteMediaKey` values match `TASTE_MEDIA_KEYS` in `viwa-telemetry/apps/api/src/products/taste-media-keys.ts` (verified).

**Manifest sync:** `viwa-site/assets/manifest.json` === `public/assets/viwa/manifest.json` === `src/data/viwaAssetManifest.json` (byte-identical).

**Dimensions:** Python/Pillow verify — 0 mismatches vs manifest width/height for all 36 raster files.

---

## Acceptance task-08

| Критерий | Статус |
|----------|--------|
| All 18 required asset IDs present per §7 | ✅ manifest + on-disk webp/png |
| 14 `taste-{mediaKey}` wired on site | ✅ dynamic grid via manifest |
| `cabinet-mock-preview` in desktop right panel | ✅ aside mock |
| Client favorites show generated taste imagery | ✅ WebP/PNG `<picture>` |
| `altRu` from manifest in `<img alt>` | ✅ tastes (site JS + client); hero/cabinet alt strings match manifest but are static in HTML |
| Lazy loading below fold on site | ✅ tastes + cabinet mock; hero eager (correct for LCP) |
| `manifest.json` version bumped | ✅ `1.0.0` |
| No source originals modified in repo | ✅ external parent dir only |
| No API/price leakage in asset scope | ✅ no prices in HTML/assets; mock tiers remain guarded in `landing-api.js` (task-07) |

---

## Verification (re-checked)

| Check | Result |
|-------|--------|
| `powershell -File viwa-site/scripts/static-regression-check.ps1` | ✅ PASS (exit 0) |
| Manifest 18 assets × webp/png on disk | ✅ |
| Image dimensions vs manifest | ✅ 0 mismatches |
| Site generated payload | 36 files, ~22.3 MB |
| Client `public/assets/viwa` | 37 files (+ `manifest.json`), ~22.31 MB |
| Client `dist/assets/viwa/**` after build | ✅ 37 files |
| Client `npm run lint` | ✅ 0 errors (per test report) |
| Client `npm test` | ✅ 40/40 (per test report) |
| Client `npm run build` | ✅ exit 0 (per test report) |
| Browser visual QA / crop quality | ⚠️ not run in review (static + dimension checks only) |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ⚠️ 0 критичных, 7 предложений | — |
| review-styles | ⚠️ 4 предложения, 0 блокеров | — |
| review-performance | ⚠️ 5 предложений, 0 критичных | — |
| review-docs | ⚠️ 4 предложения | — |
| review-final | ✅ 0 blockers | — |

---

## Ревью: Общее архитектурное

### Суммаризация

**Что решали:** Integrate parent-generated batch per architecture §7 — canonical manifest, WebP+PNG outputs, site `<picture>` wiring, client mirror + manifest-backed favorites imagery.

**Как работает:** Parent originals → `process-viwa-assets.py` writes site `assets/generated/**` + client `public/assets/viwa/**` + three synced `manifest.json` copies. Site: `landing-api.js` fetches manifest, maps `tasteMediaKey`, builds lazy `<picture>` tiles after tastes API load. Client: build-time import of `viwaAssetManifest.json` in `viwaAssets.ts`; `FavoriteFlavorsSection` resolves paths + `altRu`, placeholder chip on `onError`.

**Валидация логики:** ✅ 18/18 assets on disk; taste keys canonical; no price data in asset layer. 🟡 `hero-station` and `logo-viwa-mark` not yet consumed in site markup (files ready for task-09/branding). 🟡 Manifest fetch failure is silent — path fallback still works if files exist.

### Проблемы

🟡 **`hero-station` not integrated in landing UI** — largest PNG (~2.7 MB) unused; acceptable for task-08 acceptance (assets present) but defers editorial split/hero variant to task-09.

🟡 **Logo asset unused on site** — header/footer use text «VIWA»; PNG/WebP exist. Per session note: SVG follow-up is separate; **not a task-08 blocker** while PNG integration is not broken.

🟡 **Static HTML alt/paths for hero + cabinet** — [`index.html:65-76`, `:123-134`] duplicate manifest `altRu`/paths instead of manifest-driven render; drift risk on manifest-only edits.

🟡 **Silent manifest load failure** — [`landing-api.js:111-114`] `catch` returns `null`; tastes still render with conventional paths + API `nameRu` alt — OK when files exist, weaker `altRu` contract if manifest missing but files partial.

🟡 **Taste key/label duplication** — `TASTE_KEYS` / `TASTE_LABELS_RU` in Python script, `MOCK_TASTES` in `landing-api.js` — not synced mechanically with telemetry `TASTE_MEDIA_KEYS` (currently equal by inspection).

🟡 **Triple manifest copies** — site + client public + client `src/data` — kept in sync only via `process-viwa-assets.py`; manual edit to one copy will desync bundled TS import.

🟡 **`SubscriptionPage` hero/branding touchpoint** — task-08 lists optional hero images; no client hero consumption — OK «if applicable» for current concept-16 subscription UI.

### Вывод

⚠️ **0 критичных, 7 предложений.** Core §7 contract (18 assets, tastes + cabinet + hero-bottle, client favorites, altRu, lazy) satisfied.

---

## Ревью: Стили

### Проблемы

🟡 **Site hero/cabinet hardcoded dimensions** — display 600×800 / 390×844 vs manifest 1200×1600 / 1170×2535 — intentional downscale; ensure CSS `object-fit` preserves crop (existing `viwa-landing.css` — not regressed).

🟡 **Placeholder chips** — taste `onerror` removes `<picture>` and adds `--placeholder` class; matches concept-16 purple chip pattern on client (`getTastePlaceholderLabel`).

🟡 **Inline `onerror` on static `<picture>`** — pre-task-07 CSP pattern persists on hero/cabinet; task-08 added JS `onerror` on dynamic tastes (consistent with site style, not new blocker).

🟡 **Client `<picture>` without explicit width/height** — [`FavoriteFlavorsSection.tsx:45-53`] relies on SCSS box; minor CLS risk vs site tiles with explicit 160×200.

### Вывод

⚠️ **4 предложения**, 🔴 **0 layout blockers**. WebP-first + PNG fallback aligned with §7.

---

## Ревью: Производительность

### Проблемы

🟡 **~22.3 MB static asset payload per repo** — 18 IDs × 2 formats; dominates client deploy size; WebP mitigates but PNG fallbacks remain large (hero-station PNG ~2.7 MB unused on site).

🟡 **14 lazy taste images on landing** — good `loading="lazy"` + `decoding="async"`; still ~14 concurrent requests when flavors section enters viewport.

🟡 **Client favorites grid** — 14 `<picture>` elements with lazy loading; acceptable for subscription page below fold; no srcset density variants (single 800×1000 served into small tiles).

🟡 **No `<link rel="preload">` for hero WebP** — hero-bottle is LCP candidate; `<picture>` without preload may delay LCP vs preloaded `hero-bottle.webp`.

🟡 **`viwaAssetManifest.json` bundled in JS** — small vs images; acceptable for build-time path resolution.

### Вывод

⚠️ **5 предложений**, 🔴 **0 critical perf regressions** for task scope. Weight is inherent to full-fidelity PNG fallbacks; optimize in task-10/browser gate if needed.

---

## Ревью: Документация

### Проблемы

🟡 **`viwa-site/README.md` stale** — still mentions «placeholders until task-08» ([`README.md:41`, `:76`]); should document `process-viwa-assets.py` + manifest contract post-integration.

🟡 **No script README** — reproducibility command documented only in test report, not site README.

🟡 **JSDoc on `viwaAssets.ts`** — module comment OK; no test coverage documenting manifest fallback behavior.

🟡 **Architecture §7 says `landing-tastes.js`** — implementation uses extended `landing-api.js` (acceptable consolidation; minor doc/path naming drift).

### Вывод

⚠️ **4 предложения**, некритично for merge; update README in task-09/docs pass.

---

## Финальное ревью

### Статус предыдущих ревью

- review-general: ⚠️ unused hero-station/logo wiring deferred; manifest silent fail
- review-styles: ⚠️ hardcoded hero/cabinet paths; client img dimensions
- review-performance: ⚠️ 22 MB payload; unused hero-station weight
- review-docs: ⚠️ README stale; triple-manifest sync docs
- review-final: acceptance met; no task-08 blockers

### Cross-cutting risks

| Risk | Severity | Notes |
|------|----------|-------|
| 18/18 assets present + dimensions | ✅ | manifest + Pillow verify |
| 14 taste keys canonical | ✅ | matches telemetry allowlist |
| Site tastes + cabinet + hero-bottle wired | ✅ | lazy below fold where required |
| Client favorites manifest + altRu + fallback | ✅ | placeholder on error |
| hero-station / logo not in site HTML | 🟡 | task-09 / SVG track; not task-08 blocker |
| Logo PNG vs SVG preferred | 🟡 | explicit out-of-scope per orchestrator |
| API/price leakage | ✅ | none in asset layer |
| Originals outside repo | ✅ | parent batch path only |
| Script path `wiva-client-web-app` | 🟡 | cutover to `viwa-*` naming may break re-run on some machines |
| Mock tier prices in `landing-api.js` | ✅ | task-07 guard unchanged; not introduced by task-08 |
| Docker untouched | ✅ | |

### Итог

✅ **Task-08 готов к merge в session baseline** для asset integration scope.

**hasCriticalIssues: false** — все acceptance-критерии task-08 и §7 asset contract закрыты; замечания 🟡 — deferred wiring (hero-station, logo markup), docs, payload size, script portability.

---

## Рекомендации developer-complex (опционально, не блокируют task-08)

1. **Желательно (task-09):** Wire `hero-station` where concept-16 split/marketing needs station imagery; consume `logo-viwa-mark` when SVG follow-up lands.
2. **Желательно:** Update `viwa-site/README.md` — remove placeholder wording; document `process-viwa-assets.py` + external originals path.
3. **Желательно:** Parameterize `CLIENT_ROOT` in script (`viwa-client-web-app` with fallback) for post-cutover reproducibility.
4. **Желательно:** Surface manifest load failure in dev console or optional `data-manifest="ok|fallback"` for debugging.
5. **Некритично:** `<link rel="preload" as="image" href="assets/generated/hero/hero-bottle.webp">` for LCP; srcset for taste tiles; unit test for `getTasteImagePaths` fallback.

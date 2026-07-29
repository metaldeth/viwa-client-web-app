# task-08: Generated assets integration (external manifest input)

**Зависимости:** task-06, task-07; **external:** parent orchestrator `GenerateImage` batch

**UC:** UC-1, UC-5

**Repo:** `viwa-site` + `viwa-client-web-app`  
**Branch target:** `master` (site) + `dev` (client)

## Описание

Интегрировать **готовые** assets по контракту `architecture.md` §7. **Генерация изображений — вне scope:** parent orchestrator создаёт files + `manifest.json`; developer только копирует и подключает. Субагент **не вызывает** GenerateImage и не поручает генерацию другим субагентам.

## External input (parent agent)

| Artifact | Source |
|----------|--------|
| `viwa-site/assets/manifest.json` | Parent writes per §7 schema |
| `viwa-site/assets/generated/**` | Parent batch: hero-bottle, hero-station, taste-{14 keys}, cabinet-mock-preview, logo-viwa-mark |
| Copy to client | Same files → `viwa-client-web-app/public/assets/viwa/**` |

**Style lock:** concept-16 editorial fruit lab; B&W + `#7F5AF0` accent.

## Allowed scope

- `viwa-site/assets/manifest.json` (from parent)
- `viwa-site/assets/generated/**` (from parent)
- `viwa-site/js/landing-tastes.js` or extend `landing-api.js` — `<picture>` from manifest
- `viwa-client-web-app/public/assets/viwa/**` (copy)
- `FavoriteFlavorsSection` — map `tasteMediaKey` → manifest asset id `taste-{key}`
- Fallback: purple placeholder chip + RU label if asset missing

## Запрет Docker

Не изменять Docker/compose файлы.

## Запрет генерации

- **Не** использовать GenerateImage / image tools в этой задаче
- **Не** создавать placeholder AI images — ждать parent batch или использовать text-only fallback

## Точные touchpoints

| Файл | Изменение |
|------|-----------|
| `viwa-site/assets/manifest.json` | Canonical manifest (parent-provided) |
| `viwa-site/assets/generated/**` | WebP + PNG per manifest |
| `viwa-site/index.html` | `<picture>` hero, tastes, mock preview |
| `viwa-client-web-app/public/assets/viwa/**` | Mirror generated files |
| `src/components/FavoriteFlavorsSection/` | Asset lookup by manifest id |
| `src/pages/SubscriptionPage/` | Hero/branding images if applicable |

## Acceptance

- [ ] All required asset IDs present per §7 table (or documented skip with fallback)
- [ ] 14 `taste-{mediaKey}` images wired on site
- [ ] `cabinet-mock-preview` in desktop right panel
- [ ] Client favorites show generated taste imagery
- [ ] `altRu` from manifest used in `<img alt>`
- [ ] Lazy loading below fold on site
- [ ] `manifest.json` version bumped

## Tests / build

```powershell
# Site
cd c:\wiva\viwa-site
# Verify no 404 for manifest paths referenced in HTML/JS

# Client
cd c:\wiva\viwa-client-web-app
npm run lint
npm run build
# Check dist contains public/assets/viwa/*
```

## Downstream

- **task-09** — full integration with live pages
- **task-10** — B-2 asset load checks

# task-03: Public tiers/tastes + CORS + contracts/tests

**Зависимости:** task-02

**UC:** UC-1, UC-6

**Repo:** `viwa-telemetry`  
**Branch target:** `main`

## Описание

Новые public controllers, CORS для `/api/v1/public/*`, integration tests T1–T3, T8. **Wave 1 gate** для client/site live API wire-up.

## Allowed scope

- `apps/api/src/loyalty/public-api/**` (NEW)
- `apps/api/src/main.ts` (CORS)
- `apps/api/src/products/taste-media-keys.ts` (re-export in public service)
- `apps/api/test/client-api.spec.ts` (public tier assertions T2)
- `docs/contracts/loyalty-public-rest.md` (sync if drift)
- **Не** менять client-auth (task-04)

## Запрет Docker

Не изменять Docker/compose файлы.

## Точные touchpoints

| Файл / модуль | Изменение |
|---------------|-----------|
| `apps/api/src/loyalty/public-api/public-subscription-levels.controller.ts` | **NEW** — `GET /public/subscription-levels` |
| `apps/api/src/loyalty/public-api/public-tastes.controller.ts` | **NEW** — `GET /public/tastes` |
| `apps/api/src/loyalty/public-api/public-api.module.ts` | **NEW** — register controllers |
| `apps/api/src/main.ts` | CORS: origins vitamin-water.ru, www, cabinet; paths `/api/v1/public/*`; GET+OPTIONS |
| `apps/api/test/client-api.spec.ts` | T2: legacy tier absent from public response |
| `apps/api/test/` (integration) | T8: OPTIONS preflight 204 + Allow-Origin |

## Acceptance

- [ ] `GET /api/v1/public/subscription-levels` → 200, `items.length === 2`, volumes 12000/18000
- [ ] No `dailyVolumeMl` in public response; `schemaVersion: 2`
- [ ] `GET /api/v1/public/tastes` → 14 items, `mediaKey` from `TASTE_MEDIA_KEYS`, RU labels
- [ ] T8: CORS preflight from `https://vitamin-water.ru` succeeds
- [ ] Rate limit + Cache-Control headers per architecture §1
- [ ] Legacy grandfather tier with active subs **not** in public items (T2)

## Tests / build

```powershell
cd c:\wiva\viwa-telemetry
npm run lint
npm run typecheck
npm test -- subscription-level client-api
npm run build
# Manual/staging smoke:
curl -sI -X OPTIONS -H "Origin: https://vitamin-water.ru" -H "Access-Control-Request-Method: GET" https://tl.vitamin-water.ru/api/v1/public/subscription-levels
```

## Downstream

- **task-09** — client/site wire-up blocked until this task merged
- **task-07** — may switch from mock to live API after Wave 1 gate

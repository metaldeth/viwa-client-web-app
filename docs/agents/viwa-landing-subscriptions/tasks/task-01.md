# task-01: Контракты §0 + REST (public / client / admin)

**Зависимости:** —

**UC:** UC-1, UC-3, UC-6, UC-7 (подготовка)

**Repo:** `viwa-telemetry`  
**Branch target:** `main`

## Описание

Зафиксировать contract-first артефакты до реализации backend и до wire-up client/site. Перенести canon §0 из `architecture.md` v1.2 в канонические contract docs. Устранить drift TZ v1 (`source=website` → `entry=website`, body `registrationHint`).

## Allowed scope

- Только `docs/contracts/*.md` и минимальные ссылки в `AGENTS.md` (viwa-telemetry) при необходимости
- **Не** менять Prisma, API handlers, client/site код

## Запрет Docker

Не изменять `Dockerfile*`, `docker-compose*`, `compose*.yml`.

## Точные touchpoints

| Файл | Содержание |
|------|------------|
| `docs/contracts/loyalty-public-rest.md` | `GET /api/v1/public/subscription-levels` (marketing filter, schemaVersion 2, без legacy); `GET /api/v1/public/tastes`; rate limit; cache headers; CORS note |
| `docs/contracts/loyalty-client-rest.md` | `POST /client/auth/check-code` + `registrationHint`; `GET /client/me` monthly fields + deprecated daily alias; `PUT /client/me/favorite-tastes`; `GET /client/subscription-levels` = marketing filter |
| `docs/contracts/loyalty-admin-rest.md` | Client card `registrationSource`; subscription-level admin CRUD |
| `docs/contracts/analytics-admin-rest.md` | `registrationSourceBreakdown` в `GET /admin/analytics/clients` |
| `docs/agents/viwa-landing-subscriptions/architecture.md` §0 | Ссылка из контрактов как источник canon |

## Acceptance

- [ ] Canon §0: query `entry=website`, body `registrationHint`, response-only `registrationSource`
- [ ] Mapping table TZ v1 → v1.2 задокументирована
- [ ] Public tiers invariant: `items.length === 2` на marketing seed
- [ ] Error codes: `SERIAL_REQUIRED`, `MACHINE_NOT_FOUND`, `INVALID_TASTE`
- [ ] Monthly fields documented; `limitResetsAt: null` для monthly tiers

## Tests / build

```powershell
cd c:\wiva\viwa-telemetry
# Docs-only task — проверка ссылок и согласованности с architecture §1–§5
npm run lint
npm run typecheck
```

Код не меняется — exit 0 baseline repo.

## Downstream

- **task-02, task-03, task-04** — реализация по контрактам
- **task-05, task-07** — client/site могут начать mock-разработку после merge task-01

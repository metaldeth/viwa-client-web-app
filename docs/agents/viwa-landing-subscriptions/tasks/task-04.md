# task-04: registrationSource + auth + favorites + admin analytics

**Зависимости:** task-02

**UC:** UC-3, UC-4, UC-5, UC-7

**Repo:** `viwa-telemetry`  
**Branch target:** `main`

## Описание

Server-side `registrationSource` derivation, serial gate for new clients, profile monthly fields + favorite tastes CRUD, admin display/filter, machine WS monthly fields, tests T7, T9–T11. **Preserve** uncommitted analytics UI in `apps/web/` — не откатывать; добавить `registrationSource` filter/widgets изолированно.

## Allowed scope

- `apps/api/src/client-auth/**`
- `apps/api/src/loyalty/client-api/**`
- `apps/api/src/loyalty/admin-api/admin-clients.service.ts`
- `apps/api/src/loyalty/admin-api/admin-analytics.service.ts`
- `apps/api/src/loyalty/machine-ws/loyalty-machine-ws.handler.ts`
- `apps/api/test/client-api.spec.ts`
- `apps/web/src/` — **только** registrationSource filter/card slice; **не revert** чужие analytics changes
- **Не** дублировать public controllers (task-03)

## Запрет Docker

Не изменять Docker/compose файлы.

## Точные touchpoints

| Файл / модуль | Изменение |
|---------------|-----------|
| `apps/api/src/client-auth/client-auth.service.ts` | `deriveRegistrationSource()`; serial gate; immutable existing |
| `apps/api/src/client-auth/dto/client-auth.dto.ts` | `registrationHint` allowlist |
| `apps/api/src/client-auth/client-profile.mapper.ts` | Monthly + favorites + deprecated daily alias |
| `apps/api/src/loyalty/client-api/client-profile.controller.ts` | Extend `GET /client/me` |
| `apps/api/src/loyalty/client-api/client-favorite-tastes.controller.ts` | **NEW** — `PUT /client/me/favorite-tastes` |
| `apps/api/src/loyalty/client-api/client-subscription-levels.controller.ts` | Marketing filter via `listMarketingSubscriptionLevels()` |
| `apps/api/src/loyalty/admin-api/admin-clients.service.ts` | Display `registrationSource` + machine |
| `apps/api/src/loyalty/admin-api/admin-analytics.service.ts` | `registrationSourceBreakdown` |
| `apps/api/src/loyalty/machine-ws/loyalty-machine-ws.handler.ts` | Monthly fields in profile push |
| `apps/api/test/client-api.spec.ts` | T7, T9, T10, T11 |
| `apps/web/src/` (isolated) | Admin client card source label; analytics breakdown widget |

## Acceptance

- [ ] T9: `registrationHint=website` + allowed Origin → `registrationSource=WEBSITE`
- [ ] T10: existing client + `machineSerial` in body → attribution unchanged
- [ ] T11: new client without serial → `400 SERIAL_REQUIRED`
- [ ] T7: pour debits monthly pool once; idempotent replay
- [ ] `PUT /client/me/favorite-tastes` — max 3 keys, `INVALID_TASTE` otherwise
- [ ] Admin analytics shows breakdown WEBSITE / MACHINE_QR / UNKNOWN
- [ ] **Uncommitted analytics chart work preserved** — git diff не содержит revert чужих файлов

## Tests / build

```powershell
cd c:\wiva\viwa-telemetry
npm run lint
npm run typecheck
npm test -- client-api client-auth loyalty-domain
npm run build
```

## Downstream

- **task-05, task-06** — auth payload + profile types
- **task-09** — E2E attribution Flow A/B

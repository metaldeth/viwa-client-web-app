# task-05: Client serial/no-serial routing + auth attribution

**Зависимости:** task-01; live API wire-up → task-03, task-04

**UC:** UC-2, UC-3, UC-4

**Repo:** `viwa-client-web-app`  
**Branch target:** `dev`

## Описание

Новые маршруты `/register`, `/auth`, `/home`; SerialCapturePage; landing entry (`entry`, `viwa_entry`, `viwa_serial`); auth flow с `registrationHint`; strip serial после первой регистрации. **Mock/fixtures** допустимы до Wave 1 gate; переключение на live API — в task-09.

## Allowed scope

- `src/pages/App.tsx`
- `src/pages/SerialCapturePage/**` (NEW)
- `src/pages/ValidationPage/**`
- `src/pages/AuthPage/**`, `SmsPage/**`
- `src/state/auth/**`
- `src/app/api/modules/authModule.ts`
- `src/app/api/modules/publicModule.ts` (machine lookup only in this task)
- `src/utils/landingEntry.ts` (NEW)
- Unit/integration tests for routing + auth thunk
- **Не** редизайн SubscriptionPage (task-06)

## Запрет Docker

Не изменять Docker/compose файлы.

## Точные touchpoints

| Файл / модуль | Изменение |
|---------------|-----------|
| `src/pages/App.tsx` | Routes: `/register`, `/auth`, `/m/:machineSerial/*`, `/home` |
| `src/pages/SerialCapturePage/` | **NEW** — manual serial + validation redirect |
| `src/pages/ValidationPage/` | Guards; machine lookup |
| `src/pages/AuthPage/`, `SmsPage/` | Pass `registrationHint`; post-success navigation |
| `src/state/auth/thunk.ts` | Post-reg `history.replaceState` → `/home` |
| `src/utils/landingEntry.ts` | **NEW** — parse `entry`, sessionStorage `viwa_entry`/`viwa_serial` |
| `src/app/api/modules/authModule.ts` | Body `registrationHint` (not `registrationSource`) |
| `src/app/api/modules/publicModule.ts` | `GET /public/machines/by-serial/:serial` |
| `src/types/serverInterface/clientDTO.ts` | Types for hint + monthly fields (stubs OK pre-task-04) |

## Acceptance

- [ ] `/register?serial=VIWA-XXX&entry=website` → skip capture → `/m/{serial}/auth`
- [ ] `/register?entry=website` → SerialCapturePage → valid serial → `/m/{serial}/auth`
- [ ] `/auth` — returning login без serial gate
- [ ] First registration success → URL **без** serial segment → `/home`
- [ ] `registrationHint=website` sent when `viwa_entry=website` in session
- [ ] Invalid serial → readable error (B-15)
- [ ] **Не** отправлять `registrationSource` в request body

## Tests / build

```powershell
cd c:\wiva\viwa-client-web-app
npm run lint
npm test -- landingEntry auth SerialCapture
npm run build
```

### Test cases

| ID | Сценарий |
|----|----------|
| CW05-1 | `landingEntry` parses `entry=website` + stores session |
| CW05-2 | Serial capture validates via public API mock |
| CW05-3 | Auth thunk includes `registrationHint` when entry=website |
| CW05-4 | Post-reg navigation strips serial from URL |
| CW05-5 | Returning `/auth` does not require machineSerial |

## Downstream

- **task-06** — UI on top of routes
- **task-09** — live API integration

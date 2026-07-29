# task-05-review: Client serial/no-serial routing + auth attribution

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-client-web-app` (branch `dev`, uncommitted)  
**Task:** [task-05.md](./task-05.md)  
**Architecture:** [architecture.md](../architecture.md) v1.2 (§0 attribution, §3 routes, Flow A/B/C)  
**Test report:** [task-05-test-report.md](./task-05-test-report.md)  
**Review agents (parallel):** `review-general`, `review-renderer-structure`, `review-styles`, `review-performance`, `review-final` (`composer-2.5-fast`)

## Изменённые / новые файлы (task-05 scope)

| Файл | Кратко |
|------|--------|
| `src/pages/App.tsx` | Routes `/register`, `/auth`, `/auth/sms/*`, `/home`; preserved `/m/:machineSerial/*` |
| `src/pages/RegisterPage/` | **NEW** — landing query parse, skip-capture redirect |
| `src/pages/SerialCapturePage/` | **NEW** — manual serial + public API validation |
| `src/pages/ReturningAuthGuard/` | **NEW** — authed → `/home` on returning routes |
| `src/pages/HomeAuthGuard/` | **NEW** — no tokens → `/auth` on `/home` |
| `src/utils/landingEntry.ts` | **NEW** — `entry`, `viwa_entry`/`viwa_serial`, hint resolution |
| `src/state/auth/thunk.ts`, `navigation.ts` | `registrationHint`; post-reg URL strip → `/home` |
| `src/app/api/modules/auth/authModule.ts` | Body `registrationHint` (not `registrationSource`) |
| `src/pages/ValidationPage/helpers.ts` | Returning auth routes; `redirectToClientAuth` → `/auth` |
| `src/pages/ValidationPage/machineSerialValidation.ts` | **NEW** — format pattern |
| `src/pages/ValidationPage/useMachineSerialValidation.ts` | Public API lookup + readable errors |
| `src/pages/SmsPage/SmsPage.tsx` | Post-success `navigate(POST_AUTH_HOME_PATH)` |
| `src/pages/SubscriptionPage/SubscriptionPage.tsx` | Fallback `Navigate to="/auth"` (minimal) |
| `src/types/serverInterface/clientDTO.ts` | `RegistrationHint`, `CheckCodeRequest` |
| `package.json`, `vitest.config.ts`, `tsconfig.json` | Vitest 3.2.4, `globals: true`, test exclude from `tsc` |
| Tests | `landingEntry.test.ts`, `SerialCapturePage.test.ts`, `authModule.test.ts`, `thunk.test.ts`, `helpers.routing.test.ts`, `src/test/browserMocks.ts` |

**Ripple (minimal, justified):** `SubscriptionPage.tsx` — `/auth` path fix for `/home` guard; `litersFieldToMl.test.ts` — Vitest globals.

**Не тронуто (OK):** Docker/compose, `publicModule.ts` (pre-existing), SubscriptionPage UI redesign (task-06).

---

## Acceptance task-05

| Критерий | Статус |
|----------|--------|
| `/register?serial=VIWA-XXX&entry=website` → skip capture → `/m/{serial}/auth` | ✅ код; 🟡 нет component-теста redirect |
| `/register?entry=website` → SerialCapture → valid → `/m/{serial}/auth` | ✅ код; 🟡 CW05-2 слабый (не component) |
| `/auth` — returning login без serial gate | ✅ CW05-5 |
| First registration success → URL без serial → `/home` | ✅ CW05-4 |
| `registrationHint=website` when `viwa_entry=website` | ✅ CW05-3 |
| Invalid serial → readable error (B-15) | ✅ UI + ValidationPage; 🟡 без component-теста |
| **Не** отправлять `registrationSource` | ✅ `authModule.test.ts` |
| `npm run lint` | 🔴 **7 parsing errors** (test files excluded from tsconfig) |
| `npm test` CW05 suites | ✅ 14/14 PASS (task-05); 18/18 full suite |
| `npm run build` | ✅ exit 0 from `wiva-client-web-app` path |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ⚠️ 0 🔴 + 11 🟡 | — |
| review-renderer-structure | 🔴 2 + 12 🟡 | — |
| review-styles | ✅ 0 🔴 + 5 🟡 | — |
| review-performance | 🔴 1 + 8 🟡 | — |
| review-final | 🔴 lint blocker + 🟡 gaps | — |

---

## Ревью: Общее архитектурное

> Источник: [review-general](fa068faf-bfb1-451d-8596-f76fa2a52245)

### Суммаризация

**Что решали:** Маршрутизация первичной регистрации (с/без serial), returning login без serial, landing attribution (`entry` → `viwa_entry` → `registrationHint`), post-reg strip serial (`/home`), guards, serial validation через public API.

**Как работает:** `/register` → persist session → skip-capture или `SerialCapturePage` → `/m/{serial}/auth` → OTP → check-code с hint → `/home`. Returning: `/auth*` без machineSerial. 401: refresh → `clearTokens` → `redirectToClientAuth()`.

**Валидация логики:** ✅ Согласовано с architecture v1.2 §0/§3, Flow A/B/C. ⚠️ Edge cases 401+skipAuth, returning hint, sessionStorage spoofing — частично без тестов.

### Проблемы

🟡 **401 + skipAuth:** [`axiosCore.ts:83-87`] Второй блок `if (status === 401)` без проверки `skipAuth` — public lookup 401 при stale tokens может clear storage и redirect, прервав регистрацию.

🟡 **Legacy redirect:** [`helpers.ts:71-79`] На `/m/:serial/home` 401 → machine-gated `/m/{serial}/auth`, не returning `/auth`.

🟡 **Hint в returning flow:** [`thunk.ts:18-22`] `getStoredRegistrationHint()` всегда; при persisted `viwa_entry=website` returning check-code может отправить hint без `machineSerial` — backend должен игнорировать для existing.

🟡 **sessionStorage spoofing:** `viwa_entry=website` подменяем через DevTools — MVP-risk; mitigation server-side origin allowlist (architecture § Risks).

🟡 **`machine_qr` hint:** Клиент никогда не шлёт `machine_qr`; QR-flow без `entry=website` — server derivation only.

🟡 **Skip-capture без API:** [`RegisterPage.tsx:37-38`] Редирект по формату; API lookup только в `ValidationPage` — лишний loader hop для invalid-but-format-valid serial из query.

🟡 **Stale `viwa_serial`:** `/register?entry=website` без query serial может auto-skip на stored serial.

🟡 **Двойная post-auth navigation:** `replaceBrowserUrl` в thunk + `navigate` в `SmsPage`.

🟡 **Тройная auth-проверка на `/home`:** `HomeAuthGuard`, `SubscriptionPage`, 401 interceptor.

🟡 **Нет тестов `redirectToClientAuth`:** В отличие от `helpers.routing.test.ts`.

🟡 **CW05-2 / returning thunk:** Слабое покрытие component и returning path.

### Вывод

⚠️ **0 🔴 + 11 🟡.** Ядро task-05 соответствует architecture v1.2.

---

## Ревью: Структура компонентов

> Источник: [review-renderer-structure](432dceb8-9897-4624-ba78-5635c4932684)

### Проблемы

🔴 **Authed entry → serial-scoped home:** [`ValidationPage.tsx:43-44`] Entry-point `/m/:machineSerial/` редиректит на относительный `home` → `/m/{serial}/home`, а не канонический `/home`. Расхождение с architecture v1.2 (post-auth clean URL без serial).

🔴 **Auth helpers в ValidationPage:** [`helpers.ts`] `hasAuthTokens`, `redirectToClientAuth` импортируются guards и `SubscriptionPage` — инверсия ответственности, риск циклических зависимостей.

🟡 Дублирование home: `/home` + `/m/:machineSerial/home` (`App.tsx:45-57`).

🟡 Асимметрия guards: returning обёрнуты, serial-ветка — логика в `ValidationPage`.

🟡 Guards как `pages/*` вместо `components/guards/`.

🟡 Inline prop types без `types.ts` в guards.

🟡 Двойной post-OTP navigation (thunk + SmsPage).

🟡 `SerialCapturePage` sibling вместо nested под `RegisterPage`.

🟡 `RegisterPage` — landing logic в теле, не в `hooks/`.

🟡 `useMachineSerialValidation` не в `hooks/`.

🟡 `useValidatedBaseParams.ts` — мёртвый код (не импортируется).

🟡 `validAddress` prop drilling — константа в `App.tsx`.

🟡 `SubscriptionPage` третий auth-check.

🟡 `ValidationRoute` vs `ValidationPage` naming.

### Вывод

⚠️ **2 🔴 + 12 🟡.**

---

## Ревью: Стили

> Источник: [review-styles](e05487ec-77f9-4c7e-ba78-4ed952cf75f0)

### Проблемы

🟡 [`SerialCapturePage.module.scss:9`] `gap: 16px` вместо `var(--space-m)`.

🟡 `.form` дублирует `VerticalContainer` — можно заменить на `VerticalContainer space="m"`.

🟡 `max-width: 420px` — единственное в pages; опционально SCSS-константа.

🟡 Нет группировки свойств SCSS (minor для minimal scope).

🟡 JSX ~40 строк без render-методов (borderline vs AuthPage pattern).

### Вывод

✅ **0 🔴 + 5 🟡.** Для task-05 minimal styling достаточно.

---

## Ревью: Производительность

> Источник: [review-performance](0497d3ce-0d4a-4857-aa58-195b60845d08)

### Проблемы

🔴 **Двойной public API lookup:** [`SerialCapturePage.tsx:32`] → navigate → [`useMachineSerialValidation.ts:33-34`] — два последовательных `fetchMachineBySerial` на Flow B (ручной ввод). Skip-capture path **не** дублирует.

🟡 `sessionStorage` read в render-path `RegisterPage` (`resolveRegisterSerial`).

🟡 `hasAuthTokens()` — 3× localStorage на re-render guards.

🟡 Лишний Loader flash на skip-capture (`isReady` + useEffect).

🟡 In-flight HTTP не abort при unmount validation hook.

🟡 Нет cache/dedup lookup между SerialCapture и ValidationPage.

🟡 Eager imports в `App.tsx` — нет lazy routes.

🟡 `vitest pool: 'forks'` — slower CI/dev on Windows.

🟡 Множественный `redirectToClientAuth()` на parallel 401 — idempotent hard reload.

### Вывод

⚠️ **1 🔴 + 8 🟡.**

---

## Финальное ревью

> Источник: [review-final](99467ae8-01d5-4365-99e6-c65d43996f56) + синтез child reviewers

### Spoof-proof / serial / auth / navigation / infra

| Check | Verdict |
|-------|---------|
| `registrationHint` in body; not `registrationSource` | ✅ |
| `viwa_entry`/`viwa_serial` sessionStorage canon §0 | ✅ |
| Post-reg `/home` strip serial + clear `viwa_serial` | ✅ |
| Returning `/auth` without serial gate | ✅ CW05-5 |
| Flow A skip-capture `/register?serial&entry` | ✅ код |
| Flow B SerialCapture + validation | ✅; 🔴 double API |
| Invalid serial readable (B-15) | ✅ UI |
| 401 refresh dedup + new routes | ✅ dedup; 🟡 hard reload |
| Guards no infinite loop (stale tokens cleared) | ✅ |
| Authed `/m/:serial/` → `/m/:serial/home` not `/home` | 🔴 vs v1.2 |
| ESLint 0 errors | 🔴 7 parsing errors on test files |
| Vitest 3.2.4 + tsconfig test exclude | ✅ tests PASS; 🔴 lint break |
| Scope creep | 🟡 minimal SubscriptionPage + litersFieldToMl |

### Verification (re-checked)

```text
npm run lint  → exit 1 (7 errors: test files not in tsconfig project)
npm test      → 18/18 PASS
npm run build → exit 0 (wiva-client-web-app path)
```

Test-report claim «lint exit 0» — **устарел** относительно текущего diff.

### Итог

⚠️ **Круг 2 developer-complex обязателен:**

1. **🔴 ESLint:** `tsconfig.json` exclude `*.test.ts` / `src/test/**` без sync ESLint (`tsconfig.eslint.json` или override) — 7 parsing errors, блокер push.
2. **🔴 ValidationPage entry redirect:** authed user на `/m/:serial/` → `/home` (absolute), не relative `home`.
3. **🔴 Double API lookup:** SerialCapture success → skip re-fetch в ValidationPage (cache flag / route state / shared hook).
4. **🟡** 401 interceptor respect `skipAuth`; returning thunk без hint; component tests CW05-2/skip-capture; extract auth helpers из ValidationPage; lint test-report sync.

Domain routing/hint logic **соответствует** architecture v1.2 и acceptance CW05-1…5 в коде. Critical defects — infra lint + route canonicalization + redundant API.

**hasCriticalIssues: true**

---

## Рекомендации developer-complex (круг 2)

1. **Обязательно:** ESLint project includes test files (`tsconfig.eslint.json` include tests + `browserMocks`, или eslint ignore pattern согласованный с build exclude).
2. **Обязательно:** [`ValidationPage.tsx:44`] authed entry redirect → `/home` (или `Navigate to="/home"`).
3. **Обязательно:** убрать double `fetchMachineBySerial` SerialCapture → ValidationPage (session flag, location state, или conditional skip in hook).
4. **Желательно:** 401 handler не clear/redirect для `skipAuth` public requests.
5. **Желательно:** `checkCodeAndCreateClientThunk` — omit `registrationHint` when `!machineSerial` (returning).
6. **Желательно:** component/integration tests RegisterPage redirect, SerialCapturePage submit/errors, `redirectToClientAuth` matrix.
7. **Желательно:** move auth routing helpers из `ValidationPage/helpers.ts` → `utils/` или `routing/`.
8. **Не смешивать:** SubscriptionPage concept-16 UI (task-06); live API gate (task-09).

---

## [code-review] task-05 — круг 2 — 2026-07-29

**Scope:** повторная проверка 3 🔴 blockers круга 1 (lint parsing, authed entry `/home`, validation cache dedup)  
**Baseline:** developer-complex круг 2 (`tsconfig.eslint.json`, `getMachineEntryRedirectPath`, `machineSerialValidationCache.ts`)  
**Test report:** [task-05-test-report.md](./task-05-test-report.md) (round 2)

### Blocker closure matrix

| # | Blocker (круг 1) | Fix in tree | Re-check | Verdict |
|---|------------------|-------------|----------|---------|
| 1 | ESLint 7 parsing errors on test files | `tsconfig.eslint.json` extends `tsconfig.json`, `exclude: []`, `vitest/globals`; `.eslintrc` → `project: tsconfig.eslint.json` | `npm run lint` → exit **0** (0 errors, 23 pre-existing warnings) | ✅ **closed** |
| 2 | Authed `/m/:serial/` → relative `home` = `/m/:serial/home` | `getMachineEntryRedirectPath(authed)` → `POST_AUTH_HOME_PATH` (`/home`); [`ValidationPage.tsx:43-44`] | Unit: `helpers.routing.test.ts` R2-1 | ✅ **closed** |
| 3 | Double `fetchMachineBySerial` SerialCapture → ValidationPage | `markMachineSerialValidated` after SerialCapture success; `consumeMachineSerialValidated` in hook — one-shot, serial-exact match | `machineSerialValidationCache.test.ts`, `useMachineSerialValidation.test.tsx` (API not called when pre-validated) | ✅ **closed** |

### Blocker #1 — ESLint / tsconfig

- `tsconfig.json` по-прежнему исключает `*.test.{ts,tsx}` и `src/test/**` из `tsc -b` (build typecheck) — корректно.
- `tsconfig.eslint.json` включает весь `src` + test infra с `vitest/globals` — type-aware ESLint видит все новые test files.
- Парсинг-errors на `landingEntry.test.ts`, `authModule.test.ts`, `thunk.test.ts`, `browserMocks.ts`, `SerialCapturePage.test.ts`, `helpers.routing.test.ts`, `useMachineSerialValidation.test.tsx` — **устранены**.

### Blocker #2 — Authed machine entry → clean `/home`

```61:62:src/pages/ValidationPage/helpers.ts
export const getMachineEntryRedirectPath = (authed: boolean): string =>
  authed ? POST_AUTH_HOME_PATH : 'auth';
```

```43:44:src/pages/ValidationPage/ValidationPage.tsx
  if (isEntryPoint(location.pathname, validAddress)) {
    return <Navigate to={getMachineEntryRedirectPath(authed)} replace />;
```

- Authed user на entry `/m/VIWA-XXX/` → absolute `/home`, не `/m/VIWA-XXX/home`. Согласовано с architecture v1.2 §331 (clean post-auth URL).
- Legacy nested route `/m/:machineSerial/home` в `App.tsx` сохранён для bookmarks — 🟡 некритично (task-06 downstream).

### Blocker #3 — Validation cache / dedup / security

**Механизм:** `src/utils/machineSerialValidationCache.ts`

- `markMachineSerialValidated(serial)` — после успешного public lookup в `SerialCapturePage.tsx:33-35`.
- `consumeMachineSerialValidated(serial)` — в `useMachineSerialValidation.ts:31-34`; возвращает `true` только при **точном** совпадении serial; **удаляет** flag (one-shot).

**Stale / security:**

| Сценарий | Поведение | Риск |
|----------|-----------|------|
| Flow B SerialCapture → `/m/{serial}/auth` | Один API call; hook consume → skip второй | ✅ dedup |
| Refresh на `/m/{serial}/auth` после consume | Flag снят → live lookup | ✅ no stale skip |
| Direct URL `/m/{serial}/auth` без SerialCapture | Flag отсутствует → live lookup | ✅ |
| Flag для serial A, URL serial B | `consume` → false; flag A сохранён | ✅ no cross-serial bypass |
| DevTools `sessionStorage.setItem('viwa_serial_validated', serial)` | Пропуск одного lookup; serial всё ещё в URL; OTP + check-code gate | 🟡 MVP-risk (класс sessionStorage spoof, как `viwa_entry`); не bypass auth |

**Вывод по cache:** double lookup устранён без persistent stale bypass; one-shot + serial-exact match — приемлемо для architecture v1.2 Flow B.

### Acceptance (post round 2)

| Критерий | Статус |
|----------|--------|
| CW05-1 … CW05-5 | ✅ 24/24 PASS (incl. R2-1…R2-3) |
| `npm run lint` | ✅ exit 0 |
| `npm test` | ✅ 24/24 PASS (`C:\wiva\wiva-client-web-app`) |
| `npm run build` | ✅ exit 0 |

**Env note:** `npm test` из `c:\wiva\viwa-client-web-app` может fail suite `useMachineSerialValidation.test.tsx` (path alias) — pre-existing Windows casing; canonical path `wiva-client-web-app`.

### Оставшиеся 🟡 (не blockers, из круга 1)

- 401 interceptor без `skipAuth` guard на public requests
- `registrationHint` в returning check-code при persisted `viwa_entry`
- Auth helpers в `ValidationPage/helpers.ts` (coupling)
- Слабый component-тест SerialCapturePage submit/UI
- `machine_qr` hint never sent client-side
- Vitest 3.2.4 major bump + `pool: forks`

### Verification (re-checked this review)

```text
npm run lint  → exit 0 (0 errors, 23 warnings)
npm test      → 24/24 PASS (wiva-client-web-app path)
npm run build → exit 0
```

### Итог круга 2

✅ **Все 3 🔴 blockers закрыты.** Task-05 routing/hint/serial logic + infra готовы к merge с awareness 🟡; formal close — task-06 parallel OK, live API gate — task-09.

**hasCriticalIssues: false**

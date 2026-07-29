# task-05-test-report

**Task:** Client serial/no-serial routing + auth attribution  
**Repo:** `viwa-client-web-app`  
**Date:** 2026-07-29  
**Round:** 2 (review blockers)

## Scope delivered (round 1 + 2)

- Routes: `/register`, `/auth`, `/auth/sms/:time/:phone`, `/home`, preserved `/m/:machineSerial/*`
- `RegisterPage` — parses `entry`/`serial`, persists session, skip-capture redirect or SerialCapture
- `SerialCapturePage` — manual serial + public API validation + readable errors (B-15)
- `landingEntry.ts` — `viwa_entry` / `viwa_serial` sessionStorage, `registrationHint` resolution
- `machineSerialValidationCache.ts` — one-shot pre-validation flag (SerialCapture → ValidationPage dedup)
- `authModule` — body `registrationHint` (never `registrationSource`)
- `checkCodeAndCreateClientThunk` — hint from session; post-success URL strip → `/home`
- `ReturningAuthGuard` / `HomeAuthGuard` — returning `/auth` without serial gate; token auto-skip to `/home`
- `getMachineEntryRedirectPath` — authed `/m/:serial/` entry → canonical `/home`
- `redirectToClientAuth` — 401 → `/auth` when no serial segment in URL

## Round 2 fixes (task-05-review blockers)

| Blocker | Fix |
|---------|-----|
| ESLint 7 parsing errors (tests excluded from tsconfig) | `tsconfig.eslint.json` includes tests + `vitest/globals`; `.eslintrc` → `project: tsconfig.eslint.json` |
| Authed `/m/:serial/` → `/m/:serial/home` | `ValidationPage` uses `getMachineEntryRedirectPath(authed)` → `/home` |
| Double `fetchMachineBySerial` Flow B | `markMachineSerialValidated` after SerialCapture success; `consumeMachineSerialValidated` in hook skips redundant fetch |

## Test matrix (CW05-1 … CW05-5 + round 2)

| ID | Scenario | File | Result |
|----|----------|------|--------|
| CW05-1 | `landingEntry` parses `entry=website` + stores session | `landingEntry.test.ts` | **PASS** |
| CW05-2 | Serial capture validates via public API mock | `SerialCapturePage.test.ts` | **PASS** |
| CW05-3 | Auth module/thunk includes `registrationHint` when entry=website | `authModule.test.ts`, `thunk.test.ts` | **PASS** |
| CW05-4 | Post-reg navigation strips serial from URL | `thunk.test.ts` | **PASS** |
| CW05-5 | Returning `/auth` does not require machineSerial | `helpers.routing.test.ts` | **PASS** |
| R2-1 | Authed machine entry → `/home` | `helpers.routing.test.ts` | **PASS** |
| R2-2 | Pre-validation cache mark/consume | `machineSerialValidationCache.test.ts` | **PASS** |
| R2-3 | Hook skips API when pre-validated; fetches otherwise | `useMachineSerialValidation.test.tsx` | **PASS** |
| — | Regression `litersFieldToMl` | `litersFieldToMl.test.ts` | **PASS** (4) |

## Verification commands (re-checked 2026-07-29 round 2 — final)

```powershell
cd C:\wiva\wiva-client-web-app
npm run lint          # exit 0 (23 pre-existing warnings, 0 errors)
npm test              # 24/24 PASS
npm run build         # exit 0
```

## Infra notes (non-blocking)

- Vitest `3.2.4` + `globals: true` — required on Node 22
- `tsconfig.json` excludes `*.test.{ts,tsx}` from `tsc -b`; `tsconfig.eslint.json` for ESLint type-aware lint
- `jsdom@26` devDep for hook test (`useMachineSerialValidation.test.tsx`)
- Build from git root path `C:\wiva\wiva-client-web-app` (Windows casing alias)

## Not in scope (by plan)

- SubscriptionPage concept-16 UI redesign (task-06)
- Live API wire-up beyond existing modules (task-09)
- 401 skipAuth, returning hint omission, auth helpers extraction (🟡 from review)
- Docker, commit/push

## Git baseline preserved

- Untracked session docs (`docs/agents/viwa-landing-subscriptions/**`) not reverted
- Branch `dev`; no commit

# task-10: Browser gate B-1…B-18 + full build gates

**Зависимости:** task-09

**UC:** B-1…B-18 (browser), quality gates

**Repo:** все три  
**Branch target:** `main` + `dev` + `master`

## Роль task-10

**Formal browser gate** для всей сессии. Блокирует task-11 и `/task-completion` deploy до pass (или documented skip with reason). **Owner mobile landing verification** — landing scenarios B-1…B-8 на **всех** canonical mobile viewports.

## Описание

1. Execute browser smoke per `viwa-client-web-app/TEMP_TEST_SCENARIOS.md` (B-1…B-18).
2. **Mobile landing parity gate:** B-1, B-2, B-3, B-4, B-5, B-7 must pass on **`360×800`, `390×844`, `430×932`** — not desktop-only.
3. Desktop landing: B-1…B-8 at **`1440×900`**.
4. Lint/build/test all repos; mark pass/skip/fail in scenarios file.
5. **Не commit/push/deploy** — `/task-completion` after this gate + user-authorized production deploy.

## Canonical viewports

| Surface | Viewports |
|---------|-----------|
| Landing (viwa-site) | `1440×900` (desktop); **`360×800`, `390×844`, `430×932`** (mobile — all required) |
| Client cabinet | `390×844` primary; `360×800`, `430×932` spot-check for B-9…B-15 |
| Keyboard/a11y | B-6: `1280×800`; B-7/B-8: any |

## Allowed scope

- Bugfixes discovered during browser testing (minimal)
- `TEMP_TEST_SCENARIOS.md` — update pass/fail/skip per scenario **per viewport**
- `docs/agents/viwa-landing-subscriptions/` — test report optional
- **Не** production deploy; **не** `/ci-cd-status` unless user separately requests

## Запрет Docker

Не изменять Docker/compose файлы.

## Точные touchpoints

| Artifact | Действие |
|----------|----------|
| `viwa-client-web-app/TEMP_TEST_SCENARIOS.md` | Mark B-1…B-18 pass/skip/fail; log viewport per landing scenario |
| All repos | lint + build + test per AGENTS.md |
| Browser | `/browser-test-orchestrator` skill or manual per scenarios |

## Acceptance (browser gate)

- [ ] B-1…B-18 executed; failures fixed or documented with reason
- [ ] **Mobile landing parity:** B-1, B-2, B-3, B-4, B-5 pass on **360×800, 390×844, 430×932** each
- [ ] Desktop landing B-1 split at `1440×900`
- [ ] B-5 serial-less CTA on all three mobile widths
- [ ] B-3 live tier prices + error/retry on mobile widths
- [ ] `viwa-telemetry`: lint, typecheck, test, build — exit 0
- [ ] `viwa-client-web-app`: lint, test, build — exit 0; locale verify if strings changed
- [ ] `viwa-site`: static validation; preview OK
- [ ] No regressions in existing `/m/:machineSerial/*` flows for returning users
- [ ] Cross-surface B-17 (admin WEBSITE attribution) verified on staging

## Tests / build

```powershell
cd c:\wiva\viwa-telemetry
npm run lint
npm run typecheck
npm test
npm run build

cd c:\wiva\viwa-client-web-app
npm run lint
npm run locale:verify
npm test
npm run build

cd c:\wiva\viwa-site
python -m http.server 8080
# Browser: TEMP_TEST_SCENARIOS.md — all viewports
```

## Downstream

- **task-11** — deploy runbook readiness (gates only)
- **`/task-completion`** — commit, version bump, push, **user-authorized production deploy** after this gate; CI monitoring only if separately requested

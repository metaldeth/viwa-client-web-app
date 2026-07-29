# task-09: Cross-repo integration + mobile landing polish (owner)

**Зависимости:** task-03, task-04, task-06, task-07, task-08

**UC:** UC-1…UC-7

**Repo:** `viwa-telemetry` + `viwa-client-web-app` + `viwa-site`  
**Branch target:** `main` + `dev` + `master`

## Роль task-09

**Owner mobile landing integration polish** после task-08 (assets) и Wave 1 gate: переключить site/client на live API **и** довести mobile landing до **parity gate** (не desktop-only). Formal pass/fail — **task-10 browser gate**.

## Описание

1. Live/staging telemetry API wire-up (отключить mocks).
2. End-to-end flows A/B/C/D/E/F.
3. **Mobile landing polish:** stack/reorder/hamburger layout; safe-area; responsive/lazy assets; hero/nav/tastes/tiers/CTA/cabinet preview на `360×800`, `390×844`, `430×932`.
4. Убедиться что mobile **не** является только scaled-down desktop split.

**Не deploy** — только local/staging integration.

## Allowed scope

- `viwa-client-web-app`: env examples, remove mock flags, `VITE_VIWA_TELEMETRY_API_URL` staging/prod
- `viwa-site`: `js/config.js`, `landing-api.js` — live API base; **mobile CSS/layout polish** in `css/viwa-landing.css` (safe-area, responsive images, hamburger/stack)
- `viwa-telemetry`: только bugfixes integration blockers discovered in E2E
- Session docs update if needed
- **Не** revert analytics uncommitted work

## Запрет Docker

Не изменять Docker/compose файлы.

## Точные touchpoints

| Repo | Файл | Изменение |
|------|------|-----------|
| client | `.env.staging.example` or docs | `VITE_VIWA_TELEMETRY_API_URL=https://tl.vitamin-water.ru/api/v1` |
| client | `src/app/api/modules/*` | Remove mock adapters; real fetch |
| site | `js/config.js` | `API_BASE=https://tl.vitamin-water.ru/api/v1`; `useMockApi: false` |
| site | `js/landing-api.js` | Disable mock mode; live tiers/tastes |
| site | `css/viwa-landing.css` | Mobile parity: safe-area, touch ≥44px, responsive flavor/tier grids, no horizontal scroll |
| site | `index.html` | Mobile nav hamburger/stack if needed; cabinet preview/deep-link block |
| telemetry | minimal fixes | CORS/integration bugs only |

## Mobile landing parity gate (task-09 acceptance)

На каждом viewport **`360×800`, `390×844`, `430×932`**:

- [ ] Full hero + nav (hamburger/stack OK) + footer
- [ ] **14** tastes visible with RU labels; responsive/lazy assets
- [ ] **2** live tariff cards from public API; skeleton/error/retry
- [ ] Registration/auth CTA → cabinet with `entry=website`
- [ ] Cabinet preview block and/or «Открыть кабинет» deep-link
- [ ] Readable typography; touch targets ≥44px; safe-area respected
- [ ] No horizontal scroll; `prefers-reduced-motion` OK
- [ ] **Not** desktop split scaled down only

Desktop `1440×900` split layout remains required (B-1).

## Cross-repo acceptance

- [ ] Flow A: landing QR serial → register → OTP → `/home` serial stripped; admin shows WEBSITE
- [ ] Flow B: landing no serial → SerialCapture → registration
- [ ] Flow C: `/auth` returning login
- [ ] Flow D: landing tiers match `GET /public/subscription-levels` on all viewports
- [ ] Flow E: SBP purchase 12 L → monthly pool (staging mock SBP if configured)
- [ ] Flow F: favorite tastes persist via API
- [ ] CORS: browser fetch from site origin to staging API succeeds

## Tests / build

```powershell
# All repos green
cd c:\wiva\viwa-telemetry
npm run lint; npm run typecheck; npm test; npm run build

cd c:\wiva\viwa-client-web-app
npm run lint; npm test; npm run build

cd c:\wiva\viwa-site
python -m http.server 8080
# Manual: flows A–F + mobile parity spot-check 360/390/430 widths
```

## Downstream

- **task-10** — formal browser gate B-1…B-18 on all canonical viewports

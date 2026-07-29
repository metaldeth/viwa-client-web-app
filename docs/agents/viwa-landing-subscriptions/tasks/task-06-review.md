# task-06-review: Client concept-16 UI + monthly progress + favorites + locale

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-client-web-app` (branch `dev`, uncommitted)  
**Task:** [task-06.md](./task-06.md)  
**Architecture:** [architecture.md](../architecture.md) v1.2 (§1 public tiers/tastes, §3 monthly pool + favorites, WS profile)  
**Concept reference:** [request.md](../request.md) — concept-16 editorial fruit lab, `#7F5AF0` accent, dark base  
**Test report:** [task-06-test-report.md](./task-06-test-report.md)  
**Review agents (parallel):** `review-general`, `review-renderer-structure`, `review-styles`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)

## Изменённые / новые файлы (task-06 scope)

| Файл | Кратко |
|------|--------|
| `src/styles/viwa-tokens.css` | **NEW** — concept-16 tokens (`--viwa-accent: #7F5AF0`, dark base, touch targets) |
| `src/pages/SubscriptionPage/` | concept-16 redesign: progress ring, QR, plan cards, billing modal preserved |
| `src/components/FavoriteFlavorsSection/` | **NEW** — pick ≤3 from public catalog (14 keys), manifest-ready image paths |
| `src/components/VolumeCircle/` | monthly consumed/limit ring, center remaining ml, aria-label |
| `src/components/BottomNav/` | **NEW** MVP — home + profile active; history/settings stubs |
| `src/app/api/modules/public/publicModule.ts` | `fetchPublicTastes`, `fetchPublicSubscriptionLevels` |
| `src/app/api/modules/loyalty/loyaltyModule.ts` | `updateFavoriteTastes` PUT |
| `src/types/serverInterface/clientDTO.ts` | monthly fields + `favoriteTasteKeys` |
| `src/types/subscriptionLevel.ts`, `publicCatalog.ts` | `monthlyVolumeMl`, public DTOs |
| `src/locale/subscriptionLocale.ts` | RU subscription UI strings + formatters |
| `src/assets/locales/ru.json`, `en.json` | partial `subscription.*` keys |
| `src/utils/monthlyProgress.ts`, `favoriteTastesSelection.ts`, `viwaAssets.ts` | progress resolver, max-3 toggle, asset paths |
| `src/index.css` | import `viwa-tokens.css` |
| `public/assets/viwa/tastes/.gitkeep` | placeholder until task-08 |

**Ripple (pre-existing / task-05, not task-06 scope):** routing guards, auth thunks, `ValidationPage`, vitest infra — unchanged in this review pass.

**Не тронуто (OK):** Docker/compose; `App.tsx` routing (task-05); live API mock gate (task-09); generated taste images beyond placeholder (task-08).

---

## Acceptance task-06

| Критерий | Статус |
|----------|--------|
| Progress `monthlyUsedMl` / `monthlyLimitMl` (+ trial fallback) | ✅ `resolveMonthlyProgress` → `VolumeCircle`; ⚠️ expired-state UX — 🔴 |
| Tier prices from API, not hardcoded | ✅ `fetchSubscriptionLevels` → `priceKopecks` in cards/modal |
| Favorite flavors: max 3, canonical 14 keys | ✅ logic + UI; catalog from `fetchPublicTastes` (14 delegated to API) |
| Visual alignment concept-16 tokens (#7F5AF0, dark base) | ⚠️ tokens file OK; `index.css` body drift — 🟡 |
| Bottom nav MVP: home + profile/subscription | ✅ stubs OK; ⚠️ `<a href>` reload — 🔴 |
| Locale verify passes if strings added | 🔴 scripts absent; partial ru/en sync |
| WS + billing preserved | ✅ `useClientSubscriptionWs` + poll flow; ⚠️ GET/WS race — 🔴 |
| Routing unchanged | ✅ |
| No task-08/09 leakage | ✅ placeholders + module infra only |
| `npm run lint` | ✅ exit 0 (23 pre-existing warnings) |
| `npm test` CW06-1…4 | ✅ 32/32 PASS; CW06-3 weak (helper only) |
| `npm run build` | ✅ exit 0 |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | 🔴 1 + 9 🟡 | — |
| review-renderer-structure | 🔴 4 + 13 🟡 | — |
| review-styles | 🔴 6 + 9 🟡 | — |
| review-performance | 🔴 1 + 11 🟡 | — |
| review-docs | 🔴 6 + 12 🟡 | — |
| review-final | ✅ 0 🔴 + 7 🟡 | — |

**Синтез blockers (dedup):** 5 🔴 функциональных/a11y/acceptance; остальные findings — 🟡 backlog.

---

## Ревью: Общее архитектурное

> Источник: [review-general](c88e8663-3513-4f3c-b987-335eabfead64)

### Суммаризация

**Что решали:** Редизайн `SubscriptionPage` под concept-16: monthly progress ring, QR, favorites (≤3/14), plan cards 12/18 L с API prices, design tokens, locale RU, MVP `BottomNav`.

**Как работает:** Mount `getCurrentClientProfileAction` + `useClientSubscriptionWs` → `patchClientProfile` on `client.profile.updated`. Progress via `resolveMonthlyProgress` (trial → `volumeMl`/1000 ml; subscription → `monthlyUsedMl`/`monthlyLimitMl` with deprecated `daily*` fallback). Tiers from `fetchSubscriptionLevels`; favorites toggle → `updateFavoriteTastes` PUT → Redux patch. Assets via `getTasteImagePaths` + placeholder onError (task-08 ready).

**Валидация логики:** ✅ Core monthly/API/favorites/WS/billing aligned with architecture v1.2. 🔴 Expired subscription edge case breaks renewal UX.

### Проблемы

🔴 **Expired subscription treated as active** — [`SubscriptionPage.tsx:73`] `isActiveSubscription = Boolean(tierName && subscriptionEndsAt)` without future-date check. Expired profile hides plan cards (`:260-262`) and blocks re-subscribe while showing stale “active until {past date}`. Architecture §3: expired → `monthlyLimitMl=0`, user must see tier picker.

🟡 Hardcoded `'12–18'` L in benefits copy — [`SubscriptionPage.tsx:94`], not from API tiers.

🟡 `VolumeCircle` fallback aria + unit `"МЛ"` hardcoded RU — [`VolumeCircle.tsx:34-36`, `:75`].

🟡 `FavoriteFlavorsSection` `', выбран'` in aria-label not localized — [`FavoriteFlavorsSection.tsx:39`].

🟡 `BottomNav` hardcoded `aria-label="Основная навигация"` — [`BottomNav.tsx:47`].

🟡 Dual locale: `subscriptionLocale.ts` (43 keys) vs partial `ru.json`/`en.json` (9 keys); no `locale:verify` pipeline.

🟡 CW06-3 covers `formatPriceRub` only, not tier card render.

🟡 Catalog fetch when `disabled=true`; no retry on load error.

🟡 `getTasteImagePaths` ignores `PublicTasteItemDTO.imageUrl` until task-08.

🟡 Favorite PATCH: no optimistic update; silent no-op if `!client?.id`.

### Вывод

⚠️ **1 🔴 + 9 🟡.** Ядро task-06 выполнено; blocker — expired subscription renewal UX.

---

## Ревью: Структура компонентов

> Источник: [review-renderer-structure](77b73350-6987-4f7f-b500-3a11f613f643)

### Иерархия vs concept-16

| Блок | Реализация | Статус |
|------|-------------|--------|
| Monthly progress | `VolumeCircle` + progress card | ✅ |
| QR scan | `LoyaltyQrCode` + modal | ✅ |
| Favorites ≤3/14 | `FavoriteFlavorsSection` between progress and plan | ✅ |
| Plan cards 12/18 L | `renderPlanCards()` from API | ✅ |
| Bottom nav | `BottomNav` sticky stubs | ⚠️ |

### Проблемы

🔴 **SubscriptionPage monolith (~509 lines)** — payment state machine, tiers fetch, modals, inline `LoyaltyQrCode` in one file; no extracted hooks/subcomponents per `component-structure.mdc`.

🔴 **Progress card keyboard-inaccessible** — [`SubscriptionPage.tsx:206-210`] focusable `ContentCard` with `onClick` but no `role="button"` / `onKeyDown` (Enter/Space) — primary QR flow blocked for keyboard users (task-10 B-scenarios risk).

🔴 **VolumeCircle `role="img"`** — [`VolumeCircle.tsx:42`] should be `role="progressbar"` with `aria-valuenow/min/max` for monthly consumption semantics.

🔴 **BottomNav SPA reload** — [`BottomNav.tsx:73-76`] native `<a href="/home">` causes full document reload instead of React Router `Link`.

🟡 No `<main>` landmark; brand as `<p>` not `<h1>`; duplicate `AppHeader` + local brand header.

🟡 `LottieQrCode` duplicated vs inline QR in payment modal.

🟡 `TasteTile` inline; catalog fetch mixed with presentation.

🟡 No `aria-live` for favorite save status.

🟡 No “N/3 selected” counter.

🟡 `home` and `profile` both `href: '/home'` — dual `aria-current="page"`.

🟡 `BottomNav` only on SubscriptionPage, not app shell.

### Вывод

⚠️ **4 🔴 + 13 🟡.** Hierarchy matches concept-16; a11y/navigation blockers for keyboard and SPA nav.

---

## Ревью: Стили

> Источник: [review-styles](d34e4930-ce0a-49d9-856f-dd59f67a4511)

### Плюсы

`viwa-tokens.css` defines concept-16 accent/dark/touch; touch targets ≥44px on interactive elements; B-7 reduced-motion blocks present; no prices in CSS; `.tastePlaceholder` fallback OK.

### Проблемы

🔴 **`index.css` body hardcodes colors** — [`index.css:17-18`] `#0a0a0f` / `#f0f0ff` instead of `var(--viwa-bg)` / `var(--viwa-text)` — drift from `#0A0A0A` / `#F5F5F5`.

🔴 **Systematic `var(--viwa-*, #fallback)`** across module SCSS — violates `css-organization.mdc`; tokens not single source of truth.

🔴 **Hardcoded accent colors outside tokens** — gradients `rgba(127,90,240,…)`, `#1a1030 → #2a1550`, `#ffffff` in `.qrWhitePad`.

🔴 **VolumeCircle inline dimensions** — [`VolumeCircle.tsx:41`] `style={{ width, height }}` should live in SCSS.

🟡 `--viwa-motion-duration` declared but transitions use literal `0.15s`/`0.3s`.

🟡 `.progressRow` flex-wrap without explicit mobile stack breakpoint.

🟡 B-8 risk: `9px` stubBadge, `11px` tasteName on dark bg.

🟡 Typography not tokenized; duplicated accent gradient; token drift vs `viwa-site`.

### Вывод

⚠️ **4 🔴 (synthesized from 6) + 9 🟡.** Token file OK; global `index.css` and SCSS fallback pattern main gaps.

---

## Ревью: Производительность

> Источник: [review-performance](531bb04d-e7fa-4101-8316-e973caf69ecb)

### Проблемы

🔴 **GET vs WS/PATCH race** — [`slice.ts:114`] `getCurrentClientProfileThunk.fulfilled` **full-replaces** `clientProfile.state`; WS and PATCH use **merge** via `patchClientProfile`. Stale/slow GET after WS update or favorite PATCH can overwrite fresher `favoriteTasteKeys`, `monthlyUsedMl`, `tierName` — UI regression without re-fetch.

🟡 `TasteTile` without `memo`; unstable `onToggle` callbacks → 14-tile re-render on any profile change.

🟡 Pre-task-08: `picture` webp→png → up to 28 failed requests + per-tile `onError` setState.

🟡 `favoriteTasteKeys ?? []` new array each render when profile null.

🟡 `useAppSelector(selectClientProfile())` creates new selector fn each render.

🟡 WS profile updates re-render full page including multiple `QRCodeSVG`.

🟡 No fetch dedup/cache on remount; parallel mount OK but repeats 3 calls.

🟡 Billing poll + favorites PATCH uncoordinated during 120s+ payment flow.

### Вывод

⚠️ **1 🔴 + 11 🟡.** Parallel fetches and billing poll (no per-tick setState) — good; data race is primary blocker.

---

## Ревью: Документация и locale

> Источник: [review-docs](41f04ae3-73d0-4bfa-9cab-2e023c9cf980)

### Проблемы

🔴 **Locale verify acceptance not met** — task-06.md requires `locale:sync/sort/verify`; **not in `package.json`**; test-report documents skip. Acceptance item **open**.

🔴 **RU/EN parity broken** — `subscriptionLocale.ts` 43 keys; `ru.json`/`en.json` only 9 `subscription.*` keys; comment “Synced to ru.json” misleading.

🔴 **EN runtime not wired** — `tSubscription()` reads RU-only TS object; `en.json` decorative for SubscriptionPage.

🔴 **Missing JSDoc** on `resolveMonthlyProgress`, `isTrialProfile`, exported components (`FavoriteFlavorsSection`, `VolumeCircle`, `BottomNav`), `tSubscription`/`formatPriceRub`.

🟡 `loyaltyModule` PUT vs task-06 touchpoint “PATCH” — matches architecture v1.2 §2 (doc drift in task-06.md only).

🟡 `viwaAssets` paths OK for task-08; manifest id `taste-{mediaKey}` from §7 not documented.

🟡 Hardcoded RU in aria-labels bypassing locale layer.

### Вывод

⚠️ **4 🔴 (synthesized from 6) + 12 🟡.** Monthly/favorites types align with v1.2 §3; locale pipeline is acceptance blocker.

---

## Ревью: Финальное

> Источник: [review-final](66e6d5d3-451b-432d-a145-c8a7c5f88f85)

### Verification (re-checked)

```text
npm run lint  → exit 0 (0 errors, 23 warnings)
npm test      → 32/32 PASS (C:\wiva\wiva-client-web-app)
npm run build → exit 0
```

Note: tests from `viwa-client-web-app` path may fail path-alias resolution — Windows cutover artifact.

### Acceptance gaps (final)

- Locale verify scripts absent — acceptance unverifiable
- CW06-3 tests helper not UI tier cards
- Canonical 14 not asserted client-side (API-trusted)
- Partial ru/en sync vs full `subscriptionLocale` catalog

### Итог final agent

Functional acceptance **mostly closed**; quality gaps before task-09 wire-up. Final agent rated 0 🔴; synthesized review elevates functional/a11y/acceptance blockers above polish-only findings.

---

## Consolidated blockers (круг 1)

### Blocker #1 — Expired subscription hides renewal

```73:73:src/pages/SubscriptionPage/SubscriptionPage.tsx
  const isActiveSubscription = Boolean(client?.tierName && client?.subscriptionEndsAt);
```

```260:262:src/pages/SubscriptionPage/SubscriptionPage.tsx
    if (isActiveSubscription) {
      return null;
    }
```

- Need `subscriptionEndsAt > now` and/or `monthlyLimitMl > 0` per architecture §3 expired semantics.

### Blocker #2 — GET profile full-replace races WS/PATCH

```114:114:src/state/loyalty/slice.ts
      state.clientProfile.state = action.payload;
```

- Merge GET with existing state (like `patchClientProfile`) or ignore stale GET when WS timestamp/version newer.

### Blocker #3 — Locale verify acceptance open

- task-06 acceptance: “Locale verify passes if strings added”
- `locale:sync|sort|verify` not in project; 34/43 keys missing from JSON; EN not runtime-wired.

### Blocker #4 — Keyboard + progressbar a11y

- Progress card: focusable without keyboard activation.
- `VolumeCircle`: `role="img"` instead of `progressbar`.

### Blocker #5 — BottomNav full page reload

- Replace `<a href>` with React Router `Link`/`NavLink` for SPA navigation.

---

## Scope boundaries (task-08 / task-09)

| Check | Verdict |
|-------|---------|
| Generated images in `public/assets/viwa/tastes/` | ✅ `.gitkeep` only; placeholder onError |
| Manifest wiring / `imageUrl` from API | ✅ deferred task-08 |
| Live API mock gate / env switch | ✅ no task-09 leakage |
| `fetchPublicSubscriptionLevels` unused in UI | ✅ infra OK for task-09 |
| Routing / auth changes | ✅ task-05 preserved |
| Docker | ✅ untouched |

---

## Рекомендуемый круг 2 (developer-complex)

1. Fix `isActiveSubscription` + expired UI (show plan picker, correct status copy).
2. Merge strategy for `getCurrentClientProfileThunk.fulfilled` vs WS/PATCH.
3. Locale: either wire `subscriptionLocale` into i18next + sync JSON, or add locale scripts + full key parity; satisfy acceptance or amend task doc with explicit MVP waiver.
4. a11y: progress card keyboard, `VolumeCircle` progressbar, BottomNav `Link`.
5. Optional 🟡: extract SubscriptionPage hooks, memo TasteTile, token cleanup in SCSS.

---

## Итог

🔴 **hasCriticalIssues: true** — 5 consolidated blockers (expired renewal UX, GET/WS data race, locale acceptance, keyboard/progressbar a11y, BottomNav SPA reload). Concept-16 UI, monthly progress semantics, API prices, favorites max-3, WS/billing preservation, and task-08/09 scope boundaries are **substantially correct** for Wave 1 mock baseline; developer-complex круг 2 recommended before merge to `dev` and parallel task-08/09.

**Verification:** lint ✅; test 32/32 ✅; build ✅ (`wiva-client-web-app` path).

---

## [code-review] task-06 — круг 2 — 2026-07-29

**Scope:** re-review 5 🔴 blockers from круг 1 after developer-complex round 2  
**Baseline:** [task-06-test-report.md](./task-06-test-report.md) round 2, architecture v1.2 §3

### Blocker closure

| # | Blocker (круг 1) | Fix verified | Статус |
|---|------------------|--------------|--------|
| 1 | Expired subscription hides renewal | `subscriptionStatus.ts` — `isSubscriptionEndDateActive`, `isActiveSubscriptionProfile` (future date + `monthlyLimitMl > 0`), `shouldShowRenewalPlans` → `renderPlanCards`; `progressExpired` copy; R2-1 test | ✅ **closed** |
| 2 | GET full-replace races WS/PATCH | `mergeClientProfileFromServer` + `localRevision`/`pendingFetchRevision`; GET pending captures revision; fulfilled preserves volatile fields when patch during flight; R2-2 `slice.profileRace.test.ts` | ✅ **closed** |
| 3 | Locale verify acceptance | 47 `subscription.*` keys in `ru.json`/`en.json`; `tSubscription` reads JSON catalogs + `setSubscriptionLocale('en')`; `scripts/locale-verify-subscription.mjs`; npm `locale:verify/sync/sort`; R2-3 test | ✅ **closed** |
| 4 | Keyboard + progressbar a11y | Progress card → native `<button type="button">` with `scanOpenHint` aria-label; `VolumeCircle` → `role="progressbar"` + `aria-valuenow/min/max`; CW06-1 updated | ✅ **closed** |
| 5 | BottomNav full reload | `<a href>` → React Router `NavLink`; `navAriaLabel` localized; R2-5 test | ✅ **closed** |

### Blocker #1 — Expired renewal visibility (closed)

```23:36:src/utils/subscriptionStatus.ts
export function isActiveSubscriptionProfile(
  profile: SubscriptionStatusInput | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  // ...
  if (!isSubscriptionEndDateActive(profile.subscriptionEndsAt, nowMs)) {
    return false;
  }
  const limitMl = profile.monthlyLimitMl ?? profile.dailyLimitMl ?? 0;
  return limitMl > 0;
}
```

```268:271:src/pages/SubscriptionPage/SubscriptionPage.tsx
  const renderPlanCards = () => {
    if (!showRenewalPlans) {
      return null;
    }
```

- Expired profile: `isExpiredSubscription` → `progressExpired`; plan cards visible via `shouldShowRenewalPlans` (inverse of active-only).

### Blocker #2 — GET/WS/PATCH merge (closed)

```112:134:src/state/loyalty/slice.ts
    builder.addCase(getCurrentClientProfileThunk.pending, (state) => {
      state.clientProfile.pendingFetchRevision = state.clientProfile.localRevision;
      // ...
    });
    builder.addCase(getCurrentClientProfileThunk.fulfilled, (state, action) => {
      const preserveVolatile =
        state.clientProfile.pendingFetchRevision !== null &&
        state.clientProfile.localRevision > state.clientProfile.pendingFetchRevision;
      state.clientProfile.state = mergeClientProfileFromServer(
        state.clientProfile.state,
        action.payload,
        { preserveVolatileFromCurrent: preserveVolatile },
      );
```

- Stale GET after in-flight WS/PATCH retains `favoriteTasteKeys`, `monthlyUsedMl` — asserted in `slice.profileRace.test.ts`.

### Blocker #3 — Locale verify 47 keys (closed)

```112:112:scripts/locale-verify-subscription.mjs
console.log(`locale:verify OK — ${REQUIRED_KEYS.length} subscription keys in ru/en parity`);
```

- `REQUIRED_KEYS.length === 47`; `subscriptionLocale.ts` extracts catalogs from JSON; EN runtime via `setSubscriptionLocale('en')`.

### Blocker #4 — Progress keyboard + progressbar (closed)

```214:220:src/pages/SubscriptionPage/SubscriptionPage.tsx
  const renderProgressCard = () => (
    <button
      type="button"
      className={styles.progressCard}
      onClick={() => setIsScanModalOpen(true)}
      aria-label={tSubscription('scanOpenHint')}
```

```48:48:src/components/VolumeCircle/VolumeCircle.tsx
      role="progressbar"
```

- Native `<button>` — Enter/Space without custom handlers; progressbar semantics with valuenow/min/max.

### Blocker #5 — BottomNav NavLink (closed)

```49:56:src/components/BottomNav/BottomNav.tsx
              <NavLink
                to={item.to ?? '/home'}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
                aria-current={ariaCurrent}
              >
```

- Client-side SPA navigation; no full document reload.

### Acceptance (post round 2)

| Критерий | Статус |
|----------|--------|
| Progress monthlyUsedMl/monthlyLimitMl + trial | ✅ |
| Tier prices from API | ✅ |
| Favorites max 3 / 14 keys | ✅ |
| concept-16 tokens | ✅ (🟡 index.css drift — некритично) |
| Bottom nav MVP | ✅ |
| **Locale verify** | ✅ `locale:verify` exit 0 — 47 keys |
| WS + billing preserved | ✅ + merge race fixed |
| Routing unchanged | ✅ |
| No task-08/09 leakage | ✅ |
| `npm run lint` | ✅ exit 0 (0 errors, 23 warnings) |
| `npm test` | ✅ **40/40 PASS** |
| `npm run build` | ✅ exit 0 |

### Оставшиеся 🟡 (не blockers, из круга 1)

- SubscriptionPage monolith (~509 lines) — extract hooks deferred
- SCSS `var(--viwa-*, fallback)` pattern + `index.css` body color drift
- CW06-3 tests `formatPriceRub` helper, not tier card UI render
- `home` + `profile` both target `/home` (IA duplicate, MVP OK)
- Pre-task-08 image webp→png waterfall until assets land
- `locale:sync`/`locale:sort` alias same script as verify (no separate sort — acceptable MVP)

### Verification (re-checked this review)

```text
npm run lint         → exit 0 (0 errors, 23 warnings)
npm run locale:verify → exit 0 — 47 subscription keys ru/en parity
npm test             → 40/40 PASS (C:\wiva\wiva-client-web-app)
npm run build        → exit 0
```

### Итог круга 2

✅ **Все 5 🔴 blockers закрыты.** Task-06 acceptance functionally complete for Wave 1 mock baseline; merge to `dev` OK with awareness 🟡 backlog; parallel task-08 assets / task-09 staging gate — next.

**hasCriticalIssues: false**

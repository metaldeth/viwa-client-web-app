# ТЗ: лендинг VIWA + клиентский кабинет и месячная подписка

**sessionId:** `viwa-landing-subscriptions`  
**Дата:** 2026-07-29  
**Статус:** analyst v1  
**Хост артефактов:** `viwa-client-web-app/docs/agents/viwa-landing-subscriptions/`

---

## Описание задачи

### Контекст

Утверждён новый визуальный язык VIWA: editorial fruit lab — чёрно-белая база, акцентный фиолетовый (`#7F5AF0`), приглушённые вкусовые акценты, строгая типографика, split-композиция «маркетинговый сайт слева + мобильный кабинет справа». Продукт — витаминная вода из умных станций; клиентский кабинет уже существует на React/Vite с entry `/m/:machineSerial/*`, loyalty API в `viwa-telemetry`.

Маркетинговый сайт — отдельный static-репозиторий (`viwa-site`, vitamin-water.ru). Клиентский кабинет — `viwa-client-web-app` (cabinet.vitamin-water.ru). Телеметрия — единый backend loyalty, billing, products, subscription tiers.

### Цель

Deliver **одну продуктовую landing-композицию** (desktop split-view, mobile stack) с CTA в регистрацию клиента, отображением **всех вкусов** и **актуальных тарифов из телеметрии**, обновлённой **месячной моделью подписки (12 L / 18 L)**, корректной **атрибуцией регистрации с сайта**, управлением **serial в URL** и production **deploy** всех затронутых поверхностей.

### Big Rock Brief

| Поле | Значение |
|------|----------|
| **Owner** | Viwa product / orchestrator session |
| **Repos** | `viwa-site`, `viwa-client-web-app`, `viwa-telemetry` |
| **Outcome** | Пользователь видит новый VIWA-лендинг с live-ценами тарифов и переходит в регистрацию; после первой регистрации с serial URL очищается; повторный вход без serial; в dashboard телеметрии регистрации с сайта отличимы от QR автомата; подписка 12/18 L на месяц работает по всей сети; изменения задеплоены на production после verification |
| **Non-goals** | Android kiosk UI; изменение Docker-инфраструктуры без явного согласия; multi-tenant orgId; баллы/купоны; миграция исторических данных Shaker; автоматический CI/deploy без подтверждения; генерация изображений субагентами (генерацию делает parent-агент) |
| **Acceptance** | См. раздел «Критерии приёмки» |
| **Verification** | Lint/build/test по AGENTS.md каждого repo; browser smoke обязателен для UI; ручная проверка attribution в telemetry admin; deploy smoke по runbook |
| **Rollback / feature flag** | Static landing — откат предыдущей версии файлов/nginx vhost; client web — redeploy предыдущего артеfact; telemetry — Prisma migration rollback plan + откат release symlink (`/opt/viwa-telemetry/current`); при необходимости временно скрыть CTA «Регистрация» на лендинге |

### Scope по системам

| Система | Что сделать |
|---------|-------------|
| **viwa-site** | Новая (или заменяющая главную) landing-страница по референсу; секция вкусов (все 14); блок тарифов с ценами из public API телеметрии; CTA в клиентский кабинет; адаптив desktop/mobile; a11y |
| **viwa-client-web-app** | Редизайн клиентского UI под референс; маршруты входа с serial (новый клиент) и без serial (returning); strip serial из URL после первой регистрации; отображение любимых вкусов; интеграция с обновлёнными tiers; передача `registrationSource=website` |
| **viwa-telemetry** | Public API тарифов; семантика monthly 12/18 L; атрибуция регистрации с сайта; при необходимости — products/public tastes endpoint; admin analytics/filter by source; миграция данных tiers; контракты и тесты |

### Текущее состояние (as-is, подтверждено exploration)

| Область | As-is |
|---------|-------|
| Client web routes | Только `/m/:machineSerial/*`; иначе redirect на error |
| Auth check-code | Optional `machineSerial`; `registrationMachineId` выставляется **только при создании** нового Client |
| Public API | `GET /public/machines/by-serial/:serial` — есть; public subscription tiers — **нет** |
| Client API tiers | `GET /client/subscription-levels` — authenticated |
| SubscriptionLevel | Поля `dailyVolumeMl`, `priceKopecks`; логика суточного лимита с MSK reset |
| Tastes | 14 canonical `tasteMediaKey`; продукты в БД с `tasteMediaKey` |
| Site | Static mirror flowstation.ru; бренд FLOW, не VIWA editorial |
| Deploy | Telemetry: `docs/deployment/server.md`, SSH `viwa-server`; site/client — отдельные хосты/domains |

### Вне scope

- Изменение Docker/compose без явного согласия пользователя
- Android-приложение автомата
- Автоматический production push без прохождения verification matrix и явного подтверждения
- Генерация marketing-изображений субагентами (ответственность parent-агента по уточнению пользователя)

### Принятые рекомендации analyst (не blocking)

#### 1. Атрибуция регистрации с сайта

**Рекомендация:** добавить first-class поле `registrationSource` на Client (enum: `MACHINE_QR`, `WEBSITE`, `UNKNOWN`), сохранить `registrationMachineId` когда serial передан.

**Обоснование:** виртуальный «website-machine» искажает analytics по автоматам и смешивает физические serial с маркeting-каналом; переиспользование только `registrationMachineId` не различает «QR на автомате» vs «перешёл с vitamin-water.ru, но serial в URL был». Комбинация `registrationSource=WEBSITE` + optional `registrationMachineId` даёт однозначную отчётность.

**Поведение check-code:** для **нового** Client — записать source и machine; для **существующего** — не перезаписывать source/machine (as-is), serial в теле игнорируется.

#### 2. Семантика тарифов 12 L / 18 L

**Рекомендация:** трактовать `dailyVolumeMl` как **monthlyVolumeMl** (переименование поля + migration), объём пакета **12000 ml** и **18000 ml** на календарный месяц подписки; снять или заменить суточный reset на **monthly pool**, depleting `volumeMl` / monthly allowance до `subscriptionEndsAt`.

**Обоснование:** продуктовая формулировка «пакет на месяц» противоречит daily limit. Backward-compatible alias в API (deprecated `dailyVolumeMl` → `monthlyVolumeMl`) на один релиз — решение architect.

#### 3. «Все вкусы»

**Рекомендация:** canonical set = **14 `tasteMediaKey`** из телеметрии (allowlist). На лендинге и в клиенте показывать все 14; labels RU из справочника; imagery — сгенерированные parent-агентом assets + fallback на существующие taste media где есть.

#### 4. Композиция landing + client

**Рекомендация:** `viwa-site` хостит marketing landing; правая «мobile frame» на desktop — **live embed или deep-link** на `cabinet.vitamin-water.ru` (iframe только если CSP/cookies позволяют; иначе styled mock + CTA open in same tab). Единый visual design system (CSS variables) между site и client.

---

## Юзер-кейсы и сценарии

### Актёры

| Актёр | Описание |
|-------|----------|
| **Посетитель сайта** | Просматривает лендинг, вкусы, тарифы; переходит к регистрации |
| **Новый клиент** | Первичная регистрация по телефону + OTP; обязателен serial в URL |
| **Returning клиент** | Повторный вход по телефону без serial |
| **Оператор/аналитик** | В telemetry dashboard видит источник регистрации и тарифы |
| **Автомат сети** | Принимает QR клиента независимо от автомата регистрации (network-wide subscription) |

### UC-1. Просмотр landing (split layout)

**Предусловие:** vitamin-water.ru доступен.

**Основной сценарий (desktop ≥1024px):**
1. Посетитель видит split: слева editorial landing (hero, о продукте, вкусы, тарифы, CTA), справа — mobile frame с клиентским кабинетом (live или high-fidelity preview).
2. Header: логотип VIWA, навигация, CTA «Найти станцию» / «Кабинет».
3. Hero: «Вкус в точной дозе», подзаголовок, primary CTA «Пить больше» / «Регистрация».
4. Секция вкусов: **все 14** вкусов с названиями RU и imagery бутылок/fruit cross-section по референсу.
5. Секция тарифов: **2 активных tier** — объём **12 L** и **18 L**, **цена loaded from telemetry public API** (не статический текст).
6. Footer / secondary blocks по референсу (наука, станция VIWA).

**Mobile (<768px) — mobile landing parity gate (обязательно, не desktop-only):**

> Пользователь явно: «лендинг сделай и в мобилке тоже; не только desktop». Mobile — first-class landing, **не** только scaled-down desktop split.

1. **Полноценный mobile landing:** hero, nav (hamburger / stack / reorder допустимы), footer; все секции доступны без desktop-only layout.
2. **14 вкусов** — полная сетка/список с RU labels и imagery (responsive, lazy below fold).
3. **2 tariff cards** — live prices из public API; skeleton + error/retry (не hardcoded цены).
4. **CTA регистрации/авторизации** — serial capture path или deep-link в cabinet с `entry=website`.
5. **Cabinet preview** — collapsible block или «Открыть кабинет» deep-link (iframe не primary).
6. **UX/a11y:** touch targets ≥44px; readable typography; **safe-area** (`env(safe-area-inset-*)`); no horizontal scroll; responsive/lazy assets; `prefers-reduced-motion`.
7. **Viewports верификации:** минимум `360×800`, `390×844`, `430×932` + desktop `1440×900`.

**Альтернативы:**
- Public tiers API недоступен → graceful fallback: skeleton + retry; не показывать неверные цены.
- Reduced motion → отключить parallax/animations (prefers-reduced-motion).

---

### UC-2. Переход к регистрации (CTA)

**Предусловие:** UC-1; для **нового** клиента URL должен содержать valid machine serial.

**Основной сценарий:**
1. Посетитель нажимает CTA «Регистрация» / «Пить больше» / «Кабинет».
2. Система формирует URL клиентского кабинета с параметрами:
   - `serial` (обязателен для first-time flow) — из query/link/QR campaign;
   - `source=website` — для атрибуции.
3. Открывается client web auth screen (телефон).

**Сценарий «serial уже в ссылке»:**
- QR на станции ведёт на `vitamin-water.ru?...&serial=VIWA-XXXX` → landing → CTA сохраняет serial.

**Сценарий «serial отсутствует»:**
- CTA ведёт на explanatory step: «Отсканируйте QR на станции» или serial capture (если product одобрит UX architect); **новая регистрация без valid serial блокируется** с понятным сообщением.

**Альтернативы:**
- Invalid serial → error state, ссылка на support / повтор scan.

---

### UC-3. Первичная регистрация (serial required)

**Предусловие:** Client с телефоном не существует; URL содержит valid serial.

**Основной сценарий:**
1. Client web валидирует serial через public machine lookup.
2. Клиент вводит телефон → OTP (flash-call).
3. `check-code` с `phone`, `code`, `machineSerial`, `registrationSource=website` (если пришёл с landing).
4. Создаётся Client: trial/monthly initial volume per policy; `registrationMachineId` = machine; `registrationSource` = WEBSITE или MACHINE_QR.
5. **После успеха:** client-side **удаляет serial из URL** (`history.replaceState`) → clean URL (`/home` или `/auth/...` без serial segment).
6. Redirect на home/subscription screen (UC-4).

**Альтернативы:**
- Invalid OTP → retry.
- Rate limit OTP → 429 с cooldown.
- Machine not found → error page.

---

### UC-4. Returning login (без serial)

**Предусловие:** Client уже существует.

**Основной сценарий:**
1. Клиент открывает cabinet URL **без** serial (dedicated route, напр. `/auth` или `/login`).
2. Вводит телефон → OTP → `check-code` **без** `machineSerial`.
3. Успешный вход → subscription home; `registrationMachineId` / `registrationSource` **не меняются**.

**Альтернативы:**
- Refresh token valid → auto-login без OTP.
- Expired session → OTP flow.

---

### UC-5. Клиентский кабинет (mobile UI по референсу)

**Предусловие:** UC-3 или UC-4.

**Основной сценарий:**
1. Экран «Твой прогресс» — monthly consumed / allowance (12 или 18 L context).
2. «Твой QR» — scan at any station in network.
3. «Твой вкус» — **любимые вкусы** (до 3 или product-defined N) из полного набора 14; editorial fruit icons.
4. «Твой план» — tier name, **price from API**, benefits; CTA смены/оплаты тарифа.
5. Bottom nav по референсу (главная, история, action, награды, профиль) — scope MVP: главная + профиль/подписка обязательны; остальные — stub или hidden if not implemented (решение architect, не блокер landing).

**Альтернативы:**
- Нет активной подписки → paywall / trial state.
- WebSocket profile updates — сохранить live behavior.

---

### UC-6. Покупка месячного пакета (12 / 18 L)

**Предусловие:** UC-5; tiers configured in telemetry.

**Основной сценарий:**
1. Клиент выбирает tier 12 L или 18 L (цены из `subscription-levels`).
2. Init SBP payment → poll status → apply subscription.
3. Подписка **действует на всю сеть** — QR accepted on any machine; pour debits monthly pool.
4. Admin видит payment without machineId (client web purchase).

**Альтернативы:**
- Payment expired → re-init.
- Upgrade/downgrade mid-cycle — proration policy (если не определено: новый tier с next period; зафиксировать в architect).

---

### UC-7. Аналитика: регистрация с сайта

**Предусловие:** UC-3 выполнен с `source=website`.

**Основной сценарий:**
1. В telemetry admin client card / analytics filter показывает **Registration source: Website** (distinct from Machine QR).
2. Если serial был передан — optional «Registration machine: VIWA-XXXX».
3. Aggregations (clients by registration source) не смешивают website-only и machine-only.

---

### UC-8. Deploy production

**Предусловие:** все acceptance criteria локально/staging verified; пользователь подтвердил push/deploy.

**Основной сценарий:**
1. `viwa-telemetry`: lint, typecheck, test, build; migration apply; release deploy per `docs/deployment/server.md`.
2. `viwa-client-web-app`: lint, test, build; deploy to cabinet host; env `VITE_VIWA_TELEMETRY_API_URL` production.
3. `viwa-site`: static deploy to vitamin-water.ru; assets (images parent-generated) included.
4. Smoke: landing loads, tiers prices render, registration E2E happy path, admin sees website source.

**Rollback:** см. Big Rock Brief.

---

## UI-сценарии для тестирования

> Browser testing **обязателен** — критический пользовательский сценарий, desktop + **mobile landing parity** + a11y.

**Canonical viewports:** desktop `1440×900`; mobile минимум `360×800`, `390×844`, `430×932`. Landing scenarios B-1…B-8 **must pass on all three mobile viewports** (not desktop-only).

### Landing (viwa-site)

| # | Сценарий | Viewport | Проверки |
|---|----------|----------|----------|
| B-1 | Первая загрузка главной | 1440×900; **360×800, 390×844, 430×932** | Desktop: split. **Mobile parity:** full hero+nav+footer stack; не scaled-down desktop; no horizontal scroll |
| B-2 | Секция вкусов | all viewports above | **14** вкусов RU labels; responsive/lazy images |
| B-3 | Секция тарифов | all viewports above | 2 tier cards; live API prices; loading/error/retry on **each mobile width** |
| B-4 | CTA «Регистрация» | all viewports above | Navigate to client with serial+entry when present |
| B-5 | CTA без serial | **360×800, 390×844, 430×932** | Serial Capture path; no silent broken register |
| B-6 | Keyboard nav | 1280×800 | Tab order header→main→footer; visible focus |
| B-7 | Reduced motion | any | `prefers-reduced-motion: reduce` — no essential info in motion-only |
| B-8 | Color contrast | any | WCAG AA for body text and CTA on dark bg |

### Client web (viwa-client-web-app)

| # | Сценарий | Viewport | Проверки |
|---|----------|----------|----------|
| B-9 | Entry with serial | 390×844 | Machine validation → auth phone screen |
| B-10 | First registration OTP | 390×844 | Success → **serial removed from URL**; lands on home |
| B-11 | Returning `/auth` no serial | 390×844 | OTP login works; no machine validation gate |
| B-12 | Subscription home redesign | 390×844 | Progress, QR, flavors, plan match reference structure |
| B-13 | Tier purchase 12 L | 390×844 | Price from API; SBP flow mock/real per env |
| B-14 | Tier purchase 18 L | 390×844 | Same |
| B-15 | Error invalid serial | 390×844 | Error page readable |
| B-16 | Desktop client | 1440×900 | Layout usable if client opened standalone |

### Cross-surface

| # | Сценарий | Проверки |
|---|----------|----------|
| B-17 | Landing → register → admin | Client in telemetry has `registrationSource=WEBSITE` |
| B-18 | QR pour any machine | Subscription honored network-wide (staging machine if available) |

---

## Нефункциональные требования

### Visual / brand

- Следовать утверждённому референсу concept-16 (editorial fruit lab).
- Primary accent `#7F5AF0`; dark base `#000` / near-black; off-white text.
- Типографика: bold geometric sans (Inter/Montserrat class — конкретный шрифт на architect).
- Imagery бутылок и fruit cross-sections: **генерирует parent-агент**; форматы WebP/PNG optimized; alt text RU.

### Performance

- Landing LCP <2.5s on 4G (critical CSS, lazy images below fold).
- Public tiers: cache-friendly (CDN/nginx); client-side stale-while-revalidate acceptable.

### Security

- Public endpoints rate-limited.
- No secrets in static site.
- CSP compatible with telemetry API origin.

### Accessibility

- Semantic HTML landmarks; lang=ru.
- Focus management on route change in SPA.
- Form labels, errors announced; OTP input accessible.
- Touch targets ≥44×44px mobile.
- **Safe-area insets** on notched devices (`env(safe-area-inset-*)`).
- **Mobile landing parity:** responsive assets (srcset/sizes or CSS), lazy load below fold; mobile layout is stack/reorder/hamburger — not desktop scale-only.

### i18n

- RU primary; prepare strings for future locale keys where client web already uses i18n.

### API contracts (логические, без привязки к файлам)

- `GET /api/v1/public/subscription-levels` — active tiers: id, name, monthlyVolumeMl (12000|18000), priceKopecks, sortOrder.
- Optional: `GET /api/v1/public/tastes` — 14 keys + labelsRu (+ imageUrl if centralized).
- `POST /api/v1/client/auth/check-code` — optional `machineSerial`, optional `registrationSource`.
- Client profile fields expose monthly allowance semantics.

---

## Критерии приёмки

### Landing & design

- [ ] Одна landing-страница: split на desktop **и полноценный mobile landing** (не только desktop).
- [ ] **Mobile landing parity gate:** на `360×800`, `390×844`, `430×932` — hero, nav, 14 tastes, 2 live tiers, CTA, cabinet preview/deep-link, loading/error/retry, typography, touch ≥44px, safe-area, no horizontal scroll, responsive/lazy assets, reduced motion.
- [ ] Бренд VIWA (не FLOW) на всех user-facing поверхностях задачи.
- [ ] Отображены **все 14** вкусов с корректными RU названиями.
- [ ] Imagery вкусов/бутылок сгенерировано parent-агентом и задеployено.

### Тарифы и API

- [ ] Public endpoint тарифов доступен без auth; landing и client используют его (client may also use authenticated endpoint when logged in).
- [ ] В системе ровно **2 активных monthly tier**: **12 L** и **18 L**; цены editable в telemetry admin и reflected on UI без redeploy static copy.
- [ ] Monthly pool semantics: покупка даёт пакет на месяц; подписка valid network-wide.

### Registration & serial

- [ ] Новый клиент **не может** завершить регистрацию без valid serial в entry URL.
- [ ] После успешной первой регистрации serial **отсутствует** в address bar (verified in browser).
- [ ] Returning client входит через route **без** serial; OTP/flash-call работает.
- [ ] Existing client login не перезаписывает registration attribution.

### Website attribution

- [ ] Регистрация, инициированная с landing (`source=website`), помечена в telemetry admin как **Website** (не indistinguishable from pure machine QR).
- [ ] При переданном serial сохраняется связь с автоматом регистрации.

### Client cabinet UI

- [ ] Mobile client UI обновлён под референс: progress, QR, flavors, plan.
- [ ] «Любимые вкусы» показывают subset из полного catalog 14.
- [ ] Tier prices на экране подписки = API.

### Quality gates

- [ ] `viwa-telemetry`: lint, typecheck, test, build — exit 0.
- [ ] `viwa-client-web-app`: lint, test, build — exit 0.
- [ ] `viwa-site`: static validation (links, assets); manual preview OK.
- [ ] Browser scenarios B-1…B-18 пройдены (или явно documented skips with reason).

### Deploy

- [ ] Production deploy выполнен **после** all gates (task-10 browser + build) и **явного подтверждения** пользователя (**deploy authorized** 2026-07-29).
- [ ] Deploy ordering telemetry → client → site via `/task-completion`; **CI monitoring** — только по отдельному запросу.
- [ ] Docker-файлы не изменены (или изменены только с отдельным согласием).
- [ ] Post-deploy smoke: landing live on **mobile + desktop**, cabinet auth works, tiers prices correct.

---

## Зависимости и порядок реализации (для planner)

1. **Telemetry:** migration monthly semantics + public tiers + registrationSource → contracts/tests.
2. **Client web:** routes (serial / no-serial) + auth payload + URL strip + UI redesign + flavors.
3. **Site:** landing HTML/CSS/JS + public API integration + assets from parent image gen.
4. **Browser test orchestrator:** после интеграции.
5. **Deploy:** telemetry → client → site (или согласованный порядок runbook).

---

## Риски

| Риск | Mitigation |
|------|------------|
| Daily→monthly migration breaks existing subscribers | Migration script; grandfather period; admin comms |
| iframe client in landing blocked by cookies/CSP | Prefer deep-link + visual mock on site |
| 14 generated images inconsistent style | Single parent batch with reference image |
| Serial-less CTA confuses users | Explicit UX for QR scan requirement |
| Deploy coordination 3 repos | Ordered runbook + smoke checklist |

---

## Ссылки

- Request: `request.md`
- Visual reference: concept-16 editorial fruit lab (session assets)
- Transcript: `ea222fe3-2b0e-4cdd-94fc-1eb2e71a4d0c`
- Telemetry deploy: `viwa-telemetry/docs/deployment/server.md`
- Loyalty contracts: `viwa-telemetry/docs/contracts/loyalty-*.md`

# Ревью ТЗ — viwa-landing-subscriptions

**Круг:** 1 (tz-reviewer)  
**Дата:** 2026-07-29  
**Вход:** `tz.md` v1, `request.md`, visual reference concept-16, AGENTS.md (`viwa-client-web-app`, `viwa-telemetry`), `viwa-site/README.md`

---

## Краткий вывод

ТЗ **v1 в целом полное и согласовано** с исходной постановкой, визуальным референсом и ограничениями трёх репозиториев. Все 9 функциональных требований из `request.md` отражены в юзер-кейсах UC-1…UC-8, критериях приёмки и Big Rock Brief. Ключевые темы пользователя (monthly 12/18 L, public API цен, serial только при первой регистрации, first-class website attribution, network-wide subscription, 14 вкусов, генерация imagery parent-агентом, adaptive desktop/mobile, browser smoke, deploy с rollback без Docker) **явно зафиксированы** и не противоречат exploration facts.

**Критичных блокеров для передачи architect/planner нет.** Перед реализацией стоит закрыть несколько некритичных пробелов (tablet breakpoint, маппинг `source=website` → API enum, явный returning-entry с лендинга).

---

## Сверка с request.md (обязательные темы)

| Требование | Статус | Где в ТЗ |
|------------|--------|----------|
| Split landing + client по референсу | ✅ | UC-1, Visual/brand, acceptance «Landing & design» |
| CTA в регистрацию / auth client web | ✅ | UC-2, UC-3 |
| Атрибуция «регистрация с сайта» в телеметрии | ✅ | Рекомендация #1, UC-3, UC-7, acceptance «Website attribution» |
| Все вкусы (лендинг + любимые в кабинете) | ✅ | Рекомендация #3, UC-1 §4, UC-5 §3, B-2, B-12 |
| Monthly пакет 12 L / 18 L, цены из телеметрии | ✅ | Рекомендация #2, UC-1 §5, UC-6, API contracts, acceptance «Тарифы и API» |
| Serial в URL при первой регистрации; strip после успеха | ✅ | UC-3 §5–6, B-10, acceptance «Registration & serial» |
| Повторный вход без serial (flash-call/OTP) | ✅ | UC-4, B-11, acceptance |
| Подписка на всю сеть | ✅ | Актёр «Автомат сети», UC-6 §3, B-18, acceptance |
| Deploy production; Docker без согласия не менять | ✅ | UC-8, Big Rock rollback, acceptance «Deploy» |
| Генерация фото — parent-агент, не субагенты | ✅ | Non-goals, Visual/brand, acceptance imagery |

---

## Сверка с визуальным референсом (concept-16)

| Элемент референса | Покрытие в ТЗ |
|-------------------|---------------|
| Editorial fruit lab, dark base, accent `#7F5AF0` | ✅ Visual/brand |
| Desktop split: marketing слева, mobile frame справа | ✅ UC-1 desktop |
| Header: VIWA, nav (О продукте, Вкусы, …), CTA «Найти станцию» | ✅ UC-1 §2 |
| Hero «Вкус в точной дозе», CTA «Пить больше» | ✅ UC-1 §3 |
| LAB RANGE / бутылки вкусов | ✅ UC-1 §4, imagery parent-generated |
| Mobile: прогресс, QR, вкусы (3), план с ценой/мес | ✅ UC-5 (monthly semantics вместо 780/1000 из макета — корректно для новой политики) |
| Bottom nav (главная, история, action, награды, профиль) | ✅ UC-5 §5 (MVP: stubs допустимы) |
| Mobile stack на узком viewport | ✅ UC-1 mobile, B-1 |

**Замечание:** макет показывает «499 ₽ / МЕС» и прогресс «780 / 1000 мл» (trial/daily-наследие). ТЗ правильно требует **live monthly 12/18 L и цены из API** — расхождение с пикселями референса осознанное и задокументировано.

---

## Сверка с AGENTS.md / README репозиториев

| Репо | Согласованность |
|------|-----------------|
| **viwa-client-web-app** | As-is routes `/m/:machineSerial/*`, `VITE_VIWA_TELEMETRY_API_URL`, client/public API — совпадает с exploration. ТЗ предлагает расширение маршрутов (serial / no-serial) — не противоречит AGENTS, требует architect. |
| **viwa-telemetry** | Public tiers отсутствует (as-is) — ТЗ закладывает `GET /public/subscription-levels`. Daily MSK reset в AGENTS — ТЗ требует migration на monthly pool. Deploy runbook `docs/deployment/server.md` — учтён в UC-8. Docker не менять — совпадает. |
| **viwa-site** (README) | Static HTML/CSS/JS, vitamin-water.ru, preview через `python -m http.server` — ТЗ scope landing + public API integration согласован. README ещё описывает бренд FLOW — ТЗ явно требует VIWA rebrand в acceptance. |

---

## Чеклист tz-reviewer

| Критерий | Оценка |
|----------|--------|
| Все юзер-кейсы из постановки в ТЗ | ✅ UC-1…UC-8 покрывают 9 пунктов request |
| Основные и альтернативные сценарии | ✅ У каждого UC есть alternatives (API fail, invalid serial, OTP, payment, reduced motion) |
| Актёры определены | ✅ Таблица актёров |
| Критерии приёмки формализуемы | ✅ Чеклисты с verifiable пунктами + B-1…B-18 |
| Нет противоречий с ограничениями постановки | ✅ Docker, deploy gate, parent image gen |
| UI-сценарии для browser test | ✅ Раздел B-1…B-18 (см. некритичное замечание про `browserTesting` в AGENTS) |

---

## Критичные проблемы

*Нет.*

---

## Некритичные замечания

1. **`browserTesting: true` отсутствует в AGENTS.md** (`viwa-client-web-app`, `viwa-telemetry`, `viwa-site`). По skill formal gate browser-test-orchestrator не сработает автоматически, хотя ТЗ и acceptance **явно требуют** B-1…B-18. Рекомендация planner/orchestrator: выполнить browser smoke по таблице ТЗ вручную или временно зафиксировать `browserTesting: true` в AGENTS активного web-проекта на время сессии.

2. **Tablet breakpoint (768–1023 px)** не описан: только desktop ≥1024 и mobile <768. Добавить в architect/planner правило stack vs split для планшетов.

3. **Маппинг атрибуции:** URL/query `source=website` vs API body `registrationSource=WEBSITE` — зафиксировать в contract (loyalty-client-rest) единым enum и mapping layer в client web.

4. **Split desktop — live client справа:** при блокировке iframe (CSP/cookies) fallback «mock + deep-link» не даёт live кабинет в frame как на референсе. Приемлемо для MVP, но стоит заложить smoke-проверку реального embed на staging.

5. **Returning entry с лендинга:** UC-2 фокус на serial для новых; header «Кабинет» подразумевает вход без serial, но отдельный happy-path (CTA «Кабинет» → `/auth` без serial) не выделен в B-сценариях — добавить B-19 или расширить B-4.

6. **Proration / upgrade mid-cycle** (UC-6 alt) отложено architect — не блокер landing, но нужно до billing QA.

7. **`GET /public/tastes` optional** — при отсутствии endpoint viwa-site опирается на static allowlist 14 keys + parent assets; architect должен выбрать один источник labels для DRY с client.

8. **viwa-site verification** — только «static validation» без lint/build из AGENTS; согласовано с README, но planner должен явно перечислить команды (link check, asset presence, manual preview).

---

## Рекомендация orchestrator

Передавать **architect** → **planner** без блокеров. В architect зафиксировать: route matrix (`/m/:serial`, `/auth`), monthly migration contract, `registrationSource` schema, embed vs deep-link для split-view.

# Запрос пользователя

**sessionId:** `viwa-landing-subscriptions`  
**Дата:** 2026-07-29  
**Режим:** `/complex` (multi-repo)

## Постановка

Утверждён новый дизайн для веб-версии приложения и сайта. Композиция: **слева — маркетинговый сайт, справа — мобильный клиентский кабинет**. Нужно реализовать **одну страницу лендинга** с такой вёрсткой и **выход в регистрацию** (экран клиента).

### Функциональные требования

1. **Лендинг + клиент в одной композиции** — split-view по утверждённому визуальному референсу (editorial fruit lab, чёрно-белая база, акцент `#7F5AF0`, приглушённые вкусовые акценты).
2. **CTA в регистрацию** — переход на клиентский web (кабинет) с экраном авторизации/регистрации.
3. **Серийный номер автомата** — учесть в потоке регистрации; в телеметрии должно быть **понятно, что регистрация прошла с сайта**.
4. **Все вкусы** — сгенерировать и показать:
   - бутылки на лендинге;
   - «любимые вкусы» в мобильной (клиентской) части.
5. **Новая политика подписки:**
   - клиент покупает **пакет на месяц**;
   - два тарифа: **12 литров** и **18 литров**;
   - тарифы уже есть в телеметрии — вёрстка должна **базироваться на них и брать цену оттуда** (не хардкод).
6. **Первичная регистрация** — клиент должен открыть адрес **с серийным номером**; после успешной первой регистрации **serial удалить из URL**.
7. **Повторные входы** — последующие входы и получение кода через звонок должны работать **без serial** в URL.
8. **Подписка на всю сеть** — действует на все автоматы сети (single-tenant, без привязки к одному автомату).
9. **Деплой** — в конце задачи нужен production deploy (без изменения Docker-файлов без явного согласия).

### Уточнение пользователя (2026-07-29)

- **Генерацию фотографий** (бутылки, вкусы, editorial imagery) выполняет **текущий агент (оркестратор/parent)**, не субагенты.
- Остальные субагенты — по правилам workspace (`composer-2.5-fast`, complex pipeline).
- Запуск через `/complex`.

### Уточнение пользователя (2026-07-29, mobile + deploy)

> «Лендинг сделай и в мобилке тоже; не только desktop»

- **Mobile landing parity обязательна:** лендинг на mobile — полноценный first-class UX, не урезанная версия desktop split-view.
- **Viewports (минимум):** `360×800`, `390×844`, `430×932` (mobile) + `1440×900` (desktop).
- **На mobile обязательны:** hero, nav (hamburger/stack/reorder допустимы), все **14** вкусов, **2** live tariff cards из public API, registration/auth CTA, cabinet preview и/или deep-link «Открыть кабинет», loading/error/retry для API, readable typography, touch targets ≥44px, safe-area insets, no horizontal scroll, responsive/lazy assets, `prefers-reduced-motion`.
- **Запрещено:** mobile как «только desktop scaled-down» без stack/reorder/hamburger.
- **Production deploy:** пользователь **явно подтвердил** deploy в production после всех gates; выполняется через `/task-completion` (не автоматически). **CI monitoring** (`/ci-cd-status`) — только по отдельному запросу.

## Активные репозитории

| Репозиторий | Назначение | AGENTS.md |
|-------------|------------|-----------|
| `c:\wiva\viwa-site` | Статический маркетинговый сайт **vitamin-water.ru** | отсутствует; README — static HTML/CSS/JS |
| `c:\wiva\viwa-client-web-app` | React/Vite кабинет **cabinet.vitamin-water.ru** | build `npm run build`, lint `npm run lint`, test `npm test`, target `dev` |
| `c:\wiva\viwa-telemetry` | NestJS/Prisma/React телеметрия + loyalty API | lint/typecheck/test/build, target `main`, deploy runbook `docs/deployment/server.md` |

## Референсы

- **Transcript (design exploration):** `C:\Users\metal\.cursor\projects\c-wiva\agent-transcripts\ea222fe3-2b0e-4cdd-94fc-1eb2e71a4d0c\ea222fe3-2b0e-4cdd-94fc-1eb2e71a4d0c.jsonl`
- **Утверждённый визуальный референс:** `C:\Users\metal\.cursor\projects\c-wiva\assets\c__Users_metal_AppData_Roaming_Cursor_User_workspaceStorage_3db40d35d3f4047b9fe7c179a72f5a37_images_viwa-concept-16-editorial-fruit-lab-5e677fa5-ae3d-4284-a816-cc8e46aa62b2.png`

## Установленные факты exploration (для проверки analyst)

- Текущий client route — только `/m/:machineSerial/*`; неизвестный путь → error page.
- `POST /client/auth/check-code` принимает optional `machineSerial`; для **существующего** клиента `registrationMachineId` **не обновляется**.
- Public machine lookup существует (`GET /public/machines/by-serial/:serial`); **public tiers endpoint отсутствует**; authenticated `GET /client/subscription-levels` существует.
- Prisma tariff fields: `dailyVolumeMl`, `priceKopecks`; новая политика — **monthly package 12/18 L** → требуется определить миграцию/семантику.
- 14 canonical `tasteMediaKey` в телеметрии; «все вкусы» = уточнить как все активные продукты и/или полный allowlist keys.
- Registration attribution сейчас через `registrationMachineId`; для сайта — виртуальный website-machine или first-class `registrationSource`.
- Production deploy — только после проверок и явного подтверждения push/deploy; Docker-файлы не менять без согласия.

## Хост артефактов complex-сессии

`c:\wiva\viwa-client-web-app\docs\agents\viwa-landing-subscriptions\`

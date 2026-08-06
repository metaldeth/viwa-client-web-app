# 2026-08-06 — subscription price consent

## Done
- Добавлена обязательная панель согласия или отказа от новой цены подписки.
- Решение отправляется через client API; состояния pending, accepted, refused и ошибки локализованы.
- Добавлены защита от двойной отправки и обновление устаревшего расписания.

## Decisions
- Отказ сохраняет оплаченный период, но блокирует продление после даты повышения.
- Новая покупка и смена тарифа считаются явным согласием с показанной ценой.

## Risks
- Реальный production-сценарий требует backend-миграции и ручного smoke после деплоя.

## Verification
- `npm run locale:verify` — passed.
- `npm run lint` — passed, 23 существующих warning.
- `npm test` — passed, 241 test.
- `npm run build` — passed.

## Git facts
- repo: `viwa-client-web-app`
- branch: `dev`
- base commit: `232138a`
- diff: pricing consent UI, API module, locale and tests.

## Next
- После backend deploy проверить pending → refuse → accept на production.

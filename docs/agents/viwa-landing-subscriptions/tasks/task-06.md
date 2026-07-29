# task-06: Client concept-16 UI + monthly progress + favorites + locale

**Зависимости:** task-05; live API → task-03, task-04

**UC:** UC-5, UC-6

**Repo:** `viwa-client-web-app`  
**Branch target:** `dev`

## Описание

Редизайн SubscriptionPage под concept-16: monthly progress ring, QR, favorite flavors (до 3 из 14), plan/tier prices from API. Design tokens; locale strings RU. Mock API OK до Wave 1 gate.

## Allowed scope

- `src/pages/SubscriptionPage/**`
- `src/components/FavoriteFlavorsSection/**` (NEW)
- `src/components/VolumeCircle/**`
- `src/styles/viwa-tokens.css` (NEW)
- `src/app/api/modules/loyaltyModule.ts`, `publicModule.ts` (tiers/tastes/favorites)
- `src/types/serverInterface/clientDTO.ts`
- Locale/i18n keys при новых строках
- **Не** менять routing (task-05)

## Запрет Docker

Не изменять Docker/compose файлы.

## Точные touchpoints

| Файл / модуль | Изменение |
|---------------|-----------|
| `src/pages/SubscriptionPage/` | concept-16 layout: progress, QR, flavors, plan |
| `src/components/FavoriteFlavorsSection/` | **NEW** — pick ≤3 from 14 |
| `src/components/VolumeCircle/` | Monthly consumed/allowance display |
| `src/styles/viwa-tokens.css` | **NEW** — `--viwa-accent: #7F5AF0`, etc. |
| `src/app/api/modules/loyaltyModule.ts` | favorites PATCH, profile monthly fields |
| `src/app/api/modules/publicModule.ts` | tiers/tastes for picker |
| Locale files | RU strings for new UI copy |

## Acceptance

- [ ] Progress shows `monthlyUsedMl` / `monthlyLimitMl` (or trial fallback)
- [ ] Tier prices from API, not hardcoded
- [ ] Favorite flavors: max 3, from canonical 14 keys
- [ ] Visual alignment with concept-16 tokens (accent #7F5AF0, dark base)
- [ ] Bottom nav MVP: home + profile/subscription required; stubs OK for others
- [ ] Locale verify passes if strings added

## Tests / build

```powershell
cd c:\wiva\viwa-client-web-app
npm run lint
npm run locale:sync
npm run locale:sort
npm run locale:verify
npm test -- SubscriptionPage FavoriteFlavors VolumeCircle
npm run build
```

### Test cases

| ID | Сценарий |
|----|----------|
| CW06-1 | VolumeCircle renders monthly % correctly |
| CW06-2 | FavoriteFlavors enforces max 3 selection |
| CW06-3 | Tier cards display API priceKopecks |
| CW06-4 | Trial state when no active subscription |

## Downstream

- **task-08** — generated taste images in `public/assets/viwa/`
- **task-09** — live tier/favorite API wire-up

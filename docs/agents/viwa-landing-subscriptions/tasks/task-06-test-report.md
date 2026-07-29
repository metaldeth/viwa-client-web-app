# task-06-test-report

**Task:** Client concept-16 UI + monthly progress + favorites + locale  
**Repo:** `viwa-client-web-app`  
**Date:** 2026-07-29  
**Round:** 2 (review blockers)  
**Depends on:** task-05 (closed)

## Round 2 fixes (task-06-review blockers)

| Blocker | Fix |
|---------|-----|
| #1 Expired subscription hides renewal | `subscriptionStatus.ts` — `isActiveSubscriptionProfile` checks future `subscriptionEndsAt` + `monthlyLimitMl > 0`; `shouldShowRenewalPlans` drives plan cards; `progressExpired` copy |
| #2 GET full-replace races WS/PATCH | `mergeClientProfileFromServer` + `localRevision`/`pendingFetchRevision` in loyalty slice; volatile fields preserved when patch lands during GET |
| #3 Locale verify acceptance | Full 47 `subscription.*` keys in `ru.json`/`en.json`; `tSubscription` reads JSON catalogs (RU/EN via `setSubscriptionLocale`); `scripts/locale-verify-subscription.mjs`; npm `locale:verify` |
| #4 Keyboard + progressbar a11y | Progress card → native `<button>` with `scanOpenHint`; `VolumeCircle` → `role="progressbar"` + `aria-valuenow/min/max` |
| #5 BottomNav SPA reload | `<a href>` → React Router `NavLink`; profile item `aria-current="page"` on `/home` |

## Scope delivered (cumulative)

- concept-16 SubscriptionPage: monthly progress, QR, favorites ≤3, API plan cards, billing preserved
- `FavoriteFlavorsSection`, `BottomNav`, `VolumeCircle`, `viwa-tokens.css`
- API modules: public tastes/tiers, loyalty favorites PATCH
- `clientDTO` monthly + `favoriteTasteKeys`
- Manifest-ready taste paths + placeholder (task-08 deferred)

## Test matrix

| ID | Scenario | File | Result |
|----|----------|------|--------|
| CW06-1 | VolumeCircle monthly % + progressbar | `VolumeCircle.test.tsx` | **PASS** |
| CW06-2 | FavoriteFlavors max 3 | `favoriteTastesSelection.test.ts`, `FavoriteFlavorsSection.test.tsx` | **PASS** |
| CW06-3 | Tier API priceKopecks | `monthlyProgress.test.ts` | **PASS** |
| CW06-4 | Trial state | `monthlyProgress.test.ts` | **PASS** |
| R2-1 | Expired subscription shows renewal | `subscriptionStatus.test.ts` | **PASS** |
| R2-2 | Stale GET does not clobber WS patch | `mergeClientProfile.test.ts`, `slice.profileRace.test.ts` | **PASS** |
| R2-3 | EN locale catalog wired | `subscriptionLocale.test.ts` | **PASS** |
| R2-5 | BottomNav NavLink SPA nav | `BottomNav.test.tsx` | **PASS** |

## Verification commands (re-checked 2026-07-29 round 2)

```powershell
cd C:\wiva\wiva-client-web-app
npm run lint          # exit 0 (23 pre-existing warnings, 0 errors)
npm run locale:verify # exit 0 — 47 subscription keys ru/en parity
npm test              # 40/40 PASS
npm run build         # exit 0
```

## Not in scope (by plan)

- Generated taste images (`task-08`)
- Live API wire-up (`task-09`)
- Docker, commit/push
- SCSS token cleanup / SubscriptionPage extract (🟡 from review)

## Git baseline

- Branch `dev`; no commit/push per instruction

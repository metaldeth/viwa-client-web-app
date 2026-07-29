# task-07: Site one-page concept-16 + API shell + serial capture CTA

**Зависимости:** task-01; live API → task-03

**UC:** UC-1, UC-2

**Repo:** `viwa-site`  
**Branch target:** `master`

## Описание

Заменить/расширить главную: single-page concept-16 landing (split desktop ≥1024px, stack mobile). Public API integration в `landing-api.js` с mock fallback до Wave 1 gate. CTA builder с `entry=website` и serial preservation. Serial-less path → cabinet `/register?entry=website` (Serial Capture). **Iframe не primary** — static cabinet mock + deep-link.

## Allowed scope

- `index.html`
- `css/viwa-tokens.css`, `css/viwa-landing.css` (NEW)
- `js/landing-api.js`, `js/landing-cta.js` (NEW)
- `js/config.js` (optional API base override)
- Placeholder images until task-08
- **Не** удалять legacy pages без необходимости; главная — новая VIWA landing
- **Не** генерировать marketing images (parent agent)

## Запрет Docker

Не изменять Docker/compose/nginx Docker configs.

## Точные touchpoints

| Файл / модуль | Изменение |
|---------------|-----------|
| `index.html` | Semantic landmarks; hero; 14-flavor grid; 2 tier cards; footer; lang=ru |
| `css/viwa-tokens.css` | Shared tokens with client |
| `css/viwa-landing.css` | Split layout; mobile stack; a11y focus styles |
| `js/landing-api.js` | Fetch public tiers/tastes; skeleton/error/retry; mock mode flag |
| `js/landing-cta.js` | URLs: `cabinet.../register?serial=&entry=website`, `/auth` |
| `README.md` | Deploy notes (optional) |

## Acceptance

- [ ] Desktop split: marketing left + static cabinet mock right + «Открыть кабинет» deep-link
- [ ] Mobile stack; touch targets ≥44px; no horizontal scroll (B-1)
- [ ] 14 flavor slots with RU labels (API or static fallback)
- [ ] 2 tier cards; prices from API when available; skeleton on failure (B-3)
- [ ] CTA with serial → preserves serial + `entry=website` (B-4)
- [ ] CTA without serial → `/register?entry=website` (B-5)
- [ ] `prefers-reduced-motion` respected (B-7)
- [ ] Brand VIWA (not FLOW) on user-facing landing

## Tests / build

```powershell
cd c:\wiva\viwa-site
python -m http.server 8080
# Static checks:
# - all relative asset links resolve
# - no broken script/css refs
# - validate tier fetch against staging when task-03 merged
```

### Static validation checklist

- [ ] `index.html` validates (no unclosed tags)
- [ ] All `href`/`src` relative paths exist or documented placeholder
- [ ] No secrets in JS
- [ ] API base configurable for staging vs production

## Downstream

- **task-08** — replace placeholders with manifest assets
- **task-09** — switch `landing-api.js` to live production/staging API

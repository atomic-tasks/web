# Задачи

- [x] `openapi/openapi.json` из релиза бэкенда v0.5.0, `pnpm gen:api` — есть `getLoginUrl`, `useLogout`
- [x] `auth/login.ts`: `loginHref`, `loginErrorMessage` — тесты: путь и query сохраняются, `login_error`
      вырезается, три кода и неизвестный, без параметра — ничего
- [x] `shared/ui/AnchorButton`, `SignedOutScreen` с «Войти» и ошибкой, `LogoutButton` в шапке
- [x] Убран `HealthStatus` и прокси `/health` — индикатор в проде больше не врёт
- [x] Документы: README `auth/`, `app/`, `shared/ui/`; ADR 0003 — статус; roadmap — 0003 — `pnpm check`
      и `pnpm build` проходят
- [ ] После выкатки: вход на `https://WEB_HOST` через Rauthy возвращает на тот же адрес, имя в шапке;
      «Выйти» → экран входа, `me` → 401; отказ allowlist показывает «Этому аккаунту вход закрыт».
      Затем — пункт «После выкатки» спеки 0008 бэкенда

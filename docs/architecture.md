# Архитектура

Черновик: раздел заполняется по мере принятия решений (ADR). Контракты модулей — `src/**/README.md`,
карта — [`src/README.md`](../src/README.md).

## Стек

React 19, Vite 8, TypeScript 6 (strict), pnpm, ESLint + Prettier, Vitest, Node 26 LTS. Данные —
TanStack Query, клиент к API генерирует Orval из `openapi/openapi.json`. Почему так — ADR 0001.

## Как это работает

```
Браузер ──► https://<APP_HOST>/            статика из dist/ (index.html + JS + CSS)
        ──► https://<APP_HOST>/api/v1/*    ┐
        ──► https://<APP_HOST>/health      ┴─► Traefik ─► backend (FastAPI)
```

- Сборка (`pnpm build`) превращает TypeScript и React в обычные JS/CSS-файлы в `dist/`. На сервере их
  раздаёт любой статический сервер за Traefik — своего Node-процесса в проде нет.
- Сайт и API на одном хосте: Traefik отдаёт `/api` и `/health` бэкенду, остальное — статике (ADR 0003).
  Поэтому не нужен CORS, а cookie сессии — «своя» для страницы (`SameSite=Lax`).
- В разработке ту же роль играет прокси dev-сервера Vite (`vite.config.ts`): `pnpm dev` на :5173,
  запросы `/api` и `/health` уходят в бэкенд на `ATOMIC_API_URL` (по умолчанию `http://localhost:8000`).

## Вход

Целевое (ADR 0003): бэкенд сам проходит вход в Rauthy и ставит httpOnly-cookie сессии; сайт видит только
cookie и узнаёт пользователя через `GET /api/v1/me`. Бэкенд: ADR 0013 и спека 0008
(`../backend/docs/specs/0008-browser-sessions/`).

До этого — локальная разработка с personal access token: `ATOMIC_DEV_TOKEN` в `.env.local`, dev-прокси
подставляет `Authorization: Bearer` к запросам `/api`. Браузер токен не видит, в бандл он не попадает.

## Модули

Раскладка `src/` и правила импортов — ADR 0002. Сейчас есть `app/` (оболочка) и `api/` (клиент).
`auth/`, `features/<name>/`, `shared/ui/`, `shared/lib/` появятся со спеками из `docs/roadmap.md`.

## Связь с бэкендом

- Контракт — `openapi/openapi.json`, закреплённый на релизе бэкенда (`openapi/README.md`).
- Чего нет в спеке — нет и в клиенте: недостающее делается спекой в `../backend`.

## Сборка и релизы

- Версия — git-тег `vX.Y.Z` (`../guides/releases.md`), в `package.json` заглушка `0.0.0`.
- Деплой — образ со статикой в ghcr за Traefik, как бэкенд, и заголовки безопасности (CSP, `Referrer-Policy`,
  `Permissions-Policy`) на уровне Traefik. Отдельная спека перед первым деплоем.

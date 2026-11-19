# Архитектура

Черновик: раздел заполняется по мере принятия решений (ADR). Контракты модулей — `src/**/README.md`,
карта — [`src/README.md`](../src/README.md).

## Стек

React 19, Vite 8, TypeScript 6 (strict), pnpm, ESLint + Prettier, Vitest, Node 26 LTS. Данные —
TanStack Query, клиент к API генерирует Orval из `openapi/openapi.json`. Роутер — TanStack Router,
UI — React Aria Components со своим CSS. Почему так — ADR 0001 и 0004.

## Как это работает

```
Браузер ──► https://<WEB_HOST>/api/*  ──► Traefik ─► backend (FastAPI)
        ──► https://<WEB_HOST>/*      ──► Traefik ─► web (nginx: dist/, index.html на любой путь)
```

- Сборка (`pnpm build`) превращает TypeScript и React в обычные JS/CSS-файлы в `dist/`. В проде их отдаёт
  nginx из образа `ghcr.io/atomic-tasks/web` — своего Node-процесса нет (ADR 0005).
- Сайт и API на одном хосте: Traefik отдаёт `/api/` бэкенду, остальное — сайту (ADR 0003, спека 0008 бэкенда).
  `/health` бэкенда на хосте сайта нет: индикатор перейдёт на `GET /api/v1/health`, когда он появится в контракте.
- nginx отвечает за то, чего Traefik не умеет: `index.html` на любой путь, кэш (`assets/` — на год,
  `index.html` — без кэша), заголовки безопасности (CSP и др.), `503` на `/api/`, если бэкенда нет.
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

Раскладка `src/` и правила импортов — ADR 0002. Сейчас есть `app/` (оболочка и роутер), `api/` (клиент),
`auth/` (сессия по `GET /api/v1/me`) и `shared/ui/` (токены и базовые компоненты). `features/<name>/`
и `shared/lib/` появятся со спеками из `docs/roadmap.md`.

## Оболочка

- Роутер — TanStack Router, маршруты в коде (`src/app/router.tsx`), адреса и параметры типизированы.
- UI — React Aria Components (поведение, доступность) + свой CSS на токенах `src/shared/ui/theme.css`.
- Ошибки API: текст для пользователя — `describeApiError` (`src/api/errors.ts`); повторы — только сеть
  и `5xx`; `401` на любом запросе перезапрашивает `me`, и оболочка показывает «Вы не вошли».
- Почему так — ADR 0004 и спека `docs/specs/0001-shell/`.

## Связь с бэкендом

- Контракт — `openapi/openapi.json`, закреплённый на релизе бэкенда (`openapi/README.md`).
- Чего нет в спеке — нет и в клиенте: недостающее делается спекой в `../backend`.

## Сборка и релизы

- Версия — git-тег `vX.Y.Z` (`../guides/releases.md`), в `package.json` заглушка `0.0.0`.
- Релиз — `release.yml` по тегу: образ в ghcr и GitHub Release с `deploy.tar.gz`; выкатка — джоба `deploy`
  с подтверждением, ssh с forced command, как у бэкенда. Runbook — `docs/deploy.md`, спека 0002, ADR 0005.
- Заголовки безопасности — в конфиге nginx (`deploy/nginx/`), проверяются `deploy/smoke.sh` в CI и после
  выкатки, хэши CSP для стилей React Aria — тестом `deploy/csp.test.ts`.

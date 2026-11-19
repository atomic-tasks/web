# План

## Экраны и навигация

Новых экранов нет. Меняется только то, кто отдаёт адреса сайта: в проде nginx вместо dev-сервера Vite.

```
https://WEB_HOST/api/...     → Traefik → бэкенд (спека 0008 бэкенда); бэкенда нет → nginx → 503
https://WEB_HOST/assets/...  → Traefik → nginx: файл, кэш на год; нет файла → 404
https://WEB_HOST/version.txt → Traefik → nginx: версия образа
https://WEB_HOST/<любое>     → Traefik → nginx: index.html, no-cache → роутер в браузере
```

## Файлы

Новые, в корне и в `deploy/` (не модули `src/`, README-контракты не нужны):

- `Dockerfile`:
  - стадия `build` (`node:<версия из .node-version>-alpine`): pnpm той же версии, что `packageManager`
    (`npm install -g` по строке из `package.json`), `pnpm install --frozen-lockfile`, `pnpm build`;
  - **после** `pnpm build` в той же стадии — `ARG VERSION=0.0.0-dev` и запись `$VERSION` в
    `dist/version.txt`; пустая версия — ошибка сборки. ARG после сборки: смена версии не сбрасывает кэш
    установки и сборки; ARG до `FROM` или только в `runtime` дал бы пустой файл;
  - стадия `runtime` (`nginxinc/nginx-unprivileged:<версия>-alpine`, тег закреплён): конфиги из
    `deploy/nginx/` в `/etc/nginx/conf.d/`, `dist/` в `/usr/share/nginx/html`.
- `.dockerignore` — `.git`, `node_modules`, `dist`, `.env*` (кроме `.env.example`), `scratch`, `*.local.md`,
  `.claude`, `.codegraph`.
- `deploy/nginx/default.conf`:
  - `server_tokens off`;
  - заголовки безопасности — в `deploy/nginx/security-headers.conf`, он подключается `include` в **каждый**
    `location`: у nginx `add_header` внутри `location` отменяет заголовки уровня `server`;
  - `/api/` — `location ^~ /api/` с `return 503`;
  - `/assets/` — `try_files $uri =404` и `Cache-Control` с `immutable`;
  - `/` — `try_files $uri /index.html` и `Cache-Control: no-cache`;
  - временные файлы nginx — в `/tmp` (для `read_only`).
- `deploy/compose.yaml` — проект `atomic-tasks-web`, сервис `web`: образ
  `${IMAGE:-ghcr.io/atomic-tasks/web}:${VERSION:?}`, сеть Traefik (external), labels: `Host(${WEB_HOST})`,
  entrypoint, certresolver, порт `8080`; `read_only`, `tmpfs: /tmp`, `cap_drop: [ALL]`,
  `security_opt: [no-new-privileges:true]`, `mem_limit: 64m`, `restart: unless-stopped`.
- `deploy/.env.example` — `WEB_HOST`, `TRAEFIK_NETWORK`, `TRAEFIK_ENTRYPOINT`, `TRAEFIK_CERTRESOLVER`.
- `deploy/deploy.sh` — по образцу `../backend/deploy/deploy.sh`: проверка версии `X.Y.Z`, `flock`, скачивание
  `deploy.tar.gz` из релиза `atomic-tasks/web`, `compose.yaml` и `deploy.sh.new`, `docker compose pull`,
  `up -d --remove-orphans`, ожидание `version.txt` = версии изнутри контейнера (`wget` из busybox),
  `.deployed-version`. Без миграций и бэкапов.
- `deploy/authorized_keys.example` — строка ключа CI с `restrict,command="/opt/atomic-tasks-web/deploy.sh"`.
- `deploy/smoke.sh <base-url>` — проверки ответов сервера curl'ом (общие для CI и выкатки):
  `/` и `/nope` → `200`, HTML, `no-cache`; первый `/assets/[^"]+\.js` из ответа `/` → `200` и `immutable`
  (не нашёлся — провал); `/assets/nope.js` → `404`;
  `/api/v1/me` → `503`; на `/`, `404` и `503` есть CSP, `nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`;
  нет `Server: nginx/<версия>`. С `--version X.Y.Z` — ещё `/version.txt`.
  На проде `/api/v1/me` отдаёт бэкенд, поэтому проверка `503` выключается флагом `--behind-backend`.
- `docs/deploy.md` — runbook: что нужно на сервере (отсылка к `../backend/docs/deploy.md`, пп. 1–2),
  первая установка в `/opt/atomic-tasks-web`, environment `production`, выкатка, откат, проверки.

Меняются:

- `.github/workflows/ci.yml` — джоба `image`:
  - `docker build --build-arg VERSION=0.0.0-ci`;
  - запуск с теми же ограничениями, что в `deploy/compose.yaml`:
    `--read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges --memory 64m -p 8080:8080`;
  - `deploy/smoke.sh http://localhost:8080 --version 0.0.0-ci`;
  - в `docker logs` нет ошибок записи (`Read-only file system`, `Permission denied`).
- `.github/workflows/release.yml` (новый) — копия схемы бэкенда без openapi:
  - джоба `release`: проверка тега и `main`, `docker/metadata-action`, `build-push-action` с `VERSION`,
    `deploy.tar.gz` из `deploy/compose.yaml` и `deploy/deploy.sh`, `gh release create`;
  - джоба `deploy`: environment `production` с `url: https://${{ vars.WEB_HOST }}`, ssh с версией, затем
    checkout и `deploy/smoke.sh "https://$WEB_HOST" --version "$V" --behind-backend`;
  - `workflow_dispatch` с версией — только выкатка.
- `src/app/HealthStatus.tsx`, `vite.config.ts`, `.env.example` — после `GET /api/v1/health` в контракте:
  индикатор через новый хук, прокси `/health` и упоминания `/health` убираются.

## Модули и контракты

- **`app/`** — README, Side Effects: `HealthStatus` запрашивает `GET /api/v1/health` (только задача
  с индикатором).
- **`src/`, `api/`, `auth/`, `shared/`** — без изменений.

## Документы

- ADR 0005 «Статика в образе nginx, заголовки безопасности в конфиге nginx»: почему не Traefik (не отдаёт
  файлы), почему nginx, а не Caddy или static-web-server, почему заголовки в nginx, а не в middleware Traefik
  (версионируются с образом, проверяются в CI, одно место); `/health` на хосте сайта заменён на
  `/api/v1/health` (уточняет ADR 0003). Индекс ADR.
- `docs/architecture.md` — схема «Как это работает» (nginx за Traefik, только `/api/` в бэкенд),
  «Сборка и релизы» — ссылка на `docs/deploy.md` и ADR 0005.
- `docs/roadmap.md` — 0002 готова.
- `AGENTS.md` — команды `docker build`, `deploy/smoke.sh`.

## Данные и состояние

Нет. Клиентский код не меняется, кроме перевода индикатора.

## API

Ничего нового не вызывается. От бэкенда: `GET /api/v1/health` (открытый вопрос спеки) и маршрут `/api/`
на `WEB_HOST` (спека 0008).

## Риски

- **React Aria и `style-src 'self'`.** React выставляет `style` через CSSOM — CSP это не ограничивает.
  Если React Aria где-то вставляет `<style>` или ставит `style` через `setAttribute`, это заблокируется.
  Проверка: `docker run` и открыть все экраны с консолью; нарушения CSP видны там.
- **`add_header` в nginx.** Заголовок в `location` отменяет все заголовки уровня `server` — отсюда `include`
  в каждый `location` и проверка заголовков на `404` и `503` в `smoke.sh`.
- **pnpm в Docker.** В Node 26 нет corepack; версию pnpm берём из `packageManager`, иначе lockfile может
  не совпасть с версией pnpm.
- **Ограничения контейнера.** Скрипты запуска `nginx-unprivileged` пишут в `/etc/nginx/conf.d`; под
  `read_only` они должны пропуститься, но это не проверено. Поэтому CI запускает образ с теми же флагами,
  что прод, и смотрит `docker logs`.
- **Порядок выкатки.** Роутер `/api/` уже есть в compose бэкенда, но ещё не выпущен (спека 0008, PR 1).
  Пока бэкенд не выкачен с ним или остановлен (docker-провайдер Traefik убирает роутер остановленного
  контейнера), `/api/` попадает в nginx: `503` → «Нет связи». Ничего не ломается, но сайт бесполезен.

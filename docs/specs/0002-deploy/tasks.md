# Задачи

- [x] ADR 0005 и индекс ADR — решение о сервере статики и месте заголовков записано до кода
- [x] `Dockerfile` и `.dockerignore` — `docker build --build-arg VERSION=0.0.0-dev .` проходит; в образе нет
      `node_modules` и `.env*` (`docker run --rm <образ> ls -a /usr/share/nginx/html`); `version.txt` =
      `0.0.0-dev`; смена `VERSION` не пересобирает стадию до `pnpm build` (кэш); размер образа записан
- [x] `deploy/nginx/default.conf` и `security-headers.conf` — запуск с ограничениями прода
      (`--read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges --memory 64m -p 8080:8080`):
      `/`, `/nope`, `/assets/...`, `/assets/nope.js`, `/api/v1/me`, `/version.txt` отвечают по спеке;
      в `docker logs` нет ошибок записи
- [x] `deploy/smoke.sh` — зелёный на локальном контейнере; красный, если убрать `include` заголовков
      из одного `location`, fallback из `/` или передать неверный `--version`
- [x] Проверка CSP в браузере: локальный контейнер, главная, `/nope`, экран «Нет связи» и кнопка «Повторить»
      — в консоли нет нарушений CSP; React Aria (фокус, нажатия) работает
- [ ] CI: джоба `image` в `ci.yml` (те же ограничения контейнера, `smoke.sh`, проверка `docker logs`) —
      зелёная в PR
- [x] `deploy/compose.yaml`, `deploy/.env.example`, `deploy/authorized_keys.example` —
      `docker compose -f deploy/compose.yaml config` с тестовым `.env` проходит; без `VERSION` и `WEB_HOST`
      падает с понятной ошибкой
- [x] `deploy/deploy.sh` — `bash -n` и `shellcheck` чистые; неверная версия и второй параллельный запуск
      отклоняются
- [x] `.github/workflows/release.yml` — по образцу бэкенда; `actionlint` чистый
- [x] `docs/deploy.md` — runbook: первая установка, environment `production`, выкатка, откат, проверки
- [ ] Первый релиз и выкатка (с пользователем: тег, сервер, секреты — его действия) — `smoke.sh` против
      `https://WEB_HOST` зелёный; HSTS Traefik, размер образа и память записаны в спеку
- [ ] Индикатор на `GET /api/v1/health` — **после** появления пути в релизе бэкенда: `openapi/openapi.json`,
      `pnpm gen:api`, `HealthStatus`, прокси `/health` и `.env.example` убраны
- [x] `docs/architecture.md`, `AGENTS.md` (команды), `docs/roadmap.md` —
      `pnpm check` и `pnpm build` проходят

# AtomicTasks — web

Трекер задач, в котором агент раскладывает цели на атомарные задачи в дереве папок,
а вы смотрите, что делать дальше, и отмечаете прогресс.

Этот репозиторий — веб-клиент на React + Vite + TypeScript.
Бэкенд (REST API и MCP-сервер) — [atomic-tasks/backend](https://github.com/atomic-tasks/backend).

> Статус: каркас. Экранов пока нет.

## Что нужно для разработки

- Node.js — версия в `.node-version`. Удобнее всего через менеджер версий: [fnm](https://github.com/Schniz/fnm)
  или [mise](https://mise.jdx.dev) подхватывают файл сами.
- pnpm — `npm install -g pnpm` (или `brew install pnpm`). Нужную версию из `packageManager` в `package.json`
  pnpm скачает и включит сам.
- Запущенный бэкенд (`docker compose up` в `atomic-tasks/backend`) — сайт ходит в него через прокси.
- [uv](https://docs.astral.sh/uv/) — для `uvx pre-commit`.
- Редактор с поддержкой ESLint и Prettier (VS Code, Zed, WebStorm…): формат при сохранении, ошибки линта в коде.

## Запуск

```bash
pnpm install
cp .env.example .env.local   # адрес бэкенда и dev-токен
pnpm dev                     # http://localhost:5173
```

Запросы `/api` dev-сервер проксирует в бэкенд. Вход — кнопкой «Войти» (бэкенд с `WEB__ORIGIN=http://localhost:5173`,
клиент `atomic-tasks-web` в локальном Rauthy). Без Rauthy — personal access token в `.env.local` (`ATOMIC_DEV_TOKEN`),
см. `docs/adr/0003-*`.

## Сборка

```bash
pnpm build     # статика в dist/
pnpm preview   # посмотреть собранное локально
```

## Разработка

```bash
uvx pre-commit install   # один раз: gitleaks, Prettier и ESLint перед коммитом
pnpm check               # формат, линт, типы, тесты
pnpm gen:api             # после обновления openapi/openapi.json
```

Договорённости для людей и агентов — `AGENTS.md`. Зачем проект — `docs/intent.md`,
устройство — `docs/architecture.md`, решения — `docs/adr/`, фичи — `docs/specs/`,
контракты модулей — `src/README.md` и `README.md` в каждом модуле.

## Безопасность и лицензия

Об уязвимостях — приватно, см. [`SECURITY.md`](SECURITY.md). Лицензия — [AGPL-3.0](LICENSE).

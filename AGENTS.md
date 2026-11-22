# AtomicTasks — web

Веб-клиент трекера AtomicTasks на React + Vite + TypeScript. Вся бизнес-логика в бэкенде:
клиент показывает данные и отправляет действия по REST. Делается параллельно с Flutter-сайтом
из `mobile-app` — какой останется основным, решится отдельным ADR.

Зачем и что НЕ делаем: `docs/intent.md`. Архитектура: `docs/architecture.md`.
Решения: `docs/adr/`. Спеки фич: `docs/specs/`. Порядок фич: `docs/roadmap.md`.

EGM artifact directory: scratch/egm

## Команды

Node закреплён в `.node-version`, pnpm — в `package.json` (`packageManager`: глобальный pnpm сам переключается на эту версию).

- `pnpm install` — зависимости (в CI — `pnpm install --frozen-lockfile`)
- `pnpm dev` — dev-сервер с hot reload на http://localhost:5173, `/api` проксируется в бэкенд
- `pnpm check` — всё сразу: `format:check`, `lint`, `typecheck`, `test`
- `pnpm format` — Prettier, `pnpm lint` — ESLint, `pnpm typecheck` — `tsc -b`, `pnpm test` — Vitest
- `pnpm build` — статика в `dist/`
- `pnpm gen:api` — Orval: модели, функции и хуки TanStack Query из `openapi/openapi.json` в `src/api/generated/`
- `uvx pre-commit install` — один раз после клонирования: gitleaks, Prettier и ESLint перед коммитом

- `docker build -t atomic-tasks-web .` и `deploy/smoke.sh http://localhost:8080` — образ сайта и проверка ответов
  nginx (запуск с ограничениями прода — `docs/deploy.md`, п. 2)

Перед тем как считать работу законченной: `pnpm check` и `pnpm build` проходят. Изменил `Dockerfile` или
`deploy/` — ещё образ и `deploy/smoke.sh`.

## Структура

- `src/` — код. Карта модулей — `src/README.md`.
- `openapi/openapi.json` — закреплённая версия контракта бэкенда, из неё генерируется клиент (`orval.config.ts`).
- `docs/` — intent, architecture, roadmap, ADR, спеки.
- `deploy/` — прод: конфиг nginx (fallback, кэш, CSP), compose за Traefik, `deploy.sh`, `smoke.sh`. Runbook — `docs/deploy.md`.
- `scratch/` — черновики и артефакты EGM, не коммитится.

Раскладка `src/` (ADR 0002): `app/` — вход и оболочка, `api/` — клиент к бэкенду, `auth/` — сессия,
`features/<name>/` — экраны и логика одной области, `shared/ui/` и `shared/lib/` — общее.
Импорты направлены вниз: `app → features → auth → api, shared/*`; фичи не импортируют друг друга.

## Контракты модулей (README по EGM, ADR 0002)

- У каждого модуля (`app/`, `api/`, `auth/`, каждая `features/<name>/`, `shared/ui/`, `shared/lib/`) есть
  `README.md` по шаблону `docs/module-readme-template.md`: Overview, Interface, Invariants, Side Effects,
  Verification. В папке только с подпапками (`src/`, `features/`) — Blueprint: индекс дочерних контрактов.
- Прежде чем менять модуль, прочитай его `README.md`. Invariants нарушать нельзя — если нужно, сначала
  спека или ADR.
- Новый модуль — сразу с `README.md`. Изменился Interface, Invariants или Side Effects — обнови README
  в том же коммите.
- Только то, что есть в коде: никаких планов и догадок в контракте. Заголовки разделов — по-английски
  (их ищут инструменты EGM), текст — по-русски.
- Папка отдельного компонента контракт не получает: контракт — на границе модуля.

## Конвенции

- Клиент тонкий: не дублирует правила бэкенда (статусы, приоритеты, запреты) сверх UX-подсказок.
  Приоритет показываем тот, что вернул бэкенд.
- Запросы к API — только через сгенерированные хуки и функции из `src/api/generated/` (Orval).
  Руками `fetch` к бэкенду не пишем, `src/api/generated/` не правим — только `pnpm gen:api`.
- Адрес API в коде не пишем: веб и API на одном хосте (ADR 0003).
- Компоненты — функции, именованный экспорт, один компонент верхнего уровня на файл, имя файла = имя компонента.
- Сначала возможности платформы (`<dialog>`, `popover`, `<details>`, формы), потом библиотеки.
- Идентификаторы — только по-английски. Комментарии и docs можно по-русски.

## Тесты

Только оправданные: логика состояния и форматирования (что показать при таком ответе API),
нетривиальные хуки. Не тестируем вёрстку, тривиальные компоненты и сгенерированный SDK.
Файлы `*.test.ts(x)` рядом с кодом.

## Git

- Коммитить и пушить только по явной просьбе пользователя.
- Перед коммитом: `pnpm check` чистый.
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`.
  Один коммит — одно логическое изменение. Если работа по спеке — в теле `Spec: docs/specs/NNNN-...`.
- Ветки: `feat/NNNN-short-name` для фич по спеке, `fix/...` для исправлений.
- Не коммитить `.env*` (кроме `.env.example`), `*.local.md`, `scratch/`.
- Никогда не переписывать историю `main` и не делать force push.

## Безопасность — чеклист перед сдачей работы

- Всё, что попало в бандл, публично. Никаких секретов в коде и в переменных `VITE_*`.
  `ATOMIC_DEV_TOKEN` живёт только в dev-прокси (Node) и только для локальной разработки.
- Токены в браузер не попадают: сессия — httpOnly-cookie бэкенда (ADR 0003). Ничего чувствительного
  в `localStorage` / `sessionStorage` (ESLint это запрещает).
- Тексты задач и папок — данные пользователя: только как текст, без `dangerouslySetInnerHTML` (запрещено
  ESLint), не логировать, не вставлять в URL целиком.
- Внешние ссылки и redirect-адреса — только из конфигурации, не из ответа сервера и не из query-параметров.
- Новая зависимость — объяснить, зачем она, проверить, что пакет живой и без лишних транзитивных зависимостей.

В конце отчёта отдельно напиши, что проверено по безопасности и что вызывает сомнения.

## Процесс (SDD + EGM)

- Фича начинается со спеки: `/new-spec` → `docs/specs/NNNN-name/` (spec, plan, tasks), реализация — по `tasks.md`.
- Перед реализацией заметной спеки — Goldfish-ревью: `/egm:egm-review` (большая фича) или `/egm:egm-lite`
  (небольшая). Отчёты — в `scratch/egm/`, принятые правки — в спеку.
- Решение поменялось по ходу — сначала спека или ADR, потом код.
- Перед релизом — `/egm:egm-drift-report` по `src/**/README.md` и `docs/architecture.md`.
- Если фиче нужно то, чего нет в `openapi/openapi.json`, — это спека в `../backend`, а не обход в клиенте.

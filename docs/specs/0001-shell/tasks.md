# Задачи

- [x] Зависимости `@tanstack/react-router` и `react-aria-components` — `pnpm build` проходит, размер бандла
      до/после записан (ADR 0004)
- [x] `api/errors.ts`: `describeApiError`, `isRetryableError`, `isUnauthorized` + тесты на каждую строку
      сценария 5 (сеть, `502/503/504`, `500`, `401`, `403`, `404`, `400/409/422` с `detail` и без,
      `422` валидации FastAPI, прочий `4xx`, `SyntaxError`) — `pnpm test` зелёный
- [x] `app/queryClient.ts`: `createQueryClient()` — повторы по `shouldRetryQuery`, `401` не на `me` инвалидирует
      `me` с `cancelRefetch: false` — тесты на повторы, инвалидацию, отсутствие петли для `me`, мутации
- [x] `auth/`: `toSessionState`, `useSession`, `SessionGate`, `SignedOutScreen` — тесты `toSessionState`:
      загрузка, вошёл, `401`, `401` при старых данных, ошибка, `5xx` при старых данных
- [x] `shared/ui/`: `theme.css`, `Button`, `Link`, `ErrorMessage`, `Loading` — без импортов `api/`, `auth/`, `app/`
- [x] `app/`: страницы `HomePage`, `NotFoundPage`, `CrashScreen`, `UserName`, `Layout`, `AriaRouterBridge`,
      затем `router.tsx` и `App` — `pnpm typecheck` проходит, ссылка на несуществующий путь не компилируется
- [x] Проверка в `pnpm dev`: главная, `/nope`, переход по ссылке без перезагрузки; с `ATOMIC_API_URL`
      на закрытый порт — «Нет связи с сервером» после 1 + 2 запросов `me`
- [x] Документы: README `app/`, `api/`, `auth/`, `shared/`, `shared/ui/`, `src/`; `AGENTS.md` — направление
      импортов; `docs/architecture.md` — «Стек» и «Оболочка»; ADR 0004 и индекс ADR; `docs/roadmap.md` —
      0001 готова — `pnpm check` и `pnpm build` проходят

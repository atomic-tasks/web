# План

## Роутер и UI-кит

Сравнение вариантов и решение — ADR 0004: **TanStack Router** (маршруты в коде) и **React Aria Components**
со своим CSS на токенах.

## Экраны и навигация

```
/          Главная — заглушка «Дерево задач появится здесь» (заменит 0004)
*          «Не найдено» — ссылка на главную
```

Все экраны — внутри корневого маршрута с разметкой `Layout`: шапка (название-ссылка на `/`, имя
пользователя, индикатор бэкенда) и `<main>`, внутри которого `SessionGate` и `<Outlet/>`. Ошибка кода
экрана ловится внутри `<main>`, шапка остаётся.

`SessionGate` по состоянию сессии показывает вместо `<Outlet/>`: «Загрузка…» / «Вы не вошли» (`401`) /
`ErrorMessage` с «Повторить» (прочие ошибки `me`) / содержимое (вошёл).

## Модули и контракты

- **`app/`** (меняется).
  - `App.tsx` — `QueryClientProvider` с клиентом из `createQueryClient()` (вместо `new QueryClient()`)
    и `RouterProvider` TanStack Router; подключает `shared/ui/theme.css`.
  - `router.tsx` — дерево маршрутов, `defaultErrorComponent: CrashScreen`, `defaultNotFoundComponent:
NotFoundPage`, регистрация типа роутера (`Register`).
  - `queryClient.ts` — `createQueryClient()`, `shouldRetryQuery`, `MAX_QUERY_RETRIES`.
  - `Layout.tsx` (+ `Layout.css`), `AriaRouterBridge.tsx` (`RouterProvider` React Aria внутри корневого
    маршрута, `RouterConfig` augmentation), `HomePage.tsx`, `NotFoundPage.tsx`, `CrashScreen.tsx`,
    `UserName.tsx`; `HealthStatus` переезжает в шапку.
  - README: Interface — новое; Invariants — маршруты только в `router.tsx`, `QueryClient` один, правило `401`;
    Side Effects — история браузера, запросы `/health` и `/api/v1/me`.
- **`auth/`** (новый). `session.ts` — `SessionState`, `toSessionState({ data, error })`; `useSession.ts` —
  состояние + `retry()`; `SessionGate.tsx`; `SignedOutScreen.tsx` (подсказка про `ATOMIC_DEV_TOKEN` только
  при `import.meta.env.DEV`). Спека 0003 добавит сюда вход и выход.
- **`api/`** (меняется). `errors.ts`: `describeApiError`, `isRetryableError`, `isUnauthorized`. Сужение
  только через `instanceof ApiError`: в `error` бывают `TypeError` (обрыв сети), `SyntaxError`, `AbortError`.
  README и комментарий `ErrorType` в `fetcher.ts` уточняют это.
- **`shared/ui/`** (новый). `theme.css` — токены (цвета, отступы, радиусы, шрифт), светлая и тёмная схема;
  `Button` (React Aria: `onPress` и единые состояния hover/press/focus для мыши, тача и клавиатуры), `Link`
  (`createLink` TanStack Router над `Link` React Aria — адрес проверяет `tsc`), `ErrorMessage`, `Loading`.
- **Индексы**: `src/README.md` — `auth/` и `shared/`; `shared/README.md` — `ui/`.
- **`main.tsx`** не меняется.

Импорты: `app → features → auth → api, shared/*` (правка `AGENTS.md`, как в ADR 0002); `shared/ui`
импортирует только React Aria и TanStack Router.

## Данные и состояние

- `GET /api/v1/me` — ключ `getGetMeQueryKey()`, `staleTime` 5 минут (пользователь меняется редко;
  `refetchOnWindowFocus` по умолчанию — после 5 минут перепроверит сессию при возврате на вкладку).
- `toSessionState`, порядок проверок: `401` → `signedOut` (даже если в кэше старый пользователь) →
  есть `data` → `signedIn` → есть `error` → `error` → иначе `loading`. `isFetching` не используется.
- `createQueryClient()`:
  - `queries.retry: shouldRetryQuery` — `failureCount < 2 && isRetryableError(error)`; мутации — по умолчанию
    без повторов.
  - `QueryCache.onError` / `MutationCache.onError`: `401` на любом запросе, кроме самого `me` (сравнение
    `queryHash`), — `invalidateQueries(me, { cancelRefetch: false })`: несколько `401` подряд не обрывают
    идущий запрос `me`. Клиент доступен обработчикам через замыкание.
- `CrashScreen` — только ошибки кода; «Перезагрузить» перезагружает страницу.
- Ничего не храним в `localStorage`/`sessionStorage`.

## API

- `health` — индикатор в шапке (как сейчас).
- `get_me` — пользователь и признак входа.
- Новых эндпоинтов не нужно. Пожелания бэкенду — в «Открытых вопросах» спеки.

## Риски

- Бэкенд параллельно делает спеку 0008 (cookie-сессии): локально проверяем с PAT через dev-прокси
  и с недоступным бэкендом (`ATOMIC_API_URL` на закрытый порт → `502` → «Нет связи»). Cookie — спека 0003.
- `index.html` на любой путь отдаёт пока только dev-сервер Vite; в проде — спека 0002.
- Бандл: 78.9 → 118.7 kB gzip (ADR 0004).
- Безопасность: `detail` выводится только как текст (React экранирует, ESLint запрещает сырой HTML);
  подсказка про dev-токен вырезается из прод-бандла; направление импортов CI не проверяет — только ревью.

# app

## Overview

Оболочка приложения: провайдеры, роутер и разметка всех экранов. Содержимое маршрутов видно только вошедшему
пользователю, ему же — нижняя панель `TabBar` («Текущие», «Проводник»). Верхнюю панель рисует сам экран, меню
профиля (имя и «Выйти») подставляет `app/` слотом `actions`. Экраны предметной области — в `features/`.

## Interface

- `App` (`App.tsx`) — корневой компонент, монтируется из `src/main.tsx`: `QueryClientProvider` с единственным
  `QueryClient` и `RouterProvider` TanStack Router. Подключает токены `shared/ui/theme.css`.
- `router` (`router.tsx`) — дерево маршрутов: корень с `Layout`, `/` → редирект на `/current`, `/current` (search `status`: `in_progress` | `todo`), `/explorer` и
  `/explorer/$folderId` (search `closed=1`), `/design` → `DesignRoute`; `defaultNotFoundComponent` —
  `NotFoundPage`, `defaultErrorComponent` — `CrashScreen`. Регистрирует тип роутера (`Register`): адреса в
  `Link` проверяет `tsc`.
- `createQueryClient`, `shouldRetryQuery`, `MAX_QUERY_RETRIES` (`queryClient.ts`) — настройки кэша: повтор
  только сети и `5xx` (до 2 раз), мутации без повторов, `401` перезапрашивает `me`.
- `Layout` (`Layout.tsx`) — разметка корневого маршрута: `<main>` с `SessionGate` из `auth/` и, при `signedIn`, `TabBar`;
  внизу `<main>` оставлено место под панель.
- `ProfileMenu` (`ProfileMenu.tsx`) — кнопка с именем пользователя (длинное обрезается многоточием, полное — в `aria-label`) и окно с `LogoutButton` из `auth/`.
- `AriaRouterBridge` (`AriaRouterBridge.tsx`) — `RouterProvider` React Aria: ссылки и меню React Aria
  переходят через TanStack Router.
- `DesignRoute` (`DesignRoute.tsx`) — маршрут `/design`: витрина `DesignPage` (токены, компоненты, подбор оттенка акцента) только в
  `pnpm dev`, в продовой сборке — `NotFoundPage`; `DesignPage` подгружается динамически внутри `import.meta.env.DEV`.
- `NotFoundPage`, `CrashScreen`, `DesignPage` — экраны, используются только внутри `app/`.

## Invariants

- `app/` импортирует `features/`, `auth/`, `shared/` и `api/`, но его не импортирует никто, кроме `src/main.tsx`.
- Маршруты объявляются только в `router.tsx`. В адресе — только идентификаторы, без текстов задач и папок.
- `QueryClient` один на приложение и создаётся только здесь (`createQueryClient` в `App.tsx`).
- `401` на любом запросе, кроме `GET /api/v1/me`, инвалидирует `me`; сам `me` себя не инвалидирует.
- В бэкенд ходит только через хуки из `../api/generated/`.
- Витрина `/design` не попадает в продовый бандл (проверка: `rg -l 'Витрина токенов' dist` пусто).
- `CrashScreen` не показывает текст исключения: для `ApiError` — `describeApiError`, иначе общий текст.

## Side Effects

- Роутер читает и меняет историю браузера (History API).
- `QueryCache`/`MutationCache` при `401` перезапрашивают `GET /api/v1/me`.
- `CrashScreen` по кнопке «Перезагрузить» перезагружает страницу.
- `DesignPage` (только dev) пишет `--accent-hue` в `document.documentElement.style` и убирает при размонтировании.

## Verification

- Run: `pnpm check`

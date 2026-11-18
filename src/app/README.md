# app

## Overview

Оболочка приложения: провайдеры, роутер и разметка всех экранов. Шапка (название, пользователь,
индикатор бэкенда) видна всегда, содержимое маршрутов — только вошедшему пользователю. Пока здесь же
главная-заглушка и страница «Не найдено»; экраны предметной области будут в `features/`.

## Interface

- `App` (`App.tsx`) — корневой компонент, монтируется из `src/main.tsx`: `QueryClientProvider` с единственным
  `QueryClient` и `RouterProvider` TanStack Router. Подключает токены `shared/ui/theme.css`.
- `router` (`router.tsx`) — дерево маршрутов: корень с `Layout`, `/` → `HomePage`; `defaultNotFoundComponent` —
  `NotFoundPage`, `defaultErrorComponent` — `CrashScreen`. Регистрирует тип роутера (`Register`): адреса в
  `Link` проверяет `tsc`.
- `createQueryClient`, `shouldRetryQuery`, `MAX_QUERY_RETRIES` (`queryClient.ts`) — настройки кэша: повтор
  только сети и `5xx` (до 2 раз), мутации без повторов, `401` перезапрашивает `me`.
- `Layout` (`Layout.tsx`) — разметка корневого маршрута: шапка и `<main>` с `SessionGate` из `auth/`.
- `AriaRouterBridge` (`AriaRouterBridge.tsx`) — `RouterProvider` React Aria: ссылки и меню React Aria
  переходят через TanStack Router.
- `HomePage`, `NotFoundPage`, `CrashScreen`, `UserName`, `HealthStatus` — экраны и части шапки, используются
  только внутри `app/`.

## Invariants

- `app/` импортирует `auth/`, `shared/` и `api/`, но его не импортирует никто, кроме `src/main.tsx`.
- Маршруты объявляются только в `router.tsx`. В адресе — только идентификаторы, без текстов задач и папок.
- `QueryClient` один на приложение и создаётся только здесь (`createQueryClient` в `App.tsx`).
- `401` на любом запросе, кроме `GET /api/v1/me`, инвалидирует `me`; сам `me` себя не инвалидирует.
- В бэкенд ходит только через хуки из `../api/generated/`.
- `CrashScreen` не показывает текст исключения: для `ApiError` — `describeApiError`, иначе общий текст.

## Side Effects

- Роутер читает и меняет историю браузера (History API).
- `HealthStatus` при монтировании делает один запрос `GET /health` без повторов (`retry: false`).
- `QueryCache`/`MutationCache` при `401` перезапрашивают `GET /api/v1/me`.
- `CrashScreen` по кнопке «Перезагрузить» перезагружает страницу.

## Verification

- Run: `pnpm check`

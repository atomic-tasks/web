# api

## Overview

Единственная точка общения с бэкендом. Клиент генерирует Orval из закреплённой спеки
`openapi/openapi.json` (`orval.config.ts`): модели, функции и хуки TanStack Query с именами из `operation_id`.
Все запросы проходят через HTTP-слой `fetcher.ts` (ADR 0001, 0003).

## Interface

- Хуки (`generated/endpoints.ts`) — `useXxx` для чтения (`useGetMe`, `useBrowseFolder`, …) и для изменений
  (`useCreateTask`, `useSetTaskStatus`, …), а также ключи запросов `getXxxQueryKey` для инвалидации кэша.
- Функции (`generated/endpoints.ts`) — те же запросы без React: `getMe()`, `createTask(body)`, …
  Возвращают тело успешного ответа.
- Модели (`generated/model/`) — типы запросов и ответов: `MeResponse`, `TaskResponse`, `TaskStatus`, …
- `ApiError` (`fetcher.ts`) — ошибка ответа не 2xx: `status` и `body`. Это `error` в хуках.
- `apiFetch` (`fetcher.ts`) — мутатор Orval. Напрямую из кода приложения не вызывается.

## Invariants

- `generated/` создаётся только командой `pnpm gen:api` и руками не правится. CI проверяет,
  что она совпадает с `openapi/openapi.json`.
- Запросы идут на тот же хост, где открыт сайт: пути из спеки уже начинаются с `/api/v1` (ADR 0003).
  Адрес API в коде не пишем.
- `apiFetch` всегда ставит `credentials: "include"` — браузер отправляет cookie сессии бэкенда.
- Ответ не 2xx всегда превращается в `ApiError`; успешный — в тело ответа (для `204` — `undefined`).
- Токены и заголовок `Authorization` в браузерном коде не формируются.

## Side Effects

- Сетевые запросы `fetch` к `/api/v1/*` и `/health` того же хоста.
- Хуки читают и пишут кэш TanStack Query из `QueryClientProvider` (`app/`).

## Verification

- Run: `pnpm gen:api && git status --porcelain src/api/generated` (пусто) и `pnpm check`

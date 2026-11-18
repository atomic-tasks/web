# auth

## Overview

Сессия и текущий пользователь. Вошёл ли пользователь, сайт узнаёт только по `GET /api/v1/me`
(ADR 0003): ответ — вошёл, `401` — не вошёл. Вход и выход здесь пока нет.

## Interface

- `useSession()` (`useSession.ts`) — состояние сессии (`SessionState`) и `retry()` для перезапроса `me`.
- `toSessionState`, `SessionState`, `MeQuery` (`session.ts`) — чистое правило: `401` → `signedOut` (даже если
  в кэше остался пользователь), есть данные → `signedIn`, иначе ошибка → `error`, иначе `loading`.
- `SessionGate` (`SessionGate.tsx`) — показывает `children` только при `signedIn`; иначе `Loading`,
  `SignedOutScreen` или `ErrorMessage` с «Повторить». Используется оболочкой `app/`.
- `SignedOutScreen` (`SignedOutScreen.tsx`) — экран «Вы не вошли».

## Invariants

- Источник правды о входе — только `GET /api/v1/me` (`useGetMe`); токенов и cookie код не читает.
- Подсказка про `ATOMIC_DEV_TOKEN` выводится только при `import.meta.env.DEV` и в прод-бандл не попадает.
- Импортирует только `api/` и `shared/ui/`.

## Side Effects

- `useSession` делает запрос `GET /api/v1/me` (кэш TanStack Query, `staleTime` 5 минут).

## Verification

- Run: `pnpm check`

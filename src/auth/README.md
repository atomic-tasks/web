# auth

## Overview

Сессия и текущий пользователь. Вошёл ли пользователь, сайт узнаёт только по `GET /api/v1/me`
(ADR 0003): ответ — вошёл, `401` — не вошёл. Вход и выход — через эндпоинты бэкенда (спека 0003).

## Interface

- `useSession()` (`useSession.ts`) — состояние сессии (`SessionState`) и `retry()` для перезапроса `me`.
- `toSessionState`, `SessionState`, `MeQuery` (`session.ts`) — чистое правило: `401` → `signedOut` (даже если
  в кэше остался пользователь), есть данные → `signedIn`, иначе ошибка → `error`, иначе `loading`.
- `SessionGate` (`SessionGate.tsx`) — показывает `children` только при `signedIn`; иначе `Loading`,
  `SignedOutScreen` или `ErrorMessage` с «Повторить». Используется оболочкой `app/`.
- `SignedOutScreen` (`SignedOutScreen.tsx`) — экран «Вы не вошли»: ошибка `?login_error=` и кнопка «Войти».
- `LogoutButton` (`LogoutButton.tsx`) — «Выйти»: `useLogout`, при успехе — `window.location.assign("/")`, ошибка —
  `ErrorMessage` рядом. Используется шапкой `app/`.
- `loginHref`, `loginErrorMessage`, `LOGIN_ERROR_PARAM` (`login.ts`) — адрес входа с `return_to` = путь и query
  текущей страницы без `login_error`; текст ошибки входа по коду (`access_denied`, `expired`, иначе общий).

## Invariants

- Источник правды о входе — только `GET /api/v1/me` (`useGetMe`); токенов и cookie код не читает.
- Подсказка про `ATOMIC_DEV_TOKEN` выводится только при `import.meta.env.DEV` и в прод-бандл не попадает.
- Вход — только полная навигация браузера по `<a href>` (`AnchorButton`), не `fetch` и не клиентский роутер.
- `return_to` — только путь и query, без хоста. Код ошибки входа на экран не выводится — только наш текст.
- Импортирует только `api/` и `shared/ui/`.

## Side Effects

- `useSession` делает запрос `GET /api/v1/me` (кэш TanStack Query, `staleTime` 5 минут).
- `SignedOutScreen` читает `window.location`; «Войти» уводит браузер на `/api/v1/auth/login`.
- `LogoutButton` делает `POST /api/v1/auth/logout` и перезагружает страницу на `/`.

## Verification

- Run: `pnpm check`

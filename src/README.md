# src

## Overview

Код веб-клиента. Точка входа — `main.tsx`: монтирует `App` из `app/` в `#root` из `index.html`.
Раскладка и правила импортов — ADR 0002 и раздел «Структура» в `AGENTS.md`.

## Local Interface & Invariants

- `main.tsx` — монтирует `App` в `StrictMode`; падает с ошибкой, если в `index.html` нет `#root`.

## Subdirectories & Boundaries

- `app/`: [README](./app/README.md) — оболочка: провайдеры, роутер, разметка экранов.
- `api/`: [README](./api/README.md) — клиент к бэкенду: хуки и функции от Orval, HTTP-слой с cookie и ошибками,
  тексты ошибок для пользователя.
- `auth/`: [README](./auth/README.md) — сессия и текущий пользователь по `GET /api/v1/me`.
- `shared/`: [README](./shared/README.md) — общий код без знания о предметной области.

## Verification

- Run: `pnpm check && pnpm build`

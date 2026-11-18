# src

## Overview

Код веб-клиента. Точка входа — `main.tsx`: монтирует `App` из `app/` в `#root` из `index.html`.
Раскладка и правила импортов — ADR 0002 и раздел «Структура» в `AGENTS.md`.

## Local Interface & Invariants

- `main.tsx` — монтирует `App` в `StrictMode`; падает с ошибкой, если в `index.html` нет `#root`.

## Subdirectories & Boundaries

- `app/`: [README](./app/README.md) — оболочка приложения: корневой компонент `App`.
- `api/`: [README](./api/README.md) — клиент к бэкенду: хуки и функции от Orval, HTTP-слой с cookie и ошибками.

## Verification

- Run: `pnpm check && pnpm build`

# shared/ui

## Overview

Токены оформления и базовые компоненты. Поведение и доступность — React Aria Components, вид — свой CSS
на токенах из `theme.css` (спека 0001). Компоненты ничего не знают о задачах, папках и API.

## Interface

- `theme.css` — токены в CSS-переменных (`--color-*`, `--space-*`, `--radius`, `--font-*`), светлая и тёмная
  схема по `prefers-color-scheme`, базовые стили `body`. Подключается один раз в `app/App.tsx`.
- `Button` (`Button.tsx`) — кнопка React Aria (`onPress`), `variant`: `primary` | `secondary`.
- `Link` (`Link.tsx`) — ссылка внутри сайта: `to`/`params` проверяет TanStack Router, отрисовка — React Aria.
- `ErrorMessage` (`ErrorMessage.tsx`) — `message`, необязательные `onRetry` и `retryLabel`; `role="alert"`.
- `Loading` (`Loading.tsx`) — индикатор загрузки, `role="status"`.

## Invariants

- Не импортирует `api/`, `auth/`, `app/` и фичи; из библиотек — только React Aria и TanStack Router (`Link`).
- Цвета, отступы и радиусы — только через переменные `theme.css`.
- CSS-классы глобальные, с префиксом по имени компонента (`.Button`, `.ErrorMessage-text`).
- Текст в компоненты приходит готовым и выводится только как текст.

## Side Effects

- None (стили `theme.css` действуют на всю страницу).

## Verification

- Run: `pnpm check`

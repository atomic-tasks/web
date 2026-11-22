# shared/ui

## Overview

Токены оформления и базовые компоненты. Поведение и доступность — React Aria Components, вид — свой CSS на токенах
из `tokens.css` (ADR 0004, ADR 0006, спека 0004). Компоненты ничего не знают о задачах, папках и API.

## Interface

- `theme.css` — вход оформления: порядок слоёв `@layer reset, base, components;`, сброс, база (`body`, `:focus-visible`,
  `accent-color`, `scroll-padding`). Подключается первым CSS-импортом в `app/App.tsx`; подтягивает `tokens.css`.
- `tokens.css` — единственное место литералов значений: цвета (светлая/тёмная схема через `light-dark()`), `--space-*`,
  `--radius-*`, `--font-size-*`, `--border-width`, `--focus-ring-*`, `--duration-*`, `--target-size`, `--content-width`,
  `--dock-height`, `--glass-*`, `--shadow-floating`. `--accent-hue` — параметр цвета акцента (допустимо 5–35).
  Контраст пар — в `docs/specs/0004-design-system/plan.md`.
- `Button` (`Button.tsx`) — кнопка React Aria (`onPress`), `variant`: `primary` | `secondary`.
- `AnchorButton` (`AnchorButton.tsx`) — обычный `<a href>` с видом `Button`, для полной навигации за пределы SPA;
  `variant` как у `Button`.
- `Link` (`Link.tsx`) — ссылка внутри сайта: `to`/`params` проверяет TanStack Router, отрисовка — React Aria;
  `variant`: `inline` (по умолчанию) | `bare` (без вида ссылки, для навигации).
- `TabBar` (`TabBar.tsx`) — плавающая стеклянная нижняя навигация: `aria-label`, `items: { to, label, icon }[]`;
  текущему пункту роутер ставит `aria-current="page"`. Использует `Glass.css`.
- `Glass.css` — класс `.Glass`: стекло и единый сплошной запасной вид.
- `icons/CurrentIcon`, `icons/FolderIcon` — временные значки (inline-SVG, `currentColor`, `aria-hidden`).
- `ErrorMessage` (`ErrorMessage.tsx`) — `message`, необязательные `onRetry` и `retryLabel`; `role="alert"`.
- `Loading` (`Loading.tsx`) — индикатор загрузки, `role="status"`.

## Invariants

- Не импортирует `api/`, `auth/`, `app/` и фичи; из библиотек — только React Aria и TanStack Router (`Link`, тип `LinkProps`).
- Цвета, размеры, радиусы, тени, длительности — только токены; литералы значений живут только в `tokens.css`
  (проверка — команда из `plan.md` спеки 0004). Исключения: `0`, `none`, `auto`, `transparent`, `currentColor`, `inherit`, `100%`.
- CSS-классы глобальные, с префиксом по имени компонента (`.Button`, `.TabBar-list`), стили компонентов — в `@layer components`;
  `!important` нет; `theme.css` — первый CSS-импорт приложения, иначе слои выстроятся иначе.
- Любая прозрачность имеет сплошной запасной вид (`Glass.css`); стекло — только для элементов управления поверх содержимого.
- Интерактивные элементы ≥`--target-size`; состояние не передаётся только цветом.
- Атрибутов `style` и записи стилей из JS в коде нет (CSP, ADR 0005; ESLint запрещает `style` в разметке).
- Текст в компоненты приходит готовым и выводится только как текст.

## Side Effects

- None (стили `theme.css`/`tokens.css` действуют на всю страницу: `color-scheme`, порядок слоёв, `body`).

## Verification

- Run: `pnpm check`

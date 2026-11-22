# План

Критерии — в `spec.md`. Здесь: файлы, значения, интерфейсы, проверки.

## Экраны и навигация

Новых пользовательских экранов нет. Добавляется страница `/design` (`src/app/DesignPage.tsx`), только для `pnpm dev`:
токены, существующие компоненты, нижняя панель, ползунок оттенка акцента. Маршрут `/design` регистрируется всегда (тип
роутера не меняется), но в продовой сборке `DesignPage` не подгружается: динамический `import()` лежит внутри
`if (import.meta.env.DEV)`, Vite вырезает ветку, маршрут показывает `NotFoundPage`. В dev страница лежит внутри `Layout`
и `SessionGate`: открыть её можно при работающем входе или с `ATOMIC_DEV_TOKEN` (как весь `pnpm dev`).
На странице панель показывает два пункта: «Главная» (`/`) и «Витрина» (`/design`). В `Layout` панель не монтируется (0005).

## Файлы

| Путь                                                                                  | Действие | Что                                                                                                                            |
| ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/shared/ui/tokens.css`                                                            | create   | Значения и семантика (таблицы ниже), `--accent-hue`, `--glass-*`, `--shadow-floating`                                          |
| `src/shared/ui/theme.css`                                                             | modify   | `@layer reset, base, components;`, `color-scheme`, база (`body`, `:focus-visible`, `scroll-padding`), `@import "./tokens.css"` |
| `src/shared/ui/Glass.css`                                                             | create   | Класс `.Glass` в `@layer components` и единый сплошной запасной вид                                                            |
| `src/shared/ui/TabBar.tsx`, `TabBar.css`                                              | create   | Нижняя навигация                                                                                                               |
| `src/shared/ui/icons/CurrentIcon.tsx`                                                 | create   | Значок пункта «Текущие» (звезда/список), временный                                                                             |
| `src/shared/ui/icons/FolderIcon.tsx`                                                  | create   | Значок пункта «Проводник», временный                                                                                           |
| `src/shared/ui/Link.tsx`, `Link.css`                                                  | modify   | Проп `variant?: "inline" \| "bare"` → `data-variant`; `bare` без цвета и подчёркивания; литерал `2px` → токен                  |
| `src/shared/ui/Button.css`                                                            | modify   | Токены, слой `components`, граница вторичной кнопки — `--color-border-strong`, цель ≥`--target-size`                           |
| `src/shared/ui/ErrorMessage.css`                                                      | modify   | Токены, слой `components`                                                                                                      |
| `src/shared/ui/AnchorButton.tsx`                                                      | —        | Не меняется; использует `Button.css`, проверяется на витрине                                                                   |
| `src/app/Layout.css`                                                                  | modify   | Токены (`font-size: 1.25rem` → `--font-size-title`), слой `components`; `--content-width` 960→720px                            |
| `src/app/DesignPage.tsx`, `DesignPage.css`                                            | create   | Витрина                                                                                                                        |
| `src/app/router.tsx`                                                                  | modify   | Маршрут `/design` (ленивый, только dev)                                                                                        |
| `src/app/App.tsx`                                                                     | modify   | Если нужно: `theme.css` остаётся первым CSS-импортом (сейчас так)                                                              |
| `index.html`                                                                          | modify   | `color-scheme`, `viewport-fit=cover`, два `theme-color` с `media`, две ссылки на иконку с `media`                              |
| `public/favicon-light.svg`, `favicon-dark.svg`                                        | create   | Временные иконки (каталога `public/` сейчас нет)                                                                               |
| `deploy/smoke.sh`                                                                     | modify   | Проверка `/favicon-light.svg`: код 200, `content-type: image/svg+xml`, тело содержит `<svg`                                    |
| `eslint.config.js`                                                                    | modify   | `no-restricted-syntax` для `JSXAttribute[name.name='style']`                                                                   |
| `src/shared/ui/README.md`, `src/app/README.md`                                        | modify   | Interface, Invariants, Side Effects                                                                                            |
| `AGENTS.md`                                                                           | modify   | Строка о политике браузеров (шаг 0)                                                                                            |
| `docs/architecture.md`, `docs/roadmap.md`, `docs/adr/0006-design-tokens-and-glass.md` | modify   | Раздел «Оболочка»; статусы; ADR                                                                                                |

## Токены

Единственный источник значений. Контраст рассчитан по формуле WCAG 2.2 (относительная яркость); ниже — к `--color-bg` / `--color-surface`.

**Цвета (светлая / тёмная).**

| Токен                    | Светлая                                                     | Тёмная                                         | Контраст светлая (bg / surface)    | Контраст тёмная (bg / surface) |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------------- | ---------------------------------- | ------------------------------ |
| `--color-bg`             | `#f2f2f7`                                                   | `#0b0b0d`                                      | —                                  | —                              |
| `--color-surface`        | `#ffffff`                                                   | `#1c1c1e`                                      | —                                  | —                              |
| `--color-surface-sunken` | `#e8e8ee`                                                   | `#2c2c2e`                                      | — (фон поля, дорожки)              | —                              |
| `--color-text`           | `#111114`                                                   | `#f5f5f7`                                      | 16.9 / 18.9                        | 18.1 / 15.6                    |
| `--color-text-muted`     | `#5e5e66`                                                   | `#98989f`                                      | 5.8 / 6.4                          | 6.9 / 5.9                      |
| `--color-border`         | `rgb(0 0 0 / 0.10)`                                         | `rgb(255 255 255 / 0.12)`                      | декоративный разделитель           | декоративный                   |
| `--color-border-strong`  | `#767680`                                                   | `#7a7a82`                                      | 4.0 / 4.5 (порог 3)                | 4.6 / 4.0 (порог 3)            |
| `--color-accent`         | `oklch(0.55 0.22 var(--accent-hue))` ≈`#d3013d`             | `oklch(0.68 0.2 var(--accent-hue))` ≈`#fb5668` | 4.9 / 5.4                          | 6.2 / 5.4                      |
| `--color-accent-text`    | `#ffffff`                                                   | `#111114`                                      | на акценте 5.4                     | на акценте 5.9                 |
| `--color-accent-soft`    | `color-mix(in oklab, var(--color-accent) 14%, transparent)` | то же                                          | фон, текст на нём — `--color-text` | то же                          |
| `--color-focus`          | `var(--color-accent)`                                       | `var(--color-accent)`                          | 4.9 / 5.4 (порог 3)                | 6.2 / 5.4                      |
| `--color-success`        | `#1a7f37`                                                   | `#4cd16b`                                      | 4.6 / 5.1                          | 10.0 / 8.6                     |
| `--color-warning`        | `#9a5b00`                                                   | `#fbbf24`                                      | 4.9 / 5.4                          | 11.8 / 10.2                    |
| `--color-danger`         | `#b42318`                                                   | `#ff6b61`                                      | 5.9 / 6.6                          | 7.1 / 6.1                      |
| `--color-danger-surface` | `#fdecea`                                                   | `#3a1d1b`                                      | текст `--color-danger` на нём 5.75 | 5.49                           |
| `--color-shadow`         | `rgb(0 0 0 / 0.18)`                                         | `rgb(0 0 0 / 0.50)`                            | —                                  | —                              |
| `--color-glass-edge`     | `rgb(255 255 255 / 0.70)`                                   | `rgb(255 255 255 / 0.12)`                      | блик по верхнему краю              | —                              |

Диапазон `--accent-hue`: 5–35 (по умолчанию 18). Контраст `--color-accent` светлой темы на `--color-bg` по оттенкам: 4.91 (5), 4.90 (10), 4.88 (15),
4.87 (20, 25), 4.85 (30), 4.81 (35); тёмной на `--color-surface` — 5.35–5.42. Белый текст на светлом акценте ≥5.37, тёмный на тёмном ≥5.9.
До оттенка 30 цвет в гамме sRGB; на 35 слегка за гаммой, браузер отображает ближайший. Оттенки 40–265 вне диапазона: светлый акцент
выходит за гамму, на 160–225 контраст ниже 4.5:1.

**Значения (общие для обеих тем).**

| Группа   | Токены                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Отступы  | `--space-1` 4px, `-2` 8px, `-3` 12px, `-4` 16px, `-6` 24px, `-8` 32px (как сейчас; новые — с потребителем)                                                                                             |
| Радиусы  | `--radius-sm` 8px, `--radius-md` 12px, `--radius-lg` 20px, `--radius-full` 9999px                                                                                                                      |
| Текст    | `--font-family` (как сейчас), `--font-size-caption` 0.75rem, `--font-size-small` 0.875rem, `--font-size-body` 1rem, `--font-size-title` 1.25rem; `--font-weight-regular` 400, `--font-weight-bold` 700 |
| Линии    | `--border-width` 1px, `--focus-ring-width` 2px, `--focus-ring-offset` 2px                                                                                                                              |
| Движение | `--duration-fast` 120ms, `--duration-base` 220ms, `--ease-standard` `cubic-bezier(0.2, 0, 0, 1)`                                                                                                       |
| Размеры  | `--target-size` 24px, 44px при `@media (any-pointer: coarse)`; `--content-width` 720px                                                                                                                 |
| Слой     | `--z-dock` 20                                                                                                                                                                                          |
| Стекло   | `--glass-bg` `color-mix(in srgb, var(--color-surface) 72%, transparent)`, `--glass-blur` `blur(20px) saturate(180%)`                                                                                   |
| Тень     | `--shadow-floating` `0 var(--space-3) var(--space-8) var(--color-shadow), inset 0 var(--border-width) 0 var(--color-glass-edge)`                                                                       |

Тень задана через токены: через `light-dark()` меняются только цвета, составная тень — нет.

**Контраст подписей панели на стекле** (подложка — `--color-bg`/`--color-surface` под панелью, фон стекла 72%): светлая
подпись `--color-text-muted` ≈6 : 1, акцент ≈5.2 : 1; тёмная — ≈6.5 : 1 и ≈6.0 : 1. Сплошной блок цвета текста под панелью
не считается (текст тонкий). Расчёт повторяется при смене значений.

## Миграция существующих стилей

| Было                                | Стало                                                         | Где                                            |
| ----------------------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `--radius` 6px                      | `--radius-md` 12px (видимое изменение)                        | `Button.css:7`, `ErrorMessage.css:8`           |
| литерал `border-radius: 2px`        | `--radius-sm`                                                 | `Link.css`                                     |
| `--font-size`                       | `--font-size-body`                                            | `theme.css` (`body`)                           |
| `--font-size-small`                 | остаётся                                                      | `ErrorMessage.css`, `Layout.css`               |
| `font-size: 1.25rem`                | `--font-size-title`                                           | `Layout.css:13`                                |
| `--color-focus`                     | `var(--color-accent)`                                         | `var(--color-accent)`                          | 4.9 / 5.4 (порог 3) | 6.2 / 5.4 |
| `--color-border` у вторичной кнопки | `--color-border-strong` (3:1 для границы управляющего)        | `Button.css`                                   |
| `--content-width` 960px             | 720px (колонка уже; проверить экран входа)                    | `Layout.css:29`                                |
| литералы `1px`, `2px`, `2px offset` | `--border-width`, `--focus-ring-width`, `--focus-ring-offset` | `Button.css`, `Link.css`                       |
| `--color-accent`                    | `oklch(0.55 0.22 var(--accent-hue))` ≈`#d3013d`               | `oklch(0.68 0.2 var(--accent-hue))` ≈`#fb5668` | 4.9 / 5.4           | 6.2 / 5.4 |

Алиасов нет: имена меняются сразу в шаге 2, промежуточных состояний с двумя именами не бывает. Видимые изменения
существующих страниц (акцент, радиус, ширина колонки, цели ≥44px на сенсорных экранах) — осознанные; критерий шага 2 — «как задано токенами».

## Интерфейсы

```ts
// src/shared/ui/TabBar.tsx
import type { ComponentProps, ReactNode } from "react";
import type { Link } from "./Link";

export interface TabBarItem {
  to: ComponentProps<typeof Link>["to"]; // проверяет tsc через Register роутера
  label: string; // видимая подпись
  icon: ReactNode; // декоративный значок: <CurrentIcon /> и т.п.
}
export interface TabBarProps {
  "aria-label": string; // имя навигации
  items: readonly TabBarItem[];
}
export function TabBar(props: TabBarProps): JSX.Element;
```

- Разметка: `<nav class="TabBar Glass">` → `<ul>` → `<li>` → `Link variant="bare"`. Текущий пункт: TanStack Router сам ставит
  `aria-current="page"` и `data-status="active"` у `Link`; стиль — `[aria-current="page"]`: жирнее подпись
  (`--font-weight-bold`), цвет `--color-accent`, значок закрашен (`fill: currentColor`), фон `--color-accent-soft` (только
  смена цвета, без движения). Анимированного индикатора нет.
- Активность: `Link` с `activeOptions={{ exact: false }}` — пункт `/explorer` активен и на `/explorer/<id>`. Нет подходящего пункта
  (404, чужой маршрут) — ни один не подсвечен.
- Иконки: `CurrentIcon` и `FolderIcon` — `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `aria-hidden="true"`;
  по одному компоненту на файл.
- Положение: `position: fixed`, `inset-inline: 0`, `bottom: max(var(--space-4), env(safe-area-inset-bottom))`, `z-index: var(--z-dock)`;
  содержимому страницы задаётся `padding-block-end` и `scroll-padding-block-end` ≥ высоты панели.
- `Glass.css` — `.Glass { background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border: var(--border-width) solid var(--color-glass-edge); box-shadow: var(--shadow-floating); }`
  и один блок запасного вида: `@supports not (backdrop-filter: blur(1px)) { … }` и `@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) { … }` с одним и тем же телом
  (`background: var(--color-surface); backdrop-filter: none; border-color: var(--color-border-strong)`).
- `Link`: новый проп `variant?: "inline" | "bare"` (по умолчанию `inline`), отдаётся как `data-variant`; `Link.css` — `.Link[data-variant="bare"]`
  без цвета и подчёркивания.
- Ползунок `/design`: нативный `<input type="range" min="5" max="35">`, значение — оттенок; `aria-valuetext` «оттенок N°»;
  `document.documentElement.style.setProperty("--accent-hue", String(n % 360))`; состояние только в памяти страницы.

## Данные и состояние

Нет запросов и кэша. Единственное состояние — значение ползунка на `/design`.

## API

Не вызывается.

## Проверки

| Что                         | Команда / способ                                                                                                                                           | Ожидание                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Литералы значений в CSS     | `rg -n '#[0-9a-fA-F]{3,8}\b\|\b[0-9.]+(px\|rem\|em\|ms)\b' src --glob '*.css' --glob '!src/shared/ui/tokens.css' \| rg -v '@media\|@container\|@supports'` | пусто                                   |
| `!important`                | `rg -n '!important' src --glob '*.css'`                                                                                                                    | пусто                                   |
| Атрибут `style` в разметке  | `pnpm lint` (правило `no-restricted-syntax`)                                                                                                               | чисто                                   |
| Витрина не попала в прод    | `pnpm build && rg -l 'Витрина токенов' dist`                                                                                                               | пусто                                   |
| Иконка и заголовки в образе | `docker build -t atomic-tasks-web .` и `deploy/smoke.sh http://localhost:8080` (`docs/deploy.md`, п. 2)                                                    | все проверки зелёные                    |
| CSP в браузере на образе    | Открыть образ, `/` и повторить вход/выход; консоль браузера                                                                                                | нет нарушений `Content-Security-Policy` |
| Бюджет                      | `pnpm build` — gzip JS и CSS до и после                                                                                                                    | JS ≤ +3 kB, CSS ≤ +3 kB; описать в PR   |
| Тесты                       | Новых нет: `AGENTS.md` не оправдывает тесты вёрстки; контраст — таблица выше и ручная проверка                                                             | `pnpm check` зелёный                    |

Белая вспышка: открыть собранный образ в тёмной теме, DevTools → Network → Slow 3G, жёсткая перезагрузка — холст тёмный с первого кадра.

## Риски

- **Нагрузка `backdrop-filter`.** Поверхность одна (нижняя панель). Проверка прокруткой длинной страницы на iPhone и одном Android;
  при рывках — отключить стекло (сплошной вид), решение записать в PR.
- **Читаемость стекла над разным содержимым.** Фон ≥72% и расчёт подписей на `bg`/`surface`; при сомнении — сплошной вид.
- **`prefers-reduced-transparency` поддерживается не всеми.** Это улучшение; основа — непрозрачность 72% и `prefers-contrast`.
- **Неслоёные стили React Aria.** React Aria Components не поставляет CSS, но вставляет инлайн-стили и два `<style>` (`usePress`,
  `usePreventScroll`) без слоя — они сильнее `@layer components`. План на провал: если проверка на `Button` и `Link` покажет
  конфликт, конфликтующие свойства остаются без слоя в `theme.css` с комментарием; `!important` не вводим.
- **Видимые изменения существующих страниц** (акцент, радиус, колонка 720px): проверить экраны «Вы не вошли» и ошибок на 320px и в обеих темах.
- **Safari и SVG-иконка.** Ссылки с `media` и SVG поддерживаются не везде; проверить вручную, при проблеме — PNG/ICO вместе с финальной иконкой.
- **Порядок слоёв.** Если кто-то импортирует CSS компонента раньше `theme.css`, слои выстроятся иначе; инвариант записан в README.

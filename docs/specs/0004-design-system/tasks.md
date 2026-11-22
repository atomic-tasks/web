# Задачи

Ветка `feat/0004-design-system`. Один шаг — один коммит; перед коммитом `pnpm check` чистый. Критерии — в `spec.md`,
значения и команды — в `plan.md`.

- [x] **0. Предусловия.** Сделать: статус ADR 0006 — «принят», статус спеки — «согласована»; в `AGENTS.md` строка о политике
      браузеров (Baseline Widely available — без запасных путей; Newly available — только с деградацией: `backdrop-filter`,
      `prefers-reduced-transparency`, `oklch()`, `color-mix()`). Готово, когда: файлы обновлены, ссылок на «открытые вопросы» нет.
- [x] **1. Токены и тема.** Сделать: `tokens.css` по таблицам `plan.md`, `theme.css` со слоями и базой, `@import`. Готово, когда:
      `pnpm build` проходит; `theme.css` — первый CSS-импорт в `App.tsx`; в `tokens.css` нет значений, которых нет в плане;
      `src/shared/ui/README.md` обновлён (Interface, Invariants, Side Effects).
- [x] **2. Миграция существующих стилей.** Сделать: по таблице «Миграция» перевести `Button.css`, `ErrorMessage.css`, `Link.css`,
      `Layout.css` (все в `@layer components`), без алиасов. Готово, когда: проверки «литералы» и «`!important`» из `plan.md` дают пусто;
      видимые изменения (акцент, радиус, колонка 720px, цели 44px) проверены на 320px в обеих темах, экраны «Вы не вошли» и ошибок не сломаны.
- [x] **3. Иконка и мета-теги.** Сделать: `index.html`, `public/favicon-light.svg`, `favicon-dark.svg`, проверка в `deploy/smoke.sh`.
      Готово, когда: иконка видна во вкладке светлой и тёмной темы браузера (Chrome и Safari проверены вручную); `deploy/smoke.sh`
      на собранном образе зелёный; `theme-color` совпадает с `--color-bg`.
- [x] **4. Запрет `style` и витрина.** Сделать: правило ESLint; `DesignPage` с токенами, `Button`, `AnchorButton`, `Link`, `ErrorMessage`,
      `Loading`, ползунком акцента; ленивый маршрут `/design` под `import.meta.env.DEV`. Готово, когда: `pnpm lint` ловит
      `style=` в тестовой вставке; `pnpm build && rg -l 'Витрина токенов' dist` пусто; в `pnpm dev` витрина открывается и ползунок меняет акцент.
- [x] **5. Стекло и нижняя панель.** Сделать: `Glass.css`, `Link variant="bare"`, `CurrentIcon`, `FolderIcon`, `TabBar`; добавить на витрину.
      Готово, когда: клавиатурой Tab/Enter пункты работают; VoiceOver объявляет подпись, роль ссылки и текущую страницу; запасной вид
      проверен эмуляцией `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors`; контраст подписей — по расчёту плана;
      панель не закрывает фокус; safe-area на iPhone.
- [ ] **6. Ручная проверка.** Сделать и записать в описание PR: светлая/тёмная; `prefers-reduced-motion`; ширина 320px при масштабе 200% (панель
      ≤ трети высоты 320×568); шрифт ОС ×2; белая вспышка (Slow 3G); CSP на образе (консоль без нарушений); бюджет gzip JS/CSS;
      прокрутка с `.Glass` на iPhone и одном Android; Lighthouse accessibility ≥95 для `/design` в `pnpm dev`, мобильный профиль.
- [x] **7. Документы.** Сделать: README модулей `shared/ui` и `app` (маршрут `/design`, Invariants про токены и слои), `docs/architecture.md`
      (раздел «Оболочка»), `docs/roadmap.md`. Готово, когда: `pnpm check` и `pnpm build` проходят, Interface/Invariants/Side Effects совпадают с кодом.

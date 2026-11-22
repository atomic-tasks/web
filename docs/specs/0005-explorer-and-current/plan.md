# План

Предполагает готовую спеку 0004 (`TabBar`, `ScreenHeader`, `ListGroup`/`ListRow`, `StatusMark`, `Badge`).

## Экраны и навигация

Маршруты (код, `router.tsx`), все — внутри `Layout` за `SessionGate`:

| Адрес                 | Экран                  | Параметры                                                                                            |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                   | редирект на `/current` | —                                                                                                    |
| `/current`            | Текущие                | search `status` (необязательный, массив): без него — открытые (`in_progress`, `todo`, как у бэкенда) |
| `/explorer`           | Проводник, корень      | —                                                                                                    |
| `/explorer/$folderId` | Проводник, папка       | `folderId` — uuid                                                                                    |

`Layout`: сверху `ScreenHeader` экрана, снизу `TabBar` (+ место под кнопку «+», в этой спеке не рисуется),
`<main>` с отступом снизу под панель (`scroll-padding`, safe-area). Старая шапка с «AtomicTasks», именем
и «Выйти» убирается: имя и «Выйти» — в меню профиля `ProfileMenu` (React Aria `MenuTrigger`) в `ScreenHeader`.

Хлебные крошки: назад — ссылка на `parent_id` папки (из `path` ответа `browse_folder`), не `history.back()`:
работает и при заходе по прямой ссылке. Переход анимируется View Transitions (`document.startViewTransition`
через `viewTransition` у `Link`/навигации TanStack Router), направление — по глубине пути.

## Модули и контракты

Новый модуль `src/features/explorer/` (README по шаблону, ADR 0002); фичи друг друга не импортируют, поэтому
всё, что нужно и «Текущим», и «Проводнику», живёт здесь же — одна фича «tree» из двух экранов:

- `ExplorerPage.tsx` — экран папки (`browseFolder`).
- `CurrentPage.tsx` — экран «Текущие» (`listNestedTasks` корня).
- `FolderRow.tsx`, `TaskRow.tsx` — строки (GridList-элементы), используют `ListRow`, `StatusMark`, `Badge`.
- `TaskStatusMenu.tsx`, `FolderStatusMenu.tsx` — выбор статуса (React Aria `Menu`).
- `useChangeTaskStatus.ts`, `useChangeFolderStatus.ts` — мутации с оптимистичным обновлением и откатом
  поверх `useChangeTaskStatus`/`useChangeFolderStatus` Orval.
- `statusLabels.ts` — подписи статусов по-русски (`Record<TaskStatus, string>`, `Record<FolderStatus, string>`);
  единственное место, где «человеческие» слова для API-значений.
- `pathLabel.ts` — «Работа › AtomicTasks» из `path`; формат приоритета (`formatPriority`) — тесты (логика форматирования).
- `README.md`.

`app/`: `router.tsx` (4 маршрута, редирект), `Layout.tsx` (новая оболочка), `ProfileMenu.tsx` (имя + `LogoutButton`
из `auth/`), `HomePage.tsx` удаляется. Контракт `app/` обновляется: Interface (маршруты), Side Effects.

`shared/ui/`: только то, что принесла 0004; если понадобится ещё компонент (скелетон, `Menu`) — добавляется
туда же с README.

## Компоненты дизайн-системы, переехавшие из 0004

Делаются в 0005 вместе с экранами, где известны реальные слоты. Токены, `.Glass` и `TabBar` готовы (0004).

| Файл (`src/shared/ui/`)                | Что                                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ScreenHeader.tsx`, `.css`             | Верхняя панель: ссылка «назад», заголовок; сворачивание большого заголовка — по необходимости, не Baseline                        |
| `ListGroup.tsx`, `ListRow.tsx`, `.css` | Вид «сгруппированный список»; слоты определяются по `FolderRow`/`TaskRow`                                                         |
| `StatusMark.tsx`, `.css`               | Значок статуса: форма и цвет (todo — пустой круг, in_progress — круг с точкой, paused — пауза, done — галочка, cancelled — крест) |
| `Badge.tsx`, `.css`                    | Пилюля со значением (приоритет)                                                                                                   |
| `IconButton.tsx`, `.css`               | Кнопка только со значком (меню `⋯`); тип требует `aria-label`                                                                     |
| `icons/…Icon.tsx`                      | По файлу на значок: `ChevronIcon`, `CheckIcon`, `PauseIcon`, `CrossIcon`, `MoreIcon`, `BackIcon`                                  |
| `ProgressBar.tsx`, `.css`              | После релиза бэкенда 0010: стилизованный `<progress>` (значение атрибутами, `aria-label`)                                         |

Также в 0005: монтирование `TabBar` в `Layout` (пункты «Текущие» `/current`, «Проводник» `/explorer`) и `padding-block-end` под панель.

## Данные и состояние

- **Ключи Query** — из Orval (`getBrowseFolderQueryKey(id, params)`, `getListNestedTasksQueryKey(...)`); своих не вводим.
- **Загрузка.** `loader` маршрута делает `queryClient.ensureQueryData` — данные готовы к показу, скелетон только
  при первом открытии; навигация назад мгновенная из кэша.
- **Свежесть.** `staleTime` 30 с; обновление при возврате на вкладку (по умолчанию Query).
- **Мутация статуса задачи.** `onMutate`: отменить запросы, сохранить снимок, записать новый статус в кэш
  `browseFolder` и `listNestedTasks`; `onError`: откат снимка + текст `describeApiError`; `onSettled`: инвалидировать
  `listNestedTasks` и `browseFolder` текущей папки. Задача, ставшая `done`, остаётся в «Текущих» до обновления
  списка с «зачёркиванием» 1–2 с, затем уходит (без новой логики: исчезает после инвалидации).
- **Статус папки** — без оптимистичного обновления (меняет `active_branch` у всего поддерева): мутация →
  инвалидация всего дерева (`getBrowseFolderQueryKey` префиксом) и «Текущих».
- Состояние в адресе: `folderId`, `status`. В `localStorage` — ничего.

## API

Только из `openapi/openapi.json` (контракт v0.3.1; в `src/api/generated/` — генерация из него):

| Что                   | `operation_id`                               | Заметка                                                                                                                                                                                   |
| --------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Корневая папка        | `get_root_folder`                            | id корня для `/current` и `/explorer`                                                                                                                                                     |
| Содержимое папки      | `browse_folder`                              | `folders[]`, `tasks[]` с `priority`, `path`, `active_branch`; `include_closed` по умолчанию `false`: завершённые скрыты, переключатель «Показать завершённые» ставит `true` (`?closed=1`) |
| Текущие задачи        | `list_nested_tasks`                          | `status`, `limit`; даёт `priority` и `path` относительно корня                                                                                                                            |
| Статус задачи / папки | `change_task_status`, `change_folder_status` | свободные переходы                                                                                                                                                                        |

Чего **не хватает**: счётчиков задач у папок — спека `../backend/docs/specs/0010-folder-task-counts/`; после её релиза
в `openapi/` обновляется контракт (`pnpm gen:api`), в строку папки добавляется `ProgressBar` (шаг 11).

## Риски

- **«Текущие» ограничены `limit`** (50 по умолчанию, до 500): личные объёмы, курсоров нет; при упоре в предел — показываем
  подпись «Показаны первые N».
- **Оптимистичный откат при быстрых нажатиях**: `cancelQueries` в `onMutate` и снимок на каждую мутацию.
- **GridList + ссылки/кнопки внутри строки**: вложенные интерактивные элементы — типичная ловушка a11y; сверять
  с примерами React Aria, строка папки — одна ссылка, строка задачи — одно действие + меню.
- **View Transitions + TanStack Router**: поддержка в роутере проверить на нашей версии; запасной путь — без анимации.
- **Большие папки**: без виртуализации (React Aria `Virtualizer`) — решаем, когда появится папка с сотнями строк.

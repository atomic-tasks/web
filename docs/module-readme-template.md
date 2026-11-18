# Шаблон README-контракта модуля

Формат — из Elephant & Goldfish Model (`egm-bootstrap`), решение — ADR 0002.
Заголовки разделов не переводим: по ним ориентируются `egm-bootstrap` и `egm-drift-report`.

Пишем только то, что есть в коде, со ссылкой на файл и символ. Нет инвариантов или побочных эффектов —
так и пишем: `None`.

## Модуль (Component Package)

Папка с кодом: `app/`, `api/`, `auth/`, `features/<name>/`, `shared/ui/`, `shared/lib/`.

```markdown
# <Имя модуля>

## Overview

Зачем модуль и какую роль играет в приложении. 2–4 предложения.

## Interface

- `Symbol` (`file.ts`) — что это и кто им пользуется снаружи модуля.
- Подмодули: [`child/`](./child/README.md) — одна строка о роли.

## Invariants

- Правила, которые нельзя нарушать при изменениях (кто вправе вызывать, что всегда истинно).

## Side Effects

- Сеть, cookie, история браузера, таймеры, глобальное состояние. Или `None`.

## Verification

- Run: `pnpm check`
```

## Индекс (Intermediate Blueprint)

Папка только с подпапками: `src/`, `features/`, `shared/`.

```markdown
# <Имя папки>

## Overview

Что объединяет вложенные модули.

## Subdirectories & Boundaries

- `child/`: [README](./child/README.md) — роль и граница модуля.
```

Ссылки — только на существующие `README.md`. Модуль, которого ещё нет, в индекс не попадает:
планы живут в `docs/roadmap.md` и спеках.

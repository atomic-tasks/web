# features

## Overview

Экраны и логика предметной области: одна папка — одна область. Фичи друг друга не импортируют (ADR 0002).

## Local Interface & Invariants

- Папка сама кода не содержит; контракт каждой фичи — в её `README.md`.

## Subdirectories & Boundaries

- `explorer/`: [README](./explorer/README.md) — «Текущие» и «Проводник»: просмотр дерева, смена статуса.

## Verification

- Run: `pnpm check`

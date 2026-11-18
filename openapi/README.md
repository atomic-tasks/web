# openapi

`openapi.json` — контракт REST API бэкенда, закреплённый на релизе **v0.3.1**
([atomic-tasks/backend](https://github.com/atomic-tasks/backend/releases/tag/v0.3.1)).
Из него `pnpm gen:api` (Orval, `orval.config.ts`) генерирует клиент в `src/api/generated/`.

Обновление (`../guides/api-contract.md`, «Когда API меняется»):

1. Взять `openapi.json` из нужного релиза бэкенда и заменить этот файл; поправить версию выше.
2. `pnpm gen:api`, затем `pnpm check` — компилятор покажет, где код разошёлся с новым API.
3. Коммит `feat: update API client to vX.Y.Z`.

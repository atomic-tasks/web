# Architecture Decision Records

Одно значимое решение — один файл `NNNN-kebab-name.md`. Принятый ADR не переписывается:
если решение меняется, пишется новый ADR со статусом «заменяет NNNN», а старому ставится «заменён NNNN».

Формат: Статус · Контекст · Решение · Последствия.

| #                                             | Решение                                                          |
| --------------------------------------------- | ---------------------------------------------------------------- |
| [0001](0001-react-vite-spa.md)                | React + Vite + TypeScript, SPA без своего сервера                |
| [0002](0002-module-contracts-egm.md)          | Раскладка `src/` и README-контракты модулей по EGM (эксперимент) |
| [0003](0003-session-cookie-same-host.md)      | Вход через бэкенд с httpOnly-cookie, сайт и API на одном хосте   |
| [0004](0004-router-and-ui-kit.md)             | Роутер TanStack Router и UI-кит React Aria Components            |
| [0005](0005-static-nginx-security-headers.md) | Статика в образе nginx, заголовки безопасности в конфиге nginx   |

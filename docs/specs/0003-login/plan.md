# План

## Экраны и навигация

- Любой адрес без сессии → `SignedOutScreen`: заголовок, сообщение `login_error` (если есть), кнопка «Войти».
- Шапка вошедшего: имя и «Выйти». Индикатора бэкенда больше нет.

## Модули и контракты

- `auth/`: `loginHref(location)` и `loginErrorMessage(search)` (`login.ts`, чистые функции с тестами),
  `SignedOutScreen` с кнопкой и ошибкой, `LogoutButton` (`useLogout` → `window.location.assign("/")`).
  README: Interface, Invariants (не перехватывать вход роутером), Side Effects (переход и перезагрузка).
- `shared/ui/`: `AnchorButton` — `<a href>` с видом `Button`, для переходов за пределы SPA.
- `app/`: `Layout` показывает `LogoutButton`; `HealthStatus` удалён. README обновлён.
- `vite.config.ts`: убран прокси `/health`, комментарий про dev-токен.

## Данные и состояние

- `me` — как в 0001. После выхода — полная перезагрузка вместо инвалидации: гарантированно пустой кэш.

## API

- `login` — только URL (`getLoginUrl` от Orval), `logout` — `useLogout`. `openapi/openapi.json` — из релиза
  бэкенда v0.5.0.
- `health` больше не вызывается (остаётся в сгенерированном клиенте).

## Риски

- Safari не принимает `Secure`-cookie на `http://localhost` — локальная проверка входа в Chrome/Firefox.

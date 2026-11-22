import { getLoginUrl } from "../api/generated/endpoints";

/** Параметр, с которым бэкенд возвращает на сайт после неудачного входа (спека 0008 бэкенда). */
export const LOGIN_ERROR_PARAM = "login_error";

// `Map`, а не объект: код приходит из URL, и `toString`/`__proto__` не должны находиться в прототипе.
const LOGIN_ERROR_MESSAGES: ReadonlyMap<string, string> = new Map([
  ["access_denied", "Этому аккаунту вход закрыт"],
  ["expired", "Вход занял слишком долго, попробуйте ещё раз"],
]);
const LOGIN_FAILED = "Не удалось войти";

/** Где сейчас пользователь — подмножество `window.location`. */
export interface CurrentLocation {
  pathname: string;
  search: string;
}

/**
 * Адрес начала входа: бэкенд вернёт на текущую страницу. В `return_to` — только путь и query,
 * без `login_error` прошлой попытки.
 */
export const loginHref = ({ pathname, search }: CurrentLocation): string => {
  const params = new URLSearchParams(search);
  params.delete(LOGIN_ERROR_PARAM);
  const query = params.toString();
  return getLoginUrl({ return_to: query ? `${pathname}?${query}` : pathname });
};

/** Текст ошибки входа по `?login_error=<код>`; нет параметра — `undefined`. Неизвестный код — общий текст. */
export const loginErrorMessage = (search: string): string | undefined => {
  const code = new URLSearchParams(search).get(LOGIN_ERROR_PARAM);
  if (code === null) return undefined;
  return LOGIN_ERROR_MESSAGES.get(code) ?? LOGIN_FAILED;
};

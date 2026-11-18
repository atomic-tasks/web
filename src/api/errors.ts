/**
 * Ошибки запросов к бэкенду глазами пользователя: текст сообщения и решение о повторе.
 * Правила — спека `docs/specs/0001-shell/spec.md`, сценарий 5.
 */
import { ApiError } from "./fetcher";

const MESSAGES = {
  network: "Нет связи с сервером",
  unauthorized: "Сессия закончилась",
  forbidden: "Нет доступа",
  notFound: "Не найдено",
  rejected: "Сервер не принял запрос",
  server: "Что-то пошло не так на сервере",
  unknown: "Что-то пошло не так",
} as const;

/**
 * Бэкенд недоступен: прокси (dev-сервер Vite, Traefik) отвечает сам, когда до бэкенда не достучался.
 * Для пользователя это та же «нет связи», что и обрыв сети.
 */
const GATEWAY_STATUSES: ReadonlySet<number> = new Set([502, 503, 504]);

/** Статусы, где `detail` бэкенда — сообщение предметной области на русском, его можно показать. */
const DETAIL_STATUSES: ReadonlySet<number> = new Set([400, 409, 422]);

/** Обрыв сети: `fetch` отклоняет промис с `TypeError`, ответа нет. */
const isNetworkFailure = (error: unknown): boolean => error instanceof TypeError;

/**
 * `detail` из problem details (RFC 9457), если это непустая строка.
 * Бэкенд не описывает эти ответы в OpenAPI, поэтому форму проверяем сами.
 * У ошибки валидации FastAPI (`422`) `detail` — массив: его не показываем.
 */
const problemDetail = (body: unknown): string | undefined => {
  if (typeof body !== "object" || body === null || !("detail" in body)) return undefined;
  const { detail } = body;
  return typeof detail === "string" && detail.trim() !== "" ? detail : undefined;
};

/** Ответ `401`: нет сессии или она закончилась. */
export const isUnauthorized = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 401;

/**
 * Стоит ли повторить запрос: обрыв сети и `5xx` — временные сбои, повтор может помочь.
 * `4xx` — ответ по существу, прочие исключения (разбор JSON, отмена) — повтор их не изменит.
 */
export const isRetryableError = (error: unknown): boolean =>
  isNetworkFailure(error) || (error instanceof ApiError && error.status >= 500);

/**
 * Текст ошибки ответа API для пользователя. `detail` бэкенда показываем только для `400`, `409`, `422`:
 * это сообщения предметной области. Тело ответа целиком не показываем.
 */
export const describeApiError = (error: unknown): string => {
  if (isNetworkFailure(error)) return MESSAGES.network;
  if (!(error instanceof ApiError)) return MESSAGES.unknown;
  const { status } = error;
  // `instanceof` сужает до `ApiError<any>`: тело явно считаем неизвестным и проверяем форму.
  const body: unknown = error.body;
  if (GATEWAY_STATUSES.has(status)) return MESSAGES.network;
  if (status >= 500) return MESSAGES.server;
  if (status === 401) return MESSAGES.unauthorized;
  if (status === 403) return MESSAGES.forbidden;
  if (status === 404) return MESSAGES.notFound;
  if (DETAIL_STATUSES.has(status)) return problemDetail(body) ?? MESSAGES.rejected;
  return MESSAGES.rejected;
};

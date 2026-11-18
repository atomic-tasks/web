/**
 * HTTP-слой для кода, сгенерированного Orval (`orval.config.ts` → `override.mutator`).
 * Все запросы к бэкенду проходят здесь: свой хост, cookie сессии, ошибки — исключением.
 */

/** Ответ бэкенда со статусом не 2xx. `body` — тело ответа (problem details или ошибка валидации). */
export class ApiError<TBody = unknown> extends Error {
  readonly status: number;
  readonly body: TBody;

  constructor(status: number, body: TBody) {
    super(`API responded with ${String(status)}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Тип ошибки в хуках Orval: `useGetMe()` → `error: ApiError<...> | null`.
 * На деле `error` бывает и другим: обрыв сети (`TypeError` от `fetch`), битый JSON (`SyntaxError`),
 * отмена (`AbortError`). Сужать только через `instanceof ApiError` (`errors.ts`).
 */
export type ErrorType<TBody> = ApiError<TBody>;

const readBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("json") ? response.json() : response.text();
};

/**
 * Выполняет запрос и возвращает тело успешного ответа.
 * `credentials: "include"` — браузер отправляет cookie сессии бэкенда (ADR 0003).
 * Не 2xx → `ApiError`: TanStack Query переводит запрос в состояние ошибки.
 */
export const apiFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, { ...options, credentials: "include" });
  const body = await readBody(response);
  if (!response.ok) throw new ApiError(response.status, body);
  return body as T;
};

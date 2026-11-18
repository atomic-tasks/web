import { isUnauthorized } from "../api/errors";
import type { MeResponse } from "../api/generated/model";

export type SessionState =
  | { status: "loading" }
  | { status: "signedIn"; user: MeResponse }
  | { status: "signedOut" }
  | { status: "error"; error: unknown };

/** Что знаем о запросе `me` — подмножество результата `useGetMe`. */
export interface MeQuery {
  data: MeResponse | undefined;
  error: unknown;
}

/**
 * Состояние сессии по запросу `GET /api/v1/me`.
 * `401` важнее закэшированного пользователя: после перезапроса `me` (сессия кончилась
 * на другом запросе) в кэше ещё лежат старые данные, а ответ уже `401`.
 */
export const toSessionState = ({ data, error }: MeQuery): SessionState => {
  if (isUnauthorized(error)) return { status: "signedOut" };
  if (data) return { status: "signedIn", user: data };
  if (error) return { status: "error", error };
  return { status: "loading" };
};

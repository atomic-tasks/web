import { useGetMe } from "../api/generated/endpoints";
import { toSessionState, type SessionState } from "./session";

/** Пользователь меняется редко: не перезапрашиваем `me` при каждом монтировании. */
const ME_STALE_TIME_MS = 5 * 60 * 1000;

export type Session = SessionState & {
  /** Перезапросить `me` — для кнопки «Повторить» в состоянии `error`. */
  retry: () => void;
};

/** Текущая сессия по `GET /api/v1/me`: загрузка, вошёл (с пользователем), не вошёл (`401`) или ошибка. */
export function useSession(): Session {
  const { data, error, refetch } = useGetMe({ query: { staleTime: ME_STALE_TIME_MS } });
  return {
    ...toSessionState({ data, error }),
    retry: () => {
      void refetch();
    },
  };
}

import { MutationCache, QueryCache, QueryClient, hashKey } from "@tanstack/react-query";

import { isRetryableError, isUnauthorized } from "../api/errors";
import { getGetMeQueryKey } from "../api/generated/endpoints";

/**
 * Сколько раз повторить запрос после первой неудачи. Повторяем только сеть и `5xx`:
 * `4xx` — ответ по существу, повтор лишь задержит сообщение об ошибке.
 */
export const MAX_QUERY_RETRIES = 2;

export const shouldRetryQuery = (failureCount: number, error: unknown): boolean =>
  failureCount < MAX_QUERY_RETRIES && isRetryableError(error);

const ME_QUERY_HASH = hashKey(getGetMeQueryKey());

/**
 * Единственный `QueryClient` приложения (создаёт `App`).
 * `401` на любом запросе, кроме `me`, означает, что сессия закончилась: перезапрашиваем `me`,
 * оболочка увидит `signedOut`. Сам `me` себя не инвалидирует — иначе петля. Несколько `401` подряд
 * не обрывают уже идущий запрос `me` (`cancelRefetch: false`). Мутации не повторяются (по умолчанию).
 */
export const createQueryClient = (): QueryClient => {
  const refreshSession = () =>
    client.invalidateQueries({ queryKey: getGetMeQueryKey() }, { cancelRefetch: false });

  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isUnauthorized(error) && query.queryHash !== ME_QUERY_HASH) void refreshSession();
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (isUnauthorized(error)) void refreshSession();
      },
    }),
    defaultOptions: {
      queries: { retry: shouldRetryQuery },
    },
  });

  return client;
};

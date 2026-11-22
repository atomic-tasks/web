import { describeApiError } from "../../api/errors";
import { ErrorMessage } from "../../shared/ui/ErrorMessage";
import { Loading } from "../../shared/ui/Loading";

export interface QueryStatusProps {
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}

/** Загрузка или ошибка запроса; когда данные есть, возвращает `null`. */
export function QueryStatus({ isPending, error, onRetry }: QueryStatusProps) {
  if (isPending) return <Loading />;
  if (error) return <ErrorMessage message={describeApiError(error)} onRetry={onRetry} />;
  return null;
}

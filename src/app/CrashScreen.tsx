import type { ErrorComponentProps } from "@tanstack/react-router";

import { describeApiError } from "../api/errors";
import { ApiError } from "../api/fetcher";
import { ErrorMessage } from "../shared/ui/ErrorMessage";

/**
 * Экран упал при отрисовке или загрузке маршрута (`defaultErrorComponent` роутера).
 * Шапка остаётся: ошибка ловится внутри `Outlet`. Подробности ошибки не показываем.
 */
export function CrashScreen({ error }: ErrorComponentProps) {
  const message = error instanceof ApiError ? describeApiError(error) : "Что-то сломалось";
  return (
    <ErrorMessage
      message={message}
      retryLabel="Перезагрузить"
      onRetry={() => {
        window.location.reload();
      }}
    />
  );
}

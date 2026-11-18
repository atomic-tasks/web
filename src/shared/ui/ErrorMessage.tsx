import { Button } from "./Button";
import "./ErrorMessage.css";

export interface ErrorMessageProps {
  /** Готовый текст для пользователя (для ошибок API — `describeApiError`). */
  message: string;
  /** Есть — показываем кнопку «Повторить». */
  onRetry?: () => void;
  retryLabel?: string;
}

/** Сообщение об ошибке на месте данных или рядом с действием. Объявляется скринридером (`role="alert"`). */
export function ErrorMessage({ message, onRetry, retryLabel = "Повторить" }: ErrorMessageProps) {
  return (
    <div role="alert" className="ErrorMessage">
      <p className="ErrorMessage-text">{message}</p>
      {onRetry && <Button onPress={onRetry}>{retryLabel}</Button>}
    </div>
  );
}

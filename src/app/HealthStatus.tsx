import { useHealth } from "../api/generated/endpoints";

/** Временный индикатор связи с бэкендом для каркаса: проверяет всю цепочку прокси → API → клиент. */
export function HealthStatus() {
  const { data, isPending, isError } = useHealth({ query: { retry: false } });

  const label = isPending
    ? "проверяем…"
    : !isError && data.status === "ok"
      ? "доступен"
      : "недоступен";

  return <p>Бэкенд: {label}</p>;
}

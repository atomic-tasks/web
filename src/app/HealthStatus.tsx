import { useHealth } from "../api/generated/endpoints";

/** Индикатор связи с бэкендом в шапке: проверяет всю цепочку прокси → API → клиент. */
export function HealthStatus() {
  const { data, isPending, isError } = useHealth({ query: { retry: false } });

  const label = isPending
    ? "проверяем…"
    : !isError && data.status === "ok"
      ? "доступен"
      : "недоступен";

  return <p>Бэкенд: {label}</p>;
}

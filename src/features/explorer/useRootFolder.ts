import { useGetRootFolder } from "../../api/generated/endpoints";

/** Корневая папка нужна «Текущим» и «Проводнику»: id корня — единственная точка входа в дерево. */
export function useRootFolder() {
  return useGetRootFolder({ query: { staleTime: STALE_TIME_MS } });
}

/** Свежесть данных дерева: 30 с, затем обновление при показе (спека 0005, план «Данные»). */
export const STALE_TIME_MS = 30_000;

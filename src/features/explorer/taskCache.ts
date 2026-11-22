import type { QueryClient, QueryKey } from "@tanstack/react-query";

import type { FolderListingResponse } from "../../api/generated/model/folderListingResponse";
import type { NestedTaskResponse } from "../../api/generated/model/nestedTaskResponse";
import type { TaskStatus } from "../../api/generated/model/taskStatus";

const isListing = (data: unknown): data is FolderListingResponse =>
  typeof data === "object" && data !== null && "folders" in data && "tasks" in data;

/** Ключи Orval: `/api/v1/folders/<id>/children` (проводник) и `/api/v1/folders/<id>/nested-tasks` (текущие). */
const isTreeKey = (key: QueryKey): boolean => {
  const [path] = key;
  return typeof path === "string" && (path.endsWith("/children") || path.endsWith("/nested-tasks"));
};

/** Копия ответа кэша с новым статусом задачи; остальное (включая приоритеты) не трогаем. */
export const withTaskStatus = (data: unknown, taskId: string, status: TaskStatus): unknown => {
  if (Array.isArray(data)) {
    return (data as NestedTaskResponse[]).map((task) =>
      task.id === taskId ? { ...task, status } : task,
    );
  }
  if (isListing(data)) {
    return {
      ...data,
      tasks: data.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    };
  }
  return data;
};

/**
 * Оптимистично ставит статус задаче во всех закэшированных списках («Текущие», «Проводник»).
 * Возвращает откат: вернуть снимки, как они были до изменения.
 */
export const applyOptimisticTaskStatus = (
  queryClient: QueryClient,
  taskId: string,
  status: TaskStatus,
): (() => void) => {
  const snapshots = queryClient.getQueriesData({ predicate: (query) => isTreeKey(query.queryKey) });
  queryClient.setQueriesData({ predicate: (query) => isTreeKey(query.queryKey) }, (data: unknown) =>
    withTaskStatus(data, taskId, status),
  );
  return () => {
    for (const [key, data] of snapshots) queryClient.setQueryData(key, data);
  };
};

/** Помечает устаревшими все списки дерева: «Текущие» и «Проводник» перезапросятся при показе. */
export const invalidateTree = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({ predicate: (query) => isTreeKey(query.queryKey) });

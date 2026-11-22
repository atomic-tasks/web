import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { describeApiError } from "../../api/errors";
import { useChangeTaskStatus as useChangeTaskStatusMutation } from "../../api/generated/endpoints";
import type { TaskStatus } from "../../api/generated/model/taskStatus";
import { applyOptimisticTaskStatus, invalidateTree } from "./taskCache";

/**
 * Смена статуса задачи: список обновляется сразу, при ошибке возвращается как был, а текст ошибки
 * остаётся в `error` до следующей попытки. После любого исхода дерево перезапрашивается.
 */
export function useChangeTaskStatus() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | undefined>();
  const mutation = useChangeTaskStatusMutation<unknown, { rollback: () => void }>({
    mutation: {
      onMutate: async ({ taskId, data }) => {
        setError(undefined);
        await queryClient.cancelQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === "string" &&
            query.queryKey[0].startsWith("/api/v1/folders/"),
        });
        return { rollback: applyOptimisticTaskStatus(queryClient, taskId, data.status) };
      },
      onError: (failure, _variables, context) => {
        context?.rollback();
        setError(describeApiError(failure));
      },
      onSettled: () => invalidateTree(queryClient),
    },
  });
  return {
    error,
    setStatus: (taskId: string, status: TaskStatus) => {
      mutation.mutate({ taskId, data: { status } });
    },
  };
}

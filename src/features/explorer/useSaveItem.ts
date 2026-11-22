import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { describeApiError } from "../../api/errors";
import {
  useChangeFolderStatus,
  useChangeTaskStatus,
  useUpdateFolder,
  useUpdateTask,
} from "../../api/generated/endpoints";
import type { FolderStatus } from "../../api/generated/model/folderStatus";
import type { TaskStatus } from "../../api/generated/model/taskStatus";
import type { UpdateNodeRequest } from "../../api/generated/model/updateNodeRequest";
import { invalidateTree } from "./taskCache";

export type SaveTarget =
  | { kind: "task"; id: string; status?: TaskStatus }
  | { kind: "folder"; id: string; status?: FolderStatus };

/**
 * Сохранение правок из окна: поля (`PATCH`) и, если изменился, статус (`POST …/status`) — два запроса, так устроен API.
 * Возвращает `true`, если всё прошло; иначе текст ошибки остаётся в `error`. Дерево перезапрашивается в любом случае:
 * если поля сохранились, а статус нет, список всё равно должен показать правду.
 */
export function useSaveItem() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | undefined>();
  const [isPending, setPending] = useState(false);
  const updateTask = useUpdateTask();
  const updateFolder = useUpdateFolder();
  const changeTask = useChangeTaskStatus();
  const changeFolder = useChangeFolderStatus();

  const save = async (target: SaveTarget, patch: UpdateNodeRequest): Promise<boolean> => {
    setError(undefined);
    setPending(true);
    try {
      if (Object.keys(patch).length > 0) {
        if (target.kind === "task")
          await updateTask.mutateAsync({ taskId: target.id, data: patch });
        else await updateFolder.mutateAsync({ folderId: target.id, data: patch });
      }
      if (target.status !== undefined) {
        if (target.kind === "task")
          await changeTask.mutateAsync({ taskId: target.id, data: { status: target.status } });
        else
          await changeFolder.mutateAsync({ folderId: target.id, data: { status: target.status } });
      }
      return true;
    } catch (failure) {
      setError(describeApiError(failure));
      return false;
    } finally {
      setPending(false);
      await invalidateTree(queryClient);
    }
  };

  return { save, isPending, error };
}

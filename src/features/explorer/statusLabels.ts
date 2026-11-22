import { FolderStatus } from "../../api/generated/model/folderStatus";
import { TaskStatus } from "../../api/generated/model/taskStatus";

/** Единственное место, где значения статусов API превращаются в слова для человека. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "К выполнению",
  in_progress: "В работе",
  paused: "На паузе",
  done: "Готово",
  cancelled: "Отменено",
};

export const FOLDER_STATUS_LABELS: Record<FolderStatus, string> = {
  active: "Активна",
  paused: "На паузе",
  done: "Готова",
  cancelled: "Отменена",
};

export const TASK_STATUSES: readonly TaskStatus[] = Object.values(TaskStatus);
export const FOLDER_STATUSES: readonly FolderStatus[] = Object.values(FolderStatus);

/** Быстрый переключатель по тапу на значок: «готово ↔ к выполнению». */
export const toggledTaskStatus = (status: TaskStatus): TaskStatus =>
  status === TaskStatus.done ? TaskStatus.todo : TaskStatus.done;

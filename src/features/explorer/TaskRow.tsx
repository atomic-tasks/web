import type { TaskStatus } from "../../api/generated/model/taskStatus";
import { Badge } from "../../shared/ui/Badge";
import { IconButton } from "../../shared/ui/IconButton";
import { ListRow } from "../../shared/ui/ListRow";
import { StatusMark } from "../../shared/ui/StatusMark";
import type { DialogItem } from "./ItemDialog";
import { formatPriority } from "./pathLabel";
import { TASK_STATUS_LABELS, toggledTaskStatus } from "./statusLabels";

export interface TaskRowProps {
  id: string;
  title: string;
  status: TaskStatus;
  priority: number;
  description: string | null;
  weight: number;
  /** Путь до папки задачи («Работа › AtomicTasks»), если показываем. */
  path?: string | undefined;
  /** Приглушить строку: ветка неактивна. */
  dimmed?: boolean | undefined;
  onSetStatus: (taskId: string, status: TaskStatus) => void;
  /** Нажатие на строку: открыть окно правки. */
  onOpen: (item: DialogItem) => void;
}

/**
 * Строка задачи: значок статуса (тап — «готово ↔ к выполнению»), название, путь, описание, приоритет.
 * Нажатие на строку открывает окно правки. Тексты — только как текст.
 */
export function TaskRow({
  id,
  title,
  status,
  priority,
  description,
  weight,
  path,
  dimmed,
  onSetStatus,
  onOpen,
}: TaskRowProps) {
  const open = () => {
    onOpen({ kind: "task", id, title, status, priority, description, weight });
  };
  const next = toggledTaskStatus(status);
  return (
    <ListRow id={id} textValue={title} data-dimmed={dimmed ? "" : undefined} onAction={open}>
      <IconButton
        aria-label={`${TASK_STATUS_LABELS[status]}. Сменить на «${TASK_STATUS_LABELS[next]}»`}
        onPress={() => {
          onSetStatus(id, next);
        }}
      >
        <StatusMark kind={status} />
      </IconButton>
      <div className="ListRow-body">
        <span
          className="ListRow-title"
          data-struck={status === "done" || status === "cancelled" ? "" : undefined}
        >
          {title}
        </span>
        {path !== undefined && <span className="ListRow-subtitle">{path}</span>}
        {description && <span className="ListRow-description">{description}</span>}
      </div>
      <Badge>{formatPriority(priority)}</Badge>
    </ListRow>
  );
}

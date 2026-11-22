import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { useListNestedTasks } from "../../api/generated/endpoints";
import { TaskStatus } from "../../api/generated/model/taskStatus";
import { ErrorMessage } from "../../shared/ui/ErrorMessage";
import { ListGroup } from "../../shared/ui/ListGroup";
import { ScreenHeader } from "../../shared/ui/ScreenHeader";
import { SegmentedControl } from "../../shared/ui/SegmentedControl";
import "./explorer.css";
import { ItemDialog, type DialogItem } from "./ItemDialog";
import { formatPath } from "./pathLabel";
import { QueryStatus } from "./QueryStatus";
import { TaskRow } from "./TaskRow";
import { useChangeTaskStatus } from "./useChangeTaskStatus";
import { STALE_TIME_MS, useRootFolder } from "./useRootFolder";

/** Сколько задач просим у бэкенда; при упоре в предел показываем подпись. */
const CURRENT_LIMIT = 50;

/** Фильтр «Текущих» в адресе: нет значения — открытые по умолчанию бэкенда (`in_progress`, `todo`). */
export type CurrentFilter = "in_progress" | "todo" | undefined;

const ALL = "all";
const FILTER_ITEMS = [
  { id: ALL, label: "Все открытые" },
  { id: TaskStatus.in_progress, label: "В работе" },
  { id: TaskStatus.todo, label: "К выполнению" },
] as const;

export interface CurrentPageProps {
  filter: CurrentFilter;
  /** Действия верхней панели (меню профиля) — их подставляет оболочка. */
  actions?: ReactNode;
}

/** Экран «Текущие»: плоский список открытых задач в порядке приоритета, который вернул бэкенд. */
export function CurrentPage({ filter, actions }: CurrentPageProps) {
  const navigate = useNavigate();
  const root = useRootFolder();
  const rootId = root.data?.id ?? "";
  const tasks = useListNestedTasks(
    rootId,
    filter ? { status: [filter], limit: CURRENT_LIMIT } : { limit: CURRENT_LIMIT },
    { query: { enabled: rootId !== "", staleTime: STALE_TIME_MS } },
  );
  const { setStatus, error } = useChangeTaskStatus();
  const [editing, setEditing] = useState<DialogItem | undefined>();

  const loading = root.isPending || (root.isSuccess && tasks.isPending);
  const failure = root.error ?? tasks.error;

  return (
    <>
      <ScreenHeader title="Текущие" actions={actions} />
      <div className="Explorer-body">
        <SegmentedControl
          aria-label="Какие задачи показать"
          items={FILTER_ITEMS}
          selectedId={filter ?? ALL}
          onChange={(id) => {
            void navigate({
              to: "/current",
              search: id === ALL ? {} : { status: id },
              replace: true,
            });
          }}
        />
        {error !== undefined && <ErrorMessage message={error} />}
        <QueryStatus
          isPending={loading}
          error={failure}
          onRetry={() => {
            void (root.isError ? root.refetch() : tasks.refetch());
          }}
        />
        {tasks.data &&
          (tasks.data.length === 0 ? (
            <p className="Explorer-empty">Всё сделано</p>
          ) : (
            <>
              <ListGroup aria-label="Текущие задачи">
                {tasks.data.map((task) => (
                  <TaskRow
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    status={task.status}
                    priority={task.priority}
                    description={task.description}
                    weight={task.weight}
                    path={formatPath(task.path)}
                    onSetStatus={setStatus}
                    onOpen={setEditing}
                  />
                ))}
              </ListGroup>
              {tasks.data.length >= CURRENT_LIMIT && (
                <p className="Explorer-note">Показаны первые {CURRENT_LIMIT}</p>
              )}
            </>
          ))}
      </div>
      {editing && (
        <ItemDialog
          key={editing.id}
          item={editing}
          onClose={() => {
            setEditing(undefined);
          }}
        />
      )}
    </>
  );
}

import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { useBrowseFolder } from "../../api/generated/endpoints";
import { ErrorMessage } from "../../shared/ui/ErrorMessage";
import { ListGroup } from "../../shared/ui/ListGroup";
import { BackIcon } from "../../shared/ui/icons/BackIcon";
import { Link } from "../../shared/ui/Link";
import { ScreenHeader } from "../../shared/ui/ScreenHeader";
import { Switch } from "../../shared/ui/Switch";
import "./explorer.css";
import { FolderRow } from "./FolderRow";
import { ItemDialog, type DialogItem } from "./ItemDialog";
import { QueryStatus } from "./QueryStatus";
import { FOLDER_STATUS_LABELS } from "./statusLabels";
import { TaskRow } from "./TaskRow";
import { useChangeTaskStatus } from "./useChangeTaskStatus";
import { STALE_TIME_MS } from "./useRootFolder";

export interface ExplorerPageProps {
  folderId: string;
  /** Показывать завершённые (`?closed=1` → `include_closed=true`). */
  showClosed: boolean;
  actions?: ReactNode;
}

/** Экран «Проводник»: подпапки и задачи одной папки; «назад» — ссылка на родителя из `path`. */
export function ExplorerPage({ folderId, showClosed, actions }: ExplorerPageProps) {
  const navigate = useNavigate();
  const listing = useBrowseFolder(
    folderId,
    { include_closed: showClosed },
    { query: { staleTime: STALE_TIME_MS } },
  );
  const task = useChangeTaskStatus();
  const data = listing.data;
  const [editing, setEditing] = useState<DialogItem | undefined>();

  const parent = data?.path.at(-2);
  const back = parent ? (
    <Link to="/explorer/$folderId" params={{ folderId: parent.id }} variant="bare">
      <BackIcon />
      <span>{parent.title}</span>
    </Link>
  ) : undefined;
  const inactiveCrumb = data?.path.find((crumb) => crumb.status !== "active");
  const dimmed = data !== undefined && !data.active_branch;
  const errorText = task.error;

  return (
    <>
      <ScreenHeader title={data?.folder.title ?? "Проводник"} back={back} actions={actions} />
      <div className="Explorer-body">
        <Switch
          isSelected={showClosed}
          onChange={(selected) => {
            void navigate({
              to: "/explorer/$folderId",
              params: { folderId },
              search: selected ? { closed: 1 } : {},
              replace: true,
            });
          }}
        >
          Показать завершённые
        </Switch>
        {dimmed && (
          <p className="Explorer-note" role="status">
            Ветка неактивна{inactiveCrumb ? `: ${FOLDER_STATUS_LABELS[inactiveCrumb.status]}` : ""}
          </p>
        )}
        {errorText !== undefined && <ErrorMessage message={errorText} />}
        <QueryStatus
          isPending={listing.isPending}
          error={listing.error}
          onRetry={() => {
            void listing.refetch();
          }}
        />
        {data &&
          (data.folders.length + data.tasks.length === 0 ? (
            <p className="Explorer-empty">Папка пуста</p>
          ) : (
            <ListGroup aria-label={`Содержимое папки «${data.folder.title}»`}>
              {data.folders.map((child) => (
                <FolderRow
                  key={child.id}
                  id={child.id}
                  title={child.title}
                  status={child.status}
                  priority={child.priority}
                  description={child.description}
                  weight={child.weight}
                  dimmed={dimmed}
                  onOpen={(id) => {
                    void navigate({
                      to: "/explorer/$folderId",
                      params: { folderId: id },
                      search: showClosed ? { closed: 1 } : {},
                      viewTransition: true,
                    });
                  }}
                  onEdit={setEditing}
                />
              ))}
              {data.tasks.map((item) => (
                <TaskRow
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  status={item.status}
                  priority={item.priority}
                  description={item.description}
                  weight={item.weight}
                  dimmed={dimmed}
                  onSetStatus={task.setStatus}
                  onOpen={setEditing}
                />
              ))}
            </ListGroup>
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

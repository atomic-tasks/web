import type { FolderStatus } from "../../api/generated/model/folderStatus";
import { IconButton } from "../../shared/ui/IconButton";
import { Badge } from "../../shared/ui/Badge";
import { ChevronRightIcon } from "../../shared/ui/icons/ChevronRightIcon";
import { PenIcon } from "../../shared/ui/icons/PenIcon";
import { ListRow } from "../../shared/ui/ListRow";
import { StatusMark, type StatusMarkKind } from "../../shared/ui/StatusMark";
import type { DialogItem } from "./ItemDialog";
import { formatPriority } from "./pathLabel";
import { FOLDER_STATUS_LABELS } from "./statusLabels";

export interface FolderRowProps {
  id: string;
  title: string;
  status: FolderStatus;
  priority: number;
  description: string | null;
  weight: number;
  dimmed?: boolean | undefined;
  onOpen: (folderId: string) => void;
  /** Значок карандаша: открыть окно правки. */
  onEdit: (item: DialogItem) => void;
}

const markKind = (status: Exclude<FolderStatus, "active">): StatusMarkKind => status;

/**
 * Строка папки: нажатие открывает папку. Значок показываем, только если папка не активна
 * (активная — норма, шума нет); подпись статуса — текстом рядом, не только значком.
 */
export function FolderRow({
  id,
  title,
  status,
  priority,
  description,
  weight,
  dimmed,
  onOpen,
  onEdit,
}: FolderRowProps) {
  return (
    <ListRow
      id={id}
      textValue={title}
      data-dimmed={dimmed ? "" : undefined}
      onAction={() => {
        onOpen(id);
      }}
    >
      {status !== "active" && <StatusMark kind={markKind(status)} />}
      <div className="ListRow-body">
        <span className="ListRow-title">{title}</span>
        {status !== "active" && (
          <span className="ListRow-subtitle">{FOLDER_STATUS_LABELS[status]}</span>
        )}
        {description && <span className="ListRow-description">{description}</span>}
      </div>
      <Badge>{formatPriority(priority)}</Badge>
      <IconButton
        aria-label={`Изменить папку «${title}»`}
        onPress={() => {
          onEdit({ kind: "folder", id, title, status, priority, description, weight });
        }}
      >
        <PenIcon />
      </IconButton>
      <span className="ListRow-chevron">
        <ChevronRightIcon />
      </span>
    </ListRow>
  );
}

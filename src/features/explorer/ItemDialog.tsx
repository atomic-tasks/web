import { useState, type SyntheticEvent } from "react";

import type { FolderStatus } from "../../api/generated/model/folderStatus";
import type { TaskStatus } from "../../api/generated/model/taskStatus";
import type { UpdateNodeRequest } from "../../api/generated/model/updateNodeRequest";
import { Button } from "../../shared/ui/Button";
import { ErrorMessage } from "../../shared/ui/ErrorMessage";
import { SelectField, SliderField, TextField } from "../../shared/ui/Field";
import { Modal } from "../../shared/ui/Modal";
import "./explorer.css";
import { formatPriority } from "./pathLabel";
import {
  FOLDER_STATUS_LABELS,
  FOLDER_STATUSES,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
} from "./statusLabels";
import { useSaveItem } from "./useSaveItem";

export type DialogItem = {
  id: string;
  title: string;
  description: string | null;
  weight: number;
  /** Относительный (для «Текущих») или абсолютный приоритет, как вернул бэкенд; только для показа. */
  priority: number;
} & ({ kind: "task"; status: TaskStatus } | { kind: "folder"; status: FolderStatus });

export interface ItemDialogProps {
  item: DialogItem;
  onClose: () => void;
}

const TASK_OPTIONS = TASK_STATUSES.map((id) => ({ id, label: TASK_STATUS_LABELS[id] }));
const FOLDER_OPTIONS = FOLDER_STATUSES.map((id) => ({ id, label: FOLDER_STATUS_LABELS[id] }));

/** Сотые доли: бэкенд принимает вес с шагом 0,01, а `0.1 + 0.2` в JS — не 0.3. */
const roundWeight = (value: number): number => Math.round(value * 100) / 100;

/**
 * Окно задачи или папки: название, описание, вес, статус. Приоритет показываем, но не правим:
 * его считает бэкенд как произведение весов по пути. Отправляем только изменённое.
 */
export function ItemDialog({ item, onClose }: ItemDialogProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [weight, setWeight] = useState(item.weight);
  const [status, setStatus] = useState(item.status);
  const { save, isPending, error } = useSaveItem();

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const patch: UpdateNodeRequest = {};
    const trimmedTitle = title.trim();
    if (trimmedTitle !== item.title) patch.title = trimmedTitle;
    if (description.trim() !== (item.description ?? ""))
      patch.description = description.trim() || null;
    if (roundWeight(weight) !== item.weight) patch.weight = roundWeight(weight);
    const statusChanged = status !== item.status;
    void (async () => {
      const target =
        item.kind === "task"
          ? {
              kind: "task" as const,
              id: item.id,
              ...(statusChanged && { status: status as TaskStatus }),
            }
          : {
              kind: "folder" as const,
              id: item.id,
              ...(statusChanged && { status: status as FolderStatus }),
            };
      if (await save(target, patch)) onClose();
    })();
  };

  return (
    <Modal title={item.kind === "task" ? "Задача" : "Папка"} onClose={onClose}>
      <form className="ItemDialog" onSubmit={submit}>
        <TextField label="Название" value={title} onChange={setTitle} isRequired maxLength={200} />
        <TextField label="Описание" value={description} onChange={setDescription} multiline />
        <SliderField label="Вес" value={weight} onChange={setWeight} min={0.5} max={2} step={0.1} />
        {item.kind === "task" ? (
          <SelectField
            label="Статус"
            value={status as TaskStatus}
            options={TASK_OPTIONS}
            onChange={setStatus}
          />
        ) : (
          <SelectField
            label="Статус"
            value={status as FolderStatus}
            options={FOLDER_OPTIONS}
            onChange={setStatus}
          />
        )}
        <p className="Explorer-note">
          Приоритет: {formatPriority(item.priority)} — произведение весов от корня, считает сервер.
        </p>
        {error !== undefined && <ErrorMessage message={error} />}
        <div className="ItemDialog-actions">
          <Button onPress={onClose}>Отмена</Button>
          <Button variant="primary" type="submit" isDisabled={isPending || title.trim() === ""}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}

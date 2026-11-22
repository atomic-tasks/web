import type { FolderCrumbResponse } from "../../api/generated/model/folderCrumbResponse";

/** «Работа › AtomicTasks» из пути; пустой путь (задача прямо в выбранной папке) — `undefined`. */
export const formatPath = (
  path: readonly Pick<FolderCrumbResponse, "title">[],
): string | undefined =>
  path.length === 0 ? undefined : path.map((crumb) => crumb.title).join(" › ");

const PRIORITY_FORMAT = new Intl.NumberFormat("ru-RU", { maximumSignificantDigits: 2 });

/**
 * Приоритет бэкенда (произведение весов) для значка: два значащих разряда, без экспоненты
 * (`0.5` → «0,5», `300` → «300», `0.00042` → «0,00042»). Сам приоритет не пересчитываем.
 */
export const formatPriority = (priority: number): string => PRIORITY_FORMAT.format(priority);

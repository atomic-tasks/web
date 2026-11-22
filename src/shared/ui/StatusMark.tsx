import type { ReactNode } from "react";

import { CheckIcon } from "./icons/CheckIcon";
import { CrossIcon } from "./icons/CrossIcon";
import { PauseIcon } from "./icons/PauseIcon";
import "./StatusMark.css";

/** Форма значка: пять статусов задачи; статусы папки сводятся к ним в `features/explorer`. */
export type StatusMarkKind = "todo" | "in_progress" | "paused" | "done" | "cancelled";

export interface StatusMarkProps {
  kind: StatusMarkKind;
}

const GLYPHS: Record<StatusMarkKind, ReactNode> = {
  todo: null,
  in_progress: <span className="StatusMark-dot" />,
  paused: <PauseIcon />,
  done: <CheckIcon />,
  cancelled: <CrossIcon />,
};

/**
 * Значок статуса: форма (а не только цвет) различает статусы. Декоративный: текстовую подпись
 * статуса даёт окружение (`aria-label` кнопки или текст строки).
 */
export function StatusMark({ kind }: StatusMarkProps) {
  return (
    <span className="StatusMark" data-kind={kind} aria-hidden="true">
      {GLYPHS[kind]}
    </span>
  );
}

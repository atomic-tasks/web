import type { ReactNode } from "react";

import "./ScreenHeader.css";

export interface ScreenHeaderProps {
  title: string;
  /** Ссылка «назад» (`Link variant="bare"` со значком `BackIcon` и названием родителя) — не `history.back()`. */
  back?: ReactNode;
  /** Действия справа (меню профиля). */
  actions?: ReactNode;
}

/** Верхняя панель экрана: «назад», заголовок, действия. */
export function ScreenHeader({ title, back, actions }: ScreenHeaderProps) {
  return (
    <header className="ScreenHeader">
      <div className="ScreenHeader-bar">
        {back ?? <span />}
        {actions}
      </div>
      <h1 className="ScreenHeader-title">{title}</h1>
    </header>
  );
}

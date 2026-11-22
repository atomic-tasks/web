import type { ReactNode } from "react";

import "./Button.css";

export interface AnchorButtonProps {
  /** Адрес вне SPA: браузер уходит туда полной навигацией, клиентский роутер её не перехватывает. */
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
}

/** Ссылка с видом `Button` — для переходов за пределы сайта (например, вход через бэкенд). */
export function AnchorButton({ href, variant = "secondary", children }: AnchorButtonProps) {
  return (
    <a href={href} className="Button" data-variant={variant}>
      {children}
    </a>
  );
}

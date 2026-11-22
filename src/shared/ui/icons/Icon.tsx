import type { ReactNode } from "react";

/**
 * Общая обёртка значков: сетка 24×24, обводка `currentColor`, декоративный (`aria-hidden`).
 * Контуры значков Lucide (https://lucide.dev, лицензия ISC, © Lucide Contributors; части — © Cole Bemis, MIT).
 */
export function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

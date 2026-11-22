import type { LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

import "./Glass.css";
import { Link } from "./Link";
import "./TabBar.css";

export interface TabBarItem {
  /** Адрес пункта; проверяется типами роутера, как у `Link`. */
  to: NonNullable<LinkProps["to"]>;
  /** Видимая подпись пункта. */
  label: string;
  /** Декоративный значок (`aria-hidden`), например `<ListIcon />`. */
  icon: ReactNode;
  /** Значок для текущего пункта (например, открытая папка); нет — остаётся `icon`. */
  activeIcon?: ReactNode;
}

export interface TabBarProps {
  /** Имя навигации для скринридера. */
  "aria-label": string;
  items: readonly TabBarItem[];
}

/**
 * Плавающая стеклянная нижняя навигация. Пункты — ссылки: роутер сам ставит `aria-current="page"`
 * текущему. Подсветки нет, если ни один пункт не подходит к адресу (например, «Не найдено»).
 */
export function TabBar({ items, ...props }: TabBarProps) {
  return (
    <nav {...props} className="TabBar Glass">
      <ul className="TabBar-list">
        {items.map((item) => (
          <li key={item.label} className="TabBar-item">
            <Link to={item.to} variant="bare">
              <span className="TabBar-icon">{item.icon}</span>
              {item.activeIcon && <span className="TabBar-icon-active">{item.activeIcon}</span>}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import type { ReactNode } from "react";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";

import "./ActionMenu.css";
import { IconButton } from "./IconButton";

export interface ActionMenuItem {
  id: string;
  label: string;
}

export interface ActionMenuProps {
  /** Имя кнопки-триггера для скринридера. */
  "aria-label": string;
  /** Значок триггера. */
  icon: ReactNode;
  items: readonly ActionMenuItem[];
  /** Выбранный пункт (отмечается как `selected`), если выбор однозначный. */
  selectedId?: string;
  onAction: (id: string) => void;
}

/** Кнопка-значок с выпадающим меню (React Aria: клавиатура, фокус, закрытие по Esc). */
export function ActionMenu({
  "aria-label": label,
  icon,
  items,
  selectedId,
  onAction,
}: ActionMenuProps) {
  return (
    <MenuTrigger>
      <IconButton aria-label={label}>{icon}</IconButton>
      <Popover className="ActionMenu-popover" placement="bottom end">
        <Menu
          className="ActionMenu"
          aria-label={label}
          onAction={(key) => {
            onAction(String(key));
          }}
          {...(selectedId === undefined
            ? { selectionMode: "none" as const }
            : { selectionMode: "single" as const, selectedKeys: [selectedId] })}
        >
          {items.map((item) => (
            <MenuItem key={item.id} id={item.id} className="ActionMenu-item">
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

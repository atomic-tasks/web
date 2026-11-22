import { GridListItem, type GridListItemProps } from "react-aria-components";

import "./ListGroup.css";

export type ListRowProps = Omit<GridListItemProps, "className" | "style">;

/** Строка `ListGroup`. С `href` — ссылка (строка-папка), без — обычная строка с действиями внутри. */
export function ListRow(props: ListRowProps) {
  return <GridListItem {...props} className="ListRow" />;
}

import { GridList, type GridListProps } from "react-aria-components";

import "./ListGroup.css";

export type ListGroupProps<T extends object> = Omit<GridListProps<T>, "className" | "style">;

/** Вид «сгруппированный список»: карточка со строками; поведение и клавиатура — React Aria `GridList`. */
export function ListGroup<T extends object>(props: ListGroupProps<T>) {
  return <GridList {...props} className="ListGroup" />;
}

import type { ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import "./IconButton.css";

export interface IconButtonProps extends Omit<
  AriaButtonProps,
  "className" | "style" | "children" | "aria-label"
> {
  /** Обязательное имя действия: у кнопки нет текста. */
  "aria-label": string;
  /** Значок (`aria-hidden`). */
  children: ReactNode;
}

/** Кнопка только со значком; цель касания не меньше `--target-size`. */
export function IconButton(props: IconButtonProps) {
  return <AriaButton {...props} className="IconButton" />;
}

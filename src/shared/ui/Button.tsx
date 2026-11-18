import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import "./Button.css";

export interface ButtonProps extends Omit<AriaButtonProps, "className" | "style"> {
  variant?: "primary" | "secondary";
}

/** Кнопка: поведение и доступность — React Aria (`onPress`), оформление — токены `theme.css`. */
export function Button({ variant = "secondary", ...props }: ButtonProps) {
  return <AriaButton {...props} className="Button" data-variant={variant} />;
}

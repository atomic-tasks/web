import { createLink, type LinkComponent } from "@tanstack/react-router";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";

import "./Link.css";

interface StyledLinkProps extends Omit<AriaLinkProps, "className" | "style"> {
  /** `inline` — ссылка в тексте; `bare` — без вида ссылки (пункты навигации, вид задаёт родитель). */
  variant?: "inline" | "bare";
}

function StyledAriaLink({ variant = "inline", ...props }: StyledLinkProps) {
  return <AriaLink {...props} className="Link" data-variant={variant} />;
}

const RouterLink = createLink(StyledAriaLink);

/**
 * Ссылка внутри сайта: адрес и параметры проверяет TanStack Router (`to="/"`, `params`),
 * поведение и доступность — React Aria. Внешних ссылок здесь нет (`AGENTS.md`, «Безопасность»).
 */
export const Link: LinkComponent<typeof StyledAriaLink> = (props) => <RouterLink {...props} />;

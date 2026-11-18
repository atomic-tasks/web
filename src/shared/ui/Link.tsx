import { createLink, type LinkComponent } from "@tanstack/react-router";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";

import "./Link.css";

function StyledAriaLink(props: Omit<AriaLinkProps, "className" | "style">) {
  return <AriaLink {...props} className="Link" />;
}

const RouterLink = createLink(StyledAriaLink);

/**
 * Ссылка внутри сайта: адрес и параметры проверяет TanStack Router (`to="/"`, `params`),
 * поведение и доступность — React Aria. Внешних ссылок здесь нет (`AGENTS.md`, «Безопасность»).
 */
export const Link: LinkComponent<typeof StyledAriaLink> = (props) => <RouterLink {...props} />;

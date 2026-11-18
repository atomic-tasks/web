import { useRouter, type NavigateOptions, type ToOptions } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { RouterProvider } from "react-aria-components";

declare module "react-aria-components" {
  interface RouterConfig {
    href: ToOptions["to"];
    routerOptions: Omit<NavigateOptions, keyof ToOptions>;
  }
}

/** Ссылки и меню React Aria переходят через TanStack Router, а не перезагружают страницу. */
export function AriaRouterBridge({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <RouterProvider
      navigate={(to, options) => void router.navigate({ ...options, to: to ?? "." })}
      useHref={(to) => router.buildLocation({ to: to ?? "." }).href}
    >
      {children}
    </RouterProvider>
  );
}

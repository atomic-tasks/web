import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";

import { CurrentPage, ExplorerPage, ExplorerRoot, type CurrentFilter } from "../features/explorer";

import { CrashScreen } from "./CrashScreen";
import { DesignRoute } from "./DesignRoute";
import { Layout } from "./Layout";
import { NotFoundPage } from "./NotFoundPage";
import { ProfileMenu } from "./ProfileMenu";

// Все маршруты сайта объявляются здесь. Адреса — часть контракта: на них ведут ссылки извне
// (redirect после входа, спека 0003). В адресе — только идентификаторы, без текстов задач и папок.

const rootRoute = createRootRoute({ component: Layout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- так работает редирект TanStack Router
    throw redirect({ to: "/current", replace: true });
  },
});

const parseFilter = (value: unknown): CurrentFilter =>
  value === "in_progress" || value === "todo" ? value : undefined;

const currentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/current",
  validateSearch: (search: Record<string, unknown>): { status?: CurrentFilter } => ({
    status: parseFilter(search["status"]),
  }),
  component: function CurrentRoute() {
    const { status } = currentRoute.useSearch();
    return <CurrentPage filter={status} actions={<ProfileMenu />} />;
  },
});

/** `?closed=1` — показать завершённые; любое другое значение — нет. */
const validateClosed = (search: Record<string, unknown>): { closed?: 1 } =>
  search["closed"] === 1 || search["closed"] === "1" ? { closed: 1 } : {};

const explorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explorer",
  validateSearch: validateClosed,
  component: function ExplorerRootRoute() {
    const { closed } = explorerRoute.useSearch();
    return <ExplorerRoot showClosed={closed === 1} actions={<ProfileMenu />} />;
  },
});

const folderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explorer/$folderId",
  validateSearch: validateClosed,
  component: function FolderRoute() {
    const { folderId } = folderRoute.useParams();
    const { closed } = folderRoute.useSearch();
    return (
      <ExplorerPage
        key={folderId}
        folderId={folderId}
        showClosed={closed === 1}
        actions={<ProfileMenu />}
      />
    );
  },
});

// Витрина компонентов: в продовой сборке отдаёт «Не найдено» (см. `DesignRoute`).
const designRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design",
  component: DesignRoute,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute,
    currentRoute,
    explorerRoute,
    folderRoute,
    designRoute,
  ]),
  defaultErrorComponent: CrashScreen,
  defaultNotFoundComponent: NotFoundPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

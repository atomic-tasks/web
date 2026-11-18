import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

import { CrashScreen } from "./CrashScreen";
import { HomePage } from "./HomePage";
import { Layout } from "./Layout";
import { NotFoundPage } from "./NotFoundPage";

// Все маршруты сайта объявляются здесь. Адреса — часть контракта: на них ведут ссылки извне
// (redirect после входа, спека 0003). В адресе — только идентификаторы, без текстов задач и папок.

const rootRoute = createRootRoute({ component: Layout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute]),
  defaultErrorComponent: CrashScreen,
  defaultNotFoundComponent: NotFoundPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

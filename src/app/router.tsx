import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

import { CrashScreen } from "./CrashScreen";
import { DesignRoute } from "./DesignRoute";
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

// Витрина компонентов: в продовой сборке отдаёт «Не найдено» (см. `DesignRoute`).
const designRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design",
  component: DesignRoute,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute, designRoute]),
  defaultErrorComponent: CrashScreen,
  defaultNotFoundComponent: NotFoundPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

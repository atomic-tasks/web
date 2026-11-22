import { lazy, Suspense } from "react";

import { Loading } from "../shared/ui/Loading";
import { NotFoundPage } from "./NotFoundPage";

// Витрина существует только в `pnpm dev`: в продовой сборке ветка вырезается, `DesignPage` в бандл не попадает.
const DesignPage = import.meta.env.DEV
  ? lazy(() => import("./DesignPage").then((m) => ({ default: m.DesignPage })))
  : null;

/** Маршрут `/design`: витрина в dev, «Не найдено» в проде. */
export function DesignRoute() {
  if (!DesignPage) return <NotFoundPage />;
  return (
    <Suspense fallback={<Loading />}>
      <DesignPage />
    </Suspense>
  );
}

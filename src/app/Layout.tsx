import { Outlet } from "@tanstack/react-router";

import { SessionGate } from "../auth/SessionGate";
import { Link } from "../shared/ui/Link";
import { AriaRouterBridge } from "./AriaRouterBridge";
import { HealthStatus } from "./HealthStatus";
import "./Layout.css";
import { UserName } from "./UserName";

/** Разметка всех экранов (корневой маршрут): шапка и содержимое, доступное только после входа. */
export function Layout() {
  return (
    <AriaRouterBridge>
      <header className="Layout-header">
        <h1 className="Layout-title">
          <Link to="/">AtomicTasks</Link>
        </h1>
        <div className="Layout-meta">
          <UserName />
          <HealthStatus />
        </div>
      </header>
      <main className="Layout-main">
        <SessionGate>
          <Outlet />
        </SessionGate>
      </main>
    </AriaRouterBridge>
  );
}

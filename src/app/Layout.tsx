import { Outlet } from "@tanstack/react-router";

import { LogoutButton } from "../auth/LogoutButton";
import { SessionGate } from "../auth/SessionGate";
import { useSession } from "../auth/useSession";
import { Link } from "../shared/ui/Link";
import { AriaRouterBridge } from "./AriaRouterBridge";
import "./Layout.css";
import { UserName } from "./UserName";

/** Разметка всех экранов (корневой маршрут): шапка и содержимое, доступное только после входа. */
export function Layout() {
  const signedIn = useSession().status === "signedIn";
  return (
    <AriaRouterBridge>
      <header className="Layout-header">
        <h1 className="Layout-title">
          <Link to="/">AtomicTasks</Link>
        </h1>
        <div className="Layout-meta">
          <UserName />
          {signedIn && <LogoutButton />}
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

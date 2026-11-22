import { Outlet } from "@tanstack/react-router";

import { SessionGate } from "../auth/SessionGate";
import { useSession } from "../auth/useSession";
import { FolderIcon } from "../shared/ui/icons/FolderIcon";
import { FolderOpenIcon } from "../shared/ui/icons/FolderOpenIcon";
import { ListChecksIcon } from "../shared/ui/icons/ListChecksIcon";
import { ListIcon } from "../shared/ui/icons/ListIcon";
import { TabBar } from "../shared/ui/TabBar";
import { AriaRouterBridge } from "./AriaRouterBridge";
import "./Layout.css";

const TABS = [
  {
    to: "/current",
    label: "Текущие",
    icon: <ListIcon />,
    activeIcon: <ListChecksIcon />,
  },
  {
    to: "/explorer",
    label: "Проводник",
    icon: <FolderIcon />,
    activeIcon: <FolderOpenIcon />,
  },
] as const;

/**
 * Оболочка всех экранов: содержимое доступно только после входа; вошедшему внизу — `TabBar`.
 * Верхнюю панель (`ScreenHeader`) рисует сам экран.
 */
export function Layout() {
  const signedIn = useSession().status === "signedIn";
  return (
    <AriaRouterBridge>
      <main className="Layout-main">
        <SessionGate>
          <Outlet />
        </SessionGate>
      </main>
      {signedIn && <TabBar aria-label="Разделы" items={TABS} />}
    </AriaRouterBridge>
  );
}

import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";

import { LogoutButton } from "../auth/LogoutButton";
import { useSession } from "../auth/useSession";
import "./ProfileMenu.css";

/**
 * Имя вошедшего в верхней панели — кнопка; по нажатию окно с «Выйти». Длинное имя в панели
 * обрезается многоточием, полное — в `aria-label`. Не вошедшему — ничего.
 */
export function ProfileMenu() {
  const session = useSession();
  if (session.status !== "signedIn") return null;
  const name = session.user.display_name;
  return (
    <DialogTrigger>
      <Button className="ProfileMenu-trigger" aria-label={`Профиль: ${name}`}>
        <span className="ProfileMenu-triggerName">{name}</span>
      </Button>
      <Popover className="ProfileMenu-popover" placement="bottom end">
        <Dialog className="ProfileMenu" aria-label="Профиль">
          <LogoutButton />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

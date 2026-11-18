import { useSession } from "../auth/useSession";

/** Имя вошедшего пользователя в шапке; в остальных состояниях — ничего. */
export function UserName() {
  const session = useSession();
  return session.status === "signedIn" ? <p>{session.user.display_name}</p> : null;
}

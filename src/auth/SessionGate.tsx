import type { ReactNode } from "react";

import { describeApiError } from "../api/errors";
import { ErrorMessage } from "../shared/ui/ErrorMessage";
import { Loading } from "../shared/ui/Loading";
import { SignedOutScreen } from "./SignedOutScreen";
import { useSession } from "./useSession";

/** Показывает `children` только вошедшему пользователю; иначе — загрузку, экран входа или ошибку. */
export function SessionGate({ children }: { children: ReactNode }) {
  const session = useSession();
  switch (session.status) {
    case "loading":
      return <Loading />;
    case "signedOut":
      return <SignedOutScreen />;
    case "error":
      return <ErrorMessage message={describeApiError(session.error)} onRetry={session.retry} />;
    case "signedIn":
      return children;
  }
}

import { AnchorButton } from "../shared/ui/AnchorButton";
import { ErrorMessage } from "../shared/ui/ErrorMessage";
import { loginErrorMessage, loginHref } from "./login";

/**
 * Экран «Вы не вошли» (`GET /api/v1/me` → `401`): кнопка входа через бэкенд и ошибка прошлой попытки.
 * Подсказка про токен — только в режиме разработки: в прод-бандл она не попадает.
 */
export function SignedOutScreen() {
  const error = loginErrorMessage(window.location.search);
  return (
    <section aria-labelledby="signed-out-title">
      <h2 id="signed-out-title">Вы не вошли</h2>
      {error && <ErrorMessage message={error} />}
      <AnchorButton href={loginHref(window.location)} variant="primary">
        Войти
      </AnchorButton>
      {import.meta.env.DEV && (
        <p>
          Без Rauthy можно задать <code>ATOMIC_DEV_TOKEN</code> в <code>.env.local</code> и
          перезапустить <code>pnpm dev</code>. Bearer у бэкенда важнее cookie: для проверки входа
          токен уберите.
        </p>
      )}
    </section>
  );
}

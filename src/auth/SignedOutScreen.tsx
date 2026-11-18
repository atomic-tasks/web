/**
 * Экран «Вы не вошли» (`GET /api/v1/me` → `401`). Кнопку «Войти» добавит спека 0003.
 * Подсказка про токен — только в режиме разработки: в прод-бандл она не попадает.
 */
export function SignedOutScreen() {
  return (
    <section aria-labelledby="signed-out-title">
      <h2 id="signed-out-title">Вы не вошли</h2>
      {import.meta.env.DEV && (
        <p>
          Для локальной разработки задайте <code>ATOMIC_DEV_TOKEN</code> в <code>.env.local</code> и
          перезапустите <code>pnpm dev</code>.
        </p>
      )}
    </section>
  );
}

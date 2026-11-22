import { describeApiError } from "../api/errors";
import { useLogout } from "../api/generated/endpoints";
import { Button } from "../shared/ui/Button";
import { ErrorMessage } from "../shared/ui/ErrorMessage";

/**
 * «Выйти»: `POST /api/v1/auth/logout`, затем полная перезагрузка на `/` — в памяти вкладки
 * не остаётся данных прошлого пользователя. Ошибка — текст рядом с кнопкой.
 */
export function LogoutButton() {
  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        window.location.assign("/");
      },
    },
  });
  return (
    <>
      <Button
        onPress={() => {
          logout.mutate();
        }}
        isDisabled={logout.isPending || logout.isSuccess}
      >
        Выйти
      </Button>
      {logout.isError && <ErrorMessage message={describeApiError(logout.error)} />}
    </>
  );
}

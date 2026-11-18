import { Link } from "../shared/ui/Link";

/** Неизвестный адрес: шапка остаётся, предлагаем вернуться на главную. */
export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title">
      <h2 id="not-found-title">Не найдено</h2>
      <p>
        Такой страницы нет. <Link to="/">На главную</Link>
      </p>
    </section>
  );
}

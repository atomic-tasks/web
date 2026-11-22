import { describe, expect, it } from "vitest";

import { loginErrorMessage, loginHref } from "./login";

const returnTo = (href: string) => new URL(href, "https://site.test").searchParams.get("return_to");

describe("loginHref", () => {
  it("ведёт на вход бэкенда", () => {
    expect(loginHref({ pathname: "/", search: "" })).toMatch(/^\/api\/v1\/auth\/login\?/);
  });

  it("сохраняет путь", () => {
    expect(returnTo(loginHref({ pathname: "/folders/123", search: "" }))).toBe("/folders/123");
  });

  it("сохраняет query", () => {
    expect(returnTo(loginHref({ pathname: "/f", search: "?tab=done&x=1" }))).toBe(
      "/f?tab=done&x=1",
    );
  });

  it("вырезает login_error прошлой попытки", () => {
    expect(returnTo(loginHref({ pathname: "/", search: "?login_error=expired" }))).toBe("/");
    expect(returnTo(loginHref({ pathname: "/f", search: "?a=1&login_error=failed" }))).toBe(
      "/f?a=1",
    );
  });
});

describe("loginErrorMessage", () => {
  it("без параметра — ничего", () => {
    expect(loginErrorMessage("")).toBeUndefined();
    expect(loginErrorMessage("?a=1")).toBeUndefined();
  });

  it("коды бэкенда", () => {
    expect(loginErrorMessage("?login_error=access_denied")).toBe("Этому аккаунту вход закрыт");
    expect(loginErrorMessage("?login_error=expired")).toBe(
      "Вход занял слишком долго, попробуйте ещё раз",
    );
    expect(loginErrorMessage("?login_error=failed")).toBe("Не удалось войти");
  });

  it("неизвестный код — общий текст, сам код не показываем", () => {
    expect(loginErrorMessage("?login_error=<script>")).toBe("Не удалось войти");
    expect(loginErrorMessage("?login_error=toString")).toBe("Не удалось войти");
  });
});

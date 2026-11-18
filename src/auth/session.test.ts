import { describe, expect, it } from "vitest";

import { ApiError } from "../api/fetcher";
import { toSessionState } from "./session";

const user = { id: "u1", display_name: "Аня", email: null };

describe("toSessionState", () => {
  it("пока нет ни данных, ни ошибки — загрузка", () => {
    expect(toSessionState({ data: undefined, error: null })).toEqual({ status: "loading" });
  });

  it("есть пользователь — вошёл", () => {
    expect(toSessionState({ data: user, error: null })).toEqual({ status: "signedIn", user });
  });

  it("401 — не вошёл", () => {
    expect(toSessionState({ data: undefined, error: new ApiError(401, "") })).toEqual({
      status: "signedOut",
    });
  });

  it("401 после перезапроса важнее старого пользователя в кэше", () => {
    expect(toSessionState({ data: user, error: new ApiError(401, "") })).toEqual({
      status: "signedOut",
    });
  });

  it("другая ошибка без данных — ошибка", () => {
    const error = new TypeError("Failed to fetch");
    expect(toSessionState({ data: undefined, error })).toEqual({ status: "error", error });
  });

  it("сбой фонового обновления при известном пользователе не выкидывает из оболочки", () => {
    expect(toSessionState({ data: user, error: new ApiError(503, "") })).toEqual({
      status: "signedIn",
      user,
    });
  });
});

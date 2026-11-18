import { describe, expect, it } from "vitest";

import { describeApiError, isRetryableError, isUnauthorized } from "./errors";
import { ApiError } from "./fetcher";

const problem = (status: number, detail: unknown) =>
  new ApiError(status, { type: "about:blank", status, detail });

describe("describeApiError", () => {
  it.each([
    ["обрыв сети", new TypeError("Failed to fetch"), "Нет связи с сервером"],
    ["502 от прокси при выключенном бэкенде", new ApiError(502, ""), "Нет связи с сервером"],
    ["503", new ApiError(503, ""), "Нет связи с сервером"],
    ["504", new ApiError(504, ""), "Нет связи с сервером"],
    ["500", new ApiError(500, "Internal Server Error"), "Что-то пошло не так на сервере"],
    ["401", problem(401, "token expired"), "Сессия закончилась"],
    ["403", problem(403, "disabled"), "Нет доступа"],
    ["404", problem(404, "Folder not found"), "Не найдено"],
    ["400 с detail", problem(400, "Нельзя переместить корень"), "Нельзя переместить корень"],
    ["409 с detail", problem(409, "В папке есть открытые задачи"), "В папке есть открытые задачи"],
    ["422 с detail", problem(422, "Вес вне диапазона"), "Вес вне диапазона"],
    [
      "422 валидации FastAPI",
      problem(422, [{ loc: ["body"], msg: "x" }]),
      "Сервер не принял запрос",
    ],
    ["409 без тела", new ApiError(409, ""), "Сервер не принял запрос"],
    ["409 с пустым detail", problem(409, "  "), "Сервер не принял запрос"],
    ["прочий 4xx", problem(429, "slow down"), "Сервер не принял запрос"],
    ["битый JSON", new SyntaxError("Unexpected token"), "Что-то пошло не так"],
  ])("%s", (_, error, expected) => {
    expect(describeApiError(error)).toBe(expected);
  });

  it("не показывает detail для 403, 404 и прочих 4xx", () => {
    expect(describeApiError(problem(404, "секрет"))).not.toContain("секрет");
    expect(describeApiError(problem(403, "секрет"))).not.toContain("секрет");
    expect(describeApiError(problem(429, "секрет"))).not.toContain("секрет");
  });
});

describe("isRetryableError", () => {
  it.each([
    [new TypeError("Failed to fetch"), true],
    [new ApiError(500, ""), true],
    [new ApiError(502, ""), true],
    [new ApiError(401, ""), false],
    [new ApiError(404, ""), false],
    [new ApiError(422, ""), false],
    [new SyntaxError("Unexpected token"), false],
    [new DOMException("aborted", "AbortError"), false],
  ])("%o → %s", (error, expected) => {
    expect(isRetryableError(error)).toBe(expected);
  });
});

describe("isUnauthorized", () => {
  it("только ApiError 401", () => {
    expect(isUnauthorized(new ApiError(401, ""))).toBe(true);
    expect(isUnauthorized(new ApiError(403, ""))).toBe(false);
    expect(isUnauthorized(new Error("401"))).toBe(false);
  });
});

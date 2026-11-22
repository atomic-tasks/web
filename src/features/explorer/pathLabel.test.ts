import { describe, expect, it } from "vitest";

import { formatPath, formatPriority } from "./pathLabel";

describe("formatPath", () => {
  it("склеивает названия папок", () => {
    expect(formatPath([{ title: "Работа" }, { title: "AtomicTasks" }])).toBe(
      "Работа › AtomicTasks",
    );
  });
  it("пустой путь — ничего", () => {
    expect(formatPath([])).toBeUndefined();
  });
});

describe("formatPriority", () => {
  it.each([
    [0.5, "0,5"],
    [300, "300"],
    [1, "1"],
    [0.00042, "0,00042"],
    [1234, "1200"],
  ])("%s → %s", (value, expected) => {
    expect(formatPriority(value).replace(/\s/g, "")).toBe(expected);
  });
});

import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import type { FolderListingResponse } from "../../api/generated/model/folderListingResponse";
import type { NestedTaskResponse } from "../../api/generated/model/nestedTaskResponse";
import { applyOptimisticTaskStatus, withTaskStatus } from "./taskCache";

const task = (id: string, status: NestedTaskResponse["status"]) =>
  ({ id, status, priority: 1 }) as NestedTaskResponse;

describe("withTaskStatus", () => {
  it("меняет статус в плоском списке и не трогает другие задачи", () => {
    const result = withTaskStatus(
      [task("a", "todo"), task("b", "todo")],
      "a",
      "done",
    ) as NestedTaskResponse[];
    expect(result.map((t) => t.status)).toEqual(["done", "todo"]);
  });
  it("меняет статус в списке папки", () => {
    const listing = { folders: [], tasks: [task("a", "todo")] } as unknown as FolderListingResponse;
    const result = withTaskStatus(listing, "a", "paused") as FolderListingResponse;
    expect(result.tasks[0]?.status).toBe("paused");
  });
  it("незнакомые данные возвращает как есть", () => {
    const data = { id: "x" };
    expect(withTaskStatus(data, "a", "done")).toBe(data);
  });
});

describe("applyOptimisticTaskStatus", () => {
  it("откат возвращает исходные данные", () => {
    const client = new QueryClient();
    const key = ["/api/v1/folders/f1/nested-tasks"];
    const original = [task("a", "todo")];
    client.setQueryData(key, original);
    const rollback = applyOptimisticTaskStatus(client, "a", "done");
    expect(client.getQueryData<NestedTaskResponse[]>(key)?.[0]?.status).toBe("done");
    rollback();
    expect(client.getQueryData(key)).toEqual([task("a", "todo")]);
  });
});

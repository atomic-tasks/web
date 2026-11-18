import { describe, expect, it, vi } from "vitest";

import { ApiError } from "../api/fetcher";
import { getGetMeQueryKey } from "../api/generated/endpoints";
import { createQueryClient, shouldRetryQuery } from "./queryClient";

describe("shouldRetryQuery", () => {
  it("повторяет сеть и 5xx не больше двух раз", () => {
    const network = new TypeError("Failed to fetch");
    expect(shouldRetryQuery(0, network)).toBe(true);
    expect(shouldRetryQuery(1, new ApiError(503, ""))).toBe(true);
    expect(shouldRetryQuery(2, network)).toBe(false);
  });

  it("не повторяет 4xx", () => {
    expect(shouldRetryQuery(0, new ApiError(404, ""))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError(401, ""))).toBe(false);
  });
});

describe("createQueryClient: 401", () => {
  const fail = (status: number) => () => Promise.reject(new ApiError(status, ""));

  it("401 на запросе данных перезапрашивает me", async () => {
    const client = createQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    await client.query({ queryKey: ["/api/v1/folders/root"], queryFn: fail(401) }).catch(() => {});

    expect(invalidate).toHaveBeenCalledWith(
      { queryKey: getGetMeQueryKey() },
      { cancelRefetch: false },
    );
  });

  it("401 на самом me не перезапрашивает его (без петли)", async () => {
    const client = createQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    await client.query({ queryKey: getGetMeQueryKey(), queryFn: fail(401) }).catch(() => {});

    expect(invalidate).not.toHaveBeenCalled();
  });

  it("другие ошибки me не трогают", async () => {
    const client = createQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    await client.query({ queryKey: ["/api/v1/folders/root"], queryFn: fail(404) }).catch(() => {});

    expect(invalidate).not.toHaveBeenCalled();
  });

  it("401 на мутации перезапрашивает me", async () => {
    const client = createQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    await client
      .getMutationCache()
      .build(client, { mutationFn: fail(401) })
      .execute(undefined)
      .catch(() => {});

    expect(invalidate).toHaveBeenCalledWith(
      { queryKey: getGetMeQueryKey() },
      { cancelRefetch: false },
    );
  });
});

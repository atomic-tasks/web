import { defineConfig } from "orval";

export default defineConfig({
  backend: {
    input: { target: "./openapi/openapi.json" },
    output: {
      target: "./src/api/generated/endpoints.ts",
      schemas: "./src/api/generated/model",
      mode: "split",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        mutator: { path: "./src/api/fetcher.ts", name: "apiFetch" },
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
});

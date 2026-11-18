/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Веб и API живут на одном хосте (ADR 0003): в проде `/api` и `/health` проксирует Traefik,
// в разработке — dev-сервер Vite. Поэтому в коде клиента нет адреса API и не нужен CORS.
export default defineConfig(({ mode }) => {
  // Без префикса VITE_ эти переменные остаются в Node и не попадают в бандл.
  const env = loadEnv(mode, process.cwd(), "ATOMIC_");
  const target = env.ATOMIC_API_URL || "http://localhost:8000";
  // Personal access token только для локальной разработки, пока нет входа через cookie
  // (ADR 0003). Подставляется прокси на стороне Node, браузер его не видит.
  const devToken = env.ATOMIC_DEV_TOKEN;
  const headers = devToken ? { Authorization: `Bearer ${devToken}` } : undefined;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": { target, changeOrigin: true, ...(headers && { headers }) },
        "/health": { target, changeOrigin: true },
      },
    },
    test: {
      environment: "node",
    },
  };
});

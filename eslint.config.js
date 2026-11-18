import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", "src/api/generated"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Безопасность (AGENTS.md): без сырого HTML и без хранения данных в браузерных хранилищах.
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "Сырой HTML — путь к XSS. Тексты задач выводим только как текст.",
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "localStorage",
          message: "Токены и данные пользователя в localStorage не храним (ADR 0003).",
        },
        {
          name: "sessionStorage",
          message: "Токены и данные пользователя в sessionStorage не храним (ADR 0003).",
        },
      ],
    },
  },
]);

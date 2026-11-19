// CSP разрешает ровно два inline-стиля React Aria по хэшу (ADR 0005). Если React Aria поменяет их текст,
// хэш устареет и стиль молча заблокируется в браузере — этот тест падает раньше, в PR с обновлением.
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const here = dirname(new URL(import.meta.url).pathname);

/** Корень пакета react-aria, который использует react-aria-components (pnpm кладёт его рядом). */
function reactAriaRoot(): string {
  let dir = dirname(realpathSync(createRequire(import.meta.url).resolve("react-aria-components")));
  while (!dir.endsWith(join("node_modules", "react-aria-components"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error("не найден корень react-aria-components");
    dir = parent;
  }
  return join(dirname(dir), "react-aria");
}

/** Текст `style.textContent = \`...\`.trim()` из исходника React Aria — то, что браузер хэширует. */
function injectedStyle(file: string, attributes: Record<string, string> = {}): string {
  const source = readFileSync(join(reactAriaRoot(), "dist/private", file), "utf8");
  const match = /style\.textContent = `([\s\S]*?)`/.exec(source);
  if (!match?.[1]) throw new Error(`в ${file} не найдена вставка <style>`);
  const text = match[1].replace(/\$\{\$\w+\$var\$(\w+)\}/g, (_, name: string) => {
    const value = attributes[name];
    if (value === undefined) throw new Error(`в ${file} неизвестная подстановка ${name}`);
    return value;
  });
  return text.trim();
}

const sha256 = (text: string) => `'sha256-${createHash("sha256").update(text).digest("base64")}'`;

function cspStyleHashes(): string[] {
  const conf = readFileSync(join(here, "nginx/security-headers.conf"), "utf8");
  const csp = /^add_header Content-Security-Policy "([^"]+)"/m.exec(conf)?.[1] ?? "";
  const styleSrc = /(?:^|; )style-src ([^;]+)/.exec(csp)?.[1] ?? "";
  return styleSrc.split(" ").filter((token) => token.startsWith("'sha256-"));
}

describe("CSP style-src", () => {
  it("разрешает по хэшу ровно стили, которые вставляет React Aria", () => {
    const expected = [
      injectedStyle("interactions/usePress.mjs", {
        PRESSABLE_ATTRIBUTE: "data-react-aria-pressable",
      }),
      injectedStyle("overlays/usePreventScroll.mjs"),
    ].map(sha256);

    expect(cspStyleHashes().sort()).toEqual(expected.sort());
  });
});

/**
 * Carregador para scripts que reaproveitam código do app: resolve o atalho `@/` do
 * tsconfig (raiz do projeto) e as importações sem extensão para `.ts`/`.tsx`.
 * Uso: node --conditions=react-server --import ./scripts/alias-hooks.mjs script.ts
 * (`react-server` faz o pacote `server-only` virar um módulo vazio fora do Next.)
 */
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

function withExtension(path) {
  if (/\.(ts|tsx|js|mjs|json)$/.test(path) && existsSync(path)) return path;
  for (const ext of [".ts", ".tsx"]) if (existsSync(path + ext)) return path + ext;
  if (existsSync(`${path}/index.ts`)) return `${path}/index.ts`;
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const found = withExtension(root + specifier.slice(2));
      if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
    }
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL?.startsWith("file:")
    ) {
      const base = fileURLToPath(new URL(specifier, context.parentURL));
      if (!/\.\w+$/.test(base)) {
        const found = withExtension(base);
        if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
});

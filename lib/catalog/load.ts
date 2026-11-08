/**
 * Lê e valida os JSONs do catálogo (só Node: scripts e testes).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCatalogBook, type CatalogBook } from "./schema.ts";

export const CATALOG_DIR = fileURLToPath(new URL("../../supabase/seed/catalog/", import.meta.url));

export type LoadedCatalog = {
  books: CatalogBook[];
  errors: { file: string; errors: string[] }[];
};

export function loadCatalog(dir: string = CATALOG_DIR): LoadedCatalog {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const books: CatalogBook[] = [];
  const errors: LoadedCatalog["errors"] = [];

  for (const file of files) {
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch (error) {
      errors.push({ file, errors: [`JSON inválido: ${(error as Error).message}`] });
      continue;
    }
    const result = validateCatalogBook(data);
    if (!result.ok) {
      errors.push({ file, errors: result.errors });
      continue;
    }
    if (`${result.book.slug}.json` !== file) {
      errors.push({ file, errors: [`o nome do arquivo deve ser ${result.book.slug}.json`] });
      continue;
    }
    books.push(result.book);
  }

  return { books, errors };
}

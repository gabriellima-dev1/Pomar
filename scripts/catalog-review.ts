/**
 * Gera docs/catalogo-revisao.md a partir de supabase/seed/catalog/*.json.
 * Uso: npm run catalog:review
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "../lib/catalog/load.ts";
import { PENDING_BOOKS } from "../lib/catalog/pending.ts";
import { renderReview } from "../lib/catalog/review.ts";

const { books, errors } = loadCatalog();
if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e.file}\n  ${e.errors.join("\n  ")}`);
  process.exit(1);
}

const target = fileURLToPath(new URL("../docs/catalogo-revisao.md", import.meta.url));
writeFileSync(target, renderReview(books, PENDING_BOOKS));
console.log(`✓ ${books.length} livros → docs/catalogo-revisao.md`);

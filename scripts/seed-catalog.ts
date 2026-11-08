/**
 * Carrega supabase/seed/catalog/*.json no Supabase (idempotente).
 * Uso: npm run db:seed:catalog   (lê .env.local; precisa de SUPABASE_SECRET_KEY)
 *
 * Para cada livro: upsert por `slug`, apaga os capítulos daquele livro
 * (cascade apaga os tópicos) e insere de novo. Disciplinas dos usuários são
 * cópias e não são afetadas.
 */
import { createClient } from "@supabase/supabase-js";
import { loadCatalog } from "../lib/catalog/load.ts";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável ausente: ${name}. Configure em .env.local.`);
    process.exit(1);
  }
  return value;
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const secret = env("SUPABASE_SECRET_KEY");
if (!secret.startsWith("sb_secret_")) {
  console.error("SUPABASE_SECRET_KEY precisa ser a chave secreta nova (sb_secret_...).");
  process.exit(1);
}

const { books, errors } = loadCatalog();
if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e.file}\n  ${e.errors.join("\n  ")}`);
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function must<T>(
  label: string,
  query: PromiseLike<{ data: T; error: { message: string } | null }>,
): Promise<NonNullable<T>> {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  if (data === null || data === undefined) throw new Error(`${label}: resposta vazia`);
  return data;
}

async function mustSucceed(
  label: string,
  query: PromiseLike<{ error: { message: string } | null }>,
): Promise<void> {
  const { error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
}

for (const book of books) {
  const saved = await must(
    `livro ${book.slug}`,
    supabase
      .from("catalog_books")
      .upsert(
        {
          slug: book.slug,
          title: book.title,
          authors: book.authors.join(", "),
          edition: book.edition,
          publisher: book.publisher,
          year: book.year,
          total_pages: book.total_pages,
          verified: book.verified,
          source_note: book.source_note,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single(),
  );

  await mustSucceed(
    `limpar capítulos de ${book.slug}`,
    supabase.from("catalog_chapters").delete().eq("book_id", saved.id),
  );

  const chapters = await must(
    `capítulos de ${book.slug}`,
    supabase
      .from("catalog_chapters")
      .insert(book.chapters.map((c, i) => ({ book_id: saved.id, position: i + 1, title: c.title })))
      .select("id, position"),
  );
  const chapterId = new Map(chapters.map((c) => [c.position, c.id]));

  const topics = book.chapters.flatMap((c, ci) =>
    c.topics.map((t, ti) => ({
      chapter_id: chapterId.get(ci + 1)!,
      position: ti + 1,
      title: t.title,
      page_start: t.page_start,
      page_end: t.page_end,
    })),
  );
  await mustSucceed(`tópicos de ${book.slug}`, supabase.from("catalog_topics").insert(topics));

  console.log(`✓ ${book.slug}: ${chapters.length} capítulos, ${topics.length} tópicos`);
}

console.log(`Seed do catálogo concluído (${books.length} livros).`);

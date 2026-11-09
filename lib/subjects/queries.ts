import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Consultas de disciplinas e catálogo (sessão do usuário: a RLS filtra os dados). */

export type TopicRow = {
  id: string;
  position: number;
  title: string;
  page_start: number | null;
  page_end: number | null;
  duration_sec: number | null;
  done_at: string | null;
};

export type ChapterRow = { id: string; position: number; title: string; topics: TopicRow[] };

export type SubjectDetail = {
  id: string;
  title: string;
  source: string;
  color: string;
  goal_date: string | null;
  daily_goal: number | null;
  min_per_page: number | null;
  video_speed: number;
  catalog_book: { title: string; edition: string; verified: boolean } | null;
  chapters: ChapterRow[];
};

function byPosition<T extends { position: number }>(a: T, b: T): number {
  return a.position - b.position;
}

export const getPreferences = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("focus_min, min_per_page")
    .eq("id", userId)
    .maybeSingle();
  return { focusMin: data?.focus_min ?? 25, globalPace: data?.min_per_page ?? null };
});

export async function listSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select(
      "id, title, color, source, goal_date, min_per_page, video_speed, created_at, chapters(topics(page_start, page_end, duration_sec, done_at))",
    )
    .eq("archived", false)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Não foi possível carregar as disciplinas: ${error.message}`);
  return (data ?? []).map((s) => ({
    ...s,
    topics: s.chapters.flatMap((c) => c.topics),
  }));
}

export async function getSubject(id: string): Promise<SubjectDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select(
      "id, title, source, color, goal_date, daily_goal, min_per_page, video_speed, catalog_books(title, edition, verified), chapters(id, position, title, topics(id, position, title, page_start, page_end, duration_sec, done_at))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const { catalog_books: book, chapters, ...rest } = data;
  return {
    ...rest,
    catalog_book: book ?? null,
    chapters: [...chapters]
      .sort(byPosition)
      .map((c) => ({ ...c, topics: [...c.topics].sort(byPosition) })),
  };
}

export async function listCatalogBooks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catalog_books")
    .select("id, slug, title, authors, edition, publisher, year, verified, catalog_chapters(count)")
    .order("title");
  if (error) throw new Error(`Não foi possível carregar o catálogo: ${error.message}`);
  return (data ?? []).map(({ catalog_chapters, ...b }) => ({
    ...b,
    chapterCount: catalog_chapters[0]?.count ?? 0,
  }));
}

export async function getCatalogBook(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catalog_books")
    .select(
      "id, slug, title, authors, edition, publisher, year, verified, source_note, catalog_chapters(id, position, title, catalog_topics(id, position, title, page_start, page_end))",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const { catalog_chapters, ...book } = data;
  return {
    ...book,
    chapters: [...catalog_chapters].sort(byPosition).map(({ catalog_topics, ...c }) => ({
      ...c,
      topics: [...catalog_topics].sort(byPosition),
    })),
  };
}

export async function countSubjects(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("subjects").select("id", { count: "exact", head: true });
  return count ?? 0;
}

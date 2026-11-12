import "server-only";
import { addDays, zonedMidnight } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { DoneTopic, StatSession } from "./stats";

const PAGE = 1000;

/** Ciclos concluídos a partir de um dia local (RLS: só os da pessoa), paginados. */
export async function getCompletedSessions(
  fromDay: string,
  timeZone: string,
): Promise<StatSession[]> {
  const supabase = await createClient();
  const from = zonedMidnight(addDays(fromDay, -1), timeZone).toISOString();
  const all: StatSession[] = [];
  for (let offset = 0; offset < 20 * PAGE; offset += PAGE) {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("started_at, ended_at, paused_sec, pauses, subject_id, topic_id, pages_logged")
      .eq("status", "completed")
      .not("ended_at", "is", null)
      .gte("ended_at", from)
      .order("ended_at")
      .range(offset, offset + PAGE - 1);
    if (error || !data) break;
    all.push(...data.map((s) => ({ ...s, ended_at: s.ended_at as string })));
    if (data.length < PAGE) break;
  }
  return all;
}

export type StatSubject = {
  id: string;
  title: string;
  color: string;
  source: string;
  minPerPage: number | null;
  videoSpeed: number;
};

export async function getStatSubjects(): Promise<StatSubject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id, title, color, source, min_per_page, video_speed");
  return (data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    color: s.color,
    source: s.source,
    minPerPage: s.min_per_page,
    videoSpeed: Number(s.video_speed ?? 1),
  }));
}

/** Tópicos concluídos desde um dia (para o previsto × real). */
export async function getDoneTopics(fromDay: string, timeZone: string): Promise<DoneTopic[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("id, page_start, page_end, duration_sec, done_at, chapters!inner(subject_id)")
    .not("done_at", "is", null)
    .gte("done_at", zonedMidnight(addDays(fromDay, -1), timeZone).toISOString())
    .limit(PAGE);
  return (data ?? []).map((t) => ({
    id: t.id,
    subject_id: t.chapters.subject_id,
    page_start: t.page_start,
    page_end: t.page_end,
    duration_sec: t.duration_sec,
    done_at: t.done_at as string,
  }));
}

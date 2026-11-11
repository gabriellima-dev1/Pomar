import type { Metadata } from "next";
import { PomodoroLoader } from "@/components/pomodoro/PomodoroLoader";
import type { PomodoroTopic } from "@/components/pomodoro/PomodoroScreen";
import { requireUser } from "@/lib/auth/session";
import { localDay } from "@/lib/dates";
import { effectivePace, topicPages } from "@/lib/estimates";
import { getSubject } from "@/lib/subjects/queries";
import { nextTopic } from "@/lib/subjects/summary";
import { isUuid } from "@/lib/subjects/validation";
import { createClient } from "@/lib/supabase/server";
import type { SessionRow } from "./actions";

export const metadata: Metadata = { title: "Pomodoro" };

/** Páginas previstas para um ciclo: o tópico inteiro, ou o que cabe no foco. */
function predicted(
  topic: { page_start: number | null; page_end: number | null },
  pace: number,
  focusMin: number,
): { pages: number; label: string | null } {
  const total = topicPages(topic);
  if (total === 0 || topic.page_start === null) return { pages: 0, label: null };
  const fits = Math.max(1, Math.round(focusMin / pace));
  const pages = Math.min(total, fits);
  const end = topic.page_start + pages - 1;
  return { pages, label: pages === 1 ? `p. ${topic.page_start}` : `p. ${topic.page_start}–${end}` };
}

/**
 * Pomodoro (referencias/08-pomodoro-classico.png). Abre parado no tópico pedido
 * ou no próximo da disciplina. Um ciclo em andamento no servidor tem prioridade.
 */
export default async function PomodoroPage({ searchParams }: PageProps<"/pomodoro">) {
  const user = await requireUser();
  const query = await searchParams;
  const supabase = await createClient();

  const [{ data: profile }, { data: runningRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select("focus_min, break_min, long_break_min, min_per_page, timezone")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("pomodoro_sessions")
      .select(
        "id, subject_id, topic_id, planned_focus_sec, started_at, paused_sec, paused_at, pauses, status",
      )
      .eq("status", "running")
      .maybeSingle(),
  ]);
  const running: SessionRow | null = runningRow ?? null;

  const subjectParam = typeof query.disciplina === "string" ? query.disciplina : null;
  const topicParam = typeof query.topico === "string" ? query.topico : null;
  const subjectId = running
    ? running.subject_id
    : subjectParam && isUuid(subjectParam)
      ? subjectParam
      : null;
  const subject = subjectId ? await getSubject(subjectId) : null;

  const topics = subject?.chapters.flatMap((c) => c.topics) ?? [];
  const wantedTopic = running ? running.topic_id : topicParam;
  const topicRow =
    (wantedTopic ? topics.find((t) => t.id === wantedTopic) : undefined) ??
    (subject && !running ? nextTopic(subject.chapters) : null) ??
    null;

  const settings = {
    focus: profile?.focus_min ?? 25,
    shortBreak: profile?.break_min ?? 5,
    longBreak: profile?.long_break_min ?? 15,
  };
  const isBook = subject !== null && subject.source !== "youtube";
  const pace = isBook
    ? effectivePace(subject.min_per_page, profile?.min_per_page ?? null).minPerPage
    : null;

  let topic: PomodoroTopic | null = null;
  if (topicRow) {
    const p = pace ? predicted(topicRow, pace, settings.focus) : { pages: 0, label: null };
    topic = {
      id: topicRow.id,
      title: topicRow.title,
      predictedPages: p.pages,
      predictedLabel: p.label,
    };
  }

  return (
    <PomodoroLoader
      key={`${subject?.id ?? "livre"}:${topic?.id ?? ""}`}
      subject={subject ? { id: subject.id, title: subject.title } : null}
      topic={topic}
      settings={settings}
      pace={pace}
      today={localDay(new Date(), profile?.timezone ?? "America/Maceio")}
      running={running}
    />
  );
}

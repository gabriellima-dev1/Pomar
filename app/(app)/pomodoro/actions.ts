"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { topicPages } from "@/lib/estimates";
import { isUuid } from "@/lib/subjects/validation";
import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/telemetry.server";
import { clampMinutes } from "@/lib/timer";

/**
 * Ações do pomodoro. Toda regra (duração, pausas, 90%, média do ritmo) roda no banco,
 * nas funções de supabase/migrations/*_pomodoro.sql; aqui só validamos a entrada,
 * chamamos a função e registramos a telemetria.
 */

export type SessionRow = {
  id: string;
  subject_id: string | null;
  topic_id: string | null;
  planned_focus_sec: number;
  started_at: string;
  paused_sec: number;
  paused_at: string | null;
  pauses: number;
  status: string;
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const GENERIC = "Não consegui falar com o servidor. Confira a internet e tente de novo.";

function pick(row: SessionRow): SessionRow {
  const {
    id,
    subject_id,
    topic_id,
    planned_focus_sec,
    started_at,
    paused_sec,
    paused_at,
    pauses,
    status,
  } = row;
  return {
    id,
    subject_id,
    topic_id,
    planned_focus_sec,
    started_at,
    paused_sec,
    paused_at,
    pauses,
    status,
  };
}

function revalidateStudy(subjectId: string | null) {
  revalidatePath("/inicio");
  revalidatePath("/disciplinas");
  if (subjectId) revalidatePath(`/disciplinas/${subjectId}`);
}

export async function startPomodoro(
  subjectId: string | null,
  topicId: string | null,
): Promise<Result<SessionRow & { resumed: boolean }>> {
  await requireUser();
  if ((subjectId && !isUuid(subjectId)) || (topicId && !isUuid(topicId))) {
    return { ok: false, error: "Disciplina ou tópico inválido." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_pomodoro", {
    p_subject_id: subjectId ?? undefined,
    p_topic_id: topicId ?? undefined,
  });
  if (error || !data)
    return { ok: false, error: error?.code === "P0002" ? error.message : GENERIC };

  // Um ciclo que já estava correndo (outro aparelho) é retomado, não começado.
  const resumed = Date.parse(data.started_at) < Date.now() - 15_000;
  if (!resumed) {
    await trackServer("pomodoro_started", {
      focus_min: Math.round(data.planned_focus_sec / 60),
      with_topic: data.topic_id !== null,
    });
  }
  return { ok: true, data: { ...pick(data), resumed } };
}

export async function pausePomodoro(id: string): Promise<Result<null>> {
  await requireUser();
  if (!isUuid(id)) return { ok: false, error: "Ciclo inválido." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("pause_pomodoro", { p_id: id });
  if (error) return { ok: false, error: GENERIC };
  await trackServer("pomodoro_paused");
  return { ok: true, data: null };
}

export async function resumePomodoro(id: string): Promise<Result<null>> {
  await requireUser();
  if (!isUuid(id)) return { ok: false, error: "Ciclo inválido." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("resume_pomodoro", { p_id: id });
  return error ? { ok: false, error: GENERIC } : { ok: true, data: null };
}

export async function cancelPomodoro(
  id: string,
  reason: "user" | "restart",
): Promise<Result<null>> {
  await requireUser();
  if (!isUuid(id)) return { ok: false, error: "Ciclo inválido." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_pomodoro", { p_id: id, p_reason: reason });
  if (error) return { ok: false, error: GENERIC };
  await trackServer("pomodoro_cancelled", { reason });
  return { ok: true, data: null };
}

export async function completePomodoro(
  id: string,
): Promise<Result<{ focusMin: number; fruitsToday: number }>> {
  await requireUser();
  if (!isUuid(id)) return { ok: false, error: "Ciclo inválido." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_pomodoro", { p_id: id });
  const row = data?.[0];
  if (error || !row) {
    if (error?.message === "O ciclo ainda não terminou.") {
      return {
        ok: false,
        error: "O relógio do seu aparelho parece adiantado. Tente de novo em alguns segundos.",
      };
    }
    return { ok: false, error: error?.code === "22023" ? error.message : GENERIC };
  }
  const focusMin = Math.round(row.focus_sec / 60);
  await trackServer("pomodoro_completed", { focus_min: focusMin });
  revalidateStudy(null);
  return { ok: true, data: { focusMin, fruitsToday: row.fruits_today } };
}

export type PagesResult = {
  observed: number | null;
  ema: number | null;
  currentPace: number | null;
  suggest: boolean;
};

export async function logPages(
  id: string,
  pages: number,
  finishTopic: boolean,
): Promise<Result<PagesResult>> {
  await requireUser();
  if (!isUuid(id)) return { ok: false, error: "Ciclo inválido." };
  if (!Number.isInteger(pages) || pages < 0 || pages > 500) {
    return { ok: false, error: "Use de 0 a 500 páginas." };
  }
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("pomodoro_sessions")
    .select("subject_id, topic_id, topics(page_start, page_end, done_at)")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase.rpc("log_pomodoro_pages", {
    p_id: id,
    p_pages: pages,
    p_finish_topic: finishTopic,
  });
  const row = data?.[0];
  if (error || !row) return { ok: false, error: error?.code === "22023" ? error.message : GENERIC };

  if (pages > 0) await trackServer("pages_logged", { pages });
  const topic = session?.topics;
  if (finishTopic && topic && !topic.done_at) {
    await trackServer("topic_completed", { pages: topicPages(topic), source: "pomodoro" });
  }
  revalidateStudy(session?.subject_id ?? null);
  return {
    ok: true,
    data: {
      observed: row.observed,
      ema: row.ema,
      currentPace: row.current_pace,
      suggest: row.suggest,
    },
  };
}

export async function answerPaceSuggestion(
  subjectId: string,
  accept: boolean,
): Promise<Result<null>> {
  await requireUser();
  if (!isUuid(subjectId)) return { ok: false, error: "Disciplina inválida." };
  const supabase = await createClient();
  const { error } = accept
    ? await supabase.rpc("accept_pace_suggestion", { p_subject_id: subjectId })
    : await supabase.rpc("dismiss_pace_suggestion", { p_subject_id: subjectId });
  if (error) return { ok: false, error: GENERIC };
  if (accept) await trackServer("calibration_completed", { source: "auto", scope: "disciplina" });
  revalidateStudy(subjectId);
  return { ok: true, data: null };
}

export async function saveCycleSettings(settings: {
  focus: number;
  shortBreak: number;
  longBreak: number;
}): Promise<Result<null>> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      focus_min: clampMinutes("focus", settings.focus),
      break_min: clampMinutes("short_break", settings.shortBreak),
      long_break_min: clampMinutes("long_break", settings.longBreak),
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: GENERIC };
  revalidatePath("/pomodoro");
  return { ok: true, data: null };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { parseCalibration } from "@/lib/calibration";
import { topicPages } from "@/lib/estimates";
import {
  isUuid,
  parseItemTitle,
  parseManualStructure,
  parsePageRange,
  parseSubjectFields,
  parseTopicIds,
  type FieldErrors,
} from "@/lib/subjects/validation";
import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/telemetry.server";

export type SubjectValues = {
  title: string;
  color: string;
  goalDate: string;
  dailyGoal: string;
};

export type FormState = {
  error?: string;
  fieldErrors?: FieldErrors;
  ok?: boolean;
  /** Valores enviados, para o formulário não perder o que foi digitado após um erro. */
  values?: SubjectValues;
};

const GENERIC_ERROR = "Não foi possível salvar agora. Tente de novo em instantes.";

function str(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v : "";
}

function subjectValuesFrom(formData: FormData): SubjectValues {
  return {
    title: str(formData, "title").slice(0, 200),
    color: str(formData, "color").slice(0, 20),
    goalDate: str(formData, "goalDate").slice(0, 10),
    dailyGoal: str(formData, "dailyGoal").slice(0, 3),
  };
}

function subjectFieldsFrom(formData: FormData) {
  return parseSubjectFields({
    title: formData.get("title"),
    color: formData.get("color"),
    goalDate: formData.get("goalDate"),
    dailyGoal: formData.get("dailyGoal"),
  });
}

function revalidateSubject(subjectId: string) {
  revalidatePath("/disciplinas");
  revalidatePath(`/disciplinas/${subjectId}`);
  revalidatePath(`/disciplinas/${subjectId}/editar`);
  revalidatePath("/inicio");
}

// Criação ---------------------------------------------------------------------

export async function createFromCatalog(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const bookId = str(formData, "bookId");
  const topicIds = parseTopicIds(formData.getAll("topico"));
  const fields = subjectFieldsFrom(formData);
  const values = subjectValuesFrom(formData);

  if (!isUuid(bookId)) return { error: "Livro inválido. Volte e escolha de novo.", values };
  if (topicIds.length === 0) return { error: "Marque ao menos um tópico para estudar.", values };
  if (!fields.ok) return { fieldErrors: fields.errors, values };

  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("create_subject_from_catalog", {
    p_book_id: bookId,
    p_topic_ids: topicIds,
    p_title: fields.value.title,
    p_color: fields.value.color,
    p_goal_date: fields.value.goalDate ?? undefined,
    p_daily_goal: fields.value.dailyGoal ?? undefined,
  });
  if (error || !id) {
    return { error: error?.code === "22023" ? error.message : GENERIC_ERROR, values };
  }

  await trackServer("subject_created", { source: "catalog", topics: topicIds.length });
  revalidatePath("/disciplinas");
  revalidatePath("/inicio");
  redirect(`/disciplinas/${id}`);
}

export async function createManual(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const fields = subjectFieldsFrom(formData);
  const structure = parseManualStructure(formData.get("estrutura"));
  const fieldErrors = {
    ...(fields.ok ? {} : fields.errors),
    ...(structure.ok ? {} : structure.errors),
  };
  const values = subjectValuesFrom(formData);
  if (!fields.ok || !structure.ok) return { fieldErrors, values };

  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("create_manual_subject", {
    p_title: fields.value.title,
    p_color: fields.value.color,
    p_chapters: structure.value,
    p_goal_date: fields.value.goalDate ?? undefined,
    p_daily_goal: fields.value.dailyGoal ?? undefined,
  });
  if (error || !id) {
    return { error: error?.code === "22023" ? error.message : GENERIC_ERROR, values };
  }

  const topics = structure.value.reduce((n, c) => n + c.topics.length, 0);
  await trackServer("subject_created", { source: "manual", topics });
  revalidatePath("/disciplinas");
  revalidatePath("/inicio");
  redirect(`/disciplinas/${id}`);
}

// Progresso -----------------------------------------------------------------

/** Marca ou desmarca um tópico. Chamado pelo checkbox (Client Component). */
export async function toggleTopic(
  subjectId: string,
  topicId: string,
  done: boolean,
): Promise<{ error?: string }> {
  await requireUser();
  if (!isUuid(subjectId) || !isUuid(topicId)) return { error: "Tópico inválido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .update({ done_at: done ? new Date().toISOString() : null })
    .eq("id", topicId)
    .select("page_start, page_end")
    .maybeSingle();
  if (error || !data) return { error: "Não foi possível atualizar o tópico." };

  if (done) await trackServer("topic_completed", { pages: topicPages(data) });
  revalidateSubject(subjectId);
  return {};
}

// Edição da disciplina --------------------------------------------------------

export async function updateSubject(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const id = str(formData, "subjectId");
  if (!isUuid(id)) return { error: "Disciplina inválida." };
  const fields = subjectFieldsFrom(formData);
  const values = subjectValuesFrom(formData);
  if (!fields.ok) return { fieldErrors: fields.errors, values };

  const supabase = await createClient();
  const { error } = await supabase
    .from("subjects")
    .update({
      title: fields.value.title,
      color: fields.value.color,
      goal_date: fields.value.goalDate,
      daily_goal: fields.value.dailyGoal,
    })
    .eq("id", id);
  if (error) return { error: GENERIC_ERROR, values };
  revalidateSubject(id);
  return { ok: true, values };
}

export async function deleteSubject(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const id = str(formData, "subjectId");
  if (!isUuid(id)) return { error: "Disciplina inválida." };
  if (formData.get("confirmar") !== "sim") {
    return { error: "Marque a confirmação para excluir." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) return { error: GENERIC_ERROR };
  revalidatePath("/disciplinas");
  revalidatePath("/inicio");
  redirect("/disciplinas");
}

// Capítulos -----------------------------------------------------------------

export async function addChapter(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  if (!isUuid(subjectId)) return { error: "Disciplina inválida." };
  const title = parseItemTitle(formData.get("title"), "capítulo");
  if (!title.ok) return { error: title.error };

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("chapters")
    .select("position")
    .eq("subject_id", subjectId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase
    .from("chapters")
    .insert({ subject_id: subjectId, title: title.title, position: (last?.position ?? 0) + 1 });
  if (error) return { error: GENERIC_ERROR };
  revalidateSubject(subjectId);
  return { ok: true };
}

export async function renameChapter(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  const id = str(formData, "id");
  if (!isUuid(id) || !isUuid(subjectId)) return { error: "Capítulo inválido." };
  const title = parseItemTitle(formData.get("title"), "capítulo");
  if (!title.ok) return { error: title.error };

  const supabase = await createClient();
  const { error } = await supabase.from("chapters").update({ title: title.title }).eq("id", id);
  if (error) return { error: GENERIC_ERROR };
  revalidateSubject(subjectId);
  return { ok: true };
}

export async function deleteChapter(formData: FormData): Promise<void> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  const id = str(formData, "id");
  if (!isUuid(id) || !isUuid(subjectId)) return;
  const supabase = await createClient();
  await supabase.from("chapters").delete().eq("id", id);
  revalidateSubject(subjectId);
}

export async function moveChapter(formData: FormData): Promise<void> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  const id = str(formData, "id");
  if (!isUuid(id) || !isUuid(subjectId)) return;
  const supabase = await createClient();
  await supabase.rpc("move_chapter", {
    p_chapter_id: id,
    p_direction: str(formData, "dir") === "up" ? -1 : 1,
  });
  revalidateSubject(subjectId);
}

// Tópicos -------------------------------------------------------------------

export async function addTopic(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  const chapterId = str(formData, "chapterId");
  if (!isUuid(chapterId) || !isUuid(subjectId)) return { error: "Capítulo inválido." };
  const title = parseItemTitle(formData.get("title"), "tópico");
  if (!title.ok) return { error: title.error };
  const range = parsePageRange(formData.get("pageStart"), formData.get("pageEnd"));
  if (!range.ok) return { error: range.error };

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("topics")
    .select("position")
    .eq("chapter_id", chapterId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase.from("topics").insert({
    chapter_id: chapterId,
    position: (last?.position ?? 0) + 1,
    title: title.title,
    page_start: range.page_start,
    page_end: range.page_end,
  });
  if (error) return { error: GENERIC_ERROR };
  revalidateSubject(subjectId);
  return { ok: true };
}

export async function updateTopic(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  const id = str(formData, "id");
  if (!isUuid(id) || !isUuid(subjectId)) return { error: "Tópico inválido." };
  const title = parseItemTitle(formData.get("title"), "tópico");
  if (!title.ok) return { error: title.error };
  const range = parsePageRange(formData.get("pageStart"), formData.get("pageEnd"));
  if (!range.ok) return { error: range.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("topics")
    .update({ title: title.title, page_start: range.page_start, page_end: range.page_end })
    .eq("id", id);
  if (error) return { error: GENERIC_ERROR };
  revalidateSubject(subjectId);
  return { ok: true };
}

export async function deleteTopic(formData: FormData): Promise<void> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  const id = str(formData, "id");
  if (!isUuid(id) || !isUuid(subjectId)) return;
  const supabase = await createClient();
  await supabase.from("topics").delete().eq("id", id);
  revalidateSubject(subjectId);
}

export async function moveTopic(formData: FormData): Promise<void> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  const id = str(formData, "id");
  if (!isUuid(id) || !isUuid(subjectId)) return;
  const supabase = await createClient();
  await supabase.rpc("move_topic", {
    p_topic_id: id,
    p_direction: str(formData, "dir") === "up" ? -1 : 1,
  });
  revalidateSubject(subjectId);
}

// Calibração ------------------------------------------------------------------

export async function recordCalibration(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const subjectId = str(formData, "subjectId");
  if (subjectId !== "" && !isUuid(subjectId)) return { error: "Disciplina inválida." };

  const parsed = parseCalibration({
    source: str(formData, "source"),
    pages: str(formData, "pages"),
    seconds: str(formData, "seconds"),
    minutesPerPage: str(formData, "minutesPerPage"),
  });
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_calibration", {
    p_pages: parsed.value.pages,
    p_seconds: parsed.value.seconds,
    p_source: parsed.value.source,
    p_subject_id: subjectId || undefined,
    p_set_default: formData.get("setDefault") === "sim",
  });
  if (error) return { error: error.code === "22023" ? error.message : GENERIC_ERROR };

  await trackServer("calibration_completed", {
    source: parsed.value.source,
    scope: subjectId ? "disciplina" : "global",
  });
  if (subjectId) {
    revalidateSubject(subjectId);
    redirect(`/disciplinas/${subjectId}?calibrado=1`);
  }
  revalidatePath("/disciplinas");
  redirect("/disciplinas?calibrado=1");
}

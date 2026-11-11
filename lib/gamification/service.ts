import "server-only";
import { addDays, localDay, weekStart } from "@/lib/dates";
import { createAdminClient, type AdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import type { EventName, EventProps } from "@/lib/telemetry/events";
import { cryptoRandom } from "./badges";
import { badgeInfo } from "./catalog";
import {
  chapterCompletionTimes,
  closeDays,
  daysToClose,
  type HarvestRecord,
  type SessionRecord,
} from "./close";
import type { Tier } from "./harvest";
import { levelForXp, stageForLevel } from "./levels";
import { completionAwards, pomodoroAwards, type XpEvent } from "./xp";

/**
 * Gamificação no servidor: carrega os dados, chama as funções puras de
 * lib/gamification/* e grava com a chave secreta (apply_xp / apply_day_close).
 * O cliente nunca envia XP, emblemas, colheitas ou temas.
 */

export type XpResult = { xpGained: number; xpTotal: number; levelFrom: number; levelTo: number };

async function trackAs(
  admin: AdminClient,
  userId: string,
  name: EventName,
  props: EventProps,
): Promise<void> {
  const { error } = await admin.from("telemetry_events").insert({ user_id: userId, name, props });
  if (error) console.warn("[telemetria]", name, error.message);
}

/** Aplica eventos de XP (chaves repetidas são ignoradas) e atualiza o nível. */
async function applyXp(admin: AdminClient, userId: string, events: XpEvent[]): Promise<XpResult> {
  const { data, error } = await admin.rpc("apply_xp", {
    p_user: userId,
    p_events: events as unknown as Json,
  });
  const row = data?.[0];
  if (error || !row) throw new Error(`apply_xp: ${error?.message ?? "sem resposta"}`);

  const inserted = new Set(row.inserted);
  const xpGained = events
    .filter((e) => inserted.has(e.dedupe_key))
    .reduce((a, e) => a + e.amount, 0);
  const levelFrom = levelForXp(row.old_total);
  const levelTo = levelForXp(row.new_total);
  if (levelTo !== levelFrom) {
    await admin.from("profiles").update({ level: levelTo }).eq("id", userId);
    if (levelTo > levelFrom) {
      await trackAs(admin, userId, "level_up", { level: levelTo, stage: stageForLevel(levelTo) });
    }
  }
  return { xpGained, xpTotal: row.new_total, levelFrom, levelTo };
}

/**
 * XP de um pomodoro concluído (+ bônus do 1º do dia, que vale uma vez por dia pela chave).
 * Idempotente: repetir devolve o XP já dado ao ciclo.
 */
export async function awardPomodoro(
  userId: string,
  sessionId: string,
  admin: AdminClient = createAdminClient(),
): Promise<XpResult | null> {
  const [{ data: session }, { data: profile }] = await Promise.all([
    admin
      .from("pomodoro_sessions")
      .select("id, planned_focus_sec, ended_at, status, xp_awarded")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle(),
    admin.from("profiles").select("timezone").eq("id", userId).maybeSingle(),
  ]);
  if (!session || session.status !== "completed" || !session.ended_at || !profile) return null;

  const events = pomodoroAwards({
    sessionId,
    plannedFocusSec: session.planned_focus_sec,
    day: localDay(new Date(session.ended_at), profile.timezone),
    firstOfDay: true,
  });
  const result = await applyXp(admin, userId, events);
  if (result.xpGained > 0) {
    await admin
      .from("pomodoro_sessions")
      .update({ xp_awarded: result.xpGained })
      .eq("id", sessionId);
    return result;
  }
  return { ...result, xpGained: session.xp_awarded };
}

/** XP ao concluir um tópico (e o capítulo/disciplina que ele completar). */
export async function awardCompletion(
  userId: string,
  topicId: string,
  admin: AdminClient = createAdminClient(),
): Promise<XpResult | null> {
  const { data: topic } = await admin
    .from("topics")
    .select(
      "id, page_start, page_end, duration_sec, done_at, chapter_id, chapters!inner(subject_id, subjects!inner(user_id))",
    )
    .eq("id", topicId)
    .maybeSingle();
  if (!topic || topic.chapters.subjects.user_id !== userId || !topic.done_at) return null;
  const subjectId = topic.chapters.subject_id;

  const [{ data: chapters }, { count }] = await Promise.all([
    admin.from("chapters").select("id, topics(done_at)").eq("subject_id", subjectId),
    admin
      .from("pomodoro_sessions")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", subjectId)
      .eq("status", "completed"),
  ]);
  const all = chapters ?? [];
  const own = all.find((c) => c.id === topic.chapter_id);
  const done = (c: { topics: { done_at: string | null }[] }) =>
    c.topics.length > 0 && c.topics.every((t) => t.done_at);

  const events = completionAwards({
    subjectHasPomodoro: (count ?? 0) > 0,
    subjectId,
    topic: { ...topic, done: true },
    chapter: { id: topic.chapter_id, allDone: own ? done(own) : false },
    subjectAllDone: all.length > 0 && all.every(done),
  });
  if (events.length === 0) return null;
  return applyXp(admin, userId, events);
}

const ACTIVE_STATUSES = ["completed", "cancelled"] as const;

/**
 * Fechamento preguiçoso: fecha os dias anteriores ainda abertos (ofensiva, emblema
 * sorteado, colheita e temas) e acerta o XP de ciclos que ficaram sem XP (inclusive
 * os da Fase 2). Barato quando ontem já está fechado (1 leitura).
 */
export async function ensureDaysClosed(userId: string, now = new Date()): Promise<void> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("timezone, last_closed_day, streak_current, streak_best, freezes, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return;

  const tz = profile.timezone;
  const today = localDay(now, tz);
  const range = daysToClose({
    lastClosedDay: profile.last_closed_day,
    firstDay: localDay(new Date(profile.created_at), tz),
    today,
  });
  if (!range) return;

  // Uma margem de 1 dia nas consultas por instante cobre a diferença de fuso.
  const rangeStartIso = new Date(`${addDays(range.fromDay, -1)}T00:00:00Z`).toISOString();
  const todayEndIso = new Date(`${addDays(today, 1)}T23:59:59Z`).toISOString();
  const firstWeek = weekStart(range.fromDay);

  const [completed, cancelled, subjects, badgeRows, harvestRows, themeRows] = await Promise.all([
    admin
      .from("pomodoro_sessions")
      .select("started_at, ended_at, status, pauses, subject_id, topics(chapter_id)")
      .eq("user_id", userId)
      .eq("status", "completed")
      .lte("ended_at", todayEndIso),
    admin
      .from("pomodoro_sessions")
      .select("started_at, ended_at, status, pauses, subject_id, topics(chapter_id)")
      .eq("user_id", userId)
      .eq("status", "cancelled")
      .gte("ended_at", rangeStartIso),
    admin
      .from("subjects")
      .select("id, daily_goal, chapters(topics(done_at))")
      .eq("user_id", userId),
    admin.from("user_daily_badges").select("day").eq("user_id", userId).gte("day", firstWeek),
    admin
      .from("weekly_harvests")
      .select("week_start, tier, days")
      .eq("user_id", userId)
      .gte("week_start", firstWeek),
    admin.from("user_themes").select("theme_code").eq("user_id", userId),
  ]);

  const sessions: SessionRecord[] = [...(completed.data ?? []), ...(cancelled.data ?? [])]
    .filter((s) => s.ended_at && (ACTIVE_STATUSES as readonly string[]).includes(s.status))
    .filter((s) => localDay(new Date(s.ended_at as string), tz) <= range.toDay)
    .map((s) => ({
      startedAt: s.started_at,
      endedAt: s.ended_at as string,
      status: s.status as SessionRecord["status"],
      pauses: s.pauses,
      subjectId: s.subject_id,
      chapterId: s.topics?.chapter_id ?? null,
    }));

  const subjectList = subjects.data ?? [];
  const result = closeDays({
    timeZone: tz,
    fromDay: range.fromDay,
    toDay: range.toDay,
    streak: {
      current: profile.streak_current,
      best: profile.streak_best,
      freezes: profile.freezes,
    },
    sessions,
    chapterCompletions: chapterCompletionTimes(subjectList.flatMap((s) => s.chapters)),
    dailyGoals: new Map(
      subjectList.filter((s) => s.daily_goal).map((s) => [s.id, s.daily_goal as number]),
    ),
    existingBadgeDays: (badgeRows.data ?? []).map((b) => b.day),
    existingHarvests: (harvestRows.data ?? []).map((h): HarvestRecord => ({
      weekStart: h.week_start,
      tier: h.tier as Tier,
      days: h.days,
    })),
    unlockedThemes: new Set((themeRows.data ?? []).map((t) => t.theme_code)),
    rng: cryptoRandom,
  });

  const { data: applied, error } = await admin.rpc("apply_day_close", {
    p_user: userId,
    p_expected: profile.last_closed_day as string,
    p_last_closed: result.lastClosedDay,
    p_streak: result.streak.current,
    p_streak_best: result.streak.best,
    p_freezes: result.streak.freezes,
    p_badges: result.badges as unknown as Json,
    p_harvests: result.harvests.map((h) => ({
      week_start: h.weekStart,
      tier: h.tier,
      days: h.days,
    })) as unknown as Json,
    p_themes: result.themes as unknown as Json,
  });
  if (error) throw new Error(`apply_day_close: ${error.message}`);

  // Outro pedido fechou esses dias antes: ele já registrou a telemetria.
  if (applied) {
    for (const b of result.badges) {
      await trackAs(admin, userId, "badge_awarded", {
        code: b.code,
        rarity: badgeInfo(b.code)?.rarity ?? null,
      });
    }
    for (const h of result.harvests.filter((x) => x.upgraded)) {
      await trackAs(admin, userId, "harvest_awarded", { tier: h.tier, days: h.days });
    }
  }

  await syncPomodoroXp(admin, userId);
}

/** Dá o XP de ciclos concluídos que ainda estão com `xp_awarded = 0`. */
async function syncPomodoroXp(admin: AdminClient, userId: string): Promise<void> {
  const { data: pending } = await admin
    .from("pomodoro_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .eq("xp_awarded", 0)
    .order("ended_at")
    .limit(200);
  for (const s of pending ?? []) await awardPomodoro(userId, s.id, admin);
}

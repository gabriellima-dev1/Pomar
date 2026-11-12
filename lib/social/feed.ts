/**
 * Feed de conquistas de quem você segue (DESIGN §4.7, telas.md › 26, DECISOES 11/11).
 * Só conquistas marcantes: colheita da semana, subida de estágio da árvore (níveis 3, 6,
 * 10 e 15), emblema raro, capítulo ou disciplina concluída e subida de divisão.
 * As de recompensa (colheita, emblema raro, estágio) não entram para a coorte B.
 */
import { localClock, localDay, daysBetween } from "@/lib/dates";
import { badgeInfo } from "@/lib/gamification/catalog";
import { TIER_LABEL, type Tier } from "@/lib/gamification/harvest";
import { STAGE_PHRASE, stageChanged, stageForLevel, type Stage } from "@/lib/gamification/levels";
import { shortDate, weekRangeLabel } from "@/lib/gamification/present";
import { DIVISION_LABEL, isDivision, type Division } from "@/lib/league/divisions";

export const FEED_DAYS = 14;

export type FeedType = "harvest" | "stage" | "rare_badge" | "chapter" | "subject" | "division";

export type FeedPayload = {
  tier?: Tier;
  week_start?: string;
  level?: number;
  stage?: Stage;
  code?: string;
  position?: number;
  subject_title?: string;
  division?: Division;
};

export type FeedDraft = { type: FeedType; payload: FeedPayload; dedupe_key: string };

/** Itens do fechamento do dia: emblema raro e colheita (1 item por semana, que sobe de faixa). */
export function dayCloseDrafts(input: {
  rewards: boolean;
  badges: readonly { day: string; code: string }[];
  harvests: readonly { weekStart: string; tier: Tier }[];
}): FeedDraft[] {
  if (!input.rewards) return [];
  const drafts: FeedDraft[] = [];
  for (const b of input.badges) {
    if (badgeInfo(b.code)?.rarity !== "raro") continue;
    drafts.push({ type: "rare_badge", payload: { code: b.code }, dedupe_key: `badge:${b.day}` });
  }
  for (const h of input.harvests) {
    drafts.push({
      type: "harvest",
      payload: { tier: h.tier, week_start: h.weekStart },
      dedupe_key: `harvest:${h.weekStart}`,
    });
  }
  return drafts;
}

/** Subida de estágio da árvore (só quando o estágio muda). */
export function levelDraft(from: number, to: number, rewards: boolean): FeedDraft | null {
  if (!rewards || !stageChanged(from, to)) return null;
  const stage = stageForLevel(to);
  return { type: "stage", payload: { level: to, stage }, dedupe_key: `stage:${stage}` };
}

/** Capítulo e disciplina concluídos (valem para as duas coortes). */
export function completionDrafts(input: {
  subject: { id: string; title: string };
  chapter: { id: string; position: number } | null;
  subjectDone: boolean;
}): FeedDraft[] {
  const drafts: FeedDraft[] = [];
  if (input.chapter) {
    drafts.push({
      type: "chapter",
      payload: { position: input.chapter.position, subject_title: input.subject.title },
      dedupe_key: `chapter:${input.chapter.id}`,
    });
  }
  if (input.subjectDone) {
    drafts.push({
      type: "subject",
      payload: { subject_title: input.subject.title },
      dedupe_key: `subject:${input.subject.id}`,
    });
  }
  return drafts;
}

/** Subida de divisão no fechamento da Feira. */
export function divisionDraft(week: string, to: Division): FeedDraft {
  return { type: "division", payload: { division: to }, dedupe_key: `division:${week}` };
}

function str(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

const FEED_TYPES: readonly string[] = [
  "harvest",
  "stage",
  "rare_badge",
  "chapter",
  "subject",
  "division",
];

export function isFeedType(v: unknown): v is FeedType {
  return typeof v === "string" && FEED_TYPES.includes(v);
}

/** Lê o payload vindo do banco (jsonb) sem confiar no formato. */
export function parsePayload(raw: unknown): FeedPayload {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const r = raw as Record<string, unknown>;
  const tier = str(r.tier);
  const stage = str(r.stage);
  return {
    tier: tier === "bronze" || tier === "prata" || tier === "ouro" ? tier : undefined,
    week_start: str(r.week_start) ?? undefined,
    level: typeof r.level === "number" ? r.level : undefined,
    stage: stage && stage in STAGE_PHRASE ? (stage as Stage) : undefined,
    code: str(r.code) ?? undefined,
    position: typeof r.position === "number" ? r.position : undefined,
    subject_title: str(r.subject_title) ?? undefined,
    division: isDivision(r.division) ? r.division : undefined,
  };
}

const tierName = (p: FeedPayload) => `Colheita de ${p.tier ? TIER_LABEL[p.tier] : "Bronze"}`;
const divisionName = (p: FeedPayload) =>
  `Feira de ${p.division ? DIVISION_LABEL[p.division] : ""}`.trim();
const badgeName = (p: FeedPayload) => badgeInfo(p.code ?? "")?.name ?? "raro";
const subjectName = (p: FeedPayload) => p.subject_title ?? "uma disciplina";

/**
 * Texto do item depois do apelido; `strong` vai em negrito:
 * "fez a Colheita de Ouro", "encontrou o emblema **Lua Cheia**".
 */
export function feedText(type: FeedType, p: FeedPayload): { text: string; strong?: string } {
  switch (type) {
    case "harvest":
      return { text: `fez a ${tierName(p)}` };
    case "stage":
      return {
        text: `chegou ao nível ${p.level ?? ""}${p.stage ? ` · ${STAGE_PHRASE[p.stage]}` : ""}`,
      };
    case "rare_badge":
      return { text: "encontrou o emblema ", strong: badgeName(p) };
    case "chapter":
      return { text: `terminou o capítulo ${p.position ?? ""} de ${subjectName(p)}` };
    case "subject":
      return { text: `concluiu a disciplina ${subjectName(p)}` };
    case "division":
      return { text: `subiu para a ${divisionName(p)}` };
  }
}

/** Como a conquista é citada na faixa de parabéns: "pelo seu **Foco de Ferro**". */
export function achievementRef(type: FeedType, p: FeedPayload): { prefix: string; name: string } {
  switch (type) {
    case "harvest":
      return { prefix: "pela sua", name: tierName(p) };
    case "stage":
      return { prefix: "pelo seu", name: `nível ${p.level ?? ""}`.trim() };
    case "rare_badge":
      return { prefix: "pelo seu emblema", name: badgeName(p) };
    case "chapter":
      return { prefix: "pelo", name: `capítulo ${p.position ?? ""} de ${subjectName(p)}` };
    case "subject":
      return { prefix: "pela disciplina", name: subjectName(p) };
    case "division":
      return { prefix: "pela subida para a", name: divisionName(p) };
  }
}

/** Conquistas recentes do perfil público (28): "Colheita de Prata · semana de 2 a 8 de nov.". */
export function profileAchievement(
  type: FeedType,
  p: FeedPayload,
): { title: string; note?: string } {
  switch (type) {
    case "harvest":
      return {
        title: tierName(p),
        note: p.week_start ? `semana de ${weekRangeLabel(p.week_start)}` : undefined,
      };
    case "stage":
      return { title: `Chegou ao nível ${p.level ?? ""}`.trim() };
    case "rare_badge":
      return { title: `Emblema ${badgeName(p)}` };
    case "chapter":
      return { title: `Terminou o capítulo ${p.position ?? ""} de ${subjectName(p)}` };
    case "subject":
      return { title: `Concluiu ${subjectName(p)}` };
    case "division":
      return { title: `Subiu para a ${divisionName(p)}` };
  }
}

const WEEKDAY_SHORT = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];

/** "hoje, 08:10" · "ontem, 22:40" · "seg., 23:30" (até 6 dias) · "3 de nov.". */
export function whenLabel(iso: string, now: Date, timeZone: string): string {
  const c = localClock(new Date(iso), timeZone);
  const time = `${String(c.hour).padStart(2, "0")}:${String(c.minute).padStart(2, "0")}`;
  const diff = daysBetween(c.day, localDay(now, timeZone));
  if (diff <= 0) return `hoje, ${time}`;
  if (diff === 1) return `ontem, ${time}`;
  if (diff < 7) return `${WEEKDAY_SHORT[new Date(`${c.day}T12:00:00Z`).getUTCDay()]}, ${time}`;
  return shortDate(c.day);
}

/** Só o dia, para o perfil: "hoje", "ontem", "seg.", "3 de nov.". */
export function dayLabelShort(iso: string, now: Date, timeZone: string): string {
  return whenLabel(iso, now, timeZone).replace(/, \d{2}:\d{2}$/, "");
}

export type ReceivedReaction = {
  eventId: string;
  type: FeedType;
  payload: FeedPayload;
  from: string | null;
  at: string;
};

/**
 * Faixa de parabéns recebidos desde a última visita (26): a conquista com o parabéns
 * mais recente, quem mandou por último e quantas pessoas mais.
 */
export function reactionBanner(
  rows: readonly ReceivedReaction[],
): { lead: string; others: number; ref: { prefix: string; name: string } } | null {
  if (rows.length === 0) return null;
  const latest = [...rows].sort((a, b) => b.at.localeCompare(a.at))[0]!;
  const same = rows.filter((r) => r.eventId === latest.eventId);
  return {
    lead: latest.from ?? "Alguém",
    others: same.length - 1,
    ref: achievementRef(latest.type, latest.payload),
  };
}

import { describe, expect, it } from "vitest";
import {
  computeAdminMetrics,
  diffLabel,
  pct,
  periodDays,
  type AdminEvent,
  type AdminPerson,
} from "./metrics";

const TZ = "America/Maceio";
// "Agora" = 20/11/2026 15:00 em Maceió (18:00 UTC).
const NOW = new Date("2026-11-20T18:00:00Z");
/** Meio-dia em Maceió de um dia. */
const at = (day: string) => `${day}T15:00:00Z`;

function person(id: string, signup: string, extra: Partial<AdminPerson> = {}): AdminPerson {
  return {
    id,
    timezone: TZ,
    createdAt: at(signup),
    isDemo: false,
    cohort: "A",
    inExperiment: true,
    ...extra,
  };
}
const ev = (userId: string, name: string, day: string, choice?: string): AdminEvent => ({
  userId,
  name,
  at: at(day),
  choice,
});

describe("período do painel", () => {
  it("7 e 30 dias terminam hoje; desde o início começa no 1º cadastro", () => {
    expect(periodDays(7, "2026-11-20", "2026-11-01")).toHaveLength(7);
    expect(periodDays(7, "2026-11-20", "2026-11-01")[0]).toBe("2026-11-14");
    expect(periodDays(30, "2026-11-20", "2026-11-01")).toHaveLength(30);
    expect(periodDays("tudo", "2026-11-20", "2026-11-10")).toHaveLength(11);
  });
});

describe("métricas do admin (DESIGN §9.2)", () => {
  const people = [
    person("ana", "2026-11-10"),
    person("bia", "2026-11-12", { cohort: "B" }),
    person("caio", "2026-11-19"),
    person("demo", "2026-11-10", { isDemo: true }),
  ];
  const events: AdminEvent[] = [
    // Ana: funil completo, ativa em 11, 12 e 13 (3 dias nos primeiros 7) e hoje.
    ev("ana", "signup_completed", "2026-11-10"),
    ev("ana", "onboarding_quiz_completed", "2026-11-10"),
    ev("ana", "subject_created", "2026-11-10"),
    ev("ana", "calibration_completed", "2026-11-10"),
    ev("ana", "pomodoro_completed", "2026-11-11"),
    ev("ana", "pomodoro_completed", "2026-11-12"),
    ev("ana", "topic_completed", "2026-11-13"),
    ev("ana", "pomodoro_completed", "2026-11-17"),
    ev("ana", "pomodoro_completed", "2026-11-20"),
    // Bia: para no quiz; ativa no dia 13 (D1) por um tópico marcado à mão.
    ev("bia", "onboarding_quiz_completed", "2026-11-12"),
    ev("bia", "topic_completed", "2026-11-13"),
    // Caio: só se cadastrou.
    // Demo: muito ativo (fica fora por padrão).
    ev("demo", "pomodoro_completed", "2026-11-18"),
    ev("demo", "pomodoro_completed", "2026-11-19"),
    ev("demo", "pomodoro_completed", "2026-11-20"),
    // Nudge da pausa
    ev("ana", "pause_nudge_shown", "2026-11-17"),
    ev("ana", "pause_nudge_choice", "2026-11-17", "restart"),
    ev("bia", "pause_nudge_shown", "2026-11-18"),
    ev("bia", "pause_nudge_choice", "2026-11-18", "continue"),
    // Evento anônimo (conta excluída) não conta para ninguém.
    { userId: null, name: "pomodoro_completed", at: at("2026-11-20") },
  ];

  const m = computeAdminMetrics({ people, events, period: 30, excludeDemo: true, now: NOW });

  it("conta as contas demo e as tira das métricas", () => {
    expect(m.demoAccounts).toBe(1);
    expect(m.mau).toBe(2); // ana e bia
    const comDemo = computeAdminMetrics({
      people,
      events,
      period: 30,
      excludeDemo: false,
      now: NOW,
    });
    expect(comDemo.mau).toBe(3);
  });

  it("DAU médio, ativos por dia e stickiness", () => {
    const dia = (d: string) => m.activeByDay.find((x) => x.day === d)?.count;
    expect(dia("2026-11-13")).toBe(2);
    expect(dia("2026-11-20")).toBe(1);
    expect(dia("2026-11-15")).toBe(0);
    // ativos-dia: ana 11,12,13,17,20 (5) + bia 13 (1) = 6 em 30 dias
    expect(m.dauAvg).toBe(0.2);
    expect(m.stickiness).toBeCloseTo(6 / 30 / 2, 5);
  });

  it("funil do onboarding com a perda de cada etapa", () => {
    expect(m.funnel.map((s) => s.count)).toEqual([3, 2, 1, 1, 1, 1]);
    expect(m.funnel[0]!.drop).toBeNull();
    expect(m.funnel[1]!.drop).toBeCloseTo(1 / 3, 5);
    expect(m.funnel[2]!.drop).toBeCloseTo(0.5, 5);
  });

  it("retenção D1 e D7 só com o dia D já completo", () => {
    // D1: ana (11 ativa) e bia (13 ativa); caio (20 = hoje) fica fora da base.
    expect(m.retentionD1).toBe(1);
    // D7: ana (17 ativa) e bia (19 inativa); caio fora.
    expect(m.retentionD7).toBe(0.5);
  });

  it("nudge: % de Reiniciar sobre os pop-ups exibidos", () => {
    expect(m.nudge).toEqual({ shown: 2, restart: 1, continue: 1, acceptance: 0.5 });
  });

  it("experimento: só quem está nele, por coorte", () => {
    expect(m.cohorts.A.people).toBe(2); // ana e caio
    expect(m.cohorts.B.people).toBe(1);
    expect(m.cohorts.A.retentionD7).toBe(1);
    expect(m.cohorts.B.retentionD7).toBe(0);
    const fora = computeAdminMetrics({
      people: people.map((p) => (p.id === "bia" ? { ...p, inExperiment: false } : p)),
      events,
      period: 30,
      excludeDemo: true,
      now: NOW,
    });
    expect(fora.cohorts.B.people).toBe(0);
    // Ana: 4 pomodoros em 30 dias, 2 pessoas no A → 2 por pessoa em 30/7 semanas.
    expect(m.cohorts.A.pomodorosPerPersonWeek).toBe(Math.round((2 / (30 / 7)) * 10) / 10);
  });

  it("período de 7 dias recorta as séries", () => {
    const s = computeAdminMetrics({ people, events, period: 7, excludeDemo: true, now: NOW });
    expect(s.activeByDay).toHaveLength(7);
    expect(s.funnel[0]!.count).toBe(1); // só caio se cadastrou nos últimos 7 dias
  });
});

describe("formatação", () => {
  it("porcentagem e diferenças", () => {
    expect(pct(0.4375)).toBe("44%");
    expect(pct(null)).toBe("—");
    expect(diffLabel(10.2, 7.8, "relative")).toBe("+31%");
    expect(diffLabel(0.42, 0.33, "points")).toBe("+9 p.p.");
    expect(diffLabel(1, 0, "relative")).toBe("—");
  });
});

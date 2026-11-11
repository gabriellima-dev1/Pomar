import { describe, expect, it } from "vitest";
import { drawBadge, eligibleBadges, type BadgeContext, type DaySession } from "./badges";
import { BADGES } from "./catalog";

const TZ = "America/Maceio"; // UTC−3

/** Sessão concluída que começou às `hh:mm` locais do dia 10/11/2026. */
function at(hhmm: string, extra: Partial<DaySession> = {}): DaySession {
  const [h, m] = hhmm.split(":").map(Number);
  const startedAt = new Date(Date.UTC(2026, 10, 10, (h ?? 0) + 3, m ?? 0));
  return { startedAt, status: "completed", pauses: 1, subjectId: "s1", ...extra };
}

function ctx(partial: Partial<BadgeContext> = {}): BadgeContext {
  return {
    day: "2026-11-10",
    timeZone: TZ,
    sessions: [at("14:00")],
    previousStudyDay: "2026-11-09",
    startedSubjectOrChapter: false,
    finishedChapter: false,
    dailyGoals: new Map(),
    reminderTime: null,
    ...partial,
  };
}

describe("eligibleBadges", () => {
  it("sem pomodoro concluído, nenhum emblema", () => {
    expect(eligibleBadges(ctx({ sessions: [] }))).toEqual([]);
    expect(eligibleBadges(ctx({ sessions: [at("14:00", { status: "cancelled" })] }))).toEqual([]);
  });

  it("qualquer dia com pomodoro: Fruto do Dia e Fruto Dourado", () => {
    expect(eligibleBadges(ctx())).toEqual(["fruto_do_dia", "fruto_dourado"]);
  });

  it("Madrugador: começou antes das 7h", () => {
    expect(eligibleBadges(ctx({ sessions: [at("06:59")] }))).toContain("madrugador");
    expect(eligibleBadges(ctx({ sessions: [at("07:00")] }))).not.toContain("madrugador");
  });

  it("Coruja: começou às 22h ou depois", () => {
    expect(eligibleBadges(ctx({ sessions: [at("22:00")] }))).toContain("coruja");
    expect(eligibleBadges(ctx({ sessions: [at("21:59")] }))).not.toContain("coruja");
  });

  it("Maratona: 4 concluídos seguidos, sem encerrado no meio", () => {
    const four = ["09:00", "09:30", "10:00", "10:30"].map((t) => at(t));
    expect(eligibleBadges(ctx({ sessions: four }))).toContain("maratona");

    const broken = [
      at("09:00"),
      at("09:30"),
      at("09:45", { status: "cancelled" }),
      at("10:00"),
      at("10:30"),
    ];
    expect(eligibleBadges(ctx({ sessions: broken }))).not.toContain("maratona");
  });

  it("Maratona considera a ordem de início, não a da lista", () => {
    const shuffled = [at("10:30"), at("09:00"), at("10:00"), at("09:30")];
    expect(eligibleBadges(ctx({ sessions: shuffled }))).toContain("maratona");
  });

  it("Foco de Ferro: 3 ou mais concluídos sem pausa", () => {
    const three = ["09:00", "10:00", "11:00"].map((t) => at(t, { pauses: 0 }));
    expect(eligibleBadges(ctx({ sessions: three }))).toContain("sem_pausa");
    const two = [at("09:00", { pauses: 0 }), at("10:00", { pauses: 0 }), at("11:00")];
    expect(eligibleBadges(ctx({ sessions: two }))).not.toContain("sem_pausa");
  });

  it("Explorador e Finalizador vêm do histórico", () => {
    expect(eligibleBadges(ctx({ startedSubjectOrChapter: true }))).toContain("explorador");
    expect(eligibleBadges(ctx({ finishedChapter: true }))).toContain("finalizador");
  });

  it("Constante: alguma disciplina bateu a meta diária", () => {
    const sessions = [at("09:00"), at("10:00"), at("11:00", { subjectId: "s2" })];
    expect(eligibleBadges(ctx({ sessions, dailyGoals: new Map([["s1", 2]]) }))).toContain(
      "constante",
    );
    expect(eligibleBadges(ctx({ sessions, dailyGoals: new Map([["s2", 2]]) }))).not.toContain(
      "constante",
    );
  });

  it("Pontual: até 15 min depois do lembrete", () => {
    expect(eligibleBadges(ctx({ sessions: [at("19:15")], reminderTime: "19:00:00" }))).toContain(
      "pontual",
    );
    expect(eligibleBadges(ctx({ sessions: [at("19:16")], reminderTime: "19:00" }))).not.toContain(
      "pontual",
    );
    expect(eligibleBadges(ctx({ sessions: [at("18:59")], reminderTime: "19:00" }))).not.toContain(
      "pontual",
    );
    expect(eligibleBadges(ctx({ sessions: [at("19:05")] }))).not.toContain("pontual");
  });

  it("Bom Retorno: 3 ou mais dias vazios antes", () => {
    expect(eligibleBadges(ctx({ previousStudyDay: "2026-11-06" }))).toContain("retorno");
    expect(eligibleBadges(ctx({ previousStudyDay: "2026-11-07" }))).not.toContain("retorno");
    expect(eligibleBadges(ctx({ previousStudyDay: null }))).not.toContain("retorno");
  });

  it("Lua Cheia: à noite perto da cheia", () => {
    // Cheia em 24/11/2026 ~14:53 UTC.
    const night = new Date("2026-11-24T23:00:00Z"); // 20h locais
    const day = new Date("2026-11-24T15:00:00Z"); // 12h locais
    const base = { status: "completed" as const, pauses: 0, subjectId: null };
    expect(
      eligibleBadges(ctx({ day: "2026-11-24", sessions: [{ ...base, startedAt: night }] })),
    ).toContain("lua_cheia");
    expect(
      eligibleBadges(ctx({ day: "2026-11-24", sessions: [{ ...base, startedAt: day }] })),
    ).not.toContain("lua_cheia");
    expect(eligibleBadges(ctx({ sessions: [at("21:00")] }))).not.toContain("lua_cheia");
  });

  it("devolve na ordem do álbum", () => {
    const order = BADGES.map((b) => b.code);
    const got = eligibleBadges(
      ctx({ sessions: [at("05:00"), at("23:00")], startedSubjectOrChapter: true }),
    );
    expect(got).toEqual([...got].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  });
});

describe("drawBadge", () => {
  it("sorteia ponderado pela raridade (comum 10, incomum 5, raro 1)", () => {
    const pool = ["fruto_do_dia", "maratona", "fruto_dourado"] as const; // 10 + 5 + 1 = 16
    expect(drawBadge(pool, () => 0)).toBe("fruto_do_dia");
    expect(drawBadge(pool, () => 9.99 / 16)).toBe("fruto_do_dia");
    expect(drawBadge(pool, () => 10 / 16)).toBe("maratona");
    expect(drawBadge(pool, () => 14.99 / 16)).toBe("maratona");
    expect(drawBadge(pool, () => 15 / 16)).toBe("fruto_dourado");
    expect(drawBadge(pool, () => 0.999999)).toBe("fruto_dourado");
  });

  it("um gerador fora do intervalo não quebra o sorteio", () => {
    expect(drawBadge(["fruto_do_dia"], () => 1)).toBe("fruto_do_dia");
    expect(drawBadge(["fruto_do_dia", "coruja"], () => -1)).toBe("fruto_do_dia");
  });

  it("a frequência se aproxima dos pesos", () => {
    let seed = 42;
    const rng = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
    const pool = ["fruto_do_dia", "maratona", "fruto_dourado"] as const;
    const count = { fruto_do_dia: 0, maratona: 0, fruto_dourado: 0 };
    for (let i = 0; i < 16000; i++) count[drawBadge(pool, rng) as keyof typeof count]++;
    expect(count.fruto_do_dia / 16000).toBeCloseTo(10 / 16, 1);
    expect(count.maratona / 16000).toBeCloseTo(5 / 16, 1);
    expect(count.fruto_dourado / 16000).toBeCloseTo(1 / 16, 1);
  });

  it("sem elegíveis é erro (o dia sem pomodoro não sorteia)", () => {
    expect(() => drawBadge([], () => 0)).toThrow();
  });
});

import { describe, expect, it } from "vitest";
import {
  achievementRef,
  completionDrafts,
  dayCloseDrafts,
  dayLabelShort,
  divisionDraft,
  feedText,
  levelDraft,
  parsePayload,
  profileAchievement,
  reactionBanner,
  whenLabel,
} from "./feed.ts";

describe("o que vira item do feed", () => {
  it("emblema raro e colheita entram; emblema comum não", () => {
    const drafts = dayCloseDrafts({
      rewards: true,
      badges: [
        { day: "2026-11-10", code: "fruto_do_dia" },
        { day: "2026-11-11", code: "lua_cheia" },
      ],
      harvests: [{ weekStart: "2026-11-09", tier: "prata" }],
    });
    expect(drafts).toEqual([
      { type: "rare_badge", payload: { code: "lua_cheia" }, dedupe_key: "badge:2026-11-11" },
      {
        type: "harvest",
        payload: { tier: "prata", week_start: "2026-11-09" },
        dedupe_key: "harvest:2026-11-09",
      },
    ]);
  });

  it("coorte B não gera itens de recompensa", () => {
    expect(
      dayCloseDrafts({
        rewards: false,
        badges: [{ day: "2026-11-11", code: "fruto_dourado" }],
        harvests: [{ weekStart: "2026-11-09", tier: "ouro" }],
      }),
    ).toEqual([]);
    expect(levelDraft(5, 6, false)).toBeNull();
  });

  it("só a mudança de estágio da árvore vira item", () => {
    expect(levelDraft(4, 5, true)).toBeNull();
    expect(levelDraft(5, 6, true)).toEqual({
      type: "stage",
      payload: { level: 6, stage: "jovem" },
      dedupe_key: "stage:jovem",
    });
  });

  it("capítulo e disciplina concluídos levam o nome da disciplina", () => {
    const drafts = completionDrafts({
      subject: { id: "s1", title: "Algoritmos" },
      chapter: { id: "c4", position: 4 },
      subjectDone: true,
    });
    expect(drafts.map((d) => d.dedupe_key)).toEqual(["chapter:c4", "subject:s1"]);
    expect(feedText("chapter", drafts[0]!.payload).text).toBe(
      "terminou o capítulo 4 de Algoritmos",
    );
  });

  it("subida de divisão", () => {
    expect(divisionDraft("2026-11-09", "ouro")).toEqual({
      type: "division",
      payload: { division: "ouro" },
      dedupe_key: "division:2026-11-09",
    });
  });
});

describe("textos", () => {
  it("monta cada item como na referência 26", () => {
    expect(feedText("harvest", { tier: "ouro" }).text).toBe("fez a Colheita de Ouro");
    expect(feedText("stage", { level: 6, stage: "jovem" }).text).toBe(
      "chegou ao nível 6 · árvore jovem",
    );
    expect(feedText("rare_badge", { code: "lua_cheia" })).toEqual({
      text: "encontrou o emblema ",
      strong: "Lua Cheia",
    });
    expect(feedText("subject", { subject_title: "Redes" }).text).toBe(
      "concluiu a disciplina Redes",
    );
    expect(feedText("division", { division: "ouro" }).text).toBe("subiu para a Feira de Ouro");
  });

  it("conquistas recentes do perfil", () => {
    expect(profileAchievement("harvest", { tier: "prata", week_start: "2026-11-02" })).toEqual({
      title: "Colheita de Prata",
      note: "semana de 2 a 8 de nov.",
    });
    expect(profileAchievement("stage", { level: 6 }).title).toBe("Chegou ao nível 6");
  });

  it("lê o payload sem confiar no formato", () => {
    expect(parsePayload({ tier: "diamante", level: "6", division: "ouro", stage: "x" })).toEqual({
      tier: undefined,
      week_start: undefined,
      level: undefined,
      stage: undefined,
      code: undefined,
      position: undefined,
      subject_title: undefined,
      division: "ouro",
    });
    expect(parsePayload(null)).toEqual({});
  });
});

describe("quando", () => {
  const now = new Date("2026-11-12T15:00:00Z"); // quinta, 12h em Maceió
  const tz = "America/Maceio";
  it("hoje, ontem, dia da semana e data", () => {
    expect(whenLabel("2026-11-12T11:10:00Z", now, tz)).toBe("hoje, 08:10");
    expect(whenLabel("2026-11-12T01:40:00Z", now, tz)).toBe("ontem, 22:40");
    expect(whenLabel("2026-11-10T02:30:00Z", now, tz)).toBe("seg., 23:30");
    expect(whenLabel("2026-11-03T12:00:00Z", now, tz)).toBe("3 de nov.");
    expect(dayLabelShort("2026-11-11T12:00:00Z", now, tz)).toBe("ontem");
  });
});

describe("faixa de parabéns recebidos", () => {
  it("cita quem mandou por último e quantas pessoas mais", () => {
    const banner = reactionBanner([
      {
        eventId: "e1",
        type: "rare_badge",
        payload: { code: "lua_cheia" },
        from: "bia",
        at: "2026-11-11T10:00:00Z",
      },
      {
        eventId: "e1",
        type: "rare_badge",
        payload: { code: "lua_cheia" },
        from: "ana.r",
        at: "2026-11-12T10:00:00Z",
      },
      {
        eventId: "e1",
        type: "rare_badge",
        payload: { code: "lua_cheia" },
        from: "caio",
        at: "2026-11-11T12:00:00Z",
      },
      {
        eventId: "e2",
        type: "harvest",
        payload: { tier: "prata" },
        from: "duda",
        at: "2026-11-10T10:00:00Z",
      },
    ]);
    expect(banner).toEqual({
      lead: "ana.r",
      others: 2,
      ref: { prefix: "pelo seu emblema", name: "Lua Cheia" },
    });
    expect(reactionBanner([])).toBeNull();
    expect(achievementRef("harvest", { tier: "ouro" })).toEqual({
      prefix: "pela sua",
      name: "Colheita de Ouro",
    });
  });
});

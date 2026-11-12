import { describe, expect, it } from "vitest";
import { zonedMidnight } from "../dates.ts";
import { bandFor, bandRangeLabel, groupSubtitle, weeklyHours } from "./bands.ts";
import { nextDivision, previousDivision } from "./divisions.ts";
import { balancedSizes, planGroups, type Participant } from "./grouping.ts";
import { chaseLine, dividerAfter, visibleWindow, weekResultCopy } from "./present.ts";
import { closeGroup, rankStandings, zones, type Standing } from "./ranking.ts";
import {
  firstFreeUsername,
  initials,
  normalizeUsernameInput,
  suggestUsername,
  usernameProblem,
  withSuffix,
} from "./username.ts";
import { closesIn, leagueWeek, weekWindow } from "./week.ts";

describe("semana da Feira (America/Sao_Paulo)", () => {
  it("meia-noite local vira o instante certo", () => {
    expect(zonedMidnight("2026-11-16", "America/Sao_Paulo").toISOString()).toBe(
      "2026-11-16T03:00:00.000Z",
    );
    expect(zonedMidnight("2026-11-16", "Europe/Lisbon").toISOString()).toBe(
      "2026-11-16T00:00:00.000Z",
    );
  });

  it("a semana vira às 00:00 de segunda em São Paulo", () => {
    expect(leagueWeek(new Date("2026-11-16T02:59:00Z"))).toBe("2026-11-09");
    expect(leagueWeek(new Date("2026-11-16T03:00:00Z"))).toBe("2026-11-16");
    const w = weekWindow("2026-11-16");
    expect(w.start.toISOString()).toBe("2026-11-16T03:00:00.000Z");
    expect(w.end.toISOString()).toBe("2026-11-23T03:00:00.000Z");
  });

  it("mostra quanto falta para fechar", () => {
    expect(closesIn(new Date("2026-11-18T21:00:00Z"), "2026-11-16")).toBe("4d 6h");
    expect(closesIn(new Date("2026-11-22T21:00:00Z"), "2026-11-16")).toBe("6h");
    expect(closesIn(new Date("2026-11-23T02:15:00Z"), "2026-11-16")).toBe("45min");
    expect(closesIn(new Date("2026-11-24T00:00:00Z"), "2026-11-16")).toBe("0min");
  });
});

describe("faixas de horas", () => {
  it("usa a média das 2 semanas anteriores", () => {
    expect(weeklyHours(6 * 3600)).toBe(3);
    expect(bandFor(weeklyHours(5 * 3600))).toBe(0);
    expect(bandFor(3)).toBe(1);
    expect(bandFor(6.99)).toBe(1);
    expect(bandFor(7)).toBe(2);
    expect(bandFor(14)).toBe(3);
  });

  it("descreve faixas simples e juntadas", () => {
    expect(bandRangeLabel(0, 0)).toBe("menos de 3 h");
    expect(bandRangeLabel(1, 1)).toBe("de 3 a 7 h");
    expect(bandRangeLabel(1, 2)).toBe("de 3 a 14 h");
    expect(bandRangeLabel(3, 3)).toBe("14 h ou mais");
    expect(bandRangeLabel(0, 3)).toBeNull();
    expect(groupSubtitle(14, 1, 1)).toBe("14 pessoas que estudam de 3 a 7 h por semana");
    expect(groupSubtitle(3, 0, 3)).toBe("3 pessoas de todos os ritmos de estudo");
  });
});

function people(division: Participant["division"], hours: number[], prefix = "u"): Participant[] {
  return hours.map((h, i) => ({
    userId: `${prefix}${String(i).padStart(2, "0")}`,
    division,
    hours: h,
  }));
}

describe("montagem dos grupos", () => {
  it("divide em partes equilibradas", () => {
    expect(balancedSizes(21, 2)).toEqual([11, 10]);
    expect(balancedSizes(40, 2)).toEqual([20, 20]);
    expect(balancedSizes(7, 1)).toEqual([7]);
  });

  it("separa divisões diferentes", () => {
    const groups = planGroups([...people("bronze", [1, 1], "b"), ...people("prata", [1], "p")]);
    expect(groups.map((g) => [g.division, g.userIds.length])).toEqual([
      ["bronze", 2],
      ["prata", 1],
    ]);
  });

  it("mantém a faixa quando ela tem 10 ou mais", () => {
    const groups = planGroups([
      ...people("bronze", Array(10).fill(1), "a"),
      ...people("bronze", Array(10).fill(5), "b"),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => [g.bandMin, g.bandMax, g.userIds.length])).toEqual([
      [0, 0, 10],
      [1, 1, 10],
    ]);
  });

  it("junta faixas vizinhas pequenas até chegar a 10", () => {
    const groups = planGroups([
      ...people("bronze", [1, 1, 1], "a"),
      ...people("bronze", Array(8).fill(4), "b"),
      ...people("bronze", [10, 10], "c"),
    ]);
    // 3 (<3h) + 8 (3–7h) = 11 → fecha; a sobra de 2 (7–14h) vai para esse bloco.
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ bandMin: 0, bandMax: 2 });
    expect(groups[0]!.userIds).toHaveLength(13);
  });

  it("divisão com menos de 10 pessoas fica num grupo só", () => {
    const groups = planGroups(people("ouro", [0, 4, 9, 20]));
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ bandMin: 0, bandMax: 3 });
  });

  it("bloco com mais de 20 vira grupos equilibrados, em ordem de horas", () => {
    const groups = planGroups(
      people(
        "bronze",
        Array.from({ length: 21 }, (_, i) => i / 10),
      ),
    );
    expect(groups.map((g) => g.userIds.length)).toEqual([11, 10]);
    expect(groups[0]!.userIds[0]).toBe("u00");
    expect(groups[1]!.userIds.at(-1)).toBe("u20");
  });

  it("ninguém fica de fora nem aparece duas vezes", () => {
    const all = [
      ...people(
        "bronze",
        Array.from({ length: 57 }, (_, i) => i % 20),
        "b",
      ),
      ...people("esmeralda", [2, 30], "e"),
    ];
    const ids = planGroups(all).flatMap((g) => g.userIds);
    expect(new Set(ids).size).toBe(all.length);
    expect(planGroups(all).every((g) => g.userIds.length <= 20)).toBe(true);
  });
});

function standings(xps: number[]): Standing[] {
  return xps.map((xp, i) => ({
    userId: `u${String(i).padStart(2, "0")}`,
    username: `pessoa${i}`,
    xp,
    lastXpAt: xp > 0 ? `2026-11-1${(i % 5) + 1}T12:00:00Z` : null,
  }));
}

describe("ranking e zonas", () => {
  it("ordena por XP e desempata por quem chegou primeiro", () => {
    const ranked = rankStandings([
      { userId: "a", username: "ana", xp: 50, lastXpAt: "2026-11-12T10:00:00Z" },
      { userId: "b", username: "bia", xp: 80, lastXpAt: "2026-11-13T10:00:00Z" },
      { userId: "c", username: "caio", xp: 50, lastXpAt: "2026-11-11T10:00:00Z" },
      { userId: "d", username: "duda", xp: 0, lastXpAt: null },
    ]);
    expect(ranked.map((r) => [r.userId, r.rank])).toEqual([
      ["b", 1],
      ["c", 2],
      ["a", 3],
      ["d", 4],
    ]);
  });

  it("só há zonas com 10 ou mais; Bronze não desce e Esmeralda não sobe", () => {
    expect(zones(9, "prata")).toEqual({ up: 0, down: 0 });
    expect(zones(10, "prata")).toEqual({ up: 5, down: 5 });
    expect(zones(14, "bronze")).toEqual({ up: 5, down: 0 });
    expect(zones(20, "esmeralda")).toEqual({ up: 0, down: 5 });
  });

  it("grupo com 9: ninguém sobe nem desce", () => {
    const result = closeGroup(standings([90, 80, 70, 60, 50, 40, 30, 20, 10]), "prata");
    expect(result.every((r) => r.outcome === "stay" && r.division === "prata")).toBe(true);
  });

  it("grupo com 10 na Prata: 5 sobem para Ouro e 5 descem para Bronze", () => {
    const result = closeGroup(standings([100, 90, 80, 70, 60, 50, 40, 30, 20, 10]), "prata");
    expect(result.slice(0, 5).every((r) => r.outcome === "up" && r.division === "ouro")).toBe(true);
    expect(result.slice(5).every((r) => r.outcome === "down" && r.division === "bronze")).toBe(
      true,
    );
  });

  it("grupo com 14 no Bronze: 5 sobem, o resto fica", () => {
    const result = closeGroup(
      standings([140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10]),
      "bronze",
    );
    expect(result.filter((r) => r.outcome === "up")).toHaveLength(5);
    expect(result.filter((r) => r.outcome === "down")).toHaveLength(0);
    expect(result[13]).toMatchObject({ rank: 14, outcome: "stay", division: "bronze" });
  });

  it("grupo com 20 na Esmeralda: ninguém sobe, os 5 últimos descem para Ouro", () => {
    const result = closeGroup(
      standings(Array.from({ length: 20 }, (_, i) => 200 - i)),
      "esmeralda",
    );
    expect(result.filter((r) => r.outcome === "up")).toHaveLength(0);
    expect(result.slice(15).every((r) => r.outcome === "down" && r.division === "ouro")).toBe(true);
    expect(result[14]!.outcome).toBe("stay");
  });

  it("quem não fez XP não sobe, mesmo entre os 5 primeiros", () => {
    const result = closeGroup(standings([30, 20, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0]), "bronze");
    expect(result.filter((r) => r.outcome === "up").map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it("divisões vizinhas", () => {
    expect(nextDivision("ouro")).toBe("esmeralda");
    expect(nextDivision("esmeralda")).toBeNull();
    expect(previousDivision("bronze")).toBeNull();
    expect(previousDivision("prata")).toBe("bronze");
  });
});

describe("apresentação", () => {
  it("mostra até 8 linhas em volta da pessoa", () => {
    expect(visibleWindow(7, 3)).toEqual([0, 7]);
    expect(visibleWindow(14, 0)).toEqual([0, 8]);
    expect(visibleWindow(14, 7)).toEqual([4, 12]);
    expect(visibleWindow(14, 13)).toEqual([6, 14]);
  });

  it("põe as divisórias depois do 5º e antes dos 5 últimos", () => {
    expect(dividerAfter(5, 14, "prata", "ouro", "bronze")).toEqual({
      kind: "up",
      text: "Sobem para a Feira de Ouro",
    });
    expect(dividerAfter(9, 14, "prata", "ouro", "bronze")).toEqual({
      kind: "down",
      text: "Descem para a Feira de Bronze",
    });
    expect(dividerAfter(9, 14, "bronze", "prata", null)).toBeNull();
    expect(dividerAfter(5, 9, "prata", "ouro", "bronze")).toBeNull();
  });

  it("textos do resultado, sem tom de perda", () => {
    const up = weekResultCopy({ outcome: "up", rank: 4, xp: 230, from: "prata", to: "ouro" });
    expect(up.title).toBe("Feira de Ouro!");
    expect(up.body).toContain("4º lugar na Feira de Prata, com 230 XP");
    const stay = weekResultCopy({ outcome: "stay", rank: 7, xp: 90, from: "prata", to: "prata" });
    expect(stay.title).toBe("Você continua na Feira de Prata");
    const down = weekResultCopy({ outcome: "down", rank: 12, xp: 5, from: "prata", to: "bronze" });
    expect(down.title).toBe("Nesta semana você vai para a Feira de Bronze");
    expect(down.celebrate).toBe(false);
    for (const c of [up, stay, down]) {
      expect(`${c.title} ${c.body}`).not.toMatch(/rebaixad|perdeu/i);
    }
  });
});

describe("destaque do Competidor", () => {
  const row = (rank: number, xp: number, username: string, isMe = false) => ({
    rank,
    xp,
    username,
    isMe,
  });
  it("mostra a distância para quem está logo acima", () => {
    expect(chaseLine([row(1, 120, "ana.r"), row(2, 85, "gabriel", true)])).toBe(
      "Faltam 35 XP para alcançar @ana.r.",
    );
    expect(chaseLine([row(1, 50, "ana.r"), row(2, 50, "gabriel", true)])).toBe(
      "Empate em XP com @ana.r.",
    );
    expect(chaseLine([row(1, 90, "gabriel", true), row(2, 10, "ana.r")])).toBe(
      "Você está em 1º lugar no seu grupo.",
    );
  });
});

describe("apelido", () => {
  it("valida tamanho e formato", () => {
    expect(usernameProblem("ab")).toBe("curto");
    expect(usernameProblem("a".repeat(21))).toBe("longo");
    expect(usernameProblem("Gabriel")).toBe("formato");
    expect(usernameProblem("gabriel-lima")).toBe("formato");
    expect(usernameProblem("gabriel.lima_2")).toBeNull();
    expect(normalizeUsernameInput("  @Gabriel.Lima ")).toBe("gabriel.lima");
  });

  it("sugere a partir do nome ou do e-mail", () => {
    expect(suggestUsername("Gabriel Ferreira Lima")).toBe("gabriel.lima");
    expect(suggestUsername("Júlia")).toBe("julia");
    expect(suggestUsername(null, "ana-r@x.com")).toBe("ana.r");
    expect(suggestUsername("Zé")).toBe("estudante");
    expect(suggestUsername("Maximiliano Bartholomeu Albuquerque").length).toBeLessThanOrEqual(20);
  });

  it("acha o primeiro apelido livre", () => {
    expect(withSuffix("gabriel.lima", 2)).toBe("gabriel.lima2");
    expect(withSuffix("a".repeat(20), 12)).toBe(`${"a".repeat(18)}12`);
    expect(firstFreeUsername("ana", new Set(["ana", "ana2"]))).toBe("ana3");
    expect(firstFreeUsername("bia", new Set())).toBe("bia");
  });

  it("monta as iniciais do avatar", () => {
    expect(initials("lucas.m")).toBe("LM");
    expect(initials("tiago_s")).toBe("TS");
    expect(initials("bia")).toBe("BI");
    expect(initials(null)).toBe("?");
  });
});

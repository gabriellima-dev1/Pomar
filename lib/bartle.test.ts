import { describe, expect, it } from "vitest";
import {
  PROFILES,
  QUESTIONS,
  firstUnanswered,
  optionOrder,
  parseAnswers,
  parseScores,
  percentages,
  rankedScores,
  scoreAnswers,
  type Answers,
} from "./bartle";

describe("quiz de Bartle", () => {
  it("tem 8 perguntas com 4 alternativas, uma por perfil", () => {
    expect(QUESTIONS).toHaveLength(8);
    for (const q of QUESTIONS) {
      expect(Object.keys(q.options).sort()).toEqual([...PROFILES].sort());
      for (const p of PROFILES) expect(q.options[p].length).toBeGreaterThan(0);
    }
  });

  it("percentuais somam 100 pelo maior resto", () => {
    // 4/8, 2/8, 1/8, 1/8 = 50, 25, 12,5, 12,5 → um dos 12,5 sobe para 13 (tela 18).
    const s = percentages({ explorador: 4, conquistador: 2, socializador: 1, competidor: 1 });
    expect(s.explorador).toBe(50);
    expect(s.conquistador).toBe(25);
    expect(s.socializador + s.competidor).toBe(25);
    expect([s.socializador, s.competidor].sort()).toEqual([12, 13]);
    const thirds = percentages({ explorador: 1, conquistador: 1, socializador: 1, competidor: 0 });
    expect(Object.values(thirds).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("sem respostas, tudo zero e sem resultado", () => {
    expect(percentages({ explorador: 0, conquistador: 0, socializador: 0, competidor: 0 })).toEqual(
      { conquistador: 0, competidor: 0, explorador: 0, socializador: 0 },
    );
    expect(scoreAnswers(Array(8).fill(null))).toBeNull();
  });

  it("perfil predominante = mais respostas", () => {
    const answers: Answers = [
      "explorador",
      "explorador",
      "conquistador",
      "explorador",
      "socializador",
      "explorador",
      "conquistador",
      "competidor",
    ];
    const r = scoreAnswers(answers);
    expect(r?.primary).toBe("explorador");
    expect(r?.scores.explorador).toBe(50);
  });

  it("empate: vence o escolhido por último entre os empatados", () => {
    const answers: Answers = [
      "competidor",
      "conquistador",
      "competidor",
      "conquistador",
      "explorador",
      "socializador",
      "conquistador",
      "competidor",
    ];
    // 3 × 3: o último escolhido entre os dois é competidor (pergunta 8).
    expect(scoreAnswers(answers)?.primary).toBe("competidor");
    const swapped: Answers = [...answers];
    swapped[7] = "explorador";
    swapped[6] = "competidor";
    swapped[3] = "conquistador";
    // conquistador 2 (q2, q4) … competidor 3 (q1, q3, q7): competidor vence sem empate.
    expect(scoreAnswers(swapped)?.primary).toBe("competidor");
  });

  it("lê respostas guardadas descartando lixo", () => {
    expect(parseAnswers(["explorador", "x", null, 3])).toEqual([
      "explorador",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(parseAnswers(null)).toHaveLength(8);
    expect(firstUnanswered(parseAnswers(["explorador", "competidor"]))).toBe(2);
    expect(firstUnanswered(Array(8).fill("explorador"))).toBe(8);
  });

  it("lê a distribuição guardada", () => {
    expect(
      parseScores({ conquistador: 25, competidor: 12, explorador: 50, socializador: 13 }),
    ).toEqual({ conquistador: 25, competidor: 12, explorador: 50, socializador: 13 });
    expect(parseScores({ conquistador: 25 })).toBeNull();
    expect(parseScores([1, 2])).toBeNull();
  });

  it("ordena as barras com o predominante primeiro", () => {
    const ranked = rankedScores(
      { conquistador: 25, competidor: 25, explorador: 25, socializador: 25 },
      "socializador",
    );
    expect(ranked[0]?.[0]).toBe("socializador");
  });

  it("alternativas embaralhadas, mas estáveis para a mesma pessoa", () => {
    const a = optionOrder(3, "pessoa-1");
    expect([...a].sort()).toEqual([...PROFILES].sort());
    expect(optionOrder(3, "pessoa-1")).toEqual(a);
    // Em 8 perguntas, a ordem não é sempre a mesma.
    const orders = new Set(QUESTIONS.map((q) => optionOrder(q.id, "pessoa-1").join()));
    expect(orders.size).toBeGreaterThan(1);
  });
});

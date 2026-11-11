import { describe, expect, it } from "vitest";
import { harvestLine, homeLine, levelUpLine, stageChangePhrase } from "./lines";

const GUILT = /perdeu|falhou|quebrou|culpa|deveria|não conseguiu/i;

describe("harvestLine", () => {
  it("convida para o próximo dia (referência 10)", () => {
    expect(harvestLine(1, false, 6)).toBe("Um pomodoro hoje e você fica a 1 dia do Bronze.");
  });

  it("avisa quando o pomodoro de hoje fecha uma faixa", () => {
    expect(harvestLine(2, false, 5)).toBe("Um pomodoro hoje e a Colheita de Bronze é sua.");
    expect(harvestLine(4, true, 3)).toBe("O fruto de hoje sai amanhã e traz a Colheita de Prata.");
  });

  it("comemora o Ouro sem nova meta", () => {
    expect(harvestLine(7, false, 0)).toMatch(/Ouro/);
  });

  it("sem meta possível na semana, só convida, sem culpa", () => {
    const line = harvestLine(0, false, 1);
    expect(line).toMatch(/colher o de hoje/);
    expect(line).not.toMatch(GUILT);
  });

  it("nenhuma combinação soa culpabilizante", () => {
    for (let d = 0; d <= 7; d++)
      for (const today of [true, false])
        for (let left = 1; left <= 7; left++)
          expect(harvestLine(d, today, left)).not.toMatch(GUILT);
  });
});

describe("nível e estágio", () => {
  it("frase da troca de estágio com concordância", () => {
    expect(stageChangePhrase("arbusto", "jovem")).toBe("Seu arbusto virou uma árvore jovem");
    expect(stageChangePhrase("muda", "arbusto")).toBe("Sua muda virou um arbusto");
    expect(stageChangePhrase("adulta", "frondosa")).toBe(
      "Sua árvore adulta virou uma árvore frondosa",
    );
  });

  it("fala acolhedora na subida", () => {
    expect(levelUpLine("jovem")).toMatch(/cresceu/);
  });
});

describe("homeLine", () => {
  it("acolhe quem volta depois de 3+ dias", () => {
    const line = homeLine({ daysAway: 4, freezeUsed: false, streak: 0 });
    expect(line).toMatch(/Que bom te ver/);
    expect(line).not.toMatch(GUILT);
  });

  it("conta quando um congelamento guardou a ofensiva", () => {
    expect(homeLine({ daysAway: 1, freezeUsed: true, streak: 8 })).toMatch(/congelamento/);
  });

  it("sem nada a dizer, fica quieto", () => {
    expect(homeLine({ daysAway: 0, freezeUsed: false, streak: 3 })).toBeNull();
  });
});

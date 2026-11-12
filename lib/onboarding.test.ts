import { describe, expect, it } from "vitest";
import {
  ONBOARDING_STEPS,
  canAdvance,
  isOnboarding,
  parseStep,
  pathForStep,
  stepAfterSubject,
  visibleStep,
} from "./onboarding";

describe("onboarding", () => {
  it("só anda para a frente", () => {
    expect(canAdvance("boas_vindas", "quiz")).toBe(true);
    expect(canAdvance("feira", "pomodoro")).toBe(true);
    expect(canAdvance("pomodoro", "calibracao")).toBe(false);
    expect(canAdvance("concluido", "quiz")).toBe(false);
    expect(canAdvance("quiz", "quiz")).toBe(false);
  });

  it("valor desconhecido conta como concluído", () => {
    expect(parseStep("quiz")).toBe("quiz");
    expect(parseStep("xyz")).toBe("concluido");
    expect(parseStep(null)).toBe("concluido");
    expect(isOnboarding("concluido")).toBe(false);
    expect(isOnboarding("primeiro_fruto")).toBe(true);
  });

  it("numera os 5 passos visíveis", () => {
    expect(ONBOARDING_STEPS.map(visibleStep)).toEqual([0, 1, 1, 2, 3, 4, 5, 5, 0]);
  });

  it("leva cada passo à sua tela", () => {
    expect(pathForStep("boas_vindas", null)).toBe("/onboarding");
    expect(pathForStep("disciplina", null)).toBe("/disciplinas/nova");
    expect(pathForStep("calibracao", "abc")).toBe("/disciplinas/abc/calibrar");
    expect(pathForStep("pomodoro", "abc")).toBe("/pomodoro?disciplina=abc");
    expect(pathForStep("pomodoro", null)).toBe("/disciplinas/nova");
    expect(pathForStep("concluido", null)).toBe("/inicio");
  });

  it("depois da disciplina: catálogo vai ao pomodoro, manual à calibração", () => {
    expect(stepAfterSubject("catalog")).toBe("pomodoro");
    expect(stepAfterSubject("manual")).toBe("calibracao");
    expect(stepAfterSubject("youtube")).toBe("pomodoro");
  });
});

import { describe, expect, it } from "vitest";
import {
  cycleSummary,
  deleteConfirmationMatches,
  deleteConfirmationTarget,
  loginMethodLabel,
  normalizeDisplayName,
} from "./settings";

describe("excluir conta (tela 32)", () => {
  it("pede o apelido; sem apelido, EXCLUIR", () => {
    expect(deleteConfirmationTarget("gabriel.lima")).toBe("gabriel.lima");
    expect(deleteConfirmationTarget(null)).toBe("EXCLUIR");
    expect(deleteConfirmationTarget("  ")).toBe("EXCLUIR");
  });

  it("só libera quando o texto bate", () => {
    expect(deleteConfirmationMatches("gabriel.li", "gabriel.lima")).toBe(false);
    expect(deleteConfirmationMatches(" gabriel.lima ", "gabriel.lima")).toBe(true);
    expect(deleteConfirmationMatches("excluir", null)).toBe(true);
    expect(deleteConfirmationMatches("", null)).toBe(false);
  });
});

describe("configurações", () => {
  it("normaliza o nome", () => {
    expect(normalizeDisplayName("  Gabriel   Lima ")).toBe("Gabriel Lima");
    expect(normalizeDisplayName("   ")).toBeNull();
    expect(normalizeDisplayName("x".repeat(61))).toBeNull();
  });

  it("resume o ciclo e o método de login", () => {
    expect(cycleSummary(25, 5, 15)).toBe("Foco 25 · descanso 5 · longo 15 min");
    expect(loginMethodLabel("google")).toBe("entra com Google");
    expect(loginMethodLabel("email")).toBe("entra com e-mail e senha");
  });
});

import { describe, expect, it } from "vitest";
import { isInteractiveTarget, shortcutFor, type KeyInput } from "./shortcuts";

const on = { wide: true, dialogOpen: false };
const el = (tagName: string, extra: Partial<NonNullable<KeyInput["target"]>> = {}) => ({
  tagName,
  getAttribute: () => null,
  ...extra,
});
const body = el("BODY");

describe("atalhos do pomodoro no computador", () => {
  it("Espaço pausa/retoma e F alterna a tela cheia", () => {
    expect(shortcutFor({ key: " ", code: "Space", target: body }, on)).toBe("toggle");
    expect(shortcutFor({ key: "f", code: "KeyF", target: body }, on)).toBe("fullscreen");
    expect(shortcutFor({ key: "F", code: "KeyF", shiftKey: true, target: body }, on)).toBe(
      "fullscreen",
    );
  });

  it("outras teclas não fazem nada", () => {
    expect(shortcutFor({ key: "Enter", target: body }, on)).toBeNull();
    expect(shortcutFor({ key: "g", target: body }, on)).toBeNull();
  });

  it("abaixo de 1024px nada muda", () => {
    expect(shortcutFor({ key: " ", code: "Space", target: body }, { ...on, wide: false })).toBe(
      null,
    );
  });

  it("com um diálogo aberto, nada acontece", () => {
    const ctx = { wide: true, dialogOpen: true };
    expect(shortcutFor({ key: " ", code: "Space", target: body }, ctx)).toBeNull();
    expect(shortcutFor({ key: "f", target: body }, ctx)).toBeNull();
  });

  it("ignora campos de texto e áreas editáveis", () => {
    for (const tag of ["INPUT", "TEXTAREA", "SELECT"]) {
      expect(shortcutFor({ key: " ", code: "Space", target: el(tag) }, on)).toBeNull();
      expect(shortcutFor({ key: "f", target: el(tag) }, on)).toBeNull();
    }
    expect(
      shortcutFor({ key: "f", target: el("DIV", { isContentEditable: true }) }, on),
    ).toBeNull();
  });

  it("deixa o Espaço de botões e links agir sozinho (sem disparo duplo)", () => {
    expect(shortcutFor({ key: " ", code: "Space", target: el("BUTTON") }, on)).toBeNull();
    expect(shortcutFor({ key: " ", code: "Space", target: el("A") }, on)).toBeNull();
    const roleButton = el("DIV", { getAttribute: (n) => (n === "role" ? "button" : null) });
    expect(isInteractiveTarget(roleButton)).toBe(true);
  });

  it("ignora tecla segurada e combinações com Ctrl/Cmd/Alt", () => {
    expect(shortcutFor({ key: " ", code: "Space", repeat: true, target: body }, on)).toBeNull();
    expect(shortcutFor({ key: "f", metaKey: true, target: body }, on)).toBeNull();
    expect(shortcutFor({ key: "f", ctrlKey: true, target: body }, on)).toBeNull();
    expect(shortcutFor({ key: "f", altKey: true, target: body }, on)).toBeNull();
    expect(shortcutFor({ key: " ", code: "Space", shiftKey: true, target: body }, on)).toBeNull();
  });

  it("sem alvo (foco no documento) vale", () => {
    expect(shortcutFor({ key: " ", code: "Space", target: null }, on)).toBe("toggle");
  });
});

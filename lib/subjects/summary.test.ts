import { describe, expect, it } from "vitest";
import {
  bookInitials,
  chapterLabel,
  compactDuration,
  greeting,
  localParts,
  nextTopic,
  shortAuthors,
  shortDate,
} from "./summary.ts";

const t = (id: string, position: number, done = false) => ({
  id,
  position,
  title: id,
  done_at: done ? "2026-11-09T10:00:00Z" : null,
});

describe("nextTopic", () => {
  it("pega o primeiro pendente respeitando as posições", () => {
    const chapters = [
      { position: 2, topics: [t("b2", 2), t("b1", 1)] },
      { position: 1, topics: [t("a1", 1, true), t("a2", 2, true)] },
    ];
    expect(nextTopic(chapters)?.id).toBe("b1");
  });

  it("devolve null quando tudo foi concluído ou não há tópicos", () => {
    expect(nextTopic([{ position: 1, topics: [t("a", 1, true)] }])).toBeNull();
    expect(nextTopic([])).toBeNull();
  });
});

describe("shortAuthors", () => {
  it("usa o sobrenome do primeiro autor", () => {
    expect(shortAuthors("Thomas H. Cormen, Charles E. Leiserson")).toBe("Cormen");
    expect(shortAuthors("Thomas H. Cormen, Charles E. Leiserson", true)).toBe("Cormen et al.");
    expect(shortAuthors("Ian Sommerville", true)).toBe("Sommerville");
    expect(shortAuthors(null)).toBe("");
  });
});

describe("greeting e localParts", () => {
  it("escolhe a saudação pela hora", () => {
    expect(greeting(5)).toBe("Bom dia");
    expect(greeting(11)).toBe("Bom dia");
    expect(greeting(12)).toBe("Boa tarde");
    expect(greeting(18)).toBe("Boa noite");
    expect(greeting(2)).toBe("Boa noite");
  });

  it("usa o fuso do usuário", () => {
    const now = new Date("2026-11-10T01:30:00Z"); // 22:30 de segunda em Maceió
    expect(localParts(now, "America/Maceio")).toEqual({
      hour: 22,
      dateLabel: "Segunda, 9 de novembro",
    });
    expect(localParts(now, "Europe/Lisbon").hour).toBe(1);
  });
});

describe("formatos curtos", () => {
  it("formata data e duração", () => {
    expect(shortDate("2026-12-02")).toBe("02/12");
    expect(compactDuration(45)).toBe("~45 min");
    expect(compactDuration(540)).toBe("~9h");
    expect(compactDuration(212)).toBe("~3h30");
    expect(compactDuration(178)).toBe("~3h");
    expect(compactDuration(165)).toBe("~2h50");
  });
});

describe("catálogo", () => {
  it("formata o número do capítulo", () => {
    expect(chapterLabel("1. O papel dos algoritmos")).toBe("1 · O papel dos algoritmos");
    expect(chapterLabel("Apêndice D. Matrizes")).toBe("Apêndice D · Matrizes");
    expect(chapterLabel("Introdução")).toBe("Introdução");
  });

  it("monta a sigla da capa", () => {
    expect(
      bookInitials("Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein"),
    ).toBe("CLRS");
    expect(bookInitials("Ian Sommerville")).toBe("S");
    expect(bookInitials("")).toBe("?");
  });
});

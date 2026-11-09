import { describe, expect, it } from "vitest";
import { isSubjectColor, suggestColor, SUBJECT_COLORS } from "./colors";
import {
  isUuid,
  parseManualStructure,
  parsePageRange,
  parseSubjectFields,
  parseTopicIds,
} from "./validation";

describe("parseSubjectFields", () => {
  const base = { title: " Algoritmos ", color: "tomate", goalDate: "", dailyGoal: "" };

  it("aceita os campos obrigatórios e deixa os opcionais nulos", () => {
    expect(parseSubjectFields(base)).toEqual({
      ok: true,
      value: { title: "Algoritmos", color: "tomate", goalDate: null, dailyGoal: null },
    });
  });

  it("valida data e meta diária", () => {
    expect(parseSubjectFields({ ...base, goalDate: "2026-12-01", dailyGoal: "4" })).toMatchObject({
      ok: true,
      value: { goalDate: "2026-12-01", dailyGoal: 4 },
    });
    const bad = parseSubjectFields({ ...base, goalDate: "2026-02-30", dailyGoal: "0" });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(Object.keys(bad.errors).sort()).toEqual(["dailyGoal", "goalDate"]);
  });

  it("exige título e cor da paleta", () => {
    const r = parseSubjectFields({ ...base, title: "  ", color: "rosa-choque" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["color", "title"]);
  });

  it("limita o tamanho do título", () => {
    expect(parseSubjectFields({ ...base, title: "x".repeat(121) }).ok).toBe(false);
  });
});

describe("parsePageRange", () => {
  it("aceita números e textos numéricos", () => {
    expect(parsePageRange("10", 12)).toEqual({ ok: true, page_start: 10, page_end: 12 });
    expect(parsePageRange(5, 5)).toMatchObject({ ok: true });
  });
  it("rejeita final antes do início, zero e vazio", () => {
    expect(parsePageRange(10, 9).ok).toBe(false);
    expect(parsePageRange(0, 9).ok).toBe(false);
    expect(parsePageRange("", "").ok).toBe(false);
    expect(parsePageRange("1.5", "3").ok).toBe(false);
  });
});

describe("parseManualStructure", () => {
  const valid = JSON.stringify([
    {
      title: "Capítulo 1",
      topics: [
        { title: "Intro", page_start: 1, page_end: 10 },
        { title: "Mais", page_start: "11", page_end: "20" },
      ],
    },
  ]);

  it("aceita uma estrutura válida", () => {
    expect(parseManualStructure(valid)).toEqual({
      ok: true,
      value: [
        {
          title: "Capítulo 1",
          topics: [
            { title: "Intro", page_start: 1, page_end: 10 },
            { title: "Mais", page_start: 11, page_end: 20 },
          ],
        },
      ],
    });
  });

  it("rejeita vazio e JSON inválido", () => {
    expect(parseManualStructure("[]").ok).toBe(false);
    expect(parseManualStructure("{oops").ok).toBe(false);
    expect(parseManualStructure(undefined).ok).toBe(false);
  });

  it("aponta o capítulo e o tópico com erro", () => {
    const r = parseManualStructure(
      JSON.stringify([
        { title: "", topics: [{ title: "ok", page_start: 1, page_end: 2 }] },
        { title: "B", topics: [{ title: "x", page_start: 9, page_end: 3 }] },
        { title: "C", topics: [] },
      ]),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["cap-0", "cap-2", "top-1-0"]);
  });
});

describe("cores", () => {
  it("tem 8 cores e sugere em rodízio", () => {
    expect(SUBJECT_COLORS).toHaveLength(8);
    expect(suggestColor(0)).toBe("tomate");
    expect(suggestColor(8)).toBe("tomate");
    expect(suggestColor(3)).toBe(SUBJECT_COLORS[3].key);
    expect(isSubjectColor("ceu")).toBe(true);
    expect(isSubjectColor("rosa")).toBe(false);
  });
});

describe("parseTopicIds", () => {
  const id = "3f2b1c4d-1111-4222-8333-444455556666";
  it("mantém só UUIDs, sem repetir", () => {
    expect(parseTopicIds([id, id.toUpperCase(), "abc", 3])).toEqual([id]);
    expect(isUuid("nope")).toBe(false);
  });
});

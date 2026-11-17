import { describe, expect, it } from "vitest";
import { masteryCounts, masteryMode } from "./mastery";

const t = (done: boolean) => ({ done_at: done ? "2026-11-15T10:00:00Z" : null });

describe("maestria a partir do nível 10 (DESIGN §3)", () => {
  it("liga no nível 10", () => {
    expect(masteryMode(9)).toBe(false);
    expect(masteryMode(10)).toBe(true);
    expect(masteryMode(23)).toBe(true);
  });

  it("conta tópicos concluídos e capítulos completos", () => {
    const subjects = [
      { chapters: [{ topics: [t(true), t(true)] }, { topics: [t(true), t(false)] }] },
      { chapters: [{ topics: [] }, { topics: [t(true)] }] },
    ];
    expect(masteryCounts(subjects)).toEqual({ topics: 4, chapters: 2 });
  });

  it("sem disciplinas, zero", () => {
    expect(masteryCounts([])).toEqual({ topics: 0, chapters: 0 });
  });
});

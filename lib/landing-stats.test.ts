import { describe, expect, it } from "vitest";
import { formatHours, landingCounters } from "./landing-stats";

describe("contadores da landing", () => {
  it("mostra os três quando há números", () => {
    const c = landingCounters({ pomodorosWeek: 1234, focusSecWeek: 9000, gardeners: 31 });
    expect(c.map((x) => x.key)).toEqual(["pomodoros", "horas", "pessoas"]);
    expect(c[0]?.value).toBe("1.234");
    expect(c[1]?.value).toBe("2,5 h");
    expect(c[2]?.label).toBe("pessoas cultivando um pomar");
  });

  it("esconde contador zerado e some com tudo zero", () => {
    const c = landingCounters({ pomodorosWeek: 0, focusSecWeek: 0, gardeners: 3 });
    expect(c.map((x) => x.key)).toEqual(["pessoas"]);
    expect(landingCounters({ pomodorosWeek: 0, focusSecWeek: 0, gardeners: 0 })).toEqual([]);
    expect(landingCounters(null)).toEqual([]);
  });

  it("singular com 1", () => {
    const c = landingCounters({ pomodorosWeek: 1, focusSecWeek: 1500, gardeners: 1 });
    expect(c[0]?.label).toBe("pomodoro colhido esta semana");
    expect(c[2]?.label).toBe("pessoa cultivando um pomar");
  });

  it("formata as horas", () => {
    expect(formatHours(0)).toBeNull();
    expect(formatHours(60)).toBeNull(); // 1 min arredondaria para 0,0 h
    expect(formatHours(1500)).toBe("0,4 h");
    expect(formatHours(36_000)).toBe("10 h");
    expect(formatHours(50_000)).toBe("13 h");
  });
});

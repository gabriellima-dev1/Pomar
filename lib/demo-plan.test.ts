import { describe, expect, it } from "vitest";
import { localClock, localDay } from "@/lib/dates";
import {
  DEMO_EMAIL_RE,
  DEMO_PERSONAS,
  DEMO_TZ,
  demoEmail,
  plannedSessions,
  seededRandom,
} from "./demo-plan";

const DAYS = Array.from({ length: 21 }, (_, i) =>
  new Date(Date.UTC(2026, 10, 1 + i)).toISOString().slice(0, 10),
);
const NOW = new Date("2026-11-21T18:00:00Z"); // 15h em Maceió

describe("contas demo da apresentação", () => {
  it("12 pessoas com apelidos únicos e e-mail demo.*@example.com", () => {
    expect(DEMO_PERSONAS).toHaveLength(12);
    expect(new Set(DEMO_PERSONAS.map((p) => p.username)).size).toBe(12);
    for (const p of DEMO_PERSONAS) expect(demoEmail(p.username)).toMatch(DEMO_EMAIL_RE);
  });

  it("o sorteio é determinístico", () => {
    const a = seededRandom("x");
    const b = seededRandom("x");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("ciclos de 25 min entre 8h e 21h30, nunca no futuro, e repetir dá o mesmo plano", () => {
    const bia = DEMO_PERSONAS[0]!;
    const plan = plannedSessions(bia, DAYS, new Set(), NOW);
    expect(plan.length).toBeGreaterThan(20);
    expect(plannedSessions(bia, DAYS, new Set(), NOW)).toEqual(plan);
    for (const s of plan) {
      expect(Date.parse(s.endedAt) - Date.parse(s.startedAt)).toBe(25 * 60_000);
      expect(Date.parse(s.endedAt)).toBeLessThanOrEqual(NOW.getTime());
      const { hour } = localClock(new Date(s.startedAt), DEMO_TZ);
      expect(hour).toBeGreaterThanOrEqual(8);
      expect(hour).toBeLessThanOrEqual(22);
    }
  });

  it("pula os dias que já têm ciclo e quem estuda menos tem menos dias", () => {
    const bia = DEMO_PERSONAS[0]!;
    const plan = plannedSessions(bia, DAYS, new Set(DAYS.slice(0, 10)), NOW);
    expect(plan.every((s) => localDay(new Date(s.startedAt), DEMO_TZ) >= DAYS[10]!)).toBe(true);
    const days = (p: (typeof DEMO_PERSONAS)[number]) =>
      new Set(
        plannedSessions(p, DAYS, new Set(), NOW).map((s) =>
          localDay(new Date(s.startedAt), DEMO_TZ),
        ),
      ).size;
    expect(days(DEMO_PERSONAS[0]!)).toBeGreaterThan(days(DEMO_PERSONAS[11]!));
  });
});

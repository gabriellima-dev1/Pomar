import { describe, expect, it } from "vitest";
import { experimentGroup, parseCohort, rewardsCohort, rewardsEnabled } from "./cohorts";

const flag = { enabled: true, rollout: { off_for_cohorts: ["B"] } };

describe("coortes (DESIGN §9.4)", () => {
  it("coorte A vê recompensas; B não", () => {
    expect(rewardsEnabled("A", flag)).toBe(true);
    expect(rewardsEnabled("B", flag)).toBe(false);
  });

  it("sem coorte ou sem flag, como a coorte A", () => {
    expect(rewardsEnabled(null, flag)).toBe(true);
    expect(rewardsEnabled("B", null)).toBe(true);
  });

  it("flag desligada tira as recompensas de todos", () => {
    expect(rewardsEnabled("A", { enabled: false, rollout: {} })).toBe(false);
  });

  it("encerrar o experimento: nenhuma coorte de fora", () => {
    expect(rewardsEnabled("B", { enabled: true, rollout: { off_for_cohorts: [] } })).toBe(true);
    expect(rewardsEnabled("B", { enabled: true, rollout: "lixo" })).toBe(true);
  });

  it("lê a coorte", () => {
    expect(parseCohort("B")).toBe("B");
    expect(parseCohort("C")).toBeNull();
  });

  it("quem saiu do experimento ou é conta antiga fica fora e vê as recompensas", () => {
    expect(experimentGroup({ cohort: "B" })).toBe("B");
    expect(experimentGroup({ cohort: "B", left_at: "2026-11-20T10:00:00Z" })).toBe("fora");
    expect(experimentGroup({ cohort: "A", legacy: true })).toBe("fora");
    expect(experimentGroup(null)).toBe("fora");
    expect(
      rewardsEnabled(rewardsCohort(experimentGroup({ cohort: "B", left_at: "x" })), flag),
    ).toBe(true);
    expect(rewardsEnabled(rewardsCohort("B"), flag)).toBe(false);
  });
});

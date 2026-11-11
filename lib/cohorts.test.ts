import { describe, expect, it } from "vitest";
import { parseCohort, rewardsEnabled } from "./cohorts";

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
});

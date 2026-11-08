import { describe, expect, it, vi } from "vitest";
import type { EventName } from "./events";
import { buildEventRow, createTracker, MAX_PROPS_BYTES, type TelemetryRow } from "./tracker";

describe("buildEventRow", () => {
  it("monta a linha com user_id e anon_id", () => {
    expect(buildEventRow("app_opened", { via: "card" }, { userId: "u1", anonId: "a1" })).toEqual({
      name: "app_opened",
      props: { via: "card" },
      user_id: "u1",
      anon_id: "a1",
    });
  });

  it("usa props vazias por padrão", () => {
    expect(
      buildEventRow("landing_viewed", undefined, { userId: null, anonId: "a1" })?.props,
    ).toEqual({});
  });

  it("rejeita evento desconhecido", () => {
    expect(buildEventRow("inventado", {}, { userId: null, anonId: null })).toBeNull();
  });

  it("descarta props grandes demais", () => {
    const big = { texto: "x".repeat(MAX_PROPS_BYTES + 1) };
    expect(buildEventRow("app_opened", big, { userId: null, anonId: null })?.props).toEqual({
      _truncated: true,
    });
  });
});

describe("createTracker", () => {
  function setup(overrides: Partial<Parameters<typeof createTracker>[0]> = {}) {
    const rows: TelemetryRow[] = [];
    const onError = vi.fn();
    const track = createTracker({
      getUserId: async () => "user-1",
      getAnonId: () => "anon-1",
      insert: async (row) => {
        rows.push(row);
        return { error: null };
      },
      onError,
      ...overrides,
    });
    return { track, rows, onError };
  }

  it("insere o evento com o usuário logado", async () => {
    const { track, rows, onError } = setup();
    await track("pomodoro_started", { focus_min: 25 });
    expect(rows).toEqual([
      { name: "pomodoro_started", props: { focus_min: 25 }, user_id: "user-1", anon_id: "anon-1" },
    ]);
    expect(onError).not.toHaveBeenCalled();
  });

  it("visitante grava só anon_id", async () => {
    const { track, rows } = setup({ getUserId: async () => null });
    await track("landing_viewed");
    expect(rows[0]).toMatchObject({ user_id: null, anon_id: "anon-1" });
  });

  it("se a sessão falhar, segue como visitante", async () => {
    const { track, rows } = setup({ getUserId: () => Promise.reject(new Error("offline")) });
    await track("landing_viewed");
    expect(rows[0]?.user_id).toBeNull();
  });

  it("nunca lança: erro do banco vai para onError", async () => {
    const { track, onError } = setup({ insert: async () => ({ error: { message: "rls" } }) });
    await expect(track("app_opened")).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledWith({ message: "rls" });
  });

  it("nunca lança: falha de rede vai para onError", async () => {
    const { track, onError } = setup({ insert: () => Promise.reject(new Error("rede")) });
    await expect(track("app_opened")).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledOnce();
  });

  it("evento desconhecido não é inserido", async () => {
    const { track, rows, onError } = setup();
    await track("nao_existe" as EventName);
    expect(rows).toHaveLength(0);
    expect(onError).toHaveBeenCalledOnce();
  });
});

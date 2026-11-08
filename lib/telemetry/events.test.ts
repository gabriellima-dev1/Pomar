import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EVENT_NAMES, isEventName } from "./events";

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

/** Lê a lista de eventos do `check` mais recente que define `name in (...)`. */
function eventNamesFromMigrations(): string[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  let latest: string[] = [];
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const match = sql.match(/name in \(([\s\S]*?)\)/);
    if (match?.[1]) latest = [...match[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]!);
  }
  return latest;
}

describe("EVENT_NAMES", () => {
  it("contém os 23 eventos do DESIGN.md §9.1, sem repetição", () => {
    expect(EVENT_NAMES).toHaveLength(23);
    expect(new Set(EVENT_NAMES).size).toBe(EVENT_NAMES.length);
  });

  it("está sincronizada com o check da tabela telemetry_events", () => {
    expect([...eventNamesFromMigrations()].sort()).toEqual([...EVENT_NAMES].sort());
  });

  it("isEventName aceita só nomes conhecidos", () => {
    expect(isEventName("signup_completed")).toBe(true);
    expect(isEventName("compra_realizada")).toBe(false);
    expect(isEventName(42)).toBe(false);
  });
});

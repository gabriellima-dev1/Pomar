import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BADGES, BADGE_CODES, RARITY_WEIGHT } from "./catalog";

const SQL = readFileSync(
  join(process.cwd(), "supabase", "migrations", "20261110230000_gamificacao.sql"),
  "utf8",
);

/** Emblemas apagados por migrações posteriores (Pontual: 20261112000000_retira_pontual.sql). */
const RETIRED = new Set(["pontual"]);

/** Linhas do `insert into public.badges` da migração, sem os retirados depois. */
function seededBadges() {
  return [...SQL.matchAll(/\('([a-z_]+)', '(comum|incomum|raro)', (true|false), (\d+), (\d+)\)/g)]
    .map((m) => ({
      code: m[1],
      rarity: m[2],
      hidden: m[3] === "true",
      weight: Number(m[4]),
      position: Number(m[5]),
    }))
    .filter((b) => !RETIRED.has(b.code ?? ""));
}

describe("catálogo de emblemas", () => {
  it("tem os 11 emblemas do DESIGN §6.4 na ordem do álbum", () => {
    expect(BADGES.map((b) => b.code)).toEqual([...BADGE_CODES]);
    expect(BADGES).toHaveLength(11);
  });

  it("bate com o seed da tabela badges (raridade, oculto, peso e ordem)", () => {
    const seeded = seededBadges();
    expect(seeded).toHaveLength(11);
    BADGES.forEach((b, i) => {
      expect(seeded[i]).toMatchObject({
        code: b.code,
        rarity: b.rarity,
        hidden: b.hidden,
        weight: RARITY_WEIGHT[b.rarity],
      });
    });
    // A ordem do álbum segue `position` (o buraco do Pontual fica no 9).
    const positions = seeded.map((b) => b.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("só os raros são ocultos", () => {
    expect(BADGES.filter((b) => b.hidden).map((b) => b.code)).toEqual([
      "fruto_dourado",
      "lua_cheia",
    ]);
  });
});

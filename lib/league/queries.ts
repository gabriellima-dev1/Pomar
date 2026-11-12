import "server-only";
import { cache } from "react";
import { addDays } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { BandIndex } from "./bands";
import { isDivision, nextDivision, previousDivision, type Division } from "./divisions";
import { rankStandings, type Outcome, type RankedStanding, type Standing } from "./ranking";
import { leagueWeek } from "./week";

/** Linha do ranking como a pessoa vê (sem ids de outras pessoas). */
export type LeagueRow = RankedStanding<
  Standing & { isMe: boolean; isDemo: boolean; publicProfile: boolean }
>;

export type LeagueGroupView = {
  week: string;
  division: Division;
  bandMin: BandIndex;
  bandMax: BandIndex;
  /** Quem entrou no ranking da semana (ganhou XP), já em ordem. */
  rows: LeagueRow[];
  /** A pessoa no ranking; null = ainda sem XP nesta semana (como no Duolingo). */
  me: LeagueRow | null;
};

export type LeagueView = {
  optIn: boolean | null;
  username: string | null;
  publicProfile: boolean;
  division: Division;
  /** Grupo da semana em andamento (null = ainda sem grupo). */
  group: LeagueGroupView | null;
};

function band(n: number): BandIndex {
  return Math.min(3, Math.max(0, Math.trunc(n))) as BandIndex;
}

/** Estado da Feira de quem está logado (RLS + league_standings()). */
export const getLeagueView = cache(async (userId: string): Promise<LeagueView> => {
  const supabase = await createClient();
  const [{ data: p }, { data: standings }] = await Promise.all([
    supabase
      .from("profiles")
      .select("league_opt_in, username, public_profile, league_division")
      .eq("id", userId)
      .maybeSingle(),
    supabase.rpc("league_standings"),
  ]);
  const division = isDivision(p?.league_division) ? p.league_division : "bronze";
  const list = standings ?? [];
  const first = list[0];
  let group: LeagueGroupView | null = null;
  if (first) {
    const rows = rankStandings(
      list
        .filter((s) => s.xp > 0)
        .map((s, i) => ({
          userId: s.is_me ? "eu" : `${i}`,
          username: s.username,
          xp: s.xp,
          lastXpAt: s.last_xp_at,
          isMe: s.is_me,
          isDemo: s.is_demo,
          publicProfile: s.public_profile,
        })),
    );
    group = {
      week: first.week_start,
      division: isDivision(first.division) ? first.division : "bronze",
      bandMin: band(first.band_min),
      bandMax: band(first.band_max),
      rows,
      me: rows.find((r) => r.isMe) ?? null,
    };
  }
  return {
    optIn: p?.league_opt_in ?? null,
    username: p?.username ?? null,
    publicProfile: p?.public_profile ?? false,
    division,
    group,
  };
});

export type WeekResult = {
  week: string;
  rank: number;
  xp: number;
  outcome: Outcome;
  from: Division;
  to: Division;
};

/** Resultado da semana ainda não visto (tela 25), só das 2 últimas semanas. */
export async function getPendingWeekResult(now = new Date()): Promise<WeekResult | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("league_members")
    .select("week_start, final_rank, xp_week, outcome, league_groups(division)")
    .not("outcome", "is", null)
    .is("result_seen_at", null)
    .gte("week_start", addDays(leagueWeek(now), -14))
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data || !data.final_rank || !data.outcome) return null;
  const from = isDivision(data.league_groups?.division) ? data.league_groups.division : "bronze";
  const outcome = data.outcome as Outcome;
  const to =
    (outcome === "up" ? nextDivision(from) : outcome === "down" ? previousDivision(from) : from) ??
    from;
  return { week: data.week_start, rank: data.final_rank, xp: data.xp_week, outcome, from, to };
}

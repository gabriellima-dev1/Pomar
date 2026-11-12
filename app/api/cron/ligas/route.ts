import { NextResponse, type NextRequest } from "next/server";
import { closeWeek, runWeeklyRollover } from "@/lib/league/service";
import { leagueWeek } from "@/lib/league/week";

/**
 * Cron da Feira (vercel.json: segunda 00:00 em São Paulo = 03:00 UTC): fecha as semanas
 * anteriores ainda abertas (posições, subida e descida) e abre a nova. A Vercel manda
 * `Authorization: Bearer $CRON_SECRET`; sem o segredo certo, nada roda.
 *
 * `?fechar=atual` (só pelo script `npm run league:close`, para o aceite e a demonstração):
 * fecha a semana em andamento sem esperar a segunda.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }
  try {
    if (request.nextUrl.searchParams.get("fechar") === "atual") {
      const week = leagueWeek(new Date());
      return NextResponse.json({ closed: (await closeWeek(week)) ? [week] : [], opened: null });
    }
    return NextResponse.json(await runWeeklyRollover());
  } catch (error) {
    console.error("[feira] virada da semana", error);
    return NextResponse.json({ erro: "falha na virada da semana" }, { status: 500 });
  }
}

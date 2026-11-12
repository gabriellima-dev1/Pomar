/**
 * Roda a Feira manualmente, pelo mesmo código do cron (app/api/cron/ligas).
 * Uso: npm run league:close -- [--fechar-semana-atual] [--url http://localhost:3000] --confirmo
 *      (lê .env.local; precisa de CRON_SECRET e do app rodando na URL)
 *
 * Sem opção: virada da semana (fecha as semanas anteriores ainda abertas e abre a atual;
 * serve também para abrir a primeira Feira no meio da semana).
 * --fechar-semana-atual: fecha a semana em andamento agora (posições, subida e descida),
 * para o aceite da Fase 5 e a demonstração.
 */
function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável ausente: ${name}. Configure em .env.local.`);
    process.exit(1);
  }
  return value;
}

const args = process.argv.slice(2);
const closeCurrent = args.includes("--fechar-semana-atual");
const urlIndex = args.indexOf("--url");
const base = (urlIndex >= 0 ? args[urlIndex + 1] : undefined) ?? env("NEXT_PUBLIC_APP_URL");

if (!args.includes("--confirmo")) {
  console.error(
    (closeCurrent
      ? `Isto FECHA a semana atual da Feira em ${base}: posições finais, subida e descida.\n`
      : `Isto faz a virada da Feira em ${base}: fecha semanas anteriores abertas e abre a atual.\n`) +
      "Rode de novo com --confirmo para seguir.",
  );
  process.exit(1);
}

const url = new URL("/api/cron/ligas", base);
if (closeCurrent) url.searchParams.set("fechar", "atual");
const response = await fetch(url, {
  headers: { authorization: `Bearer ${env("CRON_SECRET")}` },
});
const body = await response.text();
if (!response.ok) {
  console.error(`✗ ${response.status}: ${body}`);
  process.exit(1);
}
const report = JSON.parse(body) as { closed: string[]; opened: string | null };
console.log(
  `✓ Semanas fechadas: ${report.closed.length ? report.closed.join(", ") : "nenhuma"} · ` +
    `semana aberta: ${report.opened ?? "nenhuma nova"}`,
);

export {};

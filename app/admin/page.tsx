import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { ActiveChart } from "@/components/admin/ActiveChart";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { computeAdminMetrics, diffLabel, PANEL_TZ, pct, type Period } from "@/lib/admin/metrics";
import { loadAdminData } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };
export const dynamic = "force-dynamic";

const PERIODS: { key: Period; label: string; param: string }[] = [
  { key: 7, label: "7 dias", param: "7" },
  { key: 30, label: "30 dias", param: "30" },
  { key: "tudo", label: "Desde o início", param: "tudo" },
];

function parsePeriod(v: unknown): Period {
  return v === "7" ? 7 : v === "tudo" ? "tudo" : 30;
}

const card = "bg-surface-200 shadow-card rounded-lg p-5";

/**
 * Painel do Pomar (telas.md › 34, DESIGN §9.3): só `is_admin = true` (os outros recebem
 * 404). Os números são calculados no servidor com a chave secreta (lib/admin); para o
 * navegador vão só os agregados.
 */
export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!me?.is_admin) notFound();

  const query = await searchParams;
  const period = parsePeriod(query.periodo);
  const excludeDemo = query.demo !== "1";
  const now = new Date();
  const m = computeAdminMetrics({ ...(await loadAdminData()), period, excludeDemo, now });

  const periodParam = PERIODS.find((p) => p.key === period)!.param;
  const href = (p: string, demo: boolean) => `/admin?periodo=${p}${demo ? "" : "&demo=1"}` as const;
  const updated = now.toLocaleTimeString("pt-BR", {
    timeZone: PANEL_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
  const cards = [
    { label: "DAU", value: m.dauAvg.toLocaleString("pt-BR"), hint: "ativos por dia (média)" },
    { label: "MAU", value: String(m.mau), hint: "ativos em 30 dias" },
    { label: "Stickiness", value: pct(m.stickiness), hint: "DAU / MAU" },
    { label: "Retenção D1", value: pct(m.retentionD1), hint: "voltaram no dia seguinte" },
    { label: "Retenção D7", value: pct(m.retentionD7), hint: "ativos no 7º dia" },
    { label: "Nudge da pausa", value: pct(m.nudge.acceptance), hint: "escolheram reiniciar" },
  ];
  const top = Math.max(1, m.funnel[0]?.count ?? 0);
  const { A, B } = m.cohorts;
  // Sem resposta = pop-up exibido sem escolha registrada (fechou a aba, por exemplo).
  const noAnswer = Math.max(0, m.nudge.shown - m.nudge.restart - m.nudge.continue);
  const nudgeRows = [
    { label: "Reiniciar ciclo", value: m.nudge.restart, color: "bg-primary" },
    { label: "Continuar mesmo assim", value: m.nudge.continue, color: "bg-control-border" },
    { label: "Sem resposta", value: noAnswer, color: "bg-line" },
  ];

  return (
    <div data-theme="classico" className="bg-surface-100 text-ink flex min-h-full flex-1 flex-col">
      <header className="border-line bg-surface-200 border-b">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
          <div className="mr-auto flex items-center gap-3">
            <SeuTomas size={36} />
            <h1 className="text-title">Painel do Pomar</h1>
            <span className="bg-ink text-surface-100 rounded-full px-2.5 py-0.5 text-xs font-extrabold">
              admin
            </span>
          </div>
          <nav
            aria-label="Período"
            className="bg-surface-300 grid grid-flow-col gap-1 rounded-lg p-1"
          >
            {PERIODS.map((p) => (
              <Link
                key={p.param}
                href={href(p.param, excludeDemo)}
                aria-current={p.key === period ? "page" : undefined}
                className={`flex min-h-10 items-center rounded-[16px] px-3 text-sm font-extrabold ${
                  p.key === period ? "bg-surface-200 text-ink shadow-card" : "text-ink-muted"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </nav>
          <Link
            href={href(periodParam, !excludeDemo)}
            role="checkbox"
            aria-checked={excludeDemo}
            className="flex min-h-11 items-center gap-2 font-extrabold"
          >
            <span
              aria-hidden
              className={`grid size-6 place-items-center rounded-[6px] border-2 ${
                excludeDemo ? "border-primary bg-primary text-on-primary" : "border-control-border"
              }`}
            >
              {excludeDemo && <Check size={18} strokeWidth={3.5} />}
            </span>
            Sem contas demo
          </Link>
          <p className="text-small text-ink-muted font-semibold">Atualizado às {updated}</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-6 py-6">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {cards.map((c) => (
            <li key={c.label} className={`${card} flex flex-col gap-0.5`}>
              <span className="text-caption text-ink-muted">{c.label}</span>
              <span className="font-display text-[34px] leading-tight font-semibold">
                {c.value}
              </span>
              <span className="text-small text-ink-muted font-semibold">{c.hint}</span>
            </li>
          ))}
        </ul>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <section aria-labelledby="funil" className={`${card} flex min-w-0 flex-col gap-3`}>
            <h2 id="funil" className="text-heading">
              Funil do onboarding
            </h2>
            <ol className="flex flex-col gap-2">
              {m.funnel.map((s, i) => (
                <li
                  key={s.label}
                  className="grid grid-cols-[104px_1fr_84px] items-center gap-3 sm:grid-cols-[150px_1fr_110px]"
                >
                  <span className="text-small font-extrabold">{s.label}</span>
                  <span className="bg-surface-300 h-5 overflow-hidden rounded-full">
                    <span
                      className={`block h-full rounded-full ${i === m.funnel.length - 1 ? "bg-primary-strong" : "bg-primary"}`}
                      style={{ width: `${(s.count / top) * 100}%` }}
                    />
                  </span>
                  <span className="text-small font-extrabold">
                    {s.count}{" "}
                    {s.drop === null ? (
                      <span className="text-ink-muted font-semibold">
                        · {i === 0 ? "100%" : "—"}
                      </span>
                    ) : (
                      <span className="text-danger">−{pct(s.drop)}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-small text-ink-muted font-semibold">
              Base: cadastros do período. Perda entre etapas em relação à etapa anterior.
              &quot;Ativo em 3 dias&quot; = 3 dias distintos com ação valiosa nos primeiros 7.
            </p>
          </section>

          <section aria-labelledby="ativos" className={`${card} flex min-w-0 flex-col gap-3`}>
            <h2 id="ativos" className="text-heading">
              Ativos por dia
            </h2>
            <ActiveChart data={m.activeByDay} />
            <p className="text-small text-ink-muted font-semibold">
              Ativo = concluiu um pomodoro ou um tópico no dia (DESIGN §9.2).
            </p>
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="experimento" className={`${card} flex min-w-0 flex-col gap-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="experimento" className="text-heading">
                Experimento: com × sem recompensas
              </h2>
              <span className="bg-reward/30 text-ink rounded-full px-3 py-1 text-xs font-extrabold">
                Amostra pequena: resultado demonstrativo
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead className="text-caption text-ink-muted">
                  <tr className="border-line border-b-2">
                    <th scope="col" className="py-2 pr-3">
                      Métrica
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      A · com recompensas
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      B · sem recompensas
                    </th>
                    <th scope="col" className="py-2">
                      Diferença
                    </th>
                  </tr>
                </thead>
                <tbody className="font-extrabold">
                  {[
                    ["Pessoas", String(A.people), String(B.people), "—"],
                    [
                      "DAU médio",
                      A.dauAvg.toLocaleString("pt-BR"),
                      B.dauAvg.toLocaleString("pt-BR"),
                      diffLabel(A.dauAvg, B.dauAvg, "relative"),
                    ],
                    [
                      "Pomodoros por pessoa (semana)",
                      A.pomodorosPerPersonWeek.toLocaleString("pt-BR"),
                      B.pomodorosPerPersonWeek.toLocaleString("pt-BR"),
                      diffLabel(A.pomodorosPerPersonWeek, B.pomodorosPerPersonWeek, "relative"),
                    ],
                    [
                      "Retenção D7",
                      pct(A.retentionD7),
                      pct(B.retentionD7),
                      diffLabel(A.retentionD7, B.retentionD7, "points"),
                    ],
                  ].map(([label, a, b, d]) => (
                    <tr key={label} className="border-line border-b last:border-0">
                      <th scope="row" className="py-3 pr-3">
                        {label}
                      </th>
                      <td className="py-3 pr-3">{a}</td>
                      <td className="py-3 pr-3">{b}</td>
                      <td className="text-primary-strong py-3">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-small text-ink-muted font-semibold">
              Quem saiu do experimento e as contas anteriores à Fase 4 ficam fora da comparação.
            </p>
          </section>

          <section aria-labelledby="nudge" className={`${card} flex min-w-0 flex-col gap-3`}>
            <h2 id="nudge" className="text-heading">
              Nudge da pausa
            </h2>
            <div
              role="img"
              aria-label={`Reiniciar ciclo: ${m.nudge.restart}. Continuar mesmo assim: ${m.nudge.continue}. Sem resposta: ${noAnswer}.`}
              className="bg-surface-300 flex h-5 gap-0.5 overflow-hidden rounded-full"
            >
              {m.nudge.shown > 0 &&
                nudgeRows.map((r) =>
                  r.value > 0 ? (
                    <span
                      key={r.label}
                      className={`block h-full ${r.color}`}
                      style={{ width: `${(r.value / m.nudge.shown) * 100}%` }}
                    />
                  ) : null,
                )}
            </div>
            <dl className="flex flex-col gap-1.5 font-extrabold">
              {nudgeRows.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span aria-hidden className={`size-3 rounded-[3px] ${r.color}`} />
                  <dt className="mr-auto font-semibold">{r.label}</dt>
                  <dd>
                    {r.value} · {pct(m.nudge.shown ? r.value / m.nudge.shown : null)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-small text-ink-muted font-semibold">
              {m.nudge.shown} pop-ups exibidos no período.
            </p>
          </section>
        </div>

        <p className="text-small text-ink-muted font-semibold">
          {m.demoAccounts} {m.demoAccounts === 1 ? "conta demo existe" : "contas demo existem"}
          {excludeDemo
            ? ' e estão fora destes números. Desmarque "Sem contas demo" para incluí-las.'
            : " e estão incluídas nestes números."}
        </p>
      </main>
    </div>
  );
}

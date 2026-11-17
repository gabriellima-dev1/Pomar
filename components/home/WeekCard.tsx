import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cardClasses } from "@/components/ui/Card";
import type { Bar, FocusSummary } from "@/lib/stats/stats";
import { formatHM } from "@/lib/stats/stats";

/**
 * "Sua semana" do Início (telas.md › Início como painel, item 6; 36 e 36b): tempo de
 * foco, pomodoros e dias estudados da semana (seg–dom, no fuso da pessoa), as barras
 * dos 7 dias e o link para as Estatísticas (29). Igual nas duas coortes.
 */
export function WeekCard({ summary, bars }: { summary: FocusSummary; bars: Bar[] }) {
  const max = Math.max(1, ...bars.map((b) => b.minutes));
  return (
    <section aria-labelledby="sua-semana" className={`${cardClasses} flex flex-col gap-4 p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="sua-semana" className="text-heading">
          Sua semana
        </h2>
        <Link
          href="/estatisticas"
          className="text-primary inline-flex min-h-11 items-center gap-1.5 font-extrabold underline-offset-4 hover:underline"
        >
          Ver todas as estatísticas
          <ArrowRight size={20} aria-hidden />
        </Link>
      </div>
      <dl className="grid grid-cols-3 gap-3">
        {[
          { value: formatHM(summary.totalMin), label: "de foco" },
          { value: String(summary.pomodoros), label: "pomodoros" },
          { value: `${summary.studyDays} de 7`, label: "dias estudados" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="text-small text-ink-muted font-semibold">{s.label}</dt>
            <dd className="font-display text-[26px] leading-8 font-semibold tabular-nums">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
      <ul
        className="flex h-28 items-end justify-between gap-2"
        aria-label="Minutos de foco por dia"
      >
        {bars.map((b) => (
          <li key={b.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span aria-hidden className="flex min-h-0 w-full flex-1 items-end justify-center">
              <span
                className={`w-full max-w-11 rounded-t-[8px] rounded-b-[4px] ${
                  b.minutes > 0 ? "bg-primary" : "bg-surface-300"
                }`}
                style={{
                  height: b.minutes > 0 ? `${Math.max(12, (b.minutes / max) * 100)}%` : 4,
                }}
              />
            </span>
            <span aria-hidden className="text-small text-ink-muted font-extrabold">
              {b.label}
            </span>
            <span className="sr-only">
              {b.title}: {b.future ? "ainda não chegou" : `${b.minutes} min`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

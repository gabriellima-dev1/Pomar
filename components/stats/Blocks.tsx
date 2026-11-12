import { shortDate } from "@/lib/gamification/present";
import { subjectColorVar } from "@/lib/subjects/colors";
import { formatHM, type HeatCell, type HeatTone } from "@/lib/stats/stats";

const TONE: Record<HeatTone, string> = {
  0: "var(--surface-300)",
  1: "color-mix(in srgb, var(--primary) 45%, var(--surface-200))",
  2: "var(--primary)",
  3: "var(--primary-strong)",
};

/**
 * Dias estudados no ano (telas.md › 29): semanas em colunas × dias em linhas, 4 tons.
 * Rola na horizontal no celular e começa mostrando as semanas mais recentes.
 */
export function YearHeatmap({ weeks, label }: { weeks: HeatCell[][]; label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div role="img" aria-label={label} className="flex flex-row-reverse overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {weeks.map((week, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {week.map((cell, d) =>
                cell ? (
                  <span
                    key={d}
                    title={`${shortDate(cell.day)}: ${cell.minutes ? formatHM(cell.minutes) : "sem estudo"}`}
                    className="block size-[18px] rounded-[4px]"
                    style={{ background: TONE[cell.tone] }}
                  />
                ) : (
                  <span key={d} aria-hidden className="block size-[18px]" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <p
        className="text-small text-ink-muted flex items-center justify-end gap-1.5 font-semibold"
        aria-hidden
      >
        menos
        {([0, 1, 2, 3] as const).map((t) => (
          <span
            key={t}
            className="block size-[14px] rounded-[3px]"
            style={{ background: TONE[t] }}
          />
        ))}
        mais
      </p>
    </div>
  );
}

export type SubjectRow = {
  key: string;
  title: string;
  color: string | null;
  minutes: number;
  pct: number;
};

/** Por disciplina: barra empilhada nas cores `--subject-*` (2px entre as partes) + lista. */
export function SubjectsBreakdown({ rows }: { rows: SubjectRow[] }) {
  const color = (r: SubjectRow) => (r.color ? subjectColorVar(r.color) : "var(--ink-muted)");
  return (
    <div className="flex flex-col gap-4">
      <div aria-hidden className="flex h-5 gap-[2px] overflow-hidden rounded-[6px]">
        {rows.map((r) => (
          <span key={r.key} style={{ flexGrow: r.minutes, background: color(r) }} />
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-3">
            <span
              aria-hidden
              className="size-4 shrink-0 rounded-full"
              style={{ background: color(r) }}
            />
            <span className="min-w-0 flex-1 font-semibold">{r.title}</span>
            <span className="shrink-0 font-extrabold tabular-nums">{formatHM(r.minutes)}</span>
            <span className="text-ink-muted w-12 shrink-0 text-right font-extrabold tabular-nums">
              {r.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Melhor horário: minutos por hora de início (24 barras), a faixa de 2 h em `--primary`. */
export function HourBars({ hours, start }: { hours: number[]; start: number | null }) {
  const max = Math.max(1, ...hours);
  return (
    <div aria-hidden className="flex h-14 items-end gap-[2px]">
      {hours.map((m, h) => (
        <span
          key={h}
          className="flex-1 rounded-t-[3px]"
          style={{
            height: `${Math.max(8, (m / max) * 100)}%`,
            background:
              start !== null && (h === start || h === start + 1)
                ? "var(--primary)"
                : "var(--surface-300)",
          }}
        />
      ))}
    </div>
  );
}

/** Previsto × real: duas barras proporcionais às médias por tópico. */
export function PredictedBars({ predicted, actual }: { predicted: number; actual: number }) {
  const max = Math.max(predicted, actual, 1);
  const row = (label: string, value: number, bg: string) => (
    <div className="flex items-center gap-3">
      <span className="text-small w-16 shrink-0 font-extrabold">{label}</span>
      <span className="flex-1">
        <span
          className="block h-3 rounded-full"
          style={{ width: `${(value / max) * 100}%`, background: bg }}
        />
      </span>
    </div>
  );
  return (
    <div className="flex flex-col gap-2">
      {row("previsto", predicted, "var(--ink-muted)")}
      {row("real", actual, "var(--primary)")}
    </div>
  );
}

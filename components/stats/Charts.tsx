"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { formatHM, type Bar as FocusBar } from "@/lib/stats/stats";

const axisTick = { fill: "var(--ink-muted)", fontSize: 13, fontWeight: 700 };

function TipBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-surface-200 border-line shadow-card text-small rounded-md border-2 px-3 py-2">
      <p className="text-ink-muted font-semibold">{title}</p>
      <p className="text-ink font-extrabold">{value}</p>
    </div>
  );
}

/**
 * Tempo de foco (telas.md › 29): barras em `--primary`, valor em minutos em cima,
 * eixo em horas, grade discreta e tooltip por barra.
 */
export function FocusBarsChart({ bars, label }: { bars: FocusBar[]; label: string }) {
  const max = Math.max(60, ...bars.map((b) => b.minutes));
  const stepH = max > 600 ? 300 : max > 240 ? 120 : 60;
  const top = Math.ceil(max / stepH) * stepH;
  const ticks = Array.from({ length: top / stepH + 1 }, (_, i) => i * stepH);
  return (
    <div role="img" aria-label={label} className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} margin={{ top: 22, right: 4, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeWidth={1} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--ink-muted)" }}
            tick={axisTick}
            interval={0}
          />
          <YAxis
            ticks={ticks}
            domain={[0, top]}
            tickFormatter={(v: number) => (v === 0 ? "0" : `${v / 60}h`)}
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            width={44}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-300)", opacity: 0.6 }}
            content={({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
              const b = payload?.[0]?.payload as FocusBar | undefined;
              return active && b ? <TipBox title={b.title} value={formatHM(b.minutes)} /> : null;
            }}
          />
          <Bar
            dataKey="minutes"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="minutes"
              position="top"
              formatter={(v: unknown) => (typeof v === "number" && v > 0 ? v : "")}
              style={{ fill: "var(--ink)", fontSize: 13, fontWeight: 800 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type PaceDatum = { i: number; label: string; value: number };

/** Seu ritmo: linha de 2px do min/página por ciclo, marcadores de 8px, na cor da disciplina. */
export function PaceLineChart({
  points,
  color,
  label,
}: {
  points: PaceDatum[];
  color: string;
  label: string;
}) {
  const values = points.map((p) => p.value);
  const lo = Math.floor(Math.min(...values) * 2) / 2;
  const hi = Math.ceil(Math.max(...values) * 2) / 2;
  const domain: [number, number] = lo === hi ? [lo - 0.5, hi + 0.5] : [lo, hi];
  return (
    <div role="img" aria-label={label} className="h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeWidth={1} />
          <XAxis dataKey="i" hide />
          <YAxis
            domain={domain}
            tickCount={3}
            tickFormatter={(v: number) =>
              v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            }
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: "var(--ink-muted)", strokeWidth: 1 }}
            content={({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
              const d = payload?.[0]?.payload as PaceDatum | undefined;
              return active && d ? (
                <TipBox title={d.label} value={`${d.value.toLocaleString("pt-BR")} min/pág.`} />
              ) : null;
            }}
          />
          <Line
            type="linear"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color, stroke: "var(--surface-200)", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

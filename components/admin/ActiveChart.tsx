"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const axisTick = { fill: "var(--ink-muted)", fontSize: 12, fontWeight: 700 };

/** "20/11" a partir de "2026-11-20". */
function short(day: string): string {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}

/** Ativos por dia (telas.md › 34): linha em `--primary` no período, só números agregados. */
export function ActiveChart({ data }: { data: { day: string; count: number }[] }) {
  const last = data.at(-1);
  return (
    <div
      role="img"
      aria-label={`Ativos por dia, de ${short(data[0]?.day ?? "")} a ${short(last?.day ?? "")}. Hoje: ${last?.count ?? 0}.`}
      className="h-[220px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -22 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeWidth={1} />
          <XAxis
            dataKey="day"
            tickFormatter={short}
            tickLine={false}
            axisLine={{ stroke: "var(--ink-muted)" }}
            tick={axisTick}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: "var(--line)" }}
            content={(p: TooltipContentProps<ValueType, NameType>) =>
              p.active && p.payload?.[0] ? (
                <div className="bg-surface-200 border-line shadow-card text-small rounded-md border-2 px-3 py-2">
                  <p className="text-ink-muted font-semibold">{short(String(p.label))}</p>
                  <p className="text-ink font-extrabold">{p.payload[0].value} ativos</p>
                </div>
              ) : null
            }
          />
          <Line
            type="linear"
            dataKey="count"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

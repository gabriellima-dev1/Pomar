"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import r from "@/components/gamification/Rewards.module.css";
import { Scene } from "@/components/scenes/Scene";
import { Button } from "@/components/ui/Button";
import { weekRangeLabel } from "@/lib/gamification/present";
import type { ThemeCode } from "@/lib/gamification/themes";
import { weekResultCopy } from "@/lib/league/present";
import type { WeekResult as Result } from "@/lib/league/queries";
import { DivisionMedal } from "./Divisions";

const PARTICLES: [number, number, string][] = [
  [-70, -54, "var(--reward)"],
  [74, -66, "var(--reward)"],
  [-82, 10, "var(--fruit)"],
  [80, 30, "var(--reward)"],
  [-56, 70, "var(--fruit)"],
];

/**
 * Resultado da semana (referencias/25-liga-resultado.png): aparece uma vez ao abrir o
 * app depois do fechamento. Raios + medalha da nova divisão; sem raios quando desce.
 */
export function WeekResult({
  result,
  theme,
  onSee,
  onClose,
}: {
  result: Result;
  theme: ThemeCode;
  onSee: () => void;
  onClose: () => void;
}) {
  const copy = weekResultCopy(result);
  const Arrow = result.outcome === "down" ? ArrowDown : ArrowUp;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resultado-titulo"
      className="fixed inset-0 z-50 overflow-y-auto bg-[var(--scene-sky-bottom)]"
    >
      <Scene theme={theme} />
      <div aria-hidden className="bg-scrim absolute inset-0" />
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          className={`bg-surface-200 shadow-dialog flex w-full max-w-[400px] flex-col items-center gap-4 rounded-[32px] px-6 py-8 text-center ${r.rise}`}
        >
          <p className="text-caption text-ink-muted">
            Resultado da semana · {weekRangeLabel(result.week).toUpperCase()}
          </p>

          <div className="relative grid size-[176px] place-items-center">
            {copy.celebrate && (
              <svg viewBox="-88 -88 176 176" className="absolute inset-0" aria-hidden>
                <g className={r.raysIn}>
                  <g className={r.rays}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <path
                        key={i}
                        d="M-14 -88 L14 -88 L5 -40 L-5 -40Z"
                        style={{
                          fill: "color-mix(in srgb, var(--reward) 30%, var(--surface-200))",
                        }}
                        transform={`rotate(${i * 45})`}
                      />
                    ))}
                  </g>
                </g>
                {PARTICLES.map(([x, y, color], i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={i % 2 ? 4 : 5}
                    fill={color}
                    className={r.sparkle}
                    style={
                      {
                        "--dx": `${-x}px`,
                        "--dy": `${-y}px`,
                        animationDelay: `${i * 40}ms, ${600 + i * 350}ms`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </svg>
            )}
            <span className={`relative ${r.discIn}`}>
              <DivisionMedal division={result.to} size={112} />
            </span>
          </div>

          <span
            className={`text-caption flex items-center gap-1.5 rounded-full px-4 py-1.5 ${
              result.outcome === "up"
                ? "bg-primary-soft text-primary-strong"
                : "bg-surface-300 text-ink-muted"
            }`}
          >
            {result.outcome !== "stay" && <Arrow size={16} aria-hidden strokeWidth={2.5} />}
            {copy.badge}
          </span>
          <h2 id="resultado-titulo" className="font-display text-[30px] leading-9 font-semibold">
            {copy.title}
          </h2>
          <p className="text-ink-muted">{copy.body}</p>

          <Button size="lg" className="w-full" onClick={onSee} autoFocus>
            Ver minha nova Feira
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

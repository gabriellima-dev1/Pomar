"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { Scene } from "@/components/scenes/Scene";
import { Button } from "@/components/ui/Button";
import { badgeInfo, RARITY_LABEL, type Rarity } from "@/lib/gamification/catalog";
import { revealTitle, dayLabel, weekStrip, type BadgeDay } from "@/lib/gamification/present";
import type { ThemeCode } from "@/lib/gamification/themes";
import { BadgeDisc } from "./BadgeDisc";
import { WeekDots } from "./WeekDots";
import r from "./Rewards.module.css";

const RAY_COLOR: Record<Rarity, string> = {
  comum: "var(--reward)",
  incomum: "var(--primary-soft)",
  raro: "var(--fruit-soft)",
};

const PILL: Record<Rarity, string> = {
  comum: "bg-reward text-on-reward",
  incomum: "bg-primary-soft text-primary-strong",
  raro: "bg-fruit text-on-fruit",
};

const PARTICLES: [number, number, string][] = [
  [-62, -66, "var(--fruit)"],
  [70, -58, "var(--reward)"],
  [-80, 6, "var(--fruit)"],
  [84, 28, "var(--reward)"],
  [-58, 74, "var(--reward)"],
  [56, 80, "var(--fruit)"],
  [0, -92, "var(--reward)"],
];

/**
 * "Seu fruto de ontem" (tela 12): revelação do emblema sorteado no fechamento do dia.
 * Cena ao fundo + véu; disco no estilo da raridade com raios e até 7 partículas.
 * Fechar (X ou Esc) adia a fila sem marcar nada como visto; tocar no véu não fecha
 * (revisão de 16/11).
 */
export function FruitReveal({
  badge,
  today,
  history,
  theme,
  onHarvest,
  onAlbum,
  onClose,
}: {
  badge: BadgeDay;
  today: string;
  /** Emblemas já revelados até este dia (para a colheita da semana). */
  history: readonly BadgeDay[];
  theme: ThemeCode;
  onHarvest: () => void;
  onAlbum: () => void;
  /** Fechar e ver depois (X no canto ou Esc). */
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const info = badgeInfo(badge.code);
  if (!info) return null;
  const week = weekStrip(
    badge.day,
    history.filter((h) => h.day <= badge.day),
  );
  const count = week.filter((d) => d.code).length;
  const title = revealTitle(badge.day, today);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fruto-nome"
      className="fixed inset-0 z-50 overflow-y-auto bg-[var(--scene-sky-bottom)]"
    >
      <Scene theme={theme} />
      <div aria-hidden className="bg-scrim absolute inset-0" />
      {/* Mesmo círculo de vidro dos botões do pomodoro, no canto da tela. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar e ver depois"
        className="fixed top-10 right-4 z-10 grid size-11 place-items-center rounded-full bg-[var(--glass-fill)] text-[var(--scene-ink)] backdrop-blur-md lg:top-6 lg:right-8"
      >
        <X size={26} aria-hidden />
      </button>
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          className={`bg-surface-200 shadow-dialog flex w-full max-w-[400px] flex-col items-center gap-4 rounded-[32px] px-6 py-8 text-center ${r.rise}`}
        >
          <p className="text-caption text-ink-muted">
            {title.toUpperCase()}
            {title === "Seu fruto de ontem" ? ` · ${dayLabel(badge.day).toUpperCase()}` : ""}
          </p>

          <div className="relative grid size-[176px] place-items-center">
            <svg viewBox="-88 -88 176 176" className="absolute inset-0" aria-hidden>
              <g className={r.raysIn}>
                <g className={r.rays}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <path
                      key={i}
                      d="M-14 -88 L14 -88 L5 -40 L-5 -40Z"
                      fill={RAY_COLOR[info.rarity]}
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
            <span className={`relative ${r.discIn}`}>
              <BadgeDisc code={info.code} rarity={info.rarity} size={116} />
            </span>
          </div>

          <span className={`text-caption rounded-full px-4 py-1.5 ${PILL[info.rarity]}`}>
            {RARITY_LABEL[info.rarity]}
          </span>
          <h2 id="fruto-nome" className="font-display text-[30px] leading-9 font-semibold">
            {info.name}
          </h2>
          <p className="text-ink-muted">
            {info.reason} Esse saiu do sorteio entre os frutos que você mereceu.
          </p>

          <div className="bg-surface-100 flex w-full flex-wrap items-center justify-center gap-3 rounded-full px-4 py-3">
            <span className="text-small font-extrabold">Colheita da semana</span>
            <WeekDots days={week} size={14} />
            <span className="text-small text-ink-muted font-extrabold">{count} de 7</span>
          </div>

          <Button size="lg" className="w-full" onClick={onHarvest} autoFocus>
            Colher
          </Button>
          <Button variant="ghost" className="w-full" onClick={onAlbum}>
            Ver meu álbum
          </Button>
        </div>
      </div>
    </div>
  );
}

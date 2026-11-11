"use client";

import { SeuTomas } from "@/components/mascot/SeuTomas";
import { Scene } from "@/components/scenes/Scene";
import { Button } from "@/components/ui/Button";
import type { ThemeCode } from "@/lib/gamification/themes";
import { THEMES } from "@/themes";
import r from "./Rewards.module.css";

/**
 * "Tema desbloqueado" (tela 14): cena do tema em tela cheia, Seu Tomás com o
 * acessório do tema e o card com o motivo. "Usar agora" aplica; "Depois" fecha.
 */
export function ThemeUnlocked({
  theme,
  busy,
  onUse,
  onLater,
}: {
  theme: ThemeCode;
  busy: boolean;
  onUse: () => void;
  onLater: () => void;
}) {
  const t = THEMES[theme];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tema-nome"
      data-theme={theme}
      className="fixed inset-0 z-50 overflow-y-auto bg-[var(--scene-sky-bottom)]"
    >
      <Scene theme={theme} progress={1} />
      <div className="max-w-app relative mx-auto flex min-h-full flex-col justify-end gap-4 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="flex justify-center">
          <div className={r.discIn}>
            <SeuTomas size={150} accessory={theme === "classico" ? "basico" : theme} />
          </div>
        </div>
        <div
          className={`bg-surface-200 text-ink shadow-dialog flex flex-col items-center gap-4 rounded-[32px] px-6 py-7 text-center ${r.rise}`}
        >
          <span className="text-caption bg-surface-300 rounded-full px-4 py-1.5">
            Tema desbloqueado
          </span>
          <h2 id="tema-nome" className="font-display text-[34px] leading-10 font-semibold">
            {t.name}
          </h2>
          <p className="text-ink-muted">{t.unlockedPhrase} Esse tema é seu para sempre.</p>
          <Button size="lg" className="w-full" onClick={onUse} disabled={busy} autoFocus>
            {busy ? "Aplicando…" : "Usar agora"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onLater} disabled={busy}>
            Depois
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Check, Eye, Lock, X } from "lucide-react";
import { markThemesTabSeen, setTheme } from "@/app/(app)/conquistas/actions";
import { Scene, SceneThumb } from "@/components/scenes/Scene";
import { usePrefersDark } from "@/components/theme/useEffectiveTheme";
import { Button } from "@/components/ui/Button";
import type { Stage } from "@/lib/gamification/levels";
import {
  canUseTheme,
  effectiveTheme,
  type ThemeCode,
  type ThemePreference,
} from "@/lib/gamification/themes";
import { THEME_LIST, THEMES } from "@/themes";

/**
 * Grade de temas (tela 11, `role="radiogroup"`): em uso, recém-conquistado e bloqueado
 * (com prévia em tela cheia, §6.7). Abaixo, o interruptor opcional "Seguir o modo escuro
 * do aparelho" (Clássico de dia, Noturno no escuro) — desligado por padrão.
 */
export function ThemeGrid({
  chosen: initialChosen,
  unlocked,
  fresh,
  isAdmin,
  seasonal,
  stage,
}: {
  chosen: ThemePreference;
  unlocked: ThemeCode[];
  /** Conquistados que ainda não tiveram a aba aberta (selo "Novo · conquistado"). */
  fresh: ThemeCode[];
  isAdmin: boolean;
  /** Tema sugerido na estação (Kairos), ou null. */
  seasonal: ThemeCode | null;
  stage: Stage;
}) {
  const router = useRouter();
  const prefersDark = usePrefersDark();
  const [chosen, setChosen] = useState(initialChosen);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ThemeCode | null>(null);
  const [pending, startTransition] = useTransition();
  const owned = new Set<string>(unlocked);
  const inUse = effectiveTheme(chosen, prefersDark);
  const locked = THEME_LIST.filter((t) => !canUseTheme(t.code, owned, isAdmin));
  const previewTarget = locked.find((t) => t.code === seasonal) ?? locked[0] ?? null;

  // Abrir a aba uma vez dispensa o selo "Novo" (ele ainda aparece nesta visita).
  useEffect(() => {
    if (fresh.length > 0) void markThemesTabSeen();
  }, [fresh.length]);

  function choose(code: ThemePreference) {
    if (code === chosen) return;
    const before = chosen;
    setChosen(code);
    setError(null);
    startTransition(async () => {
      const res = await setTheme(code);
      if (!res.ok) {
        setChosen(before);
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="@container flex flex-col gap-5">
      <div role="radiogroup" aria-label="Tema" className="grid grid-cols-2 gap-3 @4xl:grid-cols-4">
        {THEME_LIST.map((t) => {
          const usable = canUseTheme(t.code, owned, isAdmin);
          const active = usable && inUse === t.code;
          const auto = chosen === "auto" && (t.code === "classico" || t.code === "noturno");
          return (
            <button
              key={t.code}
              type="button"
              role="radio"
              aria-checked={active}
              aria-disabled={!usable}
              disabled={pending}
              onClick={() => (usable ? choose(t.code) : setPreview(t.code))}
              className={`bg-surface-200 flex min-w-0 flex-col gap-3 rounded-lg p-3 text-left ${
                active
                  ? "border-primary border-[3px]"
                  : "shadow-card border-[3px] border-transparent"
              }`}
            >
              <span className="relative block">
                <SceneThumb theme={t.code} stage={stage} className={usable ? "" : "opacity-55"} />
                {!usable && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="bg-ink text-surface-100 grid size-12 place-items-center rounded-full">
                      <Lock size={22} aria-hidden />
                    </span>
                  </span>
                )}
              </span>
              <span className="flex items-start justify-between gap-2">
                <span className="text-heading min-w-0 [overflow-wrap:anywhere]">{t.name}</span>
                {usable &&
                  (active ? (
                    <span className="bg-primary text-on-primary grid size-7 shrink-0 place-items-center rounded-full">
                      <Check size={18} aria-hidden strokeWidth={3} />
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className="border-control-border size-7 shrink-0 rounded-full border-2"
                    />
                  ))}
              </span>
              <span className="flex flex-col items-start gap-1">
                {active && !auto && (
                  <span className="text-small text-primary-strong font-extrabold">Em uso</span>
                )}
                {active && auto && (
                  <span className="text-small text-primary-strong font-extrabold">
                    Em uso · automático
                  </span>
                )}
                {fresh.includes(t.code) && !active && (
                  <span className="text-small bg-fruit-soft text-ink rounded-full px-3 py-0.5 font-extrabold">
                    Novo · conquistado
                  </span>
                )}
                {seasonal === t.code && (
                  <span className="text-small bg-reward text-on-reward rounded-full px-3 py-0.5 font-extrabold">
                    Sugestão da estação
                  </span>
                )}
                {!usable && t.unlockRule && (
                  <span className="text-small text-ink-muted">{t.unlockRule}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-small bg-fruit-soft rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {previewTarget && (
        <Button variant="secondary" size="lg" onClick={() => setPreview(previewTarget.code)}>
          <Eye size={22} aria-hidden />
          Ver prévia do {previewTarget.name}
        </Button>
      )}
      <label className="bg-surface-200 shadow-card flex cursor-pointer items-center gap-4 rounded-lg p-4">
        <span className="flex flex-1 flex-col">
          <span className="font-extrabold">Seguir o modo escuro do aparelho</span>
          <span className="text-small text-ink-muted">
            Clássico de dia e Noturno quando o aparelho estiver no modo escuro.
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={chosen === "auto"}
          disabled={pending}
          onChange={(e) => choose(e.target.checked ? "auto" : "classico")}
          className="accent-primary size-6 shrink-0"
        />
      </label>

      {preview && <ThemePreview theme={preview} stage={stage} onClose={() => setPreview(null)} />}
    </div>
  );
}

/** Prévia em tela cheia de um tema (só para ver; não aplica). */
function ThemePreview({
  theme,
  stage,
  onClose,
}: {
  theme: ThemeCode;
  stage: Stage;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const t = THEMES[theme];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Prévia do tema ${t.name}`}
      data-theme={theme}
      className="fixed inset-0 z-50 bg-[var(--scene-sky-bottom)]"
    >
      <Scene theme={theme} stage={stage} progress={0.7} />
      <div className="max-w-app relative mx-auto flex h-full flex-col justify-between p-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Fechar a prévia"
            className="grid size-11 place-items-center rounded-full bg-[var(--glass-fill)] text-[var(--scene-ink)]"
          >
            <X size={24} aria-hidden />
          </button>
        </div>
        <p className="glass-panel mx-auto mb-8 rounded-[28px] px-6 py-4 text-center font-extrabold text-[var(--scene-ink)]">
          Prévia do {t.name}
          {t.unlockRule ? (
            <span className="text-small block font-semibold">{t.unlockRule}</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

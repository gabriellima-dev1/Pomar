"use client";

import { useState } from "react";
import { setLeagueChoice } from "@/app/(onboarding)/onboarding/actions";
import { SubmitButton } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";

const OPTIONS = [
  { value: "in", label: "Quero entrar na Feira" },
  { value: "out", label: "Agora não, prefiro estudar no meu canto" },
] as const;

/**
 * Opt-in da Feira **sem nenhuma opção marcada** (DESIGN §6.6, tela 19). O botão fica
 * desabilitado ("Escolha uma opção") até a escolha.
 */
export function LeagueChoice({
  context,
  initial = null,
  submitLabel = "Continuar",
}: {
  context: "onboarding" | "configuracoes";
  /** Escolha atual (Configurações); no onboarding, sempre `null`. */
  initial?: boolean | null;
  submitLabel?: string;
}) {
  const [choice, setChoice] = useState<"in" | "out" | null>(
    initial === null ? null : initial ? "in" : "out",
  );

  return (
    <form action={setLeagueChoice} className="flex flex-1 flex-col gap-3">
      <input type="hidden" name="contexto" value={context} />
      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Participar da Feira</legend>
        {OPTIONS.map((o) => {
          const checked = choice === o.value;
          return (
            <label
              key={o.value}
              className={`bg-surface-200 flex min-h-16 cursor-pointer items-center gap-4 rounded-lg px-4 py-3 font-extrabold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)] ${
                checked ? "bg-primary-soft border-primary border-[3px]" : "border-line border-2"
              }`}
            >
              <input
                type="radio"
                name="feira"
                value={o.value}
                checked={checked}
                onChange={() => setChoice(o.value)}
                className="accent-primary size-6 shrink-0 focus-visible:outline-none"
              />
              {o.label}
            </label>
          );
        })}
      </fieldset>
      {context === "onboarding" && (
        <p className="text-small text-ink-muted">
          Nenhuma opção vem marcada. Dá para mudar quando quiser em Configurações.
        </p>
      )}
      <div className="mt-auto flex flex-col pt-4">
        {choice ? (
          <SubmitButton size="lg" pendingText="Salvando…">
            {submitLabel}
          </SubmitButton>
        ) : (
          <Button size="lg" disabled>
            Escolha uma opção
          </Button>
        )}
      </div>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { checkUsername, saveUsername, type UsernameStatus } from "@/app/(app)/liga/actions";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  normalizeUsernameInput,
  USERNAME_PROBLEM_TEXT,
  usernameProblem,
} from "@/lib/league/username";

type Status = UsernameStatus | "verificando" | "atual" | null;

const STATUS_TEXT: Record<Exclude<Status, null>, string> = {
  disponivel: "Disponível",
  atual: "Seu apelido",
  em_uso: "Já em uso",
  invalido: "Formato inválido",
  verificando: "Verificando…",
};

/**
 * Escolher apelido (telas.md › 24): prefixo "@", validação ao digitar
 * (disponível / já em uso / formato) e "Deixar meu perfil público" desmarcado.
 */
export function UsernameForm({
  initialUsername,
  suggestion,
  initialPublic,
  returnTo,
}: {
  initialUsername: string | null;
  suggestion: string;
  initialPublic: boolean;
  returnTo: string;
}) {
  const [state, dispatch] = useActionState(saveUsername, {});
  const [value, setValue] = useState(initialUsername ?? suggestion);
  const [status, setStatus] = useState<Status>(initialUsername ? "atual" : null);
  const problem = usernameProblem(value);

  useEffect(() => {
    if (problem) return;
    if (value === initialUsername) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setStatus("verificando");
      const result = await checkUsername(value);
      if (!cancelled) setStatus(result);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value, problem, initialUsername]);

  const shown: Status = problem ? "invalido" : status;
  const ok = shown === "disponivel" || shown === "atual";
  const bad = shown === "em_uso" || shown === "invalido";

  return (
    <form action={dispatch} className="flex flex-1 flex-col gap-6" noValidate>
      <input type="hidden" name="depois" value={returnTo} />
      <div className="flex flex-col gap-2">
        <label htmlFor="apelido" className="font-extrabold">
          Apelido
        </label>
        <div
          className={`bg-surface-200 flex min-h-16 items-center gap-1 rounded-lg border-[3px] px-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)] ${
            ok ? "border-primary" : bad ? "border-danger" : "border-control-border"
          }`}
        >
          <span aria-hidden className="text-ink-muted text-xl font-extrabold">
            @
          </span>
          <input
            id="apelido"
            name="apelido"
            value={value}
            onChange={(e) => {
              setValue(normalizeUsernameInput(e.target.value));
              setStatus(null);
            }}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={24}
            aria-describedby="apelido-regra apelido-status"
            aria-invalid={bad || undefined}
            className="text-ink min-w-0 flex-1 bg-transparent text-xl font-extrabold focus-visible:outline-none"
          />
          <span
            id="apelido-status"
            aria-live="polite"
            className={`text-small flex shrink-0 items-center gap-1 font-extrabold ${
              ok ? "text-primary-strong" : bad ? "text-danger" : "text-ink-muted"
            }`}
          >
            {ok && <Check size={18} aria-hidden strokeWidth={3} />}
            {bad && <X size={18} aria-hidden strokeWidth={3} />}
            {shown ? STATUS_TEXT[shown] : ""}
          </span>
        </div>
        <p id="apelido-regra" className="text-small text-ink-muted font-semibold">
          {problem && value.length > 0
            ? `${USERNAME_PROBLEM_TEXT[problem]}.`
            : "De 3 a 20 caracteres: letras minúsculas, números, ponto e _. Dá para mudar depois."}
        </p>
      </div>

      <label className="bg-surface-200 border-line flex cursor-pointer gap-4 rounded-lg border-2 p-5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)]">
        <Checkbox name="publico" defaultChecked={initialPublic} className="mt-0.5" />
        <span className="flex flex-col gap-1">
          <span className="font-extrabold">Deixar meu perfil público</span>
          <span className="text-ink-muted">
            Quem tiver seu apelido pode ver seu nível, sua árvore, a ofensiva, os emblemas e as
            conquistas recentes (como um capítulo concluído, com o nome da disciplina), e seguir
            você. Desmarcado, só o apelido e o XP da semana aparecem na Feira.
          </span>
        </span>
      </label>

      <FormMessage message={state.error} />

      <div className="mt-auto flex flex-col">
        <SubmitButton size="lg" pendingText="Salvando…">
          Salvar apelido
        </SubmitButton>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";
import { saveQuizAnswer } from "@/app/(onboarding)/onboarding/actions";
import { Button } from "@/components/ui/Button";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { ProgressBar } from "@/components/ui/Progress";
import { ONBOARDING_LINES } from "@/lib/mascot/lines";
import {
  QUESTIONS,
  QUESTION_COUNT,
  firstUnanswered,
  optionOrder,
  type Answers,
  type BartleProfile,
} from "@/lib/bartle";
import { OnboardingActions, OnboardingBody } from "./Shell";

/**
 * Quiz de Bartle (tela 17, quiz-bartle.json): 8 perguntas, alternativas embaralhadas
 * (estáveis para a mesma pessoa), resposta guardada a cada pergunta.
 */
export function Quiz({
  initialAnswers,
  seed,
  exitHref,
}: {
  initialAnswers: Answers;
  /** Semente do embaralhamento (id do usuário). */
  seed: string;
  /** Voltar na 1ª pergunta (`null` no onboarding: as boas-vindas já passaram). */
  exitHref: string | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [index, setIndex] = useState(() =>
    Math.min(firstUnanswered(initialAnswers), QUESTION_COUNT - 1),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const question = QUESTIONS[index];
  if (!question) return null;
  const selected = answers[index] ?? null;
  const order = optionOrder(question.id, seed);
  const last = index === QUESTION_COUNT - 1;

  function choose(profile: BartleProfile) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? profile : a)));
  }

  function next() {
    if (!selected) return;
    startTransition(async () => {
      const res = await saveQuizAnswer(index, selected);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setError(null);
      if ("done" in res) router.push("/onboarding/perfil");
      else setIndex((i) => Math.min(i + 1, QUESTION_COUNT - 1));
    });
  }

  const backClasses =
    "text-ink -ml-2.5 inline-grid size-11 shrink-0 place-items-center rounded-full";

  return (
    <OnboardingBody>
      <div className="flex items-center gap-3">
        {index === 0 ? (
          exitHref ? (
            <Link href={exitHref} aria-label="Voltar" className={backClasses}>
              <ChevronLeft size={28} aria-hidden />
            </Link>
          ) : (
            <span aria-hidden className="size-11 shrink-0" />
          )
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            aria-label="Voltar para a pergunta anterior"
            className={backClasses}
          >
            <ChevronLeft size={28} aria-hidden />
          </button>
        )}
        <div className="flex-1">
          <ProgressBar
            percent={((index + 1) / QUESTION_COUNT) * 100}
            color="var(--primary)"
            label="Progresso do quiz"
          />
        </div>
        <p className="text-ink-muted font-extrabold tabular-nums">
          {index + 1} de {QUESTION_COUNT}
        </p>
      </div>

      <MascotBubble>{ONBOARDING_LINES.quiz}</MascotBubble>

      <fieldset key={question.id} className="flex flex-col gap-3">
        <legend className="font-display mb-4 text-[26px] leading-8 font-semibold">
          {question.text}
        </legend>
        {order.map((profile) => {
          const checked = selected === profile;
          return (
            <label
              key={profile}
              className={`bg-surface-200 flex min-h-16 cursor-pointer items-center gap-4 rounded-lg px-4 py-3 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)] ${
                checked
                  ? "bg-primary-soft border-primary border-[3px] font-extrabold"
                  : "border-line border-2 font-semibold"
              }`}
            >
              <input
                type="radio"
                name={`pergunta-${question.id}`}
                value={profile}
                checked={checked}
                onChange={() => choose(profile)}
                className="accent-primary size-6 shrink-0 focus-visible:outline-none"
              />
              <span>{question.options[profile]}</span>
            </label>
          );
        })}
      </fieldset>

      <OnboardingActions>
        <p role="alert" className="text-danger text-small text-center empty:hidden">
          {error}
        </p>
        <Button size="lg" disabled={!selected || pending} onClick={next}>
          {pending ? "Salvando…" : last ? "Ver meu perfil" : "Próxima"}
        </Button>
      </OnboardingActions>
    </OnboardingBody>
  );
}

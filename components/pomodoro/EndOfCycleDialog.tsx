"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import { Counter } from "@/components/ui/Stepper";
import { formatPace } from "@/lib/estimates";
import { PACE_DIVERGENCE } from "@/lib/pace";

function RipeFruit() {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden className="shrink-0">
      <circle cx="32" cy="38" r="22" fill="var(--fruit)" />
      <ellipse
        cx="24"
        cy="30"
        rx="5"
        ry="3.4"
        fill="var(--illo-shine)"
        opacity="0.55"
        transform="rotate(-25 24 30)"
      />
      <path
        fill="var(--subject-folha)"
        d="M32 17c-3-5-8-6-12-4 4 1 6 3 7 5-4 0-7 1-9 4 5-1 9 0 12 2 1-2 2-4 2-5 1 1 2 3 2 5 3-2 7-3 12-2-2-3-5-4-9-4 1-2 3-4 7-5-4-2-9-1-12 4z"
      />
      <rect x="30.6" y="10" width="2.8" height="8" rx="1.4" fill="var(--subject-folha)" />
    </svg>
  );
}

export type EndTopic = {
  title: string;
  /** "p. 68–74" (só livros). */
  predictedLabel: string | null;
};

/**
 * Fim do ciclo (referencias/07-fim-do-ciclo.png): páginas lidas (começam no previsto),
 * "Terminei o tópico" desmarcado, ritmo do ciclo e, só quando a média diverge mais
 * de 20%, a sugestão de recalibrar (DESIGN §4.2).
 */
export function EndOfCycleDialog({
  open,
  subjectTitle,
  focusMin,
  topic,
  predictedPages,
  currentPace,
  breakMin,
  busy,
  error,
  suggestion,
  onConfirm,
  onAnswerSuggestion,
}: {
  open: boolean;
  subjectTitle: string | null;
  focusMin: number;
  topic: EndTopic | null;
  predictedPages: number;
  /** Ritmo usado nas estimativas (min/pág); `null` sem páginas (vídeo ou sessão livre). */
  currentPace: number | null;
  breakMin: number;
  busy: boolean;
  error: string | null;
  /** Média observada que diverge do ritmo atual (depois de enviar as páginas). */
  suggestion: { ema: number; current: number } | null;
  onConfirm: (pages: number, finishTopic: boolean, next: "break" | "skip") => void;
  onAnswerSuggestion: (accept: boolean) => void;
}) {
  const [pages, setPages] = useState(predictedPages);
  const [finish, setFinish] = useState(false);
  const usesPages = currentPace !== null;
  const observed = usesPages && pages > 0 ? focusMin / pages : null;
  const diverges =
    observed !== null &&
    currentPace !== null &&
    Math.abs(observed - currentPace) / currentPace > PACE_DIVERGENCE;

  return (
    <Dialog open={open} onClose={() => {}} dismissible={false} labelledBy="fim-titulo">
      {suggestion ? (
        <div className="flex flex-col gap-4">
          <h2 id="fim-titulo" className="text-title">
            Seu ritmo mudou
          </h2>
          <p className="text-ink-muted">
            Nos últimos ciclos, sua média foi de{" "}
            <strong className="text-ink">{formatPace(suggestion.ema)} por página</strong>. Hoje eu
            uso {formatPace(suggestion.current)} nas estimativas. Quer que eu atualize?
          </p>
          {error && (
            <p role="alert" className="text-small text-danger">
              {error}
            </p>
          )}
          <Button size="lg" onClick={() => onAnswerSuggestion(true)} disabled={busy}>
            Atualizar meu ritmo
          </Button>
          <Button variant="ghost" onClick={() => onAnswerSuggestion(false)} disabled={busy}>
            Manter como está
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <RipeFruit />
            <div className="flex flex-col">
              <h2 id="fim-titulo" className="text-title">
                Fruto colhido!
              </h2>
              <p className="text-ink-muted font-semibold">
                {focusMin} min de foco{subjectTitle ? ` em ${subjectTitle}` : ""}
              </p>
            </div>
          </div>

          {usesPages && (
            <div className="border-line rounded-lg border-2 px-4 py-3">
              <Counter
                label="Páginas lidas"
                value={pages}
                onChange={setPages}
                min={0}
                max={500}
                hint={
                  predictedPages > 0
                    ? `previsto: ${predictedPages}${topic?.predictedLabel ? ` (${topic.predictedLabel})` : ""}`
                    : undefined
                }
              />
            </div>
          )}

          {topic && (
            <label className="bg-primary-soft flex min-h-14 cursor-pointer items-center gap-3 rounded-lg px-4 py-3">
              <Checkbox checked={finish} onChange={(e) => setFinish(e.target.checked)} />
              <span>
                Terminei o tópico <strong className="font-extrabold">{topic.title}</strong>
              </span>
            </label>
          )}

          {observed !== null && (
            <p className="text-small text-ink-muted" aria-live="polite">
              Seu ritmo neste ciclo: {formatPace(observed).replace(" min", "")} min/pág.{" "}
              {diverges
                ? "Vou ajustar a estimativa se isso se repetir."
                : "Bem perto do que eu tinha previsto."}
            </p>
          )}

          {error && (
            <p role="alert" className="text-small text-danger">
              {error}
            </p>
          )}

          <Button size="lg" onClick={() => onConfirm(pages, finish, "break")} disabled={busy}>
            Começar descanso de {breakMin} min
          </Button>
          <Button variant="ghost" onClick={() => onConfirm(pages, finish, "skip")} disabled={busy}>
            Pular descanso
          </Button>
        </div>
      )}
    </Dialog>
  );
}

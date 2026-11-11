"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleTopic } from "@/app/(app)/disciplinas/actions";
import { Checkbox } from "@/components/ui/Checkbox";

/**
 * Linha de tópico inteira clicável. Concluído: `--primary-soft` + riscado.
 * Próximo: `--fruit-soft` + rótulo "PRÓXIMO". Marca na hora (otimista) e confirma no servidor.
 */
export function TopicItem({
  subjectId,
  topicId,
  title,
  done,
  isNext,
  detail,
}: {
  subjectId: string;
  topicId: string;
  title: string;
  done: boolean;
  isNext: boolean;
  /** Ex.: "p. 16–25". */
  detail: string;
}) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(done);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputId = `topico-${topicId}`;

  function onChange(checked: boolean) {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(checked);
      const result = await toggleTopic(subjectId, topicId, checked);
      if (result.error) setError(result.error);
    });
  }

  const tone = optimisticDone ? "bg-primary-soft" : isNext ? "bg-fruit-soft" : "";

  return (
    <div className="flex flex-col">
      <label
        htmlFor={inputId}
        className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-md px-3 py-3 ${tone}`}
      >
        <Checkbox
          id={inputId}
          checked={optimisticDone}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          {isNext && !optimisticDone && <span className="text-caption text-ink">Próximo</span>}
          <span className={optimisticDone ? "text-ink-muted line-through" : ""}>{title}</span>
        </span>
        {detail && <span className="text-small text-ink-muted shrink-0 text-right">{detail}</span>}
      </label>
      {error && (
        <p role="alert" className="text-small text-danger ml-12">
          {error}
        </p>
      )}
    </div>
  );
}

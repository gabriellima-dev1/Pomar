"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleTopic } from "@/app/(app)/disciplinas/actions";

/** Checkbox de tópico: marca na hora (otimista) e confirma no servidor. */
export function TopicCheckbox({
  subjectId,
  topicId,
  title,
  done,
  detail,
}: {
  subjectId: string;
  topicId: string;
  title: string;
  done: boolean;
  /** Ex.: "pp. 10–19 · ~30 min". */
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

  return (
    <div className="flex flex-col">
      <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-center gap-3 py-1.5">
        <input
          id={inputId}
          type="checkbox"
          checked={optimisticDone}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-primary size-5 shrink-0"
        />
        <span className={`flex-1 ${optimisticDone ? "text-muted line-through" : ""}`}>{title}</span>
        <span className="text-muted shrink-0 text-right text-sm">{detail}</span>
      </label>
      {error && (
        <p role="alert" className="text-danger ml-8 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

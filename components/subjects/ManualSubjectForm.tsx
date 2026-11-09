"use client";

import { useActionState, useId, useState } from "react";
import { createManual, type FormState } from "@/app/(app)/disciplinas/actions";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { SubjectFieldsInputs } from "./SubjectFieldsInputs";

type DraftTopic = { key: number; title: string; page_start: string; page_end: string };
type DraftChapter = { key: number; title: string; topics: DraftTopic[] };

let nextKey = 1;
const newTopic = (start = ""): DraftTopic => ({
  key: nextKey++,
  title: "",
  page_start: start,
  page_end: "",
});
const newChapter = (start = ""): DraftChapter => ({
  key: nextKey++,
  title: "",
  topics: [newTopic(start)],
});

/** Página seguinte ao fim do último tópico preenchido (para sugerir no próximo). */
function nextStart(chapters: DraftChapter[]): string {
  for (let c = chapters.length - 1; c >= 0; c--) {
    const topics = chapters[c]!.topics;
    for (let t = topics.length - 1; t >= 0; t--) {
      const end = Number(topics[t]!.page_end);
      if (Number.isInteger(end) && end > 0) return String(end + 1);
    }
  }
  return "";
}

const inputClass =
  "border-border bg-background aria-invalid:border-danger min-h-11 w-full rounded-lg border px-3 text-base";

export function ManualSubjectForm({ defaultColor }: { defaultColor: string }) {
  const [state, dispatch] = useActionState<FormState, FormData>(createManual, {});
  const [chapters, setChapters] = useState<DraftChapter[]>(() => [newChapter("1")]);
  const uid = useId();
  const errors = state.fieldErrors ?? {};

  function updateChapter(ci: number, patch: Partial<DraftChapter>) {
    setChapters((prev) => prev.map((c, i) => (i === ci ? { ...c, ...patch } : c)));
  }
  function updateTopic(ci: number, ti: number, patch: Partial<DraftTopic>) {
    setChapters((prev) =>
      prev.map((c, i) =>
        i === ci
          ? { ...c, topics: c.topics.map((t, j) => (j === ti ? { ...t, ...patch } : t)) }
          : c,
      ),
    );
  }

  const payload = JSON.stringify(
    chapters.map((c) => ({
      title: c.title,
      topics: c.topics.map((t) => ({
        title: t.title,
        page_start: t.page_start,
        page_end: t.page_end,
      })),
    })),
  );

  return (
    <form action={dispatch} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="estrutura" value={payload} />

      <section aria-labelledby={`${uid}-dados`} className="flex flex-col gap-3">
        <h2 id={`${uid}-dados`} className="text-lg font-semibold">
          Sua disciplina
        </h2>
        <SubjectFieldsInputs
          values={state.values ?? { color: defaultColor }}
          errors={state.fieldErrors}
        />
      </section>

      <section aria-labelledby={`${uid}-estrutura`} className="flex flex-col gap-3">
        <h2 id={`${uid}-estrutura`} className="text-lg font-semibold">
          Capítulos e tópicos
        </h2>
        <p className="text-muted text-sm">
          Informe as páginas inicial e final de cada tópico. Elas servem para calcular o progresso e
          o tempo estimado.
        </p>
        {errors.estrutura && <p className="text-danger text-sm">{errors.estrutura}</p>}

        <ol className="flex flex-col gap-4">
          {chapters.map((chapter, ci) => {
            const chapterError = errors[`cap-${ci}`];
            const chapterInput = `${uid}-cap-${chapter.key}`;
            return (
              <li
                key={chapter.key}
                className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-4"
              >
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label htmlFor={chapterInput} className="text-sm font-medium">
                      Capítulo {ci + 1}
                    </label>
                    <input
                      id={chapterInput}
                      value={chapter.title}
                      onChange={(e) => updateChapter(ci, { title: e.target.value })}
                      maxLength={200}
                      placeholder="Ex.: Introdução"
                      aria-invalid={chapterError ? true : undefined}
                      aria-describedby={chapterError ? `${chapterInput}-erro` : undefined}
                      className={inputClass}
                    />
                  </div>
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setChapters((prev) => prev.filter((_, i) => i !== ci))}
                      className="text-danger min-h-11 rounded-lg px-3 text-sm font-medium"
                    >
                      Remover<span className="sr-only"> capítulo {ci + 1}</span>
                    </button>
                  )}
                </div>
                {chapterError && (
                  <p id={`${chapterInput}-erro`} className="text-danger text-sm">
                    {chapterError}
                  </p>
                )}

                <ol className="flex flex-col gap-3">
                  {chapter.topics.map((topic, ti) => {
                    const topicError = errors[`top-${ci}-${ti}`];
                    const base = `${uid}-top-${topic.key}`;
                    return (
                      <li key={topic.key} className="flex flex-col gap-1.5">
                        <fieldset
                          className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:grid-cols-[1fr_6rem_6rem_auto]"
                          aria-describedby={topicError ? `${base}-erro` : undefined}
                        >
                          <legend className="sr-only">
                            Tópico {ti + 1} do capítulo {ci + 1}
                          </legend>
                          <div className="col-span-3 flex flex-col gap-1.5 sm:col-span-1">
                            <label htmlFor={`${base}-t`} className="text-sm">
                              Tópico {ci + 1}.{ti + 1}
                            </label>
                            <input
                              id={`${base}-t`}
                              value={topic.title}
                              onChange={(e) => updateTopic(ci, ti, { title: e.target.value })}
                              maxLength={200}
                              aria-invalid={topicError ? true : undefined}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor={`${base}-i`} className="text-sm">
                              Pág. inicial
                            </label>
                            <input
                              id={`${base}-i`}
                              inputMode="numeric"
                              value={topic.page_start}
                              onChange={(e) => updateTopic(ci, ti, { page_start: e.target.value })}
                              aria-invalid={topicError ? true : undefined}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor={`${base}-f`} className="text-sm">
                              Pág. final
                            </label>
                            <input
                              id={`${base}-f`}
                              inputMode="numeric"
                              value={topic.page_end}
                              onChange={(e) => updateTopic(ci, ti, { page_end: e.target.value })}
                              aria-invalid={topicError ? true : undefined}
                              className={inputClass}
                            />
                          </div>
                          <button
                            type="button"
                            disabled={chapter.topics.length === 1}
                            onClick={() =>
                              updateChapter(ci, {
                                topics: chapter.topics.filter((_, j) => j !== ti),
                              })
                            }
                            className="text-muted hover:text-danger flex size-11 items-center justify-center rounded-lg disabled:opacity-30"
                          >
                            <span aria-hidden>✕</span>
                            <span className="sr-only">
                              Remover tópico {ci + 1}.{ti + 1}
                            </span>
                          </button>
                        </fieldset>
                        {topicError && (
                          <p id={`${base}-erro`} className="text-danger text-sm">
                            {topicError}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>

                <button
                  type="button"
                  onClick={() =>
                    updateChapter(ci, {
                      topics: [...chapter.topics, newTopic(nextStart(chapters.slice(0, ci + 1)))],
                    })
                  }
                  className="text-primary min-h-11 self-start rounded-lg px-2 text-sm font-medium"
                >
                  + Adicionar tópico
                </button>
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={() => setChapters((prev) => [...prev, newChapter(nextStart(prev))])}
          className="border-border min-h-11 self-start rounded-lg border px-4 text-sm font-semibold"
        >
          + Adicionar capítulo
        </button>
      </section>

      <div className="flex flex-col gap-3">
        <FormMessage message={state.error} />
        <SubmitButton pendingText="Criando…">Criar disciplina</SubmitButton>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createFromCatalog, type FormState } from "@/app/(app)/disciplinas/actions";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { formatDuration, pomodorosFor, topicPages } from "@/lib/estimates";
import { SubjectFieldsInputs } from "./SubjectFieldsInputs";

type Topic = { id: string; title: string; page_start: number; page_end: number };
type Chapter = { id: string; title: string; topics: Topic[] };

function ChapterCheckbox({
  chapter,
  selected,
  onToggle,
}: {
  chapter: Chapter;
  selected: Set<string>;
  onToggle: (ids: string[], checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const count = chapter.topics.filter((t) => selected.has(t.id)).length;
  const all = count === chapter.topics.length;
  const some = count > 0 && !all;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some;
  }, [some]);

  const pages = chapter.topics.reduce((n, t) => n + topicPages(t), 0);
  return (
    <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-3 py-2">
      <input
        ref={ref}
        type="checkbox"
        checked={all}
        onChange={(e) =>
          onToggle(
            chapter.topics.map((t) => t.id),
            e.target.checked,
          )
        }
        className="accent-primary size-5 shrink-0"
      />
      <span className="flex-1 font-semibold">{chapter.title}</span>
      <span className="text-muted shrink-0 text-sm">
        {count > 0 ? `${count}/${chapter.topics.length} · ` : ""}
        {pages} p.
      </span>
    </label>
  );
}

export function CatalogPicker({
  book,
  chapters,
  minPerPage,
  focusMin,
  defaultColor,
}: {
  book: { id: string; title: string };
  chapters: Chapter[];
  minPerPage: number;
  focusMin: number;
  defaultColor: string;
}) {
  const [state, dispatch] = useActionState<FormState, FormData>(createFromCatalog, {});
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pagesById = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of chapters) for (const t of c.topics) map.set(t.id, topicPages(t));
    return map;
  }, [chapters]);

  const totalPages = [...selected].reduce((n, id) => n + (pagesById.get(id) ?? 0), 0);
  const minutes = totalPages * minPerPage;

  function toggle(ids: string[], checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  return (
    <form action={dispatch} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="bookId" value={book.id} />
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="topico" value={id} />
      ))}

      <section aria-labelledby="escolha-topicos" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="escolha-topicos" className="text-lg font-semibold">
            O que você vai estudar?
          </h2>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              className="text-primary min-h-11 px-2 font-medium underline-offset-4 hover:underline"
              onClick={() => toggle([...pagesById.keys()], true)}
            >
              Marcar tudo
            </button>
            <button
              type="button"
              className="text-muted min-h-11 px-2 font-medium underline-offset-4 hover:underline"
              onClick={() => setSelected(new Set())}
            >
              Limpar
            </button>
          </div>
        </div>

        <ul className="border-border bg-surface divide-border divide-y rounded-xl border">
          {chapters.map((chapter) => {
            const open = expanded.has(chapter.id);
            const listId = `topicos-${chapter.id}`;
            return (
              <li key={chapter.id} className="px-3">
                <div className="flex items-center gap-1">
                  <ChapterCheckbox chapter={chapter} selected={selected} onToggle={toggle} />
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={listId}
                    onClick={() => toggleExpanded(chapter.id)}
                    className="text-muted hover:text-foreground flex size-11 shrink-0 items-center justify-center rounded-lg"
                  >
                    <span
                      aria-hidden
                      className={`transition-transform motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
                    >
                      ▸
                    </span>
                    <span className="sr-only">
                      {open ? "Esconder" : "Mostrar"} tópicos de {chapter.title}
                    </span>
                  </button>
                </div>
                <ul id={listId} hidden={!open} className="mb-2 ml-8 flex flex-col">
                  {chapter.topics.map((t) => (
                    <li key={t.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 py-1">
                        <input
                          type="checkbox"
                          checked={selected.has(t.id)}
                          onChange={(e) => toggle([t.id], e.target.checked)}
                          className="accent-primary size-5 shrink-0"
                        />
                        <span className="flex-1">{t.title}</span>
                        <span className="text-muted shrink-0 text-sm">
                          pp. {t.page_start}–{t.page_end}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="dados-disciplina" className="flex flex-col gap-3">
        <h2 id="dados-disciplina" className="text-lg font-semibold">
          Sua disciplina
        </h2>
        <SubjectFieldsInputs
          values={state.values ?? { title: book.title, color: defaultColor }}
          errors={state.fieldErrors}
        />
      </section>

      <div
        className="border-border bg-surface sticky bottom-0 -mx-4 flex flex-col gap-3 border-t px-4 py-3 sm:mx-0 sm:rounded-xl sm:border"
        aria-live="polite"
      >
        <p className="text-sm">
          {selected.size === 0 ? (
            "Nenhum tópico marcado ainda."
          ) : (
            <>
              <strong>{selected.size}</strong> {selected.size === 1 ? "tópico" : "tópicos"} ·{" "}
              <strong>{totalPages}</strong> páginas · cerca de{" "}
              <strong>{formatDuration(minutes)}</strong> ({pomodorosFor(minutes, focusMin)}{" "}
              pomodoros)
            </>
          )}
        </p>
        <FormMessage message={state.error} />
        <SubmitButton pendingText="Criando…">Criar disciplina</SubmitButton>
      </div>
    </form>
  );
}

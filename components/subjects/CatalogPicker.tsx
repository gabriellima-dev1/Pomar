"use client";

import { useActionState, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { createFromCatalog, type FormState } from "@/app/(app)/disciplinas/actions";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { formatPace, topicPages } from "@/lib/estimates";
import { subjectColorVar } from "@/lib/subjects/colors";
import { bookInitials, chapterLabel, shortAuthors } from "@/lib/subjects/summary";
import { CalibrationFields } from "./CalibrationFields";
import { SubjectFieldsInputs } from "./SubjectFieldsInputs";

type Topic = { id: string; title: string; page_start: number; page_end: number };
type Chapter = { id: string; title: string; topics: Topic[] };

export type PickerBook = {
  id: string;
  title: string;
  authors: string;
  edition: string;
  verified: boolean;
  chapters: Chapter[];
};

/** Quantos capítulos aparecem antes de "Ver os N capítulos". */
const PREVIEW = 5;

export function BookCover({ authors, color }: { authors: string; color: string }) {
  return (
    <span
      aria-hidden
      className="text-on-subject grid h-14 w-11 shrink-0 place-items-center rounded-sm text-[13px] font-extrabold"
      style={{ backgroundColor: subjectColorVar(color) }}
    >
      {bookInitials(authors)}
    </span>
  );
}

export function ApproxBadge() {
  return (
    <span className="border-control-border text-ink-muted rounded-full border px-2 py-0.5 text-xs font-extrabold whitespace-nowrap">
      pág. aprox.
    </span>
  );
}

function ChapterRow({
  chapter,
  selected,
  onToggle,
}: {
  chapter: Chapter;
  selected: Set<string>;
  onToggle: (ids: string[], checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const count = chapter.topics.filter((t) => selected.has(t.id)).length;
  const all = count > 0 && count === chapter.topics.length;
  const some = count > 0 && !all;
  const pages = chapter.topics.reduce((n, t) => n + topicPages(t), 0);
  const listId = `topicos-${chapter.id}`;

  return (
    <li className="flex flex-col">
      <div className="flex items-center gap-1">
        <label className="flex min-h-14 flex-1 cursor-pointer items-center gap-3 py-2">
          <Checkbox
            checked={all}
            ref={(el) => {
              if (el) el.indeterminate = some;
            }}
            onChange={(e) =>
              onToggle(
                chapter.topics.map((t) => t.id),
                e.target.checked,
              )
            }
          />
          <span className={`flex-1 ${count > 0 ? "font-extrabold" : ""}`}>
            {chapterLabel(chapter.title)}
          </span>
          <span className="text-small text-ink-muted shrink-0">
            {some ? `${count}/${chapter.topics.length} · ` : ""}
            {pages} pág.
          </span>
        </label>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className="text-ink-muted hover:text-ink grid size-11 shrink-0 place-items-center rounded-full"
        >
          <ChevronDown
            size={20}
            aria-hidden
            className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
          <span className="sr-only">
            {open ? "Esconder" : "Escolher"} tópicos de {chapter.title}
          </span>
        </button>
      </div>
      <ul id={listId} hidden={!open} className="mb-2 ml-9 flex flex-col">
        {chapter.topics.map((t) => (
          <li key={t.id}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 py-1">
              <Checkbox
                checked={selected.has(t.id)}
                onChange={(e) => onToggle([t.id], e.target.checked)}
              />
              <span className="flex-1">{t.title}</span>
              <span className="text-small text-ink-muted shrink-0">
                p. {t.page_start}–{t.page_end}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </li>
  );
}

/**
 * Nova disciplina pelo catálogo em 2 passos (referencias/03 e 04):
 * escolher capítulos → calibrar (ou pular) → criar.
 */
export function CatalogPicker({
  book,
  defaultColor,
  globalPace,
}: {
  book: PickerBook;
  defaultColor: string;
  globalPace: number | null;
}) {
  const [state, dispatch] = useActionState<FormState, FormData>(createFromCatalog, {});
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const pagesById = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of book.chapters) for (const t of c.topics) map.set(t.id, topicPages(t));
    return map;
  }, [book.chapters]);

  const totalPages = [...selected].reduce((n, id) => n + (pagesById.get(id) ?? 0), 0);
  const chaptersChosen = book.chapters.filter((c) =>
    c.topics.some((t) => selected.has(t.id)),
  ).length;
  const visible = showAll ? book.chapters : book.chapters.slice(0, PREVIEW);
  // Erros de campo (nome, data) são do passo 1; erros de calibração ficam no passo 2.
  const currentStep = state.fieldErrors ? 1 : step;

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

  const summary =
    selected.size === 0
      ? "Nenhum capítulo escolhido"
      : `${chaptersChosen} ${chaptersChosen === 1 ? "capítulo" : "capítulos"} · ${totalPages} páginas`;

  return (
    <form action={dispatch} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="bookId" value={book.id} />
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="topico" value={id} />
      ))}

      {/* Passo 1 fica montado (escondido) para não perder o que foi digitado. */}
      <div hidden={currentStep !== 1} className="flex flex-col gap-5">
        <section
          aria-labelledby="livro-escolhido"
          className="bg-surface-200 border-primary shadow-card flex flex-col gap-4 rounded-lg border-2 p-4"
        >
          <div className="flex items-center gap-3">
            <BookCover authors={book.authors} color={defaultColor} />
            <div className="flex min-w-0 flex-col">
              <h2 id="livro-escolhido" className="text-heading">
                {book.title}
              </h2>
              <p className="text-small text-ink-muted flex flex-wrap items-center gap-x-2">
                {shortAuthors(book.authors, true)} · {book.edition} · {book.chapters.length}{" "}
                capítulos
                {!book.verified && <ApproxBadge />}
              </p>
            </div>
          </div>
          <p className="bg-surface-100 text-small text-ink-muted rounded-md px-4 py-3">
            Escolha os capítulos que entram na sua disciplina. Você pode mudar depois.
          </p>
          <ul className="flex flex-col">
            {visible.map((chapter) => (
              <ChapterRow
                key={chapter.id}
                chapter={chapter}
                selected={selected}
                onToggle={toggle}
              />
            ))}
          </ul>
          {book.chapters.length > PREVIEW && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-primary min-h-11 font-extrabold"
            >
              {showAll ? "Mostrar menos" : `Ver os ${book.chapters.length} capítulos`}
            </button>
          )}
        </section>

        <section
          aria-labelledby="dados-disciplina"
          className={`${cardClasses} flex flex-col gap-4 p-4`}
        >
          <h2 id="dados-disciplina" className="text-heading">
            Sua disciplina
          </h2>
          <SubjectFieldsInputs
            values={state.values ?? { title: book.title, color: defaultColor }}
            errors={state.fieldErrors}
          />
        </section>

        {currentStep === 1 && (
          <StickyFooter summary={<span aria-live="polite">{summary}</span>}>
            <FormMessage message={state.fieldErrors ? undefined : state.error} />
            <Button size="lg" disabled={selected.size === 0} onClick={() => setStep(2)}>
              Continuar
            </Button>
          </StickyFooter>
        )}
      </div>

      {currentStep === 2 && (
        <div className="flex flex-col gap-5">
          <div className="flex min-h-14 items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              aria-label="Voltar para a escolha dos capítulos"
              className="text-ink -ml-2.5 grid size-11 place-items-center rounded-full"
            >
              <ChevronLeft size={28} aria-hidden />
            </button>
            <p className="text-small text-ink-muted font-extrabold">Passo 2 de 2</p>
          </div>
          <h2 className="text-display">Quanto tempo você leva por página?</h2>
          <MascotBubble>
            Abra o livro, aperte o play e leia normalmente. Com isso eu estimo quanto falta para
            terminar.
          </MascotBubble>
          <CalibrationFields error={state.error} />
          <SubmitButton
            name="calibracao"
            value="pular"
            variant="ghost"
            pendingText="Criando…"
            className="self-center"
          >
            {globalPace !== null
              ? `Usar meu ritmo padrão (${formatPace(globalPace)}/pág)`
              : "Pular por agora"}
          </SubmitButton>
          <StickyFooter>
            <SubmitButton name="calibracao" value="sim" size="lg" pendingText="Criando…">
              Salvar e criar disciplina
            </SubmitButton>
          </StickyFooter>
        </div>
      )}
    </form>
  );
}

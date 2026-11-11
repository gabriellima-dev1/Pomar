import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/forms/ActionForm";
import { TopBar } from "@/components/ui/TopBar";
import {
  ConfirmSubmitButton,
  DeleteSubjectForm,
  SubjectEditForm,
} from "@/components/subjects/EditForms";
import { getSubject } from "@/lib/subjects/queries";
import { isUuid } from "@/lib/subjects/validation";
import {
  addChapter,
  addTopic,
  deleteChapter,
  deleteTopic,
  moveChapter,
  moveTopic,
  renameChapter,
  updateTopic,
} from "../../actions";

export const metadata: Metadata = { title: "Editar disciplina" };

const input =
  "border-control-border bg-surface-200 text-ink aria-invalid:border-danger min-h-12 w-full rounded-md border-2 px-4 text-base";
const iconButton =
  "border-control-border hover:bg-surface-300 flex size-11 shrink-0 items-center justify-center rounded-md border text-sm disabled:opacity-30";
const saveButton =
  "border-control-border text-primary min-h-11 shrink-0 rounded-md border px-3 text-sm font-extrabold";

export default async function EditarPage({ params }: PageProps<"/disciplinas/[id]/editar">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const subject = await getSubject(id);
  if (!subject) notFound();

  const hidden = <input type="hidden" name="subjectId" value={subject.id} />;

  return (
    <section className="flex flex-col gap-6">
      <TopBar
        backHref={`/disciplinas/${subject.id}`}
        backLabel={`Voltar para ${subject.title}`}
        title={<h1 className="text-title">Editar disciplina</h1>}
      />

      <section aria-labelledby="dados" className="flex flex-col gap-3">
        <h2 id="dados" className="text-heading">
          Dados
        </h2>
        <SubjectEditForm
          subjectId={subject.id}
          values={{
            title: subject.title,
            color: subject.color,
            goalDate: subject.goal_date,
            dailyGoal: subject.daily_goal,
          }}
        />
      </section>

      <section aria-labelledby="estrutura" className="flex flex-col gap-3">
        <h2 id="estrutura" className="text-heading">
          Capítulos e tópicos
        </h2>
        <p className="text-ink-muted text-sm">
          Corrija títulos e páginas, mude a ordem com as setas ou remova o que não vai estudar.
        </p>

        <ol className="flex flex-col gap-4">
          {subject.chapters.map((chapter, ci) => (
            <li
              key={chapter.id}
              className="border-line bg-surface-200 shadow-card flex flex-col gap-3 rounded-lg border-2 p-4"
            >
              <ActionForm
                action={renameChapter}
                label={`Capítulo ${ci + 1}`}
                className="flex flex-wrap items-end gap-2"
              >
                {hidden}
                <input type="hidden" name="id" value={chapter.id} />
                <div className="flex min-w-48 flex-1 flex-col gap-1.5">
                  <label htmlFor={`cap-${chapter.id}`} className="font-extrabold">
                    Capítulo {ci + 1}
                  </label>
                  <input
                    id={`cap-${chapter.id}`}
                    name="title"
                    defaultValue={chapter.title}
                    maxLength={200}
                    className={input}
                  />
                </div>
                <button type="submit" className={saveButton}>
                  Salvar
                </button>
                <button
                  type="submit"
                  formAction={moveChapter}
                  name="dir"
                  value="up"
                  disabled={ci === 0}
                  className={iconButton}
                >
                  <span aria-hidden>↑</span>
                  <span className="sr-only">Subir capítulo {ci + 1}</span>
                </button>
                <button
                  type="submit"
                  formAction={moveChapter}
                  name="dir"
                  value="down"
                  disabled={ci === subject.chapters.length - 1}
                  className={iconButton}
                >
                  <span aria-hidden>↓</span>
                  <span className="sr-only">Descer capítulo {ci + 1}</span>
                </button>
                <ConfirmSubmitButton
                  formAction={deleteChapter}
                  message={`Excluir o capítulo “${chapter.title}” e todos os tópicos dele?`}
                  className="text-danger min-h-11 rounded-md px-2 font-extrabold"
                >
                  Excluir<span className="sr-only"> capítulo {ci + 1}</span>
                </ConfirmSubmitButton>
              </ActionForm>

              <ol
                className="flex flex-col gap-3 border-l-2 pl-3"
                style={{ borderColor: "var(--border)" }}
              >
                {chapter.topics.map((t, ti) => (
                  <li key={t.id}>
                    <ActionForm
                      action={updateTopic}
                      label={`Tópico ${ci + 1}.${ti + 1}`}
                      className="grid grid-cols-[1fr_1fr] items-end gap-2 sm:grid-cols-[1fr_5.5rem_5.5rem_auto]"
                    >
                      {hidden}
                      <input type="hidden" name="id" value={t.id} />
                      <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                        <label htmlFor={`top-${t.id}`} className="text-sm">
                          Tópico {ci + 1}.{ti + 1}
                        </label>
                        <input
                          id={`top-${t.id}`}
                          name="title"
                          defaultValue={t.title}
                          maxLength={200}
                          className={input}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor={`ini-${t.id}`} className="text-sm">
                          Pág. inicial
                        </label>
                        <input
                          id={`ini-${t.id}`}
                          name="pageStart"
                          inputMode="numeric"
                          defaultValue={t.page_start ?? ""}
                          className={input}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor={`fim-${t.id}`} className="text-sm">
                          Pág. final
                        </label>
                        <input
                          id={`fim-${t.id}`}
                          name="pageEnd"
                          inputMode="numeric"
                          defaultValue={t.page_end ?? ""}
                          className={input}
                        />
                      </div>
                      <div className="col-span-2 flex gap-2 sm:col-span-1">
                        <button type="submit" className={saveButton}>
                          Salvar
                        </button>
                        <button
                          type="submit"
                          formAction={moveTopic}
                          name="dir"
                          value="up"
                          disabled={ti === 0}
                          className={iconButton}
                        >
                          <span aria-hidden>↑</span>
                          <span className="sr-only">
                            Subir tópico {ci + 1}.{ti + 1}
                          </span>
                        </button>
                        <button
                          type="submit"
                          formAction={moveTopic}
                          name="dir"
                          value="down"
                          disabled={ti === chapter.topics.length - 1}
                          className={iconButton}
                        >
                          <span aria-hidden>↓</span>
                          <span className="sr-only">
                            Descer tópico {ci + 1}.{ti + 1}
                          </span>
                        </button>
                        <ConfirmSubmitButton
                          formAction={deleteTopic}
                          message={`Excluir o tópico “${t.title}”?`}
                          className={`${iconButton} text-danger`}
                        >
                          <span aria-hidden>✕</span>
                          <span className="sr-only">
                            Excluir tópico {ci + 1}.{ti + 1}
                          </span>
                        </ConfirmSubmitButton>
                      </div>
                    </ActionForm>
                  </li>
                ))}

                <li>
                  <ActionForm
                    action={addTopic}
                    label={`Novo tópico no capítulo ${ci + 1}`}
                    className="grid grid-cols-[1fr_1fr] items-end gap-2 sm:grid-cols-[1fr_5.5rem_5.5rem_auto]"
                  >
                    {hidden}
                    <input type="hidden" name="chapterId" value={chapter.id} />
                    <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                      <label htmlFor={`novo-${chapter.id}`} className="text-sm">
                        Novo tópico
                      </label>
                      <input
                        id={`novo-${chapter.id}`}
                        name="title"
                        maxLength={200}
                        className={input}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`novo-ini-${chapter.id}`} className="text-sm">
                        Pág. inicial
                      </label>
                      <input
                        id={`novo-ini-${chapter.id}`}
                        name="pageStart"
                        inputMode="numeric"
                        className={input}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`novo-fim-${chapter.id}`} className="text-sm">
                        Pág. final
                      </label>
                      <input
                        id={`novo-fim-${chapter.id}`}
                        name="pageEnd"
                        inputMode="numeric"
                        className={input}
                      />
                    </div>
                    <button type="submit" className={`${saveButton} col-span-2 sm:col-span-1`}>
                      Adicionar
                    </button>
                  </ActionForm>
                </li>
              </ol>
            </li>
          ))}
        </ol>

        <ActionForm
          action={addChapter}
          label="Novo capítulo"
          className="flex flex-wrap items-end gap-2"
        >
          {hidden}
          <div className="flex min-w-48 flex-1 flex-col gap-1.5">
            <label htmlFor="novo-capitulo" className="font-extrabold">
              Novo capítulo
            </label>
            <input id="novo-capitulo" name="title" maxLength={200} className={input} />
          </div>
          <button type="submit" className={saveButton}>
            Adicionar capítulo
          </button>
        </ActionForm>
      </section>

      <section
        aria-labelledby="excluir"
        className="border-danger/40 flex flex-col gap-3 rounded-lg border p-4"
      >
        <h2 id="excluir" className="text-heading">
          Excluir disciplina
        </h2>
        <p className="text-ink-muted text-sm">
          Isso apaga a disciplina, os capítulos, os tópicos e o progresso marcado. Não dá para
          desfazer.
        </p>
        <DeleteSubjectForm subjectId={subject.id} title={subject.title} />
      </section>
    </section>
  );
}

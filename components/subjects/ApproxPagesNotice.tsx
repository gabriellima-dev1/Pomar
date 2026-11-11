/** Aviso para livros do catálogo ainda não conferidos (`verified = false`, DESIGN.md §7). */
export function ApproxPagesNotice() {
  return (
    <p className="bg-surface-300 text-small text-ink-muted rounded-md px-4 py-3">
      <strong className="text-ink font-extrabold">Páginas aproximadas.</strong> Ainda estamos
      conferindo o sumário desta edição. Se algum número não bater com o seu livro, você pode
      corrigir na edição da disciplina.
    </p>
  );
}

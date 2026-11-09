/** Aviso para livros do catálogo ainda não conferidos (`verified = false`, DESIGN.md §7). */
export function ApproxPagesNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="border-border text-muted rounded-full border px-2 py-0.5 text-xs font-medium">
        páginas aproximadas
      </span>
    );
  }
  return (
    <p className="border-border bg-surface text-muted rounded-lg border px-3 py-2 text-sm">
      <strong className="text-foreground">Páginas aproximadas.</strong> Ainda estamos conferindo o
      sumário desta edição. Se algum número não bater com o seu livro, você pode corrigir na edição
      da disciplina.
    </p>
  );
}

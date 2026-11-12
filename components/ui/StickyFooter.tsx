import type { ReactNode } from "react";

/**
 * Rodapé fixo com a ação principal da tela (Disciplina, Nova disciplina, Calibrar).
 * Só aparece em telas internas (sem BottomNav); a página reserva o espaço com `pb-40`.
 */
export function StickyFooter({ summary, children }: { summary?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-surface-100 border-line fixed inset-x-0 bottom-0 z-20 border-t lg:left-60">
      <div className="max-w-app mx-auto flex w-full flex-col gap-2 px-4 pt-3 pb-4">
        {summary && <p className="text-small text-ink-muted text-center">{summary}</p>}
        {children}
      </div>
    </div>
  );
}

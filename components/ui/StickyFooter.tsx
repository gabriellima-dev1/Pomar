import type { ReactNode } from "react";

/**
 * Rodapé fixo com a ação principal da tela (Disciplina, Nova disciplina, Calibrar).
 * Só aparece em telas internas (sem BottomNav). Reserva o próprio espaço no fim da
 * página (o espaçador abaixo), para o último item da lista não ficar escondido atrás
 * dele — no computador o respiro do layout é menor que no celular.
 */
export function StickyFooter({ summary, children }: { summary?: ReactNode; children: ReactNode }) {
  return (
    <>
      <div aria-hidden className="h-12 shrink-0 lg:h-28" />
      <div className="bg-surface-100 border-line fixed inset-x-0 bottom-0 z-20 border-t lg:left-60">
        <div className="max-w-app mx-auto flex w-full flex-col gap-2 px-4 pt-3 pb-4">
          {summary && <p className="text-small text-ink-muted text-center">{summary}</p>}
          {children}
        </div>
      </div>
    </>
  );
}

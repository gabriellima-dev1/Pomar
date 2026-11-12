"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Diálogo do design system: folha que sobe do rodapé, véu `--scrim`, `--shadow-dialog`.
 * Usa `<dialog>` nativo (foco preso, Esc fecha). `variant="card"` é a versão flutuante
 * com margens (pop-up de pausa).
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  variant = "sheet",
  dismissible = true,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** id do título do diálogo. */
  labelledBy: string;
  variant?: "sheet" | "card";
  /** `false` impede fechar com Esc ou clicando no véu (a pessoa escolhe uma das ações). */
  dismissible?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // A partir de 1024px, folha e card viram diálogo centralizado de até 480px com os 4
  // cantos arredondados (telas.md › Computador e tablet).
  const centered = "lg:inset-0 lg:m-auto lg:h-fit lg:w-full lg:max-w-[480px] lg:rounded-lg";
  const shape =
    variant === "sheet"
      ? `inset-x-0 bottom-0 mx-auto w-full max-w-app rounded-t-lg px-4 pt-3 pb-6 lg:px-6 lg:pt-6 ${centered}`
      : `inset-x-4 bottom-4 mx-auto w-[calc(100%-2rem)] max-w-[calc(var(--screen-max)-2rem)] rounded-lg px-6 pt-6 pb-6 ${centered}`;

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
      className={`bg-surface-200 text-ink shadow-dialog backdrop:bg-scrim fixed top-auto m-0 max-h-[90dvh] overflow-y-auto ${shape} open:animate-[sheet-up_200ms_ease-out]`}
    >
      {variant === "sheet" && (
        <div aria-hidden className="bg-line mx-auto mb-4 h-1.5 w-10 rounded-full lg:hidden" />
      )}
      {children}
    </dialog>
  );
}

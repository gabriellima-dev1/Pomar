"use client";

import { Star } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pílula `--ink` com texto `--surface-100` e ícone em círculo `--reward`; some em 3s.
 * Usa a Popover API para ficar acima de um diálogo aberto (camada superior).
 */
export function Toast({
  open,
  onDone,
  title,
  children,
}: {
  open: boolean;
  onDone: () => void;
  title: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!open) return;
    try {
      el?.showPopover?.();
    } catch {
      // Sem Popover API: aparece como elemento fixo comum.
    }
    const id = window.setTimeout(onDone, 3000);
    return () => {
      window.clearTimeout(id);
      try {
        el?.hidePopover?.();
      } catch {
        // Já estava fechado.
      }
    };
  }, [open, onDone]);

  return (
    <div
      ref={ref}
      popover="manual"
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-6 m-0 flex w-full justify-center border-0 bg-transparent p-0 px-4 [&:not(:popover-open)]:flex"
    >
      {open && (
        <div className="bg-ink text-surface-100 shadow-dialog flex animate-[sheet-up_200ms_ease-out] items-center gap-3 rounded-full py-2.5 pr-6 pl-2.5">
          <span className="bg-reward text-on-reward grid size-10 place-items-center rounded-full">
            <Star size={20} aria-hidden fill="currentColor" strokeWidth={0} />
          </span>
          <span className="flex flex-col">
            <strong className="font-extrabold">{title}</strong>
            {children && <span className="text-small opacity-90">{children}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

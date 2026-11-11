"use client";

import { Star } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/** Pílula `--ink` com texto `--surface-100` e ícone em círculo `--reward`; some em 3s. */
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
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onDone, 3000);
    return () => window.clearTimeout(id);
  }, [open, onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4"
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

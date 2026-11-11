import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
import type { ReactNode } from "react";

/** Barra do topo das telas internas: voltar (ou fechar), título opcional e ações à direita. */
export function TopBar({
  backHref,
  backLabel,
  icon = "voltar",
  title,
  children,
}: {
  backHref: string;
  /** Nome acessível do botão de voltar, ex.: "Voltar para Disciplinas". */
  backLabel: string;
  icon?: "voltar" | "fechar";
  title?: ReactNode;
  children?: ReactNode;
}) {
  const Icon = icon === "fechar" ? X : ChevronLeft;
  return (
    <div className="flex min-h-14 items-center gap-2">
      <Link
        href={backHref}
        aria-label={backLabel}
        className="text-ink -ml-2.5 inline-grid size-11 shrink-0 place-items-center rounded-full"
      >
        <Icon size={28} aria-hidden />
      </Link>
      {title && <div className="min-w-0 flex-1">{title}</div>}
      {children && <div className="ml-auto flex items-center gap-1">{children}</div>}
    </div>
  );
}

/** Botão/link de ícone de 44px para a TopBar. */
export const iconButtonClasses =
  "text-ink inline-grid size-11 place-items-center rounded-full hover:bg-surface-300";

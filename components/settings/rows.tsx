import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Peças das Configurações (referencias/31): seções em cards `--surface-200` com linhas
 * de 60px (rótulo 800 + valor em `--ink-muted` + chevron), separadas por `--surface-300`.
 */

export const rowClasses =
  "flex min-h-[60px] w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface-100/60";

export function SettingsSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="text-caption text-ink-muted px-1">
        {title}
      </h2>
      <ul className="bg-surface-200 divide-surface-300 shadow-card flex flex-col divide-y-2 overflow-hidden rounded-lg">
        {children}
      </ul>
    </section>
  );
}

export function RowText({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="font-extrabold">{label}</span>
      {value && <span className="text-small text-ink-muted">{value}</span>}
    </span>
  );
}

/** Linha que abre outra tela. */
export function RowLink({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value?: ReactNode;
}) {
  return (
    <li>
      <Link href={href} className={rowClasses}>
        <RowText label={label} value={value} />
        <ChevronRight size={22} aria-hidden className="text-ink-muted shrink-0" />
      </Link>
    </li>
  );
}

/** Linha só de leitura. */
export function RowStatic({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <li className={rowClasses}>
      <RowText label={label} value={value} />
    </li>
  );
}

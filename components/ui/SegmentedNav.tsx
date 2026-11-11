import Link from "next/link";

/**
 * Controle segmentado em forma de navegação (cada opção é uma rota).
 * Trilho `--surface-300`; ativa em `--surface-200` + `--shadow-card`.
 */
export function SegmentedNav({
  label,
  items,
}: {
  label: string;
  items: { label: string; href?: string; active?: boolean; hint?: string }[];
}) {
  return (
    <nav
      aria-label={label}
      className="bg-surface-300 grid auto-cols-fr grid-flow-col gap-1 rounded-lg p-1"
    >
      {items.map((item) => {
        const cls =
          "flex min-h-11 flex-col items-center justify-center rounded-[20px] px-2 text-center font-extrabold";
        if (!item.href) {
          return (
            <span key={item.label} aria-disabled className={`${cls} text-ink-muted opacity-70`}>
              {item.label}
              {item.hint && (
                <span className="text-[11px] leading-3 font-semibold">{item.hint}</span>
              )}
            </span>
          );
        }
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`${cls} ${item.active ? "bg-surface-200 text-ink shadow-card" : "text-ink-muted hover:text-ink"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

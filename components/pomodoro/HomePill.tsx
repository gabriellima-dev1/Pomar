import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Saída do Foco: pílula de vidro "Início" no canto superior esquerdo, em todos os
 * estados, no celular e no computador (telas.md › Foco, 35, 37 e 38). Sair não pausa.
 */
export function HomePill() {
  return (
    <Link
      href="/inicio"
      className="pc-glass inline-flex min-h-12 items-center gap-2 rounded-full pr-[18px] pl-3 text-[15px] font-extrabold text-[var(--pc-ink)]"
    >
      <ChevronLeft size={22} aria-hidden />
      Início
    </Link>
  );
}

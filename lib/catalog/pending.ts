import type { PendingBook } from "./review.ts";

/** Livros do DESIGN.md §7 que ainda não entraram no seed (aparecem no catalogo-revisao.md). */
export const PENDING_BOOKS: PendingBook[] = [
  {
    title: "Szwarcfiter — Teoria Computacional de Grafos: Os Algoritmos (Elsevier, 2018)",
    reason:
      "não encontrei o sumário em fonte pública confiável e não quis inventar a estrutura. " +
      "Mandem uma foto do sumário (capítulos, seções e páginas) e eu monto o JSON.",
  },
];

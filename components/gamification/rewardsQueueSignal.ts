/**
 * Ponte entre o cartão "Fruto de ontem" do Início e a fila de recompensas do layout
 * (telas.md › 12, revisão de 16/11): o toque no cartão reabre a fila adiada.
 * Só há uma fila montada por vez (a do layout do app).
 */
type Opener = () => boolean;

let opener: Opener | null = null;

/** A fila se registra ao montar; devolve a função que desfaz o registro. */
export function registerRewardsQueue(fn: Opener): () => void {
  opener = fn;
  return () => {
    if (opener === fn) opener = null;
  };
}

/** Reabre a fila; `false` quando não há fruto na fila para mostrar. */
export function openRewardsQueue(): boolean {
  return opener?.() ?? false;
}

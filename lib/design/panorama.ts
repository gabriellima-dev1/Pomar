/**
 * Cena em tela cheia em telas mais largas que o desenho (telas.md › Computador e tablet:
 * "Pomodoro: cena em tela cheia"). A cena tem 390 × 844; dos lados entram cópias
 * espelhadas dela, então as bordas emendam sem corte.
 */
export const SCENE_W = 390;
export const SCENE_H = 844;

/** Largura da cena (unidades do SVG) para preencher uma área w × h sem cortar a altura. */
export function panoramaWidth(w: number, h: number): number {
  if (!(w > 0) || !(h > 0)) return SCENE_W;
  return Math.max(SCENE_W, Math.ceil((SCENE_H * w) / h));
}

/** Quantos painéis de cada lado cabem numa cena com essa largura. */
export function sidePanelCount(width: number): number {
  return Math.max(0, Math.ceil((width - SCENE_W) / 2 / SCENE_W));
}

/**
 * Posição do painel `k` (1, 2… à direita; -1, -2… à esquerda). Os ímpares são
 * espelhados, para cada painel encostar no vizinho pela mesma borda.
 */
export function sidePanelTransform(k: number): string {
  const n = Math.abs(k);
  const mirrored = n % 2 === 1;
  if (k > 0) {
    return mirrored
      ? `translate(${SCENE_W * (n + 1)} 0) scale(-1 1)`
      : `translate(${SCENE_W * n} 0)`;
  }
  return mirrored
    ? `translate(${-SCENE_W * (n - 1)} 0) scale(-1 1)`
    : `translate(${-SCENE_W * n} 0)`;
}

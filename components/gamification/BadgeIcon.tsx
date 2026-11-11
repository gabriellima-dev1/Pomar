/**
 * Ícones dos 11 emblemas (docs/design/emblemas/*.svg): grade 24px, traço 2px,
 * `currentColor`. Gerado a partir dos SVGs do design (sem os metadados).
 */

import type { BadgeCode } from "@/lib/gamification/catalog";

const PATHS: Record<BadgeCode, string> = {
  constante:
    '<path d="M4.5 11h9v7.5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2z"/><path d="M5.5 11a3.5 3.5 0 0 1 7 0"/><path d="m13.5 15 5.5-5 1.5 1.5"/><path d="M20 15v1M18 17.5v1M21.5 18v1"/>',
  coruja:
    '<path d="M6.2 8.6 5.6 4.6l3.6 2.3M17.8 8.6l.6-4 -3.6 2.3"/><path d="M12 6.5c-4.4 0-7 3-7 7s2.6 7.5 7 7.5 7-3.5 7-7.5-2.6-7-7-7z"/><circle cx="9" cy="12" r="2.4"/><circle cx="15" cy="12" r="2.4"/><path d="m12 14.2-1 1.8h2z" fill="currentColor"/>',
  explorador:
    '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/><path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21" opacity=".6"/>',
  finalizador:
    '<path d="M5 21V3.5"/><path d="M5 4h12.5l-2.5 4 2.5 4H5"/><path d="M9 4v8M13 4v8" opacity=".55"/>',
  fruto_do_dia:
    '<circle cx="12" cy="14" r="7"/><path d="M12 7V3.5M12 7 8.5 5.2M12 7l3.5-1.8"/><path d="M8.5 12.5a3.5 3.5 0 0 1 2-2" opacity=".6"/>',
  fruto_dourado:
    '<circle cx="11" cy="15" r="6.5"/><path d="M11 8.5V5.5M11 8.5 8 7M11 8.5 14 7"/><path d="M19 2.5v4M17 4.5h4M20.5 10v2.5M19.2 11.2h2.6"/>',
  lua_cheia:
    '<circle cx="11" cy="13" r="8"/><circle cx="8.5" cy="10.5" r="1.6"/><circle cx="13.5" cy="15.5" r="2.2"/><circle cx="8" cy="16" r=".9"/><path d="M20 2.5v3M18.5 4h3"/>',
  madrugador:
    '<path d="M2.5 19h19"/><path d="M6.5 19a5.5 5.5 0 0 1 11 0"/><path d="M12 6.5V9M5 9.8l1.7 1.7M19 9.8l-1.7 1.7M2.8 15H4.5M19.5 15h1.7"/><path d="M9 22h6" opacity=".6"/>',
  maratona:
    '<circle cx="7.5" cy="9" r="2.5"/><circle cx="12" cy="7" r="2.5"/><circle cx="16.5" cy="9" r="2.5"/><path d="M3 11.5h18l-2.2 8.5H5.2z"/><path d="M9 14.5v3M12 14.5v3M15 14.5v3" opacity=".6"/>',
  retorno:
    '<path d="M3.5 20.5h17"/><path d="M12 20.5V12"/><path d="M12 14c-.8-3.4-3.6-5-6.5-4.6.2 3.2 3 5.3 6.5 4.6z"/><path d="M12 12c.9-3.6 3.8-5.3 7-4.8-.3 3.4-3.2 5.5-7 4.8z"/>',
  sem_pausa:
    '<circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><circle cx="11" cy="13" r="1" fill="currentColor"/><path d="m11 13 8.5-8.5M16.5 4.5h3v3"/>',
};

export function BadgeIcon({
  code,
  size = 24,
  className,
}: {
  code: BadgeCode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Conteúdo fixo, vindo dos SVGs do design (sem dados do usuário).
      dangerouslySetInnerHTML={{ __html: PATHS[code] }}
    />
  );
}

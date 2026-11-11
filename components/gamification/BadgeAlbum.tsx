"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { RARITY_LABEL } from "@/lib/gamification/catalog";
import { shortDate, type AlbumEntry } from "@/lib/gamification/present";
import { BadgeDisc } from "./BadgeDisc";

const RARITY_TEXT = {
  comum: "text-ink-muted",
  incomum: "text-primary-strong",
  raro: "text-ink",
} as const;

/**
 * Álbum de emblemas (tela 09): grade de 3 colunas na ordem do §6.4. Tocar abre uma
 * folha com nome, regra, raridade e datas. Oculto não obtido: "???", cadeado, sem
 * ícone e sem regra.
 */
export function BadgeAlbum({ entries }: { entries: AlbumEntry[] }) {
  const [open, setOpen] = useState<AlbumEntry | null>(null);
  const found = entries.filter((e) => e.count > 0).length;

  return (
    <section aria-labelledby="album-titulo" className="@container flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="album-titulo" className="text-caption text-ink-muted">
          Seu álbum
        </h2>
        <p className="text-small text-ink-muted">
          {found} de {entries.length} encontrados
        </p>
      </div>
      {/* Colunas pela largura do álbum (não da janela): 3 na coluna de 480px, mais quando
          o conteúdo alargar (layout de computador, Fase 4). */}
      <ul className="grid grid-cols-3 gap-3 @2xl:grid-cols-4 @4xl:grid-cols-6">
        {entries.map((e) => {
          const obtained = e.count > 0;
          const secret = !obtained && e.hidden;
          return (
            <li key={e.code}>
              <button
                type="button"
                onClick={() => setOpen(e)}
                className={`flex h-full w-full min-w-0 flex-col items-center gap-2 rounded-lg px-1.5 py-4 text-center ${
                  obtained
                    ? "bg-surface-200 shadow-card"
                    : "bg-surface-100 border-line border-2 border-dashed"
                }`}
              >
                <BadgeDisc
                  code={e.code}
                  rarity={e.rarity}
                  state={obtained ? "obtained" : secret ? "secret" : "missing"}
                />
                <span
                  className={`w-full text-[15px] leading-5 font-extrabold text-balance [overflow-wrap:anywhere] hyphens-auto ${obtained ? "text-ink" : "text-ink-muted"}`}
                >
                  {secret ? "???" : e.name}
                </span>
                <span
                  className={`text-small w-full text-balance ${obtained ? RARITY_TEXT[e.rarity] : "text-ink-muted"}`}
                >
                  {obtained
                    ? `${RARITY_LABEL[e.rarity]} · ×${e.count}`
                    : secret
                      ? "Raro · secreto"
                      : "Ainda não"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog open={open !== null} onClose={() => setOpen(null)} labelledBy="emblema-titulo">
        {open && <BadgeSheet entry={open} onClose={() => setOpen(null)} />}
      </Dialog>
    </section>
  );
}

function BadgeSheet({ entry, onClose }: { entry: AlbumEntry; onClose: () => void }) {
  const obtained = entry.count > 0;
  const secret = !obtained && entry.hidden;
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <BadgeDisc
        code={entry.code}
        rarity={entry.rarity}
        state={obtained ? "obtained" : secret ? "secret" : "missing"}
        size={88}
      />
      <div className="flex flex-col gap-1">
        <h2 id="emblema-titulo" className="text-title">
          {secret ? "???" : entry.name}
        </h2>
        <p className={`text-small ${RARITY_TEXT[entry.rarity]}`}>
          {secret ? "Raro · secreto" : RARITY_LABEL[entry.rarity]}
          {obtained ? ` · saiu ${entry.count} ${entry.count === 1 ? "vez" : "vezes"}` : ""}
        </p>
      </div>
      <p className="text-ink-muted">{secret ? "Continue estudando para descobrir." : entry.rule}</p>
      {obtained && (
        <p className="text-small text-ink-muted">
          {entry.days.length > 6
            ? `Últimas vezes: ${entry.days.slice(0, 6).map(shortDate).join(", ")}…`
            : `Saiu em ${entry.days.map(shortDate).join(", ")}.`}
        </p>
      )}
      <Button variant="secondary" className="w-full" onClick={onClose}>
        Fechar
      </Button>
    </div>
  );
}

"use client";

import { SeuTomas } from "@/components/mascot/SeuTomas";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

/** Pop-up de nudge ao pausar (DESIGN §4.5, referencias/06-pausa-nudge.png). Pausar não pune. */
export function PauseDialog({
  open,
  busy,
  onRestart,
  onContinue,
}: {
  open: boolean;
  busy: boolean;
  onRestart: () => void;
  onContinue: () => void;
}) {
  return (
    <Dialog open={open} onClose={onContinue} labelledBy="pausa-titulo" variant="card">
      <div className="flex flex-col gap-4">
        <SeuTomas size={64} mood="pensativo" />
        <h2 id="pausa-titulo" className="text-title">
          Pausas quebram o foco
        </h2>
        <p className="text-ink-muted">
          Que tal reiniciar o ciclo para aproveitar melhor? Você não perde nada se continuar.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button size="lg" onClick={onRestart} disabled={busy}>
            Reiniciar ciclo
          </Button>
          <Button variant="ghost" onClick={onContinue} disabled={busy}>
            Continuar mesmo assim
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

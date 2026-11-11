import type { ReactNode } from "react";
import { SeuTomas } from "@/components/mascot/SeuTomas";

/** Seu Tomás + balão de fala em `--fruit-soft` (cantos 24 24 24 10). */
export function MascotBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-end gap-3">
      <SeuTomas size={60} className="shrink-0" />
      <p className="bg-fruit-soft text-ink rounded-[24px_24px_24px_10px] px-5 py-4 font-semibold">
        {children}
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Pomodoro" };

/** Provisória: o cronômetro chega no PR `fase-2-pomodoro`. */
export default function PomodoroPage() {
  return (
    <ComingSoon title="Pomodoro">
      O cronômetro está quase pronto. Enquanto isso, você já pode organizar suas disciplinas e
      calibrar seu ritmo.
    </ComingSoon>
  );
}

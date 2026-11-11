import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Conquistas" };

export default function Page() {
  return (
    <ComingSoon title="Conquistas">
      Em breve, aqui você vai ver os frutos que colheu, as colheitas da semana e os temas que
      desbloqueou.
    </ComingSoon>
  );
}

import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Estatísticas" };

export default function Page() {
  return (
    <ComingSoon title="Estatísticas">
      Em breve, aqui você vai ver quanto tempo estudou, seu melhor horário e como seu ritmo mudou.
    </ComingSoon>
  );
}

import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Liga" };

export default function Page() {
  return (
    <ComingSoon title="Liga">
      Em breve, aqui vai ficar a feira da semana, para quem quiser participar. Quem decide é você.
    </ComingSoon>
  );
}

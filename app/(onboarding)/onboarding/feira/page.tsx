import type { Metadata } from "next";
import { ArrowUp, Eye, Users } from "lucide-react";
import { DivisionLadder } from "@/components/league/Divisions";
import { LeagueChoice } from "@/components/league/LeagueChoice";
import { OnboardingBody, StepLabel } from "@/components/onboarding/Shell";
import { cardClasses } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Feira" };

const POINTS = [
  {
    icon: Users,
    text: "Toda semana você fica num grupo de até 20 pessoas que estudam um tempo parecido com o seu.",
  },
  { icon: ArrowUp, text: "O ranking é pelo XP da semana. Os primeiros sobem de divisão." },
  { icon: Eye, text: "Os outros veem só o seu apelido e o seu XP da semana." },
];

/** Tela 19 · Feira (opt-in sem pré-marcação, DESIGN §6.6). */
export default async function FeiraPage() {
  await requireUser();
  return (
    <OnboardingBody>
      <StepLabel step={2} />
      <div className={`${cardClasses} px-4 py-5`}>
        <DivisionLadder />
      </div>
      <h1 className="text-display">Quer participar da Feira?</h1>
      <ul className="flex flex-col gap-4">
        {POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 text-lg">
            <Icon size={26} aria-hidden className="text-primary mt-0.5 shrink-0" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <LeagueChoice context="onboarding" />
    </OnboardingBody>
  );
}

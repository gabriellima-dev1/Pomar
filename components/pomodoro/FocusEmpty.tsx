import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Scene } from "@/components/scenes/Scene";
import { WideScene } from "@/components/scenes/WideScene";
import { buttonClasses } from "@/components/ui/Button";
import type { Stage } from "@/lib/gamification/levels";
import type { ThemeCode, ThemePreference } from "@/lib/gamification/themes";
import { HomePill } from "./HomePill";

/**
 * Foco sem sessão nem disciplina (telas.md › Foco, 37 e 37b): só a cena do tema, sem
 * cronômetro, e um card de vidro com "Escolher disciplina" e o link discreto
 * "Estudar sem disciplina" (sessão livre). Fora isso, só o botão Início.
 */
export function FocusEmpty({
  wide,
  theme,
  sceneTheme,
  stage,
}: {
  wide: boolean;
  theme: ThemePreference;
  sceneTheme: ThemeCode;
  stage: Stage;
}) {
  const card = (
    <section
      aria-labelledby="foco-vazio"
      className={`pc-glass flex flex-col items-center gap-4 text-center text-[var(--pc-ink)] ${
        wide ? "w-[440px] rounded-[32px] p-8" : "w-full rounded-[28px] px-6 py-7"
      }`}
    >
      <h1 id="foco-vazio" className="font-display text-[26px] leading-8 font-semibold">
        Nenhuma disciplina selecionada
      </h1>
      <Link href="/disciplinas" className={buttonClasses("primary", "lg", "w-full gap-2")}>
        <BookOpen size={22} aria-hidden />
        Escolher disciplina
      </Link>
      <Link
        href="/pomodoro?livre=1"
        className="inline-flex min-h-11 items-center px-2 font-extrabold underline underline-offset-4"
      >
        Estudar sem disciplina
      </Link>
    </section>
  );

  return (
    <div
      data-theme={theme}
      className="fixed inset-0 z-40 overflow-hidden bg-[var(--scene-sky-bottom)]"
    >
      {wide ? (
        <>
          <WideScene theme={sceneTheme} stage={stage} />
          <div className="absolute top-6 left-8">
            <HomePill />
          </div>
          <div className="absolute top-[clamp(88px,14.7vh,132px)] left-16 xl:left-[120px]">
            {card}
          </div>
        </>
      ) : (
        <>
          <Scene theme={sceneTheme} stage={stage} />
          <div className="max-w-app relative mx-auto flex h-full w-full flex-col px-3 pt-3">
            <div>
              <HomePill />
            </div>
            <div className="px-3 pt-[clamp(16px,5vh,56px)]">{card}</div>
          </div>
        </>
      )}
    </div>
  );
}

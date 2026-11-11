import { monthOf } from "@/lib/dates";
import type { GameProfile, UnlockedTheme } from "@/lib/gamification/queries";
import { stageForLevel } from "@/lib/gamification/levels";
import { seasonalTheme } from "@/lib/gamification/themes";
import { ThemeGrid } from "./ThemeGrid";

/** Aba Temas (tela 11). */
export function ThemesTab({
  profile,
  unlocked,
}: {
  profile: GameProfile;
  unlocked: readonly UnlockedTheme[];
}) {
  return (
    <section aria-labelledby="temas-titulo" className="flex flex-col gap-5">
      <h2 id="temas-titulo" className="sr-only">
        Temas
      </h2>
      <p className="text-ink-muted">
        O tema troca a paisagem do pomodoro, os frutos e o acessório do Seu Tomás. Tema conquistado
        fica com você para sempre.
      </p>
      <ThemeGrid
        chosen={profile.theme}
        unlocked={unlocked.map((t) => t.code)}
        fresh={unlocked.filter((t) => !t.tabSeen).map((t) => t.code)}
        isAdmin={profile.isAdmin}
        seasonal={seasonalTheme(monthOf(profile.today))}
        stage={stageForLevel(profile.level)}
      />
    </section>
  );
}

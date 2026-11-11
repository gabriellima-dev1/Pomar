import type { Metadata } from "next";
import { BadgeAlbum } from "@/components/gamification/BadgeAlbum";
import { HarvestHistory, HarvestTotals } from "@/components/gamification/HarvestHistory";
import { HarvestWeekCard } from "@/components/gamification/HarvestWeekCard";
import { LevelCard } from "@/components/gamification/LevelCard";
import { ThemesTab } from "@/components/gamification/ThemesTab";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { SegmentedNav } from "@/components/ui/SegmentedNav";
import { requireUser } from "@/lib/auth/session";
import { albumEntries, pastWeeks } from "@/lib/gamification/present";
import {
  getBadgeHistory,
  getGameProfile,
  getHarvests,
  getUnlockedThemes,
} from "@/lib/gamification/queries";
import { EMPTY_ALBUM_LINE } from "@/lib/mascot/lines";

export const metadata: Metadata = { title: "Conquistas" };

const TABS = [
  { key: "emblemas", label: "Emblemas" },
  { key: "colheitas", label: "Colheitas" },
  { key: "temas", label: "Temas" },
] as const;

type Tab = (typeof TABS)[number]["key"];

function parseTab(value: string | string[] | undefined): Tab {
  return value === "colheitas" || value === "temas" ? value : "emblemas";
}

/** Conquistas (telas 09, 10 e 11). Tudo vem do servidor; a página só exibe. */
export default async function ConquistasPage({ searchParams }: PageProps<"/conquistas">) {
  const user = await requireUser();
  const tab = parseTab((await searchParams).aba);
  const [profile, history, harvests, themes] = await Promise.all([
    getGameProfile(user.id),
    getBadgeHistory(),
    getHarvests(),
    getUnlockedThemes(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display pt-2">Conquistas</h1>

      {/* Card de nível ao lado das abas só no layout de computador (Fase 4). */}
      <div className="flex flex-col gap-6">
        {tab === "emblemas" && <LevelCard xp={profile.xp} />}
        <SegmentedNav
          label="Conquistas"
          items={TABS.map((t) => ({
            label: t.label,
            href: t.key === "emblemas" ? "/conquistas" : `/conquistas?aba=${t.key}`,
            active: t.key === tab,
          }))}
        />
      </div>

      {tab === "emblemas" && (
        <>
          {history.length === 0 && <MascotBubble>{EMPTY_ALBUM_LINE}</MascotBubble>}
          <BadgeAlbum entries={albumEntries(history)} />
        </>
      )}

      {tab === "colheitas" && (
        <>
          <HarvestWeekCard
            history={history}
            today={profile.today}
            studiedToday={profile.studiedToday}
          />
          <HarvestTotals harvests={harvests} />
          <HarvestHistory weeks={pastWeeks(history, harvests, profile.today)} themes={themes} />
        </>
      )}

      {tab === "temas" && <ThemesTab profile={profile} unlocked={themes} />}
    </div>
  );
}

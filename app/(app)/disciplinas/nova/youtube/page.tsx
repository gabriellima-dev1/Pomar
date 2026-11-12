import type { Metadata } from "next";
import { NewSubjectTabs } from "@/components/subjects/NewSubjectTabs";
import { YoutubeImport } from "@/components/subjects/YoutubeImport";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { suggestColor } from "@/lib/subjects/colors";
import { countSubjects, getPreferences } from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Nova disciplina pelo YouTube" };

/** Nova disciplina › YouTube (referencias/30-nova-disciplina-youtube.png). */
export default async function NovaDisciplinaYoutubePage() {
  const user = await requireUser();
  const [prefs, count, account] = await Promise.all([
    getPreferences(user.id),
    countSubjects(),
    getAccount(user.id),
  ]);
  return (
    <section className="flex flex-col gap-5">
      <NewSubjectTabs active="youtube" onboarding={account.step === "disciplina"} />
      <YoutubeImport color={suggestColor(count)} focusMin={prefs.focusMin} />
    </section>
  );
}

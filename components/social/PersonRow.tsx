import Link from "next/link";
import { STAGE_PHRASE, stageForLevel } from "@/lib/gamification/levels";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";

/** "Nível 6 · árvore jovem". */
export function levelLine(level: number): string {
  return `Nível ${level} · ${STAGE_PHRASE[stageForLevel(level)]}`;
}

/** Linha de pessoa (telas.md › 27): avatar, @apelido, uma linha de apoio e Seguir/Seguindo. */
export function PersonRow({
  username,
  subtitle,
  following,
  isDemo = false,
}: {
  username: string;
  subtitle: string;
  following: boolean;
  isDemo?: boolean;
}) {
  return (
    <li className="flex min-h-16 items-center gap-3 py-2">
      <Link
        href={`/perfil/${username}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md"
      >
        <Avatar username={username} size={48} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-2">
            <span className="truncate text-lg font-extrabold">@{username}</span>
            {isDemo && (
              <span className="bg-surface-300 text-ink-muted text-small shrink-0 rounded-full px-2.5 py-0.5 font-extrabold">
                demo
              </span>
            )}
          </span>
          <span className="text-ink-muted truncate font-semibold">{subtitle}</span>
        </span>
      </Link>
      <FollowButton username={username} initialFollowing={following} />
    </li>
  );
}

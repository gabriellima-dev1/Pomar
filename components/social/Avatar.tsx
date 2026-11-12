import { SUBJECT_COLORS } from "@/lib/subjects/colors";
import { initials } from "@/lib/league/username";

/** Cor estável por apelido, entre os tokens `--subject-*`. */
export function avatarColor(username: string | null): string {
  let hash = 0;
  for (const ch of username ?? "") hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length]!.key;
}

/**
 * Avatar com iniciais (telas.md › 23): fundo claro na cor da disciplina e letras na
 * cor cheia. A própria pessoa ("Você") fica em `--fruit` cheio.
 */
export function Avatar({
  username,
  size = 40,
  me = false,
}: {
  username: string | null;
  size?: number;
  me?: boolean;
}) {
  const color = `var(--subject-${avatarColor(username)})`;
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-extrabold"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: me ? "var(--fruit)" : `color-mix(in srgb, ${color} 16%, var(--surface-200))`,
        color: me ? "var(--on-fruit)" : color,
      }}
    >
      {initials(username)}
    </span>
  );
}

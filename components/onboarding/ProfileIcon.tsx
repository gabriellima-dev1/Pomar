import { Trophy, Users } from "lucide-react";
import { BadgeIcon } from "@/components/gamification/BadgeIcon";
import type { BartleProfile } from "@/lib/bartle";

/**
 * Ícone do perfil de Bartle num disco no estilo incomum (tela 18): Conquistador =
 * bandeira (finalizador.svg), Competidor = troféu, Explorador = bússola
 * (explorador.svg), Socializador = pessoas.
 */
export function ProfileIcon({ profile, size = 88 }: { profile: BartleProfile; size?: number }) {
  const icon = Math.round(size * 0.48);
  return (
    <span
      aria-hidden
      className="bg-primary-soft text-primary-strong border-primary grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 29)) }}
    >
      {profile === "conquistador" && <BadgeIcon code="finalizador" size={icon} />}
      {profile === "competidor" && <Trophy size={icon} strokeWidth={2} />}
      {profile === "explorador" && <BadgeIcon code="explorador" size={icon} />}
      {profile === "socializador" && <Users size={icon} strokeWidth={2} />}
    </span>
  );
}

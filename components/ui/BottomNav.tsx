"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, Trophy, Users, type LucideIcon } from "lucide-react";
import { FocusTab } from "@/components/focus/FocusNavItems";

type Item = { href: string; label: string; icon: LucideIcon };

const LEFT: Item[] = [
  { href: "/inicio", label: "Início", icon: House },
  { href: "/disciplinas", label: "Disciplinas", icon: BookOpen },
];
const RIGHT: Item[] = [
  { href: "/liga", label: "Liga", icon: Users },
  { href: "/conquistas", label: "Conquistas", icon: Trophy },
];

/**
 * Telas com a barra: as raízes e as Estatísticas, abertas pelo Início ("Sua semana")
 * e com Início marcado (telas.md › 39c). Telas internas e o Foco não têm.
 */
const ROOTS: Record<string, string> = {
  "/inicio": "/inicio",
  "/disciplinas": "/disciplinas",
  "/liga": "/liga",
  "/conquistas": "/conquistas",
  "/estatisticas": "/inicio",
};

export function showsBottomNav(pathname: string): boolean {
  return pathname in ROOTS;
}

function Tab({ href, label, icon: Icon, active }: Item & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-md text-[13px] leading-4 font-extrabold ${
        active ? "bg-primary-soft text-primary" : "text-ink-muted hover:text-ink"
      }`}
    >
      <Icon size={24} aria-hidden strokeWidth={2} />
      {label}
    </Link>
  );
}

/**
 * Navegação inferior do celular (telas.md › Foco no menu, 36 e 39): Início ·
 * Disciplinas · Foco (centro, com destaque) · Liga · Conquistas.
 */
export function BottomNav() {
  const pathname = usePathname();
  if (!showsBottomNav(pathname)) return null;
  const current = ROOTS[pathname];

  return (
    <nav
      aria-label="Principal"
      className="bg-surface-200 border-line fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="max-w-app mx-auto grid grid-cols-5 gap-1 px-2 py-1.5">
        {LEFT.map((item) => (
          <li key={item.href}>
            <Tab {...item} active={current === item.href} />
          </li>
        ))}
        <li>
          <FocusTab />
        </li>
        {RIGHT.map((item) => (
          <li key={item.href}>
            <Tab {...item} active={current === item.href} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

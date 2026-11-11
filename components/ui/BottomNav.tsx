"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, House, Trophy, Users, type LucideIcon } from "lucide-react";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/inicio", label: "Início", icon: House },
  { href: "/disciplinas", label: "Disciplinas", icon: BookOpen },
  { href: "/conquistas", label: "Conquistas", icon: Trophy },
  { href: "/liga", label: "Liga", icon: Users },
  { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
];

/** Telas que mostram a navegação: só as 5 raízes. Telas internas e o pomodoro não. */
export function showsBottomNav(pathname: string): boolean {
  return ITEMS.some((item) => item.href === pathname);
}

/** Navegação inferior com 5 destinos; o ativo fica em `--primary` sobre `--primary-soft`. */
export function BottomNav() {
  const pathname = usePathname();
  if (!showsBottomNav(pathname)) return null;

  return (
    <nav
      aria-label="Principal"
      className="bg-surface-200 border-line fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="max-w-app mx-auto grid grid-cols-5 gap-1 px-2 py-1.5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

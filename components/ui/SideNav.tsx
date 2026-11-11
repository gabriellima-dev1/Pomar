"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BarChart3, BookOpen, House, Settings, Trophy, type LucideIcon } from "lucide-react";
import { SeuTomas } from "@/components/mascot/SeuTomas";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/inicio", label: "Início", icon: House },
  { href: "/disciplinas", label: "Disciplinas", icon: BookOpen },
  { href: "/conquistas", label: "Conquistas", icon: Award },
  { href: "/liga", label: "Liga", icon: Trophy },
  { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Item({ href, label, icon: Icon, active }: (typeof ITEMS)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex h-12 items-center gap-3 rounded-md px-4 font-extrabold ${
        active ? "bg-primary-soft text-primary-strong" : "text-ink-muted hover:text-ink"
      }`}
    >
      <Icon size={22} aria-hidden />
      {label}
    </Link>
  );
}

/**
 * Barra lateral fixa de 240px a partir de 1024px, no lugar da BottomNav (telas.md ›
 * Computador e tablet, referencias/22-inicio-desktop.png). Some no pomodoro, que é tela
 * cheia por cima dela.
 */
export function SideNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="bg-surface-200 border-line fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r px-4 py-6 lg:flex"
    >
      <Link href="/inicio" className="mb-8 flex items-center gap-2 px-2">
        <SeuTomas size={36} />
        <span className="font-display text-2xl font-semibold">Pomar</span>
      </Link>
      <ul className="flex flex-col gap-1">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Item {...item} active={isActive(pathname, item.href)} />
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <Item
          href="/configuracoes"
          label="Configurações"
          icon={Settings}
          active={isActive(pathname, "/configuracoes")}
        />
      </div>
    </nav>
  );
}

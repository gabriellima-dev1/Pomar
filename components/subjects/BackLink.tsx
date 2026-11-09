import Link from "next/link";
import type { ReactNode } from "react";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-muted hover:text-foreground inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium"
    >
      <span aria-hidden>←</span> {children}
    </Link>
  );
}

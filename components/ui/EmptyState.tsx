import type { ReactNode } from "react";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { Card } from "./Card";

/** Estado vazio: Seu Tomás 112px, título, frase em primeira pessoa e uma ação. */
export function EmptyState({
  title,
  children,
  action,
  as: Heading = "h2",
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-8 text-center">
      <SeuTomas size={112} />
      <Heading className="text-title">{title}</Heading>
      <p className="text-ink-muted max-w-prose">{children}</p>
      {action && <div className="flex w-full flex-col pt-2">{action}</div>}
    </Card>
  );
}

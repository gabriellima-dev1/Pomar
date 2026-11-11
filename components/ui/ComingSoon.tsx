import Link from "next/link";
import { buttonClasses } from "./Button";
import { EmptyState } from "./EmptyState";

/** Telas da BottomNav que ainda não existem (decisão da dupla, 10/11). */
export function ComingSoon({ title, children }: { title: string; children: string }) {
  return (
    <section className="flex flex-col gap-6 pt-4">
      <h1 className="text-display">{title}</h1>
      <EmptyState
        title="Esta parte do pomar ainda está crescendo"
        action={
          <Link href="/inicio" className={buttonClasses("secondary", "md")}>
            Voltar ao início
          </Link>
        }
      >
        {children}
      </EmptyState>
    </section>
  );
}

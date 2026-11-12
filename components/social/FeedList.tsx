"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { sendReaction } from "@/app/(app)/liga/actions";
import { buttonClasses } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { feedText, type FeedPayload, type FeedType } from "@/lib/social/feed";
import { Avatar } from "./Avatar";

export type FeedListItem = {
  id: string;
  username: string;
  type: FeedType;
  payload: FeedPayload;
  when: string;
  reacted: boolean;
};

function ReactButton({ item }: { item: FeedListItem }) {
  const [sent, setSent] = useState(item.reacted);
  const [busy, start] = useTransition();
  if (sent) {
    return (
      <span
        aria-label={`Parabéns enviado para @${item.username}`}
        className="bg-primary-soft text-primary-strong inline-flex min-h-11 shrink-0 items-center rounded-md px-4 font-extrabold"
      >
        Enviado
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setSent(true);
        start(async () => {
          if (!(await sendReaction(item.id, item.type))) setSent(false);
        });
      }}
      aria-label={`Dar parabéns para @${item.username}`}
      className={buttonClasses("secondary", "sm", "text-ink shrink-0")}
    >
      Parabéns
    </button>
  );
}

/** "Quem você segue" (referencias/26-liga-amigos.png): conquista + quando + Parabéns/Enviado. */
export function FeedList({ items }: { items: FeedListItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const t = feedText(item.type, item.payload);
        return (
          <li key={item.id} className={`${cardClasses} flex items-center gap-3 px-4 py-4`}>
            <Link href={`/perfil/${item.username}`} aria-hidden tabIndex={-1}>
              <Avatar username={item.username} size={48} />
            </Link>
            <p className="flex min-w-0 flex-1 flex-col">
              <span>
                <Link href={`/perfil/${item.username}`} className="font-extrabold">
                  {item.username}
                </Link>{" "}
                {t.text}
                {t.strong && <strong className="font-extrabold">{t.strong}</strong>}
              </span>
              <span className="text-small text-ink-muted font-semibold">{item.when}</span>
            </p>
            <ReactButton item={item} />
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { useId, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { followUser, unfollowUser } from "@/app/(app)/liga/actions";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

/**
 * "Seguir" (primário pequeno) ou "Seguindo" (`--primary-soft`); tocar em "Seguindo"
 * pede confirmação para deixar de seguir (telas.md › 27). `variant="outline"` é o do
 * perfil público (28).
 */
export function FollowButton({
  username,
  initialFollowing,
  variant = "compact",
}: {
  username: string;
  initialFollowing: boolean;
  variant?: "compact" | "outline";
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [confirm, setConfirm] = useState(false);
  const [busy, start] = useTransition();
  const titleId = useId();

  function follow() {
    setFollowing(true);
    start(async () => {
      if (!(await followUser(username))) setFollowing(false);
    });
  }

  function unfollow() {
    setConfirm(false);
    setFollowing(false);
    start(async () => {
      await unfollowUser(username);
    });
  }

  const outline = variant === "outline";
  return (
    <>
      {following ? (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          disabled={busy}
          aria-label={`Seguindo @${username}. Deixar de seguir`}
          className={
            outline
              ? buttonClasses("secondary", "md", "text-ink w-full")
              : "bg-primary-soft text-primary-strong inline-flex min-h-11 shrink-0 items-center justify-center rounded-md px-4 font-extrabold"
          }
        >
          {outline && <Check size={20} aria-hidden strokeWidth={3} />}
          Seguindo
        </button>
      ) : (
        <button
          type="button"
          onClick={follow}
          disabled={busy}
          aria-label={`Seguir @${username}`}
          className={buttonClasses(
            "primary",
            outline ? "md" : "sm",
            outline ? "w-full" : "shrink-0",
          )}
        >
          Seguir
        </button>
      )}
      <Dialog open={confirm} onClose={() => setConfirm(false)} labelledBy={titleId} variant="card">
        <div className="flex flex-col gap-4">
          <h2 id={titleId} className="text-title">
            Deixar de seguir @{username}?
          </h2>
          <p className="text-ink-muted">
            As conquistas dessa pessoa saem do seu feed. Dá para seguir de novo quando quiser.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="secondary" onClick={unfollow}>
              Deixar de seguir
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(false)} autoFocus>
              Continuar seguindo
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

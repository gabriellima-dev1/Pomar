"use client";

import Image from "next/image";
import { useActionState, useEffect, useMemo, useState } from "react";
import { Link2, Play } from "lucide-react";
import { createFromYoutube, type FormState } from "@/app/(app)/disciplinas/actions";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { Checkbox } from "@/components/ui/Checkbox";
import { Notice } from "@/components/ui/Notice";
import { StickyFooter } from "@/components/ui/StickyFooter";
import type { Playlist } from "@/lib/youtube/client.server";
import {
  importSummary,
  parsePlaylistId,
  speedLabel,
  totalLabel,
  VIDEO_SPEEDS,
  videoMinutes,
  type VideoSpeed,
} from "@/lib/youtube/parse";

const PREVIEW = 4;

type Load =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ok"; playlist: Playlist };

/**
 * Nova disciplina › YouTube (referencias/30-nova-disciplina-youtube.png): colar o link,
 * ver a playlist (todos os vídeos marcados), escolher a velocidade e continuar.
 */
export function YoutubeImport({ color, focusMin }: { color: string; focusMin: number }) {
  const [state, dispatch] = useActionState<FormState, FormData>(createFromYoutube, {});
  const [url, setUrl] = useState("");
  const [load, setLoad] = useState<Load>({ state: "idle" });
  const [speed, setSpeed] = useState<VideoSpeed>(1);
  const [off, setOff] = useState<Set<string>>(new Set());
  const [all, setAll] = useState(false);
  const id = parsePlaylistId(url);

  useEffect(() => {
    if (!url.trim()) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!id) {
        setLoad({
          state: "error",
          message:
            "Esse link não parece ser de uma playlist do YouTube. Cole o link da playlist ou de um vídeo dela.",
        });
        return;
      }
      setLoad({ state: "loading" });
      try {
        const res = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`);
        const body = (await res.json()) as { playlist?: Playlist; mensagem?: string };
        if (cancelled) return;
        if (res.ok && body.playlist) {
          setOff(new Set());
          setAll(false);
          setLoad({ state: "ok", playlist: body.playlist });
        } else {
          setLoad({
            state: "error",
            message:
              body.mensagem ?? "Não consegui abrir a playlist agora. Tente de novo mais tarde.",
          });
        }
      } catch {
        if (!cancelled) {
          setLoad({
            state: "error",
            message: "Não consegui abrir a playlist agora. Tente de novo mais tarde.",
          });
        }
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [url, id]);

  const playlist = load.state === "ok" ? load.playlist : null;
  const chosen = useMemo(
    () => (playlist?.videos ?? []).filter((v) => !off.has(v.id)),
    [playlist, off],
  );
  const summary = importSummary(
    chosen.map((v) => v.durationSec),
    speed,
    focusMin,
  );
  const shown = playlist ? (all ? playlist.videos : playlist.videos.slice(0, PREVIEW)) : [];
  const totalSec = playlist?.videos.reduce((a, v) => a + v.durationSec, 0) ?? 0;

  function toggle(videoId: string) {
    setOff((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  }

  return (
    <form action={dispatch} className="flex flex-col gap-5 pb-40">
      <input type="hidden" name="url" value={url} />
      <input type="hidden" name="speed" value={speed} />
      <input type="hidden" name="color" value={color} />
      <input type="hidden" name="videos" value={JSON.stringify(chosen.map((v) => v.id))} />

      <div className="flex flex-col gap-2">
        <label htmlFor="link-playlist" className="font-extrabold">
          Link da playlist
        </label>
        <div
          className={`bg-surface-200 flex min-h-14 items-center gap-3 rounded-lg border-[3px] px-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)] ${
            playlist
              ? "border-primary"
              : load.state === "error"
                ? "border-danger"
                : "border-control-border"
          }`}
        >
          <Link2 size={22} aria-hidden className="text-ink-muted shrink-0" />
          <input
            id="link-playlist"
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (!e.target.value.trim()) setLoad({ state: "idle" });
            }}
            placeholder="youtube.com/playlist?list=…"
            autoComplete="off"
            className="text-ink placeholder:text-ink-muted min-w-0 flex-1 bg-transparent font-semibold focus-visible:outline-none"
          />
        </div>
        <p className="text-small text-ink-muted font-semibold" aria-live="polite">
          {load.state === "loading"
            ? "Abrindo a playlist…"
            : load.state === "error"
              ? ""
              : "Aceita o link da playlist ou de um vídeo dela (com list=). Cada vídeo vira um tópico."}
        </p>
        {load.state === "error" && <FormMessage message={load.message} />}
      </div>

      {playlist && (
        <section
          aria-label="Playlist"
          className="bg-surface-200 border-primary flex flex-col gap-4 rounded-lg border-[3px] p-4"
        >
          <div className="flex items-start gap-4">
            <span className="bg-subject-ceu relative grid aspect-video w-28 shrink-0 place-items-center overflow-hidden rounded-md">
              {playlist.thumbnail ? (
                <Image
                  src={playlist.thumbnail}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <Play size={28} aria-hidden className="text-on-subject" />
              )}
            </span>
            <div className="flex min-w-0 flex-col">
              <h2 className="text-heading">{playlist.title}</h2>
              <p className="text-small text-ink-muted font-semibold">
                {[playlist.channel, `${playlist.videos.length} vídeos`, totalLabel(totalSec)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          {(playlist.unavailable > 0 || playlist.truncated) && (
            <Notice tone="info">
              {playlist.unavailable > 0 &&
                `${playlist.unavailable} ${playlist.unavailable === 1 ? "vídeo indisponível foi ignorado" : "vídeos indisponíveis foram ignorados"}. `}
              {playlist.truncated && "Só os 200 primeiros vídeos entram."}
            </Notice>
          )}

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-extrabold">Você costuma assistir em</legend>
            <div className="grid grid-cols-4 gap-2">
              {VIDEO_SPEEDS.map((s) => (
                <label
                  key={s}
                  className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md font-extrabold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)] ${
                    speed === s
                      ? "border-primary bg-primary-soft text-primary-strong border-[3px]"
                      : "border-line bg-surface-200 border-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="velocidade"
                    value={s}
                    checked={speed === s}
                    onChange={() => setSpeed(s)}
                    className="sr-only"
                  />
                  {speedLabel(s)}
                </label>
              ))}
            </div>
          </fieldset>

          <ul className="flex flex-col" aria-label="Vídeos">
            {shown.map((v, i) => {
              const checked = !off.has(v.id);
              return (
                <li key={v.id}>
                  <label className="flex min-h-12 cursor-pointer items-center gap-3 py-1">
                    <Checkbox checked={checked} onChange={() => toggle(v.id)} />
                    <span className={`min-w-0 flex-1 truncate ${checked ? "" : "text-ink-muted"}`}>
                      {i + 1}. {v.title}
                    </span>
                    <span className="text-ink-muted shrink-0 font-extrabold tabular-nums">
                      {videoMinutes(v.durationSec)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {playlist.videos.length > PREVIEW && (
            <button
              type="button"
              onClick={() => setAll((a) => !a)}
              className="text-primary self-start py-2 font-extrabold"
            >
              {all ? "Mostrar menos" : `Ver os ${playlist.videos.length} vídeos`}
            </button>
          )}
        </section>
      )}

      <FormMessage message={state.error} />

      {playlist && (
        <StickyFooter>
          <div className="flex items-center gap-4">
            <p className="min-w-0 flex-1">
              <span className="block font-extrabold">{summary.line1}</span>
              <span className="text-small text-ink-muted block font-semibold">{summary.line2}</span>
            </p>
            <SubmitButton size="lg" pendingText="Criando…" className="shrink-0">
              Continuar
            </SubmitButton>
          </div>
        </StickyFooter>
      )}
    </form>
  );
}

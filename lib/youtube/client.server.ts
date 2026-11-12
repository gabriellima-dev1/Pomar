import "server-only";
import { requireEnv } from "@/lib/env";
import { MAX_VIDEOS, parseIsoDuration } from "./parse";

/**
 * YouTube Data API v3 (só no servidor, com `YOUTUBE_API_KEY`). Uma importação custa
 * poucas unidades de cota (1 por página de 50); as respostas ficam em cache por 10 min,
 * então a revalidação ao criar a disciplina não gasta cota de novo.
 */

const API = "https://www.googleapis.com/youtube/v3";
const CACHE = { next: { revalidate: 600 } } as const;

export type PlaylistVideo = { id: string; title: string; durationSec: number };

export type Playlist = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string | null;
  videos: PlaylistVideo[];
  /** Privados, removidos ou sem duração (ao vivo): ficam de fora. */
  unavailable: number;
  /** A playlist tinha mais de 200 vídeos; só os 200 primeiros entram. */
  truncated: boolean;
};

export type YoutubeErrorCode = "nao_encontrada" | "cota" | "falha";

export class YoutubeError extends Error {
  constructor(readonly code: YoutubeErrorCode) {
    super(code);
  }
}

async function call<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = requireEnv("YOUTUBE_API_KEY", process.env.YOUTUBE_API_KEY);
  const url = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries({ ...params, key })) url.searchParams.set(k, v);
  let res: Response;
  try {
    res = await fetch(url, CACHE);
  } catch {
    throw new YoutubeError("falha");
  }
  if (res.ok) return (await res.json()) as T;
  const body = (await res.json().catch(() => null)) as {
    error?: { errors?: { reason?: string }[] };
  } | null;
  const reason = body?.error?.errors?.[0]?.reason ?? "";
  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") throw new YoutubeError("cota");
  if (
    res.status === 404 ||
    reason === "playlistNotFound" ||
    reason === "playlistItemsNotAccessible"
  ) {
    throw new YoutubeError("nao_encontrada");
  }
  console.error("[youtube]", res.status, reason);
  throw new YoutubeError("falha");
}

type Thumbs = Record<string, { url?: string } | undefined>;

export async function fetchPlaylist(id: string): Promise<Playlist> {
  const meta = await call<{
    items?: { snippet?: { title?: string; channelTitle?: string; thumbnails?: Thumbs } }[];
  }>("playlists", { part: "snippet", id });
  const snippet = meta.items?.[0]?.snippet;
  if (!snippet) throw new YoutubeError("nao_encontrada");

  const items: { videoId: string; title: string }[] = [];
  let pageToken = "";
  let truncated = false;
  do {
    const page = await call<{
      nextPageToken?: string;
      items?: { snippet?: { title?: string; resourceId?: { videoId?: string } } }[];
    }>("playlistItems", {
      part: "snippet",
      playlistId: id,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    for (const it of page.items ?? []) {
      const videoId = it.snippet?.resourceId?.videoId;
      if (videoId) items.push({ videoId, title: it.snippet?.title ?? "" });
    }
    pageToken = page.nextPageToken ?? "";
    if (items.length >= MAX_VIDEOS) {
      truncated = Boolean(pageToken) || items.length > MAX_VIDEOS;
      break;
    }
  } while (pageToken);
  const wanted = items.slice(0, MAX_VIDEOS);

  const details = new Map<string, number>();
  for (let i = 0; i < wanted.length; i += 50) {
    const batch = wanted.slice(i, i + 50).map((v) => v.videoId);
    const res = await call<{
      items?: {
        id?: string;
        contentDetails?: { duration?: string };
        status?: { privacyStatus?: string };
      }[];
    }>("videos", { part: "contentDetails,status", id: batch.join(",") });
    for (const v of res.items ?? []) {
      if (!v.id || v.status?.privacyStatus === "private") continue;
      details.set(v.id, parseIsoDuration(v.contentDetails?.duration ?? ""));
    }
  }

  const seen = new Set<string>();
  const videos: PlaylistVideo[] = [];
  for (const v of wanted) {
    const sec = details.get(v.videoId) ?? 0;
    if (sec <= 0 || seen.has(v.videoId)) continue;
    seen.add(v.videoId);
    videos.push({ id: v.videoId, title: v.title.slice(0, 200) || "Vídeo", durationSec: sec });
  }
  const t = snippet.thumbnails ?? {};
  return {
    id,
    title: (snippet.title ?? "Playlist").slice(0, 120),
    channel: snippet.channelTitle ?? "",
    thumbnail: t.medium?.url ?? t.high?.url ?? t.default?.url ?? null,
    videos,
    unavailable: wanted.length - videos.length,
    truncated,
  };
}

/** Mensagens da tela 30 para cada erro. */
export const YOUTUBE_ERROR_TEXT: Record<YoutubeErrorCode | "link_invalido" | "vazia", string> = {
  link_invalido:
    "Esse link não parece ser de uma playlist do YouTube. Cole o link da playlist ou de um vídeo dela.",
  nao_encontrada:
    "Não encontrei essa playlist. Ela pode ser privada: deixe-a pública ou não listada e tente de novo.",
  vazia: "Essa playlist não tem vídeos disponíveis para importar.",
  cota: "Não consegui abrir a playlist agora. Tente de novo mais tarde.",
  falha: "Não consegui abrir a playlist agora. Tente de novo mais tarde.",
};

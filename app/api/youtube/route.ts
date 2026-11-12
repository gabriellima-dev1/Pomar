import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { fetchPlaylist, YOUTUBE_ERROR_TEXT, YoutubeError } from "@/lib/youtube/client.server";
import { parsePlaylistId } from "@/lib/youtube/parse";

const STATUS = {
  link_invalido: 400,
  nao_encontrada: 404,
  vazia: 422,
  cota: 503,
  falha: 502,
} as const;

function fail(code: keyof typeof STATUS) {
  return NextResponse.json(
    { erro: code, mensagem: YOUTUBE_ERROR_TEXT[code] },
    { status: STATUS[code] },
  );
}

/**
 * Prévia da playlist (telas.md › 30): `GET /api/youtube?url=...`. Exige login; a chave
 * `YOUTUBE_API_KEY` fica só no servidor.
 */
export async function GET(request: NextRequest) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ erro: "login" }, { status: 401 });
  }
  const id = parsePlaylistId(request.nextUrl.searchParams.get("url") ?? "");
  if (!id) return fail("link_invalido");
  try {
    const playlist = await fetchPlaylist(id);
    if (playlist.videos.length === 0) return fail("vazia");
    return NextResponse.json({ playlist });
  } catch (error) {
    return fail(error instanceof YoutubeError ? error.code : "falha");
  }
}

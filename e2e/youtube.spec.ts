/**
 * Aceite da Fase 5 (YouTube): uma playlist importada vira disciplina com durações e
 * unidade em minutos. Usa uma playlist pública real (poucas unidades da cota da API).
 */
import { expect, test } from "@playwright/test";
import { apagarContas, criarConta, db, entrar, eventos, type Conta } from "./apoio";

const PLAYLIST = "https://www.youtube.com/playlist?list=PLHz_AreHm4dkd4lr9G0Up-W-YaHYdTDuP";
let c: Conta;

test.beforeAll(async () => {
  c = await criarConta("yt");
});

test.afterAll(async () => {
  await apagarContas([c]);
});

test("importa a playlist, desmarca um vídeo e cria a disciplina em minutos", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, c, baseURL!);
  await page.goto("/disciplinas/nova/youtube");

  const link = page.getByLabel("Link da playlist");
  await link.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await expect(page.getByText(/não parece ser de uma playlist/)).toBeVisible();

  await link.fill(PLAYLIST);
  const card = page.getByRole("region", { name: "Playlist" });
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.getByRole("button", { name: /^Ver os \d+ vídeos$/ }).click();
  const videos = card.getByRole("checkbox");
  const total = await videos.count();
  expect(total).toBeGreaterThan(1);

  await card.getByText("1,25×").click();
  await videos.first().uncheck();
  await expect(page.getByText(`${total - 1} vídeos ·`)).toBeVisible();
  await expect(page.getByText(/em 1,25× · cerca de \d+ pomodoros/)).toBeVisible();

  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/disciplinas\/[0-9a-f-]{36}$/, { timeout: 30_000 });
  await expect(page.getByText("Minutos", { exact: true })).toBeVisible();

  const subject = (
    await db()
      .from("subjects")
      .select(
        "id, source, video_speed, youtube_playlist_id, chapters(topics(duration_sec, youtube_video_id))",
      )
      .eq("user_id", c.id)
      .single()
  ).data as {
    source: string;
    video_speed: number;
    youtube_playlist_id: string;
    chapters: { topics: { duration_sec: number; youtube_video_id: string }[] }[];
  };
  expect(subject.source).toBe("youtube");
  expect(Number(subject.video_speed)).toBe(1.25);
  expect(subject.youtube_playlist_id).toBe("PLHz_AreHm4dkd4lr9G0Up-W-YaHYdTDuP");
  const topics = subject.chapters.flatMap((ch) => ch.topics);
  expect(topics.length).toBe(total - 1);
  expect(topics.every((t) => t.duration_sec > 0 && t.youtube_video_id)).toBe(true);
  expect(await eventos(c, "subject_created")).toBe(1);
});

-- Disciplina a partir de uma playlist do YouTube (DESIGN §4.1, telas.md › 30).
-- A duração dos vídeos entra no XP do tópico (DESIGN §6.1), então só o servidor grava
-- duração e id de vídeo: o cliente perde o grant dessas colunas e a disciplina é criada
-- por uma função que só a chave secreta executa, com as durações vindas da API.

revoke insert (youtube_video_id, duration_sec) on public.topics from authenticated;

create function public.create_youtube_subject(
  p_user uuid,
  p_title text,
  p_playlist_id text,
  p_color text,
  p_speed numeric,
  p_chapter_title text,
  p_videos jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_subject uuid;
  v_chapter uuid;
begin
  if jsonb_typeof(p_videos) is distinct from 'array' or jsonb_array_length(p_videos) = 0 then
    raise exception 'Escolha ao menos um vídeo.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_videos) > 200 then
    raise exception 'No máximo 200 vídeos.' using errcode = '22023';
  end if;

  insert into public.subjects (user_id, title, source, youtube_playlist_id, color, video_speed)
  values (p_user, p_title, 'youtube', p_playlist_id, p_color, p_speed)
  returning id into v_subject;

  insert into public.chapters (subject_id, position, title)
  values (v_subject, 1, p_chapter_title)
  returning id into v_chapter;

  insert into public.topics (chapter_id, position, title, youtube_video_id, duration_sec)
  select v_chapter, v.ordinality, v.value ->> 'title', v.value ->> 'id',
         (v.value ->> 'duration_sec')::int
  from jsonb_array_elements(p_videos) with ordinality as v;

  return v_subject;
end;
$$;

revoke execute on function public.create_youtube_subject(uuid, text, text, text, numeric, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_youtube_subject(uuid, text, text, text, numeric, text, jsonb)
  to service_role;

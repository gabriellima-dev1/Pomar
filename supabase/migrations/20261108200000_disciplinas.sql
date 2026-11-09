-- Disciplinas (DESIGN.md §4.1, §8): Disciplina → Capítulos → Tópicos.
-- Criadas a partir do catálogo (cópia da estrutura), manualmente ou (Fase 5) do YouTube.

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  source text not null check (source in ('catalog', 'manual', 'youtube')),
  catalog_book_id uuid references public.catalog_books (id) on delete set null,
  youtube_playlist_id text check (char_length(youtube_playlist_id) <= 64),
  -- Mesma paleta de lib/subjects/colors.ts.
  color text not null default 'tomate' check (
    color in ('tomate', 'laranja', 'mel', 'folha', 'menta', 'ceu', 'uva', 'terra')
  ),
  goal_date date,
  daily_goal int check (daily_goal between 1 and 20),
  min_per_page numeric(6, 2) check (min_per_page >= 0.1 and min_per_page <= 60),
  video_speed numeric(3, 2) not null default 1 check (video_speed in (1, 1.25, 1.5, 2)),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.subjects is 'Disciplinas do usuário (DESIGN.md §4.1).';
create index subjects_user_id_created_at_idx on public.subjects (user_id, created_at);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  position int not null check (position >= 1),
  title text not null check (char_length(title) between 1 and 200),
  -- Adiável para trocar posições numa transação (move_chapter).
  constraint chapters_position_unique unique (subject_id, position) deferrable initially immediate
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  position int not null check (position >= 1),
  title text not null check (char_length(title) between 1 and 200),
  page_start int check (page_start between 1 and 20000),
  page_end int check (page_end between 1 and 20000),
  youtube_video_id text check (char_length(youtube_video_id) <= 32),
  duration_sec int check (duration_sec > 0),
  done_at timestamptz,
  check ((page_start is null) = (page_end is null)),
  check (page_end >= page_start),
  constraint topics_position_unique unique (chapter_id, position) deferrable initially immediate
);

-- RLS -----------------------------------------------------------------------

alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.topics enable row level security;

revoke all on public.subjects, public.chapters, public.topics from anon, authenticated;

-- Privilégios por coluna: user_id vem do default; capítulo/tópico não troca de dono.
grant select, delete on public.subjects to authenticated;
grant insert (title, source, catalog_book_id, youtube_playlist_id, color, goal_date, daily_goal,
  min_per_page, video_speed) on public.subjects to authenticated;
grant update (title, color, goal_date, daily_goal, min_per_page, video_speed, archived)
  on public.subjects to authenticated;

grant select, delete on public.chapters to authenticated;
grant insert (subject_id, position, title) on public.chapters to authenticated;
grant update (position, title) on public.chapters to authenticated;

grant select, delete on public.topics to authenticated;
grant insert (chapter_id, position, title, page_start, page_end, youtube_video_id, duration_sec)
  on public.topics to authenticated;
grant update (position, title, page_start, page_end, done_at) on public.topics to authenticated;

create policy "disciplinas: dono lê"
  on public.subjects for select to authenticated
  using (user_id = (select auth.uid()));
create policy "disciplinas: dono cria"
  on public.subjects for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "disciplinas: dono altera"
  on public.subjects for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "disciplinas: dono exclui"
  on public.subjects for delete to authenticated
  using (user_id = (select auth.uid()));

-- Capítulos e tópicos: dono da disciplina (a subconsulta também passa pela RLS de subjects).
create policy "capítulos: dono da disciplina"
  on public.chapters for all to authenticated
  using (exists (
    select 1 from public.subjects s
    where s.id = chapters.subject_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.subjects s
    where s.id = chapters.subject_id and s.user_id = (select auth.uid())
  ));

create policy "tópicos: dono da disciplina"
  on public.topics for all to authenticated
  using (exists (
    select 1 from public.chapters c join public.subjects s on s.id = c.subject_id
    where c.id = topics.chapter_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.chapters c join public.subjects s on s.id = c.subject_id
    where c.id = topics.chapter_id and s.user_id = (select auth.uid())
  ));

-- Funções (security invoker: a RLS acima continua valendo; cada chamada é uma transação) ----

-- Copia do catálogo só os tópicos escolhidos, renumerando as posições.
create function public.create_subject_from_catalog(
  p_book_id uuid,
  p_topic_ids uuid[],
  p_title text,
  p_color text,
  p_goal_date date default null,
  p_daily_goal int default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_subject uuid;
  v_chapter uuid;
  v_position int := 0;
  ch record;
begin
  if p_topic_ids is null or cardinality(p_topic_ids) = 0 then
    raise exception 'Escolha ao menos um tópico.' using errcode = '22023';
  end if;

  insert into public.subjects (title, source, catalog_book_id, color, goal_date, daily_goal)
  values (p_title, 'catalog', p_book_id, p_color, p_goal_date, p_daily_goal)
  returning id into v_subject;

  for ch in
    select c.id, c.title
    from public.catalog_chapters c
    where c.book_id = p_book_id
      and exists (
        select 1 from public.catalog_topics t
        where t.chapter_id = c.id and t.id = any (p_topic_ids)
      )
    order by c.position
  loop
    v_position := v_position + 1;
    insert into public.chapters (subject_id, position, title)
    values (v_subject, v_position, ch.title)
    returning id into v_chapter;

    insert into public.topics (chapter_id, position, title, page_start, page_end)
    select v_chapter, row_number() over (order by t.position), t.title, t.page_start, t.page_end
    from public.catalog_topics t
    where t.chapter_id = ch.id and t.id = any (p_topic_ids);
  end loop;

  if v_position = 0 then
    raise exception 'Os tópicos escolhidos não são deste livro.' using errcode = '22023';
  end if;

  return v_subject;
end;
$$;

-- p_chapters: [{"title": "...", "topics": [{"title": "...", "page_start": 1, "page_end": 9}]}]
create function public.create_manual_subject(
  p_title text,
  p_color text,
  p_chapters jsonb,
  p_goal_date date default null,
  p_daily_goal int default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_subject uuid;
  v_chapter uuid;
  ch record;
begin
  if jsonb_typeof(p_chapters) is distinct from 'array' or jsonb_array_length(p_chapters) = 0 then
    raise exception 'Crie ao menos um capítulo.' using errcode = '22023';
  end if;

  insert into public.subjects (title, source, color, goal_date, daily_goal)
  values (p_title, 'manual', p_color, p_goal_date, p_daily_goal)
  returning id into v_subject;

  for ch in select value, ordinality from jsonb_array_elements(p_chapters) with ordinality
  loop
    if jsonb_typeof(ch.value -> 'topics') is distinct from 'array'
      or jsonb_array_length(ch.value -> 'topics') = 0 then
      raise exception 'Cada capítulo precisa de ao menos um tópico.' using errcode = '22023';
    end if;

    insert into public.chapters (subject_id, position, title)
    values (v_subject, ch.ordinality, ch.value ->> 'title')
    returning id into v_chapter;

    insert into public.topics (chapter_id, position, title, page_start, page_end)
    select v_chapter, t.ordinality, t.value ->> 'title',
      (t.value ->> 'page_start')::int, (t.value ->> 'page_end')::int
    from jsonb_array_elements(ch.value -> 'topics') with ordinality as t;
  end loop;

  return v_subject;
end;
$$;

-- Troca o capítulo com o vizinho de cima (p_direction < 0) ou de baixo (> 0).
create function public.move_chapter(p_chapter_id uuid, p_direction int)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_subject uuid;
  v_position int;
  v_other uuid;
  v_other_position int;
begin
  select subject_id, position into v_subject, v_position
  from public.chapters where id = p_chapter_id;
  if not found then
    raise exception 'Capítulo não encontrado.' using errcode = 'P0002';
  end if;

  if p_direction < 0 then
    select id, position into v_other, v_other_position from public.chapters
    where subject_id = v_subject and position < v_position order by position desc limit 1;
  else
    select id, position into v_other, v_other_position from public.chapters
    where subject_id = v_subject and position > v_position order by position asc limit 1;
  end if;
  if v_other is null then
    return;
  end if;

  set constraints public.chapters_position_unique deferred;
  update public.chapters set position = v_other_position where id = p_chapter_id;
  update public.chapters set position = v_position where id = v_other;
end;
$$;

create function public.move_topic(p_topic_id uuid, p_direction int)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_chapter uuid;
  v_position int;
  v_other uuid;
  v_other_position int;
begin
  select chapter_id, position into v_chapter, v_position
  from public.topics where id = p_topic_id;
  if not found then
    raise exception 'Tópico não encontrado.' using errcode = 'P0002';
  end if;

  if p_direction < 0 then
    select id, position into v_other, v_other_position from public.topics
    where chapter_id = v_chapter and position < v_position order by position desc limit 1;
  else
    select id, position into v_other, v_other_position from public.topics
    where chapter_id = v_chapter and position > v_position order by position asc limit 1;
  end if;
  if v_other is null then
    return;
  end if;

  set constraints public.topics_position_unique deferred;
  update public.topics set position = v_other_position where id = p_topic_id;
  update public.topics set position = v_position where id = v_other;
end;
$$;

revoke execute on function
  public.create_subject_from_catalog(uuid, uuid[], text, text, date, int),
  public.create_manual_subject(text, text, jsonb, date, int),
  public.move_chapter(uuid, int),
  public.move_topic(uuid, int)
  from public, anon;
grant execute on function
  public.create_subject_from_catalog(uuid, uuid[], text, text, date, int),
  public.create_manual_subject(text, text, jsonb, date, int),
  public.move_chapter(uuid, int),
  public.move_topic(uuid, int)
  to authenticated;

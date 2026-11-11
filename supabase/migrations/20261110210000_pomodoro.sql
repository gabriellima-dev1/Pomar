-- Sessões de pomodoro (DESIGN.md §4.5, §6.1, §8) e recalibração automática (§4.2).
-- O cliente só lê. Começar, pausar, retomar, encerrar e concluir passam por funções
-- do servidor, que usam o relógio do banco: a regra dos 90% não depende do navegador.

create table public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete set null,
  topic_id uuid references public.topics (id) on delete set null,
  planned_focus_sec int not null check (planned_focus_sec between 900 and 3600),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  paused_sec int not null default 0 check (paused_sec >= 0),
  pauses int not null default 0 check (pauses >= 0),
  -- Início da pausa em andamento (não está no §8: permite somar as pausas no servidor).
  paused_at timestamptz,
  status text not null default 'running' check (status in ('running', 'completed', 'cancelled')),
  cancel_reason text check (cancel_reason in ('user', 'restart', 'stale')),
  pages_logged int check (pages_logged between 0 and 500),
  xp_awarded int not null default 0 check (xp_awarded >= 0),
  check ((status = 'running') = (ended_at is null)),
  check (status = 'running' or paused_at is null)
);

comment on table public.pomodoro_sessions is 'Ciclos de foco (DESIGN.md §4.5). Escrita só por funções do servidor.';

-- No máximo 1 ciclo em andamento por usuário (outro aparelho ou recarregamento reaproveitam).
create unique index pomodoro_sessions_one_running_idx
  on public.pomodoro_sessions (user_id) where status = 'running';
create index pomodoro_sessions_user_ended_idx on public.pomodoro_sessions (user_id, ended_at);
create index pomodoro_sessions_subject_ended_idx on public.pomodoro_sessions (subject_id, ended_at);

alter table public.pomodoro_sessions enable row level security;
revoke all on public.pomodoro_sessions from anon, authenticated;
grant select on public.pomodoro_sessions to authenticated;

create policy "pomodoros: dono lê"
  on public.pomodoro_sessions for select to authenticated
  using (user_id = (select auth.uid()));

-- Média móvel do ritmo observado (§4.2). Só o servidor altera (sem grant de update).
alter table public.subjects add column pace_ema numeric(6, 2)
  check (pace_ema >= 0.1 and pace_ema <= 60);

-- Funções ---------------------------------------------------------------------

-- Fração mínima do foco planejado para o ciclo contar (mesmo valor de lib/timer.ts).
create function public.pomodoro_completion_ratio()
returns numeric
language sql
immutable
set search_path = ''
as $$ select 0.9::numeric $$;

-- Pausas somadas até agora (inclui a pausa em andamento), em segundos.
create function public.pomodoro_paused_total(s public.pomodoro_sessions)
returns int
language sql
stable
set search_path = ''
as $$
  select s.paused_sec + coalesce(floor(extract(epoch from (now() - s.paused_at)))::int, 0)
$$;

-- Começa um ciclo de foco. A duração vem do perfil (o cliente não envia).
-- Se já houver um ciclo em andamento com tempo sobrando, devolve esse ciclo;
-- se o tempo dele já acabou há muito, ele é encerrado como abandonado.
create function public.start_pomodoro(p_subject_id uuid default null, p_topic_id uuid default null)
returns public.pomodoro_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_session public.pomodoro_sessions;
  v_focus int;
begin
  if v_uid is null then
    raise exception 'Faça login para começar.' using errcode = '42501';
  end if;

  select * into v_session from public.pomodoro_sessions
  where user_id = v_uid and status = 'running'
  for update;

  if found then
    if now() < v_session.started_at
        + make_interval(secs => public.pomodoro_paused_total(v_session) + v_session.planned_focus_sec)
        + interval '2 hours' then
      return v_session;
    end if;
    update public.pomodoro_sessions
      set status = 'cancelled', cancel_reason = 'stale', ended_at = now(),
          paused_sec = public.pomodoro_paused_total(v_session), paused_at = null
      where id = v_session.id;
  end if;

  if p_subject_id is not null and not exists (
    select 1 from public.subjects where id = p_subject_id and user_id = v_uid
  ) then
    raise exception 'Disciplina não encontrada.' using errcode = 'P0002';
  end if;
  if p_topic_id is not null and not exists (
    select 1 from public.topics t join public.chapters c on c.id = t.chapter_id
    where t.id = p_topic_id and c.subject_id = p_subject_id
  ) then
    raise exception 'Tópico não encontrado.' using errcode = 'P0002';
  end if;

  select focus_min into v_focus from public.profiles where id = v_uid;

  insert into public.pomodoro_sessions (user_id, subject_id, topic_id, planned_focus_sec)
  values (v_uid, p_subject_id, p_topic_id, coalesce(v_focus, 25) * 60)
  returning * into v_session;
  return v_session;
end;
$$;

create function public.pause_pomodoro(p_id uuid)
returns public.pomodoro_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.pomodoro_sessions;
begin
  update public.pomodoro_sessions
    set paused_at = now(), pauses = pauses + 1
    where id = p_id and user_id = auth.uid() and status = 'running' and paused_at is null
    returning * into v_session;
  if not found then
    select * into v_session from public.pomodoro_sessions where id = p_id and user_id = auth.uid();
  end if;
  return v_session;
end;
$$;

create function public.resume_pomodoro(p_id uuid)
returns public.pomodoro_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.pomodoro_sessions;
begin
  update public.pomodoro_sessions s
    set paused_sec = public.pomodoro_paused_total(s), paused_at = null
    where id = p_id and user_id = auth.uid() and status = 'running' and paused_at is not null
    returning * into v_session;
  if not found then
    select * into v_session from public.pomodoro_sessions where id = p_id and user_id = auth.uid();
  end if;
  return v_session;
end;
$$;

-- Encerrar sem concluir (não dá XP; pausar não pune). `restart` = "Reiniciar ciclo" do nudge.
create function public.cancel_pomodoro(p_id uuid, p_reason text default 'user')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_reason not in ('user', 'restart') then
    raise exception 'Motivo inválido.' using errcode = '22023';
  end if;
  update public.pomodoro_sessions s
    set status = 'cancelled', cancel_reason = p_reason, ended_at = now(),
        paused_sec = public.pomodoro_paused_total(s), paused_at = null
    where id = p_id and user_id = auth.uid() and status = 'running';
end;
$$;

-- Conclui o ciclo se o foco efetivo (sem pausas) chegou a 90% do planejado.
-- `ended_at` fica no fim previsto do ciclo, para não inflar o tempo de quem volta
-- horas depois. Idempotente: concluir de novo devolve o mesmo resultado.
create function public.complete_pomodoro(p_id uuid)
returns table (focus_sec int, fruits_today int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_session public.pomodoro_sessions;
  v_paused int;
  v_effective numeric;
  v_tz text;
begin
  select * into v_session from public.pomodoro_sessions
  where id = p_id and user_id = v_uid
  for update;
  if not found then
    raise exception 'Ciclo não encontrado.' using errcode = 'P0002';
  end if;
  if v_session.status = 'cancelled' then
    raise exception 'Este ciclo foi encerrado.' using errcode = '22023';
  end if;

  if v_session.status = 'running' then
    v_paused := public.pomodoro_paused_total(v_session);
    v_effective := extract(epoch from (now() - v_session.started_at)) - v_paused;
    if v_effective < public.pomodoro_completion_ratio() * v_session.planned_focus_sec then
      raise exception 'O ciclo ainda não terminou.' using errcode = '22023';
    end if;
    update public.pomodoro_sessions
      set status = 'completed', paused_sec = v_paused, paused_at = null,
          ended_at = least(now(), started_at + make_interval(secs => v_paused + planned_focus_sec))
      where id = p_id
      returning * into v_session;
  end if;

  select timezone into v_tz from public.profiles where id = v_uid;
  return query
  select
    (extract(epoch from (v_session.ended_at - v_session.started_at)))::int - v_session.paused_sec,
    (select count(*)::int from public.pomodoro_sessions s
      where s.user_id = v_uid and s.status = 'completed'
        and (s.ended_at at time zone coalesce(v_tz, 'America/Maceio'))::date
          = (now() at time zone coalesce(v_tz, 'America/Maceio'))::date);
end;
$$;

-- Páginas lidas no ciclo (modal de fim de ciclo). Marca o tópico se pedido e
-- atualiza a média móvel do ritmo (α = 0,3, partindo do ritmo atual; mesma conta
-- de lib/pace.ts). Sugere recalibrar quando a média diverge mais de 20%.
-- A média só anda na 1ª vez que as páginas do ciclo são informadas.
create function public.log_pomodoro_pages(p_id uuid, p_pages int, p_finish_topic boolean default false)
returns table (observed numeric, ema numeric, current_pace numeric, suggest boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_session public.pomodoro_sessions;
  v_subject public.subjects;
  v_global numeric;
  v_focus numeric;
  v_observed numeric;
  v_current numeric;
  v_ema numeric;
begin
  if p_pages is null or p_pages < 0 or p_pages > 500 then
    raise exception 'Use de 0 a 500 páginas.' using errcode = '22023';
  end if;

  select * into v_session from public.pomodoro_sessions
  where id = p_id and user_id = v_uid and status = 'completed'
  for update;
  if not found then
    raise exception 'Ciclo concluído não encontrado.' using errcode = 'P0002';
  end if;

  update public.pomodoro_sessions set pages_logged = p_pages where id = p_id;

  if p_finish_topic and v_session.topic_id is not null then
    update public.topics set done_at = coalesce(done_at, now()) where id = v_session.topic_id;
  end if;

  select * into v_subject from public.subjects where id = v_session.subject_id and user_id = v_uid;
  if not found or v_subject.source = 'youtube' then
    return query select null::numeric, null::numeric, null::numeric, false;
    return;
  end if;

  select min_per_page into v_global from public.profiles where id = v_uid;
  v_current := coalesce(v_subject.min_per_page, v_global, 3);
  v_ema := v_subject.pace_ema;

  if p_pages > 0 and v_session.pages_logged is null then
    v_focus := extract(epoch from (v_session.ended_at - v_session.started_at)) - v_session.paused_sec;
    v_observed := round(v_focus / 60 / p_pages, 2);
    v_ema := round(0.3 * v_observed + 0.7 * coalesce(v_subject.pace_ema, v_current), 2);
    v_ema := least(60, greatest(0.1, v_ema));
    update public.subjects set pace_ema = v_ema where id = v_subject.id;
  end if;

  return query select
    v_observed,
    v_ema,
    v_current,
    coalesce(v_ema is not null and abs(v_ema - v_current) / v_current > 0.2, false);
end;
$$;

-- Aceitar a sugestão: o ritmo da disciplina passa a ser a média observada.
create function public.accept_pace_suggestion(p_subject_id uuid)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ema numeric;
begin
  select pace_ema into v_ema from public.subjects
  where id = p_subject_id and user_id = auth.uid();
  if v_ema is null then
    raise exception 'Sem ritmo observado para esta disciplina.' using errcode = 'P0002';
  end if;
  update public.subjects set min_per_page = v_ema where id = p_subject_id;
  insert into public.calibrations (user_id, subject_id, pages, seconds, source)
  values (auth.uid(), p_subject_id, 1, greatest(1, round(v_ema * 60)::int), 'auto');
  return v_ema;
end;
$$;

-- Recusar a sugestão: a média recomeça do ritmo atual, para não insistir a cada ciclo.
create function public.dismiss_pace_suggestion(p_subject_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.subjects s
    set pace_ema = coalesce(
      s.min_per_page,
      (select p.min_per_page from public.profiles p where p.id = auth.uid()),
      3
    )
    where s.id = p_subject_id and s.user_id = auth.uid();
end;
$$;

revoke execute on function
  public.pomodoro_paused_total(public.pomodoro_sessions),
  public.start_pomodoro(uuid, uuid),
  public.pause_pomodoro(uuid),
  public.resume_pomodoro(uuid),
  public.cancel_pomodoro(uuid, text),
  public.complete_pomodoro(uuid),
  public.log_pomodoro_pages(uuid, int, boolean),
  public.accept_pace_suggestion(uuid),
  public.dismiss_pace_suggestion(uuid)
from public, anon;

grant execute on function
  public.start_pomodoro(uuid, uuid),
  public.pause_pomodoro(uuid),
  public.resume_pomodoro(uuid),
  public.cancel_pomodoro(uuid, text),
  public.complete_pomodoro(uuid),
  public.log_pomodoro_pages(uuid, int, boolean),
  public.accept_pace_suggestion(uuid),
  public.dismiss_pace_suggestion(uuid)
to authenticated;

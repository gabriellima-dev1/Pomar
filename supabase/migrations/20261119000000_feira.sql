-- Feira (ligas semanais, DESIGN §6.6) e apelido (docs/design/telas.md › 23–25).
-- Grupos, posições e divisões são calculados no servidor (lib/league/*) e gravados
-- com a chave secreta; o cliente só lê o próprio grupo pela função league_standings().

-- Apelido e divisão ------------------------------------------------------------

alter table public.profiles
  add constraint profiles_username_format check (username ~ '^[a-z0-9._]{3,20}$');

alter table public.profiles
  add column league_division text not null default 'bronze'
    check (league_division in ('bronze', 'prata', 'ouro', 'esmeralda'));

comment on column public.profiles.league_division is
  'Divisão da Feira da pessoa (muda só no fechamento semanal, pelo servidor).';

-- Apelido e perfil público são escolhas da pessoa (perfil público começa desmarcado).
grant update (username, public_profile) on public.profiles to authenticated;

-- "Disponível / já em uso" ao digitar (telas.md › 24), sem expor os perfis.
create function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_username ~ '^[a-z0-9._]{3,20}$'
    and not exists (
      select 1 from public.profiles
      where username = p_username and id <> (select auth.uid())
    );
$$;

-- Semanas, grupos e participantes ------------------------------------------------

create table public.league_weeks (
  week_start date primary key check (extract(isodow from week_start) = 1),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

comment on table public.league_weeks is
  'Semanas da Feira (segunda a domingo, America/Sao_Paulo). Trava idempotente de abertura e fechamento.';

create table public.league_groups (
  id uuid primary key default gen_random_uuid(),
  week_start date not null references public.league_weeks (week_start) on delete cascade,
  division text not null check (division in ('bronze', 'prata', 'ouro', 'esmeralda')),
  -- Faixas de horas (0 = <3h, 1 = 3–7h, 2 = 7–14h, 3 = 14h+); vizinhas podem se juntar.
  band_min int not null check (band_min between 0 and 3),
  band_max int not null check (band_max between 0 and 3 and band_max >= band_min),
  created_at timestamptz not null default now(),
  unique (id, week_start)
);

create index league_groups_week_idx on public.league_groups (week_start);

create table public.league_members (
  group_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  -- Preenchidos no fechamento; durante a semana o XP é somado na leitura.
  xp_week int not null default 0 check (xp_week >= 0),
  final_rank int check (final_rank >= 1),
  outcome text check (outcome in ('up', 'stay', 'down')),
  result_seen_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id),
  unique (user_id, week_start),
  foreign key (group_id, week_start)
    references public.league_groups (id, week_start) on delete cascade
);

comment on table public.league_members is
  'Participantes de cada grupo da Feira. Uma pessoa está em no máximo 1 grupo por semana.';

-- RLS ---------------------------------------------------------------------------

alter table public.league_weeks enable row level security;
alter table public.league_groups enable row level security;
alter table public.league_members enable row level security;

revoke all on public.league_weeks, public.league_groups, public.league_members
  from anon, authenticated;

grant select on public.league_groups, public.league_members to authenticated;
-- A tela "Resultado da semana" (25) aparece uma vez: a pessoa marca como vista.
grant update (result_seen_at) on public.league_members to authenticated;

create policy "feira: participante lê as próprias participações"
  on public.league_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy "feira: participante marca o resultado como visto"
  on public.league_members for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "feira: participante lê os próprios grupos"
  on public.league_groups for select to authenticated
  using (exists (
    select 1 from public.league_members m
    where m.group_id = league_groups.id and m.user_id = (select auth.uid())
  ));

grant all on public.league_weeks, public.league_groups, public.league_members to service_role;

-- Leitura do ranking --------------------------------------------------------------

-- Grupo da semana em andamento de quem chama, com o XP da semana de cada membro
-- (soma de xp_events entre segunda 00:00 e a segunda seguinte, em São Paulo).
-- Só sai o apelido, os selos e o XP da semana: nome, e-mail e o resto ficam privados.
create function public.league_standings()
returns table (
  group_id uuid,
  week_start date,
  division text,
  band_min int,
  band_max int,
  username text,
  is_me boolean,
  is_demo boolean,
  public_profile boolean,
  xp int,
  last_xp_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with g as (
    select lg.*
    from public.league_groups lg
    join public.league_members lm on lm.group_id = lg.id
    where lm.user_id = (select auth.uid())
      and lg.week_start = (date_trunc('week', now() at time zone 'America/Sao_Paulo'))::date
  )
  select g.id, g.week_start, g.division, g.band_min, g.band_max,
         p.username, m.user_id = (select auth.uid()), p.is_demo, p.public_profile,
         coalesce(x.xp, 0)::int, x.last_at
  from g
  join public.league_members m on m.group_id = g.id
  join public.profiles p on p.id = m.user_id
  left join lateral (
    select sum(e.amount) as xp, max(e.created_at) as last_at
    from public.xp_events e
    where e.user_id = m.user_id
      and e.amount > 0
      and e.created_at >= (g.week_start::timestamp at time zone 'America/Sao_Paulo')
      and e.created_at < ((g.week_start + 7)::timestamp at time zone 'America/Sao_Paulo')
  ) x on true;
$$;

-- Funções do servidor (só service_role) ------------------------------------------

-- Minutos de foco (em segundos) de cada pessoa num intervalo, para as faixas de horas.
create function public.league_focus_seconds(p_users uuid[], p_from timestamptz, p_to timestamptz)
returns table (user_id uuid, focus_sec bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select s.user_id,
         sum(greatest(0, extract(epoch from (s.ended_at - s.started_at)) - s.paused_sec))::bigint
  from public.pomodoro_sessions s
  where s.user_id = any (p_users)
    and s.status = 'completed'
    and s.ended_at >= p_from
    and s.ended_at < p_to
  group by s.user_id;
$$;

-- XP da semana de cada participante dos grupos de uma semana (para o fechamento).
create function public.league_week_xp(p_week date)
returns table (user_id uuid, group_id uuid, division text, username text, xp int, last_xp_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id, g.id, g.division, p.username, coalesce(x.xp, 0)::int, x.last_at
  from public.league_groups g
  join public.league_members m on m.group_id = g.id
  join public.profiles p on p.id = m.user_id
  left join lateral (
    select sum(e.amount) as xp, max(e.created_at) as last_at
    from public.xp_events e
    where e.user_id = m.user_id
      and e.amount > 0
      and e.created_at >= (p_week::timestamp at time zone 'America/Sao_Paulo')
      and e.created_at < ((p_week + 7)::timestamp at time zone 'America/Sao_Paulo')
  ) x on true
  where g.week_start = p_week;
$$;

-- Abre a semana com os grupos montados em lib/league/grouping.ts.
-- Devolve false se a semana já tinha sido aberta (outro pedido chegou antes).
create function public.apply_league_open(p_week date, p_groups jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  g jsonb;
  v_group uuid;
begin
  insert into public.league_weeks (week_start) values (p_week) on conflict do nothing;
  if not found then
    return false;
  end if;

  for g in select * from jsonb_array_elements(coalesce(p_groups, '[]'::jsonb)) loop
    insert into public.league_groups (week_start, division, band_min, band_max)
    values (p_week, g ->> 'division', (g ->> 'band_min')::int, (g ->> 'band_max')::int)
    returning id into v_group;

    insert into public.league_members (group_id, user_id, week_start)
    select v_group, (u #>> '{}')::uuid, p_week
    from jsonb_array_elements(g -> 'members') u
    on conflict (user_id, week_start) do nothing;
  end loop;

  return true;
end;
$$;

-- Fecha a semana com o resultado calculado em lib/league/ranking.ts: posição final,
-- XP da semana, saída e a divisão da semana seguinte. Devolve false se já estava fechada.
create function public.apply_league_close(p_week date, p_results jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.league_weeks set closed_at = now()
  where week_start = p_week and closed_at is null;
  if not found then
    return false;
  end if;

  update public.league_members m
  set xp_week = (r ->> 'xp')::int,
      final_rank = (r ->> 'rank')::int,
      outcome = r ->> 'outcome'
  from jsonb_array_elements(coalesce(p_results, '[]'::jsonb)) r
  where m.week_start = p_week and m.user_id = (r ->> 'user_id')::uuid;

  update public.profiles p
  set league_division = r ->> 'division'
  from jsonb_array_elements(coalesce(p_results, '[]'::jsonb)) r
  where p.id = (r ->> 'user_id')::uuid
    and p.league_division is distinct from r ->> 'division';

  return true;
end;
$$;

revoke execute on function
  public.username_available(text),
  public.league_standings(),
  public.league_focus_seconds(uuid[], timestamptz, timestamptz),
  public.league_week_xp(date),
  public.apply_league_open(date, jsonb),
  public.apply_league_close(date, jsonb)
from public, anon, authenticated;

grant execute on function
  public.username_available(text),
  public.league_standings()
to authenticated;

grant execute on function
  public.league_focus_seconds(uuid[], timestamptz, timestamptz),
  public.league_week_xp(date),
  public.apply_league_open(date, jsonb),
  public.apply_league_close(date, jsonb)
to service_role;

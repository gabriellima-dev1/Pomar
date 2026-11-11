-- Gamificação (DESIGN.md §6.1–6.5, §6.7, §8): XP, níveis, ofensiva, emblemas diários,
-- colheitas semanais e temas.
--
-- As regras ficam em TypeScript puro (lib/gamification/*, com testes) e rodam só no
-- servidor. O cliente apenas lê as próprias linhas; quem grava é o servidor com a chave
-- secreta (service_role), por meio das funções apply_* abaixo, que aplicam o resultado
-- numa transação. O cliente só altera as marcas de "já vi" (seen_at, tab_seen_at, level_seen).

-- Catálogos -------------------------------------------------------------------

-- Emblemas do §6.4. Nome, regra e textos ficam em lib/gamification/catalog.ts
-- (assim a regra dos emblemas ocultos não fica legível pela API).
create table public.badges (
  code text primary key,
  rarity text not null check (rarity in ('comum', 'incomum', 'raro')),
  hidden boolean not null default false,
  weight int not null check (weight > 0),
  position int not null unique
);

comment on table public.badges is 'Emblemas diários (DESIGN.md §6.4). Textos em lib/gamification/catalog.ts.';

insert into public.badges (code, rarity, hidden, weight, position) values
  ('fruto_do_dia', 'comum', false, 10, 1),
  ('madrugador', 'comum', false, 10, 2),
  ('coruja', 'comum', false, 10, 3),
  ('maratona', 'incomum', false, 5, 4),
  ('sem_pausa', 'incomum', false, 5, 5),
  ('explorador', 'incomum', false, 5, 6),
  ('finalizador', 'incomum', false, 5, 7),
  ('constante', 'comum', false, 10, 8),
  ('pontual', 'incomum', false, 5, 9),
  ('retorno', 'incomum', false, 5, 10),
  ('fruto_dourado', 'raro', true, 1, 11),
  ('lua_cheia', 'raro', true, 1, 12);

create table public.themes (
  code text primary key,
  unlock_rule text not null check (unlock_rule in ('free', 'harvest_prata', 'harvest_ouro'))
);

comment on table public.themes is 'Temas (DESIGN.md §6.7). Configuração visual em themes/*.ts.';

insert into public.themes (code, unlock_rule) values
  ('classico', 'free'),
  ('noturno', 'free'),
  ('halloween', 'harvest_prata'),
  ('natal', 'harvest_ouro');

alter table public.badges enable row level security;
alter table public.themes enable row level security;
revoke all on public.badges, public.themes from anon, authenticated;
grant select on public.badges, public.themes to authenticated;
create policy "emblemas: logados leem" on public.badges for select to authenticated using (true);
create policy "temas: logados leem" on public.themes for select to authenticated using (true);

-- XP --------------------------------------------------------------------------

-- Cada ganho de XP é um evento com chave única por usuário (pomodoro:<id>,
-- first_of_day:<dia>, topic:<id>, chapter:<id>, subject:<id>): repetir não duplica.
create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('pomodoro', 'first_of_day', 'topic', 'chapter', 'subject')),
  amount int not null check (amount between 0 and 1000),
  ref_id uuid,
  dedupe_key text not null check (char_length(dedupe_key) <= 80),
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

comment on table public.xp_events is 'Ganhos de XP (DESIGN.md §6.1). Escrita só pelo servidor.';
create index xp_events_user_created_idx on public.xp_events (user_id, created_at);

alter table public.xp_events enable row level security;
revoke all on public.xp_events from anon, authenticated;
grant select on public.xp_events to authenticated;
create policy "xp: dono lê" on public.xp_events for select to authenticated
  using (user_id = (select auth.uid()));

-- Emblemas diários, colheitas e temas -----------------------------------------

create table public.user_daily_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  badge_code text not null references public.badges (code),
  created_at timestamptz not null default now(),
  -- Quando a revelação (tela "Fruto de ontem") foi vista.
  seen_at timestamptz,
  primary key (user_id, day)
);

comment on table public.user_daily_badges is '1 emblema por dia com pomodoro (DESIGN.md §6.4), sorteado no servidor.';

create table public.weekly_harvests (
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  tier text not null check (tier in ('bronze', 'prata', 'ouro')),
  days int not null check (days between 3 and 7),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

comment on table public.weekly_harvests is 'Colheita da semana (DESIGN.md §6.5); sobe de faixa durante a semana.';

-- Só os temas conquistados (Halloween, Natal). Clássico e Noturno são livres.
create table public.user_themes (
  user_id uuid not null references auth.users (id) on delete cascade,
  theme_code text not null references public.themes (code),
  unlocked_at timestamptz not null default now(),
  -- Semana da colheita que desbloqueou (selo no histórico de colheitas).
  source_week date,
  -- Revelação (tela "Tema desbloqueado") vista.
  seen_at timestamptz,
  -- Selo "Novo · conquistado" na aba Temas dispensado (aplicou ou abriu a aba).
  tab_seen_at timestamptz,
  primary key (user_id, theme_code)
);

comment on table public.user_themes is 'Temas conquistados (DESIGN.md §6.7). Ficam para sempre.';

alter table public.user_daily_badges enable row level security;
alter table public.weekly_harvests enable row level security;
alter table public.user_themes enable row level security;
revoke all on public.user_daily_badges, public.weekly_harvests, public.user_themes
  from anon, authenticated;

grant select on public.user_daily_badges, public.weekly_harvests, public.user_themes
  to authenticated;
grant update (seen_at) on public.user_daily_badges to authenticated;
grant update (seen_at, tab_seen_at) on public.user_themes to authenticated;

create policy "emblemas do dia: dono lê" on public.user_daily_badges for select to authenticated
  using (user_id = (select auth.uid()));
create policy "emblemas do dia: dono marca como visto" on public.user_daily_badges
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "colheitas: dono lê" on public.weekly_harvests for select to authenticated
  using (user_id = (select auth.uid()));

create policy "temas do usuário: dono lê" on public.user_themes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "temas do usuário: dono marca como visto" on public.user_themes
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Perfil ----------------------------------------------------------------------

-- Tema nulo = automático (Clássico; Noturno com o sistema em modo escuro).
-- Até aqui ninguém escolhia tema, então todos voltam para o automático.
alter table public.profiles alter column theme drop not null;
alter table public.profiles alter column theme drop default;
update public.profiles set theme = null where theme = 'classico';
alter table public.profiles add constraint profiles_theme_check
  check (theme in ('classico', 'noturno', 'halloween', 'natal'));

-- Último nível já celebrado (tela "Subiu de nível"); o cliente marca como visto.
alter table public.profiles add column level_seen int not null default 1 check (level_seen >= 1);
grant update (level_seen) on public.profiles to authenticated;

-- Funções de aplicação (só service_role) --------------------------------------

-- Soma os eventos novos (ignora chaves repetidas) e recalcula o XP total.
-- O nível é calculado no TypeScript (lib/gamification/levels.ts) a partir do total.
create function public.apply_xp(p_user uuid, p_events jsonb)
returns table (old_total int, new_total int, inserted text[])
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old int;
  v_new int;
  v_inserted text[];
begin
  select xp_total into v_old from public.profiles where id = p_user for update;
  if not found then
    raise exception 'Perfil não encontrado.' using errcode = 'P0002';
  end if;

  with ins as (
    insert into public.xp_events (user_id, source, amount, ref_id, dedupe_key)
    select p_user, e ->> 'source', (e ->> 'amount')::int, nullif(e ->> 'ref_id', '')::uuid,
           e ->> 'dedupe_key'
    from jsonb_array_elements(coalesce(p_events, '[]'::jsonb)) e
    on conflict (user_id, dedupe_key) do nothing
    returning dedupe_key
  )
  select coalesce(array_agg(dedupe_key), '{}') into v_inserted from ins;

  select coalesce(sum(amount), 0)::int into v_new from public.xp_events where user_id = p_user;
  update public.profiles set xp_total = v_new where id = p_user;

  return query select v_old, v_new, v_inserted;
end;
$$;

-- Aplica o fechamento dos dias calculado no servidor (lib/gamification/close.ts).
-- Trava otimista: só aplica se `last_closed_day` ainda for o valor lido no cálculo;
-- senão outro pedido já fechou esses dias e nada muda (devolve false).
create function public.apply_day_close(
  p_user uuid,
  p_expected date,
  p_last_closed date,
  p_streak int,
  p_streak_best int,
  p_freezes int,
  p_badges jsonb,
  p_harvests jsonb,
  p_themes jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current date;
begin
  select last_closed_day into v_current from public.profiles where id = p_user for update;
  if not found or v_current is distinct from p_expected then
    return false;
  end if;

  update public.profiles
    set last_closed_day = p_last_closed,
        streak_current = p_streak,
        streak_best = greatest(streak_best, p_streak_best),
        freezes = p_freezes
    where id = p_user;

  insert into public.user_daily_badges (user_id, day, badge_code)
  select p_user, (b ->> 'day')::date, b ->> 'code'
  from jsonb_array_elements(coalesce(p_badges, '[]'::jsonb)) b
  on conflict (user_id, day) do nothing;

  -- A faixa só sobe (bronze < prata < ouro).
  insert into public.weekly_harvests (user_id, week_start, tier, days)
  select p_user, (h ->> 'week_start')::date, h ->> 'tier', (h ->> 'days')::int
  from jsonb_array_elements(coalesce(p_harvests, '[]'::jsonb)) h
  on conflict (user_id, week_start) do update
    set tier = excluded.tier, days = excluded.days, updated_at = now()
    where excluded.days > public.weekly_harvests.days;

  insert into public.user_themes (user_id, theme_code, source_week)
  select p_user, t ->> 'code', nullif(t ->> 'week', '')::date
  from jsonb_array_elements(coalesce(p_themes, '[]'::jsonb)) t
  on conflict (user_id, theme_code) do nothing;

  return true;
end;
$$;

revoke execute on function
  public.apply_xp(uuid, jsonb),
  public.apply_day_close(uuid, date, date, int, int, int, jsonb, jsonb, jsonb)
from public, anon, authenticated;

grant execute on function
  public.apply_xp(uuid, jsonb),
  public.apply_day_close(uuid, date, date, int, int, int, jsonb, jsonb, jsonb)
to service_role;

-- O servidor (service_role) lê e grava as tabelas novas diretamente.
grant all on public.badges, public.themes, public.xp_events, public.user_daily_badges,
  public.weekly_harvests, public.user_themes to service_role;

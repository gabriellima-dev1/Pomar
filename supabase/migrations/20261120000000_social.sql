-- Social (DESIGN §4.7, telas.md › 26–28): seguir, feed de conquistas e "Parabéns".
-- Só perfis públicos aparecem para outras pessoas; tudo que mostra dados de outra pessoa
-- passa por funções SECURITY DEFINER que devolvem só campos públicos.
-- Os itens do feed são gravados pelo servidor (lib/social/feed.ts + chave secreta).

-- Tabelas ------------------------------------------------------------------------

create table public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  followee_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index follows_followee_idx on public.follows (followee_id);

create table public.feed_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null
    check (type in ('harvest', 'stage', 'rare_badge', 'chapter', 'subject', 'division')),
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text not null check (char_length(dedupe_key) <= 80),
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

comment on table public.feed_events is
  'Conquistas marcantes para o feed de quem segue (DECISOES 11/11). Escrita só pelo servidor.';

create index feed_events_user_created_idx on public.feed_events (user_id, created_at desc);

create table public.reactions (
  event_id uuid not null references public.feed_events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index reactions_user_idx on public.reactions (user_id);

-- Faixa "deram parabéns desde a última visita" (26).
alter table public.profiles add column reactions_seen_at timestamptz;
grant update (reactions_seen_at) on public.profiles to authenticated;

-- RLS: cada um lê o que é seu; escrita de seguir e parabéns só pelas funções ------------

alter table public.follows enable row level security;
alter table public.feed_events enable row level security;
alter table public.reactions enable row level security;

revoke all on public.follows, public.feed_events, public.reactions from anon, authenticated;
grant select on public.follows, public.feed_events, public.reactions to authenticated;

create policy "seguir: lê quem eu sigo e quem me segue"
  on public.follows for select to authenticated
  using (follower_id = (select auth.uid()) or followee_id = (select auth.uid()));

create policy "feed: lê os próprios itens"
  on public.feed_events for select to authenticated
  using (user_id = (select auth.uid()));

create policy "parabéns: lê os que mandei e os que recebi"
  on public.reactions for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.feed_events e
      where e.id = reactions.event_id and e.user_id = (select auth.uid())
    )
  );

grant all on public.follows, public.feed_events, public.reactions to service_role;

-- Leitura com dados públicos de outras pessoas ------------------------------------------

-- Busca por prefixo do apelido (a partir de 2 letras), só perfis públicos (27).
create function public.search_profiles(p_prefix text)
returns table (username text, level int, is_demo boolean, following boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select p.username, p.level, p.is_demo,
         exists (select 1 from public.follows f
                 where f.follower_id = (select auth.uid()) and f.followee_id = p.id)
  from public.profiles p
  where char_length(p_prefix) >= 2
    and p.public_profile
    and p.username is not null
    and p.id <> (select auth.uid())
    and p.username like replace(replace(replace(lower(p_prefix), '\', '\\'), '_', '\_'), '%', '\%') || '%' escape '\'
  order by p.username
  limit 20;
$$;

-- "Da sua Feira" (27): pessoas públicas do meu grupo da semana.
create function public.league_suggestions()
returns table (username text, level int, is_demo boolean, following boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select p.username, p.level, p.is_demo,
         exists (select 1 from public.follows f
                 where f.follower_id = (select auth.uid()) and f.followee_id = p.id)
  from public.league_members me
  join public.league_groups g on g.id = me.group_id
  join public.league_members m on m.group_id = g.id
  join public.profiles p on p.id = m.user_id
  where me.user_id = (select auth.uid())
    and g.week_start = (date_trunc('week', now() at time zone 'America/Sao_Paulo'))::date
    and m.user_id <> (select auth.uid())
    and p.public_profile
    and p.username is not null;
$$;

-- Perfil público (28). Perfil privado de outra pessoa: só {"privado": true}.
-- Nada de disciplinas, horas ou páginas (DESIGN §4.7).
create function public.public_profile(p_username text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p.id is null then null
    when not p.public_profile and p.id <> (select auth.uid()) then jsonb_build_object('privado', true)
    else jsonb_build_object(
      'privado', false,
      'username', p.username,
      'level', p.level,
      'streak', p.streak_current,
      'is_demo', p.is_demo,
      'created_at', p.created_at,
      'is_me', p.id = (select auth.uid()),
      'following', exists (select 1 from public.follows f
                           where f.follower_id = (select auth.uid()) and f.followee_id = p.id),
      'badges', coalesce((
        select jsonb_agg(distinct b.badge_code) from public.user_daily_badges b where b.user_id = p.id
      ), '[]'::jsonb),
      'recent', coalesce((
        select jsonb_agg(jsonb_build_object('type', e.type, 'payload', e.payload, 'created_at', e.created_at)
                         order by e.created_at desc)
        from (select * from public.feed_events where user_id = p.id
              order by created_at desc limit 5) e
      ), '[]'::jsonb)
    )
  end
  from (select 1) one
  left join public.profiles p on p.username = p_username;
$$;

-- Feed de quem eu sigo (26): até 14 dias, só de quem continua público.
create function public.friends_feed()
returns table (id uuid, username text, is_demo boolean, type text, payload jsonb,
               created_at timestamptz, reacted boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, p.username, p.is_demo, e.type, e.payload, e.created_at,
         exists (select 1 from public.reactions r
                 where r.event_id = e.id and r.user_id = (select auth.uid()))
  from public.follows f
  join public.profiles p on p.id = f.followee_id
  join public.feed_events e on e.user_id = f.followee_id
  where f.follower_id = (select auth.uid())
    and p.public_profile
    and e.created_at >= now() - interval '14 days'
  order by e.created_at desc
  limit 50;
$$;

-- Parabéns recebidos desde a última visita (faixa da tela 26).
create function public.received_reactions()
returns table (event_id uuid, type text, payload jsonb, from_username text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.type, e.payload, p.username, r.created_at
  from public.feed_events e
  join public.reactions r on r.event_id = e.id
  join public.profiles p on p.id = r.user_id
  join public.profiles me on me.id = e.user_id
  where e.user_id = (select auth.uid())
    and r.created_at > coalesce(me.reactions_seen_at, '-infinity'::timestamptz)
  order by r.created_at desc
  limit 50;
$$;

-- Escrita: seguir, deixar de seguir e parabéns ---------------------------------------------

-- Devolve true só quando passou a seguir agora (para o evento follow_created).
create function public.follow_user(p_username text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target uuid;
begin
  select id into v_target from public.profiles
  where username = p_username and public_profile and id <> (select auth.uid());
  if v_target is null then
    return false;
  end if;
  insert into public.follows (follower_id, followee_id) values ((select auth.uid()), v_target)
  on conflict do nothing;
  return found;
end;
$$;

create function public.unfollow_user(p_username text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.follows f
  using public.profiles p
  where p.username = p_username and f.followee_id = p.id and f.follower_id = (select auth.uid());
$$;

-- Um parabéns por pessoa por conquista, sem desfazer; só em itens que a pessoa vê no feed.
create function public.send_reaction(p_event uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.feed_events e
    join public.follows f on f.followee_id = e.user_id and f.follower_id = (select auth.uid())
    join public.profiles p on p.id = e.user_id
    where e.id = p_event
      and p.public_profile
      and e.user_id <> (select auth.uid())
      and e.created_at >= now() - interval '14 days'
  ) then
    return false;
  end if;
  insert into public.reactions (event_id, user_id) values (p_event, (select auth.uid()))
  on conflict do nothing;
  return found;
end;
$$;

revoke execute on function
  public.search_profiles(text),
  public.league_suggestions(),
  public.public_profile(text),
  public.friends_feed(),
  public.received_reactions(),
  public.follow_user(text),
  public.unfollow_user(text),
  public.send_reaction(uuid)
from public, anon;

grant execute on function
  public.search_profiles(text),
  public.league_suggestions(),
  public.public_profile(text),
  public.friends_feed(),
  public.received_reactions(),
  public.follow_user(text),
  public.unfollow_user(text),
  public.send_reaction(uuid)
to authenticated;

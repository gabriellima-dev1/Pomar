-- Ajustes "como no Duolingo" (decisão da dupla, 12/11):
-- 1. Feira: só entra no ranking da semana quem ganhou XP nela. Quem está em 0 não
--    aparece para os outros membros do grupo (a própria pessoa continua se vendo).
-- 2. Perfil público abre sem login (como duolingo.com/profile/<apelido>).

create or replace function public.league_standings()
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
  ) x on true
  where coalesce(x.xp, 0) > 0 or m.user_id = (select auth.uid());
$$;

-- Perfil público para visitantes: `is distinct from` porque auth.uid() é nulo sem login
-- (com `<>`, a comparação daria nulo e um perfil privado vazaria).
create or replace function public.public_profile(p_username text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p.id is null then null
    when not p.public_profile and p.id is distinct from (select auth.uid())
      then jsonb_build_object('privado', true)
    else jsonb_build_object(
      'privado', false,
      'username', p.username,
      'level', p.level,
      'streak', p.streak_current,
      'is_demo', p.is_demo,
      'created_at', p.created_at,
      'is_me', p.id is not distinct from (select auth.uid()),
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

grant execute on function public.public_profile(text) to anon;

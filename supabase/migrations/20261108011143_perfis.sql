-- Perfis (DESIGN.md §8), criados por trigger no cadastro.

create function public.is_valid_timezone(tz text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from pg_catalog.pg_timezone_names where name = tz);
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text check (char_length(display_name) <= 60),
  avatar_url text,
  timezone text not null default 'America/Maceio' check (public.is_valid_timezone(timezone)),
  reminder_time time,
  theme text not null default 'classico',
  focus_min int not null default 25 check (focus_min between 15 and 60 and focus_min % 5 = 0),
  break_min int not null default 5 check (break_min between 5 and 30 and break_min % 5 = 0),
  long_break_min int not null default 15
    check (long_break_min between 10 and 30 and long_break_min % 5 = 0),
  min_per_page numeric check (min_per_page > 0),
  bartle_primary text
    check (bartle_primary in ('conquistador', 'assassino', 'explorador', 'socializador')),
  bartle_scores jsonb,
  league_opt_in boolean,
  public_profile boolean not null default false,
  xp_total int not null default 0 check (xp_total >= 0),
  level int not null default 1 check (level >= 1),
  streak_current int not null default 0 check (streak_current >= 0),
  streak_best int not null default 0 check (streak_best >= 0),
  freezes int not null default 0 check (freezes between 0 and 2),
  last_closed_day date,
  is_demo boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil do usuário (1:1 com auth.users).';

alter table public.profiles enable row level security;

-- Privilégios explícitos. O cliente só altera colunas de preferência;
-- XP, nível, ofensiva, flags de admin/demo, tema e opt-ins mudam pelo servidor
-- (ou ganham grant próprio nas fases seguintes).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (
  display_name,
  avatar_url,
  timezone,
  reminder_time,
  focus_min,
  break_min,
  long_break_min,
  min_per_page
) on public.profiles to authenticated;

create policy "perfis: ler o próprio"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "perfis: atualizar o próprio"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Admin ---------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "telemetria: admin lê tudo"
  on public.telemetry_events for select to authenticated
  using ((select public.is_admin()));

-- Cadastro ------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  tz text := meta ->> 'timezone';
  provider text := coalesce(new.raw_app_meta_data ->> 'provider', 'email');
begin
  if tz is null or not public.is_valid_timezone(tz) then
    tz := 'America/Maceio';
  end if;

  insert into public.profiles (id, display_name, avatar_url, timezone)
  values (
    new.id,
    nullif(left(trim(coalesce(meta ->> 'display_name', meta ->> 'full_name', meta ->> 'name', '')), 60), ''),
    coalesce(meta ->> 'avatar_url', meta ->> 'picture'),
    tz
  );

  -- Telemetria nunca pode impedir o cadastro.
  begin
    insert into public.telemetry_events (user_id, anon_id, name, props)
    values (
      new.id,
      left(meta ->> 'anon_id', 64),
      'signup_completed',
      jsonb_build_object('provider', provider)
    );
  exception when others then
    raise warning 'telemetria signup_completed falhou: %', sqlerrm;
  end;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

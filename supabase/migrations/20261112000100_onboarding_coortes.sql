-- Fase 4: onboarding (telas.md › Fase 4), perfil de Bartle (DESIGN §6.8), opt-in da
-- Feira (§6.6), coortes do teste de dependência (§9.4) e contadores da landing (§2).

-- Onboarding --------------------------------------------------------------------

-- Passo atual do onboarding; `/inicio` redireciona para ele até chegar em `concluido`.
-- Contas anteriores à Fase 4 entram como concluídas (DECISOES 11/11); as novas
-- começam nas boas-vindas.
alter table public.profiles
  add column onboarding_step text not null default 'concluido' check (
    onboarding_step in (
      'boas_vindas', 'quiz', 'perfil', 'feira', 'disciplina', 'calibracao', 'pomodoro',
      'primeiro_fruto', 'concluido'
    )
  );
alter table public.profiles alter column onboarding_step set default 'boas_vindas';

-- Respostas do quiz, uma por pergunta (código do perfil ou null), para retomar de onde parou.
alter table public.profiles
  add column bartle_answers jsonb check (
    jsonb_typeof(bartle_answers) = 'array' and jsonb_array_length(bartle_answers) <= 8
  );

-- Na interface o Killer/Assassino se chama "Competidor" (DECISOES 10/11); o código segue.
update public.profiles set bartle_primary = 'competidor' where bartle_primary = 'assassino';
alter table public.profiles drop constraint profiles_bartle_primary_check;
alter table public.profiles add constraint profiles_bartle_primary_check
  check (bartle_primary in ('conquistador', 'competidor', 'explorador', 'socializador'));
alter table public.profiles add constraint profiles_bartle_scores_check
  check (jsonb_typeof(bartle_scores) = 'object');

-- Card de convite da Feira no Início (Competidor sem Feira): some depois de recusar 1 vez.
alter table public.profiles add column league_invite_dismissed_at timestamptz;

-- Escolhas da própria pessoa, protegidas pelos `check` acima. O resultado do quiz é
-- calculado no servidor (lib/bartle.ts) a partir das respostas.
grant update (
  onboarding_step,
  bartle_answers,
  bartle_primary,
  bartle_scores,
  league_opt_in,
  league_invite_dismissed_at
) on public.profiles to authenticated;

-- Teste de dependência (§9.4) ---------------------------------------------------

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout jsonb not null default '{}'::jsonb check (jsonb_typeof(rollout) = 'object'),
  updated_at timestamptz not null default now()
);

comment on table public.feature_flags is
  'Flags globais. rewards_enabled: enabled = recompensas ligadas; rollout.off_for_cohorts = coortes sem recompensas visíveis.';

alter table public.feature_flags enable row level security;
revoke all on public.feature_flags from anon, authenticated;
grant select on public.feature_flags to authenticated;

create policy "flags: leitura para logados"
  on public.feature_flags for select to authenticated
  using (true);

insert into public.feature_flags (key, enabled, rollout)
values ('rewards_enabled', true, '{"off_for_cohorts": ["B"]}');

create table public.user_cohorts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  cohort text not null check (cohort in ('A', 'B')),
  assigned_at timestamptz not null default now()
);

comment on table public.user_cohorts is
  'Coorte do teste de dependência (§9.4): A com recompensas, B sem. Sorteada no cadastro.';

alter table public.user_cohorts enable row level security;
revoke all on public.user_cohorts from anon, authenticated;
grant select on public.user_cohorts to authenticated;

create policy "coortes: leitura da própria"
  on public.user_cohorts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "coortes: leitura para admin"
  on public.user_cohorts for select to authenticated
  using (public.is_admin());

-- Contas anteriores à Fase 4 (dupla e testes) ficam fora do experimento: coorte A.
insert into public.user_cohorts (user_id, cohort)
select id, 'A' from auth.users
on conflict (user_id) do nothing;

-- Cadastro: perfil + coorte sorteada (50/50) + signup_completed.
create or replace function public.handle_new_user()
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

  -- O sorteio nunca pode impedir o cadastro; sem linha, o app trata como coorte A.
  begin
    insert into public.user_cohorts (user_id, cohort)
    values (new.id, case when random() < 0.5 then 'A' else 'B' end);
  exception when others then
    raise warning 'sorteio de coorte falhou: %', sqlerrm;
  end;

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

-- Contadores da landing (telas.md › 15) -------------------------------------------

-- Só totais, sem dados de ninguém; contas demo ficam de fora (DESIGN §10).
-- Semana de segunda a domingo no fuso de São Paulo.
create function public.landing_stats()
returns table (pomodoros_week int, focus_sec_week bigint, gardeners int)
language sql
stable
security definer
set search_path = ''
as $$
  with week as (
    select (date_trunc('week', now() at time zone 'America/Sao_Paulo')
            at time zone 'America/Sao_Paulo') as start
  ),
  done as (
    select s.user_id, s.ended_at, s.planned_focus_sec
    from public.pomodoro_sessions s
    join public.profiles p on p.id = s.user_id
    where s.status = 'completed' and not p.is_demo
  )
  select
    (select count(*)::int from done, week where done.ended_at >= week.start),
    (select coalesce(sum(planned_focus_sec), 0)::bigint from done, week
      where done.ended_at >= week.start),
    (select count(distinct user_id)::int from done);
$$;

revoke execute on function public.landing_stats() from public;
grant execute on function public.landing_stats() to anon, authenticated;

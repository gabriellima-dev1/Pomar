-- Teste de RLS e regras da Fase 4 (onboarding, perfil de Bartle, Feira, coortes, landing).
-- Roda dentro de uma transação desfeita no fim (rollback): não deixa dados no banco.
-- Uso: set -a; source .env.local; set +a
--      npx supabase db query --remote -f supabase/tests/rls_fase4.sql
-- Resultado esperado: todas as linhas com ok = true.
begin;

create temp table resultado (n serial, teste text, ok boolean, detalhe text);
grant insert, select on resultado to authenticated, anon, service_role;
grant usage on sequence resultado_n_seq to authenticated, anon, service_role;

-- Contadores da landing antes dos dados de teste (o banco pode ter dados reais).
create temp table base as select * from public.landing_stats();
grant select on base to anon;

insert into auth.users (id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-4000-8000-0000000000a4', 'authenticated', 'authenticated', 'rls4-a@teste.invalid', '{"display_name":"Ana"}'),
  ('00000000-0000-4000-8000-0000000000b4', 'authenticated', 'authenticated', 'rls4-b@teste.invalid', '{}'),
  ('00000000-0000-4000-8000-0000000000d4', 'authenticated', 'authenticated', 'rls4-d@teste.invalid', '{}');

-- Cadastro (trigger) ----------------------------------------------------------------
insert into resultado (teste, ok, detalhe)
select 'Cadastro novo começa nas boas-vindas',
  (select onboarding_step = 'boas_vindas' from public.profiles
   where id = '00000000-0000-4000-8000-0000000000a4'),
  null;

insert into resultado (teste, ok, detalhe)
select 'Cadastro sorteia a coorte (A ou B)',
  (select count(*) = 3 from public.user_cohorts
   where user_id in ('00000000-0000-4000-8000-0000000000a4', '00000000-0000-4000-8000-0000000000b4',
                     '00000000-0000-4000-8000-0000000000d4')
     and cohort in ('A', 'B')),
  null;

insert into resultado (teste, ok, detalhe)
select 'Pontual saiu do catálogo (11 emblemas)',
  (select count(*) = 11 from public.badges) and not exists (select 1 from public.badges where code = 'pontual'),
  null;

-- Contadores da landing: conta concluídos de quem não é demo ----------------------
update public.profiles set is_demo = true where id = '00000000-0000-4000-8000-0000000000d4';
insert into public.pomodoro_sessions (user_id, planned_focus_sec, started_at, ended_at, status)
values
  ('00000000-0000-4000-8000-0000000000a4', 1500, now() - interval '26 minutes', now() - interval '1 minute', 'completed'),
  ('00000000-0000-4000-8000-0000000000d4', 1500, now() - interval '26 minutes', now() - interval '1 minute', 'completed'),
  ('00000000-0000-4000-8000-0000000000b4', 1500, now() - interval '3 minutes', now(), 'cancelled');

set local role anon;
insert into resultado (teste, ok, detalhe)
select 'Visitante vê os contadores da landing, sem demo nem encerrados',
  s.pomodoros_week = b.pomodoros_week + 1
  and s.focus_sec_week = b.focus_sec_week + 1500
  and s.gardeners = b.gardeners + 1,
  format('%s %s %s', s.pomodoros_week - b.pomodoros_week, s.focus_sec_week - b.focus_sec_week,
         s.gardeners - b.gardeners)
from public.landing_stats() s, base b;

do $$
begin
  perform 1 from public.feature_flags;
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê as flags', false, 'leu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê as flags', true, sqlerrm);
end $$;

do $$
begin
  perform 1 from public.user_cohorts;
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê coortes', false, 'leu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê coortes', true, sqlerrm);
end $$;
reset role;

-- Usuário A ------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a4","role":"authenticated"}', true);

update public.profiles
set onboarding_step = 'quiz',
    bartle_answers = '["explorador", null]'::jsonb,
    bartle_primary = 'competidor',
    bartle_scores = '{"conquistador":25,"competidor":50,"explorador":13,"socializador":12}'::jsonb,
    league_opt_in = false,
    league_invite_dismissed_at = now()
where id = '00000000-0000-4000-8000-0000000000a4';

insert into resultado (teste, ok, detalhe)
select 'A grava passo, quiz, perfil e escolha da Feira',
  (select onboarding_step = 'quiz' and bartle_primary = 'competidor' and league_opt_in = false
   from public.profiles where id = '00000000-0000-4000-8000-0000000000a4'),
  null;

do $$
begin
  update public.profiles set onboarding_step = 'pulei' where id = '00000000-0000-4000-8000-0000000000a4';
  insert into resultado (teste, ok, detalhe) values ('Passo inválido é recusado', false, 'gravou');
exception when check_violation then
  insert into resultado (teste, ok, detalhe) values ('Passo inválido é recusado', true, sqlerrm);
end $$;

do $$
begin
  update public.profiles set bartle_primary = 'assassino' where id = '00000000-0000-4000-8000-0000000000a4';
  insert into resultado (teste, ok, detalhe) values ('Perfil "assassino" virou "competidor"', false, 'gravou');
exception when check_violation then
  insert into resultado (teste, ok, detalhe) values ('Perfil "assassino" virou "competidor"', true, sqlerrm);
end $$;

do $$
begin
  update public.profiles set bartle_answers = '[1,2,3,4,5,6,7,8,9]'::jsonb
  where id = '00000000-0000-4000-8000-0000000000a4';
  insert into resultado (teste, ok, detalhe) values ('Mais de 8 respostas é recusado', false, 'gravou');
exception when check_violation then
  insert into resultado (teste, ok, detalhe) values ('Mais de 8 respostas é recusado', true, sqlerrm);
end $$;

do $$
begin
  update public.profiles set reminder_time = '19:00' where id = '00000000-0000-4000-8000-0000000000a4';
  insert into resultado (teste, ok, detalhe) values ('A não altera mais o lembrete', false, 'alterou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não altera mais o lembrete', true, sqlerrm);
end $$;

do $$
begin
  update public.profiles set xp_total = 99999 where id = '00000000-0000-4000-8000-0000000000a4';
  insert into resultado (teste, ok, detalhe) values ('A continua sem alterar o XP', false, 'alterou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A continua sem alterar o XP', true, sqlerrm);
end $$;

insert into resultado (teste, ok, detalhe)
select 'A lê só a própria coorte',
  (select count(*) = 1 from public.user_cohorts)
  and (select bool_and(user_id = '00000000-0000-4000-8000-0000000000a4') from public.user_cohorts),
  null;

insert into resultado (teste, ok, detalhe)
select 'Logado lê a flag rewards_enabled',
  (select enabled and rollout -> 'off_for_cohorts' ? 'B' from public.feature_flags
   where key = 'rewards_enabled'),
  null;

do $$
begin
  update public.user_cohorts set cohort = 'A';
  insert into resultado (teste, ok, detalhe) values ('A não troca a própria coorte', false, 'trocou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não troca a própria coorte', true, sqlerrm);
end $$;

do $$
begin
  insert into public.user_cohorts (user_id, cohort) values ('00000000-0000-4000-8000-0000000000a4', 'A');
  insert into resultado (teste, ok, detalhe) values ('A não se sorteia de novo', false, 'inseriu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não se sorteia de novo', true, sqlerrm);
end $$;

do $$
begin
  update public.feature_flags set enabled = false;
  insert into resultado (teste, ok, detalhe) values ('A não altera as flags', false, 'alterou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não altera as flags', true, sqlerrm);
end $$;

-- A tenta mexer no perfil de B: a RLS não deixa (nenhuma linha muda).
update public.profiles set league_opt_in = true, onboarding_step = 'concluido'
where id = '00000000-0000-4000-8000-0000000000b4';
reset role;

insert into resultado (teste, ok, detalhe)
select 'A não altera o perfil de B',
  (select league_opt_in is null and onboarding_step = 'boas_vindas' from public.profiles
   where id = '00000000-0000-4000-8000-0000000000b4'),
  null;

select n, ok, teste, detalhe from resultado order by n;

rollback;

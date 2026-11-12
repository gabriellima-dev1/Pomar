-- Teste de RLS e regras da Fase 5 (Feira e apelido).
-- Roda dentro de uma transação desfeita no fim (rollback): não deixa dados no banco.
-- Uso: set -a; source .env.local; set +a
--      npx supabase db query --remote -f supabase/tests/rls_fase5.sql
-- Resultado esperado: todas as linhas com ok = true.
begin;

create temp table resultado (n serial, teste text, ok boolean, detalhe text);
grant insert, select on resultado to authenticated, anon, service_role;
grant usage on sequence resultado_n_seq to authenticated, anon, service_role;

create temp table semana as
  select (date_trunc('week', now() at time zone 'America/Sao_Paulo'))::date as atual;
grant select on semana to authenticated, anon, service_role;

insert into auth.users (id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-4000-8000-0000000000a5', 'authenticated', 'authenticated', 'rls5-a@teste.invalid', '{}'),
  ('00000000-0000-4000-8000-0000000000b5', 'authenticated', 'authenticated', 'rls5-b@teste.invalid', '{}'),
  ('00000000-0000-4000-8000-0000000000c5', 'authenticated', 'authenticated', 'rls5-c@teste.invalid', '{}');

update public.profiles set username = 'rls5.ana', league_opt_in = true where id = '00000000-0000-4000-8000-0000000000a5';
update public.profiles set username = 'rls5.bia', league_opt_in = true, is_demo = true where id = '00000000-0000-4000-8000-0000000000b5';
update public.profiles set username = 'rls5.caio', league_opt_in = true where id = '00000000-0000-4000-8000-0000000000c5';

-- A semana atual pode já existir no banco (cron); os grupos de teste são novos.
insert into public.league_weeks (week_start) select atual from semana on conflict do nothing;
insert into public.league_groups (id, week_start, division, band_min, band_max)
select '00000000-0000-4000-8000-00000000f5a1'::uuid, atual, 'prata', 1, 2 from semana
union all
select '00000000-0000-4000-8000-00000000f5c1'::uuid, atual, 'prata', 0, 0 from semana;
insert into public.league_members (group_id, user_id, week_start)
select '00000000-0000-4000-8000-00000000f5a1'::uuid, '00000000-0000-4000-8000-0000000000a5'::uuid, atual from semana
union all
select '00000000-0000-4000-8000-00000000f5a1'::uuid, '00000000-0000-4000-8000-0000000000b5'::uuid, atual from semana
union all
select '00000000-0000-4000-8000-00000000f5c1'::uuid, '00000000-0000-4000-8000-0000000000c5'::uuid, atual from semana;

-- XP: A ganha 30 nesta semana e 50 na semana passada (não conta); B ganha 20.
insert into public.xp_events (user_id, source, amount, dedupe_key, created_at)
values
  ('00000000-0000-4000-8000-0000000000a5', 'pomodoro', 30, 'rls5:a1', now()),
  ('00000000-0000-4000-8000-0000000000a5', 'pomodoro', 50, 'rls5:a0',
   ((select atual from semana)::timestamp at time zone 'America/Sao_Paulo') - interval '1 hour'),
  ('00000000-0000-4000-8000-0000000000b5', 'pomodoro', 20, 'rls5:b1', now());

-- Usuário A ------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a5","role":"authenticated"}', true);

insert into resultado (teste, ok, detalhe)
select 'A vê o próprio grupo no ranking (A e B, sem C)',
  count(*) = 2 and bool_and(username in ('rls5.ana', 'rls5.bia')),
  string_agg(username, ', ')
from public.league_standings();

insert into resultado (teste, ok, detalhe)
select 'XP da semana soma só a semana atual',
  (select xp = 30 from public.league_standings() where is_me)
  and (select xp = 20 and is_demo from public.league_standings() where username = 'rls5.bia'),
  null;

insert into resultado (teste, ok, detalhe)
select 'A só lê as próprias participações',
  (select count(*) = 1 from public.league_members),
  null;

insert into resultado (teste, ok, detalhe)
select 'A só lê o próprio grupo',
  (select count(*) = 1 and bool_and(id = '00000000-0000-4000-8000-00000000f5a1') from public.league_groups),
  null;

insert into resultado (teste, ok, detalhe)
select 'A não lê o perfil de B direto (só pela função)',
  (select count(*) = 0 from public.profiles where id = '00000000-0000-4000-8000-0000000000b5'),
  null;

update public.league_members set result_seen_at = now()
where user_id = '00000000-0000-4000-8000-0000000000a5';
update public.league_members set result_seen_at = now()
where user_id = '00000000-0000-4000-8000-0000000000b5';
reset role;

insert into resultado (teste, ok, detalhe)
select 'A marca o próprio resultado como visto, e não o de B',
  (select result_seen_at is not null from public.league_members where user_id = '00000000-0000-4000-8000-0000000000a5')
  and (select result_seen_at is null from public.league_members where user_id = '00000000-0000-4000-8000-0000000000b5'),
  null;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a5","role":"authenticated"}', true);

do $$
begin
  update public.league_members set xp_week = 999, outcome = 'up'
  where user_id = '00000000-0000-4000-8000-0000000000a5';
  insert into resultado (teste, ok, detalhe) values ('A não grava XP nem saída da Feira', false, 'gravou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não grava XP nem saída da Feira', true, sqlerrm);
end $$;

do $$
begin
  update public.profiles set league_division = 'esmeralda'
  where id = '00000000-0000-4000-8000-0000000000a5';
  insert into resultado (teste, ok, detalhe) values ('A não muda a própria divisão', false, 'mudou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não muda a própria divisão', true, sqlerrm);
end $$;

do $$
begin
  insert into public.league_members (group_id, user_id, week_start)
  select '00000000-0000-4000-8000-00000000f5c1'::uuid, '00000000-0000-4000-8000-0000000000a5'::uuid, atual from semana;
  insert into resultado (teste, ok, detalhe) values ('A não se coloca em outro grupo', false, 'inseriu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não se coloca em outro grupo', true, sqlerrm);
end $$;

do $$
begin
  perform public.apply_league_close((select atual from semana), '[]'::jsonb);
  insert into resultado (teste, ok, detalhe) values ('A não fecha a semana', false, 'fechou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não fecha a semana', true, sqlerrm);
end $$;

-- Apelido -----------------------------------------------------------------------------
do $$
begin
  update public.profiles set username = 'Ana Lima' where id = '00000000-0000-4000-8000-0000000000a5';
  insert into resultado (teste, ok, detalhe) values ('Apelido fora do formato é recusado', false, 'gravou');
exception when check_violation then
  insert into resultado (teste, ok, detalhe) values ('Apelido fora do formato é recusado', true, sqlerrm);
end $$;

do $$
begin
  update public.profiles set username = 'rls5.bia' where id = '00000000-0000-4000-8000-0000000000a5';
  insert into resultado (teste, ok, detalhe) values ('Apelido de outra pessoa é recusado', false, 'gravou');
exception when unique_violation then
  insert into resultado (teste, ok, detalhe) values ('Apelido de outra pessoa é recusado', true, sqlerrm);
end $$;

update public.profiles set username = 'rls5.ana_2', public_profile = true
where id = '00000000-0000-4000-8000-0000000000a5';

insert into resultado (teste, ok, detalhe)
select 'A troca o próprio apelido e o perfil público',
  (select username = 'rls5.ana_2' and public_profile from public.profiles
   where id = '00000000-0000-4000-8000-0000000000a5'),
  null;

insert into resultado (teste, ok, detalhe)
select 'Disponibilidade do apelido',
  public.username_available('rls5.livre')
  and not public.username_available('rls5.bia')
  and public.username_available('rls5.ana_2')
  and not public.username_available('X'),
  null;
reset role;

-- Visitante ------------------------------------------------------------------------------
set local role anon;
do $$
begin
  perform * from public.league_standings();
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê a Feira', false, 'leu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê a Feira', true, sqlerrm);
end $$;
reset role;

-- Servidor (service_role): abertura e fechamento idempotentes ------------------------------
set local role service_role;

insert into resultado (teste, ok, detalhe)
select 'Abrir uma semana que já existe não faz nada',
  not public.apply_league_open((select atual from semana), '[]'::jsonb),
  null;

insert into resultado (teste, ok, detalhe)
select 'XP da semana para o fechamento',
  (select xp = 30 from public.league_week_xp((select atual from semana))
   where user_id = '00000000-0000-4000-8000-0000000000a5'),
  null;

-- A chamada e a conferência ficam em comandos separados: subconsultas no mesmo comando
-- veem o banco de antes da função.
create temp table fechou as
select public.apply_league_close((select atual from semana), '[
    {"user_id":"00000000-0000-4000-8000-0000000000a5","rank":1,"xp":30,"outcome":"up","division":"ouro"},
    {"user_id":"00000000-0000-4000-8000-0000000000b5","rank":2,"xp":20,"outcome":"stay","division":"prata"}
  ]'::jsonb) as ok;

insert into resultado (teste, ok, detalhe)
select 'Fechar a semana grava posição, saída e divisão',
  (select ok from fechou)
  and (select final_rank = 1 and outcome = 'up' and xp_week = 30 from public.league_members
       where user_id = '00000000-0000-4000-8000-0000000000a5')
  and (select league_division = 'ouro' from public.profiles where id = '00000000-0000-4000-8000-0000000000a5')
  and (select league_division = 'bronze' from public.profiles where id = '00000000-0000-4000-8000-0000000000c5'),
  null;

insert into resultado (teste, ok, detalhe)
select 'Fechar de novo não faz nada',
  not public.apply_league_close((select atual from semana), '[]'::jsonb),
  null;
reset role;

select n, ok, teste, detalhe from resultado order by n;

rollback;

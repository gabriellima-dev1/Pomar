-- Teste de RLS e regras da Fase 6 (sair do experimento e excluir conta).
-- Roda dentro de uma transação desfeita no fim (rollback): não deixa dados no banco.
-- Uso: set -a; source .env.local; set +a
--      npx supabase db query --remote -f supabase/tests/rls_fase6.sql
-- Resultado esperado: todas as linhas com ok = true.
begin;

create temp table resultado (n serial, teste text, ok boolean, detalhe text);
grant insert, select on resultado to authenticated, anon, service_role;
grant usage on sequence resultado_n_seq to authenticated, anon, service_role;

insert into auth.users (id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-4000-8000-0000000000a6', 'authenticated', 'authenticated', 'rls6-a@teste.invalid', '{}'),
  ('00000000-0000-4000-8000-0000000000b6', 'authenticated', 'authenticated', 'rls6-b@teste.invalid', '{}');

-- Dados da A em várias tabelas (para conferir a cascata da exclusão).
insert into public.subjects (id, user_id, title, source, color)
values ('00000000-0000-4000-8000-00000000a6a1', '00000000-0000-4000-8000-0000000000a6', 'RLS6', 'manual', 'ceu');
insert into public.pomodoro_sessions (user_id, planned_focus_sec, started_at, ended_at, status)
values ('00000000-0000-4000-8000-0000000000a6', 1500, now() - interval '1 hour', now() - interval '35 minutes', 'completed');
insert into public.telemetry_events (user_id, anon_id, name, props)
values ('00000000-0000-4000-8000-0000000000a6', 'anon-rls6', 'app_opened', '{}');

-- Cadastro novo não é legado.
insert into resultado (teste, ok, detalhe)
select 'Conta nova entra no experimento (não é legado)',
  (select not legacy and left_at is null from public.user_cohorts where user_id = '00000000-0000-4000-8000-0000000000a6'),
  null;

-- Toda chave para auth.users apaga em cascata ou anonimiza (set null).
insert into resultado (teste, ok, detalhe)
select 'Toda referência a auth.users tem cascade ou set null',
  count(*) = 0,
  string_agg(conrelid::regclass::text, ', ')
from pg_constraint
where contype = 'f'
  and confrelid = 'auth.users'::regclass
  and connamespace = 'public'::regnamespace
  and confdeltype not in ('c', 'n');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a6","role":"authenticated"}', true);

insert into resultado (teste, ok, detalhe)
select 'A não grava left_at direto na tabela',
  not has_column_privilege('authenticated', 'public.user_cohorts', 'left_at', 'UPDATE'),
  null;

select public.leave_experiment();

insert into resultado (teste, ok, detalhe)
select 'leave_experiment() marca a saída da própria pessoa',
  (select left_at is not null from public.user_cohorts where user_id = '00000000-0000-4000-8000-0000000000a6'),
  null;
reset role;

insert into resultado (teste, ok, detalhe)
select 'leave_experiment() não mexe na coorte de outra pessoa',
  (select left_at is null from public.user_cohorts where user_id = '00000000-0000-4000-8000-0000000000b6'),
  null;

set local role anon;
insert into resultado (teste, ok, detalhe)
select 'Visitante não pode chamar leave_experiment()',
  not has_function_privilege('anon', 'public.leave_experiment()', 'EXECUTE'),
  null;
reset role;

-- Excluir a conta (o que a action faz com a chave secreta: apagar de auth.users).
delete from auth.users where id = '00000000-0000-4000-8000-0000000000a6';

insert into resultado (teste, ok, detalhe)
select 'Exclusão apaga perfil, coorte, disciplinas e pomodoros',
  not exists (select 1 from public.profiles where id = '00000000-0000-4000-8000-0000000000a6')
  and not exists (select 1 from public.user_cohorts where user_id = '00000000-0000-4000-8000-0000000000a6')
  and not exists (select 1 from public.subjects where id = '00000000-0000-4000-8000-00000000a6a1')
  and not exists (select 1 from public.pomodoro_sessions where user_id = '00000000-0000-4000-8000-0000000000a6'),
  null;

insert into resultado (teste, ok, detalhe)
select 'Exclusão anonimiza a telemetria (sem user_id)',
  exists (select 1 from public.telemetry_events where anon_id = 'anon-rls6' and user_id is null),
  null;

select n, ok, teste, detalhe from resultado order by n;

rollback;

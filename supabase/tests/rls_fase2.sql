-- Teste de RLS e regras da Fase 2 (sessões de pomodoro e recalibração).
-- Roda dentro de uma transação desfeita no fim (rollback): não deixa dados no banco.
-- Uso: set -a; source .env.local; set +a
--      npx supabase db query --remote -f supabase/tests/rls_fase2.sql
-- Resultado esperado: todas as linhas com ok = true.
begin;

create temp table resultado (n serial, teste text, ok boolean, detalhe text);
grant insert, select on resultado to authenticated, anon;
grant usage on sequence resultado_n_seq to authenticated, anon;

insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-4000-8000-0000000000a2', 'authenticated', 'authenticated', 'rls2-a@teste.invalid'),
  ('00000000-0000-4000-8000-0000000000b2', 'authenticated', 'authenticated', 'rls2-b@teste.invalid');

-- Usuário A ------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a2","role":"authenticated"}', true);

select set_config('teste.subject', public.create_manual_subject(
  'Disciplina A', 'tomate',
  '[{"title":"Cap 1","topics":[{"title":"T1","page_start":1,"page_end":10}]}]'::jsonb
)::text, true);
select set_config('teste.topic', (select id::text from public.topics limit 1), true);

select set_config('teste.session', (public.start_pomodoro(
  current_setting('teste.subject')::uuid, current_setting('teste.topic')::uuid
)).id::text, true);

insert into resultado (teste, ok, detalhe)
select 'Começar cria um ciclo de 25 min em andamento (duração do perfil)',
  status = 'running' and planned_focus_sec = 1500, format('%s %s', status, planned_focus_sec)
from public.pomodoro_sessions where id = current_setting('teste.session')::uuid;

insert into resultado (teste, ok, detalhe)
select 'Começar de novo devolve o mesmo ciclo (recarregar / outro aparelho)',
  (public.start_pomodoro(current_setting('teste.subject')::uuid, current_setting('teste.topic')::uuid)).id
    = current_setting('teste.session')::uuid,
  null;

do $$
begin
  perform public.complete_pomodoro(current_setting('teste.session')::uuid);
  insert into resultado (teste, ok, detalhe) values ('Concluir antes de 90% falha', false, 'concluiu');
exception when others then
  insert into resultado (teste, ok, detalhe) values ('Concluir antes de 90% falha', sqlstate = '22023', sqlerrm);
end $$;

do $$
begin
  insert into public.pomodoro_sessions (planned_focus_sec) values (900);
  insert into resultado (teste, ok, detalhe) values ('Cliente não insere sessão direto', false, 'inseriu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Cliente não insere sessão direto', true, null);
end $$;

do $$
begin
  update public.pomodoro_sessions set started_at = now() - interval '1 hour';
  insert into resultado (teste, ok, detalhe) values ('Cliente não altera o horário de início', false, 'alterou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Cliente não altera o horário de início', true, null);
end $$;

select public.pause_pomodoro(current_setting('teste.session')::uuid);
select public.pause_pomodoro(current_setting('teste.session')::uuid);
insert into resultado (teste, ok, detalhe)
select 'Pausar duas vezes conta 1 pausa', pauses = 1 and paused_at is not null, format('pausas=%s', pauses)
from public.pomodoro_sessions where id = current_setting('teste.session')::uuid;

-- Simula 10 min de pausa e 36 min desde o início (como dono do banco).
reset role;
update public.pomodoro_sessions
  set started_at = now() - interval '36 minutes', paused_at = now() - interval '10 minutes'
  where id = current_setting('teste.session')::uuid;
set local role authenticated;

select public.resume_pomodoro(current_setting('teste.session')::uuid);
insert into resultado (teste, ok, detalhe)
select 'Retomar soma a pausa no servidor (~600 s)', paused_sec between 599 and 601 and paused_at is null,
  format('paused_sec=%s', paused_sec)
from public.pomodoro_sessions where id = current_setting('teste.session')::uuid;

insert into resultado (teste, ok, detalhe)
select 'Concluir com 26 min efetivos conta 1 fruto hoje', c.fruits_today = 1 and c.focus_sec = 1500,
  format('frutos=%s foco=%s', c.fruits_today, c.focus_sec)
from public.complete_pomodoro(current_setting('teste.session')::uuid) c;

insert into resultado (teste, ok, detalhe)
select 'ended_at fica no fim previsto (início + pausas + foco)',
  ended_at = started_at + interval '1500 seconds' + make_interval(secs => paused_sec) and status = 'completed',
  format('%s', ended_at - started_at)
from public.pomodoro_sessions where id = current_setting('teste.session')::uuid;

insert into resultado (teste, ok, detalhe)
select 'Concluir de novo é idempotente', c.fruits_today = 1, null
from public.complete_pomodoro(current_setting('teste.session')::uuid) c;

insert into resultado (teste, ok, detalhe)
select 'Páginas: 6 em 25 min → ritmo 4,17; média parte de 3 → 3,35; sem sugestão',
  r.observed = 4.17 and r.ema = 3.35 and r.current_pace = 3 and not r.suggest,
  format('obs=%s ema=%s atual=%s sug=%s', r.observed, r.ema, r.current_pace, r.suggest)
from public.log_pomodoro_pages(current_setting('teste.session')::uuid, 6, true) r;

insert into resultado (teste, ok, detalhe)
select '"Terminei o tópico" marca o tópico', done_at is not null, null
from public.topics where id = current_setting('teste.topic')::uuid;

insert into resultado (teste, ok, detalhe)
select 'Informar as páginas de novo não mexe na média', r.ema = 3.35, format('ema=%s', r.ema)
from public.log_pomodoro_pages(current_setting('teste.session')::uuid, 6, true) r;

-- Força uma média divergente e aceita a sugestão.
reset role;
update public.subjects set pace_ema = 4 where id = current_setting('teste.subject')::uuid;
set local role authenticated;
select public.accept_pace_suggestion(current_setting('teste.subject')::uuid);
insert into resultado (teste, ok, detalhe)
select 'Aceitar a sugestão grava o ritmo e uma calibração automática',
  s.min_per_page = 4 and exists (select 1 from public.calibrations c where c.subject_id = s.id and c.source = 'auto'),
  format('ritmo=%s', s.min_per_page)
from public.subjects s where s.id = current_setting('teste.subject')::uuid;

select set_config('teste.session2', (public.start_pomodoro(current_setting('teste.subject')::uuid, null)).id::text, true);
select public.cancel_pomodoro(current_setting('teste.session2')::uuid, 'restart');
insert into resultado (teste, ok, detalhe)
select 'Reiniciar ciclo encerra o anterior sem concluir', status = 'cancelled' and cancel_reason = 'restart', null
from public.pomodoro_sessions where id = current_setting('teste.session2')::uuid;

-- Usuário B ------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);

insert into resultado (teste, ok, detalhe)
select 'B não vê os ciclos de A', (select count(*) from public.pomodoro_sessions) = 0, null;

do $$
begin
  perform public.complete_pomodoro(current_setting('teste.session')::uuid);
  insert into resultado (teste, ok, detalhe) values ('B não conclui ciclo de A', false, 'concluiu');
exception when others then
  insert into resultado (teste, ok, detalhe) values ('B não conclui ciclo de A', sqlstate = 'P0002', sqlerrm);
end $$;

do $$
begin
  perform public.log_pomodoro_pages(current_setting('teste.session')::uuid, 99, false);
  insert into resultado (teste, ok, detalhe) values ('B não informa páginas no ciclo de A', false, 'informou');
exception when others then
  insert into resultado (teste, ok, detalhe) values ('B não informa páginas no ciclo de A', sqlstate = 'P0002', sqlerrm);
end $$;

do $$
begin
  perform public.start_pomodoro(current_setting('teste.subject')::uuid, null);
  insert into resultado (teste, ok, detalhe) values ('B não começa ciclo na disciplina de A', false, 'começou');
exception when others then
  insert into resultado (teste, ok, detalhe) values ('B não começa ciclo na disciplina de A', sqlstate = 'P0002', sqlerrm);
end $$;

select public.cancel_pomodoro(current_setting('teste.session')::uuid, 'user');

reset role;
insert into resultado (teste, ok, detalhe)
select 'Cancelar de B não afeta o ciclo concluído de A', status = 'completed', status
from public.pomodoro_sessions where id = current_setting('teste.session')::uuid;

select n, ok, teste, detalhe from resultado order by n;

rollback;

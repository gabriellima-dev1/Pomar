-- Teste de RLS e regras da Fase 3 (gamificação).
-- Roda dentro de uma transação desfeita no fim (rollback): não deixa dados no banco.
-- Uso: set -a; source .env.local; set +a
--      npx supabase db query --remote -f supabase/tests/rls_fase3.sql
-- Resultado esperado: todas as linhas com ok = true.
begin;

create temp table resultado (n serial, teste text, ok boolean, detalhe text);
grant insert, select on resultado to authenticated, anon, service_role;
grant usage on sequence resultado_n_seq to authenticated, anon, service_role;

insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-4000-8000-0000000000a3', 'authenticated', 'authenticated', 'rls3-a@teste.invalid'),
  ('00000000-0000-4000-8000-0000000000b3', 'authenticated', 'authenticated', 'rls3-b@teste.invalid');

-- Servidor (service_role) grava XP, emblema, colheita e tema de A ---------------
set local role service_role;

insert into resultado (teste, ok, detalhe)
select 'apply_xp soma eventos e ignora chave repetida',
  new_total = 15 and cardinality(inserted) = 2, format('%s %s', new_total, inserted)
from public.apply_xp('00000000-0000-4000-8000-0000000000a3', '[
  {"source":"pomodoro","amount":10,"dedupe_key":"pomodoro:x"},
  {"source":"first_of_day","amount":5,"dedupe_key":"first_of_day:2026-11-09"}
]'::jsonb);

insert into resultado (teste, ok, detalhe)
select 'apply_xp repetido não duplica',
  new_total = 15 and cardinality(inserted) = 0, format('%s %s', new_total, inserted)
from public.apply_xp('00000000-0000-4000-8000-0000000000a3',
  '[{"source":"pomodoro","amount":10,"dedupe_key":"pomodoro:x"}]'::jsonb);

insert into resultado (teste, ok, detalhe)
select 'apply_day_close aplica com a trava certa',
  public.apply_day_close('00000000-0000-4000-8000-0000000000a3', null, '2026-11-13', 5, 5, 0,
    '[{"day":"2026-11-09","code":"fruto_do_dia"},{"day":"2026-11-10","code":"coruja"}]'::jsonb,
    '[{"week_start":"2026-11-09","tier":"prata","days":5}]'::jsonb,
    '[{"code":"halloween","week":"2026-11-09"}]'::jsonb),
  null;

insert into resultado (teste, ok, detalhe)
select 'apply_day_close com trava velha não muda nada',
  not public.apply_day_close('00000000-0000-4000-8000-0000000000a3', null, '2026-11-20', 9, 9, 2,
    '[{"day":"2026-11-14","code":"fruto_do_dia"}]'::jsonb, '[]'::jsonb, '[]'::jsonb)
  and (select streak_current = 5 and last_closed_day = '2026-11-13'
       from public.profiles where id = '00000000-0000-4000-8000-0000000000a3'),
  null;

insert into resultado (teste, ok, detalhe)
select 'Colheita só sobe de faixa',
  public.apply_day_close('00000000-0000-4000-8000-0000000000a3', '2026-11-13', '2026-11-14', 6, 6, 0,
    '[]'::jsonb, '[{"week_start":"2026-11-09","tier":"bronze","days":3}]'::jsonb, '[]'::jsonb)
  and (select tier = 'prata' from public.weekly_harvests
       where user_id = '00000000-0000-4000-8000-0000000000a3'),
  null;

reset role;

-- Usuário A --------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a3","role":"authenticated"}', true);

insert into resultado (teste, ok, detalhe)
select 'A lê o próprio XP, emblemas, colheita e tema',
  (select count(*) from public.xp_events) = 2
  and (select count(*) from public.user_daily_badges) = 2
  and (select count(*) from public.weekly_harvests) = 1
  and (select count(*) from public.user_themes) = 1,
  null;

insert into resultado (teste, ok, detalhe)
select 'Logado lê o catálogo de emblemas e temas',
  (select count(*) from public.badges) = 11 and (select count(*) from public.themes) = 4, null;

do $$
begin
  insert into public.xp_events (user_id, source, amount, dedupe_key)
  values ('00000000-0000-4000-8000-0000000000a3', 'pomodoro', 999, 'fake');
  insert into resultado (teste, ok, detalhe) values ('A não insere XP', false, 'inseriu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não insere XP', true, sqlerrm);
end $$;

do $$
begin
  insert into public.user_daily_badges (user_id, day, badge_code)
  values ('00000000-0000-4000-8000-0000000000a3', '2026-11-11', 'lua_cheia');
  insert into resultado (teste, ok, detalhe) values ('A não insere emblema', false, 'inseriu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não insere emblema', true, sqlerrm);
end $$;

do $$
begin
  update public.user_daily_badges set badge_code = 'lua_cheia';
  insert into resultado (teste, ok, detalhe) values ('A não troca o emblema sorteado', false, 'trocou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não troca o emblema sorteado', true, sqlerrm);
end $$;

do $$
begin
  insert into public.user_themes (user_id, theme_code)
  values ('00000000-0000-4000-8000-0000000000a3', 'natal');
  insert into resultado (teste, ok, detalhe) values ('A não desbloqueia tema sozinho', false, 'inseriu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não desbloqueia tema sozinho', true, sqlerrm);
end $$;

do $$
begin
  update public.weekly_harvests set tier = 'ouro';
  insert into resultado (teste, ok, detalhe) values ('A não altera a colheita', false, 'alterou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não altera a colheita', true, sqlerrm);
end $$;

do $$
begin
  update public.profiles set xp_total = 99999 where id = '00000000-0000-4000-8000-0000000000a3';
  insert into resultado (teste, ok, detalhe) values ('A não altera o XP do perfil', false, 'alterou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não altera o XP do perfil', true, sqlerrm);
end $$;

do $$
begin
  update public.profiles set theme = 'natal' where id = '00000000-0000-4000-8000-0000000000a3';
  insert into resultado (teste, ok, detalhe) values ('A não troca o tema direto (passa pelo servidor)', false, 'trocou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não troca o tema direto (passa pelo servidor)', true, sqlerrm);
end $$;

do $$
begin
  perform public.apply_xp('00000000-0000-4000-8000-0000000000a3', '[{"source":"pomodoro","amount":500,"dedupe_key":"hack"}]'::jsonb);
  insert into resultado (teste, ok, detalhe) values ('A não executa apply_xp', false, 'executou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não executa apply_xp', true, sqlerrm);
end $$;

do $$
begin
  perform public.apply_day_close('00000000-0000-4000-8000-0000000000a3', '2026-11-14', '2026-11-15', 99, 99, 2, '[]', '[]', '[]');
  insert into resultado (teste, ok, detalhe) values ('A não executa apply_day_close', false, 'executou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('A não executa apply_day_close', true, sqlerrm);
end $$;

update public.user_daily_badges set seen_at = now() where day = '2026-11-09';
update public.user_themes set seen_at = now(), tab_seen_at = now();
update public.profiles set level_seen = 2 where id = '00000000-0000-4000-8000-0000000000a3';

insert into resultado (teste, ok, detalhe)
select 'A marca como visto o próprio emblema, tema e nível',
  (select seen_at is not null from public.user_daily_badges where day = '2026-11-09')
  and (select seen_at is not null and tab_seen_at is not null from public.user_themes)
  and (select level_seen = 2 from public.profiles where id = '00000000-0000-4000-8000-0000000000a3'),
  null;

-- Usuário B --------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b3","role":"authenticated"}', true);

insert into resultado (teste, ok, detalhe)
select 'B não vê XP, emblemas, colheitas nem temas de A',
  (select count(*) from public.xp_events) = 0
  and (select count(*) from public.user_daily_badges) = 0
  and (select count(*) from public.weekly_harvests) = 0
  and (select count(*) from public.user_themes) = 0,
  null;

update public.user_daily_badges set seen_at = null;
update public.user_themes set seen_at = null;

reset role;
insert into resultado (teste, ok, detalhe)
select 'B não desmarca o "visto" de A',
  (select seen_at is not null from public.user_daily_badges
   where user_id = '00000000-0000-4000-8000-0000000000a3' and day = '2026-11-09')
  and (select seen_at is not null from public.user_themes
       where user_id = '00000000-0000-4000-8000-0000000000a3'),
  null;

select n, ok, teste, detalhe from resultado order by n;

rollback;

-- Teste de RLS e regras da Fase 5 (Feira, apelido, social e YouTube).
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
update public.profiles set username = 'rls5.bia', league_opt_in = true, is_demo = true, public_profile = true where id = '00000000-0000-4000-8000-0000000000b5';
update public.profiles set username = 'rls5.caio', league_opt_in = true where id = '00000000-0000-4000-8000-0000000000c5';

-- A semana atual pode já existir no banco (cron); os grupos de teste são novos.
insert into public.league_weeks (week_start) select atual from semana on conflict do nothing;
-- Se a semana já foi fechada (teste manual), reabre dentro desta transação.
update public.league_weeks set closed_at = null where week_start = (select atual from semana);
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

-- Social ----------------------------------------------------------------------------------
insert into public.feed_events (id, user_id, type, payload, dedupe_key)
values
  ('00000000-0000-4000-8000-00000000e5b1', '00000000-0000-4000-8000-0000000000b5', 'harvest', '{"tier":"ouro"}', 'rls5:hb'),
  ('00000000-0000-4000-8000-00000000e5c1', '00000000-0000-4000-8000-0000000000c5', 'chapter', '{"position":1}', 'rls5:hc'),
  ('00000000-0000-4000-8000-00000000e5a1', '00000000-0000-4000-8000-0000000000a5', 'stage', '{"level":3}', 'rls5:ha');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a5","role":"authenticated"}', true);

insert into resultado (teste, ok, detalhe)
select 'Busca só acha perfis públicos (sem a própria pessoa)',
  (select count(*) = 1 and bool_and(username = 'rls5.bia') from public.search_profiles('rls5')),
  (select string_agg(username, ', ') from public.search_profiles('rls5'));

insert into resultado (teste, ok, detalhe)
select 'Busca exige 2 letras e trata _ como letra',
  (select count(*) = 0 from public.search_profiles('r'))
  and (select count(*) = 0 from public.search_profiles('rls5_')),
  null;

create temp table seguiu as
select public.follow_user('rls5.bia') as bia, public.follow_user('rls5.caio') as caio,
       public.follow_user('rls5.bia') as bia_de_novo;

insert into resultado (teste, ok, detalhe)
select 'Segue perfil público; não segue privado; repetir não duplica',
  (select bia and not caio and not bia_de_novo from seguiu)
  and (select count(*) = 1 from public.follows),
  null;

do $$
begin
  insert into public.follows (follower_id, followee_id)
  values ('00000000-0000-4000-8000-0000000000a5', '00000000-0000-4000-8000-0000000000c5');
  insert into resultado (teste, ok, detalhe) values ('Não grava follows direto', false, 'gravou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Não grava follows direto', true, sqlerrm);
end $$;

insert into resultado (teste, ok, detalhe)
select 'Feed só com quem sigo e é público',
  (select count(*) = 1 and bool_and(username = 'rls5.bia' and not reacted) from public.friends_feed()),
  null;

insert into resultado (teste, ok, detalhe)
select 'Não lê itens do feed de outra pessoa direto',
  (select count(*) = 1 and bool_and(user_id = '00000000-0000-4000-8000-0000000000a5') from public.feed_events),
  null;

create temp table reagiu as
select public.send_reaction('00000000-0000-4000-8000-00000000e5b1') as bia,
       public.send_reaction('00000000-0000-4000-8000-00000000e5b1') as bia_de_novo,
       public.send_reaction('00000000-0000-4000-8000-00000000e5c1') as caio,
       public.send_reaction('00000000-0000-4000-8000-00000000e5a1') as propria;

insert into resultado (teste, ok, detalhe)
select 'Um parabéns por conquista; nada em item privado nem no próprio',
  (select bia and not bia_de_novo and not caio and not propria from reagiu)
  and (select count(*) = 1 from public.reactions),
  null;

do $$
begin
  delete from public.reactions where user_id = '00000000-0000-4000-8000-0000000000a5';
  insert into resultado (teste, ok, detalhe) values ('Parabéns não se desfaz', false, 'apagou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Parabéns não se desfaz', true, sqlerrm);
end $$;

insert into resultado (teste, ok, detalhe)
select 'Perfil privado não mostra dados; público mostra só campos públicos',
  public.public_profile('rls5.caio') = '{"privado": true}'::jsonb
  and (public.public_profile('rls5.bia') ->> 'username') = 'rls5.bia'
  and (public.public_profile('rls5.bia') ? 'level')
  and not (public.public_profile('rls5.bia') ? 'display_name')
  and public.public_profile('ninguem.aqui') is null,
  null;

select public.unfollow_user('rls5.bia');
insert into resultado (teste, ok, detalhe)
select 'Deixar de seguir tira do feed',
  (select count(*) = 0 from public.follows) and (select count(*) = 0 from public.friends_feed()),
  null;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b5","role":"authenticated"}', true);
insert into resultado (teste, ok, detalhe)
select 'B vê o parabéns recebido de A',
  (select count(*) = 1 and bool_and(from_username = 'rls5.ana_2') from public.received_reactions()),
  (select string_agg(from_username, ', ') from public.received_reactions());
reset role;

set local role anon;
do $$
begin
  perform * from public.friends_feed();
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê o feed', false, 'leu');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê o feed', true, sqlerrm);
end $$;
reset role;

-- YouTube: só o servidor grava duração de vídeo (vale XP) ---------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a5","role":"authenticated"}', true);
do $$
begin
  insert into public.topics (chapter_id, position, title, youtube_video_id, duration_sec)
  values (gen_random_uuid(), 1, 'Vídeo', 'abc', 99999);
  insert into resultado (teste, ok, detalhe) values ('Cliente não grava duração de vídeo', false, 'gravou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Cliente não grava duração de vídeo', true, sqlerrm);
end $$;

do $$
begin
  perform public.create_youtube_subject('00000000-0000-4000-8000-0000000000a5', 'X', 'PLx', 'ceu', 1, 'X', '[{"id":"a","title":"a","duration_sec":60}]');
  insert into resultado (teste, ok, detalhe) values ('Cliente não cria disciplina do YouTube direto', false, 'criou');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Cliente não cria disciplina do YouTube direto', true, sqlerrm);
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

create temp table yt as
select public.create_youtube_subject('00000000-0000-4000-8000-0000000000a5', 'Playlist', 'PLteste', 'ceu', 1.25, 'Playlist',
  '[{"id":"v1","title":"Aula 1","duration_sec":600},{"id":"v2","title":"Aula 2","duration_sec":900}]') as id;

insert into resultado (teste, ok, detalhe)
select 'Servidor cria a disciplina do YouTube com 1 capítulo e os vídeos',
  (select s.source = 'youtube' and s.video_speed = 1.25 and s.user_id = '00000000-0000-4000-8000-0000000000a5'
   from public.subjects s where s.id = (select id from yt))
  and (select count(*) = 2 and sum(t.duration_sec) = 1500 from public.topics t
       join public.chapters c on c.id = t.chapter_id where c.subject_id = (select id from yt)),
  null;

insert into resultado (teste, ok, detalhe)
select 'Fechar de novo não faz nada',
  not public.apply_league_close((select atual from semana), '[]'::jsonb),
  null;
reset role;

select n, ok, teste, detalhe from resultado order by n;

rollback;

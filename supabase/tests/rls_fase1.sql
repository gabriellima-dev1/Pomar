-- Teste de RLS da Fase 1 (catálogo, disciplinas, calibrações).
-- Roda dentro de uma transação desfeita no fim (rollback): não deixa dados no banco.
-- Uso: set -a; source .env.local; set +a
--      npx supabase db query --remote -f supabase/tests/rls_fase1.sql
-- Resultado esperado: todas as linhas com ok = true.
begin;

create temp table resultado (n serial, teste text, ok boolean, detalhe text);
grant insert, select on resultado to authenticated, anon;
grant usage on sequence resultado_n_seq to authenticated, anon;

-- Dois usuários fictícios (o trigger cria os perfis; tudo é desfeito no rollback).
insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated', 'rls-a@teste.invalid'),
  ('00000000-0000-4000-8000-0000000000b1', 'authenticated', 'authenticated', 'rls-b@teste.invalid');

-- Usuário A ------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);

select set_config('teste.a_subject', public.create_manual_subject(
  'Disciplina A', 'tomate',
  '[{"title":"Cap 1","topics":[{"title":"T1","page_start":1,"page_end":10},{"title":"T2","page_start":11,"page_end":20}]},{"title":"Cap 2","topics":[{"title":"T3","page_start":21,"page_end":30}]}]'::jsonb
)::text, true);
select set_config('teste.a_chapter', (select id::text from public.chapters order by position limit 1), true);
select set_config('teste.a_topic', (select t.id::text from public.topics t join public.chapters c on c.id = t.chapter_id order by c.position, t.position limit 1), true);

insert into resultado (teste, ok, detalhe)
select 'A vê a própria disciplina (2 caps, 3 tópicos)',
  (select count(*) from public.subjects) = 1 and (select count(*) from public.chapters) = 2 and (select count(*) from public.topics) = 3,
  format('%s/%s/%s', (select count(*) from public.subjects), (select count(*) from public.chapters), (select count(*) from public.topics));

select public.move_chapter(current_setting('teste.a_chapter')::uuid, 1);
insert into resultado (teste, ok, detalhe)
select 'A troca a ordem dos capítulos', (select position from public.chapters where id = current_setting('teste.a_chapter')::uuid) = 2, null;

select public.record_calibration(5, 600, 'stopwatch', current_setting('teste.a_subject')::uuid, false);
insert into resultado (teste, ok, detalhe)
select 'A calibra: 2 min/pág na disciplina e no padrão (1ª vez)',
  (select min_per_page from public.subjects) = 2.00 and (select min_per_page from public.profiles where id = '00000000-0000-4000-8000-0000000000a1') = 2.00,
  format('disc=%s perfil=%s', (select min_per_page from public.subjects), (select min_per_page from public.profiles where id = '00000000-0000-4000-8000-0000000000a1'));

select public.record_calibration(1, 240, 'manual', current_setting('teste.a_subject')::uuid, false);
insert into resultado (teste, ok, detalhe)
select '2ª calibração sem "padrão" não mexe no global',
  (select min_per_page from public.subjects) = 4.00 and (select min_per_page from public.profiles where id = '00000000-0000-4000-8000-0000000000a1') = 2.00,
  null;

-- Usuário B ------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b1","role":"authenticated"}', true);

insert into resultado (teste, ok, detalhe)
select 'B não vê nada de A (disciplinas, capítulos, tópicos, calibrações)',
  (select count(*) from public.subjects) + (select count(*) from public.chapters) + (select count(*) from public.topics) + (select count(*) from public.calibrations) = 0,
  null;

with u as (update public.topics set done_at = now() where id = current_setting('teste.a_topic')::uuid returning 1)
insert into resultado (teste, ok, detalhe) select 'B não marca tópico de A', (select count(*) from u) = 0, null;

with u as (update public.subjects set title = 'hack' where id = current_setting('teste.a_subject')::uuid returning 1)
insert into resultado (teste, ok, detalhe) select 'B não renomeia disciplina de A', (select count(*) from u) = 0, null;

with d as (delete from public.chapters where id = current_setting('teste.a_chapter')::uuid returning 1)
insert into resultado (teste, ok, detalhe) select 'B não exclui capítulo de A', (select count(*) from d) = 0, null;

do $$ begin
  insert into public.chapters (subject_id, position, title) values (current_setting('teste.a_subject')::uuid, 9, 'x');
  insert into resultado (teste, ok, detalhe) values ('B não cria capítulo na disciplina de A', false, 'inseriu!');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('B não cria capítulo na disciplina de A', true, sqlstate);
end $$;

do $$ begin
  perform public.record_calibration(5, 600, 'stopwatch', current_setting('teste.a_subject')::uuid, false);
  insert into resultado (teste, ok, detalhe) values ('B não calibra disciplina de A', false, 'passou!');
exception when others then
  insert into resultado (teste, ok, detalhe) values ('B não calibra disciplina de A', true, sqlstate);
end $$;

do $$ begin
  perform public.move_chapter(current_setting('teste.a_chapter')::uuid, -1);
  insert into resultado (teste, ok, detalhe) values ('B não reordena capítulo de A', false, 'passou!');
exception when others then
  insert into resultado (teste, ok, detalhe) values ('B não reordena capítulo de A', true, sqlstate);
end $$;

do $$ begin
  insert into public.subjects (user_id, title, source) values ('00000000-0000-4000-8000-0000000000a1', 'falsa', 'manual');
  insert into resultado (teste, ok, detalhe) values ('B não cria disciplina em nome de A', false, 'inseriu!');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('B não cria disciplina em nome de A', true, sqlstate);
end $$;

-- B cria pelo catálogo: Cormen, capítulos 2, 3 e 4 inteiros.
select set_config('teste.b_subject', public.create_subject_from_catalog(
  (select id from public.catalog_books where slug = 'algoritmos-cormen'),
  (select array_agg(t.id) from public.catalog_topics t join public.catalog_chapters c on c.id = t.chapter_id
     join public.catalog_books b on b.id = c.book_id where b.slug = 'algoritmos-cormen' and c.position in (2, 3, 4)),
  'Algoritmos', 'ceu'
)::text, true);
insert into resultado (teste, ok, detalhe)
select 'B copia 3 capítulos do Cormen (renumerados 1–3)',
  (select array_agg(position order by position) from public.chapters) = array[1, 2, 3]
    and (select count(*) from public.topics) = (select count(*) from public.catalog_topics t join public.catalog_chapters c on c.id = t.chapter_id join public.catalog_books b on b.id = c.book_id where b.slug = 'algoritmos-cormen' and c.position in (2, 3, 4)),
  format('caps=%s tópicos=%s', (select count(*) from public.chapters), (select count(*) from public.topics));

do $$ begin
  perform public.create_subject_from_catalog((select id from public.catalog_books where slug = 'redes-kurose-ross'),
    array[(select t.id from public.catalog_topics t limit 0)]::uuid[] || (select array_agg(t.id) from public.catalog_topics t join public.catalog_chapters c on c.id = t.chapter_id join public.catalog_books b on b.id = c.book_id where b.slug = 'algoritmos-cormen' and c.position = 1),
    'Mistura', 'ceu');
  insert into resultado (teste, ok, detalhe) values ('Tópicos de outro livro são recusados', false, 'passou!');
exception when others then
  insert into resultado (teste, ok, detalhe) values ('Tópicos de outro livro são recusados', true, sqlstate);
end $$;

do $$ begin
  update public.catalog_topics set page_start = 1 where false;
  insert into public.catalog_books (slug, title, authors, edition) values ('x', 'x', 'x', 'x');
  insert into resultado (teste, ok, detalhe) values ('Logado não escreve no catálogo', false, 'inseriu!');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Logado não escreve no catálogo', true, sqlstate);
end $$;

insert into resultado (teste, ok, detalhe)
select 'Logado lê o catálogo (8 livros)', (select count(*) from public.catalog_books) = 8, null;

-- Visitante (anon) --------------------------------------------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  perform 1 from public.subjects;
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê disciplinas', false, 'leu!');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê disciplinas', true, sqlstate);
end $$;
do $$ begin
  perform 1 from public.catalog_books;
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê o catálogo', false, 'leu!');
exception when insufficient_privilege then
  insert into resultado (teste, ok, detalhe) values ('Visitante não lê o catálogo', true, sqlstate);
end $$;

reset role;
select n, ok, teste, detalhe from resultado order by n;
rollback;

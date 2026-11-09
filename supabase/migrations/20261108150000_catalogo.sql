-- Catálogo de livros (DESIGN.md §7): só a estrutura do sumário
-- (capítulos, tópicos e intervalos de páginas), sem conteúdo dos livros.
-- Dados vêm de supabase/seed/catalog/*.json via `npm run db:seed:catalog`
-- (chave secreta). Usuários logados só leem.

create table public.catalog_books (
  id uuid primary key default gen_random_uuid(),
  -- Identificador estável do JSON de seed (upsert idempotente).
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  authors text not null check (char_length(authors) between 1 and 300),
  edition text not null check (char_length(edition) between 1 and 60),
  publisher text check (char_length(publisher) <= 100),
  year int check (year between 1900 and 2100),
  total_pages int check (total_pages > 0),
  -- false até a dupla conferir as páginas na edição indicada ("páginas aproximadas").
  verified boolean not null default false,
  -- De onde veio o sumário e como as páginas foram obtidas.
  source_note text check (char_length(source_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.catalog_books is 'Livros do catálogo (DESIGN.md §7).';

create table public.catalog_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.catalog_books (id) on delete cascade,
  position int not null check (position >= 1),
  title text not null check (char_length(title) between 1 and 200),
  unique (book_id, position)
);

create table public.catalog_topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.catalog_chapters (id) on delete cascade,
  position int not null check (position >= 1),
  title text not null check (char_length(title) between 1 and 200),
  page_start int not null check (page_start >= 1),
  page_end int not null,
  check (page_end >= page_start),
  unique (chapter_id, position)
);

-- RLS: catálogo é leitura pública para quem está logado; escrita só pela chave secreta.
alter table public.catalog_books enable row level security;
alter table public.catalog_chapters enable row level security;
alter table public.catalog_topics enable row level security;

revoke all on public.catalog_books, public.catalog_chapters, public.catalog_topics
  from anon, authenticated;
grant select on public.catalog_books, public.catalog_chapters, public.catalog_topics
  to authenticated;

create policy "catálogo: logados leem livros"
  on public.catalog_books for select to authenticated using (true);

create policy "catálogo: logados leem capítulos"
  on public.catalog_chapters for select to authenticated using (true);

create policy "catálogo: logados leem tópicos"
  on public.catalog_topics for select to authenticated using (true);

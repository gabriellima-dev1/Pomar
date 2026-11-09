-- Calibração do ritmo de leitura (DESIGN.md §4.2, §8).
-- Ritmo por disciplina (subjects.min_per_page) e padrão global (profiles.min_per_page).

create table public.calibrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete set null,
  pages int not null check (pages between 1 and 500),
  seconds int not null check (seconds between 1 and 36000),
  source text not null check (source in ('stopwatch', 'manual', 'auto')),
  created_at timestamptz not null default now()
);

comment on table public.calibrations is 'Medições de ritmo (min/página) do usuário.';
create index calibrations_user_id_created_at_idx on public.calibrations (user_id, created_at);

alter table public.calibrations enable row level security;

revoke all on public.calibrations from anon, authenticated;
grant select on public.calibrations to authenticated;
grant insert (subject_id, pages, seconds, source) on public.calibrations to authenticated;

create policy "calibrações: dono lê"
  on public.calibrations for select to authenticated
  using (user_id = (select auth.uid()));

-- A chave estrangeira não passa pela RLS: confere que a disciplina também é do usuário.
create policy "calibrações: dono cria"
  on public.calibrations for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      subject_id is null
      or exists (
        select 1 from public.subjects s
        where s.id = calibrations.subject_id and s.user_id = (select auth.uid())
      )
    )
  );

-- Registra a medição e atualiza o ritmo. O ritmo global é atualizado quando
-- p_set_default = true, quando a calibração não é de uma disciplina ou quando
-- o usuário ainda não tem ritmo global. Devolve o ritmo em min/página.
create function public.record_calibration(
  p_pages int,
  p_seconds int,
  p_source text,
  p_subject_id uuid default null,
  p_set_default boolean default false
)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_pace numeric := round(p_seconds::numeric / 60 / nullif(p_pages, 0), 2);
  v_global numeric;
begin
  if v_pace is null or v_pace < 0.1 or v_pace > 60 then
    raise exception 'Ritmo fora do intervalo (0,1 a 60 min por página).' using errcode = '22023';
  end if;
  if p_source not in ('stopwatch', 'manual') then
    raise exception 'Origem de calibração inválida.' using errcode = '22023';
  end if;

  insert into public.calibrations (subject_id, pages, seconds, source)
  values (p_subject_id, p_pages, p_seconds, p_source);

  if p_subject_id is not null then
    update public.subjects set min_per_page = v_pace where id = p_subject_id;
    if not found then
      raise exception 'Disciplina não encontrada.' using errcode = 'P0002';
    end if;
  end if;

  select min_per_page into v_global from public.profiles where id = (select auth.uid());
  if p_set_default or p_subject_id is null or v_global is null then
    update public.profiles set min_per_page = v_pace where id = (select auth.uid());
  end if;

  return v_pace;
end;
$$;

revoke execute on function public.record_calibration(int, int, text, uuid, boolean)
  from public, anon;
grant execute on function public.record_calibration(int, int, text, uuid, boolean)
  to authenticated;

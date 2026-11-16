-- Fase 6: sair do experimento (DESIGN §9.4, telas 31 e 33) e exclusão de conta (tela 32).

-- Quem saiu do experimento passa a ver as recompensas e sai da comparação A × B.
-- `legacy` marca as contas anteriores à Fase 4 (coorte A atribuída na migração, sem
-- sorteio): ficam fora da comparação e não veem o card do experimento.
alter table public.user_cohorts
  add column left_at timestamptz,
  add column legacy boolean not null default false;

comment on column public.user_cohorts.left_at is
  'Quando a pessoa saiu do experimento (§9.4). Fora da comparação; recompensas visíveis.';
comment on column public.user_cohorts.legacy is
  'Conta anterior à Fase 4 (sem sorteio). Fora da comparação e sem o card do experimento.';

-- Contas criadas antes da linha de coorte: a migração de 12/11 deu "A" a todas elas de
-- uma vez; no cadastro, a coorte é sorteada na mesma transação (mesmo instante).
update public.user_cohorts c
set legacy = true
from auth.users u
where u.id = c.user_id
  and u.created_at < c.assigned_at - interval '1 minute';

-- Sair do experimento: só a própria linha, uma vez (repetir não muda a data).
create function public.leave_experiment()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.user_cohorts
  set left_at = coalesce(left_at, now())
  where user_id = (select auth.uid());
$$;

revoke execute on function public.leave_experiment() from public, anon;
grant execute on function public.leave_experiment() to authenticated;

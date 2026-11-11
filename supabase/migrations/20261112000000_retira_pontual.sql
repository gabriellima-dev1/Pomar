-- Retira o emblema Pontual (DECISOES 11/11): sem lembrete diário (DESIGN §12), ele
-- seria impossível de ganhar. O álbum passa a ter 11 emblemas.

-- Defensivo: o Pontual dependia de `reminder_time`, que nunca foi preenchido, então
-- não deve haver nenhum. Se houver, o dia continua com emblema (vira Fruto do Dia).
update public.user_daily_badges set badge_code = 'fruto_do_dia' where badge_code = 'pontual';

delete from public.badges where code = 'pontual';

-- `profiles.reminder_time` deixa de ser usado: a coluna fica (DESIGN §8), mas o
-- cliente não a altera mais.
revoke update (reminder_time) on public.profiles from authenticated;

comment on column public.profiles.reminder_time is
  'Sem uso desde 11/11/2026: o lembrete diário saiu do projeto (DESIGN §12).';

-- Telemetria (DESIGN.md §9). Eventos são inseridos pelo cliente (RLS) ou pelo
-- banco (trigger de cadastro). Leitura só para admins (política na migração de perfis).

create table public.telemetry_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  anon_id text check (char_length(anon_id) <= 64),
  name text not null check (
    -- Mesma lista de lib/telemetry/events.ts. Evento novo = migração nova.
    name in (
      'landing_viewed',
      'signup_completed',
      'onboarding_quiz_completed',
      'league_opt_in_choice',
      'subject_created',
      'calibration_completed',
      'pomodoro_started',
      'pomodoro_paused',
      'pause_nudge_shown',
      'pause_nudge_choice',
      'pomodoro_completed',
      'pomodoro_cancelled',
      'pages_logged',
      'topic_completed',
      'badge_awarded',
      'harvest_awarded',
      'level_up',
      'theme_changed',
      'follow_created',
      'reaction_sent',
      'notification_shown',
      'notification_clicked',
      'app_opened'
    )
  ),
  props jsonb not null default '{}'::jsonb check (
    jsonb_typeof(props) = 'object' and octet_length(props::text) <= 4096
  ),
  created_at timestamptz not null default now()
);

comment on table public.telemetry_events is 'Eventos de telemetria (DESIGN.md §9.1).';

create index telemetry_events_name_created_at_idx on public.telemetry_events (name, created_at);
create index telemetry_events_user_id_created_at_idx on public.telemetry_events (user_id, created_at);

alter table public.telemetry_events enable row level security;

-- Privilégios explícitos: o cliente só insere estas colunas (não forja created_at nem id).
revoke all on public.telemetry_events from anon, authenticated;
grant insert (user_id, anon_id, name, props) on public.telemetry_events to anon, authenticated;
grant select on public.telemetry_events to authenticated;

create policy "telemetria: anônimo insere sem user_id"
  on public.telemetry_events for insert to anon
  with check (user_id is null);

create policy "telemetria: usuário insere só com o próprio id"
  on public.telemetry_events for insert to authenticated
  with check (user_id = (select auth.uid()));

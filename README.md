# 🍅 Pomar

Web app de controle de estudos gamificado, com Pomodoro como motor principal.
Projeto final de **Computação Persuasiva** (UFAL — Campus Arapiraca).

- Especificação: [`docs/DESIGN.md`](docs/DESIGN.md)
- Plano e fases: [`docs/PLANO.md`](docs/PLANO.md)
- Decisões: [`docs/DECISOES.md`](docs/DECISOES.md)
- Regras para o Claude Code: [`CLAUDE.md`](CLAUDE.md)

## Stack

Next.js 16 (App Router) · TypeScript estrito · Tailwind CSS 4 · Supabase (Postgres, Auth, RLS, `@supabase/ssr`) · Vitest · Vercel.

## Rodando localmente

Requisitos: Node 22+ e acesso ao projeto Supabase.

```bash
npm install
cp .env.example .env.local   # preencha os valores (nunca commite este arquivo)
npm run dev                  # http://localhost:3000
```

Variáveis (ver `.env.example`):

| Variável | Onde é usada |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | navegador e servidor |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | navegador e servidor (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | só servidor/cron (`sb_secret_...`) |
| `YOUTUBE_API_KEY` | só servidor |
| `CRON_SECRET` | rota do cron das ligas |
| `NEXT_PUBLIC_APP_URL` | URL pública do app |
| `SUPABASE_DB_PASSWORD` | só local (migrações); **nunca** na Vercel |

## Comandos

```bash
npm run dev          # servidor local
npm run lint         # ESLint
npm run typecheck    # tipos de rota + tsc
npm test             # Vitest
npm run format       # Prettier
npm run db:push      # aplica migrações no Supabase remoto (supabase db push)
npm run db:types     # regenera lib/supabase/database.types.ts
npm run db:seed:catalog  # carrega o catálogo (supabase/seed/catalog/*.json) no Supabase
npm run catalog:review   # regenera docs/catalogo-revisao.md
```

Para os comandos do Supabase, carregue a senha do banco antes: `set -a; source .env.local; set +a`.
Na CLI 3, os comandos de banco usam o projeto local por padrão; para o remoto, passe `--remote`.

## Estrutura

```
app/(public)/         landing, login, cadastro
app/(app)/            área logada (início, ...)
app/auth/callback/    retorno do OAuth
components/           UI reutilizável
lib/                  lógica pura e testável
lib/supabase/         clientes browser/servidor/proxy + tipos gerados
lib/telemetry.ts      track(name, props)
proxy.ts              renovação de sessão e rotas protegidas
supabase/migrations/  SQL versionado
```

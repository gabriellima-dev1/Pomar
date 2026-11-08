# CLAUDE.md — Pomar

Web app de controle de estudos gamificado, com Pomodoro como motor principal. Projeto final da disciplina **Computação Persuasiva** (UFAL — Campus Arapiraca), feito em dupla. **Entrega: 26/11/2026. Congelamento de funcionalidades: 23/11.**

Você (Claude Code) implementa tudo. A dupla toma as decisões de produto e aprova cada fase.

## Documentos (leia antes de qualquer tarefa)
- `docs/DESIGN.md` — especificação do produto (fonte de verdade): funcionalidades, regras de gamificação, temas, modelo de dados, telemetria, ética.
- `docs/PLANO.md` — fases, tarefas com checkbox, critérios de aceite. Marque as caixas ao concluir.
- `docs/DECISOES.md` — registro de decisões novas ou pendentes (crie se não existir). Formato: data · decisão · motivo · status (aprovada/pendente).
- `docs/design/` — tokens e referências visuais aprovadas pela dupla.

## Regras de trabalho
- Comece cada fase em **modo de plano** e espere aprovação antes de implementar.
- **Não invente decisão de produto.** Se faltar algo no DESIGN.md: pergunte. Se a dupla não estiver disponível, escolha a opção mais simples e reversível e registre como "pendente" em `docs/DECISOES.md`.
- Trabalhe numa branch por fase (`fase-N-nome`), commits pequenos em português no imperativo (`adiciona cálculo de XP`), PR ao final.
- Antes de commitar: `npm run lint && npm run typecheck && npm test` sem erros.
- Nunca commite segredos. Variáveis ficam em `.env.local` e na Vercel; o repositório só tem `.env.example`.
- Nunca peça para colarem chaves no chat. Se faltar uma variável, diga o nome dela e onde configurar.

## Stack
- Next.js (App Router) + TypeScript (`strict`) + Tailwind CSS
- Supabase: Postgres, Auth (e-mail/senha + Google), RLS, `@supabase/ssr`
- Deploy: Vercel (preview por PR, produção na `main`); cron das ligas via Vercel Cron
- Testes: Vitest (lógica pura) + Playwright (fluxo principal, Fase 6)
- Gráficos: Recharts. Ícones: lucide-react. Sem bibliotecas de animação pesadas.

## Estrutura
```
app/                  rotas (App Router)
  (public)/           landing, login, cadastro, transparência
  (app)/              início, disciplinas, pomodoro, conquistas, liga, social, estatísticas, configurações
  admin/              painel de telemetria (is_admin)
  api/                rotas de servidor (youtube, cron, export)
components/           UI reutilizável
components/scenes/    cenas SVG de cada tema
lib/                  lógica pura e testável (timer, estimates, gamification/*)
lib/supabase/         clientes browser/servidor
lib/telemetry.ts      track(name, props)
themes/               tokens, layout preset e config de cada tema
supabase/migrations/  SQL versionado
supabase/seed/        catálogo e usuários demo
docs/
```

## Regras de domínio que não podem quebrar
- **XP, emblemas, colheitas, ofensiva e ligas são calculados no servidor.** O cliente nunca envia valores de XP.
- Um pomodoro só conta se `ended_at − started_at − paused_sec ≥ 90%` do foco planejado.
- **Timer baseado em timestamps:** continua correndo com a aba oculta e sobrevive a recarregar.
- **Pausa não pune.** Ela só abre o pop-up de nudge (texto no DESIGN.md §4.5). Cancelar não dá XP.
- Foco 15–60 min, descanso curto 5–30, longo 10–30, ajustados em passos de 5.
- Emblema diário: 1 por dia com pomodoro, **sorteado no servidor** entre os elegíveis, ponderado pela raridade. Fechamento "preguiçoso" ao abrir o app.
- Datas de ofensiva, emblemas e semanas usam o **fuso do usuário** (`profiles.timezone`).
- Ligas e perfil público são **opt-in, sem pré-marcação**.
- Máximo de **2 notificações não solicitadas por dia**.
- Temas desbloqueados ficam para sempre. Nada é comprável.
- Usuários demo têm `is_demo = true`, selo visível e podem ser excluídos das métricas.
- Todo evento do DESIGN.md §9.1 deve ser registrado com `track()` no momento em que a funcionalidade é criada.

## Cenas e temas (leveza)
- SVG inline como componente React; animação só com CSS em `transform`/`opacity`.
- No máximo 3 camadas animadas por cena; partículas ≤ 20.
- Sem vídeo, canvas, WebGL ou Lottie.
- Pausar animações com a aba oculta; desativar com `prefers-reduced-motion`.
- Tema = tokens CSS + cena + preset de layout (grid areas de árvore e cronômetro) + fruto + acessório do mascote.

## Banco
- Toda mudança de schema é uma migração nova em `supabase/migrations/` (nunca editar migração já aplicada).
- RLS ligada em todas as tabelas de usuário, com políticas explícitas.
- Use a chave secreta (`SUPABASE_SECRET_KEY`, `sb_secret_...`) apenas em rotas de servidor e no cron. No navegador, só a publishable key. Não use as chaves legadas `anon`/`service_role`.

## Interface
- Português do Brasil em toda a interface e nas mensagens.
- Mobile-first e responsivo; contraste AA; foco de teclado visível.
- Mensagens do mascote acolhedoras, nunca culpabilizantes.

## Comandos
```
npm run dev          # servidor local
npm run lint
npm run typecheck    # next typegen + tsc
npm test             # Vitest
npm run test:e2e     # Playwright
npm run db:push      # aplicar migrações (supabase db push --remote; carregar .env.local antes)
npm run db:types     # regenerar lib/supabase/database.types.ts
```
(Ajuste esta seção se os scripts mudarem.)

## Definição de pronto (por tarefa)
1. Funciona no preview da Vercel.
2. Lógica nova em `lib/` tem testes.
3. Eventos de telemetria da funcionalidade registrados.
4. RLS verificada para os dados novos.
5. Caixa marcada em `docs/PLANO.md`; decisões novas em `docs/DECISOES.md`.

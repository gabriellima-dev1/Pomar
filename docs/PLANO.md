# Pomar — Plano de Desenvolvimento

> Roteiro para o Claude Code implementar o Pomar e para a dupla acompanhar e aprovar.
> Especificação completa do produto: `docs/DESIGN.md`. Regras de trabalho: `CLAUDE.md`.
> Prazo final: **26/11/2026**. Congelamento de funcionalidades: **23/11**.

---

## 0. Papéis

| Quem | Faz |
|---|---|
| **Dupla** | Toma decisões de produto, cria contas e chaves, aprova os designs, revisa cada fase no link de preview, recruta colegas para testar, escreve/ajusta relatório e slides |
| **Claude Code** | Implementa, escreve testes, roda migrações, faz commits e PRs, atualiza este plano e `docs/DECISOES.md` |
| **Claude no chat (claude.ai)** | Mockups e design system para aprovação (Design / Design System), revisão do relatório, slides |

**Regra de ouro:** o Claude Code não inventa decisão de produto. Se algo não estiver no `DESIGN.md`, ele pergunta ou registra a dúvida em `docs/DECISOES.md` como "pendente" e segue com a opção mais simples e reversível.

---

## 1. Pré-requisitos (feitos pela dupla, ~40 min)

- [ ] **GitHub:** criar o repositório `pomar` (privado) e dar acesso aos dois.
- [ ] **Supabase:** criar o projeto (região São Paulo). Guardar `Project URL`, `publishable key`, `secret key` e a senha do banco.
- [ ] **Vercel:** criar a conta e autorizar o repositório. A importação e as variáveis de ambiente (seção 6) ficam para o fim da Fase 0, quando o repositório já tiver o Next.js. No plano Hobby, repositório privado só aceita deploy de commits do dono da conta: deixar o repositório público ou concentrar os pushes numa só pessoa.
- [ ] **Google Cloud:** criar um projeto e, nele:
  - [ ] Credenciais **OAuth 2.0** (tipo "aplicativo web") para o login com Google. Copiar `client id` e `client secret` para o Supabase (Authentication → Providers → Google). Adicionar o callback do Supabase como URI de redirecionamento autorizado.
  - [ ] Ativar a **YouTube Data API v3** e criar uma **chave de API** restrita a essa API.
- [ ] **Claude Code** instalado em um dos computadores, aberto na pasta do repositório clonado.
- [ ] Copiar `CLAUDE.md` para a raiz do repositório e `docs/` (DESIGN.md, PLANO.md) para a pasta `docs/`; criar o `.env.local`; rodar `npx supabase login` uma vez.

> Passo a passo detalhado: documento "Pomar — Tutorial dos pré-requisitos".

> Chaves e senhas **nunca** são coladas no chat do Claude Code nem commitadas. Elas vão no `.env.local` (local) e nas variáveis da Vercel. O repositório tem só o `.env.example`, com os nomes.

---

## 2. Como conduzir cada sessão do Claude Code

1. Abrir uma sessão nova por fase (ou por bloco grande de uma fase).
2. Colar o **prompt da fase** (seção 5). O Claude Code começa em **modo de plano**: lê `CLAUDE.md`, `DESIGN.md` e este plano e apresenta o que vai fazer.
3. Aprovar o plano (ou corrigir). Ele implementa numa **branch** `fase-N-nome`.
4. Ao terminar, ele roda `lint`, `typecheck` e `test`, faz commit e abre um PR. A Vercel gera um **link de preview**.
5. A dupla testa no preview usando o **checklist de aceite** da fase. Se estiver ok, faz o merge na `main` (deploy de produção automático).
6. O Claude Code marca as caixas deste plano e registra decisões novas em `docs/DECISOES.md`.

---

## 3. Design antes do código (08–10/11) — primeira onda entregue em 09/11

Usar o recurso de **design do Claude** no chat (claude.ai), não no Claude Code:

1. **Design System "Pomar"**: tokens (cores neutras + 4 temas, tipografia, espaçamentos, raios), componentes base (botão, card de disciplina, anel de progresso, pop-up, emblema).
2. **Design** com as telas principais para aprovar:
   - Início (cards), Pomodoro no tema Clássico, modal de fim de ciclo, pop-up de pausa, nova disciplina (catálogo), conquistas, liga.
   - As **4 cenas temáticas** do pomodoro, mostrando a posição da árvore e do cronômetro em cada uma.
3. Depois da aprovação, pedir ao Claude no chat para **exportar** tokens e especificações para arquivos (`docs/design/tokens.json`, `docs/design/telas.md` e imagens de referência em `docs/design/`). Colocar esses arquivos no repositório. O Claude Code implementa a partir deles.

> As telas que não forem desenhadas (estatísticas, configurações, admin, transparência) seguem os componentes do design system, sem mockup próprio.

**Entregue em 09/11 (onda 1):** `docs/design/` com tokens, `telas.md`, imagens das telas da Fase 2 e das 4 cenas, cenas animadas, ícones dos emblemas e Seu Tomás. **Entregue em 10/11 (onda 2, gamificação):** seção "Fase 3" do `telas.md`, referências `09`–`14` (conquistas, fruto de ontem, subida de nível, tema desbloqueado), medalhas em `docs/design/colheitas/` e tokens `medal-*`. **Entregue em 10/11 (onda 3, landing e onboarding):** seção "Fase 4" e "Computador e tablet" do `telas.md`, referências `15`–`22`, `docs/design/quiz-bartle.json` e tokens `medal-esmeralda*`. **Entregue em 11/11 (onda 4, Fase 5):** seção "Fase 5" do `telas.md` e referências `23`–`30` (Feira, apelido, resultado da semana, amigos, busca, perfil público, estatísticas, YouTube). **Entregue em 12/11 (onda 5, Fase 6):** seção "Fase 6" do `telas.md` e referências `31`–`34` (configurações, excluir conta, transparência, admin). **Design completo.**

---

## 4. Fases

### Fase 0 — Fundação (08–09/11)
- [x] Next.js (App Router) + TypeScript estrito + Tailwind + ESLint/Prettier
- [x] Supabase: cliente browser/servidor (`@supabase/ssr`), migrações versionadas em `supabase/migrations/`
- [x] Auth: e-mail/senha + Google, páginas de login/cadastro, middleware de rotas protegidas
- [x] Tabela `profiles` criada por trigger no cadastro; RLS ligada
- [x] Helper de telemetria `track(name, props)` + tabela `telemetry_events` (instrumentar desde já)
- [x] Vitest configurado; CI (GitHub Actions) com lint + typecheck + test
- [x] Push da estrutura; **avisar a dupla** para importar o projeto na Vercel e configurar as URLs de retorno (tutorial, 5.2 e 5.3)
- [x] Deploy na Vercel funcionando com login — produção: https://pomar-neon.vercel.app (aceite em 08/11)

**Aceite:** criar conta por e-mail e por Google no link de produção; usuário aparece em `profiles`; evento `signup_completed` registrado.

### Fase 1 — Disciplinas e catálogo (10–12/11)
- [x] Migrações: catálogo, `subjects`, `chapters`, `topics`, `calibrations`
- [x] Seed do catálogo (`supabase/seed/catalog/*.json`) com os livros do `DESIGN.md` §7, todos `verified = false` (8 livros; Szwarcfiter pendente)
- [x] Gerar `docs/catalogo-revisao.md`: lista de livros/edições/capítulos para a dupla conferir as páginas
- [x] Criar disciplina pelo catálogo (escolher livro → selecionar capítulos/tópicos → copiar estrutura)
- [x] Criar disciplina manual (capítulos, tópicos, páginas inicial/final)
- [x] Página da disciplina: lista com checkboxes; marcar tópico soma as páginas; editar/reordenar/excluir
- [x] Calibração: entrada direta + mini cronômetro; ritmo por disciplina e padrão global
- [x] Funções puras de estimativa (`lib/estimates.ts`) com testes

**Aceite:** criar uma disciplina a partir do Cormen escolhendo 3 capítulos; criar outra manual; calibrar com o cronômetro; marcar tópicos e ver o progresso e as estimativas mudarem. — **feito pela dupla em produção em 09/11; RLS verificada com `supabase/tests/rls_fase1.sql`.**

### Fase 2 — Pomodoro e tela inicial (12–14/11)
- [x] Aplicar o design: `docs/design/tokens.css` no lugar dos tokens provisórios do `globals.css`, Fredoka + Nunito, BottomNav, e redesenhar as telas da Fase 1 conforme `docs/design/telas.md`
- [x] Motor do timer baseado em timestamps (`lib/timer.ts`), com testes: continua fora da aba, sobrevive a recarregar
- [x] Botões −5/+5 com os limites do `DESIGN.md` §4.5; ciclo longo a cada 4
- [x] Pop-up de nudge na pausa (texto e botões do §4.5); eventos `pause_nudge_shown`/`pause_nudge_choice`
- [x] Fim do ciclo: som, notificação do navegador (com pedido de permissão contextual), modal de páginas lidas
- [x] Sessões salvas em `pomodoro_sessions`, com a regra dos 90% validada no servidor
- [x] Recalibração automática (média móvel, sugestão quando divergir >20%)
- [x] Tela inicial com cards (anel, restante, próximo tópico, previsão, botão Começar)
- [x] Cena **Clássico** em SVG animado a partir de `docs/design/cenas/scene-classico.html` (fruto amadurecendo durante o foco, colheita no fim), com o cronômetro em vidro e as cores da paisagem em tokens

**Aceite:** do card, 1 clique abre o pomodoro no próximo tópico; trocar de aba e voltar mantém o tempo certo; pausar mostra o pop-up; concluir pede as páginas e atualiza o card. — **feito pela dupla em 10/11 (PRs #11, #12 e #13); RLS e regras verificadas com `supabase/tests/rls_fase2.sql` (20 testes, com rollback).**

### Fase 3 — Gamificação (15–17/11)
- [x] XP calculado no servidor (`lib/gamification/xp.ts`) e tabela `xp_events`
- [x] Níveis e estágios da árvore; animação de subida de nível
- [x] Ofensiva + congelamentos, no fuso do usuário
- [x] Fechamento preguiçoso do dia: elegibilidade dos emblemas + sorteio ponderado no servidor (`lib/gamification/badges.ts`), com testes de cada regra
- [x] Colheita semanal (bronze/prata/ouro) e álbum de conquistas
- [x] Sistema de temas: tokens CSS + cena + preset de layout + fruto + acessório do Seu Tomás; cenas **Noturno, Halloween e Natal**
- [x] Desbloqueio de temas por colheita; sugestão sazonal; flag de admin para liberar tudo
- [x] Mascote Seu Tomás com falas contextuais (onboarding, conquistas, retorno)

**Aceite:** com dados de teste, um dia com pomodoro gera exatamente 1 emblema no dia seguinte; 5 dias geram Colheita de Prata e desbloqueiam Halloween; trocar o tema muda cenário e posições. — **feito pela dupla em produção em 11/11 (PRs #16, #17 e #18), com a conta de teste `teste.fase3@example.com` (`is_demo`) e `npm run demo:week`: 1 dia → 1 emblema; 5 dias → Colheita de Prata + Halloween; troca de tema muda cena e posições; XP no fim do ciclo. RLS verificada com `supabase/tests/rls_fase3.sql` (19 testes, com rollback). A checagem das animações fica para a Fase 6 (Playwright).**

### Fase 4 — Onboarding, landing e beta (17–18/11)
- [x] Retirar o emblema **Pontual** (decisão de 11/11): nova migração removendo `pontual` do catálogo de emblemas, tirar a regra e os testes de `lib/gamification/badges.ts`, o item de `catalog.ts` e o ícone de `BadgeIcon.tsx`; o álbum passa a ter 11 emblemas. `profiles.reminder_time` deixa de ser usado
- [x] Landing page com contadores reais
- [x] Onboarding completo: quiz Bartle (8 perguntas) → opt-in de liga (sem pré-marcação) → 1ª disciplina → calibração → 1º pomodoro
- [x] Painel adaptado ao perfil de Bartle (§6.8) + opção de trocar/refazer
- [x] Revisão de todos os eventos de telemetria do §9.1 — 19 de 23 já estavam registrados; faltavam `onboarding_quiz_completed` e `league_opt_in_choice` (entraram agora) e `follow_created`/`reaction_sent` (Fase 5)
- [x] Atribuição de coorte A/B no cadastro (flag `rewards_enabled`)
- [x] Adaptação para computador e tablet (barra lateral, grades, folhas viram diálogos) conforme `docs/design/telas.md` › Computador e tablet
- ~~**18/11: link de produção enviado aos colegas**~~ → movido para a Fase 7 (decisão de 11/11)

**Aceite:** uma pessoa que nunca viu o app consegue, sozinha, chegar ao fim do 1º pomodoro; o funil aparece populado na tabela de eventos. — **movido para a Fase 7 (decisão de 11/11). Migrações aplicadas em 11/11; RLS verificada com `supabase/tests/rls_fase4.sql` (18 testes, com rollback). Fluxo completo testado pelo Claude Code no localhost com a conta `teste.fase4.…@example.com` (`is_demo`): funil registrado de `signup_completed` a `pomodoro_completed`.**

### Fase 5 — Social, ligas, estatísticas e YouTube (19–21/11)
- [x] Nome de usuário, perfil público (opt-in), seguir, buscar — apelido na PR `fase-5-ligas`; perfil público (`/perfil/[apelido]`), seguir e buscar na PR `fase-5-social`
- [x] Feed de conquistas de quem você segue + "Parabéns" — PR `fase-5-social` (`follow_created` e `reaction_sent` registrados)
- [x] Ligas: agrupamento por divisão e faixa de horas, ranking semanal, cron de fechamento (Vercel Cron) com promoção/rebaixamento — PR `fase-5-ligas` (apelido, tela de resultado, destaque do Competidor; faixas pequenas se juntam, DECISOES 11/11)
- [x] Estatísticas pessoais (§4.6) — PR `fase-5-estatisticas` (Recharts; fórmulas em `lib/stats/stats.ts`, DECISOES 11/11)
- [x] Importação de playlist do YouTube (rota de servidor com a chave; vídeos viram tópicos com duração; unidade em minutos) — PR `fase-5-youtube`

**Aceite:** dois usuários de teste se seguem e veem as conquistas um do outro; o fechamento da liga, rodado manualmente, promove e rebaixa corretamente; uma playlist importada vira disciplina com durações. — **verificado por testes automáticos em 12/11 (`npm run test:e2e`, 16 testes, contas de teste criadas e apagadas a cada rodada): social e YouTube passaram também contra a produção (`E2E_BASE_URL`); o fechamento da Feira passou no build local, numa semana fictícia, pela mesma rota do cron (a opção de fechar uma semana específica entra em produção com o PR dos testes). RLS: `supabase/tests/rls_fase5.sql` (36 testes). Falta só conferir a virada automática do cron na segunda, 16/11.**

### Fase 6 — Telemetria, ética e acabamento (21–23/11)
- [ ] Painel `/admin`: DAU, MAU, stickiness, funil com drop-off, retenção D1/D7, aceite do nudge, comparação de coortes, filtro sem demos
- [ ] Página `/transparencia` (técnicas usadas + experimento de coortes + sair do experimento)
- [ ] Configurações: exportar dados (JSON) e excluir conta (1 clique + confirmação)
- [ ] Seed de usuários demo (com selo) para popular ligas na apresentação
- [ ] Acessibilidade básica (contraste, foco de teclado, `prefers-reduced-motion`), responsivo no celular
- [ ] Teste ponta a ponta do fluxo principal (Playwright) — incluir a checagem das animações das cenas e das revelações da Fase 3 (`document.getAnimations()` + capturas em sequência), adiada em 11/11 — **em andamento:** suíte em `e2e/` (login, pomodoro, animações com e sem "reduzir movimento", fruto de ontem, Feira, social, YouTube); falta o fluxo do onboarding (cadastro → 1º pomodoro)
- [ ] Correções a partir do uso real dos colegas
- [ ] **Pomodoro no computador** (design revisto em 12/11): cena larga por tema em vez das cópias espelhadas, painel de 440px com cronômetro e controles à esquerda, árvore do tema à direita, atalhos Espaço e F — telas.md › "Pomodoro no computador" e referências 35
- [ ] **23/11: congelamento de funcionalidades**

**Aceite:** o checklist de ética do `DESIGN.md` §10 está todo atendido; o admin mostra os números reais do beta.

### Fase 7 — Relatório, slides e ensaio (23–26/11)
- [ ] Exportar do `/admin` os números finais e gráficos do funil
- [ ] Relatório: estrutura baseada no `DESIGN.md` (6Ds → mapeamento → gamificação → telemetria → ética → resultados e limitações)
- [ ] Slides (no chat, com o tipo Slides) e roteiro da demonstração
- [ ] Conta de demonstração com tudo desbloqueado e dados preparados
- [ ] Ensaio cronometrado da apresentação
- [ ] Aceite da Fase 4: uma pessoa que nunca viu o app chega, sozinha, ao fim do 1º pomodoro; o funil aparece populado na tabela de eventos (adiado da Fase 4 em 11/11)
- [ ] Link de produção enviado aos colegas (adiado da Fase 4 em 11/11)

---

## 5. Prompts por fase (colar no Claude Code)

**Fase 0**
> Leia CLAUDE.md, docs/DESIGN.md e docs/PLANO.md. Execute a Fase 0 do plano. Comece em modo de plano e me mostre os passos antes de implementar. As variáveis de ambiente já estão no .env.local.

**Fase 1**
> Fase 1 do docs/PLANO.md. Para o seed do catálogo, monte a estrutura dos livros do DESIGN.md §7 com verified = false e gere docs/catalogo-revisao.md para conferirmos as páginas. Plano primeiro.

**Fase 2**
> Fase 2 do docs/PLANO.md. Leia docs/design/telas.md e veja as imagens em docs/design/referencias/. Comece aplicando docs/design/tokens.css e as fontes às telas da Fase 1. As cenas seguem docs/design/cenas/. O timer precisa de testes unitários cobrindo aba oculta, recarregamento e pausa. Plano primeiro.

**Fase 3**
> Fase 3 do docs/PLANO.md. Leia a seção "Fase 3" de docs/design/telas.md e as imagens docs/design/referencias/09 a 14. Toda regra de XP, emblema e colheita fica no servidor, em funções puras com testes. As cenas devem seguir as regras de leveza do DESIGN.md §6.7. Plano primeiro.

**Fase 4**
> Fase 4 do docs/PLANO.md. Leia as seções "Fase 4" e "Computador e tablet" de docs/design/telas.md, as imagens docs/design/referencias/15 a 22 e docs/design/quiz-bartle.json. Revise se todos os eventos do DESIGN.md §9.1 estão instrumentados e me liste os que faltavam. Plano primeiro.

**Fase 5**
> Fase 5 do docs/PLANO.md. Leia a seção "Fase 5" de docs/design/telas.md e as imagens docs/design/referencias/23 a 30. Comece pelas ligas (mais críticas para a apresentação), depois social, estatísticas e YouTube. Plano primeiro.

**Fase 6**
> Fase 6 do docs/PLANO.md. Leia a seção "Fase 6" de docs/design/telas.md e as imagens docs/design/referencias/31 a 34. Em seguida, rode o checklist de ética do DESIGN.md §10 item por item e me mostre o resultado. Plano primeiro.


**Pomodoro no computador** (pode rodar em paralelo à Fase 6, antes do congelamento de 23/11)
> Leia a seção "Pomodoro no computador" de docs/design/telas.md, as imagens docs/design/referencias/35-pomodoro-desktop-*.png e abra as páginas docs/design/cenas/pomodoro-desktop-*.html (animadas) para conferir cores, posições e animações. Implemente a partir de 1024px: (1) uma cena larga por tema (Clássico, Noturno, Halloween, Natal) em viewBox 1350×844 com slice, reaproveitando as peças de components/scenes/parts.tsx, no lugar das cópias espelhadas do pomodoro; o fruto que amadurece continua ligado ao progresso real; no máximo 5 camadas animadas, só transform/opacity, tudo parado com prefers-reduced-motion; (2) o painel de 440px à esquerda juntando GlassTimer e controles, com vidro por tema e contraste AA; (3) os atalhos Espaço (pausar/retomar, passando pelo nudge) e F (tela cheia), ignorados em campos e diálogos. Abaixo de 1024px nada muda. Acrescente ao e2e uma checagem em 1440×900 de cada tema (captura + document.getAnimations() com e sem reduzir movimento) e testes dos atalhos. Plano primeiro.
---

## 6. Variáveis de ambiente (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_...
SUPABASE_SECRET_KEY=              # sb_secret_..., só no servidor
YOUTUBE_API_KEY=                  # só no servidor
CRON_SECRET=                      # protege a rota do cron das ligas
NEXT_PUBLIC_APP_URL=
SUPABASE_DB_PASSWORD=             # só no .env.local (migrações); nunca na Vercel
```

---

## 7. Riscos e contingências

| Risco | Plano B |
|---|---|
| Atraso nas fases 1–3 | Cortar da Fase 5, nesta ordem: YouTube → feed/parabéns → estatísticas avançadas. Ligas e telemetria **não** são cortadas |
| Poucos colegas testando | Usar o próprio uso da dupla + usuários demo rotulados; declarar a limitação no relatório |
| Páginas do catálogo não conferidas a tempo | Manter o aviso "páginas aproximadas" e conferir só os livros usados na demo |
| Cota da API do YouTube | Cache da playlist importada no banco; a importação é feita uma vez |
| Notificações bloqueadas no navegador | O app funciona sem elas (som + título da aba piscando) |
| Bug grave perto da entrega | Congelamento em 23/11; só correções depois disso |

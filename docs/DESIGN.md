# Pomar — Documento de Design

> Projeto final de **Computação Persuasiva** (UFAL — Campus Arapiraca). Web app de controle de estudos gamificado, com a técnica Pomodoro como motor principal.
> Entrega: **26/11/2026**. Entregáveis: app em produção + relatório + slides.
> Este documento é a fonte de verdade das decisões de produto. Decisões novas ou alteradas vão para `docs/DECISOES.md`.

---

## 1. Visão geral

**Problema:** estudantes que precisam vencer livros ou cursos longos perdem o ritmo, não sabem quanto falta e não têm feedback sobre o próprio progresso.

**Proposta:** o usuário cadastra o que precisa estudar (a partir de um catálogo de sumários, manualmente ou importando uma playlist do YouTube). O app transforma isso numa lista de tarefas com estimativa de tempo baseada no ritmo real dele. Cada sessão Pomodoro concluída "colhe um fruto" no seu pomar.

**Ciclo principal (core loop):**

```
escolher tópico → pomodoro (foco) → registrar páginas/aula → recompensa (fruto, XP) → descanso → próximo tópico sugerido
```

**Conceito visual:** o cenário é um pomar. Durante o foco, um fruto amadurece na árvore em tempo real. Ao fim do ciclo, ele é colhido. A árvore cresce conforme o nível do usuário. A identidade base é neutra, e **temas** trocam cenário, cores, frutos, mascote e a posição da árvore e do cronômetro.

**Mascote:** **Seu Tomás**, um tomate que comenta o progresso e aparece no onboarding, nas conquistas e nos nudges. Ele muda de acessório conforme o tema.

---

## 2. Framework 6Ds (Werbach & Hunter)

### D1 — Define business objectives
- Aumentar o **tempo de estudo focado e consistente** dos usuários.
- Aumentar a **conclusão** de livros e cursos cadastrados.
- Construir **hábito diário** de estudo, medido por stickiness (DAU/MAU) e ofensivas.
- Objetivo acadêmico: demonstrar, com dados reais de telemetria, os conceitos da disciplina.

### D2 — Delineate target behaviors
| Comportamento-alvo | Métrica de sucesso |
|---|---|
| Concluir ao menos 1 pomodoro por dia | % de usuários ativos com ≥1 pomodoro concluído/dia; ofensiva média |
| Não pausar durante o foco | Taxa de pomodoros sem pausa; taxa de aceite do nudge "Reiniciar" |
| Registrar o progresso (marcar tópicos/páginas) | % de pomodoros com páginas registradas |
| Calibrar o ritmo de leitura | % de usuários com calibração feita no onboarding |
| Voltar ao app após um dia sem estudo | Retenção D1/D7; uso do congelamento de ofensiva |
| Concluir disciplinas | % de tópicos concluídos por disciplina |

### D3 — Describe your players
- **Usuários primários:** estudantes universitários (inicialmente colegas de Ciência da Computação da UFAL) que estudam por livros-texto ou cursos em vídeo.
- **Usuários secundários:** pessoas que eles seguem, que veem suas conquistas e mandam "parabéns".
- **Usuários terciários:** professores e turmas, afetados indiretamente pelo desempenho.
- **Cliente:** a própria disciplina, que avalia o projeto.
- **Perfis de Bartle** identificados por um quiz no onboarding (seção 6.8). O painel se adapta ao perfil predominante, e o usuário pode trocar quando quiser.

### D4 — Devise activity cycles
- **Ciclo de engajamento (Hook Model):**
  1. **Gatilho:** externo (lembrete diário no horário escolhido, notificação de fim de ciclo) e interno (ansiedade antes de prova, vontade de manter a ofensiva).
  2. **Ação:** um clique em "Começar" no card da disciplina, que já sugere o próximo tópico.
  3. **Recompensa variável:** fruto colhido, XP e, no fechamento do dia, um **emblema sorteado** entre os elegíveis.
  4. **Investimento:** registrar páginas (recalibra o ritmo e melhora as estimativas), marcar tópicos, seguir pessoas, escolher tema.
- **Ciclo de progressão:** pomodoros → XP → níveis → crescimento da árvore → emblemas diários → colheita semanal → desbloqueio de temas → promoção de liga.

### D5 — Don't forget the fun
- Cenário animado que reage ao foco (fruto amadurecendo, colheita com animação curta).
- Mascote com falas leves e contextuais.
- Emblemas raros e ocultos para descobrir.
- Temas sazonais (Halloween, Natal).

### D6 — Deploy the appropriate tools
- Componentes, mecânicas e dinâmicas detalhados nas seções 5 e 6.

### Jornada do usuário — 4 fases do Octalysis
| Fase | O que o app faz |
|---|---|
| **Descoberta** | Landing page com proposta clara, contadores reais ("N pomodoros colhidos esta semana") e explicação da técnica |
| **Onboarding** | Cadastro → quiz Bartle (8 perguntas) → criar 1ª disciplina pelo catálogo → calibração com mini cronômetro → **primeiro pomodoro** (vitória rápida) |
| **Scaffolding** | Níveis, árvore crescendo, emblemas diários, colheitas semanais, metas da disciplina |
| **Endgame** | Ligas semanais com promoção, coleção completa de emblemas, temas desbloqueados, maestria (disciplinas concluídas) |

---

## 3. Mapeamento conteúdo da disciplina → funcionalidade

| Conteúdo | Onde aparece |
|---|---|
| **Persuasão × coerção × manipulação** | Página `/transparencia`; nada é obrigatório; pausa não pune; ranking opt-in |
| **Fogg (B = MAP)** | M: SDT + recompensas. A: catálogo pronto, botão único, sessões curtas. P: lembrete diário e sugestão de próximo tópico |
| **6 elementos de simplicidade** | Tempo (1 clique), esforço mental (catálogo e estimativas automáticas), não-rotina (lembrete no horário escolhido), dinheiro (gratuito), desvio social (estudo é norma valorizada), esforço físico (só o navegador) |
| **Kairos** | Lembrete no horário escolhido; tema sazonal sugerido na época; nudge no momento da pausa |
| **Auto-monitoramento** | Estatísticas pessoais, heatmap, anel de progresso, previsão de término |
| **Motivação intrínseca × extrínseca / superjustificação** | A partir do nível 10, o painel passa a destacar maestria ("tópicos dominados", "capítulos concluídos") e o XP perde destaque visual |
| **Telemetria, DAU, MAU, stickiness, funil** | Eventos instrumentados (seção 9) e painel `/admin` |
| **Teste de dependência** | Feature flag `rewards_enabled` por coorte (seção 9.4) |
| **Cialdini — Reciprocidade** | Plano de estudos com estimativas entregue de graça a partir do catálogo |
| **Cialdini — Compromisso e consistência** | Meta e data da prova declaradas ao criar a disciplina; meta diária de pomodoros |
| **Cialdini — Prova social** | Ligas; contadores reais na landing; feed de quem você segue |
| **Cialdini — Autoridade** | Técnica de Francesco Cirillo explicada; catálogo com bibliografia de referência |
| **Cialdini — Afeição** | Mascote Seu Tomás |
| **Cialdini — Escassez** | Emblemas raros (ética: nunca à venda; temas conquistados ficam para sempre) |
| **Aversão à perda** | Ofensiva diária, com congelamento para suavizar |
| **Ancoragem** | Estimativa inicial (tempo previsto do tópico) como referência; ao fim, o app mostra "previsto × real" |
| **Nudge / default** | Pop-up de pausa com "Reiniciar" em destaque; defaults saudáveis (25/5/15, lembretes limitados) |
| **Dark patterns (o que evitamos)** | Sem roach motel: exportar e excluir conta em 1 clique + confirmação |
| **Hook Model** | Seção 2, D4 |
| **Deterding (matriz)** | O app é *gameful design* (partes de jogo, com regras) + *playful design* (micro-interações do cenário) |
| **Pirâmide de Werbach & Hunter** | Seção 5 |
| **SDT** | Competência: níveis, progresso, previsto × real. Autonomia: escolher tópicos, tempos, tema, opt-in. Pertencimento: seguir, parabéns, ligas |
| **Bartle** | Seção 6.8 |
| **6Ds e Octalysis** | Seção 2 |
| **Ética** | Seção 10 |

---

## 4. Funcionalidades

### 4.1 Disciplinas (lista de tarefas)
- Estrutura: **Disciplina → Capítulos → Tópicos**, com checkbox por tópico.
- Origem de uma disciplina:
  1. **Catálogo:** o usuário escolhe um livro e seleciona os capítulos/tópicos que quer estudar. A estrutura é **copiada** para a disciplina dele, que pode editá-la depois.
  2. **Manual:** o usuário cria capítulos e tópicos e informa página inicial e final de cada tópico.
  3. **YouTube:** o usuário cola o link de uma playlist. Cada vídeo vira um tópico com duração, e a unidade de progresso é **minutos**.
- **Marcar um tópico** soma automaticamente as páginas (ou minutos) ao progresso da disciplina.
- Campos da disciplina: título, origem, cor, **data-alvo/prova** (opcional), meta diária de pomodoros (opcional), ritmo próprio (min/página).

### 4.2 Calibração do ritmo
- Pergunta "Quanto tempo você leva por página?", com resposta direta em minutos ou pelo **mini cronômetro**: iniciar → ler 1 ou mais páginas → parar → informar quantas páginas leu.
- O ritmo é guardado **por disciplina** (livros diferentes, ritmos diferentes), com um padrão global do usuário.
- **Recalibração automática:** a cada pomodoro com páginas registradas, o app calcula o ritmo observado e mantém uma média móvel exponencial (α = 0,3). Quando ela diverge mais de 20% do ritmo salvo, o app **sugere** a atualização, e o usuário aceita ou recusa (transparência).
- Para vídeos, o ritmo é um multiplicador opcional de velocidade (1×, 1,25×, 1,5×, 2×).

### 4.3 Estimativas
- `minutos_tópico = páginas × min_por_página` (ou `duração ÷ velocidade` em vídeos).
- `pomodoros_estimados = ceil(minutos_tópico ÷ foco_min)`.
- **Previsão de término** da disciplina: minutos restantes ÷ média diária de foco dos últimos 14 dias.
- Ao concluir um tópico, o app mostra **previsto × real**.

### 4.4 Tela inicial
- **Cards das disciplinas** em grade, cada um com: anel de progresso (%), páginas ou minutos restantes, próximo tópico, previsão de término, data-alvo e o botão **Começar** (1 clique para entrar no pomodoro com o próximo tópico).
- Topo: nível + mini-árvore, ofensiva, emblema de ontem, progresso da colheita semanal.
- A ordem dos widgets secundários depende do perfil de Bartle (seção 6.8).

### 4.5 Motor Pomodoro
- Padrão: **25 min de foco / 5 de descanso / 15 de descanso longo a cada 4 ciclos**.
- Personalização por **botões −5 / +5**: foco entre 15 e 60 min; descanso curto entre 5 e 30; descanso longo entre 10 e 30.
- O cronômetro é baseado em timestamps (`started_at`, segundos pausados), então **continua correndo se o usuário sair da aba** e sobrevive a um recarregamento (estado no `localStorage` + linha da sessão no banco).
- **Pausa:** é permitida, sem perda de XP. Ao pausar, abre um pop-up de nudge:
  > "Pausas quebram o foco. Que tal reiniciar o ciclo para aproveitar melhor?"
  > **[Reiniciar ciclo]** (destaque) · [Continuar mesmo assim]
- **Cancelar** o ciclo não dá XP (não houve ciclo concluído). Pausar não afeta nada.
- No fim do foco: som + notificação do navegador (se permitida) + animação de colheita + modal "Quantas páginas você leu?" com o tópico pré-selecionado e a opção de marcá-lo como concluído.
- Uma sessão pode estar vinculada a um tópico (padrão) ou ser "livre".

### 4.6 Estatísticas pessoais
- Tempo focado por dia/semana/mês (barras), heatmap anual de dias estudados, distribuição por disciplina, evolução do ritmo (min/página), taxa de pomodoros sem pausa, melhor horário de estudo, previsto × real.

### 4.7 Social (estilo Duolingo, sem salas)
- **Ligas semanais ("Feiras")**, detalhadas na seção 6.6.
- **Seguir** perfis por nome de usuário; perfil público mostra nível, árvore, ofensiva e emblemas.
- **Feed** de conquistas de quem você segue, com o botão **"Parabéns"** 🍅.
- Perfil público e participação em ligas são **opt-in**.

### 4.8 Lembretes e notificações
- Lembrete diário no horário escolhido pelo usuário (opcional) e notificação de fim de ciclo.
- **Teto: no máximo 2 notificações não solicitadas por dia** (prevenção de fadiga).

---

## 5. Pirâmide de elementos (Werbach & Hunter)

| Nível | Elementos no Pomar |
|---|---|
| **Dinâmicas** | Progressão (árvore crescendo, níveis), Narrativa (cultivar um pomar), Restrições (o tempo do pomodoro), Emoções (colheita, surpresa do emblema), Relacionamentos (seguir, parabéns) |
| **Mecânicas** | Desafios (meta diária, colheita semanal), Competição (ligas), Feedback (estimativas, previsto × real, nudges), Recompensas (XP, emblemas, temas), Rodadas (ciclos pomodoro, semanas de liga) |
| **Componentes** | XP, níveis, emblemas, conquistas semanais, ranking da liga, árvore/avatar, temas, gráfico social (seguidores) |

---

## 6. Especificação da gamificação

### 6.1 XP
| Evento | XP |
|---|---|
| Pomodoro concluído | `round(10 × foco_min ÷ 25)` (25 min = 10 XP) |
| Primeiro pomodoro do dia | +5 |
| Tópico concluído | +1 por página (máx. +20) ou +1 a cada 5 min de vídeo (máx. +20) |
| Capítulo concluído | +15 |
| Disciplina concluída | +100 |

- O XP é calculado **no servidor**, a partir das sessões registradas, nunca enviado pelo cliente.
- Antifraude simples: um pomodoro só conta se `ended_at − started_at − paused_sec ≥ 90% do foco planejado`.

### 6.2 Níveis e árvore
- XP total para alcançar o nível *n*: `25 × n × (n − 1)` (nível 2 = 50, 3 = 150, 5 = 500, 10 = 2.250).
- Estágios da árvore: **muda** (1–2) → **arbusto** (3–5) → **árvore jovem** (6–9) → **árvore adulta** (10–14) → **árvore frondosa** (15+).

### 6.3 Ofensiva
- Um dia conta para a ofensiva se tiver ≥1 pomodoro concluído (no fuso do usuário).
- **Congelamento:** o usuário ganha 1 a cada 7 dias de ofensiva, acumula no máximo 2, e ele é usado automaticamente num dia sem estudo.

### 6.4 Emblemas diários ("frutos do dia") — recompensa variável
- **Fechamento do dia:** feito de forma "preguiçosa". Quando o usuário abre o app, o servidor fecha todos os dias anteriores ainda não fechados. Um dia com ≥1 pomodoro concluído recebe **1 emblema sorteado** entre os elegíveis, ponderado pela raridade. O sorteio acontece no servidor.
- Emblemas iniciais:

| Código | Nome | Elegibilidade | Raridade |
|---|---|---|---|
| `fruto_do_dia` | Fruto do Dia | Qualquer dia com pomodoro | comum (fallback) |
| `madrugador` | Madrugador | Pomodoro iniciado antes das 7h | comum |
| `coruja` | Coruja | Pomodoro iniciado depois das 22h | comum |
| `maratona` | Maratona | 4 pomodoros seguidos sem cancelar | incomum |
| `sem_pausa` | Foco de Ferro | 3+ pomodoros no dia sem nenhuma pausa | incomum |
| `explorador` | Explorador | Iniciou um capítulo ou disciplina nova | incomum |
| `finalizador` | Finalizador | Concluiu um capítulo | incomum |
| `constante` | Constante | Cumpriu a meta diária | comum |
| `pontual` | Pontual | Começou até 15 min após o lembrete (Kairos) | incomum |
| `retorno` | Bom Retorno | Voltou após 3+ dias sem estudar | incomum |
| `fruto_dourado` | Fruto Dourado | Qualquer dia com pomodoro | **raro, oculto** |
| `lua_cheia` | Lua Cheia | Estudou numa noite de lua cheia | **raro, oculto** |

- Pesos sugeridos: comum = 10, incomum = 5, raro = 1.
- A imprevisibilidade está só em **qual** emblema sai, nunca em **se** sai.

### 6.5 Conquista semanal ("Colheita da semana")
- Semana de segunda a domingo, no fuso do usuário. Conta os dias com emblema:
  - 3–4 dias: **Colheita de Bronze**
  - 5–6 dias: **Colheita de Prata**
  - 7 dias: **Colheita de Ouro**
- Álbum cumulativo mostra todas as colheitas e a coleção de emblemas, com silhuetas dos que ainda não foram obtidos.

### 6.6 Ligas ("Feiras")
- Semana de segunda a domingo, fechada às 00:00 de segunda (America/Sao_Paulo) por um cron.
- Divisões: **Feira de Bronze → Prata → Ouro → Esmeralda**.
- Agrupamento: grupos de até 20 participantes da **mesma divisão e faixa de horas semanais** (média das 2 semanas anteriores): `< 3h`, `3–7h`, `7–14h`, `14h+`. Isso cumpre a comparação "com quem estuda num tempo semelhante".
- Ranking por XP da semana. Em grupos com 10 ou mais, os 5 primeiros sobem e os 5 últimos descem.
- **Opt-in explícito** no onboarding, sem opção pré-marcada. Pode ser alterado nas configurações.
- Usuários de demonstração (para a apresentação) aparecem com o selo "demo".

### 6.7 Temas
| Tema | Desbloqueio | Frutos | Layout | Seu Tomás |
|---|---|---|---|---|
| **Clássico** (padrão, neutro) | Livre | Tomates | Cronômetro central, árvore à direita | Básico |
| **Noturno** | Livre | Tomates | Cronômetro dentro da lua, árvore à esquerda | De pijama |
| **Halloween** | 1ª Colheita de Prata | Abóboras | Cronômetro na lua cheia, árvore seca em silhueta | Fantasia de abóbora |
| **Natal** | 1ª Colheita de Ouro | Enfeites | Cronômetro na estrela, pinheiro central | Gorro de Papai Noel |

- Temas conquistados **ficam para sempre**. Em outubro e dezembro, o app **sugere** o tema sazonal (Kairos), sem bloquear quem ainda não o desbloqueou de vê-lo como prévia.
- Para a demo, uma flag de admin pode desbloquear tudo para uma conta.
- **Requisitos técnicos dos fundos animados (leves):**
  - Cenas em **SVG inline** como componentes React, com animação em **CSS** usando apenas `transform` e `opacity`.
  - No máximo 3 camadas animadas por cena (ex.: nuvens, estrelas piscando, morcego ocasional, neve com ≤ 20 partículas).
  - Sem vídeo, canvas, WebGL ou Lottie.
  - Animações pausadas quando a aba está oculta (`visibilitychange`) e desativadas com `prefers-reduced-motion`.
  - Cada tema = tokens CSS (cores) + componente de cena + preset de layout (posições de árvore e cronômetro via CSS grid areas) + variante de fruto + acessório do mascote.

### 6.8 Perfis de Bartle
- **Quiz de 8 perguntas** no onboarding, com 4 alternativas cada, uma por arquétipo. O resultado é o perfil predominante + a distribuição percentual.
- O app mostra "Seu perfil: Explorador — por isso destacamos X", e o usuário pode refazer o quiz ou escolher outro perfil.

| Perfil | O que ganha destaque no painel |
|---|---|
| **Conquistador** | Barra de XP, próximo nível, progresso da colheita, metas |
| **Assassino** | Posição na liga, distância para o próximo colocado, promoção |
| **Explorador** | Álbum de emblemas (incluindo ocultos), estatísticas detalhadas, temas |
| **Socializador** | Feed de quem segue, parabéns recebidos, sugestões de quem seguir |

---

## 7. Catálogo

- Livros com **apenas a estrutura** do sumário: capítulos, tópicos e intervalo de páginas. Nenhum conteúdo dos livros.
- Conjunto inicial (8–12 livros do curso de Ciência da Computação), por exemplo:
  - Cormen et al. — *Algoritmos: Teoria e Prática*
  - Tanenbaum & Wetherall — *Redes de Computadores*
  - Kurose & Ross — *Redes de Computadores e a Internet*
  - Aho, Lam, Sethi & Ullman — *Compiladores: Princípios, Técnicas e Ferramentas*
  - Gonzalez & Woods — *Processamento Digital de Imagens*
  - Tanenbaum & van Steen — *Sistemas Distribuídos*
  - Silberschatz, Korth & Sudarshan — *Sistema de Banco de Dados*
  - Sommerville — *Engenharia de Software*
  - Bondy & Murty (ou equivalente) — *Teoria dos Grafos*
- Cada livro registra a **edição**. Os intervalos de páginas precisam ser conferidos pela dupla na edição usada. Até a revisão, o livro fica marcado como `verified = false` e aparece com o aviso "páginas aproximadas".
- O seed fica em `supabase/seed/catalog/*.json`.

---

## 8. Modelo de dados (Supabase / Postgres)

Todas as tabelas de usuário usam **Row Level Security**: cada usuário lê e escreve apenas os próprios dados, exceto campos públicos de perfis com `public_profile = true` e dados de liga de participantes opt-in.

```sql
profiles (id uuid PK → auth.users, username unique, display_name, avatar_url,
          timezone text default 'America/Maceio', reminder_time time null,
          theme text default 'classico', focus_min int default 25, break_min int default 5,
          long_break_min int default 15, min_per_page numeric null,
          bartle_primary text null, bartle_scores jsonb null,
          league_opt_in bool null, public_profile bool default false,
          xp_total int default 0, level int default 1,
          streak_current int default 0, streak_best int default 0, freezes int default 0,
          last_closed_day date null, is_demo bool default false, is_admin bool default false,
          created_at timestamptz)

catalog_books (id, title, authors, edition, total_pages, verified bool)
catalog_chapters (id, book_id → catalog_books, position, title)
catalog_topics (id, chapter_id → catalog_chapters, position, title, page_start, page_end)

subjects (id, user_id, title, source 'catalog'|'manual'|'youtube', catalog_book_id null,
          youtube_playlist_id null, color, goal_date null, daily_goal int null,
          min_per_page numeric null, video_speed numeric default 1, archived bool, created_at)
chapters (id, subject_id, position, title)
topics (id, chapter_id, position, title, page_start null, page_end null,
        youtube_video_id null, duration_sec null, done_at timestamptz null)

pomodoro_sessions (id, user_id, subject_id null, topic_id null, planned_focus_sec,
                   started_at, ended_at null, paused_sec int default 0, pauses int default 0,
                   status 'running'|'completed'|'cancelled', pages_logged int null,
                   xp_awarded int default 0)
calibrations (id, user_id, subject_id null, pages, seconds, source 'stopwatch'|'manual'|'auto', created_at)
xp_events (id, user_id, source, amount, ref_id null, created_at)

badges (code PK, name, description, rarity 'comum'|'incomum'|'raro', hidden bool, weight int)
user_daily_badges (user_id, day date, badge_code, PK(user_id, day))
weekly_harvests (user_id, week_start date, tier 'bronze'|'prata'|'ouro', days int, PK(user_id, week_start))
themes (code PK, name, unlock_rule text)
user_themes (user_id, theme_code, unlocked_at, PK(user_id, theme_code))

follows (follower_id, followee_id, created_at, PK(follower_id, followee_id))
feed_events (id, user_id, type, payload jsonb, created_at)
reactions (event_id, user_id, created_at, PK(event_id, user_id))

league_groups (id, week_start date, division, hours_band)
league_members (group_id, user_id, xp_week int default 0, final_rank int null,
                outcome 'up'|'stay'|'down' null, PK(group_id, user_id))

telemetry_events (id bigserial, user_id null, anon_id text, name text, props jsonb, created_at)
feature_flags (key PK, enabled bool, rollout jsonb)
user_cohorts (user_id PK, cohort 'A'|'B', assigned_at)
```

---

## 9. Telemetria

### 9.1 Eventos
`landing_viewed`, `signup_completed`, `onboarding_quiz_completed`, `league_opt_in_choice`, `subject_created` {source}, `calibration_completed` {source}, `pomodoro_started`, `pomodoro_paused`, `pause_nudge_shown`, `pause_nudge_choice` {restart|continue}, `pomodoro_completed`, `pomodoro_cancelled`, `pages_logged`, `topic_completed`, `badge_awarded` {code}, `harvest_awarded` {tier}, `level_up`, `theme_changed` {code}, `follow_created`, `reaction_sent`, `notification_shown` {type}, `notification_clicked` {type}, `app_opened`.

### 9.2 Métricas
- **Usuário ativo** (para DAU/MAU) = teve `pomodoro_completed` ou `topic_completed` no dia ("ação valiosa").
- **DAU, MAU, stickiness = DAU/MAU**, retenção D1 e D7.
- **Funil de onboarding:** `signup_completed` → `onboarding_quiz_completed` → `subject_created` → `calibration_completed` → 1º `pomodoro_completed` → ativo em 3 dias distintos nos primeiros 7.
- **Nudge de pausa:** % de "Reiniciar" sobre os pop-ups exibidos.
- **Previsto × real:** erro médio das estimativas.

### 9.3 Painel `/admin`
Restrito a `is_admin = true`. Mostra cartões de DAU, MAU, stickiness, gráfico do funil com drop-off por etapa, retenção, aceite do nudge, comparação de coortes e a opção de excluir usuários demo das métricas.

### 9.4 Teste de dependência (motivação extrínseca)
- Cada usuário é sorteado no cadastro para a coorte **A** (com recompensas) ou **B** (sem animações de XP, emblemas e colheitas visíveis; a contagem segue registrada em segundo plano).
- O painel compara as coortes em DAU, pomodoros por usuário e retenção.
- **Limitação a declarar no relatório:** com poucos usuários, o resultado é demonstrativo, não estatisticamente significativo.
- A coorte B é informada na página `/transparencia`, e o usuário pode sair do experimento.

---

## 10. Ética e governança

- **Transparência:** página `/transparencia` lista cada técnica persuasiva usada, onde aparece e por quê, além do experimento de coortes.
- **Autonomia:** pausar não pune; ranking e perfil público são opt-in sem pré-marcação; tempos personalizáveis; tema livre entre os desbloqueados; perfil de Bartle editável.
- **Anti-roach motel:** em Configurações, **Exportar meus dados** (JSON) e **Excluir conta** (1 clique + confirmação digitando o nome de usuário), sem etapas escondidas.
- **Fadiga de notificações:** teto de 2 notificações não solicitadas por dia; tudo desativável.
- **Aversão à perda suavizada:** congelamento de ofensiva; mensagens de retorno acolhedoras, nunca culpabilizantes.
- **Recompensa variável ética:** nada comprável, sem moeda paga, sem "caixas"; a variação é só em qual emblema sai.
- **Dados reais:** a landing page só mostra números reais. Usuários demo têm selo e podem ser excluídos das métricas.
- **Privacidade:** coleta mínima; telemetria sem conteúdo pessoal além do necessário; RLS em tudo.
- **Conteúdo do catálogo:** apenas títulos de capítulos e tópicos, sem reprodução de conteúdo dos livros.

---

## 11. Telas

1. Landing page (Descoberta)
2. Cadastro / login (e-mail + Google)
3. Onboarding: quiz Bartle → opt-in de liga → 1ª disciplina → calibração → 1º pomodoro
4. Início (cards das disciplinas)
5. Disciplina (lista de capítulos/tópicos, progresso, estimativas)
6. Nova disciplina (catálogo / manual / YouTube)
7. Pomodoro (cenário temático + cronômetro + controles)
8. Modal de fim de ciclo (páginas lidas, tópico concluído, colheita)
9. Pop-up de nudge de pausa
10. Estatísticas
11. Conquistas (álbum de emblemas, colheitas, temas)
12. Liga (Feira da semana)
13. Social (feed, seguindo, buscar pessoas) + perfil público
14. Configurações (pomodoro, lembretes, tema, privacidade, exportar/excluir)
15. Transparência
16. Admin (telemetria)

# Pomar — Design para implementação (Fases 2, 3 e 4)

Fonte aprovada pela dupla em 09/11/2026. Referências no Claude: design system **"Pomar"** e prancheta **"Pomar — telas da Fase 2"**. Este arquivo e a pasta `docs/design/` são o que o Claude Code usa; em caso de dúvida, as imagens em `referencias/` mandam no visual e o `DESIGN.md` manda nas regras.

## Conteúdo desta pasta

| Arquivo | O que é |
| --- | --- |
| `tokens.json` | Tokens do design system (cores dos 4 temas, tipografia, espaçamento, raios, sombras, tamanhos). Fonte única. |
| `tokens.css` | Gerado do `tokens.json`: variáveis CSS por tema (`[data-theme]`), Noturno automático no modo escuro, classes `.text-*`. Substitui os tokens provisórios do `app/globals.css`. |
| `referencias/*.png` | Imagens das telas aprovadas (390×844, 2x) e das 4 cenas do pomodoro. |
| `cenas/scene-*.html` | As 4 cenas do pomodoro funcionando (SVG + CSS animado). Referência exata de desenho e animação. |
| `emblemas/*.svg` | Ícones dos 11 emblemas (24px, traço 2px, `currentColor`). Nome do arquivo = código do emblema do DESIGN §6.4. |
| `ilustracoes/seu-tomas*.svg` | Seu Tomás básico e com os acessórios de cada tema. Cores por variável CSS com valor padrão. |
| `quiz-bartle.json` | Texto das 8 perguntas do quiz de Bartle, alternativas por perfil e regras de pontuação (Fase 4). |
| `colheitas/*.svg` | Medalhas da colheita semanal (bronze, prata, ouro) e a marca de semana sem colheita. Cores pelos tokens `medal-*`. |

## Fundamentos

- **Tema:** `data-theme="classico|noturno|halloween|natal"` no `<html>`. Sem tema escolhido e sistema em modo escuro → Noturno (já no `tokens.css`).
- **Fontes:** `next/font/google` com **Fredoka** (500, 600) → `--font-display` e **Nunito** (400, 600, 800) → `--font-sans`. Remover a Geist.
- **Tailwind 4:** expor os tokens no `@theme` lendo as variáveis (`--color-primary: var(--primary)` etc.), para usar `bg-primary`, `text-ink-muted`, `rounded-lg`… Nunca escrever hex nos componentes.
- **Layout:** coluna de no máximo `--screen-max` (480px) centralizada; margem lateral `--space-4`; entre cards `--space-5`.
- **Alvos de toque:** mínimo `--tap-min` (44px); botão principal `--button-lg` (56px).
- **Foco:** `outline: 3px solid var(--focus-ring); outline-offset: 2px` em todo elemento focável.
- **Ícones:** lucide-react, traço 2px. Emblemas: SVGs desta pasta.
- **Movimento:** só `transform` e `opacity`; tudo desliga com `prefers-reduced-motion`.

## Componentes (nomes do design system → `components/`)

| Componente | Regras principais |
| --- | --- |
| `Button` | `primary` (fundo `--primary`, texto `--on-primary`, `box-shadow: var(--shadow-button)`, ao pressionar `translateY(4px)` e sem sombra), `secondary` (borda 2px `--control-border`), `ghost`, `danger`. Um primário por tela. |
| `SubjectCard` | Anel 56px na cor `--subject-*`, título `heading`, metadados `small` em `--ink-muted`, bloco "PRÓXIMO" em `--surface-300`, restante + botão Começar. O card abre a disciplina; Começar vai direto ao pomodoro. |
| `ProgressRing` / `ProgressBar` | Trilho `--surface-300`; cor por significado (disciplina, XP `--reward-mark`, colheita `--fruit`). |
| `TopicItem` | Linha inteira clicável (label), checkbox 22–26px `--primary`; concluído = fundo `--primary-soft` + riscado em `--ink-muted`; próximo = fundo `--fruit-soft` + rótulo "PRÓXIMO". |
| `StatChip` | Pílula 32px; ofensiva em `--fruit-soft` com chama `--fruit`; XP com estrela `--reward-mark`; ofensiva zerada só em `--ink-muted`. |
| `StepperButton` | Valor em Fredoka 32px tabular; botões −5/+5 redondos 44px; desabilita no limite; dica dos limites abaixo. |
| `Dialog` | Folha que sobe do rodapé no celular, `--radius-lg` no topo, `--shadow-dialog`, véu `--scrim`. Ações empilhadas, primária em cima, alternativa sempre visível. |
| `Toast` | Pílula `--ink` com texto `--surface-100`, ícone em círculo `--reward`; 3s; `role="status"`. |
| `SegmentedControl` | Trilho `--surface-300`; opção ativa `--surface-200` + `--shadow-card`; `role="tablist"`. |
| `EmptyState` | Seu Tomás 112px, título `title`, frase em primeira pessoa, ação primária. |
| `BottomNav` | 5 destinos (Início, Disciplinas, Conquistas, Liga, Estatísticas); ativo em `--primary` sobre `--primary-soft`; oculta durante o pomodoro. |
| `MascotBubble` | Seu Tomás 56–64px + balão `--fruit-soft`, cantos `24 24 24 10`. |

## Telas

### 01 · Início (`referencias/01-inicio.png`)
- Cabeçalho: data (`small`, `--ink-muted`), "Boa noite, {nome}" em Fredoka 28px (bom dia/boa tarde/boa noite pelo fuso do usuário), Seu Tomás 52px à direita.
- Chips: ofensiva, XP, nível.
- Card "FRUTO DE ONTEM": emblema 52px, nome, 7 bolinhas da colheita da semana (`--fruit` = dia com emblema) + "Colheita da semana: N de 7". Some se ainda não houver emblema.
- "Suas disciplinas" + link "Nova" (ícone +).
- Lista de `SubjectCard`. Ordem: última estudada primeiro.
- `BottomNav` fixa.

### 01b · Início vazio (`referencias/01b-inicio-vazio.png`)
- Mesmo cabeçalho com "Olá, {nome}", chips "0 dias" (neutro) e "Nível 1".
- `EmptyState`: "Seu pomar ainda está vazio" / "Escolha um livro do catálogo ou monte sua lista de capítulos. Eu calculo quanto tempo falta." / botão "Criar minha primeira disciplina".
- "COMO FUNCIONA" com 3 passos numerados.

### 02 · Disciplina (`referencias/02-disciplina.png`)
- Topo: voltar, ícones Calibrar ritmo (cronômetro) e Editar.
- Anel 88px + título Fredoka 26px + livro/edição.
- 3 mini-cards: PÁGINAS (lidas / total), SEU RITMO (min/pág), TÉRMINO (data prevista; "—" sem dados ainda).
- Frase: "Prova em {data} · no seu ritmo atual, você termina N dias antes." (ou "N dias depois", sem tom de alarme). Só aparece com data de prova.
- Capítulos em cards com `TopicItem`; capítulo completo ganha selo "Concluído"; o próximo tópico tem destaque "PRÓXIMO".
- Rodapé fixo: "{tópico} · {páginas} páginas · cerca de {n} pomodoro(s)" + botão "Começar pomodoro".

### 03 · Nova disciplina — catálogo (`referencias/03-nova-disciplina-catalogo.png`)
- Fechar (X) + título "Nova disciplina".
- `SegmentedControl`: Catálogo · Manual · YouTube.
- Busca por livro ou autor.
- Livro escolhido abre em card com borda `--primary`: capa (bloco na cor da disciplina com sigla), título, autor/edição/nº de capítulos, dica "Escolha os capítulos…", capítulos com checkbox e nº de páginas, "Ver os N capítulos".
- Livros com `verified = false` mostram o selo "pág. aprox.".
- Rodapé: "N capítulos · N páginas" + "Continuar" (vai para a calibração).

### 04 · Calibrar ritmo (`referencias/04-calibrar-ritmo.png`)
- "Passo 2 de 2" (no fluxo de criação). Título "Quanto tempo você leva por página?".
- `MascotBubble`: "Abra o livro, aperte o play e leia normalmente. Com isso eu estimo quanto falta para terminar."
- Mini cronômetro: anel 168px, tempo Fredoka 44px, rótulo LENDO; botões Pausar (`secondary`) e Parar (`primary`).
- Contador "Páginas lidas" (−/+).
- Resultado em `--primary-soft`: "≈ X,X min por página".
- Link "Prefiro informar direto" (abre campo numérico).
- Rodapé: "Salvar e criar disciplina" (no fluxo) ou "Salvar ritmo" (vindo da disciplina).

### 05 · Ajustar ciclo (`referencias/05-ajustar-ciclo.png`)
- Folha inferior sobre a cena com véu. Três `StepperButton`: FOCO (15–60), DESCANSO (5–30), DESCANSO LONGO · A CADA 4 (10–30). Dica dos limites. Interruptor "Tocar som ao terminar". Botão "Salvar".
- Aberta pelo ícone de ajustes na tela do pomodoro (antes de começar ou entre ciclos).

### 06 · Pausa (`referencias/06-pausa-nudge.png`)
- Ao pausar: cronômetro mostra "PAUSADO"; véu; `Dialog` com o Seu Tomás (sorriso menor), "Pausas quebram o foco" / "Que tal reiniciar o ciclo para aproveitar melhor? Você não perde nada se continuar." / "Reiniciar ciclo" (primário) / "Continuar mesmo assim" (ghost).
- Eventos: `pause_nudge_shown`, `pause_nudge_choice {restart|continue}`.

### 07 · Fim do ciclo (`referencias/07-fim-do-ciclo.png`)
- Toast "+10 XP · N frutos hoje" no topo (o XP mostrado vem do servidor).
- Folha inferior: tomate maduro + "Fruto colhido!" + "{min} min de foco em {disciplina}".
- "Páginas lidas" com −/+ e "previsto: N (p. X–Y)"; começa no valor previsto.
- Caixa "Terminei o tópico {nome}" **desmarcada** por padrão.
- Linha de ritmo do ciclo; a sugestão de recalibrar só aparece quando a média diverge mais de 20% (DESIGN §4.2).
- "Começar descanso de N min" (primário) e "Pular descanso" (ghost).

### 08 · Pomodoro em andamento (`referencias/08-pomodoro-*.png`, `cenas/scene-*.html`)
- Cena ilustrada "Campo e montanhas" de fundo, uma por tema.
- Cronômetro em **painel de vidro** (Liquid Glass): 270px de largura, cantos 28px, `background` translúcido + `backdrop-filter: blur(18px) saturate(1.6)`, contorno 1,5px claro; fundo opaco se não houver suporte ou com `prefers-reduced-transparency`. Selo da fase (FOCO/DESCANSO) + dígitos Fredoka 64px tabulares.
- Folha inferior: tópico, ciclos (bolinhas), Pausar (`secondary`) e Encerrar (`ghost`).
- A árvore do pomar é a grande à direita; o fruto amadurece com o progresso (opacidade da camada madura = progresso; escala 0,6 → 1), atualizado a cada 5s com transição de 0,6s.
- **Implementação das cenas:** transformar cada `scene-*.html` em um componente React único (`components/scenes/Scene.tsx`) com as cores da paisagem em tokens de cena por tema (adicionar ao `tokens.json`: céu, nuvem, montanha clara/escura, colina, prado, caminho, copa clara/escura, tronco, flores). Até 5 camadas animadas; pausar tudo com a aba oculta (`visibilitychange` → classe `is-hidden`).

## Fase 3 — Gamificação (onda 2, aprovada em 10/11)

Prancheta no Claude: **"Pomar — telas da Fase 3"**. Referências `09` a `14`. Os dados das imagens são de exemplo.

### Raridade dos emblemas (visual)
| Estado | Disco do emblema (48px no álbum, 116px na revelação) | Texto |
| --- | --- | --- |
| Comum | fundo `--reward`, ícone `--on-reward` | "Comum · ×N" em `--ink-muted` |
| Incomum | fundo `--primary-soft`, aro 2px `--primary`, ícone `--primary-strong` | "Incomum · ×N" em `--primary-strong` |
| Raro | fundo `--fruit`, ícone `--on-fruit`, halo `0 0 0 3px var(--surface-200), 0 0 0 6px var(--reward)` | "Raro · ×N" |
| Não obtido | fundo `--surface-300`, ícone `--control-border`; card em `--surface-100` com borda tracejada 2px `--line` | "Ainda não" |
| Oculto não obtido | cadeado no lugar do ícone, nome **"???"** | "Raro · secreto" (nunca mostrar o ícone nem a regra) |

A raridade sempre vai escrita, nunca só pela cor. Raridades conforme DESIGN §6.4.

### 09 · Conquistas › Emblemas (`referencias/09-conquistas-emblemas.png`)
- Título "Conquistas". Card de nível: mini-árvore do estágio atual (64×72, céu `--scene-sky`), "Nível N · {estágio}" (§6.2), XP total em `--reward-mark`, barra até o próximo nível e "Faltam X XP para o nível N+1".
- `SegmentedControl` Emblemas · Colheitas · Temas (`role="tablist"`). Abre em Emblemas.
- "SEU ÁLBUM" + "N de 11 encontrados". Grade de 3 colunas com os 11 emblemas na ordem do §6.4; ×N = quantas vezes saiu. Tocar num emblema abre uma folha com nome, regra de elegibilidade, raridade e datas em que saiu (oculto não obtido: "Continue estudando para descobrir").
- `BottomNav` com Conquistas ativa.

### 10 · Conquistas › Colheitas (`referencias/10-conquistas-colheitas.png`)
- Card "ESTA SEMANA" (segunda a domingo, fuso do usuário): 7 dias (S T Q Q S S D); dia com emblema = disco `--reward` com o ícone do emblema; hoje = tracejado `--fruit` em `--fruit-soft` com "hoje"; dias futuros/sem emblema = `--surface-300`.
- Barra 0–7 em `--fruit` com as marcas "Bronze · 3", "Prata · 5", "Ouro · 7" (textos em `--medal-bronze-ink`, `--medal-prata-ink`, `--reward-mark`).
- `MascotBubble` com a próxima meta, sempre no tom de convite ("Um pomodoro hoje e você fica a um dia do Bronze."). Com a semana já em Ouro: comemoração, sem nova meta.
- Três chips com o total de colheitas (Ouro, Prata, Bronze).
- "SEMANAS ANTERIORES": medalha (`colheitas/*.svg`, 40×44), "Colheita de {tier}", período · N dias; a semana que desbloqueou um tema leva o selo do tema. Semana com menos de 3 dias: `sem-colheita.svg` + "Semana mais leve" + "N dias com emblema" (nunca "perdeu"/"falhou").

### 11 · Conquistas › Temas (`referencias/11-conquistas-temas.png`)
- Frase: "O tema troca a paisagem do pomodoro, os frutos e o acessório do Seu Tomás. Tema conquistado fica com você para sempre."
- Grade 2×2 de cards (`role="radiogroup"`): miniatura 160×112 da cena do tema **montada com os tokens de cena daquele tema** (não copiar os hex da imagem), nome e estado:
  - em uso: borda 3px `--primary` + check + "Em uso";
  - Noturno sem escolha manual: "Automático no modo escuro";
  - recém-conquistado: selo "Novo · conquistado" (some depois de aplicado ou de abrir a aba uma vez);
  - bloqueado: miniatura com opacidade 0,55 + cadeado + regra ("Ganhe na 1ª Colheita de Ouro (7 dias numa semana)"), `aria-disabled`.
- Botão secundário "Ver prévia do {tema}" para o tema bloqueado: abre a cena em tela cheia, só para ver (§6.7). Em outubro e dezembro o card sazonal ganha o selo "Sugestão da estação" (Kairos).

### 12 · Fruto de ontem (`referencias/12-fruto-de-ontem.png`)
- Aparece ao abrir o app quando o fechamento preguiçoso gerou emblema novo (1 por dia fechado; vários dias = um por vez, do mais antigo para o mais novo).
- Cena Campo ao fundo + véu `--scrim`; card central `--radius-lg` 32px: "SEU FRUTO DE ONTEM · {DIA}", raios (8 fatias em `--primary-soft` para incomum, `--reward` claro para comum, `--fruit-soft` para raro) + até 7 partículas, disco de 116px no estilo da raridade, selo da raridade, nome Fredoka 30px, frase com o motivo ("Esse saiu do sorteio entre os frutos que você mereceu."), linha "Colheita da semana" com 7 bolinhas e "N de 7".
- "Colher" (primário) fecha; "Ver meu álbum" abre a 09.
- Movimento: disco entra com `scale(0.6→1)` + `opacity` em 400ms; raios giram devagar (60s/volta); tudo parado com `prefers-reduced-motion`.

### 13 · Subiu de nível (`referencias/13-subiu-de-nivel.png`)
- **Celebração em tela cheia só quando a árvore muda de estágio** (níveis 3, 6, 10 e 15). Nos outros níveis: `Toast` "Nível N!" por 3s.
- Cena Campo sem véu; árvore do novo estágio grande ao centro, a do estágio anterior pequena e apagada à esquerda com uma seta; painel de vidro no topo com "NOVO NÍVEL", "Nível N" Fredoka 56px e "Seu {estágio anterior} virou {novo estágio}".
- Folha inferior: `MascotBubble` (Seu Tomás sorrindo), barra rumo ao próximo nível e "Próxima fase da árvore: {estágio}, no nível N"; botão "Continuar".
- Aparece depois do fim do ciclo que fez subir de nível (depois da folha 07).

### 14 · Tema desbloqueado (`referencias/14-tema-desbloqueado.png`)
- Cena do tema conquistado em tela cheia; Seu Tomás 150px com o acessório do tema (**usar `ilustracoes/seu-tomas-{tema}.svg`**, a imagem 14 é só posição).
- Card inferior: selo "TEMA DESBLOQUEADO", nome do tema, frase com o motivo e "Esse tema é seu para sempre."; "Usar agora" (aplica o tema) e "Depois".
- Ordem ao abrir o app: primeiro os frutos (12), depois o tema (14).

### Regras gerais da Fase 3
- Tudo que aparece nessas telas vem do servidor (XP, emblemas, colheitas, temas); o cliente só exibe.
- Coorte B (`rewards_enabled = false`, Fase 4): sem as telas 12–14 e sem XP/emblemas/colheitas visíveis (DESIGN §9).
- Registrar os eventos do DESIGN §9.1 ligados a emblema, colheita, nível e tema no momento em que cada tela é criada.

## Fase 4 — Landing e onboarding (onda 3, 10/11)

Prancheta no Claude: **"Pomar — telas da Fase 4"**. Referências `15` a `22`. Os números da landing aparecem como `[N]` de propósito: são sempre dados reais.

### 15 · Landing (`referencias/15-landing-desktop.png`, `15b-landing-celular.png`)
- Página pública em `/` (fluida: coluna máx. 1200px, margem 24px; tudo empilha no celular). Quem já está logado vai direto para `/inicio`.
- Cabeçalho: logo (Seu Tomás 40px + "Pomar"), links "Como funciona" (âncora) e "Transparência" (`/transparencia`), botão secundário "Entrar".
- Hero: selo "ESTUDE COM A TÉCNICA POMODORO", título Fredoka `clamp(2.4rem, 5vw, 3.6rem)` "Cada ciclo de foco vira um fruto no seu pomar.", frase de apoio, "Criar conta grátis" (primário) + "Ver como funciona" (ghost), nota "Grátis, sem nada para comprar. Entre com e-mail ou Google." À direita (abaixo no celular): cena Clássico estática em card `--radius-lg` 32px com o cronômetro de vidro. Sem animação na landing além da cena (respeitar `prefers-reduced-motion`).
- Faixa de números (`--surface-200` com bordas `--line`): **pomodoros colhidos esta semana**, **horas de foco esta semana**, **pessoas cultivando um pomar** + "Números reais do app. Contas de demonstração não entram na conta." Calcular no servidor (semana do fuso `America/Sao_Paulo`, sem `is_demo`), com cache curto (ISR). Número zero: esconder aquele contador; todos zero: esconder a faixa.
- "Como funciona": 3 cards numerados (cadastrar · focar 25 min · colher e ver quanto falta).
- "Um pomar que cresce com você": texto + 3 emblemas (um de cada raridade) e a medalha de ouro.
- "Jogo limpo" (fundo `--primary-soft`): pausar não tira nada; ranking e perfil público só se quiser; nada para comprar; nenhum aviso não solicitado. Link "Veja cada técnica que usamos e por quê" → `/transparencia`.
- CTA final com Seu Tomás 96px + rodapé (disciplina/UFAL, Transparência, Privacidade).
- Evento: `landing_viewed` (já existe).

### Fluxo do onboarding
Depois do cadastro (e do 1º login com Google): **boas-vindas (16) → quiz (17) → perfil (18) → Feira (19) → nova disciplina (03, catálogo por padrão) → calibração (04) → 1º pomodoro (08) → fim do ciclo (07) → primeiro fruto (20) → Início**.
- O progresso fica salvo no perfil (`onboarding_step`); se a pessoa sair, volta de onde parou. Até terminar, `/inicio` redireciona para o passo atual.
- Nas telas 03 e 04 dentro do onboarding, o rótulo vira "Passo 3 de 5" e "Passo 4 de 5"; o 1º pomodoro é o passo 5.
- A `BottomNav` fica oculta durante o onboarding.

### 16 · Boas-vindas (`referencias/16-onboarding-boas-vindas.png`)
- Faixa de cena Campo (300px) com Seu Tomás 140px sorrindo; "Oi, {nome}! Eu sou o Seu Tomás."; frase; lista dos 5 passos (o atual com número em `--primary`); "Vamos lá".

### 17 · Quiz de Bartle (`referencias/17-onboarding-quiz.png`, conteúdo em `quiz-bartle.json`)
- Topo: voltar (pergunta anterior), barra de progresso `--primary` e "N de 8". `MascotBubble` curta: "Não existe resposta certa. Escolha a que mais tem a ver com você."
- Pergunta como `legend` Fredoka 26px; 4 alternativas como `label` + `radio` (altura mín. 64px); escolhida = fundo `--primary-soft` + borda 3px `--primary` + texto 800. Ordem das alternativas embaralhada.
- "Próxima" só habilita com uma escolha; na 8ª vira "Ver meu perfil". Resposta guardada a cada pergunta.
- Evento: `onboarding_quiz_completed` {perfil, distribuição}.

### 18 · Seu perfil (`referencias/18-onboarding-perfil.png`)
- Card com o ícone do perfil (disco 88px no estilo incomum), "SEU PERFIL", nome Fredoka 34px e "Por isso destacamos …" com o que o perfil destaca (DESIGN §6.8).
- "SUAS RESPOSTAS": barras dos 4 perfis (predominante em `--primary`, os outros em `--control-border`) com % e a frase "Ninguém é um perfil só…".
- "Continuar como {perfil}" (primário), "Escolher outro perfil" (secundário, abre lista dos 4 com o que cada um destaca), "Refazer o quiz" (ghost). As mesmas três opções ficam em Configurações.
- Ícones: Conquistador = `finalizador.svg` (bandeira), Competidor = troféu (lucide `Trophy`), Explorador = `explorador.svg` (bússola), Socializador = lucide `Users`.

### 19 · Feira — opt-in (`referencias/19-onboarding-feira.png`)
- Divisões Bronze → Prata → Ouro → Esmeralda (tokens `medal-*`); "Quer participar da Feira?"; 3 linhas explicando grupo de até 20 com tempo parecido, ranking por XP da semana e que só aparecem apelido e XP.
- Duas opções `radio` **sem nenhuma marcada**: "Quero entrar na Feira" / "Agora não, prefiro estudar no meu canto". O botão fica desabilitado ("Escolha uma opção") até escolher; depois vira "Continuar".
- Nota: "Nenhuma opção vem marcada. Dá para mudar quando quiser em Configurações."
- Evento: `league_opt_in_choice` {in|out}. O apelido é pedido só na Fase 5, ao entrar na primeira Feira.

### 20 · Primeiro fruto (`referencias/20-primeiro-fruto.png`)
- Depois da folha de fim do ciclo (07) do 1º pomodoro: cena com a muda e um tomate maduro, painel de vidro "Primeiro fruto colhido!" / "Seu pomar começou. Amanhã sai o seu primeiro fruto do dia."
- Folha: Seu Tomás + "Prontinho, {nome}!", frase "Volte amanhã para descobrir qual fruto do dia saiu. Cada dia com estudo conta para a colheita da semana." e o botão "Ir para o meu pomar", que encerra o onboarding e leva ao Início.

### 21 · Destaque do Início por perfil (`referencias/21-destaques-por-perfil.png`)
- No Início, entre os chips e "Suas disciplinas", entra **um card de destaque** conforme o perfil (DESIGN §4.4 e §6.8). O resto do Início não muda.
  - **Conquistador:** "Rumo ao nível N" + barra de XP + META DE HOJE (se a disciplina tiver meta) + COLHEITA N de 7.
  - **Competidor:** divisão da Feira, selo da zona (subida/descida), 3 linhas do ranking em volta da pessoa (ela em `--fruit-soft`) e "Faltam X XP para passar {apelido}". Sem Feira (opt-out ou antes da Fase 5): card convidando para a Feira, sem insistir (some depois de recusar 1 vez).
  - **Explorador:** "Seu álbum: N de 11" + 4 emblemas (obtidos e cadeados) + uma estatística curiosa (melhor horário de foco; antes das estatísticas da Fase 5, "minutos de foco nesta semana").
  - **Socializador:** "Quem você segue" com 2 conquistas recentes e botão "Parabéns"; "N parabéns para você". Antes da Fase 5: card "Em breve você poderá seguir colegas" com o fruto de ontem.
- Coorte B (`rewards_enabled = false`): o card de Conquistador/Explorador vira o resumo neutro (minutos de foco hoje e na semana).

## Computador e tablet (todas as telas)

Referências: `22-inicio-desktop.png` (1440px) e `22b-inicio-tablet.png` (900px). O celular continua sendo a base; acima dele:
- **< 768px:** como está (coluna única, `BottomNav`).
- **768–1023px:** coluna de conteúdo até 720px centralizada; cards de disciplina em 2 colunas; `BottomNav` continua.
- **≥ 1024px:** `BottomNav` vira **barra lateral fixa** de 240px (`--surface-200`, borda direita `--line`): logo no topo, os 5 destinos (item ativo `--primary-soft` + `--primary-strong`, altura 48px) e "Configurações" no pé. Conteúdo com até 1080px e padding 40px.
- **Início:** cabeçalho com saudação à esquerda e chips à direita; destaque do perfil + fruto de ontem lado a lado (`auto-fit, minmax(320px, 1fr)`); disciplinas em grade `auto-fill, minmax(300px, 1fr)`.
- **Folhas inferiores** (ajustar ciclo, fim do ciclo, pausa, celebrações) viram **diálogos centralizados** de até 480px com `--radius-lg` nos 4 cantos.
- **Conquistas:** álbum em 4–6 colunas; card de nível ao lado das abas.
- **Disciplina:** lista de capítulos à esquerda e mini-cards (páginas, ritmo, término) numa coluna à direita de 320px.
- **Pomodoro:** cena em tela cheia (já decidido); cronômetro de vidro e folha de controles centralizados com até 480px.
- **Onboarding:** card central de até 480px sobre a cena Campo em tela cheia.

## Ainda não desenhado (próxima onda)
Liga, social e perfil público, estatísticas, configurações, transparência e admin (antes da Fase 5). Até lá, essas telas seguem os componentes acima.

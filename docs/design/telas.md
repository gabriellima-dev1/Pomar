# Pomar — Design para implementação (Fases 2 a 6)

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
> **Substituída pela 36 (Início como painel) na Fase 6B.** Ver "Foco no menu e Início como painel".
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
- **Quando a fila abre (revisão de 16/11):** só no primeiro carregamento do app numa tela que não seja o pomodoro. Ao navegar dentro do app, inclusive ao sair do pomodoro pelo "Início", pela seta de voltar ou depois de encerrar, a fila **não** abre por cima: espera a próxima abertura do app ou um toque no cartão "Fruto de ontem"/"Último fruto" do Início. Vale para a fila inteira (12, 14, 13 e 25).
- Cena Campo ao fundo + véu `--scrim`; card central `--radius-lg` 32px: "SEU FRUTO DE ONTEM · {DIA}", raios (8 fatias em `--primary-soft` para incomum, `--reward` claro para comum, `--fruit-soft` para raro) + até 7 partículas, disco de 116px no estilo da raridade, selo da raridade, nome Fredoka 30px, frase com o motivo ("Esse saiu do sorteio entre os frutos que você mereceu."), linha "Colheita da semana" com 7 bolinhas e "N de 7".
- "Colher" (primário) marca como visto e passa para o próximo item da fila; "Ver meu álbum" abre a 09.
- **Fechar (X)** no canto superior direito da tela, acima do card: círculo de vidro de 44px (o mesmo dos botões do pomodoro), `aria-label="Fechar e ver depois"`; no celular `top: 40px; right: 16px`, no computador `top: 24px; right: 32px`. Também fecha com **Esc**. Fechar **adia** a fila inteira sem marcar nada como visto: o fruto não se perde e volta na próxima abertura do app ou no toque no cartão do Início. Tocar no véu não fecha (evita fechar sem querer).
- Com fruto pendente, o cartão "Fruto de ontem" do Início mostra "Toque para colher" e abre a fila; sem pendência, abre a 09.
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
- O progresso fica salvo no perfil (`onboarding_step`); se a pessoa sair, volta de onde parou. **Até criar a 1ª disciplina** (passos boas-vindas → calibração), `/inicio` redireciona para o passo atual.
- **A partir do 1º pomodoro (passo 5), nada mais prende (revisão de 17/11):** o "Início" do pomodoro no computador e a seta de voltar no celular funcionam; `/inicio` abre normalmente, com a `BottomNav` e a barra lateral, e mostra no topo, no lugar do destaque do perfil (na Fase 6B: no lugar de "Continuar estudando"), o card **"Falta 1 passo"**: título "Colha seu primeiro fruto", texto "Um pomodoro em {disciplina} e o seu pomar começa a crescer.", botão primário "Começar" (abre `/pomodoro?disciplina=…`). Ao terminar o 1º pomodoro, segue para o primeiro fruto (20) como antes. No passo "primeiro fruto", `/inicio` ainda leva à tela 20, que já tem a saída "Ir para o meu pomar".
- Nas telas 03 e 04 dentro do onboarding, o rótulo vira "Passo 3 de 5" e "Passo 4 de 5"; o 1º pomodoro é o passo 5.
- A `BottomNav` fica oculta durante o onboarding, **até a 1ª disciplina existir**; do passo 5 em diante ela aparece.

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
- **≥ 1024px:** `BottomNav` vira **barra lateral fixa** de 240px (`--surface-200`, borda direita `--line`): logo no topo, os 5 destinos (item ativo `--primary-soft` + `--primary-strong`, altura 48px) e "Configurações" no pé. Conteúdo com até 1080px e padding 40px. Na Fase 6B a barra lateral passa a ter 6 destinos (com Foco) e o celular troca Estatísticas por Foco.
- **Início:** painel em duas colunas (36b), ver "Foco no menu e Início como painel". (Antes da Fase 6B: cabeçalho com saudação à esquerda e chips à direita; destaque do perfil + fruto de ontem lado a lado; disciplinas em grade.)
- **Folhas inferiores** (ajustar ciclo, fim do ciclo, pausa, celebrações) viram **diálogos centralizados** de até 480px com `--radius-lg` nos 4 cantos.
- **Conquistas:** álbum em 4–6 colunas; card de nível ao lado das abas.
- **Disciplina:** lista de capítulos à esquerda e mini-cards (páginas, ritmo, término) numa coluna à direita de 320px.
- **Pomodoro:** a partir de 1024px, cena larga própria e painel à esquerda; ver "Pomodoro no computador" abaixo (revisão de 12/11, substitui o cronômetro centralizado com folha de 480px).
- **Onboarding:** card central de até 480px sobre a cena Campo em tela cheia.

## Fase 5 — Feira, social, estatísticas e YouTube (onda 4, 11/11)

Prancheta no Claude: **"Pomar — telas da Fase 5"**. Referências `23` a `30`. Apelidos e números das imagens são exemplos.

### Onde fica o social
A aba **Liga** da navegação ganha um `SegmentedControl` **Feira · Amigos** (abre em Feira; abre em Amigos para quem não está na Feira). Não há destino novo na navegação.

### 23 · Liga › Feira (`referencias/23-liga-feira.png`)
- Card da divisão: medalha da divisão (`colheitas/*.svg` nas cores `medal-*`; Esmeralda com `medal-esmeralda*`), "Feira de {divisão}", "{N} pessoas que estudam de {faixa} por semana" (faixas do DESIGN §6.6) e "FECHA EM {d}d {h}h" (fecha segunda 00:00, `America/Sao_Paulo`).
- Ranking por XP da semana em card `--surface-200`: posição, avatar com iniciais (cores das disciplinas), apelido, XP. A pessoa = linha em `--fruit-soft` com "Você". Usuário demo leva o selo "demo" (`--surface-300`).
- Linhas divisórias de zona (só em grupos com 10 ou mais): "SOBEM PARA A FEIRA DE {próxima}" depois do 5º (`--primary-strong`, seta para cima) e "DESCEM PARA A FEIRA DE {anterior}" antes dos 5 últimos (`--ink-muted`, seta para baixo; sem tom de alarme). Bronze não tem zona de descida; Esmeralda não tem zona de subida. Grupo com menos de 10: frase "Grupo pequeno: ninguém sobe nem desce nesta semana."
- Mostra até 8 linhas em volta da pessoa + "Ver o grupo todo ({N})". Tocar num apelido com perfil público abre o perfil (28).
- Sem Feira: quem disse "Agora não" vê um card com a explicação da Feira e "Quero entrar"; quem entrou e ainda não tem grupo vê "Sua primeira Feira começa na segunda".

### 24 · Escolher apelido (`referencias/24-liga-apelido.png`)
- Abre na primeira vez que a pessoa entra na Feira ou usa Amigos. `MascotBubble`: o apelido é o que aparece; nome e e-mail ficam privados.
- Campo com prefixo "@", validação ao digitar (disponível / já em uso / formato), regra: 3 a 20 caracteres, minúsculas, números, `.` e `_`. Sugestão inicial a partir do nome.
- Caixa **"Deixar meu perfil público" desmarcada** por padrão, com o que fica visível. "Salvar apelido". Apelido e perfil público mudam depois em Configurações.

### 25 · Resultado da semana (`referencias/25-liga-resultado.png`)
- Aparece uma vez, ao abrir o app depois do fechamento. Raios + medalha da nova divisão, selo do resultado, título e frase com a posição e o XP. "Ver minha nova Feira" / "Fechar".
- Textos por caso: **subiu** "Feira de {nova}!" · **ficou** "Você continua na Feira de {divisão}" + "Terminou em {N}º. Semana nova, todo mundo começa do zero." · **desceu** "Nesta semana você vai para a Feira de {nova}" + "Lá os grupos estudam num ritmo parecido com o seu agora." (nunca "rebaixado"/"perdeu"). Sem raios quando desce.

### 26 · Liga › Amigos (`referencias/26-liga-amigos.png`)
- Campo "Buscar pessoas pelo apelido" (abre 27). Faixa `--fruit-soft` com os parabéns recebidos desde a última visita ("{apelido} e mais N pessoas deram parabéns pelo seu {conquista}").
- "QUEM VOCÊ SEGUE": conquistas recentes de quem você segue (só perfis públicos), mais novas primeiro, até 14 dias: colheita da semana, subida de estágio da árvore (níveis 3, 6, 10 e 15), emblema raro, capítulo ou disciplina concluída e subida de divisão. Cada item: avatar, texto, quando, botão **"Parabéns"** (secundário) → "Enviado" (`--primary-soft`, desabilitado). Um parabéns por pessoa por conquista; não dá para desfazer.
- Vazio: Seu Tomás + "Siga colegas para ver as conquistas deles aqui" + "Buscar pessoas".
- Eventos: `reaction_sent`; o feed só mostra conquistas de quem tem perfil público.

### 27 · Buscar pessoas (`referencias/27-buscar-pessoas.png`)
- Busca por prefixo do apelido (a partir de 2 letras), **só perfis públicos**. Linha: avatar, @apelido, "Nível N · {estágio}", botão "Seguir" (primário pequeno) ou "Seguindo" (`--primary-soft`; tocar pede confirmação para deixar de seguir).
- "DA SUA FEIRA": sugestões de pessoas públicas do seu grupo. Evento: `follow_created`.

### 28 · Perfil público (`referencias/28-perfil-publico.png`)
- Faixa da cena Campo com a árvore do estágio da pessoa; avatar 84px; @apelido; "Nível N · {estágio}"; "Seguir/Seguindo"; ofensiva atual; emblemas obtidos (N de 11; ocultos só aparecem se obtidos); conquistas recentes; "No Pomar desde {mês de ano}". Nada de disciplinas, horas ou páginas (DESIGN §4.7).
- Perfil não público: a página responde "Este perfil é privado" (sem dados).

### 29 · Estatísticas (`referencias/29-estatisticas.png`)
- `SegmentedControl` Semana · Mês · Ano + navegação de período (setas, rótulo do período). Tudo no fuso do usuário, só pomodoros concluídos.
- **Tempo de foco:** total do período + comparação com o período anterior (texto neutro: "+40 min que a anterior" ou "−20 min que a anterior"); barras por dia (semana), por semana (mês) ou por mês (ano) em `--primary`, rótulo de valor em cima, eixo em horas; 3 mini-cards: pomodoros, % sem pausa, dias com estudo.
- **Dias estudados no ano:** heatmap de semanas (colunas) × dias (linhas), 4 tons: `--surface-300` (0), claro (< 30 min), `--primary` (30–60 min), `--primary-strong` (> 60 min), legenda "menos/mais". Dias futuros não aparecem.
- **Por disciplina:** barra empilhada nas cores `--subject-*` + lista com tempo e %.
- **Seu ritmo:** linha do min/página por ciclo da disciplina mais estudada no período (seletor de disciplina), com frase "Você está lendo cerca de X% mais rápido/devagar…".
- **Melhor horário:** faixa de 2 h com mais minutos de foco nos últimos 30 dias (barras por hora, a faixa em `--primary`).
- **Previsto × real:** erro médio |real − previsto| ÷ previsto dos tópicos concluídos.
- Gráficos com Recharts, cores dos tokens, `aria-label` com os números; período sem dados mostra o Seu Tomás com "Ainda não há pomodoros neste período".
- Coorte B: estatísticas iguais (não são recompensa).

### 30 · Nova disciplina › YouTube (`referencias/30-nova-disciplina-youtube.png`)
- Terceira aba de Nova disciplina. Campo "Link da playlist" (aceita link de playlist ou de vídeo com `list=`); ao colar, a rota de servidor busca a playlist com a chave (`YOUTUBE_API_KEY`).
- Card da playlist (borda `--primary`): miniatura, título, canal, nº de vídeos e duração total; velocidade **1× · 1,25× · 1,5× · 2×** (padrão 1×; a escolha vira o ritmo da disciplina, DESIGN §4.2); lista de vídeos com checkbox e duração (todos marcados), "Ver os N vídeos". Vídeos privados ou indisponíveis ficam de fora com o aviso "N vídeos indisponíveis foram ignorados".
- Rodapé: "{N} vídeos · {duração}" + "≈ {duração ÷ velocidade} em {velocidade} · cerca de {n} pomodoros" + "Continuar" (cria a disciplina com unidade em minutos; sem calibração).
- Erros: link inválido, playlist privada, cota esgotada ("Não consegui abrir a playlist agora. Tente de novo mais tarde.").
- Evento: `subject_created {source: youtube}`.

## Fase 6 — Configurações, transparência e admin (onda 5, 12/11)

Prancheta no Claude: **"Pomar — telas da Fase 6"**. Referências `31` a `34`. Os números do admin são de exemplo.

### 31 · Configurações (`referencias/31-configuracoes.png`)
Completa a versão mínima da Fase 4. Seções em cards `--surface-200` com linhas de 60px (rótulo 800 + valor em `--ink-muted` + chevron) separadas por `--surface-300`:
- **CONTA:** Nome (editar) · Apelido (abre a tela 24) · **Perfil público** (interruptor, desligado por padrão) · E-mail (só leitura, com o método de login).
- **ESTUDO:** Ciclo do pomodoro (resumo "Foco 25 · descanso 5 · longo 15 min"; abre a folha 05) · Ritmo de leitura padrão (abre a 04) · Tocar som ao terminar · **Aviso de fim do ciclo** (interruptor; ligar pede a permissão do navegador; se o navegador bloqueou, a linha explica como liberar).
- **JOGO:** Perfil de jogador (trocar/refazer, como na 18) · Tema (resumo; abre Conquistas › Temas, onde fica o interruptor do modo escuro) · Feira (entrar/sair).
- **PRIVACIDADE E DADOS:** card do experimento ("Você está no grupo que vê as recompensas" / "…que não vê as recompensas"; "Ver transparência" + "Sair do experimento"; some para quem está fora do experimento) · card **Exportar meus dados** ("Baixar arquivo" → JSON na hora, `GET /api/export`) · links Política de privacidade e Transparência.
- Rodapé: "Sair da conta" (secundário) e **"Excluir conta"** (texto `--danger`, abre a 32). Nada escondido em submenus.

### 32 · Excluir conta (`referencias/32-excluir-conta.png`)
- Folha inferior sobre as Configurações com véu: Seu Tomás com sorriso menor, "Excluir sua conta?", o que é apagado, sugestão "Baixar meus dados" e o campo **"Para confirmar, digite seu apelido: {apelido}"** (sem apelido: digitar "EXCLUIR").
- "Excluir para sempre" fica desabilitado (`--surface-300`) até o texto bater; habilitado = fundo `--danger`, texto branco. "Cancelar" (ghost).
- Exclusão no servidor com a chave secreta: apaga a linha de `auth.users` e, em cascata, os dados da pessoa; a telemetria fica anonimizada (sem `user_id`). Depois: volta à landing com o toast "Sua conta foi excluída".

### 33 · Transparência (`referencias/33-transparencia-desktop.png`, `33b-transparencia-celular.png`)
- Página pública `/transparencia` no layout da landing (coluna de 1200px, empilha no celular), com âncoras: Técnicas · O que não fazemos · Experimento · Seus dados.
- Hero: "Como o Pomar tenta te convencer a estudar" + a diferença entre persuasão, coerção e manipulação.
- **"As técnicas que usamos":** grade `auto-fill, minmax(320px, 1fr)` de cards, cada um com selo do conceito da disciplina (`--surface-300` roxo claro), título em linguagem simples, **Onde**, **Por quê** e uma faixa `--primary-soft` com **Você controla** ou **Limite**. Técnicas: Fogg, recompensa variável, Kairos/nudge, default saudável, prova social, aversão à perda, compromisso e consistência, escassez, personalização (Bartle), auto-monitoramento/ancoragem, afeição (Seu Tomás), gamificação (XP, níveis, árvore). O texto deve bater com o DESIGN §3.
- **"O que não fazemos"** (fundo `--primary-soft`): nada à venda, nenhum aviso não pedido, nada público por padrão, sem punição, sem números inventados, sem armadilha para sair.
- **"O experimento da disciplina":** explicação dos grupos A e B (§9.4) e um quadro "O SEU GRUPO" (borda `--subject-ceu`) com o grupo da pessoa logada e "Sair do experimento" (confirmação simples; depois de sair: "Você saiu do experimento e agora vê todas as recompensas"). Sem login: "Entre para ver em qual grupo você está". Para quem está fora (contas antigas ou quem saiu), o quadro diz isso.
- **"O que registramos":** registramos / não registramos / é seu (exportar e excluir).

### 34 · Painel admin (`referencias/34-admin.png`, `34b-admin-celular.png`)
- `/admin`, só `is_admin = true` (os outros recebem 404). Pensado para computador; no celular tudo empilha.
- Cabeçalho: "Painel do Pomar" + selo "admin", período **7 dias · 30 dias · Desde o início**, caixa **"Sem contas demo"** (marcada por padrão) e "Atualizado às {hora}".
- 6 cartões: DAU (média do período), MAU (30 dias), Stickiness (DAU/MAU), Retenção D1, Retenção D7, Nudge da pausa (% de "Reiniciar").
- **Funil do onboarding** (DESIGN §9.2): barras horizontais por etapa com o total e a perda em relação à etapa anterior (perda em `--danger`).
- **Ativos por dia:** linha no período.
- **Experimento:** tabela A × B com pessoas, DAU médio, pomodoros por pessoa por semana e retenção D7, coluna de diferença e o selo "Amostra pequena: resultado demonstrativo". Exclui quem saiu do experimento e as contas anteriores à Fase 4.
- **Nudge da pausa:** barra 100% com "Reiniciar" × "Continuar mesmo assim" e o total de pop-ups.
- Rodapé com o número de contas demo fora das métricas. Consultas no servidor com a chave secreta; nada disso vai para o navegador de quem não é admin.

## Pomodoro no computador (revisão de 12/11)

Referências: `35-pomodoro-desktop-classico.png`, `35-pomodoro-desktop-noturno.png`, `35-pomodoro-desktop-halloween.png` e `35-pomodoro-desktop-natal.png` (1440×900). As páginas `cenas/pomodoro-desktop-<tema>.html` abrem no navegador, já animadas, e servem de fonte para cores, posições e animações. Vale de **1024px para cima**; abaixo disso fica como está hoje (cena de celular e folha de controles).

**O que estava errado:** a paisagem de 390 de largura era repetida dos lados (as cópias espelhadas), a árvore do pomar ocupava ~6% da altura, o cronômetro tinha tamanho fixo no meio e os controles ficavam numa folha de 480px, com as laterais vazias.

**Composição da cena larga** (substitui as cópias espelhadas no pomodoro):
- Uma paisagem só, desenhada em `viewBox="0 0 1350 844"` com `preserveAspectRatio="xMidYMid slice"` (cobre a tela inteira em qualquer proporção; corta as bordas, nunca deixa faixa vazia). Horizonte a ~58% da altura (grupo da paisagem com `translate(0 96)`).
- Camadas de trás para a frente: céu → nuvens/estrelas/lua → 5 montanhas facetadas → campo e bosques pequenos → prado → **árvore do tema** → flores → fileira de arbustos → prado da frente.
- **Árvore do tema no terço direito**, em `translate(990 572)`, escala 2,1 (≈ 30% da altura da tela). O fruto que amadurece é o da árvore: a camada de cor sobe de opacidade conforme o progresso do pomodoro (`pc-ripen` nas referências é só demonstração em loop).
- As peças (árvore, `pc-tulipa`, `pc-margarida`, `pc-botao`, `pc-ramo`, bosques) são as mesmas de `components/scenes/parts.tsx`, em escala nativa; não redesenhar.

| Tema | Céu e destaque | Árvore (direita) | Animações (≤ 5 camadas) |
|---|---|---|---|
| Clássico | gradiente `#9eeedb → #d4f6ee`, nuvens brancas | macieira com frutos `#e8492e` | nuvens, bosques e árvore balançando, borboletas, flores |
| Noturno | `#101a38 → #1f3264 → #34508a`; lua `#f4ecd2` com brilho em (760, 190); estrelas | mesma árvore em `#2f5236/#1f3a27`, frutos `#ff6a4a` | estrelas piscando, nuvens, árvore, vaga-lumes, flores |
| Halloween | `#1f1233 → #4a2a63 → #8a4a6e → #d9805e`; lua cheia `#f6c95a` em (760, 200); morcegos | árvore seca `#140c1f` com lanterna; abóboras ao pé, a do meio amadurece de `#8fbf5f` para `#f28a2b` | morcegos, neblina (2 faixas), brilho da lanterna, flores, abóbora |
| Natal | `#a9c8df → #e6f0f6`; montanhas com neve; neve caindo | pinheiro de 3 andares com festão, enfeites e estrela no topo; o enfeite do meio ganha cor (`#e6ecf0 → #d23a3a`); boneco de neve ao lado | neve (2 camadas), nuvens, estrela, flores, enfeite |

- Só `transform` e `opacity`; tudo para com `prefers-reduced-motion: reduce` (a cena fica parada e completa). A neve é um bloco de flocos repetido acima de si mesmo, deslizando 844 de altura em loop (sem criar elementos).
- No Noturno, a regra "árvore à esquerda" vale só para o celular; no computador a árvore fica à direita para não ficar atrás do painel.

**Painel do pomodoro** (`GlassTimer` + controles juntos, substitui a folha de controles):
- `section` de 440px, à esquerda: `left: 120px; top: 132px` (em telas < 1280px, `left: 64px`). Padding 24/30/26, raio 32, vidro + borda 1,5px + sombra `0 16px 40px`.
- Conteúdo, de cima para baixo: chip FOCO/PAUSA + "Ciclo 2 de 4" com 4 bolinhas; cronômetro Fredoka 600 **112px**, `tabular-nums`, `role="timer"`; barra de 8px "Fruto amadurecendo · 25%" (Halloween: "Abóbora amadurecendo"; Natal: "Enfeite ganhando cor"); caixa do tópico (disciplina, tópico, páginas e estimativa); **Pausar** (secundário) e **Encerrar** (fantasma) lado a lado, 52px.
- Topo: "Início" (pílula de vidro) à esquerda; **Ajustar ciclo** e **Tela cheia** (círculos de 48px) à direita. Abaixo do painel, a pílula "Espaço pausa · F tela cheia".
- Vidro por tema: Clássico `rgba(245,255,252,.6)` texto `#24361a`; Noturno `rgba(16,26,56,.62)` texto `#f4ecd2`, borda `rgba(255,255,255,.22)`; Halloween `rgba(25,19,31,.66)` texto `#f6ead8`, borda `rgba(255,255,255,.18)`; Natal `rgba(250,253,255,.7)` texto `#1c2a3a`. Chip FOCO: verde `#2e7a47` (Clássico), `#4fa86a` com texto escuro (Noturno), `#f28a2b` com texto `#1f1233` (Halloween), `#1f5a3c` (Natal). Conferir contraste AA de todos os textos.
- Os diálogos (ajustar ciclo, pausa, fim do ciclo) continuam como diálogos centralizados de até 480px.

**Atalhos de teclado** (só na tela do pomodoro, ignorados quando o foco está num campo de texto ou num diálogo aberto):
- **Espaço:** pausa/retoma (abre o mesmo fluxo do botão Pausar, inclusive o nudge da pausa).
- **F:** entra/sai da tela cheia (`requestFullscreen` no contêiner da tela; o botão muda para "Sair da tela cheia"). Esc sai, como no navegador.
- Os atalhos aparecem na pílula e nos `aria-keyshortcuts` dos botões.

## Foco no menu e Início como painel (revisão de 17/11, Fase 6B)

Referências: `36-inicio-painel.png` e `36b-inicio-painel-desktop.png` (Início), `37-foco-vazio.png` e `37b-foco-vazio-desktop.png` (Foco sem disciplina), `38-foco-celular.png` (Foco rodando no celular) e `39-menu-foco.png` (estados do item Foco no menu). Pranchas no canvas "Pomar — Foco e pomodoro no computador". Substitui o Início com a lista de disciplinas (01 e 22) e o caminho "card da disciplina → pomodoro como tela solta". Estados decididos em 17/11: `39b-foco-colher.png` (foco terminou fora do Foco), `39c-estatisticas-celular.png` (topo das Estatísticas no celular) e `39d-sigla-selo.png` (sigla do selo). Conferência de 18/11: `39e-estados-foco.png` (pausado no celular, disciplina com tudo concluído, Explorador sem dados).

**Menu**
- **Celular (`BottomNav`):** Início · Disciplinas · **Foco** · Liga · Conquistas. Foco fica no centro: círculo de 58px em `--primary`, ícone de cronômetro branco, borda de 4px na cor do fundo e sombra `0 4px 0 --primary-strong`, subindo 22px acima da barra; rótulo "Foco" embaixo. **Estatísticas sai da barra do celular** e passa a ser aberta pelo card "Sua semana" do Início.
- **Computador (`SideNav`):** Início · Disciplinas · **Foco** · Conquistas · Liga · Estatísticas, e Configurações no pé.
- **Com pomodoro rodando**, o item Foco mostra o tempo que falta, em qualquer tela do app: no celular, "18:42" dentro do círculo e um anel de progresso do ciclo em `--reward`; no computador, um selo `--fruit-soft` com ponto `--fruit` e "18:42" à direita do rótulo. **Pausado:** círculo claro com o tempo parado e o rótulo "Pausado" (celular); selo neutro "Pausado" (computador). O tempo é calculado a partir da sessão salva no servidor e continua contando fora do Foco; o item atualiza 1×/s só enquanto a aba está visível. Leitor de tela: `aria-label="Foco, 18 minutos restantes"` (ou "Foco, pausado").
- **Cor do selo no computador (18/11):** texto `--ink` sobre `--fruit-soft` (12,8:1); o vermelho fica só no ponto e no fruto do selo (`--fruit` sobre `--fruit-soft` daria 4,0:1). Vale para o tempo e para "Colher".
- **Pausado no celular (39e):** círculo `--surface-200`, anel cheio em `--control-border`, sombra `--line`, tempo em `--primary-strong` (8,2:1) e o rótulo "Pausado" em `--ink-muted` (6,4:1). O rótulo "Colher" do celular fica em `--fruit` (5,0:1).
- **Foco terminou fora do Foco (39b):** o item troca o tempo pelo fruto maduro e o rótulo **"Colher"**; no celular o círculo fica em `--fruit-soft` com anel cheio em `--fruit`, no computador o selo `--fruit-soft` mostra o fruto e "Colher". O aviso de fim que a pessoa pediu toca uma vez; nada insiste depois. Tocar no item abre a folha de fim do ciclo (07). Leitor de tela: "Foco, fruto pronto para colher".
- **Durante o descanso:** o item fica no estado normal (sem tempo), em todos os aparelhos, porque o descanso só existe no aparelho onde começou. Tocar nele abre o descanso nesse aparelho.

**Foco (rota `/pomodoro`)**
- Toque no item Foco abre: (1) a sessão em andamento (foco, pausa ou descanso), se houver; senão (2) **"Nenhuma disciplina selecionada"** (37/37b): a cena do tema, sem cronômetro, e um card de vidro com o texto, o botão primário **"Escolher disciplina"** (abre a aba Disciplinas) e o link discreto **"Estudar sem disciplina"** (começa uma sessão livre, sem tópico nem páginas, como hoje). Fora isso, só o botão Início.
- **"Estudar sem disciplina" (18/11):** abre o cronômetro pronto, sem matéria; o ciclo só começa em "Começar foco". Esse toque libera o som do aviso no navegador e deixa ajustar o ciclo antes.
- "Começar" (no card "Continuar estudando", na disciplina ou na lista de Disciplinas) abre `/pomodoro?disciplina=…` com o cronômetro pronto, como hoje (08/35).
- **O menu não aparece no Foco.** A saída é o botão **"Início"** (pílula de vidro, chevron + texto) no canto superior esquerdo, em todos os estados, inclusive sem disciplina: computador como na 35; **celular agora também vai para o Início** (38), no lugar da seta que voltava para a disciplina. O botão de ajustes continua no canto direito (só com o ciclo parado).
- Sair do Foco não pausa nem encerra: o tempo continua e aparece no item Foco do menu.

**Início como painel (36, 36b)**
- De cima para baixo (celular) ou em duas colunas (computador: à esquerda "Continuar estudando" e "Sua semana"; à direita nível/meta, fruto de ontem e destaque do perfil):
  1. Cabeçalho como hoje (data, saudação, chips de ofensiva, XP e nível, Seu Tomás).
  2. **Continuar estudando:** card em `--primary` com a disciplina estudada por último (selo com a sigla na cor da disciplina, título, livro · progresso · prova), o próximo tópico (páginas e estimativa), botão **"Começar"** (abre o Foco nesse tópico) e link **"Trocar disciplina"** (abre Disciplinas).
     - **Sigla do selo (39d):** gerada do título, sem campo novo. Com 2 ou mais palavras, ignorando "de", "da", "do", "das", "dos" e "e": as iniciais de até 3 delas ("Estruturas de Dados" → ED, "Projeto e Análise de Algoritmos" → PAA). Com uma palavra: as 3 primeiras letras ("Algoritmos" → ALG). Sempre em maiúsculas, com acento. Texto branco ou `--ink`, o que der contraste AA com a cor da disciplina.
     - **Contraste (18/11):** todos os textos do card em branco sobre `--primary` (5,3:1), inclusive o rótulo e a linha "livro · progresso · prova"; a caixa "Próximo tópico" em `--primary-strong` (8,2:1), com o rótulo e os detalhes também em `--on-primary` (branco no Clássico, 8,2:1; sem hex, para funcionar nos 4 temas). O verde-claro translúcido da primeira versão da 36 dava 4,1:1.
     - **Todos os tópicos concluídos (39e):** a caixa diz "Todos os tópicos concluídos. Que colheita!" e o "Começar" abre o Foco na disciplina, sem tópico (revisão).
  3. Nível e meta (barra até o próximo nível, "Meta de hoje N de M", "Colheita N de 7"). **Coorte B:** o card não aparece, como hoje (nem a meta sozinha).
  4. Fruto de ontem (como hoje; com fruto pendente, "Toque para colher").
  5. Destaque do perfil, **o mesmo da 21**: Explorador = "Seu álbum: N de 11" com "Ver álbum" e o melhor horário de foco; Competidor = posição na Feira; Socializador = quem você segue. **O Conquistador não tem destaque**, porque o card "Rumo ao nível" (item 3) já é o dele. Não há card de livros novos.
     - **Explorador sem pomodoros nos últimos 30 dias (39e):** a linha do melhor horário vira "Conclua alguns pomodoros e eu descubro o seu melhor horário de foco."
  6. **Sua semana:** tempo de foco no mesmo formato das Estatísticas ("3h 20min"), pomodoros e dias estudados, barras dos 7 dias e o link para a 29: **"Ver tudo →"** no celular, na mesma linha do título, com o nome acessível "Ver tudo nas estatísticas" (o complemento só para o leitor de tela; ver DECISOES 18/11); **"Ver todas as estatísticas →"** no computador.
- **A lista de disciplinas sai do Início**; fica só na aba Disciplinas (que já existe), com o "Começar" de cada card levando ao Foco.
- **Sem disciplinas:** o Início mostra o estado vazio da 01b no lugar de "Continuar estudando".
- **Onboarding (passo 5):** no lugar de "Continuar estudando", o card **"Falta 1 passo · Colha seu primeiro fruto"** com "Começar" (abre o Foco na disciplina criada). Ver "Fluxo do onboarding".

**Estatísticas no celular (39c)**
- Abertas pelo card "Sua semana". A tela mantém a barra inferior, com **Início marcado**, e ganha o link **"← Início"** no topo, acima do título. O conteúdo segue a 29. No computador nada muda (Estatísticas está na barra lateral).

## Design completo
Todas as telas do DESIGN §11 estão desenhadas (ondas 1 a 5). Telas novas que surgirem seguem os componentes acima.

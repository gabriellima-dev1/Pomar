# Pomar — Design para implementação (Fase 2)

Fonte aprovada pela dupla em 09/11/2026. Referências no Claude: design system **"Pomar"** e prancheta **"Pomar — telas da Fase 2"**. Este arquivo e a pasta `docs/design/` são o que o Claude Code usa; em caso de dúvida, as imagens em `referencias/` mandam no visual e o `DESIGN.md` manda nas regras.

## Conteúdo desta pasta

| Arquivo | O que é |
| --- | --- |
| `tokens.json` | Tokens do design system (cores dos 4 temas, tipografia, espaçamento, raios, sombras, tamanhos). Fonte única. |
| `tokens.css` | Gerado do `tokens.json`: variáveis CSS por tema (`[data-theme]`), Noturno automático no modo escuro, classes `.text-*`. Substitui os tokens provisórios do `app/globals.css`. |
| `referencias/*.png` | Imagens das telas aprovadas (390×844, 2x) e das 4 cenas do pomodoro. |
| `cenas/scene-*.html` | As 4 cenas do pomodoro funcionando (SVG + CSS animado). Referência exata de desenho e animação. |
| `emblemas/*.svg` | Ícones dos 12 emblemas (24px, traço 2px, `currentColor`). Nome do arquivo = código do emblema do DESIGN §6.4. |
| `ilustracoes/seu-tomas*.svg` | Seu Tomás básico e com os acessórios de cada tema. Cores por variável CSS com valor padrão. |

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

## Ainda não desenhado (próximas ondas)
Conquistas, subida de nível e desbloqueio de tema (até 15/11); onboarding e landing (até 15/11); liga, social, estatísticas, configurações, transparência e admin (até 18/11). Até lá, essas telas seguem os componentes acima.

# Plano — fluxos de telas com casos de exemplo

> Para a dupla decidir como as telas devem funcionar vendo o que a plataforma mostra de verdade, em situações concretas, e não em telas soltas.
> Status: **primeira rodada gerada em 12/11** com Carla, Diego e Elisa (31 telas, celular e computador), sem tablet e sem os 4 temas (decisão da dupla em 12/11). Galeria privada: https://claude.ai/artifact/Kf1HJe1eZKncPjkLAz6znW

## 1. O que vamos entregar

Uma **galeria de fluxos**: para cada caso de exemplo, a sequência de telas na ordem em que a pessoa passa por elas. Cada tela vem capturada do app real (localhost, com o banco do Supabase), no celular e no computador.

Cada passo da galeria tem:
- a captura (celular 390×844 e computador 1440×900);
- **o que a pessoa fez** para chegar ali ("tocou em Começar", "terminou o ciclo");
- **a regra que vale** naquela tela, com o link para o DESIGN.md ou o DECISOES.md;
- **pontos de decisão**: o que ainda está em aberto ou pode mudar, para vocês marcarem.

As capturas são geradas por script. Quando uma tela mudar, rodamos de novo e a galeria se atualiza.

## 2. Casos de exemplo (personas)

Contas de exemplo `fluxo.<nome>@example.com`, todas com `is_demo` (ficam fora das métricas e com o selo "demo"). Os dados são preparados pelo script com a chave secreta, e as datas ficam no passado para o fechamento dos dias acontecer como no uso real.

| # | Persona | Situação | Fluxo mostrado |
|---|---|---|---|
| 1 | **Ana**, primeira vez (coorte A) | Acabou de se cadastrar | Landing → cadastro → boas-vindas → quiz (8 perguntas) → perfil → Feira (sem pré-marcação) → 1ª disciplina pelo catálogo → calibração → 1º pomodoro → fim do ciclo → "Primeiro fruto" |
| 2 | **Bruno**, primeira vez (coorte B) | Igual à Ana | Só as telas que **mudam** na coorte B, lado a lado com as da Ana |
| 3 | **Carla**, estudando um livro (Cormen) | 2 semanas de uso, ritmo calibrado, prova marcada | Início → disciplina → pomodoro (pronto, rodando, pausa com nudge, fim do ciclo com páginas) → tópico concluído → próximo tópico sugerido. No dia seguinte: fruto de ontem, subida de nível e colheita da semana. Conquistas (álbum, colheitas, temas) e Estatísticas (semana, mês, ano) |
| 4 | **Diego**, competidor | Na Feira, num grupo de 13 | Liga › Feira (zonas, selo demo, "Ver o grupo todo"), destaque do Competidor no Início, **resultado da semana nas 3 versões** (subiu, ficou, desceu) e o aviso de quem ainda não fez XP |
| 5 | **Elisa**, socializadora | Segue a Carla e o Diego | Apelido (tela 24) → buscar → seguir → feed com "Parabéns" → "Enviado" → faixa de parabéns recebidos → perfil público (logado e sem login) → perfil privado |
| 6 | **Fábio**, curso em vídeo | Importa uma playlist | Nova disciplina › YouTube (link inválido, playlist ok, velocidade, desmarcar vídeo) → disciplina em minutos → pomodoro de vídeo → fim do ciclo |
| 7 | **Estados vazios e erros** | Contas sem dados | Início sem disciplinas, Estatísticas sem pomodoros, Feira sem grupo, Amigos sem ninguém, playlist privada, apelido em uso |

**Pontos de decisão já conhecidos**, que aparecem marcados nos fluxos da Carla:
- **Escolher outro tópico:** hoje só dá para estudar o próximo da ordem.
- **Concluir tópico:** a caixa do fim do ciclo vem desmarcada mesmo quando as páginas lidas cobrem o tópico.

## 3. Variações por tela

Para não virar centenas de imagens, cada variação entra só onde muda alguma coisa:

| Variação | Onde entra |
|---|---|
| Celular × computador | Todas as telas |
| Tablet (900px) | Só Início, Disciplina e Pomodoro |
| Os 4 temas | Pomodoro e as revelações (fruto do dia, tema desbloqueado, subida de nível) |
| Coorte A × B | Início, fim do ciclo, Conquistas e a tela do primeiro fruto |
| Animações | Duas capturas com 1,5 s de diferença nas telas com cena, mais a contagem de `document.getAnimations()` |

Estimativa: **cerca de 90 telas** (≈ 180 imagens).

## 4. Como vamos gerar

1. **`scripts/fluxos/preparar.ts`:** cria as personas e os dados de cada caso.
   - Pomodoros, páginas, tópicos concluídos, seguidores e itens do feed.
   - Uma semana **passada** da Feira com os 3 resultados.
   - Nunca fecha a semana em andamento, para não mexer na Feira real.
   - Com `--remover`, apaga tudo.
2. **`scripts/fluxos/capturar.ts`:** abre o app no Chrome sem interface, com o Playwright (item já previsto na Fase 6), faz login como cada persona, percorre os passos e salva as capturas.
   - Estados de tempo (ciclo rodando, pausado, terminado) saem dos dados preparados, sem esperar 25 minutos.
3. **`docs/fluxos/roteiro.json`:** a lista de passos de cada persona, com URL, ação, legenda, regra e pontos de decisão. A galeria é montada a partir dele.
4. **Galeria:** uma página privada (Artifact) com os fluxos em sequência, em que vocês dois comentam em cada tela. As imagens não vão para o git (≈ 25 MB); ficam na galeria e numa pasta local ignorada.

Rodar de novo depois de uma mudança (com `npm run build && npx next start -p 3100` em outro terminal):

```
npm run fluxos:preparar -- --confirmo
npm run fluxos:capturar
npm run fluxos:galeria      # gera .fluxos/galeria.html; depois o Claude Code republica no mesmo link
```

As senhas das contas de exemplo ficam em `.fluxos/senhas.json` (fora do git). Ao fim da captura, as personas saem da Feira para não entrarem nos grupos reais; `fluxos:preparar` põe de volta.

## 5. Como usar para decidir

1. Abram a galeria e percorram uma persona por vez. A Carla e o Diego são os que mais pesam na apresentação.
2. Comentem direto na tela: o que mudar, o que está confuso, qual opção preferem em cada ponto de decisão.
3. Eu leio os comentários, registro as decisões em `docs/DECISOES.md`, faço as mudanças e gero a galeria de novo para conferirem.

## 6. Prazo e encaixe no plano

- **Esforço:** uma sessão. O Playwright e a preparação de dados adiantam dois itens da Fase 6 (teste ponta a ponta e seed de demo), então o trabalho não se perde.
- **Quando:** logo depois da aprovação, antes das telas novas da Fase 6 (configurações, transparência, admin). Assim as decisões tomadas na galeria já entram nelas.
- **Congelamento** continua em 23/11.

## 7. O que preciso de vocês antes de gerar

1. **Onde ver:** galeria com comentários (recomendado) ou só uma pasta com as imagens?
2. **Tamanho:** os 7 casos acima, ou começar só por Carla, Diego e Elisa (≈ 40 telas) e ampliar depois?
3. **Tablet e os 4 temas:** entram como está na seção 3, ou ficam de fora nesta primeira rodada?
4. **Algum caso que falta?** Por exemplo: quem volta depois de dias sem estudar (ofensiva com congelamento), ou a semana de prova.

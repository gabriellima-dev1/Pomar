# Revisão das decisões pendentes (16/11/2026)

`docs/DECISOES.md` tinha **104 decisões pendentes** em 16/11, tomadas pelo Claude Code como a opção mais simples e reversível. Esta lista as separa pelo que precisam de vocês. Para confirmar, troquem o status da linha em `DECISOES.md` para `aprovada` (ou escrevam o que muda). Quatro que já tinham sido substituídas viraram `superada`.

Todas estão implementadas e funcionando; nenhuma bloqueia a entrega. A prioridade é pelo que aparece na apresentação ou no relatório.

## Resultado (16/11)

A dupla revisou a lista: **todas as decisões ficaram como estavam** (aprovadas), com três exceções:
- **7 · contas antigas:** entram no experimento como grupo A (nova decisão de 16/11).
- **9 · páginas convertidas do catálogo:** aprovadas; não precisam ir para o relatório.
- **10 · catálogo:** completado com 4 clássicos do curso (Tanenbaum & Bos, Patterson & Hennessy, Sipser, Rosen), chegando a 12 livros; a pendência do Szwarcfiter ficou superada.

Não há mais decisões pendentes. A lista abaixo fica como registro da revisão.

## A · Confirmar antes de 23/11 (14 itens, 15 linhas)

Mudam números do relatório, o que a banca vê ou o que dizemos sobre ética.

**Números do relatório (painel `/admin`)**
1. **15/11 · Retenção D1/D7**: ação valiosa (pomodoro ou tópico) no dia cadastro+1 e cadastro+7; quem ainda não tem o dia completo fica fora da base.
2. **15/11 · Stickiness**: sempre DAU médio de 30 dias ÷ MAU, seja qual for o período escolhido.
3. **15/11 · Funil e pomodoros por semana**: base = cadastros do período; pomodoros ÷ pessoas ÷ semanas do período.
4. **15/11 · Nudge**: cartão = % de "Reiniciar" sobre os pop-ups exibidos; a barra tem o trecho "Sem resposta".
5. **10/11 · Reiniciar ciclo** = encerra o ciclo (`pomodoro_cancelled {reason: restart}`) e começa outro. Define como o nudge aparece nas métricas.
6. **10/11 · `ended_at` do ciclo** = início + pausas + foco planejado. Define o tempo de foco nas estatísticas.

**Experimento (§9.4)**
7. ~~**15/11 · Contas antigas fora da comparação** (as 2 da dupla).~~ ✅ **Respondida (16/11):** não ficam fora; entram como grupo A.
8. ~~**15/11 · Sair do experimento não tem volta.**~~ ✅ **Respondida (16/11):** fica sem volta.

**Ética e dados reais (§10)**
9. ~~**08/11 · Páginas do catálogo convertidas proporcionalmente** da edição em inglês, com o selo de "páginas aproximadas".~~ ✅ **Respondida (16/11):** aprovada; não precisa ir para o relatório.
10. ~~**08/11 · Szwarcfiter fora do catálogo** até o sumário chegar (o catálogo tem 8 livros; o §7 pede 8 a 12).~~ ✅ **Respondida (16/11):** entram os livros mais conhecidos do curso; o catálogo vai a 12.
11. **15/11 · Exportar meus dados** inclui os próprios eventos de uso; de quem a pessoa segue, só os ids.

**Apresentação**
12. **15/11 · Contas demo na Feira por opt-in**, junto com contas reais (com selo). Alternativa: deixar as demo num grupo só delas.
13. **11/11 · Só sobe de divisão quem fez XP na semana** e **grupos com menos de 10 não sobem nem descem** (duas linhas). Vale para a Feira que a banca vai ver.
14. **07/11 · Supabase em us-east-1** (o plano pedia São Paulo): entra como limitação no relatório (~120 ms a mais).

## B · Comportamento de tela (confirmar quando der)

Seguem as referências; quando elas não diziam, escolhemos o mais simples.

- **Pomodoro no computador (15/11):** cena larga só no pomodoro ≥ 1024px; quando os atalhos agem; pílula "Início"; estados do painel; linha do tópico.
- **Pomodoro (10/11):** ciclo abandonado depois de 2 h; Encerrar com confirmação; recalibração (α = 0,3, 20%); páginas previstas; avisos de fim contam como pedidos; convite de notificação no 1º foco; som e contagem de ciclos no aparelho; sessão livre.
- **Disciplinas (08–10/11):** 1ª calibração vira o ritmo padrão; excluir é definitivo; ↑/↓ para reordenar; % arredondado para baixo; frase da data da prova; caixa "Terminei o tópico" desmarcada; rótulo "PRÓXIMO" em `--ink`; catálogo numa página; ordem dos cards; "termina ~DD/MM"; previsão de término; catálogo só para quem entrou.
- **Gamificação (10–11/11):** ordem das revelações; emblema secreto "???"; folha do emblema; "semana mais leve"; selo "Novo"; fruto de ontem; até 7 revelações; 1º fechamento retroativo; ofensiva + hoje; falas do Seu Tomás no Início.
- **Onboarding e perfis (10/11):** quiz em `quiz-bartle.json`; "Competidor"; perfil muda só um card; onboarding retoma de onde parou; apelido só na 1ª Feira; 1ª disciplina pelo YouTube sem calibração.
- **Feira e social (11/11):** social dentro da Liga; perfil público desmarcado; feed só com conquistas marcantes; textos do resultado; desempate; sair e entrar no meio da semana; colheita como 1 item; feed sem retroativo.
- **Estatísticas e YouTube (11/11):** heatmap e melhor horário; previsto × real; "Seu ritmo"; heatmap rolando no celular; velocidade vira ritmo; 1 capítulo por playlist, até 200 vídeos.
- **Configurações, Transparência, Admin (12/11 e 15/11):** 4 seções; excluir pelo apelido; sair do experimento; 12 técnicas; quadro "O SEU GRUPO"; texto do auto-monitoramento; período e "Sem contas demo"; aviso de fim como preferência do aparelho; caixa do perfil público; confirmação sem maiúsculas.
- **Visual (10–15/11):** Esmeralda `#3fae7a`; computador e tablet (768/1024px); cópias espelhadas nas cenas em tela cheia; saudação por horário; `--reward-ink` para o texto de XP.
- **Contas e landing (07–10/11):** fuso do Google começa em Maceió; senha de 8 caracteres; contadores da landing sem demo e sem zeros; página `/privacidade`.

## C · Técnicas (podem ficar como estão)

Não mudam nada que a pessoa veja: Cache Components desligado; colunas extras do catálogo; seed por script; convenção de páginas e tópicos = seções; "Já sei meu ritmo" em `calibrations`; props dos eventos; `done_at` com grant; `dedupe_key` do XP; ranking calculado na leitura; cron + rede de segurança da Feira; carregador `alias-hooks.mjs`; axe no e2e; telemetria anônima das contas demo apagadas; e as demais marcadas "(técnica)".

# Catálogo — revisão das páginas

> Gerado por `npm run catalog:review` a partir de `supabase/seed/catalog/*.json`. Não precisa commitar as marcações: confiram, anotem as correções aqui (ou numa cópia) e me avisem. Eu passo tudo para o JSON, troco o livro para `verified: true`, regenero este arquivo e rodo o seed de novo.

## Como conferir

1. Peguem a **mesma edição** indicada no livro (edição, editora e ano).
2. Abram o sumário e confiram, capítulo por capítulo, o **título** e a **página inicial** de cada tópico.
3. Na coluna **Correção**, escrevam `ok` ou a página certa (ex.: `início 37`). Se o título for diferente na tradução, escrevam o título certo.
4. Marquem `[x]` no capítulo quando terminar e, no fim, em **Livro conferido**.

**Convenção:** a página final de um tópico é a página anterior ao início do próximo. A introdução do capítulo entra no 1º tópico, e os exercícios do fim entram no último. Por isso basta conferir a **página inicial** de cada tópico e a **final** do último tópico de cada capítulo.

Enquanto um livro não for conferido, o app mostra o aviso **“páginas aproximadas”** (`verified = false`).

## Resumo

8 livros, 831 tópicos.

| Livro | Edição | Capítulos | Tópicos | Páginas somadas | Status |
|---|---|---|---|---|---|
| Algoritmos: Teoria e Prática | 4ª ed., GEN LTC, 2024 | 39 | 149 | 880 | a conferir |
| Sistema de Banco de Dados | 7ª ed., GEN LTC, 2020 | 26 | 196 | 960 | a conferir |
| Compiladores: Princípios, Técnicas e Ferramentas | 2ª ed., Pearson Addison-Wesley, 2008 | 14 | 106 | 620 | a conferir |
| Engenharia de Software | 10ª ed., Pearson, 2019 | 25 | 106 | 740 | a conferir |
| Processamento Digital de Imagens | 3ª ed., Pearson Prentice Hall, 2010 | 12 | 79 | 600 | a conferir |
| Redes de Computadores e a Internet: uma abordagem top-down | 8ª ed., Bookman, 2021 | 8 | 57 | 595 | a conferir |
| Redes de Computadores | 6ª ed., Bookman, 2021 | 8 | 64 | 600 | a conferir |
| Sistemas Distribuídos: Princípios e Paradigmas | 2ª ed., Pearson Prentice Hall, 2007 | 13 | 74 | 390 | a conferir |

## Fora do seed por enquanto

- **Szwarcfiter — Teoria Computacional de Grafos: Os Algoritmos (Elsevier, 2018)** — não encontrei o sumário em fonte pública confiável e não quis inventar a estrutura. Mandem uma foto do sumário (capítulos, seções e páginas) e eu monto o JSON.

---

## Algoritmos: Teoria e Prática

- **Autores:** Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein
- **Edição:** 4ª ed., GEN LTC, 2024
- **ISBN:** 978-85-951-5990-7
- **Total de páginas:** 912
- **Arquivo:** `supabase/seed/catalog/algoritmos-cormen.json`
- **Origem do sumário:** Capítulos e página inicial de cada capítulo do sumário da 4ª ed. em inglês (MIT Press, 2022), publicado em catálogo de livraria (eCampus). As seções vêm do nosso conhecimento do livro, e a página de cada seção foi distribuída igualmente dentro do capítulo (estimativa). Páginas convertidas proporcionalmente para as 912 p. da edição em português; títulos traduzidos por nós (podem diferir da tradução oficial).

- [ ] Edição e total de páginas conferem
- [ ] Livro conferido

### 1. O papel dos algoritmos na computação (pp. 1–8)

- [ ] Capítulo conferido · 8 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 1.1 Algoritmos | 1 | 4 | 4 |  |
| 1.2 Algoritmos como tecnologia | 5 | 8 | 4 |  |

### 2. Primeiros passos (pp. 9–31)

- [ ] Capítulo conferido · 23 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 2.1 Ordenação por inserção | 9 | 16 | 8 |  |
| 2.2 Análise de algoritmos | 17 | 23 | 7 |  |
| 2.3 Projeto de algoritmos | 24 | 31 | 8 |  |

### 3. Caracterizando tempos de execução (pp. 32–51)

- [ ] Capítulo conferido · 20 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 3.1 Notações O, Ω e Θ | 32 | 38 | 7 |  |
| 3.2 Notação assintótica: definições formais | 39 | 44 | 6 |  |
| 3.3 Notações padrão e funções comuns | 45 | 51 | 7 |  |

### 4. Divisão e conquista (pp. 52–87)

- [ ] Capítulo conferido · 36 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 4.1 Multiplicação de matrizes quadradas | 52 | 56 | 5 |  |
| 4.2 Algoritmo de Strassen para multiplicação de matrizes | 57 | 61 | 5 |  |
| 4.3 O método da substituição para resolver recorrências | 62 | 66 | 5 |  |
| 4.4 O método da árvore de recursão para resolver recorrências | 67 | 71 | 5 |  |
| 4.5 O método mestre para resolver recorrências | 72 | 76 | 5 |  |
| 4.6 Prova do teorema mestre contínuo | 77 | 81 | 5 |  |
| 4.7 Recorrências de Akra-Bazzi | 82 | 87 | 6 |  |

### 5. Análise probabilística e algoritmos aleatorizados (pp. 88–112)

- [ ] Capítulo conferido · 25 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 5.1 O problema da contratação | 88 | 93 | 6 |  |
| 5.2 Variáveis aleatórias indicadoras | 94 | 99 | 6 |  |
| 5.3 Algoritmos aleatorizados | 100 | 106 | 7 |  |
| 5.4 Análise probabilística e outros usos de variáveis aleatórias indicadoras | 107 | 112 | 6 |  |

### 6. Heapsort (pp. 113–127)

- [ ] Capítulo conferido · 15 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 6.1 Heaps | 113 | 115 | 3 |  |
| 6.2 Manutenção da propriedade de heap | 116 | 118 | 3 |  |
| 6.3 Construção de um heap | 119 | 121 | 3 |  |
| 6.4 O algoritmo heapsort | 122 | 124 | 3 |  |
| 6.5 Filas de prioridade | 125 | 127 | 3 |  |

### 7. Quicksort (pp. 128–143)

- [ ] Capítulo conferido · 16 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 7.1 Descrição do quicksort | 128 | 131 | 4 |  |
| 7.2 Desempenho do quicksort | 132 | 135 | 4 |  |
| 7.3 Uma versão aleatorizada do quicksort | 136 | 139 | 4 |  |
| 7.4 Análise do quicksort | 140 | 143 | 4 |  |

### 8. Ordenação em tempo linear (pp. 144–159)

- [ ] Capítulo conferido · 16 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 8.1 Limites inferiores para ordenação | 144 | 147 | 4 |  |
| 8.2 Ordenação por contagem | 148 | 151 | 4 |  |
| 8.3 Radix sort | 152 | 155 | 4 |  |
| 8.4 Bucket sort | 156 | 159 | 4 |  |

### 9. Medianas e estatísticas de ordem (pp. 160–177)

- [ ] Capítulo conferido · 18 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 9.1 Mínimo e máximo | 160 | 165 | 6 |  |
| 9.2 Seleção em tempo esperado linear | 166 | 171 | 6 |  |
| 9.3 Seleção em tempo linear no pior caso | 172 | 177 | 6 |  |

### 10. Estruturas de dados elementares (pp. 178–192)

- [ ] Capítulo conferido · 15 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 10.1 Estruturas de dados simples baseadas em arranjos: arranjos, matrizes, pilhas e filas | 178 | 182 | 5 |  |
| 10.2 Listas ligadas | 183 | 187 | 5 |  |
| 10.3 Representação de árvores enraizadas | 188 | 192 | 5 |  |

### 11. Tabelas hash (pp. 193–221)

- [ ] Capítulo conferido · 29 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 11.1 Tabelas de endereço direto | 193 | 197 | 5 |  |
| 11.2 Tabelas hash | 198 | 203 | 6 |  |
| 11.3 Funções hash | 204 | 209 | 6 |  |
| 11.4 Endereçamento aberto | 210 | 215 | 6 |  |
| 11.5 Considerações práticas | 216 | 221 | 6 |  |

### 12. Árvores binárias de busca (pp. 222–234)

- [ ] Capítulo conferido · 13 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 12.1 O que é uma árvore binária de busca? | 222 | 225 | 4 |  |
| 12.2 Consultas em uma árvore binária de busca | 226 | 230 | 5 |  |
| 12.3 Inserção e remoção | 231 | 234 | 4 |  |

### 13. Árvores rubro-negras (pp. 235–257)

- [ ] Capítulo conferido · 23 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 13.1 Propriedades das árvores rubro-negras | 235 | 240 | 6 |  |
| 13.2 Rotações | 241 | 245 | 5 |  |
| 13.3 Inserção | 246 | 251 | 6 |  |
| 13.4 Remoção | 252 | 257 | 6 |  |

### 14. Programação dinâmica (pp. 258–296)

- [ ] Capítulo conferido · 39 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 14.1 Corte de hastes | 258 | 264 | 7 |  |
| 14.2 Multiplicação de cadeias de matrizes | 265 | 272 | 8 |  |
| 14.3 Elementos de programação dinâmica | 273 | 280 | 8 |  |
| 14.4 Subsequência comum mais longa | 281 | 288 | 8 |  |
| 14.5 Árvores binárias de busca ótimas | 289 | 296 | 8 |  |

### 15. Algoritmos gulosos (pp. 297–318)

- [ ] Capítulo conferido · 22 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 15.1 Um problema de seleção de atividades | 297 | 302 | 6 |  |
| 15.2 Elementos da estratégia gulosa | 303 | 307 | 5 |  |
| 15.3 Códigos de Huffman | 308 | 313 | 6 |  |
| 15.4 Caching off-line | 314 | 318 | 5 |  |

### 16. Análise amortizada (pp. 319–341)

- [ ] Capítulo conferido · 23 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 16.1 Análise agregada | 319 | 324 | 6 |  |
| 16.2 O método de contabilidade | 325 | 330 | 6 |  |
| 16.3 O método do potencial | 331 | 336 | 6 |  |
| 16.4 Tabelas dinâmicas | 337 | 341 | 5 |  |

### 17. Aumentando estruturas de dados (pp. 342–354)

- [ ] Capítulo conferido · 13 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 17.1 Estatísticas de ordem dinâmicas | 342 | 346 | 5 |  |
| 17.2 Como aumentar uma estrutura de dados | 347 | 350 | 4 |  |
| 17.3 Árvores de intervalos | 351 | 354 | 4 |  |

### 18. Árvores B (pp. 355–370)

- [ ] Capítulo conferido · 16 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 18.1 Definição de árvores B | 355 | 359 | 5 |  |
| 18.2 Operações básicas em árvores B | 360 | 365 | 6 |  |
| 18.3 Remoção de uma chave de uma árvore B | 366 | 370 | 5 |  |

### 19. Estruturas de dados para conjuntos disjuntos (pp. 371–391)

- [ ] Capítulo conferido · 21 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 19.1 Operações em conjuntos disjuntos | 371 | 375 | 5 |  |
| 19.2 Representação de conjuntos disjuntos por listas ligadas | 376 | 381 | 6 |  |
| 19.3 Florestas de conjuntos disjuntos | 382 | 386 | 5 |  |
| 19.4 Análise da união por posto com compressão de caminho | 387 | 391 | 5 |  |

### 20. Algoritmos elementares em grafos (pp. 392–417)

- [ ] Capítulo conferido · 26 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 20.1 Representações de grafos | 392 | 396 | 5 |  |
| 20.2 Busca em largura | 397 | 401 | 5 |  |
| 20.3 Busca em profundidade | 402 | 407 | 6 |  |
| 20.4 Ordenação topológica | 408 | 412 | 5 |  |
| 20.5 Componentes fortemente conexas | 413 | 417 | 5 |  |

### 21. Árvores geradoras mínimas (pp. 418–431)

- [ ] Capítulo conferido · 14 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 21.1 Construindo uma árvore geradora mínima | 418 | 424 | 7 |  |
| 21.2 Os algoritmos de Kruskal e Prim | 425 | 431 | 7 |  |

### 22. Caminhos mínimos de fonte única (pp. 432–461)

- [ ] Capítulo conferido · 30 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 22.1 O algoritmo de Bellman-Ford | 432 | 437 | 6 |  |
| 22.2 Caminhos mínimos de fonte única em grafos acíclicos dirigidos | 438 | 443 | 6 |  |
| 22.3 Algoritmo de Dijkstra | 444 | 449 | 6 |  |
| 22.4 Restrições de diferença e caminhos mínimos | 450 | 455 | 6 |  |
| 22.5 Provas das propriedades de caminhos mínimos | 456 | 461 | 6 |  |

### 23. Caminhos mínimos entre todos os pares (pp. 462–478)

- [ ] Capítulo conferido · 17 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 23.1 Caminhos mínimos e multiplicação de matrizes | 462 | 467 | 6 |  |
| 23.2 O algoritmo de Floyd-Warshall | 468 | 472 | 5 |  |
| 23.3 Algoritmo de Johnson para grafos esparsos | 473 | 478 | 6 |  |

### 24. Fluxo máximo (pp. 479–503)

- [ ] Capítulo conferido · 25 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 24.1 Redes de fluxo | 479 | 486 | 8 |  |
| 24.2 O método de Ford-Fulkerson | 487 | 495 | 9 |  |
| 24.3 Emparelhamento bipartido máximo | 496 | 503 | 8 |  |

### 25. Emparelhamentos em grafos bipartidos (pp. 504–534)

- [ ] Capítulo conferido · 31 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 25.1 Emparelhamento bipartido máximo (revisitado) | 504 | 513 | 10 |  |
| 25.2 O problema do casamento estável | 514 | 524 | 11 |  |
| 25.3 O algoritmo húngaro para o problema de atribuição | 525 | 534 | 10 |  |

### 26. Algoritmos paralelos (pp. 535–565)

- [ ] Capítulo conferido · 31 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 26.1 Fundamentos do paralelismo fork-join | 535 | 545 | 11 |  |
| 26.2 Multiplicação paralela de matrizes | 546 | 555 | 10 |  |
| 26.3 Ordenação por intercalação paralela | 556 | 565 | 10 |  |

### 27. Algoritmos on-line (pp. 566–586)

- [ ] Capítulo conferido · 21 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 27.1 Esperando um elevador | 566 | 572 | 7 |  |
| 27.2 Mantendo uma lista de busca | 573 | 579 | 7 |  |
| 27.3 Caching on-line | 580 | 586 | 7 |  |

### 28. Operações com matrizes (pp. 587–608)

- [ ] Capítulo conferido · 22 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 28.1 Resolução de sistemas de equações lineares | 587 | 593 | 7 |  |
| 28.2 Inversão de matrizes | 594 | 600 | 7 |  |
| 28.3 Matrizes simétricas definidas positivas e aproximação por mínimos quadrados | 601 | 608 | 8 |  |

### 29. Programação linear (pp. 609–627)

- [ ] Capítulo conferido · 19 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 29.1 Formulações e algoritmos de programação linear | 609 | 614 | 6 |  |
| 29.2 Formulando problemas como programas lineares | 615 | 621 | 7 |  |
| 29.3 Dualidade | 622 | 627 | 6 |  |

### 30. Polinômios e a FFT (pp. 628–646)

- [ ] Capítulo conferido · 19 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 30.1 Representação de polinômios | 628 | 633 | 6 |  |
| 30.2 A DFT e a FFT | 634 | 640 | 7 |  |
| 30.3 Circuitos para FFT | 641 | 646 | 6 |  |

### 31. Algoritmos da teoria dos números (pp. 647–685)

- [ ] Capítulo conferido · 39 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 31.1 Noções elementares da teoria dos números | 647 | 651 | 5 |  |
| 31.2 Máximo divisor comum | 652 | 656 | 5 |  |
| 31.3 Aritmética modular | 657 | 661 | 5 |  |
| 31.4 Resolução de equações lineares modulares | 662 | 665 | 4 |  |
| 31.5 O teorema chinês do resto | 666 | 670 | 5 |  |
| 31.6 Potências de um elemento | 671 | 675 | 5 |  |
| 31.7 O criptossistema de chave pública RSA | 676 | 680 | 5 |  |
| 31.8 Teste de primalidade | 681 | 685 | 5 |  |

### 32. Correspondência de cadeias (pp. 686–718)

- [ ] Capítulo conferido · 33 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 32.1 O algoritmo ingênuo de correspondência de cadeias | 686 | 691 | 6 |  |
| 32.2 O algoritmo de Rabin-Karp | 692 | 698 | 7 |  |
| 32.3 Correspondência de cadeias com autômatos finitos | 699 | 705 | 7 |  |
| 32.4 O algoritmo de Knuth-Morris-Pratt | 706 | 711 | 6 |  |
| 32.5 Arranjos de sufixos | 712 | 718 | 7 |  |

### 33. Algoritmos de aprendizado de máquina (pp. 719–746)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 33.1 Agrupamento (clustering) | 719 | 727 | 9 |  |
| 33.2 Algoritmos de pesos multiplicativos | 728 | 737 | 10 |  |
| 33.3 Descida de gradiente | 738 | 746 | 9 |  |

### 34. NP-completude (pp. 747–791)

- [ ] Capítulo conferido · 45 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 34.1 Tempo polinomial | 747 | 755 | 9 |  |
| 34.2 Verificação em tempo polinomial | 756 | 764 | 9 |  |
| 34.3 NP-completude e redutibilidade | 765 | 773 | 9 |  |
| 34.4 Provas de NP-completude | 774 | 782 | 9 |  |
| 34.5 Problemas NP-completos | 783 | 791 | 9 |  |

### 35. Algoritmos de aproximação (pp. 792–817)

- [ ] Capítulo conferido · 26 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 35.1 O problema da cobertura de vértices | 792 | 796 | 5 |  |
| 35.2 O problema do caixeiro-viajante | 797 | 801 | 5 |  |
| 35.3 O problema da cobertura de conjuntos | 802 | 806 | 5 |  |
| 35.4 Aleatorização e programação linear | 807 | 811 | 5 |  |
| 35.5 O problema da soma de subconjuntos | 812 | 817 | 6 |  |

### Apêndice A. Somatórios (pp. 818–826)

- [ ] Capítulo conferido · 9 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| A.1 Fórmulas e propriedades de somatórios | 818 | 821 | 4 |  |
| A.2 Limitando somatórios | 822 | 826 | 5 |  |

### Apêndice B. Conjuntos etc. (pp. 827–844)

- [ ] Capítulo conferido · 18 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| B.1 Conjuntos | 827 | 830 | 4 |  |
| B.2 Relações | 831 | 833 | 3 |  |
| B.3 Funções | 834 | 837 | 4 |  |
| B.4 Grafos | 838 | 840 | 3 |  |
| B.5 Árvores | 841 | 844 | 4 |  |

### Apêndice C. Contagem e probabilidade (pp. 845–870)

- [ ] Capítulo conferido · 26 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| C.1 Contagem | 845 | 849 | 5 |  |
| C.2 Probabilidade | 850 | 854 | 5 |  |
| C.3 Variáveis aleatórias discretas | 855 | 859 | 5 |  |
| C.4 As distribuições geométrica e binomial | 860 | 865 | 6 |  |
| C.5 As caudas da distribuição binomial | 866 | 870 | 5 |  |

### Apêndice D. Matrizes (pp. 871–880)

- [ ] Capítulo conferido · 10 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| D.1 Matrizes e operações com matrizes | 871 | 875 | 5 |  |
| D.2 Propriedades básicas de matrizes | 876 | 880 | 5 |  |

---

## Sistema de Banco de Dados

- **Autores:** Abraham Silberschatz, Henry F. Korth, S. Sudarshan
- **Edição:** 7ª ed., GEN LTC, 2020
- **ISBN:** a confirmar
- **Total de páginas:** a confirmar
- **Arquivo:** `supabase/seed/catalog/banco-de-dados-silberschatz-korth-sudarshan.json`
- **Origem do sumário:** Estrutura e páginas do sumário oficial da 7ª ed. em inglês (McGraw-Hill, 2019; db-book.com). O total de páginas da edição em português não foi encontrado: as páginas foram convertidas proporcionalmente para cerca de 960 p. (estimativa). Títulos traduzidos por nós (podem diferir da tradução oficial). Capítulos on-line (27–32) não incluídos.

- [ ] Edição e total de páginas conferem
- [ ] Livro conferido

### 1. Introdução (pp. 1–26)

- [ ] Capítulo conferido · 26 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 1.1 Aplicações de sistemas de banco de dados | 1 | 2 | 2 |  |
| 1.2 Propósito dos sistemas de banco de dados | 3 | 5 | 3 |  |
| 1.3 Visão dos dados | 6 | 8 | 3 |  |
| 1.4 Linguagens de banco de dados | 9 | 11 | 3 |  |
| 1.5 Projeto de banco de dados | 12 | 12 | 1 |  |
| 1.6 Engine do banco de dados | 13 | 14 | 2 |  |
| 1.7 Arquitetura de banco de dados e de aplicações | 15 | 17 | 3 |  |
| 1.8 Usuários e administradores de banco de dados | 18 | 18 | 1 |  |
| 1.9 História dos sistemas de banco de dados | 19 | 26 | 8 |  |

### 2. Introdução ao modelo relacional (pp. 27–47)

- [ ] Capítulo conferido · 21 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 2.1 Estrutura dos bancos de dados relacionais | 27 | 29 | 3 |  |
| 2.2 Esquema de banco de dados | 30 | 31 | 2 |  |
| 2.3 Chaves | 32 | 33 | 2 |  |
| 2.4 Diagramas de esquema | 34 | 34 | 1 |  |
| 2.5 Linguagens de consulta relacionais | 35 | 35 | 1 |  |
| 2.6 A álgebra relacional | 36 | 47 | 12 |  |

### 3. Introdução à SQL (pp. 48–92)

- [ ] Capítulo conferido · 45 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 3.1 Visão geral da linguagem de consulta SQL | 48 | 48 | 1 |  |
| 3.2 Definição de dados em SQL | 49 | 52 | 4 |  |
| 3.3 Estrutura básica das consultas SQL | 53 | 58 | 6 |  |
| 3.4 Operações básicas adicionais | 59 | 62 | 4 |  |
| 3.5 Operações de conjunto | 63 | 65 | 3 |  |
| 3.6 Valores nulos | 66 | 67 | 2 |  |
| 3.7 Funções de agregação | 68 | 72 | 5 |  |
| 3.8 Subconsultas aninhadas | 73 | 80 | 8 |  |
| 3.9 Modificação do banco de dados | 81 | 92 | 12 |  |

### 4. SQL intermediária (pp. 93–136)

- [ ] Capítulo conferido · 44 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 4.1 Expressões de junção | 93 | 101 | 9 |  |
| 4.2 Visões | 102 | 106 | 5 |  |
| 4.3 Transações | 107 | 107 | 1 |  |
| 4.4 Restrições de integridade | 108 | 113 | 6 |  |
| 4.5 Tipos de dados e esquemas em SQL | 114 | 121 | 8 |  |
| 4.6 Definição de índices em SQL | 122 | 122 | 1 |  |
| 4.7 Autorização | 123 | 136 | 14 |  |

### 5. SQL avançada (pp. 137–179)

- [ ] Capítulo conferido · 43 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 5.1 Acessando SQL a partir de uma linguagem de programação | 137 | 147 | 11 |  |
| 5.2 Funções e procedimentos | 148 | 153 | 6 |  |
| 5.3 Gatilhos (triggers) | 154 | 158 | 5 |  |
| 5.4 Consultas recursivas | 159 | 163 | 5 |  |
| 5.5 Recursos avançados de agregação | 164 | 179 | 16 |  |

### 6. Projeto de banco de dados usando o modelo E-R (pp. 180–225)

- [ ] Capítulo conferido · 46 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 6.1 Visão geral do processo de projeto | 180 | 181 | 2 |  |
| 6.2 O modelo entidade-relacionamento | 182 | 185 | 4 |  |
| 6.3 Atributos complexos | 186 | 187 | 2 |  |
| 6.4 Cardinalidades de mapeamento | 188 | 190 | 3 |  |
| 6.5 Chave primária | 191 | 194 | 4 |  |
| 6.6 Removendo atributos redundantes em conjuntos de entidades | 195 | 196 | 2 |  |
| 6.7 Redução de diagramas E-R a esquemas relacionais | 197 | 201 | 5 |  |
| 6.8 Recursos estendidos do E-R | 202 | 207 | 6 |  |
| 6.9 Questões de projeto entidade-relacionamento | 208 | 212 | 5 |  |
| 6.10 Notações alternativas para modelagem de dados | 213 | 216 | 4 |  |
| 6.11 Outros aspectos do projeto de banco de dados | 217 | 225 | 9 |  |

### 7. Projeto de banco de dados relacional (pp. 226–272)

- [ ] Capítulo conferido · 47 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 7.1 Características de bons projetos relacionais | 226 | 229 | 4 |  |
| 7.2 Decomposição usando dependências funcionais | 230 | 233 | 4 |  |
| 7.3 Formas normais | 234 | 238 | 5 |  |
| 7.4 Teoria das dependências funcionais | 239 | 246 | 8 |  |
| 7.5 Algoritmos de decomposição usando dependências funcionais | 247 | 250 | 4 |  |
| 7.6 Decomposição usando dependências multivaloradas | 251 | 254 | 4 |  |
| 7.7 Outras formas normais | 255 | 255 | 1 |  |
| 7.8 Domínios atômicos e primeira forma normal | 256 | 256 | 1 |  |
| 7.9 O processo de projeto de banco de dados | 257 | 258 | 2 |  |
| 7.10 Modelagem de dados temporais | 259 | 272 | 14 |  |

### 8. Tipos de dados complexos (pp. 273–300)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 8.1 Dados semiestruturados | 273 | 280 | 8 |  |
| 8.2 Orientação a objetos | 281 | 285 | 5 |  |
| 8.3 Dados textuais | 286 | 288 | 3 |  |
| 8.4 Dados espaciais | 289 | 300 | 12 |  |

### 9. Desenvolvimento de aplicações (pp. 301–348)

- [ ] Capítulo conferido · 48 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 9.1 Programas de aplicação e interfaces com o usuário | 301 | 302 | 2 |  |
| 9.2 Fundamentos da Web | 303 | 306 | 4 |  |
| 9.3 Servlets | 307 | 310 | 4 |  |
| 9.4 Frameworks alternativos no servidor | 311 | 314 | 4 |  |
| 9.5 Código no cliente e serviços Web | 315 | 320 | 6 |  |
| 9.6 Arquiteturas de aplicação | 321 | 323 | 3 |  |
| 9.7 Desempenho de aplicações | 324 | 326 | 3 |  |
| 9.8 Segurança de aplicações | 327 | 333 | 7 |  |
| 9.9 Criptografia e suas aplicações | 334 | 348 | 15 |  |

### 10. Big Data (pp. 349–387)

- [ ] Capítulo conferido · 39 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 10.1 Motivação | 349 | 352 | 4 |  |
| 10.2 Sistemas de armazenamento de Big Data | 353 | 360 | 8 |  |
| 10.3 O paradigma MapReduce | 361 | 368 | 8 |  |
| 10.4 Além do MapReduce: operações algébricas | 369 | 373 | 5 |  |
| 10.5 Dados em fluxo (streaming) | 374 | 379 | 6 |  |
| 10.6 Bancos de dados de grafos | 380 | 387 | 8 |  |

### 11. Análise de dados (pp. 388–417)

- [ ] Capítulo conferido · 30 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 11.1 Visão geral da análise de dados | 388 | 388 | 1 |  |
| 11.2 Data warehousing | 389 | 393 | 5 |  |
| 11.3 Processamento analítico on-line (OLAP) | 394 | 403 | 10 |  |
| 11.4 Mineração de dados | 404 | 417 | 14 |  |

### 12. Sistemas de armazenamento físico (pp. 418–438)

- [ ] Capítulo conferido · 21 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 12.1 Visão geral dos meios físicos de armazenamento | 418 | 419 | 2 |  |
| 12.2 Interfaces de armazenamento | 420 | 420 | 1 |  |
| 12.3 Discos magnéticos | 421 | 423 | 3 |  |
| 12.4 Memória flash | 424 | 425 | 2 |  |
| 12.5 RAID | 426 | 430 | 5 |  |
| 12.6 Acesso a blocos de disco | 431 | 438 | 8 |  |

### 13. Estruturas de armazenamento de dados (pp. 439–465)

- [ ] Capítulo conferido · 27 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 13.1 Arquitetura de armazenamento do banco de dados | 439 | 439 | 1 |  |
| 13.2 Organização de arquivos | 440 | 444 | 5 |  |
| 13.3 Organização de registros em arquivos | 445 | 449 | 5 |  |
| 13.4 Armazenamento do dicionário de dados | 450 | 451 | 2 |  |
| 13.5 Buffer do banco de dados | 452 | 456 | 5 |  |
| 13.6 Armazenamento orientado a colunas | 457 | 459 | 3 |  |
| 13.7 Organização do armazenamento em bancos de dados em memória principal | 460 | 465 | 6 |  |

### 14. Indexação (pp. 466–514)

- [ ] Capítulo conferido · 49 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 14.1 Conceitos básicos | 466 | 466 | 1 |  |
| 14.2 Índices ordenados | 467 | 473 | 7 |  |
| 14.3 Arquivos de índice de árvore B+ | 474 | 485 | 12 |  |
| 14.4 Extensões da árvore B+ | 486 | 491 | 6 |  |
| 14.5 Índices hash | 492 | 493 | 2 |  |
| 14.6 Acesso por múltiplas chaves | 494 | 495 | 2 |  |
| 14.7 Criação de índices | 496 | 496 | 1 |  |
| 14.8 Estruturas de índice otimizadas para escrita | 497 | 500 | 4 |  |
| 14.9 Índices de bitmap | 501 | 501 | 1 |  |
| 14.10 Indexação de dados espaciais e temporais | 502 | 514 | 13 |  |

### 15. Processamento de consultas (pp. 515–555)

- [ ] Capítulo conferido · 41 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 15.1 Visão geral | 515 | 516 | 2 |  |
| 15.2 Medidas de custo de consultas | 517 | 519 | 3 |  |
| 15.3 Operação de seleção | 520 | 523 | 4 |  |
| 15.4 Ordenação | 524 | 525 | 2 |  |
| 15.5 Operação de junção | 526 | 537 | 12 |  |
| 15.6 Outras operações | 538 | 540 | 3 |  |
| 15.7 Avaliação de expressões | 541 | 546 | 6 |  |
| 15.8 Processamento de consultas em memória | 547 | 555 | 9 |  |

### 16. Otimização de consultas (pp. 556–596)

- [ ] Capítulo conferido · 41 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 16.1 Visão geral | 556 | 558 | 3 |  |
| 16.2 Transformação de expressões relacionais | 559 | 565 | 7 |  |
| 16.3 Estimativa de estatísticas dos resultados de expressões | 566 | 572 | 7 |  |
| 16.4 Escolha de planos de avaliação | 573 | 581 | 9 |  |
| 16.5 Visões materializadas | 582 | 584 | 3 |  |
| 16.6 Tópicos avançados em otimização de consultas | 585 | 596 | 12 |  |

### 17. Transações (pp. 597–623)

- [ ] Capítulo conferido · 27 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 17.1 Conceito de transação | 597 | 598 | 2 |  |
| 17.2 Um modelo simples de transação | 599 | 600 | 2 |  |
| 17.3 Estrutura de armazenamento | 601 | 601 | 1 |  |
| 17.4 Atomicidade e durabilidade de transações | 602 | 602 | 1 |  |
| 17.5 Isolamento de transações | 603 | 606 | 4 |  |
| 17.6 Serializabilidade | 607 | 611 | 5 |  |
| 17.7 Isolamento e atomicidade de transações | 612 | 613 | 2 |  |
| 17.8 Níveis de isolamento de transações | 614 | 614 | 1 |  |
| 17.9 Implementação dos níveis de isolamento | 615 | 617 | 3 |  |
| 17.10 Transações como comandos SQL | 618 | 623 | 6 |  |

### 18. Controle de concorrência (pp. 624–677)

- [ ] Capítulo conferido · 54 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 18.1 Protocolos baseados em bloqueio | 624 | 634 | 11 |  |
| 18.2 Tratamento de deadlocks | 635 | 637 | 3 |  |
| 18.3 Granularidade múltipla | 638 | 640 | 3 |  |
| 18.4 Operações de inserção e exclusão e leituras por predicado | 641 | 643 | 3 |  |
| 18.5 Protocolos baseados em timestamp | 644 | 647 | 4 |  |
| 18.6 Protocolos baseados em validação | 648 | 649 | 2 |  |
| 18.7 Esquemas multiversão | 650 | 651 | 2 |  |
| 18.8 Isolamento por snapshot | 652 | 657 | 6 |  |
| 18.9 Níveis fracos de consistência na prática | 658 | 659 | 2 |  |
| 18.10 Tópicos avançados em controle de concorrência | 660 | 677 | 18 |  |

### 19. Sistema de recuperação (pp. 678–718)

- [ ] Capítulo conferido · 41 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 19.1 Classificação de falhas | 678 | 678 | 1 |  |
| 19.2 Armazenamento | 679 | 681 | 3 |  |
| 19.3 Recuperação e atomicidade | 682 | 688 | 7 |  |
| 19.4 Algoritmo de recuperação | 689 | 691 | 3 |  |
| 19.5 Gerenciamento de buffer | 692 | 694 | 3 |  |
| 19.6 Falha com perda de armazenamento não volátil | 695 | 695 | 1 |  |
| 19.7 Alta disponibilidade usando sistemas de backup remoto | 696 | 698 | 3 |  |
| 19.8 Liberação antecipada de bloqueios e operações de undo lógico | 699 | 703 | 5 |  |
| 19.9 ARIES | 704 | 707 | 4 |  |
| 19.10 Recuperação em bancos de dados em memória principal | 708 | 718 | 11 |  |

### 20. Arquiteturas de sistemas de banco de dados (pp. 719–749)

- [ ] Capítulo conferido · 31 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 20.1 Visão geral | 719 | 719 | 1 |  |
| 20.2 Sistemas de banco de dados centralizados | 720 | 720 | 1 |  |
| 20.3 Arquiteturas de sistemas servidores | 721 | 724 | 4 |  |
| 20.4 Sistemas paralelos | 725 | 736 | 12 |  |
| 20.5 Sistemas distribuídos | 737 | 739 | 3 |  |
| 20.6 Processamento de transações em sistemas paralelos e distribuídos | 740 | 740 | 1 |  |
| 20.7 Serviços baseados em nuvem | 741 | 749 | 9 |  |

### 21. Armazenamento paralelo e distribuído (pp. 750–776)

- [ ] Capítulo conferido · 27 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 21.1 Visão geral | 750 | 750 | 1 |  |
| 21.2 Particionamento de dados | 751 | 752 | 2 |  |
| 21.3 Lidando com assimetria no particionamento | 753 | 757 | 5 |  |
| 21.4 Replicação | 758 | 760 | 3 |  |
| 21.5 Indexação paralela | 761 | 761 | 1 |  |
| 21.6 Sistemas de arquivos distribuídos | 762 | 764 | 3 |  |
| 21.7 Armazenamentos chave-valor paralelos | 765 | 776 | 12 |  |

### 22. Processamento paralelo e distribuído de consultas (pp. 777–820)

- [ ] Capítulo conferido · 44 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 22.1 Visão geral | 777 | 777 | 1 |  |
| 22.2 Ordenação paralela | 778 | 779 | 2 |  |
| 22.3 Junção paralela | 780 | 783 | 4 |  |
| 22.4 Outras operações | 784 | 786 | 3 |  |
| 22.5 Avaliação paralela de planos de consulta | 787 | 792 | 6 |  |
| 22.6 Processamento de consultas em arquiteturas de memória compartilhada | 793 | 795 | 3 |  |
| 22.7 Otimização de consultas para execução paralela | 796 | 799 | 4 |  |
| 22.8 Processamento paralelo de dados em fluxo | 800 | 804 | 5 |  |
| 22.9 Processamento distribuído de consultas | 805 | 820 | 16 |  |

### 23. Processamento paralelo e distribuído de transações (pp. 821–878)

- [ ] Capítulo conferido · 58 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 23.1 Transações distribuídas | 821 | 822 | 2 |  |
| 23.2 Protocolos de efetivação (commit) | 823 | 830 | 8 |  |
| 23.3 Controle de concorrência em bancos de dados distribuídos | 831 | 837 | 7 |  |
| 23.4 Replicação | 838 | 843 | 6 |  |
| 23.5 Protocolos estendidos de controle de concorrência | 844 | 846 | 3 |  |
| 23.6 Replicação com graus fracos de consistência | 847 | 856 | 10 |  |
| 23.7 Seleção do coordenador | 857 | 859 | 3 |  |
| 23.8 Consenso em sistemas distribuídos | 860 | 878 | 19 |  |

### 24. Técnicas avançadas de indexação (pp. 879–904)

- [ ] Capítulo conferido · 26 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 24.1 Filtro de Bloom | 879 | 879 | 1 |  |
| 24.2 Árvore LSM (log-structured merge) e variantes | 880 | 883 | 4 |  |
| 24.3 Índices de bitmap | 884 | 886 | 3 |  |
| 24.4 Indexação de dados espaciais | 887 | 889 | 3 |  |
| 24.5 Índices hash | 890 | 904 | 15 |  |

### 25. Desenvolvimento avançado de aplicações (pp. 905–935)

- [ ] Capítulo conferido · 31 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 25.1 Ajuste de desempenho | 905 | 919 | 15 |  |
| 25.2 Benchmarks de desempenho | 920 | 922 | 3 |  |
| 25.3 Outras questões no desenvolvimento de aplicações | 923 | 924 | 2 |  |
| 25.4 Padronização | 925 | 926 | 2 |  |
| 25.5 Sistemas de diretório distribuídos | 927 | 935 | 9 |  |

### 26. Bancos de dados blockchain (pp. 936–960)

- [ ] Capítulo conferido · 25 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 26.1 Visão geral | 936 | 937 | 2 |  |
| 26.2 Propriedades da blockchain | 938 | 941 | 4 |  |
| 26.3 Obtendo as propriedades da blockchain com funções hash criptográficas | 942 | 944 | 3 |  |
| 26.4 Consenso | 945 | 947 | 3 |  |
| 26.5 Gerenciamento de dados em uma blockchain | 948 | 948 | 1 |  |
| 26.6 Contratos inteligentes | 949 | 952 | 4 |  |
| 26.7 Melhoria de desempenho | 953 | 953 | 1 |  |
| 26.8 Aplicações emergentes | 954 | 960 | 7 |  |

---

## Compiladores: Princípios, Técnicas e Ferramentas

- **Autores:** Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman
- **Edição:** 2ª ed., Pearson Addison-Wesley, 2008
- **ISBN:** a confirmar
- **Total de páginas:** 634
- **Arquivo:** `supabase/seed/catalog/compiladores-aho-lam-sethi-ullman.json`
- **Origem do sumário:** Estrutura e páginas do sumário da 2ª ed. em inglês (Addison-Wesley, 2007), publicado em catálogo de livraria (eCampus). Páginas convertidas proporcionalmente para as 634 p. da edição em português; títulos traduzidos por nós (podem diferir da tradução oficial).

- [ ] Edição e total de páginas conferem
- [ ] Livro conferido

### 1. Introdução (pp. 1–24)

- [ ] Capítulo conferido · 24 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 1.1 Processadores de linguagem | 1 | 1 | 1 |  |
| 1.2 A estrutura de um compilador | 2 | 6 | 5 |  |
| 1.3 A evolução das linguagens de programação | 7 | 8 | 2 |  |
| 1.4 A ciência da construção de um compilador | 9 | 9 | 1 |  |
| 1.5 Aplicações da tecnologia de compiladores | 10 | 14 | 5 |  |
| 1.6 Fundamentos das linguagens de programação | 15 | 24 | 10 |  |

### 2. Um tradutor simples dirigido por sintaxe (pp. 25–67)

- [ ] Capítulo conferido · 43 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 2.1 Introdução | 25 | 25 | 1 |  |
| 2.2 Definição de sintaxe | 26 | 31 | 6 |  |
| 2.3 Tradução dirigida por sintaxe | 32 | 36 | 5 |  |
| 2.4 Análise sintática | 37 | 41 | 5 |  |
| 2.5 Um tradutor para expressões simples | 42 | 46 | 5 |  |
| 2.6 Análise léxica | 47 | 52 | 6 |  |
| 2.7 Tabelas de símbolos | 53 | 56 | 4 |  |
| 2.8 Geração de código intermediário | 57 | 67 | 11 |  |

### 3. Análise léxica (pp. 68–119)

- [ ] Capítulo conferido · 52 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 3.1 O papel do analisador léxico | 68 | 71 | 4 |  |
| 3.2 Bufferização da entrada | 72 | 72 | 1 |  |
| 3.3 Especificação de tokens | 73 | 79 | 7 |  |
| 3.4 Reconhecimento de tokens | 80 | 86 | 7 |  |
| 3.5 O gerador de analisador léxico Lex | 87 | 91 | 5 |  |
| 3.6 Autômatos finitos | 92 | 94 | 3 |  |
| 3.7 De expressões regulares a autômatos | 95 | 103 | 9 |  |
| 3.8 Projeto de um gerador de analisador léxico | 104 | 107 | 4 |  |
| 3.9 Otimização de reconhecedores de padrões baseados em AFD | 108 | 119 | 12 |  |

### 4. Análise sintática (pp. 120–189)

- [ ] Capítulo conferido · 70 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 4.1 Introdução | 120 | 122 | 3 |  |
| 4.2 Gramáticas livres de contexto | 123 | 129 | 7 |  |
| 4.3 Escrevendo uma gramática | 130 | 134 | 5 |  |
| 4.4 Análise sintática descendente | 135 | 144 | 10 |  |
| 4.5 Análise sintática ascendente | 145 | 149 | 5 |  |
| 4.6 Introdução à análise LR: LR simples | 150 | 161 | 12 |  |
| 4.7 Analisadores LR mais poderosos | 162 | 173 | 12 |  |
| 4.8 Usando gramáticas ambíguas | 174 | 178 | 5 |  |
| 4.9 Geradores de analisadores sintáticos | 179 | 189 | 11 |  |

### 5. Tradução dirigida por sintaxe (pp. 190–222)

- [ ] Capítulo conferido · 33 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 5.1 Definições dirigidas por sintaxe | 190 | 193 | 4 |  |
| 5.2 Ordens de avaliação para SDDs | 194 | 198 | 5 |  |
| 5.3 Aplicações da tradução dirigida por sintaxe | 199 | 201 | 3 |  |
| 5.4 Esquemas de tradução dirigida por sintaxe | 202 | 209 | 8 |  |
| 5.5 Implementando SDDs L-atribuídas | 210 | 222 | 13 |  |

### 6. Geração de código intermediário (pp. 223–266)

- [ ] Capítulo conferido · 44 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 6.1 Variantes de árvores de sintaxe | 223 | 226 | 4 |  |
| 6.2 Código de três endereços | 227 | 230 | 4 |  |
| 6.3 Tipos e declarações | 231 | 235 | 5 |  |
| 6.4 Tradução de expressões | 236 | 240 | 5 |  |
| 6.5 Verificação de tipos | 241 | 248 | 8 |  |
| 6.6 Fluxo de controle | 249 | 255 | 7 |  |
| 6.7 Backpatching | 256 | 260 | 5 |  |
| 6.8 Comandos switch | 261 | 262 | 2 |  |
| 6.9 Código intermediário para procedimentos | 263 | 266 | 4 |  |

### 7. Ambientes de execução (pp. 267–315)

- [ ] Capítulo conferido · 49 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 7.1 Organização da memória | 267 | 267 | 1 |  |
| 7.2 Alocação de espaço na pilha | 268 | 274 | 7 |  |
| 7.3 Acesso a dados não locais na pilha | 275 | 281 | 7 |  |
| 7.4 Gerenciamento do heap | 282 | 288 | 7 |  |
| 7.5 Introdução à coleta de lixo | 289 | 292 | 4 |  |
| 7.6 Introdução à coleta baseada em rastreamento | 293 | 301 | 9 |  |
| 7.7 Coleta de lixo com pausas curtas | 302 | 307 | 6 |  |
| 7.8 Tópicos avançados em coleta de lixo | 308 | 315 | 8 |  |

### 8. Geração de código (pp. 316–364)

- [ ] Capítulo conferido · 49 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 8.1 Questões no projeto de um gerador de código | 316 | 319 | 4 |  |
| 8.2 A linguagem objeto | 320 | 322 | 3 |  |
| 8.3 Endereços no código objeto | 323 | 327 | 5 |  |
| 8.4 Blocos básicos e grafos de fluxo | 328 | 332 | 5 |  |
| 8.5 Otimização de blocos básicos | 333 | 337 | 5 |  |
| 8.6 Um gerador de código simples | 338 | 342 | 5 |  |
| 8.7 Otimização peephole | 343 | 344 | 2 |  |
| 8.8 Alocação e atribuição de registradores | 345 | 347 | 3 |  |
| 8.9 Seleção de instruções por reescrita de árvore | 348 | 353 | 6 |  |
| 8.10 Geração de código ótimo para expressões | 354 | 357 | 4 |  |
| 8.11 Geração de código por programação dinâmica | 358 | 364 | 7 |  |

### 9. Otimizações independentes de máquina (pp. 365–441)

- [ ] Capítulo conferido · 77 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 9.1 As principais fontes de otimização | 365 | 372 | 8 |  |
| 9.2 Introdução à análise de fluxo de dados | 373 | 385 | 13 |  |
| 9.3 Fundamentos da análise de fluxo de dados | 386 | 394 | 9 |  |
| 9.4 Propagação de constantes | 395 | 398 | 4 |  |
| 9.5 Eliminação de redundância parcial | 399 | 408 | 10 |  |
| 9.6 Laços em grafos de fluxo | 409 | 419 | 11 |  |
| 9.7 Análise baseada em regiões | 420 | 427 | 8 |  |
| 9.8 Análise simbólica | 428 | 441 | 14 |  |

### 10. Paralelismo em nível de instrução (pp. 442–480)

- [ ] Capítulo conferido · 39 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 10.1 Arquiteturas de processadores | 442 | 442 | 1 |  |
| 10.2 Restrições de escalonamento de código | 443 | 449 | 7 |  |
| 10.3 Escalonamento de blocos básicos | 450 | 453 | 4 |  |
| 10.4 Escalonamento global de código | 454 | 460 | 7 |  |
| 10.5 Software pipelining | 461 | 480 | 20 |  |

### 11. Otimização para paralelismo e localidade (pp. 481–564)

- [ ] Capítulo conferido · 84 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 11.1 Conceitos básicos | 481 | 487 | 7 |  |
| 11.2 Multiplicação de matrizes: um exemplo detalhado | 488 | 491 | 4 |  |
| 11.3 Espaços de iteração | 492 | 499 | 8 |  |
| 11.4 Índices de arranjo afins | 500 | 501 | 2 |  |
| 11.5 Reúso de dados | 502 | 508 | 7 |  |
| 11.6 Análise de dependência de dados em arranjos | 509 | 516 | 8 |  |
| 11.7 Encontrando paralelismo sem sincronização | 517 | 532 | 16 |  |
| 11.8 Sincronização entre laços paralelos | 533 | 537 | 5 |  |
| 11.9 Pipelining | 538 | 551 | 14 |  |
| 11.10 Otimizações de localidade | 552 | 557 | 6 |  |
| 11.11 Outros usos das transformações afins | 558 | 564 | 7 |  |

### 12. Análise interprocedimental (pp. 565–602)

- [ ] Capítulo conferido · 38 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 12.1 Conceitos básicos | 565 | 571 | 7 |  |
| 12.2 Por que análise interprocedimental? | 572 | 574 | 3 |  |
| 12.3 Uma representação lógica do fluxo de dados | 575 | 582 | 8 |  |
| 12.4 Um algoritmo simples de análise de apontadores | 583 | 587 | 5 |  |
| 12.5 Análise interprocedimental insensível ao contexto | 588 | 589 | 2 |  |
| 12.6 Análise de apontadores sensível ao contexto | 590 | 593 | 4 |  |
| 12.7 Implementação de Datalog por BDDs | 594 | 602 | 9 |  |

### Apêndice A. Um front-end completo (pp. 603–617)

- [ ] Capítulo conferido · 15 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| A.1 A linguagem fonte | 603 | 603 | 1 |  |
| A.2 Main | 604 | 604 | 1 |  |
| A.3 Analisador léxico | 605 | 605 | 1 |  |
| A.4 Tabelas de símbolos e tipos | 606 | 606 | 1 |  |
| A.5 Código intermediário para expressões | 607 | 607 | 1 |  |
| A.6 Código de desvio para expressões booleanas | 608 | 610 | 3 |  |
| A.7 Código intermediário para comandos | 611 | 612 | 2 |  |
| A.8 Analisador sintático | 613 | 615 | 3 |  |
| A.9 Criando o front-end | 616 | 617 | 2 |  |

### Apêndice B. Encontrando soluções linearmente independentes (pp. 618–620)

- [ ] Capítulo conferido · 3 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| Apêndice B. Encontrando soluções linearmente independentes | 618 | 620 | 3 |  |

---

## Engenharia de Software

- **Autores:** Ian Sommerville
- **Edição:** 10ª ed., Pearson, 2019
- **ISBN:** 978-85-430-2497-4
- **Total de páginas:** 768
- **Arquivo:** `supabase/seed/catalog/engenharia-de-software-sommerville.json`
- **Origem do sumário:** Lista de capítulos da 10ª ed. em inglês (Pearson, 2016), publicada em catálogo de livraria (eCampus). As seções vêm do nosso conhecimento do livro. Nenhuma página foi encontrada: todas foram distribuídas igualmente entre as seções nas cerca de 740 p. de conteúdo da edição em português (estimativa grosseira, conferir tudo). Títulos traduzidos por nós (podem diferir da tradução oficial).

- [ ] Edição e total de páginas conferem
- [ ] Livro conferido

### 1. Introdução (pp. 1–20)

- [ ] Capítulo conferido · 20 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 1.1 Desenvolvimento profissional de software | 1 | 6 | 6 |  |
| 1.2 Ética na engenharia de software | 7 | 13 | 7 |  |
| 1.3 Estudos de caso | 14 | 20 | 7 |  |

### 2. Processos de software (pp. 21–48)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 2.1 Modelos de processo de software | 21 | 27 | 7 |  |
| 2.2 Atividades do processo | 28 | 34 | 7 |  |
| 2.3 Lidando com mudanças | 35 | 41 | 7 |  |
| 2.4 Melhoria de processo | 42 | 48 | 7 |  |

### 3. Desenvolvimento ágil de software (pp. 49–76)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 3.1 Métodos ágeis | 49 | 55 | 7 |  |
| 3.2 Técnicas de desenvolvimento ágil | 56 | 62 | 7 |  |
| 3.3 Gerenciamento ágil de projetos | 63 | 69 | 7 |  |
| 3.4 Escalabilidade dos métodos ágeis | 70 | 76 | 7 |  |

### 4. Engenharia de requisitos (pp. 77–118)

- [ ] Capítulo conferido · 42 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 4.1 Requisitos funcionais e não funcionais | 77 | 83 | 7 |  |
| 4.2 Processos de engenharia de requisitos | 84 | 90 | 7 |  |
| 4.3 Elicitação de requisitos | 91 | 97 | 7 |  |
| 4.4 Especificação de requisitos | 98 | 104 | 7 |  |
| 4.5 Validação de requisitos | 105 | 111 | 7 |  |
| 4.6 Mudança de requisitos | 112 | 118 | 7 |  |

### 5. Modelagem de sistemas (pp. 119–153)

- [ ] Capítulo conferido · 35 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 5.1 Modelos de contexto | 119 | 125 | 7 |  |
| 5.2 Modelos de interação | 126 | 132 | 7 |  |
| 5.3 Modelos estruturais | 133 | 139 | 7 |  |
| 5.4 Modelos comportamentais | 140 | 146 | 7 |  |
| 5.5 Engenharia dirigida por modelos | 147 | 153 | 7 |  |

### 6. Projeto de arquitetura (pp. 154–181)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 6.1 Decisões de projeto de arquitetura | 154 | 160 | 7 |  |
| 6.2 Visões de arquitetura | 161 | 167 | 7 |  |
| 6.3 Padrões de arquitetura | 168 | 174 | 7 |  |
| 6.4 Arquiteturas de aplicações | 175 | 181 | 7 |  |

### 7. Projeto e implementação (pp. 182–209)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 7.1 Projeto orientado a objetos usando a UML | 182 | 188 | 7 |  |
| 7.2 Padrões de projeto | 189 | 195 | 7 |  |
| 7.3 Questões de implementação | 196 | 202 | 7 |  |
| 7.4 Desenvolvimento de código aberto | 203 | 209 | 7 |  |

### 8. Teste de software (pp. 210–237)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 8.1 Teste de desenvolvimento | 210 | 216 | 7 |  |
| 8.2 Desenvolvimento dirigido por testes | 217 | 223 | 7 |  |
| 8.3 Teste de lançamento | 224 | 230 | 7 |  |
| 8.4 Teste de usuário | 231 | 237 | 7 |  |

### 9. Evolução de software (pp. 238–258)

- [ ] Capítulo conferido · 21 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 9.1 Processos de evolução | 238 | 244 | 7 |  |
| 9.2 Sistemas legados | 245 | 251 | 7 |  |
| 9.3 Manutenção de software | 252 | 258 | 7 |  |

### 10. Sistemas confiáveis (pp. 259–293)

- [ ] Capítulo conferido · 35 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 10.1 Propriedades de dependabilidade | 259 | 265 | 7 |  |
| 10.2 Sistemas sociotécnicos | 266 | 272 | 7 |  |
| 10.3 Redundância e diversidade | 273 | 279 | 7 |  |
| 10.4 Processos confiáveis | 280 | 286 | 7 |  |
| 10.5 Métodos formais e dependabilidade | 287 | 293 | 7 |  |

### 11. Engenharia de confiabilidade (pp. 294–328)

- [ ] Capítulo conferido · 35 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 11.1 Disponibilidade e confiabilidade | 294 | 300 | 7 |  |
| 11.2 Requisitos de confiabilidade | 301 | 307 | 7 |  |
| 11.3 Arquiteturas tolerantes a defeitos | 308 | 314 | 7 |  |
| 11.4 Programação para confiabilidade | 315 | 321 | 7 |  |
| 11.5 Medição da confiabilidade | 322 | 328 | 7 |  |

### 12. Engenharia de segurança (safety) (pp. 329–356)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 12.1 Sistemas críticos em segurança | 329 | 335 | 7 |  |
| 12.2 Requisitos de segurança | 336 | 342 | 7 |  |
| 12.3 Processos de engenharia de segurança | 343 | 349 | 7 |  |
| 12.4 Casos de segurança | 350 | 356 | 7 |  |

### 13. Engenharia de segurança da informação (security) (pp. 357–390)

- [ ] Capítulo conferido · 34 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 13.1 Segurança da informação e dependabilidade | 357 | 363 | 7 |  |
| 13.2 Segurança da informação e organizações | 364 | 370 | 7 |  |
| 13.3 Requisitos de segurança da informação | 371 | 376 | 6 |  |
| 13.4 Projeto de sistemas seguros | 377 | 383 | 7 |  |
| 13.5 Teste e garantia de segurança da informação | 384 | 390 | 7 |  |

### 14. Engenharia de resiliência (pp. 391–411)

- [ ] Capítulo conferido · 21 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 14.1 Cibersegurança | 391 | 397 | 7 |  |
| 14.2 Resiliência sociotécnica | 398 | 404 | 7 |  |
| 14.3 Projeto de sistemas resilientes | 405 | 411 | 7 |  |

### 15. Reúso de software (pp. 412–439)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 15.1 O panorama do reúso | 412 | 418 | 7 |  |
| 15.2 Frameworks de aplicação | 419 | 425 | 7 |  |
| 15.3 Linhas de produtos de software | 426 | 432 | 7 |  |
| 15.4 Reúso de sistemas de aplicação | 433 | 439 | 7 |  |

### 16. Engenharia de software baseada em componentes (pp. 440–460)

- [ ] Capítulo conferido · 21 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 16.1 Componentes e modelos de componentes | 440 | 446 | 7 |  |
| 16.2 Processos de CBSE | 447 | 453 | 7 |  |
| 16.3 Composição de componentes | 454 | 460 | 7 |  |

### 17. Engenharia de software distribuído (pp. 461–488)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 17.1 Sistemas distribuídos | 461 | 467 | 7 |  |
| 17.2 Computação cliente-servidor | 468 | 474 | 7 |  |
| 17.3 Padrões de arquitetura para sistemas distribuídos | 475 | 481 | 7 |  |
| 17.4 Software como serviço | 482 | 488 | 7 |  |

### 18. Engenharia de software orientada a serviços (pp. 489–516)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 18.1 Arquitetura orientada a serviços | 489 | 495 | 7 |  |
| 18.2 Serviços RESTful | 496 | 502 | 7 |  |
| 18.3 Engenharia de serviços | 503 | 509 | 7 |  |
| 18.4 Composição de serviços | 510 | 516 | 7 |  |

### 19. Engenharia de sistemas (pp. 517–551)

- [ ] Capítulo conferido · 35 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 19.1 Sistemas sociotécnicos | 517 | 523 | 7 |  |
| 19.2 Projeto conceitual | 524 | 530 | 7 |  |
| 19.3 Aquisição de sistemas | 531 | 537 | 7 |  |
| 19.4 Desenvolvimento de sistemas | 538 | 544 | 7 |  |
| 19.5 Operação e evolução de sistemas | 545 | 551 | 7 |  |

### 20. Sistemas de sistemas (pp. 552–586)

- [ ] Capítulo conferido · 35 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 20.1 Complexidade de sistemas | 552 | 558 | 7 |  |
| 20.2 Classificação de sistemas de sistemas | 559 | 565 | 7 |  |
| 20.3 Reducionismo e sistemas complexos | 566 | 572 | 7 |  |
| 20.4 Engenharia de sistemas de sistemas | 573 | 579 | 7 |  |
| 20.5 Arquitetura de sistemas de sistemas | 580 | 586 | 7 |  |

### 21. Engenharia de software de tempo real (pp. 587–614)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 21.1 Projeto de sistemas embarcados | 587 | 593 | 7 |  |
| 21.2 Padrões de arquitetura para software de tempo real | 594 | 600 | 7 |  |
| 21.3 Análise de temporização | 601 | 607 | 7 |  |
| 21.4 Sistemas operacionais de tempo real | 608 | 614 | 7 |  |

### 22. Gerenciamento de projetos (pp. 615–635)

- [ ] Capítulo conferido · 21 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 22.1 Gerenciamento de riscos | 615 | 621 | 7 |  |
| 22.2 Gerenciamento de pessoas | 622 | 628 | 7 |  |
| 22.3 Trabalho em equipe | 629 | 635 | 7 |  |

### 23. Planejamento de projetos (pp. 636–677)

- [ ] Capítulo conferido · 42 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 23.1 Precificação de software | 636 | 642 | 7 |  |
| 23.2 Desenvolvimento dirigido por planos | 643 | 649 | 7 |  |
| 23.3 Cronograma do projeto | 650 | 656 | 7 |  |
| 23.4 Planejamento ágil | 657 | 663 | 7 |  |
| 23.5 Técnicas de estimativa | 664 | 670 | 7 |  |
| 23.6 Modelagem de custos COCOMO | 671 | 677 | 7 |  |

### 24. Gerenciamento da qualidade (pp. 678–712)

- [ ] Capítulo conferido · 35 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 24.1 Qualidade de software | 678 | 684 | 7 |  |
| 24.2 Padrões de software | 685 | 691 | 7 |  |
| 24.3 Revisões e inspeções | 692 | 698 | 7 |  |
| 24.4 Gerenciamento da qualidade e desenvolvimento ágil | 699 | 705 | 7 |  |
| 24.5 Medição de software | 706 | 712 | 7 |  |

### 25. Gerenciamento de configuração (pp. 713–740)

- [ ] Capítulo conferido · 28 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 25.1 Gerenciamento de versões | 713 | 719 | 7 |  |
| 25.2 Construção de sistemas | 720 | 726 | 7 |  |
| 25.3 Gerenciamento de mudanças | 727 | 733 | 7 |  |
| 25.4 Gerenciamento de lançamentos | 734 | 740 | 7 |  |

---

## Processamento Digital de Imagens

- **Autores:** Rafael C. Gonzalez, Richard E. Woods
- **Edição:** 3ª ed., Pearson Prentice Hall, 2010
- **ISBN:** 978-85-7605-401-6
- **Total de páginas:** 624
- **Arquivo:** `supabase/seed/catalog/processamento-imagens-gonzalez-woods.json`
- **Origem do sumário:** Estrutura e páginas do sumário da 3ª ed. em inglês (Pearson Prentice Hall, 2008), publicado pelos autores (páginas iniciais do livro). Páginas convertidas proporcionalmente para as 624 p. da edição em português; títulos traduzidos por nós (podem diferir da tradução oficial).

- [ ] Edição e total de páginas conferem
- [ ] Livro conferido

### 1. Introdução (pp. 1–23)

- [ ] Capítulo conferido · 23 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 1.1 O que é processamento digital de imagens? | 1 | 1 | 1 |  |
| 1.2 As origens do processamento digital de imagens | 2 | 3 | 2 |  |
| 1.3 Exemplos de áreas que usam o processamento digital de imagens | 4 | 15 | 12 |  |
| 1.4 Passos fundamentais em processamento digital de imagens | 16 | 17 | 2 |  |
| 1.5 Componentes de um sistema de processamento de imagens | 18 | 23 | 6 |  |

### 2. Fundamentos da imagem digital (pp. 24–68)

- [ ] Capítulo conferido · 45 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 2.1 Elementos da percepção visual | 24 | 27 | 4 |  |
| 2.2 Luz e o espectro eletromagnético | 28 | 29 | 2 |  |
| 2.3 Sensoriamento e aquisição de imagens | 30 | 33 | 4 |  |
| 2.4 Amostragem e quantização de imagens | 34 | 44 | 11 |  |
| 2.5 Alguns relacionamentos básicos entre pixels | 45 | 46 | 2 |  |
| 2.6 Introdução às ferramentas matemáticas usadas no processamento digital de imagens | 47 | 68 | 22 |  |

### 3. Transformações de intensidade e filtragem espacial (pp. 69–131)

- [ ] Capítulo conferido · 63 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 3.1 Conceitos básicos | 69 | 69 | 1 |  |
| 3.2 Algumas funções básicas de transformação de intensidade | 70 | 78 | 9 |  |
| 3.3 Processamento de histograma | 79 | 94 | 16 |  |
| 3.4 Fundamentos da filtragem espacial | 95 | 99 | 5 |  |
| 3.5 Filtros espaciais de suavização | 100 | 102 | 3 |  |
| 3.6 Filtros espaciais de aguçamento | 103 | 110 | 8 |  |
| 3.7 Combinando métodos de realce espacial | 111 | 113 | 3 |  |
| 3.8 Técnicas fuzzy para transformações de intensidade e filtragem espacial | 114 | 131 | 18 |  |

### 4. Filtragem no domínio da frequência (pp. 132–205)

- [ ] Capítulo conferido · 74 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 4.1 Conceitos básicos | 132 | 132 | 1 |  |
| 4.2 Conceitos preliminares | 133 | 138 | 6 |  |
| 4.3 Amostragem e a transformada de Fourier de funções amostradas | 139 | 144 | 6 |  |
| 4.4 A transformada discreta de Fourier (DFT) de uma variável | 145 | 147 | 3 |  |
| 4.5 Extensão para funções de duas variáveis | 148 | 155 | 8 |  |
| 4.6 Algumas propriedades da DFT 2-D | 156 | 167 | 12 |  |
| 4.7 Fundamentos da filtragem no domínio da frequência | 168 | 176 | 9 |  |
| 4.8 Suavização de imagens usando filtros no domínio da frequência | 177 | 184 | 8 |  |
| 4.9 Aguçamento de imagens usando filtros no domínio da frequência | 185 | 193 | 9 |  |
| 4.10 Filtragem seletiva | 194 | 195 | 2 |  |
| 4.11 Implementação | 196 | 205 | 10 |  |

### 5. Restauração e reconstrução de imagens (pp. 206–259)

- [ ] Capítulo conferido · 54 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 5.1 Modelo do processo de degradação/restauração de imagens | 206 | 206 | 1 |  |
| 5.2 Modelos de ruído | 207 | 211 | 5 |  |
| 5.3 Restauração na presença somente de ruído: filtragem espacial | 212 | 220 | 9 |  |
| 5.4 Redução de ruído periódico por filtragem no domínio da frequência | 221 | 225 | 5 |  |
| 5.5 Degradações lineares e invariantes no espaço | 226 | 227 | 2 |  |
| 5.6 Estimativa da função de degradação | 228 | 230 | 3 |  |
| 5.7 Filtragem inversa | 231 | 231 | 1 |  |
| 5.8 Filtragem por mínimos quadrados médios (Wiener) | 232 | 234 | 3 |  |
| 5.9 Filtragem por mínimos quadrados com restrição | 235 | 237 | 3 |  |
| 5.10 Filtro de média geométrica | 238 | 238 | 1 |  |
| 5.11 Reconstrução de imagens a partir de projeções | 239 | 259 | 21 |  |

### 6. Processamento de imagens coloridas (pp. 260–304)

- [ ] Capítulo conferido · 45 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 6.1 Fundamentos das cores | 260 | 263 | 4 |  |
| 6.2 Modelos de cores | 264 | 272 | 9 |  |
| 6.3 Processamento de imagens em pseudocores | 273 | 279 | 7 |  |
| 6.4 Fundamentos do processamento de imagens coloridas | 280 | 280 | 1 |  |
| 6.5 Transformações de cores | 281 | 288 | 8 |  |
| 6.6 Suavização e aguçamento | 289 | 291 | 3 |  |
| 6.7 Segmentação de imagens baseada em cores | 292 | 296 | 5 |  |
| 6.8 Ruído em imagens coloridas | 297 | 298 | 2 |  |
| 6.9 Compressão de imagens coloridas | 299 | 304 | 6 |  |

### 7. Wavelets e processamento em multirresolução (pp. 305–346)

- [ ] Capítulo conferido · 42 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 7.1 Conceitos básicos | 305 | 314 | 10 |  |
| 7.2 Expansões em multirresolução | 315 | 319 | 5 |  |
| 7.3 Transformadas wavelet em uma dimensão | 320 | 324 | 5 |  |
| 7.4 A transformada wavelet rápida | 325 | 329 | 5 |  |
| 7.5 Transformadas wavelet em duas dimensões | 330 | 335 | 6 |  |
| 7.6 Pacotes wavelet | 336 | 346 | 11 |  |

### 8. Compressão de imagens (pp. 347–413)

- [ ] Capítulo conferido · 67 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 8.1 Fundamentos | 347 | 356 | 10 |  |
| 8.2 Alguns métodos básicos de compressão | 357 | 404 | 48 |  |
| 8.3 Marca d'água em imagens digitais | 405 | 413 | 9 |  |

### 9. Processamento morfológico de imagens (pp. 414–454)

- [ ] Capítulo conferido · 41 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 9.1 Preliminares | 414 | 414 | 1 |  |
| 9.2 Erosão e dilatação | 415 | 418 | 4 |  |
| 9.3 Abertura e fechamento | 419 | 421 | 3 |  |
| 9.4 A transformada hit-or-miss | 422 | 422 | 1 |  |
| 9.5 Alguns algoritmos morfológicos básicos | 423 | 438 | 16 |  |
| 9.6 Morfologia em níveis de cinza | 439 | 454 | 16 |  |

### 10. Segmentação de imagens (pp. 455–524)

- [ ] Capítulo conferido · 70 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 10.1 Fundamentos | 455 | 455 | 1 |  |
| 10.2 Detecção de pontos, linhas e bordas | 456 | 486 | 31 |  |
| 10.3 Limiarização | 487 | 502 | 16 |  |
| 10.4 Segmentação baseada em regiões | 503 | 506 | 4 |  |
| 10.5 Segmentação usando watersheds morfológicos | 507 | 512 | 6 |  |
| 10.6 O uso do movimento na segmentação | 513 | 524 | 12 |  |

### 11. Representação e descrição (pp. 525–567)

- [ ] Capítulo conferido · 43 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 11.1 Representação | 525 | 536 | 12 |  |
| 11.2 Descritores de fronteira | 537 | 541 | 5 |  |
| 11.3 Descritores regionais | 542 | 554 | 13 |  |
| 11.4 Uso de componentes principais para descrição | 555 | 561 | 7 |  |
| 11.5 Descritores relacionais | 562 | 567 | 6 |  |

### 12. Reconhecimento de objetos (pp. 568–600)

- [ ] Capítulo conferido · 33 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 12.1 Padrões e classes de padrões | 568 | 570 | 3 |  |
| 12.2 Reconhecimento baseado em métodos de decisão teórica | 571 | 595 | 25 |  |
| 12.3 Métodos estruturais | 596 | 600 | 5 |  |

---

## Redes de Computadores e a Internet: uma abordagem top-down

- **Autores:** James F. Kurose, Keith W. Ross
- **Edição:** 8ª ed., Bookman, 2021
- **ISBN:** 978-85-8260-558-5
- **Total de páginas:** 632
- **Arquivo:** `supabase/seed/catalog/redes-kurose-ross.json`
- **Origem do sumário:** Estrutura e páginas do sumário da 8ª ed. em inglês (Global Edition, Pearson 2021), digitalizado pela Biblioteca Central de Zurique. Páginas convertidas proporcionalmente para as 632 p. da edição em português; títulos traduzidos por nós (podem diferir da tradução oficial).

- [ ] Edição e total de páginas conferem
- [ ] Livro conferido

### 1. Redes de computadores e a Internet (pp. 1–69)

- [ ] Capítulo conferido · 69 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 1.1 O que é a Internet? | 1 | 6 | 6 |  |
| 1.2 A periferia da rede | 7 | 17 | 11 |  |
| 1.3 O núcleo da rede | 18 | 28 | 11 |  |
| 1.4 Atraso, perda e vazão em redes de comutação de pacotes | 29 | 38 | 10 |  |
| 1.5 Camadas de protocolos e seus modelos de serviço | 39 | 44 | 6 |  |
| 1.6 Redes sob ataque | 45 | 48 | 4 |  |
| 1.7 História das redes de computadores e da Internet | 49 | 69 | 21 |  |

### 2. Camada de aplicação (pp. 70–155)

- [ ] Capítulo conferido · 86 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 2.1 Princípios de aplicações de rede | 70 | 80 | 11 |  |
| 2.2 A Web e o HTTP | 81 | 98 | 18 |  |
| 2.3 Correio eletrônico na Internet | 99 | 103 | 5 |  |
| 2.4 DNS: o serviço de diretório da Internet | 104 | 115 | 12 |  |
| 2.5 Distribuição de arquivos P2P | 116 | 121 | 6 |  |
| 2.6 Streaming de vídeo e redes de distribuição de conteúdo | 122 | 129 | 8 |  |
| 2.7 Programação de sockets: criando aplicações de rede | 130 | 155 | 26 |  |

### 3. Camada de transporte (pp. 156–260)

- [ ] Capítulo conferido · 105 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 3.1 Introdução e serviços da camada de transporte | 156 | 159 | 4 |  |
| 3.2 Multiplexação e demultiplexação | 160 | 165 | 6 |  |
| 3.3 Transporte não orientado a conexão: UDP | 166 | 170 | 5 |  |
| 3.4 Princípios da transferência confiável de dados | 171 | 194 | 24 |  |
| 3.5 Transporte orientado a conexão: TCP | 195 | 218 | 24 |  |
| 3.6 Princípios de controle de congestionamento | 219 | 225 | 7 |  |
| 3.7 Controle de congestionamento do TCP | 226 | 239 | 14 |  |
| 3.8 Evolução da funcionalidade da camada de transporte | 240 | 260 | 21 |  |

### 4. A camada de rede: plano de dados (pp. 261–324)

- [ ] Capítulo conferido · 64 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 4.1 Visão geral da camada de rede | 261 | 266 | 6 |  |
| 4.2 O que há dentro de um roteador? | 267 | 283 | 17 |  |
| 4.3 O protocolo IP: IPv4, endereçamento, IPv6 e mais | 284 | 303 | 20 |  |
| 4.4 Repasse generalizado e SDN | 304 | 309 | 6 |  |
| 4.5 Middleboxes | 310 | 324 | 15 |  |

### 5. A camada de rede: plano de controle (pp. 325–386)

- [ ] Capítulo conferido · 62 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 5.1 Introdução | 325 | 326 | 2 |  |
| 5.2 Algoritmos de roteamento | 327 | 339 | 13 |  |
| 5.3 Roteamento intra-AS na Internet: OSPF | 340 | 342 | 3 |  |
| 5.4 Roteamento entre os ISPs: BGP | 343 | 353 | 11 |  |
| 5.5 O plano de controle SDN | 354 | 363 | 10 |  |
| 5.6 ICMP: o protocolo de mensagens de controle da Internet | 364 | 365 | 2 |  |
| 5.7 Gerenciamento de rede, SNMP e NETCONF/YANG | 366 | 386 | 21 |  |

### 6. A camada de enlace e as redes locais (pp. 387–457)

- [ ] Capítulo conferido · 71 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 6.1 Introdução à camada de enlace | 387 | 390 | 4 |  |
| 6.2 Técnicas de detecção e correção de erros | 391 | 396 | 6 |  |
| 6.3 Enlaces e protocolos de acesso múltiplo | 397 | 410 | 14 |  |
| 6.4 Redes locais comutadas | 411 | 430 | 20 |  |
| 6.5 Virtualização de enlace: uma rede como camada de enlace | 431 | 434 | 4 |  |
| 6.6 Redes de data centers | 435 | 440 | 6 |  |
| 6.7 Retrospectiva: um dia na vida de uma requisição de página Web | 441 | 457 | 17 |  |

### 7. Redes sem fio e redes móveis (pp. 458–523)

- [ ] Capítulo conferido · 66 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 7.1 Introdução | 458 | 461 | 4 |  |
| 7.2 Enlaces sem fio e características das redes | 462 | 466 | 5 |  |
| 7.3 WiFi: LANs sem fio 802.11 | 467 | 484 | 18 |  |
| 7.4 Redes celulares: 4G e 5G | 485 | 497 | 13 |  |
| 7.5 Gerenciamento de mobilidade: princípios | 498 | 505 | 8 |  |
| 7.6 Gerenciamento de mobilidade na prática | 506 | 511 | 6 |  |
| 7.7 Redes sem fio e mobilidade: impacto nos protocolos das camadas superiores | 512 | 523 | 12 |  |

### 8. Segurança em redes de computadores (pp. 524–595)

- [ ] Capítulo conferido · 72 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 8.1 O que é segurança de rede? | 524 | 524 | 1 |  |
| 8.2 Princípios de criptografia | 525 | 537 | 13 |  |
| 8.3 Integridade de mensagens e assinaturas digitais | 538 | 545 | 8 |  |
| 8.4 Autenticação do ponto final | 546 | 549 | 4 |  |
| 8.5 Protegendo o e-mail | 550 | 554 | 5 |  |
| 8.6 Protegendo conexões TCP: TLS | 555 | 560 | 6 |  |
| 8.7 Segurança na camada de rede: IPsec e redes privadas virtuais | 561 | 567 | 7 |  |
| 8.8 Segurança em LANs sem fio e redes celulares 4G/5G | 568 | 574 | 7 |  |
| 8.9 Segurança operacional: firewalls e sistemas de detecção de intrusão | 575 | 595 | 21 |  |

---

## Redes de Computadores

- **Autores:** Andrew S. Tanenbaum, Nick Feamster, David J. Wetherall
- **Edição:** 6ª ed., Bookman, 2021
- **ISBN:** a confirmar
- **Total de páginas:** a confirmar
- **Arquivo:** `supabase/seed/catalog/redes-tanenbaum-feamster-wetherall.json`
- **Origem do sumário:** Capítulos e seções da 6ª ed. em inglês (Pearson, 2021) vêm do nosso conhecimento do livro, conferidos em parte com a descrição da Pearson. Nenhuma página foi encontrada: a página inicial de cada capítulo foi estimada por proporção (cerca de 600 p. de conteúdo) e as seções foram distribuídas igualmente dentro de cada capítulo (estimativa grosseira, conferir tudo). Total de páginas e ISBN da edição em português a confirmar. Títulos traduzidos por nós (podem diferir da tradução oficial).

- [ ] Edição e total de páginas conferem
- [ ] Livro conferido

### 1. Introdução (pp. 1–66)

- [ ] Capítulo conferido · 66 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 1.1 Usos das redes de computadores | 1 | 7 | 7 |  |
| 1.2 Tipos de redes de computadores | 8 | 14 | 7 |  |
| 1.3 Tecnologia de redes, do local ao global | 15 | 22 | 8 |  |
| 1.4 Exemplos de redes | 23 | 29 | 7 |  |
| 1.5 Protocolos de rede | 30 | 36 | 7 |  |
| 1.6 Modelos de referência | 37 | 44 | 8 |  |
| 1.7 Padronização | 45 | 51 | 7 |  |
| 1.8 Questões políticas, legais e sociais | 52 | 58 | 7 |  |
| 1.9 Unidades métricas | 59 | 66 | 8 |  |

### 2. A camada física (pp. 67–144)

- [ ] Capítulo conferido · 78 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 2.1 Meios de transmissão guiados | 67 | 73 | 7 |  |
| 2.2 Transmissão sem fio | 74 | 81 | 8 |  |
| 2.3 Uso do espectro para transmissão | 82 | 89 | 8 |  |
| 2.4 De formas de onda a bits | 90 | 97 | 8 |  |
| 2.5 A rede pública de telefonia comutada | 98 | 105 | 8 |  |
| 2.6 Redes celulares | 106 | 112 | 7 |  |
| 2.7 Redes a cabo | 113 | 120 | 8 |  |
| 2.8 Satélites de comunicação | 121 | 128 | 8 |  |
| 2.9 Comparação entre redes de acesso | 129 | 136 | 8 |  |
| 2.10 Políticas na camada física | 137 | 144 | 8 |  |

### 3. A camada de enlace de dados (pp. 145–192)

- [ ] Capítulo conferido · 48 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 3.1 Questões de projeto da camada de enlace de dados | 145 | 153 | 9 |  |
| 3.2 Detecção e correção de erros | 154 | 163 | 10 |  |
| 3.3 Protocolos elementares de enlace de dados | 164 | 172 | 9 |  |
| 3.4 Melhorando a eficiência | 173 | 182 | 10 |  |
| 3.5 Protocolos de enlace de dados na prática | 183 | 192 | 10 |  |

### 4. A subcamada de controle de acesso ao meio (pp. 193–252)

- [ ] Capítulo conferido · 60 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 4.1 O problema da alocação de canais | 193 | 200 | 8 |  |
| 4.2 Protocolos de acesso múltiplo | 201 | 209 | 9 |  |
| 4.3 Ethernet | 210 | 217 | 8 |  |
| 4.4 Redes locais sem fio | 218 | 226 | 9 |  |
| 4.5 Bluetooth | 227 | 234 | 8 |  |
| 4.6 DOCSIS | 235 | 243 | 9 |  |
| 4.7 Comutação na camada de enlace de dados | 244 | 252 | 9 |  |

### 5. A camada de rede (pp. 253–348)

- [ ] Capítulo conferido · 96 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 5.1 Questões de projeto da camada de rede | 253 | 264 | 12 |  |
| 5.2 Algoritmos de roteamento em uma única rede | 265 | 276 | 12 |  |
| 5.3 Gerenciamento de tráfego na camada de rede | 277 | 288 | 12 |  |
| 5.4 Qualidade de serviço e qualidade de experiência das aplicações | 289 | 300 | 12 |  |
| 5.5 Interligação de redes | 301 | 312 | 12 |  |
| 5.6 Redes definidas por software | 313 | 324 | 12 |  |
| 5.7 A camada de rede na Internet | 325 | 336 | 12 |  |
| 5.8 Políticas na camada de rede | 337 | 348 | 12 |  |

### 6. A camada de transporte (pp. 349–426)

- [ ] Capítulo conferido · 78 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 6.1 O serviço de transporte | 349 | 359 | 11 |  |
| 6.2 Elementos dos protocolos de transporte | 360 | 370 | 11 |  |
| 6.3 Controle de congestionamento | 371 | 381 | 11 |  |
| 6.4 Os protocolos de transporte da Internet: UDP | 382 | 392 | 11 |  |
| 6.5 Os protocolos de transporte da Internet: TCP | 393 | 403 | 11 |  |
| 6.6 Protocolos de transporte e controle de congestionamento | 404 | 414 | 11 |  |
| 6.7 Questões de desempenho | 415 | 426 | 12 |  |

### 7. A camada de aplicação (pp. 427–504)

- [ ] Capítulo conferido · 78 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 7.1 O sistema de nomes de domínio (DNS) | 427 | 441 | 15 |  |
| 7.2 Correio eletrônico | 442 | 457 | 16 |  |
| 7.3 A World Wide Web | 458 | 472 | 15 |  |
| 7.4 Streaming de áudio e vídeo | 473 | 488 | 16 |  |
| 7.5 Entrega de conteúdo | 489 | 504 | 16 |  |

### 8. Segurança de redes (pp. 505–600)

- [ ] Capítulo conferido · 96 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 8.1 Fundamentos de segurança de redes | 505 | 511 | 7 |  |
| 8.2 Os ingredientes principais de um ataque | 512 | 518 | 7 |  |
| 8.3 Firewalls e sistemas de detecção de intrusão | 519 | 526 | 8 |  |
| 8.4 Criptografia | 527 | 533 | 7 |  |
| 8.5 Algoritmos de chave simétrica | 534 | 540 | 7 |  |
| 8.6 Algoritmos de chave pública | 541 | 548 | 8 |  |
| 8.7 Assinaturas digitais | 549 | 555 | 7 |  |
| 8.8 Gerenciamento de chaves públicas | 556 | 563 | 8 |  |
| 8.9 Protocolos de autenticação | 564 | 570 | 7 |  |
| 8.10 Segurança da comunicação | 571 | 577 | 7 |  |
| 8.11 Segurança de e-mail | 578 | 585 | 8 |  |
| 8.12 Segurança da Web | 586 | 592 | 7 |  |
| 8.13 Questões sociais | 593 | 600 | 8 |  |

---

## Sistemas Distribuídos: Princípios e Paradigmas

- **Autores:** Andrew S. Tanenbaum, Maarten van Steen
- **Edição:** 2ª ed., Pearson Prentice Hall, 2007
- **ISBN:** a confirmar
- **Total de páginas:** 402
- **Arquivo:** `supabase/seed/catalog/sistemas-distribuidos-tanenbaum-van-steen.json`
- **Origem do sumário:** Estrutura e páginas do sumário da 2ª ed. em inglês (Prentice Hall, 2007), publicado em catálogo de livraria (eCampus). Páginas convertidas proporcionalmente para as 402 p. da edição em português; títulos traduzidos por nós (podem diferir da tradução oficial). Total de páginas e ISBN a confirmar.

- [ ] Edição e total de páginas conferem
- [ ] Livro conferido

### 1. Introdução (pp. 1–20)

- [ ] Capítulo conferido · 20 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 1.1 Definição de sistema distribuído | 1 | 1 | 1 |  |
| 1.2 Metas | 2 | 10 | 9 |  |
| 1.3 Tipos de sistemas distribuídos | 11 | 20 | 10 |  |

### 2. Arquiteturas (pp. 21–43)

- [ ] Capítulo conferido · 23 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 2.1 Estilos arquitetônicos | 21 | 21 | 1 |  |
| 2.2 Arquiteturas de sistemas | 22 | 33 | 12 |  |
| 2.3 Arquiteturas versus middleware | 34 | 36 | 3 |  |
| 2.4 Autogerenciamento em sistemas distribuídos | 37 | 43 | 7 |  |

### 3. Processos (pp. 44–72)

- [ ] Capítulo conferido · 29 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 3.1 Threads | 44 | 48 | 5 |  |
| 3.2 Virtualização | 49 | 50 | 2 |  |
| 3.3 Clientes | 51 | 54 | 4 |  |
| 3.4 Servidores | 55 | 63 | 9 |  |
| 3.5 Migração de código | 64 | 72 | 9 |  |

### 4. Comunicação (pp. 73–112)

- [ ] Capítulo conferido · 40 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 4.1 Fundamentos | 73 | 77 | 5 |  |
| 4.2 Chamada de procedimento remoto | 78 | 87 | 10 |  |
| 4.3 Comunicação orientada a mensagens | 88 | 97 | 10 |  |
| 4.4 Comunicação orientada a fluxo | 98 | 103 | 6 |  |
| 4.5 Comunicação multicast | 104 | 112 | 9 |  |

### 5. Nomeação (pp. 113–144)

- [ ] Capítulo conferido · 32 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 5.1 Nomes, identificadores e endereços | 113 | 113 | 1 |  |
| 5.2 Nomeação simples | 114 | 121 | 8 |  |
| 5.3 Nomeação estruturada | 122 | 135 | 14 |  |
| 5.4 Nomeação baseada em atributos | 136 | 144 | 9 |  |

### 6. Sincronização (pp. 145–171)

- [ ] Capítulo conferido · 27 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 6.1 Sincronização de relógios | 145 | 152 | 8 |  |
| 6.2 Relógios lógicos | 153 | 157 | 5 |  |
| 6.3 Exclusão mútua | 158 | 162 | 5 |  |
| 6.4 Posicionamento global de nós | 163 | 164 | 2 |  |
| 6.5 Algoritmos de eleição | 165 | 171 | 7 |  |

### 7. Consistência e replicação (pp. 172–201)

- [ ] Capítulo conferido · 30 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 7.1 Introdução | 172 | 172 | 1 |  |
| 7.2 Modelos de consistência centrados em dados | 173 | 179 | 7 |  |
| 7.3 Modelos de consistência centrados no cliente | 180 | 184 | 5 |  |
| 7.4 Gerenciamento de réplicas | 185 | 191 | 7 |  |
| 7.5 Protocolos de consistência | 192 | 201 | 10 |  |

### 8. Tolerância a falha (pp. 202–236)

- [ ] Capítulo conferido · 35 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 8.1 Introdução à tolerância a falha | 202 | 204 | 3 |  |
| 8.2 Resiliência de processo | 205 | 209 | 5 |  |
| 8.3 Comunicação confiável cliente-servidor | 210 | 214 | 5 |  |
| 8.4 Comunicação confiável de grupo | 215 | 221 | 7 |  |
| 8.5 Comprometimento distribuído | 222 | 226 | 5 |  |
| 8.6 Recuperação | 227 | 236 | 10 |  |

### 9. Segurança (pp. 237–276)

- [ ] Capítulo conferido · 40 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 9.1 Introdução à segurança | 237 | 247 | 11 |  |
| 9.2 Canais seguros | 248 | 258 | 11 |  |
| 9.3 Controle de acesso | 259 | 267 | 9 |  |
| 9.4 Gerenciamento da segurança | 268 | 276 | 9 |  |

### 10. Sistemas distribuídos baseados em objetos (pp. 277–306)

- [ ] Capítulo conferido · 30 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 10.1 Arquitetura | 277 | 281 | 5 |  |
| 10.2 Processos | 282 | 285 | 4 |  |
| 10.3 Comunicação | 286 | 291 | 6 |  |
| 10.4 Nomeação | 292 | 293 | 2 |  |
| 10.5 Sincronização | 294 | 295 | 2 |  |
| 10.6 Consistência e replicação | 296 | 298 | 3 |  |
| 10.7 Tolerância a falha | 299 | 300 | 2 |  |
| 10.8 Segurança | 301 | 306 | 6 |  |

### 11. Sistemas de arquivos distribuídos (pp. 307–341)

- [ ] Capítulo conferido · 35 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 11.1 Arquitetura | 307 | 313 | 7 |  |
| 11.2 Processos | 314 | 314 | 1 |  |
| 11.3 Comunicação | 315 | 316 | 2 |  |
| 11.4 Nomeação | 317 | 320 | 4 |  |
| 11.5 Sincronização | 321 | 324 | 4 |  |
| 11.6 Consistência e replicação | 325 | 330 | 6 |  |
| 11.7 Tolerância a falha | 331 | 332 | 2 |  |
| 11.8 Segurança | 333 | 341 | 9 |  |

### 12. Sistemas distribuídos baseados na Web (pp. 342–368)

- [ ] Capítulo conferido · 27 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 12.1 Arquitetura | 342 | 346 | 5 |  |
| 12.2 Processos | 347 | 350 | 4 |  |
| 12.3 Comunicação | 351 | 354 | 4 |  |
| 12.4 Nomeação | 355 | 355 | 1 |  |
| 12.5 Sincronização | 356 | 356 | 1 |  |
| 12.6 Consistência e replicação | 357 | 363 | 7 |  |
| 12.7 Tolerância a falha | 364 | 365 | 2 |  |
| 12.8 Segurança | 366 | 368 | 3 |  |

### 13. Sistemas distribuídos baseados em coordenação (pp. 369–390)

- [ ] Capítulo conferido · 22 páginas

| Tópico | Início | Fim | Págs. | Correção |
|---|---|---|---|---|
| 13.1 Introdução a modelos de coordenação | 369 | 369 | 1 |  |
| 13.2 Arquiteturas | 370 | 375 | 6 |  |
| 13.3 Processos | 376 | 376 | 1 |  |
| 13.4 Comunicação | 377 | 377 | 1 |  |
| 13.5 Nomeação | 378 | 379 | 2 |  |
| 13.6 Sincronização | 380 | 380 | 1 |  |
| 13.7 Consistência e replicação | 381 | 383 | 3 |  |
| 13.8 Tolerância a falha | 384 | 385 | 2 |  |
| 13.9 Segurança | 386 | 390 | 5 |  |

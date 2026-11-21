# TuxForge — Monte seu PC

Jogo de cruzadinha de **Arquitetura Computacional** feito em HTML, CSS e JavaScript puros.
Você resolve a cruzadinha, aprende o conceito de cada termo, responde a um quiz e usa o dinheiro que ganhou
para **montar o seu computador**, peça por peça.

🔗 **Jogue aqui:** https://giovann-carneiro.github.io/tuxforge/

## Como jogar

1. Clique numa casa (ou numa pista) e **digite as letras direto no tabuleiro**. Clique de novo numa casa de cruzamento, ou use a barra de espaço, para alternar entre horizontal e vertical. As setas e o Tab também funcionam.
2. Aperte **✔ Conferir** (ou Enter). As palavras certas ficam verdes e travam, as erradas ficam vermelhas, e o contador mostra quantas você já acertou (por exemplo, "4 de 6 palavras").
3. A cada palavra certa aparece uma **descrição do termo** e, em seguida, uma **pergunta de múltipla escolha** sobre ele. Acertar a pergunta dá bônus de R$ 500.
4. Depois vem a **loja**: gaste o dinheiro numa peça para o seu PC. A **velocidade** da resposta define a qualidade das peças liberadas:

| Resposta | Peças liberadas | Dinheiro |
|---|---|---|
| 🥇 Rápida, sem dica | Até **Ouro** (RAM de 1 TB, GPU de 48 GB...) | R$ 1100 |
| 🥈 Tempo médio | Até **Prata** | R$ 700 |
| 🥉 Lenta, ou com **💡 Dica** | Só **Bronze** (RAM de 8 GB...) | R$ 400 |

   O tempo conta desde o seu último acerto. Peças melhores custam mais caro, então é preciso decidir entre gastar agora ou guardar o dinheiro. Ao trocar uma peça, você recebe de volta 50% do preço da antiga.
5. **⟲ Reiniciar** limpa o tabuleiro do nível e devolve seu saldo e suas peças ao que eram no começo do nível.
6. Ao final dos 3 níveis, o seu PC recebe uma pontuação e um título, de "Calculadora de bolso" a "Supercomputador".

## Níveis e dificuldade

| Nível | Tema | Ajuda | Ouro até | Dica | Erro no Conferir |
|---|---|---|---|---|---|
| 1 · Power On (Fácil) | Primeiros circuitos: o processador e as memórias básicas. | 1ª letra revelada | 45 s | R$ 100 | grátis |
| 2 · BIOS (Médio) | Memórias especiais e os caminhos que ligam tudo. | nenhuma | 40 s | R$ 200 | −R$ 150 |
| 3 · Kernel (Difícil) | O desafio final: sem letras de ajuda e com erros caros. | nenhuma | 45 s | R$ 300 | −R$ 300 |

## Peças do computador

| Encaixe | Peças (Bronze · Prata · Ouro) |
|---|---|
| Gabinete | Gabinete básico (R$ 150) · Mid tower com vidro (R$ 450) · Full tower RGB (R$ 1.200) |
| Placa-mãe | Placa-mãe básica (R$ 300) · Placa-mãe avançada (R$ 800) · Placa-mãe extreme (R$ 2.000) |
| Processador | CPU dual core 2,4 GHz (R$ 250) · CPU quad core 3,6 GHz (R$ 1.000) · CPU 24 núcleos 5,8 GHz (R$ 3.500) |
| Memória RAM | RAM 8 GB (R$ 150) · RAM 64 GB (R$ 900) · RAM 1 TB (R$ 4.000) |
| Armazenamento | HD 500 GB (R$ 150) · SSD NVMe 1 TB (R$ 500) · SSD NVMe 8 TB (R$ 1.800) |
| Placa de vídeo | GPU 4 GB (R$ 400) · GPU 12 GB (R$ 1.500) · GPU 48 GB (R$ 4.500) |
| Fonte | Fonte 300 W (R$ 100) · Fonte 650 W (R$ 350) · Fonte 1600 W (R$ 900) |
| Cooler | Cooler de fábrica (R$ 60) · Water cooler 240 mm (R$ 250) · Refrigeração líquida custom (R$ 700) |

## Palavras e pistas

As 16 palavras da lista são usadas, distribuídas em 3 tabuleiros, e em cada um todas as palavras se cruzam.

### Nível 1: Power On (Fácil)

| Nº | Dir. | Resposta | Pista |
|---|---|---|---|
| 1 | Horizontal | UC | Parte da CPU que decodifica instruções e comanda o que cada circuito deve fazer. |
| 2 | Vertical | CPU | Cérebro do computador: busca, interpreta e executa as instruções dos programas. |
| 3 | Vertical | DMA | Recurso que deixa periféricos trocarem dados com a RAM sem sobrecarregar a CPU. |
| 4 | Vertical | RAM | Área de trabalho principal do computador: veloz, mas esvazia sem energia. |
| 4 | Horizontal | ROM | Guarda de fábrica o programa de inicialização e mantém tudo mesmo sem energia. |
| 5 | Horizontal | ULA | Parte da CPU que faz as contas e as operações lógicas. |

### Nível 2: BIOS (Médio)

| Nº | Dir. | Resposta | Pista |
|---|---|---|---|
| 1 | Vertical | CACHE | Pequena e rapidíssima, fica junto da CPU guardando o que ela usa com mais frequência. |
| 2 | Horizontal | DATA BUS | Caminho por onde viajam os valores lidos e escritos entre CPU e memória. |
| 3 | Vertical | ADDRESS BUS | Via de mão única em que a CPU informa qual posição da memória quer acessar. |
| 4 | Horizontal | EEPROM | Guarda dados sem energia e permite apagar e regravar cada byte por pulsos elétricos. |
| 5 | Horizontal | FLASH | Memória sem partes móveis usada em pendrives e SSDs; apaga e grava por blocos. |

### Nível 3: Kernel (Difícil)

| Nº | Dir. | Resposta | Pista |
|---|---|---|---|
| 1 | Vertical | REGISTRADORES | Pequenas posições dentro da CPU, as mais rápidas de todas, que guardam dados imediatos. |
| 2 | Vertical | QUAD CORE | Chip com quatro unidades de processamento completas trabalhando em paralelo. |
| 3 | Vertical | DUAL CORE | Chip com duas unidades de processamento completas trabalhando em paralelo. |
| 4 | Horizontal | MEMÓRIA DE MASSA | Guarda arquivos e programas por longo prazo, como HDs e SSDs, em grande quantidade. |
| 5 | Horizontal | MICROCONTROLADOR | Minicomputador em um único chip, com CPU, memória e entradas e saídas, para tarefas específicas. |

## Estrutura do projeto

```
index.html   estrutura da página
style.css    visual (tema roxo "purple stream")
data.js      palavras, pistas, descrições, quizzes, níveis e peças
art.js       ilustrações em SVG das 24 peças e o desenho do PC montado
script.js    lógica do jogo
README.md    este arquivo
```

Para jogar localmente, basta abrir o `index.html` no navegador.

## Publicação

Publicado com o GitHub Pages (Settings → Pages → Deploy from a branch → `main` → `/ (root)`).

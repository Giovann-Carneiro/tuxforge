<h1 align="center">🟣 TuxForge</h1>

<p align="center"><b>Resolva a cruzadinha, aprenda arquitetura de computadores e forje o seu PC, peça por peça.</b></p>

<p align="center">🔗 <a href="https://giovann-carneiro.github.io/tuxforge/"><b>Jogar agora</b></a></p>

---

## 🎮 Como jogar

1. **Digite as letras direto nas casas** da cruzadinha e aperte **✔ Conferir**.
   Certas ficam verdes, erradas ficam vermelhas, e o contador mostra o progresso (ex.: *4 de 6 palavras*).
2. **Acertou?** Leia a explicação do termo e responda a uma pergunta rápida.
3. **Ganhe dinheiro e escolha uma peça** para o seu PC. Quanto mais rápido você acerta, melhor é a peça que pode comprar:

   | | Resposta | Peças liberadas |
   |---|---|---|
   | 🥇 | rápida, sem dica | as melhores (RAM de 1 TB, GPU de 48 GB…) |
   | 🥈 | tempo médio | peças intermediárias |
   | 🥉 | lenta, ou com 💡 dica | peças básicas (RAM de 8 GB…) |

   O dinheiro é limitado: vale gastar tudo agora ou guardar para uma peça melhor?
4. **Passe pelos 3 níveis** e descubra que PC você montou, de *Calculadora de bolso* a *Supercomputador*.

Se travar, use **💡 Dica** (custa dinheiro e rebaixa a peça) ou **⟲ Reiniciar** para limpar o nível.

## 🎚️ Níveis

- **1 · Power On (Fácil)**: a primeira letra de cada palavra já vem revelada e errar não custa nada.
- **2 · BIOS (Médio)**: tabuleiro vazio, e cada erro no Conferir custa R$ 150.
- **3 · Kernel (Difícil)**: palavras longas, dicas mais caras e erro de R$ 300.

## 📚 Palavras e pistas

Todas as 16 palavras da atividade estão no jogo, e em cada tabuleiro elas se cruzam. (→ horizontal, ↓ vertical)

| Nível | Nº | Resposta | Pista |
|:-:|:-:|---|---|
| 1 | 1→ | **UC** | Parte da CPU que decodifica instruções e comanda o que cada circuito deve fazer. |
| 1 | 2↓ | **CPU** | Cérebro do computador: busca, interpreta e executa as instruções dos programas. |
| 1 | 3↓ | **DMA** | Recurso que deixa periféricos trocarem dados com a RAM sem sobrecarregar a CPU. |
| 1 | 4↓ | **RAM** | Área de trabalho principal do computador: veloz, mas esvazia sem energia. |
| 1 | 4→ | **ROM** | Guarda de fábrica o programa de inicialização e mantém tudo mesmo sem energia. |
| 1 | 5→ | **ULA** | Parte da CPU que faz as contas e as operações lógicas. |
| 2 | 1↓ | **CACHE** | Pequena e rapidíssima, fica junto da CPU guardando o que ela usa com mais frequência. |
| 2 | 2→ | **DATA BUS** | Caminho por onde viajam os valores lidos e escritos entre CPU e memória. |
| 2 | 3↓ | **ADDRESS BUS** | Via de mão única em que a CPU informa qual posição da memória quer acessar. |
| 2 | 4→ | **EEPROM** | Guarda dados sem energia e permite apagar e regravar cada byte por pulsos elétricos. |
| 2 | 5→ | **FLASH** | Memória sem partes móveis usada em pendrives e SSDs; apaga e grava por blocos. |
| 3 | 1↓ | **REGISTRADORES** | Pequenas posições dentro da CPU, as mais rápidas de todas, que guardam dados imediatos. |
| 3 | 2↓ | **QUAD CORE** | Chip com quatro unidades de processamento completas trabalhando em paralelo. |
| 3 | 3↓ | **DUAL CORE** | Chip com duas unidades de processamento completas trabalhando em paralelo. |
| 3 | 4→ | **MEMÓRIA DE MASSA** | Guarda arquivos e programas por longo prazo, como HDs e SSDs, em grande quantidade. |
| 3 | 5→ | **MICROCONTROLADOR** | Minicomputador em um único chip, com CPU, memória e entradas e saídas, para tarefas específicas. |

## 🛠️ Feito com

HTML, CSS e JavaScript puros, sem bibliotecas. Para jogar offline, basta abrir o `index.html` no navegador.

`index.html` · `style.css` · `script.js` (lógica) · `data.js` (palavras, quizzes e peças) · `art.js` (desenhos das peças)

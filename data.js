/* =========================================================
   TUXFORGE — dados do jogo
   Palavras, pistas, descrições, quizzes, níveis e peças.
   ========================================================= */

/* ---------- Palavras (pista <= 15 palavras, sem entregar a resposta) ---------- */
const WORDS = {
  CPU: {
    termo: "CPU",
    clue: "Cérebro do computador: busca, interpreta e executa as instruções dos programas.",
    desc: "A CPU (Unidade Central de Processamento) é o processador do computador. Ela busca instruções na memória, decodifica e executa, coordenando todo o funcionamento da máquina. Dentro dela ficam a ULA, a UC e os registradores.",
    quiz: {
      q: "Quais são as três etapas básicas do ciclo de uma instrução na CPU?",
      options: ["Buscar, decodificar e executar", "Ligar, carregar e desligar", "Ler, imprimir e salvar", "Compilar, linkar e rodar"],
      correct: 0,
      explain: "A CPU repete sem parar o ciclo buscar → decodificar → executar.",
    },
  },
  ULA: {
    termo: "ULA",
    clue: "Parte da CPU que faz as contas e as operações lógicas.",
    desc: "A ULA (Unidade Lógica e Aritmética) realiza somas, subtrações, comparações e operações lógicas como AND, OR e NOT. Ela recebe os dados dos registradores e devolve o resultado para eles.",
    quiz: {
      q: "Qual destas tarefas é feita pela ULA?",
      options: ["Somar dois números", "Guardar arquivos por anos", "Controlar o brilho da tela", "Armazenar a BIOS"],
      correct: 0,
      explain: "Somas e comparações (aritmética e lógica) são o trabalho da ULA.",
    },
  },
  UC: {
    termo: "UC",
    clue: "Parte da CPU que decodifica instruções e comanda o que cada circuito deve fazer.",
    desc: "A UC (Unidade de Controle) lê a instrução, decodifica e envia sinais de controle para a ULA, os registradores e a memória, dizendo o que cada um deve fazer e em que momento.",
    quiz: {
      q: "Qual é o papel da UC?",
      options: ["Coordenar as demais partes com sinais de controle", "Fazer cálculos matemáticos", "Guardar dados permanentes", "Desenhar imagens na tela"],
      correct: 0,
      explain: "A UC não calcula: ela comanda quem calcula, lê e escreve.",
    },
  },
  RAM: {
    termo: "RAM",
    clue: "Área de trabalho principal do computador: veloz, mas esvazia sem energia.",
    desc: "A RAM (memória de acesso aleatório) é volátil: perde todo o conteúdo quando falta energia. Guarda os programas e os dados que estão em uso e é muito mais rápida que um HD ou SSD.",
    quiz: {
      q: "O que acontece com os dados da RAM quando o computador é desligado?",
      options: ["São perdidos", "Ficam gravados para sempre", "Passam automaticamente para a ROM", "São copiados para a CPU"],
      correct: 0,
      explain: "RAM é volátil. Quem mantém dados sem energia é a ROM (e o armazenamento).",
    },
  },
  ROM: {
    termo: "ROM",
    clue: "Guarda de fábrica o programa de inicialização e mantém tudo mesmo sem energia.",
    desc: "A ROM (memória somente de leitura) é não volátil: o conteúdo permanece mesmo sem energia. Armazena programas de fábrica, como o firmware que inicia o equipamento.",
    quiz: {
      q: "O que diferencia a ROM da RAM?",
      options: ["A ROM não perde os dados sem energia", "A ROM é sempre mais rápida", "A ROM é sempre maior", "A ROM só funciona com internet"],
      correct: 0,
      explain: "ROM = não volátil. RAM = volátil.",
    },
  },
  DMA: {
    termo: "DMA",
    clue: "Recurso que deixa periféricos trocarem dados com a RAM sem sobrecarregar a CPU.",
    desc: "O DMA (Acesso Direto à Memória) permite que periféricos, como disco e placa de rede, transfiram dados direto para a RAM sem passar pela CPU. Assim a CPU fica livre para executar outras tarefas.",
    quiz: {
      q: "Qual é a principal vantagem do DMA?",
      options: ["Libera a CPU durante transferências de dados", "Aumenta o tamanho da RAM", "Apaga a memória cache", "Reduz o número de núcleos"],
      correct: 0,
      explain: "Com DMA, os dados vão direto à memória e a CPU não precisa copiar byte por byte.",
    },
  },
  CACHE: {
    termo: "CACHE",
    clue: "Pequena e rapidíssima, fica junto da CPU guardando o que ela usa com mais frequência.",
    desc: "A memória cache é pequena e extremamente rápida, e fica entre a CPU e a RAM. Guarda cópias do que é usado com frequência, reduzindo a espera. Costuma ter níveis: L1 (menor e mais rápida), L2 e L3.",
    quiz: {
      q: "Qual é o objetivo da memória cache?",
      options: ["Reduzir o tempo de acesso a dados muito usados", "Guardar arquivos por vários anos", "Ligar o computador", "Aumentar o tamanho do HD"],
      correct: 0,
      explain: "A cache evita idas demoradas até a RAM.",
    },
  },
  FLASH: {
    termo: "FLASH",
    clue: "Memória sem partes móveis usada em pendrives e SSDs; apaga e grava por blocos.",
    desc: "A memória Flash é não volátil e regravável eletricamente, com apagamento feito por blocos. Está em pendrives, cartões SD, SSDs e celulares. Não tem partes móveis, por isso é rápida e resistente a quedas.",
    quiz: {
      q: "Qual destes dispositivos usa memória Flash?",
      options: ["Pendrive", "HD com disco giratório", "Monitor antigo de tubo", "CD-ROM"],
      correct: 0,
      explain: "Pendrives, SSDs e cartões SD são feitos de memória Flash.",
    },
  },
  EEPROM: {
    termo: "EEPROM",
    clue: "Guarda dados sem energia e permite apagar e regravar cada byte por pulsos elétricos.",
    desc: "A EEPROM é uma ROM programável e apagável eletricamente. Mantém dados sem energia e permite regravar byte a byte, ideal para guardar pequenas configurações em microcontroladores.",
    quiz: {
      q: "Como uma EEPROM é apagada?",
      options: ["Eletricamente, sem tirar o chip do circuito", "Com luz ultravioleta, retirando o chip", "Só de fábrica, uma única vez", "Aproximando um ímã"],
      correct: 0,
      explain: "O \"E\" de EEPROM significa Electrically Erasable: apagável eletricamente.",
    },
  },
  DATABUS: {
    termo: "DATA BUS",
    clue: "Caminho por onde viajam os valores lidos e escritos entre CPU e memória.",
    desc: "O data bus (barramento de dados) é o conjunto de fios que leva os dados entre CPU, memória e periféricos, nos dois sentidos (bidirecional). Sua largura (8, 16, 32 ou 64 bits) define quantos bits trafegam por vez.",
    quiz: {
      q: "Como é o fluxo de informação no barramento de dados?",
      options: ["Bidirecional: os dados vão e voltam", "Unidirecional: só a CPU envia", "Só leva energia elétrica", "Exclusivo da placa de vídeo"],
      correct: 0,
      explain: "A CPU lê (dados entram) e escreve (dados saem) pelo mesmo barramento.",
    },
  },
  ADDRESSBUS: {
    termo: "ADDRESS BUS",
    clue: "Via de mão única em que a CPU informa qual posição da memória quer acessar.",
    desc: "O address bus (barramento de endereços) é unidirecional: a CPU envia o endereço da posição de memória ou do periférico que quer acessar. Com n linhas, é possível endereçar 2ⁿ posições.",
    quiz: {
      q: "Um barramento de endereços com 16 linhas consegue endereçar quantas posições?",
      options: ["65.536", "16", "256", "1.024"],
      correct: 0,
      explain: "2¹⁶ = 65.536 posições de memória.",
    },
  },
  REGISTRADORES: {
    termo: "REGISTRADORES",
    clue: "Pequenas posições dentro da CPU, as mais rápidas de todas, que guardam dados imediatos.",
    desc: "Os registradores são pequenas memórias dentro da CPU, as mais rápidas do computador. Guardam operandos, resultados e endereços da instrução em andamento. São poucos, pois são caros e ocupam muito espaço no chip.",
    quiz: {
      q: "Onde ficam os registradores?",
      options: ["Dentro da CPU", "No HD", "Na placa de vídeo", "Na fonte de energia"],
      correct: 0,
      explain: "São a memória mais rápida e mais próxima da ULA: ficam dentro da CPU.",
    },
  },
  MEMORIADEMASSA: {
    termo: "MEMÓRIA DE MASSA",
    clue: "Guarda arquivos e programas por longo prazo, como HDs e SSDs, em grande quantidade.",
    desc: "A memória de massa (armazenamento secundário) é não volátil, de grande capacidade e mais lenta que a RAM: HDs, SSDs, pendrives e cartões. É onde ficam o sistema, os programas e os arquivos.",
    quiz: {
      q: "Qual destes é um exemplo de memória de massa?",
      options: ["SSD", "Registrador", "Cache L1", "Barramento de dados"],
      correct: 0,
      explain: "SSDs e HDs guardam grandes volumes de dados de forma permanente.",
    },
  },
  MICROCONTROLADOR: {
    termo: "MICROCONTROLADOR",
    clue: "Minicomputador em um único chip, com CPU, memória e entradas e saídas, para tarefas específicas.",
    desc: "Um microcontrolador é um computador completo em um só chip: CPU, memória (RAM e ROM/Flash) e pinos de entrada e saída. Controla dispositivos específicos, como eletrodomésticos, carros e placas Arduino.",
    quiz: {
      q: "O que é típico de um microcontrolador?",
      options: ["Reunir CPU, memória e E/S em um único chip", "Ser um processador sem nenhuma memória", "Ser usado apenas em servidores", "Ter placa de vídeo dedicada"],
      correct: 0,
      explain: "Tudo o que é necessário para controlar um dispositivo cabe em um chip só.",
    },
  },
  DUALCORE: {
    termo: "DUAL CORE",
    clue: "Chip com duas unidades de processamento completas trabalhando em paralelo.",
    desc: "Um processador dual core tem dois núcleos (cores) no mesmo chip. Cada núcleo executa instruções de forma independente, permitindo realizar duas tarefas ao mesmo tempo (paralelismo).",
    quiz: {
      q: "Qual é a vantagem de ter dois núcleos?",
      options: ["Executar duas tarefas em paralelo", "Dobrar a quantidade de RAM", "Dobrar a velocidade de qualquer programa", "Eliminar a necessidade de cache"],
      correct: 0,
      explain: "Dois núcleos executam duas tarefas ao mesmo tempo, mas um programa só ganha se for dividido em tarefas.",
    },
  },
  QUADCORE: {
    termo: "QUAD CORE",
    clue: "Chip com quatro unidades de processamento completas trabalhando em paralelo.",
    desc: "Um processador quad core tem quatro núcleos no mesmo chip. Em programas que dividem o trabalho em várias tarefas, pode ser bem mais rápido que um dual core. Programas de uma única tarefa quase não ganham.",
    quiz: {
      q: "Quando um quad core mostra mais vantagem?",
      options: ["Em programas que dividem o trabalho em várias tarefas", "Em qualquer programa, sempre 4 vezes mais rápido", "Quando não há RAM instalada", "Somente em jogos antigos"],
      correct: 0,
      explain: "O ganho depende de o software conseguir usar os 4 núcleos ao mesmo tempo.",
    },
  },
};

/* ---------- Níveis ----------
   reveal: "first" mostra a 1ª letra de cada palavra; "none" tabuleiro vazio.
   tempoRapido / tempoMedio: segundos desde o último acerto para ganhar peças Ouro / Prata.
   custoDica: dinheiro gasto para revelar uma letra (e a peça cai para Bronze).
   penalidade: dinheiro perdido por palavra errada no Conferir. */
const LEVELS = [
  {
    id: 1,
    nome: "Power On",
    sub: "Primeiros circuitos: o processador e as memórias básicas.",
    dificuldade: "Fácil",
    reveal: "first",
    tempoRapido: 45,
    tempoMedio: 100,
    custoDica: 150,
    penalidade: 0,
    mult: 1,
    rows: 4,
    cols: 6,
    words: [
      { id: "CPU", answer: "CPU", row: 0, col: 1, dir: "V" },
      { id: "ULA", answer: "ULA", row: 2, col: 1, dir: "H" },
      { id: "UC", answer: "UC", row: 0, col: 0, dir: "H" },
      { id: "RAM", answer: "RAM", row: 1, col: 3, dir: "V" },
      { id: "ROM", answer: "ROM", row: 1, col: 3, dir: "H" },
      { id: "DMA", answer: "DMA", row: 0, col: 5, dir: "V" },
    ],
  },
  {
    id: 2,
    nome: "BIOS",
    sub: "Memórias especiais e os caminhos que ligam tudo.",
    dificuldade: "Médio",
    reveal: "none",
    tempoRapido: 40,
    tempoMedio: 100,
    custoDica: 300,
    penalidade: 250,
    mult: 1.5,
    rows: 7,
    cols: 11,
    words: [
      { id: "CACHE", answer: "CACHE", row: 1, col: 0, dir: "H" },
      { id: "DATABUS", answer: "DATABUS", row: 0, col: 1, dir: "V" },
      { id: "ADDRESSBUS", answer: "ADDRESSBUS", row: 3, col: 1, dir: "H" },
      { id: "FLASH", answer: "FLASH", row: 0, col: 10, dir: "V" },
      { id: "EEPROM", answer: "EEPROM", row: 0, col: 4, dir: "V" },
    ],
  },
  {
    id: 3,
    nome: "Kernel",
    sub: "O desafio final: sem letras de ajuda e com erros caros.",
    dificuldade: "Difícil",
    reveal: "none",
    tempoRapido: 45,
    tempoMedio: 110,
    custoDica: 500,
    penalidade: 500,
    mult: 2,
    rows: 13,
    cols: 16,
    words: [
      { id: "DUALCORE", answer: "DUALCORE", row: 2, col: 10, dir: "V" },
      { id: "MICROCONTROLADOR", answer: "MICROCONTROLADOR", row: 7, col: 0, dir: "H" },
      { id: "QUADCORE", answer: "QUADCORE", row: 2, col: 6, dir: "V" },
      { id: "MEMORIADEMASSA", answer: "MEMORIADEMASSA", row: 4, col: 0, dir: "H" },
      { id: "REGISTRADORES", answer: "REGISTRADORES", row: 0, col: 12, dir: "V" },
    ],
  },
];

/* ---------- Modo "tudo no difícil" ----------
   Sobrescreve as regras de cada nível; os tabuleiros continuam os mesmos. */
const HARD = {
  dificuldade: "Difícil",
  reveal: "none",
  tempoRapido: 40,
  tempoMedio: 90,
  custoDica: 500,
  penalidade: 500,
  mult: 1.5, // quem arrisca recebe 50% a mais, como o 3º nível do modo recomendado
};

/* ---------- Economia ---------- */
const ECONOMY = {
  inicial: 500,
  renda: { 3: 1200, 2: 800, 1: 450 }, // por velocidade (tier), multiplicada pelo nível
  bonusQuiz: 500, // também multiplicado pelo nível
  revenda: 0.5, // ao trocar uma peça, devolve 50% do preço
};

const TIERS = {
  3: { nome: "Ouro", classe: "gold", desc: "resposta rápida, sem dica" },
  2: { nome: "Prata", classe: "silver", desc: "resposta em tempo médio" },
  1: { nome: "Bronze", classe: "bronze", desc: "resposta lenta ou com dica" },
};

/* ---------- PC: encaixes e peças ----------
   power = pontos de desempenho (benchmark). */
const SLOTS = [
  { id: "case", nome: "Gabinete", icone: "▣", curto: "Gabinete" },
  { id: "mobo", nome: "Placa-mãe", icone: "▦", curto: "Placa-mãe" },
  { id: "cpu", nome: "Processador", icone: "◈", curto: "CPU" },
  { id: "ram", nome: "Memória RAM", icone: "≣", curto: "RAM" },
  { id: "storage", nome: "Armazenamento", icone: "▤", curto: "Armaz." },
  { id: "gpu", nome: "Placa de vídeo", icone: "◧", curto: "GPU" },
  { id: "psu", nome: "Fonte", icone: "⚡", curto: "Fonte" },
  { id: "cooler", nome: "Cooler", icone: "✲", curto: "Cooler" },
];

const PARTS = [
  { id: "case1", slot: "case", tier: 1, nome: "Cooler Master MasterBox Q300L", curto: "Q300L", price: 350, power: 5 },
  { id: "case2", slot: "case", tier: 2, nome: "NZXT H510 Flow", curto: "H510 Flow", price: 800, power: 12 },
  { id: "case3", slot: "case", tier: 3, nome: "Lian Li O11 Dynamic EVO", curto: "O11 EVO", price: 1800, power: 20 },

  { id: "mobo1", slot: "mobo", tier: 1, nome: "ASRock H610M-HDV", curto: "H610M", price: 450, power: 8 },
  { id: "mobo2", slot: "mobo", tier: 2, nome: "ASUS TUF Gaming B760-Plus WiFi D4", curto: "B760", price: 1300, power: 20 },
  { id: "mobo3", slot: "mobo", tier: 3, nome: "ASUS ROG Maximus Z790 Hero", curto: "Z790", price: 3500, power: 35 },

  { id: "cpu1", slot: "cpu", tier: 1, nome: "Intel Pentium Gold G7400 (2 núcleos)", curto: "G7400", price: 450, power: 15 },
  { id: "cpu2", slot: "cpu", tier: 2, nome: "Intel Core i3-12100F (4 núcleos)", curto: "i3-12100F", price: 1100, power: 40 },
  { id: "cpu3", slot: "cpu", tier: 3, nome: "Intel Core i9-14900K (24 núcleos)", curto: "i9-14900K", price: 3800, power: 90 },

  { id: "ram1", slot: "ram", tier: 1, nome: "Kingston Fury Beast 8 GB DDR4", curto: "8 GB", price: 200, power: 10 },
  { id: "ram2", slot: "ram", tier: 2, nome: "Corsair Vengeance RGB 64 GB DDR5", curto: "64 GB", price: 1500, power: 30 },
  { id: "ram3", slot: "ram", tier: 3, nome: "Kit RAM 1 TB DDR5 RDIMM (8×128 GB)", curto: "1 TB", price: 6000, power: 70 },

  { id: "sto1", slot: "storage", tier: 1, nome: "Seagate BarraCuda 500 GB (HD)", curto: "500 GB", price: 250, power: 6 },
  { id: "sto2", slot: "storage", tier: 2, nome: "Samsung 980 PRO 1 TB (NVMe)", curto: "1 TB", price: 900, power: 18 },
  { id: "sto3", slot: "storage", tier: 3, nome: "Sabrent Rocket 4 Plus 8 TB (NVMe)", curto: "8 TB", price: 3200, power: 35 },

  { id: "gpu1", slot: "gpu", tier: 1, nome: "NVIDIA GeForce GTX 1650 4 GB", curto: "GTX 1650", price: 900, power: 12 },
  { id: "gpu2", slot: "gpu", tier: 2, nome: "AMD Radeon RX 9070 XT 16 GB", curto: "RX 9070 XT", price: 4800, power: 35 },
  { id: "gpu3", slot: "gpu", tier: 3, nome: "NVIDIA GeForce RTX 5090 32 GB", curto: "RTX 5090", price: 14000, power: 80 },

  { id: "psu1", slot: "psu", tier: 1, nome: "Corsair CV550 550 W (80 Plus Bronze)", curto: "550 W", price: 300, power: 4 },
  { id: "psu2", slot: "psu", tier: 2, nome: "Corsair RM750e 750 W (80 Plus Gold)", curto: "750 W", price: 800, power: 10 },
  { id: "psu3", slot: "psu", tier: 3, nome: "Corsair AX1600i 1600 W (80 Plus Titanium)", curto: "1600 W", price: 3500, power: 20 },

  { id: "cool1", slot: "cooler", tier: 1, nome: "Cooler Master Hyper 212 (ar)", curto: "Hyper 212", price: 150, power: 3 },
  { id: "cool2", slot: "cooler", tier: 2, nome: "Corsair iCUE H150i Elite 360 mm (AIO)", curto: "H150i", price: 900, power: 9 },
  { id: "cool3", slot: "cooler", tier: 3, nome: "EK-Quantum Velocity² (loop custom)", curto: "EK loop", price: 1800, power: 15 },
];

/* ---------- Ranking final (pela soma de power; máximo = 365) ---------- */
const RANKS = [
  { min: 0, nome: "Calculadora de bolso", emoji: "🧮" },
  { min: 40, nome: "PC de escritório", emoji: "🖥️" },
  { min: 95, nome: "PC gamer de entrada", emoji: "🎮" },
  { min: 170, nome: "Estação de trabalho", emoji: "⚙️" },
  { min: 260, nome: "PC gamer ultra", emoji: "🔥" },
  { min: 340, nome: "Supercomputador", emoji: "🚀" },
];

/* ---------- Desafio para pular de nível ----------
   Perguntas muito difíceis: a primeira alternativa é a certa (o jogo embaralha).
   Quem erra espera SKIP.espera segundos e a pergunta errada não volta. */
const SKIP = { espera: 60 };

const HARD_QUESTIONS = [
  {
    q: "Um barramento de endereços com 20 linhas consegue endereçar quantas posições de memória?",
    options: ["1.048.576 (1 Mi)", "20.000", "65.536", "4.194.304"],
    correct: 0,
    explain: "Com n linhas há 2ⁿ endereços: 2²⁰ = 1.048.576 posições.",
  },
  {
    q: "Uma CPU tem barramento de endereços de 16 bits e barramento de dados de 8 bits. Qual é a maior memória que ela consegue acessar?",
    options: ["64 KB (65.536 bytes)", "16 KB", "256 bytes", "128 KB"],
    correct: 0,
    explain: "2¹⁶ endereços × 1 byte (8 bits) por posição = 65.536 bytes.",
  },
  {
    q: "Quantos bits de endereço são necessários para endereçar 4 GB de memória, byte a byte?",
    options: ["32 bits", "30 bits", "34 bits", "16 bits"],
    correct: 0,
    explain: "4 GB = 2³² bytes, então são necessárias 32 linhas de endereço.",
  },
  {
    q: "Um barramento de dados de 32 bits transfere quantos bytes em cada operação de leitura ou escrita?",
    options: ["4 bytes", "8 bytes", "32 bytes", "2 bytes"],
    correct: 0,
    explain: "32 bits ÷ 8 = 4 bytes por transferência.",
  },
  {
    q: "Ordene do acesso mais rápido para o mais lento:",
    options: [
      "Registradores → cache → RAM → memória de massa",
      "Cache → registradores → RAM → memória de massa",
      "Registradores → RAM → cache → memória de massa",
      "RAM → cache → registradores → memória de massa",
    ],
    correct: 0,
    explain: "Quanto mais perto da ULA, mais rápida (e menor, e mais cara por byte) é a memória.",
  },
  {
    q: "Qual é a diferença de apagamento entre uma EEPROM e uma memória Flash?",
    options: [
      "A EEPROM apaga byte a byte; a Flash apaga por blocos",
      "A EEPROM só apaga com luz ultravioleta; a Flash, com calor",
      "As duas só conseguem apagar o chip inteiro",
      "A Flash apaga byte a byte; a EEPROM apaga por blocos",
    ],
    correct: 0,
    explain: "A EEPROM permite regravar cada byte; a Flash apaga blocos inteiros, o que a torna mais densa e barata.",
  },
  {
    q: "Durante uma transferência por DMA, quem comanda os barramentos de endereço e de dados?",
    options: ["O controlador de DMA, com a CPU liberada", "A CPU, que copia byte a byte", "A ULA", "A memória cache"],
    correct: 0,
    explain: "A CPU cede os barramentos ao controlador de DMA, que move os dados direto entre o periférico e a memória.",
  },
  {
    q: "O que é um \"cache hit\"?",
    options: [
      "O dado procurado já está na cache, e o acesso à RAM é evitado",
      "O dado não está na cache e precisa ser buscado na RAM",
      "A cache foi apagada por falta de energia",
      "A CPU gravou o dado direto no HD",
    ],
    correct: 0,
    explain: "Hit = acerto na cache. Quando o dado não está lá, é um miss e a CPU espera a RAM.",
  },
  {
    q: "Um programa que executa uma única tarefa sequencial, sem dividir o trabalho, roda em um processador quad core. O que tende a acontecer?",
    options: [
      "Usa basicamente um núcleo, então o ganho sobre um dual core é pequeno",
      "Roda 4 vezes mais rápido",
      "Usa os 4 núcleos automaticamente",
      "Roda mais devagar que em um processador de um núcleo",
    ],
    correct: 0,
    explain: "Núcleos extras só ajudam quando o software divide o trabalho em várias tarefas.",
  },
  {
    q: "Por que a memória cache L1 é muito menor que a RAM?",
    options: [
      "Porque é muito rápida e cara, e ocupa área nobre do chip",
      "Porque só guarda programas, nunca dados",
      "Porque é mais lenta que a RAM",
      "Porque é gravada uma única vez na fábrica",
    ],
    correct: 0,
    explain: "Velocidade custa área e dinheiro: por isso a hierarquia tem poucas memórias muito rápidas e muitas mais lentas.",
  },
  {
    q: "Qual característica diferencia um microcontrolador de um microprocessador de uso geral?",
    options: [
      "Integra CPU, memória e entradas/saídas em um único chip",
      "Não tem nenhum tipo de memória",
      "Só existe em servidores",
      "Não executa instruções",
    ],
    correct: 0,
    explain: "O microcontrolador é um computador inteiro em um chip, feito para controlar um dispositivo específico.",
  },
  {
    q: "Qual registrador guarda o endereço da próxima instrução a ser buscada?",
    options: ["Contador de programa (PC)", "Acumulador", "Registrador de dados", "Ponteiro de pilha"],
    correct: 0,
    explain: "O contador de programa aponta para a próxima instrução; a UC o atualiza a cada busca.",
  },
];

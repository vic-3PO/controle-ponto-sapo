// ============================
// Controle de Seções e Jogos
// ============================
function mostrarSecao(secao) {
    const main = document.querySelector('main');
    const jogos = document.getElementById('jogos');

    if (secao === 'controle') {
        main.style.display = 'block';
        jogos.style.display = 'none';
    } else {
        main.style.display = 'none';
        jogos.style.display = 'block';
    }
}

document.getElementById("forca-difficulty").addEventListener("change", reiniciarForca);
document.getElementById("salto-difficulty").addEventListener("change", reiniciarSalto);
document.getElementById("memoria-difficulty").addEventListener("change", reiniciarMemoria);
document.getElementById("velha-difficulty").addEventListener("change", reiniciarJogoVelha);

function mostrarJogo(id) {
    document.querySelectorAll('.jogo').forEach(j => j.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    // Reinicia o jogo assim que a seção é exibida:
    if (id === 'velha') reiniciarJogoVelha();
    if (id === 'forca') reiniciarForca();
    if (id === 'salto') reiniciarSalto();
    if (id === 'memoria') reiniciarMemoria();
}

// ====================================
// JOGO DA VELHA (Tic Tac Toe) - Single Player com Níveis de Dificuldade
// ====================================
const tabuleiro = document.getElementById('tabuleiro');
const mensagemVelha = document.getElementById('mensagemVelha');
let vez = '🐸'; // jogador = '🐸', computador = '🌿'
let jogoAtivoVelha = true;

// Inicia o jogo
function iniciarJogoVelha() {
    tabuleiro.innerHTML = '';
    mensagemVelha.textContent = '';
    vez = '🐸';
    jogoAtivoVelha = true;
    for (let i = 0; i < 9; i++) {
        const celula = document.createElement('div');
        celula.dataset.index = i;
        celula.addEventListener('click', () => jogarVelha(celula));
        tabuleiro.appendChild(celula);
    }
}

function jogarVelha(celula) {
    if (!jogoAtivoVelha || celula.textContent) return;
    celula.textContent = vez;
    if (verificarVencedorVelha()) return;
    // Se o jogador acabou de jogar, passa a vez para o computador
    if (vez === '🐸') {
        vez = '🌿';
        setTimeout(jogadaComputadorVelha, 500);
    }
}

function jogadaComputadorVelha() {
    // Lê a dificuldade escolhida (default para "easy")
    const selectDiff = document.getElementById('velha-difficulty');
    const dificuldade = selectDiff ? selectDiff.value : 'easy';

    let indiceEscolhido;
    if (dificuldade === 'easy') {
        // Jogada aleatória
        indiceEscolhido = jogadaAleatoria();
    } else if (dificuldade === 'medium') {
        // Tenta ganhar ou bloquear; caso contrário, joga aleatoriamente
        indiceEscolhido = jogadaMedium();
    } else if (dificuldade === 'hard') {
        // Utiliza o algoritmo Minimax para a jogada ideal
        indiceEscolhido = jogadaHard();
    }

    if (indiceEscolhido === undefined) return; // Nenhuma jogada disponível

    // Realiza a jogada na célula escolhida
    const celulas = Array.from(tabuleiro.children);
    celulas[indiceEscolhido].textContent = vez;
    verificarVencedorVelha();
    if (jogoAtivoVelha) vez = '🐸';
}

function jogadaAleatoria() {
    const celulas = Array.from(tabuleiro.children).filter(c => !c.textContent);
    if (celulas.length === 0) return;
    const escolha = celulas[Math.floor(Math.random() * celulas.length)];
    return Number(escolha.dataset.index);
}

function jogadaMedium() {
    const board = getBoardState();
    // Primeiro, veja se o computador pode ganhar em uma jogada
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = '🌿';
            if (verificarVitoriaBoard(board, '🌿')) {
                return i;
            }
            board[i] = null;
        }
    }
    // Se não, veja se o jogador pode ganhar na próxima jogada e bloqueie
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = '🐸';
            if (verificarVitoriaBoard(board, '🐸')) {
                return i;
            }
            board[i] = null;
        }
    }
    // Caso contrário, retorna uma jogada aleatória
    return jogadaAleatoria();
}

function jogadaHard() {
    const board = getBoardState();
    const bestMove = minimax(board, '🌿');
    return bestMove.index;
}

// Retorna o estado atual do tabuleiro como um array de 9 posições (null ou '🐸' ou '🌿')
function getBoardState() {
    const celulas = Array.from(tabuleiro.children);
    return celulas.map(c => c.textContent ? c.textContent : null);
}

function verificarVencedorVelha() {
    const comb = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
        [0, 4, 8], [2, 4, 6]             // diagonais
    ];
    const celulas = Array.from(tabuleiro.children);
    let vencedor = null;
    for (let indices of comb) {
        const [a, b, c] = indices;
        if (celulas[a].textContent &&
            celulas[a].textContent === celulas[b].textContent &&
            celulas[a].textContent === celulas[c].textContent) {
            vencedor = celulas[a].textContent;
            break;
        }
    }
    if (vencedor) {
        jogoAtivoVelha = false;
        mensagemVelha.textContent = vencedor === '🐸' ? 'Você venceu! 🏆' : 'Você perdeu! 😢';
        return true;
    }
    if (celulas.every(c => c.textContent)) {
        jogoAtivoVelha = false;
        mensagemVelha.textContent = 'Empate! 😐';
        return true;
    }
    return false;
}

function reiniciarJogoVelha() {
    iniciarJogoVelha();
}

// ===================
// Funções de suporte para Minimax e verificação de vitória
// ===================

function verificarVitoriaBoard(board, player) {
    const comb = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let indices of comb) {
        const [a, b, c] = indices;
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}

// Implementação do algoritmo Minimax
function minimax(newBoard, player) {
    // Obtém os índices disponíveis
    const availSpots = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);

    // Condição de término: vitória ou empate
    if (verificarVitoriaBoard(newBoard, '🐸')) {
        return { score: -10 };
    } else if (verificarVitoriaBoard(newBoard, '🌿')) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    // Array para armazenar os movimentos
    const moves = [];

    // Loop por cada movimento disponível
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        // Faz a jogada temporária
        newBoard[availSpots[i]] = player;

        if (player === '🌿') {
            const result = minimax(newBoard, '🐸');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, '🌿');
            move.score = result.score;
        }

        // Desfaz a jogada
        newBoard[availSpots[i]] = null;
        moves.push(move);
    }

    // Escolhe o movimento com o melhor score
    let bestMove;
    if (player === '🌿') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}

// Inicia o jogo ao carregar
iniciarJogoVelha();


// ====================================
// FORCA AQUÁTICA - Single Player com Níveis de Dificuldade
// ====================================
let palavras = [
    "SAPO",
    "LAGO",
    "RÃ",
    "ANFÍBIO",
    "LÍRIO",
    "CANA",
    "ÁGUA",
    "RANÁRIO",
    "PANTANO",
    "PISCINA",
    "BOSQUE",
    "RIBEIRA",
    "MANGUE",
    "LAMA",
    "SELVA",
    "FLORESTA",
    "ÁRVORE",
    "FOLHA",
    "GRAMA",
    "PASTO",
    "JUNCOS",
    "PEIXE",
    "RIO",
    "CASCATA",
    "MONTANHA",
    "CÉU",
    "SOL",
    "LUA",
    "ESTRELA",
    "VENTO",
    "CHUVA",
    "TROVÃO",
    "NUVEM",
    "RAIO",
    "PÂNTANO",
    "BARRO",
    "TERRA",
    "POÇO",
    "PANTANAL",
    "CALHA",
    "LÂMINA",
    "JARDIM",
    "CAMPO",
    "CERRADO",
    "COSTA",
    "BAÍA",
    "PRAIA",
    "ALGA",
    "CORAL"
];

let palavra, palavraExibida, tentativasErradas, maxTentativas;
const palavraElemento = document.getElementById('palavra');
const dicaElemento = document.getElementById('dica');
const tentativasElemento = document.getElementById('tentativas');

function iniciarForca() {
    // Seleciona a dificuldade escolhida
    const difficulty = document.getElementById('forca-difficulty')
        ? document.getElementById('forca-difficulty').value
        : 'medium';

    if (difficulty === 'easy') {
        maxTentativas = 8;
    } else if (difficulty === 'hard') {
        maxTentativas = 4;
    } else {
        maxTentativas = 6;
    }

    // Seleciona uma palavra aleatória
    palavra = palavras[Math.floor(Math.random() * palavras.length)];
    palavraExibida = '_ '.repeat(palavra.length);
    tentativasErradas = 0;
    palavraElemento.textContent = palavraExibida;
    dicaElemento.textContent = `Tentativas restantes: ${maxTentativas - tentativasErradas}`;
    tentativasElemento.textContent = '';
    document.getElementById('entrada').value = '';
}

function tentarLetra() {
    const input = document.getElementById('entrada');
    const letra = input.value.toUpperCase();
    input.value = '';
    if (!letra || !jogoForcaAtivo()) return;

    if (palavra.includes(letra)) {
        let novaPalavra = '';
        for (let i = 0; i < palavra.length; i++) {
            novaPalavra += (palavra[i] === letra || palavraExibida[2 * i] !== '_') ? palavra[i] + ' ' : '_ ';
        }
        palavraExibida = novaPalavra;
        palavraElemento.textContent = palavraExibida;

        if (!palavraExibida.includes('_')) {
            dicaElemento.textContent = 'Parabéns! Você venceu! 🏆';
        }
    } else {
        tentativasErradas++;
        dicaElemento.textContent = `Tentativas restantes: ${maxTentativas - tentativasErradas}`;
        tentativasElemento.textContent += letra + ' ';
        if (tentativasErradas >= maxTentativas) {
            dicaElemento.textContent = `Você perdeu! A palavra era: ${palavra}`;
        }
    }
}

function jogoForcaAtivo() {
    return tentativasErradas < maxTentativas && palavraExibida.includes('_');
}

function reiniciarForca() {
    iniciarForca();
}

// ====================================
// SALTO DO SAPINHO - Single Player com Níveis de Dificuldade (Versão aprimorada)
// ====================================
let canvas, ctx;
let sapo, obstacles, jogoSaltoAtivo, velocidade, score, spawnInterval, lastSpawnTime;
const canvasSalto = document.getElementById('gameCanvas');

function iniciarSalto() {
    // Inicializa o canvas e o contexto
    canvas = canvasSalto;
    ctx = canvas.getContext('2d');

    // Seleciona a dificuldade escolhida
    const difficulty = document.getElementById('salto-difficulty')
        ? document.getElementById('salto-difficulty').value
        : 'medium';

    // Ajusta os parâmetros conforme a dificuldade
    if (difficulty === 'easy') {
        spawnInterval = 2500; // Intervalo maior para mais tempo
        velocidade = 2;
    } else if (difficulty === 'hard') {
        spawnInterval = 1500; // Obstáculos surgem com mais frequência
        velocidade = 4;
    } else {
        spawnInterval = 2000;
        velocidade = 3;
    }

    // Define o sapo (personagem)
    sapo = {
        x: 50,
        y: canvas.height - 40,
        largura: 30,
        altura: 30,
        velocidadeY: 0
    };

    obstacles = []; // Array de obstáculos
    jogoSaltoAtivo = true;
    score = 0;
    lastSpawnTime = Date.now();

    // Reinicia a animação
    requestAnimationFrame(animarSalto);
}

// Permite iniciar o pulo com a tecla Espaço ou Seta para Cima
document.addEventListener('keydown', function (e) {
    if (!jogoSaltoAtivo) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (sapo.y >= canvas.height - sapo.altura - 5) {
            sapo.velocidadeY = -12;
        }
    }
});

function animarSalto() {
    if (!jogoSaltoAtivo) return;
    const agora = Date.now();

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Atualiza a física do sapo (gravidade)
    sapo.velocidadeY += 0.5;
    sapo.y += sapo.velocidadeY;
    if (sapo.y > canvas.height - sapo.altura) {
        sapo.y = canvas.height - sapo.altura;
        sapo.velocidadeY = 0;
    }

    // Verifica se é hora de criar um novo obstáculo
    if (agora - lastSpawnTime > spawnInterval) {
        criarObstaculo();
        lastSpawnTime = agora;
    }

    // Atualiza e desenha os obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= velocidade + score * 0.2; // aumenta a velocidade conforme o score
        desenharObstaculo(obs);

        // Se o obstáculo passou completamente, remove-o e incrementa a pontuação
        if (obs.x + obs.largura < 0) {
            obstacles.splice(i, 1);
            score++;
        }

        // Verifica colisão com o sapo
        if (colidiu(sapo, obs)) {
            jogoSaltoAtivo = false;
            desenharSapo();
            ctx.font = '20px sans-serif';
            ctx.fillStyle = 'red';
            ctx.fillText(`Você perdeu! Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2);
            return;
        }
    }

    // Desenha o sapo
    desenharSapo();

    // Exibe o placar
    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);

    requestAnimationFrame(animarSalto);
}

function criarObstaculo() {
    // Obstáculos terão altura e largura variáveis para aumentar a diversidade
    const largura = 20 + Math.random() * 20; // entre 20 e 40
    const altura = 20 + Math.random() * 30;   // entre 20 e 50
    const obs = {
        x: canvas.width,
        y: canvas.height - altura,
        largura: largura,
        altura: altura
    };
    obstacles.push(obs);
}

function desenharSapo() {
    ctx.fillStyle = 'green';
    ctx.fillRect(sapo.x, sapo.y, sapo.largura, sapo.altura);
}

function desenharObstaculo(obs) {
    ctx.fillStyle = 'brown';
    ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
}

function colidiu(a, b) {
    return (
        a.x < b.x + b.largura &&
        a.x + a.largura > b.x &&
        a.y < b.y + b.altura &&
        a.y + a.altura > b.y
    );
}

function reiniciarSalto() {
    iniciarSalto();
}

/// ====================================
// MEMÓRIA DOS SAPINHOS - Single Player (Jogo da Memória com Níveis de Dificuldade)
// ====================================

let memoriaGrid, cartas, primeiraCarta, segundaCarta, bloqueio, paresEncontrados, flipDelay, totalPares;

function iniciarMemoria() {
    memoriaGrid = document.getElementById('memoria-grid');
    memoriaGrid.innerHTML = '';

    // Lê a dificuldade selecionada (default: 'medium')
    const difficulty = document.getElementById('memoria-difficulty')
        ? document.getElementById('memoria-difficulty').value
        : 'medium';

    // Definição dos conjuntos de cartas e do tempo de delay para "desvirar" em caso de erro
    let cartasDisponiveis = [];
    if (difficulty === 'easy') {
        // Fácil: 4 pares (8 cartas)
        cartasDisponiveis = ['🐸', '🐸', '🌿', '🌿', '💦', '💦', '🐠', '🐠'];
        flipDelay = 1500; // tempo para desvirar cartas erradas
    } else if (difficulty === 'hard') {
        // Difícil: 8 pares (16 cartas) – pode incluir mais símbolos
        cartasDisponiveis = ['🐸', '🐸', '🌿', '🌿', '💦', '💦', '🐠', '🐠',
            '🍀', '🍀', '🌞', '🌞', '🐢', '🐢', '🐍', '🐍'];
        flipDelay = 500;
    } else {
        // Médio: 6 pares (12 cartas)
        cartasDisponiveis = ['🐸', '🐸', '🌿', '🌿', '💦', '💦', '🐠', '🐠', '🍀', '🍀', '🌞', '🌞'];
        flipDelay = 1000;
    }

    totalPares = cartasDisponiveis.length / 2;

    // Embaralha as cartas
    cartas = [...cartasDisponiveis].sort(() => Math.random() - 0.5);

    // Inicializa variáveis de controle
    primeiraCarta = null;
    segundaCarta = null;
    bloqueio = false;
    paresEncontrados = 0;

    // Cria os elementos para cada carta
    cartas.forEach(simbolo => {
        const carta = document.createElement('div');
        carta.classList.add('carta');
        carta.dataset.simbolo = simbolo;
        carta.addEventListener('click', virarCarta);
        memoriaGrid.appendChild(carta);
    });

    // Se não existir um elemento para a mensagem, cria um logo após o grid
    if (!document.getElementById('mensagemMemoria')) {
        const msg = document.createElement('p');
        msg.id = 'mensagemMemoria';
        memoriaGrid.parentNode.insertBefore(msg, memoriaGrid.nextSibling);
    } else {
        document.getElementById('mensagemMemoria').textContent = '';
    }
}

function virarCarta() {
    if (bloqueio) return;
    if (this === primeiraCarta) return;

    this.textContent = this.dataset.simbolo;
    this.classList.add('virada');

    if (!primeiraCarta) {
        primeiraCarta = this;
        return;
    }

    segundaCarta = this;
    bloqueio = true;

    if (primeiraCarta.dataset.simbolo === segundaCarta.dataset.simbolo) {
        paresEncontrados++;
        resetarMemoria();
        if (paresEncontrados === totalPares) {
            document.getElementById('mensagemMemoria').textContent = 'Parabéns! Você venceu! 🏆';
        }
    } else {
        setTimeout(() => {
            primeiraCarta.textContent = '';
            segundaCarta.textContent = '';
            primeiraCarta.classList.remove('virada');
            segundaCarta.classList.remove('virada');
            resetarMemoria();
        }, flipDelay);
    }
}

function resetarMemoria() {
    [primeiraCarta, segundaCarta] = [null, null];
    bloqueio = false;
}

function reiniciarMemoria() {
    iniciarMemoria();
}

// ─── Loja de Temas ───────────────────────────────────────────────────────────
// Aplica tema via classe no body + atualiza imagens/textos do mascote.
// Não injeta mais CSS inline — tudo via variáveis CSS em style.css.

const TEMAS_CONFIG = {
    padrao:      { emoji: '🐸', nome: 'Sapinho',    prefixo: 'sapo',        ext: 'jpg' },
    cinnamoroll: { emoji: '☁️', nome: 'Cinnamoroll', prefixo: 'cinnamoroll', ext: 'png' },
    pompompurin: { emoji: '🍮', nome: 'Pompompurin', prefixo: 'pompompurin', ext: 'png' },
    halloween:   { emoji: '🎃', nome: 'Abóbora',     prefixo: 'halloween',   ext: 'jpg',
        imagens: {
            neutro: 'img/halloween/abobora-neutro.jpg',
            feliz:  'img/halloween/abobora-feliz.jpg',
            triste: 'img/halloween/abobora-triste.jpg',
            rico:   'img/halloween/abobora-rico.jpg',
        } },
};

// Caminho da imagem do mascote para um tema/estado (feliz, triste, rico, neutro)
function imagemMascote(temaNome, estado) {
    const t = TEMAS_CONFIG[temaNome] || TEMAS_CONFIG.padrao;
    return t.imagens ? t.imagens[estado] : `img/${t.prefixo}-${estado}.${t.ext}`;
}

const SWATCHES = {
    padrao:      ['#5BAD6F','#A8D9B3','#EDF7F0','#2D7A42'],
    cinnamoroll: ['#5B9BD6','#A8CAFE','#EEF5FD','#E8C6E8'],
    pompompurin: ['#D4A017','#F5D97A','#FDF8E8','#8B4A0A'],
    halloween:   ['#E8650D','#7B4FBF','#14101F','#F3EAD8'],
};

function aplicarTema(temaNome) {
    if (!TEMAS_CONFIG[temaNome]) temaNome = 'padrao';
    const t = TEMAS_CONFIG[temaNome];

    // Troca classe no body
    document.body.classList.remove('tema-cinnamoroll', 'tema-pompompurin', 'tema-halloween');
    if (temaNome !== 'padrao') document.body.classList.add(`tema-${temaNome}`);

    localStorage.setItem('tema-atual', temaNome);
    atualizarQueda(temaNome);

    // Título
    const titulo = document.getElementById('titulo-principal');
    if (titulo) titulo.textContent = `${t.emoji} Controle de Ponto ${t.emoji}`;

    // Mascote do header
    const headerMascote = document.getElementById('header-mascote');
    if (headerMascote) {
        headerMascote.src = imagemMascote(temaNome, 'neutro');
        headerMascote.alt = t.nome;
    }

    // Título da seção de status
    const tituloStatus = document.querySelector('#sapo-status h2');
    if (tituloStatus) tituloStatus.textContent = `${t.emoji} Status d${temaNome==='halloween'?'a':'o'} ${t.nome}`;

    // Mascote de status — preserva o estado atual (feliz/triste/rico/neutro)
    const imgStatus = document.getElementById('sapo-img');
    if (imgStatus) {
        const estado = imgStatus.dataset.estado || 'neutro';
        imgStatus.src = imagemMascote(temaNome, estado);
        imgStatus.classList.add('mascote-troca');
        imgStatus.addEventListener('animationend', () => imgStatus.classList.remove('mascote-troca'), { once: true });
    }

    // Mensagem de status — troca o nome do personagem
    const mensagem = document.getElementById('sapo-mensagem');
    if (mensagem) {
        let txt = mensagem.textContent;
        Object.values(TEMAS_CONFIG).forEach(({ nome }) => { txt = txt.replace(nome, t.nome); });
        mensagem.textContent = txt;
    }

    // Footer
    const footerP = document.querySelector('footer p');
    if (footerP) footerP.textContent = `${t.emoji} Feito com carinho ${t.emoji}`;

    // Modal icon
    const frogIcon = document.querySelector('.frog');
    if (frogIcon) frogIcon.textContent = t.emoji;

    // Botões da loja
    document.querySelectorAll('.tema-card button').forEach(btn => {
        btn.classList.remove('tema-ativo');
        btn.textContent = 'Aplicar';
    });
    const btnAtivo = document.querySelector(`.tema-card[data-tema="${temaNome}"] button`);
    if (btnAtivo) {
        btnAtivo.classList.add('tema-ativo');
        btnAtivo.textContent = 'Ativo';
    }

    // Swatches nos cards
    document.querySelectorAll('.tema-card').forEach(card => {
        const nome = card.dataset.tema;
        const sw   = card.querySelector('.tema-swatches');
        if (sw && SWATCHES[nome]) {
            sw.innerHTML = SWATCHES[nome].map(c => `<span class="tema-swatch" style="background:${c}" title="${c}"></span>`).join('');
        }
    });
}

function carregarTemaAtual() {
    const salvo = localStorage.getItem('tema-atual') || 'padrao';
    aplicarTema(salvo);
}

document.addEventListener('DOMContentLoaded', carregarTemaAtual);

// ─── Halloween: SVGs caindo como neve ────────────────────────────────────────
const SVGS_QUEDA = [
    'halloween-pumpkin-head-outline-svgrepo-com', 'halloween-smiling-pumpkin-head-outline-svgrepo-com',
    'halloween-witch-hat-outline-svgrepo-com',    'halloween-scary-mask-outline-svgrepo-com',
    'halloween-tomb-cross-svgrepo-com',           'halloween-candles-couple-outlined-ornament-svgrepo-com',
    'evil-halloween-circular-scary-face-outline-svgrepo-com',
    '46771', '2819770', '3357489', '151310',
].map(n => `img/halloween/${n}.svg`);

// SVGs pretos recoloridos com filter (mask-image é bloqueado em file://)
const FILTROS_QUEDA = [
    'invert(58%) sepia(96%) saturate(1800%) hue-rotate(352deg) brightness(104%)',  // laranja
    'invert(58%) sepia(96%) saturate(1800%) hue-rotate(352deg) brightness(104%)',  // laranja
    'invert(62%) sepia(45%) saturate(1400%) hue-rotate(222deg) brightness(105%)',  // roxo
    'invert(93%) sepia(18%) saturate(500%) hue-rotate(340deg) brightness(100%)',   // creme
    'invert(80%) sepia(60%) saturate(600%) hue-rotate(8deg) brightness(105%)',     // dourado
];

// <img> + estilos inline (funciona em file:// e em http) e animação via Web Animations API.
function atualizarQueda(temaNome) {
    let caixa = document.getElementById('hw-queda');

    if (temaNome !== 'halloween') {
        if (caixa) caixa.remove();
        return;
    }
    if (caixa) return; // já está caindo

    caixa = document.createElement('div');
    caixa.id = 'hw-queda';
    caixa.setAttribute('aria-hidden', 'true');
    caixa.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;overflow:hidden;' +
                          'pointer-events:none;z-index:0;';

    const altura = window.innerHeight;
    const total  = window.innerWidth < 700 ? 14 : 28;
    const rnd    = (a, b) => a + Math.random() * (b - a);
    const sorteia = lista => lista[Math.floor(Math.random() * lista.length)];

    for (let i = 0; i < total; i++) {
        const tam = rnd(32, 68);
        const el  = document.createElement('img');
        el.src = sorteia(SVGS_QUEDA);
        el.alt = '';
        el.draggable = false;
        el.style.cssText =
            'position:absolute;top:0;display:block;' +
            'left:' + rnd(0, 100) + 'vw;width:' + tam + 'px;height:' + tam + 'px;' +
            'object-fit:contain;opacity:' + rnd(0.55, 0.9).toFixed(2) + ';' +
            'filter:' + sorteia(FILTROS_QUEDA) + ';';
        caixa.appendChild(el);

        const deriva = rnd(-60, 60), giro = rnd(-200, 200);
        const anim = el.animate([
            { transform: 'translate(0px, -80px) rotate(0deg)' },
            { transform: 'translate(' + deriva + 'px, ' + (altura + 80) + 'px) rotate(' + giro + 'deg)' },
        ], { duration: rnd(8, 16) * 1000, iterations: Infinity, easing: 'linear' });
        anim.currentTime = rnd(0, 8000); // espalha pela tela já no início
    }
    document.body.appendChild(caixa);
}

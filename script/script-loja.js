// ─── Loja de Temas ───────────────────────────────────────────────────────────
// Aplica tema via classe no body + atualiza imagens/textos do mascote.
// Não injeta mais CSS inline — tudo via variáveis CSS em style.css.

const TEMAS_CONFIG = {
    padrao:      { emoji: '🐸', nome: 'Sapinho',    prefixo: 'sapo',        ext: 'jpg' },
    cinnamoroll: { emoji: '☁️', nome: 'Cinnamoroll', prefixo: 'cinnamoroll', ext: 'png' },
    pompompurin: { emoji: '🍮', nome: 'Pompompurin', prefixo: 'pompompurin', ext: 'png' },
};

const SWATCHES = {
    padrao:      ['#5BAD6F','#A8D9B3','#EDF7F0','#2D7A42'],
    cinnamoroll: ['#5B9BD6','#A8CAFE','#EEF5FD','#E8C6E8'],
    pompompurin: ['#D4A017','#F5D97A','#FDF8E8','#8B4A0A'],
};

function aplicarTema(temaNome) {
    if (!TEMAS_CONFIG[temaNome]) temaNome = 'padrao';
    const t = TEMAS_CONFIG[temaNome];

    // Troca classe no body
    document.body.classList.remove('tema-cinnamoroll', 'tema-pompompurin');
    if (temaNome !== 'padrao') document.body.classList.add(`tema-${temaNome}`);

    localStorage.setItem('tema-atual', temaNome);

    // Título
    const titulo = document.getElementById('titulo-principal');
    if (titulo) titulo.textContent = `${t.emoji} Controle de Ponto ${t.emoji}`;

    // Mascote do header
    const headerMascote = document.getElementById('header-mascote');
    if (headerMascote) {
        headerMascote.src = `img/${t.prefixo}-neutro.${t.ext}`;
        headerMascote.alt = t.nome;
    }

    // Título da seção de status
    const tituloStatus = document.querySelector('#sapo-status h2');
    if (tituloStatus) tituloStatus.textContent = `${t.emoji} Status d${temaNome==='pompompurin'?'o':temaNome==='cinnamoroll'?'o':'o'} ${t.nome}`;

    // Mascote de status — preserva o estado atual (feliz/triste/rico/neutro)
    const imgStatus = document.getElementById('sapo-img');
    if (imgStatus) {
        const src    = imgStatus.src;
        const estado = src.includes('feliz') ? 'feliz' :
                       src.includes('triste') ? 'triste' :
                       src.includes('rico') ? 'rico' : 'neutro';
        imgStatus.src = `img/${t.prefixo}-${estado}.${t.ext}`;
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

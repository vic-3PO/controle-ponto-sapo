// Arquivo para gerenciar a loja de temas
document.addEventListener('DOMContentLoaded', () => {
    carregarTemaAtual();
});

// Temas disponíveis
const temas = {
    padrao: {
        nome: "Tema Padrão",
        corPrimaria: "#4b7d57",
        corSecundaria: "#a3d49f",
        corFundo: "#eef7e6",
        corGradiente: "linear-gradient(to bottom, #d4f3c7, #eaf9e0)",
        corTexto: "#3a5a40",
        corBotao: "#4CAF50",
        corBotaoHover: "#3a5a40",
        emoji: "🐸",
        corModalFrog: "#808080"
    },
    cinnamoroll: {
        nome: "Tema Cinnamoroll",
        corPrimaria: "#6eb5ff",
        corSecundaria: "#c9e3ff",
        corFundo: "#f0f8ff",
        corGradiente: "linear-gradient(to bottom, #c9e3ff, #f0f8ff)",
        corTexto: "#4682b4",
        corBotao: "#6eb5ff",
        corBotaoHover: "#4682b4",
        emoji: "☁️",
        corModalFrog: "#4682b4"
    },
    pompompurin: {
        nome: "Tema Pompompurin",
        corPrimaria: "#ffb347",
        corSecundaria: "#ffe0b2",
        corFundo: "#fff8e1",
        corGradiente: "linear-gradient(to bottom, #ffe0b2, #fff8e1)",
        corTexto: "#b25900",
        corBotao: "#ffb347",
        corBotaoHover: "#b25900",
        emoji: "🍮",
        corModalFrog: "#b25900"
    }
};

// Função para aplicar o tema selecionado
function aplicarTema(temaNome) {
    if (!temas[temaNome]) return;

    const tema = temas[temaNome];

    // Criar ou atualizar o estilo personalizado
    let estiloTema = document.getElementById('tema-personalizado');
    if (!estiloTema) {
        estiloTema = document.createElement('style');
        estiloTema.id = 'tema-personalizado';
        document.head.appendChild(estiloTema);
    }

    // Aplicar as cores do tema
    estiloTema.textContent = `
        body {
            background-color: ${tema.corFundo};
            color: ${tema.corTexto};
        }
        
        header {
            background: ${tema.corGradiente};
            border-bottom: 2px solid ${tema.corSecundaria};
        }
        
        header h1 {
            color: ${tema.corPrimaria};
        }
        
        #config-horario, #sapo-status, #seletor-mes, .secao-jogos, .secao-quiz, .secao-loja {
            background-color: ${tema.corSecundaria};
            border: 2px solid ${tema.corPrimaria};
            border-radius: 10px;
        }
        
        #sapo-status {
            position: relative;
            overflow: hidden;
        }
        
        #sapo-status::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${temaNome === 'cinnamoroll' ?
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cpath d=\'M10 0 L20 10 L10 20 L0 10 Z\' fill=\'%23c9e3ff\' /%3E%3C/svg%3E")' :
            temaNome === 'pompompurin' ?
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'5\' fill=\'%23ffe0b2\' /%3E%3C/svg%3E")' :
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cpath d=\'M0 0 L20 0 L20 20 L0 20 Z\' fill=\'%23d4f3c7\' /%3E%3C/svg%3E")'};
            opacity: 0.2;
            z-index: 0;
        }
        
        #sapo-status > * {
            position: relative;
            z-index: 1;
        }
        
        .button {
            background-color: ${tema.corBotao};
        }
        
        .button:hover {
            background-color: ${tema.corBotaoHover};
        }
        
        #tabela-ponto thead {
            background-color: ${tema.corSecundaria};
            color: ${tema.corTexto};
        }
        
        #tabela-ponto th, #tabela-ponto td {
            border: 1px solid ${tema.corSecundaria};
        }
        
        footer {
            background-color: ${tema.corSecundaria};
            border-top: 2px solid ${tema.corPrimaria};
            color: ${tema.corPrimaria};
        }
        
        .quiz-tab.active {
            background: ${tema.corBotao};
        }
        
        .quiz-tab {
            background: ${tema.corSecundaria};
        }
        
        .modal-header {
            background-color: ${tema.corSecundaria};
            color: ${tema.corPrimaria};
        }
        
        .modal-footer {
            border-top: 2px solid ${tema.corSecundaria};
        }
        
        .frog {
            color: ${tema.corModalFrog};
        }
        
        #sapo-status h2 {
            color: ${tema.corPrimaria};
        }
        
        #sapo-status img {
            width: 150px;
            height: auto;
            margin: 10px 0;
            border-radius: 50%;
            border: 3px solid ${tema.corPrimaria};
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        #sapo-status img:hover {
            transform: scale(1.05);
        }
        
        #sapo-status p {
            color: ${tema.corTexto};
            font-weight: bold;
            padding: 10px;
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 10px;
            display: inline-block;
        }
        
        #config-horario h2 {
            color: ${tema.corPrimaria};
        }
        
        #config-horario label {
            color: ${tema.corTexto};
        }
        
        #config-horario input {
            border: 2px solid ${tema.corSecundaria};
            background-color: ${tema.corFundo};
        }
        
        #seletor-mes label {
            color: ${tema.corTexto};
        }
        
        #meses {
            border: 2px solid ${tema.corSecundaria};
            background-color: ${tema.corFundo};
            color: ${tema.corTexto};
        }
        
        #meses:hover {
            background-color: ${tema.corSecundaria};
            color: ${tema.corPrimaria};
            border-color: ${tema.corPrimaria};
        }
        
        .tema-card {
            border: 2px solid ${tema.corSecundaria};
            background-color: ${tema.corFundo};
        }
        
        .tema-card:hover {
            border-color: ${tema.corPrimaria};
            box-shadow: 0 0 10px ${tema.corSecundaria};
        }
    `;

    // Atualizar emojis no cabeçalho e rodapé
    document.querySelector('header h1').textContent = `${tema.emoji} Controle de Ponto ${tema.emoji}`;
    document.querySelector('footer p').textContent = `${tema.emoji} Feito com carinho por sapinhos no lago ${tema.emoji}`;

    // Atualizar o título da seção de status
    const tituloStatus = document.querySelector('#sapo-status h2');
    if (tituloStatus) {
        if (temaNome === 'cinnamoroll') {
            tituloStatus.textContent = `☁️ Status do Cinnamoroll`;
        } else if (temaNome === 'pompompurin') {
            tituloStatus.textContent = `🍮 Status do Pompompurin`;
        } else {
            tituloStatus.textContent = `🐸 Status do Sapinho`;
        }
    }

    // Atualizar a imagem do status
    const imagemStatus = document.getElementById('sapo-img');
    if (imagemStatus) {
        const estadoAtual = imagemStatus.src.includes('feliz') ? 'feliz' :
            imagemStatus.src.includes('triste') ? 'triste' :
                imagemStatus.src.includes('rico') ? 'rico' : 'neutro';

        imagemStatus.src = `img/${temaNome === 'cinnamoroll' ? 'cinnamoroll' :
            temaNome === 'pompompurin' ? 'pompompurin' : 'sapo'}-${estadoAtual}.${temaNome === 'padrao' ? 'jpg' : 'png'}`;
    }

    // Atualizar mensagem do status
    const mensagemStatus = document.getElementById('sapo-mensagem');
    if (mensagemStatus) {
        const textoAtual = mensagemStatus.textContent;
        let novoTexto = textoAtual;

        if (temaNome === 'cinnamoroll') {
            novoTexto = textoAtual.replace('Sapo', 'Cinnamoroll');
        } else if (temaNome === 'pompompurin') {
            novoTexto = textoAtual.replace('Sapo', 'Pompompurin');
        } else {
            novoTexto = textoAtual.replace('Cinnamoroll', 'Sapo').replace('Pompompurin', 'Sapo');
        }

        // Adicionar animação ao status
        const statusContainer = document.getElementById('sapo-status');
        if (statusContainer) {
            // Remover animações anteriores
            statusContainer.classList.remove('tema-padrao-anim', 'tema-cinnamoroll-anim', 'tema-pompompurin-anim');

            // Adicionar nova animação
            statusContainer.classList.add(`tema-${temaNome}-anim`);
        }

        // Adicionar elementos decorativos ao status
        let elementosDecorativos = statusContainer.querySelectorAll('.elemento-decorativo');
        elementosDecorativos.forEach(el => el.remove()); // Remover elementos existentes

        if (temaNome === 'cinnamoroll') {
            // Adicionar nuvens para o Cinnamoroll
            for (let i = 0; i < 3; i++) {
                const nuvem = document.createElement('div');
                nuvem.className = 'elemento-decorativo nuvem';
                nuvem.style.left = `${Math.random() * 80 + 10}%`;
                nuvem.style.top = `${Math.random() * 40 + 5}%`;
                nuvem.style.opacity = '0.3';
                nuvem.style.position = 'absolute';
                nuvem.style.zIndex = '0';
                nuvem.style.fontSize = `${Math.random() * 20 + 20}px`;
                nuvem.textContent = '☁️';
                statusContainer.appendChild(nuvem);
            }
        } else if (temaNome === 'pompompurin') {
            // Adicionar pudins para o Pompompurin
            for (let i = 0; i < 3; i++) {
                const pudim = document.createElement('div');
                pudim.className = 'elemento-decorativo pudim';
                pudim.style.left = `${Math.random() * 80 + 10}%`;
                pudim.style.top = `${Math.random() * 40 + 5}%`;
                pudim.style.opacity = '0.3';
                pudim.style.position = 'absolute';
                pudim.style.zIndex = '0';
                pudim.style.fontSize = `${Math.random() * 20 + 20}px`;
                pudim.textContent = '🍮';
                statusContainer.appendChild(pudim);
            }
            mensagemStatus.textContent = novoTexto;
        }
        document.querySelectorAll('.tema-card button').forEach(btn => {
            btn.classList.remove('tema-ativo');
            btn.textContent = 'Aplicar';
        });

        const botaoAtivo = document.querySelector(`.tema-card[data-tema="${temaNome}"] button`);
        if (botaoAtivo) {
            botaoAtivo.classList.add('tema-ativo');
            botaoAtivo.textContent = 'Ativo';
        }

        // Salvar a preferência do usuário
        localStorage.setItem('tema-atual', temaNome);
    }
}

// Função para carregar o tema salvo
function carregarTemaAtual() {
    const temaSalvo = localStorage.getItem('tema-atual') || 'padrao';
    aplicarTema(temaSalvo);
}

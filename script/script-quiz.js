const perguntas = [
    {
        nivel: "Fácil",
        pergunta: "O que é geopolítica?",
        alternativas: [
            "A) Estudo da influência da geografia no poder e nas relações internacionais",
            "B) Análise exclusiva das fronteiras políticas",
            "C) Estudo das relações econômicas entre países",
            "D) Análise dos fenômenos culturais isoladamente"
        ],
        resposta: "A"
    },
    {
        nivel: "Fácil",
        pergunta: "Qual é o país com a maior extensão territorial do mundo?",
        alternativas: ["A) Rússia", "B) Canadá", "C) Estados Unidos", "D) China"],
        resposta: "A"
    },
    {
        nivel: "Médio",
        pergunta: "Qual teoria geopolítica foi proposta por Halford Mackinder?",
        alternativas: ["A) Teoria do Rim Vital", "B) Teoria do Heartland", "C) Teoria do Front Remoto", "D) Teoria do Poder Marítimo"],
        resposta: "B"
    },
    {
        nivel: "Médio",
        pergunta: "Quem foi Alfred Mahan e qual sua principal contribuição para o pensamento geopolítico?",
        alternativas: ["A) Geógrafo que estudou a influência das fronteiras naturais", "B) Historiador das relações internacionais", "C) Teórico naval que destacou a importância do poder marítimo", "D) Economista focado em rotas comerciais terrestres"],
        resposta: "C"
    },
    {
        nivel: "Fácil",
        pergunta: "O que significa o termo 'soft power'?",
        alternativas: ["A) Poder militar", "B) Poder econômico", "C) Capacidade de atrair e influenciar por meio de cultura e diplomacia", "D) Poder coercitivo"],
        resposta: "C"
    },
    {
        nivel: "Fácil",
        pergunta: "Qual a importância do Canal de Suez na geopolítica mundial?",
        alternativas: ["A) Facilita o transporte marítimo entre Europa e Ásia", "B) Conecta o Oceano Atlântico ao Pacífico", "C) É a principal rota de exportação dos EUA", "D) Não possui relevância estratégica"],
        resposta: "A"
    },
    {
        nivel: "Médio",
        pergunta: "Qual teoria enfatiza a importância do controle dos mares para o poder global?",
        alternativas: ["A) Teoria do Heartland", "B) Teoria do Rim Vital", "C) Teoria Marítima de Alfred Mahan", "D) Teoria do Poder Terrestre"],
        resposta: "C"
    },
    {
        nivel: "Fácil",
        pergunta: "O que foi a Doutrina Monroe?",
        alternativas: ["A) Política de intervenção dos EUA na Europa", "B) Política de não intervenção na América Latina", "C) Declaração de que qualquer intervenção europeia no Hemisfério Ocidental seria vista como ameaça", "D) Estratégia de expansão territorial dos EUA"],
        resposta: "C"
    },
    {
        nivel: "Fácil",
        pergunta: "Qual dos seguintes países fazia parte do 'Eixo' na Segunda Guerra Mundial?",
        alternativas: ["A) França", "B) União Soviética", "C) Alemanha", "D) Reino Unido"],
        resposta: "C"
    },
    {
        nivel: "Médio",
        pergunta: "O que caracteriza um mundo 'unipolar' na teoria das relações internacionais?",
        alternativas: ["A) Distribuição equilibrada de poder entre diversos países", "B) Domínio de uma única potência global", "C) Sistema dividido em dois grandes blocos", "D) Isolamento de todas as nações"],
        resposta: "B"
    },
    {
        nivel: "Difícil",
        pergunta: "Qual conceito defende que as características naturais – como relevo, clima e hidrografia – determinam, em grande medida, as estruturas políticas e sociais de um país?",
        alternativas: ["A) Determinismo geográfico", "B) Realpolitik", "C) Geopolítica construtivista", "D) Globalização"],
        resposta: "A"
    },
    {
        nivel: "Médio",
        pergunta: "Qual foi a importância histórica da Rota da Seda?",
        alternativas: ["A) Serviu apenas como um caminho para o comércio de especiarias", "B) Facilitou intercâmbios culturais, comerciais e políticos entre o Oriente e o Ocidente", "C) Foi uma rota exclusiva para missões militares", "D) Não teve impacto relevante nas relações internacionais"],
        resposta: "B"
    },
    {
        nivel: "Médio",
        pergunta: "Na geopolítica, o conceito de 'realpolitik' refere-se a:",
        alternativas: ["A) Uma política baseada em ideologias utópicas", "B) Uma abordagem pragmática que prioriza os interesses nacionais e a realidade dos fatos", "C) A política de intervenção humanitária em massa", "D) Uma estratégia de isolamento absoluto"],
        resposta: "B"
    },
    {
        nivel: "Médio",
        pergunta: "Quais dos fatores a seguir foram fundamentais para o início da Guerra Fria?",
        alternativas: ["A) Conflitos religiosos e disputas territoriais locais", "B) Diferenças ideológicas entre capitalismo e comunismo, rivalidades militares e questões territoriais", "C) Apenas divergências econômicas", "D) Exclusivamente a corrida armamentista nuclear"],
        resposta: "B"
    },
    {
        nivel: "Difícil",
        pergunta: "O que significa a expressão 'O Fim da História', popularizada por Francis Fukuyama?",
        alternativas: ["A) O encerramento dos conflitos militares globais", "B) O triunfo definitivo da democracia liberal e do capitalismo como modelo final", "C) O colapso irreversível das ideologias políticas", "D) O término dos estudos históricos como disciplina"],
        resposta: "B"
    }
];

const quizContainer = document.getElementById("quiz-container");
let currentQuestionIndex = 0; // Índice da questão ativa
let currentModalIndex = null; // Índice da pergunta no modal

function renderQuiz() {
    quizContainer.innerHTML = ""; // Limpar conteúdo anterior

    // Renderiza os botões para cada pergunta
    perguntas.forEach((questao, index) => {
        const button = document.createElement("button");
        button.classList.add("button");
        button.innerHTML = `Pergunta ${index + 1}`;
        button.onclick = () => abrirQuizModal(index); // Abre o modal da pergunta
        quizContainer.appendChild(button);
    });
}

// Função para abrir o modal
// Função para abrir o "quizModal"
function abrirQuizModal(index) {
    currentModalIndex = index;
    const questao = perguntas[index];

    // Criação do "quizModal"
    const quizModal = document.createElement("div");
    quizModal.classList.add("quiz-modal");
    quizModal.innerHTML = `
        <div class="quiz-modal-content">
            <span class="close" onclick="fecharQuizModal()">&times;</span>
            <h3>${questao.pergunta}</h3>
            <p><strong>Nível:</strong> ${questao.nivel}</p>
            ${questao.alternativas.map((alt, i) => `
                <label>
                    <input type="radio" name="pergunta${index}" value="${alt[0]}">
                    ${alt}
                </label><br>
            `).join("")}
            <button class="button" onclick="responder()">Responder</button>
            <div id="respostaFeedback"></div>
        </div>
    `;
    document.body.appendChild(quizModal);
}

// Função para fechar o "quizModal"
function fecharQuizModal() {
    const quizModal = document.querySelector(".quiz-modal");
    if (quizModal) quizModal.remove();
}


// Função para responder a pergunta
function responder() {
    const radios = document.getElementsByName(`pergunta${currentModalIndex}`);
    let respostaSelecionada = null;
    radios.forEach(radio => {
        if (radio.checked) {
            respostaSelecionada = radio.value;
        }
    });

    if (!respostaSelecionada) {
        alert("Selecione uma resposta!");
        return;
    }

    const questao = perguntas[currentModalIndex];
    const feedbackDiv = document.getElementById("respostaFeedback");

    if (respostaSelecionada === questao.resposta) {
        feedbackDiv.innerHTML = `<p>✅ Resposta correta!</p>`;
    } else {
        feedbackDiv.innerHTML = `<p>❌ Resposta incorreta! A resposta correta é: ${questao.resposta}</p>`;
    }

    // Desabilita as opções de resposta
    radios.forEach(radio => {
        radio.disabled = true;
    });
}


// Função para reiniciar o quiz
function reiniciarQuiz() {
    currentQuestionIndex = 0;
    renderQuiz();
}

// Carrega o quiz quando a página estiver pronta
document.addEventListener("DOMContentLoaded", renderQuiz);

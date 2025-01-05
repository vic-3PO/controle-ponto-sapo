document.addEventListener('DOMContentLoaded', () => {
    preencherSeletorMeses();
    carregarMesAtual();
    carregarDados();
    carregarConfiguracoesHorarios();
});

function salvarConfiguracoesHorarios() {
    const horarioEntrada = document.getElementById('horario-entrada').value;
    const horarioSaida = document.getElementById('horario-saida').value;
    const pausaInicio = document.getElementById('pausa-inicio').value;
    const pausaFim = document.getElementById('pausa-fim').value;

    const horarios = {
        entrada: horarioEntrada,
        saida: horarioSaida,
        pausaInicio: pausaInicio,
        pausaFim: pausaFim,
    };

    localStorage.setItem('configuracoesHorarios', JSON.stringify(horarios));
}

function carregarConfiguracoesHorarios() {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoesHorarios'));

    if (configuracoes) {
        document.getElementById('horario-entrada').value = configuracoes.entrada || '14:50';
        document.getElementById('horario-saida').value = configuracoes.saida || '21:30';
        document.getElementById('pausa-inicio').value = configuracoes.pausaInicio || '16:00';
        document.getElementById('pausa-fim').value = configuracoes.pausaFim || '16:30';
    }
}

// Adicionando evento de input para salvar as configurações de horário
document.getElementById('horario-entrada').addEventListener('input', salvarConfiguracoesHorarios);
document.getElementById('horario-saida').addEventListener('input', salvarConfiguracoesHorarios);
document.getElementById('pausa-inicio').addEventListener('input', salvarConfiguracoesHorarios);
document.getElementById('pausa-fim').addEventListener('input', salvarConfiguracoesHorarios);


function preencherSeletorMeses() {
    const seletorMeses = document.getElementById('meses');
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const hoje = new Date();
    const mesAtual = hoje.getMonth(); // Mês atual (0-11)

    meses.forEach((mes, index) => {
        const opcao = document.createElement('option');
        opcao.value = index;
        opcao.textContent = mes;
        if (index === mesAtual) opcao.selected = true; // Seleciona o mês atual por padrão
        seletorMeses.appendChild(opcao);
    });

    seletorMeses.addEventListener('change', () => {
        salvarMesSelecionado();
        carregarDados();
    });
}

function salvarMesSelecionado() {
    const seletorMeses = document.getElementById('meses');
    const mesSelecionado = seletorMeses.value;
    localStorage.setItem('mesSelecionado', mesSelecionado);
}

function carregarMesAtual() {
    const mesSelecionado = localStorage.getItem('mesSelecionado') || new Date().getMonth();
    const seletorMeses = document.getElementById('meses');
    seletorMeses.value = mesSelecionado;
    gerarTabela(new Date().getFullYear(), mesSelecionado);
}

function gerarTabela(ano, mes) {
    const tabelaBody = document.querySelector('#tabela-ponto tbody');
    tabelaBody.innerHTML = ''; // Limpa a tabela antes de preencher

    const diasNoMes = new Date(ano, mes + 1, 0).getDate(); // Total de dias no mês

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const linha = document.createElement('tr');

        // Coluna do dia
        const colunaDia = document.createElement('td');
        colunaDia.innerText = `${dia}/${mes + 1}`;
        linha.appendChild(colunaDia);

        // Colunas de entrada, saída, pausa e total
        ['entrada', 'saida', 'pausa-inicio', 'pausa-fim', 'total'].forEach(campo => {
            const coluna = document.createElement('td');
            if (campo === 'entrada' || campo === 'saida' || campo === 'pausa-inicio' || campo === 'pausa-fim') {
                const input = document.createElement('input');
                input.type = 'time';
                input.dataset.dia = dia;
                input.dataset.mes = mes;
                input.dataset.ano = ano;
                input.dataset.campo = campo;
                input.addEventListener('input', salvarDados);
                coluna.appendChild(input);
            } else {
                coluna.innerText = '--:--';
                coluna.classList.add('total-horas');
            }
            linha.appendChild(coluna);
        });

        tabelaBody.appendChild(linha);
    }
}

function salvarDados() {
    const dia = this.dataset.dia;
    const mes = this.dataset.mes;
    const ano = this.dataset.ano;
    const campo = this.dataset.campo;
    const valor = this.value;

    console.log(`Salvando dados: Dia: ${dia}, Campo: ${campo}, Valor: ${valor}`);

    // Obter os dados do localStorage
    const chave = `${ano}-${mes}`;
    const dados = JSON.parse(localStorage.getItem(chave)) || {};

    if (!dados[dia]) {
        dados[dia] = {};
    }

    // Salvar o campo atualizado
    dados[dia][campo] = valor;
    localStorage.setItem(chave, JSON.stringify(dados));

    // Atualizar o total automaticamente
    if (campo === 'entrada' || campo === 'saida' || campo === 'pausa-inicio' || campo === 'pausa-fim') {
        atualizarTotal(dia, dados[dia], mes, ano);
        atualizarStatusSapo(dia, dados[dia], mes, ano);  // Atualiza o status do sapo aqui
    }
}

function carregarDados() {
    const seletorMeses = document.getElementById('meses');
    const mesSelecionado = parseInt(seletorMeses.value, 10);
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();

    gerarTabela(anoAtual, mesSelecionado);

    const chave = `${anoAtual}-${mesSelecionado}`;
    const dados = JSON.parse(localStorage.getItem(chave)) || {};

    Object.keys(dados).forEach(dia => {
        const registro = dados[dia];
        Object.keys(registro).forEach(campo => {
            const input = document.querySelector(`input[data-dia="${dia}"][data-campo="${campo}"]`);
            if (input) {
                input.value = registro[campo];
            }
        });

        // Atualizar o total para cada dia
        atualizarTotal(dia, registro, mesSelecionado, anoAtual);
    });
}


function carregarDados() {
    const seletorMeses = document.getElementById('meses');
    const mesSelecionado = parseInt(seletorMeses.value, 10);
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();

    gerarTabela(anoAtual, mesSelecionado);

    const chave = `${anoAtual}-${mesSelecionado}`;
    const dados = JSON.parse(localStorage.getItem(chave)) || {};

    Object.keys(dados).forEach(dia => {
        const registro = dados[dia];
        Object.keys(registro).forEach(campo => {
            const input = document.querySelector(`input[data-dia="${dia}"][data-campo="${campo}"]`);
            if (input) {
                input.value = registro[campo];
            }
        });

        // Atualizar o total para cada dia
        atualizarTotal(dia, registro, mesSelecionado, anoAtual);
    });
}

function atualizarTotal(dia, registro, mes, ano) {
    const entrada = registro.entrada;
    const saida = registro.saida;
    const pausaInicio = registro['pausa-inicio'];
    const pausaFim = registro['pausa-fim'];

    if (entrada && saida) {
        const [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
        const [horaSaida, minutoSaida] = saida.split(':').map(Number);

        // Calcular o total de horas trabalhadas sem incluir a pausa
        const minutosTrabalhados = (horaSaida * 60 + minutoSaida) - (horaEntrada * 60 + minutoEntrada);

        const horas = Math.floor(minutosTrabalhados / 60);
        const minutos = minutosTrabalhados % 60;

        const totalCelula = document.querySelector(`#tabela-ponto tbody tr:nth-child(${dia}) .total-horas`);
        if (totalCelula) {
            totalCelula.innerText = minutosTrabalhados > 0 ? `${horas}h ${minutos}min` : '--:--';
        }
    }
}

function atualizarStatusSapo(dia, registro, mes, ano) {
    const entrada = registro.entrada;
    const saida = registro.saida;
    const imagemSapo = document.getElementById('sapo-img');
    const statusSapo = document.getElementById('sapo-mensagem');

    console.log(`Dia: ${dia}, Entrada: ${entrada}, Saída: ${saida}`);

    if (entrada && saida) {
        const horarioEntradaConfig = document.getElementById('horario-entrada').value;
        const horarioSaidaConfig = document.getElementById('horario-saida').value;

        const [horaEntradaConfig, minutoEntradaConfig] = horarioEntradaConfig.split(':').map(Number);
        const [horaSaidaConfig, minutoSaidaConfig] = horarioSaidaConfig.split(':').map(Number);

        const [horaEntradaRegistro, minutoEntradaRegistro] = entrada.split(':').map(Number);
        const [horaSaidaRegistro, minutoSaidaRegistro] = saida.split(':').map(Number);

        const minutosEntradaConfig = horaEntradaConfig * 60 + minutoEntradaConfig;
        const minutosSaidaConfig = horaSaidaConfig * 60 + minutoSaidaConfig;
        const minutosEntradaRegistro = horaEntradaRegistro * 60 + minutoEntradaRegistro;
        let minutosSaidaRegistro = horaSaidaRegistro * 60 + minutoSaidaRegistro;

        console.log(`Minutos de entrada configurado: ${minutosEntradaConfig}, minutos de saída configurado: ${minutosSaidaConfig}`);
        console.log(`Minutos de entrada registrado: ${minutosEntradaRegistro}, minutos de saída registrado: ${minutosSaidaRegistro}`);

        // Se o horário de saída registrado ultrapassar a meia-noite, ajustamos para o próximo dia
        if (minutosSaidaRegistro < minutosEntradaRegistro) {
            minutosSaidaRegistro += 24 * 60; // Adiciona 24 horas em minutos
        }

        // Calcular a diferença de minutos trabalhados
        let minutosTrabalhados = minutosSaidaRegistro - minutosEntradaRegistro;

        // Ajuste no caso de minutos negativos
        if (minutosTrabalhados < 0) {
            minutosTrabalhados += 24 * 60; // Ajusta caso tenha ultrapassado para o dia seguinte
        }

        const horas = Math.floor(minutosTrabalhados / 60);
        const minutos = minutosTrabalhados % 60;

        console.log(`Minutos trabalhados: ${minutosTrabalhados}, Horas: ${horas}, Minutos: ${minutos}`);

        const totalCelula = document.querySelector(`#tabela-ponto tbody tr:nth-child(${dia}) .total-horas`);
        if (totalCelula) {
            totalCelula.innerText = minutosTrabalhados > 0 ? `${horas}h ${minutos}min` : '--:--';
        }

        const horaExtraEntrada = minutosEntradaRegistro < minutosEntradaConfig;  // Entrada antecipada
        const horaExtraSaida = minutosSaidaRegistro > minutosSaidaConfig;  // Saída tardia
        const horasMenosTrabalhadas = minutosTrabalhados < (minutosSaidaConfig - minutosEntradaConfig); // Menos horas trabalhadas

        if (horaExtraEntrada || horaExtraSaida) {
            imagemSapo.src = "sapo-rico.jpg";  // Hora extra
            statusSapo.textContent = "Sapo rico, fez hora extra!";
            console.log("Sapo rico - Hora extra");
        } else if (horasMenosTrabalhadas) {
            imagemSapo.src = "sapo-triste.jpg";  // Menos horas trabalhadas
            statusSapo.textContent = "Sapo triste, fez menos horas que o esperado.";
            console.log("Sapo triste - Menos horas trabalhadas");
        } else {
            imagemSapo.src = "sapo-feliz.jpg";  // Dentro do horário
            statusSapo.textContent = "Sapo feliz, fez o horário certinho!";
            console.log("Sapo feliz");
        }
    } else {
        imagemSapo.src = "sapo-neutro.jpg"; // Sem registros
        statusSapo.textContent = "Sapo neutro, sem registros ainda.";
        console.log("Sapo neutro");
    }
}




const clearButton = document.getElementById('clearButton');
const modal = document.getElementById('myModal');
const cancelButton = document.getElementById('cancelButton');
const confirmButton = document.getElementById('confirmButton');
const frogIcon = document.querySelector('.frog');

// Exibe o modal
clearButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Fecha o modal
cancelButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Limpa os dados e fecha o modal
confirmButton.addEventListener('click', () => {
    localStorage.clear();
    frogIcon.classList.remove('neutral-frog', 'happy-frog', 'rich-frog');
    frogIcon.classList.add('rich-frog'); // Muda para sapo rico após limpar os dados
    modal.style.display = 'none';
    alert('Dados limpos com sucesso!');
});

// Fecha o modal se o usuário clicar fora
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
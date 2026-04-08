document.addEventListener('DOMContentLoaded', () => {
    preencherSeletorAnos();
    preencherSeletorMeses();
    carregarMesAtual();
    carregarDados();
    carregarConfiguracoesHorarios();
});

// ─── Configurações de horário ────────────────────────────────────────────────

function salvarConfiguracoesHorarios() {
    const horarios = {
        entrada: document.getElementById('horario-entrada').value,
        saida: document.getElementById('horario-saida').value,
        pausaInicio: document.getElementById('pausa-inicio').value,
        pausaFim: document.getElementById('pausa-fim').value,
    };
    localStorage.setItem('configuracoesHorarios', JSON.stringify(horarios));
    carregarDados(); // recalcula tudo ao mudar horário configurado
}

function carregarConfiguracoesHorarios() {
    const conf = JSON.parse(localStorage.getItem('configuracoesHorarios'));
    if (conf) {
        document.getElementById('horario-entrada').value = conf.entrada || '14:50';
        document.getElementById('horario-saida').value = conf.saida || '21:30';
        document.getElementById('pausa-inicio').value = conf.pausaInicio || '16:00';
        document.getElementById('pausa-fim').value = conf.pausaFim || '16:30';
    }
}

document.getElementById('horario-entrada').addEventListener('input', salvarConfiguracoesHorarios);
document.getElementById('horario-saida').addEventListener('input', salvarConfiguracoesHorarios);
document.getElementById('pausa-inicio').addEventListener('input', salvarConfiguracoesHorarios);
document.getElementById('pausa-fim').addEventListener('input', salvarConfiguracoesHorarios);

// ─── Seletores de mês e ano ──────────────────────────────────────────────────

function preencherSeletorMeses() {
    const seletorMeses = document.getElementById('meses');
    const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mesAtual = new Date().getMonth();

    nomesMeses.forEach((nome, index) => {
        const opcao = document.createElement('option');
        opcao.value = index;
        opcao.textContent = nome;
        if (index === mesAtual) opcao.selected = true;
        seletorMeses.appendChild(opcao);
    });

    seletorMeses.addEventListener('change', () => {
        localStorage.setItem('mesSelecionado', seletorMeses.value);
        carregarDados();
    });
}

function preencherSeletorAnos() {
    const seletorAnos = document.getElementById('anos');
    const anoAtual = new Date().getFullYear();
    const anoSalvo = parseInt(localStorage.getItem('anoSelecionado')) || anoAtual;

    for (let ano = anoAtual; ano >= anoAtual - 4; ano--) {
        const opcao = document.createElement('option');
        opcao.value = ano;
        opcao.textContent = ano;
        if (ano === anoSalvo) opcao.selected = true;
        seletorAnos.appendChild(opcao);
    }

    seletorAnos.addEventListener('change', () => {
        localStorage.setItem('anoSelecionado', seletorAnos.value);
        carregarDados();
    });
}

function carregarMesAtual() {
    const mesSalvo = localStorage.getItem('mesSelecionado');
    const anoSalvo = localStorage.getItem('anoSelecionado');

    if (mesSalvo !== null) document.getElementById('meses').value = mesSalvo;
    if (anoSalvo !== null) document.getElementById('anos').value = anoSalvo;
}

// ─── Geração da tabela ───────────────────────────────────────────────────────

function gerarTabela(ano, mes) {
    const tabelaBody = document.querySelector('#tabela-ponto tbody');
    tabelaBody.innerHTML = '';

    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const linha = document.createElement('tr');

        const colunaDia = document.createElement('td');
        colunaDia.innerText = `${dia}/${mes + 1}/${ano}`;
        linha.appendChild(colunaDia);

        ['entrada', 'pausa-inicio', 'pausa-fim', 'saida', 'total', 'status'].forEach(campo => {
            const coluna = document.createElement('td');
            if (['entrada', 'saida', 'pausa-inicio', 'pausa-fim'].includes(campo)) {
                const input = document.createElement('input');
                input.type = 'time';
                input.dataset.dia = dia;
                input.dataset.mes = mes;
                input.dataset.ano = ano;
                input.dataset.campo = campo;
                input.addEventListener('input', salvarDados);
                coluna.appendChild(input);
            } else if (campo === 'total') {
                coluna.innerText = '--:--';
                coluna.classList.add('total-horas');
            } else {
                coluna.innerText = '--';
                coluna.classList.add('status-dia');
            }
            linha.appendChild(coluna);
        });

        tabelaBody.appendChild(linha);
    }
}

// ─── Salvar / carregar dados ──────────────────────────────────────────────────

function salvarDados() {
    const dia = this.dataset.dia;
    const mes = this.dataset.mes;
    const ano = this.dataset.ano;
    const campo = this.dataset.campo;
    const valor = this.value;

    const chave = `${ano}-${mes}`;
    const dados = JSON.parse(localStorage.getItem(chave)) || {};
    if (!dados[dia]) dados[dia] = {};
    dados[dia][campo] = valor;
    localStorage.setItem(chave, JSON.stringify(dados));

    atualizarTotal(dia, dados[dia]);
    atualizarStatusSapo(dia, dados[dia]);
}

function carregarDados() {
    const mesSelecionado = parseInt(document.getElementById('meses').value, 10);
    const anoSelecionado = parseInt(document.getElementById('anos').value, 10);

    gerarTabela(anoSelecionado, mesSelecionado);

    const chave = `${anoSelecionado}-${mesSelecionado}`;
    const dados = JSON.parse(localStorage.getItem(chave)) || {};

    Object.keys(dados).forEach(dia => {
        const registro = dados[dia];
        Object.keys(registro).forEach(campo => {
            const input = document.querySelector(`input[data-dia="${dia}"][data-campo="${campo}"]`);
            if (input) input.value = registro[campo];
        });
        atualizarTotal(dia, registro);
    });
}

// ─── Cálculos de horas ────────────────────────────────────────────────────────

function calcularMinutos(registro) {
    const entrada = registro['entrada'];
    const saida = registro['saida'];
    const pausaInicio = registro['pausa-inicio'];
    const pausaFim = registro['pausa-fim'];

    if (!entrada || !saida) return null;

    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = saida.split(':').map(Number);

    let total = (hS * 60 + mS) - (hE * 60 + mE);
    if (total < 0) total += 24 * 60; // virou meia-noite

    if (pausaInicio && pausaFim) {
        const [hPI, mPI] = pausaInicio.split(':').map(Number);
        const [hPF, mPF] = pausaFim.split(':').map(Number);
        const pausa = (hPF * 60 + mPF) - (hPI * 60 + mPI);
        if (pausa > 0) total -= pausa;
    }

    return total;
}

function calcularMinutosEsperados() {
    const entradaConf = document.getElementById('horario-entrada').value;
    const saidaConf = document.getElementById('horario-saida').value;
    const pausaInicioConf = document.getElementById('pausa-inicio').value;
    const pausaFimConf = document.getElementById('pausa-fim').value;

    if (!entradaConf || !saidaConf) return null;

    const [hE, mE] = entradaConf.split(':').map(Number);
    const [hS, mS] = saidaConf.split(':').map(Number);
    let esperado = (hS * 60 + mS) - (hE * 60 + mE);

    if (pausaInicioConf && pausaFimConf) {
        const [hPI, mPI] = pausaInicioConf.split(':').map(Number);
        const [hPF, mPF] = pausaFimConf.split(':').map(Number);
        const pausa = (hPF * 60 + mPF) - (hPI * 60 + mPI);
        if (pausa > 0) esperado -= pausa;
    }

    return esperado;
}

function formatarTempo(minutos) {
    const h = Math.floor(Math.abs(minutos) / 60);
    const m = Math.abs(minutos) % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

// ─── Atualizar células de total e status ─────────────────────────────────────

function atualizarTotal(dia, registro) {
    const totalMinutos = calcularMinutos(registro);
    const totalCelula = document.querySelector(`#tabela-ponto tbody tr:nth-child(${dia}) .total-horas`);
    const statusCelula = document.querySelector(`#tabela-ponto tbody tr:nth-child(${dia}) .status-dia`);

    if (!totalCelula) return;

    if (totalMinutos === null || totalMinutos <= 0) {
        totalCelula.innerText = '--:--';
        if (statusCelula) {
            statusCelula.innerText = '--';
            statusCelula.style.color = '';
            statusCelula.style.fontWeight = '';
        }
        return;
    }

    totalCelula.innerText = formatarTempo(totalMinutos);

    if (!statusCelula) return;

    const esperado = calcularMinutosEsperados();
    if (esperado === null) return;

    const diff = totalMinutos - esperado;

    if (diff > 5) {
        statusCelula.innerText = `⏰ Hora extra: +${formatarTempo(diff)}`;
        statusCelula.style.color = '#2e7d32';
        statusCelula.style.fontWeight = 'bold';
    } else if (diff < -5) {
        statusCelula.innerText = `⚠ Faltou: -${formatarTempo(diff)}`;
        statusCelula.style.color = '#c62828';
        statusCelula.style.fontWeight = 'bold';
    } else {
        statusCelula.innerText = '✓ No horário';
        statusCelula.style.color = '#1565c0';
        statusCelula.style.fontWeight = 'normal';
    }
}

// ─── Status do sapo ───────────────────────────────────────────────────────────

function atualizarStatusSapo(dia, registro) {
    const imagemSapo = document.getElementById('sapo-img');
    const statusSapo = document.getElementById('sapo-mensagem');

    const temaAtual = localStorage.getItem('tema-atual') || 'padrao';
    const ext = temaAtual === 'padrao' ? 'jpg' : 'png';
    let prefixo = 'sapo';
    let nome = 'Sapo';

    if (temaAtual === 'cinnamoroll') { prefixo = 'cinnamoroll'; nome = 'Cinnamoroll'; }
    else if (temaAtual === 'pompompurin') { prefixo = 'pompompurin'; nome = 'Pompompurin'; }

    const totalMinutos = calcularMinutos(registro);
    const esperado = calcularMinutosEsperados();

    if (totalMinutos !== null && totalMinutos > 0 && esperado !== null) {
        const diff = totalMinutos - esperado;

        if (diff > 5) {
            imagemSapo.src = `img/${prefixo}-rico.${ext}`;
            statusSapo.textContent = `${nome} rico! Fez ${formatarTempo(diff)} de hora extra! 💰`;
        } else if (diff < -5) {
            imagemSapo.src = `img/${prefixo}-triste.${ext}`;
            statusSapo.textContent = `${nome} triste! Faltaram ${formatarTempo(Math.abs(diff))} para completar o horário. 😢`;
        } else {
            imagemSapo.src = `img/${prefixo}-feliz.${ext}`;
            statusSapo.textContent = `${nome} feliz! Fez o horário certinho! ✅`;
        }
    } else {
        imagemSapo.src = `img/${prefixo}-neutro.${ext}`;
        statusSapo.textContent = `${nome} neutro. Sem registros ainda. 💼`;
    }
}

// ─── Modal de limpar dados ────────────────────────────────────────────────────

const clearButton = document.getElementById('clearButton');
const modal = document.getElementById('myModal');
const cancelButton = document.getElementById('cancelButton');
const confirmButton = document.getElementById('confirmButton');
const frogIcon = document.querySelector('.frog');

clearButton.addEventListener('click', () => {
    const temaAtual = localStorage.getItem('tema-atual') || 'padrao';
    frogIcon.textContent = temaAtual === 'cinnamoroll' ? '☁️' : temaAtual === 'pompompurin' ? '🍮' : '🐸';
    modal.style.display = 'block';
});

cancelButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

confirmButton.addEventListener('click', () => {
    const temaAtual = localStorage.getItem('tema-atual') || 'padrao';
    const mesSelecionado = document.getElementById('meses').value;
    const anoSelecionado = document.getElementById('anos').value;

    // Limpa apenas os dados de ponto (preserva tema e preferências de navegação)
    const chave = `${anoSelecionado}-${mesSelecionado}`;
    localStorage.removeItem(chave);

    modal.style.display = 'none';
    carregarDados();
    alert('Dados do mês limpos com sucesso!');
});

window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

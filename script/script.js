// ─── Estado global ────────────────────────────────────────────────────────────
let anoAtual, mesAtual;

const NOMES_SEMANA_CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// ─── Inicialização ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    preencherSeletorAnos();
    preencherSeletorMeses();
    carregarMesAtual();
    carregarDados();
    restaurarSecaoAtiva();
});

// ─── Navegação entre seções ───────────────────────────────────────────────────
function mostrarSecao(secao) {
    ['controle','jogos','quiz','loja'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = (s === secao) ? 'block' : 'none';
    });

    document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.secao === secao);
    });

    localStorage.setItem('secaoAtiva', secao);
}

function restaurarSecaoAtiva() {
    const secao = localStorage.getItem('secaoAtiva') || 'controle';
    mostrarSecao(secao);
}

// ─── Seletores de mês e ano ───────────────────────────────────────────────────
function preencherSeletorMeses() {
    const sel = document.getElementById('meses');
    const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const mesHoje = new Date().getMonth();

    nomes.forEach((nome, i) => {
        const op = document.createElement('option');
        op.value = i;
        op.textContent = nome;
        if (i === mesHoje) op.selected = true;
        sel.appendChild(op);
    });

    sel.addEventListener('change', () => {
        localStorage.setItem('mesSelecionado', sel.value);
        carregarDados();
    });
}

function preencherSeletorAnos() {
    const sel = document.getElementById('anos');
    const anoHoje = new Date().getFullYear();
    const anoSalvo = parseInt(localStorage.getItem('anoSelecionado')) || anoHoje;

    for (let a = anoHoje; a >= anoHoje - 4; a--) {
        const op = document.createElement('option');
        op.value = a;
        op.textContent = a;
        if (a === anoSalvo) op.selected = true;
        sel.appendChild(op);
    }

    sel.addEventListener('change', () => {
        localStorage.setItem('anoSelecionado', sel.value);
        carregarDados();
    });
}

function carregarMesAtual() {
    const ms = localStorage.getItem('mesSelecionado');
    const as = localStorage.getItem('anoSelecionado');
    if (ms !== null) document.getElementById('meses').value = ms;
    if (as !== null) document.getElementById('anos').value  = as;
}

// ─── Geração da tabela ────────────────────────────────────────────────────────
function gerarTabela(ano, mes) {
    const tbody = document.querySelector('#tabela-ponto tbody');
    tbody.innerHTML = '';

    const hoje        = new Date();
    const diasNoMes   = new Date(ano, mes + 1, 0).getDate();
    const LABELS      = ['Entrada','Almoço (início)','Almoço (fim)','Saída','Total','Status'];
    const CAMPOS_EDIT = ['entrada','pausa-inicio','pausa-fim','saida'];

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const date   = new Date(ano, mes, dia);
        const diaSem = date.getDay();
        // diaEFolga: folga pela escala — mas NUNCA bloqueia edição
        const eFolga = typeof diaEFolga === 'function' ? diaEFolga(date) : false;
        const eHoje  = (date.toDateString() === hoje.toDateString());

        const tr = document.createElement('tr');
        if (eFolga) tr.classList.add('dia-folga');
        if (eHoje)  tr.classList.add('dia-hoje');
        tr.dataset.folga = eFolga ? '1' : '0';

        // Coluna dia
        const tdDia = document.createElement('td');
        tdDia.setAttribute('data-label', 'Dia');
        tdDia.innerHTML = `<span class="dia-semana-label">${NOMES_SEMANA_CURTO[diaSem]}</span>
                           <span class="dia-data-num">${dia}/${mes+1}</span>`;
        tr.appendChild(tdDia);

        // Colunas de horário — sempre com inputs (folga é visual, não bloqueia)
        CAMPOS_EDIT.forEach((campo, idx) => {
            const td  = document.createElement('td');
            td.setAttribute('data-label', LABELS[idx]);
            const inp = document.createElement('input');
            inp.type  = 'time';
            inp.dataset.dia   = dia;
            inp.dataset.mes   = mes;
            inp.dataset.ano   = ano;
            inp.dataset.campo = campo;
            inp.addEventListener('input', salvarDados);
            td.appendChild(inp);
            tr.appendChild(td);
        });

        // Coluna total
        const tdTotal = document.createElement('td');
        tdTotal.setAttribute('data-label', 'Total');
        tdTotal.classList.add('total-horas');
        tdTotal.innerHTML = eFolga ? '<span class="chip chip-folga">☀ Folga</span>' : '--:--';
        tr.appendChild(tdTotal);

        // Coluna status
        const tdStatus = document.createElement('td');
        tdStatus.setAttribute('data-label', 'Status');
        tdStatus.classList.add('status-dia');
        tdStatus.textContent = '--';
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
    }
}

// ─── Salvar / carregar dados ──────────────────────────────────────────────────
function salvarDados() {
    const dia   = this.dataset.dia;
    const mes   = this.dataset.mes;
    const ano   = this.dataset.ano;
    const campo = this.dataset.campo;
    const valor = this.value;

    const chave = `${ano}-${mes}`;
    const dados = JSON.parse(localStorage.getItem(chave)) || {};
    if (!dados[dia]) dados[dia] = {};
    dados[dia][campo] = valor;
    localStorage.setItem(chave, JSON.stringify(dados));

    const date = new Date(parseInt(ano), parseInt(mes), parseInt(dia));
    atualizarTotal(dia, dados[dia], date);
    atualizarStatusSapo(dia, dados[dia], date);
}

function carregarDados() {
    mesAtual = parseInt(document.getElementById('meses').value, 10);
    anoAtual = parseInt(document.getElementById('anos').value, 10);

    gerarTabela(anoAtual, mesAtual);

    const chave = `${anoAtual}-${mesAtual}`;
    const dados = JSON.parse(localStorage.getItem(chave)) || {};

    Object.keys(dados).forEach(dia => {
        const reg = dados[dia];
        Object.keys(reg).forEach(campo => {
            const inp = document.querySelector(`input[data-dia="${dia}"][data-campo="${campo}"]`);
            if (inp) inp.value = reg[campo];
        });
        const date = new Date(anoAtual, mesAtual, parseInt(dia));
        atualizarTotal(dia, reg, date);
    });
}

// ─── Cálculo de horas ─────────────────────────────────────────────────────────
function calcularMinutos(registro) {
    const entrada = registro['entrada'];
    const saida   = registro['saida'];
    if (!entrada || !saida) return null;

    const [hE,mE] = entrada.split(':').map(Number);
    const [hS,mS] = saida.split(':').map(Number);
    let total = (hS*60+mS) - (hE*60+mE);
    if (total < 0) total += 1440;

    const pI = registro['pausa-inicio'];
    const pF = registro['pausa-fim'];
    if (pI && pF) {
        const [hPI,mPI] = pI.split(':').map(Number);
        const [hPF,mPF] = pF.split(':').map(Number);
        const pausa = (hPF*60+mPF) - (hPI*60+mPI);
        if (pausa > 0) total -= pausa;
    }

    return total;
}

function formatarTempo(min) {
    const h = Math.floor(Math.abs(min) / 60);
    const m = Math.abs(min) % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

// ─── Atualizar total e status ─────────────────────────────────────────────────
function atualizarTotal(dia, registro, date) {
    if (!date) date = new Date(anoAtual, mesAtual, parseInt(dia));

    const totalMin  = calcularMinutos(registro);
    const totalCell = document.querySelector(`#tabela-ponto tbody tr:nth-child(${dia}) .total-horas`);
    const statCell  = document.querySelector(`#tabela-ponto tbody tr:nth-child(${dia}) .status-dia`);

    if (!totalCell) return;

    if (totalMin === null || totalMin <= 0) {
        const tr2 = totalCell.closest('tr');
        const ehFolga = tr2 && tr2.dataset.folga === '1';
        totalCell.innerHTML = ehFolga ? '<span class="chip chip-folga">☀ Folga</span>' : '--:--';
        if (statCell) statCell.innerHTML = '--';
        return;
    }

    totalCell.textContent = formatarTempo(totalMin);
    if (!statCell) return;

    // Se o dia é folga mas tem horas → trata como trabalhado (override)
    const tr = totalCell.closest('tr');
    const forceWork = tr && tr.dataset.folga === '1';
    const esperado = typeof calcularMinutosEsperadosDia === 'function'
        ? calcularMinutosEsperadosDia(date, forceWork)
        : null;

    if (esperado === null) { statCell.innerHTML = '--'; return; }

    const diff = totalMin - esperado;

    if (diff > 5) {
        statCell.innerHTML = `<span class="chip chip-sucesso">⏰ +${formatarTempo(diff)}</span>`;
    } else if (diff < -5) {
        statCell.innerHTML = `<span class="chip chip-erro">⚠ -${formatarTempo(Math.abs(diff))}</span>`;
    } else {
        statCell.innerHTML = `<span class="chip chip-info">✓ No horário</span>`;
    }
}

// ─── Status do mascote ────────────────────────────────────────────────────────
function atualizarStatusSapo(dia, registro, date) {
    if (!date) date = new Date(anoAtual, mesAtual, parseInt(dia));

    const imgSapo   = document.getElementById('sapo-img');
    const msgSapo   = document.getElementById('sapo-mensagem');
    if (!imgSapo || !msgSapo) return;

    const tema   = localStorage.getItem('tema-atual') || 'padrao';
    const cfg    = { padrao: ['sapo','Sapinho','jpg'], cinnamoroll: ['cinnamoroll','Cinnamoroll','png'], pompompurin: ['pompompurin','Pompompurin','png'] };
    const [pfx, nome, ext] = cfg[tema] || cfg.padrao;

    const totalMin  = calcularMinutos(registro);
    const forceWork = totalMin !== null && typeof diaEFolga === 'function' && diaEFolga(date);
    const esperado  = typeof calcularMinutosEsperadosDia === 'function'
        ? calcularMinutosEsperadosDia(date, forceWork)
        : null;

    let estado, msg;

    if (totalMin !== null && totalMin > 0 && esperado !== null) {
        const diff = totalMin - esperado;
        if (diff > 5) {
            estado = 'rico';
            msg = `${nome} rico! Fez ${formatarTempo(diff)} de hora extra! 💰`;
        } else if (diff < -5) {
            estado = 'triste';
            msg = `${nome} triste! Faltaram ${formatarTempo(Math.abs(diff))} para completar. 😢`;
        } else {
            estado = 'feliz';
            msg = `${nome} feliz! Horário certinho! ✅`;
        }
    } else {
        estado = 'neutro';
        msg = `${nome} neutro. Sem registros ainda. 💼`;
    }

    imgSapo.src = `img/${pfx}-${estado}.${ext}`;
    imgSapo.classList.add('mascote-troca');
    imgSapo.addEventListener('animationend', () => imgSapo.classList.remove('mascote-troca'), { once: true });
    msgSapo.textContent = msg;
}

// ─── Modal de limpar dados ────────────────────────────────────────────────────
const modal         = document.getElementById('myModal');
const clearButton   = document.getElementById('clearButton');
const cancelButton  = document.getElementById('cancelButton');
const confirmButton = document.getElementById('confirmButton');

clearButton.addEventListener('click', () => {
    modal.classList.add('aberto');
});

cancelButton.addEventListener('click', () => {
    modal.classList.remove('aberto');
});

confirmButton.addEventListener('click', () => {
    const ms = document.getElementById('meses').value;
    const as = document.getElementById('anos').value;
    localStorage.removeItem(`${as}-${ms}`);
    modal.classList.remove('aberto');
    carregarDados();
});

window.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('aberto');
});

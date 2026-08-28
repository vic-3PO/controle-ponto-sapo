// ─── Escala de Trabalho ──────────────────────────────────────────────────────
// Estrutura simples: dias que trabalha + jornada padrão + domingo opcional.
// 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb  (igual Date.getDay())

const NOMES_DIAS_CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// ─── Acesso / padrão ──────────────────────────────────────────────────────────

const ESCALA_PADRAO_NOVA = {
    diasSemana:    [1,2,3,4,5,6], // Seg–Sáb
    horasAlvo:     6,
    minutosAlvo:   40,
    pausaMin:      0,
    domingoAtivo:  true,
    domingoHoras:  5,
    domingoMins:   0,
};

function getEscala() {
    try {
        const s = localStorage.getItem('escalaDiaria');
        if (s) {
            const p = JSON.parse(s);
            if ('diasSemana' in p) return { ...ESCALA_PADRAO_NOVA, ...p };
        }
    } catch(e) {}
    return { ...ESCALA_PADRAO_NOVA };
}

function salvarEscala(escala) {
    localStorage.setItem('escalaDiaria', JSON.stringify(escala));
    atualizarResumoConfig();
}

// ─── Migração transparente ────────────────────────────────────────────────────

function migrarDadosAntigos() {
    const raw = localStorage.getItem('escalaDiaria');
    if (!raw) {
        // Migra formato antigo configuracoesHorarios se existir
        const antigo = localStorage.getItem('configuracoesHorarios');
        const escala = { ...ESCALA_PADRAO_NOVA };
        if (antigo) {
            try {
                const c = JSON.parse(antigo);
                const mins = _minsDeFaixa(c.entrada, c.saida, c.pausaInicio, c.pausaFim);
                escala.horasAlvo   = Math.floor(mins / 60);
                escala.minutosAlvo = mins % 60;
            } catch(e) {}
        }
        localStorage.setItem('escalaDiaria', JSON.stringify(escala));
        return;
    }
    try {
        const p = JSON.parse(raw);
        // Já no formato novo?
        if ('diasSemana' in p) return;
        // Formato antigo por dia (0..6) → converter
        const escala = { ...ESCALA_PADRAO_NOVA };
        const dias = [];
        for (let d = 1; d <= 6; d++) {
            if (p[d] && p[d].trabalha !== false) dias.push(d);
        }
        if (dias.length) escala.diasSemana = dias;
        const ref = p[1] || p[2] || {};
        if ('horasAlvo' in ref) {
            escala.horasAlvo   = ref.horasAlvo   || 6;
            escala.minutosAlvo = ref.minutosAlvo || 40;
            escala.pausaMin    = ref.pausaMin    || 0;
        } else if ('entrada' in ref) {
            const m = _minsDeFaixa(ref.entrada, ref.saida, ref.pausaInicio, ref.pausaFim);
            escala.horasAlvo   = Math.floor(m / 60);
            escala.minutosAlvo = m % 60;
        }
        if (p[0]) {
            escala.domingoAtivo = p[0].trabalha !== false;
            if ('horasAlvo' in p[0]) {
                escala.domingoHoras = p[0].horasAlvo || 5;
                escala.domingoMins  = p[0].minutosAlvo || 0;
            }
        }
        localStorage.setItem('escalaDiaria', JSON.stringify(escala));
    } catch(e) {}
}

function _minsDeFaixa(entrada, saida, pausaInicio, pausaFim) {
    if (!entrada || !saida) return 400; // 6h40min padrão
    const [hE,mE] = entrada.split(':').map(Number);
    const [hS,mS] = saida.split(':').map(Number);
    let t = (hS*60+mS) - (hE*60+mE);
    if (t < 0) t += 1440;
    if (pausaInicio && pausaFim) {
        const [hPI,mPI] = pausaInicio.split(':').map(Number);
        const [hPF,mPF] = pausaFim.split(':').map(Number);
        const p = (hPF*60+mPF) - (hPI*60+mPI);
        if (p > 0) t -= p;
    }
    return Math.max(0, t);
}

// ─── Lógica de folga / esperado ───────────────────────────────────────────────

function diaEFolga(date) {
    const d = date.getDay();
    const e = getEscala();
    if (d === 0) return !e.domingoAtivo;
    return !e.diasSemana.includes(d);
}

function calcularMinutosEsperadosDia(date, forceWork) {
    const d = date.getDay();
    const e = getEscala();
    if (d === 0) {
        if (!e.domingoAtivo && !forceWork) return null;
        return e.domingoHoras * 60 + e.domingoMins;
    }
    if (!e.diasSemana.includes(d) && !forceWork) return null;
    const alvo = e.horasAlvo * 60 + e.minutosAlvo;
    return alvo > 0 ? alvo : null;
}

// ─── Resumo no accordion ──────────────────────────────────────────────────────

function atualizarResumoConfig() {
    const el = document.getElementById('config-resumo');
    if (!el) return;
    const e = getEscala();
    const nomes = e.diasSemana.map(d => NOMES_DIAS_CURTO[d]);
    let txt = nomes.length ? `${nomes.join(', ')} · ${e.horasAlvo}h${e.minutosAlvo > 0 ? e.minutosAlvo + 'min' : ''}` : '';
    if (e.pausaMin > 0) txt += ` + ${e.pausaMin}min pausa`;
    if (e.domingoAtivo) txt += ` · Dom ${e.domingoHoras}h${e.domingoMins > 0 ? e.domingoMins + 'min' : ''}`;
    el.textContent = txt || 'Configurar escala';
}

// ─── UI ───────────────────────────────────────────────────────────────────────

function renderizarEscalaGrid() {
    const grid = document.getElementById('escala-grid');
    if (!grid) return;
    const e = getEscala();

    grid.innerHTML = `
        <!-- Chips de dias -->
        <div class="escala-bloco">
            <p class="escala-secao-label">Dias de trabalho</p>
            <div class="escala-chips-dias">
                ${[1,2,3,4,5,6].map(d => `
                    <label class="dia-chip ${e.diasSemana.includes(d) ? 'ativo' : ''}">
                        <input type="checkbox" data-dia="${d}" ${e.diasSemana.includes(d) ? 'checked' : ''}>
                        ${NOMES_DIAS_CURTO[d]}
                    </label>
                `).join('')}
            </div>
        </div>

        <!-- Jornada padrão -->
        <div class="escala-bloco">
            <p class="escala-secao-label">Jornada (dias selecionados)</p>
            <div class="jornada-row">
                <input type="number" id="esc-horas" class="num-input" min="0" max="16" value="${e.horasAlvo}">
                <span class="num-unit">h</span>
                <input type="number" id="esc-mins" class="num-input" min="0" max="59" value="${e.minutosAlvo}">
                <span class="num-unit">min</span>
                <span class="jornada-sep">·</span>
                <span class="jornada-label">Pausa</span>
                <input type="number" id="esc-pausa" class="num-input" min="0" max="180" value="${e.pausaMin}">
                <span class="num-unit">min</span>
            </div>
        </div>

        <!-- Domingo -->
        <div class="escala-bloco escala-bloco-domingo">
            <p class="escala-secao-label">
                <label class="checkbox-label">
                    <input type="checkbox" id="esc-dom-ativo" ${e.domingoAtivo ? 'checked' : ''}>
                    <span>Trabalha aos domingos</span>
                </label>
            </p>
            <div class="jornada-row${e.domingoAtivo ? '' : ' escala-inativo'}" id="esc-dom-jornada">
                <span class="jornada-label">Jornada Dom</span>
                <input type="number" id="esc-dom-horas" class="num-input" min="0" max="16" value="${e.domingoHoras}">
                <span class="num-unit">h</span>
                <input type="number" id="esc-dom-mins" class="num-input" min="0" max="59" value="${e.domingoMins}">
                <span class="num-unit">min</span>
            </div>
        </div>
    `;

    // Chips de dias
    grid.querySelectorAll('.dia-chip input').forEach(cb => {
        cb.addEventListener('change', () => {
            cb.closest('.dia-chip').classList.toggle('ativo', cb.checked);
            salvarDoGrid();
        });
    });

    // Inputs numéricos
    ['esc-horas','esc-mins','esc-pausa','esc-dom-horas','esc-dom-mins'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', salvarDoGrid);
    });

    // Toggle domingo
    const cbDom = document.getElementById('esc-dom-ativo');
    if (cbDom) cbDom.addEventListener('change', () => {
        document.getElementById('esc-dom-jornada').classList.toggle('escala-inativo', !cbDom.checked);
        salvarDoGrid();
    });
}

function salvarDoGrid() {
    const e = { ...getEscala() };

    // Dias
    const dias = [];
    document.querySelectorAll('.dia-chip input:checked').forEach(cb => dias.push(+cb.dataset.dia));
    e.diasSemana = dias;

    // Jornada
    e.horasAlvo   = Math.max(0, parseInt(document.getElementById('esc-horas')?.value)  || 0);
    e.minutosAlvo = Math.min(59, Math.max(0, parseInt(document.getElementById('esc-mins')?.value)  || 0));
    e.pausaMin    = Math.max(0, parseInt(document.getElementById('esc-pausa')?.value) || 0);

    // Domingo
    const cbDom = document.getElementById('esc-dom-ativo');
    e.domingoAtivo = cbDom ? cbDom.checked : false;
    e.domingoHoras = Math.max(0, parseInt(document.getElementById('esc-dom-horas')?.value) || 0);
    e.domingoMins  = Math.min(59, Math.max(0, parseInt(document.getElementById('esc-dom-mins')?.value) || 0));

    salvarEscala(e);
    if (typeof carregarDados === 'function') carregarDados();
}

// ─── Inicialização ────────────────────────────────────────────────────────────
migrarDadosAntigos();

document.addEventListener('DOMContentLoaded', () => {
    renderizarEscalaGrid();
    atualizarResumoConfig();
});

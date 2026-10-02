// ─── Formulário Impossível ────────────────────────────────────────────────────

const TEMPO_PERGUNTA = 30;

// ─── TERMOS: ir para formulário ───────────────────────────────────────────────

function irParaFormulario() {
    const cb = document.getElementById('cb-termos');
    if (cb && !cb.checked) return; // aparência de habilitado, mas não faz nada
    document.getElementById('desafio-termos').style.display = 'none';
    document.getElementById('desafio-form').style.display   = 'block';
    iniciarTimerPergunta();
}

document.addEventListener('DOMContentLoaded', () => {
    // Garante navegação para o desafio mesmo com script.js antigo em cache
    const btnDesafio = document.querySelector('[data-secao="desafio"]');
    if (btnDesafio) {
        btnDesafio.addEventListener('click', () => {
            ['controle','jogos','quiz','loja'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            const s = document.getElementById('desafio');
            if (s) s.style.display = 'block';
            document.querySelectorAll('.nav-pill').forEach(p => {
                p.classList.toggle('active', p.dataset.secao === 'desafio');
            });
        });
    }

    // Pegadinha: marcada, o botão PARECE desabilitado mas funciona.
    // Desmarcada, o botão PARECE habilitado mas não funciona.
    const cbTermos  = document.getElementById('cb-termos');
    const aviso     = document.getElementById('aviso-termos');
    const btnTermos = document.getElementById('btn-termos');
    if (cbTermos && btnTermos) {
        const atualizar = () => {
            btnTermos.classList.toggle('btn-fake-disabled', cbTermos.checked);
            if (aviso) {
                aviso.textContent = cbTermos.checked ? '⚠️ Marcou que leu. Sabemos que é mentira.' : '';
                aviso.classList.toggle('visivel', cbTermos.checked);
            }
        };
        cbTermos.addEventListener('change', atualizar);
        atualizar();
    }

    iniciarVolume();
    iniciarCampoInvisivel();
    iniciarOpcoesFrase();
    iniciarFugitivo();
    iniciarGravidade();
});

// ─── 1. VOLUME (parece vertical, arrasta pro lado) ───────────────────────────

function iniciarVolume() {
    const rangeEl = document.getElementById('range-comprometimento');
    const valEl   = document.getElementById('range-val');
    const fillEl  = document.getElementById('volume-fill');
    if (!rangeEl) return;
    const atualizar = () => {
        valEl.textContent    = rangeEl.value + '%';
        fillEl.style.height  = rangeEl.value + '%';
    };
    rangeEl.addEventListener('input', atualizar);
    atualizar();
}

// ─── 2. CAMPO INVISÍVEL: apague o "in" de "invisível" ────────────────────────

function iniciarCampoInvisivel() {
    const rotulo = document.getElementById('toggle-visivel');
    const campo  = document.getElementById('campo-secreto');
    if (!rotulo || !campo) return;

    const ajustar = () => {
        rotulo.style.width = (rotulo.value.length + 1) + 'ch';
        const txt = rotulo.value.toLowerCase();
        const visivel = txt.includes('visível') && !txt.includes('invisível');
        campo.classList.toggle('visivel', visivel);
        if (!visivel) campo.blur();
    };
    rotulo.addEventListener('input', ajustar);
    ajustar();
}

// ─── 3. BOTÃO 4× CONFIRMAÇÃO ─────────────────────────────────────────────────

let confirmaStep = 0;

const PERGUNTAS_CONFIRMA = [
    { txt: 'Tem certeza que você é humano?',  step: '1 / 4' },
    { txt: 'Tem MESMO certeza?',              step: '2 / 4' },
    { txt: 'Pensa bem antes de responder...', step: '3 / 4' },
    { txt: 'DEFINITIVAMENTE última chance.',  step: '4 / 4' },
];

function abrirConfirmacao() {
    confirmaStep = 0;
    mostrarConfirmaStep();
    document.getElementById('confirm-overlay').classList.add('aberto');
}

function fecharConfirmacao() {
    document.getElementById('confirm-overlay').classList.remove('aberto');
}

function mostrarConfirmaStep() {
    const p   = PERGUNTAS_CONFIRMA[confirmaStep];
    const sim = document.getElementById('confirm-sim');
    const nao = document.getElementById('confirm-nao');

    document.getElementById('confirm-step-label').textContent = `Etapa ${p.step}`;
    document.getElementById('confirm-pergunta').textContent   = p.txt;

    // Os dois botões têm sempre a mesma cor
    if (confirmaStep < 3) {
        sim.textContent = '✓ Sim, sou humano';
        nao.textContent = '✗ Não tenho certeza';
        sim.onclick = () => { confirmaStep++; mostrarConfirmaStep(); };
        nao.onclick = () => {
            fecharConfirmacao();
            confirmaStep = 0;
            setConfirmaStatus('🤔 Tudo bem! Clique de novo quando tiver certeza.', false);
        };
    } else {
        // 4ª pergunta: textos trocados, posição e cor iguais
        sim.textContent = '✗ Não, não sou humano';
        nao.textContent = '✓ Sim, definitivamente!';
        sim.onclick = () => {
            fecharConfirmacao();
            confirmaStep = 0;
            setConfirmaStatus('😈 Você clicou em "Não, não sou humano". Recomece do zero!', false);
        };
        nao.onclick = () => {
            fecharConfirmacao();
            setConfirmaStatus('✅ Humanidade confirmada!', true);
        };
    }
}

function setConfirmaStatus(msg, ok) {
    const el = document.getElementById('confirma-status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? 'var(--sucesso, green)' : 'var(--erro, #c62828)';
}

// ─── 4. FRASE COM TIMER ──────────────────────────────────────────────────────

let timerInterval = null;
let timerSegundos = TEMPO_PERGUNTA;

function iniciarOpcoesFrase() {
    document.querySelectorAll('#opcoes-frase .opcao-frase').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.ok !== '1') {
                dispararDrama('Resposta errada.');
                return;
            }
            document.querySelectorAll('#opcoes-frase .opcao-frase')
                .forEach(b => b.classList.toggle('escolhida', b === btn));
            clearInterval(timerInterval);
        });
    });
}

function iniciarTimerPergunta() {
    clearInterval(timerInterval);
    timerSegundos = TEMPO_PERGUNTA;
    _atualizarTimerUI();

    timerInterval = setInterval(() => {
        const sec = document.getElementById('desafio');
        if (!sec || sec.style.display === 'none') return; // pausa fora da aba
        timerSegundos--;
        _atualizarTimerUI();
        if (timerSegundos <= 0) dispararDrama('Você demorou demais para responder.');
    }, 1000);
}

function _atualizarTimerUI() {
    const num  = document.getElementById('timer-num');
    const fill = document.getElementById('timer-fill');
    if (num)  num.textContent = timerSegundos;
    if (fill) {
        fill.style.width = (timerSegundos / TEMPO_PERGUNTA * 100) + '%';
        fill.classList.toggle('urgente', timerSegundos <= 10);
    }
}

// Apaga o formulário inteiro e volta para os termos
function dispararDrama(motivo) {
    clearInterval(timerInterval);
    fecharConfirmacao();
    resetarFormulario();

    const drama = document.getElementById('drama-apagado');
    document.getElementById('drama-motivo').textContent = motivo;
    drama.style.display = 'flex';
    setTimeout(() => { drama.style.display = 'none'; }, 2800);
}

function resetarFormulario() {
    // textos
    document.querySelectorAll('#desafio-form input[type="text"]').forEach(i => {
        i.value = i.id === 'toggle-visivel' ? '(campo invisível)' : '';
    });
    document.getElementById('toggle-visivel').dispatchEvent(new Event('input'));

    // volume
    const vol = document.getElementById('range-comprometimento');
    vol.value = 50;
    vol.dispatchEvent(new Event('input'));

    // confirmação
    confirmaStep = 0;
    setConfirmaStatus('', false);

    // frase
    document.querySelectorAll('#opcoes-frase .opcao-frase').forEach(b => b.classList.remove('escolhida'));

    // checkbox fugitivo
    resetarFugitivo();

    // bolinha
    resetarGravidade();

    // volta para os termos
    document.getElementById('desafio-form').style.display   = 'none';
    document.getElementById('desafio-termos').style.display = 'block';
    timerSegundos = TEMPO_PERGUNTA;
    _atualizarTimerUI();
}

// ─── 5. CHECKBOX FUGITIVO ────────────────────────────────────────────────────

let tentativasFugitivo = 0;
const MAX_FUGAS = 7;

function iniciarFugitivo() {
    const area     = document.getElementById('fugitivo-area');
    const label    = document.getElementById('label-fugitivo');
    const checkbox = document.getElementById('checkbox-fugitivo');
    if (!area || !label) return;

    const fugir = () => {
        if (checkbox.checked || tentativasFugitivo >= MAX_FUGAS) return;
        tentativasFugitivo++;
        const maxX = Math.max(0, area.clientWidth  - label.offsetWidth  - 8);
        const maxY = Math.max(0, area.clientHeight - label.offsetHeight - 8);
        label.style.left = (4 + Math.random() * maxX) + 'px';
        label.style.top  = (4 + Math.random() * maxY) + 'px';
    };
    label.addEventListener('mouseenter', fugir);
    label.addEventListener('touchstart', fugir, { passive: true });
}

function resetarFugitivo() {
    tentativasFugitivo = 0;
    const label = document.getElementById('label-fugitivo');
    if (!label) return;
    label.style.left = '';
    label.style.top  = '';
    document.getElementById('checkbox-fugitivo').checked = false;
}

// ─── 7. BOLINHA COM GRAVIDADE ────────────────────────────────────────────────

const GRAV = { pos: 0, vel: 0, inclinacao: 0, resolvido: false, noAlvo: 0, ultimo: 0, raf: null };
const GRAV_MAX_GRAUS = 18;

function iniciarGravidade() {
    const stage = document.getElementById('grav-stage');
    if (!stage) return;

    const mover = e => {
        const r = stage.getBoundingClientRect();
        const t = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
        GRAV.inclinacao = t * GRAV_MAX_GRAUS;
    };
    stage.addEventListener('pointerdown', e => {
        if (GRAV.resolvido) return;
        stage.setPointerCapture(e.pointerId);
        stage.style.cursor = 'grabbing';
        mover(e);
        stage.onpointermove = mover;
    });
    const soltar = () => { stage.onpointermove = null; stage.style.cursor = ''; };
    stage.addEventListener('pointerup', soltar);
    stage.addEventListener('pointercancel', soltar);

    resetarGravidade();
    GRAV.raf = requestAnimationFrame(passoGravidade);
}

function resetarGravidade() {
    Object.assign(GRAV, { pos: 0, vel: 0, inclinacao: 0, resolvido: false, noAlvo: 0, ultimo: 0 });
    desenharGravidade();
}

function passoGravidade(agora) {
    GRAV.raf = requestAnimationFrame(passoGravidade);

    const form = document.getElementById('desafio-form');
    if (!form || form.offsetParent === null) { GRAV.ultimo = 0; return; }

    const dt = GRAV.ultimo ? Math.min((agora - GRAV.ultimo) / 1000, 0.05) : 0;
    GRAV.ultimo = agora;
    if (!dt || GRAV.resolvido) return;

    const aceleracao = 260 * Math.sin(GRAV.inclinacao * Math.PI / 180); // %/s²
    GRAV.vel += aceleracao * dt;
    GRAV.vel *= 1 - 0.35 * dt;           // atrito leve
    GRAV.pos += GRAV.vel * dt;

    if (GRAV.pos < 0)   { GRAV.pos = 0;   GRAV.vel = -GRAV.vel * 0.45; }
    if (GRAV.pos > 100) { GRAV.pos = 100; GRAV.vel = -GRAV.vel * 0.45; }

    // precisa parar sobre o 50% por um instante
    if (Math.abs(GRAV.pos - 50) <= 1 && Math.abs(GRAV.vel) < 2) {
        GRAV.noAlvo += dt;
        if (GRAV.noAlvo >= 1) {
            GRAV.resolvido = true;
            GRAV.pos = 50; GRAV.vel = 0; GRAV.inclinacao = 0;
        }
    } else {
        GRAV.noAlvo = 0;
    }
    desenharGravidade();
}

function desenharGravidade() {
    const barra = document.getElementById('grav-bar');
    const bola  = document.getElementById('grav-ball');
    const val   = document.getElementById('captcha-val');
    if (!barra) return;
    barra.style.transform = `rotate(${GRAV.inclinacao}deg)`;
    bola.style.left       = GRAV.pos + '%';
    val.textContent       = GRAV.pos.toFixed(1).replace('.0', '');
}

// ─── SUBMETER ─────────────────────────────────────────────────────────────────

function submeterFormImpossivel() {
    clearInterval(timerInterval);
    window.open('https://www.youtube.com/shorts/6GbpsEeoobU', '_blank');
}

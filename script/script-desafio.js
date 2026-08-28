// ─── Formulário Impossível ────────────────────────────────────────────────────

// ─── TERMOS: ir para formulário ───────────────────────────────────────────────

function irParaFormulario() {
    document.getElementById('desafio-termos').style.display = 'none';
    document.getElementById('desafio-form').style.display   = 'block';
    iniciarTimerPergunta();
}

// Mostrar aviso quando checkbox de termos muda
document.addEventListener('DOMContentLoaded', () => {
    const cbTermos = document.getElementById('cb-termos');
    const aviso    = document.getElementById('aviso-termos');
    if (cbTermos && aviso) {
        const atualizar = () => {
            aviso.textContent = cbTermos.checked
                ? '⚠️ Marcou que leu. Sabemos que é mentira.'
                : '📖 Desmarcou. Honestidade admirável (mas o botão funciona do mesmo jeito).';
            aviso.classList.add('visivel');
        };
        cbTermos.addEventListener('change', atualizar);
        atualizar(); // estado inicial
    }

    // 1. Range vertical
    const rangeEl = document.getElementById('range-comprometimento');
    const valEl   = document.getElementById('range-val');
    if (rangeEl && valEl) {
        rangeEl.addEventListener('input', () => { valEl.textContent = rangeEl.value + '%'; });
    }

    // 2. Campo invisível
    const toggleSpan = document.getElementById('toggle-visivel');
    const campoSecr  = document.getElementById('campo-secreto');
    if (toggleSpan && campoSecr) {
        toggleSpan.addEventListener('click', () => {
            const vis = campoSecr.classList.toggle('visivel');
            toggleSpan.textContent = vis ? '(campo visível ✓)' : '(campo invisível)';
        });
    }

    // 5. Checkbox fugitivo
    iniciarFugitivo();

    // 7. Slider CAPTCHA
    const slider  = document.getElementById('captcha-slider');
    const captVal = document.getElementById('captcha-val');
    const captFb  = document.getElementById('captcha-feedback');
    if (slider) {
        slider.addEventListener('input', () => {
            const v = parseInt(slider.value);
            if (captVal) captVal.textContent = v;
            if (captFb) {
                if (v === 0) {
                    captFb.textContent = '';
                } else if (v === 48) {
                    captFb.textContent = '❌ Quase! Só mais um pouquinho...';
                } else if (v === 51) {
                    captFb.textContent = '❌ Passou! Volta um pouquinho...';
                } else if (v === 50) {
                    // 50 nunca é atingível com step=3, mas por segurança
                    captFb.textContent = '✓ Perfeito!';
                } else {
                    captFb.textContent = '❌ Precisa ser exatamente 50%.';
                }
            }
        });
    }
});

// ─── 3. BOTÃO 4× CONFIRMAÇÃO ─────────────────────────────────────────────────

let confirmaStep = 0;

const PERGUNTAS_CONFIRMA = [
    { txt: 'Tem certeza que você é humano?',           step: '1 / 4' },
    { txt: 'Tem MESMO certeza?',                       step: '2 / 4' },
    { txt: 'Pensa bem antes de responder...',           step: '3 / 4' },
    { txt: 'DEFINITIVAMENTE última chance.',            step: '4 / 4' },
];

function abrirConfirmacao() {
    confirmaStep = 0;
    mostrarConfirmaStep();
    document.getElementById('confirm-overlay').classList.add('aberto');
}

function mostrarConfirmaStep() {
    const p    = PERGUNTAS_CONFIRMA[confirmaStep];
    const st   = document.getElementById('confirm-step-label');
    const txt  = document.getElementById('confirm-pergunta');
    const sim  = document.getElementById('confirm-sim');
    const nao  = document.getElementById('confirm-nao');

    if (st)  st.textContent  = `Etapa ${p.step}`;
    if (txt) txt.textContent = p.txt;

    if (confirmaStep < 3) {
        // Ordem normal: Sim | Não
        sim.textContent = '✓ Sim, sou humano';
        nao.textContent = '✗ Não tenho certeza';
        sim.className = 'button';
        nao.className = 'button button-danger';

        sim.onclick = () => { confirmaStep++; mostrarConfirmaStep(); };
        nao.onclick = () => {
            document.getElementById('confirm-overlay').classList.remove('aberto');
            confirmaStep = 0;
            setConfirmaStatus('🤔 Tudo bem! Clique de novo quando tiver certeza.', false);
        };
    } else {
        // 4ª pergunta: TROCADO! O "Sim" agora diz "Não" e o "Não" diz "Sim"
        // A ordem visual é a mesma (sim no lugar esquerdo, nao no direito)
        // mas os textos e comportamentos estão invertidos
        sim.textContent = '✗ Não, não sou humano'; // onde era "Sim", agora diz "Não"
        nao.textContent = '✓ Sim, definitivamente!'; // onde era "Não", agora diz "Sim"
        sim.className = 'button button-danger';
        nao.className = 'button';

        // Quem clica no botão da esquerda (onde sempre estava "Sim") agora está clicando "Não"
        sim.onclick = () => {
            document.getElementById('confirm-overlay').classList.remove('aberto');
            confirmaStep = 0;
            setConfirmaStatus('😈 Você clicou em "Não, não sou humano". Recomece do zero!', false);
        };
        // Quem percebe a troca e clica no botão da direita (onde era "Não") agora acerta
        nao.onclick = () => {
            document.getElementById('confirm-overlay').classList.remove('aberto');
            setConfirmaStatus('✅ Humanidade confirmada! (mas clicou no botão da direita... suspeito)', true);
        };
    }
}

function setConfirmaStatus(msg, ok) {
    const el = document.getElementById('confirma-status');
    if (!el) return;
    el.textContent    = msg;
    el.dataset.ok     = ok ? '1' : '0';
    el.style.color    = ok ? 'var(--sucesso, green)' : 'var(--erro, #c62828)';
}

// ─── 4. TIMER ─────────────────────────────────────────────────────────────────

let timerInterval  = null;
let timerSegundos  = 30;

function iniciarTimerPergunta() {
    clearInterval(timerInterval);
    timerSegundos = 30;
    _atualizarTimerUI();

    timerInterval = setInterval(() => {
        timerSegundos--;
        _atualizarTimerUI();
        if (timerSegundos <= 0) {
            clearInterval(timerInterval);
            dispararDrama();
        }
    }, 1000);
}

function resetarTimer() {
    timerSegundos = 30;
    clearInterval(timerInterval);
    _atualizarTimerUI();
    timerInterval = setInterval(() => {
        timerSegundos--;
        _atualizarTimerUI();
        if (timerSegundos <= 0) {
            clearInterval(timerInterval);
            dispararDrama();
        }
    }, 1000);
}

function _atualizarTimerUI() {
    const num  = document.getElementById('timer-num');
    const fill = document.getElementById('timer-fill');
    if (num)  num.textContent = timerSegundos;
    if (fill) {
        fill.style.width = (timerSegundos / 30 * 100) + '%';
        fill.classList.toggle('urgente', timerSegundos <= 10);
    }
}

function dispararDrama() {
    // Salva valores atuais dos inputs
    const inputs = document.querySelectorAll('#desafio-form input[type="text"], #desafio-form textarea');
    const backup = Array.from(inputs).map(i => i.value);

    // "Apaga" tudo
    inputs.forEach(i => { i.value = ''; });

    const drama = document.getElementById('drama-apagado');
    if (drama) drama.style.display = 'flex';

    setTimeout(() => {
        if (drama) drama.style.display = 'none';
        // Restaura tudo
        inputs.forEach((i, idx) => { i.value = backup[idx]; });
        resetarTimer();
    }, 3000);
}

// ─── 5. CHECKBOX FUGITIVO ─────────────────────────────────────────────────────

let tentativasFugitivo = 0;

function iniciarFugitivo() {
    const label    = document.getElementById('label-fugitivo');
    const checkbox = document.getElementById('checkbox-fugitivo');
    const contTxt  = document.getElementById('fugitivo-tentativas');
    if (!label || !checkbox) return;

    label.addEventListener('mouseenter', () => {
        if (checkbox.checked) return;
        tentativasFugitivo++;
        if (contTxt) {
            const msgs = [
                '', 'Rápida, a caixa fugiu!', 'Quase pegou!', 'Ela é esperta...',
                'Você está tentando muito.', 'Não desiste, né?', 'Persistência admirável.',
                'Talvez ela precise de espaço.', '...', 'Okay isso é impressionante.',
            ];
            contTxt.textContent = msgs[Math.min(tentativasFugitivo, msgs.length - 1)];
        }

        const pad = 40;
        const maxX = window.innerWidth  - 220 - pad;
        const maxY = window.innerHeight - 60  - pad;
        label.style.position = 'fixed';
        label.style.left     = (pad + Math.random() * maxX) + 'px';
        label.style.top      = (pad + Math.random() * maxY) + 'px';
        label.style.zIndex   = '800';
        label.style.background    = 'var(--superficie)';
        label.style.padding       = '8px 14px';
        label.style.borderRadius  = '30px';
        label.style.border        = '2px solid var(--primaria)';
        label.style.boxShadow     = 'var(--sombra-card)';
    });

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            // Voltou ao lugar, parou de fugir
            label.style.position   = '';
            label.style.left       = '';
            label.style.top        = '';
            label.style.zIndex     = '';
            label.style.background = '';
            label.style.padding    = '';
            label.style.border     = '';
            label.style.boxShadow  = '';
            if (contTxt) contTxt.textContent = '🎉 Pegou! Ufa.';
        }
    });
}

// ─── SUBMETER ─────────────────────────────────────────────────────────────────

function submeterFormImpossivel() {
    clearInterval(timerInterval);
    window.open('https://www.youtube.com/shorts/6GbpsEeoobU', '_blank');
}

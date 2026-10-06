/* ═══════════════════════════════════════════════════════════════════════════
   TEMA HALLOWEEN — cenário animado (JS puro, sem dependências)

   Carregado sob demanda por script-loja.js (só quando o tema está ativo).
   API: HalloweenTema.ativar() / HalloweenTema.desativar()

   Tudo vive dentro de um único <div class="hw-cenario"> criado em ativar() e
   removido em desativar(); timers, listeners e animações são cancelados juntos.
   Estilos em styles/style-halloween.css (escopados em body.tema-halloween).
═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    // ── INTENSIDADE — ajuste aqui ────────────────────────────────────────────
    const CFG = {
        morcegos:  { desktop: 3,  movel: 2  },   // morcegos cruzando a tela
        fantasmas: { desktop: 3,  movel: 2  },   // fantasminhas flutuando
        queda:     { desktop: 24, movel: 12 },   // abóboras e doces caindo
        estrelas:  { desktop: 26, movel: 14 },   // por camada (são 3 camadas piscando)
        nevoa:     true,                         // névoa rasteira no rodapé
        raio:      { ligado: true, min: 20000, max: 40000 },  // ms entre flashes
        aranha:    { ligada: true, min: 8000,  max: 18000 },  // ms entre descidas
        velocidade: 1,        // multiplicador de duração: 2 = metade da velocidade, 0.5 = dobro
        movelMaxLargura: 700, // px — abaixo disso vale a coluna "movel"
    };

    const FADE_MS = 700;   // deve casar com a transition do .hw-cenario no CSS

    // ── utilitários ──────────────────────────────────────────────────────────
    const rnd  = (a, b) => a + Math.random() * (b - a);
    const pick = lista => lista[Math.floor(Math.random() * lista.length)];
    const dur  = (a, b) => rnd(a, b) * 1000 * CFG.velocidade;

    function criar(classe) {
        const e = document.createElement('div');
        e.className = classe;
        return e;
    }

    // ── SVGs ─────────────────────────────────────────────────────────────────
    // Símbolos reutilizáveis (<use>) — abóbora, doce, fantasma e aranha.
    const DEFS = `
<svg width="0" height="0" style="position:absolute" focusable="false" aria-hidden="true"><defs>
  <symbol id="hw-s-abobora" viewBox="0 0 40 40">
    <rect x="18" y="3" width="4" height="8" rx="1.5" fill="#6BA32A"/>
    <ellipse cx="20" cy="24" rx="18" ry="14" fill="#E8650D"/>
    <ellipse cx="11" cy="24" rx="7" ry="14" fill="#FF8A2B" opacity=".85"/>
    <ellipse cx="29" cy="24" rx="7" ry="14" fill="#FF8A2B" opacity=".85"/>
    <ellipse cx="20" cy="24" rx="5" ry="14" fill="#F5791A"/>
    <path d="M10 20h5l-2.5-5zM25 20h5l-2.5-5zM12 29q8 7 16 0l-2-2-3 3-3-3-3 3-3-3z" fill="#2B1203"/>
  </symbol>
  <symbol id="hw-s-doce" viewBox="0 0 40 24">
    <g fill="currentColor"><path d="M2 3l10 9-10 9z"/><path d="M38 3l-10 9 10 9z"/><ellipse cx="20" cy="12" rx="10" ry="8"/></g>
    <path d="M14 6q4 6 0 12M22 5q4 7 0 14" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/>
  </symbol>
  <symbol id="hw-s-fantasma" viewBox="0 0 64 58">
    <path d="M12 54V24C12 10 22 2 32 2s20 8 20 22v30l-7-6-7 6-6-6-6 6-7-6z" fill="#EEE8FF"/>
    <ellipse cx="24" cy="24" rx="4" ry="5.5" fill="#2A2040"/><ellipse cx="40" cy="24" rx="4" ry="5.5" fill="#2A2040"/>
    <ellipse cx="32" cy="36" rx="4" ry="5" fill="#2A2040"/>
  </symbol>
  <symbol id="hw-s-aranha" viewBox="0 0 34 34">
    <g fill="none" stroke="#C9BCE8" stroke-width="1.2" stroke-linecap="round">
      <path d="M17 21Q8 12 3 15M17 21Q7 19 2 24M17 21Q8 26 4 32M17 21Q10 30 9 33"/>
      <path d="M17 21q9-9 14-6M17 21q10-2 15 3M17 21q9 5 13 11M17 21q7 9 8 12"/>
    </g>
    <circle cx="17" cy="22" r="7" fill="#1B1230" stroke="#C9BCE8" stroke-width="1"/>
    <circle cx="17" cy="14" r="4.2" fill="#1B1230" stroke="#C9BCE8" stroke-width="1"/>
    <circle cx="15.4" cy="13.4" r="1" fill="#A3E635"/><circle cx="18.6" cy="13.4" r="1" fill="#A3E635"/>
  </symbol>
  <radialGradient id="hw-g-brilho"><stop offset="0" stop-color="#FF9A3D" stop-opacity=".55"/><stop offset="1" stop-color="#FF9A3D" stop-opacity="0"/></radialGradient>
</defs></svg>`;

    // Morcego inline (não <use>) para as asas poderem bater via CSS.
    const SVG_MORCEGO = `
<svg viewBox="0 0 80 40" fill="#4A3A7A" aria-hidden="true">
  <g class="hw-asa hw-asa-e"><path d="M38 20C30 6 16 4 2 8c6 4 8 10 10 16 4-4 8-2 12 4 4-4 9-4 14 0z"/></g>
  <g class="hw-asa hw-asa-d"><path d="M42 20C50 6 64 4 78 8c-6 4-8 10-10 16-4-4-8-2-12 4-4-4-9-4-14 0z"/></g>
  <ellipse cx="40" cy="24" rx="5" ry="9"/><path d="M36 17l1-9 3 5 3-5 1 9z"/>
  <circle cx="38" cy="19" r="1" fill="#A3E635"/><circle cx="42" cy="19" r="1" fill="#A3E635"/>
</svg>`;

    // Cemitério + árvores secas (silhueta). "slice" mantém a escala em telas estreitas.
    const SVG_CEMITERIO = `
<svg class="hw-cemiterio" viewBox="0 0 1200 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <path d="M0 240V196Q200 170 420 192T820 186T1200 180V240Z" fill="#1A1130"/>
  <g fill="none" stroke="#0A0713" stroke-linecap="round">
    <path stroke-width="10" d="M110 240C112 205 100 180 112 150 118 132 108 112 116 92"/>
    <path stroke-width="5" d="M112 150C90 140 70 142 52 122"/>
    <path stroke-width="4" d="M114 124C136 112 152 116 168 96"/>
    <path stroke-width="3" d="M116 92C104 80 98 66 88 52M116 92C126 78 140 72 146 56"/>
    <path stroke-width="2" d="M52 122C46 112 46 102 36 96M168 96C170 84 178 78 186 72M88 52C90 42 84 34 78 30"/>
    <path stroke-width="9" d="M1060 240C1058 208 1070 182 1058 154 1052 136 1062 116 1054 96"/>
    <path stroke-width="5" d="M1058 154C1082 146 1102 148 1118 128"/>
    <path stroke-width="4" d="M1056 126C1034 114 1018 118 1002 98"/>
    <path stroke-width="3" d="M1054 96C1066 84 1072 70 1082 56M1054 96C1044 82 1030 76 1024 60"/>
    <path stroke-width="2" d="M1118 128C1122 116 1114 108 1120 98M1002 98C1000 86 992 80 986 74"/>
    <path stroke-width="6" d="M330 240V190M318 202H342M840 240V196M829 207H851"/>
  </g>
  <path d="M0 240V214Q150 196 300 212T600 208T900 210T1200 204V240Z" fill="#120C22"/>
  <g fill="#0A0713">
    <path d="M200 240V204Q200 186 216 186T232 204V240ZM470 240V200Q470 182 487 182T504 200V240Z"/>
    <path d="M600 240V210Q600 196 612 196T624 210V240ZM930 240V206Q930 188 946 188T962 206V240Z"/>
    <path d="M760 240V212Q760 200 770 200T780 212V240Z"/>
    <path d="M980 240V212h4V240M992 240V210h4V240M1004 240V212h4V240M976 222H1012v3H976Z"/>
  </g>
  <circle class="hw-brilho" cx="690" cy="222" r="46" fill="url(#hw-g-brilho)"/>
  <ellipse cx="690" cy="226" rx="17" ry="13" fill="#E8650D"/>
  <path d="M682 224h4l-2-5zM694 224h4l-2-5zM683 231q7 5 14 0l-2-2-2 2-3-2-3 2-2-2z" fill="#2B1203"/>
</svg>`;

    // ── estado do módulo ─────────────────────────────────────────────────────
    let ativo = false;
    let gen = 0;          // "geração": callbacks de cenários antigos se ignoram
    let cena = null;      // { root, reduz, timers, pausadas, ... } do cenário atual
    let mqReduz = null;   // prefers-reduced-motion
    let mqMovel = null;   // tela estreita

    // ── ativar / desativar ───────────────────────────────────────────────────
    function ativar() {
        if (ativo) return;
        ativo = true;
        mqReduz = window.matchMedia('(prefers-reduced-motion: reduce)');
        mqMovel = window.matchMedia('(max-width: ' + CFG.movelMaxLargura + 'px)');
        mqReduz.addEventListener('change', reconstruir);
        mqMovel.addEventListener('change', reconstruir);
        document.addEventListener('visibilitychange', aoMudarVisibilidade);
        montar(true);
    }

    function desativar() {
        if (!ativo) return;
        ativo = false;
        mqReduz.removeEventListener('change', reconstruir);
        mqMovel.removeEventListener('change', reconstruir);
        document.removeEventListener('visibilitychange', aoMudarVisibilidade);
        desmontar(true);
    }

    // Preferência de movimento ou largura mudou: refaz o cenário sem fade.
    function reconstruir() {
        if (!ativo) return;
        desmontar(false);
        montar(false);
    }

    // ── montagem do cenário ──────────────────────────────────────────────────
    function montar(comFade) {
        const reduz = mqReduz.matches;
        const movel = mqMovel.matches;
        const qtd = k => (movel ? CFG[k].movel : CFG[k].desktop);
        const g = gen;

        const root = criar('hw-cenario');
        root.setAttribute('aria-hidden', 'true');
        const c = cena = { root, reduz, timers: { raio: null, aranha: null },
                           pausadas: new Set(), aranhaEspera: false, aranhaCx: null, raio: null };

        root.insertAdjacentHTML('afterbegin', DEFS);
        root.appendChild(criar('hw-ceu'));

        // Estrelas: 3 camadas (cada uma é UM elemento com várias box-shadows em vw/vh);
        // cada camada pisca num ritmo diferente — só opacity é animada.
        const cores = ['#fff', '#FFE9B0', '#CFC3FF'];
        for (let i = 1; i <= 3; i++) {
            const camada = criar('hw-estrelas hw-e' + i);
            const sombras = [];
            for (let n = 0; n < qtd('estrelas'); n++) {
                sombras.push(rnd(1, 99).toFixed(1) + 'vw ' + rnd(1, 72).toFixed(1) + 'vh 0 ' +
                             (Math.random() > 0.75 ? 1 : 0) + 'px ' + pick(cores));
            }
            camada.style.boxShadow = sombras.join(',');
            root.appendChild(camada);
        }

        // Lua com halo (o halo pulsa via opacity/transform no CSS)
        root.appendChild(criar('hw-lua'));

        // Criaturas atrás do cemitério: morcegos e fantasmas
        const fundo = criar('hw-camada');
        root.appendChild(fundo);
        for (let i = 0; i < qtd('morcegos'); i++) fundo.appendChild(criarMorcego(c, reduz, i));
        for (let i = 0; i < qtd('fantasmas'); i++) fundo.appendChild(criarFantasma(c, g, reduz, i));

        root.insertAdjacentHTML('beforeend', SVG_CEMITERIO);

        // Névoa rasteira: 2 camadas (1 no celular), gradientes — sem blur/filter
        if (CFG.nevoa) {
            for (let i = 1; i <= (movel ? 1 : 2); i++) root.appendChild(criar('hw-nevoa hw-n' + i));
        }

        // Frente: queda de abóboras/doces, aranha, raio
        const frente = criar('hw-camada');
        root.appendChild(frente);
        if (!reduz) {
            for (let i = 0; i < qtd('queda'); i++) frente.appendChild(criarItemQueda(c));
        }
        if (CFG.aranha.ligada) frente.appendChild(criarAranha(c, g, reduz));
        if (CFG.raio.ligado && !reduz) {
            c.raio = criar('hw-raio');
            root.appendChild(c.raio);
        }

        // Entrada suave: nasce transparente e sobe para opacity 1
        if (!comFade) root.style.transition = 'none';
        else root.style.opacity = '0';
        document.body.appendChild(root);
        if (comFade) {
            root.getBoundingClientRect();   // força o estilo inicial antes da transição
            root.style.opacity = '1';
        }

        if (!reduz) {
            agendarAranha(c, g, rnd(2000, 5000));
            agendarRaio(c, g);
        }
        if (document.hidden) pausar();
    }

    // Cancela timers e remove o DOM. Com fade, o cenário antigo some em FADE_MS.
    function desmontar(comFade) {
        gen++;                       // invalida onfinish/timers pendentes do cenário antigo
        const c = cena;
        cena = null;
        if (!c) return;
        clearTimeout(c.timers.raio);
        clearTimeout(c.timers.aranha);
        c.pausadas.clear();
        if (comFade) {
            c.root.style.opacity = '0';
            setTimeout(() => c.root.remove(), FADE_MS + 80);
        } else {
            c.root.remove();
        }
    }

    // ── 1. Morcegos: cruzam a tela em ondas, cada um com altura/velocidade própria ──
    function criarMorcego(c, reduz, i) {
        const m = criar('hw-morcego');
        const larg = rnd(40, 70);
        m.style.cssText = 'top:' + rnd(8, 62).toFixed(1) + 'vh;width:' + larg.toFixed(0) + 'px;height:' +
                          (larg / 2).toFixed(0) + 'px;opacity:' + rnd(0.55, 0.85).toFixed(2) + ';' +
                          '--bater:' + rnd(0.28, 0.46).toFixed(2) + 's;';
        m.innerHTML = SVG_MORCEGO;
        if (reduz) { m.style.left = rnd(8, 88).toFixed(0) + 'vw'; return m; }   // parado

        const y = () => rnd(-70, 70).toFixed(0) + 'px';
        const volta = i % 2 === 1;   // metade vai da direita p/ esquerda
        const ini = volta ? 'calc(100vw + 120px)' : '-120px';
        const fim = volta ? '-120px' : 'calc(100vw + 120px)';
        const meio = p => (volta ? 'calc(' + (100 - p) + 'vw)' : p + 'vw');
        const d = dur(14, 26);
        const a = m.animate([
            { transform: 'translate(' + ini + ',0)' },
            { transform: 'translate(' + meio(25) + ',' + y() + ')' },
            { transform: 'translate(' + meio(50) + ',' + y() + ')' },
            { transform: 'translate(' + meio(75) + ',' + y() + ')' },
            { transform: 'translate(' + fim + ',' + y() + ')' },
        ], { duration: d, iterations: Infinity, easing: 'linear' });
        a.currentTime = rnd(0, d);   // espalha os morcegos já no início
        return m;
    }

    // ── 2. Fantasminhas: aparecem, flutuam em zigue-zague e somem (fade); reposicionam ──
    function criarFantasma(c, g, reduz, i) {
        const f = criar('hw-fantasma');
        const larg = rnd(34, 56);
        f.style.width = larg.toFixed(0) + 'px';
        f.style.height = (larg * 0.9).toFixed(0) + 'px';
        f.innerHTML = '<svg viewBox="0 0 64 58" aria-hidden="true"><use href="#hw-s-fantasma"/></svg>';
        const posiciona = () => {
            f.style.left = rnd(4, 90).toFixed(1) + 'vw';
            f.style.top  = rnd(22, 68).toFixed(1) + 'vh';
        };
        posiciona();
        if (reduz) { f.style.opacity = '0.4'; return f; }   // parado

        f.style.opacity = '0';
        const ciclo = (inicio) => {
            if (g !== gen) return;   // cenário antigo
            if (!inicio) posiciona();
            const dx = rnd(-50, 50);
            const d = dur(10, 16);
            const a = f.animate([
                { transform: 'translate(0,0)',                              opacity: 0 },
                { transform: 'translate(' + (dx * 0.4) + 'px,-18px)',       opacity: 0.55, offset: 0.2 },
                { transform: 'translate(' + (-dx * 0.3) + 'px,-36px)',      opacity: 0.55, offset: 0.55 },
                { transform: 'translate(' + (dx * 0.6) + 'px,-54px)',       opacity: 0.45, offset: 0.8 },
                { transform: 'translate(' + dx + 'px,-70px)',               opacity: 0 },
            ], { duration: d, easing: 'ease-in-out' });
            if (inicio) a.currentTime = rnd(0, d * 0.6);   // escalona os fantasmas
            a.onfinish = () => ciclo(false);
        };
        ciclo(true);
        return f;
    }

    // ── 3. Queda de abóboras e doces (transform linear em loop) ──────────────
    function criarItemQueda(c) {
        const el = criar('hw-queda-item');
        const abobora = Math.random() < 0.55;
        const tam = abobora ? rnd(24, 44) : rnd(22, 38);
        el.style.left = rnd(0, 100).toFixed(1) + 'vw';
        el.style.width = tam.toFixed(0) + 'px';
        el.style.height = (abobora ? tam : tam * 0.6).toFixed(0) + 'px';
        el.style.opacity = rnd(0.6, 0.95).toFixed(2);
        if (abobora) {
            el.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><use href="#hw-s-abobora"/></svg>';
        } else {
            el.style.color = pick(['#FF5FA2', '#A3E635', '#7B4FBF', '#FFD23F', '#FF8A2B']);
            el.innerHTML = '<svg viewBox="0 0 40 24" aria-hidden="true"><use href="#hw-s-doce"/></svg>';
        }
        const d = dur(9, 17);
        const a = el.animate([
            { transform: 'translate3d(0,-80px,0) rotate(0deg)' },
            { transform: 'translate3d(' + rnd(-70, 70).toFixed(0) + 'px,calc(100vh + 80px),0) rotate(' +
                         rnd(-220, 220).toFixed(0) + 'deg)' },
        ], { duration: d, iterations: Infinity, easing: 'linear' });
        a.currentTime = rnd(0, d);
        return el;
    }

    // ── 6. Aranha: desce no fio a partir do header, balança e sobe de volta ──
    function alturaHeader() {
        const h = document.querySelector('header');
        return h ? h.offsetHeight : 110;
    }

    function criarAranha(c, g, reduz) {
        const cx = criar('hw-aranha-cx');
        cx.innerHTML = '<span class="hw-fio"></span>' +
                       '<svg class="hw-aranha" viewBox="0 0 34 34" aria-hidden="true"><use href="#hw-s-aranha"/></svg>';
        c.aranhaCx = cx;
        // repouso: escondida acima da tela (o fio nasce atrás do header sticky)
        cx.style.transform = reduz ? 'translateY(' + (alturaHeader() + 34) + 'px)' : 'translateY(-60px)';
        return cx;
    }

    function agendarAranha(c, g, atraso) {
        if (g !== gen || !CFG.aranha.ligada || c.timers.aranha) return;
        c.aranhaEspera = true;
        const espera = atraso != null ? atraso : dur(CFG.aranha.min / 1000, CFG.aranha.max / 1000);
        c.timers.aranha = setTimeout(() => {
            c.timers.aranha = null;
            c.aranhaEspera = false;
            descerAranha(c, g);
        }, espera);
    }

    function descerAranha(c, g) {
        if (g !== gen || !c.aranhaCx) return;
        const fundo = alturaHeader() + rnd(30, 90);
        const e = 'ease-in-out';
        const a = c.aranhaCx.animate([
            { transform: 'translateY(-60px)',                       easing: e },
            { transform: 'translateY(' + fundo + 'px)',             easing: e, offset: 0.3 },
            { transform: 'translateY(' + (fundo + 10) + 'px)',      easing: e, offset: 0.45 },   // balanço
            { transform: 'translateY(' + (fundo - 6) + 'px)',       easing: e, offset: 0.6 },
            { transform: 'translateY(' + fundo + 'px)',             easing: e, offset: 0.72 },
            { transform: 'translateY(-60px)' },                      // sobe de volta
        ], { duration: dur(9, 12) });
        a.onfinish = () => agendarAranha(c, g);
    }

    // ── 8. Raio: flash de tela a cada 20–40 s; no máx. 2 picos em ~0,9 s (< 3 flashes/s) ──
    function agendarRaio(c, g) {
        if (g !== gen || !CFG.raio.ligado || c.reduz || c.timers.raio) return;
        c.timers.raio = setTimeout(() => {
            c.timers.raio = null;
            if (g !== gen) return;
            c.raio.animate([
                { opacity: 0 },
                { opacity: 0.38, offset: 0.05 },
                { opacity: 0,    offset: 0.2 },
                { opacity: 0.22, offset: 0.45 },
                { opacity: 0,    offset: 0.7 },
                { opacity: 0 },
            ], { duration: 900 });
            agendarRaio(c, g);
        }, rnd(CFG.raio.min, CFG.raio.max));
    }

    // ── Pausa com aba oculta ─────────────────────────────────────────────────
    // Pausa todas as animações do cenário (Web Animations + CSS) e cancela os timers;
    // ao voltar, retoma as pausadas e re-agenda no máximo UM timer de cada tipo.
    function pausar() {
        const c = cena;
        if (!c) return;
        clearTimeout(c.timers.raio);   c.timers.raio = null;
        clearTimeout(c.timers.aranha); c.timers.aranha = null;
        c.root.getAnimations({ subtree: true }).forEach(a => {
            if (a.playState === 'running') { a.pause(); c.pausadas.add(a); }
        });
    }

    function retomar() {
        const c = cena;
        if (!c) return;
        c.pausadas.forEach(a => { try { a.play(); } catch (e) { /* já cancelada */ } });
        c.pausadas.clear();
        if (!c.reduz) {
            agendarRaio(c, gen);
            if (c.aranhaEspera) agendarAranha(c, gen);
        }
    }

    function aoMudarVisibilidade() {
        if (document.hidden) pausar(); else retomar();
    }

    window.HalloweenTema = {
        ativar, desativar,
        get ativo() { return ativo; },
        config: CFG,
    };
})();

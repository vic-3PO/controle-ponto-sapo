# Plano de Ação — Reformulação do Controle de Ponto

Redesign completo dos três temas com visual kawaii moderno, e nova engine de escala de trabalho com horários por dia da semana e domingos alternados.

## Direção Estética — Cozy Game

Além das paletas e tokens já definidos, todo o visual deve seguir a linguagem de "cozy game" (referência: Stardew Valley, Spiritfarer, Coffee Talk), não apenas "kawaii genérico". Aplicar os seguintes princípios em todas as fases:

- **Bordas sempre suaves**: border-radius mínimo de 12px em cards, botões e inputs. Nunca cantos vivos (0px).
- **Sombras quentes, nunca cinza puro**: usar `box-shadow` com a cor primária do tema em baixa opacidade (ex: `0 4px 12px rgba(var(--cor-primaria-rgb), 0.15)`), com offset e blur generosos para dar sensação de profundidade tipo "diorama".
- **Fundos com leve textura/gradiente**, evitar cor sólida chapada nos containers principais — um gradiente suave de 2 tons próximos já resolve.
- **Saturação assimétrica**: fundos e superfícies em tom pastel/baixa saturação; acentos, CTAs e status chips em cor mais saturada e viva — reforçar esse contraste onde já existir.
- **Microinterações "satisfying"**:
  - Botões: leve "squish" no active state (`transform: scale(0.96)` + transição rápida)
  - Checkmarks/confirmações: pequeno bounce ao aparecer
  - Cards: leve elevação no hover (`translateY(-2px)` + sombra mais forte)
- **Mascote com "respiração"**: animação em loop lento e sutil (`scale(1) → scale(1.02)`, ~3s, ease-in-out) no estado de repouso, para dar sensação de personagem vivo, não estático.
- **Ícones e ilustrações com contorno grosso arredondado** (estilo sticker), evitar ícones de linha fina.

## Aplicar isso principalmente na Fase 1 (tokens de sombra e radius) e na Fase 3 (cards, botões, mascote, modal). Respeitar `prefers-reduced-motion` em todas as animações novas.

## Visão Geral

| Fase | Nome                  | Foco                                           |
| ---- | --------------------- | ---------------------------------------------- |
| 1    | Design System & Temas | Tokens CSS + paletas corretas dos 3 temas      |
| 2    | Escala de Trabalho    | Horários por dia da semana + domingo alternado |
| 3    | UI Modernizado        | Layout em cards, fonte kawaii, animações       |
| 4    | Polimento             | Responsividade, dark mode, migração de dados   |

**Premissas:** zero dependências novas, localStorage preservado, todos os dados de ponto existentes continuam funcionando.

---

## Fase 1 — Design System & Temas

### Paletas por tema

**🐸 Sapo Padrão**

- `#5BAD6F` — verde lago (primária)
- `#A8D9B3` — verde médio (secundária)
- `#EDF7F0` — fundo lilypad
- `#2D7A42` — verde escuro (acento)

**☁️ Cinnamoroll**

- `#5B9BD6` — azul céu (primária)
- `#A8CAFE` — azul médio (secundária)
- `#EEF5FD` — fundo névoa
- `#E8C6E8` — lavanda (acento)

**🍮 Pompompurin**

- `#D4A017` — caramelo dourado (primária)
- `#F5D97A` — amarelo médio (secundária)
- `#FDF8E8` — fundo baunilha
- `#8B4A0A` — marrom pudim (acento)

### O que muda tecnicamente

- **Variáveis CSS por tema no `:root`** — substituir o bloco `estiloTema.textContent` gigante em `script-loja.js` por apenas uma classe no `<body>`. Cada tema define suas próprias custom properties em `style.css`.
- **Tipografia: Nunito substituindo Comic Sans** — Google Fonts via `<link>` no `<head>`. Nunito pesos 400/600/700/800. IBM Plex Mono para os inputs de hora na tabela.
- **Animações CSS por tema** — Cinnamoroll: nuvens flutuando via `@keyframes`. Pompompurin: estrelinhas pulsando. Sapo: bolhas subindo. Tudo em `temas-animacoes.css`, respeitando `prefers-reduced-motion`.

### Arquivos modificados

- `styles/style.css` (modificado)
- `styles/temas-animacoes.css` (modificado)
- `script/script-loja.js` (modificado)

---

## Fase 2 — Escala de Trabalho

### Exemplo: escala da sua esposa

| Dia     | Entrada | Saída | Tipo          |
| ------- | ------- | ----- | ------------- |
| Segunda | 14:50   | 21:30 | Regular       |
| Terça   | 14:50   | 21:30 | Regular       |
| Quarta  | 14:50   | 21:30 | Regular       |
| Quinta  | 14:50   | 21:30 | Regular       |
| Sexta   | 14:50   | 21:30 | Regular       |
| Sábado  | 14:50   | 21:30 | Regular       |
| Domingo | 08:00   | 13:00 | **Alternado** |

> **Domingo alternado:** funciona com uma data de referência salva no localStorage. A partir dela, o sistema calcula automaticamente quais domingos são de trabalho e quais são folga — sem precisar marcar manualmente cada semana.

### Estrutura dos dados salvos

- **`escalaDiaria`** — objeto com 7 entradas (0=Dom … 6=Sáb), cada uma com `entrada`, `saida`, `pausaInicio`, `pausaFim`, `trabalha` (bool) e `tipoAlternado` (bool).
- **`domingoRef`** — data ISO (ex: `"2025-01-05"`) do primeiro domingo que ela trabalhou. O sistema conta semanas desde essa data para decidir par/ímpar.
- **`getHorarioDoDia(date)`** — nova função que, dado um objeto `Date`, retorna o horário esperado para aquele dia já resolvendo o alternado. Substitui `calcularMinutosEsperados()` que usa horário global.
- **Dias de folga** — linhas de domingo não-trabalhado recebem classe `.dia-folga` e ficam esmaecidas, mostrando "Folga" na coluna de status.

### Arquivos modificados

- `script/script.js` (modificado)
- `index.html` (modificado)
- `script/script-escala.js` (**novo**)

---

## Fase 3 — UI/UX Modernizado

- **Header redesenhado** — mascote do tema em destaque ao lado do título. Gradiente suave, navegação com pills arredondados.
- **Seção de configuração expansível** — config de escala dentro de accordion colapsável. Quando fechada, mostra resumo: "Seg–Sáb 14:50–21:30 · Dom alternado".
- **Tabela com inputs estilizados** — borda colorida sutil, fundo translúcido. Linhas zebradas. Coluna de status com chips coloridos (verde/vermelho/azul) ao invés de texto puro.
- **Status do mascote reformulado** — card maior, mascote com sombra e borda circular. Mensagem em balão de fala estilizado. Animação de entrada ao trocar estado.
- **Loja de temas reformulada** — cards com preview de cores e amostra visual de paleta. Botão "Ativo" com checkmark animado.
- **Modal kawaii** — emoji do tema em tamanho maior, bordas arredondadas generosas, animação pop-in.
- **Mobile-first** — no celular, cada linha da tabela vira um mini-card vertical, não linha horizontal que estoura a tela.

### Arquivos modificados

- `index.html` (modificado)
- `styles/style.css` (modificado)
- `styles/style-loja.css` (modificado)
- `styles/temas-animacoes.css` (modificado)

---

## Fase 4 — Polimento & Integração

- **Migração de dados existentes** — na inicialização, checar se existe `configuracoesHorarios` (formato antigo) e migrar para o novo formato de escala diária sem apagar dados de ponto já registrados.
- **Revisão dos jogos e quiz** — garantir que estilos de jogos e quiz herdem as variáveis do tema ativo sem reescrever a lógica.
- **Navegação com estado salvo** — restaurar seção aberta, tema e mês ao recarregar.
- **Dark mode por tema** — variante dark sensata para cada tema. Cinnamoroll dark: azul-meia-noite. Pompompurin dark: caramelo escuro. Sapo dark: floresta noturna.

> ✅ **Nenhum dado será perdido** — todo o trabalho é aditivo. Os dados de ponto, tema salvo e preferências continuam funcionando.

---

## Ordem de Execução

1. **CSS tokens + Nunito** (Fase 1 base) — configurar variáveis e tipografia primeiro, todo o resto depende disso.
2. **Lógica de escala** (Fase 2) — script de escala + migração antes de mexer no HTML.
3. **Redesign do HTML/CSS principal** (Fase 1 + 3) — com tokens prontos e lógica funcionando.
4. **Paletas dos temas + animações** (Fase 1 final) — afinar cores e micro-animações decorativas.
5. **Dark mode + mobile** (Fase 4) — última camada de ajustes.

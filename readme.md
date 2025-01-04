Aqui está um exemplo de README para o seu projeto de Controle de Ponto com o tema "Sapinhu":

---

# Controle de Ponto - Sapinhos 🐸

Este projeto é um sistema interativo de controle de ponto para registrar horários de entrada, saída e pausa de trabalho, com uma interface divertida usando imagens de sapos. O objetivo é tornar o processo de controle de ponto mais agradável e visualmente interessante, usando um tema baseado em sapos.

## Funcionalidades

- **Entrada e Saída:** Registre seus horários de entrada e saída usando campos de input do tipo "time".
- **Pausa:** Registre o início e o fim de suas pausas durante o expediente.
- **Seleção de Mês:** Selecione o mês atual para visualizar os registros de ponto de acordo com o período.
- **Tabela de Ponto:** Visualize os dias do mês com a entrada, saída, pausa e o total de horas trabalhadas.
- **Status do Sapinho:** O sapo interativo muda de acordo com os horários registrados:
  - **Sapo Feliz:** Quando os horários estão dentro do esperado.
  - **Sapo Rico:** Quando há horas extras registradas.
  - **Sapo Triste:** Quando há menos horas trabalhadas que o esperado.
  - **Sapo Neutro:** Quando não há registros feitos.

## Como Usar

### Requisitos

Este projeto requer um navegador moderno com suporte a JavaScript e CSS.

### Instruções

1. Abra o arquivo `index.html` em seu navegador.
2. Configure seus horários de entrada, saída e pausa na seção "Configuração de horário".
3. Selecione o mês desejado usando o seletor de meses.
4. Preencha a tabela com os horários registrados, onde as células de entrada, saída e pausa podem ser editadas.
5. O status do sapinho será atualizado automaticamente com base nas horas registradas.

### Armazenamento Local

Os dados de ponto são armazenados no navegador usando `localStorage`, o que significa que as informações serão mantidas mesmo que você recarregue a página ou feche o navegador.

### Imagens de Sapos

Imagens de sapos são usadas para representar o status do ponto, e elas são alteradas conforme o comportamento do horário registrado:
- **Sapo Feliz** para horários corretos.
- **Sapo Rico** para horas extras.
- **Sapo Triste** para menos horas trabalhadas.
- **Sapo Neutro** quando não há registros.

As imagens estão localizadas na pasta do projeto e podem ser facilmente substituídas por outras de sua escolha.

## Tecnologias Utilizadas

- **HTML5**: Estruturação da página.
- **CSS3**: Estilo visual e layout responsivo.
- **JavaScript**: Lógica de controle de ponto e interatividade com o usuário.

## Contribuindo

1. Faça um fork deste repositório.
2. Crie uma branch para a sua feature (`git checkout -b minha-feature`).
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`).
4. Envie para o branch original (`git push origin minha-feature`).
5. Abra um pull request.

## Licença

Este projeto é de código aberto sob a Licença MIT.


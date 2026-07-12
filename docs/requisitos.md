# Requisitos — OpsFlow

## 1. Problema

Uma empresa com colaboradores em vários países e diversas plataformas internas recebe, diariamente, dezenas de solicitações de suporte — problemas de acesso, VPN, permissões, senha, lentidão de sistemas — tratadas hoje de forma manual (e-mail, chat, planilhas). Isso resulta em:

- Falta de padronização na triagem e priorização;
- Perda de histórico e de conhecimento sobre soluções já aplicadas;
- Dificuldade de identificar padrões (quais problemas se repetem, em qual país, em qual plataforma);
- Nenhum mecanismo de melhoria contínua baseado em dados.

## 2. Objetivo do MVP

Construir, em 2 a 3 semanas, um sistema que organize o ciclo de vida de um chamado do início ao fim, com indicadores básicos de operação e um primeiro nível de automação de processos — sem tentar resolver, nesta fase, tudo o que um Service Desk maduro faria.

## 3. Perfis de usuário e necessidades

### 3.1 Colaborador
Abre chamados relatando problemas do dia a dia (ex.: "Esqueci minha senha", "VPN não conecta", "Preciso de acesso", "Sistema lento"). Precisa de uma forma simples de abrir o chamado e acompanhar o status.

### 3.2 Analista de Customer Operations
Recebe os chamados, responde aos usuários, organiza prioridades, fecha tickets e documenta soluções. É o perfil operacional principal do sistema — a maior parte das telas do MVP é pensada para ele.

### 3.3 Gestor
Acompanha indicadores agregados: volume de tickets, tempo médio de resolução por equipe, país que mais gera chamados, categoria mais frequente. Não opera tickets individualmente; consome dashboards.

### 3.4 Administrador
Configura os parâmetros do sistema: categorias, prioridades, regras de workflow e usuários/permissões.

## 4. Requisitos funcionais (RF)

### Tela 1 — Dashboard
- **RF01.** O sistema deve exibir a contagem de tickets abertos, fechados e críticos.
- **RF02.** O sistema deve exibir a quantidade de SLAs vencidos.
- **RF03.** O sistema deve calcular e exibir o tempo médio de resolução.
- **RF04.** O sistema deve exibir gráficos simples (volume por período, por categoria, por status).

### Tela 2 — Lista de Tickets
- **RF05.** Cada ticket deve conter: título, descrição, categoria, prioridade, responsável, data, status, país e plataforma.
- **RF06.** A lista deve ser pesquisável e filtrável pelos campos acima.

### Tela 3 — Detalhes do Ticket
- **RF07.** O sistema deve manter histórico de alterações do ticket.
- **RF08.** O sistema deve permitir adicionar comentários.
- **RF09.** O sistema deve permitir alteração de status.
- **RF10.** O sistema deve permitir alteração de prioridade.

### Tela 4 — Base de Conhecimento (Knowledge Base)
- **RF11.** O sistema deve permitir cadastrar artigos no formato problema → solução (passo a passo).
- **RF12.** Os artigos devem ser pesquisáveis por palavra-chave e por categoria.

### Tela 5 — Sugestão automática
- **RF13.** Durante a criação de um ticket, o sistema deve buscar artigos da base de conhecimento com título/conteúdo semelhante ao texto digitado.
- **RF14.** Caso encontre correspondência, o sistema deve sugerir o artigo antes da abertura do chamado.

### Tela 6 — Dashboard de melhorias
- **RF15.** O sistema deve calcular e exibir os problemas mais frequentes (por categoria/palavra-chave) e sua contagem de ocorrências.
- **RF16.** O sistema deve gerar sugestões simples baseadas em regras (ex.: "criar FAQ para X") acompanhadas de uma estimativa de economia.

### Serviço de Insights (Python)
- **RF17.** Um serviço deve analisar um lote de tickets (ex.: os últimos 100) e identificar palavras mais frequentes, categorias, tempo médio e distribuição de prioridade.
- **RF18.** O serviço deve gerar um resumo textual ("Insights da semana") com os principais achados.

### Workflow Builder
- **RF19.** O administrador deve poder configurar regras do tipo "se [condição] então [ação]" (ex.: se prioridade = Alta → atribuir ao time de Infraestrutura → prazo de 4 horas).
- **RF20.** As regras devem suportar, no mínimo, ações de atribuição de responsável, envio de artigo da base de conhecimento e alteração automática de status.

### Administração
- **RF21.** O administrador deve poder cadastrar e editar categorias e prioridades.
- **RF22.** O administrador deve poder cadastrar e editar usuários e seus perfis de acesso.

## 5. Requisitos não funcionais (RNF)

- **RNF01 — Usabilidade:** interface simples, sem necessidade de treinamento para o colaborador abrir um chamado.
- **RNF02 — Desempenho:** listagens e dashboards devem responder em menos de 1 segundo com até alguns milhares de tickets (volume esperado do MVP).
- **RNF03 — Portabilidade:** ambiente de desenvolvimento e execução via Docker Compose, sem dependências manuais de instalação.
- **RNF04 — Documentação:** API documentada automaticamente via Swagger/OpenAPI; documentação de arquitetura e regras de negócio mantida em `docs/`.
- **RNF05 — Internacionalização (preparação):** o modelo de dados deve suportar o campo "país" desde já, mesmo que a interface do MVP seja apenas em português.
- **RNF06 — Extensibilidade:** o modelo de regras do Workflow Builder deve ser genérico o suficiente para adicionar novas condições e ações sem reescrever o motor de execução.

## 6. Fora de escopo do MVP

Para manter o prazo de 2 a 3 semanas, os itens abaixo **não** fazem parte desta primeira entrega:

- Autenticação via SSO/LDAP corporativo (o MVP usa autenticação simples própria);
- Notificações por e-mail/push em tempo real;
- Aplicativo mobile nativo;
- Modelo de machine learning para sugestão automática (o MVP usa correspondência de palavras-chave, não NLP avançado);
- Multi-idioma na interface;
- SLA com escalonamento automático multi-nível (o MVP calcula vencimento, mas não dispara escalonamentos em cadeia).

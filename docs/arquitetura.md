# Arquitetura — OpsFlow

## 1. Visão geral

O OpsFlow é uma aplicação web dividida em três camadas principais, mais um serviço de análise:

```
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│                  │  HTTP  │                  │  SQL   │                  │
│  Frontend (SPA)  │ ─────► │  Backend (API)   │ ─────► │  PostgreSQL      │
│  React + TS      │ ◄───── │  FastAPI         │ ◄───── │                  │
│                  │  JSON  │                  │        │                  │
└──────────────────┘        └────────┬─────────┘        └──────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Serviço de        │
                             │ Insights (Python)│
                             │ — análise de      │
                             │   tickets         │
                             └──────────────────┘
```

O frontend consome exclusivamente a API REST exposta pelo backend. O serviço de Insights, no MVP, roda como um módulo dentro do próprio backend (mesmo processo/deploy), exposto por um endpoint (`/insights/weekly`) — ver seção 5. Isso evita a complexidade de um microsserviço separado nesta fase, mas mantém o código isolado o suficiente para virar um serviço próprio depois, se o volume de dados justificar.

## 2. Stack tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | React + TypeScript | Padrão de mercado, tipagem reduz bugs em telas com muitos estados (status, prioridade, filtros) |
| Estilo | Tailwind CSS | Velocidade de construção de UI consistente sem CSS customizado extenso |
| Backend | FastAPI (Python) | Alta produtividade, tipagem via Pydantic, geração automática de OpenAPI/Swagger, e mesma linguagem do serviço de análise de dados |
| Banco de dados | PostgreSQL | Relacional, maduro, adequado ao domínio (tickets, usuários, categorias fortemente relacionados) |
| ORM | SQLAlchemy | Padrão de mercado no ecossistema FastAPI, suporta migrations via Alembic |
| Containerização | Docker Compose | Sobe frontend, backend e banco com um único comando, elimina "funciona na minha máquina" |
| Documentação de API | Swagger/OpenAPI | Gerado automaticamente pelo FastAPI, sem esforço manual de manutenção |
| Versionamento | Git + GitHub | Padrão de mercado |

## 3. Estrutura de pastas

```
opsflow/
├── frontend/
│   ├── src/
│   │   ├── components/       # Layout, StatusBadge, PriorityBadge, SlaIndicator, ProtectedRoute
│   │   ├── pages/             # Dashboard, Tickets, TicketDetails, KnowledgeBase, Improvements, WorkflowBuilder, Admin
│   │   ├── services/          # chamadas à API (axios)
│   │   ├── types/             # tipos TypeScript compartilhados (Ticket, Usuario...)
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py            # entrypoint FastAPI
│   │   ├── models/             # modelos SQLAlchemy
│   │   ├── schemas/            # schemas Pydantic (request/response)
│   │   ├── routers/            # auth, categorias, tickets, kb, workflows, insights, users
│   │   ├── services/            # workflow_engine, kb_search, insights
│   │   └── core/               # config, banco, segurança, dependências
│   ├── tests/                  # pytest — auth, tickets, workflows, kb, insights
│   ├── requirements.txt
│   └── requirements-dev.txt
│
├── database/
│   └── init.sql                # schema inicial / seed de dados de exemplo
│
├── docker/
│   ├── docker-compose.yml
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── docs/
│   ├── requisitos.md
│   ├── arquitetura.md
│   ├── regras-de-negocio.md
│   ├── api.md
│   └── roadmap.md
│
├── assets/                     # diagramas, mockups, imagens
└── README.md
```

## 4. Fluxo de dados — exemplo (abertura de ticket com sugestão automática)

1. Colaborador digita título/descrição na Tela de abertura de chamado (frontend).
2. A cada alteração relevante no texto, o frontend chama `GET /kb/search?q=<termo>` (com debounce).
3. O backend busca na tabela de artigos da Knowledge Base por correspondência de palavras-chave/categoria.
4. Se houver correspondência, o backend retorna o(s) artigo(s) mais relevante(s); o frontend exibe "Encontramos um artigo semelhante. Deseja consultá-lo?".
5. Se o colaborador prosseguir com a abertura, o frontend chama `POST /tickets`.
6. O backend salva o ticket, executa o motor de Workflow (ver `regras-de-negocio.md`) e retorna o ticket criado, já com responsável e prazo definidos, se alguma regra se aplicar.

## 5. Serviço de Insights (Python)

Módulo dentro do backend (`app/services/insights.py`) que:

1. Recebe um conjunto de tickets (ex.: os últimos N ou os da última semana);
2. Tokeniza e conta a frequência de palavras/categorias no título e descrição;
3. Calcula tempo médio de resolução e distribuição de prioridade;
4. Gera um resumo estruturado (percentuais por categoria/palavra-chave + recomendações baseadas em regras simples, ex.: "categoria representa mais de 30% do volume → sugerir documentação").

No MVP, esse resumo é calculado sob demanda (`GET /insights/weekly`); não há agendamento automático nem machine learning — apenas contagem de frequência e regras de limiar (thresholds), o que já é suficiente para demonstrar valor e pode evoluir depois.

## 6. Ambiente de desenvolvimento (Docker Compose)

Serviços previstos em `docker/docker-compose.yml`:

- `db` — PostgreSQL, com volume persistente e dados de seed;
- `backend` — FastAPI, com hot-reload em desenvolvimento;
- `frontend` — servidor de desenvolvimento React (Vite), com proxy para o backend.

Um único `docker compose up` deve deixar o ambiente completo no ar.

## 7. Segurança (nível MVP)

- Autenticação via JWT (login simples, sem SSO nesta fase);
- Autorização por perfil (Colaborador, Analista, Gestor, Administrador), verificada no backend a cada rota sensível;
- CORS restrito às origens do frontend definidas em configuração;
- Segredos (senha do banco, chave JWT) via variáveis de ambiente, nunca versionados no repositório.

# OpsFlow

Sistema interno de gestão de chamados (Service Desk / IT Support) para empresas com operação multi-país e múltiplas plataformas internas.

## Contexto

Colaboradores em diversos países reportam, todos os dias, problemas recorrentes de TI e acesso — VPN, senha, permissões, lentidão de sistemas — através de canais informais e sem padronização. Isso gera retrabalho, perda de histórico e dificuldade de enxergar padrões.

O **OpsFlow** centraliza, prioriza e documenta esses chamados, e usa análise de dados simples para reduzir volume repetitivo e acelerar a resolução — mantendo o time de Customer Operations no centro do processo.

## Objetivo do MVP

Entregar, em **2 a 3 semanas**, uma versão funcional que cubra o ciclo completo de um chamado — abertura, triagem, resolução e aprendizado contínuo — com indicadores básicos e um mecanismo simples de automação de processos (Workflow Builder).

## Como rodar

Pré-requisito: Docker e Docker Compose instalados.

```bash
cd docker
docker compose up --build
```

Isso sobe três serviços:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend (API) | http://localhost:8000/api/v1/health |
| Swagger / OpenAPI | http://localhost:8000/docs |

O banco já sobe com schema e dados de exemplo (ver `database/init.sql`), incluindo um usuário de cada perfil. Login de exemplo:

| E-mail | Senha | Perfil |
|---|---|---|
| admin@opsflow.com | OpsFlow123! | Administrador |
| analista@opsflow.com | OpsFlow123! | Analista de Customer Operations |
| gestor@opsflow.com | OpsFlow123! | Gestor |
| colaborador@opsflow.com | OpsFlow123! | Colaborador |

### Rodando sem Docker (desenvolvimento local)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # ajuste DATABASE_URL para um Postgres local
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Rodando os testes automatizados (backend)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
pytest -v
```

Os testes usam SQLite em memória (não dependem do PostgreSQL) e cobrem autenticação, CRUD de tickets, execução do Workflow Builder, busca na Knowledge Base e o serviço de Insights.

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/requisitos.md](docs/requisitos.md) | Requisitos funcionais e não funcionais, perfis de usuário, escopo do MVP |
| [docs/arquitetura.md](docs/arquitetura.md) | Stack, estrutura de pastas, decisões técnicas, fluxo de dados |
| [docs/regras-de-negocio.md](docs/regras-de-negocio.md) | Ciclo de vida do ticket, SLA, permissões, regras do Workflow Builder |
| [docs/api.md](docs/api.md) | Contrato inicial da API REST |
| [docs/roadmap.md](docs/roadmap.md) | Plano de entrega dividido em sprints semanais |

## Estrutura do repositório

```
opsflow/
├── frontend/       # React + TypeScript + Tailwind CSS
├── backend/        # FastAPI (Python)
├── database/       # Migrations e modelagem PostgreSQL
├── docker/         # Docker Compose e Dockerfiles
├── docs/           # Documentação do projeto
├── assets/         # Imagens, mockups, diagramas
└── README.md
```

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Banco de dados:** PostgreSQL + SQLAlchemy (ORM)
- **Containerização:** Docker Compose
- **Documentação de API:** Swagger / OpenAPI (gerado automaticamente pelo FastAPI)
- **Versionamento:** Git + GitHub

## Perfis de usuário

| Perfil | Papel |
|---|---|
| Colaborador | Abre chamados e acompanha o andamento |
| Analista de Customer Operations | Triagem, resposta, priorização, documentação e fechamento |
| Gestor | Acompanha indicadores e desempenho por equipe/país/categoria |
| Administrador | Configura categorias, prioridades, workflows e usuários |

## Status

🚧 Em desenvolvimento — fase de documentação e planejamento. Ver [roadmap](docs/roadmap.md) para o cronograma das próximas semanas.

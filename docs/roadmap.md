# Roadmap — OpsFlow (MVP em 2 a 3 semanas)

> Atualizado após a implementação do esqueleto completo (backend, frontend, banco) e da suíte de testes automatizados. Itens concluídos estão marcados abaixo.

## Sprint 1 — Fundação (Semana 1)

**Objetivo:** ambiente rodando de ponta a ponta com o fluxo mínimo de ticket.

- [x] Estrutura do repositório (`frontend/`, `backend/`, `database/`, `docker/`, `docs/`)
- [x] Docker Compose com PostgreSQL, backend e frontend subindo juntos
- [x] Modelagem inicial do banco: `tickets`, `usuarios`, `categorias`, `comentarios`, `historico_ticket`
- [x] Backend: autenticação (login/JWT) e CRUD de tickets (`GET/POST /tickets`, `GET/PATCH /tickets/{id}`)
- [x] Frontend: tela de login e Tela 2 (Lista de Tickets) consumindo a API real
- [x] Seed de dados de exemplo (tickets, usuários, categorias) para testes

## Sprint 2 — Núcleo funcional (Semana 2)

**Objetivo:** cobrir as telas centrais do dia a dia do Analista.

- [x] Tela 1 (Dashboard): indicadores principais + gráficos simples
- [x] Tela 3 (Detalhes do ticket): histórico, comentários, alteração de status/prioridade
- [x] Tela 4 (Knowledge Base): CRUD de artigos
- [x] Tela 5 (Sugestão automática): busca por palavra-chave integrada à criação de ticket
- [x] Cálculo de SLA e sinalização de SLA vencido
- [x] Documentação de API validada no Swagger gerado pelo FastAPI

## Sprint 3 — Automação, insights e polimento (Semana 3)

**Objetivo:** demonstrar diferencial de automação e análise de dados.

- [x] Workflow Builder: cadastro de regras condição → ação (Admin) e motor de execução no backend
- [x] Serviço de Insights em Python: análise de frequência de palavras/categorias, tempo médio, prioridade
- [x] Tela 6 (Dashboard de melhorias): problemas mais frequentes + sugestões baseadas em regras
- [x] Tela de Administração: gestão de categorias e usuários (perfil Administrador)
- [x] Suíte de testes automatizados no backend (pytest — auth, tickets, workflows, KB, insights)
- [ ] Ajustes de usabilidade e responsividade (mobile) — pendente
- [x] Revisão final da documentação (`docs/`)
- [x] Deploy do ambiente completo via `docker compose up` documentado no README

## Próximos passos (pós-MVP)

Itens deliberadamente fora do MVP (ver `requisitos.md`, seção 6), candidatos a uma v2:

- Testes automatizados de frontend (Vitest/Testing Library)
- SSO/LDAP corporativo
- Notificações em tempo real (e-mail/push)
- Escalonamento automático de SLA multi-nível
- Correspondência semântica (NLP) na sugestão automática da Knowledge Base, hoje baseada em palavras-chave

## Critério de pronto do MVP

O MVP é considerado pronto quando:

1. Um Colaborador consegue abrir um ticket e recebe sugestão de artigo da KB quando aplicável; ✅
2. Um Analista consegue triar, comentar, alterar status/prioridade e fechar o ticket; ✅
3. Uma regra de Workflow Builder é aplicada automaticamente na criação/atualização de um ticket; ✅
4. O Dashboard (Tela 1) e o Dashboard de Melhorias (Tela 6) exibem dados reais vindos do banco; ✅
5. O serviço de Insights gera o resumo semanal a partir dos tickets existentes; ✅
6. Todo o ambiente sobe com `docker compose up` e a API está documentada em `/docs`. ✅

Todos os critérios foram atendidos e validados (testes automatizados + testes de integração manuais contra um PostgreSQL real).

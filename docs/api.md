# API — OpsFlow

> Este documento descreve o contrato inicial da API. A referência completa e sempre atualizada é gerada automaticamente pelo FastAPI em `/docs` (Swagger UI) e `/openapi.json`.

- **Base URL:** `/api/v1`
- **Formato:** JSON
- **Autenticação:** Bearer token (JWT), enviado no header `Authorization: Bearer <token>`

## Autenticação

### `POST /auth/login`
```json
// Request
{ "email": "analista@empresa.com", "senha": "********" }

// Response 200
{ "access_token": "eyJhbGciOi...", "token_type": "bearer", "perfil": "analista" }
```

## Categorias

| Método | Rota | Descrição | Perfis |
|---|---|---|---|
| GET | `/categorias` | Lista categorias | Todos os perfis autenticados |
| POST | `/categorias` | Cria categoria | Admin |
| PATCH | `/categorias/{id}` | Edita nome/descrição | Admin |

## Tickets

| Método | Rota | Descrição | Perfis |
|---|---|---|---|
| GET | `/tickets` | Lista tickets (filtros por status, prioridade, categoria, país, plataforma, texto) | Analista, Gestor, Admin |
| GET | `/tickets/{id}` | Detalhe de um ticket, incluindo histórico e comentários | Analista, Gestor, Admin, Colaborador (próprio) |
| POST | `/tickets` | Cria um novo ticket | Colaborador, Analista |
| PATCH | `/tickets/{id}/status` | Altera o status | Analista, Admin |
| PATCH | `/tickets/{id}/prioridade` | Altera a prioridade | Analista, Admin |
| POST | `/tickets/{id}/comentarios` | Adiciona um comentário | Colaborador (próprio), Analista, Admin |

**Exemplo — criar ticket:**
```json
// POST /tickets
{
  "titulo": "VPN não conecta",
  "descricao": "Não consigo conectar na VPN desde ontem à tarde.",
  "categoria": "VPN",
  "pais": "Brasil",
  "plataforma": "Rede Corporativa"
}

// Response 201
{
  "id": 1042,
  "titulo": "VPN não conecta",
  "categoria": "VPN",
  "prioridade": "Media",
  "status": "Aberto",
  "responsavel": null,
  "criado_em": "2026-07-08T14:32:00Z"
}
```

## Base de Conhecimento

| Método | Rota | Descrição |
|---|---|---|
| GET | `/kb` | Lista artigos |
| GET | `/kb/search?q=vpn` | Busca artigos por palavra-chave/categoria (usada na sugestão automática) |
| POST | `/kb` | Cria artigo (Analista/Admin) |
| PATCH | `/kb/{id}` | Edita artigo (Analista/Admin) |

**Exemplo — busca:**
```json
// GET /kb/search?q=vpn
{
  "resultados": [
    { "id": 7, "problema": "VPN não conecta", "relevancia": 0.86 }
  ]
}
```

## Workflows

| Método | Rota | Descrição |
|---|---|---|
| GET | `/workflows` | Lista regras cadastradas |
| POST | `/workflows` | Cria regra (Admin) |
| PATCH | `/workflows/{id}` | Edita regra (Admin) |
| DELETE | `/workflows/{id}` | Remove regra (Admin) |

**Exemplo — regra:**
```json
// POST /workflows
{
  "condicao": { "campo": "prioridade", "operador": "=", "valor": "Alta" },
  "acoes": [
    { "tipo": "atribuir_equipe", "valor": "Infraestrutura" },
    { "tipo": "definir_prazo_horas", "valor": 4 }
  ]
}
```

## Insights

| Método | Rota | Descrição |
|---|---|---|
| GET | `/insights/weekly` | Retorna o resumo de insights do período (categorias mais frequentes, tempo médio, recomendações) |

**Exemplo:**
```json
{
  "periodo": "2026-07-01/2026-07-07",
  "top_categorias": [
    { "categoria": "VPN", "percentual": 34 },
    { "categoria": "Senha", "percentual": 22 }
  ],
  "tempo_medio_resolucao_horas": 5.4,
  "recomendacoes": [
    "Criar documentação específica para redefinição de senha."
  ]
}
```

## Usuários (Admin)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/users` | Lista usuários |
| POST | `/users` | Cria usuário e define perfil |
| PATCH | `/users/{id}` | Edita perfil/dados do usuário |

## Convenções gerais

- Erros seguem o formato `{ "detail": "mensagem" }` com o status HTTP apropriado (400, 401, 403, 404, 422).
- Listagens suportam paginação via `?page=` e `?page_size=`.
- Datas em ISO 8601, UTC.

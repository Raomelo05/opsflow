# Regras de Negócio — OpsFlow

## 1. Ciclo de vida do ticket

```
Aberto ──► Em andamento ──► Aguardando confirmação ──► Resolvido ──► Fechado
   ▲                                                        │
   └────────────────────── Reaberto ◄──────────────────────┘
```

| Status | Significado |
|---|---|
| Aberto | Ticket criado, ainda não assumido por um analista |
| Em andamento | Um analista assumiu e está trabalhando na solução |
| Aguardando confirmação | Solução aplicada/enviada, aguardando confirmação do colaborador |
| Resolvido | Colaborador confirmou a solução |
| Fechado | Encerrado definitivamente (após resolvido, ou por inatividade) |
| Reaberto | Colaborador indicou que o problema persiste após "Resolvido" |

**Regras:**
- **RN01.** Todo ticket nasce com status **Aberto**.
- **RN02.** Só é possível ir para **Resolvido** a partir de **Aguardando confirmação** ou **Em andamento** (quando o analista já confirma a solução em nome do colaborador).
- **RN02-a.** Uma regra do Workflow Builder pode levar o ticket direto de **Aberto** para **Aguardando confirmação** (ex.: quando um artigo da KB é enviado automaticamente, sem um analista ter assumido o ticket ainda).
- **RN03.** Um ticket **Fechado** só pode ser reaberto pelo Analista ou pelo Colaborador dentro de um prazo definido (ex.: 7 dias); depois disso, deve ser aberto um novo ticket referenciando o anterior. *(No MVP, o backend valida as transições de status permitidas — RN01/RN02/RN02-a — mas ainda não valida a janela de 7 dias de RN03.)*

## 2. Prioridades e SLA

| Prioridade | Prazo de primeira resposta | Prazo de resolução |
|---|---|---|
| Crítica | 30 minutos | 2 horas |
| Alta | 1 hora | 4 horas |
| Média | 4 horas | 8 horas |
| Baixa | 8 horas | 24 horas |

**Regras:**
- **RN04.** O SLA é contado a partir da criação do ticket até a mudança para **Resolvido**.
- **RN05.** Um ticket é marcado como **SLA vencido** quando o tempo decorrido ultrapassa o prazo de resolução da sua prioridade, independentemente do status atual (exceto Fechado/Resolvido).
- **RN06.** A alteração de prioridade recalcula o prazo de SLA a partir do momento da alteração (não retroage).

## 3. Perfis e permissões

| Ação | Colaborador | Analista | Gestor | Administrador |
|---|:---:|:---:|:---:|:---:|
| Abrir ticket | ✅ | ✅ | ❌ | ❌ |
| Ver apenas seus próprios tickets | ✅ | — | — | — |
| Ver todos os tickets | ❌ | ✅ | ✅ (leitura) | ✅ |
| Alterar status/prioridade | ❌ | ✅ | ❌ | ✅ |
| Comentar em ticket | ✅ (próprio) | ✅ | ❌ | ✅ |
| Ver dashboards operacionais | ❌ | ✅ | ✅ | ✅ |
| Ver dashboard de melhorias | ❌ | ✅ | ✅ | ✅ |
| Editar Knowledge Base | ❌ | ✅ | ❌ | ✅ |
| Configurar Workflow Builder | ❌ | ❌ | ❌ | ✅ |
| Gerenciar categorias/prioridades/usuários | ❌ | ❌ | ❌ | ✅ |

## 4. Sugestão automática (Knowledge Base)

- **RN07.** Ao digitar título/descrição de um novo ticket, o sistema busca artigos da base de conhecimento cuja categoria ou palavras-chave tenham correspondência com o texto digitado.
- **RN08.** No MVP, a correspondência é feita por comparação de palavras-chave (case-insensitive, ignorando acentuação e stopwords), não por machine learning.
- **RN09.** Se houver correspondência, o artigo mais relevante (maior número de termos coincidentes) é sugerido antes da confirmação de abertura do chamado.

## 5. Workflow Builder

Regras no formato **condição → ação(ões)**, avaliadas na criação ou atualização de um ticket, na ordem em que foram cadastradas (a primeira regra que casar é aplicada; regras adicionais podem ser configuradas para continuar avaliando, conforme necessidade).

**Exemplos de regras do MVP:**

```
Se prioridade = Alta
  → Atribuir ao Time de Infraestrutura
  → Definir prazo = 4 horas
```

```
Se categoria = Senha
  → Enviar artigo da Base de Conhecimento correspondente
  → Marcar status = "Aguardando confirmação"
```

**Regras gerais:**
- **RN10.** Uma regra é composta por: 1 condição (campo + operador + valor) e 1 ou mais ações.
- **RN11.** Campos suportados como condição no MVP: categoria, prioridade, país, plataforma.
- **RN12.** Ações suportadas no MVP: atribuir responsável/equipe, definir prazo, enviar artigo da KB, alterar status.
- **RN13.** Regras são avaliadas automaticamente sempre que um ticket é criado ou tem categoria/prioridade alterada.

## 6. Dashboard de melhorias

- **RN14.** O sistema conta ocorrências de tickets agrupadas por categoria/palavra-chave em uma janela de tempo (ex.: últimos 30 dias).
- **RN15.** Categorias/palavras-chave cuja participação ultrapasse um limiar configurável (ex.: > 20% do volume total) geram uma sugestão automática de melhoria (ex.: "criar FAQ para X").
- **RN16.** A "economia estimada" exibida no MVP é uma estimativa baseada em regra simples (ex.: percentual de chamados que poderiam ser evitados com autoatendimento, com base em ocorrências históricas), não um cálculo financeiro validado — isso é declarado explicitamente na interface para não gerar expectativa incorreta.

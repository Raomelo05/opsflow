export type Perfil = 'colaborador' | 'analista' | 'gestor' | 'administrador'

export type Prioridade = 'baixa' | 'media' | 'alta' | 'critica'

export type StatusTicket =
  | 'aberto'
  | 'em_andamento'
  | 'aguardando_confirmacao'
  | 'resolvido'
  | 'fechado'
  | 'reaberto'

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: Perfil
  pais?: string | null
}

export interface Categoria {
  id: number
  nome: string
  descricao?: string | null
}

export interface Ticket {
  id: number
  titulo: string
  descricao: string
  categoria_id: number
  prioridade: Prioridade
  status: StatusTicket
  solicitante_id: number
  responsavel_id: number | null
  pais: string
  plataforma: string
  prazo_sla: string | null
  criado_em: string
  atualizado_em: string
  resolvido_em: string | null
}

export interface Comentario {
  id: number
  autor_id: number
  texto: string
  criado_em: string
}

export interface Historico {
  campo_alterado: string
  valor_anterior: string | null
  valor_novo: string | null
  alterado_por_id: number
  alterado_em: string
}

export interface TicketDetalhe extends Ticket {
  comentarios: Comentario[]
  historico: Historico[]
}

export interface ArtigoKB {
  id: number
  problema: string
  categoria_id?: number | null
  solucao: string
  palavras_chave?: string | null
  criado_em: string
}

export interface ResultadoBuscaKB {
  id: number
  problema: string
  relevancia: number
}

export type CondicaoCampo = 'categoria' | 'prioridade' | 'pais' | 'plataforma'
export type TipoAcao = 'atribuir_equipe' | 'definir_prazo_horas' | 'enviar_artigo_kb' | 'alterar_status'

export interface WorkflowAcao {
  id?: number
  tipo_acao: TipoAcao
  valor: string
  ordem: number
}

export interface Workflow {
  id: number
  nome: string
  condicao_campo: CondicaoCampo
  condicao_valor: string
  ativo: boolean
  acoes: WorkflowAcao[]
}

export interface CategoriaFrequencia {
  categoria: string
  percentual: number
  ocorrencias: number
}

export interface InsightsResponse {
  periodo: string
  total_tickets: number
  top_categorias: CategoriaFrequencia[]
  tempo_medio_resolucao_horas: number | null
  recomendacoes: string[]
}

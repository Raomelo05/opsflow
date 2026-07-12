import { api } from './api'
import type { CondicaoCampo, TipoAcao, Workflow } from '../types'

export async function listarWorkflows(): Promise<Workflow[]> {
  const { data } = await api.get('/workflows')
  return data
}

export interface NovaAcaoWorkflow {
  tipo_acao: TipoAcao
  valor: string
  ordem: number
}

export interface NovoWorkflow {
  nome: string
  condicao_campo: CondicaoCampo
  condicao_valor: string
  acoes: NovaAcaoWorkflow[]
}

export async function criarWorkflow(payload: NovoWorkflow): Promise<Workflow> {
  const { data } = await api.post('/workflows', payload)
  return data
}

export async function removerWorkflow(id: number): Promise<void> {
  await api.delete(`/workflows/${id}`)
}

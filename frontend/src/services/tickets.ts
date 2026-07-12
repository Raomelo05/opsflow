import { api } from './api'
import type { Comentario, Prioridade, StatusTicket, Ticket, TicketDetalhe } from '../types'

export interface FiltrosTickets {
  status_filtro?: StatusTicket
  prioridade_filtro?: Prioridade
  categoria_id?: number
  pais?: string
  plataforma?: string
  texto?: string
}

export async function listarTickets(filtros: FiltrosTickets = {}): Promise<Ticket[]> {
  const { data } = await api.get('/tickets', { params: filtros })
  return data
}

export async function detalharTicket(id: number): Promise<TicketDetalhe> {
  const { data } = await api.get(`/tickets/${id}`)
  return data
}

export interface NovoTicket {
  titulo: string
  descricao: string
  categoria_id: number
  pais: string
  plataforma: string
  prioridade: Prioridade
}

export async function criarTicket(payload: NovoTicket): Promise<Ticket> {
  const { data } = await api.post('/tickets', payload)
  return data
}

export async function alterarStatus(id: number, status: StatusTicket): Promise<Ticket> {
  const { data } = await api.patch(`/tickets/${id}/status`, { status })
  return data
}

export async function alterarPrioridade(id: number, prioridade: Prioridade): Promise<Ticket> {
  const { data } = await api.patch(`/tickets/${id}/prioridade`, { prioridade })
  return data
}

export async function comentarTicket(id: number, texto: string): Promise<Comentario> {
  const { data } = await api.post(`/tickets/${id}/comentarios`, { texto })
  return data
}

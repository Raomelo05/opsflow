import { api } from './api'
import type { Categoria } from '../types'

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get('/categorias')
  return data
}

export async function criarCategoria(payload: { nome: string; descricao?: string }): Promise<Categoria> {
  const { data } = await api.post('/categorias', payload)
  return data
}

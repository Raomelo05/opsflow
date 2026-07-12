import { api } from './api'
import type { ArtigoKB, ResultadoBuscaKB } from '../types'

export async function listarArtigos(): Promise<ArtigoKB[]> {
  const { data } = await api.get('/kb')
  return data
}

export async function buscarArtigos(q: string): Promise<ResultadoBuscaKB[]> {
  if (!q.trim()) return []
  const { data } = await api.get('/kb/search', { params: { q } })
  return data
}

export interface NovoArtigoKB {
  problema: string
  categoria_id?: number | null
  solucao: string
  palavras_chave?: string
}

export async function criarArtigo(payload: NovoArtigoKB): Promise<ArtigoKB> {
  const { data } = await api.post('/kb', payload)
  return data
}

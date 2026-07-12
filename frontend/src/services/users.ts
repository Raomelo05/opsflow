import { api } from './api'
import type { Perfil, Usuario } from '../types'

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get('/users')
  return data
}

export async function criarUsuario(payload: {
  nome: string
  email: string
  senha: string
  perfil: Perfil
  pais?: string
}): Promise<Usuario> {
  const { data } = await api.post('/users', payload)
  return data
}

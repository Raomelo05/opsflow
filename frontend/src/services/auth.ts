import { api, salvarSessao } from './api'

export async function login(email: string, senha: string): Promise<string> {
  const { data } = await api.post('/auth/login', { email, senha })
  salvarSessao(data.access_token, data.perfil)
  return data.perfil as string
}

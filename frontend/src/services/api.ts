import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({ baseURL })

const TOKEN_KEY = 'opsflow_token'
const PERFIL_KEY = 'opsflow_perfil'

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Se o token expirou ou é inválido, o backend responde 401 — nesse caso,
// limpamos a sessão e mandamos o usuário de volta para o login em vez de
// deixar a tela quebrada com chamadas falhando silenciosamente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      limparSessao()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export function salvarSessao(token: string, perfil: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(PERFIL_KEY, perfil)
}

export function limparSessao(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(PERFIL_KEY)
}

export function obterPerfil(): string | null {
  return localStorage.getItem(PERFIL_KEY)
}

export function estaAutenticado(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

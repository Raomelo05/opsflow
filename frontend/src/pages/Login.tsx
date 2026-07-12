import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      await login(email, senha)
      navigate('/dashboard', { replace: true })
    } catch {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="font-mono text-2xl font-semibold text-ink">OpsFlow</span>
          <p className="mt-1 text-sm text-slate">Gestão de chamados internos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="analista@empresa.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {erro && <p className="text-sm text-priority-critica">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

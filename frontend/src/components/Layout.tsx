import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { limparSessao, obterPerfil } from '../services/api'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icone: '◧' },
  { to: '/tickets', label: 'Tickets', icone: '☰' },
  { to: '/kb', label: 'Base de Conhecimento', icone: '◎' },
  { to: '/improvements', label: 'Melhorias', icone: '△' },
  { to: '/workflows', label: 'Workflow Builder', icone: '⋔' },
]

const NAV_ITEM_ADMIN = { to: '/admin', label: 'Administração', icone: '⚙' }

const LABEL_PERFIL: Record<string, string> = {
  colaborador: 'Colaborador',
  analista: 'Analista de Customer Operations',
  gestor: 'Gestor',
  administrador: 'Administrador',
}

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const perfil = obterPerfil() ?? 'analista'

  function sair() {
    limparSessao()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="flex w-60 shrink-0 flex-col bg-sidebar text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <span className="font-mono text-lg font-semibold tracking-tight">OpsFlow</span>
          <p className="mt-0.5 text-xs text-sidebar-muted">Customer Operations</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {[...NAV_ITEMS, ...(perfil === 'administrador' ? [NAV_ITEM_ADMIN] : [])].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <span aria-hidden className="w-4 text-center">{item.icone}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-xs text-sidebar-muted">Perfil</p>
          <p className="text-sm">{LABEL_PERFIL[perfil] ?? perfil}</p>
          <button
            onClick={sair}
            className="mt-3 text-xs text-sidebar-muted underline decoration-dotted hover:text-white"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}

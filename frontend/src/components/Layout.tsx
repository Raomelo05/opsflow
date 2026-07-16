import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket as TicketIcon,
  TrendingUp,
  Workflow,
} from 'lucide-react'
import { limparSessao, obterPerfil } from '../services/api'
import { ThemeSwitcher } from './ui/ThemeSwitcher'
import { NotificationBell } from './ui/NotificationBell'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tickets', label: 'Tickets', icon: TicketIcon },
  { to: '/kb', label: 'Base de Conhecimento', icon: BookOpen },
  { to: '/improvements', label: 'Melhorias', icon: TrendingUp },
  { to: '/workflows', label: 'Workflow Builder', icon: Workflow },
]

const NAV_ITEM_ADMIN = { to: '/admin', label: 'Administração', icon: Settings }

const LABEL_PERFIL: Record<string, string> = {
  colaborador: 'Colaborador',
  analista: 'Analista de Customer Operations',
  gestor: 'Gestor',
  administrador: 'Administrador',
}

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const perfil = obterPerfil() ?? 'analista'
  const itens = [...NAV_ITEMS, ...(perfil === 'administrador' ? [NAV_ITEM_ADMIN] : [])]

  function sair() {
    limparSessao()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-60 shrink-0 flex-col bg-sidebar">
        <div className="border-b border-border px-5 py-5">
          <span className="font-mono text-lg font-bold tracking-tight text-ink">OpsFlow</span>
          <p className="mt-0.5 text-xs text-ink-secondary">Customer Operations</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {itens.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-ink-secondary hover:bg-background-secondary hover:text-ink'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="text-xs text-ink-secondary">Perfil</p>
          <p className="text-sm text-ink">{LABEL_PERFIL[perfil] ?? perfil}</p>
          <button
            onClick={sair}
            className="mt-3 flex items-center gap-1.5 text-xs text-ink-secondary transition-colors hover:text-danger"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-surface px-6">
          <NotificationBell />
          <ThemeSwitcher />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listarTickets } from '../../services/tickets'
import type { Ticket } from '../../types'

const STATUS_ATIVO = new Set(['aberto', 'em_andamento', 'aguardando_confirmacao', 'reaberto'])

/**
 * Sino de notificações. Não existe um serviço de notificações no backend —
 * em vez de simular dados falsos, calculamos algo real e útil a partir dos
 * tickets já expostos por GET /tickets: quais estão com SLA vencido agora.
 */
export function NotificationBell() {
  const [aberto, setAberto] = useState(false)
  const [vencidos, setVencidos] = useState<Ticket[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listarTickets()
      .then((tickets) => {
        const agora = Date.now()
        const overdue = tickets.filter(
          (t) => t.prazo_sla && STATUS_ATIVO.has(t.status) && new Date(t.prazo_sla).getTime() < agora,
        )
        setVencidos(overdue)
      })
      .catch(() => setVencidos([]))
  }, [])

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-label="Notificações"
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-ink-secondary transition-colors duration-200 hover:bg-background-secondary hover:text-ink"
      >
        <Bell className="h-4 w-4" />
        {vencidos.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {vencidos.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-72 rounded-lg border border-border bg-surface p-2 shadow-lg"
          >
            <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
              SLA vencido
            </p>
            {vencidos.length === 0 && (
              <p className="px-2 py-3 text-sm text-ink-secondary">Nenhum chamado com SLA vencido agora.</p>
            )}
            <ul className="max-h-64 overflow-y-auto">
              {vencidos.slice(0, 5).map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/tickets/${t.id}`}
                    onClick={() => setAberto(false)}
                    className="block rounded-md px-2 py-2 text-sm text-ink transition-colors hover:bg-background-secondary"
                  >
                    <span className="font-mono text-xs text-danger">OP-{t.id.toString().padStart(4, '0')}</span>
                    <p className="truncate">{t.titulo}</p>
                  </Link>
                </li>
              ))}
            </ul>
            {vencidos.length > 0 && (
              <Link
                to="/tickets"
                onClick={() => setAberto(false)}
                className="mt-1 block rounded-md px-2 py-2 text-center text-xs font-medium text-primary hover:bg-background-secondary"
              >
                Ver todos os tickets
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

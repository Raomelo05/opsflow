import type { StatusTicket } from '../types'

const ESTILOS: Record<StatusTicket, string> = {
  aberto: 'bg-status-aberto/10 text-status-aberto',
  em_andamento: 'bg-status-andamento/10 text-status-andamento',
  aguardando_confirmacao: 'bg-status-aguardando/10 text-status-aguardando',
  resolvido: 'bg-status-resolvido/10 text-status-resolvido',
  fechado: 'bg-status-fechado/10 text-status-fechado',
  reaberto: 'bg-status-reaberto/10 text-status-reaberto',
}

const COR_PONTO: Record<StatusTicket, string> = {
  aberto: 'bg-status-aberto',
  em_andamento: 'bg-status-andamento',
  aguardando_confirmacao: 'bg-status-aguardando',
  resolvido: 'bg-status-resolvido',
  fechado: 'bg-status-fechado',
  reaberto: 'bg-status-reaberto',
}

const LABEL: Record<StatusTicket, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  aguardando_confirmacao: 'Aguardando usuário',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
  reaberto: 'Reaberto',
}

export function StatusBadge({ status }: { status: StatusTicket }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${ESTILOS[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${COR_PONTO[status]}`} />
      {LABEL[status]}
    </span>
  )
}

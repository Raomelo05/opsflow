import type { StatusTicket } from '../types'

const ESTILOS: Record<StatusTicket, string> = {
  aberto: 'bg-statusc-aberto/10 text-statusc-aberto border-statusc-aberto/30',
  em_andamento: 'bg-statusc-andamento/10 text-statusc-andamento border-statusc-andamento/30',
  aguardando_confirmacao: 'bg-statusc-aguardando/10 text-statusc-aguardando border-statusc-aguardando/30',
  resolvido: 'bg-statusc-resolvido/10 text-statusc-resolvido border-statusc-resolvido/30',
  fechado: 'bg-statusc-fechado/10 text-statusc-fechado border-statusc-fechado/30',
  reaberto: 'bg-statusc-reaberto/10 text-statusc-reaberto border-statusc-reaberto/30',
}

const LABEL: Record<StatusTicket, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  aguardando_confirmacao: 'Aguardando confirmação',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
  reaberto: 'Reaberto',
}

export function StatusBadge({ status }: { status: StatusTicket }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${ESTILOS[status]}`}
    >
      {LABEL[status]}
    </span>
  )
}

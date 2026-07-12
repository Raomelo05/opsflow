import type { Prioridade } from '../types'

const ESTILOS: Record<Prioridade, string> = {
  critica: 'bg-priority-critica/10 text-priority-critica border-priority-critica/30',
  alta: 'bg-priority-alta/10 text-priority-alta border-priority-alta/30',
  media: 'bg-priority-media/10 text-priority-media border-priority-media/30',
  baixa: 'bg-priority-baixa/10 text-priority-baixa border-priority-baixa/30',
}

const LABEL: Record<Prioridade, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export function PriorityBadge({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${ESTILOS[prioridade]}`}
    >
      {LABEL[prioridade]}
    </span>
  )
}

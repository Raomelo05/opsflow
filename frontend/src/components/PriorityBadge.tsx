import type { Prioridade } from '../types'

const ESTILOS: Record<Prioridade, string> = {
  critica: 'bg-priority-critica/10 text-priority-critica',
  alta: 'bg-priority-alta/10 text-priority-alta',
  media: 'bg-priority-media/10 text-priority-media',
  baixa: 'bg-priority-baixa/10 text-priority-baixa',
}

const COR_PONTO: Record<Prioridade, string> = {
  critica: 'bg-priority-critica',
  alta: 'bg-priority-alta',
  media: 'bg-priority-media',
  baixa: 'bg-priority-baixa',
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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${ESTILOS[prioridade]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${COR_PONTO[prioridade]}`} />
      {LABEL[prioridade]}
    </span>
  )
}

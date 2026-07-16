import type { Prioridade } from '../types'

// Mesmos prazos usados no backend (ver docs/regras-de-negocio.md)
const SLA_HORAS: Record<Prioridade, number> = {
  critica: 2,
  alta: 4,
  media: 8,
  baixa: 24,
}

interface SlaIndicatorProps {
  prioridade: Prioridade
  criadoEm: string
  prazoSla: string | null
  resolvido?: boolean
}

/**
 * Elemento de assinatura visual do OpsFlow: uma barra que mostra o tempo
 * decorrido em relação ao prazo de SLA, mudando de cor conforme o risco
 * de estouro. Aparece na lista de tickets e no detalhe do ticket.
 */
export function SlaIndicator({ prioridade, criadoEm, prazoSla, resolvido }: SlaIndicatorProps) {
  if (resolvido || !prazoSla) {
    return <span className="font-mono text-xs text-ink-disabled">—</span>
  }

  const agora = Date.now()
  const prazo = new Date(prazoSla).getTime()
  const criado = new Date(criadoEm).getTime()
  const totalMs = SLA_HORAS[prioridade] * 60 * 60 * 1000
  const decorridoMs = agora - criado
  const restanteMs = prazo - agora
  const proporcao = Math.min(Math.max(decorridoMs / totalMs, 0), 1)

  const vencido = restanteMs < 0
  const critico = !vencido && restanteMs < totalMs * 0.25
  const cor = vencido ? 'bg-status-vencido' : critico ? 'bg-warning' : 'bg-primary'
  const texto = vencido ? 'SLA vencido' : `vence em ${formatarRestante(restanteMs)}`

  return (
    <div className="flex w-28 flex-col gap-1">
      <span className={`font-mono text-[11px] ${vencido ? 'font-medium text-status-vencido' : 'text-ink-secondary'}`}>
        {texto}
      </span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-secondary">
        <div className={`h-full rounded-full transition-all duration-300 ${cor}`} style={{ width: `${proporcao * 100}%` }} />
      </div>
    </div>
  )
}

function formatarRestante(ms: number): string {
  const horas = Math.floor(ms / (1000 * 60 * 60))
  const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (horas > 0) return `${horas}h${minutos.toString().padStart(2, '0')}`
  return `${minutos}min`
}
